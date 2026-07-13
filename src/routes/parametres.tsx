import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Tag, Sliders, RotateCcw } from "lucide-react";
import { PageHeader } from "../components/AppLayout";
import { useStore } from "../lib/store";
import { Badge } from "../components/Badge";

export const Route = createFileRoute("/parametres")({
  head: () => ({ meta: [{ title: "Paramètres — BF Logistic CRM" }] }),
  component: Parametres,
});

function Parametres() {
  const { db, addAttribut, removeAttribut, reset } = useStore();
  const [nom, setNom] = useState("");
  const [type, setType] = useState<"texte" | "nombre" | "date">("texte");
  const [cible, setCible] = useState<"facture" | "devis" | "client">("facture");
  const [defaut, setDefaut] = useState("");

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;
    addAttribut({ nom, type, cible, defaut });
    setNom(""); setDefaut("");
  };

  return (
    <div>
      <PageHeader
        title="Paramètres"
        description="Configurez les attributs personnalisés qui s'appliqueront aux documents"
        actions={
          <button
            onClick={() => { if (confirm("Réinitialiser toutes les données de démo ?")) reset(); }}
            className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" /> Réinitialiser les données
          </button>
        }
      />
      <div className="p-6 grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-card border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2"><Tag className="w-4 h-4 text-purple" /> Attributs personnalisés</h2>
            <span className="text-xs text-muted-foreground">{db.attributs.length} attribut(s)</span>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">Nom</th>
                <th className="text-left px-4 py-2.5 font-medium">Type</th>
                <th className="text-left px-4 py-2.5 font-medium">Cible</th>
                <th className="text-left px-4 py-2.5 font-medium">Valeur par défaut</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {db.attributs.map((a) => (
                <tr key={a.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium">{a.nom}</td>
                  <td className="px-4 py-2.5"><Badge tone="info">{a.type}</Badge></td>
                  <td className="px-4 py-2.5"><Badge tone="purple">{a.cible}</Badge></td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{a.defaut || "—"}</td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => removeAttribut(a.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
              {db.attributs.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-sm text-muted-foreground">Aucun attribut défini</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Ajouter un attribut</h2>
          <form onSubmit={add} className="space-y-3">
            <div><label className="text-xs uppercase text-muted-foreground">Nom</label><input value={nom} onChange={(e) => setNom(e.target.value)} required className="input mt-1" placeholder="Ex: Numéro BL" /></div>
            <div><label className="text-xs uppercase text-muted-foreground">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as any)} className="input mt-1">
                <option value="texte">Texte</option><option value="nombre">Nombre</option><option value="date">Date</option>
              </select>
            </div>
            <div><label className="text-xs uppercase text-muted-foreground">S'applique à</label>
              <select value={cible} onChange={(e) => setCible(e.target.value as any)} className="input mt-1">
                <option value="facture">Factures</option><option value="devis">Devis</option><option value="client">Clients</option>
              </select>
            </div>
            <div><label className="text-xs uppercase text-muted-foreground">Valeur par défaut</label><input value={defaut} onChange={(e) => setDefaut(e.target.value)} className="input mt-1" /></div>
            <button type="submit" className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm hover:opacity-90 flex items-center justify-center gap-1.5">
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          </form>
        </div>

        <div className="col-span-3 bg-card border border-border rounded-lg p-4">
          <h2 className="text-sm font-semibold mb-2 flex items-center gap-2"><Sliders className="w-4 h-4 text-info" /> À propos</h2>
          <p className="text-sm text-muted-foreground">
            Les données sont stockées localement au format JSON (localStorage) — aucune connexion à une base externe.
            Les attributs personnalisés apparaissent automatiquement dans l'onglet « Attributs » lors de la création d'une facture.
          </p>
        </div>
      </div>
    </div>
  );
}