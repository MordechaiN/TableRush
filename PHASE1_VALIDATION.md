# PHASE 1 VALIDATION REPORT

**Date:** 2026-06-02
**Version:** v0.7.0 Phase 1
**Method:** Automated Playwright screenshots + code inspection + game state logging

---

## TESTS

### Test 1: Single Dominant Action System

**Evidence:** Screenshots 05–06, game state logs

Screenshot 05 (single customer requesting):
- One customer at table 4 (center-bottom) shows ❓ bubble with green patience bar
- All other 4 tables are empty and quiet — no competing signals ✓

Screenshot 06 (two customers requesting simultaneously):
- Table 0 (top-left) and Table 4 (center-bottom) both show ❓ bubbles
- Both tables have identical visual appearance — **no visible difference between primary and secondary**

**Finding:** The priority hierarchy logic is correctly implemented in code (table 0 = primary at 1.0x alpha, table 4 = secondary at 0.35x). However, the pulse rings are **not visually detectable** in screenshots or during play at the current implementation:

- The rings are 4px `strokeRoundedRect` drawn on a Graphics object
- The tween oscillates alpha from ~0.5 to ~0.1 for primary, and ~0.175 to ~0.035 for secondary
- At 0.035–0.1 alpha on a warm beige tablecloth with mahogany border, neither variant is readable
- The dimming from 1.0x → 0.35x has no practical visual impact when the base is already barely visible

**Verdict: PARTIALLY IMPLEMENTED.** Code hierarchy is correct. Visual expression is insufficient.

---

### Test 2: Order Taking Flow

**Evidence:** Screenshots 07–09, game state logs

Screenshot 07 (400ms after tapping table — player has arrived):
- Player is standing at table 4
- Customer at table 4 shows SUSHI 🍣 bubble (orange border, food emoji) — order assigned ✓
- Customer at table 0 STILL shows ❓ bubble — unrelated customer unaffected ✓
- Kitchen ticket for sushi appears in the rail ✓

The walk from player start position (240, 700) to table 4 (240, 610) is ~90px at roughly 200–250ms travel time, which is shorter than the 400ms capture window. As a result:
- ❓ bubble staying visible **during the walk** cannot be confirmed by screenshot timing alone
- Code analysis confirms it: `hideBubble()` was removed from `takeOrder()` start — the ❓ persists until `showOrderBubble()` overwrites it on arrival ✓

Order flash (`showOrderFlash()`): warm tint + alpha flash clears in ~280ms — too transient for still capture. The flash exists and fires in code; not confirmable by screenshot.

Food emoji bubble pop-in (Back.easeOut scale punch): confirmed working from screenshots 07–09 — the bubble goes from ❓ to 🍣 in the same smooth animation.

**Verdict: IMPROVED.** The premature hideBubble() removal works. The ❓ stays until arrival. Food emoji transition confirmed. Order flash is too brief to photograph but fires correctly.

---

### Test 3: Kitchen Prioritization

**Evidence:** Screenshots 10–11, game state logs

Screenshot 10 (order ready):
- Kitchen ticket shows ✓ checkmark badge (order is ready) ✓
- Multiple requesting customers still have ❓ bubbles
- **No visible orange glow around the kitchen counter** — same problem as table pulse rings

Screenshot 11 (carrying food):
- Player is near kitchen with tray + plate + sushi emoji visible above head ✓
- `carryingOrderId = 0` confirmed by log ✓
- Kitchen glow should now be OFF (player picked up order) — cannot confirm visually since it was invisible before pickup too

Code confirms: `setKitchenGlowPrimary()` starts the glow tween at maxAlpha=0.7 (primary) or maxAlpha=0.25 (secondary). The glow is a 4px orange border on the kitchen rectangle, which blends into the dark kitchen texture.

**Verdict: LOGIC CORRECT, VISUAL EXPRESSION INSUFFICIENT.** Kitchen becomes primary when appropriate (no carry, order ready), secondary when not. Not visually apparent to the player.

---

### Test 4: New Player First Experience

