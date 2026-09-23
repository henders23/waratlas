import type { AtlasEvent, WarData } from '../data/war';
import { formatRange } from '../data/time';
import { KIND_LABEL, OUTCOME_COLORS, pinDataUrl } from '../map/icons';
import { store } from '../store';

const CERTAINTY_TEXT: Record<string, string> = {
  high: 'Well attested',
  medium: 'Partly disputed',
  low: 'Highly uncertain',
};

const GEOMETRY_TEXT: Record<string, string> = {
  city: 'Located at a named city',
  site: 'Battle locality, approximately placed',
  area: 'Region only: the sources support no single point',
};

export function EventPanel({ ev, war, onClose }: { ev: AtlasEvent; war: WarData; onClose: () => void }) {
  const i = ev.index;
  const prev = war.events[i - 1];
  const next = war.events[i + 1];
  const go = (e?: AtlasEvent) => e && store.set({ selected: e.id, t: e.t0 + 0.001, playing: false });
  return (
    <aside className="panel event-panel" aria-label={ev.title} key={ev.id}>
      <header>
        <div className="ev-kicker">
          <img src={pinDataUrl(ev.kind, ev.outcome, ev.geometry === 'area')} alt="" width={26} height={26} />
          <span>{KIND_LABEL[ev.kind]}</span>
          {war.text.outcome[ev.outcome] && (
            <span className="ev-outcome" style={{ color: OUTCOME_COLORS[ev.outcome] }}>
              · {war.text.outcome[ev.outcome]}
            </span>
          )}
        </div>
        <button className="close" onClick={onClose} aria-label="Close">×</button>
        <h2>{ev.title}</h2>
        <p className="ev-when">
          {formatRange(ev.start, ev.end, ev.datePrecision)} · {ev.place}
        </p>
      </header>
      <div className="ev-body">
        <p className="ev-summary">{ev.summary}</p>
        <div className="ev-sides">
          <div>
            <span className="lbl">{war.text.focusSide}</span>
            <b>{ev.sides.focus}</b>
            {ev.commanders?.focus?.length ? <span>{ev.commanders.focus.join(', ')}</span> : null}
            {ev.strength?.focus && <em>{ev.strength.focus}</em>}
          </div>
          <div>
            <span className="lbl">Opponent</span>
            <b>{ev.sides.opponent}</b>
            {ev.commanders?.opponent?.length ? <span>{ev.commanders.opponent.join(', ')}</span> : null}
            {ev.strength?.opponent && <em>{ev.strength.opponent}</em>}
          </div>
        </div>
        {ev.detail.split(/\n\n+/).map((p, k) => (
          <p key={k}>{p}</p>
        ))}
        {ev.casualties && (
          <p className="ev-casualties">
            <span className="lbl">Losses</span> {ev.casualties}
          </p>
        )}
        <p className="ev-significance">{ev.significance}</p>
        <div className={`ev-certainty c-${ev.certainty}`}>
          <div className="cert-row">
            <span className="cert-meter" aria-hidden>
              <i /><i /><i />
            </span>
            <b>{CERTAINTY_TEXT[ev.certainty]}</b>
            <span className="cert-geo">{GEOMETRY_TEXT[ev.geometry]}</span>
          </div>
          {ev.uncertaintyNote && <p>{ev.uncertaintyNote}</p>}
        </div>
        <details className="ev-sources" open>
          <summary>Sources</summary>
          <ol>
            {ev.sources.map((s) => (
              <li key={s}>{/^https?:/.test(s) ? <a href={s} target="_blank" rel="noreferrer">{decodeURI(s).replace(/^https?:\/\//, '').slice(0, 80)}</a> : s}</li>
            ))}
          </ol>
          {ev.sourceRow && <p className="ev-row">Research pack row <code>{ev.sourceRow}</code></p>}
        </details>
      </div>
      <footer>
        <button disabled={!prev} onClick={() => go(prev)}>← {prev ? prev.title : ''}</button>
        <button disabled={!next} onClick={() => go(next)}>{next ? next.title : ''} →</button>
      </footer>
    </aside>
  );
}
