// V2 : produits ménagers et liste de courses, épargne d'auto-assurance, coffre des appareils.
// Chaque module marche seul, même sans aucune tâche ni coût enregistré.
import { supabase } from './supabase';

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

/* ---------- Produits et liste de courses ---------- */

export type Categorie = 'menage' | 'linge' | 'cuisine' | 'salle_de_bain' | 'consommable' | 'jardin' | 'voiture' | 'autre';
export type Etat = 'ok' | 'bientot' | 'vide';
export type Produit = { id: string; nom: string; categorie: Categorie; etat: Etat; ponctuel: boolean; note: string | null };

export const CATEGORIES: { v: Categorie; l: string }[] = [
  { v: 'menage', l: 'Ménage' },
  { v: 'linge', l: 'Linge' },
  { v: 'cuisine', l: 'Cuisine' },
  { v: 'salle_de_bain', l: 'Salle de bain' },
  { v: 'consommable', l: 'Maison et entretien' },
  { v: 'jardin', l: 'Jardin' },
  { v: 'voiture', l: 'Voiture' },
  { v: 'autre', l: 'Autre' },
];

/** Suggestions pour démarrer : on en ajoute une d'un toucher. */
export const SUGGESTIONS: { nom: string; categorie: Categorie }[] = [
  { nom: 'Liquide vaisselle', categorie: 'cuisine' },
  { nom: 'Tablettes lave-vaisselle', categorie: 'cuisine' },
  { nom: 'Sel régénérant lave-vaisselle', categorie: 'cuisine' },
  { nom: 'Liquide de rinçage', categorie: 'cuisine' },
  { nom: 'Éponges', categorie: 'cuisine' },
  { nom: 'Sacs poubelle', categorie: 'cuisine' },
  { nom: 'Essuie-tout', categorie: 'cuisine' },
  { nom: 'Lessive', categorie: 'linge' },
  { nom: 'Adoucissant', categorie: 'linge' },
  { nom: 'Détachant', categorie: 'linge' },
  { nom: 'Nettoyant multi-surfaces', categorie: 'menage' },
  { nom: 'Vinaigre blanc', categorie: 'menage' },
  { nom: 'Bicarbonate de soude', categorie: 'menage' },
  { nom: 'Savon noir', categorie: 'menage' },
  { nom: 'Nettoyant sol', categorie: 'menage' },
  { nom: 'Nettoyant vitres', categorie: 'menage' },
  { nom: 'Microfibres', categorie: 'menage' },
  { nom: 'Sacs d’aspirateur', categorie: 'menage' },
  { nom: 'Gel WC', categorie: 'salle_de_bain' },
  { nom: 'Détartrant', categorie: 'salle_de_bain' },
  { nom: 'Papier toilette', categorie: 'salle_de_bain' },
  { nom: 'Ampoules', categorie: 'consommable' },
  { nom: 'Piles (détecteurs, télécommandes)', categorie: 'consommable' },
  { nom: 'Filtres de VMC ou de pompe à chaleur', categorie: 'consommable' },
  { nom: 'Sel pour adoucisseur', categorie: 'consommable' },
  { nom: 'Lave-glace', categorie: 'voiture' },
  { nom: 'Huile moteur (appoint)', categorie: 'voiture' },
  { nom: 'Sacs à déchets verts', categorie: 'jardin' },
  { nom: 'Huile de chaîne (tronçonneuse)', categorie: 'jardin' },
];

export async function loadProduits(foyerId: string): Promise<Produit[]> {
  const { data, error } = await supabase.from('produits').select('id, nom, categorie, etat, ponctuel, note').eq('foyer_id', foyerId).order('nom');
  fail(error);
  return (data ?? []) as Produit[];
}

export async function addProduit(foyerId: string, p: Omit<Produit, 'id'>): Promise<Produit> {
  const { data, error } = await supabase.from('produits').insert({ foyer_id: foyerId, ...p }).select('id, nom, categorie, etat, ponctuel, note').single();
  fail(error);
  return data as Produit;
}

export async function updateProduit(id: string, p: Partial<Omit<Produit, 'id'>>): Promise<void> {
  const { error } = await supabase.from('produits').update(p).eq('id', id);
  fail(error);
}

export async function deleteProduit(id: string): Promise<void> {
  const { error } = await supabase.from('produits').delete().eq('id', id);
  fail(error);
}

/* ---------- Épargne d'auto-assurance : des objectifs ---------- */

export type Icone = 'voiture' | 'maison' | 'electromenager' | 'animaux' | 'jardin' | 'sante' | 'autre';
export type Enveloppe = { id: string; nom: string; icone: Icone; objectif: number; actuel: number; note: string | null; ordre: number };

