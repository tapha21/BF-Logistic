import type { Client, Devis, Ecriture, Facture, Societe, TemplateDef } from "./types";

export const seedTemplates: TemplateDef[] = [
  { id: "classique", nom: "Classique", description: "Sobre et institutionnel, idéal pour l'administration et la douane.", skin: "classique", builtin: true },
  { id: "moderne", nom: "Moderne", description: "Bloc coloré, mise en page aérée, look corporate contemporain.", skin: "moderne", builtin: true },
  { id: "senegal-export", nom: "Sénégal Export", description: "Bandeau transit/douane mis en avant, pensé pour le fret international.", skin: "senegal-export", builtin: true },
];

export const seedSociete: Societe = {
  raisonSociale: "BF Logistic SARL",
  formeJuridique: "SARL au capital de 10 000 000 FCFA",
  adresse: "Route de l'Aéroport, Zone Industrielle",
  ville: "Dakar",
  pays: "Sénégal",
  telephone: "+221 33 820 45 12",
  whatsapp: "+221 77 820 45 12",
  email: "contact@bf-logistic.sn",
  siteWeb: "www.bf-logistic.sn",
  ninea: "0054821 2A2",
  rccm: "SN DKR 2016 B 8842",
  regimeFiscal: "Réel Normal",
  tauxTVA: 18,
  banque: "Ecobank Sénégal — Agence Plateau",
  iban: "SN08 EC01 0000 1234 5678 9012 34",
  logoDataUrl: "",
  piedPageMentions:
    "TVA acquittée sur les encaissements. Sauf mention contraire, nos prestations sont soumises aux conditions générales de vente disponibles sur simple demande. En cas de retard de paiement, une pénalité au taux légal sera appliquée (article 148 du Code des Obligations Civiles et Commerciales).",
  templateParDefautId: "senegal-export",
};

export const clients: Client[] = [
  { id: "C001", code: "CLI-001", nom: "SOCOCIM Industries", contact: "Mamadou Diop", email: "m.diop@sococim.sn", telephone: "+221 33 839 88 88", whatsapp: "+221 77 639 88 88", ninea: "0001234 2A2", rccm: "SN DKR 1998 B 112", adresse: "Route de Rufisque", ville: "Rufisque", pays: "Sénégal", solde: 4520000 },
  { id: "C002", code: "CLI-002", nom: "Patisen SA", contact: "Aïssatou Ndiaye", email: "contact@patisen.com", telephone: "+221 33 879 00 00", whatsapp: "+221 77 879 00 00", ninea: "0002211 2A2", rccm: "SN DKR 2001 B 445", adresse: "Zone Industrielle Sud", ville: "Dakar", pays: "Sénégal", solde: 1280000 },
  { id: "C003", code: "CLI-003", nom: "CFAO Motors Sénégal", contact: "Jean Bernard", email: "j.bernard@cfao.com", telephone: "+221 33 839 02 02", whatsapp: "+221 77 839 02 02", ninea: "0003356 2A2", rccm: "SN DKR 1995 B 210", adresse: "Avenue Malick Sy", ville: "Dakar", pays: "Sénégal", solde: 0 },
  { id: "C004", code: "CLI-004", nom: "Bolloré Transport & Logistics", contact: "Fatou Sarr", email: "f.sarr@bollore.com", telephone: "+221 33 849 70 00", whatsapp: "+221 78 849 70 00", ninea: "0004478 2A2", rccm: "SN DKR 1990 B 88", adresse: "Môle 2, Port Autonome de Dakar", ville: "Dakar", pays: "Sénégal", solde: 8740000 },
  { id: "C005", code: "CLI-005", nom: "Maersk Line Sénégal", contact: "Pape Sow", email: "p.sow@maersk.com", telephone: "+221 33 889 50 00", whatsapp: "+221 77 889 50 00", ninea: "0005589 2A2", rccm: "SN DKR 2005 B 321", adresse: "Rue Vincens, Plateau", ville: "Dakar", pays: "Sénégal", solde: 2150000 },
  { id: "C006", code: "CLI-006", nom: "DHL Global Forwarding", contact: "Khadija Ba", email: "k.ba@dhl.com", telephone: "+221 33 869 11 11", whatsapp: "+221 76 869 11 11", ninea: "0006612 2A2", rccm: "SN DKR 2000 B 156", adresse: "Aéroport LSS, Zone Cargo", ville: "Dakar", pays: "Sénégal", solde: 560000 },
  { id: "C007", code: "CLI-007", nom: "Sénégalaise des Eaux", contact: "Ousmane Faye", email: "o.faye@sde.sn", telephone: "+221 33 839 30 30", whatsapp: "+221 77 839 30 30", ninea: "0007745 2A2", rccm: "SN DKR 1996 B 67", adresse: "Avenue Cheikh Anta Diop", ville: "Dakar", pays: "Sénégal", solde: 3320000 },
];

