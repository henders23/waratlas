import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownRight, ArrowLeft, ArrowRight, BookOpen, ChevronDown, Compass, Pause, Play, SkipBack, SkipForward, X } from 'lucide-react';
import AtlasMap from './components/AtlasMap';
import { events } from './data/events';
import type { AtlasEvent } from './data/events';

const start = 1206;
const end = 1368;
const eras = [
  {year:1206, label:'THE RISE', title:'The making of an empire', deck:'A confederation on the steppe becomes a force that redraws Eurasia.'},
  {year:1219, label:'THE EXPANSION', title:'Across the known world', deck:'Campaigns move west through Central Asia and east into the Chinese kingdoms.'},
  {year:1227, label:'THE SUCCESSORS', title:'Beyond one lifetime', deck:'After Chinggis Khan, his successors extend the empire’s reach.'},
  {year:1259, label:'THE DIVISION', title:'One empire, many courts', deck:'The vast dominion evolves into distinct khanates with competing ambitions.'},
  {year:1279, label:'THE YUAN AGE', title:'A continental order', deck:'Kublai’s Yuan rules China as other Mongol states shape trade and diplomacy.'},
  {year:1335, label:'THE UNRAVELLING', title:'The edges loosen', deck:'Successor states fracture and imperial rule recedes in several regions.'},
];
const categories: Record<AtlasEvent['category'], string> = {formation:'Formation',campaign:'Campaign',turning:'Turning point',culture:'Culture & exchange',fracture:'Fragmentation'};

