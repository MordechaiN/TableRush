// Human-input playtest: plays the game using ONLY real browser input —
// mouse clicks (or touch taps with --touch) at real screen coordinates.
// State is only *read* (hotspots) to decide where a human would click next
// and to verify the click actually worked.
//
//   npm run dev
//   node qa/human-playtest.mjs [--touch] [--url http://localhost:4173/]
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SHOTS = path.join(path.dirname(fileURLToPath(import.meta.url)), 'shots-human');
fs.mkdirSync(SHOTS, { recursive: true });

const TOUCH = process.argv.includes('--touch');
const urlArg = process.argv.indexOf('--url');
const URL = urlArg >= 0 ? process.argv[urlArg + 1] : (process.env.PLAYTEST_URL ?? 'http://localhost:3000/');

const executablePath = process.env.CHROMIUM_PATH
  ?? (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const browser = await chromium.launch({ executablePath });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: TOUCH });
const page = await context.newPage();
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

const press = async (x, y) => {
  if (TOUCH) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
};
const read = () => page.evaluate(() => {
  const g = window.__game;
  if (!g) return null;
  return { spots: g.hotspots(), lv: g.levelState(), sig: JSON.stringify(g.metrics().debug) };
});

console.log(`URL=${URL} input=${TOUCH ? 'touch' : 'mouse'}`);
await page.goto(URL);
await page.waitForTimeout(2200);
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForTimeout(2200);

// title → PLAY with a real press
const playBtn = await page.locator('#tt-play').boundingBox();
await press(playBtn.x + playBtn.width / 2, playBtn.y + playBtn.height / 2);
await page.waitForTimeout(1800);
let s = await read();
if (!s) errors.push('P0: PLAY press did not start the game');
else console.log('level 1 started');

// play the whole level with real presses, human priority order
const PRI = ['collect', 'deliver', 'pickup', 'order', 'seat', 'clean', 'select'];
let presses = 0, effective = 0;
const t0 = Date.now();
while (s && !s.lv.over && Date.now() - t0 < 260000) {
  let best = null, bestP = 99;
  for (const sp of s.spots) {
    const p = PRI.indexOf(sp.action);
    if (p >= 0 && p < bestP) { bestP = p; best = sp; }
  }
  if (best) {
    if (best.x < 0 || best.y < 0 || best.x > 390 || best.y > 844) {
      errors.push(`P0: ${best.action} hotspot off screen at ${best.x | 0},${best.y | 0}`);
      break;
    }
    const beforeSig = s.sig;
    await press(best.x, best.y);
    presses++;
    await page.waitForTimeout(320);
    const after = await read();
    if (!after) break;
    if (after.sig !== beforeSig) effective++;
    else if (process.env.VERBOSE) console.log(`DEAD press ${best.action}@${best.x | 0},${best.y | 0}`);
    s = after;
  } else {
    await page.waitForTimeout(400);
    s = await read();
  }
  if (presses === 6) await page.screenshot({ path: `${SHOTS}/h1_early.png` });
}
console.log(`presses=${presses} effective=${effective} final=${s ? JSON.stringify(s.lv) : 'over'}`);
if (presses === 0) errors.push('P0: never found anything to click');
else if (effective / presses < 0.7) errors.push(`P0: only ${effective}/${presses} real presses had any effect`);
await page.screenshot({ path: `${SHOTS}/h2_late.png` });

// level end card via real presses
await page.waitForTimeout(2000);
const card = await page.evaluate(() => document.querySelector('.card')?.textContent ?? '');
console.log('card:', card.replace(/\s+/g, ' ').slice(0, 160));
if (!card) errors.push('P0: level-end card did not appear');
if (card && !/CLEAR|PERFECT/.test(card)) errors.push('human run failed level 1: ' + card.slice(0, 100));
const retry = await page.locator('#le-retry').boundingBox();
if (retry) {
  await press(retry.x + retry.width / 2, retry.y + retry.height / 2);
  await page.waitForTimeout(2200);
  if (!await read()) errors.push('P0: REPLAY did not start a new level');
  // pause + quit with real presses
  const pb = await page.locator('#h-pause').boundingBox();
  if (pb) {
    await press(pb.x + pb.width / 2, pb.y + pb.height / 2);
    await page.waitForTimeout(500);
    const q = await page.locator('#p-quit').boundingBox();
    if (q) { await press(q.x + q.width / 2, q.y + q.height / 2); await page.waitForTimeout(700); }
  }
}
await page.screenshot({ path: `${SHOTS}/h3_end.png` });

await browser.close();
if (errors.length) {
  console.error('FAILURES:\n' + errors.join('\n'));
  process.exit(1);
}
console.log(`✅ human-input playtest passed (${TOUCH ? 'touch' : 'mouse'})`);
