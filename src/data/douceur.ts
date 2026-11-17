// Reprise en douceur, par foyer : à la première utilisation, ou après une absence de
// deux semaines ou plus (personne du foyer n'a ouvert l'app), la semaine en cours ne
// propose que l'essentiel. Règle partagée par l'app et le rappel du week-end.
import { GENTLE_AFTER_DAYS, weekStart } from './engine';
import { toISODate } from './types';

export type Douceur = 'debut' | 'retour' | null;

/** Ce que le foyer garde en mémoire : dernière visite, et semaine de reprise en cours. */
export type VisitState = { lastVisit: string | null; gentleWeek: string | null; gentleKind: Douceur };

/** Semaine de reprise ou non, pour aujourd'hui. */
export function gentleState(today: Date, s: VisitState): { kind: Douceur; week: string | null } {
  const monday = toISODate(weekStart(today));
  if (s.gentleWeek === monday && s.gentleKind) return { kind: s.gentleKind, week: monday };
  if (!s.lastVisit) return { kind: 'debut', week: monday };
  const days = (today.getTime() - new Date(s.lastVisit + 'T12:00:00').getTime()) / 86400000;
  if (days >= GENTLE_AFTER_DAYS) return { kind: 'retour', week: monday };
  return { kind: null, week: null };
}
