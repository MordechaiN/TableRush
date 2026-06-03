// playtest.mjs — 5-session gameplay simulation
// Reads live Phaser state via window.game (set in main.ts)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { mkdirSync, writeFileSync } from 'fs';

const DIR = './playtest_screenshots';
mkdirSync(DIR, { recursive: true });

const GAME_W = 480, GAME_H = 854;
const TABLES = [
  { x: 120, y: 290 },
  { x: 360, y: 290 },
  { x: 120, y: 440 },
  { x: 360, y: 440 },
  { x: 240, y: 570 },
];
const KITCHEN = { x: 240, y: 120 };

let shotNum = 0;
async function shot(page, label) {
  const p = `${DIR}/${String(++shotNum).padStart(3,'0')}_${label}.png`;
  await page.screenshot({ path: p });
  console.log(`    📸 ${p}`);
}

async function gc(page, canvas, gx, gy) {
  const box = await canvas.boundingBox();
  await page.mouse.click(box.x + gx * (box.width / GAME_W), box.y + gy * (box.height / GAME_H));
}

async function readState(page) {
  return page.evaluate(() => {
    const g = window.game;
    if (!g) return { scene: 'none' };
    const active = s => s.sys?.isActive?.();
    if (g.scene.scenes.find(s => s.sys?.settings?.key === 'GameOverScene' && active(s)))
      return { scene: 'GameOver' };
    const gs = g.scene.scenes.find(s => s.sys?.settings?.key === 'GameScene' && active(s));
    if (!gs) return { scene: 'other' };
    return {
      scene: 'GameScene',
      score: gs.score || 0,
      comboCount: gs.comboCount || 0,
      comboMultiplier: gs.comboMultiplier || 1.0,
      comboRecord: gs.comboRecord || 0,
      customersHappy: gs.customersHappy || 0,
      customersAngry: gs.customersAngry || 0,
      fastestDeliveryMs: gs.fastestDeliveryMs === Infinity ? null : gs.fastestDeliveryMs,
      nearMissSaves: gs.nearMissSaves || 0,
      elapsed: gs.gameStartMs != null ? Math.round((gs.time.now - gs.gameStartMs) / 1000) : 0,
      remaining: gs.gameStartMs != null ? Math.max(0, 180 - (gs.time.now - gs.gameStartMs) / 1000) : 180,
      playerBusy: !!gs.playerBusy,
      carrying: (gs.carryingOrderId ?? -1) !== -1,
      kitchenReady: (gs.kitchenOrders || []).some(o => o.ready),
      tableStates: (gs.tables || []).map(t => t.state),
      tutorialActive: !!gs.tutorialActive,
    };
  });
}

async function readFinalFromGameScene(page) {
  return page.evaluate(() => {
    const gs = window.game?.scene.scenes.find(s => s.sys?.settings?.key === 'GameScene');
    if (!gs) return null;
    return {
      score: gs.score || 0,
      comboRecord: gs.comboRecord || 0,
      customersHappy: gs.customersHappy || 0,
      customersAngry: gs.customersAngry || 0,
      fastestDeliveryMs: gs.fastestDeliveryMs === Infinity ? null : gs.fastestDeliveryMs,
      nearMissSaves: gs.nearMissSaves || 0,
    };
  });
}

// ─── browser setup ────────────────────────────────────────────────────────────
const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: 540, height: 960 } });
const page = await ctx.newPage();
const consoleErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });

// ─── mark tutorial done before first session ──────────────────────────────────
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
// Set tutorial done in localStorage so every session skips it
await page.evaluate(() => localStorage.setItem('tablerush_tutorial_done', '1')); // must be '1' per ProgressionSystem
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

const canvas = page.locator('canvas').first();
const allSessions = [];

