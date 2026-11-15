-- Hestia : profil du foyer, saisons, carnet d'entretien, retour de fin de semaine.

alter table hestia.foyers add column if not exists profil jsonb;
alter table hestia.taches add column if not exists mois smallint[];

-- Retour de fin de semaine (un par personne et par semaine)
create table if not exists hestia.retours (
  user_id uuid not null references auth.users(id) on delete cascade,
  semaine date not null,
  foyer_id uuid not null references hestia.foyers(id) on delete cascade,
  avis text not null check (avis in ('trop', 'bien', 'pas_assez')),
  created_at timestamptz not null default now(),
  primary key (user_id, semaine)
);
create index if not exists retours_foyer_idx on hestia.retours(foyer_id);
grant select, insert, update, delete on hestia.retours to authenticated;
grant all on hestia.retours to service_role;
alter table hestia.retours enable row level security;
create policy "chacun ses retours" on hestia.retours for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and hestia_prive.est_membre(foyer_id));

-- Supprimer une entrée du carnet recalcule la date du dernier passage.
create or replace function hestia_prive.recalcule_derniere_fois() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update hestia.taches t
  set derniere_fois = (select max(r.fait_le) from hestia.realisations r where r.tache_id = old.tache_id)
  where t.id = old.tache_id
    and (select max(r.fait_le) from hestia.realisations r where r.tache_id = old.tache_id) is not null;
  return old;
end;
$$;
drop trigger if exists realisations_recalcule on hestia.realisations;
create trigger realisations_recalcule after delete on hestia.realisations
for each row execute function hestia_prive.recalcule_derniere_fois();
