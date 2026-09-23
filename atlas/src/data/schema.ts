// Shared data shapes for a war in the atlas. Dates are written as ISO-like strings
// ("1241-04-11", "1241-04", "1241") and converted to decimal years at load time.
//
// Every war has a "focus" side, the power whose expansion the atlas follows (the
// Mongols, France). Sides, commanders, strengths and outcomes are written from
// that side's point of view.

export type PhaseId = string;

export type EventKind =
  | 'battle' | 'siege' | 'sack' | 'massacre' | 'political' | 'death'
  | 'treaty' | 'raid' | 'naval' | 'campaign';

export type Certainty = 'high' | 'medium' | 'low';

export type Outcome = 'victory' | 'defeat' | 'inconclusive' | 'negotiated' | 'n/a';

// How precisely the sources let us draw an event. 'city' and 'site' get a pin;
// 'area' is drawn as a soft halo of radiusKm because no single point is supported.
export type EventGeometry = 'city' | 'site' | 'area';

export interface NamedMarker {
  name: string;
  lon: number;
  lat: number;
}

export interface WarEvent {
  id: string;
  /** candidate_id of the research-pack row this event renders, where the war has a pack */
  sourceRow?: string;
  title: string;
  geometry: EventGeometry;
  radiusKm?: number;
  /** extra named places the event covers (e.g. Xiangyang and Fancheng) */
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
  sides: { focus: string; opponent: string };
  commanders?: { focus?: string[]; opponent?: string[] };
  strength?: { focus?: string; opponent?: string };
  casualties?: string;
  outcome: Outcome;
  summary: string;
  detail: string;
  significance: string;
  certainty: Certainty;
  uncertaintyNote?: string;
  sources: string[];
  importance: 1 | 2 | 3;
}

export interface Phase {
  id: PhaseId;
  title: string;
  from: number;
  to: number;
  /** what the visitor should understand about this chapter, in two or three sentences */
  story: string;
  camera: { center: [number, number]; zoom: number };
}

/** A ruler or government shown on the clock and as a strip under the timeline. */
export interface Reign {
  name: string;
  from: number;
  to: number;
  /** drawn paler on the timeline: a regency, or a regime other than the focus ruler's */
  regency?: boolean;
}

// Context cities, named as contemporaries knew them; the modern name follows when it differs.
export interface City {
  name: string;
  modern?: string;
  lon: number;
  lat: number;
  rank: 1 | 2;
  from?: number;
  to?: number;
}