export const MODELES_ENVELOPPES: { nom: string; icone: Icone; aide: string }[] = [
  { nom: 'Voiture', icone: 'voiture', aide: 'Franchise, pneus, réparation imprévue' },
  { nom: 'Électroménager', icone: 'electromenager', aide: 'Remplacer un lave-linge ou un frigo' },
  { nom: 'Maison', icone: 'maison', aide: 'Chaudière, toiture, fuite, dégât' },
  { nom: 'Animaux', icone: 'animaux', aide: 'Vétérinaire, urgence' },
  { nom: 'Jardin', icone: 'jardin', aide: 'Tondeuse, élagage, clôture' },
  { nom: 'Santé', icone: 'sante', aide: 'Lunettes, dentiste, reste à charge' },
];

const toEnv = (r: { objectif: number | string; actuel: number | string } & Omit<Enveloppe, 'objectif' | 'actuel'>): Enveloppe => ({
  ...r,
  objectif: Number(r.objectif),
  actuel: Number(r.actuel),
});

export async function loadEnveloppes(foyerId: string): Promise<Enveloppe[]> {
  const { data, error } = await supabase.from('enveloppes').select('id, nom, icone, objectif, actuel, note, ordre').eq('foyer_id', foyerId).order('ordre').order('created_at');
  fail(error);
  return (data ?? []).map(toEnv);
}

export async function saveEnveloppe(foyerId: string, e: Omit<Enveloppe, 'id'> & { id?: string }): Promise<Enveloppe> {
  const { id, ...rest } = e;
  const q = id
    ? supabase.from('enveloppes').update(rest).eq('id', id)
    : supabase.from('enveloppes').insert({ foyer_id: foyerId, ...rest });
  const { data, error } = await q.select('id, nom, icone, objectif, actuel, note, ordre').single();
  fail(error);
  return toEnv(data as Parameters<typeof toEnv>[0]);
}

export async function deleteEnveloppe(id: string): Promise<void> {
  const { error } = await supabase.from('enveloppes').delete().eq('id', id);
  fail(error);
}

/** Coûts réels du carnet sur les 12 derniers mois, par domaine : une aide pour fixer un objectif. */
export async function loadDepensesAnnee(foyerId: string): Promise<Record<string, number>> {
  const since = new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10);
  const { data, error } = await supabase.from('realisations').select('cout, taches(domaine)').eq('foyer_id', foyerId).gte('fait_le', since);
  fail(error);
  const out: Record<string, number> = {};
  for (const r of (data ?? []) as unknown as { cout: number | null; taches: { domaine: string } | null }[]) {
    if (!r.cout || !r.taches) continue;
    out[r.taches.domaine] = (out[r.taches.domaine] ?? 0) + Number(r.cout);
  }
  return out;
}

/* ---------- Coffre des appareils ---------- */

export type CategorieAppareil = 'electromenager' | 'chauffage' | 'multimedia' | 'jardin' | 'vehicule' | 'outillage' | 'autre';
export type Appareil = {
  id: string;
  nom: string;
  categorie: CategorieAppareil;
  marque: string | null;
  modele: string | null;
  dateAchat: string | null;
  garantieMois: number | null;
  prix: number | null;
  vendeur: string | null;
  noticeUrl: string | null;
  note: string | null;
};
export type DocType = 'facture' | 'notice' | 'photo' | 'autre';
export type Doc = { id: string; appareilId: string; type: DocType; nom: string; chemin: string; mime: string; taille: number };

export const CATEGORIES_APPAREILS: { v: CategorieAppareil; l: string }[] = [
  { v: 'electromenager', l: 'Électroménager' },
  { v: 'chauffage', l: 'Chauffage et eau chaude' },
  { v: 'multimedia', l: 'Multimédia' },
  { v: 'jardin', l: 'Jardin' },
  { v: 'vehicule', l: 'Véhicules' },
  { v: 'outillage', l: 'Outillage' },
  { v: 'autre', l: 'Autre' },
];

type AppareilRow = {
  id: string; nom: string; categorie: CategorieAppareil; marque: string | null; modele: string | null; date_achat: string | null;
  garantie_mois: number | null; prix: number | string | null; vendeur: string | null; notice_url: string | null; note: string | null;
};
const COLS = 'id, nom, categorie, marque, modele, date_achat, garantie_mois, prix, vendeur, notice_url, note';
const toAppareil = (r: AppareilRow): Appareil => ({
  id: r.id, nom: r.nom, categorie: r.categorie, marque: r.marque, modele: r.modele, dateAchat: r.date_achat,
  garantieMois: r.garantie_mois, prix: r.prix === null ? null : Number(r.prix), vendeur: r.vendeur, noticeUrl: r.notice_url, note: r.note,
});

