// Renders the promotional video frame by frame, so it plays smoothly however slow
// the renderer is. Every frame is a pure function of its index (timeline year, camera,
// overlays), which lets several browsers render disjoint frame ranges in parallel.
//
// Usage: node scripts/record.mjs <base-url> <out-dir> <first-frame> <last-frame>
//   (serve a build with `?capture` support; stitch the PNGs with ffmpeg afterwards)
import { createRequire } from 'node:module';
import { mkdirSync, existsSync } from 'node:fs';
const require = createRequire(process.env.PW_FROM ?? import.meta.url);
const { chromium } = require('playwright');

export const FPS = 30;
export const SECONDS = 43;

// ── Storyboard ────────────────────────────────────────────────────────────
// Timeline year against video seconds. The pause holds on Mohi with its card open.
const YEAR = [
  [0, 1206.0], [3, 1206.0], [7, 1215.5], [11, 1223.4], [15, 1234.2], [18, 1240.95],
  [19.5, 1241.28], [23.5, 1241.28], [24.5, 1241.4], [27, 1258.1], [28.5, 1260.7],
  [33, 1276.2], [35, 1279.3], [38, 1294.1], [43, 1294.1],
];
// Camera: [sec, lon, lat, zoom]. Repeated points hold the camera still.
const CAMERA = [
  [0, 72, 38, 1.85], [3, 98, 44, 2.6], [7, 108, 40, 2.95], [10, 76, 42, 2.7], [13, 62, 42, 2.55],
  [15, 96, 40, 2.6], [18, 42, 50, 2.85], [19.5, 20.9, 47.9, 4.5], [23.5, 20.9, 47.9, 4.5],
  [25.5, 50, 40, 2.8], [28.5, 58, 40, 2.6], [31, 110, 32, 3.05], [35, 112, 28, 3.0],
  [38, 84, 38, 2.2], [43, 80, 38, 2.1],
];
const MOHI = { id: 'battle-sajo-mohi-1241', from: 19.5, to: 23.5 };

const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (k) => k * k * (3 - 2 * k);

function yearAt(s) {
  for (let i = 0; i < YEAR.length - 1; i++) {
    const [s0, y0] = YEAR[i];
    const [s1, y1] = YEAR[i + 1];
    if (s <= s1) {
      const k = (s - s0) / (s1 - s0);
      // Ease into and out of holds; constant speed elsewhere.
      const holdBefore = i > 0 && YEAR[i - 1][1] === y0;
      const holdAfter = i + 2 < YEAR.length && YEAR[i + 2][1] === y1;
      const e = holdBefore && holdAfter ? smooth(k) : holdAfter ? Math.sin((k * Math.PI) / 2) : holdBefore ? 1 - Math.cos((k * Math.PI) / 2) : k;
      return lerp(y0, y1, e);
    }
  }
  return YEAR[YEAR.length - 1][1];
}

// Cubic Hermite through the camera keys, tangents from neighbours: smooth, no overshoot at holds.
function cameraAt(s) {
  const K = CAMERA;
  let i = 0;
  while (i < K.length - 2 && s > K[i + 1][0]) i++;
  const [t0, ...p0] = K[i];
  const [t1, ...p1] = K[i + 1];
  const h = t1 - t0;
  const k = Math.max(0, Math.min(1, (s - t0) / h));
  const tan = (j) => {
    if (j <= 0 || j >= K.length - 1) return [0, 0, 0];
    const [ta, ...pa] = K[j - 1];
    const [tb, ...pb] = K[j + 1];
    const same = K[j].slice(1).every((v, n) => v === pa[n] || v === pb[n]);
    return same ? [0, 0, 0] : pa.map((v, n) => (pb[n] - v) / (tb - ta));
  };
  const m0 = tan(i);
  const m1 = tan(i + 1);
  const h00 = 2 * k ** 3 - 3 * k ** 2 + 1, h10 = k ** 3 - 2 * k ** 2 + k, h01 = -2 * k ** 3 + 3 * k ** 2, h11 = k ** 3 - k ** 2;
  const [lon, lat, zoom] = p0.map((v, n) => h00 * v + h10 * h * m0[n] + h01 * p1[n] + h11 * h * m1[n]);
  return { lon, lat, zoom };
}

