# LIVING RESTAURANT PLAN

**Date:** 2026-06-03
**Status:** Implementing now

---

## Problem

The restaurant is functional but frozen. Customers stand motionless. Nothing moves when the player does nothing. The space feels like a prototype, not a restaurant.

Target: watch 30 seconds of gameplay with no input. The world should feel alive.

---

## Changes

### 1. Waiter Rework
- **Player scale 1.25x** — player is the hero, must be visually dominant
- **Tray emoji 24px** (up from 18px) — food and dishes clearly readable from a distance
- **Deliver animation**: player extends forward/up when placing food (scale punch + lean)
- **Collect animation**: player dips to pick up dishes (downward scoop)

### 2. Customer Idle Behaviors

All behaviors self-managed inside Customer entity via periodic timer.

| State | Behavior |
|---|---|
| `requesting` | Shuffle in seat (x wiggle) every 2-4s |
| `waiting_food` | Tap table (lean forward) |
| `eating` | Chewing bob (rapid y oscillation) |
| `paying` | Wave for attention (x wiggle, more energetic) |

Started when customer is seated. Stopped when leaving.

### 3. Rush Hour System

Two waves in a 3-minute game:
- **Wave 1**: at 60s elapsed, 25s duration
- **Wave 2**: at 150s elapsed, 25s duration

Visual:
- "⚡ RUSH HOUR!" announcement (triggerCelebration style)
- Full-screen red tint overlay (alpha 0.04)
- Queue expands to max 3 (from 2)

Mechanics:
- Spawn interval × 0.5 (twice as fast)
- Queue max raised to 3

Recovery message after wave ends: "😌 Calming down..."

### 4. VIP Customer

- **Chance**: 10% per spawn (no VIPs during rush hour)
- **Visual**: gold tint body + floating 👑 crown with bob animation
- **Patience**: 70% of normal (impatient)
- **Reward**: 2.5× payment score + "⭐ VIP!" float + camera flash

### 5. Queue Life

- Customers who wait > 18s in queue leave in anger
- Score penalty: 50% of normal tier penalty
- Combo reset
- "Left! 😡" floating label
- Their `queueTimeout` is cancelled when seated

### 6. Dishwasher Steam

When dishes are deposited, 6 steam puffs burst from dishwasher top (visual reward).

---

## What Does NOT Change

- Restaurant layout, tables, kitchen
- Core scoring, combo, patience systems
- v1.1 restaurant flow (seating, dish carry, dishwasher)
- Any v1.0 visual polish

---

## Success Criterion

Press play. Do nothing for 30 seconds.
- Queued customers shuffle and react
- Seated customers bob, tap, chew, wave
- Kitchen steam rises
- Candles flicker
- Restaurant feels occupied and alive
