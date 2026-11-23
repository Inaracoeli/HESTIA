// Conseil du jour : un geste court, qui change chaque jour, de saison quand c'est utile.
// months : mois où le conseil a du sens (1 à 12) ; absent = toute l'année.
type Conseil = { t: string; months?: number[] };

export const CONSEILS: Conseil[] = [
  { t: 'Après la pluie, secouez les tapis de la voiture et rangez le parapluie dans un sac : moins de buée demain matin.', months: [10, 11, 12, 1, 2, 3] },
  { t: 'Une fois par mois, faites couler un peu d’eau dans les siphons peu utilisés (douche d’amis, lave-mains) : ils restent sans odeur.' },
  { t: 'Le joint de la porte du lave-linge garde l’eau : essuyez-le après la dernière lessive de la semaine et laissez le hublot entrouvert.' },
  { t: 'Un radiateur froid en haut et chaud en bas a de l’air : une purge de deux minutes le rend plus efficace.', months: [10, 11, 12, 1, 2, 3] },
  { t: 'Notez le relevé des compteurs d’eau et d’électricité le même jour chaque mois : une fuite se voit tout de suite.' },
  { t: 'Fermez les volets à la tombée de la nuit en hiver : la chaleur reste dedans, la facture baisse.', months: [11, 12, 1, 2] },
  { t: 'En été, fermez volets et fenêtres côté soleil dès le matin, et aérez la nuit.', months: [6, 7, 8] },
  { t: 'Le filtre du lave-vaisselle se rince en une minute sous le robinet : la vaisselle sort plus propre.' },
  { t: 'Un frigo à 4 °C et un congélateur à −18 °C : au-delà, on gaspille ; en deçà, les aliments se gâtent plus vite.' },
  { t: 'Dépoussiérez la grille arrière du réfrigérateur deux fois par an : il consomme moins et dure plus longtemps.' },
  { t: 'Avant un long trajet, regardez les pneus et le niveau de lave-glace : deux minutes, beaucoup de tranquillité.' },
  { t: 'Rangez une lampe de poche près du tableau électrique : le jour d’une coupure, vous saurez où la trouver.' },
  { t: 'Testez le bouton des détecteurs de fumée en même temps que le changement d’heure : facile à retenir.', months: [3, 10] },
  { t: 'Laissez quelques centimètres entre les meubles et les murs extérieurs : l’air circule, l’humidité ne s’installe pas.' },
  { t: 'Aérez 5 à 10 minutes chaque jour, même en hiver : l’air sec chauffe plus vite que l’air humide.' },
  { t: 'Après la douche, une raclette sur les parois évite le calcaire et les moisissures, sans produit.' },
  { t: 'Videz les gouttières après la chute des feuilles : l’eau de pluie ne doit pas déborder contre la façade.', months: [10, 11, 12] },
  { t: 'Avant les gelées, purgez le robinet extérieur et rentrez le tuyau d’arrosage.', months: [10, 11, 12] },
  { t: 'Au printemps, nettoyez la grille d’aération de la salle de bain : la VMC aspire mieux.', months: [3, 4, 5] },
  { t: 'Arrosez le jardin tôt le matin ou le soir : moins d’évaporation, des plantes moins stressées.', months: [5, 6, 7, 8, 9] },
  { t: 'Tondez haut en été (6 à 8 cm) : le gazon garde mieux l’humidité et jaunit moins.', months: [6, 7, 8] },
  { t: 'Rangez la tondeuse propre et sèche : l’herbe collée sous le carter rouille la tôle.', months: [10, 11] },
  { t: 'Un peu de vinaigre blanc dans un chiffon microfibre suffit pour les vitres et les miroirs.' },
  { t: 'Le bicarbonate saupoudré une nuit sur un matelas ou un tapis, puis aspiré, enlève les odeurs.' },
  { t: 'Gardez les factures des gros appareils au même endroit : le jour d’une panne sous garantie, tout est prêt.' },
  { t: 'Une ampoule LED consomme environ cinq fois moins qu’une halogène : remplacez celles qui restent allumées longtemps.' },
  { t: 'Rincez la pomme de douche dans du vinaigre blanc une nuit : le jet redevient régulier.' },
  { t: 'Un pneu perd naturellement un peu de pression chaque mois : un contrôle régulier fait économiser du carburant.' },
  { t: 'Faites tourner la climatisation de la voiture 10 minutes par mois, même en hiver : elle reste étanche et désembue mieux.', months: [11, 12, 1, 2, 3] },
  { t: 'Huilez une fois par an les gonds et les serrures qui grincent : une goutte suffit.' },
  { t: 'Quand vous rachetez un produit d’entretien, notez-le dans Produits : la liste de courses se fait toute seule.' },
  { t: 'Mettre de côté un peu chaque mois pour la voiture évite qu’une réparation imprévue ne gâche le mois.' },
  { t: 'Avant de partir en vacances, coupez l’eau et baissez le chauffe-eau : moins de risques, moins de dépenses.', months: [6, 7, 8, 12] },
  { t: 'Un joint de silicone noirci se remplace en une heure : la salle de bain paraît neuve.' },
  { t: 'Sortez les tapis de sol de la voiture et laissez-les sécher au soleil : fini l’odeur d’humidité.', months: [4, 5, 6, 7, 8, 9] },
  { t: 'Rentrez les coussins de jardin avant l’automne : ils durent des années de plus.', months: [9, 10] },
  { t: 'Ne bouchez jamais les entrées d’air des fenêtres : elles évitent condensation et moisissures.' },
  { t: 'Un tour de la maison une fois par saison, en regardant le toit et les murs : un petit défaut repéré tôt coûte peu.' },
];

/** Le conseil du jour : change chaque jour, choisi parmi ceux de la saison. */
export function conseilDuJour(today: Date): string {
  const month = today.getMonth() + 1;
  const pool = CONSEILS.filter((c) => !c.months || c.months.includes(month));
  const day = Math.floor(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / 86400000);
  // Pas premier (7919) : tous les conseils passent, et deux jours de suite donnent deux conseils éloignés.
  return pool[(day * 7919) % pool.length].t;
}