export default function App() {
  const [year, setYear] = useState(1206);
  const [manualSelectedIndex, setManualSelectedIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showAbout, setShowAbout] = useState(false);
  const aboutRef = useRef<HTMLElement>(null);
  const [showChapters, setShowChapters] = useState(false);
  const clock = useRef<number | null>(null);
  const last = useRef(0);
  const progress = useRef(0);
  const currentEra = [...eras].reverse().find(e => e.year <= year) ?? eras[0];
  const eventIndex = useMemo(() => events.reduce((index,event,i) => event.year <= year ? i : index, 0), [year]);
  const selectedIndex = manualSelectedIndex ?? eventIndex;
  const selected = events[selectedIndex] ?? events[0];
  const recentEvents = useMemo(() => events.filter(e => e.year <= year).slice(-4).reverse(), [year]);

  useEffect(() => { if (!playing) return; last.current = 0; progress.current = 0; const tick = (timestamp: number) => { if (last.current) progress.current += (timestamp - last.current) * speed / 175; last.current = timestamp; if (progress.current >= 1) { const step = Math.floor(progress.current); progress.current -= step; setYear(prev => { const next = Math.min(end,prev+step); if (next === end) setPlaying(false); return next; }); } clock.current = requestAnimationFrame(tick); }; clock.current = requestAnimationFrame(tick); return () => { if (clock.current) cancelAnimationFrame(clock.current); }; }, [playing,speed]);
  useEffect(() => {
    if (!showAbout) return;
    const returnFocus = document.activeElement as HTMLElement | null;
    aboutRef.current?.querySelector<HTMLButtonElement>('.modal-close')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowAbout(false);
      if (event.key !== 'Tab' || !aboutRef.current) return;
      const items = Array.from(aboutRef.current.querySelectorAll<HTMLElement>('button, a[href]'));
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); returnFocus?.focus(); };
  }, [showAbout]);
  const seek = (value:number) => { setPlaying(false); setManualSelectedIndex(null); setYear(Math.max(start,Math.min(end,value))); };
  const pick = (event:AtlasEvent) => { const i = events.indexOf(event); setManualSelectedIndex(i); setYear(event.year); setPlaying(false); };
  const jump = (direction:-1|1) => { const next = events[Math.max(0,Math.min(events.length-1,selectedIndex+direction))]; pick(next); };
  const togglePlay = () => { if (year >= end) setYear(start); setManualSelectedIndex(null); setPlaying(p => !p); };
  return <div className="site">
    <a className="skip-link" href="#atlas">Skip to atlas</a>
    <header className="site-header"><div className="brand"><span className="brand-mark"><Compass size={22} strokeWidth={1.3}/></span><div><span className="brand-title">ATLAS OF EMPIRES</span><span className="brand-subtitle">AN INTERACTIVE HISTORY</span></div></div><nav aria-label="Main navigation"><a className="nav-active" href="#atlas">Explore the atlas</a><button className="nav-link" onClick={() => setShowAbout(true)}>About this project <ArrowDownRight size={14}/></button></nav><div className="header-edition">NO. 01 <span>·</span> MONGOL EMPIRE</div></header>
    <main id="atlas">
      <section className="intro"><div className="intro-copy"><div className="eyebrow intro-kicker"><span className="small-diamond"/> A CHRONOLOGICAL ATLAS <span className="intro-rule"/> 1206—1368 CE</div><h1>The world, <em>redrawn.</em></h1><p>Follow the rise, reach, and transformation of the Mongol Empire—one moment, one place, one story at a time.</p></div><div className="intro-side"><span className="edition-index">01 / 01</span><span>SCROLL THROUGH HISTORY<br/>OR PRESS PLAY TO WATCH IT UNFOLD</span><ArrowDownRight size={22} strokeWidth={1}/></div></section>
      <section className="exhibit" aria-label="Interactive Mongol Empire atlas"><div className="exhibit-head"><div className="exhibit-title"><span className="exhibit-number">01</span><span className="divider"/><button className="war-selector" onClick={() => setShowChapters(v=>!v)} aria-expanded={showChapters} aria-controls="chapter-menu">THE MONGOL EMPIRE <ChevronDown size={16}/></button>{showChapters && <div className="chapter-menu" id="chapter-menu"><span className="eyebrow">SELECT AN ERA</span>{eras.map(era => <button key={era.year} onClick={() => {seek(era.year);setShowChapters(false)}}><strong>{era.year}</strong><span>{era.label}</span></button>)}<p>More empires are planned for future editions.</p></div>}</div><span className="exhibit-range">1206 <span>—</span> 1368 CE</span></div>
        <div className="experience"><div className="map-panel"><AtlasMap year={year} events={events} selected={selected} onSelect={pick}/></div><aside className="story-panel" aria-live="polite"><div className="story-top"><div className="eyebrow"><span className="small-diamond"/> {currentEra.label} <span className="story-top-line"/></div><span className="story-count">{String(selectedIndex+1).padStart(2,'0')} / {String(events.length).padStart(2,'0')}</span></div><div className="story-main"><div className="story-year">{selected.year}<span>CE</span></div><h2>{selected.title}</h2><div className="story-location"><span className="location-dot"/>{selected.location} <span className="story-category">/ {categories[selected.category]}</span></div><p>{selected.description}</p><a className="source-link" href={selected.source} target="_blank" rel="noreferrer">READ THE SOURCE <ArrowRight size={15}/></a></div><div className="story-bottom"><span className="eyebrow">AROUND THIS TIME</span><div className="recent-list">{recentEvents.map(ev => <button key={`${ev.year}-${ev.title}`} className={ev === selected ? 'recent-active' : ''} onClick={() => pick(ev)}><span>{ev.year}</span><strong>{ev.title}</strong><ArrowRight size={14}/></button>)}</div><div className="story-arrows"><button onClick={()=>jump(-1)} disabled={selectedIndex===0} aria-label="Previous event"><ArrowLeft size={18}/></button><button onClick={()=>jump(1)} disabled={selectedIndex===events.length-1} aria-label="Next event"><ArrowRight size={18}/></button></div></div></aside></div>
        <div className="timeline"><div className="timeline-top"><div><span className="eyebrow">THE CHRONOLOGY</span><strong>{currentEra.title}</strong><p>{currentEra.deck}</p></div><div className="timeline-controls"><button className="skip-button" onClick={() => jump(-1)} aria-label="Previous event"><SkipBack size={18}/></button><button className="play-button" onClick={togglePlay} aria-label={playing?'Pause timeline':'Play timeline'}>{playing?<Pause size={19} fill="currentColor"/>:<Play size={19} fill="currentColor"/>}<span>{playing?'PAUSE':'PLAY'}</span></button><button className="skip-button" onClick={() => jump(1)} aria-label="Next event"><SkipForward size={18}/></button><button className="speed-button" onClick={() => setSpeed(v=>v===1?2:1)} aria-label={`Playback speed ${speed}x, click to change`}>{speed}×</button></div></div><div className="timeline-track"><div className="range-wrap"><input type="range" min={start} max={end} value={year} onChange={e=>seek(Number(e.target.value))} aria-label="Year" style={{'--progress':`${(year-start)/(end-start)*100}%`} as React.CSSProperties}/><div className="event-ticks" aria-hidden="true">{events.map((ev,i)=><i key={i} style={{left:`${(ev.year-start)/(end-start)*100}%`}}/>)}</div></div><div className="timeline-labels"><span>1206</span><span>1227</span><span>1259</span><span>1294</span><span>1335</span><span>1368</span></div></div><div className="timeline-foot"><span>DRAG THE TIMELINE TO TRAVEL THROUGH HISTORY</span><span>MAP BORDERS ARE ILLUSTRATIVE <button onClick={()=>setShowAbout(true)}>LEARN MORE ↗</button></span></div></div>
      </section>
      <footer className="site-footer"><div><span className="footer-symbol">✳</span><span>ATLAS OF EMPIRES</span></div><p>History is not a fixed map. It is a record of movement, encounter, and change.</p><button onClick={()=>setShowAbout(true)}>ABOUT THE ATLAS <ArrowRight size={15}/></button></footer>
    </main>
    {showAbout && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowAbout(false)}}><section ref={aboutRef} className="about-modal" role="dialog" aria-modal="true" aria-labelledby="about-title"><button className="modal-close" aria-label="Close" onClick={()=>setShowAbout(false)}><X size={20}/></button><span className="eyebrow"><BookOpen size={14}/> A NOTE ON THE ATLAS</span><h2 id="about-title">History has <em>no hard edges.</em></h2><p>This atlas is an interpretive view of the Mongol Empire from its formation in 1206 to the fall of the Yuan dynasty in China in 1368. Dates and event locations are drawn from the linked historical sources in each story.</p><p>The colored map regions and campaign lines are intentionally generalized. Imperial influence, tribute, conquest, and direct rule varied by place and year; the shapes are guides to the broad sweep of change, not precise historical borders.</p><p>Later years show an imperial world of successor khanates, rather than a single centrally governed state.</p><button className="modal-action" onClick={()=>setShowAbout(false)}>RETURN TO THE ATLAS <ArrowRight size={16}/></button></section></div>}
  </div>;
}
