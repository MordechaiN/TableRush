# CHANGELOG

## v1.5.0 — Final Product: Full Emoji Sweep + Visual Consistency (2026-06-07)

### Complete Emoji Elimination (10 files)

All emoji removed or replaced with rendered graphics. Every rendering environment now shows the correct visual.

- **`GameConfig.ts`**: COMBO_MILESTONES labels (`HOT STREAK 🔥→HOT STREAK`, `ON FIRE 🔥🔥→ON FIRE`, `⭐ TABLE LEGEND→TABLE LEGEND`, `💫 TABLE MASTER→TABLE MASTER`). SPEED_MULTIPLIERS labels (`⚡⚡ LIGHTNING→LIGHTNING`, `⚡ FAST→FAST`, `🐢 SLOW→SLOW`).
- **`SettingsScene.ts`**: Old amber checkerboard floor replaced with dark walnut planks + cream wainscoting walls (matches rest of game). Header `⚙️ SETTINGS→SETTINGS`. Reset button `🗑️→plain text`.
- **`CreditsScene.ts`**: Old amber floor/walls replaced with dark walnut + cream wainscoting. Header `🎖️ CREDITS→CREDITS`. Credit icons `🎮🤖🛠📦→✦✦✦✦`. Footer `🍽️ Made with care→Made with care`.
- **`PauseScene.ts`**: `⏸ PAUSED→PAUSED`. MAIN MENU button color `0x888888→0x5A3A1E` (dark mahogany — no longer looks disabled).
- **`GameScene.ts`**: Redundant tableGlow circle (inside TABLE_POSITIONS.forEach) removed — per-table candlelight pools already handle this. Combo HUD `🔥 ×2.0→×2`, `🔥🔥 ×3.0→×3`, `⭐ ×4.0→×4`, `💫 ×5.0→×5`. Queue footprints `👣→drawn Graphics ovals`. Pause button `⏸→||`. Tutorial step icons `['🪑','📋','🍳','🍽️','😋','🧹','🚿']→['1','2','3','4','5','6','7']`. All showFloating() calls de-emojied. table.setFloatEmoji `'😋'→'♡'`, `'💳'→'$'`. spawnStarBurst uses Graphics instead of `⭐` text. triggerCelebration confetti uses Graphics. Rush hour banner `⚡ RUSH HOUR ⚡→RUSH HOUR`.
- **`MainMenuScene.ts`**: Background table silhouettes alpha `0.22→0.38` (visible on dark floor). `🏆 BEST SCORE→BEST:`. `⭐→★` in best-stars display. Ambient particles: emoji array replaced with drawn Graphics shapes (diamonds, circles, crosses).
- **`GameOverScene.ts`**: Headers `🏆 NEW RECORD!→NEW RECORD!`, `⭐ PERSONAL BEST!→PERSONAL BEST!`. Stats: `👥` removed, `⚡` removed, `💪` removed. Level-up `🎉 LEVEL UP→LEVEL UP`. Tray upgrade `🍽️` removed. Combo icons `💫/⭐/🔥🔥/🔥→★/★/+/↑`. Star burst uses Graphics instead of emoji. `✨ PERFECT SHIFT! ✨→PERFECT SHIFT!`.
- **`Customer.ts`**: Bubbles `❓→?`, `💳 $price→$price`, `😠→!!`. VIP crown `👑→drawn Graphics crown shape`.
- **`Player.ts`**: Dirty badge `🍽️→drawn Graphics plate (grey disc with orange smear)`. Emotion badges `😊🤩😰😤→♡★!!✓`.
- **`Table.ts`**: `setDirty()` no longer calls `setFloatEmoji('🍽️')` — dirt overlay already communicates state.

---

## v1.4.0 — Art Direction Reboot (2026-06-07)

### 5 Structural Visual Problems Fixed Through Design (Not Scale)

**Design philosophy shift:** Visibility solved through contrast and material design, not by making elements larger. The amber-on-amber visual soup replaced by rich dark environment that makes every character, table, and food item pop.

