# ADDICTION & RETENTION PLAN — TableRush

**Status:** DESIGN ONLY — awaiting approval before any implementation
**Date:** 2026-06-02
**Central question:** Why would a player come back tomorrow?

---

## SECTION 1 — CORE LOOP ANALYSIS

### The current loop

```
Customer arrives → Take order → Cook → Deliver → Collect payment → Clean table
```

This loop repeats continuously for 3 minutes.

### Why it becomes repetitive after 10 minutes

**The loop is a pure execution problem with one correct solution.**

Every repetition is structurally identical. The customer arrives, the player walks a route, taps three or four times, and the table clears. Then again. The question in round 1 ("what do I do?") is answered in minutes. The question in round 2 ("can I do it faster?") is answered in minutes. By round 3, the player has nothing left to discover. They are no longer learning — they are executing.

Execution without discovery is not a game. It is a job.

The specific failure points in this loop:

**1. Auto-order removes the last interesting choice.**
When the player taps a requesting customer, a menu item is chosen automatically. The player has no decision to make. Decision-making is the primary source of engagement in any game. Without choices, there is only reaction.

**2. Cook time is dead time.**
While an order cooks, the player's job is to wait or handle another table. If all tables are occupied and all orders are cooking, the player literally has nothing to do. Dead time in a fast-paced game is fatal — it shatters the flow state exactly when the player was most engaged.

**3. Every customer is a timer, not a person.**
A customer at table 1 is mechanically identical to a customer at table 5. Serving the elderly man or the teenager produces the same actions, the same sound, the same score formula. There is no reason to feel differently about any customer. Emotional indifference kills retention.

**4. Every round is a clean slate.**
Nothing a player does in round 1 affects round 2. There is no accumulation. No customer remembers them. No restaurant grows. The player can play 50 rounds and return to the exact same empty restaurant with the exact same empty tables. The only persistent record is a number.

**5. The progression system is invisible.**
10 levels exist. Players gain XP. Level up rarely happens mid-session. Between rounds, a bar fills. The player can unlock nothing tangible, feel no power increase, make no visible change to their world. A progress bar that leads to nothing is a progress bar that leads nowhere.

### Where boredom begins — exactly

**Minute 1–3:** Anxiety and learning. The player is figuring out the rules. Every customer is a new event. Boredom is impossible here.

**Minute 3–6:** Competence building. The player serves their first complete cycle without mistakes. Satisfaction. They are getting good at something.

**Minute 6–10:** Plateau arrival. The player has learned the rules. Difficulty increases (shorter patience, faster spawns) but the mechanics do not change. The player is executing the same sequence faster. This is the first point where a player thinks "I understand what this game is."

**Minute 10+:** Routine. The player is now working. Nothing is being learned. Nothing is changing. The only open question is "can I get a bigger number?" For players who are motivated by score, this is enough. For everyone else — the majority — it is not.

**The boredom diagnosis:** TableRush is a very good game for its first 7 minutes. After that, it stops teaching the player anything new. Retention requires continuous teaching — new things to learn, discover, or become.

---

## SECTION 2 — WHAT MAKES RESTAURANT GAMES ADDICTIVE

*(Analysis of psychological mechanisms — no specific game content, characters, or assets referenced)*

Restaurant service games have proven, across many iterations over two decades, to create compulsive play in casual audiences. The reasons are not accidental. They are psychological architecture.

### 2.1 Urgency as a neurochemical trigger

Every customer in a restaurant game is a countdown timer attached to a human face.

Abstract countdowns (a clock, a bar filling) are easy to ignore. Countdowns attached to emotional agents (a person becoming visibly unhappy, about to leave) trigger the human threat-response system. The brain is evolved to respond immediately to social signals of distress.

This is the fundamental trick: the patience bar is not a game mechanic. It is a social obligation presented in game form.

The player does not think "my resource is depleting." They think "that person is unhappy and I can fix it." The urgency is not competitive — it is empathetic. This is why these games attract players who do not consider themselves "gamers." The pressure is socially legible, not mechanically complex.

**Implication for TableRush:** The urgency system works in principle. But it requires visible, emotionally readable customers — not 32px colored timers. The face must communicate distress. The patience bar must feel like a person's patience, not a health bar.

### 2.2 Flow state architecture

Flow — the psychological state of complete absorption in a task — requires a precise balance: the task must be harder than the player's current ability, but not impossible. Too easy: boredom. Too hard: anxiety. The narrow band between them is flow.

Restaurant games achieve flow through organic difficulty scaling. The player manages 1 table (easy), then 2, then 3, then 4. Each new table adds complexity that just exceeds current skill. The player is perpetually slightly overwhelmed — which is exactly where flow lives.

The critical mechanic is that difficulty and the player's capacity scale together. As the player gets faster at route optimization, the game adds more simultaneous demands. The flow band stays narrow because both sides grow at approximately the same rate.

**Implication for TableRush:** The difficulty curve exists (timed tiers with increasing spawn rates and shorter patience). But flow requires that the player FEEL like they are barely keeping up — not that they are bored because they have mastered everything. The addition of "something new to manage" every 90 seconds (a new customer type, a new event, a new demand) would extend the flow window beyond the current plateau.

### 2.3 Multitasking pressure as a positive stressor

The human brain cannot truly multitask. It task-switches. Restaurant games are mastered task-switching trainers: the player builds a mental queue of pending actions and executes them in priority order while new tasks arrive.

This is cognitively demanding and physically satisfying in the same way exercise is satisfying — it requires real effort and the brain rewards that effort with a sense of earned competence.

