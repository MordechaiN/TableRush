# VISUAL STYLE GUIDE — TableRush v0.6.0

_This guide defines exact component specs for every drawn object. Any new texture or entity must conform to these rules._

---

## Typography

All text uses Phaser's default bitmap font (Arial/sans-serif fallback).

| Context | Size | Color | Style |
|---------|------|-------|-------|
| HUD score | 20px | #FF6B35 | bold |
| HUD timer | 18px | #2C1810 | bold (red #F44336 at 30s) |
| HUD combo name | 14px | #FFD700 | bold |
| Floating +score | 18px | #FFD700 | bold, scale-punch |
| Floating penalty | 18px | #F44336 | bold, scale-punch |
| BUSY! text | 22px | #F44336 | bold |
| Combo milestone | 28px | #FF6B35 | bold |
| TABLE MASTER | 38px | #FFD700 | bold |
| Customer bubble text | 20px emoji | — | emoji only |
| Kitchen ticket emoji | 22px emoji | — | emoji only |
| Tutorial text | 16px | #2C1810 | white panel bg |
| Button label | 18px | #FFFFFF | bold |

---

## Spacing & Layout Grid

Game canvas: **480 × 640**

| Zone | Y range | Purpose |
|------|---------|---------|
| HUD bar | 0–52 | Score, timer, combo |
| Restaurant floor | 52–600 | Tables, players, customers |
| Kitchen counter | 540–620 | Cooking + pickup zone |
| Ticket rail | 580–640 | Kitchen order tickets |

Margins: 12px from canvas edge for all HUD elements.
Table placement: see LAYOUT_GUIDE.md.

---

## Characters

### Waiter (Player)

Texture: `player` (40 × 62), `player_walk` (40 × 62)

| Part | Shape | Color |
|------|-------|-------|
| Legs (idle) | rect 10×14 at (15,48) and (25,48) | #1A237E |
| Legs (walk) | diagonal stride offset ±5px | #1A237E |
| Body/jacket | rounded rect 30×24 at (5,26) | #1A237E |
| Apron | rect 14×20 at (13,28) | #FFFFFF, stroke #E0E0E0 |
| Apron pocket | rect 10×5 at (15,40) | #F0F0F0 |
| Head | circle r=14 at (20,17) | #FDBA8C |
| Ear | circle r=3.5 at (6,17) and (34,17) | #E08B5A |
| Hair | 3-arc shape above head | #3C2010 |
| Outline | head + body stroke 1.5px | #3C2010 |
| Eyes | 2 filled circles r=1.5 at (16,11) and (24,11) | #3C2010 |
| Mouth | flat line 4px at y=15 | #3C2010 |

Face origin in container space: **(0, −17)**
Eyes in container: **(−4, −19)** and **(+4, −19)**
Mouth in container: **y = −12**

### Customer (7 variants)

Texture: `customer_0` … `customer_6` (32 × 52)

| Part | Shape | Color |
|------|-------|-------|
| Shoes | rect 8×5 at each foot | #3C2010 |
| Legs | rect 8×12 at (8,36) and (17,36) | variant pant color |
| Body | rounded rect 24×18 at (4,22) | variant top color |
| Head | circle r=12 at (16,14) | #FDBA8C |
| Ear | circle r=3 at (4,14) and (28,14) | #E08B5A |
| Hair | arc/shape above head | variant color |
| Outline | head + body stroke 1.5px | #3C2010 |
| Eyes | filled circles r=1.5 | #3C2010 |
| Mouth | flat line 4px | #3C2010 |

Face origin in container space: **(0, −16)**
Eyes in container: **(−4, −18)** and **(+4, −18)**
Mouth in container: **y = −13**

#### Variant Accessories (silhouette-defining)

| # | Name | Silhouette element | Colors |
|---|------|-------------------|--------|
| 0 | Elegant | tall collar (raised 4px), pearl necklace dot | Top #8B0000, pant #2C2C2C |
| 1 | Business | sharp squared shoulders (+2px wide), tie | Top #1A237E, pant #1A237E |
| 2 | Casual | relaxed, no extras, wider body | Top #FF6B35, pant #6B8E23 |
| 3 | Trendy | sunglasses extend 4px beyond head | Top #9C27B0, pant #000000 |
| 4 | Romantic | flower on hair (6px circle + petals) | Top #E91E63, pant #FFFFFF |
| 5 | Elder | glasses across nose, shorter legs (−4px) | Top #607D8B, pant #78909C |
| 6 | Teen | cap brim extends 6px beyond head | Top #00BCD4, pant #FF5722 |

---

## Tables

Texture: `table` (110 × 76)