- **Fix 1: Dark walnut hardwood floor** (`GameConfig.ts`, `GameScene.ts`, `MainMenuScene.ts`, `GameOverScene.ts`): Replaced 70×70 amber checkerboard (`FLOOR_WARM: 0xC4813A`) with horizontal hardwood plank floor (`FLOOR_WARM: 0x2E1E0F`). 34px plank rows in 5 alternating dark walnut tones. Subtle grain highlights at plank tops. Shadow gap lines between boards. Staggered end-grain joint lines. Applied consistently across all three background scenes. Single most impactful visual change — every element above the floor now reads clearly: navy waiter pops, ivory tablecloths glow, customers are findable.

- **Fix 2: Kitchen slate tile floor** (`GameScene.ts`): Replaced the ineffectual amber kitchen tint (7% dark orange over amber floor) with actual 38×30 cool slate tiles (`0x1E2523 / 0x191F1E`) covering the kitchen zone (y=88–188). Dark grout lines at 65% opacity. Creates immediate spatial grammar: walk into the dining room (dark walnut planks), look at the kitchen (cool gray slate). The zone distinction that was impossible to read is now instinctive.

- **Fix 3: Cream wainscoting walls** (`GameScene.ts`, `MainMenuScene.ts`, `GameOverScene.ts`): Lower wall section changed from amber-brown (`0x9A5C28`) to warm cream (`0xEEE3D2`). Upper section stays terracotta (`0xBF7A42`). Added proper chair rail in dark mahogany (`0x5A2E12`). Near-black baseboard (`0x251007`). The visual separation between floor and wall that was previously absent now reads clearly — dark floor meets cream wainscoting at the chair rail. A restaurant reading at a glance.

- **Fix 4: Per-table candlelight pools** (`GameScene.ts`): Removed three fixed pendant lamp light pools at y=320 radius=80 (these created an inaccurate horizontal band that missed tables 3, 4, 5). Added five per-table warm amber elliptical pools (`0xFFBB44` at 8% opacity, 120×70px) accurately positioned under each TABLE_POSITION. On the dark floor, these read as candlelit dining spots rather than zone indicators.

- **Fix 5: Service counter warm granite** (`GameScene.ts`): Counter top changed from near-black (`0x241610`) to charcoal granite (`0x3A2820`). Warm surface sheen added (`0x5C3C28`). Mahogany face panel lightened from `0x6B3812` to `0x8B4820`. Added a 1.5px warm edge highlight line at the counter top. Divider panels darkened slightly for better contrast. The physical barrier between kitchen and dining room now reads as a real service counter against the dark floor.

### Art Direction Document
- **`ART_DIRECTION_REBOOT.md`** created: professional competitor analysis (Overcooked, PlateUp, Cooking Fever, Good Pizza Great Pizza), 10-section visual design prescription, ranked problem list, color language table, commercial presentation verdict.

---

## v1.3.0 — Commercial Visual Polish (2026-06-07)

### Phase 4 — Top 5 Visual Problems Fixed

- **Table cloth** (`GameConfig.ts`, `BootScene.ts`, `GameScene.ts`): Replaced red/white checkerboard (0x9B1C2A) with clean ivory linen (0xF5F0E8). Table texture redesigned — solid tablecloth, place-setting rings, linen edge stitching detail. Table overlay (depth-16 seated illusion) updated to exact match.
- **Dining rug removed** (`GameScene.ts`): Deleted the muddy burgundy oval that looked like a hitbox/zone indicator. Floor now reads cleanly as a tiled restaurant floor.
- **Kitchen zone labels** (`GameScene.ts`): "COOKING" and "READY" labels upgraded to 16px Arial Black, #FFAA33 gold and #44DD77 green respectively. Previously 13px with fire/checkmark emoji.
- **Score display** (`GameScene.ts`): Changed from `'🍽️  0'` to `'$  0'` in gold #FFD700. All `setText` calls updated to match. Score now reads as money, not a food item.
- **Combo baseline** (`GameScene.ts`): Changed from `'×1.0'` dead gray to `'×1'` warm gold #D4AA55 with matching pill background. Combo meter feels alive even at minimum, not disabled.

### Phase 6 — Placeholder Asset Replacement

