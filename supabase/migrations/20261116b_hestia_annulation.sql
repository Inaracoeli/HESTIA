-- Hestia : annuler un « C'est fait » sans perdre la date du passage précédent.

alter table hestia.realisations add column if not exists precedente date;

-- Avant chaque validation, on garde la date du dernier passage connue jusque-là.
create or replace function hestia_prive.memorise_precedente() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  select t.derniere_fois into new.precedente from hestia.taches t where t.id = new.tache_id;
  return new;
end;
$$;
drop trigger if exists realisations_memorise on hestia.realisations;
create trigger realisations_memorise before insert on hestia.realisations
for each row execute function hestia_prive.memorise_precedente();

-- À la suppression : dernier passage restant, sinon la date d'avant la validation annulée.
create or replace function hestia_prive.recalcule_derniere_fois() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  restant date;
begin
  select max(r.fait_le) into restant from hestia.realisations r where r.tache_id = old.tache_id;
  update hestia.taches t
  -- greatest ignore les valeurs vides : on garde la plus récente des deux dates connues.
  set derniere_fois = coalesce(greatest(restant, old.precedente), t.derniere_fois)
  where t.id = old.tache_id;
  return old;
end;
$$;
