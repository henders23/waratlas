// Structural validation for the authored war data. Usage: node scripts/validate-data.mjs [files...]
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = new URL('../src/data/mongol/', import.meta.url).pathname;
const PHASES = ['rise', 'jin', 'khwarazm', 'ogedei', 'west', 'mongke', 'fracture', 'song', 'limits'];
const KINDS = ['battle', 'siege', 'sack', 'massacre', 'political', 'death', 'treaty', 'raid', 'naval', 'campaign'];
const CERT = ['high', 'medium', 'low'];
const PREC = ['day', 'month', 'season', 'year', 'circa'];
const LOCC = ['exact', 'approximate', 'uncertain'];
const OUT = ['mongol-victory', 'mongol-defeat', 'inconclusive', 'negotiated', 'n/a'];
const DATE = /^\d{4}(-\d{2}(-\d{2})?)?$/;

// The Instinct R71 pack is the canonical denominator: every include row must render
// as exactly one event, carrying the row's primary locators.
export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((f) => f !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}
const packPath = new URL('../data/mongol/r71/mongol_denominator_round71.csv', import.meta.url).pathname;
const PACK = new Map(parseCsv(readFileSync(packPath, 'utf8')).map((r) => [r.candidate_id, r]));
const INCLUDED = [...PACK.values()].filter((r) => r.disposition === 'include').map((r) => r.canonical_id.replace(/^mongol:/, ''));
const covered = new Set();

const errors = [];
const err = (f, id, m) => errors.push(`${f} [${id}] ${m}`);
const toYear = (s) => {
  const [y, m = 1, d = 1] = s.split('-').map(Number);
  return y + (m - 1) / 12 + (d - 1) / 365;
};
const inTheatre = (lon, lat) => lon >= -20 && lon <= 150 && lat >= -12 && lat <= 70;
const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(dir).filter((f) => /^(events|campaigns)-.*\.json$/.test(f)).map((f) => join(dir, f));
const seen = new Map();
let nEvents = 0;
let nCampaigns = 0;

for (const file of files) {
  let data;
  try {
    data = JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    err(file, '-', `invalid JSON: ${e.message}`);
    continue;
  }
  if (!Array.isArray(data)) {
    err(file, '-', 'top level must be an array');
    continue;
  }
  const isEvents = /events-/.test(file);
  for (const x of data) {
    const id = x.id ?? '?';
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) err(file, id, 'id must be kebab-case');
    if (seen.has(id)) err(file, id, `duplicate id (also in ${seen.get(id)})`);
    else seen.set(id, file);
    if (!PHASES.includes(x.phase)) err(file, id, `bad phase ${x.phase}`);
    if (!CERT.includes(x.certainty)) err(file, id, 'bad certainty');
    if (isEvents) {
      nEvents++;
      for (const k of ['title', 'place', 'summary', 'detail', 'significance'])
        if (typeof x[k] !== 'string' || !x[k].trim()) err(file, id, `missing ${k}`);
      if (!KINDS.includes(x.kind)) err(file, id, `bad kind ${x.kind}`);
      const row = PACK.get(x.sourceRow);
      if (!row) err(file, id, `sourceRow ${x.sourceRow} is not a pack candidate_id`);
      else if (row.disposition !== 'include' || row.canonical_id !== `mongol:${id}`)
        err(file, id, `sourceRow must be the include row whose canonical_id is mongol:${id}`);
      else {
        covered.add(id);
        const cites = x.sources.join(' ');
        for (const loc of [row.primary_locator_1, row.primary_locator_2])
          if (loc && !cites.includes(loc)) err(file, id, `sources must carry the pack locator verbatim: ${loc}`);
      }
      if (!['city', 'site', 'area'].includes(x.geometry)) err(file, id, 'geometry must be city|site|area');
      if (x.geometry === 'area' && !(x.radiusKm > 0)) err(file, id, 'area geometry needs radiusKm');
      for (const m of x.markers ?? [])
        if (!m.name || !inTheatre(m.lon, m.lat)) err(file, id, `bad marker ${JSON.stringify(m)}`);
      if (!DATE.test(x.start ?? '')) err(file, id, `bad start ${x.start}`);
      if (x.end !== undefined && (!DATE.test(x.end) || toYear(x.end) < toYear(x.start)))
        err(file, id, `bad end ${x.end}`);
      const y = toYear(x.start ?? '0');
      if (y < 1200 || y > 1295) err(file, id, 'start outside 1200–1295');
      if (!PREC.includes(x.datePrecision)) err(file, id, 'bad datePrecision');
      if (!LOCC.includes(x.locationCertainty)) err(file, id, 'bad locationCertainty');
      if (!inTheatre(x.lon, x.lat)) err(file, id, 'lon/lat out of theatre bounds');
      if (!x.sides?.mongol || !x.sides?.opponent) err(file, id, 'sides.mongol and sides.opponent required');
      if (!OUT.includes(x.outcome)) err(file, id, 'bad outcome');
      if (!Array.isArray(x.sources) || x.sources.length === 0) err(file, id, 'sources required');
      if (![1, 2, 3].includes(x.importance)) err(file, id, 'importance must be 1|2|3');
      if ((x.detail ?? '').split(/\s+/).length < 40) err(file, id, 'detail should be at least ~40 words');
    } else {
      nCampaigns++;
      if (!Array.isArray(x.waypoints) || x.waypoints.length < 2) {
        err(file, id, 'needs >=2 waypoints');
        continue;
      }
      let prev = -Infinity;
      for (const w of x.waypoints) {
        if (!DATE.test(w.date ?? '')) err(file, id, `bad waypoint date ${w.date}`);
        const t = toYear(w.date ?? '0');
        if (t < prev) err(file, id, `waypoints out of order at ${w.date}`);
        prev = t;
        if (!inTheatre(w.lon, w.lat)) err(file, id, `waypoint out of bounds ${w.lon},${w.lat}`);
      }
    }
  }
}
if (process.argv.length <= 2) {
  const missing = INCLUDED.filter((id) => !covered.has(id));
  if (missing.length) errors.push(`pack include rows with no event (${missing.length}): ${missing.join(', ')}`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`FAIL: ${errors.length} problem(s)`);
  process.exit(1);
}
console.log(`PASS: ${nEvents} events, ${nCampaigns} campaigns across ${files.length} file(s)`);
