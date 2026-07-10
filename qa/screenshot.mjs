// Quick visual check: title + gameplay screenshots, portrait & landscape.
//
//   npm run dev
//   node qa/screenshot.mjs [outputDir]
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const OUT = process.argv[2] ?? path.join(path.dirname(fileURLToPath(import.meta.url)), 'shots');
fs.mkdirSync(OUT, { recursive: true });
const executablePath = fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
const browser = await chromium.launch({ executablePath });
const errors = [];

async function shots(name, viewport, steps) {
  const page = await browser.newPage({ viewport });
  page.on('console', m => { if (m.type() === 'error') errors.push(`[${name}] ${m.text()}`); });
  page.on('pageerror', e => errors.push(`[${name}] PAGEERROR: ${e.message}`));
  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/${name}_title.png` });
  await page.click('#tt-play');
  await page.waitForTimeout(2200);
  for (let i = 0; i < steps; i++) {
    await page.evaluate(() => window.__game?.autoStep());
    await page.waitForTimeout(420);
  }
  await page.screenshot({ path: `${OUT}/${name}_game.png` });
  const m = await page.evaluate(() => window.__game?.metrics());
  console.log(name, JSON.stringify({ calls: m?.calls, tris: m?.tris, score: m?.score }));
  await page.close();
}

await shots('portrait', { width: 390, height: 844 }, 14);
await shots('landscape', { width: 1280, height: 800 }, 14);
await browser.close();
if (errors.length) { console.error('ERRORS:\n' + errors.join('\n')); process.exit(1); }
console.log('ok');
