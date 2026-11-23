// Message du rappel du week-end. Règle partagée par l'app et la fonction d'envoi :
// les mêmes tâches que l'onglet Semaine, réduites à 2 ou 3 petites choses.
import { formatMinutes, planWeeks, weekendPicks, weekStart } from './engine';
import type { Douceur } from './douceur';
import { toISODate, type Task } from './types';

export function weekendMessage(tasks: Task[], today: Date, capacity: number, douceur: Douceur): { titre: string; corps: string } {
  const monday = toISODate(weekStart(today));
  const pending = tasks.filter((t) => !(t.lastDone >= monday));
  const [week] = planWeeks(pending, today, [capacity], { gentle: !!douceur });
  const picks = weekendPicks(week.tasks, 3);
  // Le dimanche : « Aujourd'hui » ; du jeudi au samedi : « Ce week-end » ; sinon « Cette semaine ».
  const day = today.getDay();
  const when = day === 0 ? 'Aujourd’hui' : day >= 4 ? 'Ce week-end' : 'Cette semaine';
  if (picks.length === 0) return { titre: 'Hestia', corps: day === 0 ? 'Rien d’urgent aujourd’hui. Profitez-en.' : 'Rien d’urgent ce week-end. Profitez-en.' };
  const total = formatMinutes(picks.reduce((s, t) => s + t.minutes, 0));
  return {
    titre: picks.length > 1 ? `${when}, ${picks.length} petites choses (${total})` : `${when}, une petite chose (${total})`,
    corps: picks.map((t) => `• ${t.title} (${formatMinutes(t.minutes)})`).join('\n'),
  };
}
