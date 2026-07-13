import type { Devis, DocumentBase, Facture, LigneDocument } from "./types";

export function ligneMontantHT(l: LigneDocument) {
  const brut = l.quantite * l.prixUnitaire;
  return brut - brut * (l.remisePct / 100);
}

export type Totaux = {
  totalHT: number;
  remiseGlobale: number;
  baseTVA: number;
  montantTVA: number;
  timbreFiscal: number;
  retenueSource: number;
  montantTTC: number;
  netAPayer: number;
};

export function computeTotals(doc: Pick<DocumentBase, "lignes" | "remiseGlobalePct" | "tauxTVA" | "timbreFiscal" | "retenueSourcePct">): Totaux {
  const totalHT = doc.lignes.reduce((s, l) => s + ligneMontantHT(l), 0);
  const remiseGlobale = totalHT * (doc.remiseGlobalePct / 100);
  const baseTVA = totalHT - remiseGlobale;
  const montantTVA = baseTVA * (doc.tauxTVA / 100);
  const montantTTC = baseTVA + montantTVA + doc.timbreFiscal;
  const retenueSource = montantTTC * (doc.retenueSourcePct / 100);
  const netAPayer = montantTTC - retenueSource;
  return { totalHT, remiseGlobale, baseTVA, montantTVA, timbreFiscal: doc.timbreFiscal, retenueSource, montantTTC, netAPayer };
}

export function newLigne(): LigneDocument {
  return {
    id: `L${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
    designation: "",
    quantite: 1,
    unite: "Forfait",
    prixUnitaire: 0,
    remisePct: 0,
  };
}

export function generateNumero(prefix: string, seq: number) {
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(seq).padStart(5, "0")}`;
}

export function isEnRetard(f: Facture) {
  if (f.statut === "Payée" || f.statut === "Annulée") return false;
  return f.echeance < new Date().toISOString().slice(0, 10);
}

export function factureFromDevis(d: Devis, numero: string): Omit<Facture, "id"> {
  const echeance = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  return {
    ...d,
    numero,
    date: new Date().toISOString().slice(0, 10),
    statut: "En attente",
    type: "Vente",
    echeance,
    montantPaye: 0,
    devisOrigineId: d.id,
  };
}
