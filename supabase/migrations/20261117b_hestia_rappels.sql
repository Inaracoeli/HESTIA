-- 1. Base propre : les fiches des tâches du catalogue (étapes, questions, solutions
--    de remplacement) viennent du code ; on ne garde plus de copie en base.
update hestia.taches
   set etapes = default, questions = default, alternatives = default
 where modele is not null;

-- 2. Rappel du week-end : réglages par personne.
alter table hestia.reglages
  add column if not exists rappel_actif boolean not null default false,
  add column if not exists rappel_jour smallint not null default 5 check (rappel_jour between 0 and 6),
  add column if not exists rappel_heure text not null default '12:00' check (rappel_heure ~ '^[0-2][0-9]:[0-5][0-9]$'),
  add column if not exists rappel_envoye_le date;

-- 3. Appareils abonnés aux notifications.
create table if not exists hestia.abonnements_push (
  endpoint text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
create index if not exists abonnements_push_user_idx on hestia.abonnements_push (user_id);
alter table hestia.abonnements_push enable row level security;
create policy "chacun ses appareils" on hestia.abonnements_push for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
grant select, insert, update, delete on hestia.abonnements_push to authenticated;

-- 4. Clés privées (VAPID, secret de la tâche planifiée) : lisibles par le serveur seulement.
create table if not exists hestia_prive.cles (nom text primary key, valeur text not null);
alter table hestia_prive.cles enable row level security;
insert into hestia_prive.cles (nom, valeur) values ('cron', gen_random_uuid()::text) on conflict (nom) do nothing;

create or replace function hestia_prive.cles_rappel() returns json
language sql security definer set search_path = '' as $$
  select coalesce(json_object_agg(nom, valeur), '{}'::json) from hestia_prive.cles;
$$;
create or replace function hestia_prive.enregistrer_cle_rappel(n text, v text) returns void
language sql security definer set search_path = '' as $$
  insert into hestia_prive.cles (nom, valeur) values (n, v) on conflict (nom) do nothing;
$$;
revoke execute on function hestia_prive.cles_rappel() from public, anon, authenticated;
revoke execute on function hestia_prive.enregistrer_cle_rappel(text, text) from public, anon, authenticated;

-- Le serveur (fonction hestia-rappel) y accède par des fonctions exposées au seul rôle service.
create or replace function hestia.cles_rappel() returns json
language sql security definer set search_path = '' as $$ select hestia_prive.cles_rappel(); $$;
create or replace function hestia.enregistrer_cle_rappel(n text, v text) returns void
language sql security definer set search_path = '' as $$ select hestia_prive.enregistrer_cle_rappel(n, v); $$;
revoke execute on function hestia.cles_rappel() from public, anon, authenticated;
revoke execute on function hestia.enregistrer_cle_rappel(text, text) from public, anon, authenticated;
grant execute on function hestia.cles_rappel() to service_role;
grant execute on function hestia.enregistrer_cle_rappel(text, text) to service_role;

-- 5. Toutes les 15 minutes, la fonction regarde qui doit recevoir son rappel.
create or replace function hestia_prive.lancer_rappels() returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform net.http_post(
    url := 'https://urjvkxzfrakrexvhvxbd.supabase.co/functions/v1/hestia-rappel',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-rappel', (select valeur from hestia_prive.cles where nom = 'cron')),
    body := '{}'::jsonb
  );
end;
$$;
revoke execute on function hestia_prive.lancer_rappels() from public, anon, authenticated;
select cron.schedule('hestia-rappel', '*/15 * * * *', 'select hestia_prive.lancer_rappels()');