const defaultTransit = {
  modeTransport: "Maritime" as const,
  incoterm: "CIF" as const,
  portEmbarquement: "Shanghai, Chine",
  portDebarquement: "Port Autonome de Dakar",
  numeroConteneur: "MSKU-7734521",
  numeroTitreTransport: "BL-2026-88213",
  poidsBrut: 24500,
  poidsNet: 23800,
  volumeCBM: 58,
  natureMarchandise: "Matériel industriel",
  regimeDouanier: "Import" as const,
  numeroDeclaration: "DDU-2026-004521",
};

const defaultFin = {
  devise: "XOF",
  tauxTVA: 18,
  remiseGlobalePct: 0,
  timbreFiscal: 0,
  retenueSourcePct: 0,
  modeReglement: "Virement bancaire" as const,
  conditionsPaiement: "30 jours net à compter de la date de facture",
};

export const devis: Devis[] = [
  {
    id: "D001", numero: "DEV-2026-00042", date: "2026-05-28", clientId: "C001",
    objet: "Transit maritime conteneur 40' HC — Shanghai/Dakar", statut: "Envoyé", validiteJours: 30,
    templateId: "senegal-export", notes: "Devis valable 30 jours. Prix hors surestaries éventuelles.",
    lignes: [
      { id: "L1", designation: "Fret maritime conteneur 40' HC", quantite: 1, unite: "Conteneur", prixUnitaire: 2800000, remisePct: 0 },
      { id: "L2", designation: "Dédouanement et formalités douanières", quantite: 1, unite: "Forfait", prixUnitaire: 650000, remisePct: 0 },
      { id: "L3", designation: "Manutention portuaire et livraison", quantite: 1, unite: "Forfait", prixUnitaire: 400000, remisePct: 5 },
    ],
    ...defaultTransit, ...defaultFin,
  },
  {
    id: "D002", numero: "DEV-2026-00041", date: "2026-05-26", clientId: "C004",
    objet: "Dédouanement et acheminement véhicules x12", statut: "Accepté", validiteJours: 15,
    templateId: "senegal-export", notes: "",
    lignes: [
      { id: "L1", designation: "Dédouanement véhicule", quantite: 12, unite: "Colis", prixUnitaire: 150000, remisePct: 0 },
      { id: "L2", designation: "Convoyage port—parc", quantite: 12, unite: "Colis", prixUnitaire: 25000, remisePct: 0 },
    ],
    ...defaultTransit, portEmbarquement: "Anvers, Belgique", incoterm: "FOB", numeroDeclaration: "DDU-2026-004498",
    ...defaultFin,
  },
  {
    id: "D003", numero: "DEV-2026-00040", date: "2026-05-24", clientId: "C002",
    objet: "Groupage aérien 850kg — Paris CDG", statut: "Accepté", validiteJours: 15,
    templateId: "moderne", notes: "",
    lignes: [
      { id: "L1", designation: "Fret aérien groupage", quantite: 850, unite: "Kg", prixUnitaire: 1550, remisePct: 0 },
      { id: "L2", designation: "Frais d'agence et douane aéroport", quantite: 1, unite: "Forfait", prixUnitaire: 130000, remisePct: 0 },
    ],
    ...defaultTransit, modeTransport: "Aérien", portEmbarquement: "Paris CDG, France", portDebarquement: "Aéroport LSS Dakar", numeroTitreTransport: "LTA-057-88213456",
    ...defaultFin,
  },
  {
    id: "D004", numero: "DEV-2026-00039", date: "2026-05-20", clientId: "C005",
    objet: "Transit ferroviaire conteneurs x4 — Bamako", statut: "Brouillon", validiteJours: 20,
    templateId: "classique", notes: "En attente de confirmation des disponibilités wagons.",
    lignes: [{ id: "L1", designation: "Transit ferroviaire conteneur 20'", quantite: 4, unite: "Conteneur", prixUnitaire: 1300000, remisePct: 0 }],
    ...defaultTransit, modeTransport: "Ferroviaire", portDebarquement: "Bamako, Mali", regimeDouanier: "Transit",
    ...defaultFin,
  },
  {
    id: "D005", numero: "DEV-2026-00038", date: "2026-05-18", clientId: "C003",
    objet: "Logistique entreposage 3 mois — 200m³", statut: "Refusé", validiteJours: 15,
    templateId: "classique", notes: "",
    lignes: [{ id: "L1", designation: "Entreposage sous douane", quantite: 3, unite: "Jour", prixUnitaire: 326667, remisePct: 0 }],
    ...defaultTransit, regimeDouanier: "Entrepôt sous douane",
    ...defaultFin,
  },
  {
    id: "D006", numero: "DEV-2026-00037", date: "2026-05-15", clientId: "C007",
    objet: "Transit routier hors gabarit — Abidjan", statut: "Envoyé", validiteJours: 30,
    templateId: "senegal-export", notes: "",
    lignes: [{ id: "L1", designation: "Transport routier hors gabarit", quantite: 1, unite: "Forfait", prixUnitaire: 4750000, remisePct: 0 }],
    ...defaultTransit, modeTransport: "Routier", portDebarquement: "Abidjan, Côte d'Ivoire", regimeDouanier: "Export",
    ...defaultFin,
  },
];

