# CHANGELOG

## v0.9.0 — P2 Retention HUD (2026-06-02)

### Combo Visibility — Always Present
- Combo text initializes as `×1.0` (gray, 14px) instead of empty string — visible from game start
- Progress bar (4px, bottom edge of HUD) shows fill toward next multiplier milestone
- `↑1` / `↑2` anticipation states before first milestone (gold, 15px)

### 5-Stage Combo Escalation
- Milestones extended: ×1.0 → ×2.0 → ×3.0 → ×4.0 → ×5.0 (was ×3.0 max)
- Thresholds: 0 / 3 / 6 / 10 / 15 consecutive serves
- Display: gray → 🔥 orange → 🔥🔥 deep orange → ⭐ pink → 💫 gold
- Font size escalates: 14px → 15px → 17px → 19px → 20px → 22px

### Combo Loss — Dramatic Feedback
- Floating text: `💔 ×2.0 LOST!` shows exact multiplier lost
- Progress bar flashes red, fades out (500ms), redraws empty
- Camera shake (100ms, 0.003)
- Both effects only trigger for meaningful streaks (count ≥ 3)

### Performance Feedback — New Events
- `⭐ PERFECT!` float when patienceAtDelivery ≥ 75% at payment collection
- Milestone announcements: stroke outline + screen flash at ×3.0+, star burst at ×4.0+
- Celebrations at count 10 (`⭐ TABLE LEGEND!`) and count 15 (`💫 TABLE MASTER!`)

### Shift Report Redesign
- Combo stat always shown — removed `if (comboRecord >= 3)` guard
- Shows `○ No streak built` / `↑ 2 serves` / `🔥 8 serves → ×3.0`
- Total guests served: `14 guests served — 12 happy · 2 left`
- Narrative headlines cover ×4.0 (10-serve) and ×5.0 (15-serve) tiers

## v0.8.1 — P0.5 Hotfix Phase (2026-06-02)
### Task 1 — Urgent State
- Arrow drawn 20% wider (±18 vs ±15) when urgent, taller tip (14 vs 12px)
- Scale tween: duration 140ms (was 280ms), range 0.92→1.25 (was 0.88→1.14)
- Alpha strobe added: 0.98→0.48 at 180ms yoyo, repeat -1 — visceral panic signal
- `urgentAlphaTween` field + cleanup in `clearPulse()`

### Task 2 — Dirty Table
- Arrow color: 0x888888 (gray) → 0xC4823A (warm brown-amber)
- Broom icon: 16px → 20px

### Task 3 — High Density Readability
- Secondary arrow base scale: 0.5 → 0.35 (~2.9:1 ratio vs old 2:1)
- Measured: primary 0.91 vs secondary 0.34 at 5 active tables

### Task 4 — Customer Silhouettes
- **Elegant**: Gold drop earrings (r=4.5, below ears on both sides), cream collar wings (was outfit-color), necklace arc thicker (3.5px, was 2px), pendant r=5.5 (was r=3)
- **Casual**: Two horizontal white stripe bands on body (0.28 alpha) — casual t-shirt silhouette

### Task 5 — Mobile Validation
- Fix: use `window.game.scene.start('GameScene')` directly instead of button-click
- Confirmed: 390×844 renders gameplay correctly. Timer, score, arrows, names all readable.
- Mobile urgent arrow validated: alpha strobe confirmed running at 390×844.

### Task 6 — HUD Evaluation (documented only)
- Confirmed: score + timer always visible
- Confirmed: combo text is EMPTY STRING at ×1.0 — invisible to player for first 2+ customers
- Not fixed: deferred to P3 (HUD redesign)

## v0.8.0 — Quality Gate Review (2026-06-02)
### P0_P1_REVIEW.md — Post-implementation quality gate
- Validated all 5 table states: REQUESTING/KITCHEN_READY/PAYING pass, URGENT/DIRTY marginal
- Validated priority hierarchy 1–5 tables: works clearly at 1–3; crowded at 4–5
- Validated 7 customer variants: 5/7 pass at-a-glance, Elegant and Casual need silhouette work
- Identified mobile validation failure (Playwright captured Credits screen, not gameplay)
- Self-critique: 10 remaining visual problems cataloged with Critical/High/Medium/Low ranking
- Roadmap confirmed: P2=Waiter + combo-grayed supplement, P3=full HUD
- Game identity evaluation: Foundation laid, identity not yet delivered

