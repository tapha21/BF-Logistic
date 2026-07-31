import { useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Printer, Download, MessageCircle, Share2, Loader2, Layers } from "lucide-react";
import { toast } from "sonner";
import { DocumentTemplate } from "./DocumentTemplate";
import type { Client, Devis, Facture, Societe, TemplateDef } from "../../lib/types";
import { downloadNodeAsPdf, nodeToPdfBlob } from "../../lib/pdf";
import { sendDocumentViaWhatsapp } from "../../lib/whatsapp";
import { computeTotals, formatXOF } from "../../lib/documents";

type Kind = "devis" | "facture";

export function DocumentPreviewModal({
  open,
  onClose,
  kind,
  doc,
  client,
  societe,
  templates,
  onTemplateChange,
  actions,
}: {
  open: boolean;
  onClose: () => void;
  kind: Kind;
  doc: Devis | Facture;
  client: Client | undefined;
  societe: Societe;
  templates: TemplateDef[];
  onTemplateChange?: (templateId: string) => void;
  actions?: ReactNode;
}) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const skinId = templates.find((t) => t.id === doc.templateId)?.skin ?? "classique";
  const [busy, setBusy] = useState<"pdf" | "whatsapp" | "share" | null>(null);
  const [waOpen, setWaOpen] = useState(false);
  const [waPhone, setWaPhone] = useState(client?.whatsapp || client?.telephone || "");
  const [waStatus, setWaStatus] = useState<string | null>(null);

  if (!open) return null;

  const filename = `${kind === "facture" ? "Facture" : "Devis"}-${doc.numero}.pdf`;
  const totaux = computeTotals(doc);

  const handlePrint = () => window.print();

  const handleDownload = async () => {
    if (!nodeRef.current) return;
    setBusy("pdf");
    try {
      await downloadNodeAsPdf(nodeRef.current, filename);
    } finally {
      setBusy(null);
    }
  };

  const handleShare = async () => {
    if (!nodeRef.current) return;
    setBusy("share");
    try {
      const file = await nodeToPdfBlob(nodeRef.current, filename);
      const title = `${kind === "facture" ? "Facture" : "Devis"} ${doc.numero}`;
      if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title });
        } catch (err) {
          if ((err as Error)?.name !== "AbortError") throw err;
        }
      } else {
        await downloadNodeAsPdf(nodeRef.current, filename);
        toast.info("Partage non pris en charge par ce navigateur — le PDF a été téléchargé.");
      }
    } catch {
      toast.error("Le partage du PDF a échoué.");
    } finally {
      setBusy(null);
    }
  };

  const handleWhatsapp = async () => {
    if (!nodeRef.current) return;
    setBusy("whatsapp");
    setWaStatus(null);
    try {
      const file = await nodeToPdfBlob(nodeRef.current, filename);
      const message = `Bonjour ${client?.contact ?? ""}, veuillez trouver ci-joint votre ${kind === "facture" ? "facture" : "devis"} ${doc.numero} (${formatXOF(totaux.netAPayer)}) de la part de ${societe.raisonSociale}.`;
      const result = await sendDocumentViaWhatsapp({ phone: waPhone, message, file });
      setWaStatus(
        result === "shared-with-file"
          ? "PDF partagé avec succès."
          : "WhatsApp ouvert avec le message. Le PDF a été téléchargé — joignez-le manuellement à la conversation.",
      );
      if (result === "opened-link") await downloadNodeAsPdf(nodeRef.current, filename);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-foreground/50 backdrop-blur-sm print:bg-transparent print:backdrop-blur-none">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="flex items-center justify-between gap-2 px-4 sm:px-6 py-3 bg-card border-b border-border print:hidden flex-wrap"
      >
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-sm sm:text-base font-semibold truncate">
            {kind === "facture" ? "Facture" : "Devis"} <span className="font-mono text-muted-foreground">{doc.numero}</span>
          </h2>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {onTemplateChange && (
            <div className="flex items-center gap-1.5 border border-border rounded-md px-2 py-1.5 bg-background">
              <Layers className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                value={doc.templateId}
                onChange={(e) => onTemplateChange(e.target.value)}
                className="text-xs bg-transparent outline-none"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.nom}</option>
                ))}
              </select>
            </div>
          )}
          {actions}
          <motion.button whileTap={{ scale: 0.95 }} onClick={handlePrint} className="px-2.5 py-1.5 text-xs sm:text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1.5">
            <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Imprimer</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleDownload} disabled={busy === "pdf"} className="px-2.5 py-1.5 text-xs sm:text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1.5 disabled:opacity-60">
            {busy === "pdf" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} <span className="hidden sm:inline">PDF</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleShare} disabled={busy === "share"} className="px-2.5 py-1.5 text-xs sm:text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1.5 disabled:opacity-60">
            {busy === "share" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />} <span className="hidden sm:inline">Partager</span>
          </motion.button>
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setWaOpen((v) => !v)}
              className="px-2.5 py-1.5 text-xs sm:text-sm bg-[#25D366] text-white rounded-md hover:opacity-90 flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" /> <span className="hidden sm:inline">WhatsApp</span>
            </motion.button>
            <AnimatePresence>
              {waOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-lg shadow-xl p-3 z-10 text-left"
                >
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">Numéro WhatsApp du client</label>
                  <input value={waPhone} onChange={(e) => setWaPhone(e.target.value)} className="input mt-1" placeholder="+221 77 000 00 00" />
                  <button
                    onClick={handleWhatsapp}
                    disabled={busy === "whatsapp" || !waPhone}
                    className="w-full mt-2 bg-[#25D366] text-white rounded-md py-2 text-sm hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-1.5"
                  >
                    {busy === "whatsapp" ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                    Envoyer le document
                  </button>
                  {waStatus && <p className="text-[11px] text-muted-foreground mt-2">{waStatus}</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, delay: 0.05, ease: "easeOut" }}
        className="flex-1 overflow-auto py-8 px-4"
      >
        <DocumentTemplate ref={nodeRef} doc={{ ...doc, kind }} client={client} societe={societe} skinId={skinId} />
      </motion.div>
    </div>
  );
}
