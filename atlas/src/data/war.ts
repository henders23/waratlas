import type { City, Outcome, Phase, Reign, WarEvent } from './schema';
import { toYear } from './time';

export type { Phase, Reign, City, PhaseId } from './schema';

export type Status = 'core' | 'vassal' | 'contested';

export interface Polity {
  id: string;
  name: string;
  color: string;
  /** polities of the focus side: the Mongol khanates, France and its satellite states */
  family?: 'focus';
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

export interface TerritoryJson {
  note: string;
  polities: Polity[];
  regions: Record<string, string[][]>;
}

/** Everything that makes one war's atlas differ from another's: data, camera, wording. */
export interface WarDef {
  id: string;
  title: string;
  subtitle: string;
  from: number;
  to: number;
  events: WarEvent[];
  territory: TerritoryJson;
  phases: Phase[];
  reigns: Reign[];
  cities: City[];
  /** starting camera; phases carry their own */
  camera: { center: [number, number]; zoom: number; smallZoomOffset: number };
  /** zoom to fly to when a pinned event is opened */
  eventZoom: number;
  /** smallest polity, in km², whose name is drawn on the map (desktop, phone) */
  labelMinKm2: [number, number];
  /** multiplier on polity label size, for theatres of different scale */
  labelScale: number;
  /** years between labelled ticks on the timeline */
  tickEvery: number;
  /** playback rates in years per second; the first "1×" is speeds[1] */
  speeds: number[];
  outcomeColors: Record<Outcome, string>;
  text: {
    focusSide: string;
    outcome: Record<Outcome, string>;
    reign: (r: Reign) => string;
    noReign: string;
    area: string;
    areaDigits: number;
    focusFrontier: string;
    vassal: string;
    vassalTip: string;
    intro: { title: string; dates: string; blurb: string; play: string };
  };
}

export interface WarData extends Omit<WarDef, 'events' | 'territory'> {
  events: AtlasEvent[];
  polities: Map<string, Polity>;
  timelines: Map<string, Step[]>;
  territoryNote: string;
  /** span of the war relative to the Mongol atlas's 88 years; scales fades and blends */
  timeScale: number;
}

// How long an event reads as "happening now" when the source gives no end date.
const SPAN: Record<string, number> = { day: 1 / 24, month: 1 / 12, season: 0.25, year: 1, circa: 1 };

export function buildWar(def: WarDef): WarData {
  const events = def.events
    .map((e) => {
      const t0 = toYear(e.start);
      const t1 = e.end ? toYear(e.end) + SPAN[e.datePrecision === 'day' ? 'day' : e.datePrecision] : t0 + SPAN[e.datePrecision];
      return { ...e, t0, t1: Math.max(t1, t0 + 1 / 24), index: 0 };
    })
    .sort((a, b) => a.t0 - b.t0 || b.importance - a.importance)
    .map((e, index) => ({ ...e, index }));
  const polities = new Map<string, Polity>(def.territory.polities.map((p) => [p.id, p]));
  const timelines = new Map<string, Step[]>();
  for (const [region, steps] of Object.entries(def.territory.regions)) {
    timelines.set(
      region,
      steps.map(([d, polity, status]) => ({ t: toYear(d), polity, status: (status ?? 'core') as Status })),
    );
  }
  const { events: _e, territory, ...rest } = def;
  void _e;
  return { ...rest, events, polities, timelines, territoryNote: territory.note, timeScale: (def.to - def.from) / 88 };
}

export function stepAt(steps: Step[], t: number): { step: Step; prev?: Step } {
  let i = 0;
  while (i + 1 < steps.length && steps[i + 1].t <= t) i++;
  return { step: steps[i], prev: steps[i - 1] };
}

export function phaseAt(phases: Phase[], t: number): Phase {
  return phases.find((p) => t >= p.from && t < p.to) ?? phases[phases.length - 1];
}

export function isFocus(p: Polity | undefined) {
  return p?.family === 'focus';
}

export interface WarEntry {
  id: string;
  title: string;
  span: string;
  /** a line for the opening screen */
  teaser?: string;
  stats?: string;
  /** colour of the war's card on the opening screen */
  accent?: string;
  load?: () => Promise<WarDef>;
}

// The portfolio of eight core wars. Three have finished atlases.
export const WARS: WarEntry[] = [
  { id: 'second-punic', title: 'Second Punic War', span: '218 – 201 BC' },
  {
    id: 'mongol',
    title: 'The Mongol Conquests',
    span: '1206 – 1294',
    teaser: 'From the Onon to the Danube and the South China Sea: eighty-eight years of the largest land empire in history, and its fracture into rival khanates.',
    stats: '103 events · 103 regions',
    accent: '#f2b544',
    load: () => import('./mongol').then((m) => m.MONGOL),
  },
  { id: 'imjin', title: 'The Imjin War', span: '1592 – 1598' },
  { id: 'seven-years', title: 'Seven Years’ War', span: '1756 – 1763' },
  {
    id: 'napoleonic',
    title: 'The Napoleonic Wars',
    span: '1792 – 1815',
    teaser: 'From Valmy to Waterloo: how a revolutionary republic became an empire that redrew Europe, and how the rest of Europe tore it down.',
    stats: '129 events · 119 regions',
    accent: '#7ea6ef',
    load: () => import('./napoleonic').then((m) => m.NAPOLEONIC),
  },
  { id: 'spanish-american', title: 'Spanish American Wars of Independence', span: '1810 – 1826' },
  {
    id: 'ww1',
    title: 'The First World War',
    span: '1914 – 1918',
    teaser: 'From Sarajevo to Versailles: trenches from the Channel to Switzerland, fronts from the Alps to Mesopotamia, and the fall of four empires.',
    stats: '126 events · 97 regions',
    accent: '#c8a46a',
    load: () => import('./ww1').then((m) => m.WW1),
  },
  { id: 'ww2', title: 'Second World War', span: '1939 – 1945' },
];
