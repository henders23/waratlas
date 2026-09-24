import { useEffect, useMemo, useRef, useState } from 'react';
import { WARS, isFocus, phaseAt, stepAt, type AtlasEvent, type WarData } from '../data/war';
import { formatDate } from '../data/time';
import { KIND_LABEL, OUTCOME_COLORS, pinDataUrl } from '../map/icons';
import { store, useAtlas } from '../store';
import type { EventKind } from '../data/schema';

export function Header({ war, onSwitch }: { war: WarData; onSwitch: (id: string | null) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, []);
  return (
    <div className="header" ref={ref}>
      <button className="war-pick" onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="listbox">
        <span className="kicker">Atlas of Wars</span>
        <span className="war-title">
          {war.title} <small>{war.subtitle}</small>
          <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
        </span>
      </button>
      {open && (
        <ul className="war-menu" role="listbox">
          {WARS.map((w) => (
            <li
              key={w.id}
              role="option"
              aria-selected={w.id === war.id}
              aria-disabled={!w.load}
              className={w.load ? (w.id === war.id ? 'on' : '') : 'soon'}
              onClick={() => {
                if (!w.load) return;
                setOpen(false);
                if (w.id !== war.id) onSwitch(w.id);
              }}
            >
              <b>{w.title}</b>
              <span>{w.span}</span>
              {!w.load && <em>in research</em>}
            </li>
          ))}
          <li role="option" aria-selected={false} className="all" onClick={() => onSwitch(null)}>
            <b>All wars</b>
            <span>Back to the start</span>
          </li>
        </ul>
      )}
    </div>
  );
}

export function Clock({ war, focusKm2 }: { war: WarData; focusKm2: number }) {
  const t = useAtlas((s) => s.t);
  const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][Math.min(11, Math.floor((t % 1) * 12))];
  const phase = phaseAt(war.phases, t);
  const reign = war.reigns.find((r) => t >= r.from && t < r.to);
  const chapter = war.phases.indexOf(phase) + 1;
  return (
    <div className="clock" aria-live="off">
      <div className="clock-month">{month}</div>
      <div className="clock-year">{Math.floor(t)}</div>
      <div className="clock-meta">
        <span>{reign ? war.text.reign(reign) : war.text.noReign}</span>
        <span className="dot">·</span>
        <span>
          <AnimatedNumber value={focusKm2 / 1e6} digits={war.text.areaDigits} /> {war.text.area}
        </span>
      </div>
      <div className="chapter" key={phase.id}>
        <span className="chapter-n">Chapter {chapter} of {war.phases.length}</span>
        <h3>{phase.title}</h3>
        <p>{phase.story}</p>
      </div>
    </div>
  );
}

const CAPTURE = new URLSearchParams(location.search).has('capture');

function AnimatedNumber({ value, digits }: { value: number; digits: number }) {
  const [shown, setShown] = useState(value);
  const cur = useRef(value);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      cur.current += (value - cur.current) * (CAPTURE ? 1 : 0.18);
      if (Math.abs(value - cur.current) < 0.005) cur.current = value;
      setShown(cur.current);
      if (cur.current !== value) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <b className="num">{shown.toFixed(digits)}</b>;
}

