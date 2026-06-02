# BALANCE REDESIGN — TableRush

**Status: AWAITING APPROVAL — do not implement**
**Author: Claude Code**
**Date: 2026-06-01**

---

## 1. What Is Wrong Now

| Parameter | Current Value | Problem |
|-----------|--------------|---------|
| Initial patience | 25,000ms (25s) | Players lose customers in under 30 seconds of play |
| Minimum patience | 10,000ms (10s) | Functionally impossible to serve at late game |
| Spawn interval | 6,000ms start → 2,500ms min | Tables fill before player learns the game |
| Score on delivery | price × 10 | Arbitrary, no skill differentiation |
| Score on payment | (price + tip) × 10 + 50 | Tip feels invisible — player can't read it |
| Combo increment | +0.1 per payment | Too slow — takes 10 payments to reach ×2 |

**Net effect:** Game creates frustration, not flow. Players who don't already know the mechanics will lose 2–3 customers before their first successful serve. First impressions are failure.

---

## 2. Patience Values — Redesigned

Patience is measured in **seconds**. Three tiers used during difficulty ramp.

### Early game (rounds 1–3, first 90 seconds)
| Tier | Range |
|------|-------|
| Easy customers | 90–120 seconds |
| Medium customers | 75–105 seconds |

All customers in early game are Easy or Medium only.

### Mid game (90–150 seconds)
| Tier | Range |
|------|-------|
| Easy | 75–100 seconds |
| Medium | 60–80 seconds |
| Hard (rare) | 50–65 seconds |

Mix: 40% easy, 50% medium, 10% hard.

### Late game (150–180 seconds)
| Tier | Range |
|------|-------|
| Easy | 60–75 seconds |
| Medium | 50–65 seconds |
| Hard | 45–55 seconds |

Mix: 20% easy, 50% medium, 30% hard.

**Key principle:** Even the fastest late-game customer gives the player 45 seconds. At that point the player knows the game. This creates pressure without making failure feel random.

---

## 3. Customer Spawn Timing

| Time | Spawn interval |
|------|---------------|
| 0–30s | First customer only at 3s (instant introduction) |
| 30–60s | 8,000ms between spawns (relaxed intro) |
| 60–90s | 6,500ms |
| 90–120s | 5,500ms |
| 120–150s | 4,500ms |
| 150–180s | 3,500ms (busy end-rush) |

Minimum always: 3,000ms (no faster than one per 3 seconds).

Maximum tables occupied simultaneously: 4 of 5 (one table always kept available briefly to prevent total lockout).

---

## 4. Cook Times — Adjusted

| Item | Price | Cook Time | Why |
|------|-------|-----------|-----|
| Salad | $10 | 1,500ms | Fast, low value |
| Burger | $12 | 2,500ms | Reliable mid |
| Pasta | $13 | 3,000ms | Slightly slower |
| Sushi | $18 | 2,000ms | Premium, fast |
| Pizza | $15 | 4,000ms | Slow, rewarding |

Cook times are reduced from current values. Waiting 4 seconds for food while patience ticks was the hidden bottleneck. Now the bottleneck is player movement and decision-making, not idle waiting.

---

## 5. Score System — Redesigned

### Base score per serve

Score = `base_price × 10 × speed_multiplier × combo_multiplier`

### Speed multiplier
| Patience remaining when served | Multiplier | Label |
|-------------------------------|------------|-------|
| > 75% | ×2.0 | ⚡⚡ LIGHTNING |
| 50–75% | ×1.5 | ⚡ FAST |
| 25–50% | ×1.0 | (none) |
| < 25% | ×0.75 | 🐢 SLOW |

Speed multiplier applies to the **delivery** moment (when food reaches customer), not payment.

### Payment score
After customer eats and pays:
- Base tip: 20% of price
- Speed tip bonus: additional 0–30% based on patience remaining at delivery time
- Total payment score: `(price + tip) × 10 × combo_multiplier`

