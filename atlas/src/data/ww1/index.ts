import type { WarDef, TerritoryJson } from '../war';
import type { WarEvent } from '../schema';
import territory from './territory.json';
import { PHASES, REIGNS, CITIES } from './meta';

const eventFiles = import.meta.glob<WarEvent[]>('./events-*.json', { eager: true, import: 'default' });

export const WW1: WarDef = {
  id: 'ww1',
  title: 'The First World War',
  subtitle: '1914 – 1918',
  from: 1914.49,
  to: 1919.5,
  events: Object.values(eventFiles).flat(),
  territory: territory as TerritoryJson,
  phases: PHASES,
  reigns: REIGNS,
  cities: CITIES,
  camera: { center: [16, 47], zoom: 3.6, smallZoomOffset: 1 },
  eventZoom: 5.6,
  labelMinKm2: [9000, 60000],
  labelScale: 0.62,
  tickEvery: 1,
  speeds: [0.03125, 0.0625, 0.125, 0.25],
  outcomeColors: {
    victory: '#e9a93e',
    defeat: '#6fa8e8',
    inconclusive: '#d8cfbf',
    negotiated: '#c9b6e4',
    'n/a': '#d8cfbf',
  },
  text: {
    focusSide: 'Central Powers',
    outcome: { victory: 'Central Powers victory', defeat: 'Allied victory', inconclusive: 'Inconclusive', negotiated: 'Negotiated outcome', 'n/a': '' },
    reign: (r) => `German high command: ${r.name}`,
    noReign: 'German high command',
    area: 'M km² held by the Central Powers',
    areaDigits: 2,
    focusFrontier: 'Front line of the Central Powers',
    vassal: 'Tributary state',
    vassalTip: 'Tributary to',
    intro: {
      title: 'The First World War',
      dates: '1914 – 1918',
      blurb:
        'In four years and three months of war, the old empires of Europe fought themselves to exhaustion from Flanders to Mesopotamia, and four of them fell. Watch the fronts move, and open {n} events from Sarajevo to Versailles along the way.',
      play: 'Play the war',
    },
  },
};