- **`public/assets/decorations/potted_plant.svg`** (NEW): Terracotta pot with lush green plant, 48×64 viewBox. Replaces 🪴 emoji at both entrance corners in GameScene.
- **`public/assets/decorations/herb_plant.svg`** (NEW): Small herb plant in brown pot, 32×36 viewBox. Replaces 🌿 emoji at both kitchen sides in GameScene.
- **`public/assets/icons/plate_badge.svg`** (NEW): Plate with fork left and knife right, gold/cream, 48×48 viewBox. Replaces 🍽️ emoji in MainMenuScene logo card.
- **`BootScene.ts`**: Added preload calls for all 3 new SVGs.
- **`GameScene.ts`**: Replaced `this.add.text(28, ..., '🪴')` / `'🌿'` with `this.add.image(..., 'potted_plant')` / `'herb_plant'` at all 4 corners.
- **`MainMenuScene.ts`**: Background table silhouettes updated to `0xF5F0E8` (was `0x9B1C2A`). Logo badge upgraded from emoji text to `this.add.image(..., 'plate_badge')`.

---

## Visual Art Overhaul — Phase A+B+C+D (2026-06-05)

### SVG Asset Pipeline — Complete
- **17 custom SVG assets created**: 5 food items, 7 customer characters, 2 waiter variants (standing + walking)
- **Food assets**: salad, burger, pasta, sushi, pizza — all fully illustrated SVG sprites replacing all emoji food
- **Waiter assets**: detailed navy jacket, bow tie, face with expressions, walking animation variant
- **Customer assets**: 7 distinct character types — Elegant (purple dress, updo), Business (charcoal suit, briefcase), Casual (teal tee + jeans), Trendy (orange jacket, sunglasses, bleached streak), Romantic (pink dress, long hair), Elder (cardigan, glasses, cane), Teen (teal hoodie, spiky hair)
- **BootScene restructured**: `preload()` now loads 17 SVGs; `createTextures()` only generates procedural UI elements (tables, chairs, HUD, buttons)

### Emoji Food Completely Removed
- **Order bubbles**: food SVG image shown in customer speech bubble instead of emoji
- **Kitchen tickets**: food SVG image on ticket instead of emoji
- **Cooking burners**: food SVG image visible inside cooking pot visual
- **Ready plates**: food SVG image on plate in kitchen ready zone
- **READY! pop**: food image + "READY!" text, no emoji
- **Delivery burst**: 8 food image pieces burst outward on delivery
- **Table float**: `setFloatFoodImage()` shows food SVG above table when order placed (was emoji)
- **Tray display**: food images rendered on player tray instead of emoji text
- **Menu strip**: 5 food images in kitchen zone label instead of emoji row
- **Main menu**: bottom food row and waiter tray foods are now SVG images

### Architecture
- `CarrySlot` now stores `itemId: number` alongside `emoji` for image key resolution
- `Player.showTray(itemIds: number[], capacity)` accepts item IDs, renders food images at correct scale
- `Customer.buildBubbleWithFood(itemId, borderColor)` renders food image in speech bubble
- `Table.setFloatFoodImage(itemId, bouncing)` displays food image above table

## Final Product Sprint — Commercial Polish (2026-06-04)

### Phase 2-3: Customer Visibility + Queue Display
- **Float emoji (depth 19)**: Bouncing food emoji above each table showing ordered item. Shows 😋 (eating), 💳 (paying), 🍽️ (dirty). Depth 19 keeps it visible above player (17) and arrows (15) at all times.
- **Seat ring**: Pulsing yellow ring (radius 30, depth 8) marks customer position at table — scannable at a glance without reading table state.
- **Queue count**: "1 GUEST WAITING" / "N GUESTS WAITING" text at bottom of screen, updated on every queue change. Disappears when queue is empty.
- **Seated glow alpha**: 0.38 → 0.55 for better occupied table contrast.

### Phase 4: Kitchen Alive
- **Cooking-on-burner visual**: When an order starts cooking, its food emoji appears in a pot container bobbing above the active burner. Two burner slots (x=70, x=185). Removed when food is ready.
- **READY pop text**: Bright green "🍕 READY!" announcement pops below the kitchen counter when food finishes cooking — stays visible 700ms. Positioned at right side of dining area (x=360, y=198) so visible from across the room.

