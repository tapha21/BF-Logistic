import { useEffect, useMemo, useState } from "react";
import { Plus, Download, Upload, FileText, Eye, ArrowRightLeft, Layers, Loader2 } from "lucide-react";
import { PageHeader } from "../components/AppLayout";
import { formatXOF } from "../lib/mock-data";
import { useStore } from "../lib/store";
import { StatutBadge } from "../components/Badge";
import { FilterBar, StatusSelect, DateRangeFilter, ClientSelect } from "../components/Filters";
import { Pagination, paginate } from "../components/Pagination";
import { Modal } from "../components/Modal";
import { ImportDialog } from "../components/ImportDialog";
import { Stepper } from "../components/Stepper";
import { LineItemsEditor } from "../components/documents/LineItemsEditor";
import { TransitFieldsEditor } from "../components/documents/TransitFieldsEditor";
import { DocumentPreviewModal } from "../components/documents/DocumentPreviewModal";
import { useQuickPdfDownload } from "../components/documents/useQuickPdfDownload";
import { type Devis } from "../lib/types";
import { computeTotals, generateNumero, newLigne } from "../lib/documents";
import { documentsToCsv, csvToDocuments } from "../lib/importExport";
import { downloadTextFile } from "../lib/csv";

const STATUTS = ["Brouillon", "Envoyé", "Accepté", "Refusé", "Expiré"] as const;

