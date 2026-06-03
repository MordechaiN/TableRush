# PRESSURE ANALYSIS
_TableRush v0.9.1 | 2026-06-03_

---

## The Numbers That Prove There Is No Pressure

### Patience vs. Service Time

| Tier | Time Window | Patience Timer | Bot Service Cycle | Buffer Ratio |
|------|-------------|---------------|-------------------|-------------|
| 1    | 0–60s       | 90,000–120,000ms | ~9s            | **10–13×**  |
| 2    | 60–120s     | 60,000–90,000ms  | ~9s            | **7–10×**   |
| 3    | 120–180s    | 45,000–65,000ms  | ~9s            | **5–7×**    |

A customer who waits 90 seconds for a 9-second task creates **zero urgency for the first 81 seconds**.

Even tier 3 — the "hardest" difficulty — allows ignoring a customer for 36+ seconds before anything bad happens.

### Why 0 Angry Customers Is Guaranteed

With 5 tables and spawn every 7–8s in tier 1:
- All 5 tables fill by t ≈ 37 seconds
- Earliest customer has been waiting ~37 seconds
- Their patience: 90,000ms minimum → still has **53 seconds remaining**
- Bot can serve all 5 in 5 × 9s = 45 seconds → finishes with 8s to spare

At tier 3, spawn every 3.5–4s:
- All 5 tables fill by t ≈ 18 seconds
- Earliest customer has 45s patience → still has **27 seconds remaining when last table fills**
- Bot serves all 5 in 45s → 18s over the patience window → **1–2 customers should leave angry**
- But they don't, because the bot never idles. It starts on the first customer immediately.

The patience timers are so large relative to the service cycle that **even non-optimal play never creates anger**.

---

## Question 1: How Often Is the Player Forced to Choose?

**Almost never.**

Because patience timers give 5–13× the service time, every customer is always "safe" when the player reaches them. There is no moment where serving table A instead of table B results in any consequence. The only decision the game offers — kitchen vs. table — always has a clear mechanical answer (pick up food when ready, deliver it, collect payment, clean).

Zero conflict. Zero tradeoffs.

---

## Question 2: How Often Is the Player Punished for Choosing Incorrectly?

**Never in practice.**

The penalty structure (50/100/150 points per angry customer) is also trivially small. A single payment at ×5.0 earns 1,500–3,000+ points. The worst possible penalty (150 pts) is less than 5% of one serve's value at peak combo.

Even if a player deliberately served tables in the worst possible order, the patience timers are so forgiving that no customer would ever leave.

---

## Question 3: How Often Can the Player Successfully Complete Every Task?

**Always.** Across 5 playtested sessions: 21–22 customers served, 0 angry, every session.

This should be impossible in a pressure game. The inability to serve everyone is what creates tension.

---

## Question 4: What Percentage of Gameplay Is Spent Waiting?

Approximately **35–40%**.

- First customer payment: ~20–24 seconds after game starts
- Eating phase (dead time per serve): 2–4 seconds per customer × 21 serves = 42–84s total
- Kitchen cook time (dead time): 1.5–4s per order × 21 = 31–84s total

Some of these overlap. But at any given moment, the bot (and player) is idle when:
- Kitchen is cooking and no customer is paying
- All customers are eating simultaneously
- No table is dirty or requesting

These idle windows happen continuously in tier 1 (slow spawns, long patience). The player literally has nothing to do.

---

## Question 5: What Percentage of Gameplay Is Spent Making Decisions?

Approximately **25–30%** of wall time involves an active action.

But of that 25–30%, virtually **none involves a genuine decision under constraint**. The player is executing tasks in a predetermined sequence, not choosing between competing priorities.

"Should I serve table 3 before table 1?" is not a real decision when both tables have 80+ seconds of patience remaining.

---

## Rush Hour Analysis

Does the game currently create:

| Quality  | Present? | Evidence |
|----------|----------|---------|
| Panic    | ✗ No    | 0 angry customers. Patience 5–13× service time. No panic possible. |
| Urgency  | ✗ No    | "30s LEFT!" fires with 30s remaining, but with ×5.0 combo and 18+ happy customers, the game is already decided. |
| Conflict | ✗ No    | Never forced to choose between two important competing tasks. |
| Difficult choices | ✗ No | Kitchen ready + table requesting is always clear: kitchen first. No true dilemmas. |

**Verdict: Task execution only.** TableRush is currently a click-sequence game, not a pressure game.

---

## The Single Biggest Reason the Player Is NOT Under Pressure

**Customer patience timers are 5–13× longer than the service cycle.**

This single number determines everything. No amount of dramatic HUD design, combo escalation, or sound effects creates pressure when customers wait 90 seconds for a 9-second task.

