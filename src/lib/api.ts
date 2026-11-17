// Accès aux données Hestia (Supabase). Tous les écrans passent par ce fichier.
import { supabase } from './supabase';
import type { Level, Task } from '../data/types';
import { CATALOGUE, CATALOGUE_IDS, templatesFor, type Profile, type Template } from '../data/catalogue';

/** Modèles du catalogue par identifiant : les fiches suivent toujours la dernière version du catalogue. */
const TEMPLATE_BY_ID = new Map(CATALOGUE.map((c) => [c.template.id, c.template]));
import { periodLabelFor, toISODate } from '../data/types';

export type Role = 'admin' | 'membre';
export type Foyer = { id: string; nom: string; description: string | null; materielAbsent: string[]; role: Role; profile: Profile | null };
export type Member = { userId: string; email: string | null; role: Role };
export type UserSettings = {
  capacity: number;
  level: Level;
  theme: 'auto' | 'clair' | 'sombre';
  motion: boolean;
  /** Rappel du week-end : actif, jour (0 = dimanche … 5 = vendredi), heure « HH:MM » (heure de Paris) */
  reminder: { on: boolean; day: number; time: string };
};
export type Session = { userId: string; email: string | null };

export const DEFAULT_SETTINGS: UserSettings = { capacity: 90, level: 'intermediaire', theme: 'auto', motion: true, reminder: { on: false, day: 5, time: '12:00' } };

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
    .select('role, foyers(id, nom, description, materiel_absent, profil)')
    .eq('user_id', userId)
    .order('created_at')
    .limit(1);
  fail(error);
  const row = data?.[0] as unknown as { role: Role; foyers: { id: string; nom: string; description: string | null; materiel_absent: string[] | null; profil: Profile | null } } | undefined;
  if (!row?.foyers) return null;
  return {
    id: row.foyers.id,
    nom: row.foyers.nom,
    description: row.foyers.description,
    materielAbsent: row.foyers.materiel_absent ?? [],
    role: row.role,
    profile: row.foyers.profil,
  };
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