The specific satisfaction is not "I tapped the right button." It is "I correctly assessed four simultaneous priorities, chose the right one, and it worked out." This is a form of judgment — and validating that judgment feels good.

**Implication for TableRush:** Phase 1 attempted to create a clear priority hierarchy. It is the correct instinct. But priority clarity must be visual and immediate — the player should not have to think about which table to visit. They should feel the pull of the most urgent task. A bold, unmissable directional indicator is not just a UX improvement. It is the tool that allows genuine multitasking satisfaction.

### 2.4 Variable reward intervals

The variable reward interval — a reward that arrives after an unpredictable time period — is the most powerful conditioning mechanism known in behavioral psychology.

In restaurant games, cook times create natural variable reward intervals. The player places an order, then attends to other tables while the kitchen works. The order becomes ready at a specific but non-memorable time. The "ding" of kitchen readiness is an unpredictable reward signal.

This is the same mechanism that makes certain notification systems, social feeds, and yes, slot machines compelling. The brain does not just enjoy the reward — it enjoys the anticipation of a reward that might arrive at any moment.

**Implication for TableRush:** The kitchen ready signal must be unmissable and satisfying. The current kitchen glow (validated as invisible) destroys this mechanism. If the player does not notice the kitchen is ready, the reward interval is effectively silent. A bold, expressive "ORDER READY!" signal converts the variable reward from mechanical to emotional.

### 2.5 Visible improvement as a retention hook

Players return to games where they can see themselves getting better.

The key word is "see." Invisible improvement (the player is faster but the game does not acknowledge it) does not generate the dopamine response that visible improvement does. The brain needs external confirmation that internal effort has resulted in measurable change.

Restaurant games provide this through:
- Score numbers (more points = visibly doing better)
- Customer count (served more people than last time)
- Streak/combo (consecutive success is legible and countable)
- Time efficiency (same customers served in less time)

The most powerful of these is personal-best comparison: not "your score is X" but "your score is X, which is Y more than your previous best." The delta matters more than the absolute.

**Implication for TableRush:** "NEW RECORD!" appears when a high score is beaten. This is good. But it is the only visible improvement signal. There are no personal bests for combo, for delivery speed, for customers served, for perfect rounds. Expanding the personal-best system to 5–6 metrics gives the player 5–6 more things they can visibly improve.

### 2.6 Satisfaction moments as emotional punctuation

Sustained engagement is built on peaks. The player tolerates routine execution (placing orders, walking routes) because they know, from experience, that peaks will occur. These peaks are the reason players describe a game as "addictive."

The peaks in restaurant service games:
- **The last-second save:** Patience bar at 2%, delivery arrives. Relief + triumph.
- **The perfect chain:** 8 consecutive happy customers. Flow at maximum.
- **The impossible choice:** Two customers about to leave, player can only save one. Decision + consequence.
- **The flawless round:** No angry customers. Perfection acknowledged.
- **The unexpected tip:** Exceptional service creates a notably large reward.

Each of these moments requires specific setup: the last-second save requires visible patience warnings early enough for the player to recognize the situation. Without the warning system (the 3-stage anger arc), there are no near-misses — only failures.

**Implication for TableRush:** The current design has the score multiplier and combo system. It lacks the near-miss theater (anger arc, visual warnings) that creates the emotional peaks. Without those peaks, the player is executing a loop with no surprises, no highs. A game of all routine and no peaks is a game players stop playing.

---

## SECTION 3 — TABLE RUSH UNIQUE HOOKS

Ten original retention hooks, each evaluated for implementation and impact.

---

### Hook 1: The Reputation Arc

**Concept:** The restaurant has a live public reputation score (1–5 stars, shown on a sign by the entrance). Serving customers well slowly raises it. Angry customers lower it. At certain reputation thresholds, the character of the restaurant changes: low reputation brings in fewer customers but they are patient and easy. High reputation attracts demanding customers but they tip generously and stay even when service is slow. The player is not just serving — they are managing a brand.

**Why it works:** Gives the player a second objective beyond score. Creates a meta-narrative reason for every service decision. "Do I rush this order to maximize score, or do I take time to ensure the tip and protect my reputation?"

**Pros:**
- Adds a second axis of decision-making beyond speed
- Creates emotional stakes above individual customers ("my restaurant matters")
- Enables different play styles (efficiency-focused vs reputation-focused)
- Generates natural narrative progression across sessions

**Cons:**
- Requires reputation to persist across sessions (adds state management)
- High reputation making the game harder may frustrate casual players
- Needs careful balance — reputation decay curve is complex to tune

---

### Hook 2: Rush Hour Events

**Concept:** The 3-minute session is divided into named acts. Instead of customers spawning randomly throughout, there are defined "events" that arrive with 10-second advance warning. A glowing sign changes: "☀️ LUNCH BREAK — 45 SECONDS." When the event hits, a specific wave arrives — office workers all at once, or a family group that takes 3 tables simultaneously, or a birthday party at a specific table. Between events, there are brief rest periods.

**Why it works:** Converts random spawning into a narrative experience. The advance warning creates anticipation and strategic preparation ("I should clear table 2 before the rush"). The defined acts give the session structure and make replaying feel different from blind reaction.

**Pros:**
- Creates anticipation (pre-event tension) which is more engaging than pure reaction
- Gives players time to prepare strategy — rewards planning
- Makes each round feel like a story with chapters, not a random loop
- Easy to add new event types over time

