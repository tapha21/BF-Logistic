import { useEffect, useMemo, useState } from "react";
import { Plus, Download, Upload, Receipt, Eye, CheckCircle2, Layers, FileSpreadsheet, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { PageHeader } from "../components/AppLayout";
import { formatXOF } from "../lib/mock-data";
import { useStore } from "../lib/store";
import { StatutBadge, TypeBadge } from "../components/Badge";
import { FilterBar, StatusSelect, DateRangeFilter, ClientSelect } from "../components/Filters";
import { Pagination, paginate } from "../components/Pagination";
import { Modal } from "../components/Modal";
import { ImportDialog } from "../components/ImportDialog";
import { Stepper } from "../components/Stepper";
import { KpiCard } from "../components/Kpi";
import { LineItemsEditor } from "../components/documents/LineItemsEditor";
import { TransitFieldsEditor } from "../components/documents/TransitFieldsEditor";
import { DocumentPreviewModal } from "../components/documents/DocumentPreviewModal";
import { type Facture } from "../lib/types";
import { useQuickPdfDownload } from "../components/documents/useQuickPdfDownload";
import { computeTotals, generateNumero, newLigne, isEnRetard } from "../lib/documents";
import { documentsToCsv, csvToDocuments } from "../lib/importExport";
import { downloadTextFile } from "../lib/csv";

const STATUTS = ["Brouillon", "Envoyée", "Payée", "Partiellement payée", "En attente", "En retard", "Annulée"] as const;

export function FacturesPage() {
  useEffect(() => { document.title = "Factures — BF Logistic CRM"; }, []);
  const { db, addFacture, updateFacture, importFactures } = useStore();
  const { factures, clients, societe } = db;
  const getClient = (id: string) => clients.find((c) => c.id === id);

  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | "Vente" | "Achat">("");
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
    return factures.filter((f) => {
      const c = getClient(f.clientId);
      const okSearch = !q || f.numero.toLowerCase().includes(q) || f.objet.toLowerCase().includes(q) || c?.nom.toLowerCase().includes(q);
      const okStatut = !statut || f.statut === statut;
      const okType = !typeFilter || f.type === typeFilter;
      const okClient = !clientId || f.clientId === clientId;
      const okFrom = !dateFrom || f.date >= dateFrom;
      const okTo = !dateTo || f.date <= dateTo;
      return okSearch && okStatut && okType && okClient && okFrom && okTo;
    });
  }, [factures, clients, search, statut, typeFilter, clientId, dateFrom, dateTo]);

  const ventes = factures.filter((f) => f.type === "Vente");
  const achats = factures.filter((f) => f.type === "Achat");
  const totalVenteHT = ventes.reduce((s, f) => s + computeTotals(f).totalHT, 0);
  const totalVenteTVA = ventes.reduce((s, f) => s + computeTotals(f).montantTVA, 0);
  const totalVenteTTC = ventes.reduce((s, f) => s + computeTotals(f).montantTTC, 0);
  const totalAchatTTC = achats.reduce((s, f) => s + computeTotals(f).montantTTC, 0);
  const totalGlobal = factures.reduce((s, f) => s + computeTotals(f).montantTTC, 0);
  const paged = paginate(filtered, pageSize, page);
  const detailDoc = detail ? factures.find((f) => f.id === detail) : null;

  return (
    <div>
      <PageHeader
        title="Factures"
        description={`${factures.length} factures · Montant total ${formatXOF(totalGlobal)}`}
        icon={Receipt}
        actions={
          <>
            <button onClick={() => setImportOpen(true)} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1.5"><Upload className="w-4 h-4" /> Importer</button>
            <button onClick={() => downloadTextFile("factures.csv", documentsToCsv(factures, clients, "facture"))} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1.5"><Download className="w-4 h-4" /> Exporter</button>
            <button onClick={() => setCreateOpen(true)} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 flex items-center gap-1.5"><Plus className="w-4 h-4" /> Nouvelle facture</button>
          </>
        }
      />
      <div className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard label="Total facturé HT" value={formatXOF(totalVenteHT)} sub={`${ventes.length} factures de vente`} icon={FileSpreadsheet} tone="primary" />
          <KpiCard label="TVA collectée" value={formatXOF(totalVenteTVA)} sub={`Taux moyen ${societe.tauxTVA}%`} icon={Receipt} tone="info" />
          <KpiCard label="Total ventes TTC" value={formatXOF(totalVenteTTC)} sub="Chiffre d'affaires TTC" icon={TrendingUp} tone="success" />
          <KpiCard label="Total achats TTC" value={formatXOF(totalAchatTTC)} sub={`${achats.length} factures d'achat`} icon={TrendingDown} tone="destructive" />
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <FilterBar
            search={search}
            onSearch={(s) => { setSearch(s); setPage(1); }}
            placeholder="N°, objet, tiers…"
            right={
              <>
                <div className="flex gap-1 text-xs border border-border rounded-md p-0.5 bg-card">
                  {(["", "Vente", "Achat"] as const).map((t) => (
                    <button
                      key={t || "all"}
                      onClick={() => { setTypeFilter(t); setPage(1); }}
                      className={`px-2.5 py-1 rounded ${typeFilter === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                    >
                      {t || "Tous"}
                    </button>
                  ))}
                </div>
                <ClientSelect value={clientId} onChange={(v) => { setClientId(v); setPage(1); }} clients={clients} />
                <DateRangeFilter from={dateFrom} to={dateTo} onChange={(f, t) => { setDateFrom(f); setDateTo(t); setPage(1); }} />
                <StatusSelect value={statut} onChange={(v) => { setStatut(v); setPage(1); }} options={[...STATUTS]} />
              </>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground bg-muted/40">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">N° Facture</th>
                  <th className="text-left px-4 py-2.5 font-medium">Type</th>
                  <th className="text-left px-4 py-2.5 font-medium">Date</th>
                  <th className="text-left px-4 py-2.5 font-medium">Échéance</th>
                  <th className="text-left px-4 py-2.5 font-medium">Tiers</th>
                  <th className="text-left px-4 py-2.5 font-medium">Objet</th>
                  <th className="text-right px-4 py-2.5 font-medium">HT</th>
                  <th className="text-right px-4 py-2.5 font-medium">TVA</th>
                  <th className="text-right px-4 py-2.5 font-medium">TTC</th>
                  <th className="text-left px-4 py-2.5 font-medium">Statut</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {paged.map((f) => {
                  const t = computeTotals(f);
                  const retard = f.statut === "En retard" || isEnRetard(f);
                  return (
                    <tr key={f.id} className={`border-t border-border hover:bg-muted/30 ${retard ? "bg-destructive/5" : ""}`}>
                      <td className={`px-4 py-2.5 font-mono text-xs ${retard ? "border-l-2 border-destructive" : ""}`}><span className="inline-flex items-center gap-1.5"><Receipt className="w-3 h-3 text-primary" />{f.numero}</span></td>
                      <td className="px-4 py-2.5"><TypeBadge type={f.type} /></td>
                      <td className="px-4 py-2.5 text-muted-foreground">{f.date}</td>
                      <td className={`px-4 py-2.5 ${retard ? "text-destructive font-medium" : "text-muted-foreground"}`}>{f.echeance}</td>
                      <td className="px-4 py-2.5">{getClient(f.clientId)?.nom}</td>
                      <td className="px-4 py-2.5 max-w-xs truncate">{f.objet}</td>
                      <td className="px-4 py-2.5 text-right font-mono">{formatXOF(t.totalHT)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">{formatXOF(t.montantTVA)}</td>
                      <td className={`px-4 py-2.5 text-right font-mono font-semibold ${retard ? "text-destructive" : ""}`}>{formatXOF(t.montantTTC)}</td>
                      <td className="px-4 py-2.5"><StatutBadge statut={f.statut} /></td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setDetail(f.id)} className="p-1.5 rounded-md hover:bg-muted" title="Visualiser"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                          <button
                            onClick={() => download({ doc: { ...f, kind: "facture" }, client: getClient(f.clientId), societe, skinId: db.templates.find((tp) => tp.id === f.templateId)?.skin ?? "classique", filename: `Facture-${f.numero}.pdf` })}
                            disabled={downloadingId === f.id}
                            className="p-1.5 rounded-md hover:bg-muted disabled:opacity-50"
                            title="Télécharger le PDF"
                          >
                            {downloadingId === f.id ? <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" /> : <Download className="w-4 h-4 text-muted-foreground" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paged.length === 0 && <tr><td colSpan={11} className="text-center py-12 text-sm text-muted-foreground">Aucune facture trouvée</td></tr>}
              </tbody>
              <tfoot className="bg-muted/60 border-t-2 border-border">
                <tr>
                  <td colSpan={8} className="px-4 py-3 text-right text-xs uppercase tracking-wide font-semibold">Montant total (toutes factures)</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-base text-primary">{formatXOF(totalGlobal)}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} pageSizeOptions={[8, 15, 30]} />
        </div>
      </div>

      {detailDoc && (
        <DocumentPreviewModal
          open={!!detailDoc}
          onClose={() => setDetail(null)}
          kind="facture"
          doc={detailDoc}
          client={getClient(detailDoc.clientId)}
          societe={societe}
          templates={db.templates}
          onTemplateChange={(templateId) => updateFacture(detailDoc.id, { templateId })}
          actions={
            detailDoc.statut !== "Payée" ? (
              <button
                onClick={() => updateFacture(detailDoc.id, { statut: "Payée", montantPaye: computeTotals(detailDoc).netAPayer })}
                className="px-2.5 py-1.5 text-xs sm:text-sm bg-success text-white rounded-md hover:opacity-90 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> <span className="hidden sm:inline">Marquer payée</span>
              </button>
            ) : undefined
          }
        />
      )}
      <FactureCreate open={createOpen} onClose={() => setCreateOpen(false)} onSave={(f) => { addFacture(f); setCreateOpen(false); }} />
      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Importer des factures (CSV)"
        hint="Une ligne par ligne d'article, regroupées par numéro de facture. Le client est identifié par son code (ou son nom)."
        parse={(text) => { const r = csvToDocuments(text, clients, "facture", { tauxTVA: societe.tauxTVA, templateId: societe.templateParDefautId }); return { items: r.items as Omit<Facture, "id">[], errors: r.errors }; }}
        onImport={importFactures}
      />
      {pdfNode}
    </div>
  );
}

const FACTURE_STEPS = ["Général", "Transport & douane", "Lignes", "Attributs", "Récapitulatif"];

function FactureCreate({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (f: Omit<Facture, "id">) => void }) {
  const { db } = useStore();
  const [step, setStep] = useState(0);
  const initial = (): Omit<Facture, "id"> => ({
    numero: generateNumero("FAC", db.factures.filter((f) => f.type === "Vente").length + 1),
    date: new Date().toISOString().slice(0, 10),
    echeance: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    clientId: db.clients[0]?.id ?? "",
    objet: "",
    statut: "En attente",
    type: "Vente",
    montantPaye: 0,
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
  const [form, setForm] = useState<Omit<Facture, "id">>(initial);
  const attributsFact = db.attributs.filter((a) => a.cibles.includes("facture"));
  const [attrValues, setAttrValues] = useState<Record<string, string>>({});

  useEffect(() => { if (open) { setStep(0); setForm(initial()); setAttrValues({}); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [open]);

  const totaux = computeTotals(form);
  const canLeaveGeneral = form.objet.trim().length > 0 && !!form.clientId;
  const canNext = step !== 0 || canLeaveGeneral;
  const client = db.clients.find((c) => c.id === form.clientId);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < FACTURE_STEPS.length - 1) { setStep(step + 1); return; }
    onSave(form);
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle facture" size="xl">
      <form onSubmit={submit} className="flex flex-col h-full">
        <Stepper steps={FACTURE_STEPS} current={step} />

        {step === 0 && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">N° Facture</label><input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} className="input" /></div>
              <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className="input">
                  <option value="Vente">Vente</option><option value="Achat">Achat</option>
                </select>
              </div>
              <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Date émission</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" /></div>
              <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Échéance</label><input type="date" value={form.echeance} onChange={(e) => setForm({ ...form, echeance: e.target.value })} className="input" /></div>
              <div className="space-y-1 sm:col-span-2"><label className="text-xs uppercase text-muted-foreground">Tiers</label>
                <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="input">
                  {db.clients.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
              <div className="space-y-1 sm:col-span-2"><label className="text-xs uppercase text-muted-foreground">Objet</label><input required value={form.objet} onChange={(e) => setForm({ ...form, objet: e.target.value })} className="input" placeholder="Description prestation…" /></div>
              <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Statut</label>
                <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value as any })} className="input">
                  {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase text-muted-foreground flex items-center gap-1"><Layers className="w-3 h-3" /> Modèle</label>
                <select value={form.templateId} onChange={(e) => setForm({ ...form, templateId: e.target.value })} className="input">
                  {db.templates.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
                </select>
              </div>
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
            <p className="text-xs text-muted-foreground">Ces attributs sont définis dans <span className="font-medium">Paramètres</span> et s'appliquent automatiquement à chaque facture.</p>
            {attributsFact.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border rounded-md">
                Aucun attribut défini. Rendez-vous dans Paramètres pour en ajouter.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {attributsFact.map((a) => (
                  <div key={a.id} className="space-y-1">
                    <label className="text-xs uppercase text-muted-foreground">{a.nom}</label>
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
                <div><span className="text-muted-foreground">N° :</span> <span className="font-mono">{form.numero}</span> · {form.type}</div>
                <div><span className="text-muted-foreground">Date :</span> {form.date} · <span className="text-muted-foreground">Échéance :</span> {form.echeance}</div>
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
            {step < FACTURE_STEPS.length - 1 ? "Suivant" : "Créer la facture"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
