import { useEffect, useMemo, useRef, useState } from 'react';
import type { WarData, AtlasEvent } from '../data/war';
import { store, useAtlas } from '../store';
import { OUTCOME_COLORS } from '../map/icons';
import { formatClock, formatDate } from '../data/time';

export function Timeline({ war, onSeek }: { war: WarData; onSeek: (t: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const [hover, setHover] = useState<{ x: number; t: number; ev?: AtlasEvent } | null>(null);
  const t = useAtlas((s) => s.t);
  const playing = useAtlas((s) => s.playing);
  const speed = useAtlas((s) => s.speed);
  const selected = useAtlas((s) => s.selected);

  useEffect(() => {
    const el = ref.current!;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pad = 14;
  const x = (y: number) => pad + ((y - war.from) / (war.to - war.from)) * (width - pad * 2);
  const toT = (px: number) => Math.max(war.from, Math.min(war.to, war.from + ((px - pad) / (width - pad * 2)) * (war.to - war.from)));

  const ticks = useMemo(() => {
    const out: number[] = [];
    for (let y = Math.ceil(war.from / war.tickEvery) * war.tickEvery; y <= war.to; y += war.tickEvery) out.push(y);
    return out;
  }, [war]);

  // Stack ticks that would overlap into lanes so every event stays clickable.
  const lanes = useMemo(() => {
    const lastX: number[] = [];
    return war.events.map((e) => {
      const px = x(e.t0);
      let lane = 0;
      while (lastX[lane] !== undefined && px - lastX[lane] < 5) lane++;
      lastX[lane] = px;
      return Math.min(lane, 3);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [war, width]);

  const drag = useRef(false);
  const onPointer = (ev: React.PointerEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    const px = ev.clientX - rect.left;
    if (ev.type === 'pointerdown') {
      drag.current = true;
      (ev.target as Element).setPointerCapture?.(ev.pointerId);
      store.set({ playing: false });
    }
    const tt = toT(px);
    if (drag.current) onSeek(tt);
    const near = war.events.filter((e) => Math.abs(x(e.t0) - px) < 5).sort((a, b) => b.importance - a.importance)[0];
    setHover({ x: px, t: tt, ev: near });
    if (ev.type === 'pointerup') drag.current = false;
  };

  const phaseY = 0;
  const evY = 30;
  const h = 78;
  const clock = formatClock(t);

  return (
    <div className="timeline">
      <div className="tl-controls">
        <button
          className="play"
          aria-label={playing ? 'Pause' : 'Play'}
          onClick={() => {
            const s = store.get();
            if (!s.playing && s.t >= war.to - 0.01) onSeek(war.from);
            store.set({ playing: !s.playing, selected: s.playing ? s.selected : null });
          }}
        >
          {playing ? (
            <svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          ) : (
            <svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z" /></svg>
          )}
        </button>
        <button className="speed" aria-label="Playback speed" title={`${speed} years per second`} onClick={() => store.set({ speed: war.speeds[(war.speeds.indexOf(speed) + 1) % war.speeds.length] })}>
          {speed / war.speeds[1]}×
        </button>
      </div>
      <div
        className="tl-track"
        ref={ref}
        onPointerDown={onPointer}
        onPointerMove={onPointer}
        onPointerUp={onPointer}
        onPointerLeave={() => !drag.current && setHover(null)}
        onClick={() => hover?.ev && Math.abs(x(hover.ev.t0) - hover.x) < 5 && store.set({ selected: hover.ev.id })}
        role="slider"
        aria-label="Timeline"
        aria-valuemin={war.from}
        aria-valuemax={war.to}
        aria-valuenow={Math.round(t * 100) / 100}
        aria-valuetext={`${clock.month} ${clock.year}`}
        tabIndex={0}
      >
        <svg width={width} height={h}>
          <defs>
            <linearGradient id="played" x1="0" x2="1">
              <stop offset="0" stopColor="#f2b544" stopOpacity="0.05" />
              <stop offset="1" stopColor="#f2b544" stopOpacity="0.28" />
            </linearGradient>
          </defs>
          {war.phases.map((p, i) => {
            const a = x(p.from);
            const b = x(Math.min(p.to, war.to));
            const on = t >= p.from && t < p.to;
            return (
              <g key={p.id} className={`tl-phase${on ? ' on' : ''}`}>
                <rect x={a} y={phaseY} width={b - a - 1} height={20} rx={3} className={i % 2 ? 'odd' : ''} />
                {b - a > 58 && (
                  <text x={a + 6} y={phaseY + 14}>
                    {p.title.length * 5.6 > b - a - 10 ? p.title.slice(0, Math.floor((b - a - 16) / 5.6)) + '…' : p.title}
                  </text>
                )}
              </g>
            );
          })}
          <rect x={pad} y={evY - 4} width={Math.max(0, x(t) - pad)} height={40} fill="url(#played)" />
          {war.reigns.map((r) => (
            <g key={r.name + r.from} className={`tl-reign${r.regency ? ' regency' : ''}`}>
              <rect x={x(r.from)} y={h - 9} width={Math.max(1, x(r.to) - x(r.from) - 1)} height={5} rx={2} />
            </g>
          ))}
          {war.events.map((e, i) => {
            const on = t >= e.t0;
            const hh = 8 + e.importance * 5;
            const y0 = evY + 30 - hh - lanes[i] * 2;
            return (
              <rect
                key={e.id}
                x={x(e.t0) - 1.25}
                y={y0}
                width={e.id === selected ? 3.5 : 2.5}
                height={hh}
                rx={1}
                fill={OUTCOME_COLORS[e.outcome]}
                opacity={e.id === selected ? 1 : on ? 0.95 : 0.35}
                className={e.geometry === 'area' ? 'tick-area' : ''}
              />
            );
          })}
          {ticks.map((y) => (
            <g key={y} className="tl-year">
              <line x1={x(y)} x2={x(y)} y1={evY + 31} y2={evY + 35} />
              <text x={x(y)} y={evY + 45} textAnchor="middle">{y}</text>
            </g>
          ))}
          <g className="tl-head" transform={`translate(${x(t)},0)`}>
            <line y1={0} y2={h - 2} />
            <circle cy={evY + 31} r={6} />
          </g>
          {hover && <line className="tl-hover" x1={hover.x} x2={hover.x} y1={4} y2={h - 4} />}
        </svg>
        {hover && (
          <div className="tl-tip" style={{ left: Math.max(90, Math.min(width - 90, hover.x)) }}>
            {hover.ev && Math.abs(x(hover.ev.t0) - hover.x) < 5 ? (
              <>
                <b>{hover.ev.title}</b>
                <span>{formatDate(hover.ev.start, hover.ev.datePrecision)}</span>
              </>
            ) : (
              <span>{formatClock(hover.t).month} {formatClock(hover.t).year}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
