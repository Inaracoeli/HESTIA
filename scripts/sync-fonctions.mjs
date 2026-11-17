// Le rappel du week-end utilise exactement les règles de l'app : ce script copie
// les fichiers source (src/data) dans la fonction Supabase, en adaptant les imports pour Deno.
// « node scripts/sync-fonctions.mjs --check » échoue si les copies ne sont plus à jour (vérification GitHub).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const FILES = ['types.ts', 'engine.ts', 'douceur.ts', 'rappel.ts'];
const DEST = 'supabase/functions/hestia-rappel/partage';
const check = process.argv.includes('--check');
let stale = [];

mkdirSync(DEST, { recursive: true });
for (const f of FILES) {
  const src = readFileSync(`src/data/${f}`, 'utf8').replace(/from '\.\/([a-z-]+)'/g, "from './$1.ts'");
  const out = `// Fichier généré depuis src/data/${f} par scripts/sync-fonctions.mjs : ne pas modifier ici.\n${src}`;
  const path = `${DEST}/${f}`;
  if (check) {
    if (!existsSync(path) || readFileSync(path, 'utf8') !== out) stale.push(path);
  } else writeFileSync(path, out);
}
if (stale.length) {
  console.error(`Copies du moteur à mettre à jour (node scripts/sync-fonctions.mjs) : ${stale.join(', ')}`);
  process.exit(1);
}
console.log(check ? 'Fonction de rappel à jour.' : 'Fonction de rappel synchronisée.');
