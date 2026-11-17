// Envois en attente : sans réseau, les changements sont gardés sur le téléphone
// et envoyés dès que le réseau revient.
import { markDone, saveChoices, saveSettings, setActive, setInSchedule, setPlannedDay, undoDone, type UserSettings } from './api';

export type Op =
  | { kind: 'done'; id: string; foyerId: string; userId: string; taskId: string; day: string; cost: number | null; note: string }
  | { kind: 'undo'; id: string; taskId: string }
  | { kind: 'plan'; id: string; foyerId: string; taskId: string; day: string | null }
  | { kind: 'active'; id: string; taskId: string; value: boolean }
  | { kind: 'follow'; id: string; taskId: string; value: boolean }
  | { kind: 'choices'; id: string; taskId: string; choices: Record<string, string> }
  | { kind: 'settings'; id: string; userId: string; settings: UserSettings };

type NewOp = Op extends infer O ? (O extends Op ? Omit<O, 'id'> : never) : never;

const KEY = 'hestia.envois';

function read(): Op[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}
function write(ops: Op[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ops));
  } catch {
    /* stockage indisponible */
  }
}

export function pendingCount(): number {
  return read().length;
}

/** Erreur due au réseau (et non à une donnée refusée) ? */
function isNetworkError(err: unknown): boolean {
  const msg = String((err as Error)?.message ?? err);
  return !navigator.onLine || /fetch|network|load failed|connexion|timeout/i.test(msg);
}

function run(op: Op): Promise<void> {
  switch (op.kind) {
    case 'done': return markDone(op.foyerId, op.userId, op.taskId, new Date(op.day + 'T12:00:00'), op.cost, op.note);
    case 'undo': return undoDone(op.taskId);
    case 'plan': return setPlannedDay(op.foyerId, op.taskId, op.day);
    case 'active': return setActive(op.taskId, op.value);
    case 'follow': return setInSchedule(op.taskId, op.value);
    case 'choices': return saveChoices(op.taskId, op.choices);
    case 'settings': return saveSettings(op.userId, op.settings);
  }
}

/** Les réglages ou choix d'une même tâche : seul le dernier compte. */
function sameTarget(a: Op, b: NewOp): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'settings') return true;
  if (a.kind === 'done' || a.kind === 'undo') return false;
  return 'taskId' in b && a.taskId === b.taskId;
}

/**
 * Envoie tout de suite si possible ; sinon garde l'envoi pour plus tard.
 * Renvoie « queued » quand le changement attend le réseau. Une erreur qui n'est pas due au réseau est relancée.
 */
export async function send(op: NewOp): Promise<'sent' | 'queued'> {
  const full = { ...op, id: crypto.randomUUID() } as Op;
  if (navigator.onLine && read().length === 0) {
    try {
      await run(full);
      return 'sent';
    } catch (err) {
      if (!isNetworkError(err)) throw err;
    }
  }
  // Une annulation d'un « C'est fait » encore en attente : on retire simplement ce dernier.
  const ops = read();
  if (op.kind === 'undo') {
    const i = ops.map((o) => o.kind === 'done' && o.taskId === op.taskId).lastIndexOf(true);
    if (i >= 0) {
      ops.splice(i, 1);
      write(ops);
      return 'queued';
    }
  }
  write([...ops.filter((o) => !sameTarget(o, op)), full]);
  return 'queued';
}

/** Envoie ce qui attend, dans l'ordre. Renvoie le nombre d'envois réussis. */
export async function flush(): Promise<number> {
  let sent = 0;
  for (;;) {
    const ops = read();
    if (ops.length === 0 || !navigator.onLine) return sent;
    const [op] = ops;
    try {
      await run(op);
      sent++;
    } catch (err) {
      if (isNetworkError(err)) return sent;
      // Refusé par le serveur (tâche supprimée entre-temps…) : on l'abandonne.
    }
    write(read().filter((o) => o.id !== op.id));
  }
}

/** Le « C'est fait » de cette tâche attend-il le réseau ? */
export function isDonePending(taskId: string): boolean {
  return read().some((o) => o.kind === 'done' && o.taskId === taskId);
}
