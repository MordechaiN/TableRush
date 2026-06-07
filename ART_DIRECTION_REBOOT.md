# ART DIRECTION REBOOT
## TableRush — Visual Design Reference

_Not a summary of what was built. A prescription for what it must become._

---

## The Honest Comparison

### Why players choose Overcooked over TableRush

Overcooked communicates **chaos and delight** in a single screenshot. The characters are round, bright, exaggerated cartoon shapes on high-contrast environments. Every object has a strong silhouette — you know a pot from a plate from a chef from across a crowded screenshot. The color palette is saturated and bold: a fire station has red everywhere, a pirate ship has ocean blue, a sushi bar has clean white. Color IS the level. You don't need text to understand where you are.

TableRush shows a grid of brown rectangles on an amber floor. Correct. Functional. Invisible.

### Why players choose Cooking Fever over TableRush

Cooking Fever's primary visual message is **food that looks appetizing**. The first thing you see in any screenshot is a dish that makes you hungry. The restaurant has a theme (coffee shop, sushi bar, seafood restaurant) and every visual element reflects that theme. The serving counter reads as a physical barrier between you and the customer. Characters are cartoonishly expressive — their reactions are visible emotions you can read at a glance.

TableRush's food SVGs are functional labels, not appetite stimulants. The restaurant has no theme — it is "a restaurant in the abstract."

### Why players choose PlateUp over TableRush

PlateUp communicates **systems and mastery** — you can look at a PlateUp screenshot and see the logic of the layout, the flow of the kitchen. Dark stone counters against warm wood floors. Bright food items contrast against dark surfaces. Each ingredient is a distinct recognizable shape. The player character has a distinct silhouette (short, round, bright clothing) that pops against every background.

TableRush's navy waiter on an amber-brown floor disappears. There is no environmental contrast to pop against.

### Why players choose Good Pizza Great Pizza over TableRush

Good Pizza Great Pizza has **personality per customer**. Each customer face is memorable — you recognize them on repeat visits. The pizza is the visual star: detailed, customizable, appetizing. The restaurant feels lived-in and earned.

TableRush's customers are variants of a single character type. They're technically distinct but emotionally anonymous.

---

## 1. Visual Identity

**TableRush is an intimate candlelit restaurant at peak dinner service.**

Not a cartoony fast food kitchen. Not a clinical management simulation. A real restaurant — warm, slightly pressured, elegantly lit. The feeling of a Friday evening when every table is occupied and the kitchen is firing on all cylinders.

This identity demands:
- Rich, warm, dark surfaces (dark wood floors, mahogany tables, stone kitchen)
- Accent lighting that creates pools of warmth (candles, pendant lamps, kitchen heat lamps)
- Color contrast between zones (dark floor = characters and objects read clearly)
- Clean ivory tablecloths as the visual counterpoint to the dark environment
- A sense of space — the restaurant has depth, zones, a visible logic

**The screenshot a player sees should feel like looking down into a real restaurant.**

---

## 2. Character Design

### The Waiter (Player Character)
The waiter is the player's avatar. They must be the visually dominant character on screen at all times — not through size, but through contrast and clarity.

**Required:**
- Navy suit is correct but needs a crisp white apron that creates a bright anchor point
- The character should be the brightest white element on screen when in the dining room
- Movement should have personality — the walk cycle should communicate energy, not just locomotion
- Carrying food should change the character's visual pose/silhouette visibly
- The waiter's face should be readable at game scale — wide eyes, clear expression

**Wrong approach:** Make the waiter bigger.
**Right approach:** Give the waiter a white apron that makes them visible against any background.

### Customers
Each customer must be distinguishable at a glance by silhouette alone (like Overcooked — each chef reads differently from behind).

**Required:**
- Distinct silhouette per variant: Elegant (tall, narrow), Business (wide shoulders), Casual (relaxed), Trendy (large hat), Romantic (flowers), Elder (hunched, cane), Teen (cap)
- Bold single-color outfit per variant — not multiple colors competing
- Patience states must be readable from the character sprite, not just the patience bar
- A clearly visible speech bubble with food icon is the primary communication tool

---

## 3. Environment Design

### Floor
The floor is the canvas for everything. It must be:
- **Dark** — characters, tables, and customers all need to POP against it
- **Directional** — hardwood plank floors run horizontally, giving the camera perspective a clear top-down read
- **Material** — the floor should look like warm dark walnut, not a flat brown surface
- **Two zones** — dining floor and kitchen floor must be visually distinct materials

