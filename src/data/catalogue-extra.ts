// Catalogue Hestia, deuxième partie : ménage de fond, chaussures, et équipements moins courants.
// Repères courants (non légaux), réglables dans « Mes tâches ».
import type { Domain, Importance, Question, Step } from './types';
import type { Profile, Template } from './catalogue';

type Lvl = { d: Step[]; i: Step[]; e: Step[] };

function make(
  id: string, title: string, domain: Domain, importance: Importance, intervalDays: number, periodLabel: string,
  minutes: number, steps: Lvl,
  o: { budget?: number; difficulty?: 1 | 2 | 3 | 4; pro?: boolean; months?: number[]; tools?: string[]; alternatives?: Record<string, string>; questions?: Question[]; choicesFrom?: (p: Profile) => Record<string, string> } = {},
): Template {
  return {
    id, title, domain, importance, intervalDays, periodLabel, minutes,
    budget: o.budget ?? 0, difficulty: o.difficulty ?? 1, pro: o.pro ?? false, months: o.months,
    tools: o.tools ?? [], alternatives: o.alternatives ?? {}, questions: o.questions ?? [], choicesFrom: o.choicesFrom,
    steps: { debutant: steps.d, intermediaire: steps.i, expert: steps.e },
  };
}

const has = (list: string[] | undefined, ...v: string[]) => v.some((x) => (list ?? []).includes(x));
const house = (p: Profile) => p.logement === 'maison';
const menage = (p: Profile) => has(p.extras, 'menage');
const anyCar = (p: Profile) => has(p.vehicules, 'thermique', 'electrique');
const VINAIGRE = { 'Vinaigre blanc': 'De l’acide citrique dilué dans de l’eau chaude fait le même travail, sans odeur.' };

