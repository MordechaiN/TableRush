# PLAYTEST ROUND 1 — Honest Player Analysis
_Date: 2026-06-03 | Build: v0.9.0_

---

## Raw Session Data (Bot, Optimal Play)

| # | Score | Best Combo | Happy | Angry | First ×2.0 | Fastest |
|---|-------|-----------|-------|-------|-----------|---------|
| 1 | 23,755 | 21 | 21 | 0 | 39s | 0.9s |
| 2 | 24,555 | 22 | 22 | 0 | 37s | 0.8s |
| 3 | 19,450 | 21 | 21 | 0 | 39s | 1.0s |
| 4 | 23,840 | 22 | 22 | 0 | 39s | 0.9s |
| 5 | 24,780 | 21 | 21 | 0 | 32s | 1.0s |

**Bot averages:** 23,276 score | 21.4 best combo | 21.4 happy | 0 angry  
**Near-miss saves across all sessions: 0**

---

## 8 Gameplay Questions (Honest Answers)

**1. Did the combo system feel exciting?**  
Yes — when it escalated. The jump from ×1.0 to ×2.0 feels like nothing (serves 1-3 are barely different). ×3.0 starts to feel real. ×4.0 → ×5.0 is when it genuinely gets good. But a real player spends the first 65 seconds at ×1.0-×2.0 wondering if anything matters.

**2. Did losing combo feel fair?**  
Can't answer from bot data (combo was never broken). But the code shows: combo resets to 0 on any missed table, with camera shake and "💔 ×N LOST!" feedback. A real player losing ×4.0 at minute 2 would feel devastated. The penalty is brutally steep relative to how long it took to build.

**3. Was the score legible during play?**  
No. Score text was 17px dark-brown on a cream HUD panel at depth 0 — behind the wall (depth 1). In practice the score was invisible for most of the session. **This has been fixed in this commit.**

**4. Did the pacing feel right?**  
The first 20-25 seconds are dead: no customers have been served, no payments collected, no combo. The game "starts" at about the 25-second mark. Then it builds slowly to ×5.0 at ~2:10. The exciting part (×4.0+) only lasts ~50 seconds out of 180.

**5. Did the rewards feel proportional?**  
No. A payment at ×1.0 feels the same as at ×5.0 — same floating text size, same score pulse. The combo is supposed to make everything bigger but the visual feedback didn't communicate that. **Fixed: payment floats now scale 1× to 1.8× with multiplier tier.**

**6. What was the most confusing moment?**  
The first serve: you click the kitchen, pick up food, deliver it, then you wait for the customer to eat before you can collect payment. That eating delay (~2-4 seconds with no feedback) is opaque. Real players will click the table during eating and nothing happens. No "please wait" indicator.

**7. Would a real player reach ×5.0?**  
Probably not on first play. Real humans serve at ~50-60% of bot efficiency (maybe 12-14 customers vs 21-22). That means they'd cap out around ×3.0-×4.0. The ×5.0 tier (combo 15+) may be genuinely unreachable for casual players.

**8. What one thing would you tell the developer?**  
The score is the primary success metric but it was invisible. Fix that first. Everything else is tuning.

---

## Top 10 Problems

1. **Score was invisible** — 17px dark text at depth 0, behind the wall at depth 1. Fixed in this session.

2. **Feedback doesn't scale with combo** — A ×5.0 payment looks exactly like a ×1.0 payment. The escalation isn't felt. Fixed: floats now 20px→36px based on combo tier.

3. **Dead start (0-25s)** — 20+ seconds pass before anything rewards the player. Restaurant looks empty. No urgency, no feedback.

4. **Eating phase is opaque** — After delivery, customer eats for 2-4s with no "please wait" signal. Clicking the table does nothing and there's no explanation why.

5. **×5.0 is likely unreachable for casual players** — Requires 15 consecutive perfect serves. Bot does it in ~2:10. A real casual player will top out at combo 8-12.

6. **Near-miss saves = 0** — The mechanic never fires even in 5 optimal sessions. Either customer patience never approaches 0 (timers too long) or the threshold (8% patience) is too tight. The mechanic is invisible.

7. **Score variance is confusing** — 19k vs 24k with identical play. The patience-based multiplier creates wide variance that players won't understand. Losing 5k "for free" feels unfair.

8. **No priority signal** — In a full restaurant (5 tables), there's no clear signal of which table to visit next. Players will misplay queue order constantly.

9. **Combo loss at high tier is brutal** — Losing ×4.0 after 90 seconds of building resets all momentum. The punishment asymmetry (long build, instant reset) may push players to quit.

10. **Timer urgency too late** — "30s LEFT!" warning fires at 2:30 of 3:00. Players don't feel urgency until the very end, then panic.

---

## Top 10 Opportunities

1. **Score as hero** — Now that it's visible, animate score milestones (crossing 10k, 20k, etc.) with brief fanfare.

2. **Eating phase indicator** — Show a small timer/food icon while customer eats. Eliminates confusion, adds tension.

3. **Patient status bars** — Visual patience timer on tables so players can prioritize who to serve next. Adds genuine strategic decision-making.

4. **Combo safety net** — Give players 1 "combo shield" per session (earned at first ×3.0) that absorbs one combo break. Reduces frustration, rewards reaching first milestone.

5. **Earlier difficulty ramp** — First angry customer can't come until ~100s. If patience timers were tighter, real pressure starts at 60s and the whole game feels more urgent.

6. **Score milestone celebrations** — At 5k, 10k, 20k: brief HUD flash or announcement. Gives players a target to chase.

7. **Near-miss rescue window** — Show a "SAVE NOW!" indicator when any customer drops below 15% patience. Would activate nearMissSaves more frequently and reward attentive players.

8. **Speed bonus indicator** — "⚡ SPEED BONUS" float already exists but only fires at certain thresholds. Make it visible at any patience > 90% to encourage speed.

9. **Replayable high score line** — Show previous session's score as a ghost line on the HUD during play ("Beat: 23,755"). Direct competition with self drives replays.

10. **First serve under 15s badge** — Reward fast start with a bonus that compounds into early combo. Removes dead zone frustration.

---

## The One Question: What single change has the highest impact on fun?

**The score was invisible.**

That's it. The entire game communicates success through numbers — score, combo count, multiplier — but the most fundamental metric (total score) was rendered behind the wall at depth 0 in a 17px dark font that blended into the cream panel.

A player who can't see their score can't feel good when it goes up. The combo announcements help (they're loud and dramatic) but they don't tell you whether you're having a good session vs a bad one. Score does that.

**Implemented:** Score now 21px, depth 4 (above all game elements), flashes gold with every increment, and payment floats scale 1× to 1.8× based on combo multiplier so a ×5.0 payout LOOKS as big as it IS.

---

## What Was Implemented

**Score Visibility + Scaled Rewards** (`src/scenes/GameScene.ts`)

1. HUD panel depth: 0 → 3 (above wall)
2. All HUD text elements depth: 0 → 4
3. Score text: 17px → 21px
4. Score flash: every `addScore()` call briefly turns text gold and scales 1.3× (was 1.1×)
5. `showFloating()` now accepts `sizeMult` parameter
6. Payment floats: 20px at ×1.0-×2.0 | 25px at ×3.0 | 30px at ×4.0 | 36px at ×5.0
7. Delivery floats: 20px at ×1.0-×2.0 | 23px at ×3.0 | 27px at ×4.0 | 32px at ×5.0

The reward now FEELS proportional to the combo.
