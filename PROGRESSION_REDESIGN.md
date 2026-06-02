# PROGRESSION REDESIGN — TableRush

**Status: AWAITING APPROVAL — do not implement**
**Last Updated: 2026-06-02**

---

## Executive Summary

Every session must end with the player feeling they moved forward — even if they scored worse than last time. Progression is the engine of "one more round." Currently the game has XP and levels (10 levels, thresholds in ProgressionSystem.ts) but these are invisible to the player during gameplay. They only see them on the GameOver screen. Progression must be visible, tangible, and feel earned.

---

## Problem 1: Progression Is Invisible During Play

### Observed
The player plays for 3 minutes, sees the GameOver screen, and has a small XP bar that moved slightly. There's no sense of the XP accumulating during play — it's revealed all at once at the end.

### Proposed Solution: Live XP Ticker in HUD

Small XP icon in HUD corner (or under the score). During a round, every score gain generates a fraction of XP visually (+3 XP appears briefly). The XP bar at the bottom of the HUD fills in real time.

The player always knows: "I'm 60% of the way to Level 4."

**Design note:** This is cosmetic — the actual XP is still calculated at round end. The in-round display is a visual estimate. Small discrepancy is acceptable.

---

## Problem 2: Leveling Up Has No Ceremony

### Observed
Level-up happens on the GameOver screen with a flash animation. That's fine. But there's no in-game moment and no clear reward attached to the level.

### Proposed Solution: Level-Up Rewards

Each level unlocks something visible:

| Level | Unlock |
|-------|--------|
| 1 | Starting state (default waiter, 1 table active) |
| 2 | Customer variant: Business unlocked (more impatient, but higher tips) |
| 3 | Table 3 unlocked (more customers possible) |
| 4 | "Speed Boost" cosmetic: waiter walks 10% faster |
| 5 | Kitchen upgrade cosmetic: better counter texture |
| 6 | Customer variant: Elder unlocked (very patient, high tips) |
| 7 | Table 4 unlocked |
| 8 | Combo tracker: shows running streak between rounds |
| 9 | Table 5 unlocked (full restaurant) |
| 10 | "Master Waiter" title + golden apron cosmetic |

**Implementation note:** Early levels (1–3) the game can start with fewer tables and unlock more over sessions. This reduces early overwhelm and creates a natural difficulty ramp. Each new table is a gift and a challenge.

---

## Problem 3: No Progression Arc from Round to Round

### Observed
Round 1 and Round 50 look and play identically. The restaurant never changes. The waiter never grows. There's no arc.

### Proposed Solution: Restaurant Upgrade System (Architecture Only)

The EconomySystem.ts already exists as a stub. This describes the design, not the implementation.

**Progression currency: Stars** (already implemented: 1–3 stars per round)
Stars accumulate across sessions. Spend stars on upgrades.

**Upgrade categories:**

1. **Speed Upgrades**
   - "Comfortable Shoes": waiter walks 8% faster (50 stars)
   - "Express Lane": waiter walks 15% faster (150 stars)

2. **Kitchen Upgrades**
   - "Better Oven": cook times reduced 10% (75 stars)
   - "Pro Kitchen": cook times reduced 20% (200 stars)

3. **Patience Upgrades**
   - "Elegant Decor": all customers +5s patience (60 stars)
   - "Live Music": all customers +12s patience (180 stars)

4. **Score Multipliers**
   - "VIP Menu": all menu item prices +20% (100 stars)
   - "Fine Dining": payment bonuses +30% (250 stars)

5. **Cosmetics**
   - New waiter outfit color (20 stars each: red, green, gold, purple)
   - New tablecloth pattern (30 stars each)
   - New floor tiles (50 stars)

**These are purchased in a Shop screen accessible from Main Menu.**

The player is ALWAYS earning stars, always spending stars, always making the restaurant better.

---

## Problem 4: No Memory of Best Performances

### Observed
The game tracks highScore and bestStars. Nothing else. The player has no context for how good they are or what they've achieved.

### Proposed Solution: Personal Records Screen

A statistics panel accessible from Main Menu:

```
YOUR RECORDS
─────────────────────────
🏆 High Score:      4,280
⭐ Best Rating:     ⭐⭐⭐
🔥 Best Combo:      12
👥 Most Served:     18 customers
⚡ Fastest Serve:   8.2 seconds
🍕 Fave Order:      Pizza (32%)
📅 Total Rounds:    47
✅ Perfect Rounds:  3
```

None of these require new gameplay systems — all can be computed from existing data plus a few new tracked values. The statistics make the player aware of their own progress arc.

---

## Problem 5: No Daily Engagement Hook

### Observed
No reason to come back tomorrow. No daily objective. No streak.

### Proposed Solution: Daily Challenge System

Each day, a random "bonus condition" is applied to that day's play:
- "Tip Tuesday: tips worth 2× today"
- "Speed Friday: lightning bonus for 90%+ patience deliveries"
- "Clean Slate: no dirty tables penalty today"
- "Rush Hour: all rounds start at Tier 3 speed"
- "VIP Night: all customers are high-tip variants"

Daily challenges are cosmetic modifiers on existing systems. No new mechanics. But they create a reason to return.

**Daily Streak:** Playing on consecutive days earns a streak multiplier on the daily challenge bonus (+10% per day, up to +50%). Losing the streak resets it but doesn't punish — just means losing the bonus.

---

## Progression System Architecture

```
PlayerProfile {
  xp:             number   // total accumulated XP
  level:          number   // 1–10
  stars:          number   // spendable upgrade currency
  totalStars:     number   // all-time stars earned
  highScore:      number
  bestCombo:      number
  bestRating:     1|2|3
  totalRounds:    number
  perfectRounds:  number   // rounds with 0 angry customers
  fastestServe:   number   // ms for fastest single delivery
  totalCustomers: number
  unlockedItems:  string[] // upgrade/cosmetic IDs
  dailyStreak:    number
  lastPlayDate:   string   // ISO date
}
```

**All of this fits in localStorage.** No backend required.

---

## Implementation Priority

| Priority | Feature |
|----------|---------|
| 🔴 CRITICAL | Daily XP tick in HUD (visual only) |
| 🟠 HIGH | Level → table unlock system (3 tables at start, unlock more) |
| 🟠 HIGH | Level rewards list (visible in level-up screen) |
| 🟡 MEDIUM | Personal records screen |
| 🟡 MEDIUM | Star-based upgrade shop (EconomySystem activation) |
| 🟢 LOW | Daily challenge system |
| 🟢 LOW | Streak tracking |
