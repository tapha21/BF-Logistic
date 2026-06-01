import { createFileRoute } from "@tanstack/react-router";
import { Download, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { PageHeader } from "../components/AppLayout";
import { ecritures, formatXOF } from "../lib/mock-data";

export const Route = createFileRoute("/comptabilite")({
  head: () => ({ meta: [{ title: "Comptabilité — BF Logistic CRM" }] }),
  component: ComptaPage,
});

function ComptaPage() {
  const entrees = ecritures.filter((e) => e.type === "Entrée");
  const sorties = ecritures.filter((e) => e.type === "Sortie");
  const totalE = entrees.reduce((s, e) => s + e.montant, 0);
  const totalS = sorties.reduce((s, e) => s + e.montant, 0);
  const solde = totalE - totalS;

  const byCategorie = sorties.reduce<Record<string, number>>((acc, e) => {
    acc[e.categorie] = (acc[e.categorie] ?? 0) + e.montant;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Comptabilité"
        description="Journal des entrées et sorties — Mai 2026"
        actions={
          <button className="px-3 py-1.5 text-sm border border-border rounded-sm hover:bg-muted flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Exporter le grand livre
          </button>
        }
      />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <BalanceCard label="Total entrées" value={formatXOF(totalE)} icon={TrendingUp} tone="success" />
          <BalanceCard label="Total sorties" value={formatXOF(totalS)} icon={TrendingDown} tone="destructive" />
          <BalanceCard label="Solde net" value={formatXOF(solde)} icon={Wallet} tone={solde >= 0 ? "success" : "destructive"} />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-card border border-border rounded-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold">Journal des écritures</h2>
            </div>
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
                {ecritures.map((e) => (
                  <tr key={e.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2.5 text-muted-foreground">{e.date}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{e.reference}</td>
                    <td className="px-4 py-2.5">{e.libelle}</td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">{e.categorie}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-destructive">
                      {e.type === "Sortie" ? formatXOF(e.montant) : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-success">
                      {e.type === "Entrée" ? formatXOF(e.montant) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/60 border-t-2 border-border">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right text-xs uppercase tracking-wide font-semibold">Totaux</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-destructive">{formatXOF(totalS)}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-success">{formatXOF(totalE)}</td>
                </tr>
                <tr className="border-t border-border">
                  <td colSpan={4} className="px-4 py-3 text-right text-xs uppercase tracking-wide font-semibold">Solde</td>
                  <td colSpan={2} className={`px-4 py-3 text-right font-mono font-bold text-base ${solde >= 0 ? "text-success" : "text-destructive"}`}>
                    {formatXOF(solde)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="bg-card border border-border rounded-sm">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold">Répartition des charges</h2>
            </div>
            <div className="p-4 space-y-3">
              {Object.entries(byCategorie)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, montant]) => {
                  const pct = (montant / totalS) * 100;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm">
                        <span>{cat}</span>
                        <span className="font-mono text-xs text-muted-foreground">{formatXOF(montant)}</span>
                      </div>
                      <div className="mt-1 h-1.5 bg-muted rounded-sm overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BalanceCard({ label, value, icon: Icon, tone }: { label: string; value: string; icon: any; tone: "success" | "destructive" }) {
  const t = tone === "success" ? "text-success" : "text-destructive";
  return (
    <div className="bg-card border border-border rounded-sm p-4">
      <div className="flex items-start justify-between">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <Icon className={`w-4 h-4 ${t}`} />
      </div>
      <div className={`mt-2 text-xl font-semibold font-mono ${t}`}>{value}</div>
    </div>
  );
}