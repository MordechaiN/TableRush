# TableRush — Commercial Readiness Report
*Honest scoring. No inflated numbers. Based on full playthrough + screenshot analysis.*
*Date: 2026-06-04*

---

## Executive Summary

TableRush has a complete, playable game loop that would survive the first 3 minutes of a new player's session. The core mechanic is sound, the visual language is coherent, and the feedback system communicates what's happening. The game does NOT yet feel like something a player would return to tomorrow without external motivation. Primary gaps are in long-session retention and the first-impression visual quality of individual elements at small scale.

**Overall Commercial Readiness Score: 6.4 / 10**

A score below 7 means "would not confidently list on an app store today." A score below 8 means "playable but not remarkable."

---

## Scoring by Category

### 1. First Impression (Screenshot Test)
**Score: 7 / 10**

What a screenshot of the main menu communicates:
- ✅ Clear game title (TABLE RUSH) — instantly readable
- ✅ Warm amber restaurant palette — evokes the genre
- ✅ Animated food icons — hints at menu items
- ✅ Orange PLAY button — clear hierarchy
- ❌ Background table silhouettes are nearly invisible (alpha too low)
- ❌ No "what is this game" visual — a new viewer can't tell it's a service game from the menu alone
- ❌ No player character on the menu screen — the hero isn't introduced

A screenshot of the game scene communicates:
- ✅ Clear restaurant layout
- ✅ Burgundy tablecloths readable as tables
- ✅ Float emoji above table shows "ordered food" at a glance
- ✅ Green READY zone glow — unmissable when food is done
- ❌ Individual customers are NOT visible at seated tables — sprites disappear against the warm floor
- ❌ Kitchen zone labels (COOKING / READY) are 10px — not readable at a glance

---

### 2. Core Loop Quality
**Score: 8 / 10**

The complete service arc (seat → order → cook → deliver → eat → pay → clean) works reliably.
- ✅ Each step has a clear visual trigger
- ✅ Float emojis communicate table state without reading text
- ✅ Physical food plate appears on READY counter — tangible feedback
- ✅ Tray shows capacity; player knows what they're carrying
- ✅ Combo system creates escalating excitement
- ❌ Customer at table is hard to perceive as a person — they're a sprite against a warm floor
- ❌ Food ordering is automatic (no menu choice) — reduces player agency
- ❌ No "close call" tension when managing 3+ tables simultaneously (rush hour helps but not enough density pressure)

---

### 3. Game Feel (Moment-to-Moment)
**Score: 7 / 10**

- ✅ Camera flash on food ready — unmissable green pulse
- ✅ Escalating camera shake at combo milestones ×3/4/5
- ✅ Gold flash + coin burst on payment
- ✅ Walking animations + idle bob on player
- ✅ Delivering food triggers `deliverAnim()` bounce on player
- ✅ Text floats ("✓ SERVED!", "+350") give instant reward feedback
- ❌ Walk speed feels slightly slow when managing 3+ tables — creates frustration not tension
- ❌ The difference between ×1.0 and ×3.0 multiplier doesn't feel meaningful in movement/visuals
- ❌ Cleaning a table has minimal satisfaction — "🧹 CLEAR!" is an improvement but still underserved

---

### 4. Audio
**Score: 7 / 10**

- ✅ 12 synthesized SFX types — full coverage of all game events
- ✅ Escalating combo fanfares (4 tiers)
- ✅ Food ready, delivery, payment, dishwasher all have distinct sounds
- ✅ SFX toggle works correctly
- ❌ No background music — silent restaurant breaks immersion immediately
- ❌ Synthesized sounds feel thin compared to the visual polish; need warmth/richness
- ❌ Missing: ambient restaurant noise (chatter, clinking glasses)

---

### 5. Visual Consistency
**Score: 7 / 10**

- ✅ Unified warm amber/terracotta palette throughout
- ✅ Burgundy tablecloths are consistent and readable
- ✅ Player at scale 2.0 reads as the clear hero
- ✅ Pendant lamps add depth to dining area
- ✅ Service counter is a solid physical barrier
- ❌ Kitchen zone is proportionally small (80px tall) — hard to read details
- ❌ Customer sprites at table are too small / same color temperature as floor
- ❌ Main menu and game scene have different visual "energy" levels