export const CATALOGUE_EXTRA: { template: Template; when: (p: Profile) => boolean }[] = [
  /* =================== Sécurité =================== */
  {
    when: (p) => has(p.chauffage, 'chaudiere_gaz', 'chaudiere_fioul', 'poele', 'cheminee'),
    template: make('detecteur-co', 'Tester le détecteur de monoxyde de carbone', 'maison', 1, 30, 'Tous les mois', 5, {
      d: [
        'Avec un appareil à combustion (chaudière, poêle, cheminée), un détecteur de monoxyde de carbone est vivement conseillé : ce gaz est invisible et sans odeur.',
        'Appuyez sur le bouton test : il doit sonner fort.',
        'Vérifiez la date de fin de vie au dos et remplacez-le à temps.',
        'S’il n’y en a pas, installez-en un dans la pièce de l’appareil, selon la notice.',
      ],
      i: ['Test du détecteur de monoxyde de carbone.', 'Contrôle de la date de fin de vie.'],
      e: ['Test du détecteur de CO.'],
    }, { tools: ['Détecteur de monoxyde de carbone'], alternatives: { 'Détecteur de monoxyde de carbone': 'À acheter en magasin de bricolage : comptez une vingtaine d’euros.' } }),
  },
  {
    when: () => true,
    template: make('pharmacie', 'Trier l’armoire à pharmacie', 'maison', 3, 365, 'Tous les ans', 20, {
      d: [
        'Sortez tout et regardez les dates de péremption.',
        'Rapportez les médicaments périmés ou inutiles en pharmacie : ils ne vont pas à la poubelle.',
        'Complétez l’essentiel : pansements, désinfectant, thermomètre, antidouleur.',
        'Rangez hors de portée des enfants.',
      ],
      i: ['Dates de péremption, retour des périmés en pharmacie.', 'Complétez l’essentiel, rangement hors de portée.'],
      e: ['Tri, retour en pharmacie, réassort.'],
    }),
  },

  /* =================== Équipements de la maison =================== */
  {
    when: (p) => has(p.equipements, 'seche_linge'),
    template: make('seche-linge', 'Nettoyer le condenseur du sèche-linge', 'maison', 3, 30, 'Tous les mois', 10, {
      d: [
        'Le filtre à peluches se vide à chaque séchage ; une fois par mois, on s’occupe aussi du condenseur.',
        'Ouvrez la trappe en bas de la façade et sortez le condenseur (ou rincez l’échangeur selon le modèle).',
        'Rincez-le à l’eau tiède jusqu’à ce qu’il n’y ait plus de peluches.',
        'Laissez égoutter et remettez-le bien verrouillé.',
      ],
      i: ['Condenseur sorti, rincé à l’eau tiède.', 'Remontage verrouillé.'],
      e: ['Rinçage du condenseur.'],
    }),
  },
  {
    when: (p) => has(p.equipements, 'volets'),
    template: make('volets', 'Nettoyer et vérifier les volets roulants', 'maison', 3, 365, 'Tous les ans', 45, {
      d: [
        'Descendez le volet presque entièrement.',
        'Lavez les lames à l’eau savonneuse avec une éponge, puis rincez.',
        'Nettoyez les coulisses avec un pinceau ou un aspirateur.',
        'Montez et descendez le volet : s’il force, frotte ou fait un bruit anormal, faites-le vérifier.',
      ],
      i: ['Lames lavées, coulisses dépoussiérées.', 'Contrôle de la manœuvre.'],
      e: ['Lavage et contrôle des volets.'],
    }, { months: [4, 5, 6, 9] }),
  },
  {
    when: house,
    template: make('serrures', 'Graisser les serrures, gonds et poignées', 'maison', 3, 365, 'Tous les ans', 20, {
      d: [
        'Repérez les portes qui grincent et les serrures qui forcent.',
        'Mettez une goutte de lubrifiant sur les gonds, puis ouvrez et fermez plusieurs fois.',
        'Pour les serrures, utilisez un lubrifiant spécial serrure (au graphite ou au PTFE) plutôt que de l’huile, qui attire la poussière.',
        'Essuyez l’excédent.',
      ],
      i: ['Lubrifiant sur les gonds, produit spécial serrure pour les cylindres.', 'Essuyez l’excédent.'],
      e: ['Lubrification gonds et serrures.'],
    }, { tools: ['Lubrifiant'], alternatives: { Lubrifiant: 'Pour un gond, une goutte d’huile de machine à coudre suffit.' } }),
  },
  {
    when: (p) => has(p.equipements, 'portail'),
    template: make('portail', 'Entretenir le portail motorisé', 'exterieur', 2, 365, 'Tous les ans', 30, {
      d: [
        'Coupez l’alimentation du moteur avant toute intervention.',
        'Dégagez le rail ou la zone de passage (feuilles, gravillons).',
        'Graissez les charnières ou le rail selon la notice.',
        'Remettez le courant et testez la sécurité : passez devant les cellules pendant la fermeture, le portail doit s’arrêter ou repartir.',
        'Si la sécurité ne réagit pas, n’utilisez plus l’automatisme et appelez un professionnel.',
      ],
      i: ['Courant coupé, rail dégagé, graissage selon la notice.', 'Test des cellules de sécurité.'],
      e: ['Graissage et test des sécurités.'],
    }),
  },
  {
    when: (p) => house(p) && has(p.equipements, 'store'),
    template: make('store', 'Nettoyer le store banne', 'exterieur', 4, 365, 'Tous les ans', 45, {
      d: [
        'Déroulez le store par temps sec.',
        'Brossez la toile à sec pour retirer poussière et feuilles.',
        'Lavez à l’eau tiède savonneuse avec une brosse douce, sans haute pression.',
        'Rincez et laissez sécher complètement, store déroulé, avant de le replier : replié humide, il moisit.',
      ],
      i: ['Brossage à sec, lavage doux, rinçage.', 'Séchage complet avant de replier.'],
      e: ['Lavage doux et séchage de la toile.'],
    }, { months: [4, 5] }),
  },
  {
    when: (p) => house(p) && has(p.equipements, 'recuperateur'),
    template: make('recuperateur', 'Vider le récupérateur d’eau avant le gel', 'exterieur', 2, 365, 'Chaque automne', 20, {
      d: ['Videz la cuve en arrosant une dernière fois.', 'Déconnectez-la de la gouttière, ou basculez le collecteur en position hiver.', 'Rincez le fond, laissez le robinet ouvert.'],
      i: ['Cuve vidée, collecteur en position hiver.', 'Robinet laissé ouvert.'],
      e: ['Mise hors gel du récupérateur.'],
    }, { months: [10, 11] }),
  },
  {
    when: (p) => house(p) && has(p.equipements, 'arrosage'),
    template: make('arrosage-hiver', 'Purger l’arrosage automatique avant le gel', 'exterieur', 2, 365, 'Chaque automne', 30, {
      d: ['Coupez l’arrivée d’eau du circuit d’arrosage.', 'Ouvrez les purges ou vannes de vidange prévues sur le circuit.', 'Rentrez le programmateur et retirez ses piles.'],
      i: ['Arrivée coupée, circuit purgé.', 'Programmateur rentré.'],
      e: ['Mise hors gel du circuit.'],
    }, { months: [10, 11] }),
  },
  {
    when: house,
    template: make('toiture', 'Inspecter la toiture depuis le sol', 'exterieur', 2, 365, 'Tous les ans', 15, {
      d: [
        'Faites le tour de la maison avec des jumelles, par temps sec.',
        'Cherchez les tuiles déplacées ou cassées, la mousse épaisse, les solins décollés autour de la cheminée.',
        'Au grenier, regardez s’il y a des traces d’humidité sous la toiture.',
        'Ne montez pas sur le toit : en cas de doute, faites venir un couvreur.',
      ],
      i: ['Tour aux jumelles : tuiles, mousse, solins.', 'Contrôle du grenier ; couvreur si doute.'],
      e: ['Inspection visuelle toiture et combles.'],
    }, { months: [9, 10, 3, 4] }),
  },
  {
    when: () => true,
    template: make('radiateurs-poussiere', 'Dépoussiérer radiateurs et grilles d’aération', 'maison', 3, 365, 'Chaque automne', 30, {
      d: ['Avant la saison de chauffe, passez l’aspirateur avec l’embout fin entre les éléments des radiateurs.', 'Dépoussiérez les grilles d’entrée d’air au-dessus des fenêtres, sans les boucher.', 'Un radiateur propre chauffe mieux.'],
      i: ['Radiateurs aspirés, entrées d’air dépoussiérées.'],
      e: ['Dépoussiérage avant chauffe.'],
    }, { months: [9, 10, 11], tools: ['Aspirateur'] }),
  },

  /* =================== Jardin =================== */
  {
    when: (p) => house(p) && has(p.exterieur, 'pelouse'),
    template: make('tondeuse', 'Entretenir la tondeuse', 'exterieur', 3, 365, 'Tous les ans, en fin d’hiver', 45, {
      d: [
        { t: 'Videz l’essence restante ou faites tourner le moteur jusqu’à l’arrêt, bougie débranchée ensuite.', si: { tondeuse: ['thermique'] } },
        { t: 'Retirez la batterie avant toute intervention.', si: { tondeuse: ['electrique'] } },
        'Couchez-la du bon côté (filtre à air vers le haut) et grattez l’herbe collée sous le carter.',
        { t: 'Vidangez l’huile et nettoyez le filtre à air selon la notice.', si: { tondeuse: ['thermique'] } },
        'Faites affûter ou changer la lame si elle arrache l’herbe au lieu de la couper.',
        { t: 'Robot : nettoyez le dessous, vérifiez les lames et la station de charge.', si: { tondeuse: ['robot'] } },
      ],
      i: [
        'Carter gratté, lame affûtée ou changée.',
        { t: 'Vidange d’huile et filtre à air.', si: { tondeuse: ['thermique'] } },
        { t: 'Lames et station de charge.', si: { tondeuse: ['robot'] } },
      ],
      e: ['Révision annuelle de la tondeuse.'],
    }, {
      months: [2, 3],
      questions: [{ id: 'tondeuse', label: 'Quelle tondeuse ?', options: [{ v: 'thermique', l: 'Thermique' }, { v: 'electrique', l: 'Électrique ou batterie' }, { v: 'robot', l: 'Robot' }] }],
    }),
  },
  {
    when: (p) => house(p) && has(p.exterieur, 'pelouse', 'arbres', 'haie'),
    template: make('outils-jardin', 'Nettoyer et ranger les outils de jardin', 'exterieur', 4, 365, 'Chaque automne', 30, {
      d: ['Brossez la terre et la sève des outils.', 'Affûtez sécateur et cisailles.', 'Huilez légèrement les lames et les parties métalliques.', 'Rangez au sec pour l’hiver.'],
      i: ['Nettoyage, affûtage, huile.', 'Rangement au sec.'],
      e: ['Révision des outils.'],
    }, { months: [10, 11] }),
  },
  {
    when: (p) => house(p) && has(p.exterieur, 'arbres'),
    template: make('feuilles', 'Ramasser les feuilles mortes', 'exterieur', 4, 14, 'Toutes les 2 semaines, en automne', 40, {
      d: ['Ratissez les feuilles sur la pelouse : laissées en tas, elles l’étouffent.', 'Dégagez les allées et les regards d’évacuation.', 'Mettez-les au compost ou au pied des massifs en paillage.'],
      i: ['Pelouse et allées ratissées.', 'Compost ou paillage.'],
      e: ['Ramassage des feuilles.'],
    }, { months: [10, 11, 12] }),
  },
  {
    when: (p) => house(p) && has(p.exterieur, 'arbres'),
    template: make('arbres', 'Tailler les arbres et arbustes', 'exterieur', 4, 365, 'Tous les ans', 90, {
      d: [
        'Retirez d’abord le bois mort, les branches cassées et celles qui se croisent.',
        'Fruitiers à pépins (pommier, poirier) : taille en fin d’hiver, hors période de gel.',
        'Fruitiers à noyau (cerisier, prunier) : taille légère après la récolte, à partir de mi-août (pas de taille de mi-mars à mi-août, période de nidification).',
        'Coupez net, juste au-dessus d’un bourgeon tourné vers l’extérieur.',
        'Au-delà de ce que vous atteignez depuis le sol, faites appel à un élagueur.',
      ],
      i: ['Bois mort et branches croisées d’abord.', 'Pépins en hiver hors gel, noyau à partir de mi-août.', 'Coupe nette au-dessus d’un bourgeon ; élagueur si en hauteur.'],
      e: ['Taille selon l’espèce.'],
    }, { months: [9, 11, 12, 1, 2, 3], difficulty: 2, tools: ['Sécateur', 'Scie d’élagage'] }),
  },
  {
    when: (p) => house(p) && has(p.exterieur, 'pelouse'),
    template: make('scarifier', 'Scarifier la pelouse', 'exterieur', 4, 365, 'Tous les ans, au printemps', 90, {
      d: ['Tondez court juste avant.', 'Passez le scarificateur pour arracher la mousse et l’herbe morte.', 'Ramassez les déchets.', 'Regarnissez les zones clairsemées avec du gazon et arrosez.'],
      i: ['Tonte courte, scarification, ramassage.', 'Regarnissage et arrosage.'],
      e: ['Scarification de printemps.'],
    }, { months: [3, 4], difficulty: 2, tools: ['Scarificateur'], alternatives: { Scarificateur: 'Se loue à la journée ; un râteau à gazon suffit pour une petite surface.' } }),
  },
  {
    when: (p) => house(p) && has(p.exterieur, 'barbecue'),
    template: make('barbecue', 'Nettoyer le barbecue', 'exterieur', 4, 365, 'Au printemps', 40, {
      d: [
        'Grilles : faites chauffer à vide, puis brossez avec une brosse adaptée.',
        'Videz le bac à cendres ou à graisse.',
        { t: 'Gaz : vérifiez l’état et la date limite du tuyau de raccordement, et l’absence de fuite à l’eau savonneuse.', si: { bbq: ['gaz'] } },
        'Protégez-le avec une housse.',
      ],
      i: ['Grilles brossées, bac vidé.', { t: 'Tuyau de gaz : état, date, test de fuite.', si: { bbq: ['gaz'] } }],
      e: ['Nettoyage de saison.'],
    }, { months: [4, 5], questions: [{ id: 'bbq', label: 'Quel barbecue ?', options: [{ v: 'gaz', l: 'Gaz' }, { v: 'charbon', l: 'Charbon' }, { v: 'electrique', l: 'Électrique' }] }] }),
  },
  {
    when: (p) => house(p) && has(p.exterieur, 'mobilier'),
    template: make('mobilier-jardin', 'Rentrer et protéger le mobilier de jardin', 'exterieur', 4, 365, 'Chaque automne', 45, {
      d: ['Lavez tables et chaises à l’eau savonneuse.', 'Bois : laissez sécher, puis passez une huile adaptée si besoin.', 'Rentrez coussins et parasols au sec ; couvrez ce qui reste dehors.'],
      i: ['Lavage, huile sur le bois.', 'Coussins au sec, housses.'],
      e: ['Hivernage du mobilier.'],
    }, { months: [10, 11] }),
  },

  /* =================== Véhicules =================== */
  {
    when: anyCar,
    template: make('voiture-interieur', 'Nettoyer l’intérieur de la voiture', 'vehicule', 4, 30, 'Tous les mois', 30, {
      d: ['Videz les déchets et ce qui traîne.', 'Sortez les tapis, secouez-les.', 'Aspirez sièges, plancher et coffre (sièges enfants compris, dessous aussi).', 'Essuyez tableau de bord et poignées avec un chiffon humide.', 'Vitres intérieures au produit à vitres : moins de buée.'],
      i: ['Vidage, tapis, aspiration (sièges enfants compris).', 'Tableau de bord et vitres intérieures.'],
      e: ['Intérieur complet.'],
    }, { tools: ['Aspirateur', 'Chiffon microfibre'], alternatives: { Aspirateur: 'Les aspirateurs des stations de lavage fonctionnent avec quelques pièces.' } }),
  },
  {
    when: anyCar,
    template: make('voiture-lavage', 'Laver la voiture', 'vehicule', 4, 30, 'Tous les mois', 30, {
      d: ['Lavez en station plutôt que dans la rue : les eaux sales y sont traitées.', 'Commencez par le toit, finissez par le bas de caisse et les jantes.', 'En hiver, rincez bien le dessous si les routes ont été salées.'],
      i: ['Station de lavage, du haut vers le bas.', 'Dessous rincé après les routes salées.'],
      e: ['Lavage extérieur.'],
    }, { budget: 10 }),
  },
  {
    when: (p) => has(p.vehicules, 'thermique'),
    template: make('batterie', 'Faire tester la batterie avant l’hiver', 'vehicule', 3, 365, 'Chaque automne', 15, {
      d: ['Le froid fatigue les batteries : faites-la tester par un garage ou un centre auto.', 'Signes d’alerte : démarrage lent, voyant batterie, phares faibles moteur arrêté.', 'Au-delà de 4 à 5 ans, prévoyez son remplacement.'],
      i: ['Test au garage avant l’hiver.', 'Remplacement si faible ou ancienne.'],
      e: ['Test batterie.'],
    }, { months: [10, 11], pro: true, difficulty: 4 }),
  },
  {
    when: (p) => has(p.vehicules, 'pneus_hiver'),
    template: make('pneus-hiver', 'Monter les pneus hiver', 'vehicule', 2, 365, 'Chaque automne', 60, {
      d: [
        'Prenez rendez-vous au garage, ou montez vos roues complètes si vous en avez.',
        'Dans les communes de montagne concernées, des équipements hiver sont obligatoires du 1er novembre au 31 mars.',
        'Vérifiez la profondeur des sculptures avant de les remonter.',
        'Après montage, contrôlez la pression et resserrez les écrous après quelques dizaines de kilomètres.',
      ],
      i: ['Montage avant novembre.', 'Usure, pression, resserrage.'],
      e: ['Passage aux pneus hiver.'],
    }, { months: [10, 11], budget: 60 }),
  },
  {
    when: (p) => has(p.vehicules, 'pneus_hiver'),
    template: make('pneus-ete', 'Remonter les pneus été', 'vehicule', 3, 365, 'Chaque printemps', 60, {
      d: ['Après la période hivernale, remontez les pneus été : les pneus hiver s’usent vite au chaud.', 'Rangez les pneus hiver à plat ou suspendus, au frais et à l’abri de la lumière.', 'Notez leur position (avant gauche…) pour les tourner à la prochaine saison.'],
      i: ['Remontage des pneus été.', 'Stockage des pneus hiver, position notée.'],
      e: ['Passage aux pneus été.'],
    }, { months: [3, 4], budget: 60 }),
  },
  {
    when: anyCar,
    template: make('clim-hiver', 'Faire tourner la climatisation en hiver', 'vehicule', 4, 30, 'Tous les mois, en hiver', 10, {
      d: ['Allumez la climatisation une dizaine de minutes en roulant.', 'Cela fait circuler le gaz et l’huile et garde les joints souples.', 'Elle désembue aussi les vitres plus vite.'],
      i: ['Climatisation 10 minutes en roulant.'],
      e: ['Clim en marche quelques minutes.'],
    }, { months: [11, 12, 1, 2, 3] }),
  },
  {
    when: anyCar,
    template: make('kit-securite', 'Vérifier gilet, triangle et trousse de la voiture', 'vehicule', 2, 365, 'Tous les ans', 10, {
      d: ['Gilet jaune à portée de main dans l’habitacle, triangle dans le coffre : ils sont obligatoires.', 'Vérifiez la roue de secours ou le kit anticrevaison (date de la bombe).', 'Ajoutez une petite trousse de secours et une lampe.'],
      i: ['Gilet et triangle présents.', 'Roue de secours ou kit anticrevaison à jour.'],
      e: ['Équipements de sécurité.'],
    }),
  },
  {
    when: (p) => has(p.vehicules, 'velo'),
    template: make('velo', 'Entretenir les vélos', 'vehicule', 3, 60, 'Tous les 2 mois', 30, {
      d: ['Gonflez les pneus à la pression indiquée sur le flanc.', 'Testez les freins : ils doivent bloquer la roue sans que la poignée touche le guidon.', 'Nettoyez la chaîne avec un chiffon, puis mettez une goutte de lubrifiant sur chaque maillon et essuyez l’excédent.', 'Vérifiez que l’éclairage fonctionne.'],
      i: ['Pression, freins, éclairage.', 'Chaîne nettoyée et lubrifiée.'],
      e: ['Révision rapide.'],
    }, { tools: ['Pompe', 'Lubrifiant pour chaîne'], alternatives: { Pompe: 'Beaucoup de stations-service et de magasins de vélo ont une pompe en libre accès.' } }),
  },

  /* =================== Ménage de fond =================== */
  {
    when: menage,
    template: make('facades-cuisine', 'Dégraisser les façades des meubles de cuisine', 'maison', 4, 90, 'Tous les 3 mois', 30, {
      d: ['Commencez par les façades proches de la plaque et du four, les plus grasses.', 'Passez un dégraissant doux ou du savon noir dilué avec une éponge non abrasive.', 'Insistez sur les poignées et le bas des portes.', 'Rincez à l’eau claire et séchez avec un chiffon microfibre.'],
      i: ['Dégraissant doux ou savon noir, poignées comprises.', 'Rinçage et séchage.'],
      e: ['Dégraissage des façades.'],
    }, { tools: ['Savon noir ou dégraissant', 'Chiffon microfibre'] }),
  },
  {
    when: menage,
    template: make('dessus-meubles', 'Dépoussiérer le dessus des meubles hauts', 'maison', 4, 180, 'Tous les 6 mois', 20, {
      d: ['Montez sur un escabeau stable.', 'Sur les meubles de cuisine, la poussière se mêle à la graisse : passez un dégraissant, puis essuyez.', 'Astuce : posez ensuite une feuille de papier sur le dessus, il suffira de la changer la prochaine fois.'],
      i: ['Dessus des meubles hauts dégraissés.', 'Papier de protection.'],
      e: ['Dessus des meubles.'],
    }, { tools: ['Escabeau'] }),
  },
  {
    when: menage,
    template: make('four', 'Nettoyer le four', 'maison', 3, 90, 'Tous les 3 mois', 30, {
      d: [
        { t: 'Lancez un cycle de pyrolyse en suivant la notice, puis essuyez les cendres une fois refroidi.', si: { four: ['pyrolyse'] } },
        { t: 'Étalez une pâte de bicarbonate et d’eau sur les parois froides, laissez agir plusieurs heures.', si: { four: ['classique'] } },
        { t: 'Essuyez avec une éponge humide, puis rincez.', si: { four: ['classique'] } },
        'Lavez les grilles et la lèchefrite à part.',
        'Nettoyez la vitre de la porte.',
      ],
      i: [{ t: 'Pyrolyse.', si: { four: ['pyrolyse'] } }, { t: 'Pâte de bicarbonate, pose longue, rinçage.', si: { four: ['classique'] } }, 'Grilles et vitre.'],
      e: ['Nettoyage du four.'],
    }, { questions: [{ id: 'four', label: 'Votre four a-t-il la pyrolyse ?', options: [{ v: 'pyrolyse', l: 'Oui' }, { v: 'classique', l: 'Non' }] }] }),
  },
  {
    when: menage,
    template: make('micro-ondes', 'Nettoyer le micro-ondes', 'maison', 4, 30, 'Tous les mois', 10, {
      d: ['Chauffez un bol d’eau avec un peu de vinaigre blanc ou de citron 3 minutes.', 'Laissez la porte fermée 2 minutes : la vapeur décolle les salissures.', 'Essuyez l’intérieur et lavez le plateau.'],
      i: ['Bol d’eau vinaigrée 3 minutes, vapeur, essuyage.'],
      e: ['Micro-ondes.'],
    }, { tools: ['Vinaigre blanc'], alternatives: VINAIGRE }),
  },
  {
    when: menage,
    template: make('frigo-interieur', 'Nettoyer l’intérieur du réfrigérateur', 'maison', 3, 90, 'Tous les 3 mois', 30, {
      d: ['Videz-le et jetez ce qui est périmé.', 'Lavez clayettes et bacs à l’eau savonneuse.', 'Essuyez les parois à l’eau additionnée de vinaigre blanc ou de bicarbonate.', 'Nettoyez le joint de porte et le petit trou d’évacuation au fond.', 'Séchez et rangez.'],
      i: ['Vidé, périmés jetés, clayettes lavées.', 'Parois, joint et évacuation.'],
      e: ['Nettoyage complet.'],
    }, { tools: ['Vinaigre blanc'], alternatives: VINAIGRE }),
  },
  {
    when: (p) => has(p.extras, 'congelateur'),
    template: make('congelateur', 'Dégivrer le congélateur', 'maison', 3, 180, 'Tous les 6 mois', 60, {
      d: ['Choisissez un moment où il est peu rempli ; gardez les aliments au froid dans une glacière.', 'Débranchez, portes ouvertes, serviettes au sol.', 'Laissez fondre (un bol d’eau chaude à l’intérieur accélère), sans gratter avec un objet pointu.', 'Séchez bien, rebranchez, attendez qu’il soit froid avant de remettre les aliments.'],
      i: ['Aliments en glacière, débranché, fonte sans outil pointu.', 'Séchage, remise en froid.'],
      e: ['Dégivrage.'],
    }, { months: [3, 4, 9, 10] }),
  },
  {
    when: menage,
    template: make('detartrage-cuisine', 'Détartrer la bouilloire et la cafetière', 'maison', 4, 60, 'Tous les 2 mois', 15, {
      d: ['Bouilloire : remplissez à moitié d’eau et de vinaigre blanc, faites bouillir, laissez agir une heure.', 'Cafetière : suivez le programme de détartrage de la notice, avec le produit recommandé.', 'Rincez en faisant chauffer deux fois de l’eau claire.'],
      i: ['Vinaigre bouilli dans la bouilloire, programme de la cafetière.', 'Deux rinçages.'],
      e: ['Détartrage.'],
    }, { tools: ['Vinaigre blanc'], alternatives: VINAIGRE }),
  },
  {
    when: menage,
    template: make('wc-tartre', 'Détartrer les toilettes', 'maison', 3, 30, 'Tous les mois', 15, {
      d: ['Le soir, versez du vinaigre blanc chaud ou de l’acide citrique dans la cuvette et sous le rebord.', 'Laissez agir toute la nuit.', 'Le matin, brossez sous le rebord et tirez la chasse.', 'Ne mélangez jamais javel et vinaigre : le mélange dégage un gaz toxique.'],
      i: ['Vinaigre chaud ou acide citrique toute la nuit, brossage.', 'Jamais avec de la javel.'],
      e: ['Détartrage WC (sans javel).'],
    }, { tools: ['Vinaigre blanc'], alternatives: VINAIGRE }),
  },
  {
    when: menage,
    template: make('douche-calcaire', 'Détartrer pommeau de douche et mousseurs', 'maison', 4, 90, 'Tous les 3 mois', 20, {
      d: ['Dévissez le pommeau de douche et les embouts (mousseurs) des robinets.', 'Faites-les tremper quelques heures dans du vinaigre blanc.', 'Brossez les trous avec une vieille brosse à dents, rincez, revissez.', 'Si le pommeau ne se dévisse pas, enfermez-le dans un sac rempli de vinaigre fixé avec un élastique.'],
      i: ['Pommeau et mousseurs au vinaigre quelques heures.', 'Brossage, rinçage.'],
      e: ['Détartrage robinetterie.'],
    }, { tools: ['Vinaigre blanc'], alternatives: VINAIGRE }),
  },
  {
    when: menage,
    template: make('joints-carrelage', 'Nettoyer les joints de carrelage', 'maison', 4, 180, 'Tous les 6 mois', 40, {
      d: ['Faites une pâte de bicarbonate et d’un peu d’eau.', 'Étalez-la sur les joints, laissez agir un quart d’heure.', 'Frottez avec une brosse à dents, rincez à l’eau claire.', 'Joint noir qui ne part pas : il est sans doute moisi en profondeur et à refaire.'],
      i: ['Pâte de bicarbonate, brosse, rinçage.', 'Joints moisis à refaire.'],
      e: ['Joints de carrelage.'],
    }),
  },
  {
    when: menage,
    template: make('poussiere-cachee', 'Dépoussiérer meuble TV, écrans et câbles', 'maison', 4, 30, 'Tous les mois', 20, {
      d: ['Éteignez les appareils.', 'Écrans : chiffon microfibre sec ou à peine humide, sans produit à vitres.', 'Passez derrière le meuble TV, sur les box et les câbles, où la poussière s’accumule.', 'Aspirez les grilles d’aération des appareils.'],
      i: ['Écrans à la microfibre, derrière le meuble et les box.', 'Grilles d’aération aspirées.'],
      e: ['Poussière cachée.'],
    }, { tools: ['Chiffon microfibre'] }),
  },
  {
    when: menage,
    template: make('plinthes-interrupteurs', 'Plinthes, interrupteurs et poignées', 'maison', 4, 90, 'Tous les 3 mois', 30, {
      d: ['Passez un chiffon humide sur les plinthes de chaque pièce.', 'Nettoyez interrupteurs, poignées de porte et rampes : ce sont les surfaces les plus touchées.', 'Pour les interrupteurs, chiffon à peine humide, jamais mouillé.'],
      i: ['Plinthes, interrupteurs, poignées, rampes.'],
      e: ['Points de contact.'],
    }),
  },
  {
    when: menage,
    template: make('luminaires', 'Dépoussiérer luminaires et abat-jour', 'maison', 4, 180, 'Tous les 6 mois', 20, {
      d: ['Éteignez et laissez refroidir les ampoules.', 'Abat-jour en tissu : rouleau adhésif ou brosse douce.', 'Plafonniers en verre : démontez et lavez à l’eau savonneuse, séchez avant de remonter.'],
      i: ['Ampoules froides, abat-jour brossés, globes lavés.'],
      e: ['Luminaires.'],
    }, { tools: ['Escabeau'] }),
  },
  {
    when: menage,
    template: make('vitres', 'Laver les vitres', 'maison', 4, 90, 'Tous les 3 mois', 60, {
      d: ['Évitez le plein soleil : le produit sèche trop vite et laisse des traces.', 'Lavez à l’eau chaude avec un peu de liquide vaisselle ou de vinaigre blanc.', 'Raclez de haut en bas avec une raclette, essuyez le bord.', 'Finissez à la microfibre sèche.', 'Profitez-en pour nettoyer les rails des baies et des fenêtres à l’aspirateur.'],
      i: ['À l’ombre, eau chaude et raclette.', 'Microfibre, rails des fenêtres.'],
      e: ['Vitres et rails.'],
    }, { tools: ['Raclette', 'Chiffon microfibre'], alternatives: { Raclette: 'Du papier journal froissé, à l’ancienne, laisse peu de traces.' } }),
  },
  {
    when: menage,
    template: make('matelas', 'Retourner et aspirer le matelas', 'maison', 4, 90, 'Tous les 3 mois', 20, {
      d: ['Retirez la literie et aspirez le matelas avec l’embout adapté.', 'Tournez-le tête-pieds ; retournez-le aussi s’il est double face (regardez l’étiquette).', 'Laissez-le aérer une heure avant de refaire le lit.'],
      i: ['Aspiration, rotation tête-pieds (et retournement si double face).', 'Aération.'],
      e: ['Rotation du matelas.'],
    }),
  },
  {
    when: menage,
    template: make('couettes', 'Laver couettes et oreillers', 'maison', 4, 180, 'Tous les 6 mois', 30, {
      d: ['Lisez l’étiquette : beaucoup se lavent en machine à 40 ou 60 °C.', 'Une grande couette rentre rarement dans une machine domestique : utilisez une laverie.', 'Séchez complètement, idéalement au sèche-linge avec deux balles de tennis pour regonfler.'],
      i: ['Lavage selon l’étiquette (laverie pour les grandes couettes).', 'Séchage complet.'],
      e: ['Couettes et oreillers.'],
    }, { months: [4, 5, 9, 10], budget: 10 }),
  },
  {
    when: menage,
    template: make('canape', 'Entretenir le canapé', 'maison', 4, 90, 'Tous les 3 mois', 20, {
      d: ['Retirez les coussins et aspirez dessous et dans les recoins.', 'Tissu : traitez les taches selon l’étiquette, en testant sur une zone cachée.', 'Cuir : dépoussiérez, puis nourrissez avec un baume pour cuir une à deux fois par an.'],
      i: ['Aspiration sous les coussins.', 'Taches (tissu) ou baume (cuir).'],
      e: ['Canapé.'],
    }),
  },
  {
    when: menage,
    template: make('rideaux', 'Laver les rideaux', 'maison', 4, 365, 'Tous les ans', 30, {
      d: ['Lisez l’étiquette avant tout.', 'Lavez en machine à basse température, sans essorage fort.', 'Raccrochez-les encore légèrement humides : ils se défroissent seuls.'],
      i: ['Lavage doux selon l’étiquette.', 'Raccrochés humides.'],
      e: ['Rideaux.'],
    }, { months: [4, 5] }),
  },
  {
    when: menage,
    template: make('poubelles', 'Laver les poubelles', 'maison', 4, 30, 'Tous les mois', 15, {
      d: ['Videz-les et rincez au jet ou sous la douche.', 'Frottez avec de l’eau chaude et du savon noir ou du bicarbonate.', 'Laissez sécher à l’air avant de remettre un sac.'],
      i: ['Rinçage, frottage au savon noir, séchage.'],
      e: ['Poubelles.'],
    }),
  },
  {
    when: menage,
    template: make('aspirateur', 'Entretenir l’aspirateur', 'maison', 4, 90, 'Tous les 3 mois', 15, {
      d: ['Videz le bac ou changez le sac.', 'Rincez ou tapotez les filtres selon la notice ; laissez sécher complètement.', 'Retirez les cheveux enroulés autour de la brosse avec des ciseaux.'],
      i: ['Bac, filtres, brosse.'],
      e: ['Aspirateur.'],
    }),
  },
  {
    when: menage,
    template: make('lave-linge-joint', 'Nettoyer le joint du hublot et le bac à lessive', 'maison', 4, 30, 'Tous les mois', 15, {
      d: ['Écartez le joint du hublot et essuyez l’intérieur des plis : l’eau et les résidus y moisissent.', 'Sortez le bac à lessive, lavez-le à l’eau chaude.', 'Laissez le hublot et le bac entrouverts entre deux lavages.'],
      i: ['Plis du joint et bac à lessive.', 'Hublot entrouvert.'],
      e: ['Joint et bac.'],
    }),
  },

  /* =================== Chaussures =================== */
  {
    when: (p) => has(p.extras, 'chaussures'),
    template: make('chaussures', 'Entretenir les chaussures', 'maison', 4, 30, 'Tous les mois', 30, {
      d: [
        'Brossez la terre et la poussière, semelles comprises.',
        { t: 'Cuir lisse : passez une crème nourrissante en fine couche, laissez pénétrer, puis du cirage et lustrez avec une brosse douce.', si: { type: ['cuir', 'tous'] } },
        { t: 'Daim ou nubuck : brosse spéciale (crêpe ou laiton), jamais de cirage ; un imperméabilisant en spray protège de la pluie.', si: { type: ['daim', 'tous'] } },
        { t: 'Baskets ou toile : lavez à l’eau savonneuse avec une brosse ; en machine à froid dans un filet seulement si l’étiquette le permet.', si: { type: ['toile', 'tous'] } },
        'Chaussures mouillées : bourrez-les de papier journal et laissez sécher loin d’un radiateur, qui craquelle le cuir.',
        { t: 'Rangez-les avec des embauchoirs en bois : ils gardent la forme et absorbent l’humidité.', si: { type: ['cuir', 'tous'] } },
      ],
      i: [
        'Brossage, semelles comprises.',
        { t: 'Crème nourrissante, cirage, lustrage.', si: { type: ['cuir', 'tous'] } },
        { t: 'Brosse à daim et imperméabilisant.', si: { type: ['daim', 'tous'] } },
        { t: 'Lavage à l’eau savonneuse.', si: { type: ['toile', 'tous'] } },
        'Séchage loin des radiateurs.',
      ],
      e: ['Brossage et soin selon la matière.'],
    }, {
      tools: ['Brosse', 'Crème ou cirage'],
      alternatives: { Brosse: 'Une vieille brosse à dents pour les coutures, un chiffon doux pour le reste.', 'Crème ou cirage': 'En dépannage, une noisette de crème hydratante neutre nourrit un cuir lisse.' },
      questions: [{ id: 'type', label: 'Quelles chaussures surtout ?', options: [{ v: 'cuir', l: 'Cuir lisse' }, { v: 'daim', l: 'Daim ou nubuck' }, { v: 'toile', l: 'Baskets ou toile' }, { v: 'tous', l: 'Un peu de tout' }] }],
    }),
  },
];
