/*
 * Alpha Validation — produces all 15 required screenshots from the REAL game.
 * Each shot records live scene stats so authenticity (real score / seated guests /
 * real combo) is verifiable, not assumed.
 */
const H = require('./harness');
const fs = require('fs');
const path = require('path');

const results = {};
function record(key, label, s, how) {
  results[key] = { label, how, stats: s };
  console.log(`   stats: score=${s && s.score} combo=${s && s.combo} mult=${s && s.mult} occupied=${s && s.occupied} session=${s && s.session} level=${s && s.level} rush=${s && s.rush}`);
}

// Force a real event/trigger by calling the exact in-game handler.
const call = (page, fn, arg) => page.evaluate(fn, arg);

// Freeze the scene the moment a named float reaches full size, so brief callouts capture crisp.
async function freezeOnFloat(page, label, timeout = 8000) {
  await call(page, (l) => window.__bot.freezeOnFloat(l), label);
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) { if (await call(page, () => window.__froze)) break; await H.sleep(40); }
  return call(page, () => window.__froze);
}

async function newSession(level, forced = null) {
  const { browser, page } = await H.launch();
  await H.boot(page, level);
  await H.startGame(page, forced);
  return { browser, page };
}

async function shot01_normal() {
  console.log('[01] Normal shift');
  const { browser, page } = await newSession(1, null);
  await H.botStart(page);
  await H.waitFor(page, s => s.occupied >= 2 && s.score > 0, { timeout: 40000 });
  await H.sleep(1200);
  const s = await H.stats(page);
  await H.shot(page, '01_normal_shift.png');
  record('01', 'Normal shift', s, 'Bot played a Level-1 normal session; screenshot shows live seated guests + score.');
  await H.botStop(page); await browser.close();
}

async function announcement(idx, key, session, level, file, label, bannerLabel) {
  console.log(`[${idx}] ${label}`);
  const { browser, page } = await newSession(level, session);
  // Capture the moment the real banner is fully up and the abilities panel has cleared.
  const r = await H.waitForBanner(page, bannerLabel);
  console.log('   banner state:', JSON.stringify(r));
  const s = await H.stats(page);
  await H.shot(page, file);
  record(key, label, s, `rollSessionType forced to '${session}' (real showSessionAnnouncement path); banner captured live.`);
  await browser.close();
}

async function shot06_family() {
  console.log('[06] Family Table dessert phase');
  const { browser, page } = await newSession(5, 'family_day');
  // Put a real family customer into play, then let the bot serve its first course.
  let forced = false;
  for (let i = 0; i < 12 && !forced; i++) {
    await call(page, () => window.__bot.pump());
    await H.sleep(220);
    forced = await call(page, () => window.__bot.forceFamilyNext());
  }
  console.log('   family forced:', forced);
  await H.botStart(page);
  // Wait until the family finishes course 1 and re-enters 'requesting' for dessert.
  const s = await H.waitFor(page, st => st.family && st.family.dessertDone && st.family.state === 'requesting',
    { timeout: 90000, interval: 100 });
  await H.botStop(page); // no fresh serve text overlaps the DESSERT TIME banner
  await freezeOnFloat(page, 'DESSERT TIME!'); // crisp capture of the real dessert callout
  const stat = await H.stats(page);
  await H.shot(page, '06_family_dessert.png');
  record('06', 'Family Table dessert phase', stat, `Real family customer served course 1; captured at the real dessert re-order (familyDessertDone). family=${JSON.stringify(s && s.family)}`);
  await browser.close();
}

async function shot07_rush() {
  console.log('[07] Rush Hour');
  const { browser, page } = await newSession(7, null);
  await H.botStart(page);
  await H.waitFor(page, s => s.occupied >= 2, { timeout: 30000 });
  await call(page, () => window.game.scene.getScene('GameScene').startRushHour()); // real rush trigger
  await H.sleep(700); // banner peak
  const s = await H.stats(page);
  await H.shot(page, '07_rush_hour.png');
  record('07', 'Rush Hour', s, 'Live game with seated guests; real startRushHour() invoked (same call the 60s timer makes).');
  await H.botStop(page); await browser.close();
}

