import { supabase } from "./supabase";
import type {
  AttributDef,
  Client,
  DocumentBase,
  Devis,
  Ecriture,
  Facture,
  Societe,
  TemplateDef,
} from "./types";

// Client, Ecriture, AttributDef et TemplateDef n'ont aucun champ camelCase
// (colonnes déjà en un seul mot) : mapping identité, juste pour typer le retour Supabase.
type Row = Record<string, unknown>;

function documentBaseToRow(d: Omit<DocumentBase, "id">): Row {
  return {
    numero: d.numero,
    date: d.date,
    client_id: d.clientId || null,
    objet: d.objet,
    lignes: d.lignes,
    template_id: d.templateId,
    notes: d.notes,
    mode_transport: d.modeTransport,
    incoterm: d.incoterm,
    port_embarquement: d.portEmbarquement,
    port_debarquement: d.portDebarquement,
    numero_conteneur: d.numeroConteneur,
    numero_titre_transport: d.numeroTitreTransport,
    poids_brut: d.poidsBrut,
    poids_net: d.poidsNet,
    volume_cbm: d.volumeCBM,
    nature_marchandise: d.natureMarchandise,
    regime_douanier: d.regimeDouanier,
    numero_declaration: d.numeroDeclaration,
    devise: d.devise,
    taux_tva: d.tauxTVA,
    remise_globale_pct: d.remiseGlobalePct,
    timbre_fiscal: d.timbreFiscal,
    retenue_source_pct: d.retenueSourcePct,
    mode_reglement: d.modeReglement,
    conditions_paiement: d.conditionsPaiement,
  };
}

function rowToDocumentBase(r: Row): DocumentBase {
  return {
    id: r.id as string,
    numero: r.numero as string,
    date: r.date as string,
    clientId: (r.client_id as string) ?? "",
    objet: r.objet as string,
    lignes: r.lignes as DocumentBase["lignes"],
    templateId: r.template_id as string,
    notes: r.notes as string,
    modeTransport: r.mode_transport as DocumentBase["modeTransport"],
    incoterm: r.incoterm as DocumentBase["incoterm"],
    portEmbarquement: r.port_embarquement as string,
    portDebarquement: r.port_debarquement as string,
    numeroConteneur: r.numero_conteneur as string,
    numeroTitreTransport: r.numero_titre_transport as string,
    poidsBrut: Number(r.poids_brut),
    poidsNet: Number(r.poids_net),
    volumeCBM: Number(r.volume_cbm),
    natureMarchandise: r.nature_marchandise as string,
    regimeDouanier: r.regime_douanier as DocumentBase["regimeDouanier"],
    numeroDeclaration: r.numero_declaration as string,
    devise: r.devise as string,
    tauxTVA: Number(r.taux_tva),
    remiseGlobalePct: Number(r.remise_globale_pct),
    timbreFiscal: Number(r.timbre_fiscal),
    retenueSourcePct: Number(r.retenue_source_pct),
    modeReglement: r.mode_reglement as DocumentBase["modeReglement"],
    conditionsPaiement: r.conditions_paiement as string,
  };
}

function devisToRow(d: Omit<Devis, "id">): Row {
  return { ...documentBaseToRow(d), statut: d.statut, validite_jours: d.validiteJours };
}
function rowToDevis(r: Row): Devis {
  return { ...rowToDocumentBase(r), statut: r.statut as Devis["statut"], validiteJours: Number(r.validite_jours) };
}

function factureToRow(f: Omit<Facture, "id">): Row {
  return {
    ...documentBaseToRow(f),
    statut: f.statut,
    type: f.type,
    echeance: f.echeance,
    montant_paye: f.montantPaye,
    devis_origine_id: f.devisOrigineId || null,
  };
}
function rowToFacture(r: Row): Facture {
  return {
    ...rowToDocumentBase(r),
    statut: r.statut as Facture["statut"],
    type: r.type as Facture["type"],
    echeance: r.echeance as string,
    montantPaye: Number(r.montant_paye),
    devisOrigineId: (r.devis_origine_id as string) || undefined,
  };
}

