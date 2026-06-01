import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  TrendingUp,
  TrendingDown,
  Receipt,
  Users,
  FileText,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "../components/AppLayout";
import { clients, devis, factures, ecritures, formatXOF, getClient } from "../lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — BF Logistic CRM" },
      { name: "description", content: "Vue d'ensemble de l'activité transitaire." },
    ],
  }),
  component: Index,
});

function Index() {
  const totalFactures = factures.filter((f) => f.type === "Vente").reduce((s, f) => s + f.montantTTC, 0);
  const totalEncaisse = ecritures.filter((e) => e.type === "Entrée").reduce((s, e) => s + e.montant, 0);
  const totalDecaisse = ecritures.filter((e) => e.type === "Sortie").reduce((s, e) => s + e.montant, 0);
  const enAttente = factures.filter((f) => f.statut === "En attente" || f.statut === "Partiellement payée").reduce((s, f) => s + f.montantTTC, 0);
  const enRetard = factures.filter((f) => f.statut === "En retard");

  const recentFactures = [...factures].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble — Exercice 2026"
      />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <KpiCard label="Chiffre d'affaires facturé" value={formatXOF(totalFactures)} sub={`${factures.filter(f=>f.type==="Vente").length} factures émises`} icon={Receipt} />
          <KpiCard label="Encaissements" value={formatXOF(totalEncaisse)} sub="Mois en cours" icon={TrendingUp} tone="success" />
          <KpiCard label="Décaissements" value={formatXOF(totalDecaisse)} sub="Mois en cours" icon={TrendingDown} tone="destructive" />
          <KpiCard label="En attente de règlement" value={formatXOF(enAttente)} sub={`${enRetard.length} factures en retard`} icon={AlertCircle} tone="warning" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-card border border-border rounded-sm">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold">Dernières factures</h2>
              <Link to="/factures" className="text-xs text-accent hover:underline">Tout voir</Link>
            </div>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground bg-muted/40">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">N°</th>
                  <th className="text-left px-4 py-2 font-medium">Client</th>
                  <th className="text-right px-4 py-2 font-medium">Montant TTC</th>
                  <th className="text-left px-4 py-2 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentFactures.map((f) => (
                  <tr key={f.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2 font-mono text-xs">{f.numero}</td>
                    <td className="px-4 py-2">{getClient(f.clientId)?.nom}</td>
                    <td className="px-4 py-2 text-right font-mono">{formatXOF(f.montantTTC)}</td>
                    <td className="px-4 py-2"><StatutBadge statut={f.statut} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-card border border-border rounded-sm">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold">Activité</h2>
            </div>
            <div className="p-4 space-y-3">
              <Stat icon={Users} label="Clients actifs" value={clients.length.toString()} />
              <Stat icon={FileText} label="Devis en cours" value={devis.filter(d=>d.statut==="Envoyé"||d.statut==="Brouillon").length.toString()} />
              <Stat icon={Receipt} label="Factures impayées" value={factures.filter(f=>f.statut!=="Payée"&&f.type==="Vente").length.toString()} />
              <div className="pt-3 mt-3 border-t border-border">
                <div className="text-xs text-muted-foreground mb-1">Trésorerie nette</div>
                <div className="text-xl font-semibold font-mono">{formatXOF(totalEncaisse - totalDecaisse)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label, value, sub, icon: Icon, tone,
}: {
  label: string; value: string; sub: string; icon: any;
  tone?: "success" | "destructive" | "warning";
}) {
  const toneClass =
    tone === "success" ? "text-success" :
    tone === "destructive" ? "text-destructive" :
    tone === "warning" ? "text-warning" : "text-primary";
  return (
    <div className="bg-card border border-border rounded-sm p-4">
      <div className="flex items-start justify-between">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <Icon className={`w-4 h-4 ${toneClass}`} />
      </div>
      <div className="mt-2 text-xl font-semibold font-mono">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="w-4 h-4" /> {label}
      </div>
      <div className="text-sm font-semibold font-mono">{value}</div>
    </div>
  );
}

export function StatutBadge({ statut }: { statut: string }) {
  const map: Record<string, string> = {
    "Payée": "bg-success/15 text-success border-success/30",
    "En attente": "bg-warning/15 text-warning border-warning/40",
    "Partiellement payée": "bg-warning/15 text-warning border-warning/40",
    "En retard": "bg-destructive/15 text-destructive border-destructive/40",
    "Brouillon": "bg-muted text-muted-foreground border-border",
    "Envoyé": "bg-primary/10 text-primary border-primary/30",
    "Accepté": "bg-success/15 text-success border-success/30",
    "Refusé": "bg-destructive/15 text-destructive border-destructive/40",
  };
  return (
    <span className={`inline-block text-[11px] px-2 py-0.5 rounded-sm border ${map[statut] ?? "bg-muted border-border"}`}>
      {statut}
    </span>
  );
}
