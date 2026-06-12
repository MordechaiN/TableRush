#!/usr/bin/env node
/**
 * TableRush P0+P1 Fix Script
 * Run AFTER restoring GameScene.ts:
 *   git show f9db47e4:src/scenes/GameScene.ts > src/scenes/GameScene.ts
 *   node apply_p0_fixes.mjs
 *   git add src/scenes/GameScene.ts && git commit -m 'fix(P0+P1): tutorial UX' && git push
 */
import { readFileSync, writeFileSync } from 'fs';

let src = readFileSync('src/scenes/GameScene.ts', 'utf-8');
const orig = src;

const patches = [
  // ── P0.1 ── Tutorial card above queue zone (was y=796, covered customers at y=760)
  [
    'const cardY = GAME_HEIGHT - 58;',
    'const cardY = GAME_HEIGHT - 192;  // raised: clear of queue zone (y=760) and player (y=700)'
  ],

  // ── P0.2 ── Tutorial spotlight step 2: full kitchen zone, not just cooking side
  [
    '2: { x: KITCHEN_X / 2, y: KITCHEN_Y, r: 50 },                     // cooking zone',
    '2: { x: KITCHEN_X, y: KITCHEN_Y, r: 80 },                          // full kitchen tap zone'
  ],

  // ── P0.3 ── Tutorial step 2 text: tell player to WATCH, not tap immediately
  [
    "'Order sent! Tap the KITCHEN when the food is cooked.',",
    "'Cooking now! Watch for the green READY! glow, then tap KITCHEN.',"
  ],

  // ── P0.4 ── Tutorial step 4 text: hint about eating bar and $ signal
  [
    "'They\\'re enjoying the meal. Tap the TABLE once they\\'re ready to pay.',",
    "'They\'re eating! Watch the bar fill. When you see $, tap the TABLE.',"
  ],

  // ── P0.5 ── Tutorial step 5: clearer dirty table instruction
  [
    'Time to clean up \u2014 tap the TABLE to collect the dirty dishes.',
    'Tap the DIRTY TABLE to pick up the dishes.'
  ],

  // ── P0.6 ── Tutorial step 6: location hint for dishwasher
  [
    "'Now carry the dishes to the DISHWASHER.',",
    "'Carry them to the DISHWASHER \u2014 it\'s glowing amber on the left.',"
  ],

  // ── P0.7 ── Force Salad (1500ms) during tutorial — eliminates up-to-4s dead wait
  [
    '      // Auto-assign a random menu item\n      const itemId = Math.floor(Math.random() * MENU_ITEMS.length);',
    '      // Salad (itemId=0, 1500ms) during tutorial eliminates long dead-wait on first play\n      const itemId = (this.tutorialActive && this.tutorialStep <= 2) ? 0 : Math.floor(Math.random() * MENU_ITEMS.length);'
  ],

  // ── P1.1 ── Kitchen premature tap: give "Still cooking..." feedback instead of silence
  [
    '    if (readyOrders.length === 0) return;\n\n    this.playerBusy = true;\n    this.player.walkTo(KITCHEN_X, KITCHEN_Y + 50',
    '    if (readyOrders.length === 0) {\n      const cooking = this.kitchenOrders.filter(o => !o.ready).length;\n      if (cooking > 0) {\n        this.showFloating(\'Still cooking...\', KITCHEN_X, KITCHEN_Y + 60, \'#FFAA44\', 0.8);\n      }\n      return;\n    }\n\n    this.playerBusy = true;\n    this.player.walkTo(KITCHEN_X, KITCHEN_Y + 50'
  ],

  // ── P1.2 ── READY! pop stays visible 2.8s instead of 1.1s (easily missed)
  [
    "duration: 600, delay: 1100, ease: 'Quad.easeIn',\n          onComplete: () => container.destroy(),",
    "duration: 600, delay: 2800, ease: 'Quad.easeIn',\n          onComplete: () => container.destroy(),"
  ],
];

let applied = 0;
for (const [from, to] of patches) {
  if (src.includes(from)) {
    src = src.replace(from, to);
    applied++;
    console.log(`\u2713 ${from.slice(0, 55).trim()}...`);
  } else {
    console.warn(`\u2717 NOT FOUND: ${from.slice(0, 55).trim()}...`);
  }
}

if (src === orig) {
  console.error('\nNo patches applied. Is GameScene.ts the correct version?');
  console.error('Restore it first: git show f9db47e4:src/scenes/GameScene.ts > src/scenes/GameScene.ts');
  process.exit(1);
}

writeFileSync('src/scenes/GameScene.ts', src, 'utf-8');
console.log(`\nDone: ${applied}/${patches.length} patches applied.`);
console.log('Next: git add src/scenes/GameScene.ts && git commit -m \'fix(P0+P1): tutorial UX\' && git push');