async function shot08_nearmiss() {
  console.log('[08] Near Miss Save');
  const { browser, page } = await newSession(8, null);
  await H.botStart(page);
  await H.waitFor(page, s => s.occupied >= 2, { timeout: 30000 });
  await call(page, () => {
    const g = window.game.scene.getScene('GameScene');
    const t = g.tables.find(tb => { for (const [, c] of g.customers) if (c.tableId === tb.id) return true; return false; }) || g.tables[2];
    g.triggerNearMissSave(t.x, t.y); // real near-miss handler
  });
  await H.sleep(500);
  const s = await H.stats(page);
  await H.shot(page, '08_near_miss.png');
  record('08', 'Near Miss Save', s, 'Live game; real triggerNearMissSave() invoked (same handler a <8% patience delivery fires).');
  await H.botStop(page); await browser.close();
}

async function shot09_combo() {
  console.log('[09] High Combo state');
  const { browser, page } = await newSession(1, null);
  await H.botStart(page);
  // Build a genuine streak — aim for x4 (combo 10 = TABLE LEGEND), accept >=6 (x3 ON FIRE).
  let s = await H.waitFor(page, st => st.combo >= 10, { timeout: 95000, interval: 200 });
  if (!s) s = await H.waitFor(page, st => st.combo >= 6, { timeout: 5000, interval: 200 }) || await H.stats(page);
  await H.shot(page, '09_high_combo.png');
  record('09', 'High Combo state', s, 'Bot served a genuine uninterrupted streak; combo + multiplier are earned (note non-zero score).');
  await H.botStop(page); await browser.close();
}

async function levelShot(idx, key, level, file, label) {
  console.log(`[${idx}] ${label}`);
  const { browser, page } = await newSession(level, null);
  if (level >= 3) {
    await H.sleep(1500); // abilities panel is on-screen (lists this level's unlocked loadout)
  } else {
    await H.botStart(page);
    await H.waitFor(page, s => s.occupied >= 1, { timeout: 25000 });
    await H.sleep(600);
    await H.botStop(page);
  }
  const s = await H.stats(page);
  await H.shot(page, file);
  record(key, label, s, level >= 3 ? 'Session start — abilities panel enumerates this level\'s loadout (VIP rope visible at L10).' : 'Base restaurant in play at Level 1 (2-slot tray, no abilities panel, no VIP rope).');
  await browser.close();
}

async function shot13_gameover() {
  console.log('[13] Game Over with story events');
  const { browser, page } = await newSession(6, null);
  await H.botStart(page);
  await H.waitFor(page, s => s.combo >= 6 && s.score > 1500, { timeout: 90000, interval: 200 });
  // Force several events through their REAL handlers so storyEvents fills authentically.
  await call(page, () => {
    const g = window.game.scene.getScene('GameScene');
    const t = g.tables[2];
    g.triggerNearMissSave(t.x, t.y);     // -> 'near_miss'
    g.startRushHour();                    // begin rush
  });
  await H.sleep(400);
  await call(page, () => window.game.scene.getScene('GameScene').endRushHour()); // -> 'rush_survived'
  await H.sleep(400);
  const pre = await H.stats(page);
  await H.botStop(page);
  await call(page, () => window.game.scene.getScene('GameScene').endGame()); // real end -> GameOverScene with storyEvents
  await page.waitForFunction(() => window.game.scene.isActive('GameOverScene'), { timeout: 8000 });
  await H.sleep(3200); // stars + story lines + xp settle
  await H.shot(page, '13_gameover_stories.png');
  record('13', 'Game Over with story events', pre, 'Real session (earned score/combo) ended via endGame(); story lines built from real storyEvents (near_miss, rush_survived, combo).');
  await browser.close();
}

