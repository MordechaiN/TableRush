import pkg from './node_modules/playwright-core/index.js';
const { chromium } = pkg;
import { mkdirSync } from 'fs';

const BROWSER_PATH = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE = 'http://localhost:5173/';
const OUT = '/home/user/TableRush/screenshots/phase1_validation';

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: BROWSER_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

const page = await browser.newPage();
await page.setViewportSize({ width: 480, height: 854 });

async function shot(name, label) {
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log(`✓ ${name}.png — ${label}`);
}

// Helper: get game state via window.game
async function getGameState() {
  return page.evaluate(() => {
    const game = window.game;
    if (!game) return null;
    const scene = game.scene.getScene('GameScene');
    if (!scene || !scene.sys.isActive()) return null;
    const tables = scene.tables?.map(t => ({
      id: t.id, x: t.x, y: t.y, state: t.state,
    })) ?? [];
    const customers = [];
    if (scene.customers) {
      for (const [id, c] of scene.customers.entries()) {
        customers.push({ id, x: c.x, y: c.y, state: c.state, tableId: c.tableId });
      }
    }
    return { tables, customers, playerBusy: scene.playerBusy, carryingOrderId: scene.carryingOrderId };
  });
}

// ── 1. MAIN MENU ─────────────────────────────────────────────────────────────
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await shot('01_main_menu', 'Main menu — new player first view');

// ── 2. TUTORIAL FIRST EXPERIENCE ─────────────────────────────────────────────
await page.evaluate(() => localStorage.removeItem('tablerush_tutorial_done'));
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.mouse.click(240, 490); // PLAY
await page.waitForTimeout(1500);
await shot('02_tutorial_start', 'Tutorial game start — Tip 1/6 + empty restaurant');

await page.waitForTimeout(3000);
await shot('03_tutorial_customer_arrives', 'Tutorial — customer arrives with ❓ bubble, Tip 1/6 instruction visible');

// ── 3. REAL GAME — start fresh ────────────────────────────────────────────────
await page.evaluate(() => localStorage.setItem('tablerush_tutorial_done', '1'));
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.mouse.click(240, 490); // PLAY
await page.waitForTimeout(1500);
await shot('04_game_start_empty', 'Real game started — timer running, restaurant empty, no priority signals');

// ── 4. ONE TABLE — SINGLE PRIMARY PULSE ──────────────────────────────────────
await page.waitForTimeout(3500); // first customer arrives
let state = await getGameState();
console.log('State after 3.5s:', JSON.stringify(state?.customers));
await shot('05_one_table_requesting', 'First customer requesting — single primary pulse, all other tables dim');

// ── 5. MULTI-TABLE — CHECK PRIMARY vs SECONDARY DIMMING ──────────────────────
await page.waitForTimeout(9000); // 2nd-3rd customer
state = await getGameState();
console.log('State at multi-table:', JSON.stringify(state?.customers));
await shot('06_multi_table_priority', 'Multiple requesting — one table primary (bright), others secondary (dim 35%)');

// ── 6. TAP A REQUESTING TABLE — WATCH BUBBLE DURING WALK ─────────────────────
state = await getGameState();
const requestingCustomer = state?.customers.find(c => c.state === 'requesting');
if (requestingCustomer) {
  const table = state?.tables.find(t => t.id === requestingCustomer.tableId);
  if (table) {
    console.log(`Tapping table ${table.id} at (${table.x}, ${table.y})`);
    await page.mouse.click(table.x, table.y);
    await page.waitForTimeout(400); // mid-walk
    await shot('07_walk_bubble_visible', 'WALK in progress — ❓ bubble STILL visible on customer (not hidden)');
    await page.waitForTimeout(700); // arrive
    await shot('08_order_flash', 'Player arrived — food emoji bubble pop-in + order flash on customer');
    await page.waitForTimeout(600);
    await shot('09_food_bubble_cooking', 'Cooking started — food emoji in bubble, kitchen COOKING label active');
  }
} else {
  console.log('No requesting customer found at multi-table step');
  await shot('07_walk_bubble_visible', 'SKIP — no requesting customer found');
  await shot('08_order_flash', 'SKIP');
  await shot('09_food_bubble_cooking', 'SKIP');
}

// ── 7. KITCHEN BECOMES PRIMARY ────────────────────────────────────────────────
// Wait for order to cook (5-8s for quick items)
await page.waitForTimeout(7000);
state = await getGameState();
console.log('State before kitchen check:', JSON.stringify({ kitchenOrders: state?.customers?.length }));
await shot('10_kitchen_primary', 'Kitchen order ready — kitchen glow BRIGHT (primary), table pulses DIM (secondary)');

// ── 8. TAP KITCHEN — PICK UP ORDER ───────────────────────────────────────────
state = await getGameState();
if (!state?.playerBusy) {
  await page.mouse.click(240, 120); // kitchen area
  await page.waitForTimeout(1500);
  state = await getGameState();
  console.log('After kitchen tap:', JSON.stringify({ carryingOrderId: state?.carryingOrderId, customers: state?.customers.map(c => c.state) }));
  await shot('11_carrying_food', 'Carrying food — destination table BRIGHT (primary), kitchen glow OFF/dim');
}

// ── 9. DELIVER TO TABLE ───────────────────────────────────────────────────────
state = await getGameState();
const waitingCustomer = state?.customers.find(c => c.state === 'waiting_food');
if (waitingCustomer) {
  const table = state?.tables.find(t => t.id === waitingCustomer.tableId);
  if (table) {
    await page.mouse.click(table.x, table.y);
    await page.waitForTimeout(2500);
    await shot('12_after_delivery_paying', 'Delivered — customer eating, paying table highlighted gold when done eating');
  }
}

// ── 10. WAIT FOR LOW PATIENCE / URGENT RED PULSE ─────────────────────────────
await page.waitForTimeout(18000);
state = await getGameState();
console.log('Late game state:', JSON.stringify(state?.customers.map(c => ({ state: c.state }))));
await shot('13_urgency_red_pulse', 'Low patience customer — URGENT red fast pulse (overrides all others as primary)');

await browser.close();
console.log(`\nAll screenshots in: ${OUT}/`);
