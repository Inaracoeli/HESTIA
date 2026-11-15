// Accès aux données Hestia (Supabase). Tous les écrans passent par ce fichier.
import { supabase } from './supabase';
import type { Level, Task } from '../data/types';
import { toISODate } from '../data/types';

export type Role = 'admin' | 'membre';
export type Foyer = { id: string; nom: string; description: string | null; materielAbsent: string[]; role: Role };
export type Member = { userId: string; email: string | null; role: Role };
export type UserSettings = {
  capacity: number;
  level: Level;
  theme: 'auto' | 'clair' | 'sombre';
  motion: boolean;
  /** Style du nom, gardé sur l'appareil seulement (choix provisoire). */
  brand?: 'capsule' | 'braise';
};
export type Session = { userId: string; email: string | null };

export const DEFAULT_SETTINGS: UserSettings = { capacity: 90, level: 'intermediaire', theme: 'auto', motion: true };

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

/* ---------- Connexion ---------- */

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  const u = data.session?.user;
  return u ? { userId: u.id, email: u.email ?? null } : null;
}

export function onAuthChange(cb: (event: string, session: Session | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((event, s) => {
    cb(event, s?.user ? { userId: s.user.id, email: s.user.email ?? null } : null);
  });
  return () => data.subscription.unsubscribe();
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error(error.message === 'Invalid login credentials' ? 'E-mail ou mot de passe incorrect.' : error.message);
}

export async function sendPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin + '/' });
  fail(error);
}

export async function setPassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  fail(error);
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

/* ---------- Foyer ---------- */

export async function loadFoyer(userId: string): Promise<Foyer | null> {
  const { data, error } = await supabase
    .from('membres')
    .select('role, foyers(id, nom, description, materiel_absent)')
    .eq('user_id', userId)
    .order('created_at')
    .limit(1);
  fail(error);
  const row = data?.[0] as unknown as { role: Role; foyers: { id: string; nom: string; description: string | null; materiel_absent: string[] | null } } | undefined;
  if (!row?.foyers) return null;
  return { id: row.foyers.id, nom: row.foyers.nom, description: row.foyers.description, materielAbsent: row.foyers.materiel_absent ?? [], role: row.role };
}

export async function saveMaterielAbsent(foyerId: string, list: string[]): Promise<void> {
  const { error } = await supabase.from('foyers').update({ materiel_absent: list }).eq('id', foyerId);
  fail(error);
}

export async function loadMembers(foyerId: string): Promise<Member[]> {
  const { data, error } = await supabase.from('membres').select('user_id, email, role').eq('foyer_id', foyerId).order('created_at');
  fail(error);
  return (data ?? []).map((m: { user_id: string; email: string | null; role: Role }) => ({ userId: m.user_id, email: m.email, role: m.role }));
}

export async function inviteMember(foyerId: string, email: string): Promise<'invite' | 'ajoute'> {
  const { data, error } = await supabase.functions.invoke('hestia-inviter', {
    body: { foyer_id: foyerId, email: email.trim().toLowerCase(), redirect_to: window.location.origin + '/' },
  });
  if (error) {
    let message = error.message;
    try {
      const body = await (error as { context?: Response }).context?.json();
      if (body?.erreur) message = body.erreur;
    } catch {
      /* message par défaut */
    }
    throw new Error(message);
  }
  return (data as { statut: 'invite' | 'ajoute' }).statut;
}

/* ---------- Réglages ---------- */

export async function loadSettings(userId: string): Promise<UserSettings> {
  const { data, error } = await supabase.from('reglages').select('*').eq('user_id', userId).maybeSingle();
  fail(error);
  if (!data) return DEFAULT_SETTINGS;
  return { capacity: data.capacite_min, level: data.niveau, theme: data.theme, motion: data.animations };
}

export async function saveSettings(userId: string, s: UserSettings): Promise<void> {
  const { error } = await supabase.from('reglages').upsert({
    user_id: userId,
    capacite_min: s.capacity,
    niveau: s.level,
    theme: s.theme,
    animations: s.motion,
    updated_at: new Date().toISOString(),
  });
  fail(error);
}

/* ---------- Tâches ---------- */

type TaskRow = {
  id: string;
  titre: string;
  domaine: Task['domain'];
  importance: Task['importance'];
  intervalle_jours: number;
  periode_label: string;
  minutes: number;
  budget: number | string;
  difficulte: Task['difficulty'];
  pro: boolean;
  actif: boolean;
  outils: string[] | null;
  alternatives: Record<string, string> | null;
  etapes: Task['steps'];
  questions: Task['questions'] | null;
  choix: Record<string, string> | null;
  derniere_fois: string | null;
  planifications: { jour: string } | { jour: string }[] | null;
};

function toTask(r: TaskRow, today: Date): Task {
  const plan = Array.isArray(r.planifications) ? r.planifications[0] : r.planifications;
  // Sans date connue, on considère que la tâche est à faire maintenant.
  const fallback = toISODate(new Date(today.getTime() - r.intervalle_jours * 86400000));
  return {
    id: r.id,
    title: r.titre,
    domain: r.domaine,
    importance: r.importance,
    intervalDays: r.intervalle_jours,
    periodLabel: r.periode_label,
    minutes: r.minutes,
    budget: Number(r.budget),
    difficulty: r.difficulte,
    pro: r.pro,
    active: r.actif,
    tools: r.outils ?? [],
    alternatives: r.alternatives ?? {},
    steps: { debutant: r.etapes?.debutant ?? [], intermediaire: r.etapes?.intermediaire ?? [], expert: r.etapes?.expert ?? [] },
    questions: r.questions ?? [],
    choices: r.choix ?? {},
    lastDone: r.derniere_fois ?? fallback,
    plannedDay: plan?.jour,
  };
}

export async function loadTasks(foyerId: string, today: Date): Promise<Task[]> {
  const { data, error } = await supabase
    .from('taches')
    .select('*, planifications(jour)')
    .eq('foyer_id', foyerId)
    .order('created_at');
  fail(error);
  return ((data ?? []) as TaskRow[]).map((r) => toTask(r, today));
}

export async function markDone(foyerId: string, userId: string, taskId: string, day: Date): Promise<void> {
  const { error } = await supabase.from('realisations').insert({ foyer_id: foyerId, user_id: userId, tache_id: taskId, fait_le: toISODate(day) });
  fail(error);
  // Une fois faite, la tâche n'a plus de jour prévu.
  await supabase.from('planifications').delete().eq('tache_id', taskId);
}

export async function saveChoices(taskId: string, choices: Record<string, string>): Promise<void> {
  const { error } = await supabase.from('taches').update({ choix: choices }).eq('id', taskId);
  fail(error);
}

export async function setPlannedDay(foyerId: string, taskId: string, day: string | null): Promise<void> {
  if (day === null) {
    const { error } = await supabase.from('planifications').delete().eq('tache_id', taskId);
    fail(error);
    return;
  }
  const { error } = await supabase.from('planifications').upsert({ tache_id: taskId, foyer_id: foyerId, jour: day });
  fail(error);
}
