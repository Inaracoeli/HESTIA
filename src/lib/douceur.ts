// Reprise en douceur : à la première utilisation sur cet appareil, ou après une absence
// de deux semaines ou plus, la semaine en cours ne propose que l'essentiel.
import { GENTLE_AFTER_DAYS, weekStart } from '../data/engine';
import { toISODate } from '../data/types';

const SEEN = 'hestia.vu';
const GENTLE = 'hestia.douceur';

export type Douceur = 'debut' | 'retour' | null;

export function gentleWeek(today: Date): Douceur {
  try {
    const monday = toISODate(weekStart(today));
    const todayISO = toISODate(today);
    const saved = JSON.parse(localStorage.getItem(GENTLE) ?? 'null') as { week: string; kind: Douceur } | null;
    const lastSeen = localStorage.getItem(SEEN);
    localStorage.setItem(SEEN, todayISO);
    if (saved?.week === monday) return saved.kind;
    let kind: Douceur = null;
    if (!lastSeen) kind = 'debut';
    else if ((today.getTime() - new Date(lastSeen + 'T12:00:00').getTime()) / 86400000 >= GENTLE_AFTER_DAYS) kind = 'retour';
    if (kind) localStorage.setItem(GENTLE, JSON.stringify({ week: monday, kind }));
    return kind;
  } catch {
    return null;
  }
}
