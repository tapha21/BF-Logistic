import { toCsv, parseCsv } from "./csv";
import type {
  Client, Devis, DevisStatut, Ecriture, Facture, FactureStatut,
  Incoterm, ModeReglement, ModeTransport, RegimeDouanier, SkinId, TemplateDef, Unite,
} from "./types";

const VALID_SKINS: SkinId[] = ["classique", "moderne", "senegal-export"];

export function templatesToJson(templates: TemplateDef[]): string {
  return JSON.stringify(templates.map((t) => ({ nom: t.nom, description: t.description, skin: t.skin })), null, 2);
}

export function jsonToTemplates(text: string): { items: Omit<TemplateDef, "id" | "builtin">[]; errors: string[] } {
  const errors: string[] = [];
  const items: Omit<TemplateDef, "id" | "builtin">[] = [];
  try {
    const raw = JSON.parse(text);
    const list = Array.isArray(raw) ? raw : [raw];
    list.forEach((entry, i) => {
      if (!entry?.nom) { errors.push(`Entrée ${i + 1} : nom manquant`); return; }
      const skin: SkinId = VALID_SKINS.includes(entry.skin) ? entry.skin : "classique";
      items.push({ nom: String(entry.nom), description: String(entry.description ?? ""), skin });
    });
  } catch {
    errors.push("Fichier JSON invalide.");
  }
  return { items, errors };
}

const CLIENT_COLUMNS = ["code", "nom", "contact", "email", "telephone", "whatsapp", "ninea", "rccm", "adresse", "ville", "pays", "solde"];

export function clientsToCsv(clients: Client[]): string {
  return toCsv(clients, CLIENT_COLUMNS);
}

export function csvToClients(text: string): { items: Omit<Client, "id">[]; errors: string[] } {
  const rows = parseCsv(text);
  const errors: string[] = [];
  const items: Omit<Client, "id">[] = [];
  rows.forEach((r, i) => {
    if (!r.nom) { errors.push(`Ligne ${i + 2} : nom du client manquant`); return; }
    items.push({
      code: r.code || `CLI-${1000 + i}`,
      nom: r.nom,
      contact: r.contact || "",
      email: r.email || "",
      telephone: r.telephone || "",
      whatsapp: r.whatsapp || r.telephone || "",
      ninea: r.ninea || "",
      rccm: r.rccm || "",
      adresse: r.adresse || "",
      ville: r.ville || "Dakar",
      pays: r.pays || "Sénégal",
      solde: Number(r.solde) || 0,
    });
  });
  return { items, errors };
}

const DOC_COLUMNS = [
  "numero", "date", "echeance", "clientCode", "objet", "statut", "type", "validiteJours",
  "modeTransport", "incoterm", "portEmbarquement", "portDebarquement", "numeroConteneur",
  "numeroTitreTransport", "poidsBrut", "poidsNet", "volumeCBM", "natureMarchandise", "regimeDouanier", "numeroDeclaration",
  "devise", "tauxTVA", "remiseGlobalePct", "timbreFiscal", "retenueSourcePct", "modeReglement", "conditionsPaiement",
  "templateId", "notes", "ligneDesignation", "ligneQuantite", "ligneUnite", "lignePrixUnitaire", "ligneRemisePct",
];

type DocKind = "devis" | "facture";

export function documentsToCsv(docs: (Devis | Facture)[], clients: Client[], kind: DocKind): string {
  const rows: Record<string, unknown>[] = [];
  docs.forEach((d) => {
    const client = clients.find((c) => c.id === d.clientId);
    const base = {
      numero: d.numero,
      date: d.date,
      echeance: kind === "facture" ? (d as Facture).echeance : "",
      clientCode: client?.code ?? "",
      objet: d.objet,
      statut: d.statut,
      type: kind === "facture" ? (d as Facture).type : "",
      validiteJours: kind === "devis" ? (d as Devis).validiteJours : "",
      modeTransport: d.modeTransport,
      incoterm: d.incoterm,
      portEmbarquement: d.portEmbarquement,
      portDebarquement: d.portDebarquement,
      numeroConteneur: d.numeroConteneur,
      numeroTitreTransport: d.numeroTitreTransport,
      poidsBrut: d.poidsBrut,
      poidsNet: d.poidsNet,
      volumeCBM: d.volumeCBM,
      natureMarchandise: d.natureMarchandise,
      regimeDouanier: d.regimeDouanier,
      numeroDeclaration: d.numeroDeclaration,
      devise: d.devise,
      tauxTVA: d.tauxTVA,
      remiseGlobalePct: d.remiseGlobalePct,
      timbreFiscal: d.timbreFiscal,
      retenueSourcePct: d.retenueSourcePct,
      modeReglement: d.modeReglement,
      conditionsPaiement: d.conditionsPaiement,
      templateId: d.templateId,
      notes: d.notes,
    };
    if (d.lignes.length === 0) {
      rows.push({ ...base, ligneDesignation: "", ligneQuantite: "", ligneUnite: "", lignePrixUnitaire: "", ligneRemisePct: "" });
    } else {
      d.lignes.forEach((l) => rows.push({
        ...base,
        ligneDesignation: l.designation, ligneQuantite: l.quantite, ligneUnite: l.unite,
        lignePrixUnitaire: l.prixUnitaire, ligneRemisePct: l.remisePct,
      }));
    }
  });
  return toCsv(rows, DOC_COLUMNS);
}

