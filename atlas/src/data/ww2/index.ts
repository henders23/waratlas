import type { WarDef, TerritoryJson } from '../war';
import type { WarEvent } from '../schema';
import territory from './territory.json';
import images from './images.json';
import { PHASES, REIGNS, CITIES } from './meta';

const eventFiles = import.meta.glob<WarEvent[]>('./events-*.json', { eager: true, import: 'default' });

export const WW2: WarDef = {
  id: 'ww2',
  title: 'The Second World War',
  subtitle: '1939 – 1945',
  from: 1939.665,
  to: 1945.72,
  events: Object.values(eventFiles).flat(),
  images,
  territory: territory as TerritoryJson,
  phases: PHASES,
  reigns: REIGNS,
  cities: CITIES,
  camera: { center: [55, 38], zoom: 2.2, smallZoomOffset: 0.8 },
  eventZoom: 5,
  labelMinKm2: [12000, 80000],
  labelScale: 0.7,
  tickEvery: 1,
  speeds: [0.0375, 0.075, 0.15, 0.3],
  outcomeColors: {
    victory: '#e9a93e',
    defeat: '#6fa8e8',
    inconclusive: '#d8cfbf',
    negotiated: '#c9b6e4',
    'n/a': '#d8cfbf',
  },
  text: {
    focusSide: 'Axis',
    outcome: { victory: 'Axis victory', defeat: 'Allied victory', inconclusive: 'Inconclusive', negotiated: 'Negotiated outcome', 'n/a': '' },
    reign: (r) => `Axis leaders: ${r.name}`,
    noReign: 'Axis leaders',
    area: 'M km² held by the Axis',
    areaDigits: 1,
    focusFrontier: 'Front line of the Axis',
    vassal: 'Tributary state',
    vassalTip: 'Tributary to',
    intro: {
      title: 'The Second World War',
      dates: '1939 – 1945',
      blurb:
        'The deadliest war in history was fought on every continent but one and on every ocean, and some 70 to 85 million people died in it. Watch the Axis empires spread across Europe, Africa and Asia and then collapse, and open {n} events from the invasion of Poland to Tokyo Bay along the way.',
      play: 'Show the passage of the war',
    },
  },
};
