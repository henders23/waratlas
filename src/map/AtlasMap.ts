import * as maplibregl from 'maplibre-gl';
import type { MapGeoJSONFeature } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { baseStyle, WATER } from './style';
import { drawPin, hatch, OUTCOME_COLORS } from './icons';
import { isMongol, phaseAt, stepAt, type AtlasEvent, type Polity, type Status, type WarData } from '../data/war';
import { store } from '../store';

maplibregl.setWorkerUrl(`${import.meta.env.BASE_URL}maplibre/maplibre-gl-worker.mjs`);

type RegionFeature = GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon, { region: string; name: string; areaKm2: number; labelLon: number; labelLat: number }>;

export interface RegionInfo {
  region: string;
  name: string;
  polity: Polity;
  status: Status;
  since: number;
}

interface RegionState {
  fid: number;
  polity: string;
  status: Status;
  color: string;
  opacity: number;
  flash: number;
  contested: number;
  vassal: number;
}

const TRANSITION = 0.3; // years of timeline over which a region's colour blends to its new owner
const FLASH = 0.7; // years a newly conquered region glows

const hexToRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, k: number) => {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`;
};
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => x * x * (3 - 2 * x);

function opacityFor(p: Polity | undefined, status: Status) {
  if (!p) return 0;
  if (isMongol(p)) return status === 'vassal' ? 0.26 : status === 'contested' ? 0.3 : 0.44;
  return status === 'vassal' ? 0.18 : 0.2;
}

function circlePolygon(lon: number, lat: number, km: number, n = 72): GeoJSON.Polygon {
  const ring: number[][] = [];
  const R = 6371;
  const d = km / R;
  const φ1 = (lat * Math.PI) / 180;
  const λ1 = (lon * Math.PI) / 180;
  for (let i = 0; i <= n; i++) {
    const θ = (i / n) * 2 * Math.PI;
    const φ2 = Math.asin(Math.sin(φ1) * Math.cos(d) + Math.cos(φ1) * Math.sin(d) * Math.cos(θ));
    const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(d) * Math.cos(φ1), Math.cos(d) - Math.sin(φ1) * Math.sin(φ2));
    ring.push([(λ2 * 180) / Math.PI, (φ2 * 180) / Math.PI]);
  }
  return { type: 'Polygon', coordinates: [ring] };
}

export class AtlasMap {
  map: maplibregl.Map;
  private war: WarData;
  private regions: RegionFeature[] = [];
  private regionState = new Map<string, RegionState>();
  private borders: { id: number; a: string; b: string }[] = [];
  private borderKind = new Map<number, number>();
  private labels = new Map<string, { marker: maplibregl.Marker; el: HTMLElement; area: number; shown: boolean }>();
  private declutterAt = 0;
  private cityMarkers: { marker: maplibregl.Marker; el: HTMLElement; from: number; to: number }[] = [];
  private ownerKey = '';
  private evState = new Map<number, { vis: number; active: number; sel: number; hover: number; pulse: number; past: number }>();
  private ready = false;
  private lastT = NaN;
  private hoveredRegion: number | null = null;
  onRegionHover?: (info: RegionInfo | null, point?: { x: number; y: number }) => void;
  onEventHover?: (ev: AtlasEvent | null, point?: { x: number; y: number }) => void;
  onReady?: () => void;

  constructor(container: HTMLElement, war: WarData, geoBase: string) {
    this.war = war;
    const small = window.innerWidth < 720;
    this.map = new maplibregl.Map({
      container,
      style: baseStyle(),
      center: [88, 42],
      zoom: small ? 1.6 : 2.35,
      minZoom: 1.2,
      maxZoom: 9,
      attributionControl: { compact: true },
      canvasContextAttributes: { antialias: true },
      renderWorldCopies: false,
      fadeDuration: 0,
    } as maplibregl.MapOptions);
    this.map.dragRotate.disable();
    this.map.touchZoomRotate.disableRotation();
    this.map.keyboard.disable();
    this.applyPadding();
    this.map.on('load', () => void this.init(geoBase));
    this.map.on('zoom', () => this.onZoom());
    this.map.on('idle', () => this.declutter());
    this.map.on('render', () => {
      const now = performance.now();
      if (now - this.declutterAt > 250) {
        this.declutterAt = now;
        this.declutter();
      }
    });
  }

  private async init(geoBase: string) {
    const get = (f: string) => fetch(`${geoBase}${f}`).then((r) => r.json());
    const [regions, borders, rivers, lakes] = await Promise.all([get('regions.json'), get('borders.json'), get('rivers.json'), get('lakes.json')]);
    this.regions = regions.features;
    this.borders = borders.features.map((f: GeoJSON.Feature) => ({ id: f.id as number, ...(f.properties as { a: string; b: string }) }));
    const m = this.map;

    m.addSource('lakes', { type: 'geojson', data: lakes });
    m.addSource('rivers', { type: 'geojson', data: rivers });
    m.addSource('regions', { type: 'geojson', data: regions });
    m.addSource('borders', { type: 'geojson', data: borders });
    m.addLayer({ id: 'lakes', type: 'fill', source: 'lakes', paint: { 'fill-color': WATER, 'fill-opacity': 0.95 } });
    m.addLayer({
      id: 'rivers', type: 'line', source: 'rivers',
      paint: {
        'line-color': '#3f6f96',
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 1.5, 0.45, 5, 0.85],
        'line-width': ['interpolate', ['linear'], ['zoom'], 1.5, ['case', ['<=', ['get', 'rank'], 3], 0.9, 0.4], 6, ['case', ['<=', ['get', 'rank'], 3], 2.4, 1.2]],
      },
    });

    m.addImage('hatch-contested', hatch('rgba(255,120,70,0.9)', 8, 2.2), { pixelRatio: 2 });
    m.addImage('hatch-vassal', hatch('rgba(255,236,190,0.55)', 8, 1.2), { pixelRatio: 2 });

    m.addLayer({
      id: 'terr-fill', type: 'fill', source: 'regions',
      paint: { 'fill-color': ['coalesce', ['feature-state', 'color'], '#000'], 'fill-opacity': ['coalesce', ['feature-state', 'opacity'], 0], 'fill-antialias': false },
    });
    m.addLayer({
      id: 'terr-vassal', type: 'fill', source: 'regions',
      paint: { 'fill-pattern': 'hatch-vassal', 'fill-opacity': ['coalesce', ['feature-state', 'vassal'], 0] },
    });
    m.addLayer({
      id: 'terr-contested', type: 'fill', source: 'regions',
      paint: { 'fill-pattern': 'hatch-contested', 'fill-opacity': ['*', 0.75, ['coalesce', ['feature-state', 'contested'], 0]] },
    });
    m.addLayer({
      id: 'terr-flash', type: 'fill', source: 'regions',
      paint: { 'fill-color': '#ffd98a', 'fill-opacity': ['*', 0.55, ['coalesce', ['feature-state', 'flash'], 0]], 'fill-antialias': false },
    });
    m.addLayer({
      id: 'terr-hover', type: 'line', source: 'regions',
      paint: { 'line-color': '#fff4d8', 'line-width': 1.4, 'line-opacity': ['*', 0.8, ['coalesce', ['feature-state', 'hover'], 0]] },
    });
    // Frontiers: kind 1 = Mongol against the world, 2 = between khanates, 3 = between others.
    m.addLayer({
      id: 'frontier-glow', type: 'line', source: 'borders',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#ffb347',
        'line-blur': 6,
        'line-width': ['interpolate', ['linear'], ['zoom'], 1.5, 5, 6, 12],
        'line-opacity': ['match', ['coalesce', ['feature-state', 'kind'], 0], 1, 0.45, 0],
      },
    });
    m.addLayer({
      id: 'frontier', type: 'line', source: 'borders',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': ['match', ['coalesce', ['feature-state', 'kind'], 0], 1, '#ffd27a', 2, '#f7e3a8', '#d9d0bf'],
        'line-width': ['interpolate', ['linear'], ['zoom'], 1.5, ['match', ['coalesce', ['feature-state', 'kind'], 0], 1, 1.3, 0.6], 6, ['match', ['coalesce', ['feature-state', 'kind'], 0], 1, 2.6, 1.3]],
        'line-opacity': ['match', ['coalesce', ['feature-state', 'kind'], 0], 1, 0.95, 3, 0.32, 0],
      },
    });
    m.addLayer({
      id: 'frontier-khanate', type: 'line', source: 'borders',
      paint: {
        'line-color': '#f7e3a8',
        'line-width': ['interpolate', ['linear'], ['zoom'], 1.5, 1, 6, 2],
        'line-dasharray': [2, 2],
        'line-opacity': ['match', ['coalesce', ['feature-state', 'kind'], 0], 2, 0.9, 0],
      },
    });

    this.addEventLayers();
    this.addCities();
    this.bindPointer();
    this.ready = true;
    this.update(store.get().t, true);
    this.onReady?.();
  }

  private addEventLayers() {
    const m = this.map;
    const evs = this.war.events;
    for (const e of evs) {
      const key = `ev-${e.kind}-${e.outcome}-${e.geometry === 'area' ? 'a' : 'p'}`;
      if (!m.hasImage(key)) m.addImage(key, drawPin(e.kind, e.outcome, e.geometry === 'area'), { pixelRatio: 2 });
    }
    m.addSource('ev-areas', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: evs.filter((e) => e.geometry === 'area').map((e) => ({ type: 'Feature', id: e.index, properties: { outcome: e.outcome }, geometry: circlePolygon(e.lon, e.lat, e.radiusKm ?? 150) })),
      },
    });
    const pts: GeoJSON.Feature[] = evs.map((e) => ({
      type: 'Feature', id: e.index,
      properties: { icon: `ev-${e.kind}-${e.outcome}-${e.geometry === 'area' ? 'a' : 'p'}`, importance: e.importance, outcome: e.outcome, eid: e.id },
      geometry: { type: 'Point', coordinates: [e.lon, e.lat] },
    }));
    let mid = 0;
    const markers: GeoJSON.Feature[] = [];
    for (const e of evs) for (const mk of e.markers ?? []) markers.push({ type: 'Feature', id: mid++, properties: { parent: e.index, name: mk.name }, geometry: { type: 'Point', coordinates: [mk.lon, mk.lat] } });
    this.markerParents = markers.map((f) => (f.properties as { parent: number }).parent);
    m.addSource('ev-pts', { type: 'geojson', data: { type: 'FeatureCollection', features: pts } });
    m.addSource('ev-markers', { type: 'geojson', data: { type: 'FeatureCollection', features: markers } });

    const outcomeColor: maplibregl.ExpressionSpecification = ['match', ['get', 'outcome'], ...Object.entries(OUTCOME_COLORS).flat(), '#d8cfbf'] as unknown as maplibregl.ExpressionSpecification;
    const vis = ['coalesce', ['feature-state', 'vis'], 0] as maplibregl.ExpressionSpecification;
    const active = ['coalesce', ['feature-state', 'active'], 0] as maplibregl.ExpressionSpecification;

    m.addLayer({ id: 'ev-area-fill', type: 'fill', source: 'ev-areas', paint: { 'fill-color': outcomeColor, 'fill-opacity': ['+', ['*', vis, 0.06], ['*', active, 0.16]] } });
    m.addLayer({
      id: 'ev-area-line', type: 'line', source: 'ev-areas',
      paint: { 'line-color': outcomeColor, 'line-width': ['+', 1, ['*', active, 1]], 'line-dasharray': [3, 3], 'line-opacity': ['+', ['*', vis, 0.35], ['*', active, 0.55]] },
    });
    m.addLayer({
      id: 'ev-marker-dot', type: 'circle', source: 'ev-markers',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 2.5, 6, 4.5],
        'circle-color': '#fff1cf',
        'circle-stroke-color': '#1a140c',
        'circle-stroke-width': 1,
        'circle-opacity': ['coalesce', ['feature-state', 'vis'], 0],
        'circle-stroke-opacity': ['coalesce', ['feature-state', 'vis'], 0],
      },
    });
    m.addLayer({
      id: 'ev-pulse', type: 'circle', source: 'ev-pts',
      paint: {
        'circle-radius': ['+', 10, ['*', 34, ['coalesce', ['feature-state', 'pulse'], 0]], ['*', 8, ['get', 'importance']]],
        'circle-color': 'rgba(0,0,0,0)',
        'circle-stroke-color': outcomeColor,
        'circle-stroke-width': 2,
        'circle-stroke-opacity': ['*', active, ['-', 1, ['coalesce', ['feature-state', 'pulse'], 0]]],
        'circle-pitch-alignment': 'map',
      },
    });
    m.addLayer({
      id: 'ev-halo', type: 'circle', source: 'ev-pts',
      paint: {
        'circle-radius': ['+', 13, ['*', 3, ['get', 'importance']]],
        'circle-color': '#fff6dd',
        'circle-blur': 0.6,
        'circle-opacity': ['*', 0.5, ['max', ['coalesce', ['feature-state', 'sel'], 0], ['coalesce', ['feature-state', 'hover'], 0]]],
      },
    });
    m.addLayer({
      id: 'ev-past', type: 'circle', source: 'ev-pts',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, ['+', 1.6, ['*', 0.6, ['get', 'importance']]], 6, ['+', 3, ['get', 'importance']]],
        'circle-color': outcomeColor,
        'circle-stroke-color': 'rgba(10,8,4,0.8)',
        'circle-stroke-width': 1,
        'circle-opacity': ['*', 0.85, ['coalesce', ['feature-state', 'past'], 0]],
        'circle-stroke-opacity': ['coalesce', ['feature-state', 'past'], 0],
      },
    });
    m.addLayer({
      id: 'ev-icons', type: 'symbol', source: 'ev-pts',
      layout: {
        'icon-image': ['get', 'icon'],
        'icon-size': ['interpolate', ['linear'], ['zoom'], 1.5, ['match', ['get', 'importance'], 3, 0.62, 2, 0.5, 0.42], 6, ['match', ['get', 'importance'], 3, 0.95, 2, 0.8, 0.7]],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        'symbol-sort-key': ['get', 'importance'],
      },
      paint: { 'icon-opacity': vis },
    });
  }

  private markerParents: number[] = [];

  private addCities() {
    for (const c of this.war.cities) {
      const el = document.createElement('div');
      el.className = `city city-r${c.rank}`;
      el.innerHTML = `<span class="city-dot"></span><span class="city-name">${c.name}</span>`;
      if (c.modern) el.title = c.modern;
      const marker = new maplibregl.Marker({ element: el, anchor: 'left', offset: [-4, 0], opacityWhenCovered: '0' } as maplibregl.MarkerOptions).setLngLat([c.lon, c.lat]).addTo(this.map);
      this.cityMarkers.push({ marker, el, from: c.from ?? -Infinity, to: c.to ?? Infinity });
    }
    this.onZoom();
  }

  private onZoom() {
    const z = this.map.getZoom();
    this.map.getContainer().style.setProperty('--z', String(z));
    this.map.getContainer().classList.toggle('z-far', z < 2.6);
    this.map.getContainer().classList.toggle('z-near', z >= 3.0);
  }

  private bindPointer() {
    const m = this.map;
    let hoverEv: number | null = null;
    m.on('mousemove', (e) => {
      const hit = m.queryRenderedFeatures([[e.point.x - 5, e.point.y - 5], [e.point.x + 5, e.point.y + 5]], { layers: ['ev-icons', 'ev-past'] }).find((f) => { const s = this.evState.get(f.id as number); return (s?.vis ?? 0) > 0.05 || (s?.past ?? 0) > 0.05; });
      const ev = hit ? this.war.events[hit.id as number] : null;
      if ((ev?.index ?? null) !== hoverEv) {
        hoverEv = ev?.index ?? null;
        store.set({ hovered: ev?.id ?? null });
      }
      m.getCanvas().style.cursor = ev ? 'pointer' : '';
      this.onEventHover?.(ev, e.point);
      const reg = ev ? undefined : m.queryRenderedFeatures(e.point, { layers: ['terr-fill'] })[0];
      this.setRegionHover(reg, e.point);
    });
    m.on('mouseout', () => {
      store.set({ hovered: null });
      this.onEventHover?.(null);
      this.setRegionHover(undefined);
    });
    m.on('click', (e) => {
      const box: [maplibregl.PointLike, maplibregl.PointLike] = [[e.point.x - 8, e.point.y - 8], [e.point.x + 8, e.point.y + 8]];
      const hits = m.queryRenderedFeatures(box, { layers: ['ev-icons', 'ev-past'] }).filter((f) => { const s = this.evState.get(f.id as number); return (s?.vis ?? 0) > 0.05 || (s?.past ?? 0) > 0.05; });
      if (hits.length) {
        const best = hits.sort((a, b) => (b.properties.importance as number) - (a.properties.importance as number))[0];
        store.set({ selected: this.war.events[best.id as number].id });
        return;
      }
      const area = m.queryRenderedFeatures(e.point, { layers: ['ev-area-fill'] }).filter((f) => (this.evState.get(f.id as number)?.active ?? 0) > 0.5)[0];
      if (area) store.set({ selected: this.war.events[area.id as number].id });
      else store.set({ selected: null });
    });
  }

  private setRegionHover(f: MapGeoJSONFeature | undefined, point?: { x: number; y: number }) {
    const id = f ? (f.id as number) : null;
    if (id !== this.hoveredRegion) {
      if (this.hoveredRegion !== null) this.map.setFeatureState({ source: 'regions', id: this.hoveredRegion }, { hover: 0 });
      if (id !== null) this.map.setFeatureState({ source: 'regions', id }, { hover: 1 });
      this.hoveredRegion = id;
    }
    if (!f) return this.onRegionHover?.(null);
    const region = f.properties.region as string;
    const { step } = stepAt(this.war.timelines.get(region)!, store.get().t);
    this.onRegionHover?.({ region, name: f.properties.name as string, polity: this.war.polities.get(step.polity)!, status: step.status, since: step.t }, point);
  }

  /** Render the world at time t. Cheap enough to call every animation frame. */
  update(t: number, force = false) {
    if (!this.ready) return;
    const tChanged = force || t !== this.lastT;
    if (tChanged) {
      this.updateTerritory(t);
      this.updateCities(t);
    }
    this.updateEvents(t);
    this.lastT = t;
  }

  private updateTerritory(t: number) {
    const m = this.map;
    const P = this.war.polities;
    let ownerKey = '';
    const owners = new Map<string, { polity: string; status: Status }>();
    for (const f of this.regions) {
      const region = f.properties.region;
      const steps = this.war.timelines.get(region);
      if (!steps) continue;
      const { step, prev } = stepAt(steps, t);
      const k = prev ? ease(clamp01((t - step.t) / TRANSITION)) : 1;
      const cur = P.get(step.polity);
      const was = prev ? P.get(prev.polity) : cur;
      const color = mix(was!.color, cur!.color, k);
      const opacity = opacityFor(was, prev?.status ?? step.status) * (1 - k) + opacityFor(cur, step.status) * k;
      const gained = prev && isMongol(cur) && (!isMongol(was) || prev.status !== 'core') && step.status !== 'contested';
      const fresh = prev && (gained || (step.status === 'contested' && prev.status !== 'contested'));
      const flash = fresh ? Math.pow(clamp01(1 - (t - step.t) / FLASH), 2) * (t >= step.t ? 1 : 0) : 0;
      const contested = step.status === 'contested' ? k : prev?.status === 'contested' ? 1 - k : 0;
      const vassal = step.status === 'vassal' ? k : prev?.status === 'vassal' ? 1 - k : 0;
      const next: RegionState = { fid: f.id as number, polity: step.polity, status: step.status, color, opacity, flash, contested, vassal };
      const last = this.regionState.get(region);
      if (!last || last.color !== color || Math.abs(last.opacity - opacity) > 0.004 || Math.abs(last.flash - flash) > 0.01 || Math.abs(last.contested - contested) > 0.01 || Math.abs(last.vassal - vassal) > 0.01) {
        m.setFeatureState({ source: 'regions', id: f.id as number }, { color, opacity, flash, contested, vassal });
      }
      this.regionState.set(region, next);
      owners.set(region, { polity: step.polity, status: step.status });
      ownerKey += step.polity + step.status[0];
    }
    if (ownerKey !== this.ownerKey) {
      this.ownerKey = ownerKey;
      this.updateFrontiers(owners);
      this.updateLabels(owners);
    }
  }

  private updateFrontiers(owners: Map<string, { polity: string; status: Status }>) {
    const P = this.war.polities;
    for (const b of this.borders) {
      const A = owners.get(b.a);
      const B = owners.get(b.b);
      let kind = 0;
      if (A && B && A.polity !== B.polity) {
        const ma = isMongol(P.get(A.polity));
        const mb = isMongol(P.get(B.polity));
        kind = ma !== mb ? 1 : ma && mb ? 2 : 3;
      }
      if (this.borderKind.get(b.id) !== kind) {
        this.borderKind.set(b.id, kind);
        this.map.setFeatureState({ source: 'borders', id: b.id }, { kind });
      }
    }
  }

  private updateLabels(owners: Map<string, { polity: string; status: Status }>) {
    const groups = new Map<string, RegionFeature[]>();
    for (const f of this.regions) {
      const o = owners.get(f.properties.region);
      if (!o) continue;
      if (!groups.has(o.polity)) groups.set(o.polity, []);
      groups.get(o.polity)!.push(f);
    }
    const seen = new Set<string>();
    for (const [pid, fs] of groups) {
      const area = fs.reduce((s, f) => s + f.properties.areaKm2, 0);
      const vw = window.innerWidth;
      if (area < (vw < 720 ? 350000 : 90000)) continue;
      // Area-weighted centre, snapped to the nearest region label point so it sits inside the polity.
      let x = 0, y = 0;
      for (const f of fs) {
        x += f.properties.labelLon * f.properties.areaKm2;
        y += f.properties.labelLat * f.properties.areaKm2;
      }
      x /= area;
      y /= area;
      const anchor = fs.reduce((best, f) => {
        const d = (f.properties.labelLon - x) ** 2 + (f.properties.labelLat - y) ** 2 - Math.log(f.properties.areaKm2) * 2;
        return d < best.d ? { f, d } : best;
      }, { f: fs[0], d: Infinity }).f;
      const pol = this.war.polities.get(pid)!;
      const scale = Math.max(0.55, Math.min(1, vw / 1200));
      const size = Math.max(9, Math.min(30, 5 + Math.sqrt(area) / 90) * scale);
      let entry = this.labels.get(pid);
      if (!entry) {
        // MapLibre writes inline opacity on the marker element, so styling lives on a child.
        const wrap = document.createElement('div');
        const el = document.createElement('div');
        el.className = `polity-label${isMongol(pol) ? ' is-mongol' : ''}`;
        el.textContent = pol.name;
        wrap.appendChild(el);
        const marker = new maplibregl.Marker({ element: wrap, anchor: 'center', opacityWhenCovered: '0' } as maplibregl.MarkerOptions).setLngLat([anchor.properties.labelLon, anchor.properties.labelLat]).addTo(this.map);
        entry = { marker, el, area, shown: true };
        this.labels.set(pid, entry);
        requestAnimationFrame(() => el.classList.add('shown'));
      } else {
        entry.marker.setLngLat([anchor.properties.labelLon, anchor.properties.labelLat]);
        entry.el.classList.add('shown');
      }
      entry.area = area;
      entry.shown = true;
      entry.el.style.setProperty('--size', `${size.toFixed(1)}px`);
      seen.add(pid);
    }
    for (const [pid, entry] of this.labels)
      if (!seen.has(pid)) {
        entry.shown = false;
        entry.el.classList.remove('shown');
      }
    requestAnimationFrame(() => this.declutter());
  }

  /** Hide smaller polity labels that would overlap a larger one on screen. */
  private declutter() {
    const placed: DOMRect[] = [];
    const list = [...this.labels.values()].filter((l) => l.shown).sort((a, b) => b.area - a.area);
    const view = this.map.getContainer().getBoundingClientRect();
    for (const l of list) {
      const r = l.el.getBoundingClientRect();
      const pad = 4;
      const hit = r.width === 0 || placed.some((p) => r.left - pad < p.right && r.right + pad > p.left && r.top - pad < p.bottom && r.bottom + pad > p.top);
      const off = r.right < view.left || r.left > view.right;
      l.el.classList.toggle('collide', hit && !off);
      if (!hit) placed.push(r);
    }
  }

  private updateCities(t: number) {
    for (const c of this.cityMarkers) c.el.classList.toggle('gone', t < c.from || t >= c.to);
  }

  private updateEvents(t: number) {
    const { selected, hovered, showPast } = store.get();
    const now = performance.now() / 1000;
    for (const e of this.war.events) {
      const appear = clamp01((t - e.t0 + 0.06) / 0.06);
      let vis = 0;
      let active = 0;
      let past = 0;
      if (t >= e.t0 - 0.06) {
        if (t <= e.t1) {
          vis = appear;
          active = appear;
        } else {
          // After an event ends its badge lingers a little, then settles to a small dot.
          const since = t - e.t1;
          active = clamp01(1 - since / 0.35);
          vis = clamp01(1 - since / 2.5) * (0.5 + 0.5 * active);
          past = showPast ? 1 - vis : 0;
        }
      }
      const sel = selected === e.id ? 1 : 0;
      if (sel) {
        vis = 1;
        past = 0;
      }
      const hover = hovered === e.id ? 1 : 0;
      const pulse = active > 0 ? ((now * 0.7 + e.index * 0.137) % 1) : 0;
      const last = this.evState.get(e.index);
      if (last && Math.abs(last.vis - vis) < 0.005 && Math.abs(last.past - past) < 0.005 && Math.abs(last.active - active) < 0.005 && last.sel === sel && last.hover === hover && (active === 0 || Math.abs(last.pulse - pulse) < 0.01)) continue;
      const st = { vis, active, sel, hover, pulse, past };
      this.evState.set(e.index, st);
      this.map.setFeatureState({ source: 'ev-pts', id: e.index }, st);
      if (e.geometry === 'area') this.map.setFeatureState({ source: 'ev-areas', id: e.index }, { vis, active });
    }
    this.markerParents.forEach((p, i) => {
      const s = this.evState.get(p);
      const v = s ? Math.max(s.active, s.sel) : 0;
      this.map.setFeatureState({ source: 'ev-markers', id: i }, { vis: v });
    });
  }

  /** Area in km² of regions held or tributary to a Mongol polity at time t. */
  mongolArea(t: number) {
    let km2 = 0;
    for (const f of this.regions) {
      const steps = this.war.timelines.get(f.properties.region);
      if (!steps) continue;
      const { step } = stepAt(steps, t);
      if (isMongol(this.war.polities.get(step.polity)) && step.status !== 'contested') km2 += f.properties.areaKm2;
    }
    return km2;
  }

  hasActivePulses() {
    for (const s of this.evState.values()) if (s.active > 0) return true;
    return false;
  }

  flyToEvent(e: AtlasEvent) {
    const z = this.map.getZoom();
    const zoom = e.geometry === 'area' ? Math.max(3.4, Math.min(5.2, 8.6 - Math.log2(e.radiusKm ?? 200))) : Math.max(z, 4.6);
    const small = window.innerWidth < 720;
    this.map.flyTo({
      center: [e.lon, e.lat], zoom, duration: 1800, essential: true, curve: 1.3,
      padding: small ? { top: 60, bottom: window.innerHeight * 0.5, left: 0, right: 0 } : { top: 0, bottom: 140, left: window.innerWidth > 1100 ? 340 : 300, right: 440 },
    });
  }

  flyToPhase(t: number, duration = 2600) {
    const p = phaseAt(this.war.phases, t);
    const small = window.innerWidth < 720;
    this.map.flyTo({ center: p.camera.center, zoom: p.camera.zoom - (small ? 0.8 : 0), duration, essential: true, curve: 1.2 });
  }

  /** Keep the globe's centre clear of the left-hand clock and bottom timeline. */
  applyPadding() {
    const small = window.innerWidth < 720;
    this.map.setPadding(small ? { top: 120, bottom: 110, left: 0, right: 0 } : { top: 0, bottom: 120, left: window.innerWidth > 1100 ? 340 : 300, right: 0 });
  }

  resize() {
    this.map.resize();
    this.applyPadding();
  }
}
