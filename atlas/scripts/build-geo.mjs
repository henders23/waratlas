// Builds one war's static geography from Natural Earth (public domain):
//   public/geo/<war>/regions.json  – historical regions (polygons) with area and label point
//   public/geo/<war>/borders.json  – shared border arcs tagged with the regions on each side
//   public/geo/<war>/rivers.json, lakes.json – physical context
// Usage: node scripts/build-geo.mjs <war> <dir containing the Natural Earth geojson files>
// The regions come from scripts/regions/<war>.mjs.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import bboxClip from '@turf/bbox-clip';
import turfArea from '@turf/area';
import polylabel from 'polylabel';
import mapshaper from 'mapshaper';
import { topology } from 'topojson-server';
import { feature, mesh, merge } from 'topojson-client';

const war = process.argv[2] ?? 'mongol';
const { REGIONS, THEATRE = [-15, -12, 150, 72] } = await import(`./regions/${war}.mjs`);
const src = process.argv[3] ?? '.geo-cache';
const out = new URL(`../public/geo/${war}/`, import.meta.url).pathname;
mkdirSync(out, { recursive: true });
const read = (f) => JSON.parse(readFileSync(join(src, f), 'utf8'));

// 1. Assign admin-1 units to regions (clipping where a spec asks for it).
const adm1 = read('ne_10m_admin_1_states_provinces.geojson').features;
const pieces = [];
const used = new Map();
for (const region of REGIONS) {
  for (const m of region.members) {
    const spec = typeof m === 'string' ? { a: m.split(':')[0], n: m.includes(':') ? m.slice(m.indexOf(':') + 1) : undefined } : m;
    // n: unit name, r: Natural Earth region, g: geounit (England, Scotland…), not: unit names to leave out
    const hits = adm1.filter((f) => {
      const p = f.properties;
      return p.adm0_a3 === spec.a && (spec.n === undefined || p.name === spec.n) && (spec.r === undefined || p.region === spec.r) &&
        (spec.g === undefined || p.geonunit === spec.g) && !(spec.not ?? []).includes(p.name);
    });
    if (!hits.length) {
      if (!['PSX', 'CYN', 'UKR:Crimea', 'UKR:Sevastopol'].includes(typeof m === 'string' ? m : spec.a)) console.warn(`warn: no admin-1 match for ${region.id} ← ${JSON.stringify(m)}`);
      continue;
    }
    for (const f of hits) {
      const key = f.properties.adm1_code;
      if (!spec.clip && used.has(key)) console.warn(`warn: ${key} in both ${used.get(key)} and ${region.id}`);
      used.set(key, region.id);
      const geom = spec.clip ? bboxClip(f, spec.clip).geometry : f.geometry;
      if (!geom || !geom.coordinates.length) continue;
      pieces.push({ type: 'Feature', properties: { region: region.id }, geometry: geom });
    }
  }
}
console.log(`assigned ${pieces.length} admin-1 pieces to ${REGIONS.length} regions`);

// 2. Dissolve + simplify with mapshaper, keeping shared boundaries consistent.
const cmd = '-i pieces.json -dissolve2 region -simplify 7% keep-shapes planar -filter-slivers min-area=30km2 -clean -o format=topojson regions.json';
const res = await mapshaper.applyCommands(cmd, { 'pieces.json': { type: 'FeatureCollection', features: pieces } });
const topo = JSON.parse(res['regions.json']);
const layer = Object.keys(topo.objects)[0];
const fc = feature(topo, topo.objects[layer]);

// 3. Regions with area and a good label point.
const names = Object.fromEntries(REGIONS.map((r) => [r.id, r.name]));
const round = (g) => JSON.parse(JSON.stringify(g, (k, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)));
const regions = fc.features.map((f, i) => {
  const id = f.properties.region;
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  const biggest = polys.reduce((a, b) => (turfArea({ type: 'Polygon', coordinates: b }) > turfArea({ type: 'Polygon', coordinates: a }) ? b : a));
  const label = polylabel(biggest, 0.05);
  return {
    type: 'Feature',
    id: i,
    properties: { region: id, name: names[id], areaKm2: Math.round(turfArea(f) / 1e6), labelLon: +label[0].toFixed(3), labelLat: +label[1].toFixed(3) },
    geometry: round(f.geometry),
  };
});
writeFileSync(join(out, 'regions.json'), JSON.stringify({ type: 'FeatureCollection', features: regions }));

// 4. Border arcs: each shared arc knows the two regions on either side (or null at the coast).
const geoms = topo.objects[layer].geometries;
const arcOwners = new Map();
const walk = (arcs, owner) => {
  for (const a of arcs) {
    if (Array.isArray(a)) walk(a, owner);
    else {
      const k = a < 0 ? ~a : a;
      if (!arcOwners.has(k)) arcOwners.set(k, new Set());
      arcOwners.get(k).add(owner);
    }
  }
};
geoms.forEach((g) => walk(g.arcs, g.properties.region));
const borders = [];
for (const [k, owners] of arcOwners) {
  const [a, b = null] = [...owners];
  if (b === null) continue; // coastline arcs are drawn by the terrain, not as frontiers
  const line = mesh(topo, { type: 'LineString', arcs: [k] });
  borders.push({ type: 'Feature', id: k, properties: { a, b }, geometry: round(line.coordinates.length === 1 ? { type: 'LineString', coordinates: line.coordinates[0] } : line) });
}
writeFileSync(join(out, 'borders.json'), JSON.stringify({ type: 'FeatureCollection', features: borders }));
console.log(`regions: ${regions.length}, border arcs: ${borders.length}`);

// 5. Rivers and lakes, restricted to the theatre and to rivers worth drawing.
const inTheatre = ([minx, miny, maxx, maxy]) => maxx > THEATRE[0] && minx < THEATRE[2] && maxy > THEATRE[1] && miny < THEATRE[3];
const bbox = (g) => {
  let b = [Infinity, Infinity, -Infinity, -Infinity];
  JSON.stringify(g.coordinates, (k, v) => {
    if (Array.isArray(v) && typeof v[0] === 'number') b = [Math.min(b[0], v[0]), Math.min(b[1], v[1]), Math.max(b[2], v[0]), Math.max(b[3], v[1])];
    return v;
  });
  return b;
};
const rivers = read('ne_50m_rivers_lake_centerlines.geojson').features
  .filter((f) => f.geometry && inTheatre(bbox(f.geometry)))
  .map((f) => ({ type: 'Feature', properties: { name: f.properties.name, rank: f.properties.scalerank }, geometry: round(f.geometry) }));
const lakes = read('ne_50m_lakes.geojson').features
  .filter((f) => f.geometry && inTheatre(bbox(f.geometry)) && f.properties.scalerank <= 4)
  .map((f) => ({ type: 'Feature', properties: { name: f.properties.name }, geometry: round(f.geometry) }));
writeFileSync(join(out, 'rivers.json'), JSON.stringify({ type: 'FeatureCollection', features: rivers }));
writeFileSync(join(out, 'lakes.json'), JSON.stringify({ type: 'FeatureCollection', features: lakes }));
console.log(`rivers: ${rivers.length}, lakes: ${lakes.length}`);
void merge;
