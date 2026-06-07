# TableRush — MEMORY

_A new Claude session must understand the entire project by reading this file._

---

## GOVERNANCE — READ THIS FIRST

### Branch Rule — PERMANENT
- **main is the ONLY branch.** No feature branches. No draft PRs. No pull requests.
- After every completed task: `git add -A && git commit && git push origin main`
- If the environment creates a branch automatically: merge to main immediately, delete the branch.
- Never discuss branch management. Just push to main.

### Project Phase — PERMANENT
- Design phase: COMPLETE.
- Visual Reboot: COMPLETE (P0, P1, P0.5, P2 done).
- We are now making the game **genuinely fun**.
- No more design documents. No more planning phases. No more research phases.
- Every decision answers one question: **Does this make TableRush more fun to play?**
- If not → do not do it.

---

## Project Vision
Fast-paced restaurant management game. Premium casual — think Overcooked/Good Pizza Great Pizza. Player serves customers through a complete lifecycle. Short 3-minute sessions. The core question for every mechanic: **"Will this make players want one more round?"**

## Design Philosophy
- Fun and retention over realism
- Player NEVER wonders what to do — highest-priority task always visually obvious
- First reward within 30s, first combo within 60s, want another round after 3 min
- Mobile-first (thumb-friendly UI)
- Simple but clean art — readability over polish

## Credits
- Game Concept & Product Owner: Mordechai Neeman
- Implementation: Claude Code

---

## Current State: v1.3.0 — Commercial Visual Polish

**Visual Overhaul Phase 4+6 (2026-06-07): Top 5 visual problems fixed completely. Table texture redesigned — ivory linen tablecloth (0xF5F0E8) replaces red/white checkerboard. Table overlay updated to match. Dining rug removed (it looked like a hitbox indicator). Kitchen zone labels now bold styled ("COOKING"/"READY", 16px, Arial Black, gold/green). Score display "$ 0" gold instead of emoji. Combo baseline "×1" warm gold instead of dead gray. SVG plant decorations: potted_plant.svg and herb_plant.svg replace 🪴/🌿 emoji at all 4 corners. Main menu plate badge replaced from 🍽️ emoji to plate_badge.svg.**

**Visual Art Overhaul (2026-06-05): Complete SVG art pipeline. All emoji food removed. 17 SVG assets: 5 food items (salad/burger/pasta/sushi/pizza), 7 customer characters (Elegant/Business/Casual/Trendy/Romantic/Elder/Teen), 2 waiter sprites (standing/walking). BootScene.preload() loads all SVGs. Food images replace emoji in: order bubbles, tray, kitchen tickets, cooking pots, ready plates, READY pop, delivery burst, table float, menu strip, main menu. CarrySlot.itemId added. Player.showTray() now accepts item IDs.**

**Final Product Sprint (2026-06-04): Full commercial polish pass. Float emojis (depth 19) above each table showing current state (ordered food bouncing, 😋 eating, 💳 paying, 🍽️ dirty). Cooking-on-burner visual (pot + food emoji bobbing on active burner). READY pop text below kitchen counter. Queue count display. Escalating camera effects at combo milestones. Player scale 2.0. Burgundy tablecloths. Menu ambient particles.**

**System Redesign Pass (2026-06-04): Implemented top 5 alpha blockers. Single-focus indicator (alpha=0 on secondary arrows), customer seated position (table.y-6), two-item tray carry (CarrySystem 2-slot), physical food on counter (ready plate sprites), non-blocking dirty dish workflow (badge independent of food tray).**

**Visual Environment Pass (2026-06-04): Removed all prototype text labels, replaced kitchen pill badges with subtle inline labels, replaced thin ledge with thick granite service counter, added pendant lamp fixtures above all 5 dining tables with warm floor glow pools.**