### Phase 5: Table State Rework
- **Eating state emoji**: 600ms after food delivery, 😋 bounces above the table if customer is eating — signals "leave me alone, I'm happy."
- **Paying state emoji**: 💳 bounces above table when customer finishes eating and wants to pay.

### Phase 7: Game Feel
- **Escalating camera effects at combo milestones**: Flash only at ×2; shake+flash at ×3/4/5 with increasing intensity. Extra shakes at combo counts 10 and 15.
- **Green camera flash on food ready**: Unmissable green pulse when any order finishes cooking.
- **Cleaning satisfaction**: Bigger "🧹 CLEAR!" text at table position. Dishwasher completion shows "✨ CLEAN!" at 1.3× + green flash.
- **Delivery flash**: Warm white camera flash on food delivery.
- **Combo triggerCelebration**: 34px text with stroke, 22 confetti pieces with random rotation.
- **Payment**: Gold camera flash + light shake on collection.

### Visual Polish
- **Floor color**: FLOOR_WARM 0xF5E6C8 → 0xC4813A (rich amber), FLOOR_ALT 0xEDD9A3 → 0xAA6A28.
- **Table cloth**: TABLE_CLOTH 0xFDFAF6 → 0x9B1C2A (deep burgundy). Matches all table states.
- **Player scale**: 1.5 → 2.0 — waiter is the hero, readable from anywhere.
- **Main menu particles**: Ambient ✨⭐💫🌟 sparkle particles rise from the bottom every 600ms — menu feels alive.
- **Main menu silhouettes**: Background table silhouettes now use burgundy cloth (matches in-game).

---

## System Redesign Pass (2026-06-04)

### Top 5 Alpha Blockers Resolved
- **Single-focus indicator**: Secondary arrows now `alpha=0` (was `scale=0.25`). Only the #1 priority arrow is visible at any time — no more visual chaos of 5 simultaneous pulsing arrows.
- **Customer seated position**: Seated Y moved from `table.y - 24` → `table.y - 6`. Front-face overlay covers lower body; only head + upper chest visible above the table surface. Chair back (at `table.y - 54`) now visible above the customer.
- **Two-item tray carry**: `CarrySystem(2)` fully integrated. `carryingOrderId` removed. One kitchen trip picks up up to 2 ready orders. Tray shows both items side-by-side. Delivering one item leaves the other on the tray — player goes to second table without returning to kitchen.
- **Physical food on counter**: `spawnReadyPlate()` — when an order finishes cooking, a plate graphic with food emoji + table number badge appears on the READY counter. Pop-in animation. Plate removed when player picks it up.
- **Non-blocking dirty dishes**: `carryingDirty` gates removed from all click handlers. Dirty dishes shown as `showDirtyDish()` badge on player (small 🍽️, lower-right, independent of food tray). Player can serve food while carrying dirty dishes. Server workflow is now a flow, not a full stop.

### Architecture
- `CarrySystem.ts` — was a stub with no callers. Now drives all carry logic: `tray.pickUp()`, `tray.drop()`, `tray.isEmpty()`, `tray.hasOrder()`, `tray.canPickUp()`, `tray.getSlots()`
- `Player.carryItems(emojis[])` — replaces `carryItem(emoji)`. Accepts 1 or 2 items, positions side-by-side
- `Player.showDirtyDish()` / `hideDirtyDish()` — dirty badge completely independent of food tray

---

## Visual Environment Pass (2026-06-04)

