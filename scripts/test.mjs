// Lance les tests (tests/*.test.ts) avec le lanceur intégré de Node.
// esbuild (déjà installé avec Vite) transforme le TypeScript en un seul fichier.
import { createRequire } from 'node:module';
import { readdirSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const esbuild = require('esbuild');
const files = readdirSync('tests').filter((f) => f.endsWith('.test.ts')).map((f) => `tests/${f}`);
mkdirSync('.tests-build', { recursive: true });
await esbuild.build({ entryPoints: files, bundle: true, platform: 'node', format: 'esm', outdir: '.tests-build', logLevel: 'error' });
const out = files.map((f) => `.tests-build/${f.slice(6).replace(/\.ts$/, '.js')}`);
const r = spawnSync(process.execPath, ['--test', ...out], { stdio: 'inherit' });
process.exit(r.status ?? 1);
