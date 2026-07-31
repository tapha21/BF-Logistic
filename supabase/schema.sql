-- BF Logistic CRM — schéma Supabase (Postgres)
-- À exécuter une fois dans Supabase Dashboard > SQL Editor > New query

create extension if not exists pgcrypto;

-- =========================================================
-- société (singleton — une seule ligne, id fixé à 1)
-- =========================================================
create table if not exists societe (
  id int primary key default 1,
  raison_sociale text not null default '',
  forme_juridique text not null default '',
  adresse text not null default '',
  ville text not null default '',
  pays text not null default '',
  telephone text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  site_web text not null default '',
  ninea text not null default '',
  rccm text not null default '',
  regime_fiscal text not null default 'Réel Normal',
  taux_tva numeric not null default 18,
  banque text not null default '',
  iban text not null default '',
  logo_data_url text not null default '',
  pied_page_mentions text not null default '',
  template_par_defaut_id text not null default 'classique',
  constraint societe_singleton check (id = 1)
);

-- =========================================================
-- clients
-- =========================================================
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  code text not null default '',
  nom text not null default '',
  contact text not null default '',
  email text not null default '',
  telephone text not null default '',
  whatsapp text not null default '',
  ninea text not null default '',
  rccm text not null default '',
  adresse text not null default '',
  ville text not null default '',
  pays text not null default '',
  solde numeric not null default 0,
  created_at timestamptz not null default now()
);

-- =========================================================
-- devis
-- =========================================================
create table if not exists devis (
  id uuid primary key default gen_random_uuid(),
  numero text not null,
  date date not null default current_date,
  client_id uuid references clients(id) on delete set null,
  objet text not null default '',
  lignes jsonb not null default '[]'::jsonb,
  template_id text not null default 'classique',
  notes text not null default '',
  mode_transport text not null default 'Maritime',
  incoterm text not null default 'FOB',
  port_embarquement text not null default '',
  port_debarquement text not null default '',
  numero_conteneur text not null default '',
  numero_titre_transport text not null default '',
  poids_brut numeric not null default 0,
  poids_net numeric not null default 0,
  volume_cbm numeric not null default 0,
  nature_marchandise text not null default '',
  regime_douanier text not null default 'Import',
  numero_declaration text not null default '',
  devise text not null default 'XOF',
  taux_tva numeric not null default 18,
  remise_globale_pct numeric not null default 0,
  timbre_fiscal numeric not null default 0,
  retenue_source_pct numeric not null default 0,
  mode_reglement text not null default 'Virement bancaire',
  conditions_paiement text not null default '',
  statut text not null default 'Brouillon',
  validite_jours int not null default 30,
  created_at timestamptz not null default now()
);

-- =========================================================
-- factures
-- =========================================================
create table if not exists factures (
  id uuid primary key default gen_random_uuid(),
  numero text not null,
  date date not null default current_date,
  client_id uuid references clients(id) on delete set null,
  objet text not null default '',
  lignes jsonb not null default '[]'::jsonb,
  template_id text not null default 'classique',
  notes text not null default '',
  mode_transport text not null default 'Maritime',
  incoterm text not null default 'FOB',
  port_embarquement text not null default '',
  port_debarquement text not null default '',
  numero_conteneur text not null default '',
  numero_titre_transport text not null default '',
  poids_brut numeric not null default 0,
  poids_net numeric not null default 0,
  volume_cbm numeric not null default 0,
  nature_marchandise text not null default '',
  regime_douanier text not null default 'Import',
  numero_declaration text not null default '',
  devise text not null default 'XOF',
  taux_tva numeric not null default 18,
  remise_globale_pct numeric not null default 0,
  timbre_fiscal numeric not null default 0,
  retenue_source_pct numeric not null default 0,
  mode_reglement text not null default 'Virement bancaire',
  conditions_paiement text not null default '',
  statut text not null default 'Brouillon',
  type text not null default 'Vente',
  echeance date not null default current_date,
  montant_paye numeric not null default 0,
  devis_origine_id uuid references devis(id) on delete set null,
  created_at timestamptz not null default now()
);

-- =========================================================
-- écritures comptables
-- =========================================================
create table if not exists ecritures (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  libelle text not null default '',
  reference text not null default '',
  type text not null default 'Entrée',
  categorie text not null default '',
  montant numeric not null default 0,
  created_at timestamptz not null default now()
);

-- =========================================================
-- templates de documents
-- =========================================================
create table if not exists templates (
  id text primary key,
  nom text not null default '',
  description text not null default '',
  skin text not null default 'classique',
  builtin boolean not null default false,
  created_at timestamptz not null default now()
);

-- =========================================================
-- attributs personnalisés
-- =========================================================
create table if not exists attributs (
  id uuid primary key default gen_random_uuid(),
  nom text not null default '',
  type text not null default 'texte',
  cibles text[] not null default '{}',
  defaut text not null default '',
  created_at timestamptz not null default now()
);

-- =========================================================
-- Row Level Security
-- Usage interne mono-société : tout utilisateur authentifié
-- (vous, puis vos collègues plus tard) a accès complet.
-- =========================================================
alter table societe enable row level security;
alter table clients enable row level security;
alter table devis enable row level security;
alter table factures enable row level security;
alter table ecritures enable row level security;
alter table templates enable row level security;
alter table attributs enable row level security;

create policy "authenticated full access" on societe
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "authenticated full access" on clients
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "authenticated full access" on devis
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "authenticated full access" on factures
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "authenticated full access" on ecritures
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "authenticated full access" on templates
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "authenticated full access" on attributs
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- =========================================================
-- Données de départ (société vide + templates intégrés)
-- =========================================================
insert into societe (id) values (1) on conflict (id) do nothing;

insert into templates (id, nom, description, skin, builtin) values
  ('classique', 'Classique', 'Sobre, noir & blanc', 'classique', true),
  ('moderne', 'Moderne', 'Bleu corporate', 'moderne', true),
  ('senegal-export', 'Sénégal Export', 'Vert, bandeau douane', 'senegal-export', true)
on conflict (id) do nothing;
