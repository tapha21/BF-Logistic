import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  clients as seedClients,
  devis as seedDevis,
  factures as seedFactures,
  ecritures as seedEcritures,
  type Client,
  type Devis,
  type Facture,
  type Ecriture,
} from "./mock-data";

export type AttributDef = {
  id: string;
  nom: string;
  type: "texte" | "nombre" | "date";
  cible: "facture" | "devis" | "client";
  defaut?: string;
};

export type DBState = {
  clients: Client[];
  devis: Devis[];
  factures: Facture[];
  ecritures: Ecriture[];
  attributs: AttributDef[];
};

const seedAttributs: AttributDef[] = [
  { id: "A1", nom: "Numéro BL", type: "texte", cible: "facture", defaut: "" },
  { id: "A2", nom: "Port de départ", type: "texte", cible: "facture", defaut: "Shanghai" },
  { id: "A3", nom: "Mode de règlement", type: "texte", cible: "facture", defaut: "Virement 30j" },
];

const KEY = "bf-logistic-db-v1";

function loadInitial(): DBState {
  if (typeof window === "undefined") {
    return { clients: seedClients, devis: seedDevis, factures: seedFactures, ecritures: seedEcritures, attributs: seedAttributs };
  }
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as DBState;
  } catch {}
  const initial: DBState = { clients: seedClients, devis: seedDevis, factures: seedFactures, ecritures: seedEcritures, attributs: seedAttributs };
  window.localStorage.setItem(KEY, JSON.stringify(initial));
  return initial;
}

type Ctx = {
  db: DBState;
  addFacture: (f: Omit<Facture, "id">) => void;
  addDevis: (d: Omit<Devis, "id">) => void;
  addClient: (c: Omit<Client, "id">) => void;
  addEcriture: (e: Omit<Ecriture, "id">) => void;
  addAttribut: (a: Omit<AttributDef, "id">) => void;
  removeAttribut: (id: string) => void;
  reset: () => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DBState>(() => ({
    clients: seedClients, devis: seedDevis, factures: seedFactures, ecritures: seedEcritures, attributs: seedAttributs,
  }));
  useEffect(() => { setDb(loadInitial()); }, []);
  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(db));
  }, [db]);

  const value = useMemo<Ctx>(() => ({
    db,
    addFacture: (f) => setDb((s) => ({ ...s, factures: [{ ...f, id: `F${Date.now()}` }, ...s.factures] })),
    addDevis: (d) => setDb((s) => ({ ...s, devis: [{ ...d, id: `D${Date.now()}` }, ...s.devis] })),
    addClient: (c) => setDb((s) => ({ ...s, clients: [{ ...c, id: `C${Date.now()}` }, ...s.clients] })),
    addEcriture: (e) => setDb((s) => ({ ...s, ecritures: [{ ...e, id: `E${Date.now()}` }, ...s.ecritures] })),
    addAttribut: (a) => setDb((s) => ({ ...s, attributs: [...s.attributs, { ...a, id: `A${Date.now()}` }] })),
    removeAttribut: (id) => setDb((s) => ({ ...s, attributs: s.attributs.filter((a) => a.id !== id) })),
    reset: () => {
      if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
      setDb({ clients: seedClients, devis: seedDevis, factures: seedFactures, ecritures: seedEcritures, attributs: seedAttributs });
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