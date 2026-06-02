# VISUAL REBOOT PLAN — TableRush

**Status:** AWAITING APPROVAL — no implementation until approved
**Date:** 2026-06-02
**Purpose:** Complete visual identity rebuild. The gameplay loop works. The presentation does not. This document defines what we build next.

---

## SECTION 1 — CURRENT VISUAL INVENTORY

Every visual element in the game as it exists today.

---

### 1.1 Main Menu

- **Background:** The game's checkerboard floor pattern (FLOOR_WARM `#F5E6C8` / FLOOR_ALT `#EDD9A3`) — the exact same floor used during gameplay
- **Logo:** "TABLE" on one line, "RUSH" on another — Arial Black text, white/orange. No logo treatment, no background, no visual anchor
- **Decorative emojis:** 🍔 and 🍕 as text objects flanking the logo
- **Tagline:** "Fast-Paced Restaurant Service" — small gray Arial text
- **Stats bar:** Gray rounded rectangle. Shows 🏆 highScore | Level N. Separator is a vertical pipe `|`
- **Best stars:** Small text below stats bar if stars exist
- **Buttons:** Orange (PLAY) and green (SETTINGS, CREDITS) — `makeBtn()` renders a colored rectangle with white Arial Black text
- **Footer:** "v0.2.0" version text at bottom (still shows v0.2.0)

---

### 1.2 HUD (In-Game Top Bar)

- **Panel:** `hud_panel` texture — a flat rectangle with subtle gradient. Not visible as a distinct UI element
- **Score:** 🍽️ emoji + number. Arial Black. Dark color
- **Combo:** 🔥 ×N when active; **invisible when at ×1.0** — player never knows the combo system exists until they reach ×1.5
- **Timer:** M:SS format. Turns red under 30s
- **Pause button:** ⏸ text emoji. Desktop only, no touch equivalent

---

### 1.3 Kitchen

- **Counter texture:** 460×80px procedural. Dark granite surface. Left "cooking zone" has warm tint. Right "ready zone" has cool tint. Two burner rings
- **Pot silhouette:** Left front burner. Rim, body, knob, handles
- **Pan silhouette:** Right back burner. Body, rim, long handle
- **Zone labels:** "COOKING" (orange, Arial Black) and "✓ READY" (green, Arial Black) text overlays above the counter
- **Steam particles:** White circles (0.25–0.4 alpha) that float up and fade. Only visible when cooking
- **Ticket rail:** Container holding 1–N ticket objects. Each ticket: `ticket` texture (tan rectangle) + food emoji text + progress bar (green→orange) + ✓ badge when ready
- **Kitchen glow:** Orange `strokeRoundedRect` 4px border around kitchen area. Tweens alpha. Currently invisible in practice
- **Menu board:** `menu_board` texture above kitchen. Dark green chalkboard in wooden frame. "TODAY'S MENU" header + food emoji row

---

### 1.4 Tables (×5)

- **Table texture:** 110×76px. Mahogany brown body with tablecloth section. Checkered linen pattern (8×8 grid of 0.5-alpha `#EEE8DF` squares over white)
- **Shadow:** Black ellipse at y+8, 110×30px, 0.15 alpha
- **Candle:** `candle` texture (12×22px) placed at top-right corner of each table
- **Pulse ring:** `strokeRoundedRect(-55, -38, 110, 76, 10)` — 4px line. Colors: red/gold/orange/blue/gray depending on state. Tweens between ~0.5 and ~0.1 alpha. **Not visually detectable in practice**
- **Dirt icon:** 🧹 emoji text at top-right when dirty. Visible but small
- **Cleaning progress bar:** Track (gray, 0.3 alpha) + fill (green). 60×7px at y+28. Appears during cleaning

---

### 1.5 Customers (×7 variants)

All generated procedurally in BootScene. Sprite size: **32×52px**.

- **Body structure:** Head circle (r=10) at pixel (16,10). Body rectangle. Leg rectangles. Arms (2px wide)
- **Skin tone:** `#FDBA8C` for all variants
- **Head outline:** 1.5px `#3C2010` strokeCircle
- **Body outline:** 1.5px strokeRect
- **Ears:** 3px filled circles at (6,11) and (26,11)
- **Eyes:** 1.5px dark circles. Fixed positions
- **Mouth:** Arc or rect depending on mood
- **Variant accessories:**
  - Casual: clean silhouette, green outfit
  - Elegant: necklace arc + pendant, collar wings, red outfit
  - Business: wider shoulders, red tie, dark blue outfit
  - Trendy: sunglasses extending past head edges, orange outfit
  - Romantic: flower on hair extending right, purple outfit
  - Elder: white/gray hair, short legs, glasses with temples, teal outfit
  - Teen: cap with brim, yellow/red outfit
