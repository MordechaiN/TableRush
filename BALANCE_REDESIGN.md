# BALANCE REDESIGN — TableRush

**Status: AWAITING APPROVAL — do not implement**
**Last Updated: 2026-06-02**

---

## Executive Summary

The current balance has one dominant problem: **players fail before they understand why.** Customers leave angry during the first 60 seconds of the game — before the player has learned the loop. This creates frustration without fun. The fix is not making the game easier overall; it's making the first 90 seconds forgiving enough for a new player to complete a service chain, then gradually introducing real pressure.

---

## Problem 1: Early-Game Patience Values Are Too Tight

### Current Values
```
Tier 1 (0–60s):   patience 90,000–120,000ms (90–120 seconds)
Tier 2 (60–120s): patience 60,000–90,000ms  (60–90 seconds)
Tier 3 (120–180s): patience 45,000–65,000ms (45–65 seconds)
```

### Analysis
On paper, 90–120 seconds sounds generous. In practice:
- Player spends ~15s learning what the ❓ bubble means
- Player spends ~10s walking to the table
- Kitchen cooking time: 1,500–4,000ms per item
- Player walks to kitchen (~8s), walks back to table (~8s)
- Total time for ONE full service: 40–55 seconds

With 90 seconds of patience, the player can complete a service with 35–50 seconds left. That seems fine.

BUT: with two or more customers, the player is splitting attention. Customer B starts requesting while the player is mid-walk to deliver Customer A's food. The timer has been running for Customer B this whole time. By the time the player serves Customer A and turns to B, B may have only 30–40 seconds left.

This creates a "second customer trap" — the first two minutes feel impossible for new players.

### Proposed Solution: New Patience Values

**Tier 1 (0–60s) — "Learning":**
- patience: 110,000–140,000ms (110–140 seconds)
- Only 1–2 customers at a time maximum
- Goal: player can serve EVERY customer and still have time to spare

**Tier 2 (60–120s) — "Busy":**
- patience: 70,000–95,000ms (70–95 seconds)
- 2–3 customers possible
- Goal: requires planning, rare angry customer if player mismanages

**Tier 3 (120–180s) — "Rush Hour":**
- patience: 45,000–65,000ms (45–65 seconds)
- 3–5 customers possible
- Goal: skilled management required, some angry customers are expected

### Variant Patience Modifiers
Applied on top of tier base:
| Variant | Modifier |
|---------|---------|
| Elder (Nonno) | +20% patience |
| Elegant (Sofia) | +10% patience |
| Casual (Jake) | +5% patience |
| Romantic (Rosa) | +0% patience |
| Teen (Kyle) | −10% patience |
| Trendy (Zara) | −5% patience |
| Business (Marco) | −15% patience |

This creates a natural feeling: the old man has all the time in the world; the businessman is always in a hurry.

---

## Problem 2: Spawn Rate Creates Overwhelming Density

### Current Values
```
Tier 1: spawnStart 8000ms → spawnEnd 7000ms
Tier 2: spawnStart 5500ms → spawnEnd 4500ms
Tier 3: spawnStart 4000ms → spawnEnd 3500ms
```

### Analysis
At Tier 3 with 3.5s spawns and 5 tables, all 5 tables fill within 17.5 seconds. The player cannot serve customers faster than they arrive. This creates the impression that the game is unwinnable, killing the "one more round" impulse.

Maximum healthy table density: **3 active customers** for single-player feel. More than 3 and attention is overwhelmed.

### Proposed Solution: Spawn Throttling with Table Cap

**New spawn intervals:**
```
Tier 1: spawnStart 10,000ms → spawnEnd 8,000ms  (max 2 simultaneous customers)
Tier 2: spawnStart 7,000ms → spawnEnd 5,500ms   (max 3 simultaneous customers)
Tier 3: spawnStart 5,000ms → spawnEnd 4,000ms   (max 4 simultaneous customers)
```

**Hard cap per tier:** `trySpawnCustomer()` checks both available tables AND current customer count. Never spawns if count ≥ tier cap. This prevents unwinnable density regardless of spawner timing.

---

## Problem 3: Score Doesn't Feel Proportional to Effort

### Current Formula
```
Delivery: item.price × 10 × speedMultiplier × comboMultiplier
Payment: (item.price + tip) × 5 × comboMultiplier
```

### Analysis
At combo ×1.0, delivering a $10 salad at full speed yields 200 points. For a 3-minute game targeting 2000+ for 3 stars, that requires 10+ perfect deliveries. Achievable but tight — and the score doesn't "feel" generous. Players should feel like a great waiter is making great money.

### Proposed Solution: More Rewarding Base Scores

**New formula:**
```
Delivery: item.price × 15 × speedMultiplier × comboMultiplier
Payment: (item.price + tip) × 8 × comboMultiplier
Speed bonus at >75% patience: +50 flat "LIGHTNING" bonus
Perfect round bonus (0 angry): +200 at end of round
```

