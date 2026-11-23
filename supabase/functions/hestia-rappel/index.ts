/**
 * Rappel du week-end d'Hestia : 2 ou 3 tâches rapides, à recopier sur l'ardoise de la maison.
 * - GET : clé publique VAPID, pour abonner un appareil (créée au premier appel).
 * - POST { essai: true } avec la session : envoie le rappel tout de suite, pour essayer.
 * - POST par la tâche planifiée (en-tête x-rappel), toutes les 15 minutes : envoie les rappels dus.
 *   Chaque personne a une liste de rappels, comme des alarmes (jours, heure, actif) ; un rappel part
 *   le bon jour, une fois l'heure atteinte (moins de 3 h après), et une seule fois ce jour-là.
 *
 * Les règles (priorités, reprise en douceur, message) viennent de src/data, copiées dans ./partage
 * par scripts/sync-fonctions.mjs : la notification propose exactement ce que propose l'app.
 */
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import webpush from 'npm:web-push@3.6.7';
import { gentleState, type Douceur } from './partage/douceur.ts';
import { weekendMessage } from './partage/rappel.ts';
import { toISODate, type Task } from './partage/types.ts';

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { db: { schema: 'hestia' } });
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};
const json = (corps: unknown, statut = 200) => new Response(JSON.stringify(corps), { status: statut, headers: { ...CORS, 'Content-Type': 'application/json' } });

type Cles = { cron?: string; vapid_public?: string; vapid_prive?: string };
async function cles(): Promise<Cles> {
  const lire = async () => ((await admin.rpc('cles_rappel')).data ?? {}) as Cles;
  let c = await lire();
  if (!c.vapid_public || !c.vapid_prive) {
    const k = webpush.generateVAPIDKeys();
    await admin.rpc('enregistrer_cle_rappel', { n: 'vapid_public', v: k.publicKey });
    await admin.rpc('enregistrer_cle_rappel', { n: 'vapid_prive', v: k.privateKey });
    c = await lire();
  }
  webpush.setVapidDetails('https://hestia-home.pages.dev', c.vapid_public!, c.vapid_prive!);
  return c;
}

async function envoyer(userId: string, message: { titre: string; corps: string; url: string }): Promise<number> {
  const { data } = await admin.from('abonnements_push').select('endpoint, p256dh, auth').eq('user_id', userId);
  let envoyes = 0;
  for (const a of (data ?? []) as { endpoint: string; p256dh: string; auth: string }[]) {
    try {
      await webpush.sendNotification({ endpoint: a.endpoint, keys: { p256dh: a.p256dh, auth: a.auth } }, JSON.stringify(message), { TTL: 6 * 3600 });
      envoyes++;
    } catch (e) {
      const statut = (e as { statusCode?: number }).statusCode;
      if (statut === 404 || statut === 410) await admin.from('abonnements_push').delete().eq('endpoint', a.endpoint);
    }
  }
  return envoyes;
}

/** Date, jour de la semaine et minutes depuis minuit, heure de Paris */
function maintenant(): { jour: string; semaine: number; minutes: number; date: Date } {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date())
      .map((x) => [x.type, x.value]),
  );
  const jour = `${p.year}-${p.month}-${p.day}`;
  const date = new Date(`${jour}T12:00:00`);
  return { jour, semaine: date.getDay(), minutes: Number(p.hour) * 60 + Number(p.minute), date };
}

type Ligne = {
  id: string; titre: string; importance: Task['importance']; intervalle_jours: number; minutes: number;
  derniere_fois: string | null; actif: boolean; mois: number[] | null; planifications: { jour: string }[] | null;
};