### Tables
Tables are the primary interactive object. They must read as furniture, not UI panels.
- Ivory/linen tablecloths against dark floor = immediate read as "table"
- Each table needs a focal point on its surface when empty (candle flame = alive, waiting, ready)
- The table state should be readable from the table itself — menu on table = "taking order", bill on table = "paying"

### Kitchen
The kitchen is a professional workspace, not just a labeled zone.
- Dark steel/stone floor differentiates it from the dining room
- Burners with visible flame = active, cooking
- Pass counter = physical barrier, feels like a real service window
- The kitchen should feel cooler (in color temperature) than the warm dining room

### Entrance / Queue Area
The entrance must read as "where people wait to be seated" without text labels. The current footprints and HOST sign are the wrong solution.

---

## 4. Restaurant Atmosphere

A restaurant has layers of lighting:
1. **Ambient** — the overall warm dim of a candlelit room
2. **Pendant** — specific pools of warm light from fixtures directly above each table
3. **Kitchen** — brighter, cooler light from the service area
4. **Accent** — warm glow from wall sconces, candles

Currently TableRush has one layer (ambient amber). It looks flat because there is no variation.

The correct implementation: dark floor + per-table warm glow pools + bright kitchen zone + dim walls. The player's eye naturally moves from bright kitchen (where food comes from) to illuminated tables (where customers are) to the dark entrance (where new customers arrive).

**Atmosphere is not decoration. It is information architecture.**

---

## 5. UI Direction

UI must be clearly separable from the game world. Currently both use the same warm amber/gold palette — the action arrows, the glow indicators, and the floor are all the same color family.

**Principle: UI speaks in a different visual language than the world.**

The world: warm amber, dark wood, candlelight glow.
The UI: clean white, bright accent colors (blue/orange/gold/red), high contrast.

Action indicators (arrows above tables) should feel like clean UI elements floating above a rich game world — not colored triangles that blend into the floor.

The HUD is currently the strongest UI element. Continue that language: dark pill containers, bright color-coded text, no decorative noise.

---

## 6. Color Language

### Restaurant Environment
| Element | Color | Why |
|---|---|---|
| Dining floor | 0x2E1E0F dark walnut | Creates contrast for everything above |
| Kitchen floor | 0x1E2523 cool slate | Signals "work zone, different material" |
| Tables | 0x8B4513 mahogany body + 0xF5F0E8 ivory cloth | Visible as furniture against dark floor |
| Walls upper | 0xBF7A42 warm terracotta | Frames the space |
| Walls lower | 0xEEE3D2 cream wainscoting | Separates floor from wall — reads as painted restaurant wall |
| Chairs | 0x5C3317 dark mahogany | Consistent with tables |

### Lighting
| Element | Color | Why |
|---|---|---|
| Pendant lamp pools | 0xFFBB44 warm amber, 7% opacity | Candle-adjacent warmth |
| Kitchen work light | Cooler white tint in kitchen zone | Contrasts with dining warmth |
| State glow: seated | 0xFFEE88 warm yellow | Candlelit occupied table |
| State glow: paying | 0xFFD700 gold | High-value attention needed |
| State glow: dirty | 0xFF4400 orange-red | Urgent, needs cleanup |

### UI / Game State
| Element | Color | Why |
|---|---|---|
| Requesting arrow | 0x3498DB blue | Information — "come here" |
| Urgent arrow | 0xE74C3C red | Alarm — "customer leaving" |
| Paying arrow | 0xFFD700 gold | Reward — "collect money" |
| Kitchen ready | 0x22CC55 green | Action — "food is done" |
| Combo ×1 | 0xD4AA55 warm gold | Baseline — present but not active |
| Combo ×3+ | Bright orange → red | Escalating energy |

---

## 7. Animation Style

Animation serves one purpose: communicating game state, not demonstrating technical capability.

**Required animations (currently missing or insufficient):**
- Waiter carrying food: visible forward lean, tray held high
- Customer impatient: visible fidgeting that reads at character scale
- Food delivered: appetite-stimulating visual (food "lands" on table with impact)
- Table going dirty: visible moment of transition (quick overlay appearance)
- Payment collected: satisfying "collection" feel (coins move toward score)

**What animations must NOT do:**
- Camera shakes for routine events (should be reserved for exceptional moments)
- Floating text for every interaction (reserve for scoring events only)
- Screen flashes that obscure gameplay

---

## 8. Emotional Moments

The game must create at least 3 types of emotional moments per session:

**Satisfaction** — serving a customer exactly when their patience bar is at 10% and watching it resolve. The visual: patience bar flashes, customer face lights up, score pops big.

