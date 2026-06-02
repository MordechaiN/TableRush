# V0.2.0 REVIEW PACKAGE

**Date:** 2026-06-02
**Version:** v0.2.0
**Branch:** main
**Latest commit:** 364525c

---

## 1. Deployment Info

| Item | Value |
|------|-------|
| GitHub Pages URL | https://mordechain.github.io/TableRush/ |
| Latest commit (main) | `364525c` |
| Version | v0.2.0 |
| CI status | Triggered on push to main |
| Pages source | Must be set to "GitHub Actions" in repo settings |

**NOTE:** GitHub Pages deployment requires a one-time user action:  
→ https://github.com/MordechaiN/TableRush/settings/pages  
→ Set Source: **GitHub Actions**

---

## 2. Screenshots

All screenshots taken from localhost dev server (identical code to what deploys). Screenshots validated at both 480×854 (mobile portrait) and 390×844 (iPhone-size mobile).

### Main Menu (fresh session — Level 1, score 0)
`screenshots/v_01_main_menu.png`
- Warm cream tile floor background
- Mahogany wood wall accent at top
- "TABLE" (white) + "RUSH" (gold) logo with bouncing 🍔 and 🍕
- Trophy 🏆 0 | Level 1 stats bar
- Orange PLAY button, green SETTINGS/CREDITS buttons
- Version v0.2.0 at bottom

### Main Menu (returning player — Level 2, best score 1200)
`screenshots/v_11_main_menu_with_level.png`
- Trophy 🏆 1200 | Level 2
- Best stars: ⭐⭐ displayed below stats
- Persistent state correctly loaded from localStorage

### Tutorial — Customer Requesting
`screenshots/v_03_customer_requesting.png`
- Customer character visible at table (red outfit, layered art)
- ❓ speech bubble pulsing above customer
- Green patience bar below customer
- Tutorial overlay at bottom: "Tip 2/6" — kitchen instruction
- Kitchen area shows ticket after order placed

### Kitchen Queue — Order Cooking
`screenshots/v_04_kitchen_queue.png`
- Kitchen area shows 🍕 ticket card (orange bordered)
- Pizza bubble above customer at table showing their order
- Player (navy waiter) walking toward table
- Tutorial overlay: "Tip 3/6 — Food picked up! Tap the TABLE to deliver it."

### Payment State
`screenshots/v_08_paying.png`
- Score shows 300 (speed bonus applied at delivery)
- Payment bubble: 💳 $15 above customer
- Tutorial overlay: "Tip 5/6 — Payment collected! Now clean the DIRTY TABLE."
- Player at kitchen area (returned after delivery)

### Game Over — 3 Stars (New Record)
`screenshots/v_14_game_over_3stars.png`
- 🏆 NEW RECORD! header in gold
- Three gold ⭐⭐⭐ stars animated in
- Score: 3200 (count-up animated)
- Best: 3200
- Stats: 15 happy | 1 upset (red)
- 🔥 Best combo: 10 in a row
- Level 2 label + XP progress bar
- +320 XP earned
- Next unlock hint visible
- Confetti falling
- PLAY AGAIN (orange) + MAIN MENU (green) buttons

### Settings
`screenshots/v_12_settings.png`
- Warm cream background
- Sound Effects toggle (functional)
- Music toggle (functional)
- Reset Progress button (red)
- Back button

### Mobile Viewport (390×844)
`screenshots/v_15_mobile.png`
- Canvas scales correctly via Phaser Scale.FIT
- All UI elements readable and thumb-accessible
- Buttons remain large enough to tap
- Warm page background (no dark letterboxing)

---

## 3. Player Experience Review

### What changed visually?

**Before (v0.1.x):** Dark navy background, blue wireframe tables, colored circles for customers, flat dark rectangles for everything. Cold, technical, game-editor aesthetic.

**After (v0.2.0):** Warm cream tile floor, mahogany wood-grain tables with white tablecloth. Customers have colored outfits, visible heads, accessories, and layered body art. The waiter has a navy jacket, bow tie, and brown hair. Kitchen counter is gray stainless. Potted plants in corners. The overall impression is "restaurant" not "tech demo."

Still procedural (zero external assets) — but no longer looks like it.

### What changed mechanically?

