// Checks territory.json against the region spec: every region has a timeline,
// timelines are in date order and name known polities.
import { readFileSync } from 'node:fs';
import { REGIONS } from './region-spec.mjs';

const t = JSON.parse(readFileSync(new URL('../src/data/mongol/territory.json', import.meta.url), 'utf8'));
const polities = new Set(t.polities.map((p) => p.id));
const specIds = new Set(REGIONS.map((r) => r.id));
const errors = [];
const toYear = (s) => {
  const [y, m = 1] = s.split('-').map(Number);
  return y + (m - 1) / 12;
};

for (const id of specIds) if (!t.regions[id]) errors.push(`region ${id} has no timeline`);
for (const [id, steps] of Object.entries(t.regions)) {
  if (!specIds.has(id)) errors.push(`timeline for unknown region ${id}`);
  let prev = -Infinity;
  for (const [date, polity, status = 'core'] of steps) {
    if (!/^\d{4}(-\d{2})?$/.test(date)) errors.push(`${id}: bad date ${date}`);
    if (toYear(date) <= prev) errors.push(`${id}: ${date} out of order`);
    prev = toYear(date);
    if (!polities.has(polity)) errors.push(`${id}: unknown polity ${polity}`);
    if (!['core', 'vassal', 'contested'].includes(status)) errors.push(`${id}: bad status ${status}`);
  }
  const last = steps[steps.length - 1];
  if (last?.[1] === 'mongol' && toYear(last[0]) < 1261) errors.push(`${id}: still the unified empire after the 1260 split`);
  if (steps[0]?.[0] !== '1206') errors.push(`${id}: timeline must start in 1206`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`PASS: ${specIds.size} regions, ${polities.size} polities`);
