// Checks each war's territory.json against its region spec: every region has a
// timeline starting at the war's first year, in date order, naming known polities.
// Usage: node scripts/check-territory.mjs [war]
import { readFileSync } from 'node:fs';

// The Mongol empire split in 1260; no region may still belong to it after that.
const RULES = {
  mongol: { first: '1206', check: (id, last, toYear, errors) => last?.[1] === 'mongol' && toYear(last[0]) < 1261 && errors.push(`${id}: still the unified empire after the 1260 split`) },
  napoleonic: { first: '1792' },
  ww1: { first: '1914' },
};

const toYear = (s) => {
  const [y, m = 1, d = 1] = s.split('-').map(Number);
  return y + (m - 1) / 12 + (d - 1) / 365;
};
const errors = [];
const summary = [];
for (const war of process.argv[2] ? [process.argv[2]] : Object.keys(RULES)) {
  const { REGIONS } = await import(`./regions/${war}.mjs`);
  const t = JSON.parse(readFileSync(new URL(`../src/data/${war}/territory.json`, import.meta.url), 'utf8'));
  const polities = new Set(t.polities.map((p) => p.id));
  const specIds = new Set(REGIONS.map((r) => r.id));
  const rule = RULES[war];
  for (const id of specIds) if (!t.regions[id]) errors.push(`${war}: region ${id} has no timeline`);
  for (const [id, steps] of Object.entries(t.regions)) {
    if (!specIds.has(id)) errors.push(`${war}: timeline for unknown region ${id}`);
    let prev = -Infinity;
    for (const [date, polity, status = 'core'] of steps) {
      if (!/^\d{4}(-\d{2}(-\d{2})?)?$/.test(date)) errors.push(`${war} ${id}: bad date ${date}`);
      if (toYear(date) <= prev) errors.push(`${war} ${id}: ${date} out of order`);
      prev = toYear(date);
      if (!polities.has(polity)) errors.push(`${war} ${id}: unknown polity ${polity}`);
      if (!['core', 'vassal', 'contested'].includes(status)) errors.push(`${war} ${id}: bad status ${status}`);
    }
    rule.check?.(id, steps[steps.length - 1], toYear, errors);
    if (steps[0]?.[0] !== rule.first) errors.push(`${war} ${id}: timeline must start in ${rule.first}`);
  }
  summary.push(`${war}: ${specIds.size} regions, ${polities.size} polities`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`PASS: ${summary.join('; ')}`);