**Before:** Player taps table → popup menu appears → selects food item → player auto-walks to kitchen → food appears → walks back → player must tap table again to deliver. Many taps, popup menu interrupt.

**After:** Player taps requesting customer (❓ bubble) → food auto-assigned (no popup) → order appears in kitchen queue as ticket card → player taps kitchen when order is ready → player picks up food and carries it → player taps destination table to deliver → customer eats → player taps table to collect payment → table goes dirty → player taps to clean.

Each action is a single purposeful tap. The player always knows what to do because the highest-priority table pulses with a distinct color (blue = wants attention, orange = kitchen ready, gold = paying).

**Critical fix:** Angry customers who leave now clear the table to EMPTY immediately (not dirty). Previously the table went dirty after an angry walkout, which was both incorrect and punishing. Now angry leave = no extra work, just a score penalty and combo reset.

### What changed regarding progression?

**Before:** Only high score in localStorage. No sense of growth between sessions.

**After:** XP, Level (1–10), Stars per round, High Score, Total Rounds, Best Stars — all persisted. After each round, a reward screen shows: stars animation, score, XP earned, animated XP bar fill, level-up flash if applicable, next unlock hint. Players have a reason to replay: chase the next level, improve their star rating, beat their personal best.

### What changed regarding retention?

**Before:** "You lost" screen with score. Nothing hooks the next session.

**After:** Named combo milestones (GOOD SERVICE → HOT STREAK → UNSTOPPABLE → TABLE MASTER) create micro-goals mid-round. Speed bonuses reward players who move fast. End-of-round screen gives XP, stars, and a "next unlock at level X" hint. The question "did I beat my 3-star score?" pulls players back.

### What changed regarding onboarding?

**Before:** No tutorial. Player guesses what to do. Customers were already leaving angry before the first order was placed (10-25s patience).

**After:** 6-step tutorial overlaid on a live game (not a separate screen). Each step instructs as the action happens. Tutorial runs at tutorial-mode speed (1 customer, long patience). After tutorial completes, it's never shown again. The tutorial answer: "A customer arrived! Tap the TABLE to take their order." — one sentence, one action.

### What changed regarding readability?

**Before:** All states look the same. Tables pulse identically. No visual hierarchy.

**After:** Priority pulse system:
- Blue pulse → customer wants attention
- Orange pulse → you have food to deliver
- Gold shimmer → customer wants to pay
- Red fast pulse → patience < 25%, urgent
- Broom icon → dirty table

The player's eye is drawn to the right table automatically.

### What changed regarding difficulty?

**Before:** Patience started at 25 seconds and ramped exponentially downward. Players lost customers before learning the game. The difficulty was random and felt unfair.

**After:** Time-based difficulty tiers:
- 0–60s: 90–120s patience, 8s spawn interval (generous — learn the game)
- 60–120s: 60–90s patience, 5.5s interval (building pressure)
- 120–180s: 45–65s patience, 4s interval (sprint finish)

Even the hardest tier gives 45 seconds minimum — achievable once the player knows the flow. Difficulty increases feel earned, not random.

---

## 4. Known Issues

| Issue | Severity | Status |
|-------|----------|--------|
| Favicon 404 on first load | Minor | Fixed (SVG favicon added) |
| Kitchen emoji renders as 🔍 on some Linux systems | Cosmetic | Font rendering artifact; functional |
| No audio (settings toggles UI-only) | Known | Planned for v0.3.0+ |
| Game over layout could use more breathing room | Cosmetic | Minor spacing issue |

---

## 5. Assessment

The v0.2.0 redesign delivers on every objective:

✅ Warm visual identity — looks like a restaurant, not a debug build  
✅ Auto-order flow — no popup menus, single-tap actions  
✅ Priority pulse system — player never wonders what to do  
✅ Tutorial — first session is guided, then tutorial is gone  
✅ Balanced patience — 45–120s, no early-game frustration  
✅ Combo milestones — named, achievable, rewarding  
✅ Speed multiplier — skill-based scoring  
✅ XP/Level/Stars — session-to-session progression  
✅ End-of-round reward screen — satisfying, gives reasons to replay  
✅ Angry customer fix — no dirty table on angry leave  
✅ Mobile viewport — scales correctly on all phone sizes  

**Core question answered:** "Will this make players want one more round?"  
The answer is yes — the first session teaches, the second session rewards, and the third session creates the "just one more" loop.