**RC1 Sprint (2026-06-03): Audio system, HUD redesign, main menu visual upgrade, animation pass, game over cinematic.**
**v1.0.0 public release: All scenes consistent visual language (tile floors, side walls, amber top bar, card panels). Zero console errors. Full playable loop tested.**
**v1.4 Alpha: table state visuals (menu/ticket/plate/bill), kitchen zones, host stand, queue zone, recipe strip, compact tutorial.**
**v1.2 Living restaurant — idle customer behaviors, rush hour waves, VIP customers, queue patience, player 1.25×, dishwasher steam.**
**v1.1: Entrance queue, dirty dish carry to dishwasher, 7-step tutorial.**
**v1.0 Restaurant Immersion: side walls, chairs, kitchen zone badges, entrance door, candle flicker, table numbers, gold coins, main menu.**

### System Redesign Pass Changes (2026-06-04)
- **Single-focus indicator**: `setUrgencyLevel(false)` → `actionArrow.setAlpha(0)`. Only the #1 priority arrow visible. Secondary arrows completely hidden until they become primary.
- **Customer seated position**: `table.y - 24` → `table.y - 6`. Front-face overlay covers lower body; only head + shoulders visible above table. Chair back now visible above customer head.
- **Two-item tray carry**: `CarrySystem(2)` integrated. `carryingOrderId` removed. One kitchen trip picks up up to 2 ready dishes. `player.carryItems(['🍔', '🍜'])` shows side-by-side. After delivering one item, remaining item stays on tray.
- **Physical food on counter**: `spawnReadyPlate()` called from `onOrderReady()` — spawns a plate container at the READY zone with food emoji + table number badge. Pop-in animation. Plate disappears when player picks it up.
- **Non-blocking dirty dishes**: `carryingDirty` gates removed from `onTableClick()`, `onKitchenClick()`, `updateSeatingArrows()`. Dirty dishes shown as `player.showDirtyDish()` badge (small 🍽️ at player lower-right) independent of food tray. Player can deliver food while carrying dirty dishes. Dishwasher click calls `player.hideDirtyDish()`.
- **CarrySystem integration**: `tray.pickUp(order)`, `tray.drop(orderId)`, `tray.isEmpty()`, `tray.hasOrder(id)`, `tray.canPickUp()`, `tray.getSlots()` — all used in GameScene. `updateActionPriority()` updated to use tray slots instead of carryingOrderId.
- **Angry customer cleanup**: `customerLeaveAngry()` now cancels the kitchen order, removes ready plate sprite if present, drops from tray, re-renders player tray.

### Visual Environment Pass Changes (2026-06-04)
- **Kitchen badges**: Removed big orange/green pill badges from COOKING/READY zones → replaced with small 9px/50%-alpha inline labels. Kitchen reads as a workspace, not a UI.
- **Service counter**: Replaced thin 6-10px ledge + "▲ PICK UP ▲" text with thick granite counter (dark countertop + mahogany face + panel dividers). Physical barrier between kitchen and dining room.
- **Pendant lamps**: 5 small amber hanging fixtures (cord + shade cap + shade cone + warm inner glow) above each dining table at `pos.y - 90`. Clear of back chairs (chair center at `pos.y - 54`).
- **Table glow pools**: Per-table warm amber glow (`0xFF9933, 0.065`) radius 60 at floor depth 0 — subtle candlelit ambiance beneath each table.
- **Text labels removed**: "DISHWASHER", "HOST", "WAIT HERE" text labels deleted entirely. Props (dishwasher machine, host stand, footprint icons) remain — player reads the space, not the signage.

