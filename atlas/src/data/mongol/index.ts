import type { WarDef, TerritoryJson } from '../war';
import type { WarEvent } from '../schema';
import territory from './territory.json';
import { PHASES, REIGNS, CITIES } from './meta';

const eventFiles = import.meta.glob<WarEvent[]>('./events-*.json', { eager: true, import: 'default' });

export const MONGOL: WarDef = {
  id: 'mongol',
  title: 'The Mongol Conquests',
  subtitle: '1206 – 1294',
  from: 1206,
  to: 1294.5,
  events: Object.values(eventFiles).flat(),
  territory: territory as TerritoryJson,
  phases: PHASES,
  reigns: REIGNS,
  cities: CITIES,
  camera: { center: [88, 42], zoom: 2.35, smallZoomOffset: 0.75 },
  eventZoom: 4.6,
  labelMinKm2: [90000, 350000],
  labelScale: 1,
  tickEvery: 10,
  speeds: [0.5, 1, 2, 4],
  outcomeColors: {
    victory: '#f2b544',
    defeat: '#6cc3b5',
    inconclusive: '#d8cfbf',
    negotiated: '#c9b6e4',
    'n/a': '#d8cfbf',
  },
  text: {
    focusSide: 'Mongol side',
    outcome: { victory: 'Mongol victory', defeat: 'Mongol defeat', inconclusive: 'Inconclusive', negotiated: 'Negotiated outcome', 'n/a': '' },
    reign: (r) => (r.regency ? `Regency of ${r.name}` : `Great Qan ${r.name}`),
    noReign: 'Interregnum',
    area: 'M km² under Mongol rule or tribute',
    areaDigits: 1,
    focusFrontier: 'Mongol frontier',
    vassal: 'Submitted / tributary',
    vassalTip: 'Tributary to',
    intro: {
      title: 'The Mongol Conquests',
      dates: '1206 – 1294',
      blurb:
        'In eighty-eight years the armies of Chinggis Qan and his heirs rode from the Onon River to the Danube, the Euphrates and the South China Sea. Watch them spread and fracture, and open {n} researched events along the way.',
      play: 'Play the conquests',
    },
  },
};
