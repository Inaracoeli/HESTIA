-- Hestia : guides adaptables, matériel manquant, e-mail des membres.

alter table hestia.membres add column if not exists email text;
alter table hestia.foyers add column if not exists materiel_absent text[] not null default '{}';
alter table hestia.taches add column if not exists questions jsonb not null default '[]';
alter table hestia.taches add column if not exists choix jsonb not null default '{}';
alter table hestia.taches add column if not exists alternatives jsonb not null default '{}';

-- E-mail de l'administrateur actuel
update hestia.membres m set email = lower(u.email) from auth.users u where u.id = m.user_id and m.email is null;

-- ---------- Tailler les haies ----------
update hestia.taches set
  outils = array['Taille-haie ou cisaille', 'Gants', 'Lunettes de protection', 'Bâche', 'Cordeau et 2 piquets'],
  alternatives = '{
    "Taille-haie ou cisaille": "Empruntez-en un, ou louez un taille-haie à la journée en magasin de bricolage.",
    "Gants": "Indispensables : une paire de gants de jardin coûte quelques euros.",
    "Lunettes de protection": "Des lunettes de soleil enveloppantes protègent déjà des projections.",
    "Bâche": "Un vieux drap, ou un ramassage au râteau ensuite.",
    "Cordeau et 2 piquets": "Une ficelle tendue entre deux bâtons fait très bien l’affaire."
  }'::jsonb,
  questions = '[
    {"id": "type", "label": "Quel type de haie ?", "options": [
      {"v": "persistante", "l": "Persistante à petites feuilles (thuya, cyprès, if, troène)"},
      {"v": "laurier", "l": "À grandes feuilles (laurier-palme, photinia)"},
      {"v": "caduque", "l": "Qui perd ses feuilles (charme, hêtre, noisetier)"},
      {"v": "fleurie", "l": "Fleurie (forsythia, spirée, seringat)"}
    ]},
    {"id": "outil", "label": "Avec quoi taillez-vous ?", "options": [
      {"v": "taillehaie", "l": "Taille-haie"},
      {"v": "cisaille", "l": "Cisaille ou sécateur"}
    ]}
  ]'::jsonb,
  etapes = '{
    "debutant": [
      "Vérifiez qu’aucun oiseau ne niche dans la haie : de mi-mars à fin juillet, mieux vaut ne pas tailler.",
      {"t": "Taillez juste après la floraison : plus tard, vous couperiez les boutons des fleurs de l’an prochain.", "si": {"type": ["fleurie"]}},
      {"t": "La veille, chargez la batterie ou vérifiez la rallonge du taille-haie.", "si": {"outil": ["taillehaie"]}},
      "Mettez gants et lunettes, puis étalez la bâche au pied de la haie.",
      {"t": "Gardez toujours le câble derrière vous, jamais devant la lame.", "si": {"outil": ["taillehaie"]}},
      "Taillez d’abord les côtés, de bas en haut, en légère pente : la base un peu plus large que le haut, pour que la lumière atteigne le bas.",
      {"t": "Restez dans la partie verte : un thuya ou un cyprès ne repousse pas sur le bois brun nu.", "si": {"type": ["persistante"]}},
      {"t": "Taillez au sécateur, branche par branche : le taille-haie coupe les grandes feuilles en deux, qui brunissent ensuite.", "si": {"type": ["laurier"]}},
      {"t": "Coupez à environ 5 mm au-dessus d’un bourgeon ou d’une feuille, en biais : la repousse part de là.", "si": {"outil": ["cisaille"]}},
      "Taillez par petites touches : on peut toujours retirer, jamais remettre.",
      "Tendez le cordeau entre les deux piquets à la hauteur voulue, puis taillez le dessus en le suivant.",
      "Faites une pause toutes les 20 minutes : les bras fatiguent et la coupe devient moins nette.",
      "Repliez la bâche pour ramasser les déchets : compost ou déchetterie."
    ],
    "intermediaire": [
      "Vérifiez qu’aucun oiseau ne niche (de mi-mars à fin juillet, on évite de tailler).",
      {"t": "Taillez juste après la floraison.", "si": {"type": ["fleurie"]}},
      "Gants, lunettes, bâche au pied de la haie.",
      "Côtés d’abord, de bas en haut, en légère pente (base plus large).",
      {"t": "Ne coupez pas dans le bois brun : il ne repousse pas.", "si": {"type": ["persistante"]}},
      {"t": "Au sécateur, pour ne pas couper les feuilles en deux.", "si": {"type": ["laurier"]}},
      {"t": "Coupe en biais, 5 mm au-dessus d’un bourgeon.", "si": {"outil": ["cisaille"]}},
      "Dessus au cordeau.",
      "Ramassez avec la bâche."
    ],
    "expert": [
      "Hors nidification ; côtés en pente puis dessus au cordeau.",
      {"t": "Juste après floraison.", "si": {"type": ["fleurie"]}},
      {"t": "Pas de coupe dans le bois brun.", "si": {"type": ["persistante"]}},
      {"t": "Au sécateur.", "si": {"type": ["laurier"]}}
    ]
  }'::jsonb