function societeToRow(s: Partial<Societe>): Row {
  const row: Row = {};
  if (s.raisonSociale !== undefined) row.raison_sociale = s.raisonSociale;
  if (s.formeJuridique !== undefined) row.forme_juridique = s.formeJuridique;
  if (s.adresse !== undefined) row.adresse = s.adresse;
  if (s.ville !== undefined) row.ville = s.ville;
  if (s.pays !== undefined) row.pays = s.pays;
  if (s.telephone !== undefined) row.telephone = s.telephone;
  if (s.whatsapp !== undefined) row.whatsapp = s.whatsapp;
  if (s.email !== undefined) row.email = s.email;
  if (s.siteWeb !== undefined) row.site_web = s.siteWeb;
  if (s.ninea !== undefined) row.ninea = s.ninea;
  if (s.rccm !== undefined) row.rccm = s.rccm;
  if (s.regimeFiscal !== undefined) row.regime_fiscal = s.regimeFiscal;
  if (s.tauxTVA !== undefined) row.taux_tva = s.tauxTVA;
  if (s.banque !== undefined) row.banque = s.banque;
  if (s.iban !== undefined) row.iban = s.iban;
  if (s.logoDataUrl !== undefined) row.logo_data_url = s.logoDataUrl;
  if (s.piedPageMentions !== undefined) row.pied_page_mentions = s.piedPageMentions;
  if (s.templateParDefautId !== undefined) row.template_par_defaut_id = s.templateParDefautId;
  return row;
}
function rowToSociete(r: Row): Societe {
  return {
    raisonSociale: r.raison_sociale as string,
    formeJuridique: r.forme_juridique as string,
    adresse: r.adresse as string,
    ville: r.ville as string,
    pays: r.pays as string,
    telephone: r.telephone as string,
    whatsapp: r.whatsapp as string,
    email: r.email as string,
    siteWeb: r.site_web as string,
    ninea: r.ninea as string,
    rccm: r.rccm as string,
    regimeFiscal: r.regime_fiscal as Societe["regimeFiscal"],
    tauxTVA: Number(r.taux_tva),
    banque: r.banque as string,
    iban: r.iban as string,
    logoDataUrl: r.logo_data_url as string,
    piedPageMentions: r.pied_page_mentions as string,
    templateParDefautId: r.template_par_defaut_id as string,
  };
}

function rowToClient(r: Row): Client {
  return {
    id: r.id as string,
    code: r.code as string,
    nom: r.nom as string,
    contact: r.contact as string,
    email: r.email as string,
    telephone: r.telephone as string,
    whatsapp: r.whatsapp as string,
    ninea: r.ninea as string,
    rccm: r.rccm as string,
    adresse: r.adresse as string,
    ville: r.ville as string,
    pays: r.pays as string,
    solde: Number(r.solde),
  };
}

function rowToEcriture(r: Row): Ecriture {
  return {
    id: r.id as string,
    date: r.date as string,
    libelle: r.libelle as string,
    reference: r.reference as string,
    type: r.type as Ecriture["type"],
    categorie: r.categorie as string,
    montant: Number(r.montant),
  };
}

function rowToAttribut(r: Row): AttributDef {
  return {
    id: r.id as string,
    nom: r.nom as string,
    type: r.type as AttributDef["type"],
    cibles: (r.cibles as AttributDef["cibles"]) ?? [],
    defaut: (r.defaut as string) ?? "",
  };
}

function rowToTemplate(r: Row): TemplateDef {
  return {
    id: r.id as string,
    nom: r.nom as string,
    description: r.description as string,
    skin: r.skin as TemplateDef["skin"],
    builtin: Boolean(r.builtin),
  };
}

export type FullDB = {
  clients: Client[];
  devis: Devis[];
  factures: Facture[];
  ecritures: Ecriture[];
  attributs: AttributDef[];
  templates: TemplateDef[];
  societe: Societe;
};

export async function fetchAllData(): Promise<FullDB> {
  const [clientsR, devisR, facturesR, ecrituresR, attributsR, templatesR, societeR] = await Promise.all([
    supabase.from("clients").select("*").order("created_at", { ascending: false }),
    supabase.from("devis").select("*").order("created_at", { ascending: false }),
    supabase.from("factures").select("*").order("created_at", { ascending: false }),
    supabase.from("ecritures").select("*").order("created_at", { ascending: false }),
    supabase.from("attributs").select("*"),
    supabase.from("templates").select("*"),
    supabase.from("societe").select("*").eq("id", 1).single(),
  ]);

  for (const r of [clientsR, devisR, facturesR, ecrituresR, attributsR, templatesR, societeR]) {
    if (r.error) throw r.error;
  }

  return {
    clients: (clientsR.data ?? []).map(rowToClient),
    devis: (devisR.data ?? []).map(rowToDevis),
    factures: (facturesR.data ?? []).map(rowToFacture),
    ecritures: (ecrituresR.data ?? []).map(rowToEcriture),
    attributs: (attributsR.data ?? []).map(rowToAttribut),
    templates: (templatesR.data ?? []).map(rowToTemplate),
    societe: rowToSociete(societeR.data as Row),
  };
}

