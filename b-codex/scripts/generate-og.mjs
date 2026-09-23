import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><head><link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@500&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap" rel="stylesheet"><style>
  *{box-sizing:border-box}body{margin:0;width:1200px;height:630px;overflow:hidden;background:radial-gradient(circle at 78% 44%,#34534e 0,#15292c 35%,#101c1f 80%);color:#f3eddd}
  .frame{position:absolute;inset:28px;border:1px solid #b6a37d60}.header{position:absolute;top:67px;left:75px;color:#e5c48e;font:500 17px 'DM Mono',monospace;letter-spacing:.18em}
  .mark{position:absolute;right:78px;top:64px;width:54px;height:54px;border:1px solid #d7b788;border-radius:50%;display:grid;place-items:center;color:#d7b788;font-size:35px}
  .tag{position:absolute;top:192px;left:75px;color:#d3ad79;font:500 16px 'DM Mono',monospace;letter-spacing:.13em}.title{position:absolute;top:226px;left:71px;font:400 100px/.92 'Newsreader',Georgia,serif;letter-spacing:-.05em}.title em{color:#d8b17c;font-weight:400}
  .subtitle{position:absolute;top:467px;left:76px;color:#b8c7c0;font:27px 'Newsreader',Georgia,serif}.bottom{position:absolute;bottom:65px;left:76px;color:#d7b787;font:500 13px 'DM Mono',monospace;letter-spacing:.17em}
  .orb{position:absolute;width:650px;height:650px;border:1px solid #d9bb8550;border-radius:50%;right:-155px;top:80px}.orb:before,.orb:after{content:'';position:absolute;border:1px solid #d9bb8550;border-radius:50%;inset:70px}.orb:after{inset:140px}
  .route{position:absolute;right:100px;top:220px;width:470px;height:300px;border-top:2px dashed #deb87e98;border-radius:50%;transform:rotate(-23deg)}.dot{position:absolute;right:225px;top:260px;width:17px;height:17px;border:4px solid #e9d2a9;background:#142c30;border-radius:50%;box-shadow:0 0 0 11px #d8b17c25}
  </style></head><body><div class="frame"></div><div class="orb"></div><div class="route"></div><div class="dot"></div><div class="header">✳ &nbsp; ATLAS OF EMPIRES</div><div class="mark">✧</div><div class="tag">01 / THE MONGOL EMPIRE &nbsp; · &nbsp; 1206—1294 CE</div><div class="title">The world,<br><em>redrawn.</em></div><div class="subtitle">103 moments in a world in motion.</div><div class="bottom">EXPLORE THE ATLAS →</div></body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'public/og.png' });
} finally {
  await browser.close();
}
