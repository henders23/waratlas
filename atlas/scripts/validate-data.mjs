// Structural validation for the authored war data.
// Usage: node scripts/validate-data.mjs [war] [files...]   (no war: every war)
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Per war: the years events may start in, and the theatre [west, south, east, north].
const WARS = {
  napoleonic: { years: [1792, 1815.9], theatre: [-20, 25, 45, 66] },
  ww1: { years: [1914.4, 1919.5], theatre: [-80, -55, 125, 70] },
  ww2: { years: [1939.66, 1945.72], theatre: [-180, -60, 180, 78] },
};
const KINDS = ['battle', 'siege', 'sack', 'massacre', 'political', 'death', 'treaty', 'raid', 'naval', 'campaign'];
const CERT = ['high', 'medium', 'low'];
const PREC = ['day', 'month', 'season', 'year', 'circa'];
const LOCC = ['exact', 'approximate', 'uncertain'];
const OUT = ['victory', 'defeat', 'inconclusive', 'negotiated', 'n/a'];
const DATE = /^\d{4}(-\d{2}(-\d{2})?)?$/;

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
      else if (x.start && !(toYear(x.start) >= phase.from - 1 / 365 && toYear(x.start) < phase.to))
        err(file, id, `starts ${x.start}, outside its chapter ${x.phase} (${phase.from}–${phase.to})`);
      if (!CERT.includes(x.certainty)) err(file, id, 'bad certainty');
      if (isEvents) {
        nEvents++;
        for (const k of ['title', 'place', 'summary', 'detail', 'significance'])
          if (typeof x[k] !== 'string' || !x[k].trim()) err(file, id, `missing ${k}`);
        if (!KINDS.includes(x.kind)) err(file, id, `bad kind ${x.kind}`);
        if (x.sourceRow !== undefined) err(file, id, 'sourceRow is not used; remove it');
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
  summary.push(`${war}: ${nEvents} events${nCampaigns ? `, ${nCampaigns} campaigns` : ''} across ${files.length} file(s)`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`FAIL: ${errors.length} problem(s)`);
  process.exit(1);
}
console.log(`PASS: ${summary.join('; ')}`);
