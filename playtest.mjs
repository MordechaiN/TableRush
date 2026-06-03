// playtest.mjs — 5-session gameplay simulation for PLAYTEST_ROUND_1
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
const PLAY_BTN       = { x: 240, y: 440 };
const PLAY_AGAIN_BTN = { x: 240, y: GAME_H - 160 };

let shotNum = 0;
async function shot(page, label) {
  const p = `${DIR}/${String(++shotNum).padStart(3,'0')}_${label}.png`;
  await page.screenshot({ path: p });
  return p;
}

async function gc(page, canvas, gx, gy) {
  const box = await canvas.boundingBox();
  await page.mouse.click(box.x + gx * (box.width / GAME_W), box.y + gy * (box.height / GAME_H));
}

// Read live game state from Phaser scene via window.game
async function readState(page) {
  return page.evaluate(() => {
    const g = window.game;
    if (!g) return { scene: 'none' };

    const isActive = s => s.sys?.isActive?.();

    const go = g.scene.scenes.find(s => s.sys?.settings?.key === 'GameOverScene' && isActive(s));
    if (go) return { scene: 'GameOver' };

    const gs = g.scene.scenes.find(s => s.sys?.settings?.key === 'GameScene' && isActive(s));
    if (!gs) {
      const mm = g.scene.scenes.find(s => s.sys?.settings?.key === 'MainMenuScene' && isActive(s));
      return { scene: mm ? 'MainMenu' : 'other' };
    }

    const elapsed = gs.gameStartMs ? (gs.time.now - gs.gameStartMs) / 1000 : 0;
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
      elapsed: Math.round(elapsed),
      remaining: Math.max(0, 180 - elapsed),
      playerBusy: !!gs.playerBusy,
      carrying: gs.carryingOrderId !== -1,
      kitchenReady: (gs.kitchenOrders || []).some(o => o.ready),
      // Table states summary
      tableStates: (gs.tables || []).map(t => t.state),
      // Customer states summary
      customerStates: [...(gs.customers || new Map()).values()].map(c => c.state),
      tutorialActive: !!gs.tutorialActive,
    };
  });
}

// Find best action given current state
function chooseBestTable(state) {
  const priorities = ['paying', 'dirty', 'requesting'];
  for (const s of priorities) {
    const idx = state.tableStates.indexOf(s);
    if (idx !== -1) return TABLES[idx];
  }
  // Also try to deliver if carrying
  if (state.carrying) {
    const idx = state.tableStates.indexOf('occupied');
    if (idx !== -1) return TABLES[idx];
  }
  return null;
}

const allSessions = [];
const consoleErrors = [];

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: 540, height: 960 } });
const page = await ctx.newPage();
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });

await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const canvas = page.locator('canvas').first();

// ─── SESSIONS ─────────────────────────────────────────────────────────────────

