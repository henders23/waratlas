// Time in the atlas is a decimal year: 1241.25 is the start of April 1241.

export function toYear(s: string): number {
  const [y, m = 1, d = 1] = s.split('-').map(Number);
  return y + (m - 1) / 12 + (d - 1) / 365;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function yearOf(t: number) {
  return Math.floor(t);
}

export function monthOf(t: number) {
  return Math.min(11, Math.floor((t - Math.floor(t)) * 12));
}

export function formatClock(t: number) {
  return { year: String(yearOf(t)), month: MONTHS_LONG[monthOf(t)] };
}

/** Human date for an event's written start/end, honest about precision. */
export function formatDate(s: string, precision: string): string {
  const [y, m, d] = s.split('-').map(Number);
  if (precision === 'circa') return `c. ${y}`;
  if (precision === 'year' || !m) return String(y);
  if (precision === 'season') return `${seasonOf(m)} ${y}`;
  if (precision === 'month' || !d) return `${MONTHS_LONG[m - 1]} ${y}`;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function formatRange(start: string, end: string | undefined, precision: string) {
  const a = formatDate(start, precision);
  if (!end) return a;
  const b = formatDate(end, precision);
  if (a === b) return a;
  const [ya] = start.split('-');
  const [yb] = end.split('-');
  if (ya === yb && precision !== 'year' && precision !== 'circa') return `${a.replace(` ${ya}`, '')} – ${b}`;
  return `${a} – ${b}`;
}

function seasonOf(m: number) {
  return m <= 2 || m === 12 ? 'Winter' : m <= 5 ? 'Spring' : m <= 8 ? 'Summer' : 'Autumn';
}