## v0.8.0 — VISUAL REBOOT P0 + P1 (2026-06-02)
### P0 — Action Indicator Redesign
- **Action arrow (Table.ts)**: Replaced invisible 4px `strokeRoundedRect` pulse ring with a solid filled ▼ arrow (30×22px) at scene depth 15. Arrow drawn as filled triangle with 2.5px black outline + highlight. Colors: blue=requesting, orange=kitchen_ready, gold=paying, red=urgent, gray=dirty. Pulses by scale (0.88–1.14×), never tweens alpha below 0.95.
- **Architecture fix**: Arrow is a scene-level Graphics object (NOT inside Table container). Tables render below customers in z-order; scene-level depth 15 ensures arrow is always above all gameplay entities.
- **Primary/secondary system**: `setUrgencyLevel()` now sets `arrowBaseScale` (1.0 primary vs 0.5 secondary) instead of alpha multiplier. Both values produce a visible indicator.
- **Kitchen glow redesign (GameScene.ts)**: Replaced 4px `strokeRoundedRect` with solid `fillRoundedRect` over the READY zone (right half of counter). Green (#27AE60). Alpha tweens 0.45–0.82 (primary) or 0.18–0.38 (secondary) — never invisible.
- **BEFORE_AFTER_REPORT.md**: Full validation report with screenshots and measured improvements.

### P1 — Customer Redesign
- **Sprite size**: 48×72px (was 32×52px) — 50% larger each axis, 2.25× more area
- **Head**: radius r=14 (was r=10), center at pixel (24, 14) in texture
- **Face coordinates (Customer.ts)**: HEAD_CY=−22, EYE_Y=−24, MOUTH_Y=−19 (all updated for new sprite)
- **Eyes**: r=3 circles with white base, dark pupil, bright highlight dot (was r=1.5 dark-only dots)
- **Outlines**: 2.5px near-black on head and body (was 1.5px)
- **Patience bar**: 44×8px at y=−50 (was 36×5px at y=−42) — 78% wider, 60% taller
- **Eat bar**: 44×5px at y=38 (was 36×4px at y=30)
- **Bubble container**: y=−88 (was y=−66) — adjusted for larger sprite; tail tip at local y=34
- **Name banner**: `showNameBanner()` on Customer, called from trySpawnCustomer after seatBounce. Variant name slides up and fades after 1.6s.
- **Variant silhouettes redesigned** for 48×72 canvas with bolder proportions:
  - Business: large bold tie triangle, wide shoulders
  - Elegant: visible collar wings + large gold pendant
  - Teen: wide cap brim clearly past head edges
  - Elder: thick glasses with visible temples
  - Trendy: oversized sunglasses past head edges
  - Romantic: large 3-circle flower cluster at right
  - Casual: round clean face (default reference)
- **Skin tone**: #FFCB9A (cleaner, lighter cartoon skin)
- **Ear radius**: 4.5px (was 3px)

---

## GAME IDENTITY — 2026-06-02
### Design Document Created (no implementation — awaiting approval)
- **GAME_IDENTITY.md**: Full identity discovery document
  - Section 1: Competitive positioning — why TableRush vs Diner Dash / Overcooked / PlateUp / Cook Serve Delicious (each serves a different player need; TableRush does not compete directly)
  - Section 2: Unique fantasy — "Grace under pressure: the most capable person in the room, making it look effortless." Player is a performer, not a survivor or manager
  - Section 3: Elevator pitch (13 words): "TableRush: Be the best waiter in the room. Three minutes. Every customer watching."
  - Section 4: Steam descriptions — tagline (~30 words), medium (~120 words), long (~300 words)
  - Section 5: 20 memorable moments — 1-second save, first TABLE MASTER, impossible save, personal best from nowhere, combo break at ×2.5, full-house management
  - Section 6: Emotional arc per session — Calm readiness → Engaged concentration/Flow → High-stakes presence → Earned rest
  - Section 7: 20 realistic player reactions (what real players say out loud)
  - Section 8: 10 visual signatures — top-down floor with five tables and one moving character, colored ▼ above table, patience pill, warm cream floor, waiter mid-movement, food emoji bubble, kitchen in upper third, combo counter, floating score pop
  - Section 9: 30-second trailer described frame-by-frame (cold open, first customer, loop, pressure, close call, flow state, close)
  - Section 10: Final identity — "TableRush is a three-minute performance. The specific, repeatable pleasure of being exceptionally good at something under pressure, in public, in real time."

---

## ADDICTION & RETENTION PLAN — 2026-06-02
### Design Document Created (no implementation — awaiting approval)
- **ADDICTION_AND_RETENTION_PLAN.md**: Retention and engagement design
  - Section 1: Core loop analysis — boredom begins at ~minute 7 when learning ends and execution routine begins
  - Section 2: Psychology of restaurant game addiction — urgency/empathy loops, flow state architecture, variable reward intervals, visible improvement, satisfaction peak moments
  - Section 3: 10 original hooks — Reputation Arc, Rush Hour Events, The Inspector, Customer Memory, Kitchen Mastery, Shift Reports, VIP Cascade, Daily Special, Combo Crescendo Escalation, Personal Challenge Mode
  - Section 4: Retention systems ranked — daily goals, achievements (progress + discovery), unlockables, cosmetics, challenges
  - Section 5: First 30 minutes — minute-by-minute emotional arc (Discovery → Mastery → Stakes → Optimization)
  - Section 6: First 7 days — Day 1 hook through Day 7 milestone
  - Section 7: Future monetization (cosmetics only, never pay-to-win)
  - Section 8: North Star — "I am the most capable person in this room — and the room knows it."
  - Top 5 post-visual-reboot features: combo visibility, daily goal, last-second save theater, yesterday's score on menu, shift report end screen

---

## VISUAL REBOOT PLAN — 2026-06-02
### Design Document Created (no implementation — awaiting approval)
- **VISUAL_REBOOT_PLAN.md**: Full visual identity audit and rebuild plan
  - Section 1: Complete inventory of all 14 visual systems (menu, HUD, kitchen, tables, customers, waiter, food, bubbles, game over, settings, credits, environment)
  - Section 2: Problem analysis — why each element feels cheap, how it hurts retention
  - Section 3: Three art directions (A: Modern Mobile, B: Cozy Restaurant, C: Stylized Cartoon)
  - Section 4: Direction C (Stylized Cartoon) chosen — bold outlines, scale-based state indicators, readable at small sizes, Overcooked precedent
  - Section 5: 10-item implementation roadmap ordered by player impact. P0 fixes Phase 1 validation failure (invisible pulse rings → colored ▼ arrow above tables, always ≥70% alpha, pulses by scale not alpha)

---

## v0.7.0 — IMPLEMENTATION PHASE 1 (2026-06-02)
### Gameplay Clarity — Single Dominant Action Priority System
- **`updateActionPriority()` in GameScene**: runs every 150ms, evaluates all pending tasks, determines one primary action. Hierarchy: urgent (patience < 25%) > paying > carrying food to table > kitchen ready pickup > requesting > dirty table
- **`setUrgencyLevel(isPrimary)` on Table**: primary table gets full-alpha pulse (1.0×); all secondary tables dim to 35% alpha. Makes the correct next action visually obvious at a glance
- **`setPriority('urgent')` auto-upgrade**: when any customer's patience drops below 25%, their table pulse upgrades to fast red 'urgent' via `updateActionPriority()` — no longer requires manual triggering
- **`setKitchenGlowPrimary(isPrimary)` in GameScene**: kitchen glow uses 0.1–0.7 alpha range when primary, dims to 0.04–0.25 range when secondary. `updateKitchenGlow()` simplified to only handle glow teardown
- **`takeOrder()` UX fix**: removed premature `customer.hideBubble()` — the ❓ bubble now stays visible while the player walks over, matching the visual expectation. Bubble transitions to food emoji on arrival
- **`showOrderFlash()` on Customer**: warm tint + alpha flash on order assignment, acknowledges the interaction moment clearly

---

## v0.7.0 — DESIGN PHASE (2026-06-02)
### Design Documents Created (no implementation — awaiting approval)
- **RESTAURANT_FANTASY.md**: Core fantasy defined — "You are the best waiter in the room." Emotional highs (flow state, last-second save, lightning tip, combo crescendo), emotional lows (impossible choice, chain break), desired per-moment player emotions, visual cues that support vs hurt the fantasy, and the specific gap between "systems and timers" and a "living restaurant"
- **GAMEPLAY_REDESIGN.md**: Single dominant action priority system; order reveal animation; 3-stage anger arc with departure warning; guided first-service tutorial
- **VISUAL_REDESIGN.md**: Ambient motion layer (lamp sway, candle flicker, customer idle); character personality names+modifiers; food presentation (steam, garnish); visual escalation per difficulty tier
- **BALANCE_REDESIGN.md**: Patience values redesigned (Tier 1: 110–140s to eliminate early-game failure for learners); spawn caps by tier (2/3/4 max customers); new score formula (price×15); deterministic tip system; new star thresholds (800/1600/3000)
- **PROGRESSION_REDESIGN.md**: Table unlocks per level (3 at start, unlock more); XP visible during play; star-based upgrade shop (EconomySystem activation); daily challenges; personal records screen
- **RETENTION_REDESIGN.md**: Near-miss gap on GameOver; "last session" goal on main menu; progression promise (next unlock); achievement system; streak + comeback bonus; share score button

---

## v0.6.0 — 2026-06-02
### Art Direction
- **ART_DIRECTION.md**: Full visual identity doc — Bella Notte Trattoria theme, complete palette (Primary/Environment/Characters/UI), character design rules, state visual language, face placement coordinates
- **VISUAL_STYLE_GUIDE.md**: Component-level specs — typography, spacing, character proportions, patience bar, bubble, kitchen, UI components, animation timing
- **LAYOUT_GUIDE.md**: Fixed anchor points — zone map, table positions, kitchen zones, player start, z-order layers, bubble placement, carry tray placement

### Visual Fixes (Breaking Bugs)
- **Customer face coordinates**: `eyeY` corrected from `-4` (on body!) to `-18` (above head center at y=−16). Faces now appear on the character's head
- **Angry overlay**: repositioned from body-center to head bounds (y=−26 to y=−6)
- **Eyebrow positions**: corrected from mid-body to above-eye area (eyeY−5 for angry, eyeY−4 for hungry)
- **Mouth positions**: all mouth arcs now use `mouthY = −13` (3px below head center) instead of computed offsets from wrong `eyeY`

### UI Layout Improvements
- **Patience bar**: moved from y=+30 (below feet) to y=−42 (above character head); resized from 60×8px to 36×5px pill shape; darker track (0.18 alpha); cleaner color transitions
- **Eating bar**: moved from y=+40 to y=+30 (just below sprite feet); resized to 36×4px
- **Speech bubble**: moved from y=−52 to y=−66 to clear patience bar; shorter tail (tip at y=−46 in container, 4px gap above bar); shadow (+2,+2 offset); warmer fill (0xFFF8F0); thinner border (1.5px)

### Character Art
- **Player texture**: dark head outline (1.5px #3C2010), dark body outline, ears at (8,14) and (32,14), corrected skin tone (#FDBA8C), apron pocket detail; walk frame same improvements
- **Customer textures** (all 7 variants): corrected skin (#FDBA8C), ear circles, head outline (1.5px), body outline (1.5px), ART_DIRECTION proportions
  - Elegant: necklace arc+pendant, tall collar wings flanking neck
  - Business: wider shoulders (+2px), red tie with knot
  - Casual: standard clean silhouette
  - Trendy: sunglasses extend 2px beyond head edges on each side
  - Romantic: large flower on hair extending past right head edge
  - Elder: white/gray hair, short legs (legH=8 vs 12), glasses with temples extending beyond head
  - Teen: cap with brim extending 4px beyond head on each side (x=4 to x=28 on 32px texture)

### Environment Art
- **Table**: 8×8 checkered linen pattern on tablecloth (alternating #EEE8DF squares at 0.5 alpha over white cloth)
- **Kitchen**: pot silhouette on left-front burner (rim, body, knob, two handles); pan silhouette on right-back burner (body, rim, long handle); steam hint above pot
- **Menu board**: new `menu_board` texture (200×58) — dark chalkboard green (#1B3A1B) in wooden frame (#5C3D1E), chalk border, heading line, decorative dots. Placed above kitchen counter on back wall (depth 2) with "TODAY'S MENU" header + food emoji row

### Food Display
- **New `food_plate` texture**: 26×26 white plate circle (r=13) with inner rim, subtle shadow, used as background for carried food
- **Carry display**: plate image added between tray and food emoji — food now sits on a proper plate (not floating text)

## v0.5.0 — 2026-06-02
### Added
- **2-frame walk animation**: waiter alternates `player`/`player_walk` textures every 160ms while walking — first real character movement
- **Steam particles**: animated steam rises from kitchen counter whenever orders are cooking (700ms interval, up to 3 wisps per tick)
- **Pendant lamps**: 3 hanging lamps drawn above dining area with cord, shade, bulb glow, and warm floor light-pool
- **Wall art**: picture frames on both sides of the back wall
- **Grout lines**: subtle tile grid lines on floor for restaurant texture
- **Kitchen zone labels**: "COOKING" (orange) and "✓ READY" (green) text overlays on counter
- **Candles**: tea candle at each table corner for warmth
- **Door mat**: subtle mat at entrance
- **Wainscoting detail**: wall border lines
- **Extra plants**: two small 🌿 plants flanking the kitchen area
- **CarrySystem.ts**: full architecture stub — slots, capacity, upgrade path, pick-up/drop API (capacity=1 for v0.5.0, expandable)
- **New textures**: `player_walk` (stride legs), `candle` (12×22), `wall_frame` (60×50 with simple painting)
- **Table texture improvement**: cloth border line + circular place-setting marks
- **Player texture improvement**: white apron over navy jacket
- **Kitchen texture improvement**: dark granite surface, cooking zone (warm tint), ready zone (cool tint), burner rings

### Changed
- `ticketRail` and kitchen elements assigned depth 3–4 to layer correctly above floor
- Pendant lamps at depth 2, table candles at depth 3
- `endGame()` removes steam timer

## v0.4.0 — 2026-06-02
### Added
- **Waiter personality system**: Player has emotional states — normal, happy, proud, stressed, excited
- **Busy feedback**: clicking while waiter is busy → red tint flash, sprite shake, "BUSY!" floating label (400ms duration)
- **Emotion faces**: waiter face redrawn per emotion (neutral/smile/squint/sparkle-eyes/frown+worried-brows)
- **Emotion badges**: emoji floats above waiter head on key states (😊 happy, 🤩 excited, 😰 stressed, 😤 proud)
- **Combo cascade reactions**: waiter reacts at x3 (excited), x5 (excited + scale pulse + star burst), x10+ (excited + pulse + full celebration)
- **TABLE MASTER celebration**: camera flash + "🌟 TABLE MASTER!" text + 14 star particles at combo 10+
- **Angry customer reaction**: waiter shows stressed face + slump animation for 2s after customer storms out
- **30s warning**: floating ⏰ text + camera shake when 30s remain
- **Last 10s pulse**: timer text scales up each second in final countdown
- **EconomySystem.ts**: full architecture stub — coins, shop catalog (8 items), upgrades/cosmetics/boosts, localStorage persistence, ready for future activation

### Changed
- Player container depth set to 10 (always renders above tables/customers)
- `clearCarry()` now uses explicit object references (no fragile children-array indexing)
- Proud emotion priority > happy (payment success feels more significant than delivery)
- Busy click ignores carry-only state (silently) — only warns on `playerBusy`

## v0.3.0 — 2026-06-02
### Added
- Cooking progress bars on kitchen tickets (green → orange as ready, clears on complete)
- Eating progress bar on customer sprite (fills over eat duration)
- Cleaning progress bar on table (animated fill during CLEAN_TIME)
- `exportSave()` / `importSave(json)` on ProgressionSystem for save portability
- Scale-punch animation on all floating score/status labels

### Changed
- Delivery now requires waiter to physically walk to table (`deliverFood` uses `walkTo`)
- Guard added: if customer goes angry during delivery walk, carry is cleared cleanly
- `cleanTable()` uses `table.startCleaningProgress()` instead of invisible `delayedCall`
- Pause button hidden on touch devices (ESC-only on desktop)
- `customer.seatBounce()` plays when customer first sits down
- `customer.startEating()` / `stopEating()` properly wired — eating bar visible during eat phase

## v0.2.0 — 2026-06-02
### Added
- Full visual redesign: warm palette (cream floor, mahogany tables, navy waiter)
- Layered procedural art: shadows, highlights, accessories on all characters
- 7 distinct customer variants with personality accessories (glasses, cap, flower, etc.)
- New customer lifecycle: `entering → requesting → ordering → waiting_food → eating → paying → leaving`
- Auto-order flow: player taps requesting customer, order assigned automatically (no popup)
- Kitchen queue system with ticket rail UI (tickets appear/disappear with animations)
- Priority pulse system: blue (requesting), orange (kitchen ready), gold (paying), red (urgent)
- Tutorial overlay for first session only (6 steps, tracked in localStorage)
- XP/Level/Stars progression system (ProgressionSystem.ts): 10 levels persisted
- Speed multiplier scoring: ×0.75–×2.0 based on patience at delivery
- Named combo milestones: GOOD SERVICE (×1.5 @ 3), HOT STREAK (×2.0 @ 5), UNSTOPPABLE (×2.5 @ 8), TABLE MASTER (×3.0 @ 10+)
- Star rating end-of-round: ⭐ (played), ⭐⭐ (70%+ happy), ⭐⭐⭐ (90%+ happy AND score ≥2000)
- End-of-round screen: stars animation, XP earned, XP bar tween, level-up flash, combo record, stats, next unlock hint
- SVG favicon (no more 404 on load)
- `window.game` exposed for testing/automation
- 15 validation screenshots

### Changed
- Patience: 45–120s (from broken 10–25s)
- Spawn interval: 8s start → 3.5s end (from 6s → 2.5s)
- Combo: reaches ×1.5 at 3 customers (from 10 customers for ×2)
- Angry customers leave table CLEAN — not dirty (correct behavior)
- Score penalty for angry leave: −50 to −150 (was 0)
- Body background: warm cream #F5E6C8 (was dark navy)
- All backgrounds, floors, and UI elements warm and inviting

## v0.1.1 — 2026-06-01
### Fixed
- GitHub Pages black screen: switched from gh-pages branch to actions/deploy-pages
- `vite.config.ts`: `VITE_BASE_PATH` env var; CI sets `/TableRush/` for absolute asset paths
- Verified fix: Playwright test at `/TableRush/` subpath — canvas renders correctly

## v0.1.0 — 2026-06-01
### Added
- Full MVP gameplay loop: customer spawn → order → cook → deliver → eat → pay → clean
- 5 tables with state machine (empty / occupied / dirty)
- 7 customer color variants with patience bar (green→yellow→red)
- 5 menu items: Burger, Pizza, Salad, Pasta, Sushi (different prices + cook times)
- Combo multiplier system (increments 0.1 per success, max 5x, resets on angry leave)
- 3-minute timed sessions with countdown HUD
- Difficulty ramp: spawn interval and patience both decrease each spawn
- High score persistence via localStorage
- Procedural texture generation (no external assets)
- Scenes: Boot, MainMenu, Game, Pause (ESC), GameOver, Credits, Settings
- Settings: SFX/Music toggles (UI), reset high score
- GameOver: animated score counter, new-record confetti
- GitHub Actions CI: build validation on push + GitHub Pages deploy on main
