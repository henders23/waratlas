// Structural validation for the authored war data.
// Usage: node scripts/validate-data.mjs [war] [files...]   (no war: every war)
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Per war: the years events may start in, the theatre [west, south, east, north], and
// whether a research pack fixes the list of events (the Mongol R71 pack does).
const WARS = {
  mongol: { years: [1200, 1295], theatre: [-20, -12, 150, 70], pack: true, phaseByDate: false },
  napoleonic: { years: [1792, 1815.9], theatre: [-20, 25, 45, 66], pack: false, phaseByDate: true },
  ww1: { years: [1914.4, 1919.5], theatre: [-80, -55, 125, 70], pack: false, phaseByDate: true },
};
const KINDS = ['battle', 'siege', 'sack', 'massacre', 'political', 'death', 'treaty', 'raid', 'naval', 'campaign'];
const CERT = ['high', 'medium', 'low'];
const PREC = ['day', 'month', 'season', 'year', 'circa'];
const LOCC = ['exact', 'approximate', 'uncertain'];
const OUT = ['victory', 'defeat', 'inconclusive', 'negotiated', 'n/a'];
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

const errors = [];
const err = (f, id, m) => errors.push(`${f} [${id}] ${m}`);
const toYear = (s) => {
  const [y, m = 1, d = 1] = s.split('-').map(Number);
  return y + (m - 1) / 12 + (d - 1) / 365;
};

// Chapter ids and spans, read from the war's meta.ts so they are written down once.
function readPhases(war) {
  const meta = readFileSync(new URL(`../src/data/${war}/meta.ts`, import.meta.url), 'utf8');
  return [...meta.matchAll(/id: '([a-z-]+)', title: .*?, from: ([\d.]+), to: ([\d.]+)/g)].map((m) => ({ id: m[1], from: +m[2], to: +m[3] }));
}

const [argWar, ...argFiles] = process.argv.slice(2);
const summary = [];
for (const war of argWar ? [argWar] : Object.keys(WARS)) validateWar(war, argFiles);

function validateWar(war, only) {
  const cfg = WARS[war];
  if (!cfg) throw new Error(`unknown war ${war}`);
  const dir = new URL(`../src/data/${war}/`, import.meta.url).pathname;
  const PHASES = readPhases(war);
  const inTheatre = (lon, lat) => lon >= cfg.theatre[0] && lon <= cfg.theatre[2] && lat >= cfg.theatre[1] && lat <= cfg.theatre[3];
  const files = only.length ? only : readdirSync(dir).filter((f) => /^(events|campaigns)-.*\.json$/.test(f)).map((f) => join(dir, f));
  const covered = new Set();
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
      const phase = PHASES.find((p) => p.id === x.phase);
      if (!phase) err(file, id, `bad phase ${x.phase}`);
      else if (cfg.phaseByDate && x.start && !(toYear(x.start) >= phase.from - 1 / 365 && toYear(x.start) < phase.to))
        err(file, id, `starts ${x.start}, outside its chapter ${x.phase} (${phase.from}–${phase.to})`);
      if (!CERT.includes(x.certainty)) err(file, id, 'bad certainty');
      if (isEvents) {
        nEvents++;
        for (const k of ['title', 'place', 'summary', 'detail', 'significance'])
          if (typeof x[k] !== 'string' || !x[k].trim()) err(file, id, `missing ${k}`);
        if (!KINDS.includes(x.kind)) err(file, id, `bad kind ${x.kind}`);
        const row = cfg.pack ? PACK.get(x.sourceRow) : null;
        if (!cfg.pack) {
          if (x.sourceRow !== undefined) err(file, id, 'this war has no research pack; sourceRow must be absent');
        } else if (!row) err(file, id, `sourceRow ${x.sourceRow} is not a pack candidate_id`);
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
        if (y < cfg.years[0] || y > cfg.years[1]) err(file, id, `start outside ${cfg.years.join('–')}`);
        if (!PREC.includes(x.datePrecision)) err(file, id, 'bad datePrecision');
        if (!LOCC.includes(x.locationCertainty)) err(file, id, 'bad locationCertainty');
        if (!inTheatre(x.lon, x.lat)) err(file, id, 'lon/lat out of theatre bounds');
        if (!x.sides?.focus || !x.sides?.opponent) err(file, id, 'sides.focus and sides.opponent required');
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
  if (!only.length) {
    const images = JSON.parse(readFileSync(join(dir, 'images.json'), 'utf8'));
    for (const [id, img] of Object.entries(images)) {
      if (!seen.has(id)) errors.push(`${war}/images.json: no event with id ${id}`);
      if (!img.file || /^File:|_|%/.test(img.file)) errors.push(`${war}/images.json ${id}: file must be a plain Commons file name`);
      if (!img.caption) errors.push(`${war}/images.json ${id}: missing caption`);
    }
  }
  if (cfg.pack && !only.length) {
    const missing = INCLUDED.filter((id) => !covered.has(id));
    if (missing.length) errors.push(`pack include rows with no event (${missing.length}): ${missing.join(', ')}`);
  }
  summary.push(`${war}: ${nEvents} events${nCampaigns ? `, ${nCampaigns} campaigns` : ''} across ${files.length} file(s)`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`FAIL: ${errors.length} problem(s)`);
  process.exit(1);
}
console.log(`PASS: ${summary.join('; ')}`);