for (let sn = 1; sn <= 5; sn++) {
  console.log(`\n${'═'.repeat(64)}`);
  console.log(`  SESSION ${sn}`);
  console.log('═'.repeat(64));

  const obs = [];
  const note = (msg) => {
    const state = obs.length > 0 ? obs[obs.length-1].state : null;
    const entry = { t: elapsed, msg };
    obs.push(entry);
    console.log(`  [${String(elapsed).padStart(3)}s] ${msg}`);
  };

  let elapsed = 0;
  let peakCombo = 0;
  let firstComboAt = null;
  let firstAngryAt = null;
  let firstMultiplierAt = null;
  let urgencyFelt = false;
  let snapshots = [];
  let sessionFinalState = null;

  // ── Start game ────────────────────────────────────────────────────────────
  let curState = await readState(page);
  if (sn === 1) {
    if (curState.scene === 'MainMenu') {
      await gc(page, canvas, PLAY_BTN.x, PLAY_BTN.y);
    }
  } else {
    // We should be on GameOver screen from previous session
    await gc(page, canvas, PLAY_AGAIN_BTN.x, PLAY_AGAIN_BTN.y);
  }
  await page.waitForTimeout(1000);
  await shot(page, `s${sn}_00_start`);
  console.log(`  [  0s] Session ${sn} started`);

  // ── Game loop ─────────────────────────────────────────────────────────────
  const POLL = 500; // ms between action polls
  const gameStartWall = Date.now();
  let lastSnapTime = -10;
  let gameEnded = false;

  while (!gameEnded) {
    await page.waitForTimeout(POLL);
    elapsed = Math.round((Date.now() - gameStartWall) / 1000);

    curState = await readState(page);

    if (curState.scene === 'GameOver') {
      gameEnded = true;
      break;
    }
    if (curState.scene !== 'GameScene') continue;

    // Record peaks
    if (curState.comboCount > peakCombo) {
      peakCombo = curState.comboCount;
      if (peakCombo === 1 && firstComboAt === null) firstComboAt = curState.elapsed;
    }
    if (curState.comboMultiplier > 1.0 && firstMultiplierAt === null) {
      firstMultiplierAt = curState.elapsed;
    }
    if (curState.customersAngry > 0 && firstAngryAt === null) {
      firstAngryAt = curState.elapsed;
    }
    if (curState.remaining <= 30 && !urgencyFelt) {
      urgencyFelt = true;
      console.log(`  [${String(elapsed).padStart(3)}s] URGENCY — 30s left, score=${curState.score}`);
    }

    // Periodic snapshots
    if (curState.elapsed - lastSnapTime >= 30) {
      lastSnapTime = curState.elapsed;
      const label = `s${sn}_${String(curState.elapsed).padStart(3,'0')}s`;
      await shot(page, label);
      snapshots.push({ gameElapsed: curState.elapsed, wallElapsed: elapsed, state: { ...curState } });
      console.log(`  [${String(elapsed).padStart(3)}s] SNAP @${curState.elapsed}s — score=${curState.score} combo=${curState.comboCount}(×${curState.comboMultiplier}) happy=${curState.customersHappy} angry=${curState.customersAngry} kit=${curState.kitchenReady}`);
    }

    // ── Choose action ─────────────────────────────────────────────────────
    if (!curState.playerBusy) {
      if (curState.kitchenReady && !curState.carrying) {
        // Pick up from kitchen
        await gc(page, canvas, KITCHEN.x, KITCHEN.y);
      } else if (curState.carrying) {
        // Deliver: find the table needing food
        const idx = curState.tableStates.findIndex(s => s === 'occupied' || s === 'waiting_food');
        if (idx !== -1) await gc(page, canvas, TABLES[idx].x, TABLES[idx].y);
        else {
          // Try all tables
          for (const t of TABLES) { await gc(page, canvas, t.x, t.y); await page.waitForTimeout(40); }
        }
      } else {
        // No kitchen, not carrying — service tables
        // Priority: paying > dirty > requesting
        const payIdx = curState.tableStates.indexOf('paying');
        const dirtyIdx = curState.tableStates.indexOf('dirty');
        const reqIdx = curState.tableStates.indexOf('requesting');
        const target = payIdx !== -1 ? TABLES[payIdx]
          : reqIdx !== -1 ? TABLES[reqIdx]
          : dirtyIdx !== -1 ? TABLES[dirtyIdx]
          : null;
        if (target) await gc(page, canvas, target.x, target.y);
      }
    }

    // Hard cutoff at 200s wall time
    if (elapsed > 200) {
      console.log(`  [${elapsed}s] Hard cutoff — ending session`);
      // Trigger game end by reading final state
      sessionFinalState = curState;
      gameEnded = true;
    }
  }

  // ── Game over screen ─────────────────────────────────────────────────────
  await page.waitForTimeout(1200); // let GameOver scene animate in
  await shot(page, `s${sn}_gameover`);
  curState = await readState(page);
  console.log(`  [END] Scene: ${curState.scene}`);

  // Read data from GameScene (it holds the round data even after transitioning)
  const finalData = await page.evaluate(() => {
    const g = window.game;
    // Try GameScene first (data persists briefly after scene change)
    const gs = g.scene.scenes.find(s => s.sys?.settings?.key === 'GameScene');
    if (gs && gs.score !== undefined) {
      return {
        score: gs.score,
        comboRecord: gs.comboRecord,
        customersHappy: gs.customersHappy,
        customersAngry: gs.customersAngry,
        fastestDeliveryMs: gs.fastestDeliveryMs === Infinity ? null : gs.fastestDeliveryMs,
        nearMissSaves: gs.nearMissSaves,
      };
    }
    return null;
  });

  const total = (finalData?.customersHappy || 0) + (finalData?.customersAngry || 0);
  console.log(`\n  ── SESSION ${sn} RESULTS ──`);
  console.log(`  Score:     ${finalData?.score ?? 'n/a'}`);
  console.log(`  Combo:     Peak ${peakCombo} (×${snapshots.at(-1)?.state?.comboMultiplier ?? '?'})`);
  console.log(`  Served:    ${total} total (${finalData?.customersHappy ?? '?'} happy, ${finalData?.customersAngry ?? '?'} angry)`);
  console.log(`  Fastest:   ${finalData?.fastestDeliveryMs ? (finalData.fastestDeliveryMs/1000).toFixed(1)+'s' : 'n/a'}`);
  console.log(`  Near saves:${finalData?.nearMissSaves ?? 0}`);
  console.log(`  First combo at: ${firstComboAt ?? 'n/a'}s`);
  console.log(`  First ×2 at:    ${firstMultiplierAt ?? 'n/a'}s`);
  console.log(`  First angry at: ${firstAngryAt ?? 'n/a'}s`);

  allSessions.push({
    sn, finalData, peakCombo, snapshots,
    firstComboAt, firstMultiplierAt, firstAngryAt, urgencyFelt,
    wallDuration: elapsed,
  });

  await page.waitForTimeout(1000);
}

await browser.close();
writeFileSync('/tmp/playtest_data.json', JSON.stringify({ sessions: allSessions, consoleErrors }, null, 2));
console.log('\n\n✅ All sessions complete. Data: /tmp/playtest_data.json');