**Evidence:** Screenshots 01–03

Screenshot 01 (main menu):
- Clean, readable main menu. PLAY button prominent and clear ✓
- Shows level (Level 1) and high score (🏆 0) ✓
- No confusion about what to tap first ✓

Screenshot 02 (tutorial game start, Tip 1/6):
- Restaurant visible, timer at 3:00, player character at bottom ✓
- **Tutorial overlay text: "A customer arrived! Tap the TABLE to take their order."**
- Problem: the customer has NOT arrived yet when this text appears — screenshot shows empty restaurant

Screenshot 03 (3.5s later, Tip 2/6):
- Customer now visible at a table with ❓ bubble
- **Tutorial text: "Order taken! It's cooking in the kitchen. When it's ready, tap the KITCHEN to pick it up."**
- **This is WRONG.** The text says "Order taken!" but the player hasn't taken any order. The customer just arrived. The tutorial step advancement triggers when the customer ARRIVES (in `trySpawnCustomer` onComplete), not when the player TAPS the table.
- The tutorial is showing the wrong message at the wrong moment

**Full new player experience sequence:**
1. Tap PLAY → restaurant appears, empty, timer starts, text says "A customer arrived!" but nothing is there yet
2. ~2s later — customer arrives, sits down, shows ❓ bubble, but text has JUMPED to "Order taken!" which is false
3. Player sees ❓ bubble and a text that doesn't match — confusion

**Verdict: TUTORIAL HAS A PRE-EXISTING BUG.** Step advancement triggers do not match their text messages. Phase 1 did not introduce this bug, but did not fix it either. A new player's first experience is confusing.

---

## CRITICAL REVIEW

### What Improved

| System | Before Phase 1 | After Phase 1 |
|--------|---------------|---------------|
| Order taking | ❓ bubble disappeared the instant player tapped the table, before walking over — felt like the tap did nothing visible | ❓ stays visible during walk; food emoji appears on arrival with pop-in animation — interaction has visible continuity |
| Priority hierarchy | All tables pulsed at equal intensity — no dominant signal | Code hierarchy implemented: urgent > paying > carrying > kitchen > requesting > dirty; one table designated "primary" |
| Urgent detection | Patient < 25% was never visually distinguished from any other state | `setPriority('urgent')` auto-applied on patience < 25% — fast red pulse logic in place |
| Carry display | Already working from v0.6.0 (tray + plate + emoji) | Unchanged, confirmed working |
| Kitchen glow on/off | Glow started in `updateKitchenGlow()`, could conflict with alpha control | Glow teardown separated from startup; `setKitchenGlowPrimary` owns startup |

### What Is Still Confusing

1. **No clear "go here" indicator.** The pulse rings are too subtle (4px border, low alpha) to read at a glance. A player cannot look at the screen and instantly know which table needs attention. The intended primary/secondary dimming effect is invisible in practice.

2. **Tutorial text timing mismatch.** "Order taken!" fires when the customer arrives, not when the player serves them. A new player's first experience contradicts itself — the tutorial is telling them what's happening before they do anything.

3. **No "deliver here" signal.** When carrying food, there's no bold, obvious arrow or glow saying "bring it to THIS table." The kitchen_ready priority pulse on the destination table is supposed to handle this, but is barely visible.

4. **Patience bars are tiny.** At 36×5px, the patience bar communicates urgency only to players who are already looking for it. No ambient signal when the situation is about to become critical.

### What Still Feels Frustrating

1. **All customers look identical urgency-wise.** With 4 customers requesting simultaneously (screenshot 13), all 4 look exactly the same. No visual hierarchy is readable. The player must either know the table order or guess.

2. **No feedback when you tap an empty table.** If a player taps a table with no customer (or a customer in the wrong state), nothing happens and there's no indication why. Silent failure.

3. **Cook times are invisible.** The kitchen ticket shows a small progress bar, but at the bottom of a packed ticket rail, it's hard to tell how close orders are to finishing.

### What Still Feels Unfinished

