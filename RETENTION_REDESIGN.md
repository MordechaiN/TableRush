# RETENTION REDESIGN — TableRush

**Status: AWAITING APPROVAL — do not implement**
**Last Updated: 2026-06-02**

---

## Executive Summary

Retention is not about tricks. It is about meaningful momentum. A player returns to a game when they left in a state of **unresolved desire** — they were close to something, or they know they can do better, or they have something to look forward to. Every session must end with at least one of those three hooks planted.

---

## The "One More Round" Formula

A player plays again when:
1. **Near miss**: "I almost hit 3 stars — I just need a little more"
2. **Improvement arc**: "I just understood how to handle multiple customers"
3. **Anticipation**: "Tomorrow's daily bonus will give me the coins I need for the kitchen upgrade"
4. **Social proof**: "My high score is 2,800 — my friend's is 3,100 and I can beat it"

Currently TableRush has none of these hooks. The game ends. The player sees a score. Nothing pulls them back.

---

## Retention System 1: The Near-Miss Score Display

### Design
At the end of every round, the GameOver screen shows:
```
YOUR SCORE:  2,450

⭐⭐ 2 Stars

You needed 2,800 for ⭐⭐⭐
You were 350 away.

Best combo: 5 — you almost hit 8!

PLAY AGAIN to try for 3 stars
```

The critical element: **show the gap, not just the result.** "350 away" is actionable. "You got 2 stars" is not.

If the player achieved 3 stars:
```
PERFECT ROUND!

⭐⭐⭐ 3 Stars — PERFECT SERVICE
No angry customers — +200 bonus!

Can you beat your high score? 4,280 → Target: 4,500
```

The gap is always forward. Always "you can do this."

---

## Retention System 2: End-of-Round Momentum Stats

### Design
After every round, show one stat that measures something the player almost nailed:

- "You served 12/14 customers — 2 were angry"
- "Your combo reached 6 — one away from UNSTOPPABLE!"
- "Your fastest delivery: 8.2 seconds — can you beat it?"
- "You earned 3 stars — try to do it with a higher score next time"

The stats are generated dynamically from whichever metric came closest to a threshold. This is called **near-miss psychology** — the player is always within reach of something.

---

## Retention System 3: Session Start Hooks

### Design
When the player opens the app, the main menu should have:

**"Last Session" summary:**
```
Last time: 2,450 pts — ⭐⭐
Today's best target: 2,800 → ⭐⭐⭐
```

This immediately sets a goal for the current session before the player even taps Play.

**"Daily Bonus" banner** (when daily challenge is available):
```
🌟 TODAY: TIP TUESDAY
Tips worth 2× today only!
```

Both of these create a reason to tap Play immediately.

---

## Retention System 4: Streak and Consistency Rewards

### Design
Playing on consecutive days earns a **Streak Counter** visible on the main menu:

```
🔥 3-Day Streak!
+30% bonus tips today
(+10% per day, up to +50%)
```

Streak rewards are immediate and tangible (they apply that session). Losing a streak doesn't punish — you just lose the bonus. This creates soft daily engagement without toxic "streak loss anxiety."

**Comeback bonus**: If a player hasn't played in 3+ days, they get a "We missed you!" bonus (+20% score for that session). This rewards returning players and reduces the barrier to restart.

---

## Retention System 5: Mastery Milestones

### Design
Hidden milestones that unlock achievements. Unlike daily challenges (external motivation), achievements reward mastery discovery:

| Achievement | Trigger | Reward |
|-------------|---------|--------|
| "Quick Hands" | Deliver in < 10s | Gold badge |
| "Flawless" | 0 angry customers in a round | Silver apron cosmetic |
| "On Fire" | Reach combo ×3.0 (10+) | Fire effect on waiter |
| "Millionaire" | Earn 10,000 total score across rounds | Gold nameplate |
| "Regular Hours" | Play 7 days in a row | Special uniform |
| "Rush Master" | Serve 20 customers in one round | Trophy in restaurant |
| "The Old Guard" | Serve 5 Elder customers in one round | Special medal |

