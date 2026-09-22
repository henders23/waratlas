import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ArrowDownRight, ArrowLeft, ArrowRight, BookOpen, ChevronDown, Compass, Pause, Play, SkipBack, SkipForward, X } from 'lucide-react';
import AtlasMap from './components/AtlasMap';
import ArchiveDialog from './components/ArchiveDialog';
import { events, partitionNames, type AtlasEvent } from './data/events';

const start = 1206;
const end = 1294;
const eras = [
  {year:1206, label:'THE RISE', title:'The making of an empire', deck:'A confederation on the steppe becomes a force that redraws Eurasia.'},
  {year:1219, label:'THE EXPANSION', title:'Across the known world', deck:'Campaigns move west through Central Asia and east into the Chinese kingdoms.'},
  {year:1227, label:'THE SUCCESSORS', title:'Beyond one lifetime', deck:'The next generation extends the reach of the empire.'},
  {year:1259, label:'THE DIVISION', title:'One empire, many courts', deck:'The vast dominion evolves into distinct, often competing khanates.'},
  {year:1279, label:'THE YUAN AGE', title:'A continental order', deck:'Kublai’s Yuan rules China while other Mongol states shape trade and war.'},
  {year:1294, label:'A NEW GENERATION', title:'An empire transformed', deck:'Kublai dies and Temür succeeds at the end of this atlas’s source window.'},
];
const categories: Record<AtlasEvent['category'], string> = {formation:'Formation',campaign:'Campaign',turning:'Turning point',culture:'Culture & exchange',fracture:'Division & resistance'};

