import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const URL = 'http://localhost:4173/';
const errors = [];
const networkFails = [];

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: 540, height: 960 } });
const page = await ctx.newPage();

page.on('console', msg => {
  if (msg.type() === 'error') { errors.push(msg.text()); console.log('❌ CONSOLE:', msg.text()); }
});
page.on('response', resp => {
  if (!resp.ok() && !resp.url().includes('favicon')) {
    networkFails.push(`${resp.status()} ${resp.url()}`);
    console.log(`❌ ${resp.status()}:`, resp.url());
  }
});

await page.goto(URL, { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(4000);
await page.screenshot({ path: './ghpages_screenshots/preview_production.png' });

const hasCanvas = await page.locator('canvas').first().isVisible().catch(() => false);
console.log(`Canvas: ${hasCanvas ? '✅ VISIBLE' : '❌ NOT VISIBLE'}`);
console.log(`Console errors: ${errors.length}`);
console.log(`Network fails: ${networkFails.length}`);

await browser.close();
