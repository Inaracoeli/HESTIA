// Invitation d'un membre dans un foyer Hestia.
// Seul un administrateur du foyer peut inviter. La personne reçoit un e-mail,
// choisit son mot de passe, puis se connecte. Si elle a déjà un compte
// (FraisMI, DressIN…), elle est simplement ajoutée au foyer.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const ALLOWED_ORIGINS = ['https://hestia-homeflow.pages.dev', 'http://localhost:5173'];

function cors(origin: string | null) {
  const allowed = origin && (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.hestia-homeflow.pages.dev'));
  return {
    'Access-Control-Allow-Origin': allowed ? origin! : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

Deno.serve(async (req) => {
  const headers = cors(req.headers.get('Origin'));
  const reply = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } });

  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return reply(405, { erreur: 'Méthode non autorisée.' });

  const url = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Qui fait la demande ?
  const userClient = createClient(url, anonKey, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } });
  const { data: who } = await userClient.auth.getUser();
  if (!who.user) return reply(401, { erreur: 'Connectez-vous d’abord.' });

  let body: { foyer_id?: string; email?: string; redirect_to?: string };
  try {
    body = await req.json();
  } catch {
    return reply(400, { erreur: 'Demande illisible.' });
  }
  const email = (body.email ?? '').trim().toLowerCase();
  const foyerId = body.foyer_id ?? '';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return reply(400, { erreur: 'Adresse e-mail invalide.' });
  const redirect = body.redirect_to && ALLOWED_ORIGINS.some((o) => body.redirect_to!.startsWith(o)) ? body.redirect_to : ALLOWED_ORIGINS[0] + '/';

  const admin = createClient(url, serviceKey, { db: { schema: 'hestia' }, auth: { persistSession: false } });

  // Le demandeur doit être administrateur de ce foyer.
  const { data: role } = await admin.from('membres').select('role').eq('foyer_id', foyerId).eq('user_id', who.user.id).maybeSingle();
  if (role?.role !== 'admin') return reply(403, { erreur: 'Seul l’administrateur du foyer peut inviter.' });

  // Invitation, ou compte déjà existant ?
  let userId: string | null = null;
  let statut: 'invite' | 'ajoute' = 'invite';
  const invited = await admin.auth.admin.inviteUserByEmail(email, { redirectTo: redirect, data: { app: 'hestia' } });
  if (invited.data?.user) {
    userId = invited.data.user.id;
  } else {
    // Déjà inscrit : on retrouve son compte.
    statut = 'ajoute';
    for (let page = 1; page <= 20 && !userId; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error || !data?.users?.length) break;
      userId = data.users.find((u) => u.email?.toLowerCase() === email)?.id ?? null;
      if (data.users.length < 200) break;
    }
    if (!userId) return reply(400, { erreur: invited.error?.message ?? 'Invitation impossible.' });
  }

  const { error: insertError } = await admin
    .from('membres')
    .upsert({ foyer_id: foyerId, user_id: userId, role: 'membre', email }, { onConflict: 'foyer_id,user_id', ignoreDuplicates: true });
  if (insertError) return reply(500, { erreur: insertError.message });

  return reply(200, { statut });
});