export const factures: Facture[] = [
  {
    id: "F001", numero: "FAC-2026-00128", date: "2026-05-28", echeance: "2026-06-27", clientId: "C001",
    objet: "Transit maritime conteneur 40'", statut: "En attente", type: "Vente", montantPaye: 0,
    templateId: "senegal-export", notes: "",
    lignes: [
      { id: "L1", designation: "Fret maritime conteneur 40' HC", quantite: 1, unite: "Conteneur", prixUnitaire: 2800000, remisePct: 0 },
      { id: "L2", designation: "Dédouanement et formalités douanières", quantite: 1, unite: "Forfait", prixUnitaire: 650000, remisePct: 0 },
      { id: "L3", designation: "Manutention portuaire et livraison", quantite: 1, unite: "Forfait", prixUnitaire: 400000, remisePct: 5 },
    ],
    ...defaultTransit, ...defaultFin,
  },
  {
    id: "F002", numero: "FAC-2026-00127", date: "2026-05-25", echeance: "2026-06-24", clientId: "C004",
    objet: "Dédouanement véhicules x12", statut: "Partiellement payée", type: "Vente", montantPaye: 1200000,
    templateId: "senegal-export", notes: "",
    lignes: [
      { id: "L1", designation: "Dédouanement véhicule", quantite: 12, unite: "Colis", prixUnitaire: 150000, remisePct: 0 },
      { id: "L2", designation: "Convoyage port—parc", quantite: 12, unite: "Colis", prixUnitaire: 25000, remisePct: 0 },
    ],
    ...defaultTransit, portEmbarquement: "Anvers, Belgique", incoterm: "FOB",
    ...defaultFin,
  },
  {
    id: "F003", numero: "FAC-2026-00126", date: "2026-05-20", echeance: "2026-06-19", clientId: "C002",
    objet: "Groupage aérien Paris CDG", statut: "Payée", type: "Vente", montantPaye: 1711000,
    templateId: "moderne", notes: "",
    lignes: [
      { id: "L1", designation: "Fret aérien groupage", quantite: 850, unite: "Kg", prixUnitaire: 1550, remisePct: 0 },
      { id: "L2", designation: "Frais d'agence et douane aéroport", quantite: 1, unite: "Forfait", prixUnitaire: 130000, remisePct: 0 },
    ],
    ...defaultTransit, modeTransport: "Aérien", portEmbarquement: "Paris CDG, France", portDebarquement: "Aéroport LSS Dakar",
    ...defaultFin,
  },
  {
    id: "F004", numero: "FAC-2026-00125", date: "2026-05-15", echeance: "2026-05-30", clientId: "C007",
    objet: "Transit routier Abidjan", statut: "En retard", type: "Vente", montantPaye: 0,
    templateId: "senegal-export", notes: "",
    lignes: [{ id: "L1", designation: "Transport routier hors gabarit", quantite: 1, unite: "Forfait", prixUnitaire: 4750000, remisePct: 0 }],
    ...defaultTransit, modeTransport: "Routier", portDebarquement: "Abidjan, Côte d'Ivoire", regimeDouanier: "Export",
    ...defaultFin,
  },
  {
    id: "F005", numero: "FAC-2026-00124", date: "2026-05-12", echeance: "2026-06-11", clientId: "C005",
    objet: "Frais portuaires DPW", statut: "Payée", type: "Vente", montantPaye: 2147600,
    templateId: "classique", notes: "",
    lignes: [{ id: "L1", designation: "Frais de manutention portuaire", quantite: 1, unite: "Forfait", prixUnitaire: 1820000, remisePct: 0 }],
    ...defaultTransit, ...defaultFin,
  },
  {
    id: "F006", numero: "FAC-2026-00123", date: "2026-05-08", echeance: "2026-06-07", clientId: "C006",
    objet: "Manutention conteneur réfrigéré", statut: "En attente", type: "Vente", montantPaye: 0,
    templateId: "classique", notes: "",
    lignes: [{ id: "L1", designation: "Manutention conteneur reefer", quantite: 1, unite: "Conteneur", prixUnitaire: 475000, remisePct: 0 }],
    ...defaultTransit, ...defaultFin,
  },
  {
    id: "F007", numero: "FAC-2026-00122", date: "2026-05-05", echeance: "2026-06-04", clientId: "C003",
    objet: "Logistique entreposage avril", statut: "Payée", type: "Vente", montantPaye: 1463200,
    templateId: "classique", notes: "",
    lignes: [{ id: "L1", designation: "Entreposage sous douane", quantite: 30, unite: "Jour", prixUnitaire: 41333, remisePct: 0 }],
    ...defaultTransit, regimeDouanier: "Entrepôt sous douane",
    ...defaultFin,
  },
  {
    id: "F008", numero: "ACH-2026-00056", date: "2026-05-22", echeance: "2026-06-21", clientId: "C005",
    objet: "Achat slot maritime Maersk", statut: "Payée", type: "Achat", montantPaye: 3162400,
    templateId: "classique", notes: "",
    lignes: [{ id: "L1", designation: "Achat slot conteneur maritime", quantite: 1, unite: "Conteneur", prixUnitaire: 2680000, remisePct: 0 }],
    ...defaultTransit, ...defaultFin,
  },
  {
    id: "F009", numero: "ACH-2026-00055", date: "2026-05-18", echeance: "2026-06-17", clientId: "C006",
    objet: "Sous-traitance dédouanement", statut: "En attente", type: "Achat", montantPaye: 0,
    templateId: "classique", notes: "",
    lignes: [{ id: "L1", designation: "Sous-traitance formalités douanières", quantite: 1, unite: "Forfait", prixUnitaire: 340000, remisePct: 0 }],
    ...defaultTransit, ...defaultFin,
  },
];

