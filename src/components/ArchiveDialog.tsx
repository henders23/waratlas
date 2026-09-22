import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import type { AtlasEvent } from '../data/events';
import { partitionNames } from '../data/events';

type Props = { events: AtlasEvent[]; onSelect: (event: AtlasEvent) => void; onClose: () => void };

export default function ArchiveDialog({ events, onSelect, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [partition, setPartition] = useState('all');
  const root = useRef<HTMLElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const partitions = useMemo(() => [...new Set(events.map(event => event.partition))], [events]);
  const results = useMemo(() => events.filter(event => {
    if (partition !== 'all' && event.partition !== partition) return false;
    const search = `${event.title} ${event.description} ${event.dateLabel} ${partitionNames[event.partition]}`.toLocaleLowerCase();
    return search.includes(query.trim().toLocaleLowerCase());
  }), [events, partition, query]);

  useEffect(() => {
    const returnFocus = document.activeElement as HTMLElement | null;
    input.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !root.current) return;
      const items = [...root.current.querySelectorAll<HTMLElement>('button, input, select, a[href]')];
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); returnFocus?.focus(); };
  }, [onClose]);

  return <div className="modal-backdrop archive-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={root} className="archive-dialog" role="dialog" aria-modal="true" aria-labelledby="archive-title">
      <div className="archive-head"><div><span className="eyebrow">THE COMPLETE CHRONICLE / R71</span><h2 id="archive-title">Every turning point, <em>in view.</em></h2><p>All 103 included records in the Mongol denominator, 1206–1294. Some events have no precise map location.</p></div><button className="modal-close" onClick={onClose} aria-label="Close chronicle"><X size={20}/></button></div>
      <div className="archive-tools"><label className="archive-search"><Search size={18}/><span className="sr-only">Search events</span><input ref={input} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search an event, place, or year"/></label><label className="archive-filter"><span className="sr-only">Filter by region</span><select value={partition} onChange={e => setPartition(e.target.value)}><option value="all">All regions</option>{partitions.map(item => <option key={item} value={item}>{partitionNames[item]}</option>)}</select></label></div>
      <div className="archive-results-label">{results.length} {results.length === 1 ? 'RECORD' : 'RECORDS'} <span>CHRONOLOGICAL ORDER</span></div>
      <div className="archive-list">{results.length ? results.map(event => <button key={event.id} onClick={() => { onSelect(event); onClose(); }}><span className="archive-year">{event.dateLabel}</span><span className="archive-item"><strong>{event.title}</strong><small>{partitionNames[event.partition]}{event.marker ? ` · ${event.marker.location}` : ' · Region not plotted'}</small></span><ArrowRight size={17}/></button>) : <p className="archive-empty">No records match this search.</p>}</div>
    </section>
  </div>;
}
