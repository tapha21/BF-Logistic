import { forwardRef, useRef, useState } from "react";
import { X, Printer, Download, Loader2, Landmark, Building2 } from "lucide-react";
import type { Ecriture, Societe } from "../lib/types";
import { formatXOF } from "../lib/mock-data";
import { downloadNodeAsPdf } from "../lib/pdf";

type ReportProps = {
  societe: Societe;
  periodeLabel: string;
  ecritures: Ecriture[];
};

const AccountingReportTemplate = forwardRef<HTMLDivElement, ReportProps>(function AccountingReportTemplate(
  { societe, periodeLabel, ecritures },
  ref,
) {
  const totalE = ecritures.filter((e) => e.type === "Entrée").reduce((s, e) => s + e.montant, 0);
  const totalS = ecritures.filter((e) => e.type === "Sortie").reduce((s, e) => s + e.montant, 0);
  const solde = totalE - totalS;
  const byCategorie = ecritures.reduce<Record<string, { entree: number; sortie: number }>>((acc, e) => {
    acc[e.categorie] = acc[e.categorie] ?? { entree: 0, sortie: 0 };
    if (e.type === "Entrée") acc[e.categorie].entree += e.montant;
    else acc[e.categorie].sortie += e.montant;
    return acc;
  }, {});

  return (
    <div ref={ref} className="bg-white text-gray-900 mx-auto shadow-xl print:shadow-none" style={{ width: "210mm", minHeight: "297mm", fontSize: "12px" }} data-print-area>
      <div className="bg-gray-900 text-white px-10 py-8 flex items-start justify-between">
        <div className="flex items-start gap-4">
          {societe.logoDataUrl ? (
            <img src={societe.logoDataUrl} alt="Logo" className="w-14 h-14 rounded-md object-contain bg-white/90 p-1" />
          ) : (
            <div className="w-14 h-14 rounded-md bg-white/15 flex items-center justify-center"><Building2 className="w-7 h-7" /></div>
          )}
          <div>
            <div className="text-lg font-bold tracking-wide">{societe.raisonSociale}</div>
            <div className="text-[11px] opacity-90">{societe.adresse}, {societe.ville}, {societe.pays}</div>
            <div className="text-[11px] opacity-90">NINEA {societe.ninea} · RCCM {societe.rccm}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold tracking-wider">RAPPORT COMPTABLE</div>
          <div className="text-[11px] opacity-90 mt-1">Période : {periodeLabel}</div>
          <div className="text-[11px] opacity-90">Édité le {new Date().toLocaleDateString("fr-FR")}</div>
        </div>
      </div>

      <div className="px-10 py-6 space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-200 p-3">
            <div className="text-[10px] uppercase text-gray-400 font-semibold">Total entrées</div>
            <div className="text-lg font-bold font-mono text-emerald-700">{formatXOF(totalE)}</div>
          </div>
          <div className="rounded-lg border border-gray-200 p-3">
            <div className="text-[10px] uppercase text-gray-400 font-semibold">Total sorties</div>
            <div className="text-lg font-bold font-mono text-red-700">{formatXOF(totalS)}</div>
          </div>
          <div className="rounded-lg border border-gray-200 p-3">
            <div className="text-[10px] uppercase text-gray-400 font-semibold">Solde net</div>
            <div className={`text-lg font-bold font-mono ${solde >= 0 ? "text-emerald-700" : "text-red-700"}`}>{formatXOF(solde)}</div>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">Répartition par catégorie</div>
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="text-left px-3 py-2 font-medium rounded-l-md">Catégorie</th>
                <th className="text-right px-3 py-2 font-medium">Entrées</th>
                <th className="text-right px-3 py-2 font-medium rounded-r-md">Sorties</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(byCategorie).map(([cat, v], i) => (
                <tr key={cat} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-3 py-1.5 border-b border-gray-100">{cat}</td>
                  <td className="px-3 py-1.5 border-b border-gray-100 text-right font-mono">{v.entree > 0 ? formatXOF(v.entree) : "—"}</td>
                  <td className="px-3 py-1.5 border-b border-gray-100 text-right font-mono">{v.sortie > 0 ? formatXOF(v.sortie) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">Journal des pièces comptables ({ecritures.length})</div>
          <table className="w-full text-[10.5px] border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="text-left px-2 py-1.5 font-medium">Date</th>
                <th className="text-left px-2 py-1.5 font-medium">Référence</th>
                <th className="text-left px-2 py-1.5 font-medium">Libellé</th>
                <th className="text-left px-2 py-1.5 font-medium">Catégorie</th>
                <th className="text-right px-2 py-1.5 font-medium">Débit</th>
                <th className="text-right px-2 py-1.5 font-medium">Crédit</th>
              </tr>
            </thead>
            <tbody>
              {ecritures.map((e) => (
                <tr key={e.id} className="border-b border-gray-100">
                  <td className="px-2 py-1">{e.date}</td>
                  <td className="px-2 py-1 font-mono">{e.reference}</td>
                  <td className="px-2 py-1">{e.libelle}</td>
                  <td className="px-2 py-1">{e.categorie}</td>
                  <td className="px-2 py-1 text-right font-mono text-red-700">{e.type === "Sortie" ? formatXOF(e.montant) : "—"}</td>
                  <td className="px-2 py-1 text-right font-mono text-emerald-700">{e.type === "Entrée" ? formatXOF(e.montant) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="px-10 py-4 mt-4 border-t border-gray-200 text-[9px] text-gray-400 flex items-center gap-1">
        <Landmark className="w-3 h-3" /> {societe.raisonSociale} · NINEA {societe.ninea} · RCCM {societe.rccm} · Document généré automatiquement.
      </div>
    </div>
  );
});

export function AccountingReportModal({
  open,
  onClose,
  societe,
  periodeLabel,
  ecritures,
}: {
  open: boolean;
  onClose: () => void;
  societe: Societe;
  periodeLabel: string;
  ecritures: Ecriture[];
}) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [busy, setBusy] = useState(false);
  if (!open) return null;

  const handleDownload = async () => {
    if (!nodeRef.current) return;
    setBusy(true);
    try {
      await downloadNodeAsPdf(nodeRef.current, `Rapport-comptable-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-foreground/50 backdrop-blur-sm print:bg-transparent print:backdrop-blur-none">
      <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-3 bg-card border-b border-border print:hidden flex-wrap">
        <h2 className="text-sm sm:text-base font-semibold">Rapport comptable — {periodeLabel}</h2>
        <div className="flex items-center gap-1.5">
          <button onClick={() => window.print()} className="px-2.5 py-1.5 text-xs sm:text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1.5">
            <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Imprimer</span>
          </button>
          <button onClick={handleDownload} disabled={busy} className="px-2.5 py-1.5 text-xs sm:text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1.5 disabled:opacity-60">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} <span className="hidden sm:inline">PDF</span>
          </button>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-8 px-4">
        <AccountingReportTemplate ref={nodeRef} societe={societe} periodeLabel={periodeLabel} ecritures={ecritures} />
      </div>
    </div>
  );
}
