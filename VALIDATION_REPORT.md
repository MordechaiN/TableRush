# VALIDATION REPORT — v0.6.0

**Date:** 2026-06-02
**Version:** v0.6.0
**Method:** TypeScript compiler (tsc) + Vite production build + code-level visual audit
**Environment:** Build output verified via `npm run build` (0 errors, 0 warnings beyond bundle-size advisory)

---

## v0.6.0 Visual Audit

| # | Item | Expected | Status |
|---|------|----------|--------|
| 1 | Customer face on HEAD (not body) | eyeY = −18 (head center −16) | ✅ FIXED |
| 2 | Patience bar above character | y = −42 pill 36×5px | ✅ IMPLEMENTED |
| 3 | Speech bubble above patience bar | y = −66, tail tip at −46 (4px gap) | ✅ IMPLEMENTED |
| 4 | Bubble shadow | fillStyle(0,0,0,0.15) offset +2,+2 | ✅ IMPLEMENTED |
| 5 | Eating bar below feet | y = +30 pill 36×4px | ✅ IMPLEMENTED |
| 6 | Player head outline | 1.5px #3C2010 strokeCircle(20,14,12) | ✅ IMPLEMENTED |
| 7 | Player body outline | 1.5px #0D1550 strokeRoundedRect | ✅ IMPLEMENTED |
| 8 | Player ears | fillCircle r=3.5 at (8,14) and (32,14) | ✅ IMPLEMENTED |
| 9 | Player skin #FDBA8C | Warm tone per ART_DIRECTION | ✅ IMPLEMENTED |
| 10 | All 7 customer variants: head outline | 1.5px #3C2010 strokeCircle(16,10,10) | ✅ IMPLEMENTED |
| 11 | All 7 customer variants: body outline | 1.5px #3C2010 strokeRoundedRect | ✅ IMPLEMENTED |
| 12 | All 7 customer variants: ears | fillCircle r=3 at (6,11) and (26,11) | ✅ IMPLEMENTED |
| 13 | Elegant: necklace arc+pendant | lineStyle #FFD700, arc+circle | ✅ IMPLEMENTED |
| 14 | Elegant: tall collar wings | Two 4×8 rects flanking neck | ✅ IMPLEMENTED |
| 15 | Business: wider body (+2px) | bodyW=22 vs 20 | ✅ IMPLEMENTED |
| 16 | Business: red tie | Triangle + rect down front | ✅ IMPLEMENTED |
| 17 | Trendy: sunglasses extend beyond head | Lenses at x=4-13 and x=19-28 (head at 6-26) | ✅ IMPLEMENTED |
| 18 | Romantic: flower extends beyond right head | Circle at x=25, extends to x=29.5 (beyond x=26) | ✅ IMPLEMENTED |
| 19 | Elder: shorter legs (8px vs 12px) | legH=8, legY=40 | ✅ IMPLEMENTED |
| 20 | Elder: glasses with extending temples | Temples to x=3 left, x=29 right (beyond 6-26) | ✅ IMPLEMENTED |
| 21 | Teen: cap brim extends beyond head | fillRect(4,6,24,3) — brim from x=4 to x=28 | ✅ IMPLEMENTED |
| 22 | Table checkered linen pattern | 8×8 grid, alternating #EEE8DF at 0.5 alpha | ✅ IMPLEMENTED |
| 23 | Kitchen pot on left-front burner | Pot body, rim, knob, two handles at (55,25) | ✅ IMPLEMENTED |
| 24 | Kitchen pan on right-back burner | Pan body, rim, long handle at (100,55) | ✅ IMPLEMENTED |
| 25 | Menu board (chalkboard) above kitchen | 200×58 texture, KITCHEN_Y−54, depth 2 | ✅ IMPLEMENTED |
| 26 | Menu board: food emoji row | "🥗  🍔  🍝  🍣  🍕" text overlay | ✅ IMPLEMENTED |
| 27 | Food plate background when carrying | food_plate texture at y=−55 in carry display | ✅ IMPLEMENTED |
| 28 | TypeScript build: 0 errors | `tsc && vite build` | ✅ PASS |

**Visual audit: 28/28 items verified**

---

## v0.2.0 Regression Tests (gameplay unchanged)

| # | Test | Result |
|---|------|--------|

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