export function DevisPage() {
  useEffect(() => { document.title = "Devis — BF Logistic CRM"; }, []);
  const { db, addDevis, updateDevis, importDevis, convertDevisToFacture } = useStore();
  const { devis, clients, societe } = db;
  const getClient = (id: string) => clients.find((c) => c.id === id);

  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("");
  const [clientId, setClientId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [detail, setDetail] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const { download, downloadingId, node: pdfNode } = useQuickPdfDownload();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return devis.filter((d) => {
      const c = getClient(d.clientId);
      const okSearch = !q || d.numero.toLowerCase().includes(q) || d.objet.toLowerCase().includes(q) || c?.nom.toLowerCase().includes(q);
      const okStatut = !statut || d.statut === statut;
      const okClient = !clientId || d.clientId === clientId;
      const okFrom = !dateFrom || d.date >= dateFrom;
      const okTo = !dateTo || d.date <= dateTo;
      return okSearch && okStatut && okClient && okFrom && okTo;
    });
  }, [devis, clients, search, statut, clientId, dateFrom, dateTo]);

  const acceptes = devis.filter((d) => d.statut === "Accepté").reduce((s, d) => s + computeTotals(d).montantTTC, 0);
  const paged = paginate(filtered, pageSize, page);
  const detailDoc = detail ? devis.find((d) => d.id === detail) : null;

  return (
    <div>
      <PageHeader
        title="Devis"
        description={`${devis.length} devis · ${formatXOF(acceptes)} acceptés`}
        icon={FileText}
        actions={
          <>
            <button onClick={() => setImportOpen(true)} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1.5"><Upload className="w-4 h-4" /> Importer</button>
            <button onClick={() => downloadTextFile("devis.csv", documentsToCsv(devis, clients, "devis"))} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1.5"><Download className="w-4 h-4" /> Exporter</button>
            <button onClick={() => setCreateOpen(true)} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 flex items-center gap-1.5"><Plus className="w-4 h-4" /> Nouveau devis</button>
          </>
        }
      />
      <div className="p-4 sm:p-6">
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <FilterBar
            search={search}
            onSearch={(s) => { setSearch(s); setPage(1); }}
            placeholder="N°, objet, client…"
            right={
              <>
                <ClientSelect value={clientId} onChange={(v) => { setClientId(v); setPage(1); }} clients={clients} />
                <DateRangeFilter from={dateFrom} to={dateTo} onChange={(f, t) => { setDateFrom(f); setDateTo(t); setPage(1); }} />
                <StatusSelect value={statut} onChange={(v) => { setStatut(v); setPage(1); }} options={[...STATUTS]} />
              </>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground bg-muted/40">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">N° Devis</th>
                  <th className="text-left px-4 py-2.5 font-medium">Date</th>
                  <th className="text-left px-4 py-2.5 font-medium">Client</th>
                  <th className="text-left px-4 py-2.5 font-medium">Objet</th>
                  <th className="text-right px-4 py-2.5 font-medium">HT</th>
                  <th className="text-right px-4 py-2.5 font-medium">TVA</th>
                  <th className="text-right px-4 py-2.5 font-medium">TTC</th>
                  <th className="text-left px-4 py-2.5 font-medium">Statut</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {paged.map((d) => {
                  const t = computeTotals(d);
                  return (
                    <tr key={d.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-2.5 font-mono text-xs">
                        <span className="inline-flex items-center gap-1.5"><FileText className="w-3 h-3 text-info" />{d.numero}</span>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{d.date}</td>
                      <td className="px-4 py-2.5">{getClient(d.clientId)?.nom}</td>
                      <td className="px-4 py-2.5 max-w-xs truncate">{d.objet}</td>
                      <td className="px-4 py-2.5 text-right font-mono">{formatXOF(t.totalHT)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">{formatXOF(t.montantTVA)}</td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold">{formatXOF(t.montantTTC)}</td>
                      <td className="px-4 py-2.5"><StatutBadge statut={d.statut} /></td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setDetail(d.id)} className="p-1.5 rounded-md hover:bg-muted" title="Visualiser"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                          <button
                            onClick={() => download({ doc: { ...d, kind: "devis" }, client: getClient(d.clientId), societe, skinId: db.templates.find((t) => t.id === d.templateId)?.skin ?? "classique", filename: `Devis-${d.numero}.pdf` })}
                            disabled={downloadingId === d.id}
                            className="p-1.5 rounded-md hover:bg-muted disabled:opacity-50"
                            title="Télécharger le PDF"
                          >
                            {downloadingId === d.id ? <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" /> : <Download className="w-4 h-4 text-muted-foreground" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paged.length === 0 && <tr><td colSpan={9} className="text-center py-12 text-sm text-muted-foreground">Aucun devis trouvé</td></tr>}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} pageSizeOptions={[8, 15, 30]} />
        </div>
      </div>

      {detailDoc && (
        <DocumentPreviewModal
          open={!!detailDoc}
          onClose={() => setDetail(null)}
          kind="devis"
          doc={detailDoc}
          client={getClient(detailDoc.clientId)}
          societe={societe}
          templates={db.templates}
          onTemplateChange={(templateId) => updateDevis(detailDoc.id, { templateId })}
          actions={
            detailDoc.statut !== "Accepté" ? undefined : (
              <button
                onClick={() => { convertDevisToFacture(detailDoc.id); setDetail(null); }}
                className="px-2.5 py-1.5 text-xs sm:text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-4 h-4" /> <span className="hidden sm:inline">Convertir en facture</span>
              </button>
            )
          }
        />
      )}
      <DevisCreate open={createOpen} onClose={() => setCreateOpen(false)} onSave={(d) => { addDevis(d); setCreateOpen(false); }} />
      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Importer des devis (CSV)"
        hint="Une ligne par ligne d'article, regroupées par numéro de devis. Le client est identifié par son code (ou son nom)."
        parse={(text) => { const r = csvToDocuments(text, clients, "devis", { tauxTVA: societe.tauxTVA, templateId: societe.templateParDefautId }); return { items: r.items as Omit<Devis, "id">[], errors: r.errors }; }}
        onImport={importDevis}
      />
      {pdfNode}
    </div>
  );
}

const DEVIS_STEPS = ["Général", "Transport & douane", "Lignes", "Attributs", "Récapitulatif"];

function DevisCreate({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (d: Omit<Devis, "id">) => void }) {
  const { db } = useStore();
  const [step, setStep] = useState(0);
  const initial = (): Omit<Devis, "id"> => ({
    numero: generateNumero("DEV", db.devis.length + 1),
    date: new Date().toISOString().slice(0, 10),
    clientId: db.clients[0]?.id ?? "",
    objet: "",
    statut: "Brouillon",
    validiteJours: 30,
    templateId: db.societe.templateParDefautId,
    notes: "",
    lignes: [newLigne()],
    modeTransport: "Maritime",
    incoterm: "CIF",
    portEmbarquement: "",
    portDebarquement: "",
    numeroConteneur: "",
    numeroTitreTransport: "",
    poidsBrut: 0,
    poidsNet: 0,
    volumeCBM: 0,
    natureMarchandise: "",
    regimeDouanier: "Import",
    numeroDeclaration: "",
    devise: "XOF",
    tauxTVA: db.societe.tauxTVA,
    remiseGlobalePct: 0,
    timbreFiscal: 0,
    retenueSourcePct: 0,
    modeReglement: "Virement bancaire",
    conditionsPaiement: "30 jours net à compter de la date de facture",
  });
  const [form, setForm] = useState<Omit<Devis, "id">>(initial);
  const [attrValues, setAttrValues] = useState<Record<string, string>>({});
  const attributsDevis = db.attributs.filter((a) => a.cibles.includes("devis"));

  useEffect(() => { if (open) { setStep(0); setForm(initial()); setAttrValues({}); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [open]);

  const totaux = computeTotals(form);
  const canLeaveGeneral = form.objet.trim().length > 0 && !!form.clientId;
  const canNext = step !== 0 || canLeaveGeneral;
  const client = db.clients.find((c) => c.id === form.clientId);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < DEVIS_STEPS.length - 1) { setStep(step + 1); return; }
    onSave(form);
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouveau devis" size="xl">
      <form onSubmit={submit} className="flex flex-col h-full">
        <Stepper steps={DEVIS_STEPS} current={step} />

        {step === 0 && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">N° Devis</label><input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} className="input" /></div>
              <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Date</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" /></div>
              <div className="space-y-1 sm:col-span-2"><label className="text-xs uppercase text-muted-foreground">Client</label>
                <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="input">
                  {db.clients.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
              <div className="space-y-1 sm:col-span-2"><label className="text-xs uppercase text-muted-foreground">Objet</label><input required value={form.objet} onChange={(e) => setForm({ ...form, objet: e.target.value })} className="input" placeholder="Ex: Transit maritime conteneur 40'..." /></div>
              <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Validité (jours)</label><input type="number" value={form.validiteJours} onChange={(e) => setForm({ ...form, validiteJours: Number(e.target.value) })} className="input" /></div>
              <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Statut</label>
                <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value as any })} className="input">
                  {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs uppercase text-muted-foreground flex items-center gap-1"><Layers className="w-3 h-3" /> Modèle du document</label>
                <select value={form.templateId} onChange={(e) => setForm({ ...form, templateId: e.target.value })} className="input">
                  {db.templates.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
                </select>
              </div>
              <div className="space-y-1 sm:col-span-2"><label className="text-xs uppercase text-muted-foreground">Notes</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input min-h-[70px]" /></div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="p-5">
            <TransitFieldsEditor value={form} onChange={(patch) => setForm({ ...form, ...patch })} />
          </div>
        )}

        {step === 2 && (
          <div className="p-5 space-y-4">
            <LineItemsEditor lignes={form.lignes} onChange={(lignes) => setForm({ ...form, lignes })} />
            <div className="bg-muted/40 rounded-md p-3 space-y-1 text-sm ml-auto max-w-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Total HT</span><span className="font-mono">{formatXOF(totaux.totalHT)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">TVA {form.tauxTVA}%</span><span className="font-mono">{formatXOF(totaux.montantTVA)}</span></div>
              <div className="flex justify-between font-semibold"><span>Net à payer</span><span className="font-mono text-primary text-base">{formatXOF(totaux.netAPayer)}</span></div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-5 space-y-4">
            <p className="text-xs text-muted-foreground">Ces attributs sont définis dans <span className="font-medium">Paramètres</span> et s'appliquent automatiquement aux devis.</p>
            {attributsDevis.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border rounded-md">
                Aucun attribut ne cible les devis. Rendez-vous dans Paramètres pour en configurer.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {attributsDevis.map((a) => (
                  <div key={a.id} className="space-y-1">
                    <label className="text-xs uppercase text-muted-foreground flex items-center gap-1"><Layers className="w-3 h-3 text-purple" /> {a.nom}</label>
                    <input
                      type={a.type === "nombre" ? "number" : a.type === "date" ? "date" : "text"}
                      value={attrValues[a.id] ?? a.defaut ?? ""}
                      onChange={(e) => setAttrValues({ ...attrValues, [a.id]: e.target.value })}
                      className="input"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-border rounded-md p-4 space-y-1 text-sm">
                <div className="text-xs uppercase text-muted-foreground font-medium mb-1">Document</div>
                <div><span className="text-muted-foreground">N° :</span> <span className="font-mono">{form.numero}</span></div>
                <div><span className="text-muted-foreground">Date :</span> {form.date} · <span className="text-muted-foreground">Validité :</span> {form.validiteJours}j</div>
                <div><span className="text-muted-foreground">Client :</span> {client?.nom ?? "—"}</div>
                <div><span className="text-muted-foreground">Objet :</span> {form.objet}</div>
                <div><span className="text-muted-foreground">Statut :</span> {form.statut}</div>
              </div>
              <div className="border border-border rounded-md p-4 space-y-1 text-sm">
                <div className="text-xs uppercase text-muted-foreground font-medium mb-1">Transport &amp; douane</div>
                <div><span className="text-muted-foreground">Mode :</span> {form.modeTransport} · {form.incoterm}</div>
                <div><span className="text-muted-foreground">Trajet :</span> {form.portEmbarquement || "—"} → {form.portDebarquement || "—"}</div>
                <div><span className="text-muted-foreground">Conteneur :</span> {form.numeroConteneur || "—"}</div>
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-md p-4 space-y-1 text-sm ml-auto max-w-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Total HT</span><span className="font-mono">{formatXOF(totaux.totalHT)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">TVA {form.tauxTVA}%</span><span className="font-mono">{formatXOF(totaux.montantTVA)}</span></div>
              <div className="flex justify-between font-semibold text-base"><span>Net à payer</span><span className="font-mono text-primary">{formatXOF(totaux.netAPayer)}</span></div>
            </div>
          </div>
        )}

        <div className="flex justify-between gap-2 p-4 border-t border-border bg-muted/20">
          <button type="button" onClick={() => (step === 0 ? onClose() : setStep(step - 1))} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted">
            {step === 0 ? "Annuler" : "Retour"}
          </button>
          <button type="submit" disabled={!canNext} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50">
            {step < DEVIS_STEPS.length - 1 ? "Suivant" : "Créer le devis"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