### Restaurant Environment Overhaul
- **Pendant lamps**: 5 amber hanging fixtures above each dining table — cord + shade cap + shade cone + warm inner glow. Positioned at `pos.y - 90`, clear of back chairs (center `pos.y - 54`). Depth 2.
- **Table glow pools**: Warm amber circles (`0xFF9933, 6.5% alpha`) at floor depth beneath each table — creates intimate candlelit dining feel per table.
- **Service counter**: Replaced thin 6-10px ledge with thick granite counter — dark countertop (`0x241610`) + mahogany face panel (`0x6B3812`) + 3 vertical dividers. No "PICK UP" text.
- **Kitchen zone labels**: Replaced large solid pill badges (COOKING/READY) with small 9px/50%-alpha inline text. Kitchen reads as a workspace, not a button panel.
- **Text labels removed**: "DISHWASHER", "HOST", "WAIT HERE" — prototypical signage deleted. Props (machine, stand, footprints) communicate function without labels.

## RC1 — Release Candidate 1 Polish Sprint (2026-06-03)

### Audio System (Phase 4 — NOT optional)
- New `src/systems/SoundManager.ts` — Web Audio API synthesis, zero external files
- 12 synthesized sound types: uiClick, seatCustomer, orderTaken, foodReady, deliverFood, paymentCollected, comboUp (4 tiers of escalating fanfare), comboLost, customerAngry, dishwasher, rushHour, roundEnd, timerWarning
- Sounds wired to all key game events in GameScene (seat, order, food ready, deliver, payment, combo up/lost, angry customer, dishwasher, rush hour, round end, 30s warning)
- `uiClick` on every interactive button across all 6 scenes (MainMenu, Game, Pause, GameOver, Settings, Credits)
- SFX toggle in Settings now actually controls audio (reads `localStorage.getItem('tablerush_sfx')`)
- Settings note updated: "Music coming in a future update" (Music toggle saved but no music system yet)

### HUD Redesign (Phase 1 — UI/UX)
- Three dark mahogany pill badges replace plain text on cream panel
- **Score pill** (left, x=8–156): dark background, white "🍽️ 0" text
- **Combo pill** (center, x=166–314): color shifts with combo tier — gray(×1) → amber(building) → orange(×2) → deep orange(×3) → magenta(×4) → gold(×5)
- **Timer pill** (right, x=324–472): dark background, turns danger-red at 30 seconds remaining
- Pause button integrated into right pill area on desktop

### Main Menu Visual Identity (Phase 1)
- Dark semi-transparent logo card backdrop with gold border behind title words
- Staggered entrance animations: card fade → badge icon → TABLE word → RUSH word → tagline → stats → buttons
- PLAY button slightly larger (scale 1.12) for clear hierarchy
- All buttons have hover scale effect (1.04× scale on hover)
- Button entrance animations (fade + slide up from below)

### Animation Pass (Phase 3)
- `Customer.showFoodReaction()`: green flash + scale pop + upward bob when food arrives at table
- `Customer.showHappyExit()`: gold flash + bounce before customer leaves after payment
- Both wired at correct points in GameScene (deliverFood, collectPayment)

### Game Over Cinematic (Phase 1/3)
- Tile floor + side walls for visual consistency with all other scenes
- Panel fades in on scene entrance (was instant)
- Header entrance: scale-in from 0.7 → 1.0 + fade-in (Back.easeOut)
- "NEW RECORD!" header pulsates with gold shimmer loop after entrance

## v1.0.0 — Public Release (2026-06-03)

### Scene Polish: Settings
- Full tile background + side walls + amber top wall bar (matches game scene)
- White card panel with rounded corners and section dividers
- AUDIO section header with Sound Effects + Music toggles
- "🎵 Audio coming in a future update" — honest, clear expectation-setting
- PROGRESS section showing current Level + High Score inline
- `TableRush v1.0.0` label at bottom of card
- Hover effect on Reset Progress button

### Scene Polish: Credits
- Full tile background + side walls + amber top wall bar
- White card panel with per-entry divider lines
- Added "🍽️ Made with care, one table at a time." closing quote
- Version and copyright inside the card: `TableRush v1.0.0` + `© 2026 Mordechai Neeman`
- Replaced robotics emoji 💻 with 🤖 for Implementation credit

### Scene Polish: Main Menu
- Background table silhouettes improved: show table + tablecloth + four chairs at 0.07 alpha
- Bottom empty area filled with animated food emoji row (🥗 🍔 🍝 🍣 🍕) at y≈710
- Version watermark "v1.0.0" replaces "TABLE RUSH" duplicate text