export const ecritures: Ecriture[] = [
  { id: "E001", date: "2026-05-28", libelle: "Règlement FAC-2026-00126 - Patisen SA", reference: "VIR-883421", type: "Entrée", categorie: "Ventes", montant: 1711000 },
  { id: "E002", date: "2026-05-27", libelle: "Règlement FAC-2026-00124 - Maersk Line SN", reference: "VIR-883420", type: "Entrée", categorie: "Ventes", montant: 2147600 },
  { id: "E003", date: "2026-05-26", libelle: "Paiement ACH-2026-00056 - Maersk", reference: "CHQ-001245", type: "Sortie", categorie: "Sous-traitance", montant: 3162400 },
  { id: "E004", date: "2026-05-25", libelle: "Acompte FAC-2026-00127 - Bolloré", reference: "VIR-883415", type: "Entrée", categorie: "Ventes", montant: 1200000 },
  { id: "E005", date: "2026-05-22", libelle: "Carburant et péages flotte", reference: "DEP-04482", type: "Sortie", categorie: "Frais d'exploitation", montant: 485000 },
  { id: "E006", date: "2026-05-20", libelle: "Salaires mai 2026", reference: "VIR-883400", type: "Sortie", categorie: "Charges de personnel", montant: 12400000 },
  { id: "E007", date: "2026-05-18", libelle: "Règlement FAC-2026-00122 - CFAO", reference: "VIR-883398", type: "Entrée", categorie: "Ventes", montant: 1463200 },
  { id: "E008", date: "2026-05-15", libelle: "Loyer entrepôt Bel Air", reference: "VIR-883390", type: "Sortie", categorie: "Charges locatives", montant: 1800000 },
  { id: "E009", date: "2026-05-10", libelle: "Acompte projet SOCOCIM", reference: "VIR-883382", type: "Entrée", categorie: "Acomptes", montant: 2000000 },
  { id: "E010", date: "2026-05-08", libelle: "Assurance flotte Q2", reference: "VIR-883378", type: "Sortie", categorie: "Assurances", montant: 950000 },
];

export function formatXOF(n: number) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";
}

export function getClient(id: string) {
  return clients.find((c) => c.id === id);
}
