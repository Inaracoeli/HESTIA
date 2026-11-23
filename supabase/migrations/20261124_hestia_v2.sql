-- Hestia V2 : produits ménagers et liste de courses, épargne (objectifs), coffre des appareils
-- avec factures et notices, et répartition des tâches entre membres.
-- Tout est cloisonné par foyer, comme le reste (hestia_prive.est_membre).

-- 1. Produits ménagers et consommables. La liste de courses = ce qui est « bientôt fini » ou « fini »,
--    plus des articles ponctuels (supprimés une fois achetés).
create table hestia.produits (
  id uuid primary key default gen_random_uuid(),
  foyer_id uuid not null references hestia.foyers(id) on delete cascade,
  nom text not null check (length(nom) between 1 and 80),
  categorie text not null default 'menage' check (categorie in ('menage', 'linge', 'cuisine', 'salle_de_bain', 'consommable', 'jardin', 'voiture', 'autre')),
  etat text not null default 'ok' check (etat in ('ok', 'bientot', 'vide')),
  ponctuel boolean not null default false,
  note text check (length(note) <= 200),
  created_at timestamptz not null default now()
);
create index on hestia.produits (foyer_id);

-- 2. Épargne d'auto-assurance : des objectifs, avec le montant déjà mis de côté.
create table hestia.enveloppes (
  id uuid primary key default gen_random_uuid(),
  foyer_id uuid not null references hestia.foyers(id) on delete cascade,
  nom text not null check (length(nom) between 1 and 60),
  icone text not null default 'autre' check (icone in ('voiture', 'maison', 'electromenager', 'animaux', 'jardin', 'sante', 'autre')),
  objectif numeric(10, 2) not null default 0 check (objectif >= 0),
  actuel numeric(10, 2) not null default 0 check (actuel >= 0),
  note text check (length(note) <= 200),
  ordre smallint not null default 0,
  created_at timestamptz not null default now()
);
create index on hestia.enveloppes (foyer_id);

-- 3. Coffre des appareils, et leurs documents (factures, notices, photos) dans le stockage privé.
create table hestia.appareils (
  id uuid primary key default gen_random_uuid(),
  foyer_id uuid not null references hestia.foyers(id) on delete cascade,
  nom text not null check (length(nom) between 1 and 80),
  categorie text not null default 'electromenager' check (categorie in ('electromenager', 'chauffage', 'multimedia', 'jardin', 'vehicule', 'outillage', 'autre')),
  marque text check (length(marque) <= 60),
  modele text check (length(modele) <= 80),
  date_achat date,
  garantie_mois smallint check (garantie_mois between 0 and 240),
  prix numeric(10, 2) check (prix >= 0),
  vendeur text check (length(vendeur) <= 80),
  notice_url text check (notice_url ~ '^https?://' and length(notice_url) <= 500),
  note text check (length(note) <= 500),
  created_at timestamptz not null default now()
);
create index on hestia.appareils (foyer_id);

create table hestia.documents (
  id uuid primary key default gen_random_uuid(),
  foyer_id uuid not null references hestia.foyers(id) on delete cascade,
  appareil_id uuid not null references hestia.appareils(id) on delete cascade,
  type text not null default 'facture' check (type in ('facture', 'notice', 'photo', 'autre')),
  nom text not null check (length(nom) between 1 and 120),
  chemin text not null unique,
  mime text not null,
  taille integer not null check (taille > 0 and taille <= 15728640),
  created_at timestamptz not null default now(),
  -- Le fichier est rangé dans le dossier du foyer
  check (split_part(chemin, '/', 1) = foyer_id::text)
);
create index on hestia.documents (appareil_id);

-- 4. Répartition : qui s'occupe d'une tâche (facultatif).
alter table hestia.taches add column if not exists assigne_a uuid references auth.users(id) on delete set null;

-- Droits et cloisonnement
alter table hestia.produits enable row level security;
alter table hestia.enveloppes enable row level security;
alter table hestia.appareils enable row level security;
alter table hestia.documents enable row level security;
create policy "membres gèrent les produits" on hestia.produits for all to authenticated
  using (hestia_prive.est_membre(foyer_id)) with check (hestia_prive.est_membre(foyer_id));
create policy "membres gèrent l'épargne" on hestia.enveloppes for all to authenticated
  using (hestia_prive.est_membre(foyer_id)) with check (hestia_prive.est_membre(foyer_id));
create policy "membres gèrent les appareils" on hestia.appareils for all to authenticated
  using (hestia_prive.est_membre(foyer_id)) with check (hestia_prive.est_membre(foyer_id));
create policy "membres gèrent les documents" on hestia.documents for all to authenticated
  using (hestia_prive.est_membre(foyer_id))
  with check (hestia_prive.est_membre(foyer_id) and exists (select 1 from hestia.appareils a where a.id = appareil_id and a.foyer_id = documents.foyer_id));
grant select, insert, update, delete on hestia.produits, hestia.enveloppes, hestia.appareils, hestia.documents to authenticated;

-- Stockage privé des documents : un dossier par foyer, 15 Mo par fichier, images et PDF.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('hestia-documents', 'hestia-documents', false, 15728640,
        array['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;

create or replace function hestia_prive.dossier_du_foyer(nom text) returns boolean
language sql stable security definer set search_path = '' as $$
  select case
    when (storage.foldername(nom))[1] ~ '^[0-9a-f-]{36}$' then hestia_prive.est_membre(((storage.foldername(nom))[1])::uuid)
    else false
  end
$$;
grant execute on function hestia_prive.dossier_du_foyer(text) to authenticated;

create policy "hestia : lire les documents du foyer" on storage.objects for select to authenticated
  using (bucket_id = 'hestia-documents' and hestia_prive.dossier_du_foyer(name));
create policy "hestia : déposer dans le dossier du foyer" on storage.objects for insert to authenticated
  with check (bucket_id = 'hestia-documents' and hestia_prive.dossier_du_foyer(name));
create policy "hestia : supprimer les documents du foyer" on storage.objects for delete to authenticated
  using (bucket_id = 'hestia-documents' and hestia_prive.dossier_du_foyer(name));