### RC1 Sprint Changes
- **SoundManager.ts**: Web Audio API synthesis, 12 sound types: uiClick, seatCustomer, orderTaken, foodReady, deliverFood, paymentCollected, comboUp(tier 1-4), comboLost, customerAngry, dishwasher, rushHour, roundEnd, timerWarning
- **Audio toggle**: SettingsScene SFX toggle now actually controls SoundManager (reads localStorage)
- **HUD redesign**: 3 dark mahogany pill badges on cream panel — score (left), combo (center, changes color with tier), timer (right). Timer pill turns danger-red at 30s.
- **Combo tier pill colors**: gray→amber→orange→red/orange→magenta→gold (×1→2→3→4→5)
- **Main menu**: Dark logo card backdrop + staggered entrance animations + hover scale on buttons
- **Game Over**: Tile floor + side walls, cinematic header entrance, NEW RECORD pulsates
- **Customer animations**: showFoodReaction() on food delivery, showHappyExit() on payment
- **uiClick** on every button across all 6 scenes

### v1.1 Restaurant Simulation Changes
- **Entrance queue**: customers walk to entrance, wait in slots (max 2). Player taps empty table to seat them — simultaneous walk animations.
- **Dirty dish carry**: clicking dirty table loads tray with dirty dishes. Player must walk to dishwasher station (left wall) to deposit. Dishwasher pulses amber while dishes are held.
- **carryingDirty flag**: blocks kitchen pickup and table seating — "→ DISHWASHER!" hint shown.
- **'seating' table priority**: purple arrow on empty tables when queue non-empty.
- **Tutorial**: 7 steps covering full new flow (seat → order → kitchen → deliver → pay → dishes → dishwasher).

### P2 Retention HUD Changes (v0.9.0)
- **Combo always visible**: initializes as `×1.0` (gray, 14px) — never invisible again
- **5-stage combo system**: ×1.0 (subdued) → ×2.0 (🔥 noticeable) → ×3.0 (🔥🔥 exciting) → ×4.0 (⭐ impressive) → ×5.0 (💫 peak)
- **Combo milestones extended**: max multiplier raised from ×3.0 to ×5.0 (at count 15)
- **Progress bar**: 4px strip at bottom of HUD shows fill toward next milestone — creates anticipation
- **Combo lost feedback**: `💔 ×2.0 LOST!` float + red bar flash + camera shake + tween
- **Perfect Service detection**: `⭐ PERFECT!` when patienceAtDelivery ≥ 75%
- **Milestone announcements upgraded**: color + stroke + screen flash at ×3.0+ + star burst at ×4.0+
- **Shift Report redesign**: combo always shown, total guests served prominent, narrative headlines updated for ×4.0/×5.0 tiers

### P0.5 Hotfix Changes (v0.8.1)
- **Urgent state**: Alpha strobe (0.98→0.48, 180ms), faster tween (140ms), larger triangle (±18 vs ±15)
- **Dirty arrow**: Color 0x888888 → 0xC4823A (warm brown), broom 16px → 20px
- **Secondary scale**: 0.5 → 0.35 (ratio now 2.9:1 vs 2:1 before)
- **Elegant**: Gold earrings (r=4.5 circles at ear sides), cream collar wings, thick necklace (3.5px), large pendant (r=5.5)
- **Casual**: Horizontal white stripes on body (classic casual t-shirt silhouette)
- **Mobile fix**: Using `window.game.scene.start('GameScene')` directly in validation — confirmed gameplay at 390×844
- **HUD documented**: Combo invisible at ×1.0 (text=""); fix deferred to P3

### P0.5 Quality Gate Status
- URGENT: ✅ FIXED — strobe + larger + faster = viscerally alarming
- DIRTY: ✅ IMPROVED — brown-amber arrow, larger broom
- 5-table density: ✅ FIXED — primary 0.91 vs secondary 0.34 (2.7:1 ratio)
- Elegant silhouette: ✅ IMPROVED — earrings + cream collar + thick necklace
- Casual silhouette: ✅ IMPROVED — horizontal stripes
- Mobile gameplay: ✅ CONFIRMED — 390×844 works correctly
- Combo invisible: DOCUMENTED (P3 scope)

