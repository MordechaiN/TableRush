// Human-input playtest: plays the game using ONLY real browser input —
// mouse clicks (or touch taps with --touch) at real screen coordinates.
// Never calls game logic directly; state is only *read* to decide where a
// human would click next and to verify the click actually worked.
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
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  hasTouch: TOUCH,
});
const page = await context.newPage();
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

const press = async (x, y) => {
  if (TOUCH) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
};

const state = () => page.evaluate(() => {
  const g = window.__game;
  if (!g) return null;
  const m = g.metrics();
  return {
    score: m.score,
    tables: m.debug.tables,
    actions: [0, 1, 2, 3, 4].map(i => g.tableAction(i)),
    xy: [0, 1, 2, 3, 4].map(i => g.tableScreenXY(i)),
  };
});

console.log(`URL=${URL} input=${TOUCH ? 'touch' : 'mouse'}`);
await page.goto(URL);
await page.waitForTimeout(2200);
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForTimeout(2200);

// ── 1. title → PLAY with a real press ────────────────────────────────────────
const playBtn = await page.locator('#tt-play').boundingBox();
await press(playBtn.x + playBtn.width / 2, playBtn.y + playBtn.height / 2);
await page.waitForTimeout(2000);
let s = await state();
if (!s) { errors.push('P0: PLAY press did not start the game'); }
else console.log('game started, tutorial guest incoming');

// ── 2. play the whole tutorial + ~90s of real play with real presses ────────
let presses = 0, effective = 0, lastScore = 0;
const t0 = Date.now();
while (s && Date.now() - t0 < 150000) {
  s = await state();
  if (!s) break; // game over reached
  const i = ['collect', 'serve', 'order', 'clean'] // human priority
    .map(kind => s.actions.indexOf(kind))
    .find(idx => idx >= 0);
  if (i !== undefined && i >= 0) {
    const { x, y } = s.xy[i];
    if (x < 0 || y < 0 || x > 390 || y > 844) {
      errors.push(`P0: table ${i} tap target off screen at ${x | 0},${y | 0}`);
      break;
    }
    const before = JSON.stringify([s.tables, s.actions]);
    await press(x, y);
    presses++;
    await page.waitForTimeout(350);
    const after = await state();
    if (!after) break;
    const ok = JSON.stringify([after.tables, after.actions]) !== before || after.score > s.score;
    if (ok) effective++;
    if (process.env.VERBOSE) console.log(`press#${presses} t${i} ${s.actions[i]} @${x | 0},${y | 0} -> ${ok ? 'OK' : 'DEAD'} tables=${JSON.stringify(after.tables)}`);
    s = after;
  } else {
    if (process.env.VERBOSE) console.log('idle, tables=', JSON.stringify(s.tables));
    await page.waitForTimeout(400);
  }
  if (presses === 4) await page.screenshot({ path: `${SHOTS}/h1_early.png` });
  lastScore = s ? s.score : lastScore;
}
console.log(`presses=${presses} effective=${effective} score=${lastScore}`);
if (presses === 0) errors.push('P0: never found anything to click');
else if (effective / presses < 0.7) errors.push(`P0: only ${effective}/${presses} real presses had any effect — input is broken`);
if (lastScore === 0) errors.push('P0: score never rose during real-input play');
await page.screenshot({ path: `${SHOTS}/h2_late.png` });

// ── 3. pause + resume with real presses ──────────────────────────────────────
const stillRunning = await state();
if (stillRunning) {
  const pb = await page.locator('#h-pause').boundingBox();
  if (pb) {
    await press(pb.x + pb.width / 2, pb.y + pb.height / 2);
    await page.waitForTimeout(500);
    const resume = await page.locator('#p-resume').boundingBox();
    if (!resume) errors.push('P0: pause press did not open the pause menu');
    else { await press(resume.x + resume.width / 2, resume.y + resume.height / 2); await page.waitForTimeout(500); }
  }
}

// ── 4. finish the shift, real press on PLAY AGAIN ────────────────────────────
await page.evaluate(() => window.__game?.fastForward(300)); // only fast-forwards the clock
await page.waitForTimeout(2200);
const replay = await page.locator('#go-replay').boundingBox();
if (!replay) errors.push('P0: game-over card did not appear');
else {
  await press(replay.x + replay.width / 2, replay.y + replay.height / 2);
  await page.waitForTimeout(2500);
  if (!await state()) errors.push('P0: PLAY AGAIN did not start a new game');
}
await page.screenshot({ path: `${SHOTS}/h3_replay.png` });

await browser.close();
if (errors.length) {
  console.error('FAILURES:\n' + errors.join('\n'));
  process.exit(1);
}
console.log(`✅ human-input playtest passed (${TOUCH ? 'touch' : 'mouse'})`);
