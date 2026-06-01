// Test the GitHub Pages simulation with Playwright
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { mkdirSync, existsSync } from 'fs';

const DIR = './ghpages_screenshots';
if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });

const URL = 'http://localhost:8080/TableRush/';
const errors = [];
const networkFails = [];

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: 540, height: 960 } });
const page = await ctx.newPage();

page.on('console', msg => {
  if (msg.type() === 'error') {
    errors.push({ type: 'console', text: msg.text() });
    console.log('  ❌ CONSOLE ERROR:', msg.text());
  }
});

page.on('response', resp => {
  if (!resp.ok() && !resp.url().includes('favicon')) {
    networkFails.push({ url: resp.url(), status: resp.status() });
    console.log(`  ❌ NETWORK FAIL: ${resp.status()} ${resp.url()}`);
  }
});

page.on('requestfailed', req => {
  networkFails.push({ url: req.url(), error: req.failure()?.errorText });
  console.log(`  ❌ REQUEST FAILED: ${req.url()} — ${req.failure()?.errorText}`);
});

console.log(`\nNavigating to: ${URL}`);
await page.goto(URL, { waitUntil: 'networkidle', timeout: 15000 }).catch(e => console.log('Nav error:', e.message));
await page.waitForTimeout(3000);

await page.screenshot({ path: `${DIR}/01_ghpages_sim.png` });

const canvas = page.locator('canvas').first();
const hasCanvas = await canvas.isVisible().catch(() => false);

console.log(`\n  Canvas visible: ${hasCanvas ? '✅ YES' : '❌ NO'}`);
console.log(`  Console errors: ${errors.length}`);
console.log(`  Network failures: ${networkFails.length}`);

if (!hasCanvas) {
  console.log('\n  ─── ROOT CAUSE DIAGNOSIS ───');
  if (networkFails.length > 0) {
    console.log('  → JS assets failed to load (path issue)');
    networkFails.forEach(f => console.log('    ', f));
  } else if (errors.length > 0) {
    console.log('  → JS loaded but threw errors:');
    errors.forEach(e => console.log('    ', e.text));
  } else {
    console.log('  → Scripts loaded silently but Phaser did not render');
    console.log('  → Likely base path / dynamic import issue');
  }
}

// Check what's in the page HTML
const pageTitle = await page.title();
console.log(`  Page title: "${pageTitle}"`);

await browser.close();
console.log('\nScreenshot saved to:', `${DIR}/01_ghpages_sim.png`);
