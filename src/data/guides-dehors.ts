// Contenu enrichi des fiches « jardin » et « voiture ».
import type { Guide } from './types';

const OFB_HAIES = { l: 'OFB : ne pas tailler haies et arbres du 16 mars au 15 août', url: 'https://www.ofb.gouv.fr/sites/default/files/Fichiers/Presse/CP_Taille-des-haies_24032023.pdf' };
const BRULAGE = { l: 'Service-public : peut-on brûler ses déchets verts ?', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F31858' };
const EQUIPEMENTS = { l: 'Service-public : équipements obligatoires d’une voiture', url: 'https://www.service-public.gouv.fr/particuliers/actualites/A16302' };

export const GUIDES_DEHORS: Record<string, Guide> = {
  /* ---------- Jardin et extérieurs ---------- */
  gouttieres: {
    comprendre:
      'Des gouttières pleines de feuilles débordent le long des murs : façade tachée, infiltrations, fondations détrempées, voire gel qui déforme le zinc. Les vider au printemps et après la chute des feuilles suffit dans la plupart des jardins.',
    expert: [
      'Contrôlez la pente (environ 3 à 5 mm par mètre vers la descente) : de l’eau stagnante indique un crochet affaissé.',
      'Testez la descente au tuyau d’arrosage : l’eau doit ressortir franchement au pied.',
      'Une crapaudine ou une grille pare-feuilles en tête de descente limite les bouchons.',
      'Échelle : appui à 75° environ, dépassant d’1 m au-dessus du point d’appui, quelqu’un au pied.',
    ],
    pieges: ['Travailler seul en hauteur.', 'S’appuyer sur la gouttière elle-même avec l’échelle.'],
  },
  haies: {
    comprendre:
      'Tailler régulièrement garde une haie dense depuis le bas et à la bonne hauteur. Deux tailles légères par an valent mieux qu’une grosse coupe. Le calendrier compte autant que la technique : la haie abrite les nids au printemps.',
    expert: [
      'Profil en trapèze, base plus large que le sommet : la lumière atteint le bas, qui ne se dégarnit pas.',
      'Conifères (thuya, cyprès, Leyland) : ne jamais couper dans le bois brun, ils ne repartent pas ; l’if est l’exception.',
      'Haies caduques (charme, hêtre) : une taille de fin d’hiver structure, celle de fin d’été entretient.',
      'Taille-haie : lames affûtées et graissées à la résine ; un taille-haie sur perche évite l’échelle au-delà de 2 m.',
      'Mitoyenneté : une haie de plus de 2 m doit être à au moins 2 m de la limite (article 671 du code civil, sauf règlement local).',
    ],
    pieges: ['Tailler en pleine nidification.', 'Brûler les déchets de taille.', 'Couper un conifère trop court.'],
    regle:
      'L’Office français de la biodiversité recommande de ne pas tailler entre le 16 mars et le 15 août ; c’est interdit aux agriculteurs et certaines communes l’imposent aussi. Le brûlage des déchets verts est interdit (jusqu’à 750 € d’amende) : compost, broyage ou déchetterie.',
    sources: [OFB_HAIES, BRULAGE],
  },
  tonte: {
    comprendre:
      'Couper haut et souvent garde une pelouse dense, qui résiste mieux à la sécheresse et laisse moins de place à la mousse et aux mauvaises herbes. On ne retire jamais plus d’un tiers de la hauteur en une fois.',
    expert: [
      'Hauteur : 5 à 6 cm en général, 7 à 8 cm en été ou à l’ombre.',
      'Mulching : l’herbe finement hachée reste sur place et nourrit le sol, à condition de tondre souvent.',
      'Une lame émoussée arrache l’herbe, qui jaunit en pointe : affûtage une à deux fois par saison.',
      'Changez le sens de tonte à chaque passage pour éviter l’herbe couchée et les ornières.',
    ],
    pieges: ['Tondre ras pour « tondre moins souvent ».', 'Tondre une herbe mouillée.'],
    regle: 'Les horaires d’usage des tondeuses sont fixés par arrêté préfectoral ou municipal (souvent restreints le dimanche et les jours fériés) : renseignez-vous en mairie.',
  },
  'robinet-gel': {
    comprendre:
      'L’eau qui reste dans un robinet extérieur gèle, se dilate et fait éclater le robinet ou le tuyau, souvent dans le mur. Couper et vider avant les premières gelées évite une fuite cachée au printemps.',
    expert: [
      'Fermez la vanne d’arrêt intérieure, ouvrez le robinet extérieur, puis la purge de la vanne si elle en a une.',
      'Laissez le robinet extérieur ouvert tout l’hiver pour que l’eau résiduelle puisse se dilater.',
      'Débranchez et videz le tuyau d’arrosage, rangez-le à l’abri.',
      'Un robinet antigel à purge automatique, avec clapet déporté dans le mur, supprime ce geste.',
    ],
    pieges: ['Laisser le tuyau branché : l’eau prisonnière fait éclater le robinet.'],
  },
  terrasse: {
    comprendre:
      'Mousse, algues et pollution rendent la terrasse glissante et attaquent le bois. Un nettoyage au printemps, suivi d’une protection pour le bois, la remet en état pour la saison.',
    expert: [
      'Bois : brosse et nettoyant dégriseur, ou haute pression avec buse plate, à 30 cm minimum, dans le sens des lames et à pression modérée.',
      'Saturateur sur bois propre et sec, tous les 1 à 2 ans selon l’exposition.',
      'Dalles et pavés : un traitement anti-mousse avant le lavage, puis rinçage ; regarnissez les joints sablés ensuite.',
      'Composite : eau savonneuse et brosse douce ; le haute pression est souvent déconseillé par les fabricants.',
    ],
    pieges: ['Buse rotative trop près du bois : elle creuse les fibres.', 'Javel sur le bois.'],
  },
  'piscine-eau': {
    comprendre:
      'Une eau saine, c’est un désinfectant actif et un pH juste. Hors de la plage, le chlore perd son efficacité et les algues apparaissent en quelques jours de chaleur.',
    expert: [
      'pH : 7,0 à 7,4, idéalement 7,2. Chlore libre : 1 à 3 mg/L. Stabilisant (acide cyanurique) : sous 75 mg/L, sinon vidange partielle.',
      'TAC 80 à 120 mg/L pour stabiliser le pH.',
      'Filtration quotidienne : environ la moitié de la température de l’eau en heures (eau à 26 °C : 13 h).',
      'Pré-filtre de pompe et skimmers à vider chaque semaine ; contre-lavage du filtre à sable quand la pression monte de 0,3 à 0,5 bar.',
      'Corrigez toujours le pH avant de traiter au chlore.',
    ],
    pieges: ['Mélanger les produits chimiques entre eux.', 'Verser l’eau sur le produit plutôt que le produit dans l’eau.'],
    regle: 'Piscine enterrée privée : un dispositif de sécurité normalisé (barrière, abri, couverture ou alarme) est obligatoire.',
  },
  'piscine-hivernage': {
    comprendre:
      'L’hivernage protège le bassin et la filtration du gel et des algues. On le lance quand l’eau passe durablement sous 12 °C : au-dessus, les algues se développent encore.',
    expert: [
      'Hivernage actif : filtration réduite (quelques heures par jour, davantage par grand froid), produit d’hivernage, bâche ; redémarrage facile.',
      'Hivernage passif : niveau baissé sous les buses, canalisations purgées, pompe et filtre vidangés, flotteurs de gel, bâche ; adapté aux régions froides.',
      'Équilibrez l’eau et faites un traitement choc avant l’hivernage.',
      'Pompe à chaleur de piscine : vidangez-la et protégez-la selon la notice.',
    ],
    pieges: ['Vider entièrement une piscine enterrée : la pression de la nappe peut soulever ou déformer le bassin.'],
  },
  recuperateur: {
    comprendre: 'Une cuve pleine qui gèle peut se fendre, et le robinet aussi. La vider en partie et déconnecter le collecteur avant l’hiver suffit.',
    expert: ['Basculez le collecteur de descente en position « hiver » pour que la pluie reparte dans la gouttière.', 'Videz au moins le tiers supérieur et laissez le robinet ouvert.', 'Cuve enterrée : vérifiez simplement le trop-plein et la pompe.'],
    pieges: ['Oublier le robinet fermé et plein d’eau.'],
  },
  'arrosage-hiver': {
    comprendre: 'L’eau qui reste dans les tuyaux, électrovannes et goutteurs gèle et fait éclater les pièces. La purge évite les fuites au redémarrage.',
    expert: [
      'Coupez l’arrivée, ouvrez les purges basses ; pour un réseau enterré, le soufflage à l’air comprimé basse pression (moins de 3 bars) est le plus efficace.',
      'Retirez les piles du programmateur ; rentrez-le s’il est extérieur.',
      'Au printemps, remettez en eau lentement et vérifiez chaque zone.',
    ],
    pieges: ['Souffler à forte pression : les raccords sautent.'],
  },
  tondeuse: {
    comprendre:
      'Une tondeuse entretenue en fin d’hiver démarre au premier coup et coupe net. Une lame émoussée ou un filtre bouché donnent une herbe arrachée et une consommation en hausse.',
    expert: [
      'Thermique 4 temps : vidange d’huile une fois par an ou toutes les 25 à 50 heures, filtre à air nettoyé ou changé, bougie contrôlée (écartement selon la notice).',
      'Pour basculer la tondeuse, filtre à air et carburateur vers le haut : sinon l’huile noie le filtre.',
      'Lame : affûtage à 30° environ en gardant l’équilibre (testez sur un clou) ; changez-la si elle est fissurée ou tordue.',
      'Hivernage : réservoir vidé ou carburant stabilisé ; l’essence avec éthanol (E10) vieillit mal.',
      'Robot de tonte : nettoyez lames et roues, vérifiez le fil périmétrique et rentrez la station l’hiver.',
    ],
    pieges: ['Toucher la lame sans débrancher le fil de bougie ou retirer la batterie.', 'Laisser de l’essence dans le réservoir tout l’hiver.'],
  },
  'outils-jardin': {
    comprendre: 'Des outils propres, affûtés et huilés coupent mieux, fatiguent moins et ne transmettent pas les maladies d’une plante à l’autre.',
    expert: [
      'Lames de sécateur : nettoyage à l’alcool ménager, affûtage à la pierre côté biseau, une goutte d’huile.',
      'Manches en bois : huile de lin pour éviter le dessèchement.',
      'Batteries : stockez-les à l’abri du gel, chargées à environ la moitié.',
    ],
    pieges: ['Ranger les outils mouillés : la rouille s’installe en quelques semaines.'],
  },
  feuilles: {
    comprendre: 'Laissées en couche épaisse sur la pelouse, les feuilles l’étouffent et la font jaunir. Sur les massifs, elles deviennent un paillage gratuit.',
    expert: [
      'Tondeuse avec bac : elle ramasse et broie les feuilles en un seul passage, idéal pour le compost.',
      'Mélangez feuilles (matière brune) et tontes (matière verte) au compost pour un bon équilibre.',
      'Les feuilles de noyer, chêne ou platane se décomposent lentement : en petite quantité au compost.',
    ],
    pieges: ['Les brûler : interdit.'],
    sources: [BRULAGE],
  },
  arbres: {
    comprendre:
      'La taille retire le bois mort ou malade, aère la ramure et, pour les fruitiers, équilibre fruits et pousses. Une taille légère et régulière vaut mieux qu’une coupe sévère.',
    expert: [
      'Fruitiers à pépins (pommier, poirier) : taille d’hiver hors gel, de novembre à début mars.',
      'Fruitiers à noyau (cerisier, prunier, abricotier) : coupes limitées, plutôt en fin d’été, pour réduire les risques de gommose.',
      'Coupe au ras du bourrelet à la base de la branche, sans laisser de chicot ni entailler le tronc.',
      'Outils désinfectés entre deux arbres pour ne pas propager les maladies.',
      'Au-delà de ce que vous atteignez depuis le sol, ou près des lignes électriques : un élagueur professionnel.',
    ],
    pieges: ['« Étêter » un arbre : il repart en gourmands fragiles.', 'Tailler en pleine nidification.'],
    regle: 'L’OFB recommande d’éviter l’élagage entre le 16 mars et le 15 août. Les branches qui dépassent chez le voisin doivent être coupées par le propriétaire de l’arbre.',
    sources: [OFB_HAIES],
  },
  scarifier: {
    comprendre:
      'Le feutre de mousse et d’herbes mortes empêche l’eau et l’air d’atteindre les racines. Scarifier au printemps aère la pelouse, qui repousse plus dense.',
    expert: [
      'Sol ressuyé mais pas détrempé, gazon déjà repoussé ; tondez court juste avant.',
      'Réglez les lames pour qu’elles griffent le sol de 2 à 3 mm, pas plus.',
      'Regarnissez les zones clairsemées avec du gazon de regarnissage et un peu de terreau, puis arrosez.',
      'Beaucoup de mousse : souvent le signe d’un sol acide, tassé ou trop ombragé ; un chaulage ou une aération du sol traitent la cause.',
    ],
    pieges: ['Scarifier en plein été ou par gel.', 'Régler les lames trop bas.'],
  },
  barbecue: {
    comprendre: 'Graisses et cendres de l’an dernier attirent les nuisibles, rouillent la cuve et donnent un goût de brûlé. Un nettoyage de printemps relance la saison.',
    expert: [
      'Grille : chauffée à vide puis brossée ; une brosse sans poils métalliques évite les fragments dans les aliments.',
      'Gaz : test des raccords à l’eau savonneuse (des bulles signalent une fuite) et vérification de la date du tuyau.',
      'Plancha : grattoir, eau chaude, puis fine couche d’huile pour la protéger.',
    ],
    pieges: ['Cendres mises à la poubelle encore chaudes.', 'Rechercher une fuite de gaz avec une flamme.'],
  },
  'mobilier-jardin': {
    comprendre: 'L’humidité de l’hiver grise le bois, rouille le métal et moisit les coussins. Rentrer ou couvrir le mobilier prolonge sa vie de plusieurs saisons.',
    expert: ['Bois exotique : huile ou saturateur au printemps, sur bois propre et sec.', 'Métal : retouchez les éclats de peinture avant l’hiver.', 'Housses respirantes, jamais de bâche plastique plaquée qui garde l’humidité.'],
    pieges: ['Ranger des coussins humides.'],
  },

  /* ---------- Voiture ---------- */
  pneus: {
    comprendre:
      'Un pneu sous-gonflé freine moins bien, chauffe, s’use plus vite et fait consommer davantage. Il perd naturellement de la pression, même sans crevaison : un contrôle mensuel suffit.',
    expert: [
      'La valeur conseillée (étiquette de la portière) s’entend pneus froids ; en charge ou sur autoroute, utilisez la valeur « charge ».',
      'Contrôle de l’usure : les témoins dans les rainures signalent 1,6 mm ; le freinage sur sol mouillé se dégrade nettement dès 3 mm.',
      'Regardez les flancs : hernie, coupure ou craquelures imposent un remplacement.',
      'Voiture électrique : le poids de la batterie use davantage les pneus ; des pneus adaptés (marquage spécifique) sont souvent préconisés.',
      'Une usure plus marquée d’un côté signale un défaut de parallélisme.',
    ],
    pieges: ['Se fier à l’aspect : un pneu peut perdre 0,5 bar sans que ça se voie.', 'Oublier la roue de secours.'],
    regle: 'Profondeur minimale légale : 1,6 mm sur toute la bande de roulement, sous peine d’amende (135 € en général) et d’immobilisation.',
    sources: [EQUIPEMENTS],
  },
  'essuie-glaces': {
    comprendre: 'Le caoutchouc durcit avec le soleil et le gel : il laisse des traînées et du bruit, et la visibilité chute sous la pluie la nuit.',
    expert: [
      'Notez les longueurs côté conducteur et passager (elles diffèrent souvent) et le type de fixation ; la lunette arrière a son propre balai.',
      'Nettoyez les lames au liquide lave-glace ou à l’alcool pour prolonger leur efficacité.',
      'En hiver, décollez les balais du pare-brise gelé avant de les actionner.',
    ],
    pieges: ['Laisser le bras retomber sans balai : il fissure le pare-brise.'],
  },
  'controle-technique': {
    comprendre: 'Le contrôle technique vérifie les points de sécurité et de pollution du véhicule. Le préparer évite une contre-visite.',
    expert: [
      'À vérifier avant : éclairage et clignotants, essuie-glaces et lave-glace, klaxon, pneus, voyants au tableau de bord, plaques lisibles, ceintures.',
      'Défaillance majeure : contre-visite dans les 2 mois ; défaillance critique : réparation avant de reprendre la route, sauf le jour même du contrôle.',
      'Les voitures électriques y sont soumises comme les autres.',
      'Vente d’un véhicule de plus de 4 ans : contrôle de moins de 6 mois obligatoire.',
    ],
    pieges: ['Rouler au-delà de la date limite : amende et refus possible de l’assureur.'],
    regle: 'Premier contrôle dans les 6 mois précédant le 4e anniversaire de la mise en circulation, puis tous les 2 ans.',
    sources: [
      { l: 'Ministère de la transition écologique : contrôle technique des véhicules', url: 'https://www.ecologie.gouv.fr/controle-technique-des-vehicules' },
      { l: 'Service-public : contrôle technique d’une voiture particulière', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F2878' },
    ],
  },
  'revision-thermique': {
    comprendre:
      'La révision remplace l’huile et les filtres, et contrôle les organes d’usure. Suivre le carnet d’entretien du constructeur préserve le moteur et la garantie.',
    expert: [
      'Intervalles courants : 15 000 à 30 000 km ou un an selon le moteur et l’huile ; « usage sévère » (trajets courts, ville, remorque) : plus souvent.',
      'Courroie de distribution : kilométrage ou âge du carnet, le premier atteint ; c’est l’échéance la plus coûteuse à manquer.',
      'Liquide de frein : remplacement tous les 2 ans environ, car il absorbe l’humidité.',
      'Hors réseau, la garantie constructeur est conservée si l’entretien suit le carnet avec des pièces de qualité équivalente.',
    ],
    pieges: ['Allonger les intervalles sur un moteur qui fait surtout des trajets courts.'],
  },
  'revision-electrique': {
    comprendre:
      'Pas de vidange ni de courroie, mais freins, liquide de refroidissement de la batterie, filtre d’habitacle et trains roulants s’entretiennent toujours.',
    expert: [
      'Le freinage régénératif sollicite peu les freins : les disques peuvent rouiller ; un freinage appuyé de temps en temps les nettoie.',
      'Batterie 12 V : elle reste nécessaire et peut lâcher, surtout si la voiture dort longtemps.',
      'Demandez un rapport d’état de santé de la batterie de traction (SoH) à chaque révision.',
      'Pour durer : éviter de rester longtemps à 100 % ou presque vide ; la recharge rapide répétée par forte chaleur use davantage.',
    ],
    pieges: ['Oublier la révision parce que « rien ne s’use ».'],
  },
  niveaux: {
    comprendre: 'Huile, liquide de refroidissement, liquide de frein, lave-glace : un niveau bas est souvent le premier signe d’une fuite ou d’une usure. Le contrôle prend cinq minutes, moteur froid.',
    expert: [
      'Huile : voiture à plat, moteur froid ou arrêté depuis 10 minutes, entre les repères mini et maxi ; complétez avec l’huile préconisée (norme constructeur), pas n’importe laquelle.',
      'Liquide de refroidissement : n’ouvrez jamais le bouchon moteur chaud ; une baisse régulière signale une fuite.',
      'Liquide de frein : le niveau baisse lentement avec l’usure des plaquettes ; une baisse rapide impose un contrôle immédiat.',
      'Voiture électrique : surtout lave-glace, liquide de frein et liquide de refroidissement de la batterie, selon le carnet.',
    ],
    pieges: ['Ouvrir le vase d’expansion moteur chaud.', 'Mettre de l’eau à la place du liquide de refroidissement en hiver.'],
  },
  'humidite-voiture': {
    comprendre:
      'L’humidité dans l’habitacle donne de la buée tenace, des odeurs de moisi et peut abîmer l’électronique. Il faut l’évacuer et en trouver l’origine.',
    expert: [
      'Origines fréquentes : tapis mouillés, joints de portière, évacuations de baie de pare-brise ou de toit ouvrant bouchées par les feuilles.',
      'Filtre d’habitacle encrassé : à changer en général tous les 15 000 km ou une fois par an.',
      'La climatisation déshumidifie, même en hiver : utilisez-la avec le chauffage pour désembuer.',
      'Absorbeurs d’humidité (silice ou chlorure de calcium) sous les sièges, à régénérer ou remplacer.',
    ],
    pieges: ['Laisser des vêtements ou tapis mouillés dans la voiture.', 'Rouler en recyclage d’air permanent.'],
  },
  'kit-securite': {
    comprendre: 'En cas de panne ou d’accident, le gilet et le triangle vous rendent visibles. Ils doivent être là, accessibles et en bon état.',
    expert: [
      'Gilet marqué CE, rangé à portée de main du conducteur (pas dans le coffre) ; un gilet par passager est vivement conseillé.',
      'Triangle homologué, posé à 30 m au moins du véhicule ; sur autoroute, sur la bande d’arrêt d’urgence, ne le posez pas si c’est dangereux.',
      'Utiles mais non obligatoires : trousse de secours, lampe, couverture de survie, éthylotest.',
      'Zones de montagne (loi Montagne) : du 1er novembre au 31 mars, 4 pneus marqués 3PMSF ou des chaînes ou chaussettes à bord.',
    ],
    regle: 'Gilet et triangle obligatoires : leur absence est sanctionnée d’une amende (135 € en général).',
    sources: [EQUIPEMENTS],
  },
  'voiture-interieur': {
    comprendre: 'Miettes et poussière s’incrustent dans les tissus et nourrissent les odeurs ; les vitres sales intérieures aggravent la buée.',
    expert: ['Aspirez de haut en bas, sièges avancés puis reculés.', 'Vitres intérieures : microfibre sèche, le film gras part mieux sans produit.', 'Tableau de bord : microfibre humide, pas de produit lustrant sur le volant ou les pédales.'],
  },
  'voiture-lavage': {
    comprendre: 'Sel, fientes et sève attaquent le vernis. Un lavage régulier, surtout en hiver, protège la carrosserie et le dessous de caisse.',
    expert: [
      'Rincez d’abord pour retirer le sable, puis lavez de haut en bas avec deux seaux (lavage et rinçage) pour ne pas rayer.',
      'Fientes et sève : à retirer vite, elles marquent le vernis en quelques jours au soleil.',
      'Lavage à domicile sur la voie publique souvent interdit par arrêté : station de lavage avec récupération des eaux usées.',
    ],
    pieges: ['Laver en plein soleil.', 'Utiliser du liquide vaisselle, qui retire la cire.'],
  },
  batterie: {
    comprendre: 'Le froid réduit la capacité d’une batterie. Une batterie fatiguée qui démarre encore en octobre peut lâcher au premier matin de gel.',
    expert: [
      'Une batterie au plomb dure en moyenne 4 à 6 ans ; les trajets courts et répétés l’usent plus vite.',
      'Au repos, une batterie en bon état affiche environ 12,6 V ; sous 12,4 V, rechargez-la.',
      'Les centres auto testent gratuitement la batterie, en quelques minutes.',
      'Voitures électriques et hybrides : c’est la batterie 12 V qui lâche, pas la batterie de traction.',
    ],
    pieges: ['Brancher les câbles de démarrage dans le mauvais ordre : rouge sur + d’abord, noir sur une masse en dernier.'],
  },
  'pneus-hiver': {
    comprendre:
      'Sous 7 °C, la gomme d’un pneu été durcit et accroche moins. Un pneu hiver ou toutes saisons marqué 3PMSF garde son adhérence sur sol froid, mouillé ou enneigé.',
    expert: [
      'Couple de serrage des écrous : indiqué dans le carnet (souvent 100 à 140 N·m) ; resserrez après une cinquantaine de kilomètres.',
      'Serrez en étoile, roue au sol, à la clé dynamométrique.',
      'Montez les pneus les moins usés à l’arrière pour la stabilité.',
      'Réinitialisez le système de surveillance de pression (TPMS) après le changement si la voiture le demande.',
      'Stockage : jantes montées à plat empilées, pneus seuls debout, à l’abri de la lumière.',
    ],
    pieges: ['Mélanger pneus hiver et pneus été sur un même véhicule.'],
    regle: 'Loi Montagne : dans les communes concernées de 34 départements, du 1er novembre au 31 mars, 4 pneus marqués 3PMSF ou des chaînes ou chaussettes à bord pour au moins 2 roues motrices. Le seul marquage M+S ne suffit plus depuis le 1er novembre 2024.',
  },
  'pneus-ete': {
    comprendre: 'Au-dessus de 7 °C, un pneu hiver s’use vite et freine moins bien que le pneu été. On remonte les pneus été quand les températures se stabilisent au printemps.',
    expert: ['Mêmes précautions de montage : couple de serrage du carnet, serrage en étoile, contrôle après 50 km.', 'Notez la position de chaque roue sur un papier pour alterner avant et arrière à la saison suivante.', 'Vérifiez l’usure des pneus hiver avant de les stocker.'],
  },
  'clim-hiver': {
    comprendre: 'Faire tourner la climatisation de temps en temps, même en hiver, lubrifie les joints et le compresseur et évite les fuites de gaz.',
    expert: ['Un quart d’heure par mois suffit, chauffage en marche si vous voulez.', 'Mauvaise odeur à la mise en route : filtre d’habitacle et assainissement du circuit.', 'Une recharge de gaz tous les 2 à 3 ans est courante ; davantage indique une fuite.'],
  },
  velo: {
    comprendre: 'Une chaîne propre et huilée, des freins réglés et des pneus bien gonflés : c’est 90 % de la sécurité et du plaisir à vélo.',
    expert: [
      'Pression : la plage est inscrite sur le flanc du pneu ; plus basse sur chemin, plus haute sur route.',
      'Chaîne : dégraissez, puis une goutte de lubrifiant par maillon, essuyez l’excédent ; contrôlez l’allongement avec un outil (remplacement vers 0,5 % pour 11 vitesses et plus, 0,75 % sinon).',
      'Plaquettes de frein : remplacez-les quand la garniture descend vers 1 mm, ou que les patins atteignent le repère d’usure.',
      'Vélo électrique : batterie stockée entre 30 et 60 % de charge, à l’abri du gel.',
    ],
    pieges: ['Laver au nettoyeur haute pression : l’eau entre dans les roulements.', 'Trop huiler la chaîne, qui ramasse le sable.'],
  },
};