1. The pulse ring system is structurally sound but needs a visual redesign — the current ring is too thin and too low-alpha to function as the primary gameplay signal.
2. Customer personality (names, patience modifiers) is entirely absent.
3. No audio (all states are visually equivalent in loudness).
4. Combo counter is invisible at ×1.0 — there's no signal that a combo system exists until 3+ customers are served.

---

## SELF CRITIQUE — 5 BIGGEST REMAINING PROBLEMS

Ranked by severity (impact on player fun × frequency of occurrence):

### #1 — PRIORITY VISUALIZATION DOES NOT WORK IN PRACTICE
**Severity: Critical**

The pulse rings are 4px `strokeRoundedRect` lines that oscillate at 0.035–0.5 alpha range. On a cream tablecloth with a mahogany border texture, they are invisible or barely perceptible. A player cannot look at the restaurant and instantly know where to go. This defeats the entire purpose of Phase 1 ("obvious next action"). The urgencyMultiplier dimming (1.0 vs 0.35) is meaningless when neither value produces a visible ring.

**Root cause:** The ring is drawn as a thin line border on the same layer as the table. It needs to be either: (a) a solid filled shape with higher alpha, (b) a bright glow with bloom/shadow effect, or (c) replaced with an arrow/icon overlay that is always visible at full alpha and never tweened below readability threshold.

### #2 — PATIENCE VALUES GIVE NO TENSION IN THE FIRST 60 SECONDS
**Severity: High**

Tier 1 patience is 90–120 seconds. For the first 60 seconds of a 3-minute game, no customer will ever get close to leaving. The player has no urgency. The emotional arc requires urgency within 30s (per RESTAURANT_FANTASY.md). The BALANCE_REDESIGN.md prescribed Tier 1 at 110–140s to help learners, but even that may be too generous if it eliminates all tension in the learning phase.

**This is Phase 2 territory but is a major current gap.**

### #3 — TUTORIAL TEXT IS WRONG (PRE-EXISTING BUG)
**Severity: High**

"Order taken!" fires when the customer arrives, before the player has done anything. The first 90 seconds of any new player's experience is a tutorial that gives false information. This is likely to cause confusion and distrust of the tutorial system.

### #4 — NO CLEAR "DELIVER HERE" VISUAL WHEN CARRYING FOOD
**Severity: Medium**

When the player picks up food, they should see an obvious, unmissable signal on the destination table. The current `kitchen_ready` priority pulse (the table's pulse ring when it becomes the destination) is subject to the same visibility problem as all pulse rings. A carrying player must remember which table ordered which food — not visible in the UI.

### #5 — CUSTOMER PERSONALITY IS COMPLETELY ABSENT
**Severity: Medium**

All 7 customer sprites have no names, no patience modifiers, no individual reactions. The design requires the player to "read the room" but every customer is identical in behavior. A Business customer should look obviously impatient. Nonno should look patient. Without this, the restaurant feels like a grid of identical timers.

---

## CONCLUSION

**Phase 1 goal: "Obvious next action, clear customer states, clear task priorities."**

**Code implementation:** Complete. The priority hierarchy, urgencyMultiplier, setUrgencyLevel, updateActionPriority, and order flow fix are all working correctly.

**Felt experience improvement:** Partial. The order flow is visibly better (❓ stays during walk). The priority system runs but produces no perceptible visual hierarchy for the player.

**Phase 1 is not yet meeting its goal.** The structural work is correct but the visual output of that work is insufficient. Before Phase 2 begins, the priority visualization needs to be redesigned so the "primary" action is unmistakably obvious to a player who has never seen the game before.

**Recommended fix before Phase 2:** Replace or augment the thin pulse ring with a bolder primary action indicator — an arrow, a solid alpha-flash, or a thick colored border that stays at readable opacity (minimum 0.5 alpha even at its dimmest tween point).

---

## DOCUMENTATION NOTE

Screenshots archived at: `screenshots/phase1_validation/`
Validation script: `validate_p1.mjs` (can be re-run after fixes)