Achievements appear in a collection screen. Visible, incomplete achievements function as goals. The player thinks: "I almost served 20 customers — next round I'll try."

---

## Retention System 6: Social Score Comparison

### Design
The simplest and most effective social hook: **challenge a friend to beat your score.**

On GameOver screen:
```
[Share Score] → copies text:
"I just scored 2,450 in TableRush! 🍽️⭐⭐
Can you beat me? 
[game link]"
```

No login. No leaderboard backend. Just a share button that creates a social challenge. Mobile players share scores constantly when given the mechanism.

**Future (v1.0+):** Optional account-based leaderboard for top weekly scores. Not for v0.7.0.

---

## Retention System 7: The Progression Promise

### Design
The most powerful retention hook is knowing that the next session will be different because of what happened in this session.

After every round, the GameOver screen shows:
```
YOU EARNED:
🌟 3 stars (total: 47 stars)

You are 3 stars away from unlocking:
🚪 Table 4 — serve more customers!

[SHOP] [PLAY AGAIN]
```

The player knows exactly what the next milestone is. This is called the **progression promise** — the player can always see the next carrot.

---

## Anti-Retention Patterns to Avoid

These patterns kill retention. We should never implement them:

| Anti-Pattern | Why It Kills Retention |
|-------------|----------------------|
| Energy/lives system | Creates frustration and churn |
| Pay-to-win upgrades | Destroys fairness and trust |
| Unskippable ads after every round | Destroys flow and patience |
| Forced social (share to continue) | Creates resentment |
| Streak PUNISHMENT (you lose progress if you miss a day) | Toxic anxiety, not engagement |
| Randomized loot (pay for random reward) | Gambling — ethically bad, banned in some markets |

TableRush should be **fair, mastery-based, and optional-monetization**. The player should always feel like they're succeeding because they're getting better, not because they paid.

---

## Session Length Design

Target session: **3 minutes** (one round). This is perfect for mobile.

But players shouldn't be able to play only one round. After a round ends, create the best possible conditions for "one more":

1. GameOver screen shows near-miss gap prominently
2. "PLAY AGAIN" is the biggest, most obvious button
3. Auto-fade to main menu after 15s of inactivity (not force-restart, but gentle nudge)
4. After 3+ rounds, show "You're on a roll!" toast on main menu

The meta-game of trying to improve your score is itself a retention loop. Each round is short enough that "one more" feels acceptable.

---

## Retention Summary

| System | Impact | Complexity |
|--------|--------|-----------|
| Near-miss gap on GameOver | 🔴 VERY HIGH | 🟢 LOW |
| "Last session" on main menu | 🔴 VERY HIGH | 🟢 LOW |
| Daily challenge | 🟠 HIGH | 🟡 MEDIUM |
| Near-miss stats | 🟠 HIGH | 🟢 LOW |
| Progression promise (next unlock) | 🟠 HIGH | 🟡 MEDIUM |
| Achievements | 🟡 MEDIUM | 🟡 MEDIUM |
| Streak system | 🟡 MEDIUM | 🟢 LOW |
| Share score | 🟡 MEDIUM | 🟢 LOW |
| Social leaderboard | 🟢 LOW | 🔴 HIGH |

## Implementation Priority

| Priority | Feature |
|----------|---------|
| 🔴 CRITICAL | Near-miss gap display on GameOver (you were X away from 3 stars) |
| 🔴 CRITICAL | "Last session" goal on main menu |
| 🟠 HIGH | Progression promise (next unlock visible on GameOver) |
| 🟠 HIGH | Near-miss combo stat on GameOver |
| 🟡 MEDIUM | Streak counter + comeback bonus |
| 🟡 MEDIUM | Achievement system |
| 🟡 MEDIUM | Daily challenge |
| 🟢 LOW | Share score button |
| 🟢 LOW | Social leaderboard |
