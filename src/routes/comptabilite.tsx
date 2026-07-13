import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, TrendingUp, TrendingDown, Wallet, Plus } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PageHeader } from "../components/AppLayout";
import { formatXOF } from "../lib/mock-data";
import { useStore } from "../lib/store";
import { Badge } from "../components/Badge";
import { FilterBar, StatusSelect } from "../components/Filters";
import { Pagination, paginate } from "../components/Pagination";
import { Modal } from "../components/Modal";

export const Route = createFileRoute("/comptabilite")({
  head: () => ({ meta: [{ title: "Comptabilité — BF Logistic CRM" }] }),
  component: ComptaPage,
});

function ComptaPage() {
  const { db, addEcriture } = useStore();
  const { ecritures } = db;
  const [search, setSearch] = useState("");
  const [typeF, setTypeF] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  const entrees = ecritures.filter((e) => e.type === "Entrée");
  const sorties = ecritures.filter((e) => e.type === "Sortie");
  const totalE = entrees.reduce((s, e) => s + e.montant, 0);
  const totalS = sorties.reduce((s, e) => s + e.montant, 0);
  const solde = totalE - totalS;

  const byCategorie = sorties.reduce<Record<string, number>>((acc, e) => {
    acc[e.categorie] = (acc[e.categorie] ?? 0) + e.montant;
    return acc;
  }, {});

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ecritures.filter((e) => {
      const okS = !q || e.libelle.toLowerCase().includes(q) || e.reference.toLowerCase().includes(q) || e.categorie.toLowerCase().includes(q);
      const okT = !typeF || e.type === typeF;
      return okS && okT;
    });
  }, [ecritures, search, typeF]);
  const paged = paginate(filtered, 10, page);

  const chartData = useMemo(() => {
    const map: Record<string, { date: string; solde: number }> = {};
    let cum = 0;
    [...ecritures].sort((a, b) => a.date.localeCompare(b.date)).forEach((e) => {
      cum += e.type === "Entrée" ? e.montant : -e.montant;
      map[e.date] = { date: e.date.slice(5), solde: cum };
    });
    return Object.values(map);
  }, [ecritures]);

  return (
    <div>
      <PageHeader
        title="Comptabilité"
        description="Journal des entrées et sorties — Mai 2026"
        actions={
          <>
            <button className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1.5"><Download className="w-4 h-4" /> Exporter grand livre</button>
            <button onClick={() => setCreateOpen(true)} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 flex items-center gap-1.5"><Plus className="w-4 h-4" /> Nouvelle écriture</button>
          </>
        }
      />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <BalanceCard label="Total entrées" value={formatXOF(totalE)} icon={TrendingUp} tone="success" />
          <BalanceCard label="Total sorties" value={formatXOF(totalS)} icon={TrendingDown} tone="destructive" />
          <BalanceCard label="Solde net" value={formatXOF(solde)} icon={Wallet} tone={solde >= 0 ? "success" : "destructive"} />
        </div>

        <div className="bg-card border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Évolution du solde</h2>
            <p className="text-xs text-muted-foreground">Cumul quotidien des mouvements</p>
          </div>
          <div className="p-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="sd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.52 0.14 250)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="oklch(0.52 0.14 250)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.008 240)" vertical={false} />
                <XAxis dataKey="date" fontSize={11} stroke="oklch(0.52 0.02 250)" />
                <YAxis fontSize={11} stroke="oklch(0.52 0.02 250)" tickFormatter={(v) => `${(v/1_000_000).toFixed(1)}M`} />
                <Tooltip formatter={(v: number) => formatXOF(v)} contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                <Area type="monotone" dataKey="solde" stroke="oklch(0.52 0.14 250)" fill="url(#sd)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold">Journal des écritures</h2>
            </div>
            <FilterBar
              search={search}
              onSearch={(s) => { setSearch(s); setPage(1); }}
              placeholder="Libellé, référence, catégorie…"
              right={<StatusSelect value={typeF} onChange={(v) => { setTypeF(v); setPage(1); }} options={["Entrée", "Sortie"]} label="Tous les types" />}
            />
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground bg-muted/40">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">Date</th>
                  <th className="text-left px-4 py-2.5 font-medium">Référence</th>
                  <th className="text-left px-4 py-2.5 font-medium">Libellé</th>
                  <th className="text-left px-4 py-2.5 font-medium">Catégorie</th>
                  <th className="text-right px-4 py-2.5 font-medium">Débit</th>
                  <th className="text-right px-4 py-2.5 font-medium">Crédit</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((e) => (
                  <tr key={e.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2.5 text-muted-foreground">{e.date}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{e.reference}</td>
                    <td className="px-4 py-2.5">{e.libelle}</td>
                    <td className="px-4 py-2.5"><Badge tone="neutral">{e.categorie}</Badge></td>
                    <td className="px-4 py-2.5 text-right font-mono text-destructive">{e.type === "Sortie" ? formatXOF(e.montant) : "—"}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-success">{e.type === "Entrée" ? formatXOF(e.montant) : "—"}</td>
                  </tr>
                ))}
                {paged.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-sm text-muted-foreground">Aucune écriture</td></tr>}
              </tbody>
              <tfoot className="bg-muted/60 border-t-2 border-border">
                <tr>
                  <td colSpan={4} className="px-4 py-2.5 text-right text-xs uppercase font-semibold">Totaux</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold text-destructive">{formatXOF(totalS)}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold text-success">{formatXOF(totalE)}</td>
                </tr>
                <tr className="border-t border-border">
                  <td colSpan={4} className="px-4 py-2.5 text-right text-xs uppercase font-semibold">Solde</td>
                  <td colSpan={2} className={`px-4 py-2.5 text-right font-mono font-bold text-base ${solde >= 0 ? "text-success" : "text-destructive"}`}>{formatXOF(solde)}</td>
                </tr>
              </tfoot>
            </table>
            <Pagination page={page} pageSize={10} total={filtered.length} onPageChange={setPage} />
          </div>

          <div className="bg-card border border-border rounded-lg">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold">Répartition des charges</h2>
            </div>
            <div className="p-4 space-y-3">
              {Object.entries(byCategorie).sort((a, b) => b[1] - a[1]).map(([cat, montant], i) => {
                const pct = (montant / totalS) * 100;
                const colors = ["bg-primary", "bg-info", "bg-purple", "bg-warning", "bg-accent", "bg-destructive"];
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm">
                      <span>{cat}</span>
                      <span className="font-mono text-xs text-muted-foreground">{formatXOF(montant)}</span>
                    </div>
                    <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${colors[i % colors.length]} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{pct.toFixed(1)}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <EcritureCreate open={createOpen} onClose={() => setCreateOpen(false)} onSave={(e) => { addEcriture(e); setCreateOpen(false); }} />
    </div>
  );
}

function BalanceCard({ label, value, icon: Icon, tone }: { label: string; value: string; icon: any; tone: "success" | "destructive" }) {
  const bg = tone === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive";
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="mt-2 text-xl font-semibold font-mono">{value}</div>
        </div>
        <div className={`w-10 h-10 rounded-md flex items-center justify-center ${bg}`}><Icon className="w-5 h-5" /></div>
      </div>
    </div>
  );
}

function EcritureCreate({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (e: any) => void }) {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), libelle: "", reference: "", type: "Entrée" as "Entrée" | "Sortie", categorie: "Ventes", montant: 0 });
  return (
    <Modal open={open} onClose={onClose} title="Nouvelle écriture" size="md">
      <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Date</label><input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="input" /></div>
          <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Type</label>
            <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value as any})} className="input">
              <option value="Entrée">Entrée</option><option value="Sortie">Sortie</option>
            </select>
          </div>
          <div className="space-y-1 col-span-2"><label className="text-xs uppercase text-muted-foreground">Libellé</label><input required value={form.libelle} onChange={(e) => setForm({...form, libelle: e.target.value})} className="input" /></div>
          <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Référence</label><input value={form.reference} onChange={(e) => setForm({...form, reference: e.target.value})} className="input" /></div>
          <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Catégorie</label><input value={form.categorie} onChange={(e) => setForm({...form, categorie: e.target.value})} className="input" /></div>
          <div className="space-y-1 col-span-2"><label className="text-xs uppercase text-muted-foreground">Montant (FCFA)</label><input type="number" value={form.montant} onChange={(e) => setForm({...form, montant: Number(e.target.value)})} className="input" /></div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted">Annuler</button>
          <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90">Enregistrer</button>
        </div>
      </form>
    </Modal>
  );
}