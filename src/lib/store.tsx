import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  clients as seedClients,
  devis as seedDevis,
  factures as seedFactures,
  ecritures as seedEcritures,
  seedSociete,
  seedTemplates,
} from "./mock-data";
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

const seedAttributs: AttributDef[] = [
  { id: "A1", nom: "Numéro BL", type: "texte", cibles: ["facture"], defaut: "" },
  { id: "A2", nom: "Agent portuaire", type: "texte", cibles: ["facture", "devis"], defaut: "" },
];

const KEY = "bf-logistic-db-v3";

function seedState(): DBState {
  return {
    clients: seedClients,
    devis: seedDevis,
    factures: seedFactures,
    ecritures: seedEcritures,
    attributs: seedAttributs,
    societe: seedSociete,
    templates: seedTemplates,
  };
}

function loadInitial(): DBState {
  if (typeof window === "undefined") return seedState();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { ...seedState(), ...(JSON.parse(raw) as DBState) };
  } catch {}
  const initial = seedState();
  window.localStorage.setItem(KEY, JSON.stringify(initial));
  return initial;
}

type Ctx = {
  db: DBState;
  addFacture: (f: Omit<Facture, "id">) => void;
  updateFacture: (id: string, patch: Partial<Facture>) => void;
  importFactures: (rows: Omit<Facture, "id">[]) => void;
  addDevis: (d: Omit<Devis, "id">) => void;
  updateDevis: (id: string, patch: Partial<Devis>) => void;
  importDevis: (rows: Omit<Devis, "id">[]) => void;
  convertDevisToFacture: (devisId: string) => void;
  addClient: (c: Omit<Client, "id">) => void;
  importClients: (rows: Omit<Client, "id">[]) => void;
  addEcriture: (e: Omit<Ecriture, "id">) => void;
  importEcritures: (rows: Omit<Ecriture, "id">[]) => void;
  addAttribut: (a: Omit<AttributDef, "id">) => void;
  removeAttribut: (id: string) => void;
  addTemplate: (t: Omit<TemplateDef, "id" | "builtin">) => void;
  importTemplates: (rows: Omit<TemplateDef, "id" | "builtin">[]) => void;
  removeTemplate: (id: string) => void;
  updateSociete: (patch: Partial<Societe>) => void;
  reset: () => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DBState>(seedState);
  useEffect(() => { setDb(loadInitial()); }, []);
  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(db));
  }, [db]);

  const value = useMemo<Ctx>(() => ({
    db,
    addFacture: (f) => setDb((s) => ({ ...s, factures: [{ ...f, id: `F${Date.now()}` }, ...s.factures] })),
    updateFacture: (id, patch) => setDb((s) => ({ ...s, factures: s.factures.map((f) => (f.id === id ? { ...f, ...patch } : f)) })),
    importFactures: (rows) => setDb((s) => ({ ...s, factures: [...rows.map((f, i) => ({ ...f, id: `F${Date.now()}${i}` })), ...s.factures] })),
    addDevis: (d) => setDb((s) => ({ ...s, devis: [{ ...d, id: `D${Date.now()}` }, ...s.devis] })),
    updateDevis: (id, patch) => setDb((s) => ({ ...s, devis: s.devis.map((d) => (d.id === id ? { ...d, ...patch } : d)) })),
    importDevis: (rows) => setDb((s) => ({ ...s, devis: [...rows.map((d, i) => ({ ...d, id: `D${Date.now()}${i}` })), ...s.devis] })),
    convertDevisToFacture: (devisId) => setDb((s) => {
      const d = s.devis.find((x) => x.id === devisId);
      if (!d) return s;
      const seq = s.factures.filter((f) => f.type === "Vente").length + 1;
      const numero = generateNumero("FAC", seq);
      const nf: Facture = { ...factureFromDevis(d, numero), id: `F${Date.now()}` };
      return {
        ...s,
        factures: [nf, ...s.factures],
        devis: s.devis.map((x) => (x.id === devisId ? { ...x, statut: "Accepté" } : x)),
      };
    }),
    addClient: (c) => setDb((s) => ({ ...s, clients: [{ ...c, id: `C${Date.now()}` }, ...s.clients] })),
    importClients: (rows) => setDb((s) => ({ ...s, clients: [...rows.map((c, i) => ({ ...c, id: `C${Date.now()}${i}` })), ...s.clients] })),
    addEcriture: (e) => setDb((s) => ({ ...s, ecritures: [{ ...e, id: `E${Date.now()}` }, ...s.ecritures] })),
    importEcritures: (rows) => setDb((s) => ({ ...s, ecritures: [...rows.map((e, i) => ({ ...e, id: `E${Date.now()}${i}` })), ...s.ecritures] })),
    addAttribut: (a) => setDb((s) => ({ ...s, attributs: [...s.attributs, { ...a, id: `A${Date.now()}` }] })),
    removeAttribut: (id) => setDb((s) => ({ ...s, attributs: s.attributs.filter((a) => a.id !== id) })),
    addTemplate: (t) => setDb((s) => ({ ...s, templates: [...s.templates, { ...t, id: `T${Date.now()}` }] })),
    importTemplates: (rows) => setDb((s) => ({ ...s, templates: [...s.templates, ...rows.map((t, i) => ({ ...t, id: `T${Date.now()}${i}` }))] })),
    removeTemplate: (id) => setDb((s) => ({
      ...s,
      templates: s.templates.filter((t) => t.id !== id),
      societe: s.societe.templateParDefautId === id ? { ...s.societe, templateParDefautId: s.templates.find((t) => t.id !== id)?.id ?? "classique" } : s.societe,
    })),
    updateSociete: (patch) => setDb((s) => ({ ...s, societe: { ...s.societe, ...patch } })),
    reset: () => {
      if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
      setDb(seedState());
    },
  }), [db]);

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