### Penalty for angry customer
- `−50 × difficulty_tier` (tier 1 = −50, tier 2 = −100, tier 3 = −150)
- Combo resets to ×1.0
- Score cannot go below 0

---

## 6. Combo Multiplier — Redesigned

| Consecutive happy customers | Multiplier | Display |
|-----------------------------|------------|---------|
| 0–2 | ×1.0 | — |
| 3–4 | ×1.5 | 🔥 HOT |
| 5–6 | ×2.0 | 🔥🔥 ON FIRE |
| 7–9 | ×2.5 | 🔥🔥🔥 BLAZING |
| 10+ | ×3.0 | 💫 UNSTOPPABLE |

Reset condition: any angry customer leaving.

**Rationale:** Current system requires 40 consecutive successes to reach ×5. Nobody achieves this. New system reaches ×1.5 at 3 customers (achievable in first 60 seconds) and caps at ×3.0 (attainable by skilled players in late game). Multiplier milestones happen often enough to feel rewarding.

---

## 7. Bonus Events

These are one-time score bonuses shown as floating text.

| Trigger | Bonus | Text |
|---------|-------|------|
| Delivered while patience > 75% | +50 | ⚡ FAST! |
| Delivered while patience > 90% | +100 | ⚡⚡ LIGHTNING! |
| All 5 tables occupied and served | +200 | 🌟 FULL HOUSE! |
| Combo reaches ×2.0 | +75 | 🔥 COMBO! |
| Combo reaches ×3.0 | +150 | 💫 BLAZING! |
| No angry customers (end of round) | +500 | ✨ PERFECT SERVICE! |
| First serve of the round | +25 | 👋 FIRST SERVE! |

---

## 8. End-of-Round Rating

After 3 minutes, calculate:

```
total_customers = served_happy + left_angry
perfect_rate = served_happy / total_customers
```

| Rating | Condition |
|--------|-----------|
| ⭐⭐⭐ | perfect_rate ≥ 90% AND score > 2,000 |
| ⭐⭐ | perfect_rate ≥ 70% |
| ⭐ | played the round |

Stars are displayed on Game Over screen. High score tracks both score AND best star rating. Players who get 3 stars have a permanent badge next to their high score.

---

## 9. XP and Level Progress (UI Only — v0.2.0)

Not implemented in v0.1.x. Documented here for planning.

XP earned per round = score ÷ 10 (rough conversion).

| Level | XP Required | Unlock |
|-------|-------------|--------|
| 1 | 0 | Base game |
| 2 | 500 | New customer variant |
| 3 | 1,200 | New menu item |
| 4 | 2,500 | New restaurant theme |
| 5 | 5,000 | Hard mode |

Level progress bar shows on Game Over screen. Encourages replaying.

---

## 10. Difficulty Curve Summary

```
Time:       0s ────── 30s ────── 90s ────── 150s ────── 180s
Pressure:   [tutorial] [gentle] [building] [intense] [sprint]
Patience:    [120s]    [100s]   [80s]      [60s]     [50s]
Spawn rate: [8s]       [7s]     [5.5s]    [4.5s]    [3.5s]
Customers:  [1 type]   [2]      [3]        [3]       [3 types]
```

The game teaches in the first 30 seconds, rewards in 30–90, challenges 90–150, and creates a thrilling sprint finish at 150–180. This is the "just one more round" structure.

---

## 11. Summary of Changes from v0.1.0

| Parameter | v0.1.0 | v0.2.0 |
|-----------|--------|--------|
| Initial patience | 25s | 90–120s |
| Minimum patience | 10s | 45s |
| Spawn interval start | 6s | 8s |
| Spawn interval min | 2.5s | 3s |
| Combo reach ×2 | 10 customers | 3 customers |
| Combo max | ×5.0 | ×3.0 |
| Score on angry leave | 0 | −50 to −150 |
| Speed bonus | none | ×0.75 to ×2.0 |
| End-of-round stars | none | ⭐–⭐⭐⭐ |
| Angry table state | dirty (wrong) | clean (correct) |
