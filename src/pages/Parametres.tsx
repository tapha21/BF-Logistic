import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Tag, Sliders, RotateCcw, Building2, Image as ImageIcon, Check, Landmark, Upload, Download } from "lucide-react";
import { PageHeader } from "../components/AppLayout";
import { useStore } from "../lib/store";
import { Badge } from "../components/Badge";
import { SKIN_OPTIONS, type Cible } from "../lib/types";
import { DocumentTemplate } from "../components/documents/DocumentTemplate";
import { Modal } from "../components/Modal";
import { ImportDialog } from "../components/ImportDialog";
import { templatesToJson, jsonToTemplates } from "../lib/importExport";
import { downloadTextFile } from "../lib/csv";

const CIBLE_LABELS: Record<Cible, string> = { devis: "Devis", facture: "Facture", client: "Client" };

export function Parametres() {
  useEffect(() => { document.title = "Paramètres — BF Logistic CRM"; }, []);
  const { db, addAttribut, removeAttribut, addTemplate, importTemplates, removeTemplate, reset, updateSociete } = useStore();
  const [nom, setNom] = useState("");
  const [type, setType] = useState<"texte" | "nombre" | "date">("texte");
  const [cibles, setCibles] = useState<Cible[]>(["facture", "devis"]);
  const [defaut, setDefaut] = useState("");
  const [templateFormOpen, setTemplateFormOpen] = useState(false);
  const [templateImportOpen, setTemplateImportOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleCible = (c: Cible) => {
    setCibles((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || cibles.length === 0) return;
    addAttribut({ nom, type, cibles, defaut });
    setNom(""); setDefaut(""); setCibles(["facture", "devis"]);
  };

  const sampleDoc = db.devis[0] ?? db.factures[0];
  const sampleKind: "devis" | "facture" = db.devis[0] ? "devis" : "facture";
  const sampleClient = sampleDoc ? db.clients.find((c) => c.id === sampleDoc.clientId) : undefined;

  const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateSociete({ logoDataUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <PageHeader
        title="Paramètres"
        description="Profil de votre entreprise, modèles de documents et attributs personnalisés"
        icon={Sliders}
        actions={
          <button
            onClick={() => { if (confirm("Réinitialiser toutes les données de démo ?")) reset(); }}
            className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" /> Réinitialiser les données
          </button>
        }
      />
      <div className="p-4 sm:p-6 space-y-6">
        {/* Société */}
        <div className="bg-card border border-border rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /> Mon entreprise</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Ces informations apparaissent sur tous vos devis et factures.</p>
          </div>
          <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SField label="Raison sociale"><input value={db.societe.raisonSociale} onChange={(e) => updateSociete({ raisonSociale: e.target.value })} className="input" /></SField>
              <SField label="Forme juridique"><input value={db.societe.formeJuridique} onChange={(e) => updateSociete({ formeJuridique: e.target.value })} className="input" /></SField>
              <SField label="Adresse" full><input value={db.societe.adresse} onChange={(e) => updateSociete({ adresse: e.target.value })} className="input" /></SField>
              <SField label="Ville"><input value={db.societe.ville} onChange={(e) => updateSociete({ ville: e.target.value })} className="input" /></SField>
              <SField label="Pays"><input value={db.societe.pays} onChange={(e) => updateSociete({ pays: e.target.value })} className="input" /></SField>
              <SField label="Téléphone"><input value={db.societe.telephone} onChange={(e) => updateSociete({ telephone: e.target.value })} className="input" /></SField>
              <SField label="WhatsApp"><input value={db.societe.whatsapp} onChange={(e) => updateSociete({ whatsapp: e.target.value })} className="input" /></SField>
              <SField label="Email"><input value={db.societe.email} onChange={(e) => updateSociete({ email: e.target.value })} className="input" /></SField>
              <SField label="Site web"><input value={db.societe.siteWeb} onChange={(e) => updateSociete({ siteWeb: e.target.value })} className="input" /></SField>
              <SField label="NINEA"><input value={db.societe.ninea} onChange={(e) => updateSociete({ ninea: e.target.value })} className="input" /></SField>
              <SField label="RCCM"><input value={db.societe.rccm} onChange={(e) => updateSociete({ rccm: e.target.value })} className="input" /></SField>
              <SField label="Régime fiscal">
                <select value={db.societe.regimeFiscal} onChange={(e) => updateSociete({ regimeFiscal: e.target.value as any })} className="input">
                  <option>Réel Normal</option><option>Réel Simplifié</option><option>Synthétique (CGU)</option>
                </select>
              </SField>
              <SField label="Taux TVA par défaut (%)"><input type="number" value={db.societe.tauxTVA} onChange={(e) => updateSociete({ tauxTVA: Number(e.target.value) })} className="input" /></SField>
              <SField label="Banque"><input value={db.societe.banque} onChange={(e) => updateSociete({ banque: e.target.value })} className="input" /></SField>
              <SField label="IBAN"><input value={db.societe.iban} onChange={(e) => updateSociete({ iban: e.target.value })} className="input font-mono text-xs" /></SField>
              <SField label="Mentions pied de page" full><textarea value={db.societe.piedPageMentions} onChange={(e) => updateSociete({ piedPageMentions: e.target.value })} className="input min-h-[70px]" /></SField>
            </div>
            <div className="space-y-3">
              <div className="text-xs uppercase text-muted-foreground font-medium">Logo</div>
              <div className="border border-dashed border-border rounded-xl p-4 flex flex-col items-center gap-3">
                {db.societe.logoDataUrl ? (
                  <img src={db.societe.logoDataUrl} alt="Logo" className="w-24 h-24 object-contain rounded-md bg-muted/30" />
                ) : (
                  <div className="w-24 h-24 rounded-md bg-muted/30 flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={onLogoChange} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs px-3 py-1.5 border border-border rounded-md hover:bg-muted">
                  Choisir une image
                </button>
                {db.societe.logoDataUrl && (
                  <button type="button" onClick={() => updateSociete({ logoDataUrl: "" })} className="text-xs text-destructive hover:underline">Retirer le logo</button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modèles de documents */}
        <div className="bg-card border border-border rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-border flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold flex items-center gap-2"><Landmark className="w-4 h-4 text-purple" /> Modèles de documents</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Le modèle par défaut s'applique automatiquement aux nouveaux devis et factures.</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setTemplateImportOpen(true)} className="px-2.5 py-1.5 text-xs border border-border rounded-md hover:bg-muted flex items-center gap-1.5"><Upload className="w-3.5 h-3.5" /> Importer</button>
              <button onClick={() => downloadTextFile("modeles.json", templatesToJson(db.templates), "application/json")} className="px-2.5 py-1.5 text-xs border border-border rounded-md hover:bg-muted flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Exporter</button>
              <button onClick={() => setTemplateFormOpen(true)} className="px-2.5 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:opacity-90 flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Ajouter</button>
            </div>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {db.templates.map((t) => {
              const isDefault = db.societe.templateParDefautId === t.id;
              return (
                <div
                  key={t.id}
                  className={`text-left rounded-xl border-2 overflow-hidden transition-all relative group ${isDefault ? "border-primary shadow-md" : "border-border hover:border-primary/40"}`}
                >
                  <button type="button" onClick={() => updateSociete({ templateParDefautId: t.id })} className="w-full text-left">
                    <div className="h-40 bg-muted/40 overflow-hidden relative flex items-start justify-center">
                      {sampleDoc && (
                        <div style={{ transform: "scale(0.19)", transformOrigin: "top center", width: "210mm" }} className="pointer-events-none mt-1">
                          <DocumentTemplate doc={{ ...sampleDoc, kind: sampleKind }} client={sampleClient} societe={db.societe} skinId={t.skin} />
                        </div>
                      )}
                      {isDefault && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-border bg-card">
                      <div className="text-sm font-medium flex items-center gap-1.5">{t.nom} {!t.builtin && <Badge tone="purple">Perso</Badge>}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{t.description}</div>
                    </div>
                  </button>
                  {!t.builtin && (
                    <button
                      type="button"
                      onClick={() => { if (confirm(`Supprimer le modèle « ${t.nom} » ?`)) removeTemplate(t.id); }}
                      className="absolute top-2 left-2 p-1.5 rounded-md bg-card/90 border border-border text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Attributs personnalisés */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2"><Tag className="w-4 h-4 text-purple" /> Attributs personnalisés</h2>
              <span className="text-xs text-muted-foreground">{db.attributs.length} attribut(s)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead className="text-xs uppercase tracking-wide text-muted-foreground bg-muted/40">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium">Nom</th>
                    <th className="text-left px-4 py-2.5 font-medium">Type</th>
                    <th className="text-left px-4 py-2.5 font-medium">S'applique à</th>
                    <th className="text-left px-4 py-2.5 font-medium">Valeur par défaut</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {db.attributs.map((a) => (
                    <tr key={a.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-2.5 font-medium">{a.nom}</td>
                      <td className="px-4 py-2.5"><Badge tone="info">{a.type}</Badge></td>
                      <td className="px-4 py-2.5"><div className="flex gap-1 flex-wrap">{a.cibles.map((c) => <Badge key={c} tone="purple">{CIBLE_LABELS[c]}</Badge>)}</div></td>
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
          </div>

          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Ajouter un attribut</h2>
            <form onSubmit={add} className="space-y-3">
              <div><label className="text-xs uppercase text-muted-foreground">Nom</label><input value={nom} onChange={(e) => setNom(e.target.value)} required className="input mt-1" placeholder="Ex: Agent portuaire" /></div>
              <div><label className="text-xs uppercase text-muted-foreground">Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as any)} className="input mt-1">
                  <option value="texte">Texte</option><option value="nombre">Nombre</option><option value="date">Date</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase text-muted-foreground">S'applique à</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {(["devis", "facture", "client"] as Cible[]).map((c) => (
                    <label key={c} className={`text-xs px-2.5 py-1.5 rounded-md border cursor-pointer flex items-center gap-1.5 ${cibles.includes(c) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>
                      <input type="checkbox" checked={cibles.includes(c)} onChange={() => toggleCible(c)} className="hidden" />
                      {CIBLE_LABELS[c]}
                    </label>
                  ))}
                </div>
              </div>
              <div><label className="text-xs uppercase text-muted-foreground">Valeur par défaut</label><input value={defaut} onChange={(e) => setDefaut(e.target.value)} className="input mt-1" /></div>
              <button type="submit" disabled={cibles.length === 0} className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1.5">
                <Plus className="w-4 h-4" /> Ajouter
              </button>
            </form>
          </div>

          <div className="lg:col-span-3 bg-card border border-border rounded-xl p-4 shadow-sm">
            <h2 className="text-sm font-semibold mb-2 flex items-center gap-2"><Sliders className="w-4 h-4 text-info" /> À propos</h2>
            <p className="text-sm text-muted-foreground">
              Les données sont stockées localement au format JSON (localStorage) — aucune connexion à une base externe.
              Un attribut personnalisé peut s'appliquer à la fois aux devis et aux factures : il apparaîtra automatiquement dans l'onglet « Attributs » lors de leur création.
            </p>
          </div>
        </div>
      </div>

      <TemplateCreate open={templateFormOpen} onClose={() => setTemplateFormOpen(false)} onSave={(t) => { addTemplate(t); setTemplateFormOpen(false); }} />
      <ImportDialog
        open={templateImportOpen}
        onClose={() => setTemplateImportOpen(false)}
        title="Importer des modèles (JSON)"
        hint={'Fichier JSON : tableau d\'objets { "nom", "description", "skin" } où skin vaut classique, moderne ou senegal-export.'}
        accept=".json,application/json"
        fileLabel="un fichier JSON"
        roundtripNote="Le fichier exporté depuis cette page peut être ré-importé tel quel."
        parse={jsonToTemplates}
        onImport={importTemplates}
      />
    </div>
  );
}

function TemplateCreate({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (t: { nom: string; description: string; skin: any }) => void }) {
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [skin, setSkin] = useState(SKIN_OPTIONS[0].id);

  useEffect(() => { if (open) { setNom(""); setDescription(""); setSkin(SKIN_OPTIONS[0].id); } }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;
    onSave({ nom, description, skin });
  };

  return (
    <Modal open={open} onClose={onClose} title="Ajouter un modèle" size="md">
      <form onSubmit={submit} className="p-5 space-y-4">
        <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Nom du modèle</label><input required value={nom} onChange={(e) => setNom(e.target.value)} className="input" placeholder="Ex: Export Europe" /></div>
        <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Description</label><input value={description} onChange={(e) => setDescription(e.target.value)} className="input" placeholder="Ex: Mise en page dédiée aux clients européens" /></div>
        <div className="space-y-1">
          <label className="text-xs uppercase text-muted-foreground">Habillage visuel de base</label>
          <select value={skin} onChange={(e) => setSkin(e.target.value as any)} className="input">
            {SKIN_OPTIONS.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted">Annuler</button>
          <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90">Ajouter le modèle</button>
        </div>
      </form>
    </Modal>
  );
}

function SField({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={`space-y-1 ${full ? "sm:col-span-2" : ""}`}>
      <label className="text-xs uppercase text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