/** Le message : les 2 ou 3 tâches rapides de la semaine, calculées comme dans l'app. */
async function message(userId: string, capacite: number, aujourdhui: Date): Promise<{ titre: string; corps: string; url: string } | null> {
  const { data: m } = await admin
    .from('membres')
    .select('foyers(id, derniere_visite, douceur_semaine, douceur_type)')
    .eq('user_id', userId)
    .order('created_at')
    .limit(1);
  const foyer = (m ?? [])[0]?.foyers as unknown as { id: string; derniere_visite: string | null; douceur_semaine: string | null; douceur_type: Douceur } | undefined;
  if (!foyer) return null;
  const { data } = await admin
    .from('taches')
    .select('id, titre, importance, intervalle_jours, minutes, derniere_fois, actif, mois, planifications(jour)')
    .eq('foyer_id', foyer.id);
  const taches = ((data ?? []) as Ligne[]).map((r) => ({
    id: r.id, title: r.titre, importance: r.importance, intervalDays: r.intervalle_jours, minutes: r.minutes, active: r.actif,
    months: r.mois ?? [], plannedDay: r.planifications?.[0]?.jour,
    lastDone: r.derniere_fois ?? toISODate(new Date(aujourdhui.getTime() - r.intervalle_jours * 86400000)),
  })) as unknown as Task[];
  // Même reprise en douceur que l'app, pour tout le foyer (le rappel ne compte pas comme une visite).
  const { kind } = gentleState(aujourdhui, { lastVisit: foyer.derniere_visite, gentleWeek: foyer.douceur_semaine, gentleKind: foyer.douceur_type });
  return { ...weekendMessage(taches, aujourdhui, capacite, kind), url: '/' };
}

type Alarme = { id: string; jours: number[]; heure: string; actif: boolean };
type Reglage = { user_id: string; capacite_min: number; rappels: Alarme[] | null; rappels_envoyes: Record<string, string> | null };

async function tournee(): Promise<number> {
  const ici = maintenant();
  const { data } = await admin
    .from('reglages')
    .select('user_id, capacite_min, rappels, rappels_envoyes')
    .eq('rappel_actif', true);
  let n = 0;
  for (const r of (data ?? []) as Reglage[]) {
    try {
      const envoyes = { ...(r.rappels_envoyes ?? {}) };
      const dus = (r.rappels ?? []).filter((a) => {
        if (!a.actif || !a.jours?.includes(ici.semaine) || envoyes[a.id] === ici.jour) return false;
        const [h, mi] = a.heure.split(':').map(Number);
        const heure = h * 60 + mi;
        return ici.minutes >= heure && ici.minutes <= heure + 180;
      });
      if (dus.length === 0) continue;
      // Plusieurs rappels dus en même temps : une seule notification.
      const msg = await message(r.user_id, r.capacite_min, ici.date);
      if (msg) n += await envoyer(r.user_id, msg);
      for (const a of dus) envoyes[a.id] = ici.jour;
      // On ne garde que les rappels qui existent encore.
      const ids = new Set((r.rappels ?? []).map((a) => a.id));
      await admin.from('reglages').update({ rappels_envoyes: Object.fromEntries(Object.entries(envoyes).filter(([k]) => ids.has(k))) }).eq('user_id', r.user_id);
    } catch {
      // Un rappel qui échoue n'empêche pas les autres
    }
  }
  return n;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  try {
    const c = await cles();
    if (req.method === 'GET') return json({ cle: c.vapid_public });
    if (req.method !== 'POST') return json({ erreur: 'méthode' }, 405);

    const secret = req.headers.get('x-rappel');
    if (secret) {
      if (!c.cron || secret !== c.cron) return json({ erreur: 'refusé' }, 403);
      return json({ envoyes: await tournee() });
    }

    // Essai depuis les réglages : la session de l'utilisateur fait foi
    const jeton = req.headers.get('authorization')?.replace(/^Bearer /i, '');
    const { data } = jeton ? await admin.auth.getUser(jeton) : { data: { user: null } };
    if (!data.user) return json({ erreur: 'session' }, 401);
    const { data: reg } = await admin.from('reglages').select('capacite_min').eq('user_id', data.user.id).maybeSingle();
    const msg = (await message(data.user.id, reg?.capacite_min ?? 90, maintenant().date)) ?? { titre: 'Hestia', corps: 'Essai réussi : votre rappel arrivera au moment choisi.', url: '/' };
    return json({ envoyes: await envoyer(data.user.id, msg) });
  } catch (e) {
    return json({ erreur: String(e) }, 500);
  }
});
