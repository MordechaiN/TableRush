// Balance harness: bot-plays every level via the level-select chips and
// reports score vs goal/expert, walkouts, and draw-call ceilings.
//
//   npm run dev
//   node qa/balance.mjs [firstLevel] [lastLevel]
import { chromium } from 'playwright';
import fs from 'fs';

const URL = process.env.PLAYTEST_URL ?? 'http://localhost:3000/';
const FIRST = Number(process.argv[2] ?? 1);
const LAST = Number(process.argv[3] ?? 8);
const executablePath = process.env.CHROMIUM_PATH
  ?? (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const browser = await chromium.launch({ executablePath });
const errors = [];
const results = [];

for (let lvl = FIRST; lvl <= LAST; lvl++) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('console', m => { if (m.type() === 'error') errors.push(`[L${lvl}] ${m.text()}`); });
  page.on('pageerror', e => errors.push(`[L${lvl}] PAGEERROR: ${e.message}`));
  await page.goto(URL);
  await page.waitForTimeout(1500);
  await page.evaluate((l) => {
    localStorage.clear();
    localStorage.setItem('tablerush_tutorial_done', '1');
    localStorage.setItem('tablerush_progress', JSON.stringify({ levelReached: l, levelStars: [], coins: 0, upgrades: { shoes: 0, stove: 0, decor: 0, charm: 0 } }));
  }, lvl);
  await page.reload();
  await page.waitForTimeout(1800);
  await page.click(`[data-lvl="${lvl}"]`);
  await page.waitForTimeout(1800);

  const t0 = Date.now();
  let s = await page.evaluate(() => window.__game?.levelState());
  let maxCalls = 0;
  while (s && !s.over && Date.now() - t0 < 420000) {
    await page.evaluate(() => window.__game?.autoStep());
    await page.waitForTimeout(380);
    const m = await page.evaluate(() => window.__game ? { lv: window.__game.levelState(), calls: window.__game.metrics().calls, walkouts: window.__game.metrics().walkouts } : null);
    if (!m) break;
    s = m.lv;
    maxCalls = Math.max(maxCalls, m.calls);
    if (s.over) {
      results.push({ lvl, score: s.score, walkouts: m.walkouts, maxCalls, secs: Math.round((Date.now() - t0) / 1000) });
    }
  }
  if (s && !s.over) results.push({ lvl, score: s.score, walkouts: -1, maxCalls, secs: -1, TIMEOUT: true });
  await page.close();
}

await browser.close();
console.log('\nlvl | botScore | walkouts | maxCalls | secs');
for (const r of results) console.log(`${r.lvl}   | ${r.score} | ${r.walkouts} | ${r.maxCalls} | ${r.secs}${r.TIMEOUT ? ' TIMEOUT' : ''}`);
if (errors.length) { console.error('ERRORS:\n' + errors.join('\n')); process.exit(1); }
