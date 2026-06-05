# ALPHA TO RELEASE GAP — TableRush
**Date:** 2026-06-05
**Status:** Product audit — no code changes, no implementation
**Purpose:** Honest gap analysis between current alpha state and commercial release standard

---

## SEVERITY LEGEND
- **BLOCKER** — Cannot ship without resolving. Release gate fails.
- **HIGH** — Significant retention/quality impact. Must resolve pre-launch.
- **MEDIUM** — Noticeable gap. Resolve before launch if time allows.
- **LOW** — Polish. Post-launch acceptable.

---

## CATEGORY 1 — VISUAL / ART

### V1 — All art is procedurally generated canvas drawing
**Severity: BLOCKER**
Every character, object, and texture in TableRush is drawn at runtime using Phaser Graphics primitives — `fillRect`, `fillCircle`, `strokeCircle`, `fillRoundedRect`. This produces art that is coherent but instantly identifiable as hand-coded rather than illustrated. At commercial-screenshot zoom, the characters read as geometric shapes in colored costumes. A player scrolling the App Store would scroll past this.

**Gap:** The game needs real sprite assets for its player character, customer characters, and food items. These can be flat-art SVGs, pixel art, or any illustrated style — but they cannot be procedurally drawn shapes.

---

### V2 — Customer characters have no distinct silhouettes
**Severity: BLOCKER**
All 7 customer "types" share the same 48×72 body structure. They differ only in body fill color, head color, and minor accessories (earrings, collar, stripes). In a screenshot, they read as "same character, different color." Commercial restaurant games have distinct body types — different heights, weights, postures, clothing styles — that create personality and variety at a glance.

**Gap:** Minimum 3 distinct body silhouettes (compact/average/tall), each with 2-3 costume families = 6-9 recognizable character types.

---

### V3 — Food items are Unicode emoji
**Severity: BLOCKER**
Every food item displayed on screen — on the order ticket, floating above the player, on the counter, in the kitchen — is a Unicode emoji character (🍔🍜🍕🍰). This is the single clearest visual signal that a game is a browser prototype or game jam project. No commercial mobile restaurant game uses system emoji as its food art.

**Gap:** Custom-illustrated food icons for all 6 menu items. Can be 32×32 or 48×48 flat-art. The bar is "not a system emoji," not "photorealistic."

---

### V4 — Restaurant background has no atmospheric depth
**Severity: HIGH**
The floor is a uniform tile grid. The walls are plain rectangles. There are no decorative props, no art on the walls, no bar area, no chalk specials board, no evidence that this restaurant has a history or personality. The pendant lamps and glow pools are steps forward but they float in a generic space.

**Gap:** Wall decorations (framed art, mounted menu board, pendant decor), at least one readable specials board near the entrance, visible back-of-house suggestion through the counter gap.

---

### V5 — Player character is a navy rectangle with a skin-circle head
**Severity: BLOCKER**
The player character at 2.0 scale on a 40×62 base texture reads as a diagram element at screenshot resolution. There is no visible posture, no costume silhouette, no visual difference between "player walking empty-handed" and "player carrying a full tray." The player is the avatar the user inhabits for 3 minutes — it must have character.

**Gap:** Illustrated waiter character with distinct silhouette, visible costume detail (apron, bow tie, tray), and visual state change when carrying food.

---

### V6 — Main menu has no restaurant imagery
**Severity: HIGH**
A player who sees the TableRush main menu screenshot cannot identify the game genre. There is a dark card panel, a title, a high score number, and three buttons. No restaurant. No food. No character. The genre must be legible from the first frame.

**Gap:** Main menu background showing a restaurant scene (even a simplified illustrated version), or the waiter character prominently displayed, or food iconography that immediately signals "restaurant game."

---

## CATEGORY 2 — GAME FEEL

### GF1 — Near-miss save has zero emotional theater
**Severity: BLOCKER (for retention)**
The highest emotional peak in the game — documented in RESTAURANT_FANTASY.md and ranked #3 on the Top 5 retention features list — is completely silent. When a player delivers food to a customer at 2% patience, nothing special happens. The delivery completes. A score number appears. Life continues. This single moment, executed correctly, is worth a week of player retention. It is not being executed.

