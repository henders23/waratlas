import type { EventKind } from '../data/schema';

// Pin artwork is drawn once into canvases at startup so the map can render every
// pin in WebGL; no icon font or sprite sheet to download.

// Pin colours by outcome for the war on screen; set once when a war loads.
export const OUTCOME_COLORS: Record<string, string> = {
  victory: '#f2b544',
  defeat: '#6cc3b5',
  inconclusive: '#d8cfbf',
  negotiated: '#c9b6e4',
  'n/a': '#d8cfbf',
};

export function setOutcomeColors(colors: Record<string, string>) {
  Object.assign(OUTCOME_COLORS, colors);
}

type Glyph = (c: CanvasRenderingContext2D) => void;

const line = (c: CanvasRenderingContext2D, pts: number[][]) => {
  c.beginPath();
  c.moveTo(pts[0][0], pts[0][1]);
  for (const p of pts.slice(1)) c.lineTo(p[0], p[1]);
  c.stroke();
};

// Glyphs are drawn in a 24×24 box centred on (12,12).
const GLYPHS: Record<EventKind, Glyph> = {
  battle: (c) => {
    line(c, [[6, 6], [18, 18]]);
    line(c, [[18, 6], [6, 18]]);
    line(c, [[4.5, 10.5], [10.5, 4.5]]);
    line(c, [[13.5, 4.5], [19.5, 10.5]]);
  },
  siege: (c) => {
    c.beginPath();
    c.moveTo(6, 19); c.lineTo(6, 7); c.lineTo(8.4, 7); c.lineTo(8.4, 9.4); c.lineTo(10.8, 9.4); c.lineTo(10.8, 7);
    c.lineTo(13.2, 7); c.lineTo(13.2, 9.4); c.lineTo(15.6, 9.4); c.lineTo(15.6, 7); c.lineTo(18, 7); c.lineTo(18, 19); c.closePath();
    c.fill();
  },
  sack: (c) => {
    c.beginPath();
    c.moveTo(12, 4);
    c.bezierCurveTo(15, 8, 18, 10, 17.5, 14.5);
    c.bezierCurveTo(17, 18, 14.5, 20, 12, 20);
    c.bezierCurveTo(9, 20, 6.5, 18, 6.5, 14.5);
    c.bezierCurveTo(6.5, 11.5, 9, 10.5, 9.5, 7.5);
    c.bezierCurveTo(11, 9, 11, 10.5, 11, 12);
    c.bezierCurveTo(12.5, 10, 12.8, 7, 12, 4);
    c.fill();
  },
  massacre: (c) => {
    c.beginPath();
    c.arc(12, 11, 6.2, 0, Math.PI * 2);
    c.fill();
    c.fillRect(9, 15, 6, 4.5);
    c.globalCompositeOperation = 'destination-out';
    c.beginPath(); c.arc(9.6, 11, 1.8, 0, Math.PI * 2); c.arc(14.4, 11, 1.8, 0, Math.PI * 2); c.fill();
    c.fillRect(10.9, 17, 0.9, 2.5); c.fillRect(12.4, 17, 0.9, 2.5);
    c.globalCompositeOperation = 'source-over';
  },
  political: (c) => {
    c.beginPath();
    c.moveTo(5, 17); c.lineTo(5, 8); c.lineTo(8.5, 12); c.lineTo(12, 6); c.lineTo(15.5, 12); c.lineTo(19, 8); c.lineTo(19, 17); c.closePath();
    c.fill();
    c.fillRect(5, 18, 14, 2);
  },
  death: (c) => {
    c.fillRect(10.8, 4, 2.4, 16);
    c.fillRect(6.5, 8, 11, 2.4);
  },
  treaty: (c) => {
    c.beginPath();
    c.arc(9.5, 12, 4.5, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.arc(14.5, 12, 4.5, 0, Math.PI * 2);
    c.stroke();
  },
  raid: (c) => {
    line(c, [[6, 6], [12, 12], [6, 18]]);
    line(c, [[12, 6], [18, 12], [12, 18]]);
  },
  naval: (c) => {
    c.beginPath();
    c.moveTo(4.5, 14.5); c.lineTo(19.5, 14.5); c.lineTo(17, 19); c.lineTo(7, 19); c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(12, 4); c.lineTo(12, 13); c.lineTo(6.5, 13); c.closePath();
    c.fill();
    c.fillRect(12, 4, 1.3, 10);
  },
  campaign: (c) => {
    c.fillRect(7, 4, 1.8, 16);
    c.beginPath();
    c.moveTo(8.8, 5); c.lineTo(18.5, 7.5); c.lineTo(8.8, 11.5); c.closePath();
    c.fill();
  },
};

export const KIND_LABEL: Record<EventKind, string> = {
  battle: 'Battle', siege: 'Siege', sack: 'Sack', massacre: 'Massacre', political: 'Political turn',
  death: 'Death', treaty: 'Submission / treaty', raid: 'Raid', naval: 'Naval action', campaign: 'Campaign',
};

const SIZE = 64;

/** A pin: solid badge for a located event, dashed ring for an area-only event. */
export function drawPin(kind: EventKind, outcome: string, area: boolean): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const c = canvas.getContext('2d')!;
  const col = OUTCOME_COLORS[outcome] ?? OUTCOME_COLORS['n/a'];
  const r = SIZE / 2 - 5;
  c.save();
  c.translate(SIZE / 2, SIZE / 2);
  c.shadowColor = 'rgba(0,0,0,0.55)';
  c.shadowBlur = 6;
  c.beginPath();
  c.arc(0, 0, r, 0, Math.PI * 2);
  if (area) {
    c.fillStyle = 'rgba(12,14,20,0.78)';
    c.fill();
    c.shadowBlur = 0;
    c.setLineDash([5, 4]);
    c.lineWidth = 3;
    c.strokeStyle = col;
    c.stroke();
  } else {
    c.fillStyle = col;
    c.fill();
    c.shadowBlur = 0;
    c.lineWidth = 2.5;
    c.strokeStyle = 'rgba(20,16,10,0.9)';
    c.stroke();
  }
  c.restore();
  c.save();
  const s = (r * 1.25) / 24;
  c.translate(SIZE / 2 - 12 * s, SIZE / 2 - 12 * s);
  c.scale(s, s);
  const ink = area ? col : '#17120b';
  c.fillStyle = ink;
  c.strokeStyle = ink;
  c.lineWidth = 2.4;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  GLYPHS[kind](c);
  c.restore();
  return c.getImageData(0, 0, SIZE, SIZE);
}

/** Small glyph for HTML (legend, lists), returned as a data URL. */
export function pinDataUrl(kind: EventKind, outcome: string, area: boolean): string {
  const img = drawPin(kind, outcome, area);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  canvas.getContext('2d')!.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

export function hatch(color: string, gap: number, width: number): ImageData {
  const n = 16;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = n;
  const c = canvas.getContext('2d')!;
  c.strokeStyle = color;
  c.lineWidth = width;
  for (let o = -n; o <= n * 2; o += gap) {
    c.beginPath();
    c.moveTo(o, 0);
    c.lineTo(o - n, n);
    c.stroke();
  }
  return c.getImageData(0, 0, n, n);
}