**Cons:**
- Requires careful timing — rest periods must be long enough to breathe, short enough to stay tense
- Reduces the "anything can happen" unpredictability that some players enjoy
- Fixed events become learnable and lose surprise after ~5 sessions

---

### Hook 3: The Inspector

**Concept:** Once per session, a mysterious customer appears among the regulars. They look almost identical to another customer type but have one subtle visual difference (a different colored pin, a different subtle accessory). The player receives no in-game notification. If the inspector is served with lightning speed AND their payment is collected within 5 seconds of finishing eating, a special result occurs: a large bonus score, a "⭐ INSPECTED & APPROVED" banner, and an additional customer wave spawns who all leave generous tips. If the player fails to notice or serves them poorly — nothing special happens.

**Why it works:** Creates a meta-game where attentive players are rewarded for observation. Players who discover the inspector by accident will be immediately curious and will actively look in future rounds. It creates a reason to pay attention to the restaurant even when not under direct pressure.

**Pros:**
- Creates a discovery moment that players want to tell others about ("did you know there's a secret customer?")
- Rewards attentive players beyond speed — adds an observation dimension
- Once discovered, creates active hunt behavior every session
- Zero downside — players who miss it lose nothing

**Cons:**
- Discovery may take many sessions, frustrating players who sense there's something they're missing
- The subtle visual cue must be detectable but not obvious — very difficult balance
- Rewards attentive players significantly more than casual players — could feel unfair

---

### Hook 4: Customer Memory

**Concept:** Certain customer types "remember" their previous visit. When a returning customer arrives (identified by their variant type), a small status modifier appears with them: "SOFIA — Last visit: happy 😊 (+10% patience)" or "MARCO — Last visit: angry 😠 (−15% patience, harder to please)." The player can see, at a glance, whether this customer will be patient or demanding based on how they were treated before.

**Why it works:** Creates narrative continuity between sessions. Transforms anonymous sprite types into recurring characters with history. The player starts to care about specific customers — not just "serve everyone" but "Sofia is back, I want her to be happy again." This is the emotional foundation of the "living restaurant" fantasy.

**Pros:**
- Turns the 7 customer types into 7 recognizable characters with persistent relationships
- Creates specific motivation per customer beyond "serve fast"
- Very low implementation cost — just a modifier based on stored visit history
- Increases emotional investment in individual service moments

**Cons:**
- Requires tracking per-customer-type history across sessions
- "Angry" history modifier may frustrate players who feel permanently penalized for past mistakes
- If a session goes badly, multiple customers next session will be harder — negative feedback spiral risk

---

### Hook 5: Kitchen Mastery

**Concept:** Cook times on specific dishes reduce with mastery. Serving the same item repeatedly builds "familiarity." After the first 5 burgers served across all sessions, burger cook time drops 10%. After 15 burgers, it drops 20%. After 30, it drops 30%. The mastery level is shown on the order ticket in the kitchen. Players can see their progress toward mastery mid-session ("🍔 ×12/30 → −20%").

**Why it works:** Creates a metagame reason to specialize — players who want fast kitchens will intentionally route certain orders. Creates visible, tangible progress across sessions. Gives players a reason to return beyond score: "I'm 3 burgers away from faster pizza."

**Pros:**
- Very high retention — specific, trackable progress toward tangible improvement
- Player agency in the meta-game (you choose which dishes to master)
- Makes experienced players feel visibly more capable than new players — earned power
- Low implementation cost — a counter per item + a cook-time modifier

**Cons:**
- Experienced players become significantly more efficient than new players — imbalances score comparisons
- Players may feel forced to serve the same items repeatedly rather than naturally
- Mastery bonuses must be meaningful enough to be motivating but not so large they make other items obsolete

---

### Hook 6: Shift Reports

**Concept:** After each round, a "shift report" screen replaces the generic game over screen. It shows not just score but a narrative recap of the session's standout moments: "Fastest delivery: 8 seconds (⚡ Lightning!)" "Near-miss save: 1 customer at 3% patience — you made it." "Best combo: 7 consecutive — UNSTOPPABLE." "Toughest moment: 3 tables requesting simultaneously at the 2:15 mark." The report frames the session as a story with the player as the protagonist.

**Why it works:** Converts a number summary into a narrative experience. Players do not remember scores — they remember stories. If the end screen says "you pulled off a 7-combo and saved Marco with 1 second to spare," the player will talk about it and want to create another story.

**Pros:**
- Immediately increases session replay value by making each round feel unique
- Creates shareable moments ("look at what happened in my last round")
- Zero new gameplay — entirely a presentation improvement
- Very low implementation cost — just display stats that are already being tracked

**Cons:**
- Requires the system to identify "notable moments" — some engineering for moment detection
- Text-heavy screen may lose players who want to immediately replay
- The moments must be genuinely interesting — if every report says "nothing special happened," the system fails

---

### Hook 7: The VIP Cascade

**Concept:** Occasionally a notable customer type arrives who, if served perfectly, triggers a "cascade" — they recommend the restaurant to their network and a wave of followers arrives in the next 45 seconds. Serve the food critic perfectly → "⭐ She's tweeting about you!" → 3 enthusiastic customers arrive, all tipping double. Serve a well-dressed guest perfectly → a business party of 4 arrives. Serve an elderly customer with extra care → they bring their whole family next visit.

The cascade is announced visually at payment time: "WORD IS SPREADING! 👥 +3 guests incoming in 40s." The player sees it coming and must prepare — clean tables, be ready at the kitchen.

**Why it works:** Creates consequence chains. Actions have meaning beyond their immediate score value. Good service in the first minute can make the last minute dramatically more profitable. Bad service in the first minute can starve the second minute of customers.

