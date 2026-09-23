import { useEffect, useRef } from 'react';
import { WARS } from '../data/war';

const ready = WARS.filter((w) => w.load);
const soon = WARS.filter((w) => !w.load);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The opening screen: pick which war's atlas to open. */
export function Chooser({ onPick, onPrefetch }: { onPick: (id: string) => void; onPrefetch: (id: string) => void }) {
  return (
    <main className="chooser">
      <Graticule />
      <header className="ch-head">
        <span className="kicker">An exhibit from Qing’s Workshop</span>
        <h1>Atlas of Wars</h1>
        <p>Choose a war. Each one plays out on a living globe: drag through the years or press play, and open the events that shaped it.</p>
      </header>
      <div className="ch-cards">
        {ready.map((w, i) => (
          <button
            key={w.id}
            className="ch-card"
            style={{ '--accent': w.accent, animationDelay: `${0.25 + i * 0.12}s` } as React.CSSProperties}
            onClick={() => onPick(w.id)}
            onPointerEnter={() => onPrefetch(w.id)}
            onFocus={() => onPrefetch(w.id)}
          >
            <Emblem id={w.id} />
            <span className="ch-span">{w.span}</span>
            <span className="ch-title">{w.title}</span>
            <span className="ch-teaser">{w.teaser}</span>
            <span className="ch-foot">
              <span className="ch-stats">{w.stats}</span>
              <span className="ch-go">
                Open the atlas
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
              </span>
            </span>
          </button>
        ))}
      </div>
      <p className="ch-soon">
        <span>In research</span> {soon.map((w) => w.title).join(' · ')}
      </p>
    </main>
  );
}

function Emblem({ id }: { id: string }) {
  if (id === 'mongol')
    return (
      <svg className="ch-emblem" viewBox="0 0 64 64" aria-hidden>
        <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeOpacity=".35" />
        <circle cx="32" cy="32" r="23" fill="currentColor" />
        <path d="M20 42V24l6.5 9L32 20l5.5 13L44 24v18z" fill="#17120b" />
      </svg>
    );
  if (id === 'ww1')
    // A line of trench zigzagging across the disc, under a flare.
    return (
      <svg className="ch-emblem" viewBox="0 0 64 64" aria-hidden>
        <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeOpacity=".35" />
        <circle cx="32" cy="32" r="23" fill="currentColor" />
        <path d="M12 38l5-4 4 4 5-5 4 4 5-5 4 4 5-4 4 3 4-2" fill="none" stroke="#17120b" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M13 44h38" stroke="#17120b" strokeWidth="1.6" strokeDasharray="2.5 2.5" />
        <circle cx="38" cy="20" r="3.2" fill="#17120b" />
        <path d="M38 24.5v5" stroke="#17120b" strokeWidth="1.4" />
      </svg>
    );
  // A crowned N inside a laurel wreath, in the same solid-disc style.
  const leaves = [];
  for (const side of [-1, 1])
    for (let k = 0; k < 6; k++) {
      const a = ((250 - k * 21) * Math.PI) / 180; // from the bottom up the left side
      const x = 32 + side * 15.5 * Math.cos(a);
      const y = 33 - 15.5 * Math.sin(a);
      const tangent = (Math.atan2(-Math.cos(a), Math.sin(a) * side) * 180) / Math.PI;
      leaves.push(<ellipse key={`${side}${k}`} cx={x} cy={y} rx="3.6" ry="1.5" transform={`rotate(${tangent + side * 30} ${x} ${y})`} />);
    }
  return (
    <svg className="ch-emblem" viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeOpacity=".35" />
      <circle cx="32" cy="32" r="23" fill="currentColor" />
      <g fill="#0d1424">{leaves}</g>
      <text x="32" y="40" textAnchor="middle" fill="#0d1424" style={{ font: '600 19px var(--serif)' }}>N</text>
      <path d="M26.5 22.2l1.9 2 3.6-4 3.6 4 1.9-2-.9 3.6h-9.2z" fill="#0d1424" />
    </svg>
  );
}

/** A slowly turning wire globe behind the cards. */
function Graticule() {
  const ref = useRef<SVGGElement>(null);
  useEffect(() => {
    const g = ref.current!;
    const R = 300;
    const meridians = Array.from({ length: 12 }, () => {
      const e = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      e.setAttribute('cy', '0');
      e.setAttribute('ry', String(R));
      g.appendChild(e);
      return e;
    });
    let raf = 0;
    const draw = (now: number) => {
      const spin = reduceMotion ? 0.3 : now / 26000;
      meridians.forEach((e, i) => {
        const lon = (i / meridians.length) * Math.PI + spin;
        const rx = Math.abs(Math.cos(lon)) * R;
        e.setAttribute('rx', rx.toFixed(1));
        e.setAttribute('cx', '0');
        e.style.opacity = String(0.25 + 0.75 * Math.abs(Math.sin(lon)));
      });
      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  const R = 300;
  return (
    <svg className="ch-globe" viewBox="-320 -320 640 640" aria-hidden>
      <defs>
        <radialGradient id="ch-shade" cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#1b2640" />
          <stop offset="1" stopColor="#070b14" />
        </radialGradient>
      </defs>
      <circle r={R} fill="url(#ch-shade)" />
      <g className="ch-lines" ref={ref}>
        {[-60, -30, 0, 30, 60].map((lat) => {
          const y = -Math.sin((lat * Math.PI) / 180) * R;
          const rx = Math.cos((lat * Math.PI) / 180) * R;
          return <ellipse key={lat} cx={0} cy={y} rx={rx} ry={rx * 0.12} />;
        })}
      </g>
      <circle r={R} className="ch-rim" />
    </svg>
  );
}
