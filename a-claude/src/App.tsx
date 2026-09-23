import { useEffect, useMemo, useRef, useState } from 'react';
import { AtlasMap, type RegionInfo } from './map/AtlasMap';
import { loadMongol, phaseAt, type AtlasEvent } from './data/war';
import { store, useAtlas } from './store';
import { Timeline } from './ui/Timeline';
import { EventPanel } from './ui/EventPanel';
import { About, Chronicle, Clock, Header, Headline, Legend } from './ui/Panels';
import { formatDate } from './data/time';

const war = loadMongol();
const HEADLINE_SECONDS = 3.4;
// ?capture renders deterministic frames for video: no CSS animation, no easing.
const capture = new URLSearchParams(location.search).has('capture');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function readHash() {
  const h = new URLSearchParams(location.hash.slice(1));
  const t = Number(h.get('t'));
  const e = h.get('e');
  return { t: Number.isFinite(t) && t >= war.from && t <= war.to ? t : null, e: e && war.events.some((x) => x.id === e) ? e : null };
}

export function App() {
  const mapEl = useRef<HTMLDivElement>(null);
  const atlas = useRef<AtlasMap | null>(null);
  const [ready, setReady] = useState(false);
  const [intro, setIntro] = useState(true);
  const [regionTip, setRegionTip] = useState<{ info: RegionInfo; x: number; y: number } | null>(null);
  const [evTip, setEvTip] = useState<{ ev: AtlasEvent; x: number; y: number } | null>(null);
  const [area, setArea] = useState(0);
  const selected = useAtlas((s) => s.selected);
  const headline = useAtlas((s) => s.headline);
  const panel = useAtlas((s) => s.panel);
  const playing = useAtlas((s) => s.playing);
  const t = useAtlas((s) => s.t);
  const byId = useMemo(() => new Map(war.events.map((e) => [e.id, e])), []);
  const selEv = selected ? byId.get(selected) : undefined;

  // Map lifecycle.
  useEffect(() => {
    const base = `${import.meta.env.BASE_URL}geo/`;
    const a = new AtlasMap(mapEl.current!, war, base);
    atlas.current = a;
    Object.assign(window, { __atlas: a, __store: store, __war: war });
    a.onReady = () => {
      setReady(true);
      setArea(a.mongolArea(store.get().t));
    };
    a.onRegionHover = (info, p) => setRegionTip(info && p ? { info, x: p.x, y: p.y } : null);
    a.onEventHover = (ev, p) => setEvTip(ev && p ? { ev, x: p.x, y: p.y } : null);
    const { t: ht, e } = readHash();
    if (e) {
      const ev = byId.get(e)!;
      store.set({ t: ev.t0 + 0.001, selected: e });
      setIntro(false);
    } else if (ht) {
      store.set({ t: ht });
      setIntro(false);
    }
    const onResize = () => a.resize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      a.map.remove();
    };
  }, [byId]);

  // The animation loop: advance time while playing, render the map every frame.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let dwell = 0;
    let headlineUntil = 0;
    let prevT = store.get().t;
    let prevPhase = phaseAt(war.phases, prevT).id;
    let areaAt = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      const s = store.get();
      let t = s.t;
      if (s.playing && !capture) {
        const slow = dwell > 0 ? 0.22 : 1;
        dwell = Math.max(0, dwell - dt);
        t = Math.min(war.to, t + dt * s.speed * slow);
        // Announce significant events as the playhead crosses them.
        const crossed = war.events.filter((e) => e.t0 > prevT && e.t0 <= t && e.importance >= 2);
        if (crossed.length) {
          const top = crossed.sort((a, b) => b.importance - a.importance)[0];
          store.set({ headline: top.id });
          headlineUntil = now + HEADLINE_SECONDS * 1000;
          if (top.importance === 3) dwell = 1.4;
        }
        const ph = phaseAt(war.phases, t).id;
        if (ph !== prevPhase && s.autoCamera && !reduceMotion) atlas.current?.flyToPhase(t);
        prevPhase = ph;
        store.set({ t, playing: t < war.to });
      } else {
        prevPhase = phaseAt(war.phases, t).id;
      }
      if (s.headline && now > headlineUntil && !capture) store.set({ headline: null });
      prevT = t;
      // Screenshot tooling sets __freeze so software renderers can settle a frame.
      if (!(window as { __freeze?: boolean }).__freeze) atlas.current?.update(t);
      if (now - areaAt > 120 && atlas.current) {
        areaAt = now;
        setArea(atlas.current.mongolArea(t));
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Fly to a selected event and keep the URL shareable.
  useEffect(() => {
    if (selEv && ready && !capture) atlas.current?.flyToEvent(selEv);
  }, [selEv, ready]);
  useEffect(() => {
    if (playing) return;
    const h = selected ? `e=${selected}` : `t=${t.toFixed(2)}`;
    const id = setTimeout(() => history.replaceState(null, '', `#${h}`), 250);
    return () => clearTimeout(id);
  }, [t, selected, playing]);

  // Keyboard.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, dialog')) return;
      const s = store.get();
      const seek = (d: number) => store.set({ t: Math.max(war.from, Math.min(war.to, s.t + d)), playing: false });
      if (e.key === ' ') {
        e.preventDefault();
        store.set({ playing: !s.playing, selected: null });
        setIntro(false);
      } else if (e.key === 'ArrowRight') seek(e.shiftKey ? 1 : 1 / 12);
      else if (e.key === 'ArrowLeft') seek(e.shiftKey ? -1 : -1 / 12);
      else if (e.key === 'Home') seek(-Infinity);
      else if (e.key === 'End') seek(Infinity);
      else if (e.key === ']' || e.key === '[') {
        const cur = s.selected ? byId.get(s.selected)!.index : war.events.filter((x) => x.t0 <= s.t).length - (e.key === ']' ? 1 : 0);
        const next = war.events[Math.max(0, Math.min(war.events.length - 1, cur + (e.key === ']' ? 1 : -1)))];
        store.set({ selected: next.id, t: next.t0 + 0.001, playing: false });
      } else if (e.key === 'Escape') store.set({ selected: null, panel: null });
      else if (e.key.toLowerCase() === 'c') store.set({ panel: s.panel === 'chronicle' ? null : 'chronicle' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [byId]);

  const seek = (tt: number) => {
    store.set({ t: tt });
    setIntro(false);
  };
  const begin = () => {
    setIntro(false);
    store.set({ t: war.from, playing: true, selected: null });
    atlas.current?.flyToPhase(war.from, 3200);
  };
  const headEv = headline ? byId.get(headline) : undefined;

  return (
    <div className={`app${capture ? ' capture' : ''}${selEv || panel === 'chronicle' ? ' has-panel' : ''}${ready ? ' ready' : ''}`}>
      <div className="map" ref={mapEl} />
      <div className="vignette" />
      <Header war={war} />
      <Clock war={war} empireKm2={area} />
      <nav className="tools">
        <button className={panel === 'chronicle' ? 'on' : ''} onClick={() => store.set({ panel: panel === 'chronicle' ? null : 'chronicle', selected: null })}>
          Chronicle
        </button>
        <button onClick={() => store.set({ panel: 'about' })}>About</button>
        <label className="toggle" title="Follow the action while playing">
          <input type="checkbox" defaultChecked onChange={(e) => store.set({ autoCamera: e.target.checked })} /> Follow
        </label>
      </nav>
      {selEv ? <EventPanel ev={selEv} war={war} onClose={() => store.set({ selected: null })} /> : panel === 'chronicle' ? <Chronicle war={war} /> : null}
      {panel === 'about' && <About war={war} onClose={() => store.set({ panel: null })} />}
      {headEv && !selEv && <Headline ev={headEv} />}
      <Legend war={war} />
      <Timeline war={war} onSeek={seek} />
      {regionTip && !evTip && (
        <div className="tip region-tip" style={{ left: regionTip.x, top: regionTip.y }}>
          <b>{regionTip.info.name}</b>
          <span>
            <i className="sw" style={{ background: regionTip.info.polity.color }} />
            {regionTip.info.status === 'contested' ? 'Contested — ' : regionTip.info.status === 'vassal' ? 'Tributary to ' : ''}
            {regionTip.info.polity.name}
            {regionTip.info.since > war.from && <em> since {Math.floor(regionTip.info.since)}</em>}
          </span>
        </div>
      )}
      {evTip && (
        <div className="tip ev-tip" style={{ left: evTip.x, top: evTip.y }}>
          <b>{evTip.ev.title}</b>
          <span>{formatDate(evTip.ev.start, evTip.ev.datePrecision)} · {evTip.ev.place}</span>
        </div>
      )}
      {intro && (
        <div className="intro">
          <div className="intro-card">
            <span className="kicker">An exhibit from Qing’s Workshop</span>
            <h1>The Mongol Conquests</h1>
            <p className="intro-dates">1206 – 1294</p>
            <p>
              In eighty-eight years the armies of Chinggis Qan and his heirs rode from the Onon River to the Danube, the Euphrates and the South
              China Sea. Watch them spread and fracture, and open {war.events.length} researched events along the way.
            </p>
            <div className="intro-actions">
              <button className="primary" onClick={begin} disabled={!ready}>
                {ready ? 'Play the conquests' : 'Loading the world…'}
              </button>
              <button onClick={() => setIntro(false)}>Explore freely</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