### P0/P1 Key Changes (v0.8.0)
- Action arrow (▼): scene-level Graphics depth 15, always ≥0.95 alpha, scale pulse only. Replaces invisible pulse ring.
- Arrow colors: blue=requesting, orange=kitchen_ready, gold=paying, red=urgent, gray=dirty
- Primary arrow: scale 1.0. Secondary arrows: scale 0.5. Both always visible.
- Kitchen glow: solid green fillRoundedRect on READY zone (right half of counter). Alpha 0.45–0.82.
- Customer sprites: 48×72px (was 32×52). Head r=14 (was r=10). 2.5px outlines (was 1.5px).
- Eyes: r=3 with white+pupil+highlight (was r=1.5 dark dot).
- Patience bar: 44×8px (was 36×5px). Bubble container at y=−88 (was y=−66).
- Name banner appears on arrival (variant name, fades after 1.6s).
- Arrow depth-15 architecture: arrow MUST be a scene-level object, NOT a container child, or customers will cover it.

### Game Identity (from GAME_IDENTITY.md)
**Unique Fantasy:** "Grace under pressure — being the most capable person in the room, and making it look effortless."
**Elevator Pitch (13 words):** "TableRush: Be the best waiter in the room. Three minutes. Every customer watching."
**Final Identity:** "TableRush is a three-minute performance. Not a restaurant sim. Not a time management puzzle. A performance — the specific, repeatable pleasure of being exceptionally good at something under pressure, in public, in real time."

### North Star (from ADDICTION_AND_RETENTION_PLAN.md)
> "I am the most capable person in this room — and the room knows it."
All design decisions must support the player's sense of EARNED COMPETENCE.

