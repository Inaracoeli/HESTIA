// Catalogue Hestia : toutes les tâches que l'app sait proposer, et à quelles conditions.
// Les rythmes légaux sont sourcés ; les autres sont des repères courants, réglables dans « Mes tâches ».
import base from './catalogue-base.json';
import { CATALOGUE_EXTRA } from './catalogue-extra';
import type { Domain, Importance, Question, Step } from './types';

/* ---------- Profil du foyer ---------- */

export type Profile = {
  logement: 'maison' | 'appartement';
  chauffage: string[];
  equipements: string[];
  exterieur: string[];
  vehicules: string[];
  /** Rappels facultatifs : ménage de fond, chaussures… */
  extras?: string[];
};

export const EMPTY_PROFILE: Profile = { logement: 'maison', chauffage: [], equipements: [], exterieur: [], vehicules: [], extras: [] };

export const PROFILE_OPTIONS = {
  chauffage: [
    ['pac_gainable', 'Pompe à chaleur gainable'],
    ['pac_air_eau', 'Pompe à chaleur air-eau (radiateurs, plancher)'],
    ['pac_air_air', 'Climatisation réversible (unités murales)'],
    ['chaudiere_gaz', 'Chaudière gaz'],
    ['chaudiere_fioul', 'Chaudière fioul'],
    ['poele', 'Poêle à bois ou à granulés'],
    ['cheminee', 'Cheminée ou insert'],
    ['electrique', 'Radiateurs électriques'],
  ],
  equipements: [
    ['vmc', 'VMC (ventilation)'],
    ['ballon', 'Chauffe-eau à ballon'],
    ['adoucisseur', 'Adoucisseur d’eau'],
    ['solaire', 'Panneaux solaires'],
    ['fosse', 'Fosse septique (pas de tout-à-l’égout)'],
    ['lave_linge', 'Lave-linge'],
    ['lave_vaisselle', 'Lave-vaisselle'],
    ['hotte', 'Hotte de cuisine'],
    ['seche_linge', 'Sèche-linge'],
    ['volets', 'Volets roulants'],
    ['portail', 'Portail motorisé'],
    ['store', 'Store banne'],
    ['recuperateur', 'Récupérateur d’eau de pluie'],
    ['arrosage', 'Arrosage automatique'],
  ],
  exterieur: [
    ['pelouse', 'Pelouse'],
    ['haie', 'Haie'],
    ['terrasse', 'Terrasse'],
    ['piscine', 'Piscine'],
    ['robinet', 'Robinet extérieur'],
    ['arbres', 'Arbres ou arbustes (fruitiers compris)'],
    ['barbecue', 'Barbecue'],
    ['mobilier', 'Mobilier de jardin'],
  ],
  vehicules: [
    ['thermique', 'Voiture essence ou diesel'],
    ['electrique', 'Voiture électrique'],
    ['pneus_hiver', 'Pneus hiver (changés chaque saison)'],
    ['velo', 'Vélos'],
  ],
  extras: [
    ['menage', 'Ménage de fond : façades, tartre, poussière cachée, matelas…'],
    ['congelateur', 'Congélateur à dégivrer (sans « no frost »)'],
    ['chaussures', 'Entretien des chaussures'],
  ],
} as const;

/* ---------- Modèles de tâches ---------- */

export type Template = {
  id: string;
  title: string;
  domain: Domain;
  importance: Importance;
  intervalDays: number;
  periodLabel: string;
  minutes: number;
  budget: number;
  difficulty: 1 | 2 | 3 | 4;
  pro: boolean;
  /** Mois de l'année où la tâche a du sens (1 à 12) ; absent = toute l'année */
  months?: number[];
  tools: string[];
  alternatives: Record<string, string>;
  questions: Question[];
  steps: { debutant: Step[]; intermediaire: Step[]; expert: Step[] };
  /** Réponses préremplies à partir du profil */
  choicesFrom?: (p: Profile) => Record<string, string>;
};