// ─── play 5 sessions ──────────────────────────────────────────────────────────
for (let sn = 1; sn <= 5; sn++) {
  console.log(`\n${'═'.repeat(64)}`);
  console.log(`  SESSION ${sn} / 5`);
  console.log(`${'═'.repeat(64)}`);

  const wallStart = Date.now();
  const events = [];
  let prevScore = 0;
  let prevCombo = 0;
  let prevAngry = 0;
  let prevHappy = 0;
  let peakCombo = 0;
  let firstComboAt = null;
  let firstMultAt = null;
  let firstAngryAt = null;
  let snapshots = [];

  const log = (msg, state) => {
    const wall = Math.round((Date.now() - wallStart) / 1000);
    const game = state?.elapsed ?? '?';
    console.log(`  [w${String(wall).padStart(3)}s g${String(game).padStart(3)}s] ${msg}`);
    events.push({ wall, game, msg });
  };

  // Start game
  const curState0 = await readState(page);
  if (curState0.scene === 'GameOver' && sn > 1) {
    await gc(page, canvas, 240, GAME_H - 160); // PLAY AGAIN
  } else {
    await gc(page, canvas, 240, 490); // PLAY button — MainMenuScene btnY=490
  }
  await page.waitForTimeout(1500);
  log('Game started', await readState(page));
  await shot(page, `s${sn}_start`);

  // game loop
  let gameEnded = false;
  let lastSnapAt = -35;
  const POLL = 450;

  while (!gameEnded) {
    await page.waitForTimeout(POLL);
    const wall = Math.round((Date.now() - wallStart) / 1000);
    const st = await readState(page);

    if (st.scene === 'GameOver') { gameEnded = true; break; }
    if (st.scene !== 'GameScene') continue;

    // Track events
    if (st.comboCount > peakCombo) {
      peakCombo = st.comboCount;
      if (peakCombo === 1 && firstComboAt === null) firstComboAt = st.elapsed;
    }
    if (st.comboMultiplier > 1.5 && firstMultAt === null) firstMultAt = st.elapsed;
    if (st.customersAngry > prevAngry) {
      prevAngry = st.customersAngry;
      firstAngryAt = firstAngryAt ?? st.elapsed;
      log(`😠 Customer left angry (total: ${st.customersAngry}) — combo=${st.comboCount}, score=${st.score}`, st);
    }
    if (st.customersHappy > prevHappy) {
      prevHappy = st.customersHappy;
      log(`✓ Payment collected (happy: ${st.customersHappy}) — score=${st.score} combo=${st.comboCount}×${st.comboMultiplier.toFixed(1)}`, st);
    }
    if (st.score !== prevScore) {
      prevScore = st.score;
    }
    if (st.comboCount !== prevCombo) {
      prevCombo = st.comboCount;
    }

    // Snapshots every 30s of game time
    if (st.elapsed - lastSnapAt >= 30) {
      lastSnapAt = st.elapsed;
      await shot(page, `s${sn}_${String(st.elapsed).padStart(3,'0')}s`);
      log(`SNAPSHOT — score=${st.score} combo=${st.comboCount}×${st.comboMultiplier.toFixed(1)} happy=${st.customersHappy} angry=${st.customersAngry} carrying=${st.carrying} kitReady=${st.kitchenReady}`, st);
      snapshots.push({ gameElapsed: st.elapsed, ...st });
    }

    // Urgency marker
    if (st.remaining <= 30 && st.remaining > 28) {
      log(`⚡ LAST 30 SECONDS — score=${st.score}, combo record=${st.comboRecord}`, st);
    }

    // Act: click kitchen if ready, then try all tables.
    // TABLE states are 'empty'|'occupied'|'dirty' — NOT 'requesting'/'paying'.
    // Customer states live on customer objects, not table objects.
    // Simplest correct approach: click everything, game handles wrong-state clicks gracefully.
    if (!st.playerBusy) {
      if (st.kitchenReady && !st.carrying) {
        await gc(page, canvas, KITCHEN.x, KITCHEN.y);
      } else {
        // Click all tables — game ignores invalid actions silently.
        // This covers 'requesting', 'paying', 'dirty' customer/table states.
        for (const t of TABLES) {
          await gc(page, canvas, t.x, t.y);
          await page.waitForTimeout(60);
        }
      }
    }

    // Hard cap per session — game is 180s, allow 210s wall time
    if (wall > 210) {
      log('Wall time cap reached — ending session', st);
      gameEnded = true;
    }
  }

  // Game over — collect data
  await page.waitForTimeout(1500);
  await shot(page, `s${sn}_gameover`);
  const finalData = await readFinalFromGameScene(page);
  const total = (finalData?.customersHappy || 0) + (finalData?.customersAngry || 0);

  console.log(`\n  ── SESSION ${sn} RESULTS ──────────────────────────────────`);
  console.log(`  Score:          ${finalData?.score ?? 'n/a'}`);
  console.log(`  Best combo:     ${peakCombo} (record: ${finalData?.comboRecord ?? '?'})`);
  console.log(`  Guests served:  ${total} (${finalData?.customersHappy ?? '?'} happy, ${finalData?.customersAngry ?? '?'} angry)`);
  console.log(`  Fastest serve:  ${finalData?.fastestDeliveryMs ? (finalData.fastestDeliveryMs/1000).toFixed(1)+'s' : 'none'}`);
  console.log(`  Near-miss saves:${finalData?.nearMissSaves ?? 0}`);
  console.log(`  First combo at: ${firstComboAt ?? 'never'}s`);
  console.log(`  First ×2 at:    ${firstMultAt ?? 'never'}s`);
  console.log(`  First angry at: ${firstAngryAt ?? 'never'}s`);
  console.log(`  Wall duration:  ${Math.round((Date.now()-wallStart)/1000)}s`);

  allSessions.push({
    sn, finalData, peakCombo, firstComboAt, firstMultAt, firstAngryAt,
    snapshots, events, wallDuration: Math.round((Date.now()-wallStart)/1000),
  });
}

await browser.close();
writeFileSync('/tmp/playtest_data.json', JSON.stringify({ sessions: allSessions, consoleErrors }, null, 2));
console.log('\n\n✅ ALL SESSIONS COMPLETE');
console.log(`Console errors: ${consoleErrors.length}`);
if (consoleErrors.length) consoleErrors.forEach(e => console.log('  ⚠', e));