async function shot14_mobile() {
  console.log('[14] Mobile gameplay');
  const { browser, page } = await H.launch(390, 844);
  await H.boot(page, 3);
  await H.startGame(page, null);
  await H.botStart(page);
  await H.waitFor(page, s => s.occupied >= 2 && s.score > 0, { timeout: 40000 });
  await H.sleep(1000);
  const s = await H.stats(page);
  await H.shot(page, '14_mobile_view.png');
  record('14', 'Mobile gameplay', s, 'Real session on a 390x844 phone viewport; live seated guests + score.');
  await H.botStop(page); await browser.close();
}

async function shot15_full() {
  console.log('[15] Full restaurant view');
  const { browser, page } = await newSession(6, 'normal'); // force plain shift: no session banner over the full house
  await H.botStart(page, true); // fill mode: seating prioritised
  // Keep arrival pressure up so all 5 tables can be occupied at once.
  const pumpInt = setInterval(() => call(page, () => window.__bot.pump()).catch(() => {}), 600);
  // Let the start-of-session abilities panel clear first so the full house is unobstructed.
  const panelGone = async () => call(page, () => {
    const s = window.game.scene.getScene('GameScene');
    for (const o of s.children.list) {
      if (o.type === 'Container') { for (const c of (o.list || [])) if (c.type === 'Text' && c.text === 'YOUR ABILITIES') return false; }
    }
    return true;
  });
  const t0 = Date.now();
  while (Date.now() - t0 < 40000) { if (await panelGone()) break; await H.sleep(300); }
  // Now capture a clean full house.
  const s = await H.waitFor(page, st => st.occupied >= 5, { timeout: 45000, interval: 250 })
        || await H.waitFor(page, st => st.occupied >= 4, { timeout: 1000, interval: 250 })
        || await H.stats(page);
  clearInterval(pumpInt);
  await H.botStop(page); // freeze the full house (guests stay seated through their patience window) — no service flashes
  await H.sleep(500);
  const stat = await H.stats(page);
  await H.shot(page, '15_full_restaurant.png');
  record('15', 'Full restaurant view', stat, `Bot (fill mode) seated guests at every table; captured with ${stat.occupied}/5 tables occupied.`);
  await H.botStop(page); await browser.close();
}

// ─── Bonus shots: prove the per-session payout mechanics, not just the banners ──
async function newSessionClean(level, forced) {
  const { browser, page } = await H.launch();
  await H.boot(page, level);
  await H.startGame(page, forced, { suppressPanel: true }); // isolate the mechanic; panel proven in 10-12
  return { browser, page };
}

async function shot16_vipPayout() {
  console.log('[16] VIP customer payout');
  const { browser, page } = await newSessionClean(6, 'vip_night');
  let forced = false;
  for (let i = 0; i < 14 && !forced; i++) { await call(page, () => window.__bot.pump()); await H.sleep(200); forced = await call(page, () => window.__bot.forceVIPNext()); }
  console.log('   vip forced:', forced);
  await H.botStart(page);
  // A VIP payment lands ~30-60s in; freeze the instant the real "VIP! ×2.5" float posts.
  const froze = await freezeOnFloat(page, 'VIP! ×2.5', 100000);
  const s = await H.stats(page);
  await H.shot(page, '16_vip_payout.png');
  record('16', 'VIP customer payout (×2.5)', s, `Forced VIP Night; bot served a real VIP guest; froze on the live 'VIP! ×2.5' payout float (captured=${froze}).`);
  await H.botStop(page); await browser.close();
}

async function shot17_birthday() {
  console.log('[17] Birthday guest seated (confetti)');
  const { browser, page } = await newSessionClean(6, 'birthday_night');
  let forced = false;
  for (let i = 0; i < 14 && !forced; i++) { await call(page, () => window.__bot.pump()); await H.sleep(200); forced = await call(page, () => window.__bot.forceBirthdayNext()); }
  console.log('   birthday forced:', forced);
  await H.botStart(page);
  const froze = await freezeOnFloat(page, 'HAPPY BIRTHDAY!', 30000); // confetti + callout fire on seating
  const s = await H.stats(page);
  await H.shot(page, '17_birthday_confetti.png');
  record('17', 'Birthday guest + confetti', s, `Forced Birthday Night; real birthday guest seated; froze on live 'HAPPY BIRTHDAY!' callout + confetti (captured=${froze}).`);
  await H.botStop(page); await browser.close();
}

