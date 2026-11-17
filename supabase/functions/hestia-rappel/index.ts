/**
 * Rappel du week-end d'Hestia : 2 ou 3 tâches rapides, à recopier sur l'ardoise de la maison.
 * - GET : clé publique VAPID, pour abonner un appareil (créée au premier appel).
 * - POST { essai: true } avec la session : envoie le rappel tout de suite, pour essayer.
 * - POST par la tâche planifiée (en-tête x-rappel), toutes les 15 minutes : envoie les rappels dus
 *   (bon jour, heure atteinte depuis moins de 3 h, pas encore envoyé ce jour-là).
 *
 * engine.ts et types.ts sont des copies de src/data (mêmes règles que l'app), ajoutées au déploiement.
 */
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import webpush from 'npm:web-push@3.6.7';
import { planWeeks, weekendPicks, weekStart, formatMinutes } from './engine.ts';
import { toISODate, type Task } from './types.ts';

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
  const { data: m } = await admin.from('membres').select('foyer_id').eq('user_id', userId).limit(1);
  const foyerId = (m ?? [])[0]?.foyer_id;
  if (!foyerId) return null;
  const { data } = await admin
    .from('taches')
    .select('id, titre, importance, intervalle_jours, minutes, derniere_fois, actif, mois, planifications(jour)')
    .eq('foyer_id', foyerId);
  const lundi = toISODate(weekStart(aujourdhui));
  const taches = ((data ?? []) as Ligne[]).map((r) => ({
    id: r.id, title: r.titre, importance: r.importance, intervalDays: r.intervalle_jours, minutes: r.minutes, active: r.actif,
    months: r.mois ?? [], plannedDay: r.planifications?.[0]?.jour,
    lastDone: r.derniere_fois ?? toISODate(new Date(aujourdhui.getTime() - r.intervalle_jours * 86400000)),
  })) as unknown as Task[];
  const restantes = taches.filter((t) => !(t.lastDone >= lundi));
  const [semaine] = planWeeks(restantes, aujourdhui, [capacite]);
  const choix = weekendPicks(semaine.tasks, 3);
  if (choix.length === 0) return { titre: 'Hestia', corps: 'Rien d’urgent ce week-end. Profitez-en.', url: '/' };
  const total = choix.reduce((s, t) => s + t.minutes, 0);
  return {
    titre: choix.length > 1 ? `Ce week-end, ${choix.length} petites choses (${formatMinutes(total)})` : `Ce week-end, une petite chose (${formatMinutes(total)})`,
    corps: choix.map((t) => `• ${t.title} (${formatMinutes(t.minutes)})`).join('\n'),
    url: '/',
  };
}

type Reglage = { user_id: string; capacite_min: number; rappel_jour: number; rappel_heure: string; rappel_envoye_le: string | null };

async function tournee(): Promise<number> {
  const ici = maintenant();
  const { data } = await admin
    .from('reglages')
    .select('user_id, capacite_min, rappel_jour, rappel_heure, rappel_envoye_le')
    .eq('rappel_actif', true)
    .eq('rappel_jour', ici.semaine);
  let n = 0;
  for (const r of (data ?? []) as Reglage[]) {
    try {
      const [h, mi] = r.rappel_heure.split(':').map(Number);
      const heure = h * 60 + mi;
      if (r.rappel_envoye_le === ici.jour || ici.minutes < heure || ici.minutes > heure + 180) continue;
      const msg = await message(r.user_id, r.capacite_min, ici.date);
      if (msg) n += await envoyer(r.user_id, msg);
      await admin.from('reglages').update({ rappel_envoye_le: ici.jour }).eq('user_id', r.user_id);
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
