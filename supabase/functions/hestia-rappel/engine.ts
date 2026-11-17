// Copie de src/data/engine.ts pour la fonction hestia-rappel (mêmes règles que l’app).
// Moteur de priorité : décide quelles tâches proposer chaque semaine.
//
// 1. Urgence = temps écoulé depuis la dernière fois ÷ intervalle prévu
//    (0 = vient d'être fait, 1 = c'est le moment, plus de 1 = en retard).
// 2. Score = urgence × poids de l'importance.
// 3. On remplit le temps disponible de la semaine par score décroissant.
//
// Toujours en douceur : jamais plus de MAX_TASKS tâches par semaine, et au plus
// MAX_FORCED tâches essentielles en retard ajoutées au-delà du temps prévu.
// Ce qui ne rentre pas revient simplement la semaine suivante, sans s'accumuler :
// l'urgence est plafonnée, une absence de trois semaines ne crée pas d'avalanche.
// Semaine de reprise (première utilisation ou retour après une absence) :
// moitié du temps prévu et GENTLE_MAX tâches au plus.

import { inSeason, toISODate, type Task } from './types.ts';

const DAY = 24 * 60 * 60 * 1000;
const WEIGHT: Record<Task['importance'], number> = { 1: 4, 2: 2.5, 3: 1.5, 4: 1 };

/** Nombre maximal de tâches proposées par semaine */
export const MAX_TASKS = 5;
/** Tâches essentielles en retard qui peuvent dépasser le temps prévu */
export const MAX_FORCED = 2;
/** Semaine de reprise : nombre maximal de tâches */
export const GENTLE_MAX = 3;
/** Au-delà, le retard ne compte plus davantage dans la priorité */
const URGENCY_CAP = 3;
/** Absence (jours) à partir de laquelle on reprend en douceur */
export const GENTLE_AFTER_DAYS = 14;

export function daysBetween(fromISO: string, to: Date): number {
  return Math.floor((to.getTime() - new Date(fromISO + 'T00:00:00').getTime()) / DAY);
}

export function urgency(task: Task, at: Date): number {
  return daysBetween(task.lastDone, at) / task.intervalDays;
}

export function score(task: Task, at: Date): number {
  return Math.min(urgency(task, at), URGENCY_CAP) * WEIGHT[task.importance];
}

/** Prochaine échéance, repoussée au début de la saison si elle tombe hors saison. */
export function dueDate(task: Task): Date {
  const d = new Date(new Date(task.lastDone + 'T00:00:00').getTime() + task.intervalDays * DAY);
  if (inSeason(task, d)) return d;
  for (let i = 1; i <= 12; i++) {
    const m = new Date(d.getFullYear(), d.getMonth() + i, 1);
    if (inSeason(task, m)) return m;
  }
  return d;
}

export type WeekPlan = { start: Date; tasks: Task[]; minutes: number; capacity: number };

/** Début de semaine (lundi) d'une date. */
export function weekStart(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const shift = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - shift);
  return x;
}

/**
 * Prépare les semaines à venir. Une tâche entre dans une semaine si elle sera
 * « mûre » (urgence ≥ 0,85) à la fin de cette semaine.
 */
export function planWeeks(tasks: Task[], today: Date, capacities: number[], opts: { gentle?: boolean } = {}): WeekPlan[] {
  const pool = tasks.filter((t) => t.active);
  const placed = new Set<string>();
  const start0 = weekStart(today);
  const todayISO = toISODate(today);
  const lastEnd = toISODate(new Date(start0.getTime() + (capacities.length * 7 - 1) * DAY));
  // Une tâche planifiée plus tard que les semaines affichées ne doit pas être proposée avant.
  pool.forEach((t) => {
    if (t.plannedDay && t.plannedDay > lastEnd) placed.add(t.id);
  });

  return capacities.map((fullCapacity, w) => {
    const gentle = !!opts.gentle && w === 0;
    const capacity = gentle ? Math.max(30, Math.round(fullCapacity / 2)) : fullCapacity;
    const maxTasks = gentle ? GENTLE_MAX : MAX_TASKS;
    const start = new Date(start0.getTime() + w * 7 * DAY);
    const end = new Date(start.getTime() + 6 * DAY);
    const startISO = toISODate(start);
    const endISO = toISODate(end);

    // 1. Les tâches dont on a choisi le jour dans cette semaine passent en premier.
    const chosen: Task[] = pool.filter(
      (t) => !placed.has(t.id) && t.plannedDay && t.plannedDay >= startISO && t.plannedDay <= endISO && t.plannedDay >= todayISO,
    );
    chosen.forEach((t) => placed.add(t.id));
    let minutes = chosen.reduce((s, t) => s + t.minutes, 0);

    // 2. Puis les tâches mûres, par priorité, dans la limite du temps disponible.
    const ripe = pool
      .filter((t) => !placed.has(t.id) && (inSeason(t, start) || inSeason(t, end)) && urgency(t, end) >= 0.85)
      .sort((a, b) => score(b, end) - score(a, end));
    let forced = 0;
    for (const t of ripe) {
      if (chosen.length >= maxTasks) break;
      const fits = minutes + t.minutes <= capacity;
      const mustDo = !fits && t.importance === 1 && urgency(t, end) >= 1 && forced < (gentle ? 1 : MAX_FORCED);
      if (fits || mustDo) {
        if (mustDo) forced++;
        chosen.push(t);
        minutes += t.minutes;
        placed.add(t.id);
      }
    }
    return { start, tasks: chosen, minutes, capacity };
  });
}

/** Tâche suivante à proposer quand on demande « une tâche de plus ». */
export function nextExtraTask(tasks: Task[], exclude: Set<string>, today: Date): Task | undefined {
  return tasks
    .filter((t) => t.active && !exclude.has(t.id) && inSeason(t, today) && !(t.plannedDay && t.plannedDay > toISODate(new Date(today.getTime() + 7 * DAY))))
    .sort((a, b) => score(b, today) - score(a, today))[0];
}

/**
 * Rappel du week-end : 2 ou 3 tâches rapides de la semaine, à recopier sur l'ardoise.
 * Les essentielles d'abord, puis les plus courtes.
 */
export function weekendPicks(week: Task[], n = 3): Task[] {
  return [...week]
    .sort((a, b) => (a.importance === 1 ? 0 : 1) - (b.importance === 1 ? 0 : 1) || a.minutes - b.minutes)
    .slice(0, n);
}

/** Paliers de temps disponible par semaine (minutes). */
export const CAPACITY_STEPS = [30, 60, 90, 120, 180, 240];

export function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`;
}
