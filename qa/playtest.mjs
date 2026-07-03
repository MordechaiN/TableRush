// Automated playtest harness (bot input via the real pointer pipeline).
//
//   npm run dev          # in one terminal
//   node qa/playtest.mjs # in another
//
// Plays level 1 to completion with autoStep() (which taps through the real
// screen-space picker), checks the win card, replays, and exercises the shop.
// Fails loudly on any console error.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SHOTS = path.join(path.dirname(fileURLToPath(import.meta.url)), 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

const URL = process.env.PLAYTEST_URL ?? 'http://localhost:3000/';
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

const auto = (page) => page.evaluate(() => window.__game ? window.__game.autoStep() : null);
const state = (page) => page.evaluate(() => window.__game ? window.__game.levelState() : null);

await run('portrait', { width: 390, height: 844 }, async (page) => {
  await page.evaluate(() => localStorage.clear());
  await page.reload(); await page.waitForTimeout(1800);
  await page.screenshot({ path: `${SHOTS}/01_title.png` });
  await page.click('#tt-play');
  await page.waitForTimeout(1500);

  // play level 1 to the end (8 guests)
  const t0 = Date.now();
  let s = await state(page);
  while (s && !s.over && Date.now() - t0 < 240000) {
    await auto(page);
    await page.waitForTimeout(450);
    s = await state(page);
    if (s && Math.round((Date.now() - t0) / 1000) % 20 === 0) {
      console.log(`t=${Math.round((Date.now() - t0) / 1000)}s`, JSON.stringify(s));
      await page.waitForTimeout(600);
    }
  }
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOTS}/02_level_end.png` });
  const card = await page.evaluate(() => document.querySelector('.card')?.textContent ?? 'NO CARD');
  console.log('level-end card:', card.replace(/\s+/g, ' ').slice(0, 220));
  if (card === 'NO CARD') { errors.push('level did not end / no card'); return; }
  if (!/CLEAR|PERFECT/.test(card)) errors.push('bot failed to clear level 1: ' + card.slice(0, 120));

  // pause/resume on a fresh retry, then quit via menu
  await page.click('#le-retry'); await page.waitForTimeout(2000);
  for (let i = 0; i < 6; i++) { await auto(page); await page.waitForTimeout(400); }
  await page.screenshot({ path: `${SHOTS}/03_midlevel.png` });
  const m = await page.evaluate(() => window.__game.metrics());
  console.log('midlevel', JSON.stringify({ score: m.score, calls: m.calls, tris: m.tris }));
  if (m.calls > 340) errors.push(`draw calls too high: ${m.calls}`);
  await page.click('#h-pause'); await page.waitForTimeout(400);
  await page.click('#p-resume'); await page.waitForTimeout(400);
  await page.click('#h-pause'); await page.waitForTimeout(400);
  await page.click('#p-quit'); await page.waitForTimeout(800);

  // shop: level-1 earnings buy the first tier
  await page.click('#tt-shop'); await page.waitForTimeout(500);
  await page.screenshot({ path: `${SHOTS}/04_shop.png` });
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('tablerush_progress')));
  const buyBtn = await page.$('[data-buy]:not([disabled])');
  if (before.coins >= 800 && !buyBtn) errors.push('shop: no affordable buy button despite coins');
  if (buyBtn) {
    await buyBtn.click(); await page.waitForTimeout(400);
    const after = await page.evaluate(() => JSON.parse(localStorage.getItem('tablerush_progress')));
    if (after.coins >= before.coins) errors.push('shop: purchase did not deduct coins');
    console.log(`shop: bought (${before.coins} → ${after.coins} coins)`);
  }
  await page.click('#shop-back'); await page.waitForTimeout(400);
});

// landscape sanity
await run('landscape', { width: 1280, height: 800 }, async (page) => {
  await page.evaluate(() => localStorage.setItem('tablerush_tutorial_done', '1'));
  await page.click('#tt-play');
  for (let i = 0; i < 25; i++) { await auto(page); await page.waitForTimeout(450); }
  await page.screenshot({ path: `${SHOTS}/05_landscape.png` });
});

await browser.close();
if (errors.length) {
  console.error('FAILURES:\n' + errors.join('\n'));
  process.exit(1);
}
console.log('✅ playtest passed — screenshots in qa/shots/');