where modele = 'haies';

-- ---------- Filtres de la pompe à chaleur (gainable) ----------
update hestia.taches set
  outils = array['Aspirateur', 'Escabeau', 'Tournevis (selon la grille)'],
  alternatives = '{
    "Aspirateur": "Tapotez le filtre dehors pour faire tomber la poussière, puis rincez-le à l’eau tiède.",
    "Escabeau": "Évitez la chaise : empruntez un escabeau à un voisin.",
    "Tournevis (selon la grille)": "Une pièce de monnaie suffit souvent pour les vis à fente."
  }'::jsonb,
  questions = '[
    {"id": "emplacement", "label": "Où sont vos filtres ?", "options": [
      {"v": "grille", "l": "Derrière une grande grille de reprise (plafond ou mur)"},
      {"v": "caisson", "l": "Dans le caisson de l’unité intérieure (combles, faux plafond)"},
      {"v": "inconnu", "l": "Je ne sais pas"}
    ]}
  ]'::jsonb,
  etapes = '{
    "debutant": [
      "Coupez la pompe à chaleur depuis le thermostat ou la télécommande.",
      {"t": "Cherchez la plus grande grille de la maison, souvent dans un couloir : c’est la reprise d’air. Sinon, demandez au chauffagiste de vous montrer les filtres lors de l’entretien.", "si": {"emplacement": ["inconnu"]}},
      "Prenez une photo avant de démonter : elle servira au remontage.",
      {"t": "Ouvrez la grille de reprise (clips ou vis) et sortez le filtre.", "si": {"emplacement": ["grille", "inconnu"]}},
      {"t": "Accédez au caisson et faites glisser le filtre hors de son logement, en notant son sens.", "si": {"emplacement": ["caisson"]}},
      "Aspirez la poussière côté entrée d’air.",
      "Si le filtre est lavable, rincez-le à l’eau tiède, sans produit.",
      "Laissez-le sécher complètement à l’air libre, jamais au soleil ni sur un radiateur.",
      "S’il est abîmé ou déchiré, notez sa référence : il se remplace.",
      "Remettez-le dans le bon sens, refermez, rallumez."
    ],
    "intermediaire": [
      "Coupez la pompe à chaleur.",
      {"t": "Repérez la grande grille de reprise d’air (souvent dans un couloir).", "si": {"emplacement": ["inconnu"]}},
      {"t": "Ouvrez la grille de reprise, sortez le filtre.", "si": {"emplacement": ["grille", "inconnu"]}},
      {"t": "Sortez le filtre du caisson en notant son sens.", "si": {"emplacement": ["caisson"]}},
      "Aspirez, puis rincez à l’eau tiède si lavable.",
      "Séchage complet à l’air libre, remontage, remise en route."
    ],
    "expert": [
      "Couper, déposer, aspirer et rincer les filtres.",
      "Séchage complet, remontage dans le bon sens."
    ]
  }'::jsonb