### Version Numbers
- `package.json` version: `0.1.0` → `1.0.0`
- `CreditsScene.ts`: `v0.2.0` → `v1.0.0`
- `SettingsScene.ts`: Added `v1.0.0` label

### Documentation
- Created `RELEASE_CHECKLIST.md` — full definition-of-done tracking
- Updated `PROJECT_STATUS.md` to v1.0.0

---

## v1.4 — Alpha Build (2026-06-03)

### Table State Visuals
- Added `setStateVisual()` on Table: draws contextual object on table surface for each game state
  - `'menu'`: dark-green booklet with spine, cream pages, and text lines (customer requesting)
  - `'ticket'`: white order slip with tear perforation, text lines, and orange stamp circle (food cooking)
  - `'plate'`: rimmed plate with orange food blob and green garnish (customer eating)
  - `'bill'`: dark-leather check folder with gold clasp and corner ornaments (paying)
- All visuals positioned at container x:−42 to −18, y:−30 to −8 — clear of customer sprite, front-face overlay, candle, and table number badge
- State cleared on `setEmpty()`, `setOccupied()`, `setDirty()`

### Kitchen Zone Clarity
- COOKING zone: orange-tinted background rectangle, orange `🔥 COOKING` badge
- READY zone: green-tinted background rectangle, green `✅ READY` badge
- Vertical divider line between zones
- Kitchen glow now covers full READY zone rectangle (was a single bar)

### Menu Board Fix
- Replaced hidden chalkboard (y=4–56, behind HUD panel at depth 3) with visible recipe strip at y=62
- Recipe strip: dark-green background with `MENU: 🥗 🍔 🍝 🍣 🍕` — always readable

### Restaurant Environment
- Host stand added at entrance right side: mahogany podium with clipboard + gold pen + "HOST" label
- Dining area zone: subtle golden-amber tint over table area to differentiate from kitchen floor
- Kitchen floor: dark tint over kitchen area to ground cooking zone visually
- Queue zone visibility improved: stronger border (0.7 alpha), larger footprints (16px, 0.55 alpha), bolder "WAIT HERE" text (0.8 alpha)

### Tutorial Rewrite
- Previous: 160px multi-line panel with step numbers and detailed instructions
- Now: 54px compact floating card at bottom of screen, single-line action prompts, 7 progress dots
- Steps: Guest arrives → Take order → Food cooking → Pick up food → Deliver → Pay → Clean → Dishwasher
- First step delayed 800ms to let game load before tutorial fires

### Alpha Validation
- Full game loop playtested end-to-end: queue → seat → order → cook → deliver → eat → pay → dirty → clean
- All state visuals confirmed working at each transition
- Zero console errors, TypeScript compiles clean

---

## v1.3 — Visual Clarity Pass (2026-06-03)

### Dirty Table Readability
- Dirty table body now receives orange tint (0xFF6622) — unmistakable at a glance
- Tint cleared on `setEmpty()` and `setOccupied()` — clean tables always look clean

### Action Arrow Size
- Normal arrows: 15×12 → 20×16 (33% larger)
- Urgent arrows: 18×14 → 25×20 (39% larger)
- Secondary urgency scale: 0.35 → 0.25 (primary arrows more dominant)

### Kitchen Noise Reduction
- Removed "TAP TO PICK UP" label from kitchen counter ledge — cleaner UI
- Ready ticket now scale-punches (1.38×) when food is done — unmissable cue

### Customer Seating Position
- Customer vertical position: table.y-20 → table.y-24 (4px higher = more "seated behind table")

---

## v1.2 — Living Restaurant (2026-06-03)

### Waiter Rework
- Player container scaled to 1.25× — visually dominant character in the restaurant
- Tray emoji enlarged to 24px (up from 18px) — food clearly readable from distance
- `deliverAnim()`: player extends forward+up when placing food (scale punch)
- `collectAnim()`: player dips to pick up dishes (downward scoop)

