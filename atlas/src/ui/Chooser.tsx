import { WARS } from '../data/war';

const ready = WARS.filter((w) => w.load);
const soon = WARS.filter((w) => !w.load);
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

/** The opening screen: pick which war's atlas to open. */
export function Chooser({ onPick, onPrefetch }: { onPick: (id: string) => void; onPrefetch: (id: string) => void }) {
  return (
    <main className="chooser">
      <header className="ch-head">
        <span className="kicker">Edited by Paul Hendrie</span>
        <h1>Atlas of Wars</h1>
        <p>Choose a war. Each one plays out on a living globe: drag through the years or press play, and open the events that shaped it.</p>
      </header>
      <div className="ch-cards">
        {ready.map((w, i) => (
          <button
            key={w.id}
            className="ch-card"
            style={{ animationDelay: `${0.25 + i * 0.12}s` }}
            onClick={() => onPick(w.id)}
            onPointerEnter={() => onPrefetch(w.id)}
            onFocus={() => onPrefetch(w.id)}
          >
            <span className="ch-num">Volume {ROMAN[i]}</span>
            <span className="ch-title">{w.title}</span>
            <span className="ch-span">{w.span}</span>
            <span className="ch-rule" aria-hidden />
            <span className="ch-teaser">{w.teaser}</span>
            <span className="ch-foot">
              <span className="ch-stats">{w.stats}</span>
              <span className="ch-go">Open the atlas</span>
            </span>
          </button>
        ))}
      </div>
      <p className="ch-soon">
        <span>In preparation</span> {soon.map((w) => w.title).join(' · ')}
      </p>
    </main>
  );
}
