# VISUAL REDESIGN — TableRush

**Status: AWAITING APPROVAL — do not implement**
**Author: Claude Code**
**Date: 2026-06-01**

---

## 1. What Is Wrong Now

| Element | Current | Problem |
|---------|---------|---------|
| Background | Dark navy `#1a1a2e` | Cold, tech-feeling, not a restaurant |
| Floor | Dark checkerboard | Looks like a game editor grid |
| Tables | Dark rectangle + thin blue stroke | Wireframe placeholder |
| Chairs | Dark squares | Invisible against background |
| Waiter | Blue circle + rectangle body | Debug graphics |
| Customers | Colored circles + rectangles | Indistinguishable, no personality |
| Food | Colored circles | Cannot tell what food it is |
| Speech bubbles | White box + emoji text | Functional but not polished |
| Patience bar | Thin green strip | Easy to miss, hard to read |
| HUD | Plain text on dark bar | No visual identity |

---

## 2. Color Palette — New Direction

Warm, inviting, premium casual. Think brasserie + modern app.

```
Restaurant Palette:
  Floor warm:     #F5E6C8   (warm cream tile)
  Floor alt:      #EDD9A3   (alternating tile)
  Wall:           #FFF8F0   (warm white)
  Wall accent:    #C17B3A   (wood trim)

  Table surface:  #8B4513   (rich mahogany)
  Table top:      #A0522D   (lighter wood grain)
  Table cloth:    #FDFAF6   (white linen)
  Chair:          #5C3317   (dark wood)

  Waiter jacket:  #1A237E   (deep navy)
  Waiter shirt:   #FFFFFF   (white)
  Waiter skin:    #FDBCB4   (warm peach)

  UI primary:     #FF6B35   (energetic orange)
  UI secondary:   #FFD700   (gold for coins/score)
  UI success:     #4CAF50   (green for bonuses)
  UI danger:      #F44336   (red for angry/urgent)
  UI info:        #2196F3   (blue for neutral info)

  Text dark:      #2C1810   (warm dark brown)
  Text light:     #FFFFFF
  Text gold:      #FFD700
```

---

## 3. Restaurant Environment

### Floor
- Warm cream/tan diagonal tile pattern
- Subtle grout lines between tiles
- Not dark. Not cold. Warm and bright.

### Walls
- Warm off-white top section (visible at edges)
- Wooden wainscoting strip mid-wall
- Subtle wall decorations: framed art, a plant, a clock

### Kitchen area (top zone)
- Stainless counter with warm lighting glow
- Ticket rail: horizontal bar showing order tickets
- Each ticket: small colored card with food emoji
- "KITCHEN" label in warm font, not monospace

### Decorations
- Two potted plants (bottom corners)
- Wall clock (top right area, shows game timer)
- Hanging pendant lights (circles above table areas)
- Welcome mat at the door (bottom center)

### Door
- Proper door shape with handle
- Customers enter and exit through it
- Subtle shadow

---

## 4. Tables

Each table has three layers:

1. **Shadow** — soft dark ellipse below the table
2. **Table body** — warm mahogany rectangle, rounded corners (radius 12)
3. **Tablecloth** — white/cream inset rectangle, slightly smaller
4. **Place settings** — tiny fork/knife icons when table is empty (inviting)
5. **Dirty state** — crumbs drawn on tablecloth, slight disarray

No wireframes. No strokes. Filled, warm, readable.

Size: 110 × 75px (slightly larger than current 100 × 70)

---

## 5. Waiter Character

The player character is a waiter. Distinct, readable, charming.

Layers (drawn procedurally):
1. **Legs** — dark trouser rectangles
2. **Shoes** — small black rounded rectangles
3. **Body** — navy jacket (rounded rectangle)
4. **Collar** — white triangle shirt visible at top
5. **Head** — warm peach circle
6. **Hair** — brown/dark shape on top of head
7. **Face** — two small dot eyes, tiny smile arc
8. **Bow tie** — small black bow at collar
9. **Tray** (when carrying food) — gray circle held above head, food icon on top

Movement: smooth tween with slight vertical bob (via y offset oscillation while moving).

When idle: subtle idle animation (slight body sway, 2s period).

Size: approximately 36 × 56px

---

## 6. Customer Characters

7 distinct customer variants. Each is a combination of:
- Body color (outfit)
- Hair color/style
- Accessory (hat, glasses, bow)

**Variants:**

| # | Outfit | Hair | Accessory | Feeling |
|---|--------|------|-----------|---------|
| 0 | Red dress | Dark bun | Pearl necklace | Elegant lady |
| 1 | Blue suit | Short brown | Briefcase beside | Business man |
| 2 | Green hoodie | Blonde ponytail | None | Casual young |
| 3 | Orange t-shirt | Curly afro | Sunglasses | Trendy |
| 4 | Purple dress | Long black | Flower in hair | Romantic |
| 5 | Teal jacket | Grey hair | Round glasses | Elder |
| 6 | Yellow shirt | Red spiked | Cap | Teen |