When patience = 10× service time:
- All customers are always "safe"
- No decision has consequences
- Speed is a bonus, not a necessity
- The game cannot produce panic

When patience ≈ 2–3× service time:
- Serving the wrong table first costs you a customer
- Having all 5 tables occupied is genuinely tense
- Choosing to clean a dirty table vs. serve an existing one is a real tradeoff
- The player must prioritize every second

---

## Top 10 Pressure Improvements

**#1 — Reduce patience timers (The Root Cause Fix)**  
Current: 90–120s / 60–90s / 45–65s  
Proposed: 38–48s / 25–32s / 18–24s  
Effect: Transforms every decision from "when you feel like it" to "you have 20 seconds"  
Risk: Miscalibration causes frustration. Target: bot loses 0 in tier 1, 1–2 in tier 2, 3–5 in tier 3.

**#2 — Patience visible at the table, not just the customer**  
The existing patience bar is on the customer sprite. At a busy 5-table restaurant, the player can't compare urgency across tables at a glance. A color-coded glow on the table itself (green → orange → red) lets players prioritize without staring at individual sprites.

**#3 — Kitchen queue cap: max 2 simultaneous orders**  
If 3 customers all need orders placed at once, only 2 can cook simultaneously. Player must choose which one gets food first. Forces genuine queue management decisions.

**#4 — Eating time longer (4–7s) + visible countdown**  
Currently eating is 2–4 seconds — too brief to serve another table in the meantime. Extend to 4–7 seconds, show a visible eating bar. Now the player can realistically serve 1 other customer during each eating phase — creating a natural "use this window" decision every serve.

**#5 — Remove 1-table-always-empty rule**  
Currently `trySpawnCustomer()` stops spawning if 0 tables are empty. This means the restaurant is never truly full. Remove the safety net — when the restaurant is at capacity, pressure peaks correctly.

**#6 — Requesting phase timeout (separate from food patience)**  
A customer who waits with their order bubble for more than 20 seconds without being approached leaves immediately, regardless of the main patience bar. Forces the player to acknowledge new customers fast.

**#7 — Penalty scaled to combo**  
Currently losing a customer costs 50–150 pts flat. At ×5.0 that's irrelevant. Scale penalty: basepenalty × comboMultiplier. Losing at ×5.0 costs 5× more — makes late-game losses truly hurt.

**#8 — Score bleed on patience**  
Customer tips decrease visibly as patience drains. A patient meter dropping from green to red isn't just "they might leave" — it's "your tip is disappearing right now". Makes the patience bar feel like a live money counter.

**#9 — Rush burst: 3 customers in 8 seconds every ~50s**  
Instead of uniform spawning, inject 2-3 burst moments during the session. The restaurant goes from 2 tables to 5 tables in 8 seconds. The player who was relaxed suddenly has a crisis. Creates genuine panic moments.

**#10 — Dirty table penalty timer**  
Dirty tables that aren't cleaned within 20 seconds block a new customer from sitting (visual: cobwebs appear). Forces cleaning to be urgent, not optional.

---

## Implementation Decision

**Implementing #1: Patience timer reduction**

This is the correct first fix. Every other pressure mechanic in the list is enhanced by tighter patience timers. Adding a rush burst (#9) to a game with 90-second patience creates no additional pressure. Adding it to a game with 20-second patience creates genuine chaos.

### New Timer Values

```
Tier 1 (0–60s):   patienceMin: 38,000  patienceMax: 48,000   (was 90k–120k)
Tier 2 (60–120s): patienceMin: 25,000  patienceMax: 32,000   (was 60k–90k)
Tier 3 (120–180s):patienceMin: 18,000  patienceMax: 24,000   (was 45k–65k)
```

### Pressure curve with new timers

**Tier 1 (learning):** Tables fill every 7–8s → 5 tables full at ~37s. First customer has 38s min patience → 1s remaining when last table fills. Player is forced to start on the first table immediately, but not yet in crisis.

**Tier 2 (pressure):** Tables fill every 5s → 5 tables full at ~25s. First customer has 25s patience → 0s remaining when last table fills. Impossible to serve everyone. Player must accept losses and prioritize highest-value/lowest-patience.

**Tier 3 (crisis):** Tables fill every 3.75s → 5 tables full at ~19s. First customer has 18s patience → already leaving when last table fills. Triage mode. Every second matters.

**Expected bot performance with new timers:**
- Tier 1: 0 angry (bot is fast enough at tier 1 spawn rate)
- Tier 2: 1–3 angry (can't always reach everyone in 25s)
- Tier 3: 3–5 angry (truly impossible to serve all)
- **Total: 4–8 angry customers per session for optimal play**

This is the correct pressure ceiling. "Zero angry" becomes something to be proud of, not the default.
