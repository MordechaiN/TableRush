/*
 * TableRush — Alpha Validation Harness
 *
 * Drives the REAL game: real input handlers (onTableClick / onKitchenClick /
 * onDishwasherClick), real event triggers (startRushHour, triggerNearMissSave,
 * enqueueCritic), and the real session-type announcement path. No faked overlays.
 *
 * A state-driven bot inspects live GameScene state each tick and issues exactly
 * one action when the waiter is free — i.e. it plays the game the way a human does.
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = 'http://127.0.0.1:4173/index.html';
const OUT = path.join(__dirname, 'shots');
const GW = 480, GH = 854;

fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function progress(level, extra = {}) {
  const xpByLevel = { 1: 0, 3: 700, 4: 1300, 5: 2200, 6: 3500, 7: 5500, 8: 8000, 10: 15000 };
  return JSON.stringify({
    xp: xpByLevel[level] ?? 0, level,
    highScore: 4000, bestStars: 3, totalRounds: 25,
    lastScore: 0, bestCombo: 8, dailyDate: '', dailyGoalDone: false, ...extra,
  });
}

// ─── Bot + control code injected into the page ──────────────────────────────
function injectedBot() {
  const g = window.game;
  const scene = () => g.scene.getScene('GameScene');
  const custAt = (s, id) => { for (const [, c] of s.customers) { if (c.tableId === id) return c; } return null; };
  const frac = (c) => { try { return c.getPatienceFraction(); } catch (e) { return 1; } };

  window.__bot = {
    on: false, handle: null,
    stats() {
      const s = scene();
      if (!s) return { active: false };
      let occupied = 0, seatedStates = {};
      for (const t of s.tables) {
        const c = custAt(s, t.id);
        if (c) { occupied++; seatedStates[c.state] = (seatedStates[c.state] || 0) + 1; }
      }
      let family = null;
      for (const [, c] of s.customers) {
        if (c.isFamilyTable) family = { state: c.state, dessertDone: !!c.familyDessertDone, tableId: c.tableId };
      }
      return {
        active: !!s.scene.isActive('GameScene'),
        tutorial: !!s.tutorialActive,
        combo: s.comboCount, mult: s.comboMultiplier, score: s.score,
        occupied, seatedStates, queue: s.waitingQueue.length,
        session: s.sessionType, busy: s.playerBusy, level: s.playerLevel,
        rush: !!s.rushHourActive, family,
        custCount: s.customers.size,
      };
    },
    pump() { const s = scene(); if (s && !s.tutorialActive) s.tryEnqueueCustomer(); },
    forceFamilyNext() {
      const s = scene(); if (!s) return false;
      const arr = [...s.customers.values()];
      const c = arr[arr.length - 1];
      if (c && !c.isVIP && !c.isBirthday && !c.isCritic && !c.isFamilyTable && c.state === 'entering') {
        c.makeFamilyTable(); s.birthdayCustomerQueued = true; return true;
      }
      return false;
    },
    forceBirthdayNext() {
      const s = scene(); if (!s) return false;
      const arr = [...s.customers.values()];
      const c = arr[arr.length - 1];
      if (c && !c.isVIP && !c.isBirthday && !c.isCritic && !c.isFamilyTable && c.state === 'entering') {
        c.makeBirthday(); s.birthdayCustomerQueued = true; return true;
      }
      return false;
    },
    forceVIPNext() {
      const s = scene(); if (!s) return false;
      const arr = [...s.customers.values()];
      const c = arr[arr.length - 1];
      if (c && !c.isVIP && !c.isBirthday && !c.isCritic && !c.isFamilyTable && c.state === 'entering') {
        c.makeVIP(); return true;
      }
      return false;
    },
    // Freeze the scene at the frame a named float text is at full size — for a crisp capture.
    freezeOnFloat(label) {
      window.__froze = false;
      const s = scene(); if (!s) return;
      const tick = () => {
        let t = null;
        for (const o of s.children.list) if (o.type === 'Text' && o.text === label) t = o;
        if (t && t.alpha >= 0.95 && t.scaleX >= 1.1) { s.tweens.pauseAll(); s.time.paused = true; window.__froze = true; return; }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
    step(fillMode) {
      const s = scene();
      if (!s || !s.scene.isActive('GameScene') || s.tutorialActive || s.playerBusy) return;
      const tables = s.tables;
      const traySlots = s.tray.getSlots();
      const paying = [], deliverable = [], requesting = [];
      for (const t of tables) {
        const c = custAt(s, t.id);
        if (!c) continue;
        if (c.state === 'paying') paying.push(t);
        else if (c.state === 'waiting_food' && c.order && traySlots.some(sl => sl.emoji === c.order.emoji)) deliverable.push(t);
        else if (c.state === 'requesting') requesting.push(t);
      }
      const byUrg = (arr) => arr.sort((a, b) => frac(custAt(s, a.id)) - frac(custAt(s, b.id)));
      const seatEmpty = () => {
        if (s.waitingQueue.length > 0) {
          const e = tables.find(t => t.state === 'empty');
          if (e) { s.onTableClick(e.id); return true; }
        }
        return false;
      };
      // In fill mode, seating is top priority (after only paying to keep tables turning over).
      if (fillMode && seatEmpty()) return;
      if (paying.length) { byUrg(paying); s.onTableClick(paying[0].id); return; }
      if (deliverable.length) { byUrg(deliverable); s.onTableClick(deliverable[0].id); return; }
      if (s.kitchenOrders.some(o => o.ready && !s.tray.hasOrder(o.id)) && s.tray.canPickUp()) { s.onKitchenClick(); return; }
      if (requesting.length) { byUrg(requesting); s.onTableClick(requesting[0].id); return; }
      if (!fillMode && seatEmpty()) return;
      const dirty = tables.find(t => t.state === 'dirty');
      if (dirty) { s.onTableClick(dirty.id); return; }
      if (s.carryingDirty) { s.onDishwasherClick(); return; }
    },
    start(fillMode) { if (this.on) return; this.on = true; this.handle = setInterval(() => this.step(!!fillMode), 100); },
    stop() { this.on = false; if (this.handle) clearInterval(this.handle); this.handle = null; },
  };
}

async function launch(w = GW, h = GH) {
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', e => console.log('  [pageerror]', e.message));
  return { browser, page };
}

async function boot(page, level) {
  await page.goto(URL, { waitUntil: 'load' });
  await page.evaluate((p) => {
    localStorage.setItem('tablerush_progress', p);
    localStorage.setItem('tablerush_tutorial_done', '1');
    localStorage.setItem('tablerush_muted', '1');
  }, progress(level));
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.game && window.game.scene.getScene('MainMenuScene'), { timeout: 15000 });
  await sleep(1200);
  await page.evaluate(injectedBot);
}

// Start GameScene, optionally forcing a session type through the real announcement path.
// opts.suppressPanel hides only the start-of-session abilities panel (validated separately
// in the level shots) so isolated mechanic captures aren't obscured by it.
async function startGame(page, forcedSession = null, opts = {}) {
  await page.evaluate(({ forced, suppressPanel }) => {
    const g = window.game;
    const gs = g.scene.getScene('GameScene');
    if (forced) {
      gs.rollSessionType = function () {
        this.sessionType = forced;
        this.showSessionAnnouncement(this.sessionType);
      };
    }
    if (suppressPanel) gs.showAbilitiesPanel = function () {};
    g.scene.getScene('MainMenuScene').scene.start('GameScene');
  }, { forced: forcedSession, suppressPanel: !!opts.suppressPanel });
  await page.waitForFunction(() => {
    const s = window.game.scene.getScene('GameScene');
    return s && s.scene.isActive('GameScene');
  }, { timeout: 10000 });
  await page.evaluate(injectedBot); // re-install bot bound to fresh scene refs (idempotent)
}

const stats = (page) => page.evaluate(() => window.__bot.stats());
async function botStart(page, fill = false) { await page.evaluate((f) => window.__bot.start(f), fill); }
async function botStop(page) { await page.evaluate(() => window.__bot.stop()); }
// Camera flash/fade effects briefly paint the whole screen — never capture mid-flash.
async function waitNoFlash(page, timeout = 4000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const flashing = await page.evaluate(() => {
      const s = window.game.scene.getScene('GameScene') || window.game.scene.getScene('GameOverScene');
      if (!s) return false;
      const cam = s.cameras.main; const f = cam.flashEffect, fd = cam.fadeEffect;
      return !!((f && f.isRunning) || (fd && fd.isRunning));
    }).catch(() => false);
    if (!flashing) return true;
    await sleep(60);
  }
  return false;
}

async function shot(page, name) { await waitNoFlash(page); await page.screenshot({ path: path.join(OUT, name) }); console.log('   📸', name); }

async function waitFor(page, predFn, { timeout = 60000, interval = 250 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const s = await stats(page);
    if (predFn(s)) return s;
    await sleep(interval);
  }
  return null;
}

// Wait until the real announcement Text (e.g. 'VIP NIGHT') is fully faded in AND
// the start-of-session abilities panel has cleared — so the banner is captured
// clean. Detects actual live scene objects, immune to rAF clock drift.
async function waitForBanner(page, label, timeout = 18000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const r = await page.evaluate((lbl) => {
      const s = window.game.scene.getScene('GameScene');
      if (!s) return { banner: -1, panel: -1 };
      let banner = -1, panel = -1;
      const hasPanelText = (cont) => { for (const c of cont.list || []) { if (c.type === 'Text' && c.text === 'YOUR ABILITIES') return true; } return false; };
      for (const o of s.children.list) {
        if (o.type === 'Text' && o.text === lbl) banner = o.alpha;
        if (o.type === 'Container' && hasPanelText(o)) panel = o.alpha;
      }
      return { banner, panel };
    }, label);
    if (r.banner > 0.9 && (r.panel < 0.05)) return r;
    await sleep(90);
  }
  return null;
}

// Wait on the PHASER clock, not wall-clock. Headless rAF can run slower than
// real time, so in-game timed effects (announcement banners, etc.) must be
// gated on the scene's own elapsed time to be captured at the right beat.
async function waitGameTime(page, ms, timeout = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const e = await page.evaluate(() => {
      const s = window.game.scene.getScene('GameScene');
      return s ? (s.time.now - s.gameStartMs) : 0;
    });
    if (e >= ms) return e;
    await sleep(80);
  }
  return null;
}

module.exports = { launch, boot, startGame, stats, botStart, botStop, shot, waitFor, waitGameTime, waitForBanner, sleep, OUT, GW, GH, injectedBot, progress };
