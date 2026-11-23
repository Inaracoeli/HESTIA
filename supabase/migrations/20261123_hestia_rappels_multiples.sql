-- Rappels multiples, comme les alarmes de l'iPhone : chaque rappel a ses jours, son heure,
-- et s'active ou non. Par défaut : vendredi, samedi et dimanche à 11 h.
-- « rappel_actif » reste l'interrupteur général (appareil abonné ou non).
alter table hestia.reglages
  add column if not exists rappels jsonb not null
    default '[{"id":"we","jours":[5,6,0],"heure":"11:00","actif":true}]'::jsonb
    check (jsonb_typeof(rappels) = 'array' and jsonb_array_length(rappels) <= 20),
  add column if not exists rappels_envoyes jsonb not null default '{}'::jsonb
    check (jsonb_typeof(rappels_envoyes) = 'object');

-- « Pression des pneus » devient « État et pression des pneus » (fiche enrichie : usure, flancs, âge).
update hestia.taches set titre = 'État et pression des pneus'
 where modele = 'pneus' and titre = 'Pression des pneus';
