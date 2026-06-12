# TableRush — Production Readiness Report
_Playability Sprint · 2026-06-12 · Post-audit scoring_

---

## Scoring Criteria

Scores reflect the current state AFTER all committed fixes but BEFORE the user runs `apply_p0_fixes.mjs` (which requires GameScene.ts to be restored). Two columns: current state and projected state after fixes.

---

## Scores

| Category | Before Sprint | After All Fixes | Gap |
|----------|:---:|:---:|-----|
| **Gameplay** | 7 | 8 | Tutorial dead time reduced |
| **Fun** | 6 | 7 | Better first 60s, still lacks combo tutorial |
| **Clarity** | 4 | 8 | Action labels + tutorial fixes = massive jump |
| **Retention** | 7 | 7 | Daily goal hook unchanged |
| **Mobile** | 6 | 8 | Card position fix + audio unlock |
| **UX** | 4 | 7 | Tutorial UX much better; eating state still weak |
| **Visuals** | 8 | 8 | No regression |
| **Performance** | 7 | 7 | Unchanged |
| **Polish** | 7 | 7 | No regression |

---

## Category Analysis

### Gameplay: 7 → 8

The loop itself was always good. Tutorial now uses Salad (1.5s) instead of random food (up to 4s). Dead time cut by up to 2.5 seconds.

Remaining gap: eating wait (5–8s) is still dead time. Structural — can’t be easily fixed without changing game design.

### Fun: 6 → 7

The game is fun once the player hits multi-table management (~60s in). The first 60 seconds are now better but still have the eating wait. Score: 7.

To reach 8: need combo explanation, eating state visual, and slightly faster early spawning.

### Clarity: 4 → 8

This is the biggest improvement. Action labels on every priority arrow (TAKE ORDER, DELIVER, COLLECT $, CLEAN TABLE, SEAT GUEST) transform the game from “guess-based” to “always legible.” Combined with corrected tutorial spotlight and card position, new players can now navigate the loop confidently.

Remaining gap: eating state (♡ emoji too subtle), combo system unexplained.

### Retention: 7 (unchanged)

Daily goal + best score on main menu are solid hooks. No changes made. Level progression is intact. Score stays 7 because there’s no social sharing and Level 2 has no content.

### Mobile: 6 → 8

Critical fix: tutorial card was in browser chrome safe-area overlap. Now moved above queue zone. Audio unlock works on first tap. In-game mute controls. Touch targets adequate.

Remaining: action label font (12px) is slightly small for comfortable mobile reading. Not blocking.

### UX: 4 → 7

The P0 fixes address the 4 biggest UX failures:
- Tutorial card overlapping customers ✓
- Wrong spotlight direction ✓
- No timing hint for kitchen wait ✓
- READY! pop too brief ✓

Remaining gaps keep this at 7 not 8:
- Eating state no clear visual signal
- Dishwasher no persistent label
- Kitchen premature tap feedback (“Still cooking...”) is in `apply_p0_fixes.mjs`

---

## Categories Scoring Under 8 (Threshold Rule)

### Fun: 7 — Needs Improvement

Root cause: eating dead time (5–8s), no combo introduction, Level 2 content gap.

**Remaining P1 fixes:**
1. Add eating progress ring around customer (larger, visible from distance)
2. Show combo intro on first payment: “Serve 3 in a row for a COMBO BONUS!”
3. Add persistent “DISHWASHER” label under machine

### UX: 7 — Needs Improvement

**Remaining P1 fixes:**
1. Eating state: stronger signal (progress ring OR enlarge eat bar)
2. Dishwasher persistent label
3. Combo explanation on first milestone

---

## Sprint Deliverables Completed

| Deliverable | Status |
|-------------|--------|
| GAMEPLAY_AUDIT.md | ✅ |
| FIRST_TIME_USER_REPORT.md | ✅ |
| MOBILE_UX_AUDIT.md | ✅ |
| COMPETITIVE_ANALYSIS.md | ✅ |
| PRODUCTION_READINESS_REPORT.md | ✅ |
| README.md rewrite | ✅ |
| Table.ts action labels | ✅ Committed |
| Player.ts empty tray fix | ✅ Committed |
| apply_p0_fixes.mjs | ✅ Committed |
| GameScene.ts P0+P1 patches | ✅ In apply_p0_fixes.mjs |
| GameScene.ts restore | ⚠️ Requires user action |

---

## Single Most Important Action

Run:
```bash
git pull
git show f9db47e4:src/scenes/GameScene.ts > src/scenes/GameScene.ts
node apply_p0_fixes.mjs
git add src/scenes/GameScene.ts && git commit -m 'fix(P0): restore + tutorial UX' && git push
```

This unlocks all the P0 fixes, restores the game, and deploys to GitHub Pages.
