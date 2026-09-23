// Dev helper: screenshot the atlas in headless Chromium (software WebGL).
// Usage: node scripts/shoot.mjs <url> <out.png> [width] [height] [waitMs] [js-to-run-before-shot]
import { createRequire } from 'node:module';
const require = createRequire(process.env.PW_FROM ?? import.meta.url);
const { chromium } = require('playwright');

const [url, out, w = '1440', h = '900', wait = '6000', script] = process.argv.slice(2);
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(+wait);
if (script) {
  const r = await page.evaluate(script);
  if (r !== undefined) console.log('eval:', JSON.stringify(r));
  await page.waitForTimeout(2500);
}
await page.evaluate(() => { window.__freeze = true; });
await page.waitForTimeout(3000);
await page.screenshot({ path: out, timeout: 150000 });
console.log(logs.filter((l) => !l.includes('[vite]')).slice(0, 30).join('\n'));
await browser.close();
