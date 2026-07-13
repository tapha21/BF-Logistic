import { Plus, Trash2 } from "lucide-react";
import type { LigneDocument, Unite } from "../../lib/types";
import { ligneMontantHT, newLigne } from "../../lib/documents";
import { formatXOF } from "../../lib/mock-data";

const UNITES: Unite[] = ["Forfait", "Conteneur", "Kg", "Tonne", "M³", "Colis", "Heure", "Jour"];

export function LineItemsEditor({ lignes, onChange }: { lignes: LigneDocument[]; onChange: (lignes: LigneDocument[]) => void }) {
  const update = (id: string, patch: Partial<LigneDocument>) => {
    onChange(lignes.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };
  const remove = (id: string) => onChange(lignes.filter((l) => l.id !== id));
  const add = () => onChange([...lignes, newLigne()]);
  const total = lignes.reduce((s, l) => s + ligneMontantHT(l), 0);

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="text-xs uppercase tracking-wide text-muted-foreground bg-muted/40">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Désignation</th>
              <th className="text-right px-3 py-2 font-medium w-20">Qté</th>
              <th className="text-left px-3 py-2 font-medium w-28">Unité</th>
              <th className="text-right px-3 py-2 font-medium w-32">P.U. (FCFA)</th>
              <th className="text-right px-3 py-2 font-medium w-20">Remise %</th>
              <th className="text-right px-3 py-2 font-medium w-32">Montant HT</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((l) => (
              <tr key={l.id} className="border-t border-border">
                <td className="px-3 py-1.5">
                  <input value={l.designation} onChange={(e) => update(l.id, { designation: e.target.value })} className="input" placeholder="Désignation de la prestation" />
                </td>
                <td className="px-3 py-1.5">
                  <input type="number" min={0} value={l.quantite} onChange={(e) => update(l.id, { quantite: Number(e.target.value) })} className="input text-right" />
                </td>
                <td className="px-3 py-1.5">
                  <select value={l.unite} onChange={(e) => update(l.id, { unite: e.target.value as Unite })} className="input">
                    {UNITES.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </td>
                <td className="px-3 py-1.5">
                  <input type="number" min={0} value={l.prixUnitaire} onChange={(e) => update(l.id, { prixUnitaire: Number(e.target.value) })} className="input text-right" />
                </td>
                <td className="px-3 py-1.5">
                  <input type="number" min={0} max={100} value={l.remisePct} onChange={(e) => update(l.id, { remisePct: Number(e.target.value) })} className="input text-right" />
                </td>
                <td className="px-3 py-1.5 text-right font-mono text-sm">{formatXOF(ligneMontantHT(l))}</td>
                <td className="px-3 py-1.5">
                  <button type="button" onClick={() => remove(l.id)} disabled={lignes.length <= 1} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive disabled:opacity-30">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-muted/30 border-t border-border">
            <tr>
              <td colSpan={5} className="px-3 py-2 text-right text-xs uppercase tracking-wide font-semibold text-muted-foreground">Total HT lignes</td>
              <td className="px-3 py-2 text-right font-mono font-semibold">{formatXOF(total)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="px-3 py-2 border-t border-border bg-background">
        <button type="button" onClick={add} className="text-sm text-primary hover:underline flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Ajouter une ligne
        </button>
      </div>
    </div>
  );
}