const has = (list: string[], ...values: string[]) => values.some((v) => list.includes(v));
const house = (p: Profile) => p.logement === 'maison';
const anyCar = (p: Profile) => has(p.vehicules, 'thermique', 'electrique');

function t(x: Omit<Template, 'tools' | 'alternatives' | 'questions'> & Partial<Pick<Template, 'tools' | 'alternatives' | 'questions'>>): Template {
  return { tools: [], alternatives: {}, questions: [], ...x };
}

const BASE = base as unknown as Record<string, Template>;

/** Chaque modèle, avec la condition qui le rend utile pour un foyer. */
export const CATALOGUE: { template: Template; when: (p: Profile) => boolean }[] = [
  /* ----- Sécurité ----- */
  { template: BASE['detecteurs'], when: () => true },
  {
    when: () => true,
    template: t({
      id: 'differentiel', title: 'Tester les interrupteurs différentiels', domain: 'maison', importance: 2,
      intervalDays: 30, periodLabel: 'Tous les mois', minutes: 5, budget: 0, difficulty: 1, pro: false,
      steps: {
        debutant: [
          'Ouvrez le tableau électrique et repérez les interrupteurs différentiels : ils portent un petit bouton « T » ou « Test ».',
          'Prévenez la maison : le courant va se couper sur une partie des pièces.',
          'Appuyez sur le bouton « Test » : l’interrupteur doit se couper aussitôt.',
          'Relevez-le pour remettre le courant, puis passez au suivant.',
          'Si l’un d’eux ne se coupe pas, faites-le vérifier par un électricien.',
        ],
        intermediaire: ['Appuyez sur « Test » de chaque différentiel : il doit déclencher.', 'Réarmez ; électricien si l’un ne déclenche pas.'],
        expert: ['Test de déclenchement de chaque différentiel.'],
      },
    }),
  },

  /* ----- Chauffage ----- */
  { template: BASE['pac-filtres'], when: (p) => has(p.chauffage, 'pac_gainable') },
  {
    when: (p) => has(p.chauffage, 'pac_gainable', 'pac_air_eau', 'pac_air_air'),
    template: BASE['pac-entretien'],
  },
  {
    when: (p) => has(p.chauffage, 'pac_air_air'),
    template: t({
      id: 'clim-filtres', title: 'Filtres de la climatisation réversible', domain: 'maison', importance: 3,
      intervalDays: 90, periodLabel: 'Tous les 3 mois', minutes: 15, budget: 0, difficulty: 1, pro: false,
      tools: ['Aspirateur'], alternatives: { Aspirateur: 'Rincez simplement les filtres à l’eau tiède.' },
      steps: {
        debutant: [
          'Éteignez l’unité avec la télécommande.',
          'Soulevez le capot avant de l’unité murale : les filtres sont juste derrière.',
          'Faites glisser les filtres vers le bas pour les sortir.',
          'Aspirez la poussière, puis rincez à l’eau tiède, sans produit.',
          'Laissez sécher complètement à l’ombre, remettez-les et refermez le capot.',
        ],
        intermediaire: ['Unité éteinte, capot levé, filtres sortis.', 'Aspirez, rincez, séchez à l’ombre, remontez.'],
        expert: ['Nettoyage des filtres des unités murales.'],
      },
    }),
  },
  {
    when: (p) => has(p.chauffage, 'chaudiere_gaz', 'chaudiere_fioul'),
    template: t({
      id: 'chaudiere', title: 'Entretien de la chaudière', domain: 'maison', importance: 1,
      intervalDays: 365, periodLabel: 'Tous les ans (obligatoire)', minutes: 15, budget: 130, difficulty: 4, pro: true, months: [4, 5, 6, 7, 8, 9],
      steps: {
        debutant: [
          'Prenez rendez-vous avec un chauffagiste : l’entretien d’une chaudière de 4 à 400 kW est obligatoire chaque année (décret n° 2009-649).',
          'Visez le printemps ou l’été : les professionnels sont plus disponibles qu’à l’automne.',
          'Gardez l’attestation d’entretien : l’assurance peut la demander en cas de sinistre.',
        ],
        intermediaire: ['Rendez-vous annuel avec le chauffagiste (obligatoire).', 'Conservez l’attestation.'],
        expert: ['Visite annuelle, attestation à conserver.'],
      },
    }),
  },
  {
    when: (p) => has(p.chauffage, 'poele', 'cheminee', 'chaudiere_fioul', 'chaudiere_gaz'),
    template: t({
      id: 'ramonage', title: 'Ramonage du conduit', domain: 'maison', importance: 1,
      intervalDays: 365, periodLabel: 'Au moins une fois par an (obligatoire)', minutes: 15, budget: 70, difficulty: 4, pro: true, months: [8, 9, 10, 11],
      steps: {
        debutant: [
          'Prenez rendez-vous avec un ramoneur qualifié : le ramonage est obligatoire au moins une fois tous les 12 mois.',
          'Chaudière gaz à ventouse (sortie directe dans le mur) : pas de conduit à ramoner, le chauffagiste vous le confirmera.',
          'Votre département peut en exiger deux par an, souvent pour le bois : renseignez-vous en mairie.',
          'Faites-le avant la saison de chauffe.',
          'Gardez le certificat de ramonage : l’assurance le demande en cas de sinistre.',
        ],
        intermediaire: ['Ramoneur qualifié, avant l’hiver (au moins une fois par an).', 'Conservez le certificat.'],
        expert: ['Ramonage avant l’hiver, certificat à conserver.'],
      },
    }),
  },

  /* ----- Équipements ----- */
  {
    when: (p) => has(p.equipements, 'vmc'),
    template: t({
      id: 'vmc', title: 'Nettoyer les bouches de VMC', domain: 'maison', importance: 3,
      intervalDays: 180, periodLabel: 'Tous les 6 mois', minutes: 20, budget: 0, difficulty: 1, pro: false,
      tools: ['Escabeau', 'Eau savonneuse'], alternatives: { Escabeau: 'Évitez la chaise : empruntez un escabeau.', 'Eau savonneuse': 'Un peu de liquide vaisselle dans de l’eau tiède.' },
      steps: {
        debutant: [
          'Repérez les bouches d’extraction : cuisine, salle de bain, toilettes.',
          'Retirez chaque bouche en la tournant ou en la tirant doucement, sans toucher aux réglages.',
          'Lavez-la à l’eau savonneuse, rincez, laissez sécher.',
          'Remettez-la en place : n’obstruez jamais une bouche, même en hiver.',
        ],
        intermediaire: ['Déposez les bouches (cuisine, salle de bain, toilettes).', 'Eau savonneuse, séchage, remontage.'],
        expert: ['Nettoyage des bouches d’extraction.'],
      },
    }),
  },
  {
    when: (p) => has(p.equipements, 'ballon'),
    template: t({
      id: 'groupe-securite', title: 'Manœuvrer le groupe de sécurité du chauffe-eau', domain: 'maison', importance: 2,
      intervalDays: 30, periodLabel: 'Tous les mois', minutes: 5, budget: 0, difficulty: 1, pro: false,
      steps: {
        debutant: [
          'Repérez le groupe de sécurité, sous le chauffe-eau : une pièce avec un petit levier ou une molette, reliée à l’évacuation.',
          'Tournez la molette ou levez le levier quelques secondes : de l’eau doit couler dans l’évacuation.',
          'Relâchez. Ce geste évite que le calcaire ne bloque la soupape.',
          'S’il goutte en permanence ou ne laisse rien passer, faites-le vérifier par un plombier.',
        ],
        intermediaire: ['Actionnez la soupape du groupe de sécurité quelques secondes.', 'Plombier si fuite permanente ou blocage.'],
        expert: ['Manœuvre de la soupape.'],
      },
    }),
  },
  {
    when: (p) => has(p.equipements, 'adoucisseur'),
    template: t({
      id: 'adoucisseur', title: 'Recharger le sel de l’adoucisseur', domain: 'maison', importance: 3,
      intervalDays: 30, periodLabel: 'Tous les mois', minutes: 10, budget: 10, difficulty: 1, pro: false,
      tools: ['Sel pour adoucisseur'],
      steps: {
        debutant: ['Ouvrez le bac à sel.', 'Si le sel est sous la moitié, complétez avec du sel spécial adoucisseur (pastilles).', 'Cassez une éventuelle croûte de sel au fond avec un manche.'],
        intermediaire: ['Contrôlez le niveau de sel, complétez si besoin.'],
        expert: ['Niveau de sel.'],
      },
    }),
  },
  {
    when: (p) => has(p.equipements, 'solaire'),
    template: t({
      id: 'solaire', title: 'Contrôler la production solaire', domain: 'maison', importance: 3,
      intervalDays: 30, periodLabel: 'Tous les mois', minutes: 5, budget: 0, difficulty: 1, pro: false,
      steps: {
        debutant: [
          'Ouvrez l’application ou l’écran de votre onduleur.',
          'Comparez la production du mois à celle du même mois l’an dernier.',
          'Une baisse nette sans raison météo peut signaler un panneau sale ou un défaut : regardez les panneaux depuis le sol.',
          'En cas de doute, contactez l’installateur plutôt que de monter sur le toit.',
        ],
        intermediaire: ['Comparez la production à l’an dernier.', 'Baisse anormale : inspection visuelle, puis installateur.'],
        expert: ['Suivi de production, alerte si écart.'],
      },
    }),
  },
  {
    when: (p) => has(p.equipements, 'fosse'),
    template: t({
      id: 'fosse', title: 'Vidange de la fosse septique', domain: 'exterieur', importance: 2,
      intervalDays: 1460, periodLabel: 'Environ tous les 4 ans', minutes: 15, budget: 250, difficulty: 4, pro: true,
      steps: {
        debutant: [
          'La vidange doit être faite quand les boues atteignent la moitié du volume de la fosse : souvent tous les 4 ans environ pour une famille.',
          'Faites appel à un vidangeur agréé ; votre service d’assainissement (SPANC) peut en indiquer.',
          'Gardez le bordereau de vidange qu’il vous remet.',
        ],
        intermediaire: ['Vidangeur agréé quand les boues atteignent 50 % du volume.', 'Conservez le bordereau.'],
        expert: ['Vidange par un professionnel agréé, bordereau à conserver.'],
      },
    }),
  },
  {
    when: (p) => has(p.equipements, 'lave_linge'),
    template: t({
      id: 'lave-linge', title: 'Nettoyer le filtre du lave-linge', domain: 'maison', importance: 3,
      intervalDays: 90, periodLabel: 'Tous les 3 mois', minutes: 15, budget: 0, difficulty: 1, pro: false,
      tools: ['Serpillière', 'Petit récipient plat'],
      steps: {
        debutant: [
          'Machine débranchée, ouvrez la petite trappe en bas de la façade.',
          'Posez la serpillière et le récipient : de l’eau va couler.',
          'Dévissez lentement le filtre, laissez l’eau s’écouler, puis retirez-le.',
          'Rincez-le et retirez ce qui s’y trouve (pièces, cheveux, peluches).',
          'Revissez bien à fond, refermez la trappe.',
        ],
        intermediaire: ['Trappe en bas, récipient prêt, dévissez le filtre.', 'Rincez, revissez à fond.'],
        expert: ['Vidange et nettoyage du filtre.'],
      },
    }),
  },
  {
    when: (p) => has(p.equipements, 'lave_vaisselle'),
    template: t({
      id: 'lave-vaisselle', title: 'Nettoyer le filtre du lave-vaisselle', domain: 'maison', importance: 3,
      intervalDays: 30, periodLabel: 'Tous les mois', minutes: 10, budget: 0, difficulty: 1, pro: false,
      tools: ['Brosse'], alternatives: { Brosse: 'Une vieille brosse à dents fait très bien l’affaire.' },
      steps: {
        debutant: ['Retirez le panier du bas.', 'Tournez le filtre au fond de la cuve et sortez-le.', 'Rincez-le sous l’eau chaude en brossant.', 'Remettez-le en le tournant jusqu’au bout, puis le panier.'],
        intermediaire: ['Sortez et brossez le filtre sous l’eau chaude.', 'Remontez-le bien verrouillé.'],
        expert: ['Nettoyage du filtre.'],
      },
    }),
  },
  {
    when: (p) => has(p.equipements, 'hotte'),
    template: t({
      id: 'hotte', title: 'Nettoyer les filtres de la hotte', domain: 'maison', importance: 3,
      intervalDays: 90, periodLabel: 'Tous les 3 mois', minutes: 15, budget: 0, difficulty: 1, pro: false,
      steps: {
        debutant: [
          'Retirez les filtres métalliques sous la hotte (loquet à tirer).',
          'Lavez-les au lave-vaisselle, ou à l’eau très chaude avec du dégraissant.',
          'Laissez sécher, puis remettez-les.',
          'Si votre hotte a un filtre à charbon (sans évacuation dehors), il se remplace plutôt qu’il ne se lave : notez sa référence.',
        ],
        intermediaire: ['Filtres métalliques au lave-vaisselle ou au dégraissant.', 'Filtre à charbon : à remplacer.'],
        expert: ['Filtres métalliques lavés, charbon remplacé si besoin.'],
      },
    }),
  },
  {
    when: () => true,
    template: t({
      id: 'joints', title: 'Vérifier les joints de la salle de bain et de la cuisine', domain: 'maison', importance: 2,
      intervalDays: 365, periodLabel: 'Tous les ans', minutes: 15, budget: 0, difficulty: 2, pro: false,
      steps: {
        debutant: [
          'Regardez les joints autour de la baignoire, de la douche, de l’évier et du plan de travail.',
          'Cherchez les joints noircis, fendus ou décollés : l’eau s’infiltre par là.',
          'Un joint abîmé se refait : retirez l’ancien au cutter, nettoyez, séchez, puis posez un nouveau joint silicone.',
        ],
        intermediaire: ['Inspection des joints (bain, douche, évier, plan de travail).', 'Refaites ceux qui sont fendus ou décollés.'],
        expert: ['Contrôle et réfection des joints silicone.'],
      },
    }),
  },
  {
    when: () => true,
    template: t({
      id: 'siphons', title: 'Nettoyer les siphons', domain: 'maison', importance: 3,
      intervalDays: 90, periodLabel: 'Tous les 3 mois', minutes: 20, budget: 0, difficulty: 1, pro: false,
      tools: ['Seau', 'Gants'],
      steps: {
        debutant: ['Placez un seau sous le lavabo.', 'Dévissez à la main le bas du siphon.', 'Videz et rincez-le.', 'Revissez bien, puis faites couler l’eau pour vérifier l’absence de fuite.'],
        intermediaire: ['Seau dessous, dévissez, videz, rincez.', 'Revissez et contrôlez l’étanchéité.'],
        expert: ['Démontage et nettoyage des siphons.'],
      },
    }),
  },
  {
    when: () => true,
    template: t({
      id: 'frigo', title: 'Dépoussiérer l’arrière du réfrigérateur', domain: 'maison', importance: 3,
      intervalDays: 365, periodLabel: 'Tous les ans', minutes: 20, budget: 0, difficulty: 1, pro: false,
      tools: ['Aspirateur'],
      steps: {
        debutant: ['Débranchez le réfrigérateur.', 'Tirez-le doucement vers vous.', 'Aspirez la grille et le sol derrière.', 'Remettez-le en laissant quelques centimètres contre le mur, puis rebranchez.'],
        intermediaire: ['Débranché, tiré, grille aspirée.', 'Quelques centimètres d’espace au mur.'],
        expert: ['Dépoussiérage de la grille arrière.'],
      },
    }),
  },

  /* ----- Extérieurs ----- */
  { template: BASE['gouttieres'], when: house },
  { template: BASE['haies'], when: (p) => house(p) && has(p.exterieur, 'haie') },
  {
    when: (p) => house(p) && has(p.exterieur, 'pelouse'),
    template: t({
      id: 'tonte', title: 'Tondre la pelouse', domain: 'exterieur', importance: 4,
      intervalDays: 14, periodLabel: 'Toutes les 2 semaines, en saison', minutes: 45, budget: 0, difficulty: 1, pro: false, months: [3, 4, 5, 6, 7, 8, 9, 10],
      tools: ['Tondeuse'], alternatives: { Tondeuse: 'Empruntez-en une, ou faites appel à un voisin ou un jardinier.' },
      steps: {
        debutant: [
          'Ramassez branches, jouets et cailloux sur la pelouse.',
          'Réglez la coupe assez haut (5 à 6 cm) : l’herbe résiste mieux à la sécheresse.',
          'Tondez sur herbe sèche, en bandes qui se chevauchent un peu.',
          'Par forte chaleur, espacez les tontes ou laissez l’herbe plus haute.',
          'Videz le bac au compost.',
        ],
        intermediaire: ['Pelouse dégagée, coupe haute, herbe sèche.', 'Bandes qui se chevauchent, bac au compost.'],
        expert: ['Tonte haute sur herbe sèche.'],
      },
    }),
  },
  {
    when: (p) => house(p) && has(p.exterieur, 'robinet'),
    template: t({
      id: 'robinet-gel', title: 'Purger le robinet extérieur avant le gel', domain: 'exterieur', importance: 2,
      intervalDays: 365, periodLabel: 'Chaque automne', minutes: 10, budget: 0, difficulty: 1, pro: false, months: [10, 11],
      steps: {
        debutant: [
          'Fermez le robinet d’arrêt intérieur qui alimente le robinet du jardin.',
          'Débranchez le tuyau d’arrosage et rangez-le à l’abri.',
          'Ouvrez le robinet extérieur pour vider l’eau restante, et laissez-le ouvert.',
        ],
        intermediaire: ['Coupez l’arrivée intérieure, débranchez le tuyau.', 'Ouvrez le robinet extérieur pour le vider.'],
        expert: ['Coupure et purge avant le gel.'],
      },
    }),
  },
  {
    when: (p) => house(p) && has(p.exterieur, 'terrasse'),
    template: t({
      id: 'terrasse', title: 'Nettoyer la terrasse', domain: 'exterieur', importance: 4,
      intervalDays: 365, periodLabel: 'Tous les ans, au printemps', minutes: 90, budget: 0, difficulty: 2, pro: false, months: [4, 5, 6],
      tools: ['Balai brosse', 'Nettoyeur haute pression'],
      alternatives: { 'Nettoyeur haute pression': 'Un balai brosse et de l’eau savonneuse suffisent, plus doucement pour le bois.' },
      steps: {
        debutant: [
          'Dégagez la terrasse et balayez.',
          'Lavez à l’eau savonneuse au balai brosse.',
          'Au nettoyeur haute pression, tenez la buse à distance et suivez le sens des lames sur du bois : trop près, il abîme.',
          'Rincez et laissez sécher avant de remettre le mobilier.',
        ],
        intermediaire: ['Balayage, lavage au balai brosse.', 'Haute pression à distance (sens des lames sur le bois).'],
        expert: ['Lavage annuel.'],
      },
    }),
  },
  {
    when: (p) => house(p) && has(p.exterieur, 'piscine'),
    template: t({
      id: 'piscine-eau', title: 'Contrôler l’eau de la piscine', domain: 'exterieur', importance: 2,
      intervalDays: 7, periodLabel: 'Toutes les semaines, en saison', minutes: 20, budget: 5, difficulty: 1, pro: false, months: [5, 6, 7, 8, 9],
      tools: ['Trousse d’analyse'],
      steps: {
        debutant: [
          'Videz les paniers de skimmer.',
          'Mesurez le pH et le désinfectant avec la trousse d’analyse.',
          'Corrigez selon les indications du fabricant de vos produits.',
          'Vérifiez le niveau d’eau : il doit arriver au milieu des skimmers.',
        ],
        intermediaire: ['Skimmers vidés, pH et désinfectant mesurés.', 'Correction et niveau d’eau.'],
        expert: ['Analyse et correction hebdomadaires.'],
      },
    }),
  },
  {
    when: (p) => house(p) && has(p.exterieur, 'piscine'),
    template: t({
      id: 'piscine-hivernage', title: 'Hivernage de la piscine', domain: 'exterieur', importance: 2,
      intervalDays: 365, periodLabel: 'Chaque automne', minutes: 120, budget: 30, difficulty: 2, pro: false, months: [9, 10],
      steps: {
        debutant: [
          'Nettoyez le bassin et la ligne d’eau.',
          'Ajustez le pH, puis ajoutez le produit d’hivernage selon la notice.',
          'Baissez le niveau sous les skimmers si votre installation le demande, et protégez les canalisations du gel.',
          'Posez la bâche d’hivernage.',
        ],
        intermediaire: ['Nettoyage, pH, produit d’hivernage.', 'Protection contre le gel, bâche.'],
        expert: ['Hivernage selon la notice de l’installation.'],
      },
    }),
  },

  /* ----- Véhicules ----- */
  { template: BASE['pneus'], when: anyCar },
  { template: BASE['essuie-glaces'], when: anyCar },
  {
    when: anyCar,
    template: t({
      id: 'controle-technique', title: 'Contrôle technique', domain: 'vehicule', importance: 1,
      intervalDays: 730, periodLabel: 'Tous les 2 ans (obligatoire)', minutes: 15, budget: 80, difficulty: 4, pro: true,
      steps: {
        debutant: [
          'Le premier contrôle technique a lieu dans les 6 mois avant les 4 ans de la voiture, puis tous les 2 ans.',
          'Vérifiez la date du dernier contrôle sur la carte grise ou le procès-verbal.',
          'Prenez rendez-vous dans un centre agréé.',
          'Gardez le procès-verbal ; en cas de contre-visite, faites les réparations dans le délai indiqué.',
        ],
        intermediaire: ['Rendez-vous en centre agréé (tous les 2 ans).', 'Gardez le procès-verbal.'],
        expert: ['Contrôle technique, procès-verbal à conserver.'],
      },
    }),
  },
  {
    when: (p) => has(p.vehicules, 'thermique'),
    template: t({
      id: 'revision-thermique', title: 'Révision et vidange (essence ou diesel)', domain: 'vehicule', importance: 2,
      intervalDays: 365, periodLabel: 'Tous les ans ou selon le carnet', minutes: 15, budget: 200, difficulty: 4, pro: true,
      steps: {
        debutant: [
          'Regardez le carnet d’entretien : il indique le rythme exact (en kilomètres ou en années).',
          'Prenez rendez-vous au garage.',
          'Demandez de vérifier aussi le filtre d’habitacle et le liquide de frein.',
          'Gardez la facture dans le carnet : utile pour la garantie et la revente.',
        ],
        intermediaire: ['Révision au garage selon le carnet.', 'Filtre d’habitacle et liquide de frein au passage.'],
        expert: ['Révision constructeur.'],
      },
    }),
  },
  {
    when: (p) => has(p.vehicules, 'electrique'),
    template: t({
      id: 'revision-electrique', title: 'Révision de la voiture électrique', domain: 'vehicule', importance: 2,
      intervalDays: 730, periodLabel: 'Selon le carnet (souvent tous les 2 ans)', minutes: 15, budget: 150, difficulty: 4, pro: true,
      steps: {
        debutant: [
          'Pas de vidange sur une électrique, mais une révision reste prévue : regardez le carnet pour le rythme exact.',
          'Prenez rendez-vous dans un garage habilité aux véhicules électriques.',
          'Au programme en général : freins, liquide de frein, filtre d’habitacle, état de la batterie.',
          'Gardez la facture dans le carnet.',
        ],
        intermediaire: ['Révision selon le carnet (garage habilité).', 'Freins, filtre d’habitacle, batterie.'],
        expert: ['Révision constructeur.'],
      },
    }),
  },
  {
    when: anyCar,
    template: t({
      id: 'niveaux', title: 'Vérifier les niveaux de la voiture', domain: 'vehicule', importance: 2,
      intervalDays: 60, periodLabel: 'Tous les 2 mois', minutes: 10, budget: 5, difficulty: 1, pro: false,
      tools: ['Liquide lave-glace', 'Chiffon'],
      questions: [{ id: 'moteur', label: 'Quelle voiture ?', options: [{ v: 'thermique', l: 'Essence ou diesel' }, { v: 'electrique', l: 'Électrique' }] }],
      choicesFrom: (p): Record<string, string> => {
        const cars = p.vehicules.filter((v) => v === 'thermique' || v === 'electrique');
        return cars.length === 1 ? { moteur: cars[0] } : {};
      },
      steps: {
        debutant: [
          'Garez-vous à plat, moteur froid.',
          { t: 'Huile : tirez la jauge, essuyez-la, replongez-la, ressortez-la. Le niveau doit être entre les deux repères.', si: { moteur: ['thermique'] } },
          'Liquide de refroidissement : regardez le bocal sans l’ouvrir, le niveau entre MIN et MAX.',
          'Lave-glace : complétez le réservoir (avec un produit antigel en hiver).',
          'Liquide de frein : niveau entre MIN et MAX ; s’il baisse, garage sans attendre.',
        ],
        intermediaire: [
          { t: 'Huile à la jauge, moteur froid.', si: { moteur: ['thermique'] } },
          'Refroidissement et liquide de frein entre MIN et MAX.',
          'Lave-glace complété.',
        ],
        expert: ['Contrôle des niveaux.'],
      },
    }),
  },
  {
    when: anyCar,
    template: t({
      id: 'humidite-voiture', title: 'Chasser l’humidité de la voiture', domain: 'vehicule', importance: 4,
      intervalDays: 30, periodLabel: 'Tous les mois, en saison humide', minutes: 15, budget: 0, difficulty: 1, pro: false, months: [10, 11, 12, 1, 2, 3],
      tools: ['Sachet absorbeur d’humidité'],
      alternatives: { 'Sachet absorbeur d’humidité': 'Une chaussette remplie de litière pour chat (au gel de silice) posée sur le tableau de bord.' },
      steps: {
        debutant: [
          'Sortez les tapis, secouez-les et laissez-les sécher à l’intérieur de la maison.',
          'Rangez le parapluie mouillé dans un sac fermé, pas sur le plancher.',
          'Par temps sec, roulez quelques minutes avec la climatisation : elle assèche l’air, même en hiver.',
          'Posez un absorbeur d’humidité dans l’habitacle.',
          'Si la buée revient sans cesse, faites vérifier le filtre d’habitacle et les joints de portière.',
        ],
        intermediaire: ['Tapis séchés, parapluie en sac.', 'Climatisation quelques minutes, absorbeur d’humidité.'],
        expert: ['Tapis, clim, absorbeur ; filtre d’habitacle si persistant.'],
      },
    }),
  },
];

CATALOGUE.push(...CATALOGUE_EXTRA);

/** Modèles utiles pour un profil donné. */
export function templatesFor(p: Profile): Template[] {
  return CATALOGUE.filter((c) => c.when(p)).map((c) => c.template);
}

/** Tous les identifiants de modèles connus. */
export const CATALOGUE_IDS = new Set(CATALOGUE.map((c) => c.template.id));