**Pros:**
- Creates strategic depth — certain customers are worth prioritizing over others
- The cascade announcement creates anticipatory tension ("I have 40 seconds to clear two tables")
- Reward feels proportional to quality of service — validates the "masterful service" fantasy
- Easy to extend with new cascade types

**Cons:**
- Cascade timing may conflict with other events — four things happening simultaneously is overwhelming
- Identifying "perfect" service requires clear criteria that the player can target
- Cascades arriving during peak load may be more burden than reward

---

### Hook 8: Daily Special

**Concept:** Each day, one specific item on the menu is the "Daily Special." It cooks 30% faster, scores 40% higher, and has a visual callout on the menu board and kitchen. Customers who order it get a visible "Today's special 🌟" badge on their order bubble. The item rotates daily (tied to real-world date). Players who play every day experience a different efficient route each day, preventing the game from becoming a fixed optimization problem.

**Why it works:** Creates a daily reason to return that is purely mechanical (today's special changes the optimal strategy). Players who play on Tuesday know that Wednesday's special is different. The anticipation of discovering tomorrow's special is a low-cost daily engagement driver.

**Pros:**
- Extremely low implementation cost — one line changes which item has modified stats
- Changes optimal play strategy daily — prevents the game from becoming "solved"
- Creates genuine daily novelty with zero content creation
- Players who play every day feel rewarded by always having a fresh angle

**Cons:**
- Players who play multiple times per day see the same special — novelty only works once per day
- If the special is an item the player has not mastered, it may feel like a penalty for not having mastered it
- Requires the menu board to clearly communicate the special — visual design dependency

---

### Hook 9: Combo Crescendo Escalation

**Concept:** The combo system is redesigned so that each tier feels qualitatively different, not just numerically different. At ×1.5, nothing changes visually beyond the counter. At ×2.0, the floor gains a subtle warm color wash — the restaurant feels warmer. At ×2.5, the music (once added) shifts tempo and the table candles "flicker excitedly." At ×3.0, the entire visual environment has transformed: the tables glow gold, the waiter leaves footprints of light, every delivery creates a star burst. The restaurant is visibly responding to the player's mastery.

When a combo breaks, the environment "dims" — a visible reset that makes the player feel the loss rather than just see a number change. A specific "COMBO LOST: ×2.5 → ×1.0" text announces it with unmistakable weight.

**Why it works:** The combo is the core retention loop — it creates "just one more round to get back to ×3.0." But only if the player can FEEL the difference between ×1.0 and ×3.0. If the two states look similar, the combo is just a score multiplier. If the two states feel like different experiences, the combo is a destination the player wants to return to.

**Pros:**
- The combo system already exists — this is entirely visual escalation with no new mechanics
- Creates a visceral, felt difference between low and high combo states
- The "break" moment becomes emotionally devastating in a satisfying way — creates the "good low" of the RESTAURANT_FANTASY.md analysis
- Players in ×3.0 state feel genuinely different about playing — more confident, more focused

**Cons:**
- Visual environment changes require per-combo-tier rendering logic
- The gold glow at ×3.0 must not impair readability of the priority system
- If the ×3.0 visual is too intense, it becomes distracting rather than empowering

---

### Hook 10: Personal Challenge Mode

**Concept:** After the player completes a standard round, the end screen offers one "Personal Challenge" generated specifically from their weaknesses in that round. If they had 3 angry customers: "CHALLENGE: Zero angry customers next round — double XP." If their combo never exceeded 4: "CHALLENGE: Reach ×2.0 combo next round — triple XP." If their score was low: "CHALLENGE: Beat [their specific score] next round — 1.5× XP."

The challenge is optional. The reward is XP-only (no pay-to-win implications). The challenge expires after one round (whether passed or failed). A new one is generated each time.

**Why it works:** Converts the generic "play again" motivation into a specific, personalized goal. The player is not going back to "play another round" — they are going back to "complete this specific challenge that I almost achieved naturally." This is the closest thing to a coach in a solo game.

**Pros:**
- Infinite variety — challenges are generated from real player data, never feel repetitive
- Each challenge is achievable because it is derived from near-misses in the actual session
- Creates specific focus — player enters the next round with a clear objective
- Extremely high replay motivation for competitive players

**Cons:**
- Challenge generation algorithm must be smart enough to generate achievable (but difficult) targets
- Players may feel pressured by optional challenges — need clear communication that it is optional
- If the challenge is too easy, the XP reward feels unearned; if too hard, it feels unfair

---

## SECTION 4 — RETENTION SYSTEMS

### Daily Goals

**Design principles:** Goals must be completable in one or two sessions (not "serve 1000 customers"). Goals must target behaviors the player enjoys, not ones they find tedious. Goals must be visible from the main menu — not buried in a menu.

Proposed goal types:
- Speed goals: "Earn 5 lightning deliveries" (encourages fast play)
- Streak goals: "Maintain ×2.0 combo for 90 seconds"
- Perfection goals: "Complete a round with 0 angry customers"
- Volume goals: "Serve 25 customers in a single session"
- Recovery goals: "Come back from a combo break and reach ×2.0 again"

**Three goals per day.** One easy, one medium, one hard. Complete any two → daily reward. Complete all three → bonus reward.

Reward: XP multiplier for the next round (not permanent power — time-limited boost). Completing daily goals feels good and does not make the game pay-to-win for non-daily players.

**Impact: HIGH.** Daily goals are the single most proven retention mechanic in mobile gaming. They convert "should I play?" into "I need to play to finish my goals."

---

### Achievements

Permanent unlockable records. Two types:

**Progress achievements** (visible progress bar, player can track them):
- "Served 100 customers total"
- "Earned 50 lightning deliveries total"
- "Reached level 5"
- "Maintained ×3.0 combo for 30 seconds"

**Discovery achievements** (no progress bar, player discovers them organically):
- "Served the same customer type 5 times in one round"
- "Had 4 customers angry in the same round and recovered to ×2.0"
- "Cleared all 5 tables simultaneously with no pending orders"
- "The Inspector" (discover and serve the inspector)

Progress achievements give players a map. Discovery achievements give players surprises. Both are necessary.

**Impact: MEDIUM-HIGH.** Achievements provide indefinite goals beyond "get a high score." But they must have visible rewards (badge on the main menu, cosmetic unlock) or they lose motivation.

---

### Progression and Unlockables

**The current system:** 10 levels, XP from score. Levels unlock nothing tangible. This is the core of the retention failure.

**Proposed system:** Each level unlocks one specific, visible thing.

Level 1 → New customer type: The Elder ("Nonno") with 20% longer patience
Level 2 → Kitchen upgrade: "Quick Burner" — one dish cooks 15% faster (player chooses which)
Level 3 → New table theme: different colored tablecloth
Level 4 → New waiter outfit: choose between two uniforms
Level 5 → New restaurant event: "Happy Hour" once per round — all tips doubled for 30 seconds
Level 6 → New customer type: The VIP with 3× tip potential but 40% shorter patience
Level 7 → Second kitchen slot: two dishes cook simultaneously (major gameplay change)
Level 8 → New waiter emotion: "focused" state — player can tap a special mode for 10 seconds where walk speed increases
Level 9 → New restaurant theme: walls and floor change appearance
Level 10 → "Legendary Mode" unlocked: harder, no patience-bar grace, massive XP multiplier

**Impact: VERY HIGH.** Unlockables with tangible gameplay or visual changes are the most effective retention mechanism in casual games. The player always has "something to work toward."

---

### Cosmetics

All cosmetic. None affect gameplay.

- Waiter uniforms (formal, casual, chef whites, seasonal outfits)
- Table themes (different tablecloth colors/patterns, different candle styles)
- Restaurant themes (wall colors, floor patterns, ambient light color)
- Plate designs (different food_plate textures)
- Score font styles (different number presentations on the floating labels)

Cosmetics should be earned through gameplay milestones or daily goals — never required, always visible on the main menu as something to aspire to.

**Impact: MEDIUM.** Cosmetics alone do not retain players. But cosmetics enhance the identity investment — "this is MY restaurant" — which supports all other retention systems.

---

### Challenges

Three types:

**Weekly challenge:** One specific performance challenge. "This week: reach ×3.0 combo in every session." Reward: large XP multiplier, cosmetic unlock.

**Special event challenge:** Seasonal or time-limited. "Valentine's Week: serve 10 romantic customers." Reward: seasonal cosmetic.

**Personal challenge:** Per-session, generated from the player's own performance (Hook 10 above). Reward: XP bonus on the next round.

**Impact: HIGH.** Challenges convert the monotony of repetition into specific goals that make repetition purposeful.

---

### Retention System Rankings (by impact)

| Rank | System | Impact | Complexity |
|------|--------|--------|------------|
| 1 | Level unlockables (tangible rewards) | Very High | Medium |
| 2 | Daily goals with visible progress | High | Low |
| 3 | Personal challenge (per-session target) | High | Medium |
| 4 | Rush Hour Events (session structure) | High | Low-Medium |
| 5 | Combo crescendo escalation (visual transformation) | High | Medium |
| 6 | Kitchen Mastery (cross-session cook reduction) | High | Low |
| 7 | Achievements (progress + discovery) | Medium-High | Low |
| 8 | Customer Memory (returning visitors) | Medium | Low |
| 9 | Reputation Arc (second objective layer) | Medium | Medium |
| 10 | Daily Special (rotating menu item) | Medium | Very Low |
| 11 | Shift Reports (narrative end screen) | Medium | Low |
| 12 | VIP Cascade (consequence chains) | Medium | Medium |
| 13 | The Inspector (meta discovery) | Low-Medium | Low |
| 14 | Cosmetics | Low | Low |
| 15 | Monetization | Future | — |

---

## SECTION 5 — FIRST 30 MINUTES

The first 30 minutes is the window during which the player decides whether this game is for them. Every minute must have a specific emotional purpose.

---

### Minute 0–5: DISCOVERY

**Target emotion:** "Oh, I understand this."

The new player opens the app and sees a restaurant. They see the waiter. They press PLAY. The tutorial guides them through the first complete service cycle — customer arrives, tap table, order goes to kitchen, tap kitchen, carry food, tap table to deliver, customer eats, tap table to collect payment, table is dirty, tap to clean.

**What must happen in this window:**
- The first customer must be served successfully. Never let the first tutorial customer leave angry.
- The player must execute one complete, uninterrupted cycle end-to-end.
- The score number must increase visibly — the player must see the direct connection between their action and the reward.
- At least one "⚡ FAST!" or positive feedback label must appear — so the player knows that speed is rewarded.

**What must NOT happen:**
- Multiple customers at once during tutorial
- Complex decision-making before the player understands the basics
- Silent failure (tapping a table with no result and no explanation)

**The 5-minute end state:** The player has successfully served 3–4 customers, knows all the action types, and understands that speed earns more points. They are curious whether they can do it with more customers.

---

### Minute 5–10: FIRST MASTERY

**Target emotion:** "I'm getting good at this."

The tutorial ends. Real spawning begins. Two tables are occupied simultaneously for the first time. The player experiences the need to choose — which table first? They make a choice. It works out (or they learn from it not working out). They discover the combo counter reaches ×1.5 after three consecutive happy customers. They feel the multiplier as a real reward, not just a number.

**What must happen in this window:**
- First time managing two simultaneous requests — the "multitasking arrives" moment
- First combo tier reached (×1.5 at 3 customers) — the player sees the counter change
- First "personal best" moment — their score exceeds their own first-attempt score
- The kitchen ready signal draws attention correctly — player picks up food with no confusion

**The 10-minute end state:** The player has achieved a small personal best. They have discovered that serving customers quickly matters (speed multiplier). They have seen the combo system. They feel like they are improving.

---

### Minute 10–20: STAKES ARRIVE

**Target emotion:** "This is actually hard — and I want to beat it."

The difficulty increases meaningfully. Patience bars get shorter. Three simultaneous customers creates genuine pressure. The player experiences their first near-miss (patience at 10%, delivered just in time) and their first failure (a customer leaves angry, penalty is shown, combo resets). The emotional range expands from "satisfaction" to include "tension" and "regret."

**What must happen in this window:**
- First angry customer leaves. The penalty is visible and the combo drops. The player feels the cost.
- First near-miss save. The customer was at 5% patience and the delivery made it in time. The player feels the relief and triumph. This single moment may be enough to retain them for another week.
- First time they realize they could have served a different order first — route optimization begins.
- End of a round. They see the end screen. Their score is noticeably higher than minute 5.

**The 20-minute end state:** The player has experienced failure and recovery. They have a clear mental model of what "playing well" looks like (fast routes, serving most urgent first). They have had at least one peak emotional moment. They know what "better" means and they want it.

---

### Minute 20–30: OPTIMIZATION AND IDENTITY

**Target emotion:** "I know how this works, and I want to prove it."

The player is now replaying rounds with an agenda: beat the last score, protect the combo, serve the most urgent table first. They are no longer learning — they are competing with themselves. The game has successfully transitioned from "discovery" to "mastery."

**What must happen in this window:**
- Player scores their personal best — and sees it acknowledged on the end screen.
- Player maintains a ×2.0 or higher combo for the first time — the multiplier feels earned.
- Player sees a "next round challenge" or daily goal for the first time — something specific to aim for.
- Player sees their level progress bar on the end screen and realizes they are close to level 2.

**The 30-minute end state:** The player has a personal best to beat, a level to reach, and an emotional memory (the near-miss, the perfect chain) that makes this game feel like a place they have been, not just a thing they have done. They will return.

---

## SECTION 6 — FIRST 7 DAYS

The first 7 days defines whether the player becomes a regular. Each day must offer something the previous day did not.

---

### Day 1: The Hook

**Trigger:** Organic discovery (referral, store listing, social share).

The player experiences the first 30 minutes as designed above. They level up to Level 2 or approach it. They see that leveling unlocks something ("Quick Burner" kitchen upgrade at Level 2). They finish Day 1 with a reason to return: an unlockable within reach.

**Day 1 end state:** Personal best set, Level 2 within 2–3 sessions, one emotional memory from near-miss play.

---

### Day 2: The Return

**Trigger:** The main menu shows yesterday's high score: "YOUR BEST: 2,840 — Can you beat it today?"

The player returns not because the game notified them, but because they remember their score and want to improve it. One daily goal is waiting: easy enough to complete in one session.

**New content:** The "Daily Special" is a different item from yesterday. The kitchen route feels slightly different. The game feels fresh without any new content being created.

**Day 2 end state:** Personal best beaten (or the player saw how close they were). Daily goal completed. Level 2 reached or very close.

---

### Day 3: The Discovery

**Trigger:** Level 2 unlocks the first tangible upgrade ("Quick Burner" — one dish cooks faster). The player experiences a measurably faster kitchen for the first time.

**New content:** The player may also encounter their first customer type that carries a memory modifier — "MARCO — First visit. Impress him." The narrative dimension opens.

**Day 3 end state:** The player feels the result of their progression — their sessions are slightly more efficient. They want to continue leveling up to see what Level 3 unlocks.

---

### Day 4: The Challenge

**Trigger:** The first personal challenge appears: "Beat your combo record (7) this round — triple XP."

The player enters the round with a specific goal. The goal is achievable because it is based on their own performance. They either beat it (triumph) or come heartbreakingly close (motivated to try again immediately).

**New content:** Rush Hour events may begin appearing at this difficulty level. The session structure feels different — not just random spawning but waves with names.

**Day 4 end state:** The player has either achieved their first personal-challenge bonus or is one session away from it. They have experienced the game as "me vs. my best self" rather than just "me vs. the game."

---

### Day 5: The Streak

**Trigger:** If the player has played all 5 days, a "5-day streak" acknowledgment appears on the main menu. Small cosmetic reward (a different tablecloth color, a new icon on their player card). Not gameplay-affecting — purely recognition.

The daily goals have now been the main daily return driver for 4 days. The player has a rhythm.

**New content:** The VIP Cascade event (Hook 7) may appear for the first time — a well-served customer causes a wave of followers. This is the first time an action creates a visible narrative chain.

**Day 5 end state:** The player has a 5-day habit. They have experienced the cascade moment (one action causing more action) and want to see it again. Level 3 is visible on the horizon.

---

### Day 6: The Near-Miss

**Design intent:** Day 6 is intentionally designed to be almost-but-not-quite perfect.

A 3-star round requires 90% happy customers AND score ≥2000. If the player has not yet achieved 3 stars, Day 6 should generate a round that ends at 85% happy or 1900 score — close enough to see 3 stars was achievable with one more correct decision.

The end screen on this round should say "89% happy — you needed 90% for 3 stars. 1 customer away from perfect."

**Day 6 end state:** The player knows exactly what they did wrong. They want to fix it. They will return on Day 7.

---

### Day 7: The Milestone

**Trigger:** One week of play.

The player has been playing for 7 days. At this point, they have likely reached Level 3–4. A week-one acknowledgment appears: "You've been running this restaurant for 7 days. The neighborhood is talking." This is purely narrative — no gameplay impact.

The actual Day 7 reward is reaching Level 4: a new waiter outfit (visible, cosmetic) or a table theme change. The player can see their restaurant looking different because of their week of work.

**Day 7 end state:** The player has invested a week, seen their restaurant visually evolve, and experienced nearly every system in the game. They have a high score to defend, a personal challenge to beat, daily goals that arrive each morning, and an unlockable at Level 5 that they can see in the level description. They are retained.

---

## SECTION 7 — MONETIZATION (FUTURE ONLY)

*Design only. No implementation. No activation.*

**Core principle:** The game must never be pay-to-win. A player who has never paid should be able to reach the same score as a player who has paid. Money can buy cosmetics, time, and content — never performance.

### Tier 1: One-time purchase (best for long-term trust)

**Remove Ads** — $1.99–$2.99. Removes any interstitial ads if ever added.

**"Supporter Pack"** — $3.99. A cosmetic bundle (2 waiter outfits, 2 restaurant themes, 1 special table set) + permanent "⭐ Supporter" badge on the main menu player card. No gameplay impact.

*Impact on retention: High (players who pay once feel invested). Impact on fairness: Zero (purely cosmetic).*

---

### Tier 2: Cosmetic bundles (recurring revenue, no power)

**Seasonal theme packs** — $0.99–$1.99. A holiday-themed set: new wall colors, tablecloths, waiter outfit matching a holiday aesthetic. Available for 30 days, then removed. Creates scarcity without FOMO on gameplay.

**Character skin packs** — $0.99. Alternate waiter appearances (e.g., "Chef Mode" with toque, "Casual Friday" with hoodie). Never affects emotion system or walk speed.

*Impact on retention: Medium (creates desire). Impact on fairness: Zero.*

---

### Tier 3: XP acceleration (the fairness edge case)

**"Double XP Weekend"** — Free (event-based, no purchase). Drives engagement organically.

**"XP Boost"** — $0.99 for 3 days of 2× XP. Accelerates cosmetic unlocks. Does NOT accelerate level-gated gameplay unlocks (those remain time-gated by sessions played, not XP earned). A paid player reaches cosmetics faster but reaches gameplay unlocks at the same session rate as free players.

*Impact on retention: Medium-High (players close to a level may pay to get there). Impact on fairness: Low (gameplay unlocks unaffected).*

---

### Tier 4: Content expansion (future, when game is larger)

**"Story Mode"** — $2.99. A structured campaign: 20 curated rounds with specific scenarios, goals, and narrative ("the health inspector is coming, the fire alarm went off on Table Night, the power went out mid-service"). Entirely separate from the infinite loop mode. No advantage in the standard mode.

*Impact on retention: High (creates an entirely new reason to engage). Impact on fairness: Zero.*

---

### What never gets monetized (the promise)

- Cook times (never sell "instant cook" tokens)
- Patience extensions (never sell "this customer will wait longer")
- Combo protection (never sell "your combo is safe for this round")
- Ad-watching to revive a failed round (no continues)
- Energy or lives systems

The moment the game sells performance, it destroys the core fantasy: "you are the best waiter in the room." A player who paid to be better is not skilled — they bought skill. The fantasy collapses. Retention collapses. Trust collapses.

---

### Monetization ranking by fairness × retention

| Rank | System | Fairness | Retention |
|------|--------|----------|-----------|
| 1 | Remove Ads (one-time) | Perfect | High |
| 2 | Supporter Pack (cosmetic bundle) | Perfect | High |
| 3 | Story Mode expansion | Perfect | Very High |
| 4 | Seasonal theme packs | Perfect | Medium |
| 5 | XP Boost (cosmetics only) | Good | Medium |
| 6 | Character skins | Perfect | Medium |

---

## SECTION 8 — NORTH STAR

**The emotion TableRush must create:**

> **"I am the most capable person in this room — and the room knows it."**

Every system, every visual, every mechanic, every sound must answer one question: does this make the player feel masterfully competent? 

Not lucky. Not powerful. **Competent.** There is a difference. Lucky is external. Powerful is given. Competent is earned. The specific dopamine hit that restaurant service games create — and that TableRush must create — is the feeling that every good outcome is the direct result of a decision the player made. The fast delivery was because they moved quickly. The perfect combo was because they read the room correctly. The last-second save was because they prioritized right.

This emotion has a name in psychology: **self-efficacy** — the belief that your actions are the cause of your outcomes.

When self-efficacy is high, players feel engaged, capable, and hungry to prove it again.

When self-efficacy is low — when the game feels random, the controls unclear, the priority system unreadable — players feel frustrated and quit.

Every design decision: visual, mechanical, progression, retention — must be tested against this question: **Does this increase or decrease the player's sense of being masterfully capable?**

If the answer is "increases": build it.
If the answer is "decreases": cut it or redesign it.

---

## TOP 5 FEATURES — POST-VISUAL-REBOOT ROADMAP

Highest retention impact × lowest implementation complexity. These five features transform the existing game loop into something a player returns to tomorrow.

---

### #1 — Combo Always Visible (HUD Change)

**What it is:** The combo display changes from "invisible at ×1.0, appears at ×1.5" to "always visible." At ×1.0 it shows "×1" in muted gray. At ×1.5 it grows and becomes orange. At ×2.0 it grows further, becomes red. At ×3.0 it is large, gold, and the pill behind it glows.

**Why it's #1:** The combo is the game's core retention mechanism. It is the thing that makes players say "one more round to get back to ×3.0." If the player never discovers the combo system — which currently happens unless they serve 3+ consecutive happy customers — they have no reason for the emotional investment that creates "one more round." This is not a new feature. It is a fix to an existing feature that is currently invisible.

**Implementation complexity:** Very low. A single HUD text change + 3 new visual states for an existing element.

**Retention impact:** The highest of any single change. Every player who discovers the combo system retains longer. Currently, many players never discover it.

---

### #2 — Daily Goal (One Specific Target Per Day)

**What it is:** One daily goal shown on the main menu, generated fresh each day. "Today: maintain ×2.0 combo for 60 seconds. Reward: 2× XP on next session." Resets at midnight.

**Why it's #2:** The daily goal is the single most proven mobile retention mechanic. It converts "should I play?" into "I need to play — I have a goal." The goal must be visible on the main menu before the player starts (not buried post-game) because its job is to motivate starting the session, not finishing it.

**Implementation complexity:** Low. One localStorage timestamp check + one goal display on the main menu + end-of-round goal evaluation.

**Retention impact:** Very high. Creates a daily return habit from the first day it exists.

---

### #3 — Last-Second Save Theater

**What it is:** When a player delivers food to a customer whose patience bar is below 8%, a specific sequence fires: the patience bar flashes rapidly for 1 second before delivery, the delivery itself triggers a larger-than-normal score pop with "CLOSE CALL! ⚡" text, the customer's face visibly switches from angry to happy with an exaggerated animation, and the combo is maintained with a "SAVED! ×N" label.

**Why it's #3:** This is the highest emotional peak in the game. RESTAURANT_FANTASY.md calls it "The Last-Second Save" and describes it as potentially retaining players for another week on its own. Currently, the near-miss has no theater — the delivery just happens and the score appears. Adding the theater makes the near-miss feel like a moment, not just a statistic.

**Implementation complexity:** Low-medium. A threshold check (patience < 8%) + 3 visual additions (flashing bar, special score pop text, customer face transition animation).

**Retention impact:** Very high. This single moment, experienced once, creates the "did you know you can save them at the last second?" story that players share and remember.

---

### #4 — Yesterday's Score on Main Menu

**What it is:** The main menu shows the player's best score from their last session (not all-time best — *yesterday's* best). "LAST SESSION: 2,840." This creates a specific daily return trigger: the player sees the number they set yesterday and wants to beat it.