**Gap:** When patience < 8% at delivery time: patience bar flashes red, delivery triggers a distinct "CLOSE CALL! ⚡" float (larger, different color from normal score), customer face animates from angry to relieved, camera micro-shakes, combo is announced as SAVED.

---

### GF2 — Combo visual state does not transform the restaurant environment
**Severity: HIGH**
×3.0 TABLE MASTER and ×1.0 look nearly identical in the game environment. The combo counter changes color and shows a different label. That is the entire difference. A player in the highest combo state and a player in the lowest combo state are experiencing the same visual environment. The combo — the game's core retention hook — should feel qualitatively different, not just quantitatively different.

**Gap:** At ×3.0+, the restaurant responds to the player's excellence. Table glow pools warm. Score floats gain a golden trail. At ×5.0, a warm amber wash tints the floor. When combo breaks, the environment dims back to baseline over 400ms.

---

### GF3 — Order auto-assignment removes player agency at the richest interaction moment
**Severity: HIGH**
The moment a player taps a requesting customer is the most natural moment for meaningful choice in the game. Currently, a menu item is assigned automatically and silently. The player has made no decision. The fantasy of "the best waiter in the room" includes knowing what to recommend, reading the customer. Currently the player presses a button and an algorithm does the thinking.

**Gap:** Either: (a) a 0.3-second reveal animation shows what the customer is ordering before the kitchen queue starts — transforming auto-assign from invisible to acknowledged, or (b) at higher difficulty tiers, the player chooses from 2 options. Option (a) is minimum viable.

---

### GF4 — Rush hour is a spawn rate change, not a dramatic event
**Severity: HIGH**
Rush hour at 60s and 150s is correctly structured. The amber timer pill and "🌶️ Final minute!" toast are correct signals. But there is no advance warning, no preparation window, no sense of a wave arriving. The rush feels like a statistical change detected in hindsight, not a moment experienced in real time.

**Gap:** 10 seconds before rush: full-width warning banner ("⚡ RUSH HOUR IN 10s — BRACE YOURSELF"), possible music tempo shift, then a simultaneous burst of customers entering rather than a gradual spawn-rate increase.

---

### GF5 — Cleaning mechanic is chore, not choreography
**Severity: MEDIUM**
The 1.5-second mandatory cleaning tap per dirty table is dead time. The non-blocking dirty dish workflow is a correct fix (badge independent of food tray). But the experience of cleaning still feels like maintenance rather than mastery. The best waiter in the room shouldn't feel like they're mopping.

**Gap:** Either reduce cleaning time further, add a speed bonus for fast cleaning sequences, or add visual flair (sparkle burst, satisfying wipe animation) that makes cleaning feel like part of the performance rather than a penalty.

---

## CATEGORY 3 — RETENTION

### R1 — No daily goal
**Severity: BLOCKER (for retention)**
The daily goal is the single most proven mobile retention mechanic in the industry. It converts "should I play?" into "I need to play — I have a goal." TableRush has no daily goal. A player who enjoyed yesterday's session has no specific reason to open the app today beyond "I could play again." That ambiguity is where players are lost.

**Gap:** One daily goal visible on the main menu before the session starts (not on the end screen — the goal must motivate STARTING). "Today: maintain ×2.0 combo for 60 seconds. Reward: 2× XP." Resets at midnight via localStorage timestamp.

---

### R2 — Progression levels unlock nothing tangible
**Severity: BLOCKER (for retention)**
10 levels exist. XP accumulates. A progress bar fills. Leveling up produces an announcement. Nothing changes. The restaurant looks identical at Level 1 and Level 10. The player can see, on the end screen, that they are progressing toward a level threshold — but they cannot see, anywhere, what that level threshold delivers. A progress bar that leads nowhere is a progress bar that leads nowhere.

