import { createFileRoute } from "@tanstack/react-router";
import { Plus, Download, Filter, Printer } from "lucide-react";
import { PageHeader } from "../components/AppLayout";
import { StatutBadge } from "./index";
import { factures, formatXOF, getClient } from "../lib/mock-data";

export const Route = createFileRoute("/factures")({
  head: () => ({ meta: [{ title: "Factures — BF Logistic CRM" }] }),
  component: FacturesPage,
});

function FacturesPage() {
  const ventes = factures.filter((f) => f.type === "Vente");
  const achats = factures.filter((f) => f.type === "Achat");
  const totalVenteHT = ventes.reduce((s, f) => s + f.montantHT, 0);
  const totalVenteTVA = ventes.reduce((s, f) => s + f.tva, 0);
  const totalVenteTTC = ventes.reduce((s, f) => s + f.montantTTC, 0);
  const totalAchatTTC = achats.reduce((s, f) => s + f.montantTTC, 0);
  const totalGlobal = factures.reduce((s, f) => s + f.montantTTC, 0);
  const totalHT = factures.reduce((s, f) => s + f.montantHT, 0);
  const totalTVA = factures.reduce((s, f) => s + f.tva, 0);

  return (
    <div>
      <PageHeader
        title="Factures"
        description={`${factures.length} factures · Montant total ${formatXOF(totalGlobal)}`}
        actions={
          <>
            <button className="px-3 py-1.5 text-sm border border-border rounded-sm hover:bg-muted flex items-center gap-1.5">
              <Filter className="w-4 h-4" /> Filtrer
            </button>
            <button className="px-3 py-1.5 text-sm border border-border rounded-sm hover:bg-muted flex items-center gap-1.5">
              <Printer className="w-4 h-4" /> Imprimer
            </button>
            <button className="px-3 py-1.5 text-sm border border-border rounded-sm hover:bg-muted flex items-center gap-1.5">
              <Download className="w-4 h-4" /> Exporter
            </button>
            <button className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-sm hover:opacity-90 flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Nouvelle facture
            </button>
          </>
        }
      />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <SummaryCard label="Total facturé HT" value={formatXOF(totalVenteHT)} />
          <SummaryCard label="TVA collectée" value={formatXOF(totalVenteTVA)} />
          <SummaryCard label="Total ventes TTC" value={formatXOF(totalVenteTTC)} tone="primary" />
          <SummaryCard label="Total achats TTC" value={formatXOF(totalAchatTTC)} tone="destructive" />
        </div>

        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold">Journal des factures</h2>
            <div className="flex gap-1 text-xs">
              <span className="px-2 py-0.5 bg-primary text-primary-foreground rounded-sm">Tous</span>
              <span className="px-2 py-0.5 border border-border rounded-sm text-muted-foreground">Ventes</span>
              <span className="px-2 py-0.5 border border-border rounded-sm text-muted-foreground">Achats</span>
            </div>
          </div>
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
              </tr>
            </thead>
            <tbody>
              {factures.map((f) => (
                <tr key={f.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-mono text-xs">{f.numero}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[11px] px-2 py-0.5 rounded-sm border ${f.type === "Vente" ? "border-primary/40 text-primary" : "border-accent/40 text-accent"}`}>
                      {f.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{f.date}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{f.echeance}</td>
                  <td className="px-4 py-2.5">{getClient(f.clientId)?.nom}</td>
                  <td className="px-4 py-2.5 max-w-xs truncate">{f.objet}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{formatXOF(f.montantHT)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">{formatXOF(f.tva)}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold">{formatXOF(f.montantTTC)}</td>
                  <td className="px-4 py-2.5"><StatutBadge statut={f.statut} /></td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/60 border-t-2 border-border">
              <tr>
                <td colSpan={6} className="px-4 py-3 text-right text-xs uppercase tracking-wide font-semibold">Montant total (toutes factures)</td>
                <td className="px-4 py-3 text-right font-mono font-semibold">{formatXOF(totalHT)}</td>
                <td className="px-4 py-3 text-right font-mono font-semibold">{formatXOF(totalTVA)}</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-base">{formatXOF(totalGlobal)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone?: "primary" | "destructive" }) {
  const t = tone === "primary" ? "text-primary" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div className="bg-card border border-border rounded-sm p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-2 text-lg font-semibold font-mono ${t}`}>{value}</div>
    </div>
  );
}