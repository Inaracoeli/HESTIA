// Fichier généré depuis src/data/rappel.ts par scripts/sync-fonctions.mjs : ne pas modifier ici.
// Message du rappel du week-end. Règle partagée par l'app et la fonction d'envoi :
// les mêmes tâches que l'onglet Semaine, réduites à 2 ou 3 petites choses.
import { formatMinutes, planWeeks, weekendPicks, weekStart } from './engine.ts';
import type { Douceur } from './douceur.ts';
import { toISODate, type Task } from './types.ts';

export function weekendMessage(tasks: Task[], today: Date, capacity: number, douceur: Douceur): { titre: string; corps: string } {
  const monday = toISODate(weekStart(today));
  const pending = tasks.filter((t) => !(t.lastDone >= monday));
  const [week] = planWeeks(pending, today, [capacity], { gentle: !!douceur });
  const picks = weekendPicks(week.tasks, 3);
  if (picks.length === 0) return { titre: 'Hestia', corps: 'Rien d’urgent ce week-end. Profitez-en.' };
  const total = formatMinutes(picks.reduce((s, t) => s + t.minutes, 0));
  return {
    titre: picks.length > 1 ? `Ce week-end, ${picks.length} petites choses (${total})` : `Ce week-end, une petite chose (${total})`,
    corps: picks.map((t) => `• ${t.title} (${formatMinutes(t.minutes)})`).join('\n'),
  };
}