**Gap:** Each level must unlock something visible and real. Level 2: one dish cooks 10% faster. Level 3: new tablecloth color. Level 4: alternate waiter outfit option. These do not need to be elaborate — they need to exist.

---

### R3 — "Last session score" not shown on main menu
**Severity: HIGH**
The all-time high score is shown. But the daily personal anchor — "beat what you did yesterday" — is absent. The all-time high score may feel out of reach for new players. Yesterday's score always feels achievable. "LAST SESSION: 2,840 — beat it?" is the hook that brings a player back on Day 2 without any push notification.

**Gap:** One additional localStorage key (`tablerush_last_score`) storing the most recent session score. One text element on the main menu showing it with a call to beat it.

---

### R4 — End screen shows statistics, not stories
**Severity: HIGH**
"Score: 2,840 | Best combo: ×2.5 | Customers served: 18" is a statistics page. Players do not remember statistics. Players remember stories. "You saved a customer at 2% patience and held ×2.5 for 47 seconds" is a story. The end screen is the last thing the player sees before deciding whether to replay. It should leave them with something to talk about.

**Gap:** Track 5-6 per-session stats (fastest delivery time, near-miss save count, combo record duration, customers served). End screen shows 3-4 highlighted moments with narrative framing. "Fastest delivery: 6s ⚡" "Near-miss saves: 2" "Best combo streak: 47 seconds."

---

### R5 — Boredom plateau at minute 7 — nothing new to discover
**Severity: HIGH (structural)**
The core loop is fully understood within 3 rounds. After that, the player is executing a memorized sequence faster. Execution without discovery is not a game — it is a job. The boredom curve documented in ADDICTION_AND_RETENTION_PLAN.md hits at exactly the point where the retention system should be kicking in. It is not kicking in.

**Gap:** The Top 5 retention features from the plan (daily goal, last session score, near-miss theater, shift report narrative, combo always visible) address this systematically. The combo has been made always visible. The other four are not yet implemented.

---

## CATEGORY 4 — UX

### UX1 — Kitchen READY state is hard to spot
**Severity: MEDIUM**
The green glow on the READY zone and the ready plate sprite are present. In the warm amber restaurant environment, green is a weak signal. In a moment of high load (multiple tables requesting, patience bars declining), the kitchen READY state can be missed. Missing the variable reward signal (food being ready) is the most damaging flow interruption in the loop.

**Gap:** A distinct "ORDER UP! 🔔" animated text/icon that pulses prominently at the ready zone. Brief audio chime separate from the ambient music that cuts through clearly. The signal must be unmissable when under maximum load.

---

### UX2 — Anger arc is incomplete at the face level
**Severity: MEDIUM**
The patience bar changes color (green→yellow→orange→red). The priority arrow changes color. But the customer's face stays the same throughout the decline. The face is the emotional signal — it is what makes the urgency feel like a person, not a health bar. A customer who is at 5% patience should look visibly different from a customer at 95% patience.

**Gap:** Three-stage customer face changes at patience milestones. At 75%: neutral (current). At 50%: brow furrow, mouth turns down. At 25%: visible anger. At 0%: storm-off animation.

---

### UX3 — Tutorial teaches tapping, not judgment
**Severity: MEDIUM**
The tutorial successfully teaches the 6-step mechanical sequence (tap table → tap kitchen → tap table → tap table → tap table → tap dishwasher). It does not teach the skill that separates good players from great players: which table to serve first when multiple tables are requesting simultaneously. Route optimization is the core competence of the game. The tutorial leaves players to discover it on their own — usually through failure.

**Gap:** A final tutorial step introduces two simultaneous requesting tables. One customer has more patience remaining. A brief hint ("Serve the most urgent customer first — watch the patience bars") teaches the core decision-making framework before live play begins.

---

### UX4 — Multiple simultaneous float labels collapse into noise
**Severity: LOW**
During a high-score delivery moment, the player may see: a score float, a speed multiplier float, a combo milestone announcement, a "⚡ FAST!" label, and a payment float — all within 1-2 seconds. When too much information appears simultaneously, effective information becomes zero. The signal is buried.