**Why it's #4:** The all-time high score provides long-term competition. The last-session score provides immediate daily competition. "Can I beat what I did yesterday?" is a more psychologically acute hook than "can I beat my all-time best" because the all-time best may feel out of reach, but yesterday's performance always feels achievable.

**Implementation complexity:** Very low. One additional localStorage key storing the most recent session's score + one text element on the main menu.

**Retention impact:** High. Creates a daily return anchor. Players who would not otherwise return think "let me just see if I can beat what I did last time."

---

### #5 — Shift Report End Screen

**What it is:** The game over screen is redesigned to highlight the session's standout moments as a narrative summary instead of just displaying numbers. "YOUR SHIFT REPORT: Best delivery: 6 seconds ⚡ | Near-miss save: 1 | Best combo: ×2.5 reached | Total served: 18 | All-time record: 3,240 ✓ BEATEN."

Each stat has a brief label that frames it as an achievement rather than a measurement. The last line always says either "BEAT YOUR RECORD: +[N] points above your best" or "YOUR BEST: [N] more needed for a new record."

**Why it's #5:** The end screen is the last thing the player sees before deciding whether to replay. Currently it feels like a statistics page. A shift report makes the session feel like a performance — something that happened, with specific memorable moments. "I saved Marco with 1 second left" is a story the player takes away. "Score: 2,840" is not.

**Implementation complexity:** Low. Track 5–6 per-session stats (fastest delivery time, near-miss count, combo record reached, customers served) + redesign the end screen presentation with narrative labels.

**Retention impact:** High. Players who see their own performance framed as a story are more likely to want to create another story immediately.

---

## SUMMARY

**The North Star:** "I am the most capable person in this room — and the room knows it."

**Why players leave now:** After 7 minutes, there is nothing new to discover. The loop becomes execution. Execution without stakes is a job, not a game.

**The five changes that will keep them coming back:**

1. Make the combo system visible from the first customer (HUD change)
2. Give them one specific daily reason to return (daily goal)
3. Make near-misses into memorable peak moments (save theater)
4. Show them yesterday's score on the main menu (personal anchor)
5. End each session with a story, not a statistic (shift report)

These five changes require no new gameplay mechanics, no new customer types, no level redesign. They are entirely changes to what the player *sees* and *feels* about the game loop that already exists.

The gameplay loop is good. The player just cannot feel it yet.

---

*Status: DESIGN ONLY. Awaiting approval. No implementation until approved.*
