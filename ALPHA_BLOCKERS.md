# ALPHA_BLOCKERS.md

> Created: 2026-06-04  
> Purpose: Honest pre-release audit. Every reason this game is not ready for public release, ranked by player impact.

---

## VERDICT

A player who tries TableRush today will experience a collection of restaurant mechanics. They will not experience a restaurant. The systems are all present. The experience is not.

---

## COMPLETE ISSUE LIST (ranked by player impact)

### #1 — INDICATOR OVERLOAD (blocks game readability instantly)
Every table arrow pulses simultaneously at all times — even "secondary" ones at 35% scale. A new player opens the game and sees 5 colored arrows all flashing at once over 5 tables. There is no clear "do this now" signal. There is visual chaos. The priority system exists in code but is invisible to the player.

**Root cause**: `setUrgencyLevel(false)` sets arrow scale to 0.25 — still visible. Secondary arrows should be alpha=0 (hidden), not smaller.

---

### #2 — CUSTOMERS DO NOT APPEAR SEATED (breaks suspension of disbelief in 3 seconds)
When a customer is seated, they move to `table.y - 24`. The table front-face overlay starts at `table.y - 5`. This leaves 51px (71%) of the customer's 72px sprite visible above the table. The customer appears to be standing in the table, not sitting at it. The back chair (at `table.y - 54`, depth 0) is entirely covered by the customer (depth 15) so it appears to not exist.

**Root cause**: Customer Y should be `table.y - 6` so the overlay covers their lower body, showing only head + upper chest. This also makes the chair back visible above the customer head.

---

### #3 — SINGLE-ITEM CARRY MAKES WAITER FEEL ROBOTIC
The player can carry exactly 1 dish at a time. With 5 tables potentially ready simultaneously, the player makes 5 separate kitchen-to-table trips. This feels like a to-do list, not a restaurant. The game has a `CarrySystem.ts` with multi-slot support already built. It is not used.

**Root cause**: `carryingOrderId` (single integer) replaces the CarrySystem. Need 2-slot tray: one kitchen trip = up to 2 dishes = up to 2 table deliveries.

---

### #4 — FOOD HAS NO PHYSICAL PRESENCE
When an order finishes cooking, nothing visible happens in the world. The ticket gets a ✓ badge. The kitchen glow pulses. But there is no PLATE on the counter. Food teleports from "kitchen queue" to "player's hands" when the player taps the kitchen zone. A real restaurant game should have food visible on the pickup counter before the player grabs it.

**Root cause**: `onOrderReady()` only updates the ticket UI. No world-space plate spawned on the counter.

---

### #5 — DIRTY DISH WORKFLOW IS A FULL STOP
Picking up dirty dishes sets `carryingDirty = true`, which blocks: table interactions (order taking, food delivery, seating), kitchen access, and seating arrows. The player is forced to drop everything and walk to the dishwasher before resuming. This creates hard flow interruptions that feel punishing, not strategic. A server clears tables AS PART OF their flow — not instead of it.

**Root cause**: `onTableClick()` and `onKitchenClick()` both `return` early when `carryingDirty`. Removing these gates + giving dirty dishes a separate visual resolves it.

---

### #6 — WAITER HAS NO PHYSICAL WEIGHT OR AGENCY
The player clicks a table. The player character walks there. This is a cursor, not a person. The waiter has no sense of presence, urgency, or character. They execute instructions but don't feel like someone YOU are controlling.

**Partial fix direction**: Better visual state feedback (showing what player is carrying at all times), emotional reactions tied to player-controlled actions (not just customer reactions).

---

### #7 — TABLES ARE VISUALLY NOISY IN DIRTY STATE
Dirty tables have: orange tint on body, dirty overlay with plates/glass/fork/crumbs, AND a pulsing brown arrow. Three simultaneous signals for one state. The dirty overlay is detailed enough to be self-explanatory — the tint and arrow compound noise.

**Fix direction**: Remove the orange table tint when dirty. The overlay is enough.