| Part | Shape | Color |
|------|-------|-------|
| Base (shadow) | rounded rect 110×76, r=6 offset y+3 | #00000033 |
| Table body | rounded rect 110×72, r=6 | #8B4513 |
| Tablecloth | rounded rect 90×58 at (10,7), r=4 | #FDFAF6 |
| Cloth pattern | 4×4 grid of subtle lines | #F0EBE0 at 0.3 alpha |
| Place settings | circle r=17 at (32,38) and (78,38) | #E8E0D0 |
| Candle center | circle r=3 at (55,26) | #F5E6C8 |
| Candle flame | teardrop 3×5 at (55,21) | #FFD700 inner, #FF6B35 outer |

---

## Food Display

Three display contexts, same emoji, different presentation:

### 1. Kitchen Ticket
- Ticket bg: `ticket` texture (72×40) with orange border
- Emoji: 22px centered in ticket
- Progress bar: 4px tall, green fill on orange track, below ticket

### 2. Player Tray (carrying)
- White plate circle: r=13, fill #FFFFFF, stroke 1px #E0E0E0 at (0,−17) above tray
- Emoji: 22px centered on plate
- Tray: `tray` texture below plate

### 3. Customer Request Bubble
- Bubble bg: rounded rect, fill #FFF8F0, stroke 1.5px #FF6B35
- Shadow: same rect offset (2,2) at alpha 0.2, fill #00000033
- Emoji: 20px centered in bubble
- Tail: triangle pointing down toward customer

---

## Patience Bar

Position: top-center of customer container, at **(0, −42)**
Size: **36px wide × 5px tall**, pill-shaped (r=2.5)
Track: fill #00000022
Fill: green #4CAF50 → orange #FF6B35 → red #F44336

| Patience % | Bar color |
|------------|-----------|
| > 60% | #4CAF50 |
| 30–60% | #FF6B35 |
| < 30% | #F44336 (pulses) |

---

## Kitchen Counter

Texture: `kitchen` (460 × 80)

| Part | Color | Notes |
|------|-------|-------|
| Counter base | #2C2C2C | Full rect |
| Counter surface | #484848 | Top 20px |
| Cooking zone tint | #3D2B1F | Left 200px |
| Burner rings | #1A1A1A stroke on #2A2A2A | 4 rings, r=14 and r=9 |
| Pot/pan silhouette | #666666 → #999999 | 2 pots on burners |
| Ready zone tint | #1A2B1A | Right 200px |
| COOKING label | 12px white | Left zone |
| READY label | 12px white | Right zone |
| Divider | 2px #666666 | Center |

---

## UI Components

### HUD Panel
- Texture `hud_panel`: 480×52, fill #FFF8F0, bottom stroke 2px #D4B896
- Score left, timer center, combo right

### Buttons
- `btn_orange`: rounded rect, fill #FF6B35, stroke 1px #CC5529, r=8
- `btn_green`: rounded rect, fill #4CAF50, stroke 1px #388E3C, r=8

### Bubbles / Speech
- Fill: #FFF8F0 (warm cream, not pure white)
- Border: 1.5px #FF6B35
- Shadow: 2px offset, #00000033
- Corner radius: 8px

### State Ring Pulses
Ring drawn as thick arc (lineWidth=3) on table outside cloth:

| State | Color | Pulse ms |
|-------|-------|---------|
| Requesting | #2196F3 | 700ms |
| Food ready | #FF6B35 | 500ms |
| Paying | #FFD700 | 600ms |

---

## Atmosphere Elements

### Pendant Lamp
- Rod: 2px rect, #5C3D1E
- Shade: trapezoid, fill #F5D87B, stroke #8B6914
- Glow: circle r=30 at lamp base, #FFE87C at alpha 0.12

### Wall Frame
- Outer frame: rounded rect 60×50, fill #6B3E1E, stroke #3C2010
- Inner painting: rect 46×38, gradient sky #87CEEB → ground #8B7355
- Tree silhouette: simple circles #2D5A1B

### Candle (on table)
- Holder: rounded rect 8×4, fill #C0A060
- Body: rect 5×10, fill #FFFDE7
- Flame: teardrop, fill #FFD700 → #FF6B35 (gradient up)
- Glow: circle r=8, alpha 0.1, #FFE87C

### Floor
- Base: #F5E6C8
- Alt tile: #EDD9A3 (checkerboard 40×40 grid)
- Grout: 1px lines #D4C4A8

---

## Animation Timing Reference

| Animation | Duration | Easing |
|-----------|----------|--------|
| Seat bounce | 200ms yoyo | Sine.easeOut |
| Floating label rise | 800ms | Cubic.easeOut |
| Combo text punch | 150ms in, 300ms hold, 200ms out | Back.easeOut |
| State ring pulse | 500–700ms yoyo | Sine.easeInOut |
| Patience bar flash | 400ms yoyo | Sine.easeInOut |
| Walk step | 160ms per frame | — |
| Steam rise | 1200ms | Sine.easeOut |
| Emotion badge | 1500ms default | — |