**Gap:** Float label priority queue — at most 2 float labels visible simultaneously. Lower-priority floats (score numbers) are suppressed when a milestone announcement (combo level, record) is playing.

---

## CATEGORY 5 — POLISH

### P1 — Music sounds synthesized, not warm
**Severity: LOW**
The jazz loop at 108BPM with Cmaj7→Am7→Fmaj7→G7 is the correct musical direction. Web Audio API synthesis is technically capable. But synthesized audio has a clinical quality that warm restaurant game audio does not. Commercial mobile games use recorded or carefully sampled audio for their ambient music.

**Gap:** Either accept this as a known limitation of the Web Audio approach, or source a short royalty-free jazz loop that matches the intended feel. This is the lowest-priority item on this list.

---

### P2 — Settings scene is sparse
**Severity: LOW**
The Settings scene is functional (SFX toggle works, settings persist). But it communicates nothing about the game's personality. It reads as a developer options page.

**Gap:** Add restaurant-themed framing to the settings screen (same visual language as the rest of the game — tile floor, mahogany elements). This is polish, not a blocker.

---

## SUMMARY TABLE

| ID | Category | Issue | Severity |
|----|----------|-------|----------|
| V1 | Visual | Procedural canvas art throughout | BLOCKER |
| V2 | Visual | Customer characters — same silhouette, different color | BLOCKER |
| V3 | Visual | Food items are Unicode emoji | BLOCKER |
| V4 | Visual | Background lacks atmospheric depth | HIGH |
| V5 | Visual | Player character is a geometric shape | BLOCKER |
| V6 | Visual | Main menu has no restaurant imagery | HIGH |
| GF1 | Game Feel | Near-miss save has zero theater | BLOCKER |
| GF2 | Game Feel | Combo state doesn't transform environment | HIGH |
| GF3 | Game Feel | Order auto-assign removes player agency | HIGH |
| GF4 | Game Feel | Rush hour is a spawn rate change, not an event | HIGH |
| GF5 | Game Feel | Cleaning is chore, not choreography | MEDIUM |
| R1 | Retention | No daily goal | BLOCKER |
| R2 | Retention | Level unlocks nothing tangible | BLOCKER |
| R3 | Retention | No last session score on main menu | HIGH |
| R4 | Retention | End screen shows statistics, not stories | HIGH |
| R5 | Retention | Boredom plateau at minute 7 | HIGH (structural) |
| UX1 | UX | Kitchen READY state hard to spot | MEDIUM |
| UX2 | UX | Anger arc missing at face level | MEDIUM |
| UX3 | UX | Tutorial teaches taps, not judgment | MEDIUM |
| UX4 | UX | Float label noise under high load | LOW |
| P1 | Polish | Synthesized music sounds clinical | LOW |
| P2 | Polish | Settings scene lacks game personality | LOW |

---

## BLOCKER COUNT

**Release Blockers (cannot ship):** 7 (V1, V2, V3, V5, GF1, R1, R2)
**High Priority (should resolve pre-launch):** 8
**Medium (resolve if time allows):** 4
**Low (post-launch acceptable):** 3

---

## THE HONEST BOTTOM LINE

TableRush has a real game inside it. The core loop is satisfying. The fantasy is correctly identified. The sound, haptics, and UX work are above average for this development stage. The design documents are world-class.

The game cannot ship in its current form because the art marks it as a prototype before a single word is read. The characters are shapes. The food is emoji. The background has no soul.

The gap between "current state" and "worth downloading" is:
1. **Real art** for characters and food (art production, not engineering — weeks)
2. **Near-miss theater** (3 days of engineering)
3. **Daily goal + last session score** (2 days of engineering)
4. **Level unlockables** (1 day of engineering per unlock)

None of these require redesigning the game. The mechanics are there. The heart is there. It needs packaging worthy of its content.

---

*Written as product audit — no code changes, no implementation. Read in conjunction with RESTAURANT_FANTASY.md, GAME_IDENTITY.md, ADDICTION_AND_RETENTION_PLAN.md.*
