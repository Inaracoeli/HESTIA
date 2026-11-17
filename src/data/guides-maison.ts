// Contenu enrichi des fiches « maison » : comprendre, aller plus loin, pièges, règles et sources.
// Les valeurs légales sont sourcées ; les autres sont des repères courants de fabricants et d'organismes.
import type { Guide } from './types';

const FAQ_CHAUFFAGE = 'https://www.ecologie.gouv.fr/sites/default/files/documents/FAQ%20Inspection%20entretien%20chauffage%20et%20clim.pdf';

export const GUIDES_MAISON: Record<string, Guide> = {
  detecteurs: {
    comprendre:
      'Un détecteur de fumée peut tomber en panne sans prévenir : pile usée, capteur encrassé, appareil en fin de vie. Le bouton test vérifie en quelques secondes la pile, le circuit et la sirène. C’est le geste de sécurité le plus rentable de la maison.',
    expert: [
      'Le bouton test contrôle l’électronique et la sirène, pas la chambre de détection : un aérosol de test homologué vérifie aussi le capteur.',
      'Norme NF EN 14604 obligatoire. Un modèle à pile lithium scellée de 10 ans évite les changements de pile.',
      'Emplacement : au plafond, dans le dégagement qui dessert les chambres, à plus de 30 cm d’un mur ; jamais dans la cuisine ou la salle de bain (fausses alarmes).',
      'Des détecteurs interconnectés (radio) font sonner toute la maison dès qu’un seul détecte : utile sur plusieurs étages.',
    ],
    pieges: ['Retirer la pile après une fausse alarme et oublier de la remettre.', 'Peindre ou couvrir le détecteur.', 'Garder un appareil de plus de 10 ans : la date figure au dos.'],
    regle: 'Au moins un détecteur par logement est obligatoire depuis 2015. Son entretien et le remplacement des piles sont à la charge de l’occupant, locataire ou propriétaire.',
    sources: [{ l: 'Détecteur de fumée : obligations (justice.fr / Service-public)', url: 'https://www.justice.fr/fiche/detecteur-fumee-daaf-securite-incendie-logement' }],
  },
  differentiel: {
    comprendre:
      'L’interrupteur différentiel 30 mA coupe le courant en une fraction de seconde si une partie du courant s’échappe, par exemple à travers une personne. Il peut rester des années sans servir et se gripper : le bouton « Test » simule une fuite et vérifie qu’il coupe bien.',
    expert: [
      'Le bouton test vérifie le mécanisme, pas la sensibilité réelle : un contrôleur d’installation mesure le courant et le temps de déclenchement.',
      'La norme NF C 15-100 impose au moins deux différentiels 30 mA, dont un de type A pour la plaque de cuisson et le lave-linge ; une borne de recharge demande un type A-EV, F ou B selon le matériel.',
      'Pas plus de 8 disjoncteurs divisionnaires sous un même différentiel en principe.',
      'Des déclenchements à répétition signalent un défaut d’isolement : coupez tous les circuits, réarmez le différentiel, puis remontez les circuits un par un pour trouver le fautif.',
    ],
    pieges: ['Oublier d’éteindre un ordinateur ou un congélateur avant le test.', 'Ne jamais tester parce que « ça marche ».', 'Ouvrir le tableau sous tension pour bricoler.'],
    sources: [{ l: 'Tester un interrupteur différentiel (Legrand)', url: 'https://www.legrand.fr/mon-projet/tutoriels/tester-un-interrupteur-differentiel' }],
  },
  'pac-filtres': {
    comprendre:
      'Les filtres arrêtent la poussière avant l’échangeur. Encrassés, ils freinent l’air : la pompe à chaleur force, consomme davantage et chauffe ou refroidit moins bien. C’est l’entretien le plus utile que vous puissiez faire vous-même entre deux visites du technicien.',
    expert: [
      'Gainable : le filtre est souvent derrière la grille de reprise ; un filtre plissé ou de type G3-G4 se change, un média lavable se rince à l’eau tiède.',
      'Contrôlez aussi la grille de soufflage et le bac à condensats : un siphon sec ou bouché donne odeurs et débordement.',
      'Une baisse de débit ou un écart de température soufflage-reprise plus faible qu’habituellement signale un filtre ou un échangeur encrassé.',
      'Unité extérieure : gardez 50 cm libres autour, retirez feuilles et neige ; ne redressez les ailettes qu’avec un peigne adapté.',
    ],
    pieges: ['Remettre un filtre encore humide.', 'Utiliser un nettoyeur haute pression sur les ailettes de l’échangeur.', 'Faire tourner l’appareil sans filtre.'],
    sources: [{ l: 'Fiche ADEME : entretenir sa pompe à chaleur ou son climatiseur', url: 'https://librairie.ademe.fr/ged/8309/fiche-entretien-pompe-chaleur-climatiseur.pdf' }],
  },
  'pac-entretien': {
    comprendre:
      'La visite d’un frigoriste vérifie ce que vous ne pouvez pas voir : étanchéité du circuit de fluide, pressions, organes électriques, rendement. Une pompe à chaleur entretenue consomme moins et dure plus longtemps.',
    expert: [
      'L’arrêté du 24 juillet 2020 fixe le contenu minimal de la visite : contrôle d’étanchéité, nettoyage des échangeurs, vérification des sécurités et conseils de réglage.',
      'Le technicien doit détenir une attestation de capacité pour manipuler les fluides frigorigènes.',
      'Demandez les relevés : pressions, températures, éventuelle recharge en fluide. Une recharge répétée signale une fuite à rechercher.',
      'Climatisations réversibles (air-air) comprises dans l’obligation dès 4 kW.',
    ],
    pieges: ['Confondre le nettoyage des filtres (à faire soi-même) avec l’entretien obligatoire.', 'Égarer l’attestation : l’assureur peut la demander.'],
    regle: 'Entretien obligatoire au moins tous les 2 ans pour les pompes à chaleur et climatisations de 4 à 70 kW (décret n° 2020-912). Une attestation doit vous être remise dans les 15 jours.',
    sources: [
      { l: 'Fiche ADEME : entretien des pompes à chaleur et climatiseurs', url: 'https://librairie.ademe.fr/ged/8309/fiche-entretien-pompe-chaleur-climatiseur.pdf' },
      { l: 'FAQ du ministère sur l’entretien des chaudières et systèmes thermodynamiques', url: FAQ_CHAUFFAGE },
    ],
  },
  'clim-filtres': {
    comprendre:
      'Les filtres de l’unité murale retiennent poussières et pollens. Encrassés, ils réduisent le débit d’air, augmentent la consommation et favorisent les odeurs. Un nettoyage régulier prend quelques minutes.',
    expert: [
      'Certains fabricants conseillent un nettoyage toutes les 2 à 4 semaines en usage intensif.',
      'Les filtres purificateurs (charbon, catéchine…) ne se lavent pas toujours : vérifiez la notice et remplacez-les selon la durée indiquée.',
      'Une odeur de moisi vient souvent de la turbine ou de l’évaporateur : nettoyage par un professionnel ou une mousse dédiée, appareil coupé.',
      'L’entretien biennal obligatoire concerne aussi les climatisations réversibles de 4 à 70 kW.',
    ],
    pieges: ['Laver à l’eau chaude ou au lave-vaisselle : le filtre se déforme.', 'Remonter un filtre humide.'],
  },
  chaudiere: {
    comprendre:
      'L’entretien annuel vérifie la combustion et la sécurité : une chaudière mal réglée consomme davantage et peut produire du monoxyde de carbone, un gaz invisible et mortel.',
    expert: [
      'Le technicien mesure le taux de CO et le rendement, nettoie le corps de chauffe et le brûleur, vérifie les dispositifs de sécurité et le conduit.',
      'L’attestation indique la classe d’émission de NOx et des conseils d’amélioration.',
      'PAC hybride : la partie chaudière reste soumise à l’entretien annuel.',
      'Pendant la visite, demandez à vérifier la pression du circuit (en général entre 1 et 2 bars à froid) et le vase d’expansion.',
    ],
    pieges: ['Attendre octobre : les techniciens sont débordés.', 'Ne pas conserver l’attestation (2 ans au minimum).'],
    regle: 'Entretien annuel obligatoire des chaudières de 4 à 400 kW, gaz, fioul, bois ou charbon. Attestation remise dans les 15 jours.',
    sources: [{ l: 'FAQ du ministère sur l’entretien des chaudières', url: FAQ_CHAUFFAGE }],
  },
  ramonage: {
    comprendre:
      'Les fumées déposent dans le conduit de la suie et du bistre, inflammables. Le ramonage mécanique retire ces dépôts, évite les feux de cheminée et garantit le tirage, donc l’évacuation des fumées toxiques.',
    expert: [
      'Depuis le 1er octobre 2023, le ramonage est encadré au niveau national (décret n° 2023-641, articles R.1331-66 et suivants du code de la santé publique).',
      'Deux ramonages par an, dont un pendant la saison de chauffe, sont recommandés au-delà de 6 stères de bois bûche ou 2,5 tonnes de granulés par an.',
      'Le certificat atteste de la vacuité du conduit sur toute sa longueur : à garder pour l’assurance.',
      'Brûlez du bois sec (humidité inférieure à 20 %) : un bois humide multiplie le bistre.',
      'Poêle à granulés : l’entretien de l’appareil (vis, brûleur, ventilateur) est distinct du ramonage du conduit.',
    ],
    pieges: ['Compter sur les bûches « ramoneuses » : elles ne remplacent pas le ramonage mécanique.', 'Ramoner soi-même : le certificat d’un professionnel qualifié est exigé.'],
    regle: 'Au moins un ramonage par an par un professionnel ; le règlement sanitaire départemental peut en exiger deux, dont un pendant la période de chauffe. Si l’appareil n’a pas servi pendant 12 mois, un ramonage est requis avant de le rallumer.',
    sources: [{ l: 'Décret n° 2023-641 relatif à l’entretien et au ramonage (AIDA – Ineris)', url: 'https://aida.ineris.fr/reglementation/decret-ndeg-2023-641-200723-relatif-a-lentretien-foyers-appareils-chauffage-cuisine' }],
  },
  vmc: {
    comprendre:
      'La VMC renouvelle l’air et évacue l’humidité de la cuisine, de la salle de bain et des WC. Des bouches encrassées réduisent l’aspiration : condensation, moisissures et mauvaises odeurs suivent.',
    expert: [
      'Bouche hygroréglable : ne la plongez pas dans l’eau, le capteur (tresse) se règle en usine ; dépoussiérez-la au pinceau.',
      'Entrées d’air des fenêtres : à dépoussiérer aussi, jamais à boucher.',
      'Test simple : une feuille de papier doit rester plaquée contre une bouche en fonctionnement.',
      'Double flux : filtres à changer en général tous les 6 à 12 mois ; contrôle du caisson par un professionnel tous les 3 ans environ.',
      'Ne coupez jamais la VMC, même en vacances : le logement s’humidifie.',
    ],
    pieges: ['Brancher la hotte sur la VMC.', 'Boucher les entrées d’air pour « garder la chaleur ».'],
  },
  'groupe-securite': {
    comprendre:
      'Le groupe de sécurité protège le ballon d’eau chaude contre la surpression : sa soupape s’ouvre à 7 bars. Manœuvrée régulièrement, elle évacue le calcaire et ne se bloque pas. Un groupe grippé peut faire gonfler, voire éclater, la cuve.',
    expert: [
      'Quelques gouttes pendant la chauffe sont normales (dilatation de l’eau). Un filet permanent indique une soupape entartrée ou une pression d’arrivée trop forte : au-delà de 3 bars, un réducteur de pression est conseillé.',
      'Les fabricants recommandent de le manœuvrer au moins une fois par mois et de le remplacer en général tous les 5 ans environ, plus souvent en eau dure.',
      'Ballon électrique : l’anode magnésium se contrôle tous les 2 ans environ ; le détartrage de la cuve tous les 2 à 3 ans en eau calcaire.',
      'L’évacuation doit passer par un siphon avec garde d’air visible.',
    ],
    pieges: ['Ne jamais le manœuvrer, puis le forcer après des années.', 'Boucher l’écoulement qui goutte.'],
  },
  adoucisseur: {
    comprendre:
      'L’adoucisseur retient le calcaire grâce à une résine, que le sel régénère. Sans sel, l’eau redevient dure en quelques jours sans que vous le remarquiez.',
    expert: [
      'Contrôlez la dureté avec des bandelettes : l’eau adoucie vise souvent 8 à 15 °f pour rester agréable et non corrosive.',
      'Un « pont de sel » (croûte dure en surface) empêche la régénération : cassez-le avec un manche.',
      'Sel en pastilles conforme à la norme NF EN 973.',
      'Désinfection de la résine une à deux fois par an, et cartouche du préfiltre à changer selon la notice.',
    ],
    pieges: ['Utiliser du sel de cuisine ou de déneigement.', 'Remplir le bac à ras bord : il colmate plus vite.'],
  },
  solaire: {
    comprendre:
      'Une installation solaire ne demande presque rien, mais une panne d’onduleur ou un panneau ombragé peut faire chuter la production pendant des mois sans que vous le voyiez. Un coup d’œil mensuel à l’application suffit.',
    expert: [
      'Comparez la production au même mois de l’année précédente : un écart de plus de 15 à 20 % par beau temps mérite une recherche.',
      'Voyants et codes défaut de l’onduleur ou des micro-onduleurs : notez-les avant d’appeler l’installateur.',
      'Le nettoyage n’est utile qu’en cas de salissure importante (pollen, fientes, poussière agricole), à l’eau claire, depuis le sol.',
      'Contrôle visuel annuel des câbles et fixations après les tempêtes ; l’onduleur central dure souvent 10 à 15 ans.',
    ],
    pieges: ['Monter sur le toit.', 'Utiliser un nettoyeur haute pression ou de l’eau calcaire sur les panneaux.'],
  },
  fosse: {
    comprendre:
      'Une fosse toutes eaux sépare les boues des eaux usées. Quand les boues dépassent la moitié du volume, elles partent vers l’épandage et le colmatent : réparation coûteuse. La vidange par un vidangeur agréé l’évite.',
    expert: [
      'Repère : environ 4 ans pour une famille de 4 avec une fosse de 3 m³, à ajuster selon la hauteur de boues mesurée.',
      'Le préfiltre (pouzzolane) et le bac dégraisseur se nettoient plus souvent, en général une fois par an.',
      'Micro-station : vidange dès 30 % de boues et entretien annuel du compresseur.',
      'Le SPANC contrôle l’installation au plus tard tous les 10 ans et lors d’une vente.',
    ],
    pieges: ['Verser de l’eau de Javel, des solvants ou des lingettes.', 'Perdre le bordereau de vidange.'],
    regle: 'Vidange dès que les boues atteignent 50 % du volume utile, par une entreprise agréée par le préfet, qui remet un bordereau de suivi des matières de vidange à conserver.',
    sources: [{ l: 'Guide d’entretien de l’assainissement non collectif (SPANC Mauges-sur-Loire)', url: 'https://www.mauges-sur-loire.fr/wp-content/uploads/2018/07/entretien_installation_SPANC.pdf' }],
  },
  'lave-linge': {
    comprendre:
      'Le filtre de vidange retient pièces, cheveux et peluches avant la pompe. Bouché, il empêche la machine de vidanger et use la pompe.',
    expert: [
      'Lancez un cycle d’entretien à 60 °C ou plus, à vide, une fois par mois si vous lavez souvent à basse température.',
      'Le filtre d’arrivée d’eau (derrière, au raccord du tuyau) s’entartre : rincez-le une à deux fois par an.',
      'Dosez la lessive selon la dureté de l’eau : un surdosage encrasse la machine.',
    ],
    pieges: ['Ouvrir la trappe sans serpillière ni récipient.', 'Ouvrir le filtre juste après un lavage à 60 °C : l’eau est brûlante.'],
  },
  'lave-vaisselle': {
    comprendre:
      'Le filtre au fond de la cuve retient les déchets. Encrassé, il donne une vaisselle mal lavée, de mauvaises odeurs et finit par bloquer la vidange.',
    expert: [
      'Les gicleurs des bras d’aspersion se débouchent avec un cure-dent.',
      'Réglez l’adoucisseur intégré selon la dureté de votre eau, et gardez sel régénérant et liquide de rinçage remplis.',
      'Un cycle chaud à vide avec un nettoyant machine, une fois par mois, dégraisse les conduits.',
    ],
    pieges: ['Faire tourner la machine sans le filtre.', 'Mettre du sel de cuisine dans le bac à sel.'],
  },
  hotte: {
    comprendre:
      'Les filtres métalliques captent la graisse. Saturés, ils aspirent mal, gouttent et deviennent inflammables.',
    expert: [
      'Filtres inox ou alu : au lave-vaisselle, debout, programme normal ; l’alu peut ternir, sans incidence.',
      'Hotte en recyclage : le filtre à charbon se change en général tous les 3 à 6 mois (certains se régénèrent au four).',
      'Une hotte ne doit jamais être raccordée à un conduit de VMC.',
    ],
    pieges: ['Oublier le filtre à charbon d’une hotte en recyclage : elle ne retient plus les odeurs.'],
  },
  joints: {
    comprendre:
      'Les joints silicone autour de la douche, de la baignoire et de l’évier empêchent l’eau de passer derrière. Un joint fendu ou décollé laisse filtrer l’eau sans bruit : moisissures, carrelage qui se décolle, dégâts chez le voisin du dessous.',
    expert: [
      'Retirez l’ancien joint entièrement (cutter, grattoir, dissolvant à silicone) et dégraissez à l’alcool avant de reposer.',
      'Mastic sanitaire anti-moisissure ; remplissez la baignoire avant de poser le joint pour qu’il ne travaille pas ensuite.',
      'Lissez au doigt mouillé d’eau savonneuse et laissez sécher 24 h sans eau.',
    ],
    pieges: ['Poser du silicone neuf sur l’ancien.', 'Confondre joint silicone et joint de carrelage (ciment).'],
  },
  siphons: {
    comprendre:
      'Le siphon garde un peu d’eau qui bloque les odeurs d’égout, et retient cheveux et graisses. Le nettoyer avant qu’il bouche évite les produits agressifs.',
    expert: [
      'Siphon bouteille : se dévisse à la main ; un siphon tube se démonte par les écrous.',
      'Pour l’entretien, eau chaude et cristaux de soude, plutôt que des déboucheurs à la soude caustique, plus agressifs.',
      'Changez les joints plats s’ils sont écrasés.',
    ],
    pieges: ['Oublier la bassine dessous.', 'Serrer les écrous plastique à la pince.'],
  },
  frigo: {
    comprendre:
      'Le réfrigérateur évacue sa chaleur par la grille à l’arrière ou dessous. Couverte de poussière, elle chauffe : l’appareil tourne plus longtemps et consomme davantage.',
    expert: [
      'Laissez au moins quelques centimètres d’espace à l’arrière pour la circulation de l’air.',
      'Températures conseillées : 4 °C au réfrigérateur, -18 °C au congélateur.',
      'Un joint de porte qui ne retient pas une feuille de papier laisse entrer l’air chaud.',
    ],
    pieges: ['Ne pas débrancher avant d’aspirer.'],
  },
  pharmacie: {
    comprendre:
      'Un médicament périmé ou mal conservé peut être inefficace. Trier une fois par an permet aussi de savoir ce qu’il manque avant d’en avoir besoin.',
    expert: [
      'Rapportez les médicaments périmés ou inutilisés à la pharmacie (filière Cyclamed), sans les emballages carton ni les notices, qui vont au tri.',
      'Gardez les notices avec les boîtes et rangez l’armoire en hauteur, hors de portée des enfants, loin de l’humidité de la salle de bain.',
      'Une trousse de base : antiseptique, pansements, compresses, thermomètre, antalgique adapté à chaque membre du foyer.',
    ],
    pieges: ['Jeter les médicaments à la poubelle ou dans les toilettes.'],
  },
  'seche-linge': {
    comprendre:
      'Les peluches qui échappent au filtre de porte se collent au condenseur. Bouché, il allonge les séchages, augmente la consommation et peut faire surchauffer la machine.',
    expert: [
      'Filtre de porte : à vider après chaque séchage.',
      'Sèche-linge à pompe à chaleur : rincez aussi le filtre du bac de condensation ou du socle, selon le modèle.',
      'L’eau du bac de condensation, déminéralisée, peut servir au fer à repasser une fois filtrée.',
    ],
    pieges: ['Rincer un filtre puis le remonter humide.', 'Utiliser un objet pointu sur les lamelles du condenseur.'],
  },
  volets: {
    comprendre:
      'Poussière, pollen et sable dans les coulisses font forcer le volet, et donc le moteur ou la sangle. Un nettoyage annuel garde le mouvement fluide et prolonge leur durée de vie.',
    expert: [
      'Coulisses : aspirez-les puis passez un lubrifiant sec au silicone, jamais de graisse qui retient la poussière.',
      'Volet motorisé : si les fins de course se décalent, le réglage se fait par les vis du moteur ou par télécommande selon la marque.',
      'Une sangle effilochée se change avant de casser ; un tablier qui sort des coulisses se remet en place lames à plat.',
    ],
    pieges: ['Utiliser un nettoyeur haute pression sur un volet PVC (il marque et pousse l’eau dans le coffre).'],
  },
  serrures: {
    comprendre:
      'Serrures, gonds et poignées s’usent et se grippent avec la poussière. Un peu de lubrifiant évite les clés qui forcent et les portes qui grincent.',
    expert: [
      'Cylindre de serrure : lubrifiant sec (graphite ou PTFE), surtout pas d’huile, qui colle la poussière.',
      'Gonds et paumelles : une goutte d’huile ou de graisse, puis essuyez l’excédent.',
      'Serrure de porte d’entrée multipoints : vérifiez l’alignement des gâches si la porte force à la fermeture.',
    ],
    pieges: ['Mettre de l’huile alimentaire, qui rancit et colle.'],
  },
  portail: {
    comprendre:
      'Un portail motorisé combine mécanique et sécurités. Graisser, nettoyer et tester les cellules évite les pannes et surtout les accidents avec les enfants.',
    expert: [
      'Test des photocellules : coupez le faisceau pendant la fermeture, le portail doit s’arrêter ou se rouvrir.',
      'Portail coulissant : nettoyez le rail et vérifiez la crémaillère ; battant : graissez les rotules des bras.',
      'Changez les piles des télécommandes une fois par an, et celles de la batterie de secours selon la notice.',
      'Un portail qui force réclame une vérification des gonds et de la course avant d’accuser le moteur.',
    ],
    pieges: ['Graisser les cellules ou les nettoyer avec un solvant.', 'Laisser jouer les enfants pendant le mouvement.'],
  },
  store: {
    comprendre:
      'La toile d’un store banne retient poussière et humidité : moisissures et taches s’installent si on l’enroule mouillée.',
    expert: [
      'Brossez à sec, puis lavez à l’eau tiède savonneuse et rincez à l’eau claire ; un nettoyant spécial toile pour les taches.',
      'Laissez sécher toile déroulée avant de l’enrouler.',
      'Vérifiez bras articulés et fixations murales ; graissez les articulations selon la notice.',
    ],
    pieges: ['Le nettoyeur haute pression, qui abîme l’enduction imperméable.', 'Laisser le store sorti par vent fort.'],
  },
  toiture: {
    comprendre:
      'Une tuile déplacée ou un solin décollé laisse entrer l’eau lentement, souvent sans trace visible pendant des mois. Un tour depuis le sol, à la jumelle, repère la plupart des problèmes.',
    expert: [
      'Points à regarder : tuiles cassées ou glissées, faîtage, solins autour de la cheminée et des fenêtres de toit, mousse épaisse.',
      'Dans les combles, une lampe suffit à repérer les traces d’humidité sur la charpente ou l’isolant.',
      'Démoussage tous les 3 à 5 ans environ selon l’exposition, par un professionnel sur les toits pentus.',
    ],
    pieges: ['Monter sur le toit soi-même : les chutes de toiture sont graves et fréquentes.'],
  },
  'radiateurs-poussiere': {
    comprendre:
      'La poussière posée sur et dans les radiateurs isole la chaleur et brûle en dégageant une odeur au premier allumage. Un dépoussiérage avant l’hiver améliore le confort.',
    expert: [
      'Radiateurs à eau : purgez l’air s’ils chauffent en haut et pas en bas ; vérifiez ensuite la pression de la chaudière.',
      'Ne couvrez pas les radiateurs (linge, meubles) : la chaleur ne circule plus.',
      'Grilles de soufflage et de reprise d’un gainable : à dépoussiérer en même temps.',
    ],
    pieges: ['Purger un radiateur sans chiffon ni récipient.'],
  },
  'detecteur-co': {
    comprendre:
      'Le monoxyde de carbone est un gaz invisible et sans odeur produit par une combustion incomplète (chaudière, poêle, cheminée, chauffe-eau gaz). Le détecteur est le seul moyen d’être prévenu à temps.',
    expert: [
      'Norme NF EN 50291. Placez-le dans la pièce de l’appareil à combustion, à hauteur de respiration ou selon la notice, à 1 à 3 m de l’appareil.',
      'Durée de vie souvent de 7 à 10 ans : le capteur s’épuise, la date figure au dos.',
      'En cas d’alarme : ouvrez les fenêtres, arrêtez les appareils, sortez, appelez le 18 ou le 112.',
    ],
    pieges: ['L’installer près d’une fenêtre ou dans un courant d’air.'],
  },
  'facades-cuisine': {
    comprendre:
      'La graisse de cuisson se dépose en film collant sur les façades et attire la poussière. Plus on attend, plus elle durcit.',
    expert: ['Eau chaude et liquide vaisselle, ou bicarbonate pour les traces tenaces, puis rinçage et séchage.', 'Bois brut ou huilé : chiffon à peine humide, puis huile d’entretien de temps en temps.'],
    pieges: ['Les éponges abrasives sur les façades laquées ou brillantes.'],
  },
  'dessus-meubles': {
    comprendre: 'La poussière en hauteur retombe à chaque courant d’air. La retirer une à deux fois par an suffit.',
    expert: ['Commencez toujours par le haut, aspirez ensuite le sol.', 'Une microfibre légèrement humide retient la poussière au lieu de la disperser.'],
    pieges: ['Monter sur une chaise instable : prenez l’escabeau.'],
  },
  four: {
    comprendre:
      'Les projections cuites et recuites finissent par fumer et donner un goût. Un four nettoyé régulièrement se nettoie vite.',
    expert: [
      'Pyrolyse : retirez grilles et plaques, puis essuyez les cendres à la fin ; à faire selon l’usage, pas à chaque fois (forte consommation).',
      'Sans pyrolyse : pâte de bicarbonate et eau laissée une nuit, puis éponge et vinaigre pour rincer.',
      'La porte se démonte sur beaucoup de modèles pour nettoyer entre les vitres ; notez le sens des vitres au démontage.',
    ],
    pieges: ['Décapant pour four sur une paroi catalytique (elle est poreuse et s’abîme).'],
  },
  'micro-ondes': {
    comprendre: 'Les projections sèchent sur les parois et absorbent une partie des ondes. Une vapeur de quelques minutes les ramollit.',
    expert: ['Bol d’eau et de vinaigre ou citron, 3 à 5 minutes à pleine puissance, porte fermée 5 minutes, puis essuyez.', 'Le plateau et son support passent à l’eau savonneuse.'],
    pieges: ['Faire chauffer le micro-ondes à vide.'],
  },
  'frigo-interieur': {
    comprendre: 'Les écoulements et aliments oubliés favorisent les bactéries et les odeurs. Un nettoyage tous les trois mois permet aussi de faire le tri.',
    expert: [
      'Eau chaude et vinaigre blanc, ou bicarbonate ; évitez l’eau de Javel sur les joints.',
      'Le petit trou d’évacuation au fond de la cuve se débouche avec un coton-tige.',
      'Vérifiez la température : 4 °C dans la zone la plus froide.',
    ],
    pieges: ['Remettre les aliments sans avoir séché les clayettes.'],
  },
  congelateur: {
    comprendre: 'Le givre isole les parois : l’appareil consomme davantage et la place diminue. Au-delà de quelques millimètres, il est temps de dégivrer.',
    expert: [
      'Débranchez, videz dans une glacière ou du papier journal, posez des bols d’eau chaude dans la cuve, porte ouverte.',
      'Spatule en plastique seulement ; jamais d’objet pointu ni de sèche-cheveux près de l’eau.',
      'Rebranchez à sec et attendez que le froid revienne (-18 °C) avant de recharger.',
    ],
    pieges: ['Gratter le givre avec un couteau : on perce le circuit de fluide.'],
  },
  'detartrage-cuisine': {
    comprendre: 'Le calcaire ralentit la chauffe et donne des particules dans le café ou le thé. Un détartrage régulier prolonge la vie des appareils.',
    expert: [
      'Bouilloire : vinaigre blanc ou acide citrique et eau, chauffer, laisser agir puis rincer plusieurs fois.',
      'Cafetière à capsules ou expresso : suivez le programme de détartrage du fabricant ; le vinaigre peut abîmer certains joints.',
    ],
    pieges: ['Oublier les rinçages : le premier café a un goût de vinaigre.'],
  },
  'wc-tartre': {
    comprendre: 'Le tartre de la cuvette, mélange de calcaire et d’urine, accroche les salissures et les odeurs. Un détartrage mensuel évite la plaque dure.',
    expert: [
      'Vinaigre blanc chaud ou acide citrique, laissé une nuit, puis brossage.',
      'Pour agir sous l’eau, baissez d’abord le niveau en vidant un seau d’eau d’un coup.',
      'Une chasse qui coule en permanence dépose du tartre : changez le joint du mécanisme.',
    ],
    pieges: ['Mélanger javel et produit acide : dégagement de chlore toxique.'],
  },
  'douche-calcaire': {
    comprendre: 'Le calcaire bouche les buses du pommeau et les mousseurs : le jet faiblit, l’eau part de travers.',
    expert: ['Trempage dans le vinaigre blanc quelques heures, ou un sac de vinaigre fixé autour du pommeau.', 'Frottez les buses en caoutchouc du bout du doigt.', 'Mousseur : clé ou pince entourée d’un chiffon pour ne pas rayer le chrome.'],
    pieges: ['Laisser tremper des pièces dorées ou en laiton nu : le vinaigre les ternit.'],
  },
  'joints-carrelage': {
    comprendre: 'Les joints de carrelage poreux retiennent la crasse et les moisissures. Un nettoyage régulier évite de devoir les refaire.',
    expert: [
      'Bicarbonate et brosse à dents, ou percarbonate dans l’eau chaude pour blanchir.',
      'Moisissures : un produit antifongique, pièce aérée.',
      'Une fois propres et secs, un imperméabilisant pour joints limite l’encrassement.',
    ],
    pieges: ['Gratter avec un objet métallique, qui creuse le joint.'],
  },
  'poussiere-cachee': {
    comprendre: 'Derrière les écrans et les box, la poussière s’accumule, chauffe et attire les acariens.',
    expert: ['Écrans : microfibre sèche, appareil éteint et froid.', 'Prises et multiprises : un pinceau sec, jamais humide.', 'Profitez-en pour ranger les câbles avec des colliers.'],
    pieges: ['Vaporiser un produit directement sur un écran.'],
  },
  'plinthes-interrupteurs': {
    comprendre: 'Interrupteurs, poignées et télécommandes sont touchés par tout le monde. Un nettoyage de temps en temps limite les microbes et les traces.',
    expert: ['Chiffon à peine humide d’eau savonneuse ou d’alcool ménager, jamais mouillé sur un interrupteur.', 'Plinthes : aspirateur avec brosse, puis chiffon humide.'],
  },
  luminaires: {
    comprendre: 'La poussière sur les ampoules et abat-jour réduit la lumière et brûle à la chaleur.',
    expert: ['Éteignez et laissez refroidir.', 'Abat-jour en tissu : rouleau adhésif ou brosse douce.'],
  },
  vitres: {
    comprendre: 'Des vitres propres laissent entrer plus de lumière. La technique fait toute la différence entre un lavage rapide et des traces partout.',
    expert: [
      'Lavez par temps couvert : le soleil sèche l’eau trop vite et laisse des traces.',
      'Mouilleur et eau avec une goutte de liquide vaisselle, puis raclette en « S » ou de haut en bas, en essuyant la lame à chaque passage.',
      'Finissez les bords à la microfibre sèche.',
      'Profitez-en pour nettoyer les rails et vérifier les trous d’évacuation en bas des fenêtres.',
    ],
    pieges: ['Trop de produit : il laisse un film.'],
  },
  matelas: {
    comprendre: 'Faire pivoter le matelas répartit l’usure ; l’aspirer retire peaux mortes et acariens.',
    expert: [
      'Beaucoup de matelas récents n’ont qu’une face de couchage : faites-les seulement pivoter tête-pieds.',
      'Taches : eau froide et savon de Marseille, peu mouillé, puis séchage complet.',
      'Une alèse lavable à 60 °C protège mieux qu’aucun nettoyage.',
    ],
    pieges: ['Retourner un matelas à face unique.'],
  },
  couettes: {
    comprendre: 'Couettes et oreillers accumulent sueur et acariens. Les laver deux fois par an les garde gonflants et sains.',
    expert: [
      'Vérifiez l’étiquette : synthétique souvent à 60 °C, plumes à 30 ou 40 °C.',
      'Au-delà de 8 kg environ, la laverie est plus sûre qu’une machine domestique.',
      'Séchez complètement, avec des balles de séchage, pour éviter les moisissures.',
    ],
    pieges: ['Remettre une couette encore humide au cœur.'],
  },
  canape: {
    comprendre: 'Poussière et miettes s’incrustent dans le tissu et l’usent. Un passage d’aspirateur régulier et un détachage rapide gardent le canapé net.',
    expert: ['Repérez le code d’entretien sous l’assise : W (eau), S (solvant), W/S, X (aspirateur seulement).', 'Cuir : dépoussiérer, puis lait nourrissant deux fois par an.'],
    pieges: ['Frotter une tache : tamponnez de l’extérieur vers le centre.'],
  },
  rideaux: {
    comprendre: 'Les rideaux filtrent la poussière de la fenêtre. Un lavage annuel leur rend leur couleur.',
    expert: ['Vérifiez l’étiquette ; voilages à 30 °C en programme délicat.', 'Raccrochez-les encore légèrement humides : ils se défroissent seuls.'],
  },
  poubelles: {
    comprendre: 'Les jus au fond des poubelles attirent mouches et odeurs, surtout l’été.',
    expert: ['Eau chaude et savon noir ou cristaux de soude, puis séchage au soleil.', 'Une couche de papier journal au fond absorbe les écoulements.'],
  },
  aspirateur: {
    comprendre: 'Un filtre bouché fait perdre l’essentiel de l’aspiration et chauffe le moteur.',
    expert: ['Filtres lavables : rincez à l’eau froide, séchez 24 h.', 'Brosse rotative : coupez les cheveux enroulés au cutter.', 'Aspirateur robot : capteurs et roues à nettoyer aussi.'],
    pieges: ['Remonter un filtre humide.'],
  },
  'lave-linge-joint': {
    comprendre: 'Le joint du hublot garde de l’eau et des résidus de lessive : moisissures et mauvaises odeurs sur le linge.',
    expert: ['Essuyez le pli du joint, puis laissez la porte et le bac entrouverts après chaque lavage.', 'Le bac à lessive se retire entièrement pour le nettoyer à l’eau chaude.'],
    pieges: ['La javel pure sur le joint, qui le dessèche.'],
  },
  chaussures: {
    comprendre: 'Le cuir se dessèche et craque s’il n’est pas nourri ; le daim se tache ; les baskets se déforment. Un entretien mensuel double leur durée de vie.',
    expert: [
      'Cuir lisse : brossez, crème nourrissante, puis cirage pour protéger et faire briller ; des embauchoirs en cèdre gardent la forme et absorbent l’humidité.',
      'Daim et nubuck : brosse crêpe et gomme, puis imperméabilisant.',
      'Chaussures mouillées : bourrez-les de papier journal, loin d’un radiateur.',
    ],
    pieges: ['Sécher le cuir près d’une source de chaleur.', 'Passer le daim à l’eau.'],
  },
};

