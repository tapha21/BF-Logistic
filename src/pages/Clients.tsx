import { useEffect, useMemo, useState } from "react";
import { Plus, Download, Upload, Mail, Phone, MapPin, Eye, Building2, Receipt, FileText, MessageCircle, Users } from "lucide-react";
import { ImportDialog } from "../components/ImportDialog";
import { clientsToCsv, csvToClients } from "../lib/importExport";
import { downloadTextFile } from "../lib/csv";
import { Stepper } from "../components/Stepper";
import { PageHeader } from "../components/AppLayout";
import { formatXOF } from "../lib/mock-data";
import { useStore, type DBState } from "../lib/store";
import { FilterBar } from "../components/Filters";
import { Pagination, paginate } from "../components/Pagination";
import { Modal } from "../components/Modal";
import { Badge, StatutBadge } from "../components/Badge";
import { computeTotals } from "../lib/documents";

export function ClientsPage() {
  useEffect(() => { document.title = "Clients — BF Logistic CRM"; }, []);
  const { db, addClient, importClients } = useStore();
  const { clients } = db;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [detail, setDetail] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter((c) =>
      !q || c.nom.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.ville.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const totalSolde = clients.reduce((s, c) => s + c.solde, 0);
  const paged = paginate(filtered, pageSize, page);

  return (
    <div>
      <PageHeader
        title="Clients"
        description={`${clients.length} comptes clients · Encours total ${formatXOF(totalSolde)}`}
        icon={Users}
        actions={
          <>
            <button onClick={() => setImportOpen(true)} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1.5">
              <Upload className="w-4 h-4" /> Importer
            </button>
            <button onClick={() => downloadTextFile("clients.csv", clientsToCsv(clients))} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1.5">
              <Download className="w-4 h-4" /> Exporter
            </button>
            <button onClick={() => setCreateOpen(true)} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Nouveau client
            </button>
          </>
        }
      />
      <div className="p-4 sm:p-6">
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <FilterBar search={search} onSearch={(s) => { setSearch(s); setPage(1); }} placeholder="Rechercher par nom, code, email…" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[820px]">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground bg-muted/40">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">Code</th>
                  <th className="text-left px-4 py-2.5 font-medium">Raison sociale</th>
                  <th className="text-left px-4 py-2.5 font-medium">Contact</th>
                  <th className="text-left px-4 py-2.5 font-medium">Coordonnées</th>
                  <th className="text-left px-4 py-2.5 font-medium">Ville</th>
                  <th className="text-right px-4 py-2.5 font-medium">Solde dû</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {paged.map((c) => (
                  <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-mono text-xs">{c.code}</td>
                    <td className="px-4 py-2.5 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center text-[11px] font-semibold shrink-0">
                          {c.nom.slice(0, 2).toUpperCase()}
                        </div>
                        {c.nom}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{c.contact}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.telephone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5"><span className="flex items-center gap-1 text-xs"><MapPin className="w-3 h-3 text-muted-foreground" />{c.ville}, {c.pays}</span></td>
                    <td className="px-4 py-2.5 text-right">
                      {c.solde > 0 ? <Badge tone="danger">{formatXOF(c.solde)}</Badge> : <Badge tone="success">Soldé</Badge>}
                    </td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => setDetail(c.id)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {paged.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-sm text-muted-foreground">Aucun client trouvé</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} pageSizeOptions={[8, 15, 30]} />
        </div>
      </div>

      <ClientDetail id={detail} onClose={() => setDetail(null)} />
      <ClientCreate open={createOpen} onClose={() => setCreateOpen(false)} onSave={(c) => { addClient(c); setCreateOpen(false); }} />
      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Importer des clients (CSV)"
        hint="Colonnes attendues : code, nom, contact, email, telephone, whatsapp, ninea, rccm, adresse, ville, pays, solde."
        parse={csvToClients}
        onImport={importClients}
      />
    </div>
  );
}

function ClientDetail({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { db } = useStore();
  const client = id ? db.clients.find((c) => c.id === id) : null;
  if (!client) return null;

  const factsClient = db.factures.filter((f) => f.clientId === client.id);
  const devClient = db.devis.filter((d) => d.clientId === client.id);
  const ca = factsClient.filter((f) => f.type === "Vente").reduce((s, f) => s + computeTotals(f).montantTTC, 0);

  return (
    <Modal open={!!client} onClose={onClose} title={client.nom} size="lg">
      <div className="p-5 space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg font-semibold shrink-0">
            {client.nom.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold">{client.nom}</h3>
              <Badge tone="info">{client.code}</Badge>
            </div>
            <div className="text-sm text-muted-foreground mt-0.5 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {client.contact}</span>
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {client.email}</span>
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {client.telephone}</span>
              <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {client.whatsapp}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {client.ville}, {client.pays}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">NINEA : {client.ninea || "—"} · RCCM : {client.rccm || "—"}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <MiniStat label="CA total" value={formatXOF(ca)} tone="primary" />
          <MiniStat label="Encours dû" value={formatXOF(client.solde)} tone={client.solde > 0 ? "danger" : "success"} />
          <MiniStat label="Documents" value={`${factsClient.length} factures · ${devClient.length} devis`} tone="neutral" />
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Receipt className="w-4 h-4 text-primary" /> Factures</h4>
          <div className="border border-border rounded-md overflow-x-auto">
            <table className="w-full text-sm min-w-[420px]">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground bg-muted/40">
                <tr><th className="text-left px-3 py-2">N°</th><th className="text-left px-3 py-2">Date</th><th className="text-right px-3 py-2">TTC</th><th className="text-left px-3 py-2">Statut</th></tr>
              </thead>
              <tbody>
                {factsClient.length === 0 && <tr><td colSpan={4} className="text-center py-4 text-muted-foreground text-xs">Aucune facture</td></tr>}
                {factsClient.map((f) => (
                  <tr key={f.id} className="border-t border-border">
                    <td className="px-3 py-2 font-mono text-xs">{f.numero}</td>
                    <td className="px-3 py-2 text-muted-foreground">{f.date}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatXOF(computeTotals(f).montantTTC)}</td>
                    <td className="px-3 py-2"><StatutBadge statut={f.statut} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-info" /> Devis</h4>
          <div className="border border-border rounded-md overflow-x-auto">
            <table className="w-full text-sm min-w-[420px]">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground bg-muted/40">
                <tr><th className="text-left px-3 py-2">N°</th><th className="text-left px-3 py-2">Objet</th><th className="text-right px-3 py-2">TTC</th><th className="text-left px-3 py-2">Statut</th></tr>
              </thead>
              <tbody>
                {devClient.length === 0 && <tr><td colSpan={4} className="text-center py-4 text-muted-foreground text-xs">Aucun devis</td></tr>}
                {devClient.map((d) => (
                  <tr key={d.id} className="border-t border-border">
                    <td className="px-3 py-2 font-mono text-xs">{d.numero}</td>
                    <td className="px-3 py-2 truncate max-w-xs">{d.objet}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatXOF(computeTotals(d).montantTTC)}</td>
                    <td className="px-3 py-2"><StatutBadge statut={d.statut} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: "primary" | "danger" | "success" | "neutral" }) {
  const bg = tone === "primary" ? "border-primary/25 bg-primary/5" : tone === "danger" ? "border-destructive/25 bg-destructive/5" : tone === "success" ? "border-success/25 bg-success/5" : "border-border bg-muted/30";
  return (
    <div className={`rounded-md border p-3 ${bg}`}>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold font-mono">{value}</div>
    </div>
  );
}

const CLIENT_STEPS = ["Identité", "Coordonnées", "Fiscalité & solde"];

function ClientCreate({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (c: DBState["clients"][number]) => void }) {
  const { db } = useStore();
  const emptyForm = { nom: "", contact: "", email: "", telephone: "", whatsapp: "", ninea: "", rccm: "", adresse: "", ville: "Dakar", pays: "Sénégal", solde: 0 };
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { if (open) { setStep(0); setForm(emptyForm); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [open]);

  const canNext = step !== 0 || form.nom.trim().length > 0;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < CLIENT_STEPS.length - 1) { setStep(step + 1); return; }
    const code = `CLI-${String(db.clients.length + 1).padStart(3, "0")}`;
    onSave({ id: "", code, ...form, whatsapp: form.whatsapp || form.telephone });
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouveau client" size="lg">
      <form onSubmit={submit} className="flex flex-col">
        <Stepper steps={CLIENT_STEPS} current={step} />

        {step === 0 && (
          <div className="p-5 grid grid-cols-1 gap-4">
            <Field label="Nom de la société" required><input required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="input" placeholder="Ex: SOCOCIM Industries" /></Field>
            <Field label="Contact"><input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="input" placeholder="Nom du contact principal" /></Field>
          </div>
        )}

        {step === 1 && (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" /></Field>
            <Field label="Téléphone"><input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} className="input" /></Field>
            <Field label="WhatsApp"><input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="input" placeholder="Identique au téléphone si vide" /></Field>
            <Field label="Adresse"><input value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} className="input" /></Field>
            <Field label="Ville"><input value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} className="input" /></Field>
            <Field label="Pays"><input value={form.pays} onChange={(e) => setForm({ ...form, pays: e.target.value })} className="input" /></Field>
          </div>
        )}

        {step === 2 && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="NINEA"><input value={form.ninea} onChange={(e) => setForm({ ...form, ninea: e.target.value })} className="input" /></Field>
              <Field label="RCCM"><input value={form.rccm} onChange={(e) => setForm({ ...form, rccm: e.target.value })} className="input" /></Field>
              <Field label="Solde initial (FCFA)"><input type="number" value={form.solde} onChange={(e) => setForm({ ...form, solde: Number(e.target.value) })} className="input" /></Field>
            </div>
            <div className="bg-muted/40 rounded-md p-3 text-sm space-y-1">
              <div className="text-xs uppercase text-muted-foreground font-medium mb-1">Récapitulatif</div>
              <div><span className="text-muted-foreground">Client :</span> {form.nom || "—"}</div>
              <div><span className="text-muted-foreground">Contact :</span> {form.contact || "—"} · {form.email || "—"} · {form.telephone || "—"}</div>
              <div><span className="text-muted-foreground">Ville :</span> {form.ville}, {form.pays}</div>
            </div>
          </div>
        )}

        <div className="flex justify-between gap-2 p-4 border-t border-border bg-muted/20">
          <button type="button" onClick={() => (step === 0 ? onClose() : setStep(step - 1))} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted">
            {step === 0 ? "Annuler" : "Retour"}
          </button>
          <button type="submit" disabled={!canNext} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50">
            {step < CLIENT_STEPS.length - 1 ? "Suivant" : "Créer le client"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, required, full, children }: { label: string; required?: boolean; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={`space-y-1 ${full ? "sm:col-span-2" : ""}`}>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}{required && <span className="text-destructive"> *</span>}</label>
      {children}
    </div>
  );
}