Each customer always uses the same variant (by customerId % 7).

**Mood states expressed via face:**
- WAITING: neutral face 😐 → eyes slightly drooping
- HAPPY (eating): smile 😊
- HUNGRY (patience < 50%): slight frown
- ANGRY (patience < 20%): eyebrows angled down, frown 😠
- FURIOUS (patience expired): red tint face, strong frown 😡

Face elements are drawn on top of head circle. Mood transitions are instant (no tween needed — the face just redraws).

---

## 7. Speech Bubbles & Order Display

### Request bubble (customer wants attention)
- White rounded rectangle with tail pointing down-left
- Content: ❓ large emoji, pulsing (scale 0.9 → 1.1, 600ms loop)
- Border: soft blue `#2196F3`
- Appears above customer head

### Order bubble (customer's food request)
- White rounded rectangle with tail
- Content: food emoji (large, ~28px) + item name below (12px text)
- Border: warm orange `#FF6B35`
- Stays visible until food is delivered

### Payment bubble
- White rounded rectangle
- Content: 💳 emoji + price in gold text
- Border: gold `#FFD700`

### Anger bubble
- Red-tinted rounded rectangle
- Content: 😠 large emoji
- Shakes slightly (tween x ±3px, 80ms)

---

## 8. Kitchen Order Tickets

A horizontal rail at the bottom of the kitchen zone displays pending orders.

Each ticket:
- Small warm card (cream background, orange border)
- Food emoji centered (24px)
- Ticket appears with slide-in animation from right
- Completed ticket flips/fades out
- Maximum 5 tickets visible simultaneously

When an order is ready (cook time elapsed):
- Ticket glows warm gold
- Small ✓ checkmark appears
- Kitchen area pulses once

---

## 9. Patience Bar

Current: thin green strip above customer. Hard to see.

New design:
- Placed BELOW the speech bubble
- Width: 60px, height: 8px
- Rounded ends
- Color transitions:
  - > 60%: warm green `#4CAF50`
  - 30–60%: amber `#FF9800`
  - < 30%: urgent red `#F44336` with pulse animation
- Small clock icon (🕐) to the left of the bar
- Background track: dark rounded rect

---

## 10. HUD (Heads-Up Display)

### Top bar (60px height)
- Warm cream/white background (not dark)
- Left: 🍽️ SCORE: **1,240** (score in bold, warm brown text)
- Center: 🔥 ×2.0 (combo multiplier, orange when > 1)
- Right: ⏱ 2:34 (timer with clock icon)
- Pause button: ⏸ top-right corner

### Score popup (floating text)
- Appears at point of payment collection
- "+$12" in warm orange, "+50 FAST!" in gold
- Rises 60px, fades over 1.2s
- Size: 22px bold

### Combo announcement
- When combo increases: large text slides in from right
- "COMBO ×2! 🔥" in bright orange
- Stays 1.5s, slides out
- Gets bigger with each increment (max ×5 = very large)

---

## 11. State Indicators on Tables

| State | Indicator |
|-------|-----------|
| Empty | Subtle sparkle (tiny ✨ particles, periodic) |
| Customer seated, requesting | Soft blue pulse ring around table |
| Order taken, waiting food | Food emoji float above table |
| Food delivered, eating | Fork/knife icon, customer satisfied smile |
| Customer paying | Gold shimmer, 💳 icon |
| Dirty | Visible crumbs on tablecloth, 🧹 icon top-right |
| Being cleaned | Sparkle wipe animation |

---

## 12. Procedural Art Quality Bar

All art is still procedural (no external files). But the approach changes:

**Old approach:** `fillRect` + `fillCircle` = flat primitives

**New approach:**
- Multiple layered shapes per character (shadow → body → detail)
- Gradients via multiple overlapping shapes with alpha
- Highlight dots on surfaces (white circle, 30% alpha, top-left of any sphere)
- Shadows below objects (dark ellipse, 40% alpha)
- Rounded corners everywhere (`fillRoundedRect` with radius 8–16)
- Warm color palette throughout

The goal: players should not notice the art is procedural. It should look intentional and polished.

---

## 13. Animation Inventory

| Animation | Duration | Easing |
|-----------|----------|--------|
| Customer walk in | 800ms | Quad.easeOut |
| Customer walk out (happy) | 700ms | Quad.easeIn |
| Customer walk out (angry) | 500ms | Quad.easeIn (faster, stomping) |
| Waiter walk | distance × 1.6ms | Quad.easeInOut |
| Waiter idle bob | 1800ms yoyo | Sine.easeInOut |
| Bubble appear | 200ms scale 0→1 | Back.easeOut |
| Score float | 1200ms | Quad.easeOut |
| Combo slide | 300ms/300ms | Back.easeOut/in |
| Coin burst (4 coins) | 600ms | Quad.easeOut |
| Patience bar pulse (urgent) | 400ms yoyo | Sine.easeInOut |
| Table pulse (needs action) | 700ms yoyo | Sine.easeInOut |
| Kitchen glow (food ready) | 500ms yoyo | Sine.easeInOut |