- **Patience bar:** 36×5px pill at y=−42. Green→orange→red. Very small
- **Eating bar:** 36×4px at y=+30. Green
- **Speech bubble:** Warm cream fill, colored border, Back.easeOut pop-in. At y=−66
- **Angry overlay:** Red fill on head bounds when angry

---

### 1.6 Waiter (Player)

Generated procedurally. Sprite size: **40×62px** (+ `player_walk` variant with stride legs).

- **Structure:** Head circle (r=12) at pixel (20,14). Navy jacket body. Legs. White apron overlay. Apron pocket detail
- **Skin:** `#FDBA8C`
- **Ears:** At (8,14) and (32,14)
- **Head + body outlines:** 1.5px dark brown
- **Emotion system:** Face redrawn per emotion state (neutral/happy/proud/stressed/excited). Eyes and mouth change
- **Emotion badges:** Emoji floats above head momentarily on state change (😊 🤩 😰 😤)
- **Carry display:** Tray (y=−44) + plate bg `food_plate` 26×26 (y=−55) + food emoji text (y=−53)
- **Walk animation:** Alternates `player` / `player_walk` textures every 160ms while walking
- **Busy feedback:** Red tint flash + shake + "BUSY!" floating text

---

### 1.7 Food

- **In speech bubbles:** Single emoji character (🥗 🍔 🍝 🍣 🍕) rendered as text
- **On kitchen tickets:** Same emoji text
- **Carried by waiter:** `food_plate` texture (white circle r=13 with inner rim) + emoji text on top
- **No unique food art.** All food is OS-rendered emoji — appearance differs by platform/OS

---

### 1.8 Speech Bubbles

- **Shape:** Rounded rect (56×36px body) with downward tail (tip at y=−46 in container)
- **Fill:** Warm cream `#FFF8F0`
- **Shadow:** Offset +2,+2, black 0.15 alpha
- **Border:** 1.5px colored line (blue=❓, orange=food, gold=payment, red=angry)
- **Content:** Emoji or text. Font size 20px for single emoji, 11px for payment string
- **Animation:** `setScale(0)` → Back.easeOut to scale 1. Only on first appearance
- **Pulse:** ❓ bubble has infinite scale yoyo (0.92–1.08) while requesting
- **All variants use the same shape and size** — only border color distinguishes states

---

### 1.9 Floating Labels

- **Score pop:** "+N" floating text. Orange. Arial Black 20px. Scale punch then float up + fade
- **Speed bonus:** "⚡ LIGHTNING" etc. Gold
- **Penalty:** "−N 😠" Red
- **Clean:** "✨ Clean!" Green
- **Busy:** "BUSY!" Red
- **Combo announcements:** Slide in from right, Arial Black, scale based on combo tier

---

### 1.10 Game Over Screen

- **Background:** Same FLOOR_WARM checkerboard
- **Panel:** `panel` texture (flat rectangle)
- **Header:** "🏆 NEW RECORD!" or "ROUND COMPLETE!" Arial Black 28px
- **Stars:** ⭐ emoji text characters. Scale-punch animation on appear
- **Score:** Large Arial Black number, animated from 0
- **Best score** (if beaten): comparison text
- **XP section:** "XP EARNED +N" + animated fill bar + level text
- **Level up:** Gold flash text if level gained
- **Stats:** Combo record, customers served, happy percentage
- **Next unlock hint:** Small text at bottom
- **Buttons:** PLAY AGAIN (orange) and MAIN MENU (green)

---

### 1.11 Pause Screen

- **Semi-transparent dark overlay**
- **"PAUSED" text**
- **RESUME and MAIN MENU buttons**

---

### 1.12 Settings Screen

- **Background:** FLOOR_WARM
- **Title:** "SETTINGS" Arial Black
- **SFX / Music toggles:** Button-toggle UI elements. They do nothing (no audio)
- **Reset High Score:** Red button
- **Back button**

---

### 1.13 Credits Screen

- **Background:** FLOOR_WARM
- **"CREDITS" title**
- **Plain text:** Game concept by Mordechai Neeman, Implementation by Claude Code
- **Back button**

---

### 1.14 Environment / Restaurant

- **Floor:** Checkerboard FLOOR_WARM / FLOOR_ALT. Grout lines (1px, 0.45 alpha)
- **Wall:** WALL_ACCENT (`#C17B3A`) rectangle top 90px
- **Wainscoting:** Thin orange-brown lines at wall base
- **Wall trim:** Single rectangle `#9B6020`
- **Wall art:** `wall_frame` textures (60×50px, simple painting). 2 frames
- **Pendant lamps:** 3 procedural lamps drawn in Graphics. Cord + shade + bulb + floor light pool
- **Plants:** 🪴 emojis (large, near entrance) + 🌿 emojis (small, near kitchen)
- **Entrance:** 🚪 emoji + brown mat rectangle
- **Candles:** `candle` texture at each table corner

