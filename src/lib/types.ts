export type Client = {
  id: string;
  code: string;
  nom: string;
  contact: string;
  email: string;
  telephone: string;
  whatsapp: string;
  ninea: string;
  rccm: string;
  adresse: string;
  ville: string;
  pays: string;
  solde: number;
};

export type RegimeFiscal = "Réel Normal" | "Réel Simplifié" | "Synthétique (CGU)";

export type Societe = {
  raisonSociale: string;
  formeJuridique: string;
  adresse: string;
  ville: string;
  pays: string;
  telephone: string;
  whatsapp: string;
  email: string;
  siteWeb: string;
  ninea: string;
  rccm: string;
  regimeFiscal: RegimeFiscal;
  tauxTVA: number;
  banque: string;
  iban: string;
  logoDataUrl: string;
  piedPageMentions: string;
  templateParDefautId: string;
};

export type Unite = "Forfait" | "Conteneur" | "Kg" | "Tonne" | "M³" | "Colis" | "Heure" | "Jour";

export type LigneDocument = {
  id: string;
  designation: string;
  description?: string;
  quantite: number;
  unite: Unite;
  prixUnitaire: number;
  remisePct: number;
};

export type ModeTransport = "Maritime" | "Aérien" | "Routier" | "Ferroviaire";
export type Incoterm = "EXW" | "FOB" | "FCA" | "CFR" | "CIF" | "CPT" | "CIP" | "DAP" | "DDP" | "DDU";
export type RegimeDouanier = "Import" | "Export" | "Transit" | "Admission temporaire" | "Entrepôt sous douane";
export type ModeReglement = "Virement bancaire" | "Chèque" | "Espèces" | "Mobile Money" | "Traite";

export type InfosTransit = {
  modeTransport: ModeTransport;
  incoterm: Incoterm;
  portEmbarquement: string;
  portDebarquement: string;
  numeroConteneur: string;
  numeroTitreTransport: string; // BL / LTA / CMR
  poidsBrut: number;
  poidsNet: number;
  volumeCBM: number;
  natureMarchandise: string;
  regimeDouanier: RegimeDouanier;
  numeroDeclaration: string;
};

export type InfosFinancieres = {
  devise: string;
  tauxTVA: number;
  remiseGlobalePct: number;
  timbreFiscal: number;
  retenueSourcePct: number;
  modeReglement: ModeReglement;
  conditionsPaiement: string;
};

export type DocumentBase = InfosTransit &
  InfosFinancieres & {
    id: string;
    numero: string;
    date: string;
    clientId: string;
    objet: string;
    lignes: LigneDocument[];
    templateId: string;
    notes: string;
  };

export type DevisStatut = "Brouillon" | "Envoyé" | "Accepté" | "Refusé" | "Expiré";

export type Devis = DocumentBase & {
  statut: DevisStatut;
  validiteJours: number;
};

export type FactureStatut = "Brouillon" | "Envoyée" | "Payée" | "Partiellement payée" | "En attente" | "En retard" | "Annulée";

export type Facture = DocumentBase & {
  statut: FactureStatut;
  type: "Vente" | "Achat";
  echeance: string;
  montantPaye: number;
  devisOrigineId?: string;
};

export type Ecriture = {
  id: string;
  date: string;
  libelle: string;
  reference: string;
  type: "Entrée" | "Sortie";
  categorie: string;
  montant: number;
};

export type Cible = "facture" | "devis" | "client";

export type AttributDef = {
  id: string;
  nom: string;
  type: "texte" | "nombre" | "date";
  cibles: Cible[];
  defaut?: string;
};

export type SkinId = "classique" | "moderne" | "senegal-export";

export type TemplateDef = {
  id: string;
  nom: string;
  description: string;
  skin: SkinId;
  builtin?: boolean;
};

export const SKIN_OPTIONS: { id: SkinId; nom: string }[] = [
  { id: "classique", nom: "Classique (sobre, noir & blanc)" },
  { id: "moderne", nom: "Moderne (bleu corporate)" },
  { id: "senegal-export", nom: "Sénégal Export (vert, bandeau douane)" },
];