### Customer Idle Behaviors
- Each seated customer self-manages idle animations via periodic timer (1.8–4.6s intervals)
- `requesting`: horizontal shuffle to indicate impatience
- `waiting_food`: lean forward (tap table gesture)
- `eating`: rapid chewing bob
- `paying`: energetic wave for attention
- `cleanup()` cancels all timers on destroy (prevents timer leaks)

### Rush Hour System
- Two waves per game: at 60s elapsed and at 150s elapsed, each lasting 25s
- Spawn interval × 0.5 (twice as fast) during rush
- Queue max grows from 2 to 3 during rush
- "⚡ RUSH HOUR! ⚡" announcement with camera shake
- Subtle red screen overlay (alpha 0.045) during rush
- "😌 Rush is over" message at recovery

### VIP Customer
- 10% chance per spawn (disabled during rush hour and tutorial)
- Gold body tint + floating 👑 crown with bob animation
- 70% of normal patience (impatient)
- 2.5× payment score multiplier
- "⭐ VIP! ×2.5" float + camera flash on payment

### Queue Life
- Queued customers leave after 18s if not seated
- 50% tier penalty on queue abandonment + combo reset
- `queueTimeout` cancelled when customer is successfully seated

### Dishwasher Steam
- 6 steam puffs burst from dishwasher top when dishes are deposited

---

## v1.1 — Restaurant Simulation Flow (2026-06-03)

### Entrance Queue
- Customers no longer teleport to tables — they walk in from the entrance and queue at the door
- Max 2 customers waiting in visible queue slots (x=175/315, y=760)
- Empty tables show a purple 'seating' arrow when queue is non-empty
- Player taps any empty table → player and queued customer walk simultaneously to the table
- Queue repositions when front customer is seated

### Dirty Dish Carry System
- Clicking dirty table now picks up dishes (player walks to table, dishes appear on tray)
- Tray shows 🍽️ with brown-tinted plate — clearly distinct from food delivery
- `carryingDirty = true` state: all table/kitchen taps blocked with "→ DISHWASHER!" hint
- Dishwasher station (left wall, y=172–220) pulses amber when dishes need depositing
- Player taps dishwasher to deposit → `carryingDirty = false` → seating arrows update

### Tutorial (7 Steps)
- Updated from 6 to 7 tutorial steps to cover the full simulation flow
- Step 0: seat waiting guest at entrance
- Steps 1–4: take order, kitchen, deliver, pay (unchanged mechanics)
- Step 5: pick up dirty dishes from table
- Step 6: deposit at dishwasher

### Table Priority Arrow Added
- `'seating'`: purple (0x9B59B6), 700ms pulse — shows which empty tables can accept a queued guest
- updateActionPriority: carryingDirty early return (dishwasher is sole priority)

---

## v1.0 — Restaurant Immersion Reboot (2026-06-03)

### The Room Is Now Real
- Side walls added (left + right, 16px wide, terracotta/wainscoting/baseboard) — the restaurant is now an enclosed space
- Wall sconces on both side walls (y=240, y=490) with warm amber glow
- Tile depth shadows added at grout lines — tiles have visual mass
- Ambient light pool opacity raised from 0.045 to 0.085

### Kitchen — Three Zones, Zero Confusion
- COOKING zone: bold orange pill badge with 🔥 icon — readable at a glance
- READY zone: bold green pill badge — food destination obvious
- "TAP TO PICK UP" counter ledge strip at front of kitchen
- Zone labels enlarged from 10px to 12px white-on-color

### Entrance — Professional Restaurant Door
- Replaced `🚪` emoji with drawn double-door: mahogany frame, two glass-panel doors, cross window frames, gold handles
- Striped door mat with depth effect
- Plants repositioned to flank entrance correctly

### Chairs — Actual Chairs
- Chair texture completely redesigned (30×34px)
- Top-down view: back corner posts, horizontal backrest bar with spindle rails, seat with surface sheen, front leg posts
- Front chairs use setFlipY(true) so backrest faces away from table
- Both chair types read immediately as restaurant seating

### Table Numbers
- Small gold number badge (1–5) on top-right of each table's tablecloth
- Dark mahogany background — matches table body color palette

### Candle Flicker
- Each table's candle has unique flicker animation (scale + alpha oscillation)
- Staggered delays so candles don't pulse in sync
- Candles enlarged to scale 1.4 for visibility

