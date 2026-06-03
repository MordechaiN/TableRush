# RESTAURANT FLOW REDESIGN

**Date:** 2026-06-03
**Status:** Approved — implementing now

---

## Problem

The current game asks the player to manage tables but skips the most fundamental restaurant act: **seating a guest**. Customers teleport to tables. Dirty dishes disappear by touch. There is no reason for the player to move through the restaurant purposefully.

Players feel like a phone operator, not a restaurant host.

---

## New Restaurant Flow (13 Visible Steps)

1. Customer arrives at entrance — visible at the door, waiting in queue
2. Player taps an empty table — player walks to table
3. Customer walks from queue to table simultaneously
4. Customer is seated — shows request bubble, patience starts
5. Player taps table — player walks to take order
6. Order assigned → cooking ticket appears in kitchen
7. Player taps kitchen when food ready — player walks to pick up
8. Player walks to table carrying food on tray
9. Player taps table to deliver — customer eats (eating bar shows)
10. Customer finishes eating — shows payment bubble, patience restarts
11. Player taps table to collect payment — coins burst
12. Customer leaves — table shows dirty dishes
13. Player taps dirty table — picks up dishes (visible on tray)
14. Player walks to DISHWASHER station — taps to deposit
15. Table available for next seating

---

## Queue System

**Max queue size:** 2 customers waiting at entrance.

Queue positions (above entrance door, spread left/right/center):
- Slot 0: x=175, y=760
- Slot 1: x=245, y=760

When a slot opens (customer seated), remaining customers slide to front position.

**Seating arrow:** Empty tables show a purple arrow when queue is non-empty. Player clicks any empty table to seat the next waiting customer.

**Table state while player carries dirty dishes:** Seating arrows hide until dishwasher is cleared. Player can't seat while holding dirty dishes.

---

## Dirty Dish Carry System

**Flow:**
1. Customer leaves → `table.setDirty()` → dirty dishes visible
2. Player taps dirty table → player walks to table → `table.setEmpty()` → dishes appear on tray
3. `carryingDirty = true` — all non-dishwasher interactions blocked with "→ DISHWASHER!" message
4. Dishwasher zone pulses amber to guide player
5. Player taps dishwasher → walks to machine → deposits dishes → `carryingDirty = false`
6. Table back in rotation for seating

**Tray visual:** Same tray as food delivery. Plate shown with brown/dirty tint + 🍽️ emoji.

---

## Table Priority Arrows (Updated)

| State | Arrow Color | Action |
|-------|-------------|--------|
| `seating` | Purple | Tap to seat waiting guest |
| `requesting` | Blue | Tap to take order |
| `kitchen_ready` | Orange | Food delivered — tap to give |
| `paying` | Gold | Tap to collect payment |
| `dirty` | Brown | Tap to pick up dishes |
| `urgent` | Red (strobing) | Any — losing patience NOW |

---

## Dishwasher Station

Already drawn at x=8–64, y=172–220 (left wall, below kitchen).
- Becomes interactive zone
- Amber glow when player carries dirty dishes
- Status light changes green → amber when dishes needed

---

## Tutorial Updates (7 Steps)

0. "A guest is at the entrance! Tap an empty TABLE to seat them."
1. "Customer seated! Tap TABLE to take their order."
2. "Order in! Tap the KITCHEN when food is ready."
3. "Food ready! Tap TABLE to deliver it."
4. "Delivered! Collect payment when eating is done."
5. "Table dirty! Tap TABLE to pick up dishes."
6. "Tap the DISHWASHER to deposit the dishes!"

---

## What Does NOT Change

- Kitchen cooking/ready system unchanged
- Payment score calculation unchanged
- Combo/multiplier system unchanged
- Angry customer flow unchanged (leaves without dirty table)
- All v1.0 visual polish unchanged