**Flow** — managing 3+ tables simultaneously without looking at indicators, operating on pattern recognition. The visual: clean screen, all tables at mid-patience, smooth waiter movement.

**Panic** — two customers at <10% patience, food ready in kitchen, third customer at the door. The visual: red arrows pulsing, red glow pools expanding, timer in danger color.

These three states need to be visually distinct. Currently Satisfaction and Flow look identical. Panic looks slightly different but uses the same color language as everything else.

---

## 9. Screenshot Appeal

A commercial screenshot must communicate the game experience in under 2 seconds.

**What the screenshot must show:**
1. "This is a restaurant" (environment read)
2. "I control someone serving tables" (player character visible and active)
3. "There are multiple things happening" (implied complexity/depth)
4. "It looks like fun" (warmth, color, movement implied)

**Current screenshot fails:**
1. ✓ Environment read is clear (tables visible)
2. ✗ Player character is hard to locate (blends into floor)
3. ✗ Only 1 customer typically visible (looks shallow)
4. ✗ Warm but muddy — no emotional read ("fun" vs "productivity tool")

**Required for commercial screenshot:**
- Dark floor so waiter pops immediately
- Multiple customers at different states simultaneously
- Kitchen with visible flame and food on counter
- At least one large score pop or combo indicator active
- Warm candlelight glow on tables

---

## 10. Commercial Presentation

### App Store / Play Store
A player is making a 3-second decision. They see a thumbnail, then a screenshot.

**Thumbnail test:** Can the game be identified as a restaurant game from a 120×120 pixel icon? Currently: the plate_badge SVG with "TABLE RUSH" — passes marginally. A screenshot-based thumbnail of a dark-floor restaurant with warm candlelit tables would be far more evocative.

**Screenshot test:** The first screenshot must show gameplay, not a menu. The gameplay screenshot must be visually exciting — a moment of organized chaos, multiple states active, food visible.

**Current verdict:** Would not stop scrolling. The screenshot communicates "functional" not "desirable."

### Steam
Steam players are sophisticated. They read screenshots for visual quality signals.

**Quality signals TableRush needs:**
- Dark, rich environments (currently too light/muddy)
- Recognizable art style (currently "Phaser prototype" not "indie game")
- Visible characters with personality (currently functional avatars)
- UI that feels intentionally designed (HUD is close — rest is not)

**Current verdict:** Would be categorized as "prototype" or "educational project" by most players.

### After the 5 Fixes
A dark walnut floor alone transforms the category from "prototype" to "polished indie." Everything reads better against dark. The waiter's navy suit pops. The ivory tablecloths glow. The candle light pools become atmospheric. The kitchen's cool slate reads as professional.

The goal is not to look like Overcooked. The goal is to look like **TableRush** — a specific, coherent visual world that is its own thing.

---

## The 5 Highest-Impact Visual Problems

Ranked by first-impression commercial impact:

### 1. The floor is amber mud (CRITICAL)
The 70×70 amber checkerboard tiles cover 80% of the screen. Everything above them — tables, customers, waiter — is also amber/brown. No contrast. The waiter disappears. Tables disappear. It reads as a prototype placeholder.

**Fix:** Dark walnut hardwood plank floor. Every other element immediately reads better.

### 2. Kitchen and dining room have no visual grammar (HIGH)
They look like the same zone with different labels. A restaurant has immediate visual logic: you walk in, floor says "dining room," step through the pass, floor says "kitchen." Currently both feel the same.

**Fix:** Cool slate tile floor in the kitchen zone.

### 3. Walls don't separate from the floor (HIGH)
The side wall lower section (0x9A5C28 dark brown) is the same color family as the floor (0xC4813A amber). There is no clear visual horizon between floor and wall. It looks like the restaurant extends indefinitely in the wrong direction.

**Fix:** Warm cream wainscoting on the lower wall section.

### 4. Ambient lighting is mispositioned (MEDIUM)
Three pendant lamp glow pools all fall at y=320 in a horizontal band. Tables 3, 4, 5 (at y=440, y=570) receive no candlelit ambiance. The lighting is inaccurate to the actual table positions, which creates an unconscious "something is wrong" feeling even if players don't identify the cause.

**Fix:** Five per-table glow pools accurately positioned under each table.

### 5. The service counter blends into the dark kitchen (MEDIUM)
The counter is 0x241610 (near-black) against the kitchen's dark background. On the current amber floor it reads fine. After the floor goes dark, the counter front face must be lighter to maintain the physical barrier read between kitchen and dining room.

**Fix:** Warmer, lighter granite top + brighter mahogany face panel on the service counter.
