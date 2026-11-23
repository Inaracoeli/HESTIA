import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gentleState } from '../src/data/douceur';
import { weekendMessage } from '../src/data/rappel';
import type { Task } from '../src/data/types';

const TODAY = new Date('2026-11-18T12:00:00'); // mercredi, semaine du lundi 16

test('premier usage du foyer : semaine de reprise « début »', () => {
  assert.deepEqual(gentleState(TODAY, { lastVisit: null, gentleWeek: null, gentleKind: null }), { kind: 'debut', week: '2026-11-16' });
});

test('visite récente : pas de reprise', () => {
  assert.equal(gentleState(TODAY, { lastVisit: '2026-11-10', gentleWeek: null, gentleKind: null }).kind, null);
});

test('absence de 14 jours ou plus : reprise « retour »', () => {
  assert.equal(gentleState(TODAY, { lastVisit: '2026-11-03', gentleWeek: null, gentleKind: null }).kind, 'retour');
});

test('la reprise dure toute la semaine, même après une visite', () => {
  assert.equal(gentleState(TODAY, { lastVisit: '2026-11-17', gentleWeek: '2026-11-16', gentleKind: 'retour' }).kind, 'retour');
  assert.equal(gentleState(new Date('2026-11-24T12:00:00'), { lastVisit: '2026-11-18', gentleWeek: '2026-11-16', gentleKind: 'retour' }).kind, null);
});

function task(id: string, minutes: number, importance: Task['importance'] = 3): Task {
  return {
    id, title: id, domain: 'maison', importance, intervalDays: 30, periodLabel: '', minutes, budget: 0, difficulty: 1, pro: false,
    lastDone: '2026-10-01', active: true, tools: [], alternatives: {}, steps: { debutant: [], intermediaire: [], expert: [] },
    questions: [], choices: {}, custom: false, templateId: null, inSchedule: false, months: [],
  };
}

test('le message du rappel liste 3 petites choses avec leur durée', () => {
  const m = weekendMessage([task('A', 60), task('B', 10), task('C', 20), task('D', 15, 1)], TODAY, 240, null);
  assert.equal(m.titre, 'Cette semaine, 3 petites choses (45 min)');
  const vendredi = new Date('2026-11-20T12:00:00');
  assert.match(weekendMessage([task('A', 10)], vendredi, 240, null).titre, /^Ce week-end/);
  const dimanche = new Date('2026-11-22T12:00:00');
  assert.match(weekendMessage([task('A', 10)], dimanche, 240, null).titre, /^Aujourd’hui/);
  assert.equal(m.corps, '• D (15 min)\n• B (10 min)\n• C (20 min)');
});

test('rien à faire : un message léger', () => {
  assert.equal(weekendMessage([], TODAY, 90, null).corps, 'Rien d’urgent ce week-end. Profitez-en.');
});