---

## SECTION 2 — PROBLEM ANALYSIS

Why each element feels cheap and hurts retention.

---

### 2.1 Main Menu — Why It Fails

**Problem: The menu is a game screen wearing a menu costume.**
The background is the gameplay floor. The player enters the game from what looks like the game itself — no transition, no welcome, no sense of "you are about to enter somewhere."

- Logo is Arial Black text. No brand. No icon. No visual weight. It could be any app.
- Decorative emojis (🍔 🍕) as positioned text objects are not logos — they're placeholder icons.
- Buttons are Bootstrap-style colored rectangles. Functional, not inviting.
- No character on the main menu. The game is about a waiter — the waiter should be here.
- Version number `v0.2.0` visible to all players. Communicates "work in progress."

**Retention impact:** First impression establishes category. Current impression: internal tool, not commercial game. Players who encounter this after being referred by a friend will feel uncertain — "is this finished?"

---

### 2.2 HUD — Why It Fails

**Problem: No visual hierarchy. Everything is the same weight.**

- The score, combo, and timer are all the same font size on the same bar.
- Combo is INVISIBLE at ×1.0. Players can serve 15 customers and never know the combo system exists.
- The 🍽️ emoji in the score is OS-rendered and looks different on Android vs iOS vs desktop.
- The HUD panel blends into the wall area behind it — there is no clear separation between "information UI" and "game world."
- No visual feedback when the score increases while the player is looking elsewhere.

**Retention impact:** The combo is the game's main retention hook — it creates the "one more round" feeling. If the player never discovers it, they have no reason to care about their performance. An invisible combo kills retention.

---

### 2.3 Kitchen — Why It Fails

**Problem: The kitchen reads as a gray rectangle with text labels.**

- The granite texture with pot/pan silhouettes is programmer art — the shapes are recognizable but feel like debug outlines.
- "COOKING" and "READY" text labels over the kitchen are pure UI — they break immersion.
- Ticket rail tickets are 40×40px containers with 22px food emoji — tiny and cluttered at 3+ orders.
- The orange glow border (4px strokeRoundedRect) is the primary "kitchen is ready" signal but is invisible. Validated.
- Steam particles (white circles that float up) are charming in concept but at 0.25 alpha they are barely visible against the cream wall.
- The chalkboard menu board is visually nice but poorly integrated — it floats above the kitchen with no sense of attachment to the wall.

**Retention impact:** The kitchen is the single most important area in the game. Every action flows through it. If it reads as a gray box, the player has no emotional relationship with the place they're working in.

---

### 2.4 Tables — Why It Fails

**Problem: The tables are state machines pretending to be furniture.**

- All 5 tables are pixel-identical. No personality, no numbering, no spatial identity. Players cannot build mental maps ("I need to go to the round table in the corner").
- The checkered linen pattern looks like a CSS `repeating-linear-gradient` test pattern, not a real tablecloth.
- The pulse ring system — the entire mechanism for communicating urgency — is a 4px line at 0.035–0.5 alpha. Validated as invisible.
- Small candle in the top-right corner reads as a yellow dot. Decorative only.
- The cleaning progress bar (60×7px at the bottom) is so small it's missed.

**Retention impact:** Tables are the canvas for all player decisions. Invisible status signals mean players can't tell at a glance what needs attention. Urgency requires contrast. No contrast, no urgency, no retention.

---

### 2.5 Customers — Why It Fails

**Problem: 32×52px sprites are too small to communicate emotion or personality.**

- The characters are tiny. On a mobile screen, each customer is roughly 6–8mm tall. At that size, the face details (1.5px eyes, arc mouths) are barely visible even when looking directly at them.
- The 7 variants are color variations with minor accessories. At 32px wide, the accessories (a flower, a tie, sunglasses) are 2–4px details. They are not distinct.
- No names displayed. "The business guy at table 3" is not a person — they are a colored timer.
- Patience bar at 36×5px is smaller than a line of text. The single most important gameplay readout in the game is nearly invisible.
- The face expressions (happy, hungry, angry, neutral) change correctly but the faces are 10px circles — the expressions are not readable at play distance.

**Retention impact:** Characters are the emotional core of any service game. If the customers feel like colored rectangles, the player has no empathy for them. No empathy = no satisfaction when served, no regret when they leave angry. No emotional stakes = no retention.

---

### 2.6 Waiter — Why It Fails

**Problem: The player character is a 40×62px navy rectangle with a face.**

