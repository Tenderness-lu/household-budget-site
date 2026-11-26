// Hearth Ledger's hand-in program (Node 22, standard library only).
//
// The site is plain static files in app/ beside this file. This program
// copies app/ and screenshots/ into the output directory and writes
// dossier.json there with the vendored make.fun library, which is the
// summary the judge reads: the screenshots, the first load's files and
// bytes, and the site's source. Leave vendor/makefun-frontend.ts exactly
// as the kit shipped it: the scorer rebuilds the dossier with its own
// copy and the two must match byte for byte.
//
// Run it locally as:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.)

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(root, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(root, 'screenshots'))) {
  cpSync(join(root, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The caps mirror the gate's: at most 4 screenshots of 256 KiB, app/ within
// 993 files and 16 MiB, and the dossier text capped at 160 KiB.
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
