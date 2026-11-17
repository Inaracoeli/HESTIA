-- Revue du 17/11 : petits durcissements et index.

-- Les fonctions de déclencheur n'ont pas à être appelables directement.
revoke execute on function hestia_prive.maj_derniere_fois() from public, anon, authenticated;
revoke execute on function hestia_prive.recalcule_derniere_fois() from public, anon, authenticated;
revoke execute on function hestia_prive.memorise_precedente() from public, anon, authenticated;

-- Une réalisation est toujours enregistrée au nom de la personne connectée.
drop policy if exists "membres gèrent le carnet" on hestia.realisations;
create policy "membres gèrent le carnet" on hestia.realisations for all to authenticated
  using (hestia_prive.est_membre(foyer_id))
  with check (
    hestia_prive.est_membre(foyer_id)
    and user_id = (select auth.uid())
    and exists (select 1 from hestia.taches t where t.id = realisations.tache_id and t.foyer_id = realisations.foyer_id)
  );

-- Index sur les clés étrangères signalées par Supabase.
create index if not exists planifications_foyer_idx on hestia.planifications (foyer_id);
create index if not exists realisations_user_idx on hestia.realisations (user_id);