- At 40px wide, the waiter is barely distinguishable from a customer at a glance.
- The navy + beige color combination is "generic restaurant uniform," not a character.
- The emotion system works correctly in code but the face is 10px — expressions are invisible during play.
- The emotion badges (😊 🤩) are emoji text that float and disappear — they happen too fast and are too small.
- The 2-frame walk animation with 160ms toggle is visually jarring — it looks like the sprite is twitching, not walking.

**Retention impact:** The player identifies with the waiter. If the waiter feels like a generic token, the player has no investment in their character's success or failure.

---

### 2.7 Food — Why It Fails

**Problem: OS-rendered emoji are not art assets.**

- 🥗 🍔 🍝 🍣 🍕 on iOS look different from Android which look different from desktop Chrome.
- The presentation is inconsistent across platforms.
- Food has no visual representation beyond the emoji — no plate styling on the customer table, no serving theater.
- On the `food_plate` texture (26×26 white circle), the food emoji sits on top but does not integrate — it looks like an emoji floating on a circle.

**Retention impact:** Food presentation is a major emotional moment in the service cycle. Currently it is an emoji swap with no weight.

---

### 2.8 Speech Bubbles — Why It Fails

**Problem: All states look the same. Only border color distinguishes them.**

- The ❓ bubble, food bubble, payment bubble, and angry bubble are all the same shape and size.
- Distinguishing border colors (blue, orange, gold, red) are visible but subtle.
- The bubbles are 56×36px — reasonable size but the information hierarchy inside them is weak.
- Emoji in bubbles at 20px renders at different sizes on different OS.
- The paying bubble "💳 $18" uses 11px font for the price — unreadable from a playing distance.

**Retention impact:** Bubbles are the primary customer state indicators. If the player has to squint to read the state, they're reacting slowly. Slow reactions feel like bad game design, not player error.

---

### 2.9 Game Over Screen — Why It Fails

**Problem: Reward screen feels like a statistics page.**

- The layout is a vertical list of numbers: score, XP, level, customers served.
- Stars are three ⭐ text emoji objects. No celebration animation, no scale pop that matches the moment.
- "ROUND COMPLETE!" is in the same font as everything else on the menu. No visual weight to the achievement.
- The XP bar animation is good but surrounded by a flat layout that makes it feel routine.
- No emotional climax. A perfect round and a terrible round show the same screen with different numbers.

**Retention impact:** The end screen is the last thing the player sees before deciding whether to play again. If it makes the round feel administrative, they won't want another round.

---

### 2.10 Environment — Why It Fails

**Problem: The restaurant feels like a floor plan, not a place.**

- The checkerboard floor is geometrically correct but emotionally neutral. It is the same pattern in every scene.
- The wall is a brown rectangle. No texture, no depth, no warmth beyond the color.
- Pendant lamps are drawn in Graphics — the trapezoid shapes are recognizable as lamps but feel like programmer illustrations.
- The wall frames (60×50px painted rectangles) are invisible at normal play size.
- The plants (🌿 emoji text) are the only non-procedural environmental elements and they look pasted on.
- There is no depth to the scene. Every element is flat and at the same z-plane visually.

**Retention impact:** The restaurant is where players spend 3 minutes of their life, every session. If it feels like a test environment, they will not want to return to it.

---

## SECTION 3 — THREE ART DIRECTIONS

---

### DIRECTION A — MODERN MOBILE

**Concept:** A polished, professional casual mobile game. Think Diner Dash (modern), Good Pizza Great Pizza, Square's restaurant series. Clean vector art, intentional typography, UI that looks designed rather than coded.

**Mood board reference:** Bright, saturated accents on dark or neutral backgrounds. Information-first design. UI has depth and glass effects.

**Color palette:**
```
Background deep:     #1A1025  (dark aubergine)
Surface primary:     #2D1B4E  (deep purple-navy)
Surface raised:      #3D2863  (medium purple)
Accent orange:       #FF6B35  (hot orange — keep from current)
Accent teal:         #00BFA5  (vibrant teal)
Gold:                #FFD54F  (warm gold)
Text primary:        #FFFFFF
Text secondary:      #B0B8CC
Green success:       #69F0AE
Red danger:          #FF5252
```

**UI examples:**
- HUD: Floating translucent panels with blur backdrop (`background: rgba(0,0,0,0.4), backdrop-filter: blur`). Score in large white type. Combo displayed in a glowing pill that becomes visible at any level
- Buttons: Dark surface with bright border highlight. Hover/press states that feel tactile
- Score display: Large white numbers on dark backgrounds — maximum contrast
- Timer: Circular countdown ring rather than text

**Customer style:**
- Clean vector characters, flat-shaded with a single subtle shadow
- Larger heads (30–35px on a 50×80px sprite)
- Bold outlines (2.5px black) — readable at any size
- 3–4 solid colors per character, no gradients
- Distinct silhouettes: tall, wide, round, angular