### Payment Celebration
- Replaced 5×`💰` emoji scatter with 8 drawn gold coin Graphics
- Each coin: 8px radius, gold fill, highlight shimmer, gold outline
- Gold burst flash radiates outward at payment
- Coins arc in alternating radii for organic feel

### Main Menu
- Side walls (terracotta + wainscoting) match game scene language
- Window light shafts from top edges (warm amber triangles)
- Background table silhouettes (very subtle, adds depth)
- Version text replaced with "TABLE RUSH" brand watermark

## v0.9.3 — Restaurant Reboot (2026-06-03)

### Customer Seating Illusion
- Front face overlay (depth 16) per table: pixel-accurate tablecloth replication from `pos.y-5` downward, hides customer feet
- Player depth raised 10→17: waiter now renders above the front face overlay
- Back chair added behind each table (depth 0): seats the customer visually
- Front chair added in front of each table (depth 5): completes the spatial framing

### Dirty Table — Procedural Mess Graphics
- Replaced single 🧹 emoji with full procedural `dirtOverlay` Graphics object
- Two plates with food remnants, a glass with liquid, fork/knife, crumpled napkin, scattered crumbs
- All graphics positioned at container local y ≤ -10 (upper table half), safely above the front face overlay spatial coverage
- Rich brown/cream/tan palette — unmistakably "this table needs cleaning"

### Instant Clean
- Removed 1500ms progress bar + `startCleaningProgress()` method entirely
- Table opens IMMEDIATELY when player arrives: `table.setEmpty()` fires on player bounce
- `✨ Clean!` float replaces progress bar fill — zero dead time, next customer can sit instantly

### Food Inventory Model
- Delivery match changed: `order.tableId === tableId` → `order.item.itemId === customer.order.itemId`
- Any food of the matching type satisfies any matching-type order (inventory, not table-locked)
- `onKitchenClick()` highlights ALL tables whose customers can accept the picked-up item type
- `updateActionPriority()` finds first compatible destination when carrying

### Restaurant Environment
- Dishwasher station added (left wall, depth 2): machine body, panel, door handle, status light, water drip detail
- "DISHES" label at depth 3

## v0.9.2 — Patience Timer Pressure Calibration (2026-06-03)

### The Root Cause Fix
- Customer patience was 5-13× the service cycle — zero urgency possible
- Tier 1 (0-60s):   90k-120k ms → 48k-58k ms
- Tier 2 (60-120s): 60k-90k ms  → 30k-38k ms
- Tier 3 (120-180s):45k-65k ms  → 20k-26k ms

### Validated Results (5 sessions, optimal bot)
- All angry events occur in tier 3 only (120-180s) — learning phase preserved
- Average 2.0 angry per session (was 0.0) — pressure without frustration
- Score variance 12k-21.5k creates natural replay motivation
- Session 5 demonstrated "cascade" failure mode: combo break in tier 3 snowballs
- Bot serves 22.6 happy customers avg (was 21.4) — angry customers free tables faster

### Analysis Document
- PRESSURE_ANALYSIS.md: full diagnosis, 5 gameplay questions, top 10 pressure improvements

## v0.9.1 — Score Visibility + Scaled Rewards (2026-06-03)

### Score Now Visible
- HUD panel and all HUD text elevated to depth 3-4 (was depth 0, rendering behind wall at depth 1)
- Score font size: 17px → 21px
- Score flashes gold and scales 1.3× on every increment (was 1.1×)

### Reward Floats Scale with Combo Tier
- `showFloating()` accepts optional `sizeMult` parameter
- Payment floats: 20px at ×1-×2 | 25px at ×3 | 30px at ×4 | 36px at ×5
- Delivery floats: 20px at ×1-×2 | 23px at ×3 | 27px at ×4 | 32px at ×5
- A ×5.0 payout now LOOKS as big as it is

### Playtest Round 1 Complete
- 5 sessions: avg 23,276 score | 21.4 best combo | 0 angry customers
- Full analysis in PLAYTEST_ROUND_1.md

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