/** Ajoute un membre avec un mot de passe provisoire (aucun e-mail envoyé). */
export async function inviteMember(foyerId: string, email: string, password: string): Promise<'cree' | 'ajoute'> {
  const { data, error } = await supabase.functions.invoke('hestia-inviter', {
    body: { foyer_id: foyerId, email: email.trim().toLowerCase(), password },
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
  return (data as { statut: 'cree' | 'ajoute' }).statut;
}

/* ---------- Réglages ---------- */

export async function loadSettings(userId: string): Promise<UserSettings> {
  const { data, error } = await supabase.from('reglages').select('*').eq('user_id', userId).maybeSingle();
  fail(error);
  if (!data) return DEFAULT_SETTINGS;
  return {
    capacity: data.capacite_min,
    level: data.niveau,
    theme: data.theme,
    motion: data.animations,
    reminder: { on: !!data.rappel_actif, day: data.rappel_jour ?? 5, time: data.rappel_heure ?? '12:00' },
  };
}

export async function saveSettings(userId: string, s: UserSettings): Promise<void> {
  const { error } = await supabase.from('reglages').upsert({
    user_id: userId,
    capacite_min: s.capacity,
    niveau: s.level,
    theme: s.theme,
    animations: s.motion,
    rappel_actif: s.reminder.on,
    rappel_jour: s.reminder.day,
    rappel_heure: s.reminder.time,
    updated_at: new Date().toISOString(),
  });
  fail(error);
}

/* ---------- Tâches ---------- */

type TaskRow = {
  id: string;
  modele: string | null;
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
  dans_echeancier: boolean | null;
  mois: number[] | null;
  planifications: { jour: string } | { jour: string }[] | null;
  realisations: { fait_le: string }[] | null;
};

function toTask(r: TaskRow, today: Date): Task {
  const plan = Array.isArray(r.planifications) ? r.planifications[0] : r.planifications;
  // Sans date connue, on considère que la tâche est à faire maintenant.
  const fallback = toISODate(new Date(today.getTime() - r.intervalle_jours * 86400000));
  const tpl = r.modele ? TEMPLATE_BY_ID.get(r.modele) : undefined;
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
    alternatives: tpl?.alternatives ?? r.alternatives ?? {},
    steps: tpl?.steps ?? { debutant: r.etapes?.debutant ?? [], intermediaire: r.etapes?.intermediaire ?? [], expert: r.etapes?.expert ?? [] },
    questions: tpl?.questions ?? r.questions ?? [],
    choices: r.choix ?? {},
    lastDone: r.derniere_fois ?? fallback,
    custom: !r.modele,
    templateId: r.modele,
    inSchedule: !!r.dans_echeancier,
    months: r.mois ?? [],
    plannedDay: plan?.jour,
    lastValidated: (r.realisations ?? []).reduce<string | undefined>((m, x) => (!m || x.fait_le > m ? x.fait_le : m), undefined),
  };
}

export async function loadTasks(foyerId: string, today: Date): Promise<Task[]> {
  const { data, error } = await supabase
    .from('taches')
    .select('*, planifications(jour), realisations(fait_le)')
    .eq('foyer_id', foyerId)
    .order('created_at');
  fail(error);
  return ((data ?? []) as TaskRow[]).map((r) => toTask(r, today));
}

export async function markDone(foyerId: string, userId: string, taskId: string, day: Date, cost?: number | null, note?: string): Promise<void> {
  const { error } = await supabase.from('realisations').insert({
    foyer_id: foyerId,
    user_id: userId,
    tache_id: taskId,
    fait_le: toISODate(day),
    cout: cost ?? null,
    note: note?.trim() || null,
  });
  fail(error);
  // Une fois faite, la tâche n'a plus de jour prévu.
  await supabase.from('planifications').delete().eq('tache_id', taskId);
}

/** Annule la dernière validation d'une tâche (« C'est fait » par erreur). */
export async function undoDone(taskId: string): Promise<void> {
  const { data, error } = await supabase
    .from('realisations')
    .select('id')
    .eq('tache_id', taskId)
    .order('created_at', { ascending: false })
    .limit(1);
  fail(error);
  const id = data?.[0]?.id as string | undefined;
  if (!id) throw new Error('Rien à annuler pour cette tâche.');
  const { error: e2 } = await supabase.from('realisations').delete().eq('id', id);
  fail(e2);
}

export async function saveChoices(taskId: string, choices: Record<string, string>): Promise<void> {
  const { error } = await supabase.from('taches').update({ choix: choices }).eq('id', taskId);
  fail(error);
}

/** Champs modifiables d'une tâche. */
export type TaskEdit = {
  title: string;
  domain: Task['domain'];
  importance: Task['importance'];
  intervalDays: number;
  minutes: number;
  budget: number;
  difficulty: Task['difficulty'];
  pro: boolean;
  tools: string[];
  /** Étapes simples (tâches créées par l'utilisateur) : les mêmes pour tous les niveaux */
  steps?: string[];
  /** Dernière réalisation (AAAA-MM-JJ) ; null = jamais ou inconnue, donc à faire dès maintenant */
  lastDone?: string | null;
};

function editToRow(e: TaskEdit) {
  const row: Record<string, unknown> = {
    titre: e.title.trim(),
    domaine: e.domain,
    importance: e.importance,
    intervalle_jours: e.intervalDays,
    periode_label: periodLabelFor(e.intervalDays),
    minutes: e.minutes,
    budget: e.budget,
    difficulte: e.difficulty,
    pro: e.pro,
    outils: e.tools,
  };
  if (e.steps) row.etapes = { debutant: e.steps, intermediaire: e.steps, expert: e.steps };
  if (e.lastDone !== undefined) row.derniere_fois = e.lastDone;
  return row;
}

export async function updateTask(taskId: string, e: TaskEdit): Promise<void> {
  const { error } = await supabase.from('taches').update(editToRow(e)).eq('id', taskId);
  fail(error);
}

export async function createTask(foyerId: string, e: TaskEdit): Promise<void> {
  const { error } = await supabase.from('taches').insert({
    ...editToRow(e),
    foyer_id: foyerId,
    etapes: { debutant: e.steps ?? [], intermediaire: e.steps ?? [], expert: e.steps ?? [] },
    derniere_fois: e.lastDone ?? null,
  });
  fail(error);
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase.from('taches').delete().eq('id', taskId);
  fail(error);
}

export async function setActive(taskId: string, value: boolean): Promise<void> {
  const { error } = await supabase.from('taches').update({ actif: value }).eq('id', taskId);
  fail(error);
}

export async function setInSchedule(taskId: string, value: boolean): Promise<void> {
  const { error } = await supabase.from('taches').update({ dans_echeancier: value }).eq('id', taskId);
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

/* ---------- Profil du foyer et catalogue ---------- */

export type ProfileChanges = { added: Template[]; paused: Task[]; resumed: Task[] };

/** Ce qui changera dans les tâches si l'on enregistre ce profil. */
export function previewProfile(tasks: Task[], previous: Profile | null, next: Profile): ProfileChanges {
  const wanted = new Set(templatesFor(next).map((t) => t.id));
  const before = new Set(previous ? templatesFor(previous).map((t) => t.id) : []);
  const existing = new Map(tasks.filter((t) => t.templateId).map((t) => [t.templateId as string, t]));
  return {
    added: templatesFor(next).filter((t) => !existing.has(t.id)),
    paused: tasks.filter((t) => t.active && t.templateId && CATALOGUE_IDS.has(t.templateId) && !wanted.has(t.templateId)),
    resumed: tasks.filter((t) => !t.active && t.templateId && wanted.has(t.templateId) && !before.has(t.templateId)),
  };
}

/**
 * Enregistre le profil et met les tâches en accord : ajoute les tâches utiles,
 * met en pause celles qui ne servent plus (sans rien supprimer).
 * Les nouvelles tâches sont étalées dans le temps pour ne pas tout proposer d'un coup.
 */
export async function saveProfile(foyerId: string, tasks: Task[], previous: Profile | null, next: Profile, today: Date): Promise<ProfileChanges> {
  const changes = previewProfile(tasks, previous, next);
  const { error } = await supabase.from('foyers').update({ profil: next }).eq('id', foyerId);
  fail(error);
  if (changes.added.length) {
    const rows = changes.added.map((tpl, i) => {
      const spread = 0.5 + 0.4 * ((i % 5) / 4); // déjà 50 à 90 % du cycle écoulé
      const last = new Date(today.getTime() - Math.round(tpl.intervalDays * spread) * 86400000);
      return {
        foyer_id: foyerId,
        modele: tpl.id,
        titre: tpl.title,
        domaine: tpl.domain,
        importance: tpl.importance,
        intervalle_jours: tpl.intervalDays,
        periode_label: tpl.periodLabel,
        minutes: tpl.minutes,
        budget: tpl.budget,
        difficulte: tpl.difficulty,
        pro: tpl.pro,
        outils: tpl.tools,
        // Étapes, questions et solutions de remplacement viennent toujours du catalogue : rien à copier.
        choix: tpl.choicesFrom?.(next) ?? {},
        mois: tpl.months ?? null,
        derniere_fois: toISODate(last),
      };
    });
    const { error: e2 } = await supabase.from('taches').insert(rows);
    fail(e2);
  }
  for (const t of changes.paused) await setActive(t.id, false);
  for (const t of changes.resumed) await setActive(t.id, true);
  return changes;
}

/* ---------- Carnet d'entretien ---------- */

export type JournalEntry = {
  id: string;
  taskId: string;
  title: string;
  domain: Task['domain'];
  date: string;
  cost: number | null;
  note: string | null;
  userId: string | null;
};

export async function loadJournal(foyerId: string): Promise<JournalEntry[]> {
  const { data, error } = await supabase
    .from('realisations')
    .select('id, tache_id, fait_le, cout, note, user_id, taches(titre, domaine)')
    .eq('foyer_id', foyerId)
    .order('fait_le', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(300);
  fail(error);
  return ((data ?? []) as unknown as {
    id: string; tache_id: string; fait_le: string; cout: number | string | null; note: string | null; user_id: string | null;
    taches: { titre: string; domaine: Task['domain'] } | null;
  }[]).map((r) => ({
    id: r.id,
    taskId: r.tache_id,
    title: r.taches?.titre ?? 'Tâche supprimée',
    domain: r.taches?.domaine ?? 'maison',
    date: r.fait_le,
    cost: r.cout === null ? null : Number(r.cout),
    note: r.note,
    userId: r.user_id,
  }));
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const { error } = await supabase.from('realisations').delete().eq('id', id);
  fail(error);
}

/* ---------- Retour de fin de semaine ---------- */

export type Feedback = 'trop' | 'bien' | 'pas_assez';

export async function loadFeedback(userId: string, week: string): Promise<Feedback | null> {
  const { data, error } = await supabase.from('retours').select('avis').eq('user_id', userId).eq('semaine', week).maybeSingle();
  fail(error);
  return (data?.avis as Feedback | undefined) ?? null;
}

export async function saveFeedback(foyerId: string, userId: string, week: string, avis: Feedback): Promise<void> {
  const { error } = await supabase.from('retours').upsert({ foyer_id: foyerId, user_id: userId, semaine: week, avis });
  fail(error);
}