**Table style:**
- Dark wood top with clean edge
- White tablecloth as a defined shape (not checkered — a solid white rounded rectangle with a thin shadow)
- State indicator: full-color GLOW underneath the table (not a border ring) — a soft radial gradient that changes color by state. Highly visible at any size
- Table numbers in small text

**Kitchen style:**
- Stainless steel counter with clean highlight line
- Ticket system: vertical slots instead of a horizontal rail — clearer queue
- Order ready: Entire "READY" zone lights up in teal, hard to miss
- No text labels — icon language only (flame icon, ✓ icon)

**Menu style:**
- Clean card-based design with food photography placeholders
- Dark background with light text
- Price in gold

**HUD style:**
- Floating pill UI at top. Score on left, timer on right (always visible), combo center (always visible even at ×1.0 — shows ×1.0 grayed out so players know the system exists)
- Thin colored line at very top of screen that fills from left to right as the round progresses

---

### DIRECTION B — COZY RESTAURANT

**Concept:** A warm, hand-crafted feeling restaurant. Think Unpacking, Cozy Grove, A Short Hike. Soft colors, visible texture, the feeling that someone drew every detail by hand. The restaurant feels lived-in.

**Mood board reference:** Watercolor wash backgrounds. Visible brush texture. Warm ambers and creams. Light feels like candlelight. Characters are round and soft.

**Color palette:**
```
Wall:               #8B3A2A  (deep terracotta)
Floor:              #D4A574  (warm oak wood — planks, not tiles)
Surface cream:      #FAF0E6  (linen)
Tablecloth:         #FFFFFF  with #E8D5B7 shadow
Accent rust:        #C0392B  (deep restaurant red)
Accent gold:        #B8860B  (dark gold)
Accent sage:        #7D9F76  (muted sage green)
Text warm dark:     #3C1F0F
Text cream:         #F5E6D3
Wood accent:        #6B4226
```

**UI examples:**
- HUD: Wooden sign aesthetic. The score is on a hanging wooden placard (with a subtle sway tween). Timer in a clock face
- Buttons: Rounded, padded with a wood-grain texture. Pressed states have a satisfying "thunk" (visual depression)
- Combo: Chalk writing on a small blackboard strip in the HUD
- Speech bubbles: Slightly rough edges, like hand-cut paper. Not perfectly round corners

**Customer style:**
- Chibi proportions: head 40% of total height, very round
- Hand-drawn outline look: 2px warm brown outline
- Soft shading: characters have a single warm highlight on the upper-left
- Named on arrival: small name plate appears as they sit (Sofia, Marco, Nonno, etc.)
- Expressive idle animations: gentle swaying, looking around

**Table style:**
- Round tables (not rectangular) for a more natural restaurant feel
- Wood texture with cloth on top
- State indicator: The tablecloth CHANGES COLOR subtly — a warm yellow tint for requesting, a golden glow around the edge for paying. Soft, not harsh
- Flower vase at each table (small detail that makes it feel real)

**Kitchen style:**
- Farmhouse kitchen aesthetic — warm brick backdrop, copper pots
- Chalkboard menu as the primary kitchen UI
- Orders displayed as handwritten chalk notes on the board, not printed tickets
- Ready state: A "ding" visual (bell shape) appears + the note gets circled in chalk

**Menu style:**
- Handwritten chalkboard font for all menu items
- Food items have small hand-drawn illustrations (pasta swirl, burger outline)
- Categories separated by chalk underlines

**HUD style:**
- Wooden frame around the whole screen (like a picture frame or chalkboard frame)
- Score on a small wooden sign hanging in the top-left
- Timer in a round clock face, top-right
- Combo on a small ribbon banner at the top-center

---

### DIRECTION C — STYLIZED CARTOON

**Concept:** High-energy cartoon game in the spirit of Overcooked, Fall Guys, and early Disney shorts. Bold black outlines, flat colors, exaggerated proportions, maximum expressiveness. The game looks like it's having FUN.

**Mood board reference:** Overcooked 2, KeyWe, Fall Guys. Loud primary colors. Big shapes. Everything has a personality.

**Color palette:**
```
Floor warm:         #F9E4B7  (warm cream — keep, but cleaner)
Wall background:    #D45E3E  (bold terracotta-red)
Wall trim:          #8B2500  (dark red-brown)
Table wood:         #A0522D  (keep, but with bold outline)
Table cloth:        #FFFFFF  
UI orange:          #FF6B35  (keep)
UI yellow:          #FFE135  (brighter gold)
UI green:           #2ECC71  (cleaner green)
UI red:             #E74C3C  (punchy red)
UI blue:            #3498DB  (clear blue)
Outline black:      #1A1A1A  (near-black — all outlines)
Skin:               #FFCB9A  (lighter, cleaner skin)
Text white:         #FFFFFF
Text dark:          #1A1A1A
```

