import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import * as repo from "./db-repo";
import { factureFromDevis, generateNumero } from "./documents";
import type { AttributDef, Client, Devis, Ecriture, Facture, Societe, TemplateDef } from "./types";

export type { AttributDef };

export type DBState = {
  clients: Client[];
  devis: Devis[];
  factures: Facture[];
  ecritures: Ecriture[];
  attributs: AttributDef[];
  societe: Societe;
  templates: TemplateDef[];
};

const EMPTY_SOCIETE: Societe = {
  raisonSociale: "",
  formeJuridique: "",
  adresse: "",
  ville: "",
  pays: "",
  telephone: "",
  whatsapp: "",
  email: "",
  siteWeb: "",
  ninea: "",
  rccm: "",
  regimeFiscal: "Réel Normal",
  tauxTVA: 18,
  banque: "",
  iban: "",
  logoDataUrl: "",
  piedPageMentions: "",
  templateParDefautId: "classique",
};

const EMPTY_STATE: DBState = {
  clients: [],
  devis: [],
  factures: [],
  ecritures: [],
  attributs: [],
  societe: EMPTY_SOCIETE,
  templates: [],
};

type Ctx = {
  db: DBState;
  loading: boolean;
  error: string | null;
  reload: () => void;
  addFacture: (f: Omit<Facture, "id">) => Promise<void>;
  updateFacture: (id: string, patch: Partial<Facture>) => Promise<void>;
  importFactures: (rows: Omit<Facture, "id">[]) => Promise<void>;
  addDevis: (d: Omit<Devis, "id">) => Promise<void>;
  updateDevis: (id: string, patch: Partial<Devis>) => Promise<void>;
  importDevis: (rows: Omit<Devis, "id">[]) => Promise<void>;
  convertDevisToFacture: (devisId: string) => Promise<void>;
  addClient: (c: Omit<Client, "id">) => Promise<void>;
  importClients: (rows: Omit<Client, "id">[]) => Promise<void>;
  addEcriture: (e: Omit<Ecriture, "id">) => Promise<void>;
  importEcritures: (rows: Omit<Ecriture, "id">[]) => Promise<void>;
  addAttribut: (a: Omit<AttributDef, "id">) => Promise<void>;
  removeAttribut: (id: string) => Promise<void>;
  addTemplate: (t: Omit<TemplateDef, "id" | "builtin">) => Promise<void>;
  importTemplates: (rows: Omit<TemplateDef, "id" | "builtin">[]) => Promise<void>;
  removeTemplate: (id: string) => Promise<void>;
  updateSociete: (patch: Partial<Societe>) => Promise<void>;
};

const StoreCtx = createContext<Ctx | null>(null);

function onError(action: string) {
  return (err: unknown) => {
    console.error(action, err);
    toast.error(`${action} : échec. Vérifiez votre connexion.`);
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DBState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    repo
      .fetchAllData()
      .then(setDb)
      .catch((err: unknown) => {
        console.error(err);
        setError("Impossible de charger les données depuis Supabase.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const value = useMemo<Ctx>(() => ({
    db,
    loading,
    error,
    reload: load,

    addFacture: (f) => repo.insertFacture(f)
      .then((nf) => setDb((s) => ({ ...s, factures: [nf, ...s.factures] })))
      .catch(onError("Création de la facture")),

    updateFacture: (id, patch) => repo.updateFacture(id, patch)
      .then((nf) => setDb((s) => ({ ...s, factures: s.factures.map((f) => (f.id === id ? nf : f)) })))
      .catch(onError("Mise à jour de la facture")),

    importFactures: (rows) => repo.insertManyFactures(rows)
      .then((created) => setDb((s) => ({ ...s, factures: [...created, ...s.factures] })))
      .catch(onError("Import des factures")),

    addDevis: (d) => repo.insertDevis(d)
      .then((nd) => setDb((s) => ({ ...s, devis: [nd, ...s.devis] })))
      .catch(onError("Création du devis")),

    updateDevis: (id, patch) => repo.updateDevis(id, patch)
      .then((nd) => setDb((s) => ({ ...s, devis: s.devis.map((d) => (d.id === id ? nd : d)) })))
      .catch(onError("Mise à jour du devis")),

    importDevis: (rows) => repo.insertManyDevis(rows)
      .then((created) => setDb((s) => ({ ...s, devis: [...created, ...s.devis] })))
      .catch(onError("Import des devis")),

    convertDevisToFacture: async (devisId) => {
      const d = db.devis.find((x) => x.id === devisId);
      if (!d) return;
      try {
        const seq = db.factures.filter((f) => f.type === "Vente").length + 1;
        const numero = generateNumero("FAC", seq);
        const nf = await repo.insertFacture(factureFromDevis(d, numero));
        const updatedDevis = await repo.updateDevis(devisId, { statut: "Accepté" });
        setDb((s) => ({
          ...s,
          factures: [nf, ...s.factures],
          devis: s.devis.map((x) => (x.id === devisId ? updatedDevis : x)),
        }));
      } catch (err) {
        onError("Conversion du devis en facture")(err);
      }
    },

    addClient: (c) => repo.insertClient(c)
      .then((nc) => setDb((s) => ({ ...s, clients: [nc, ...s.clients] })))
      .catch(onError("Création du client")),

    importClients: (rows) => repo.insertClients(rows)
      .then((created) => setDb((s) => ({ ...s, clients: [...created, ...s.clients] })))
      .catch(onError("Import des clients")),

    addEcriture: (e) => repo.insertEcriture(e)
      .then((ne) => setDb((s) => ({ ...s, ecritures: [ne, ...s.ecritures] })))
      .catch(onError("Création de l'écriture")),

    importEcritures: (rows) => repo.insertEcritures(rows)
      .then((created) => setDb((s) => ({ ...s, ecritures: [...created, ...s.ecritures] })))
      .catch(onError("Import des écritures")),

    addAttribut: (a) => repo.insertAttribut(a)
      .then((na) => setDb((s) => ({ ...s, attributs: [...s.attributs, na] })))
      .catch(onError("Création de l'attribut")),

    removeAttribut: (id) => repo.deleteAttribut(id)
      .then(() => setDb((s) => ({ ...s, attributs: s.attributs.filter((a) => a.id !== id) })))
      .catch(onError("Suppression de l'attribut")),

    addTemplate: (t) => repo.insertTemplate(t)
      .then((nt) => setDb((s) => ({ ...s, templates: [...s.templates, nt] })))
      .catch(onError("Création du modèle")),

    importTemplates: (rows) => repo.insertTemplates(rows)
      .then((created) => setDb((s) => ({ ...s, templates: [...s.templates, ...created] })))
      .catch(onError("Import des modèles")),

    removeTemplate: (id) => repo.deleteTemplate(id)
      .then(() => setDb((s) => ({
        ...s,
        templates: s.templates.filter((t) => t.id !== id),
        societe: s.societe.templateParDefautId === id
          ? { ...s.societe, templateParDefautId: s.templates.find((t) => t.id !== id)?.id ?? "classique" }
          : s.societe,
      })))
      .catch(onError("Suppression du modèle")),

    updateSociete: (patch) => repo.updateSociete(patch)
      .then((ns) => setDb((s) => ({ ...s, societe: ns })))
      .catch(onError("Mise à jour du profil société")),
  }), [db, loading, error, load]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function useClient(id: string | undefined) {
  const { db } = useStore();
  return id ? db.clients.find((c) => c.id === id) : undefined;
}