export async function insertClient(c: Omit<Client, "id">): Promise<Client> {
  const { data, error } = await supabase.from("clients").insert(c).select().single();
  if (error) throw error;
  return rowToClient(data);
}

export async function insertClients(rows: Omit<Client, "id">[]): Promise<Client[]> {
  const { data, error } = await supabase.from("clients").insert(rows).select();
  if (error) throw error;
  return (data ?? []).map(rowToClient);
}

export async function insertDevis(d: Omit<Devis, "id">): Promise<Devis> {
  const { data, error } = await supabase.from("devis").insert(devisToRow(d)).select().single();
  if (error) throw error;
  return rowToDevis(data);
}

export async function insertManyDevis(rows: Omit<Devis, "id">[]): Promise<Devis[]> {
  const { data, error } = await supabase.from("devis").insert(rows.map(devisToRow)).select();
  if (error) throw error;
  return (data ?? []).map(rowToDevis);
}

export async function updateDevis(id: string, patch: Partial<Devis>): Promise<Devis> {
  const { data, error } = await supabase
    .from("devis")
    .update(devisToRow(patch as Omit<Devis, "id">))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowToDevis(data);
}

export async function insertFacture(f: Omit<Facture, "id">): Promise<Facture> {
  const { data, error } = await supabase.from("factures").insert(factureToRow(f)).select().single();
  if (error) throw error;
  return rowToFacture(data);
}

export async function insertManyFactures(rows: Omit<Facture, "id">[]): Promise<Facture[]> {
  const { data, error } = await supabase.from("factures").insert(rows.map(factureToRow)).select();
  if (error) throw error;
  return (data ?? []).map(rowToFacture);
}

export async function updateFacture(id: string, patch: Partial<Facture>): Promise<Facture> {
  const { data, error } = await supabase
    .from("factures")
    .update(factureToRow(patch as Omit<Facture, "id">))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowToFacture(data);
}

export async function insertEcriture(e: Omit<Ecriture, "id">): Promise<Ecriture> {
  const { data, error } = await supabase.from("ecritures").insert(e).select().single();
  if (error) throw error;
  return rowToEcriture(data);
}

export async function insertEcritures(rows: Omit<Ecriture, "id">[]): Promise<Ecriture[]> {
  const { data, error } = await supabase.from("ecritures").insert(rows).select();
  if (error) throw error;
  return (data ?? []).map(rowToEcriture);
}

export async function insertAttribut(a: Omit<AttributDef, "id">): Promise<AttributDef> {
  const { data, error } = await supabase.from("attributs").insert(a).select().single();
  if (error) throw error;
  return rowToAttribut(data);
}

export async function deleteAttribut(id: string): Promise<void> {
  const { error } = await supabase.from("attributs").delete().eq("id", id);
  if (error) throw error;
}

export async function insertTemplate(t: Omit<TemplateDef, "id" | "builtin">): Promise<TemplateDef> {
  const id = `T${Date.now()}`;
  const { data, error } = await supabase.from("templates").insert({ ...t, id, builtin: false }).select().single();
  if (error) throw error;
  return rowToTemplate(data);
}

export async function insertTemplates(rows: Omit<TemplateDef, "id" | "builtin">[]): Promise<TemplateDef[]> {
  const withIds = rows.map((t, i) => ({ ...t, id: `T${Date.now()}${i}`, builtin: false }));
  const { data, error } = await supabase.from("templates").insert(withIds).select();
  if (error) throw error;
  return (data ?? []).map(rowToTemplate);
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase.from("templates").delete().eq("id", id);
  if (error) throw error;
}

export async function updateSociete(patch: Partial<Societe>): Promise<Societe> {
  const { data, error } = await supabase.from("societe").update(societeToRow(patch)).eq("id", 1).select().single();
  if (error) throw error;
  return rowToSociete(data);
}
