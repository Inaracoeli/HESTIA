import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GENTLE_MAX, MAX_FORCED, MAX_TASKS, planWeeks, score, urgency, weekendPicks } from '../src/data/engine';
import { inSeason, type Task } from '../src/data/types';

const TODAY = new Date('2026-11-18T12:00:00'); // un mercredi
let n = 0;
/** Tâche de test : par défaut 30 min, importance 3, tous les 30 jours, faite il y a `ago` jours. */
function task(o: Partial<Task> & { ago?: number } = {}): Task {
  const ago = o.ago ?? 30;
  const last = new Date(TODAY.getTime() - ago * 86400000).toISOString().slice(0, 10);
  return {
    id: `t${++n}`, title: `Tâche ${n}`, domain: 'maison', importance: 3, intervalDays: 30, periodLabel: '', minutes: 30, budget: 0,
    difficulty: 1, pro: false, lastDone: last, active: true, tools: [], alternatives: {}, steps: { debutant: [], intermediaire: [], expert: [] },
    questions: [], choices: {}, custom: false, templateId: null, inSchedule: false, months: [], ...o,
  } as Task;
}

test('ne dépasse pas le temps disponible pour les tâches ordinaires', () => {
  const tasks = Array.from({ length: 6 }, () => task());
  const [w] = planWeeks(tasks, TODAY, [90]);
  assert.equal(w.tasks.length, 3);
  assert.ok(w.minutes <= 90);
});

test(`jamais plus de ${MAX_TASKS} tâches par semaine, même avec beaucoup de temps`, () => {
  const tasks = Array.from({ length: 20 }, () => task({ minutes: 5 }));
  const [w] = planWeeks(tasks, TODAY, [240]);
  assert.equal(w.tasks.length, MAX_TASKS);
});

test(`au plus ${MAX_FORCED} essentielles en retard au-delà du temps prévu`, () => {
  const tasks = Array.from({ length: 5 }, () => task({ importance: 1, minutes: 60, ago: 90 }));
  const [w] = planWeeks(tasks, TODAY, [30]);
  assert.equal(w.tasks.length, MAX_FORCED);
});

test('une essentielle en retard passe avant une tâche secondaire', () => {
  const minor = task({ importance: 4, ago: 60 });
  const major = task({ importance: 1, ago: 31 });
  const [w] = planWeeks([minor, major], TODAY, [30]);
  assert.deepEqual(w.tasks.map((t) => t.id), [major.id]);
});

test('ce qui ne rentre pas revient la semaine suivante', () => {
  const tasks = Array.from({ length: 4 }, () => task());
  const [w1, w2] = planWeeks(tasks, TODAY, [60, 60]);
  assert.equal(w1.tasks.length, 2);
  assert.equal(w2.tasks.length, 2);
  assert.equal(new Set([...w1.tasks, ...w2.tasks].map((t) => t.id)).size, 4);
});

test('après une longue absence, pas d’avalanche : le retard est plafonné', () => {
  const longAgo = task({ importance: 4, ago: 3000 });
  const essential = task({ importance: 1, ago: 35 });
  assert.ok(score(essential, TODAY) > score(longAgo, TODAY));
  assert.ok(urgency(longAgo, TODAY) > 50);
});

test(`semaine de reprise : moitié du temps et ${GENTLE_MAX} tâches au plus`, () => {
  const tasks = Array.from({ length: 10 }, () => task({ minutes: 10 }));
  const [w] = planWeeks(tasks, TODAY, [240], { gentle: true });
  assert.equal(w.capacity, 120);
  assert.equal(w.tasks.length, GENTLE_MAX);
});

test('une tâche hors saison n’est pas proposée', () => {
  const summer = task({ months: [6, 7, 8] });
  assert.equal(inSeason(summer, TODAY), false);
  const [w] = planWeeks([summer], TODAY, [120]);
  assert.equal(w.tasks.length, 0);
});

test('un jour choisi dans la semaine passe en premier', () => {
  const planned = task({ ago: 1, plannedDay: '2026-11-21' });
  const others = Array.from({ length: 3 }, () => task());
  const [w] = planWeeks([...others, planned], TODAY, [30]);
  assert.equal(w.tasks[0].id, planned.id);
});

test('le rappel du week-end garde 3 tâches, essentielles puis les plus courtes', () => {
  const a = task({ minutes: 60 });
  const b = task({ minutes: 10 });
  const c = task({ minutes: 20 });
  const d = task({ minutes: 90, importance: 1 });
  assert.deepEqual(weekendPicks([a, b, c, d]).map((t) => t.id), [d.id, b.id, c.id]);
});
