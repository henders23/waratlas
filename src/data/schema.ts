// Shared data shapes for a war in the atlas. Dates are written as ISO-like strings
// ("1241-04-11", "1241-04", "1241") and converted to decimal years at load time.

export type PhaseId =
  | 'rise' | 'jin' | 'khwarazm' | 'ogedei' | 'west' | 'mongke' | 'fracture' | 'song' | 'limits';

export type EventKind =
  | 'battle' | 'siege' | 'sack' | 'massacre' | 'political' | 'death'
  | 'treaty' | 'raid' | 'naval' | 'campaign';

export type Certainty = 'high' | 'medium' | 'low';

// How precisely the research pack lets us draw an event. 'city' and 'site' get a
// pin; 'area' is drawn as a soft halo of radiusKm because the source row refuses a point.
export type EventGeometry = 'city' | 'site' | 'area';

export interface NamedMarker {
  name: string;
  lon: number;
  lat: number;
}

export interface WarEvent {
  /** canonical_id from the Instinct R71 pack, without the "mongol:" prefix */
  id: string;
  /** candidate_id of the pack row this event renders */
  sourceRow: string;
  title: string;
  geometry: EventGeometry;
  radiusKm?: number;
  /** extra named places the pack row permits (e.g. Xiangyang and Fancheng) */
  markers?: NamedMarker[];
  kind: EventKind;
  start: string;
  end?: string;
  datePrecision: 'day' | 'month' | 'season' | 'year' | 'circa';
  place: string;
  lon: number;
  lat: number;
  locationCertainty: 'exact' | 'approximate' | 'uncertain';
  phase: PhaseId;
  sides: { mongol: string; opponent: string };
  commanders?: { mongol?: string[]; opponent?: string[] };
  strength?: { mongol?: string; opponent?: string };
  casualties?: string;
  outcome: 'mongol-victory' | 'mongol-defeat' | 'inconclusive' | 'negotiated' | 'n/a';
  summary: string;
  detail: string;
  significance: string;
  certainty: Certainty;
  uncertaintyNote?: string;
  sources: string[];
  importance: 1 | 2 | 3;
}

export interface Waypoint {
  lon: number;
  lat: number;
  date: string;
  place?: string;
}

export interface Campaign {
  id: string;
  name: string;
  commanders: string[];
  phase: PhaseId;
  certainty: Certainty;
  note: string;
  waypoints: Waypoint[];
}