---

### 6. Tutorial / Onboarding
**Score: 6 / 10**

- ✅ 7-step tutorial covers the full service arc
- ✅ Tutorial step advances only when player correctly performs the action
- ✅ One customer at a time during tutorial (controlled pressure)
- ❌ Tutorial text at bottom card reads as "developer instructions" not "game teaching"
- ❌ No visual arrow or spotlight directing player attention during tutorial steps
- ❌ No "try it!" guided action — player must independently discover where to tap
- ❌ After tutorial, no "practice mode" or gentle first round

---

### 7. Progression / Retention
**Score: 5 / 10**

- ✅ XP + Level system (10 levels) — gives measurable progress
- ✅ Stars per round (1-3) — shows quality assessment
- ✅ High score on main menu — drives "beat yesterday's score"
- ❌ No content unlocked at new levels — leveling up feels hollow
- ❌ No daily goal or daily reward — no reason to return tomorrow specifically
- ❌ Star system doesn't surface on main menu — player doesn't see "improve your 2-star round"
- ❌ No session variety (same 5 tables, same 5 foods, same layout every round)

---

### 8. Difficulty / Balance
**Score: 7 / 10**

- ✅ Time-based difficulty tiers are well-paced (gentle → moderate → pressure)
- ✅ Rush hour wave creates recognizable pressure peaks
- ✅ Score penalties for angry customers create meaningful consequence
- ✅ Patience values tuned correctly (not punishingly fast)
- ❌ Expert players plateau quickly — no escalation beyond the 3-minute window
- ❌ No way to lose "immediately" — patient players can ignore tables and still reach end
- ❌ Cleaning dirty tables doesn't feel urgent enough (low timer pressure)

---

### 9. Presentation (App Store Standard)
**Score: 5 / 10**

- ✅ No console errors
- ✅ Builds cleanly
- ✅ TypeScript strict mode passes
- ✅ Version number shown
- ❌ No music
- ❌ No haptic feedback (mobile)
- ❌ No loading screen / splash screen
- ❌ No title screen character / mascot
- ❌ No "how to play" screen or visual tutorial
- ❌ Game icon is the placeholder SVG favicon, not an app icon

---

## Overall: 6.4 / 10

| Category | Score |
|----------|-------|
| First Impression | 7 |
| Core Loop | 8 |
| Game Feel | 7 |
| Audio | 7 |
| Visual Consistency | 7 |
| Tutorial | 6 |
| Progression | 5 |
| Balance | 7 |
| App Store Presentation | 5 |
| **Average** | **6.6** |

---

## What Would Move the Score to 8+

These three changes would cross the commercial threshold:

### 1. Background Music (score impact: +0.8)
Even a simple 2-bar looping restaurant jazz track changes everything about the game's perceived quality. Silent games feel unfinished. This is a 1-day implementation with Web Audio API.

### 2. Customer Visibility at Tables (score impact: +0.5)
Customers seated at tables need to read as PEOPLE, not warm-colored sprites. Options: (a) larger customer scale, (b) distinct customer hat/hair that extends above table surface, (c) slightly cooler skin tones to contrast with warm floor. The current seat ring is a workaround; fixing the root cause creates dramatically better legibility.

### 3. Meaningful Level Rewards (score impact: +0.5)
Level 2 should unlock something a player can see: a new customer type, a new food, a visual decoration. Currently leveling up is text-only. One visible unlock at level 2 creates the "one more round" hook.

---

## What Would NOT Move the Score Significantly

- More table states / visual variety (diminishing returns; core states read well now)
- More complex order system (adds frustration, not delight at this stage)
- Leaderboards / social features (requires backend; not the bottleneck)
- More camera effects (already solid; more would be noise)

---

## Conclusion

TableRush is a polished prototype that would earn positive comments from players who discover it through a game jam or Itch.io. It would NOT compete on the App Store or Steam against Overcooked / Good Pizza Great Pizza without music, a stronger first impression, and one concrete "see you tomorrow" hook.

The commercial gap is not about code quality or game design — the design is sound. It's about three production realities: audio, character legibility at scale, and one reason to return.
