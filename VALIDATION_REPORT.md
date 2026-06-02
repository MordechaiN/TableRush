# VALIDATION REPORT — v0.2.0

**Date:** 2026-06-02
**Version:** v0.2.0
**Method:** Playwright headless browser automation (Chromium) + game state inspection via `window.game`
**Environment:** localhost:3000 (dev server, same code as production build)

---

## Results

| # | Test | Result |
|---|------|--------|
| 1 | Main Menu renders (canvas present, scene active) | ✅ PASS |
| 2 | PLAY button navigates to GameScene | ✅ PASS |
| 3 | Tutorial overlay shows on first session | ✅ PASS |
| 4 | Customer spawns and enters `requesting` state | ✅ PASS |
| 5 | Auto-order (tap table) adds to kitchen queue | ✅ PASS |
| 6 | Kitchen order becomes ready after cook time | ✅ PASS |
| 7 | Player picks up food from kitchen (carryingOrderId set) | ✅ PASS |
| 8 | Food delivered — customer transitions to `eating` | ✅ PASS |
| 9 | Customer transitions to `paying` after eating | ✅ PASS |
| 10 | Payment collected — score increases | ✅ PASS |
| 11 | Table becomes `dirty` after customer leaves happy | ✅ PASS |
| 12 | Table cleaned — returns to `empty` | ✅ PASS |
| 13 | No JS errors during gameplay (non-favicon) | ✅ PASS |
| 14 | Main menu shows level and high score (localStorage) | ✅ PASS |
| 15 | Settings scene loads | ✅ PASS |
| 16 | Credits scene loads | ✅ PASS |
| 17 | GameOver scene loads with star rating | ✅ PASS |
| 18 | Mobile viewport (390×844) renders correctly | ✅ PASS |
| 19 | High score persisted in localStorage | ✅ PASS |
| 20 | Progression data (XP, level, rounds) persisted | ✅ PASS |

**Score: 20/20 PASS**

---

## Additional Verification (Code + Visual)

| Item | Status | Notes |
|------|--------|-------|
| Angry customer leaves table EMPTY (not dirty) | ✅ PASS | `table.setEmpty()` in `customerLeaveAngry` |
| Combo multiplier: ×1.5 at 3 customers | ✅ PASS | COMBO_MILESTONES config verified |
| Combo names display (HOT STREAK, etc.) | ✅ PASS | `showComboAnnouncement` called on milestone |
| Speed multiplier applied to delivery score | ✅ PASS | Score 300 observed: $15 × 10 × 2.0 = 300 |
| Star rating: 3 stars if ≥90% happy AND score ≥2000 | ✅ PASS | Logic in `endGame()` |
| XP bar animates on GameOver screen | ✅ PASS | Tween verified in screenshot |
| Level-up flash on GameOver if new level | ✅ PASS | Tween with yoyo repeat in code |
| Confetti on new high score | ✅ PASS | Seen in GameOver 3-star screenshot |
| Time-based difficulty tiers | ✅ PASS | `getDifficultyTier(elapsed)` verified |
| Kitchen ticket rail shows order cards | ✅ PASS | Ticket visible in screenshot v_04 |
| Priority pulse: blue ring for requesting customer | ✅ PASS | Blue ring on table in screenshots |
| Tutorial marks done in localStorage | ✅ PASS | `tablerush_tutorial_done` key set |
| Tutorial skipped on subsequent sessions | ✅ PASS | Non-tutorial session confirmed |

---

## Known Issues

| Issue | Impact |
|-------|--------|
| Favicon 404 on first load | None — fixed with SVG inline favicon |
| 🍳 emoji may render differently on Linux | None — cosmetic font rendering only |
| No audio (settings toggles UI-only) | Known, documented since v0.1.0 |

---

## Build / Deployment

| Check | Status |
|-------|--------|
| `npm run type-check` | ✅ 0 errors |
| `VITE_BASE_PATH=/TableRush/ npm run build` | ✅ Passes |
| GitHub Actions CI triggers on main push | ✅ Configured |
| Public deployment | ⚠️ Requires one-time: Settings → Pages → Source → GitHub Actions |
| Public URL | https://mordechain.github.io/TableRush/ |
