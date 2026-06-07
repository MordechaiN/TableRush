# COMMERCIAL AUDIT

**Date:** 2026-06-07  
**Honest rating: "Good Alpha, Not Yet Beta"**

---

## The Honest Question

Why would a player choose TableRush over Cooking Fever?  
Why would they return tomorrow?

This document answers both questions — including the gaps we haven't closed yet.

---

## Top 20 Weaknesses, Ranked by Severity

### Critical (blocks commercial launch)

**1. No persistent account / cloud save**  
Progress is in localStorage. Clear cache → lose everything. No sign-in, no iCloud sync, no backup. Any serious player eventually loses their progress. Fixes before launch: implement cloud save or at minimum a visible save-code flow.

**2. No onboarding for new session types**  
A player at Level 5 who gets "CRITIC NIGHT" for the first time has no idea what the critic wants, what a rave review does, or why they should change their behavior. The announcement tells them the name but not the rules. Needs: 1-sentence mechanical explanation in the announcement overlay.

**3. Only 5 food items, no variety pressure**  
Every customer orders from the same 5-item menu. There's no complexity pressure from conflicting orders, timing differences between dishes, or customer preferences. Cooking Fever has ~50 items per restaurant. This is the deepest content gap.

**4. No real-money hook or IAP design**  
If this is a commercial product, there's no monetization path sketched. No premium currency, no extra lives, no cosmetics. Even a F2P hook (daily bonus coin) needs to be designed before launch.

**5. One restaurant (one location)**  
Cooking Fever has 40 restaurants. TableRush has one room forever. No progression of venue, no new environment, no "where am I going next?" This is the core long-term retention problem.

---

### High (meaningful retention damage)

**6. 3-minute sessions feel short after Level 3**  
Once the player has tray capacity and speed, 3 minutes ends before they feel satisfied. No session length options or earned overtime mechanic.

**7. No social features**  
No leaderboard, no friend comparison, no share score. "I beat Level 7" has no audience.

**8. Angry leave animation has no weight**  
When a customer walks out, it should feel like a failure. Currently it's a fade-out. Needs: dramatic exit, crowd reaction, something that makes the player wince.

**9. Combo reset feels punishing but not teachable**  
Players don't know why the combo broke or what they should have done differently. The "×X.X LOST!" floating text appears but there's no post-hoc explanation.

**10. No mid-session save point**  
If the app is backgrounded for 10 seconds, the session is gone. No resume from background mechanic.

---

### Medium (polish gap from premium competitors)

**11. Sound design is functional but not emotional**  
Current SoundManager covers all events but the sounds themselves are Web Audio API sine waves. No actual recorded foley, no satisfying "ding" on payment, no real ambient restaurant noise.

**12. Family table dessert round is unclear**  
When a family table goes back to "requesting" state after eating, the player doesn't know if something went wrong or if this is intentional. The "DESSERT TIME!" floating text is easy to miss. Needs a clearer visual state on the table.

**13. No tutorial for new session types**  
The tutorial only teaches the base flow (seat/order/cook/deliver/pay/clean). A player encountering the critic for the first time has no guidance.

**14. Main menu has no "daily goal" progress bar**  
DailyGoal is computed in ProgressionSystem but is not surfaced prominently in the main menu. Players don't know they have a goal.

**15. No idle / AFK detection**  
If the player puts their phone down during rush hour, customers leave silently. No pause-on-background, no gentle wake-up prompt.

---

### Low (polish, not blocking)

**16. Game Over screen can overflow vertically**  
With story events added, the Game Over layout can push buttons below the visible area at small screen heights. Needs dynamic layout or scroll.

**17. Business customer briefcase visual is small**  
The briefcase graphic is 18px wide. On a phone screen it's almost invisible. Should be larger or replaced with a color-band indicator.

**18. VIP rope at Level 7+ sits in the waiting queue zone**  
The velvet rope spans the entry area where customers queue. Visually conflicts during busy sessions. Should be tucked further to the side.

**19. No haptic feedback on mobile**  
Payment collection, combo milestone, rush hour start — none trigger haptic feedback. iOS/Android have APIs for this. Missed opportunity.

**20. Credits scene has placeholder-grade content**  
Current credits: "Game Concept: Mordechai Neeman, Implementation: Claude Code." No proper credits page, no version number, no copyright.

---

## The Two Questions

### Why choose TableRush over Cooking Fever?

**Honest answer: not many reasons yet.**  
Cooking Fever has more locations, more food variety, a richer meta-loop, and a polished free-to-play economy. TableRush's advantage is: cleaner UI, faster onboarding, and the "living restaurant" narrative (story events, session personality). That's a real differentiator if executed well — a player who values story over grind would prefer TableRush. But that requires the story system to be much richer than 4 text lines.

**What would make the answer better:**  
- Restaurant that visually tells a story (not just decor unlocks)
- Customer characters with names players remember
- Sessions where something genuinely surprising happens (critic fight, birthday cake disaster, VIP who becomes a regular)

### Why return tomorrow?

**Current hooks:**
- Daily goal (exists but buried)
- Level progression (10 levels, meaningful unlocks)
- High score persistence
- New session type → different shift experience

**Missing hooks:**
- "One more" pull: end-of-session should always leave the player 80% of the way to the next thing
- Social pressure: no leaderboard, no share
- New content unlock: Level 8, 9, 10 don't unlock new situations — just stat hints

---

## Verdict

TableRush is a solid Alpha. The core loop works. The content progression creates session variety. The visual quality is above most indie mobile games. But it is not yet commercially competitive with top-tier cooking games.

**Minimum for Beta:**  
- 2nd restaurant with new aesthetic
- 10+ food items with timing variation
- Cloud save or backup code
- Onboarding for each new session type
- Daily goal visible on main menu

**Minimum for Launch:**  
All Beta requirements plus:  
- Monetization design (even minimal)
- Sound design overhaul
- 5+ restaurants
- Social layer (leaderboard minimum)
