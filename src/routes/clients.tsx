import { createFileRoute } from "@tanstack/react-router";
import { Plus, Download, Mail, Phone } from "lucide-react";
import { PageHeader } from "../components/AppLayout";
import { clients, formatXOF } from "../lib/mock-data";

export const Route = createFileRoute("/clients")({
  head: () => ({ meta: [{ title: "Clients — BF Logistic CRM" }] }),
  component: ClientsPage,
});

function ClientsPage() {
  const totalSolde = clients.reduce((s, c) => s + c.solde, 0);
  return (
    <div>
      <PageHeader
        title="Clients"
        description={`${clients.length} comptes clients · Encours total ${formatXOF(totalSolde)}`}
        actions={
          <>
            <button className="px-3 py-1.5 text-sm border border-border rounded-sm hover:bg-muted flex items-center gap-1.5">
              <Download className="w-4 h-4" /> Exporter
            </button>
            <button className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-sm hover:opacity-90 flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Nouveau client
            </button>
          </>
        }
      />
      <div className="p-6">
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">Code</th>
                <th className="text-left px-4 py-2.5 font-medium">Raison sociale</th>
                <th className="text-left px-4 py-2.5 font-medium">Contact</th>
                <th className="text-left px-4 py-2.5 font-medium">Coordonnées</th>
                <th className="text-left px-4 py-2.5 font-medium">Ville</th>
                <th className="text-right px-4 py-2.5 font-medium">Solde dû</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-mono text-xs">{c.code}</td>
                  <td className="px-4 py-2.5 font-medium">{c.nom}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{c.contact}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-col text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.telephone}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">{c.ville}, {c.pays}</td>
                  <td className={`px-4 py-2.5 text-right font-mono ${c.solde > 0 ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                    {formatXOF(c.solde)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/60 border-t-2 border-border">
              <tr>
                <td colSpan={5} className="px-4 py-2.5 text-right text-xs uppercase tracking-wide font-semibold">Total encours</td>
                <td className="px-4 py-2.5 text-right font-mono font-semibold">{formatXOF(totalSolde)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}