export function csvToDocuments(
  text: string,
  clients: Client[],
  kind: DocKind,
  defaults: { tauxTVA: number; templateId: string },
): { items: (Omit<Devis, "id"> | Omit<Facture, "id">)[]; errors: string[] } {
  const rows = parseCsv(text);
  const groups = new Map<string, typeof rows>();
  rows.forEach((r, i) => {
    const key = r.numero || `_sans_numero_${i}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  });

  const errors: string[] = [];
  const items: (Omit<Devis, "id"> | Omit<Facture, "id">)[] = [];

  groups.forEach((groupRows, numero) => {
    const r = groupRows[0];
    const client = clients.find((c) => c.code === r.clientCode) ?? clients.find((c) => c.nom === r.clientCode);
    if (!client) { errors.push(`Client introuvable pour le document ${numero} (code/nom attendu : "${r.clientCode}")`); return; }

    const lignes = groupRows
      .filter((g) => g.ligneDesignation)
      .map((g, i) => ({
        id: `IMP${Date.now()}${i}${Math.random().toString(36).slice(2, 6)}`,
        designation: g.ligneDesignation,
        quantite: Number(g.ligneQuantite) || 1,
        unite: (g.ligneUnite as Unite) || "Forfait",
        prixUnitaire: Number(g.lignePrixUnitaire) || 0,
        remisePct: Number(g.ligneRemisePct) || 0,
      }));
    if (lignes.length === 0) { errors.push(`Aucune ligne exploitable pour le document ${numero}`); return; }

    const base = {
      numero: r.numero || numero,
      date: r.date || new Date().toISOString().slice(0, 10),
      clientId: client.id,
      objet: r.objet || "",
      lignes,
      templateId: r.templateId || defaults.templateId,
      notes: r.notes || "",
      modeTransport: (r.modeTransport as ModeTransport) || "Maritime",
      incoterm: (r.incoterm as Incoterm) || "CIF",
      portEmbarquement: r.portEmbarquement || "",
      portDebarquement: r.portDebarquement || "",
      numeroConteneur: r.numeroConteneur || "",
      numeroTitreTransport: r.numeroTitreTransport || "",
      poidsBrut: Number(r.poidsBrut) || 0,
      poidsNet: Number(r.poidsNet) || 0,
      volumeCBM: Number(r.volumeCBM) || 0,
      natureMarchandise: r.natureMarchandise || "",
      regimeDouanier: (r.regimeDouanier as RegimeDouanier) || "Import",
      numeroDeclaration: r.numeroDeclaration || "",
      devise: r.devise || "XOF",
      tauxTVA: Number(r.tauxTVA) || defaults.tauxTVA,
      remiseGlobalePct: Number(r.remiseGlobalePct) || 0,
      timbreFiscal: Number(r.timbreFiscal) || 0,
      retenueSourcePct: Number(r.retenueSourcePct) || 0,
      modeReglement: (r.modeReglement as ModeReglement) || "Virement bancaire",
      conditionsPaiement: r.conditionsPaiement || "30 jours net à compter de la date de facture",
    };

    if (kind === "devis") {
      items.push({ ...base, statut: (r.statut as DevisStatut) || "Brouillon", validiteJours: Number(r.validiteJours) || 30 });
    } else {
      items.push({
        ...base,
        statut: (r.statut as FactureStatut) || "En attente",
        type: (r.type as "Vente" | "Achat") || "Vente",
        echeance: r.echeance || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        montantPaye: 0,
      });
    }
  });

  return { items, errors };
}

const ECRITURE_COLUMNS = ["date", "libelle", "reference", "type", "categorie", "montant"];

export function ecrituresToCsv(list: Ecriture[]): string {
  return toCsv(list, ECRITURE_COLUMNS);
}

export function csvToEcritures(text: string): { items: Omit<Ecriture, "id">[]; errors: string[] } {
  const rows = parseCsv(text);
  const errors: string[] = [];
  const items: Omit<Ecriture, "id">[] = [];
  rows.forEach((r, i) => {
    if (!r.libelle) { errors.push(`Ligne ${i + 2} : libellé manquant`); return; }
    items.push({
      date: r.date || new Date().toISOString().slice(0, 10),
      libelle: r.libelle,
      reference: r.reference || "",
      type: r.type === "Sortie" ? "Sortie" : "Entrée",
      categorie: r.categorie || "Autres",
      montant: Number(r.montant) || 0,
    });
  });
  return { items, errors };
}
