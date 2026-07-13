import { useEffect, useMemo, useState } from "react";
import { Download, Upload, Wallet, Plus, BookOpen, ArrowDownCircle, ArrowUpCircle, FileBarChart, Activity, ListOrdered, PieChart as PieChartIcon } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PageHeader } from "../components/AppLayout";
import { formatXOF } from "../lib/mock-data";
import { useStore } from "../lib/store";
import { Badge } from "../components/Badge";
import { FilterBar, StatusSelect, DateRangeFilter } from "../components/Filters";
import { Pagination, paginate } from "../components/Pagination";
import { Modal } from "../components/Modal";
import { ImportDialog } from "../components/ImportDialog";
import { KpiCard } from "../components/Kpi";
import { AccountingReportModal } from "../components/AccountingReportModal";
import { ecrituresToCsv, csvToEcritures } from "../lib/importExport";
import { downloadTextFile } from "../lib/csv";

export function ComptaPage() {
  useEffect(() => { document.title = "Comptabilité — BF Logistic CRM"; }, []);
  const { db, addEcriture, importEcritures } = useStore();
  const { ecritures } = db;
  const [search, setSearch] = useState("");
  const [typeF, setTypeF] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

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
      const okFrom = !dateFrom || e.date >= dateFrom;
      const okTo = !dateTo || e.date <= dateTo;
      return okS && okT && okFrom && okTo;
    });
  }, [ecritures, search, typeF, dateFrom, dateTo]);
  const paged = paginate(filtered, pageSize, page);

  const periodeLabel = dateFrom || dateTo ? `${dateFrom || "…"} → ${dateTo || "…"}` : "Toutes périodes";

  const [chartMonth, setChartMonth] = useState("");
  const months = useMemo(() => [...new Set(ecritures.map((e) => e.date.slice(0, 7)))].sort(), [ecritures]);
  const monthLabel = (m: string) => {
    const [y, mo] = m.split("-").map(Number);
    return new Date(y, mo - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  };

  const chartData = useMemo(() => {
    const map: Record<string, { date: string; solde: number }> = {};
    let cum = 0;
    [...ecritures].sort((a, b) => a.date.localeCompare(b.date)).forEach((e) => {
      cum += e.type === "Entrée" ? e.montant : -e.montant;
      map[e.date] = { date: e.date, solde: cum };
    });
    const all = Object.values(map);
    const scoped = chartMonth ? all.filter((d) => d.date.startsWith(chartMonth)) : all;
    return scoped.map((d) => ({ ...d, jour: d.date.slice(5) }));
  }, [ecritures, chartMonth]);

  return (
    <div>
      <PageHeader
        title="Comptabilité"
        description="Journal des pièces comptables — Mai 2026"
        icon={BookOpen}
        actions={
          <>
            <button onClick={() => setReportOpen(true)} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1.5"><FileBarChart className="w-4 h-4" /> <span className="hidden sm:inline">Générer un rapport</span></button>
            <button onClick={() => setImportOpen(true)} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1.5"><Upload className="w-4 h-4" /> <span className="hidden sm:inline">Importer</span></button>
            <button onClick={() => downloadTextFile("grand-livre.csv", ecrituresToCsv(ecritures))} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1.5"><Download className="w-4 h-4" /> <span className="hidden sm:inline">Exporter grand livre</span></button>
            <button onClick={() => setCreateOpen(true)} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 flex items-center gap-1.5"><Plus className="w-4 h-4" /> Nouvelle pièce comptable</button>
          </>
        }
      />
      <div className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard label="Entrées d'argent" value={formatXOF(totalE)} sub={`${entrees.length} mouvement(s)`} icon={ArrowDownCircle} tone="success" />
          <KpiCard label="Sorties d'argent" value={formatXOF(totalS)} sub={`${sorties.length} mouvement(s)`} icon={ArrowUpCircle} tone="destructive" />
          <KpiCard label="Solde net" value={formatXOF(solde)} sub="Entrées − sorties" icon={Wallet} tone={solde >= 0 ? "success" : "destructive"} />
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-border flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"><Activity className="w-4 h-4" /></div>
              <div>
                <h2 className="text-sm font-semibold">Évolution du solde</h2>
                <p className="text-xs text-muted-foreground">Cumul des mouvements{chartMonth ? ` — ${monthLabel(chartMonth)}` : ""}</p>
              </div>
            </div>
            <select
              value={chartMonth}
              onChange={(e) => setChartMonth(e.target.value)}
              className="text-sm bg-card border border-border rounded-md px-2.5 py-1.5 outline-none hover:bg-muted/40"
            >
              <option value="">Tous les mois</option>
              {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
            </select>
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
                <XAxis dataKey="jour" fontSize={11} stroke="oklch(0.52 0.02 250)" />
                <YAxis fontSize={11} stroke="oklch(0.52 0.02 250)" tickFormatter={(v) => `${(v/1_000_000).toFixed(1)}M`} />
                <Tooltip formatter={(v: number) => formatXOF(v)} contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                <Area type="monotone" dataKey="solde" stroke="oklch(0.52 0.14 250)" fill="url(#sd)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-info/10 text-info flex items-center justify-center shrink-0"><ListOrdered className="w-4 h-4" /></div>
              <h2 className="text-sm font-semibold">Journal des pièces comptables</h2>
            </div>
            <FilterBar
              search={search}
              onSearch={(s) => { setSearch(s); setPage(1); }}
              placeholder="Libellé, référence, catégorie…"
              right={
                <>
                  <DateRangeFilter from={dateFrom} to={dateTo} onChange={(f, t) => { setDateFrom(f); setDateTo(t); setPage(1); }} />
                  <StatusSelect value={typeF} onChange={(v) => { setTypeF(v); setPage(1); }} options={["Entrée", "Sortie"]} label="Tous les types" />
                </>
              }
            />
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
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
                  {paged.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-sm text-muted-foreground">Aucune pièce comptable</td></tr>}
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
            </div>
            <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} pageSizeOptions={[10, 20, 40]} />
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple/10 text-purple flex items-center justify-center shrink-0"><PieChartIcon className="w-4 h-4" /></div>
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
      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Importer des pièces comptables (CSV)"
        hint="Colonnes attendues : date, libelle, reference, type (Entrée/Sortie), categorie, montant."
        parse={csvToEcritures}
        onImport={importEcritures}
      />
      <AccountingReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        societe={db.societe}
        periodeLabel={periodeLabel}
        ecritures={filtered}
      />
    </div>
  );
}

function EcritureCreate({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (e: any) => void }) {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), libelle: "", reference: "", type: "Entrée" as "Entrée" | "Sortie", categorie: "Ventes", montant: 0 });
  return (
    <Modal open={open} onClose={onClose} title="Nouvelle pièce comptable" size="md">
      <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Date</label><input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="input" /></div>
          <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Type</label>
            <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value as any})} className="input">
              <option value="Entrée">Entrée</option><option value="Sortie">Sortie</option>
            </select>
          </div>
          <div className="space-y-1 sm:col-span-2"><label className="text-xs uppercase text-muted-foreground">Libellé</label><input required value={form.libelle} onChange={(e) => setForm({...form, libelle: e.target.value})} className="input" /></div>
          <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Référence</label><input value={form.reference} onChange={(e) => setForm({...form, reference: e.target.value})} className="input" /></div>
          <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Catégorie</label><input value={form.categorie} onChange={(e) => setForm({...form, categorie: e.target.value})} className="input" /></div>
          <div className="space-y-1 sm:col-span-2"><label className="text-xs uppercase text-muted-foreground">Montant (FCFA)</label><input type="number" value={form.montant} onChange={(e) => setForm({...form, montant: Number(e.target.value)})} className="input" /></div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted">Annuler</button>
          <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90">Enregistrer</button>
        </div>
      </form>
    </Modal>
  );
}