**UI examples:**
- HUD: Big bold cards for score and timer. Score card has a plate icon. Timer card has a clock icon. Both have thick black outlines. Combo display is ALWAYS VISIBLE — at ×1.0 it shows "×1" in a neutral gray, so the player always knows the system
- Buttons: Big, rounded, thick outlined, with a slight drop shadow. Pressing them causes a visual squish
- Everything has a 2.5–3px black outline — no element is ambiguous

**Customer style:**
- Head = 50% of total sprite height (massive chibi ratio)
- Cartoon eyes: big circles with pupils, very expressive
- 2.5px black outlines on everything
- Strong silhouettes: the business guy has a briefcase and square shoulders; the romantic has a giant bouquet; Nonno has an enormous mustache
- Named and typed on arrival: "MARCO — Impatient!" slides in as a small banner
- Idle animations: bouncing, looking at watch, tapping fingers

**Table style:**
- Bold outlined rectangle with rounded corners
- Tablecloth as a clean white area with visible fold lines
- **State indicator: A large COLORED ARROW (▼) pointing down to the table from above.** Always visible. Never tweened below 70% alpha. Changes color by state: blue=requesting, orange=kitchen_ready, gold=paying, red=urgent. This replaces the invisible pulse ring entirely
- Arrow pulses by SCALING (0.9–1.1) not by alpha — scale changes are visible at any size

**Kitchen style:**
- Bright, bold. Counter has a thick black outline
- Ticket system: Cards with food emoji + large progress bar. Cards are 80×60px instead of current tiny size
- Ready state: Entire ready zone turns bright green. Big ✓ icon. Unmissable
- Flames visible on active burners when cooking
- A large bell icon (🔔) appears and shakes when the first order is ready

**Menu style:**
- Bright diner sign — red background with yellow text
- Menu items with cartoon food icons (drawn, not emoji)
- Prices in big numbers

**HUD style:**
- Score: Big white number on orange pill background. Left-anchored. Always big
- Timer: Big white number on dark pill background. Right-anchored
- Combo: Center pill — ALWAYS VISIBLE. Shows "×1.0" in gray when no combo, transitions to orange ×1.5, red ×2.0, gold ×3.0. The pill GROWS in size as the combo increases
- All three elements have thick black outlines

---

## SECTION 4 — THE CHOSEN DIRECTION

**DIRECTION C — STYLIZED CARTOON**

### Why

**1. It solves the validation problem directly.**

The single largest failure identified in Phase 1 validation was that the priority system's visual expression is invisible. Direction C replaces the invisible 4px alpha ring with a **large colored arrow above the table** that is always ≥70% alpha and pulses by scale (not alpha). This is an architectural fix disguised as an art direction. The other directions still use glow/ring-based indicators which have the same failure mode.

**2. Overcooked is the closest reference — and Overcooked works.**

TableRush is a fast-paced service game where the player juggles multiple spatial tasks simultaneously. The most successful game in this exact genre is Overcooked, which uses stylized cartoon art. The correlation is not coincidence: bold outlines, exaggerated characters, and flat bright colors maximize information density on small mobile screens.

**3. Bold outlines solve the readability problem at the root.**

Every current visual readability failure (invisible pulse rings, tiny patience bars, unreadable customer faces, invisible kitchen glow) shares the same root cause: lack of contrast between important elements and the background. Black-outlined flat cartoon art creates maximum contrast by definition. The outline guarantees separation from any background color.

**4. It is the most expressive at small sizes.**

Customer sprites are 32×52px. At that size, the only features that communicate are large shapes and strong outlines. A 3px black circle around an eye is visible. A 1.5px brown-tinted circle is not. Direction B's hand-painted watercolor style requires larger canvas sizes to communicate texture. Direction A's dark backgrounds may not render well in Phaser's procedural texture system.

**5. The cartoon direction preserves the warmth of the current palette.**

Direction C keeps FLOOR_WARM cream, keeps mahogany brown for tables, keeps the orange/gold/green/red UI palette. The change is not the colors — it is the boldness of their application. The restaurant still feels warm; it now also feels ALIVE and readable.

**6. It is achievable with Phaser procedural textures.**

Flat colors + thick black outlines + simple geometric shapes are the exact output of `scene.make.graphics() → generateTexture()`. The cartoon direction requires no external art assets and no dependency on OS emoji rendering.

### Why not Direction A

Direction A (Modern Mobile) requires a dark background to make the saturated neon accents pop. Dark backgrounds in a daytime restaurant game feel wrong and would require a fundamental scene redesign. The glassmorphism effects are not achievable in Phaser procedural textures at reasonable performance.