**Target score calibration:**
```
1 star: 800+   (achievable by most first-timers)
2 star: 1600+  (requires moderate combos)
3 star: 3000+  (requires combos + speed bonuses + no angry customers)
```

**Tip system redesign:**
Currently: `tip = Math.random() * 5`. This feels random and unearned.

Proposed: tip is deterministic based on patience at delivery:
```
>75% patience: tip = item.price × 0.5  ("That was fast!")
50–75%: tip = item.price × 0.3
25–50%: tip = item.price × 0.15
<25%: tip = 0  (no tip — they're annoyed by the wait)
```

This makes every delivery feel like a choice with a clear outcome. Delivering fast = bigger tip = bigger number = dopamine.

---

## Problem 4: Cook Times Create Dead Time

### Current Cook Times
```
Salad: 1,500ms
Burger: 2,500ms
Pasta: 3,000ms
Sushi: 2,000ms
Pizza: 4,000ms
```

### Analysis
During cooking, the player has nothing to do if all other tables are served. Dead time kills rhythm. But too-fast cooking removes the management challenge.

The real problem is that the player has no influence over cook time. It's purely a wait. Games that feel alive let players do SOMETHING during waits.

### Proposed Solution: Cook Time + Player Opportunity

**Slightly reduce cook times to reduce dead time:**
```
Salad:  1,200ms (was 1,500ms)
Burger: 2,200ms (was 2,500ms)
Pasta:  2,800ms (was 3,000ms)
Sushi:  1,800ms (was 2,000ms)
Pizza:  3,500ms (was 4,000ms)
```

**During cooking, route player to useful tasks:**
The priority system (see GAMEPLAY_REDESIGN.md) will direct the player to clean tables or collect payments while orders cook. This fills dead time with progress. The player never has to stare at the kitchen.

**Future: Cooking Assist (v0.8.0+)**
A "tap to boost" mechanic on cooking orders: player can tap a cooking ticket once to reduce remaining cook time by 20% (costs 1 action). Not for v0.7.0 — just designed here for future consideration.

---

## Problem 5: Penalty for Angry Customer Is Invisibly Small

### Current Penalty
`−50/−100/−150 per difficulty tier`

### Analysis
At combo ×1.0 and a score of 600, losing 50 points is a 8% penalty. The player barely feels it. Worse: the combo reset is more impactful than the score penalty but less visible. The player doesn't connect "customer left angry" to "multiplier dropped from ×2.0 to ×1.0."

### Proposed Solution: Make Failure Felt AND Explained

**New penalty structure:**
```
Tier 1: −150 (was −50)
Tier 2: −250 (was −100)
Tier 3: −400 (was −150)
```

These penalties sting. They're also fair — an angry customer at Rush Hour costs real score.

**Combo reset display:**
When combo resets, show: "COMBO LOST — ×1.5 → ×1.0" in red text. The player sees exactly what they lost.

**Plus: score is protected by perfect-service runs.** A player who avoids ALL angry customers gets the +200 perfect round bonus at the end. This asymmetry (big reward for perfection, big penalty for failure) creates stakes and strategy.

---

## Difficulty Balance Summary Table

| Metric | Current | Proposed | Rationale |
|--------|---------|---------|-----------|
| Tier 1 patience | 90–120s | 110–140s | Learn without failure |
| Tier 2 patience | 60–90s | 70–95s | Pressure without punishment |
| Tier 3 patience | 45–65s | 45–65s | Already correct |
| Tier 1 spawn | 7–8s | 8–10s | Max 2 customers |
| Tier 2 spawn | 4.5–5.5s | 5.5–7s | Max 3 customers |
| Tier 3 spawn | 3.5–4s | 4–5s | Max 4 customers |
| Tier 1 penalty | −50 | −150 | Failure must matter |
| Tier 2 penalty | −100 | −250 | Real consequences |
| Tier 3 penalty | −150 | −400 | Stakes are high |
| 1-star threshold | 500 | 800 | Achievable by all |
| 2-star threshold | 1000 | 1600 | Moderate skill |
| 3-star threshold | 2000 | 3000 | Mastery |
| Cook time: Pizza | 4000ms | 3500ms | Reduce dead time |
| Delivery score | price×10 | price×15 | Numbers feel big |

---

## Implementation Priority

| Priority | Change |
|----------|--------|
| 🔴 CRITICAL | New patience values (Tier 1: 110–140s) |
| 🔴 CRITICAL | Spawn caps (max 2/3/4 per tier) |
| 🟠 HIGH | New penalty values |
| 🟠 HIGH | Tip deterministic formula |
| 🟠 HIGH | Combo reset display ("COMBO LOST") |
| 🟡 MEDIUM | Variant patience modifiers |
| 🟡 MEDIUM | Reduced cook times |
| 🟡 MEDIUM | New score thresholds (1/2/3 star) |
| 🟢 LOW | Perfect round bonus |