---

### #8 — KITCHEN STATE IS STILL AMBIGUOUS
The cooking/ready zones are tinted differently (warm vs cool) but the split is subtle. When multiple orders are cooking, the ticket rail shows them but spatial ownership is unclear. Players don't know which order belongs to which table without reading the emoji and matching it mentally.

**Fix direction**: Add table numbers to the ready plates on the counter (implemented with blocker #4).

---

### #9 — SEATING ESCORT LOOKS LIKE TELEPORTATION
The customer walks from queue to their table position in 700ms via tween. The player simultaneously walks to `table.y + 40`. Both arrive and "sit" with a bounce. But the customer tween is position-only — it looks like they're being dragged across the floor, not walking. The customer facing direction doesn't change.

**Fix direction**: Use a more deliberate approach — customer walks slightly toward the player, then both proceed to table together.

---

### #10 — RESTAURANT DOES NOT FEEL ALIVE BETWEEN CUSTOMERS
When no customers are present (start of round, early game), the restaurant is silent and static. The ambient environment (candle flicker, sconce glow, kitchen steam) exists but nothing reacts to player presence. The space feels empty rather than waiting.

**Fix direction**: Add subtle idle animations per-zone: kitchen counter periodically emits a small steam puff; sconce lights gently flicker; ambient "restaurant hum" when near the dining room.

---

## IMPLEMENTED — TOP 5 BLOCKERS

### ✅ Blocker 1: Single-focus indicator
`setUrgencyLevel(false)` → `actionArrow.setAlpha(0)`. Only the #1 priority arrow is visible at any time.

### ✅ Blocker 2: Seated customer position
Customer Y when seated: `table.y - 24` → `table.y - 6`. Head + upper chest visible. Chair back now visible above customer.

### ✅ Blocker 3: Two-item tray carry
CarrySystem integrated with 2-slot capacity. One kitchen trip picks up up to 2 ready dishes. Tray shows both side-by-side. Deliver one item, keep the other on the tray.

### ✅ Blocker 4: Physical food on counter
When `onOrderReady()` fires, a plate graphic with food emoji appears on the READY counter zone. Removed when player picks it up. Shows table number for matching.

### ✅ Blocker 5: Non-blocking dirty dish workflow
Removed `carryingDirty` gates from `onTableClick()` and `onKitchenClick()`. Dirty dishes shown as a small badge on player (independent of food tray). Player can serve food while carrying dirty dishes. Dishwasher interaction clears the badge.

---

## PARTIAL FIXES — BLOCKERS 6–10

### ✅ Blocker 7: Dirty table visual noise
Removed `tableBody.setTint(0xFF6622)` from `setDirty()`. The dirty overlay (plates, glass, crumbs) communicates the state alone. No redundant orange tint.

### ↗ Blocker 6: Waiter agency
- Player shows `happy` emotion on: seating a customer, taking an order, delivering food
- Player shows `proud` emotion on payment collection (was already present)
- `Customer.faceDirection(toX)` flips bodySprite during escort — customer faces the table
- `Customer.walkBob(duration)` adds a scale bob during escort tween — looks like walking, not sliding
Remaining: player still feels like a cursor during idle. Physical weight from directional behavior not fully addressed.

### ↗ Blocker 8: Kitchen state ambiguous
Kitchen tickets now show table number badge (dark brown pill, gold number) so player can immediately match ready food to its table without reading emojis. Physical plates on counter (from Blocker 4) already show table number.

### ↗ Blocker 9: Seating escort looks like teleportation
Customer now faces escort direction and bobs during the 700ms escort tween. Significantly less like teleportation. A full multi-step escort (customer walks toward player first) remains as a future improvement.

### ↗ Blocker 10: Restaurant doesn't feel alive
- Kitchen emits ambient steam (25% chance) even with no active cooking orders
- Sconce glow pools now gently flicker (separate animated objects, 600–900ms alpha pulse)
- Candle flicker was already present; table glow pools are static (intentional)