export function Chronicle({ war }: { war: WarData }) {
  const t = useAtlas((s) => s.t);
  const selected = useAtlas((s) => s.selected);
  const [q, setQ] = useState('');
  const list = useRef<HTMLOListElement>(null);
  const current = useMemo(() => {
    let idx = -1;
    for (const e of war.events) if (e.t0 <= t) idx = e.index;
    return idx;
  }, [t, war]);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? war.events.filter((e) => (e.title + ' ' + e.place + ' ' + e.summary).toLowerCase().includes(s)) : war.events;
  }, [q, war]);
  useEffect(() => {
    if (q) return;
    const el = list.current?.querySelector<HTMLElement>(`[data-i="${current}"]`);
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [current, q]);
  let lastPhase = '';
  return (
    <aside className="panel chronicle" aria-label="Chronicle of events">
      <header>
        <h2>Chronicle</h2>
        <span className="count">{war.events.length} events</span>
        <button className="close" onClick={() => store.set({ panel: null })} aria-label="Close">×</button>
        <input type="search" placeholder="Search battles, cities, people…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search events" />
      </header>
      <ol ref={list}>
        {filtered.map((e) => {
          const ph = war.phases.find((p) => p.id === e.phase);
          const heading = !q && ph && ph.id !== lastPhase ? ph : null;
          if (heading) lastPhase = heading.id;
          return (
            <li key={e.id} data-i={e.index} className={`${e.t0 <= t ? 'past' : 'future'}${e.index === current ? ' now' : ''}${e.id === selected ? ' sel' : ''}`}>
              {heading && <h4>{heading.title}</h4>}
              <button onClick={() => store.set({ selected: e.id, t: e.t0 + 0.001, playing: false })}>
                <img src={pinDataUrl(e.kind, e.outcome, e.geometry === 'area')} alt="" width={22} height={22} />
                <span className="c-date">{formatDate(e.start, e.datePrecision)}</span>
                <span className="c-title">{e.title}</span>
                {e.importance === 3 && <span className="c-star" aria-label="major">✦</span>}
              </button>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

export function Legend({ war }: { war: WarData }) {
  const [open, setOpen] = useState(false);
  const t = useAtlas((s) => s.t);
  // The focus side's polities that hold ground right now, largest first.
  const focus = useMemo(() => {
    const held = new Map<string, number>();
    for (const steps of war.timelines.values()) {
      const { step } = stepAt(steps, t);
      if (isFocus(war.polities.get(step.polity))) held.set(step.polity, (held.get(step.polity) ?? 0) + 1);
    }
    return [...held.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => war.polities.get(id)!);
  }, [war, Math.round(t * 12)]); // eslint-disable-line react-hooks/exhaustive-deps
  const kinds: EventKind[] = ['battle', 'siege', 'sack', 'political', 'treaty', 'death', 'naval', 'campaign'];
  return (
    <div className={`legend${open ? ' open' : ''}`}>
      <button className="legend-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        Key
      </button>
      {open && (
        <div className="legend-body">
          <div className="lg-group">
            {focus.map((p) => (
              <div key={p.id} className="lg-row">
                <i className="sw" style={{ background: p.color }} /> {p.name}
              </div>
            ))}
            <div className="lg-row"><i className="sw sw-other" /> Other states</div>
            <div className="lg-row"><i className="sw sw-vassal" /> {war.text.vassal}</div>
            <div className="lg-row"><i className="sw sw-contested" /> Contested or at war</div>
            <div className="lg-row"><i className="ln ln-front" /> {war.text.focusFrontier}</div>
          </div>
          <div className="lg-group">
            <div className="lg-row"><i className="dotc" style={{ background: OUTCOME_COLORS.victory }} /> {war.text.outcome.victory}</div>
            <div className="lg-row"><i className="dotc" style={{ background: OUTCOME_COLORS.defeat }} /> {war.text.outcome.defeat}</div>
            <div className="lg-row"><i className="dotc" style={{ background: OUTCOME_COLORS.inconclusive }} /> Other outcome</div>
            <div className="lg-row"><img src={pinDataUrl('campaign', 'victory', true)} alt="" width={18} height={18} /> Dashed: region only, no point</div>
          </div>
          <div className="lg-group lg-kinds">
            {kinds.map((k) => (
              <div key={k} className="lg-row"><img src={pinDataUrl(k, 'n/a', false)} alt="" width={18} height={18} /> {KIND_LABEL[k]}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Headline({ ev }: { ev: AtlasEvent }) {
  return (
    <button className="headline" key={ev.id} onClick={() => store.set({ selected: ev.id, playing: false })}>
      <img src={pinDataUrl(ev.kind, ev.outcome, ev.geometry === 'area')} alt="" width={30} height={30} />
      <span>
        <b>{ev.title}</b>
        <em>{ev.summary}</em>
      </span>
    </button>
  );
}

export function About({ war, onClose }: { war: WarData; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  const counts = {
    city: war.events.filter((e) => e.geometry === 'city').length,
    site: war.events.filter((e) => e.geometry === 'site').length,
    area: war.events.filter((e) => e.geometry === 'area').length,
  };
  return (
    <dialog ref={ref} className="about" onClose={onClose} onClick={(e) => e.target === ref.current && ref.current?.close()}>
      <button className="close" onClick={() => ref.current?.close()} aria-label="Close">×</button>
      <h2>About this atlas</h2>
      {war.id === 'napoleonic' ? (
        <NapoleonicAbout war={war} counts={counts} />
      ) : war.id === 'ww1' ? (
        <Ww1About war={war} counts={counts} />
      ) : (
        <MongolAbout war={war} counts={counts} />
      )}
      <h3>Keyboard</h3>
      <p className="keys">
        <kbd>Space</kbd> play or pause · <kbd>←</kbd> <kbd>→</kbd> a month · <kbd>Shift</kbd>+<kbd>←</kbd> <kbd>→</kbd> a year ·{' '}
        <kbd>[</kbd> <kbd>]</kbd> previous or next event · <kbd>C</kbd> chronicle · <kbd>Esc</kbd> close
      </p>
      <h3>Credits</h3>
      <p className="credits">
        Relief from AWS Terrain Tiles (Mapzen, SRTM, ETOPO1, GMTED). Coastlines, rivers and provinces from Natural Earth. Rendered with MapLibre GL.
        {war.id === 'mongol' && ' Research pack by Instinct.'}
      </p>
    </dialog>
  );
}

type Counts = { city: number; site: number; area: number };

function MongolAbout({ war, counts }: { war: WarData; counts: Counts }) {
  return (
    <>
      <p>
        Drag the timeline, or press play, to watch eighty-eight years of Mongol expansion
        between Chinggis Qan’s enthronement in 1206 and Qubilai’s death in 1294. Click any marker for the event behind it.
      </p>
      <h3>What the markers are</h3>
      <p>
        Every one of the {war.events.length} events is a row marked <i>include</i> in the Instinct research pack for the Mongol conquests
        (round 71, a fixed list of 109 candidates). The pack decides how precisely each event may be drawn. {counts.city} are pinned to a
        named city and {counts.site} to an approximately placed battle locality. The other {counts.area} are drawn as dashed regions,
        because their sources support a place but not a point. Each card cites the pack’s primary locators first, then further reading.
        The prose is our own synthesis; no translation is quoted.
      </p>
      <h3>What the colours are</h3>
      <p>{war.territoryNote}</p>
      <p>
        Army routes are deliberately left out. The pack rejects inferred route lines, and a confident arrow across a steppe would claim more than
        the chronicles do.
      </p>
    </>
  );
}

function NapoleonicAbout({ war, counts }: { war: WarData; counts: Counts }) {
  return (
    <>
      <p>
        Drag the timeline, or press play, to watch twenty-three years of war between revolutionary and
        imperial France and the rest of Europe, from the declaration of war on Austria in April 1792 to Napoleon’s surrender and exile in 1815.
        Click any marker for the event behind it.
      </p>
      <h3>What the markers are</h3>
      <p>
        The {war.events.length} events are the battles, sieges, treaties and turns of politics that shaped the wars, chosen and written for
        this atlas from the standard military and diplomatic histories. {counts.city} are pinned to a named city and {counts.site} to a
        battlefield. The other {counts.area} are campaigns or risings with no single place, drawn as dashed regions. Pins are gold for
        French victories and red for French defeats. Strengths and losses are consensus figures and are often disputed; each card says so
        where it matters, and lists its sources.
      </p>
      <h3>What the colours are</h3>
      <p>{war.territoryNote}</p>
      <p>
        Army routes are left out. A confident arrow across a map implies a precision that the wider story of a campaign rarely has, and
        the Mongol atlas beside this one draws none either.
      </p>
    </>
  );
}

function Ww1About({ war, counts }: { war: WarData; counts: Counts }) {
  return (
    <>
      <p>
        Drag the timeline, or press play, to follow the First World War from the assassination at Sarajevo on
        28 June 1914 to the armistice of 11 November 1918, and on through the collapse of the empires to the Treaty of Versailles on
        28 June 1919. Click any marker for the event behind it.
      </p>
      <h3>What the markers are</h3>
      <p>
        The {war.events.length} events are the battles, campaigns, treaties, revolutions and atrocities that shaped the war, chosen and written
        for this atlas from the standard histories. {counts.city} are pinned to a named city and {counts.site} to a battlefield or a position
        at sea. The other {counts.area} are campaigns and fronts with no single place, drawn as dashed regions. Pins are amber when the
        Central Powers won and blue when the Allies did. Casualty figures for the great battles are fiercely disputed; each card gives a
        consensus range, says where it is contested and lists its sources.
      </p>
      <h3>What the colours are</h3>
      <p>{war.territoryNote}</p>
      <p>
        The strong colours follow the Central Powers because the ground they held and occupied is what changed most: the map shows their
        armies’ reach growing to its peak in the summer of 1918 and vanishing within months. It is a way of drawing the fronts, not a side taken.
      </p>
    </>
  );
}
