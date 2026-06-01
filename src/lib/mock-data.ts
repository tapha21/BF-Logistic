export type Client = {
  id: string;
  code: string;
  nom: string;
  contact: string;
  email: string;
  telephone: string;
  ville: string;
  pays: string;
  solde: number;
};

export type Devis = {
  id: string;
  numero: string;
  date: string;
  clientId: string;
  objet: string;
  montantHT: number;
  tva: number;
  montantTTC: number;
  statut: "Brouillon" | "Envoyé" | "Accepté" | "Refusé";
};

export type Facture = {
  id: string;
  numero: string;
  date: string;
  echeance: string;
  clientId: string;
  objet: string;
  montantHT: number;
  tva: number;
  montantTTC: number;
  statut: "Payée" | "Partiellement payée" | "En attente" | "En retard";
  type: "Vente" | "Achat";
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

export const clients: Client[] = [
  { id: "C001", code: "CLI-001", nom: "SOCOCIM Industries", contact: "Mamadou Diop", email: "m.diop@sococim.sn", telephone: "+221 33 839 88 88", ville: "Rufisque", pays: "Sénégal", solde: 4520000 },
  { id: "C002", code: "CLI-002", nom: "Patisen SA", contact: "Aïssatou Ndiaye", email: "contact@patisen.com", telephone: "+221 33 879 00 00", ville: "Dakar", pays: "Sénégal", solde: 1280000 },
  { id: "C003", code: "CLI-003", nom: "CFAO Motors", contact: "Jean Bernard", email: "j.bernard@cfao.com", telephone: "+221 33 839 02 02", ville: "Dakar", pays: "Sénégal", solde: 0 },
  { id: "C004", code: "CLI-004", nom: "Bolloré Transport", contact: "Fatou Sarr", email: "f.sarr@bollore.com", telephone: "+221 33 849 70 00", ville: "Dakar", pays: "Sénégal", solde: 8740000 },
  { id: "C005", code: "CLI-005", nom: "Maersk Line SN", contact: "Pape Sow", email: "p.sow@maersk.com", telephone: "+221 33 889 50 00", ville: "Dakar", pays: "Sénégal", solde: 2150000 },
  { id: "C006", code: "CLI-006", nom: "DHL Global Forwarding", contact: "Khadija Ba", email: "k.ba@dhl.com", telephone: "+221 33 869 11 11", ville: "Dakar", pays: "Sénégal", solde: 560000 },
  { id: "C007", code: "CLI-007", nom: "Sénégalaise des Eaux", contact: "Ousmane Faye", email: "o.faye@sde.sn", telephone: "+221 33 839 30 30", ville: "Dakar", pays: "Sénégal", solde: 3320000 },
];

export const devis: Devis[] = [
  { id: "D001", numero: "DEV-2026-0042", date: "2026-05-28", clientId: "C001", objet: "Transit maritime conteneur 40' HC - Shanghai/Dakar", montantHT: 3850000, tva: 693000, montantTTC: 4543000, statut: "Envoyé" },
  { id: "D002", numero: "DEV-2026-0041", date: "2026-05-26", clientId: "C004", objet: "Dédouanement et acheminement véhicules x12", montantHT: 2100000, tva: 378000, montantTTC: 2478000, statut: "Accepté" },
  { id: "D003", numero: "DEV-2026-0040", date: "2026-05-24", clientId: "C002", objet: "Groupage aérien 850kg - Paris CDG", montantHT: 1450000, tva: 261000, montantTTC: 1711000, statut: "Accepté" },
  { id: "D004", numero: "DEV-2026-0039", date: "2026-05-20", clientId: "C005", objet: "Transit ferroviaire conteneurs x4 - Bamako", montantHT: 5200000, tva: 936000, montantTTC: 6136000, statut: "Brouillon" },
  { id: "D005", numero: "DEV-2026-0038", date: "2026-05-18", clientId: "C003", objet: "Logistique entreposage 3 mois - 200m³", montantHT: 980000, tva: 176400, montantTTC: 1156400, statut: "Refusé" },
  { id: "D006", numero: "DEV-2026-0037", date: "2026-05-15", clientId: "C007", objet: "Transit routier hors gabarit - Abidjan", montantHT: 4750000, tva: 855000, montantTTC: 5605000, statut: "Envoyé" },
];

export const factures: Facture[] = [
  { id: "F001", numero: "FAC-2026-00128", date: "2026-05-28", echeance: "2026-06-27", clientId: "C001", objet: "Transit maritime conteneur 40'", montantHT: 3850000, tva: 693000, montantTTC: 4543000, statut: "En attente", type: "Vente" },
  { id: "F002", numero: "FAC-2026-00127", date: "2026-05-25", echeance: "2026-06-24", clientId: "C004", objet: "Dédouanement véhicules x12", montantHT: 2100000, tva: 378000, montantTTC: 2478000, statut: "Partiellement payée", type: "Vente" },
  { id: "F003", numero: "FAC-2026-00126", date: "2026-05-20", echeance: "2026-06-19", clientId: "C002", objet: "Groupage aérien Paris CDG", montantHT: 1450000, tva: 261000, montantTTC: 1711000, statut: "Payée", type: "Vente" },
  { id: "F004", numero: "FAC-2026-00125", date: "2026-05-15", echeance: "2026-05-30", clientId: "C007", objet: "Transit routier Abidjan", montantHT: 4750000, tva: 855000, montantTTC: 5605000, statut: "En retard", type: "Vente" },
  { id: "F005", numero: "FAC-2026-00124", date: "2026-05-12", echeance: "2026-06-11", clientId: "C005", objet: "Frais portuaires DPW", montantHT: 1820000, tva: 327600, montantTTC: 2147600, statut: "Payée", type: "Vente" },
  { id: "F006", numero: "FAC-2026-00123", date: "2026-05-08", echeance: "2026-06-07", clientId: "C006", objet: "Manutention conteneur réfrigéré", montantHT: 475000, tva: 85500, montantTTC: 560500, statut: "En attente", type: "Vente" },
  { id: "F007", numero: "FAC-2026-00122", date: "2026-05-05", echeance: "2026-06-04", clientId: "C003", objet: "Logistique entreposage avril", montantHT: 1240000, tva: 223200, montantTTC: 1463200, statut: "Payée", type: "Vente" },
  { id: "F008", numero: "ACH-2026-00056", date: "2026-05-22", echeance: "2026-06-21", clientId: "C005", objet: "Achat slot maritime Maersk", montantHT: 2680000, tva: 482400, montantTTC: 3162400, statut: "Payée", type: "Achat" },
  { id: "F009", numero: "ACH-2026-00055", date: "2026-05-18", echeance: "2026-06-17", clientId: "C006", objet: "Sous-traitance dédouanement", montantHT: 340000, tva: 61200, montantTTC: 401200, statut: "En attente", type: "Achat" },
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
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

export function getClient(id: string) {
  return clients.find((c) => c.id === id);
}
