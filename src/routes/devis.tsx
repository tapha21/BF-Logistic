import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Download, FileText, Eye, Printer } from "lucide-react";
import { PageHeader } from "../components/AppLayout";
import { formatXOF } from "../lib/mock-data";
import { useStore } from "../lib/store";
import { StatutBadge } from "../components/Badge";
import { FilterBar, StatusSelect } from "../components/Filters";
import { Pagination, paginate } from "../components/Pagination";
import { Modal } from "../components/Modal";

export const Route = createFileRoute("/devis")({
  head: () => ({ meta: [{ title: "Devis — BF Logistic CRM" }] }),
  component: DevisPage,
});

const STATUTS = ["Brouillon", "Envoyé", "Accepté", "Refusé"] as const;

function DevisPage() {
  const { db, addDevis } = useStore();
  const { devis, clients } = db;
  const getClient = (id: string) => clients.find((c) => c.id === id);

  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return devis.filter((d) => {
      const c = getClient(d.clientId);
      const okSearch = !q || d.numero.toLowerCase().includes(q) || d.objet.toLowerCase().includes(q) || c?.nom.toLowerCase().includes(q);
      const okStatut = !statut || d.statut === statut;
      return okSearch && okStatut;
    });
  }, [devis, clients, search, statut]);

  const acceptes = devis.filter((d) => d.statut === "Accepté").reduce((s, d) => s + d.montantTTC, 0);
  const paged = paginate(filtered, 8, page);

  return (
    <div>
      <PageHeader
        title="Devis"
        description={`${devis.length} devis · ${formatXOF(acceptes)} acceptés`}
        actions={
          <>
            <button className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1.5"><Download className="w-4 h-4" /> Exporter</button>
            <button onClick={() => setCreateOpen(true)} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 flex items-center gap-1.5"><Plus className="w-4 h-4" /> Nouveau devis</button>
          </>
        }
      />
      <div className="p-6">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <FilterBar
            search={search}
            onSearch={(s) => { setSearch(s); setPage(1); }}
            placeholder="N°, objet, client…"
            right={<StatusSelect value={statut} onChange={(v) => { setStatut(v); setPage(1); }} options={[...STATUTS]} />}
          />
          <table className="w-full text-sm">
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
              {paged.map((d) => (
                <tr key={d.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-mono text-xs">
                    <span className="inline-flex items-center gap-1.5"><FileText className="w-3 h-3 text-info" />{d.numero}</span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{d.date}</td>
                  <td className="px-4 py-2.5">{getClient(d.clientId)?.nom}</td>
                  <td className="px-4 py-2.5 max-w-xs truncate">{d.objet}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{formatXOF(d.montantHT)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">{formatXOF(d.tva)}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold">{formatXOF(d.montantTTC)}</td>
                  <td className="px-4 py-2.5"><StatutBadge statut={d.statut} /></td>
                  <td className="px-4 py-2.5"><button onClick={() => setDetail(d.id)} className="p-1.5 rounded-md hover:bg-muted"><Eye className="w-4 h-4 text-muted-foreground" /></button></td>
                </tr>
              ))}
              {paged.length === 0 && <tr><td colSpan={9} className="text-center py-12 text-sm text-muted-foreground">Aucun devis trouvé</td></tr>}
            </tbody>
          </table>
          <Pagination page={page} pageSize={8} total={filtered.length} onPageChange={setPage} />
        </div>
      </div>

      <DevisDetail id={detail} onClose={() => setDetail(null)} />
      <DevisCreate open={createOpen} onClose={() => setCreateOpen(false)} onSave={(d) => { addDevis(d); setCreateOpen(false); }} />
    </div>
  );
}

function DevisDetail({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { db } = useStore();
  const d = id ? db.devis.find((x) => x.id === id) : null;
  if (!d) return null;
  const client = db.clients.find((c) => c.id === d.clientId);
  return (
    <Modal open={!!d} onClose={onClose} title={`Devis ${d.numero}`} size="lg">
      <div className="p-6 space-y-5">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Émis à</div>
            <div className="mt-1 font-semibold">{client?.nom}</div>
            <div className="text-sm text-muted-foreground">{client?.contact}<br/>{client?.email}<br/>{client?.ville}, {client?.pays}</div>
          </div>
          <div className="text-right space-y-1">
            <StatutBadge statut={d.statut} />
            <div className="text-xs text-muted-foreground mt-2">Date : {d.date}</div>
            <div className="text-xs text-muted-foreground">Réf. : <span className="font-mono">{d.numero}</span></div>
          </div>
        </div>
        <div className="border border-border rounded-md p-4">
          <div className="text-xs uppercase text-muted-foreground">Objet</div>
          <div className="mt-1 text-sm">{d.objet}</div>
        </div>
        <table className="w-full text-sm border border-border rounded-md overflow-hidden">
          <tbody>
            <tr className="border-b border-border"><td className="px-4 py-2 text-muted-foreground">Montant HT</td><td className="px-4 py-2 text-right font-mono">{formatXOF(d.montantHT)}</td></tr>
            <tr className="border-b border-border"><td className="px-4 py-2 text-muted-foreground">TVA (18%)</td><td className="px-4 py-2 text-right font-mono">{formatXOF(d.tva)}</td></tr>
            <tr className="bg-primary/5"><td className="px-4 py-2.5 font-semibold">Total TTC</td><td className="px-4 py-2.5 text-right font-mono font-bold text-primary">{formatXOF(d.montantTTC)}</td></tr>
          </tbody>
        </table>
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1.5"><Printer className="w-4 h-4" /> Imprimer</button>
          <button className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90">Convertir en facture</button>
        </div>
      </div>
    </Modal>
  );
}

function DevisCreate({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (d: any) => void }) {
  const { db } = useStore();
  const [form, setForm] = useState({ numero: `DEV-2026-${String(Math.floor(Math.random()*9000)+1000)}`, date: new Date().toISOString().slice(0,10), clientId: db.clients[0]?.id ?? "", objet: "", montantHT: 0, statut: "Brouillon" as const });
  const tva = Math.round(form.montantHT * 0.18);
  const ttc = form.montantHT + tva;
  const submit = (e: React.FormEvent) => { e.preventDefault(); onSave({ ...form, tva, montantTTC: ttc }); };
  return (
    <Modal open={open} onClose={onClose} title="Nouveau devis" size="lg">
      <form onSubmit={submit} className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">N° Devis</label><input value={form.numero} onChange={(e) => setForm({...form, numero: e.target.value})} className="input" /></div>
          <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Date</label><input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="input" /></div>
          <div className="space-y-1 col-span-2"><label className="text-xs uppercase text-muted-foreground">Client</label>
            <select value={form.clientId} onChange={(e) => setForm({...form, clientId: e.target.value})} className="input">
              {db.clients.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div className="space-y-1 col-span-2"><label className="text-xs uppercase text-muted-foreground">Objet</label><input required value={form.objet} onChange={(e) => setForm({...form, objet: e.target.value})} className="input" placeholder="Ex: Transit maritime conteneur 40'..." /></div>
          <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Montant HT (FCFA)</label><input type="number" value={form.montantHT} onChange={(e) => setForm({...form, montantHT: Number(e.target.value)})} className="input" /></div>
          <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Statut</label>
            <select value={form.statut} onChange={(e) => setForm({...form, statut: e.target.value as any})} className="input">
              {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="bg-muted/40 rounded-md p-3 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">TVA 18%</span><span className="font-mono">{formatXOF(tva)}</span></div>
          <div className="flex justify-between font-semibold"><span>Total TTC</span><span className="font-mono text-primary">{formatXOF(ttc)}</span></div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted">Annuler</button>
          <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90">Créer le devis</button>
        </div>
      </form>
    </Modal>
  );
}