import { useEffect, useState } from 'react';
import type { AtlasEvent, WarData } from '../data/war';
import { formatDate } from '../data/time';
import { KIND_LABEL, OUTCOME_COLORS, pinDataUrl } from '../map/icons';
import { store } from '../store';
import { commonsSrc, pictureReady } from './pictures';

/**
 * A key event flicking up during playback: a picture card when the event has a
 * picture that has loaded, otherwise a line of text above the timeline. The card
 * it replaces stays a moment longer, sliding away, so each change reads as a step.
 */
export function Flash({ ev, war }: { ev: AtlasEvent; war: WarData }) {
  const [gone, setGone] = useState<AtlasEvent | null>(null);
  const [cur, setCur] = useState(ev);
  if (cur.id !== ev.id) {
    setGone(cur);
    setCur(ev);
  }
  useEffect(() => {
    if (!gone) return;
    const id = setTimeout(() => setGone(null), 700);
    return () => clearTimeout(id);
  }, [gone]);
  return (
    <>
      {gone && <Card ev={gone} war={war} leaving />}
      <Card ev={cur} war={war} />
    </>
  );
}

function Card({ ev, war, leaving }: { ev: AtlasEvent; war: WarData; leaving?: boolean }) {
  const open = () => store.set({ selected: ev.id, playing: false });
  const outcome = war.text.outcome[ev.outcome];
  if (!pictureReady(ev.image))
    return (
      <button className={`headline${leaving ? ' leaving' : ''}`} key={ev.id} onClick={open}>
        <img src={pinDataUrl(ev.kind, ev.outcome, ev.geometry === 'area')} alt="" width={30} height={30} />
        <span>
          <b>{ev.title}</b>
          <em>{ev.summary}</em>
        </span>
      </button>
    );
  // Alternate a slight tilt so a run of cards looks like prints laid on a table.
  const tilt = ev.index % 2 ? 1.6 : -1.4;
  return (
    <button
      className={`flash${leaving ? ' leaving' : ''}${ev.importance === 3 ? ' major' : ''}`}
      key={ev.id}
      onClick={open}
      style={{ '--tilt': `${tilt}deg`, '--accent': OUTCOME_COLORS[ev.outcome] } as React.CSSProperties}
      aria-label={`${ev.title}: open the event`}
    >
      <span className="flash-photo">
        <img src={commonsSrc(ev.image!)} alt={ev.image!.caption} />
        <span className="flash-date">{formatDate(ev.start, ev.datePrecision)}</span>
      </span>
      <span className="flash-text">
        <span className="flash-kind">
          {KIND_LABEL[ev.kind]}
          {outcome && <i> · {outcome}</i>}
        </span>
        <b>{ev.title}</b>
        <em>{ev.summary}</em>
        <span className="flash-more">Read more →</span>
      </span>
    </button>
  );
}

/** The pictures already shown on this run through the war, newest first. */
export function Reel({ events, t }: { events: AtlasEvent[]; t: number }) {
  const shown = events.filter((e) => e.t0 <= t + 1e-6 && pictureReady(e.image)).slice(-5).reverse();
  if (!shown.length) return null;
  return (
    <div className="reel" aria-label="Recent events">
      {shown.map((e, i) => (
        <button
          key={e.id}
          className="reel-item"
          style={{ opacity: 1 - i * 0.13 } as React.CSSProperties}
          onClick={() => store.set({ selected: e.id, t: e.t0 + 0.001, playing: false })}
          title={`${e.title}, ${formatDate(e.start, e.datePrecision)}`}
        >
          <img src={commonsSrc(e.image!)} alt="" />
        </button>
      ))}
    </div>
  );
}
