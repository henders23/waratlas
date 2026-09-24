import type { WarDef, TerritoryJson } from '../war';
import type { WarEvent } from '../schema';
import territory from './territory.json';
import images from './images.json';
import { PHASES, REIGNS, CITIES } from './meta';

const eventFiles = import.meta.glob<WarEvent[]>('./events-*.json', { eager: true, import: 'default' });

export const NAPOLEONIC: WarDef = {
  id: 'napoleonic',
  title: 'The Napoleonic Wars',
  subtitle: '1792 – 1815',
  from: 1792.25,
  to: 1815.85,
  events: Object.values(eventFiles).flat(),
  images,
  territory: territory as TerritoryJson,
  phases: PHASES,
  reigns: REIGNS,
  cities: CITIES,
  camera: { center: [12, 47.5], zoom: 3.7, smallZoomOffset: 1 },
  eventZoom: 5.4,
  labelMinKm2: [9000, 60000],
  labelScale: 0.62,
  tickEvery: 2,
  speeds: [0.125, 0.25, 0.5, 1],
  outcomeColors: {
    victory: '#f2c14e',
    defeat: '#ec6a5c',
    inconclusive: '#d8cfbf',
    negotiated: '#c9b6e4',
    'n/a': '#d8cfbf',
  },
  text: {
    focusSide: 'France and allies',
    outcome: { victory: 'French victory', defeat: 'French defeat', inconclusive: 'Inconclusive', negotiated: 'Negotiated outcome', 'n/a': '' },
    reign: (r) => r.name,
    noReign: 'France',
    area: 'M km² in the French Empire and its client states',
    areaDigits: 2,
    focusFrontier: 'Frontier of French power',
    vassal: 'Tributary state',
    vassalTip: 'Tributary to',
    intro: {
      title: 'The Napoleonic Wars',
      dates: '1792 – 1815',
      blurb:
        'In twenty-three years of war a revolutionary republic became an empire that stretched from Hamburg to Rome and reached Moscow, and the rest of Europe tore it down. Watch the map change, and open {n} events from Valmy to Waterloo along the way.',
      play: 'Play the wars',
    },
  },
};
