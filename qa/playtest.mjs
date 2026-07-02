// Automated playtest harness.
//
//   npm run dev          # in one terminal
//   node qa/playtest.mjs # in another
//
// Drives a full shift with the in-game autoStep() bot (see RestaurantGame QA
// hooks), captures screenshots into qa/shots/, and fails loudly on any console
// error. Use it after every gameplay change.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SHOTS = path.join(path.dirname(fileURLToPath(import.meta.url)), 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

const URL = process.env.PLAYTEST_URL ?? 'http://localhost:3000/';
// CHROMIUM_PATH lets CI / preinstalled-browser environments point at their own
// binary instead of downloading one via `npx playwright install`.
const executablePath = process.env.CHROMIUM_PATH
  ?? (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const browser = await chromium.launch({ executablePath });
const errors = [];

async function run(name, viewport, fn) {
  const page = await browser.newPage({ viewport });
  page.on('console', m => { if (m.type() === 'error') errors.push(`[${name}] ${m.text()}`); });
  page.on('pageerror', e => errors.push(`[${name}] PAGEERROR: ${e.message}`));
  await page.goto(URL);
  await page.waitForTimeout(1800);
  await fn(page);
  await page.close();
}

const auto = (page) => page.evaluate(() => window.__game && window.__game.autoStep());
const metrics = (page) => page.evaluate(() => window.__game ? window.__game.metrics() : null);

// ── portrait: tutorial + full shift ──────────────────────────────────────────
await run('portrait', { width: 390, height: 844 }, async (page) => {
  await page.evaluate(() => localStorage.clear());
  await page.reload(); await page.waitForTimeout(1800);
  await page.screenshot({ path: `${SHOTS}/01_title_portrait.png` });
  await page.click('#tt-play');

  // tutorial (fresh storage) — autoStep walks all 7 steps
  for (let i = 0; i < 45; i++) { await auto(page); await page.waitForTimeout(600); }
  await page.screenshot({ path: `${SHOTS}/02_after_tutorial.png` });

  // keep playing ~60s of the live shift
  for (let i = 0; i < 70; i++) { await auto(page); await page.waitForTimeout(700); }
  await page.screenshot({ path: `${SHOTS}/03_midshift_portrait.png` });
  const m = await metrics(page);
  console.log('midshift', JSON.stringify({ score: m.score, combo: m.combo, calls: m.calls, tris: m.tris }));
  if (m.calls > 320) errors.push(`draw calls too high: ${m.calls}`);

  // pause / resume
  await page.click('#h-pause'); await page.waitForTimeout(400);
  await page.click('#p-resume'); await page.waitForTimeout(400);

  // finish the shift
  await page.evaluate(() => window.__game?.fastForward(300));
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${SHOTS}/04_gameover.png` });
  const card = await page.evaluate(() => document.querySelector('.card')?.textContent ?? 'NO CARD');
  console.log('gameover card:', card.replace(/\s+/g, ' ').slice(0, 220));

  // replay once, then quit to menu
  await page.click('#go-replay'); await page.waitForTimeout(2500);
  const m2 = await metrics(page);
  if (!m2) errors.push('replay did not start a new game');
  await page.evaluate(() => window.__game?.fastForward(300));
  await page.waitForTimeout(1500);
  await page.click('#go-menu'); await page.waitForTimeout(800);

  // upgrade shop: coins were banked by the two shifts — buy the first tier
  await page.click('#tt-shop'); await page.waitForTimeout(500);
  await page.screenshot({ path: `${SHOTS}/06_shop.png` });
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('tablerush_progress')));
  const buyBtn = await page.$('[data-buy]:not([disabled])');
  if (before.coins >= 800 && !buyBtn) errors.push('shop: no affordable buy button despite coins');
  if (buyBtn) {
    await buyBtn.click(); await page.waitForTimeout(400);
    const after = await page.evaluate(() => JSON.parse(localStorage.getItem('tablerush_progress')));
    const bought = Object.keys(after.upgrades).filter(k => after.upgrades[k] > before.upgrades[k]);
    if (bought.length !== 1) errors.push('shop: purchase did not increment a tier');
    if (after.coins >= before.coins) errors.push('shop: purchase did not deduct coins');
    console.log('shop: bought', bought[0], `(${before.coins} → ${after.coins} coins)`);
    await page.screenshot({ path: `${SHOTS}/07_shop_after_buy.png` });
  }
  await page.click('#shop-back'); await page.waitForTimeout(400);
});

// ── landscape sanity ──────────────────────────────────────────────────────────
await run('landscape', { width: 1280, height: 800 }, async (page) => {
  await page.evaluate(() => localStorage.setItem('tablerush_tutorial_done', '1'));
  await page.click('#tt-play');
  for (let i = 0; i < 25; i++) { await auto(page); await page.waitForTimeout(600); }
  await page.screenshot({ path: `${SHOTS}/05_landscape.png` });
});

await browser.close();
if (errors.length) {
  console.error('FAILURES:\n' + errors.join('\n'));
  process.exit(1);
}
console.log('✅ playtest passed — screenshots in qa/shots/');