### Top 5 Post-Visual-Reboot Features (by retention impact × low complexity)
1. Combo always visible (shows ×1 grayed when inactive — currently invisible at ×1.0)
2. Daily goal on main menu (proven #1 mobile retention mechanic)
3. Last-second save theater (<8% patience → flashing bar + "CLOSE CALL!" peak moment)
4. Yesterday's score on main menu ("LAST SESSION: 2,840 — beat it?")
5. Shift report end screen (narrative summary of session highlights)

### SVG Decoration Assets
- `public/assets/decorations/potted_plant.svg` — terracotta pot with green plant (48×64)
- `public/assets/decorations/herb_plant.svg` — small herb plant in brown pot (32×36)
- `public/assets/icons/plate_badge.svg` — plate with fork+knife, gold/cream (48×48)
- BootScene preloads all three; GameScene places potted_plant at entrance corners and herb_plant at kitchen sides; MainMenuScene uses plate_badge on logo card

### Visual Overhaul — Key Config Values
- `TABLE_CLOTH: 0xF5F0E8` (warm linen ivory — GameConfig.ts)
- Table texture: 110×76 ivory linen, no checkerboard, two place-setting ring pairs
- Table overlay (depth 16): matching ivory, drawn in GameScene per table
- Dining rug: REMOVED (was muddy oval 0x8B1A2A at alpha 0.22)
- Kitchen "COOKING" label: 16px Arial Black, color #FFAA33
- Kitchen "READY" label: 16px Arial Black, color #44DD77
- Score text: `'$  0'` gold #FFD700 (was `'🍽️  0'`)
- Combo baseline text: `'×1'` color #D4AA55 (warm gold, not dead gray)

### Visual Reboot Direction
Chosen direction: **Stylized Cartoon** (Direction C)
- Bold 2.5px black outlines on all characters and UI
- Action indicator: colored ▼ arrow above tables (replaces invisible pulse ring)
- Arrow pulses by scale (0.9–1.1), never by alpha — always visible
- Customer sprites enlarged to 48×72px, heads larger, face features readable
- Combo always visible in HUD (shows ×1 grayed when inactive)
- Same warm palette, bolder execution

### Visual Reboot Priority Order
0. Action arrow indicator (fixes Phase 1 validation failure)
1. Customer redesign (larger, bold outlines, name banners)
2. Waiter redesign (larger, emotion system visible)
3. HUD redesign (combo always on, bold score/timer)
4. Table redesign (clean tablecloth, numbered)
5. Kitchen redesign (readable ticket system, bold ready zone)
6. Speech bubbles (state-specific shapes, larger)
7. Main menu (restaurant background, waiter present)
8. Game Over (emotional headers, drawn stars)
9. Tutorial (fix text timing bug)

---

## Git Governance (CRITICAL)
- **Branch:** `main` ONLY. Direct commits. No PRs. No feature branches.
- **Workflow:** `git add . && git commit && git push origin main`
- **CI:** GitHub Actions → type check + build + deploy-pages on push to main

---

## Architecture
- **Engine:** Phaser 3.87 + Vite 5 + TypeScript (strict)
- **Entry:** `src/main.ts` → `window.game = new Phaser.Game(config)`
- **Textures:** All generated in BootScene using `scene.make.graphics()` → `generateTexture()`
- **Storage:** `localStorage` for progress (XP, level, highScore, bestStars, totalRounds, tutorialDone)
- **Build:** `VITE_BASE_PATH=/TableRush/ npm run build` for GitHub Pages

## Scene Flow
```
BootScene (generate textures)
  → MainMenuScene (Play / Settings / Credits / Level / High Score)
    → GameScene (3-min gameplay loop with tutorial on first play)
      ↔ PauseScene (ESC overlay)
    → GameOverScene (reward screen: stars, XP, level progress, stats)
    → SettingsScene
    → CreditsScene
```

## Key Files
```
src/main.ts                        — Phaser config + scene list (window.game exposed)
src/config/GameConfig.ts           — ALL constants (palette, difficulty tiers, menu items, combo milestones)
src/systems/ProgressionSystem.ts   — XP/Level/Stars persistence + exportSave/importSave
src/systems/EconomySystem.ts       — Economy architecture stub (coins/shop/upgrades, not yet active)
src/systems/CarrySystem.ts         — Carry capacity system (1-item default, expandable)
src/scenes/BootScene.ts            — Procedural texture generation (v0.6.0 art direction applied)
src/scenes/GameScene.ts            — Core gameplay (v0.3.0: physical walk for all steps)
src/scenes/GameOverScene.ts        — Reward screen (stars, XP bar, stats)
src/scenes/MainMenuScene.ts        — Main menu (shows level + best score)
src/entities/Customer.ts           — Customer state machine + mood faces + patience/eating bars
src/entities/Table.ts              — Table state + priority pulse + cleaning progress bar
src/entities/Player.ts             — Waiter character + emotion system (5 states) + busy feedback + plate carry
screenshots/                       — Validation screenshots (v_01 through v_15)
ART_DIRECTION.md                   — Visual identity doc (palette, character rules, state language)
VISUAL_STYLE_GUIDE.md              — Component specs (typography, proportions, animation timing)
LAYOUT_GUIDE.md                    — Fixed anchor points (zones, tables, kitchen, z-order)
VALIDATION_REPORT.md               — 20/20 test results (v0.2.0)
```

## v0.7.0 Redesign Documents (AWAITING APPROVAL — no implementation yet)
```
RESTAURANT_FANTASY.md   — Core fantasy: "best waiter in the room." Emotional arc, visual/mechanic audit
GAMEPLAY_REDESIGN.md    — Priority system, order reveal, anger arc, tutorial rebuild
VISUAL_REDESIGN.md      — Ambient motion, customer personality, food presentation
BALANCE_REDESIGN.md     — Patience values, spawn caps, score formula, tips
PROGRESSION_REDESIGN.md — XP visibility, table unlocks, shop, daily challenges
RETENTION_REDESIGN.md   — Near-miss, last-session display, streaks, achievements
VISUAL_REBOOT_PLAN.md   — Full visual audit; Stylized Cartoon direction chosen; P0–P9 roadmap
ADDICTION_AND_RETENTION_PLAN.md — Psychology of restaurant addiction; 10 hooks; Top 5 features
GAME_IDENTITY.md        — Competitive positioning, unique fantasy, elevator pitch, Steam descriptions,
                          memorable moments, emotional arc, visual signatures, trailer, final identity
```

### Core Fantasy (from RESTAURANT_FANTASY.md)
> **"You are the best waiter in the room — and everyone knows it."**
> Every design decision must answer: does this make the player feel like the best waiter in the room?

## v0.6.0 Critical Knowledge

### Face Coordinate System (v0.8.0 — UPDATED for 48×72 customer)
Customer texture 48×72, sprite origin 0.5,0.5 → container (0,0) = texture center (24,36):
- Head center in container: **(0, −22)** ← HEAD_CY
- Eyes: **(±5, −24)** — eyeR = 3, white base + dark pupil + highlight ← EYE_Y
- Mouth: **y = −19** ← MOUTH_Y
- Head angry overlay: `fillRoundedRect(-15, -36, 30, 28, 6)` (head spans −36 to −8)

Player texture 40×62, sprite origin 0.5,0.5 → container (0,0) = texture center (20,31):
- Head center in container: **(0, −17)**
- Eyes: **(±4, −19)** — eyeR = 1.5
- Mouth: **y = −13** (as `cy + 4`)

### Patience Bar Layout (v0.8.0)
- Track: `fillRoundedRect(-22, -50, 44, 8, 4)` — 44×8px pill at y=−50
- Fill: same rect, width = `44 * frac`
- Bubble container: y = −88 (tail tip at y=−54, 4px above patience bar top at −50)
- Eat bar: `fillRoundedRect(-22, 38, 44, 5, 2.5)` — below feet at y=38
- Bubble tail: `fillTriangle(-7, 16, 7, 16, 0, 34)` in bubble local space

### Carry Display (v0.6.0)
Player now shows: tray (y=−44) + plate bg `food_plate` (y=−55) + emoji (y=−53)

## Gameplay Systems (v0.2.0)

### Customer Lifecycle
```
entering → seated → requesting → ordering → waiting_food → eating → paying → leaving
                                                                              ↓
                                                                         table dirty → clean → empty
```
- `requesting`: customer shows ❓ bubble, table pulses blue
- `ordering`: player arrives, order AUTO-ASSIGNED (no popup), added to kitchen queue
- `waiting_food`: order cooking in kitchen queue
- Angry path: patience=0 → score penalty → table immediately CLEAN (no cleaning needed)

### Kitchen Queue System
- Array of `KitchenOrder` objects: `{ id, tableId, customerId, item, startTime, ready }`
- All orders cook in parallel (timers tick simultaneously)
- Kitchen area glows orange when any order is ready
- Player taps kitchen → picks up oldest ready order (shows food above waiter head)
- Destination table highlighted — player taps it to deliver

### Player Interaction (tap-to-act, context-sensitive)
| Table state | Player action | Result |
|-------------|---------------|--------|
| Customer REQUESTING | Tap table | Player walks → auto-orders |
| Kitchen (order ready) | Tap kitchen | Player picks up food |
| Customer WAITING_FOOD (player carrying) | Tap table | Deliver food |
| Customer PAYING | Tap table | Collect payment |
| Table DIRTY | Tap table | Clean (1.5s) |

### Priority Visual System
| Priority | Color | Animation |
|----------|-------|-----------|
| Patience < 25% | Red pulse | Fast 300ms yoyo |
| Kitchen has ready order | Orange glow | 500ms yoyo |
| Customer REQUESTING | Blue pulse | 700ms yoyo |
| Customer PAYING | Gold shimmer | 600ms yoyo |
| Table DIRTY | Broom icon | Static |

### Score System
- Delivery: `item.price × 10 × speedMultiplier × comboMultiplier`
- Payment: `(item.price + tip) × 5 × comboMultiplier`
- Speed multiplier based on patience remaining at delivery time (×0.75–×2.0)
- Angry customer: penalty −50/−100/−150 per difficulty tier, combo reset

### Combo System (named milestones)
| Consecutive happy customers | Multiplier | Name |
|-----------------------------|------------|------|
| 0–2 | ×1.0 | — |
| 3–4 | ×1.5 | GOOD SERVICE |
| 5–7 | ×2.0 | HOT STREAK 🔥 |
| 8–9 | ×2.5 | UNSTOPPABLE 🔥🔥 |
| 10+ | ×3.0 | TABLE MASTER 💫 |

### Difficulty (time-based tiers, not ramp)
| Elapsed time | Patience range | Spawn interval |
|-------------|----------------|----------------|
| 0–60s | 90–120s | 8000→7000ms |
| 60–120s | 60–90s | 5500→4500ms |
| 120–180s | 45–65s | 4000→3500ms |

### Tutorial (first session only)
6 steps shown via text overlay at bottom of screen. Tracked in localStorage. One customer at a time during tutorial.

### Progression System (ProgressionSystem.ts)
- XP = score / 10 per round
- 10 levels, thresholds: [0, 300, 700, 1300, 2200, 3500, 5500, 8000, 11000, 15000]
- Persisted: xp, level, highScore, bestStars, totalRounds
- Tutorial done: `tablerush_tutorial_done` = '1'

### End-of-Round Screen (GameOverScene)
Shows: Score | Best Score | Stars (1-3) | XP earned | Level progress bar | Combo record | Customers served | Next unlock hint

### Star Rating
- ⭐⭐⭐: ≥90% customers served happy AND score ≥2000
- ⭐⭐: ≥70% customers served happy
- ⭐: completed the round

## Palette (warm restaurant)
- Floor: `#F5E6C8` / `#EDD9A3`
- Table: `#8B4513` mahogany + `#FDFAF6` tablecloth
- Waiter: `#1A237E` navy jacket, `#FDA07A` skin
- UI: `#FF6B35` orange, `#FFD700` gold, `#4CAF50` green, `#F44336` red

## Repository Structure
```
/
├── index.html                     (warm cream body bg, SVG favicon)
├── package.json / tsconfig.json / vite.config.ts
├── .github/workflows/ci.yml       — CI + GitHub Pages (actions/deploy-pages)
├── src/
│   ├── main.ts                    (window.game exposed for testing)
│   ├── config/GameConfig.ts
│   ├── systems/ProgressionSystem.ts
│   ├── entities/Customer.ts / Table.ts / Player.ts
│   └── scenes/ (7 scenes)
├── screenshots/                   (v0.2.0 validation screenshots)
├── MEMORY.md / PROJECT_STATUS.md / CHANGELOG.md
├── GAMEPLAY_REDESIGN.md / VISUAL_REDESIGN.md / BALANCE_REDESIGN.md
├── V0_2_REVIEW.md                 (player experience review)
├── VALIDATION_REPORT.md           (20/20 PASS)
└── README.md
```

## Known Issues / Limitations
- Music: SFX toggle works; music toggle saves to localStorage but no music system implemented (Settings shows "Music coming in a future update")
- Single-item carry only (CarrySystem.ts stub exists for multi-carry expansion)
- Phaser bundle ~1.5MB (expected for game engine)

## Audio System (SoundManager.ts)
- Static class, Web Audio API synthesis (no external files needed)
- Checks `localStorage.getItem('tablerush_sfx') !== 'off'` before playing
- Sounds: uiClick, seatCustomer, orderTaken, foodReady, deliverFood, paymentCollected, comboUp(tier), comboLost, customerAngry, dishwasher, rushHour, roundEnd, timerWarning
- `comboUp(tier)` takes tier 1-4, produces escalating fanfares
- All UI buttons call `SoundManager.uiClick()` before their callback
