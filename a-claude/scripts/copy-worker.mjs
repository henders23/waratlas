// MapLibre 6 ships its worker as an ES module that imports a shared chunk by relative
// path. Bundlers can't follow that, so both files are served as-is from public/maplibre/.
import { copyFileSync, mkdirSync } from 'node:fs';

const from = new URL('../node_modules/maplibre-gl/dist/', import.meta.url);
const to = new URL('../public/maplibre/', import.meta.url);
mkdirSync(to, { recursive: true });
for (const f of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) copyFileSync(new URL(f, from), new URL(f, to));