export async function loadAppareils(foyerId: string): Promise<Appareil[]> {
  const { data, error } = await supabase.from('appareils').select(COLS).eq('foyer_id', foyerId).order('nom');
  fail(error);
  return ((data ?? []) as AppareilRow[]).map(toAppareil);
}

export async function saveAppareil(foyerId: string, a: Omit<Appareil, 'id'> & { id?: string }): Promise<Appareil> {
  const row = {
    nom: a.nom, categorie: a.categorie, marque: a.marque || null, modele: a.modele || null, date_achat: a.dateAchat || null,
    garantie_mois: a.garantieMois, prix: a.prix, vendeur: a.vendeur || null, notice_url: a.noticeUrl || null, note: a.note || null,
  };
  const q = a.id ? supabase.from('appareils').update(row).eq('id', a.id) : supabase.from('appareils').insert({ foyer_id: foyerId, ...row });
  const { data, error } = await q.select(COLS).single();
  fail(error);
  return toAppareil(data as AppareilRow);
}

export async function deleteAppareil(foyerId: string, id: string): Promise<void> {
  const docs = await loadDocs(foyerId, id);
  if (docs.length) await supabase.storage.from(BUCKET).remove(docs.map((d) => d.chemin));
  const { error } = await supabase.from('appareils').delete().eq('id', id);
  fail(error);
}

/** Fin de garantie, si on connaît la date d'achat et la durée. */
export function finGarantie(a: Appareil): Date | null {
  if (!a.dateAchat || !a.garantieMois) return null;
  const d = new Date(a.dateAchat + 'T12:00:00');
  d.setMonth(d.getMonth() + a.garantieMois);
  return d;
}

const BUCKET = 'hestia-documents';

export async function loadDocs(foyerId: string, appareilId?: string): Promise<Doc[]> {
  let q = supabase.from('documents').select('id, appareil_id, type, nom, chemin, mime, taille').eq('foyer_id', foyerId);
  if (appareilId) q = q.eq('appareil_id', appareilId);
  const { data, error } = await q.order('created_at');
  fail(error);
  return ((data ?? []) as { id: string; appareil_id: string; type: DocType; nom: string; chemin: string; mime: string; taille: number }[]).map((r) => ({
    id: r.id, appareilId: r.appareil_id, type: r.type, nom: r.nom, chemin: r.chemin, mime: r.mime, taille: r.taille,
  }));
}

/** Réduit une grande photo (côté max 2000 px, JPEG) : la facture reste lisible et prend peu de place. */
async function alleger(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/') || file.size < 1_500_000) return file;
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * k);
    canvas.height = Math.round(bmp.height * k);
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/jpeg', 0.82));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export async function uploadDoc(foyerId: string, appareilId: string, file: File, type: DocType): Promise<Doc> {
  const blob = await alleger(file);
  const mime = blob.type || file.type || 'application/octet-stream';
  if (blob.size > 15 * 1024 * 1024) throw new Error('Fichier trop lourd (15 Mo au plus).');
  const ext = mime === 'application/pdf' ? 'pdf' : mime === 'image/png' ? 'png' : mime.startsWith('image/he') ? 'heic' : 'jpg';
  const chemin = `${foyerId}/${appareilId}/${crypto.randomUUID()}.${ext}`;
  const up = await supabase.storage.from(BUCKET).upload(chemin, blob, { contentType: mime, upsert: false });
  if (up.error) throw new Error(up.error.message);
  const nom = file.name?.slice(0, 120) || (type === 'facture' ? 'Facture' : type === 'notice' ? 'Notice' : 'Photo');
  const { data, error } = await supabase
    .from('documents')
    .insert({ foyer_id: foyerId, appareil_id: appareilId, type, nom, chemin, mime, taille: blob.size })
    .select('id')
    .single();
  if (error) {
    await supabase.storage.from(BUCKET).remove([chemin]);
    throw new Error(error.message);
  }
  return { id: (data as { id: string }).id, appareilId, type, nom, chemin, mime, taille: blob.size };
}

/** Lien temporaire (1 h) pour ouvrir un document privé. */
export async function docUrl(chemin: string): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(chemin, 3600);
  if (error || !data) throw new Error(error?.message ?? 'Document introuvable.');
  return data.signedUrl;
}

export async function deleteDoc(d: Doc): Promise<void> {
  await supabase.storage.from(BUCKET).remove([d.chemin]);
  const { error } = await supabase.from('documents').delete().eq('id', d.id);
  fail(error);
}
