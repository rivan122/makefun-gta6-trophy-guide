// The Leonida Ledger — entry program for gta6-trophy-guide-01 (Node 22, standard library only).
// The guide itself is this directory's app/ folder: plain static files (ES modules, CSS, no build
// step) that a browser opens at app/index.html and that load nothing over the network; the trophy
// list and the guides live in app/data/trophies.json. This program hands the guide in: before it
// copies anything it validates the trophy file (all 55 trophies present, each with its official
// name and a non-blank guide of its own), then it copies app/ and screenshots/ to /output and
// writes /output/dossier.json with the vendored make.fun library — byte for byte what the scorer
// writes, so vendor/makefun-frontend.ts stays exactly as the kit issued it.
//
// Serve the guide locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// My own gate before the handoff: the dossier is only worth writing if the data file at the
// heart of the guide is whole. The official list has 55 trophies; each one needs its name and
// a guide that is not blank, and no name may appear twice.
function validateTrophyFile(path: string): void {
  const data = JSON.parse(readFileSync(path, 'utf8')) as { trophies?: unknown };
  const trophies = Array.isArray(data) ? data : data.trophies;
  if (!Array.isArray(trophies) || trophies.length !== 55) {
    throw new Error(`trophies.json must hold exactly 55 trophies, found ${Array.isArray(trophies) ? trophies.length : 'none'}`);
  }
  const seen = new Set<string>();
  for (const trophy of trophies as Array<{ name?: unknown; guide?: unknown }>) {
    if (typeof trophy.name !== 'string' || trophy.name.trim() === '') throw new Error('a trophy is missing its name');
    if (seen.has(trophy.name)) throw new Error(`duplicate trophy name: ${trophy.name}`);
    seen.add(trophy.name);
    if (typeof trophy.guide !== 'string' || trophy.guide.trim() === '') throw new Error(`trophy "${trophy.name}" has no guide`);
  }
}

validateTrophyFile(join(here, 'app', 'data', 'trophies.json'));

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