where modele = 'pac-filtres';

-- ---------- Pression des pneus ----------
update hestia.taches set
  outils = array['Manomètre', 'Compresseur'],
  alternatives = '{
    "Manomètre": "La station de gonflage d’une station-service mesure et gonfle (souvent gratuite ou à petit prix).",
    "Compresseur": "La station de gonflage d’une station-service fait l’affaire."
  }'::jsonb,
  questions = '[
    {"id": "lieu", "label": "Où gonflez-vous ?", "options": [
      {"v": "maison", "l": "À la maison, au compresseur"},
      {"v": "station", "l": "En station-service"}
    ]}
  ]'::jsonb,
  etapes = '{
    "debutant": [
      "Relevez la pression conseillée : étiquette sur l’encadrement de la portière conducteur, ou carnet du véhicule. Elle diffère souvent entre l’avant et l’arrière.",
      "Voiture électrique : la valeur conseillée est souvent un peu plus élevée, suivez bien l’étiquette.",
      {"t": "Mesurez pneus froids, avant de rouler.", "si": {"lieu": ["maison"]}},
      {"t": "Allez à la station la plus proche : si vous avez roulé plus de quelques kilomètres, ajoutez 0,3 bar à la valeur conseillée.", "si": {"lieu": ["station"]}},
      "Dévissez le bouchon de la valve et posez l’embout bien droit.",
      "Lisez la pression, puis ajoutez ou retirez de l’air jusqu’à la bonne valeur.",
      "Revissez le bouchon et passez à la roue suivante : les quatre, plus la roue de secours si vous en avez une.",
      "Regardez l’usure : les petits témoins au fond des rainures ne doivent pas affleurer."
    ],
    "intermediaire": [
      "Relevez la pression conseillée (portière conducteur), avant et arrière.",
      {"t": "Mesurez à froid.", "si": {"lieu": ["maison"]}},
      {"t": "Pneus chauds : + 0,3 bar.", "si": {"lieu": ["station"]}},
      "Ajustez les quatre roues (et la roue de secours).",
      "Coup d’œil aux témoins d’usure."
    ],
    "expert": [
      "Contrôle et ajustement des quatre roues.",
      "Usure et flancs."
    ]
  }'::jsonb
where modele = 'pneus';

-- ---------- Vider les gouttières ----------
update hestia.taches set
  outils = array['Échelle', 'Gants', 'Seau', 'Tuyau d’arrosage'],
  alternatives = '{
    "Échelle": "Une perche de nettoyage de gouttières permet de travailler depuis le sol.",
    "Gants": "Indispensables : feuilles et mousses cachent souvent des débris coupants.",
    "Seau": "Un sac poubelle solide accroché à l’échelle.",
    "Tuyau d’arrosage": "Un arrosoir suffit pour vérifier l’écoulement."
  }'::jsonb,
  questions = '[
    {"id": "hauteur", "label": "À quelle hauteur sont les gouttières ?", "options": [
      {"v": "plainpied", "l": "Plain-pied"},
      {"v": "etage", "l": "À l’étage"}
    ]}
  ]'::jsonb,
  etapes = '{
    "debutant": [
      {"t": "À l’étage, l’échelle devient risquée : si vous n’êtes pas à l’aise, faites-le faire, ou utilisez une perche depuis le sol.", "si": {"hauteur": ["etage"]}},
      "Posez l’échelle sur un sol plat et stable, inclinée d’environ 75°, et faites-vous aider pour la tenir.",
      "Accrochez le seau à l’échelle et mettez les gants.",
      "Retirez feuilles et mousses à la main, en avançant vers la descente.",
      "Déplacez l’échelle plutôt que de vous pencher.",
      "Rincez au jet, depuis le bout opposé à la descente.",
      "Vérifiez en bas que l’eau sort bien ; si elle stagne, la descente est bouchée."
    ],
    "intermediaire": [
      {"t": "À l’étage : perche ou professionnel si besoin.", "si": {"hauteur": ["etage"]}},
      "Échelle stable, tenue par quelqu’un.",
      "Retirez les débris, rincez au jet.",
      "Vérifiez l’écoulement en bas de la descente."
    ],
    "expert": ["Curer, rincer, contrôler la descente."]
  }'::jsonb
