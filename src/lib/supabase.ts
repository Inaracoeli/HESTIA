import { createClient } from '@supabase/supabase-js';

// Adresse du projet et clé publique : elles sont faites pour être visibles dans l'app.
// La sécurité repose sur les règles d'accès de la base (chaque foyer ne voit que ses données).
const SUPABASE_URL = 'https://urjvkxzfrakrexvhvxbd.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_abMXO9RwyMoNMi46gYvFjw_ZRfPhrjb';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  db: { schema: 'hestia' },
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'hestia.auth' },
});