export default function App() {
  const [year, setYear] = useState(start);
  const [manualSelectedIndex, setManualSelectedIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showAbout, setShowAbout] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const aboutRef = useRef<HTMLElement>(null);
  const clock = useRef<number | null>(null);
  const last = useRef(0);
  const progress = useRef(0);
  const currentEra = [...eras].reverse().find(era => era.year <= year) ?? eras[0];
  const eventIndex = useMemo(() => events.reduce((index, event, i) => event.year <= year ? i : index, 0), [year]);
  const selectedIndex = manualSelectedIndex ?? eventIndex;
  const selected = events[selectedIndex];
  const recentEvents = useMemo(() => events.filter(event => event.year <= year).slice(-4).reverse(), [year]);
  const closeArchive = useCallback(() => setShowArchive(false), []);

  useEffect(() => {
    if (!playing) return;
    last.current = 0;
    progress.current = 0;
    const tick = (timestamp: number) => {
      if (last.current) progress.current += (timestamp - last.current) * speed / 175;
      last.current = timestamp;
      if (progress.current >= 1) {
        const step = Math.floor(progress.current);
        progress.current -= step;
        setYear(previous => {
          const next = Math.min(end, previous + step);
          if (next === end) setPlaying(false);
          return next;
        });
      }
      clock.current = requestAnimationFrame(tick);
    };
    clock.current = requestAnimationFrame(tick);
    return () => { if (clock.current) cancelAnimationFrame(clock.current); };
  }, [playing, speed]);

  useEffect(() => {
    if (!showAbout) return;
    const returnFocus = document.activeElement as HTMLElement | null;
    aboutRef.current?.querySelector<HTMLButtonElement>('.modal-close')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowAbout(false);
      if (event.key !== 'Tab' || !aboutRef.current) return;
      const items = [...aboutRef.current.querySelectorAll<HTMLElement>('button, a[href]')];
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); returnFocus?.focus(); };
  }, [showAbout]);

  const seek = (value: number) => { setPlaying(false); setManualSelectedIndex(null); setYear(Math.max(start, Math.min(end, value))); };
  const pick = (event: AtlasEvent) => { setManualSelectedIndex(events.indexOf(event)); setYear(event.year); setPlaying(false); };
  const jump = (direction: -1 | 1) => pick(events[Math.max(0, Math.min(events.length - 1, selectedIndex + direction))]);
  const togglePlay = () => { if (year >= end) setYear(start); setManualSelectedIndex(null); setPlaying(value => !value); };
  const exactYear = selected.dateLabel === String(selected.year);

  return <div className="site">
    <a className="skip-link" href="#atlas">Skip to atlas</a>
    <header className="site-header">
      <div className="brand"><span className="brand-mark"><Compass size={22} strokeWidth={1.3}/></span><div><span className="brand-title">ATLAS OF EMPIRES</span><span className="brand-subtitle">AN INTERACTIVE HISTORY</span></div></div>
      <nav aria-label="Main navigation"><a className="nav-active" href="#atlas">Explore the atlas</a><button className="nav-link" onClick={() => setShowAbout(true)}>About this project <ArrowDownRight size={14}/></button></nav>
      <div className="header-edition">NO. 01 <span>·</span> MONGOL EMPIRE</div>
    </header>
    <main id="atlas">
      <section className="intro"><div className="intro-copy"><div className="eyebrow intro-kicker"><span className="small-diamond"/> A CHRONOLOGICAL ATLAS <span className="intro-rule"/> 1206—1294 CE</div><h1>The world, <em>redrawn.</em></h1><p>Follow the rise, reach, and transformation of the Mongol Empire—one moment, one place, one story at a time.</p></div><div className="intro-side"><span className="edition-index">01 / 01</span><span>103 SOURCE-REVIEWED MOMENTS<br/>DRAG THE TIMELINE OR PRESS PLAY</span><ArrowDownRight size={22} strokeWidth={1}/></div></section>
      <section className="exhibit" aria-label="Interactive Mongol Empire atlas">
        <div className="exhibit-head"><div className="exhibit-title"><span className="exhibit-number">01</span><span className="divider"/><button className="war-selector" onClick={() => setShowChapters(value => !value)} aria-expanded={showChapters} aria-controls="chapter-menu">THE MONGOL EMPIRE <ChevronDown size={16}/></button>{showChapters && <div className="chapter-menu" id="chapter-menu"><span className="eyebrow">SELECT AN ERA</span>{eras.map(era => <button key={era.year} onClick={() => {seek(era.year);setShowChapters(false)}}><strong>{era.year}</strong><span>{era.label}</span></button>)}<p>More empires are planned for future editions.</p></div>}</div><button className="archive-trigger" aria-label="Browse all 103 moments" onClick={() => setShowArchive(true)}><BookOpen size={15}/><span>ALL 103 MOMENTS</span></button><span className="exhibit-range">1206 <span>—</span> 1294 CE</span></div>
        <div className="experience">
          <div className="map-panel"><AtlasMap year={year} events={events} selected={selected} onSelect={pick}/></div>
          <aside className="story-panel" aria-live="polite">
            <div className="story-top"><div className="eyebrow"><span className="small-diamond"/> {currentEra.label} <span className="story-top-line"/></div><span className="story-count">{String(selectedIndex + 1).padStart(3,'0')} / {events.length}</span></div>
            <div className="story-main"><div className={`story-year ${exactYear ? '' : 'story-year-range'}`}>{selected.dateLabel}<span>CE</span></div><h2>{selected.title}</h2><div className="story-location"><span className="location-dot"/>{selected.marker?.location ?? partitionNames[selected.partition]} <span className="story-category">/ {categories[selected.category]}</span></div><p>{selected.description}</p><details className="source-notes"><summary>SOURCE & MAP NOTES <ArrowRight size={15}/></summary><div><strong>Primary citation</strong><p>{selected.sourceCitation}</p>{selected.secondCitation && <p>{selected.secondCitation}</p>}{selected.sourceUrl && <a href={selected.sourceUrl} target="_blank" rel="noreferrer">OPEN SOURCE DOCUMENT ↗</a>}<strong>Map treatment</strong><p>{selected.geometryStatus}</p>{!exactYear && <p className="placement-note">Placed near {selected.year} on the timeline; source date: {selected.dateLabel}.</p>}{selected.originalDateLabel !== selected.dateLabel && <p className="placement-note">Display date normalized from the frozen denominator’s “{selected.originalDateLabel}” using its source review.</p>}</div></details></div>
            <div className="story-bottom"><span className="eyebrow">AROUND THIS TIME</span><div className="recent-list">{recentEvents.map(event => <button key={event.id} className={event === selected ? 'recent-active' : ''} onClick={() => pick(event)}><span>{event.year}</span><strong>{event.title}</strong><ArrowRight size={14}/></button>)}</div><div className="story-arrows"><button onClick={() => jump(-1)} disabled={selectedIndex === 0} aria-label="Previous event"><ArrowLeft size={18}/></button><button onClick={() => jump(1)} disabled={selectedIndex === events.length - 1} aria-label="Next event"><ArrowRight size={18}/></button></div></div>
          </aside>
        </div>
        <div className="timeline"><div className="timeline-top"><div><span className="eyebrow">THE CHRONOLOGY</span><strong>{currentEra.title}</strong><p>{currentEra.deck}</p></div><div className="timeline-controls"><button className="skip-button" onClick={() => jump(-1)} aria-label="Previous event"><SkipBack size={18}/></button><button className="play-button" onClick={togglePlay} aria-label={playing ? 'Pause timeline' : 'Play timeline'}>{playing ? <Pause size={19} fill="currentColor"/> : <Play size={19} fill="currentColor"/>}<span>{playing ? 'PAUSE' : 'PLAY'}</span></button><button className="skip-button" onClick={() => jump(1)} aria-label="Next event"><SkipForward size={18}/></button><button className="speed-button" onClick={() => setSpeed(value => value === 1 ? 2 : 1)} aria-label={`Playback speed ${speed}x, click to change`}>{speed}×</button></div></div><div className="timeline-track"><div className="range-wrap"><input type="range" min={start} max={end} value={year} onChange={event => seek(Number(event.target.value))} aria-label="Year" style={{'--progress':`${(year-start)/(end-start)*100}%`} as CSSProperties}/><div className="event-ticks" aria-hidden="true">{events.map(event => <i key={event.id} style={{left:`${(event.year-start)/(end-start)*100}%`}}/>)}</div></div><div className="timeline-labels"><span>1206</span><span>1227</span><span>1241</span><span>1260</span><span>1279</span><span>1294</span></div></div><div className="timeline-foot"><span>DRAG THE TIMELINE TO TRAVEL THROUGH HISTORY</span><span>MAP REGIONS ARE ILLUSTRATIVE <button onClick={() => setShowAbout(true)}>LEARN MORE ↗</button></span></div></div>
      </section>
      <footer className="site-footer"><div><span className="footer-symbol">✳</span><span>ATLAS OF EMPIRES</span></div><p>History is not a fixed map. It is a record of movement, encounter, and change.</p><button onClick={() => setShowAbout(true)}>ABOUT THE ATLAS <ArrowRight size={15}/></button></footer>
    </main>
    {showArchive && <ArchiveDialog events={events} onSelect={pick} onClose={closeArchive}/>}
    {showAbout && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setShowAbout(false); }}><section ref={aboutRef} className="about-modal" role="dialog" aria-modal="true" aria-labelledby="about-title"><button className="modal-close" aria-label="Close" onClick={() => setShowAbout(false)}><X size={20}/></button><span className="eyebrow"><BookOpen size={14}/> A NOTE ON THE ATLAS</span><h2 id="about-title">History has <em>no hard edges.</em></h2><p>This atlas presents all 103 included records in the Mongol R71 denominator, from 1206 through its 1294 boundary. The six rows marked “merge” are not duplicated as events. Five link to included stories; one unresolved merge link is disclosed in the project notes.</p><p>The colored map regions are generalized interpretive graphics. They are not boundaries derived from the source pack. A point appears only when a named locality can be shown responsibly; many stories are intentionally unplotted.</p><p>Dates with ranges or uncertainty retain that wording in each story. The source notes show primary citations, map restrictions, and any display correction made from the pack’s own reconciliation.</p><button className="modal-action" onClick={() => setShowAbout(false)}>RETURN TO THE ATLAS <ArrowRight size={16}/></button></section></div>}
  </div>;
}
