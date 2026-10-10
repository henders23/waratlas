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
        <span className="kicker">Edited by Paul Hendrie</span>
        <h1>Atlas of Wars</h1>
        <p>
          Choose a war. Each one plays out on a living globe: press play to watch the frontiers move month by month as the key moments
          flick up as pictures, or drag through the years and open any event to read its full story.
        </p>
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
      <HowTo />
      <p className="ch-soon">
        <span>In research</span> {soon.map((w) => w.title).join(' · ')}
      </p>
    </main>
  );
}

const STEPS: { title: string; body: React.ReactNode; icon: React.ReactNode }[] = [
  {
    title: 'Choose a war',
    body: 'Pick one of the cards above. Each opens on its own globe; the war’s name at the top left switches to another at any time.',
    icon: <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 0c2.6 2.4 3.8 5.4 3.8 9s-1.2 6.6-3.8 9m0-18C9.4 5.4 8.2 8.4 8.2 12s1.2 6.6 3.8 9M3.5 9h17m-17 6h17" />,
  },
  {
    title: 'Press play',
    body: (
      <>
        The war unfolds month by month. Borders shift as ground is won and lost, and each key moment flicks up as a picture card;
        the cards you have passed collect in a strip above the timeline. The <b>1×</b> button changes the speed.
      </>
    ),
    icon: <path d="M8 5.5v13l10.5-6.5z" />,
  },
  {
    title: 'Drag the timeline',
    body: 'Drag along the bar at the bottom to jump to any month. The coloured ticks are events, the bands above them are the chapters of the war, and the strip below shows who led.',
    icon: <path d="M3 15h18M7 11v8m5-12v12m5-8v8" />,
  },
  {
    title: 'Open an event',
    body: 'Click a pin on the map, a tick on the timeline or a picture card to read the event: who fought, the commanders, strengths and losses, why it mattered, how certain the sources are, and where to read more.',
    icon: <path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />,
  },
  {
    title: 'Read the map',
    body: 'Strong colours are the side the atlas follows and the land it holds; hatching marks ground that is contested or occupied. The colour of a pin tells who won. Hover over a region for its ruler, and open Key at the bottom left for the full legend.',
    icon: <path d="M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2zM9 4v14m6-12v14" />,
  },
  {
    title: 'Find your way',
    body: (
      <>
        <b>Chronicle</b> lists every event in order. <b>Follow</b> lets the camera chase the action, or untick it to roam freely. The keyboard
        works too: <kbd>Space</kbd> plays or pauses, <kbd>←</kbd> <kbd>→</kbd> step a month, <kbd>[</kbd> <kbd>]</kbd> step through events.
      </>
    ),
    icon: <path d="M5 6h14M5 12h14M5 18h9" />,
  },
];

/** How to use the atlas, for first-time visitors. */
function HowTo() {
  return (
    <section className="ch-howto" aria-labelledby="ch-howto-h">
      <h2 id="ch-howto-h">How to use the atlas</h2>
      <ol>
        {STEPS.map((s, i) => (
          <li key={s.title} style={{ animationDelay: `${0.5 + i * 0.07}s` }}>
            <svg viewBox="0 0 24 24" aria-hidden>{s.icon}</svg>
            <div>
              <h3>
                <span>{i + 1}</span> {s.title}
              </h3>
              <p>{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="ch-tip">Every link is shareable: the address bar keeps the war, the date and the open event.</p>
    </section>
  );
}

function Emblem({ id }: { id: string }) {
  if (id === 'ww2')
    // Searchlights crossing in the night sky.
    return (
      <svg className="ch-emblem" viewBox="0 0 64 64" aria-hidden>
        <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeOpacity=".35" />
        <circle cx="32" cy="32" r="23" fill="currentColor" />
        <path d="M20 50 34 13l5 2.5L23 51zM44 50 30 13l-5 2.5L41 51z" fill="#17120b" fillOpacity=".85" />
        <path d="M14 47h36" stroke="#17120b" strokeWidth="2.4" strokeLinecap="round" />
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
