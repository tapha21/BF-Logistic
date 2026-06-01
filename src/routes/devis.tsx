import { createFileRoute } from "@tanstack/react-router";
import { Plus, Download, FileText } from "lucide-react";
import { PageHeader } from "../components/AppLayout";
import { StatutBadge } from "./index";
import { devis, formatXOF, getClient } from "../lib/mock-data";

export const Route = createFileRoute("/devis")({
  head: () => ({ meta: [{ title: "Devis — BF Logistic CRM" }] }),
  component: DevisPage,
});

function DevisPage() {
  const total = devis.reduce((s, d) => s + d.montantTTC, 0);
  const acceptes = devis.filter((d) => d.statut === "Accepté").reduce((s, d) => s + d.montantTTC, 0);
  return (
    <div>
      <PageHeader
        title="Devis"
        description={`${devis.length} devis · ${formatXOF(acceptes)} acceptés`}
        actions={
          <>
            <button className="px-3 py-1.5 text-sm border border-border rounded-sm hover:bg-muted flex items-center gap-1.5">
              <Download className="w-4 h-4" /> Exporter
            </button>
            <button className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-sm hover:opacity-90 flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Nouveau devis
            </button>
          </>
        }
      />
      <div className="p-6">
        <div className="bg-card border border-border rounded-sm overflow-hidden">
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
              </tr>
            </thead>
            <tbody>
              {devis.map((d) => (
                <tr key={d.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-mono text-xs">
                    <span className="inline-flex items-center gap-1.5"><FileText className="w-3 h-3 text-muted-foreground" />{d.numero}</span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{d.date}</td>
                  <td className="px-4 py-2.5">{getClient(d.clientId)?.nom}</td>
                  <td className="px-4 py-2.5 max-w-xs truncate">{d.objet}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{formatXOF(d.montantHT)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">{formatXOF(d.tva)}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold">{formatXOF(d.montantTTC)}</td>
                  <td className="px-4 py-2.5"><StatutBadge statut={d.statut} /></td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/60 border-t-2 border-border">
              <tr>
                <td colSpan={6} className="px-4 py-2.5 text-right text-xs uppercase tracking-wide font-semibold">Total TTC</td>
                <td className="px-4 py-2.5 text-right font-mono font-semibold">{formatXOF(total)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}