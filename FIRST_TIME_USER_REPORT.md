# First-Time User Report
_TableRush v1.0.0 · 2026-06-12 · Method: Code walkthrough from player’s perspective_

---

## The First 30 Seconds (frame-by-frame)

```
t=0s    Game loads. Restaurant visible. Waiter at center-bottom (y=700).
        Player sees: warm, detailed restaurant. No instruction yet.
        WAIT: 800ms delay before first customer arrives.

t=0.8s  Customer walks in from bottom.
        Tutorial card appears at bottom of screen.
        Text: "Guest at the door! Tap a TABLE to seat them."
        Spotlight rings TABLE 1 (top-left).

        CONFUSION RISK: Player may tap the CUSTOMER instead of the TABLE.
        Customer is prominent and animated. Table is at the top-left corner.
        Affordance is unclear: why does tapping a table seat someone at the door?

t=2s    Player taps table 1. Waiter + customer walk.
        Tutorial advances.
        Text: "They're ready to order! Tap the TABLE to take their order."
        Blue arrow + TAKE ORDER label. Customer shows ? bubble.

        Clear. Player taps table. Order taken.

t=3s    Tutorial step 2: "Cooking now! Watch for the green READY! glow..."
        Spotlight on kitchen (center zone, r=80).
        Food cooking visual (pot bobbing on burner).
        Kitchen ticket appears on rail.

        DEAD TIME: 1.5s (Salad, after P0 fix). Was up to 4s (Pizza).
        Player has no task. Watches.

t=4.5s  Green glow + READY! pop. Ding sound.
        READY! now stays visible 2.8 seconds (after fix).
        Player taps kitchen. Food picked up.

t=5s    Orange arrow + DELIVER on table 1.
        Player taps table. Food delivered.
        Customer eating animation starts.

t=5.5s  Tutorial step 4: "They're eating! Watch the bar fill..."
        Eating bar fills below customer sprite.

        DEAD TIME: 5–8 seconds.
        Player watches. Has no task.

t=11s   Customer finishes eating. $ bubble. Gold arrow + COLLECT $.
        Player taps. Payment burst!

t=12s   Tutorial step 5: "Tap the DIRTY TABLE to pick up dishes."
        Table goes dirty. Brown arrow + CLEAN TABLE.
        Player taps. Dishes in hand.

t=13s   Tutorial step 6: "Carry them to the DISHWASHER..."
        Amber glow on dishwasher (top-left, y=196).
        Spotlight on dishwasher.
        Player walks there (~1.5s walk).

t=15s   Dishwasher deposit. "You're all set!"
        Tutorial complete. Spawn cycle starts.

t=17s   Second customer arrives. No tutorial.
        Player on their own.
```

---

## Points of Confusion (post-P0 fixes)

| # | Where | Issue | Severity |
|---|-------|-------|----------|
| 1 | Tutorial step 0 | Tapping table to seat someone at the door isn't obvious | Medium |
| 2 | Tutorial step 3 | 1.5s dead wait (improved from 4s) | Low |
| 3 | Tutorial step 4 | 5-8s dead wait still exists | Medium |
| 4 | Eating state | ♡ emoji is too subtle. Player taps occupied table, gets nothing | Medium |
| 5 | Combo system | ×1 shows but player doesn't know what it means | Medium |
| 6 | Dishwasher | No persistent label when NOT carrying dishes | Medium |
| 7 | Post-tutorial | Second customer appears, no guidance on multi-table | Low |

---

## 15-Second Understanding Test

**Question: Can a new player understand the game within 15 seconds?**

**Answer: Partially.** They understand:
- ✅ Seat guests by tapping tables
- ✅ Take orders by tapping tables
- ✅ Kitchen has food (READY! signal improved)
- ✅ Deliver food by tapping tables
- ❌ Don't yet understand eating wait is intentional
- ❌ Don't yet understand the combo system
- ❌ Don't yet understand why score bounced/changed

**The tutorial ends at ~15 seconds. The first two confusing dead waits (cooking + eating) take 7-10 seconds of that time.** The core seating/serving flow takes only ~5 seconds to demonstrate. This is the right ratio.

---

## What Needs to Happen for 100% First-Time Understanding

1. **Eating wait**: Add a mini-progress ring around the customer OR enlarge the eating bar so it’s readable from across the table
2. **Combo intro**: After first successful payment, flash “×1 COMBO — serve 3 in a row to multiply!”
3. **Dishwasher label**: Permanent “DISHWASHER” text under the machine at all times
4. **Seating clarity**: The queue zone footprints should be more visible (alpha 0.45 → 0.70+)