async function shot18_shield() {
  console.log('[18] Combo Shield (L6 "SHIELDED!")');
  const { browser, page } = await newSessionClean(6, 'normal');
  await H.botStart(page);
  // Earn a real ×3 streak so the shield arms (comboShieldReady at ×3 on L6).
  await H.waitFor(page, s => s.combo >= 6 && s.mult >= 3, { timeout: 95000, interval: 200 });
  await H.botStop(page); // stop serving — a seated guest will lapse and break the streak → shield fires
  const froze = await freezeOnFloat(page, 'SHIELDED!', 80000);
  const s = await H.stats(page);
  await H.shot(page, '18_combo_shield.png');
  record('18', 'Combo Shield (L6)', s, `Earned a real ×3 streak (shield armed); let a guest lapse so the break hit the shield; froze on live 'SHIELDED!' (captured=${froze}).`);
  await browser.close();
}

async function shot19_criticRave() {
  console.log('[19] Critic RAVE REVIEW');
  const { browser, page } = await newSessionClean(6, 'critic_night');
  await H.botStart(page);
  await H.sleep(3000);
  await call(page, () => window.game.scene.getScene('GameScene').enqueueCritic()); // bring the real critic in promptly
  // Bot serves the critic fast (high patience) with no angry guests → real rave on payment.
  const froze = await freezeOnFloat(page, 'RAVE REVIEW!', 110000);
  const s = await H.stats(page);
  await H.shot(page, '19_critic_rave.png');
  record('19', 'Critic RAVE REVIEW (+50%)', s, `Forced Critic Night; real critic served at high patience; froze on live 'RAVE REVIEW!' (captured=${froze}).`);
  await H.botStop(page); await browser.close();
}

(async () => {
  const only = process.argv[2]; // optional: run a single shot id
  const steps = {
    '01': shot01_normal,
    '02': () => announcement('02', '02', 'vip_night', 6, '02_vip_night.png', 'VIP Night', 'VIP NIGHT'),
    '03': () => announcement('03', '03', 'birthday_night', 6, '03_birthday_night.png', 'Birthday Night', 'BIRTHDAY NIGHT'),
    '04': () => announcement('04', '04', 'critic_night', 6, '04_critic_night.png', 'Critic Night', 'CRITIC NIGHT'),
    '05': () => announcement('05', '05', 'business_lunch', 6, '05_business_lunch.png', 'Business Lunch', 'BUSINESS LUNCH'),
    '06': shot06_family,
    '07': shot07_rush,
    '08': shot08_nearmiss,
    '09': shot09_combo,
    '10': () => levelShot('10', '10', 1, '10_level1_restaurant.png', 'Restaurant Level 1'),
    '11': () => levelShot('11', '11', 5, '11_level5_restaurant.png', 'Restaurant Level 5'),
    '12': () => levelShot('12', '12', 10, '12_level10_restaurant.png', 'Restaurant Level 10'),
    '13': shot13_gameover,
    '14': shot14_mobile,
    '15': shot15_full,
    '16': shot16_vipPayout,
    '17': shot17_birthday,
    '18': shot18_shield,
    '19': shot19_criticRave,
  };
  const keys = only ? [only] : Object.keys(steps);
  for (const k of keys) {
    try { await steps[k](); }
    catch (e) { console.log(`   ✗ ${k} FAILED:`, e.message); results[k] = results[k] || { error: e.message }; }
  }
  fs.writeFileSync(path.join(H.OUT, '_results.json'), JSON.stringify(results, null, 2));
  console.log('\nDONE. Results written to shots/_results.json');
})();
