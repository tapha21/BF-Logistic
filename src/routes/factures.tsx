import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Download, Printer, Eye, Receipt, Tag } from "lucide-react";
import { PageHeader } from "../components/AppLayout";
import { formatXOF } from "../lib/mock-data";
import { useStore } from "../lib/store";
import { StatutBadge, TypeBadge } from "../components/Badge";
import { FilterBar, StatusSelect } from "../components/Filters";
import { Pagination, paginate } from "../components/Pagination";
import { Modal } from "../components/Modal";

export const Route = createFileRoute("/factures")({
  head: () => ({ meta: [{ title: "Factures — BF Logistic CRM" }] }),
  component: FacturesPage,
});

const STATUTS = ["Payée", "Partiellement payée", "En attente", "En retard"] as const;

function FacturesPage() {
  const { db, addFacture } = useStore();
  const { factures, clients } = db;
  const getClient = (id: string) => clients.find((c) => c.id === id);

  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | "Vente" | "Achat">("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return factures.filter((f) => {
      const c = getClient(f.clientId);
      const okSearch = !q || f.numero.toLowerCase().includes(q) || f.objet.toLowerCase().includes(q) || c?.nom.toLowerCase().includes(q);
      const okStatut = !statut || f.statut === statut;
      const okType = !typeFilter || f.type === typeFilter;
      return okSearch && okStatut && okType;
    });
  }, [factures, clients, search, statut, typeFilter]);

  const ventes = factures.filter((f) => f.type === "Vente");
  const achats = factures.filter((f) => f.type === "Achat");
  const totalVenteHT = ventes.reduce((s, f) => s + f.montantHT, 0);
  const totalVenteTVA = ventes.reduce((s, f) => s + f.tva, 0);
  const totalVenteTTC = ventes.reduce((s, f) => s + f.montantTTC, 0);
  const totalAchatTTC = achats.reduce((s, f) => s + f.montantTTC, 0);
  const totalGlobal = factures.reduce((s, f) => s + f.montantTTC, 0);
  const paged = paginate(filtered, 8, page);

  return (
    <div>
      <PageHeader
        title="Factures"
        description={`${factures.length} factures · Montant total ${formatXOF(totalGlobal)}`}
        actions={
          <>
            <button className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1.5"><Printer className="w-4 h-4" /> Imprimer</button>
            <button className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1.5"><Download className="w-4 h-4" /> Exporter</button>
            <button onClick={() => setCreateOpen(true)} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 flex items-center gap-1.5"><Plus className="w-4 h-4" /> Nouvelle facture</button>
          </>
        }
      />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <SummaryCard label="Total facturé HT" value={formatXOF(totalVenteHT)} />
          <SummaryCard label="TVA collectée" value={formatXOF(totalVenteTVA)} tone="info" />
          <SummaryCard label="Total ventes TTC" value={formatXOF(totalVenteTTC)} tone="success" />
          <SummaryCard label="Total achats TTC" value={formatXOF(totalAchatTTC)} tone="danger" />
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
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
                <StatusSelect value={statut} onChange={(v) => { setStatut(v); setPage(1); }} options={[...STATUTS]} />
              </>
            }
          />
          <table className="w-full text-sm">
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
              {paged.map((f) => (
                <tr key={f.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-mono text-xs"><span className="inline-flex items-center gap-1.5"><Receipt className="w-3 h-3 text-primary" />{f.numero}</span></td>
                  <td className="px-4 py-2.5"><TypeBadge type={f.type} /></td>
                  <td className="px-4 py-2.5 text-muted-foreground">{f.date}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{f.echeance}</td>
                  <td className="px-4 py-2.5">{getClient(f.clientId)?.nom}</td>
                  <td className="px-4 py-2.5 max-w-xs truncate">{f.objet}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{formatXOF(f.montantHT)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">{formatXOF(f.tva)}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold">{formatXOF(f.montantTTC)}</td>
                  <td className="px-4 py-2.5"><StatutBadge statut={f.statut} /></td>
                  <td className="px-4 py-2.5"><button onClick={() => setDetail(f.id)} className="p-1.5 rounded-md hover:bg-muted"><Eye className="w-4 h-4 text-muted-foreground" /></button></td>
                </tr>
              ))}
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
          <Pagination page={page} pageSize={8} total={filtered.length} onPageChange={setPage} />
        </div>
      </div>

      <FactureDetail id={detail} onClose={() => setDetail(null)} />
      <FactureCreate open={createOpen} onClose={() => setCreateOpen(false)} onSave={(f) => { addFacture(f); setCreateOpen(false); }} />
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone?: "success" | "danger" | "info" }) {
  const t = tone === "success" ? "text-success bg-success/10" : tone === "danger" ? "text-destructive bg-destructive/10" : tone === "info" ? "text-info bg-info/10" : "text-primary bg-primary/10";
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${t}`}>FCFA</div>
      </div>
      <div className="mt-2 text-lg font-semibold font-mono">{value}</div>
    </div>
  );
}

function FactureDetail({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { db } = useStore();
  const f = id ? db.factures.find((x) => x.id === id) : null;
  if (!f) return null;
  const client = db.clients.find((c) => c.id === f.clientId);
  const attributs = db.attributs.filter((a) => a.cible === "facture");
  return (
    <Modal open={!!f} onClose={onClose} title={`Facture ${f.numero}`} size="lg">
      <div className="p-6 space-y-5">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Facturé à</div>
            <div className="mt-1 font-semibold">{client?.nom}</div>
            <div className="text-sm text-muted-foreground">{client?.contact}<br/>{client?.email}<br/>{client?.ville}, {client?.pays}</div>
          </div>
          <div className="text-right space-y-1">
            <div className="flex gap-2 justify-end"><TypeBadge type={f.type} /><StatutBadge statut={f.statut} /></div>
            <div className="text-xs text-muted-foreground mt-2">Émission : {f.date}</div>
            <div className="text-xs text-muted-foreground">Échéance : {f.echeance}</div>
            <div className="text-xs text-muted-foreground">Réf. : <span className="font-mono">{f.numero}</span></div>
          </div>
        </div>

        <div className="border border-border rounded-md p-4">
          <div className="text-xs uppercase text-muted-foreground">Objet</div>
          <div className="mt-1 text-sm">{f.objet}</div>
        </div>

        <table className="w-full text-sm border border-border rounded-md overflow-hidden">
          <tbody>
            <tr className="border-b border-border"><td className="px-4 py-2 text-muted-foreground">Montant HT</td><td className="px-4 py-2 text-right font-mono">{formatXOF(f.montantHT)}</td></tr>
            <tr className="border-b border-border"><td className="px-4 py-2 text-muted-foreground">TVA (18%)</td><td className="px-4 py-2 text-right font-mono">{formatXOF(f.tva)}</td></tr>
            <tr className="bg-primary/5"><td className="px-4 py-2.5 font-semibold">Total TTC</td><td className="px-4 py-2.5 text-right font-mono font-bold text-primary">{formatXOF(f.montantTTC)}</td></tr>
          </tbody>
        </table>

        {attributs.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Tag className="w-4 h-4 text-purple" /> Attributs personnalisés</h4>
            <div className="grid grid-cols-2 gap-2">
              {attributs.map((a) => (
                <div key={a.id} className="border border-border rounded-md px-3 py-2 bg-muted/30">
                  <div className="text-[11px] uppercase text-muted-foreground">{a.nom}</div>
                  <div className="text-sm font-mono">{a.defaut || "—"}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1.5"><Printer className="w-4 h-4" /> Imprimer</button>
          <button className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1.5"><Download className="w-4 h-4" /> PDF</button>
          <button className="px-3 py-1.5 text-sm bg-success text-success-foreground rounded-md hover:opacity-90 text-white">Marquer comme payée</button>
        </div>
      </div>
    </Modal>
  );
}

function FactureCreate({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (f: any) => void }) {
  const { db } = useStore();
  const [tab, setTab] = useState<"general" | "attributs">("general");
  const [form, setForm] = useState({
    numero: `FAC-2026-${String(Math.floor(Math.random()*90000)+10000)}`,
    date: new Date().toISOString().slice(0,10),
    echeance: new Date(Date.now() + 30*86400000).toISOString().slice(0,10),
    clientId: db.clients[0]?.id ?? "",
    objet: "",
    montantHT: 0,
    statut: "En attente" as const,
    type: "Vente" as "Vente" | "Achat",
  });
  const attributsFact = db.attributs.filter((a) => a.cible === "facture");
  const [attrValues, setAttrValues] = useState<Record<string, string>>({});

  const tva = Math.round(form.montantHT * 0.18);
  const ttc = form.montantHT + tva;
  const submit = (e: React.FormEvent) => { e.preventDefault(); onSave({ ...form, tva, montantTTC: ttc }); };

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle facture" size="lg">
      <form onSubmit={submit}>
        <div className="border-b border-border px-5 flex gap-1">
          {(["general", "attributs"] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm border-b-2 -mb-px ${tab === t ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {t === "general" ? "Général" : `Attributs (${attributsFact.length})`}
            </button>
          ))}
        </div>

        {tab === "general" ? (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">N° Facture</label><input value={form.numero} onChange={(e) => setForm({...form, numero: e.target.value})} className="input" /></div>
              <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Type</label>
                <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value as any})} className="input">
                  <option value="Vente">Vente</option><option value="Achat">Achat</option>
                </select>
              </div>
              <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Date émission</label><input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="input" /></div>
              <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Échéance</label><input type="date" value={form.echeance} onChange={(e) => setForm({...form, echeance: e.target.value})} className="input" /></div>
              <div className="space-y-1 col-span-2"><label className="text-xs uppercase text-muted-foreground">Tiers</label>
                <select value={form.clientId} onChange={(e) => setForm({...form, clientId: e.target.value})} className="input">
                  {db.clients.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
              <div className="space-y-1 col-span-2"><label className="text-xs uppercase text-muted-foreground">Objet</label><input required value={form.objet} onChange={(e) => setForm({...form, objet: e.target.value})} className="input" placeholder="Description prestation…" /></div>
              <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Montant HT (FCFA)</label><input type="number" value={form.montantHT} onChange={(e) => setForm({...form, montantHT: Number(e.target.value)})} className="input" /></div>
              <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Statut</label>
                <select value={form.statut} onChange={(e) => setForm({...form, statut: e.target.value as any})} className="input">
                  {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="bg-muted/40 rounded-md p-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">TVA 18%</span><span className="font-mono">{formatXOF(tva)}</span></div>
              <div className="flex justify-between font-semibold"><span>Total TTC</span><span className="font-mono text-primary text-base">{formatXOF(ttc)}</span></div>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <p className="text-xs text-muted-foreground">Ces attributs sont définis dans <span className="font-medium">Paramètres</span> et s'appliquent automatiquement à chaque facture.</p>
            {attributsFact.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border rounded-md">
                Aucun attribut défini. Rendez-vous dans Paramètres pour en ajouter.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {attributsFact.map((a) => (
                  <div key={a.id} className="space-y-1">
                    <label className="text-xs uppercase text-muted-foreground flex items-center gap-1"><Tag className="w-3 h-3 text-purple" /> {a.nom}</label>
                    <input
                      type={a.type === "nombre" ? "number" : a.type === "date" ? "date" : "text"}
                      value={attrValues[a.id] ?? a.defaut ?? ""}
                      onChange={(e) => setAttrValues({...attrValues, [a.id]: e.target.value})}
                      className="input"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 p-4 border-t border-border bg-muted/20">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted">Annuler</button>
          <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90">Créer la facture</button>
        </div>
      </form>
    </Modal>
  );
}