function frameState(f, events) {
  const s = f / FPS;
  const t = yearAt(s);
  const cam = cameraAt(s);
  const panelOpen = s >= MOHI.from && s < MOHI.to;
  const panelK = Math.max(0, Math.min(1, Math.min((s - (MOHI.from - 0.6)) / 0.6, (MOHI.to + 0.6 - s) / 0.6)));
  // Announce the most recent major event for a little over a second of video.
  let headline = null;
  if (!panelOpen && s > 3 && s < 38) {
    const recent = events.filter((e) => e.importance === 3 && e.t0 <= t && e.t0 > yearAt(Math.max(3, s - 1.6)));
    if (recent.length) headline = recent[recent.length - 1].id;
  }
  return {
    t, cam, clock: s,
    selected: panelOpen ? MOHI.id : null,
    headline,
    padRight: 440 * smooth(panelK),
    intro: s < 2.2 ? 1 : Math.max(0, 1 - (s - 2.2) / 0.8),
    endCard: s < 39.2 ? 0 : Math.min(1, (s - 39.2) / 1),
  };
}

const [base, outDir, first = '0', last = String(FPS * SECONDS - 1)] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 4 / 3 });
page.on('pageerror', (e) => console.error('[pageerror]', e.message));
await page.goto(`${base}?capture`, { waitUntil: 'load' });
await page.waitForFunction(() => document.querySelector('.app.ready'), null, { timeout: 120000 });
const events = await page.evaluate(() => {
  window.__freeze = true;
  return window.__war.events.map((e) => ({ id: e.id, t0: e.t0, importance: e.importance }));
});
await page.evaluate(() => {
  const card = document.createElement('div');
  card.id = 'end-card';
  card.innerHTML = '<span class="kicker">An exhibit from Qing’s Workshop</span><h1>The Mongol Conquests</h1><p>qingsworkshop.com/war-atlas-a</p>';
  card.style.cssText = 'position:absolute;inset:0;z-index:30;display:grid;place-content:center;text-align:center;gap:10px;opacity:0;pointer-events:none;background:radial-gradient(ellipse at center, rgba(5,8,14,.86), rgba(5,8,14,.95));-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);';
  card.querySelector('h1').style.cssText = 'margin:0;font:400 64px/1 var(--serif);letter-spacing:-0.02em;color:#efe7d6';
  card.querySelector('p').style.cssText = 'margin:6px 0 0;font:italic 300 26px var(--serif);color:#f7dca0';
  document.querySelector('.app').appendChild(card);
});

for (let f = +first; f <= +last; f++) {
  const file = `${outDir}/f${String(f).padStart(5, '0')}.png`;
  if (existsSync(file)) continue;
  const st = frameState(f, events);
  await page.evaluate(async (st) => {
    const { __atlas: atlas, __store: store } = window;
    const intro = document.querySelector('.intro');
    if (intro) {
      if (st.intro > 0) intro.style.opacity = String(st.intro);
      else [...intro.querySelectorAll('button')].find((b) => /Explore/.test(b.textContent))?.click();
    }
    document.getElementById('end-card').style.opacity = String(st.endCard);
    window.__clock = st.clock;
    store.set({ t: st.t, playing: st.clock > 3 && st.clock < 38 && !st.selected, selected: st.selected, headline: st.headline, panel: null });
    atlas.update(st.t, true);
    const m = atlas.map;
    m.jumpTo({ center: [st.cam.lon, st.cam.lat], zoom: st.cam.zoom, padding: { top: 0, bottom: 120, left: 340, right: st.padRight } });
    await new Promise((resolve) => {
      const timer = setTimeout(resolve, 20000);
      m.once('idle', () => {
        clearTimeout(timer);
        resolve();
      });
      m.triggerRepaint();
    });
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }, st);
  await page.screenshot({ path: file, timeout: 120000 });
  if (f % 30 === 0) console.log(`frame ${f}`);
}
await browser.close();