where modele = 'gouttieres';

-- ---------- Détecteurs de fumée ----------
update hestia.taches set
  outils = array['Escabeau', 'Piles de rechange'],
  alternatives = '{
    "Escabeau": "Un manche à balai suffit souvent pour appuyer sur le bouton test.",
    "Piles de rechange": "Notez le modèle de pile au dos du détecteur avant d’en acheter."
  }'::jsonb,
  etapes = '{
    "debutant": [
      "Appuyez quelques secondes sur le bouton test de chaque détecteur : il doit sonner fort.",
      "S’il ne sonne pas ou faiblement, changez la pile, ou le détecteur si sa pile n’est pas remplaçable.",
      "Dépoussiérez le capot à l’aspirateur ou au chiffon sec.",
      "Regardez la date de fin de vie au dos : un détecteur se remplace en général au bout d’une dizaine d’années."
    ],
    "intermediaire": ["Testez chaque détecteur.", "Changez les piles faibles.", "Dépoussiérez, vérifiez la date de fin de vie."],
    "expert": ["Test, pile, dépoussiérage."]
  }'::jsonb
where modele = 'detecteurs';

-- ---------- Essuie-glaces ----------
update hestia.taches set
  outils = array['Balais neufs à la bonne longueur', 'Chiffon'],
  alternatives = '{
    "Balais neufs à la bonne longueur": "La longueur est indiquée dans le carnet du véhicule ; les magasins auto la retrouvent aussi à partir du modèle.",
    "Chiffon": "Une serviette pliée protège aussi bien le pare-brise."
  }'::jsonb,
  etapes = '{
    "debutant": [
      "Posez un chiffon plié sur le pare-brise : un bras qui retombe peut le fissurer.",
      "Relevez le bras d’essuie-glace.",
      "Appuyez sur le clip et faites glisser l’ancien balai hors du crochet.",
      "Clipsez le balai neuf jusqu’au déclic.",
      "Reposez doucement le bras, puis faites l’autre côté."
    ],
    "intermediaire": ["Chiffon sur le pare-brise.", "Déclipsez l’ancien balai, clipsez le neuf.", "Reposez le bras en douceur."],
    "expert": ["Remplacer les balais (chiffon sur le pare-brise)."]
  }'::jsonb
where modele = 'essuie-glaces';

-- ---------- Entretien de la pompe à chaleur (obligatoire) ----------
update hestia.taches set
  intervalle_jours = 730,
  periode_label = 'Tous les 2 ans (obligatoire)',
  budget = 200,
  etapes = '{
    "debutant": [
      "Prenez rendez-vous avec un professionnel qualifié pour les pompes à chaleur : l’entretien est obligatoire au moins tous les deux ans (décret n° 2020-912).",
      "Demandez-lui de vous montrer où sont les filtres et comment les nettoyer.",
      "Gardez l’attestation d’entretien qu’il vous remet, et notez la visite dans le carnet."
    ],
    "intermediaire": ["Rendez-vous avec un professionnel (obligatoire tous les 2 ans).", "Gardez l’attestation d’entretien."],
    "expert": ["Rendez-vous professionnel, attestation à conserver."]
  }'::jsonb
where modele = 'pac-entretien';