### Why not Direction B

Direction B (Cozy Restaurant) is emotionally correct — it aligns with the existing warmth — but it faces the same readability problems as the current design. Soft, muted, textured art looks beautiful but communicates poorly at small sizes and fast reading speeds. The "subtle tablecloth glow" state indicator in Direction B is the same failure as the current pulse ring. The cozy aesthetic and the "urgency" gameplay mechanic are in fundamental tension: cozy things are soft and quiet; urgency requires loud and sharp.

---

## SECTION 5 — IMPLEMENTATION ROADMAP

Ordered by player impact. Each item can ship independently without breaking existing functionality.

---

### PRIORITY 0 — Fix the Single Biggest Validation Failure

**Action indicator redesign (Table.ts + BootScene.ts)**

Replace the invisible `strokeRoundedRect` pulse ring with a visible state indicator system:

1. **Above-table colored arrow** (▼): a bold downward-pointing arrow, 30×20px, drawn with a 2.5px black outline. Placed at y=−55 (above the patience bar).
   - Blue: requesting
   - Orange: kitchen_ready / primary carry destination
   - Gold: paying
   - Red: urgent
   - Invisible: empty or eating states

2. **Arrow pulse behavior:** Tweens `scale` between 0.9 and 1.1 (not alpha). Scale changes are always visible. The indicator is never drawn below 0.6 alpha.

3. **Primary vs secondary:** Primary arrow is full size (scale base 1.0). Secondary arrow is drawn at 50% size (scale base 0.5).

4. **Kitchen glow redesign:** Replace 4px strokeRoundedRect with a solid `fillRect` on the kitchen counter surface — a bold orange or green band that fills the "READY" zone when an order is ready. Always visible.

**Result:** Phase 1's goal ("obvious next action") is visually achieved.

---

### PRIORITY 1 — Customer Redesign

**Goal:** Make customers feel like people at a glance.

1. **Increase sprite size to 48×72px** (up from 32×52px). All face details become 50% larger.
2. **Increase head to 40% of height** — head circle r=14 (up from r=10).
3. **Replace 1.5px outline with 2.5px near-black outline** on head, body, and all accessories.
4. **Increase eye size** to r=3 circles (up from r=1.5). Add white highlight dot.
5. **Mouth arcs** at r=5 (up from r=4) — visibly different happy vs neutral vs angry.
6. **Patience bar** scaled to 44×8px (up from 36×5px). More visible. Red zone more obvious.
7. **Name banner on arrival:** small text badge "MARCO" that appears as the customer sits, fades after 2s.

**Variants redesigned with bold silhouette-first approach:**
- Business: oversized square shoulders, thick tie, briefcase in hand
- Elegant: tall narrow proportions, prominent necklace, elaborate hair
- Teen: giant cap brim, earbuds hanging
- Elder: large distinctive white mustache/hair, slight stoop posture
- Romantic: large flower bunch clutched at side
- Trendy: oversized sunglasses (4px thick), distinctive hair
- Casual: round, friendly, nothing distinguishing — the "default" customer

---

### PRIORITY 2 — Waiter Redesign

**Goal:** Player character feels like a star, not a token.

1. **Increase sprite to 52×80px** (up from 40×62px).
2. **Head to r=16** — face features at double the current size.
3. **Signature look:** Crisp white apron over any jacket color. Signature item. Unmistakable silhouette.
4. **3-frame walk animation** — add a third frame (mid-stride) to smooth the twitchy 2-frame loop.
5. **Emotion face redesign:** Eyes are 4px circles with pupils. Smiles are 6px arc. Angry brow is a distinct thick stroke. Visible from 5m away on a phone screen.
6. **Carry display:** Food emoji enlarged on the plate. Add a small steam wisp rising from it.

---

### PRIORITY 3 — HUD Redesign

**Goal:** Score/combo/timer are always legible and always communicate the system.

1. **Combo always visible:** Show "×1" in gray when no combo — player knows the system exists from round 1.
2. **Combo pill grows:** At ×1.5 the pill is 20% wider. At ×2.0 it is 40% wider. At ×3.0 it fills the full center. Visual escalation matches the fantasy.
3. **Score has a thick bold backing** — white number on orange pill. Always readable against any background.
4. **Timer:** Large number. Turns orange at 60s, red at 30s. Pulses size at 10s remaining (current system) but also the pill itself turns red.
5. **Clear visual separation from game world:** HUD backed by a solid strip that has depth (shadow below it, slight overlap into game world).

---

### PRIORITY 4 — Table Redesign

**Goal:** Table identity and state are readable instantly.

