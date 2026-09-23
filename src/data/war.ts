import type { WarEvent, PhaseId } from './schema';
import { toYear } from './time';
import territoryJson from './mongol/territory.json';
import { PHASES, REIGNS, CITIES, type Phase, type Reign, type City } from './mongol/meta';

const eventFiles = import.meta.glob<WarEvent[]>('./mongol/events-*.json', { eager: true, import: 'default' });

export type Status = 'core' | 'vassal' | 'contested';

export interface Polity {
  id: string;
  name: string;
  color: string;
  family?: 'mongol';
}

export interface AtlasEvent extends WarEvent {
  t0: number;
  t1: number;
  index: number;
}

export interface Step {
  t: number;
  polity: string;
  status: Status;
}

export interface WarData {
  id: string;
  title: string;
  subtitle: string;
  from: number;
  to: number;
  events: AtlasEvent[];
  phases: Phase[];
  reigns: Reign[];
  cities: City[];
  polities: Map<string, Polity>;
  timelines: Map<string, Step[]>;
  territoryNote: string;
}

// How long an event reads as "happening now" when the source gives no end date.
const SPAN: Record<string, number> = { day: 1 / 24, month: 1 / 12, season: 0.25, year: 1, circa: 1 };

function buildEvents(): AtlasEvent[] {
  const all = Object.values(eventFiles).flat();
  return all
    .map((e) => {
      const t0 = toYear(e.start);
      const t1 = e.end ? toYear(e.end) + SPAN[e.datePrecision === 'day' ? 'day' : e.datePrecision] : t0 + SPAN[e.datePrecision];
      return { ...e, t0, t1: Math.max(t1, t0 + 1 / 24), index: 0 };
    })
    .sort((a, b) => a.t0 - b.t0 || b.importance - a.importance)
    .map((e, index) => ({ ...e, index }));
}

export function loadMongol(): WarData {
  const polities = new Map<string, Polity>(territoryJson.polities.map((p) => [p.id, p as Polity]));
  const timelines = new Map<string, Step[]>();
  for (const [region, steps] of Object.entries(territoryJson.regions)) {
    timelines.set(
      region,
      (steps as string[][]).map(([d, polity, status]) => ({ t: toYear(d), polity, status: (status ?? 'core') as Status })),
    );
  }
  return {
    id: 'mongol',
    title: 'The Mongol Conquests',
    subtitle: '1206 – 1294',
    from: 1206,
    to: 1294.5,
    events: buildEvents(),
    phases: PHASES,
    reigns: REIGNS,
    cities: CITIES,
    polities,
    timelines,
    territoryNote: territoryJson.note,
  };
}

export function stepAt(steps: Step[], t: number): { step: Step; prev?: Step } {
  let i = 0;
  while (i + 1 < steps.length && steps[i + 1].t <= t) i++;
  return { step: steps[i], prev: steps[i - 1] };
}

export function phaseAt(phases: Phase[], t: number): Phase {
  return phases.find((p) => t >= p.from && t < p.to) ?? phases[phases.length - 1];
}

export function isMongol(p: Polity | undefined) {
  return p?.family === 'mongol';
}

export type { PhaseId };

export interface WarEntry {
  id: string;
  title: string;
  span: string;
  ready: boolean;
}

// The portfolio of eight core wars; only the Mongol conquests have a finished research pack.
export const WARS: WarEntry[] = [
  { id: 'second-punic', title: 'Second Punic War', span: '218 – 201 BC', ready: false },
  { id: 'mongol', title: 'The Mongol Conquests', span: '1206 – 1294', ready: true },
  { id: 'imjin', title: 'The Imjin War', span: '1592 – 1598', ready: false },
  { id: 'seven-years', title: 'Seven Years’ War', span: '1756 – 1763', ready: false },
  { id: 'napoleonic', title: 'Revolutionary & Napoleonic Wars', span: '1792 – 1815', ready: false },
  { id: 'spanish-american', title: 'Spanish American Wars of Independence', span: '1810 – 1826', ready: false },
  { id: 'ww1', title: 'First World War', span: '1914 – 1918', ready: false },
  { id: 'ww2', title: 'Second World War', span: '1939 – 1945', ready: false },
];
