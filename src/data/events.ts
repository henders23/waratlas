import rows from './denominator.json';
import { enrichment } from './enrichment';

export type AtlasEvent = {
  id: string;
  candidateId: string;
  year: number;
  dateLabel: string;
  originalDateLabel: string;
  title: string;
  description: string;
  category: 'formation' | 'campaign' | 'turning' | 'culture' | 'fracture';
  partition: string;
  marker?: {lon: number; lat: number; location: string};
  sourceCitation: string;
  secondCitation: string | null;
  sourceUrl: string | null;
  geometryStatus: string;
  reviewReason: string;
  materiality: string;
};

const missing = rows.filter(row => !enrichment[row.id]);
if (missing.length) throw new Error(`Missing R71 atlas enrichment: ${missing.map(row => row.id).join(', ')}`);

export const events: AtlasEvent[] = rows.map(row => ({
  ...row,
  ...enrichment[row.id],
  category: enrichment[row.id].category,
}));

export const partitionNames: Record<string, string> = {
  foundation_steppe: 'Steppe origins',
  western_xia: 'Western Xia',
  jin_north_china: 'Northern China',
  qarakhitai_khwarazm_central_asia: 'Central Asia',
  caucasus_steppe_rus_europe: 'The western campaigns',
  korea_tibet_dali_vietnam: 'Eastern and southern frontiers',
  west_asia_anatolia_mamluk: 'Western Asia',
  song_yuan_china: 'Southern Song and Yuan',
  mongol_civil_wars: 'Civil wars',
  overseas_south_east_asia: 'Overseas expeditions',
  end_boundary: 'A new generation',
};
