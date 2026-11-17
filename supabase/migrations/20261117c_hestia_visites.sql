-- Reprise en douceur par foyer : dernière visite (tous membres confondus) et semaine de reprise en cours.
alter table hestia.foyers
  add column if not exists derniere_visite date,
  add column if not exists douceur_semaine date,
  add column if not exists douceur_type text check (douceur_type in ('debut', 'retour'));

-- Tout membre peut noter sa visite (la modification du foyer reste réservée à l'administrateur).
create or replace function hestia.enregistrer_visite(f uuid, visite date, semaine date, type text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not hestia_prive.est_membre(f) then
    raise exception 'Accès refusé';
  end if;
  update hestia.foyers
     set derniere_visite = greatest(coalesce(derniere_visite, visite), visite),
         douceur_semaine = case when type is null then douceur_semaine else semaine end,
         douceur_type = case when type is null then douceur_type else type end
   where id = f;
end;
$$;
revoke execute on function hestia.enregistrer_visite(uuid, date, date, text) from public, anon;
grant execute on function hestia.enregistrer_visite(uuid, date, date, text) to authenticated;
