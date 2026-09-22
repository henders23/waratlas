import { useMemo, useRef, useState, type PointerEvent } from 'react';
import { feature } from 'topojson-client';
import { geoGraticule10, geoMercator, geoPath, type GeoPermissibleObjects } from 'd3-geo';
import { Minus, Plus, LocateFixed } from 'lucide-react';
import landTopology from 'world-atlas/land-110m.json';
import { territory, successorRealms } from '../data/territory';
import type { AtlasEvent } from '../data/events';

type Props = { year: number; events: AtlasEvent[]; selected: AtlasEvent; onSelect: (event: AtlasEvent) => void };
const projection = geoMercator().center([70, 38]).scale(295).translate([500, 300]);
const path = geoPath(projection);
const land = feature(landTopology as never, landTopology.objects.land as never);
const graticule = geoGraticule10();
const point = ([lon, lat]: [number, number]) => projection([lon, lat]) ?? [0, 0];
const polygonPath = (points: [number,number][]) => points.map((p,i) => `${i ? 'L' : 'M'}${point(p)[0]} ${point(p)[1]}`).join(' ') + ' Z';

export default function AtlasMap({ year, events, selected, onSelect }: Props) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({x:0,y:0});
  const drag = useRef<{x:number,y:number,px:number,py:number}|null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const visible = useMemo(() => events.filter(event => event.marker && event.year <= year && event.year >= year - 25), [events, year]);
  const move = (event: PointerEvent<SVGSVGElement>) => {
    if (!drag.current || !svg.current) return;
    const box = svg.current.getBoundingClientRect();
    setPan({x: drag.current.px + (event.clientX - drag.current.x) * 1000 / box.width, y: drag.current.py + (event.clientY - drag.current.y) * 600 / box.height});
  };
  const end = (event: PointerEvent<SVGSVGElement>) => { if (drag.current) { drag.current = null; svg.current?.releasePointerCapture(event.pointerId); } };
  return <div className="map-shell">
    <div className="map-meta"><span className="eyebrow"><span className="signal"/> THE WORLD IN MOTION</span><span className="map-coords">EURASIA · {year} CE</span></div>
    <svg ref={svg} className="atlas-svg" viewBox="0 0 1000 600" role="group" aria-label={`Illustrative map of the Mongol Empire in ${year}, with selectable historical event markers`} onPointerDown={e => { if ((e.target as Element).closest('.pin')) return; drag.current = {x:e.clientX,y:e.clientY,px:pan.x,py:pan.y}; e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
      <defs>
        <radialGradient id="seaGlow"><stop stopColor="#244248"/><stop offset="1" stopColor="#142a30"/></radialGradient>
        <pattern id="grain" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1" cy="2" r=".45" fill="#dbd6b8" opacity=".12"/><circle cx="6" cy="5" r=".4" fill="#0d181c" opacity=".25"/></pattern>
        <clipPath id="landClip"><path d={path(land as GeoPermissibleObjects) ?? ''}/></clipPath>
        <filter id="pinGlow"><feGaussianBlur stdDeviation="4"/></filter>
      </defs>
      <rect width="1000" height="600" fill="url(#seaGlow)"/>
      <g transform={`translate(${500+pan.x} ${300+pan.y}) scale(${zoom}) translate(-500 -300)`}>
        <path d={path(graticule) ?? ''} className="graticule"/>
        <path d={path(land as GeoPermissibleObjects) ?? ''} className="land"/>
        <g clipPath="url(#landClip)">{(year < 1260 ? territory.filter(t => t.start <= year) : successorRealms.filter(t => t.start <= year)).map((t,i) => <path key={t.name} d={polygonPath(t.points)} className={`territory territory-${t.tone ?? 'early'}`} style={{animationDelay:`${i*35}ms`}}/>)}</g>
        <path d={path(land as GeoPermissibleObjects) ?? ''} className="coastline"/>
        <g className="map-labels" aria-hidden="true"><text x="740" y="182">THE STEPPE</text><text x="330" y="330">CASPIAN SEA</text><text x="850" y="460">SOUTH CHINA SEA</text><text x="450" y="522">INDIAN OCEAN</text><text x="159" y="116">EASTERN EUROPE</text></g>
        {visible.map((ev,i) => { const [x,y] = point([ev.marker!.lon, ev.marker!.lat]); const isSelected = ev === selected; return <g key={`${ev.year}-${i}`} className={`pin ${isSelected ? 'pin-active':''}`} transform={`translate(${x} ${y})`} onClick={e => {e.stopPropagation(); onSelect(ev)}} role="button" tabIndex={0} aria-label={`${ev.dateLabel}: ${ev.title}`} onKeyDown={e => {if(e.key === 'Enter' || e.key === ' ') {e.preventDefault(); onSelect(ev)}}}>
          {isSelected && <circle r="24" className="pin-halo"/>}<circle r={isSelected?8:5} className="pin-dot"/><circle r="16" fill="transparent"/>{isSelected && <text x="15" y="-12" className="pin-label">{ev.marker!.location}</text>}
        </g> })}
      </g>
      <rect width="1000" height="600" fill="url(#grain)" pointerEvents="none"/>
      <g className="compass" transform="translate(944 90)"><circle r="27"/><path d="M0 -18 L4 -4 L18 0 L4 4 L0 18 L-4 4 L-18 0 L-4 -4Z"/><text y="-36">N</text></g>
    </svg>
    <div className="map-caption"><span>{selected.dateLabel} · {selected.title}</span><small>{selected.marker ? selected.marker.location : 'LOCATION NOT PLOTTED IN SOURCE PACK'}</small></div>
    <div className="map-controls"><button aria-label="Zoom in" onClick={() => setZoom(v => Math.min(2.2, +(v+.25).toFixed(2)))}><Plus size={18}/></button><button aria-label="Zoom out" onClick={() => setZoom(v => Math.max(1, +(v-.25).toFixed(2)))}><Minus size={18}/></button><button aria-label="Reset map view" onClick={() => {setZoom(1);setPan({x:0,y:0})}}><LocateFixed size={18}/></button></div>
    <div className="map-legend"><span><i className="swatch-territory"/> {year < 1260 ? 'Interpretive empire shading' : 'Interpretive successor shading'}</span><span><i className="swatch-pin"/> Historical event</span></div>
  </div>;
}