1. **Replace checkered linen with a clean white tablecloth** — solid white rounded rectangle on the table surface. No pattern noise.
2. **Add table number:** Small numeral (1–5) on the tablecloth edge. Players can learn "I'm going to table 3."
3. **State indicator arrows** (from Priority 0) attached here.
4. **Dirty state:** Replace 🧹 emoji with a bold drawn dirt mark — a scuff on the tablecloth, clearly visible.

---

### PRIORITY 5 — Kitchen Redesign

**Goal:** Kitchen reads as the most important zone on screen.

1. **Counter redesign:** Lighter surface so tickets are readable. Current dark granite makes everything muddy.
2. **Ticket system:** Cards enlarged to 72×52px. Food emoji at 28px. Progress bar at 8px tall.
3. **Ready state:** Bold green fill on the "READY" zone — not a border, a fill. Unmissable.
4. **COOKING zone:** Subtle warm tint with a visible flame icon on active burners.
5. **Bell icon** (🔔 drawn, not emoji): appears with a shake animation when first order becomes ready.

---

### PRIORITY 6 — Speech Bubble Redesign

**Goal:** State is readable in 0.1 seconds.

1. **State-specific shapes:**
   - ❓ (requesting): Round bubble with bold ? — the largest bubble
   - Food (waiting): Standard bubble, food emoji at 26px
   - Payment (paying): GOLD COIN shape (not a rectangle) — unmistakably a payment
   - Angry: Red speech bubble with jagged edges (spiky instead of rounded)
2. **All bubbles enlarged:** Body to 64×44px (from 56×36px).
3. **Bold border:** 2.5px (from 1.5px).

---

### PRIORITY 7 — Main Menu Redesign

**Goal:** First impression communicates "commercial mobile game."

1. **Restaurant interior background** — not the gameplay floor. A distinct establishing shot: warm restaurant with tablecloths visible, soft light.
2. **The waiter character** appears on the main menu, doing an idle animation.
3. **Logo treatment:** "TABLE RUSH" with a subtle drop shadow and a small plate/fork icon as part of the brand mark.
4. **Remove version number** from screen. Move it to Settings.
5. **Remove SETTINGS and CREDITS from main prominence** — these are secondary. Main screen: PLAY (large). Other options: smaller, below.

---

### PRIORITY 8 — Game Over Redesign

**Goal:** End screen creates appetite for another round.

1. **Stars animation:** Stars are drawn (cartoon star shape), not emoji. They fly in one by one with a bounce.
2. **Score reveal:** Animated counter is current — keep it. But back it with a bold, high-contrast presentation.
3. **State-specific header:** Not "ROUND COMPLETE" for everything.
   - 0 angry customers: "PERFECT SERVICE! 🌟"
   - 3 stars: "EXCELLENT! ⭐⭐⭐"
   - 2 stars: "SOLID WORK!"
   - 1 star: "KEEP PRACTICING."
4. **Combo record gets visual emphasis** if it was a personal best.
5. **Play again button is larger** than Main Menu — the default action is to play again.

---

### PRIORITY 9 — Tutorial Redesign

**Goal:** Fix pre-existing text timing bug. Make instructions match actions.

1. **Fix step advancement:** The tutorial step text must show BEFORE the triggering event, not after.
   - Step 1 text shows at game start: "A customer is on the way! Get ready."
   - Step 2 text shows when customer is seated and requesting: "They want to order! Tap the TABLE."
   - Step 3 text shows when player has walked to table and order is assigned: "Order sent to the kitchen!"
2. **Visual pointer:** Add a pulsing arrow pointing at the relevant interactive element during each tutorial step.

---

## SUMMARY TABLE

| Priority | Item | Impact | Addresses |
|----------|------|--------|-----------|
| 0 | Action arrow indicator | Critical | Phase 1 validation failure, priority visibility |
| 1 | Customer redesign | Critical | Character readability, emotional connection |
| 2 | Waiter redesign | High | Player identity, emotion system visibility |
| 3 | HUD redesign | High | Combo discovery, score readability |
| 4 | Table redesign | High | State clarity, spatial identity |
| 5 | Kitchen redesign | Medium | Kitchen zone readability |
| 6 | Speech bubble redesign | Medium | State disambiguation speed |
| 7 | Main menu redesign | Medium | First impression |
| 8 | Game over redesign | Medium | Retention after round |
| 9 | Tutorial redesign | Medium | New player experience |

---

**Total implementation scope:** Priorities 0–9 are all texture/visual changes (BootScene.ts, Table.ts, Customer.ts, Player.ts, GameScene.ts visual elements, MainMenuScene.ts, GameOverScene.ts).

**No new gameplay systems. No new mechanics. No new features.**

The game loop stays exactly as it is. Only the presentation changes.

---

*Status: AWAITING APPROVAL. No implementation until this document is approved.*
