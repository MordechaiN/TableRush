# CHANGELOG

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
