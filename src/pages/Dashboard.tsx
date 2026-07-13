import { useEffect, useState } from "react";
import {
  Receipt,
  Users,
  FileText,
  AlertCircle,
  Wallet,
  ArrowUpRight,
  ArrowDownCircle,
  ArrowUpCircle,
  LayoutDashboard,
  Eye,
  Activity,
  PieChart as PieChartIcon,
  Trophy,
  ListChecks,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";
import { PageHeader } from "../components/AppLayout";
import { formatXOF } from "../lib/mock-data";
import { useStore } from "../lib/store";
import { StatutBadge } from "../components/Badge";
import { Link } from "../lib/router";
import { computeTotals, isEnRetard } from "../lib/documents";
import { KpiCard } from "../components/Kpi";
import { DocumentPreviewModal } from "../components/documents/DocumentPreviewModal";

export function Dashboard() {
  useEffect(() => { document.title = "Tableau de bord — BF Logistic CRM"; }, []);
  const { db, updateFacture } = useStore();
  const { clients, devis, factures, ecritures } = db;
  const [detail, setDetail] = useState<string | null>(null);
  const detailFacture = detail ? factures.find((f) => f.id === detail) : null;

  const ventes = factures.filter((f) => f.type === "Vente");
  const totalFactures = ventes.reduce((s, f) => s + computeTotals(f).montantTTC, 0);
  const totalEncaisse = ecritures.filter((e) => e.type === "Entrée").reduce((s, e) => s + e.montant, 0);
  const totalDecaisse = ecritures.filter((e) => e.type === "Sortie").reduce((s, e) => s + e.montant, 0);
  const enAttente = ventes.filter((f) => f.statut === "En attente" || f.statut === "Partiellement payée").reduce((s, f) => s + computeTotals(f).montantTTC, 0);
  const enRetard = ventes.filter((f) => isEnRetard(f));

  const recentFactures = [...factures].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const getClient = (id: string) => clients.find((c) => c.id === id);

  const byDay: Record<string, { date: string; entrees: number; sorties: number }> = {};
  ecritures.forEach((e) => {
    byDay[e.date] = byDay[e.date] ?? { date: e.date, entrees: 0, sorties: 0 };
    if (e.type === "Entrée") byDay[e.date].entrees += e.montant;
    else byDay[e.date].sorties += e.montant;
  });
  const chartData = Object.values(byDay)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({ ...d, jour: d.date.slice(5) }));

  const statutData = ["Payée", "En attente", "Partiellement payée", "En retard"].map((s) => ({
    name: s,
    value: ventes.filter((f) => f.statut === s).length,
  })).filter((d) => d.value > 0);
  const STATUT_COLORS = ["#16a34a", "#f59e0b", "#eab308", "#dc2626"];

  const topClients = clients
    .map((c) => ({
      nom: c.nom.split(" ")[0],
      ca: factures.filter((f) => f.clientId === c.id && f.type === "Vente").reduce((s, f) => s + computeTotals(f).montantTTC, 0),
    }))
    .filter((c) => c.ca > 0)
    .sort((a, b) => b.ca - a.ca)
    .slice(0, 5);

  return (
    <div>
      <PageHeader title="Tableau de bord" description="Vue d'ensemble — Exercice 2026" icon={LayoutDashboard} />
      <div className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4">
          <KpiCard label="Chiffre d'affaires" value={formatXOF(totalFactures)} sub={`${ventes.length} factures émises`} icon={Receipt} tone="primary" trend="+12%" />
          <KpiCard label="Entrées d'argent" value={formatXOF(totalEncaisse)} sub="Encaissements — mois en cours" icon={ArrowDownCircle} tone="success" trend="+8%" />
          <KpiCard label="Sorties d'argent" value={formatXOF(totalDecaisse)} sub="Décaissements — mois en cours" icon={ArrowUpCircle} tone="destructive" trend="-3%" />
          <KpiCard label="Trésorerie nette" value={formatXOF(totalEncaisse - totalDecaisse)} sub="Entrées − sorties" icon={Wallet} tone={totalEncaisse - totalDecaisse >= 0 ? "success" : "destructive"} />
          <KpiCard label="En attente" value={formatXOF(enAttente)} sub={`${enRetard.length} factures en retard`} icon={AlertCircle} tone="warning" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 bg-card border border-border rounded-xl shadow-sm">
            <div className="px-4 py-3 border-b border-border flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"><Activity className="w-4 h-4" /></div>
                <div>
                  <h2 className="text-sm font-semibold">Flux de trésorerie</h2>
                  <p className="text-xs text-muted-foreground">Entrées vs sorties — mai 2026</p>
                </div>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success" /> Entrées</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-destructive" /> Sorties</span>
              </div>
            </div>
            <div className="p-4 h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="e" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.62 0.13 155)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="oklch(0.62 0.13 155)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.62 0.18 20)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="oklch(0.62 0.18 20)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.008 240)" vertical={false} />
                  <XAxis dataKey="jour" fontSize={11} stroke="oklch(0.52 0.02 250)" />
                  <YAxis fontSize={11} stroke="oklch(0.52 0.02 250)" tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
                  <Tooltip formatter={(v: number) => formatXOF(v)} contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid oklch(0.92 0.008 240)" }} />
                  <Area type="monotone" dataKey="entrees" name="Entrées" stroke="oklch(0.62 0.13 155)" fill="url(#e)" strokeWidth={2} />
                  <Area type="monotone" dataKey="sorties" name="Sorties" stroke="oklch(0.62 0.18 20)" fill="url(#s)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-info/10 text-info flex items-center justify-center shrink-0"><PieChartIcon className="w-4 h-4" /></div>
              <div>
                <h2 className="text-sm font-semibold">Statut des factures</h2>
                <p className="text-xs text-muted-foreground">Répartition</p>
              </div>
            </div>
            <div className="p-4 h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statutData} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {statutData.map((_, i) => <Cell key={i} fill={STATUT_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 bg-card border border-border rounded-xl shadow-sm">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-warning/15 text-[oklch(0.55_0.15_75)] flex items-center justify-center shrink-0"><Trophy className="w-4 h-4" /></div>
                <h2 className="text-sm font-semibold">Top clients par CA</h2>
              </div>
              <Link to="/clients" className="text-xs text-primary hover:underline flex items-center gap-1">Voir tous <ArrowUpRight className="w-3 h-3" /></Link>
            </div>
            <div className="p-4 h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topClients} layout="vertical" margin={{ top: 5, right: 15, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.008 240)" horizontal={false} />
                  <XAxis type="number" fontSize={11} stroke="oklch(0.52 0.02 250)" tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
                  <YAxis type="category" dataKey="nom" fontSize={11} stroke="oklch(0.52 0.02 250)" width={80} />
                  <Tooltip formatter={(v: number) => formatXOF(v)} contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                  <Bar dataKey="ca" fill="oklch(0.52 0.14 250)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple/10 text-purple flex items-center justify-center shrink-0"><ListChecks className="w-4 h-4" /></div>
              <h2 className="text-sm font-semibold">Activité</h2>
            </div>
            <div className="p-4 space-y-3">
              <Stat icon={Users} label="Clients actifs" value={clients.length.toString()} tone="info" />
              <Stat icon={FileText} label="Devis en cours" value={devis.filter(d=>d.statut==="Envoyé"||d.statut==="Brouillon").length.toString()} tone="warning" />
              <Stat icon={Receipt} label="Factures impayées" value={ventes.filter(f=>f.statut!=="Payée").length.toString()} tone="danger" />
              <div className="pt-3 mt-3 border-t border-border">
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" /> Trésorerie nette</div>
                <div className={`text-xl font-semibold font-mono ${totalEncaisse - totalDecaisse >= 0 ? "text-success" : "text-destructive"}`}>{formatXOF(totalEncaisse - totalDecaisse)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"><Receipt className="w-4 h-4" /></div>
              <h2 className="text-sm font-semibold">Dernières factures</h2>
            </div>
            <Link to="/factures" className="text-xs text-primary hover:underline flex items-center gap-1">Tout voir <ArrowUpRight className="w-3 h-3" /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground bg-muted/40">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">N°</th>
                  <th className="text-left px-4 py-2 font-medium">Client</th>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-right px-4 py-2 font-medium">Montant TTC</th>
                  <th className="text-left px-4 py-2 font-medium">Statut</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {recentFactures.map((f) => {
                  const retard = f.statut === "En retard" || isEnRetard(f);
                  return (
                    <tr key={f.id} className={`border-t border-border hover:bg-muted/30 ${retard ? "bg-destructive/5" : ""}`}>
                      <td className={`px-4 py-2 font-mono text-xs ${retard ? "border-l-2 border-destructive" : ""}`}>{f.numero}</td>
                      <td className="px-4 py-2">{getClient(f.clientId)?.nom}</td>
                      <td className="px-4 py-2 text-muted-foreground">{f.date}</td>
                      <td className={`px-4 py-2 text-right font-mono ${retard ? "text-destructive font-semibold" : ""}`}>{formatXOF(computeTotals(f).montantTTC)}</td>
                      <td className="px-4 py-2"><StatutBadge statut={f.statut} /></td>
                      <td className="px-4 py-2"><button onClick={() => setDetail(f.id)} className="p-1.5 rounded-md hover:bg-muted" title="Visualiser"><Eye className="w-4 h-4 text-muted-foreground" /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {detailFacture && (
        <DocumentPreviewModal
          open={!!detailFacture}
          onClose={() => setDetail(null)}
          kind="facture"
          doc={detailFacture}
          client={getClient(detailFacture.clientId)}
          societe={db.societe}
          templates={db.templates}
          onTemplateChange={(templateId) => updateFacture(detailFacture.id, { templateId })}
        />
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: "info" | "warning" | "danger" }) {
  const bg = tone === "info" ? "bg-info/10 text-info" : tone === "warning" ? "bg-warning/15 text-[oklch(0.55_0.15_75)]" : "bg-destructive/10 text-destructive";
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${bg}`}><Icon className="w-3.5 h-3.5" /></div>
        <span className="text-muted-foreground">{label}</span>
      </div>
      <div className="text-sm font-semibold font-mono">{value}</div>
    </div>
  );
}
