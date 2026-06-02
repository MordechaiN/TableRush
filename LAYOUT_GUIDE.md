# LAYOUT GUIDE — TableRush v0.6.0

_Fixed anchor points for every interactive zone. These coordinates do not change between rounds._

---

## Canvas

**480 × 640** (portrait). All coordinates are canvas-absolute unless noted.

---

## Zone Map

```
┌─────────────────────── 480 ───────────────────────┐
│  HUD BAR                                    [0–52] │
│  Score │ Timer │ Combo                             │
├───────────────────────────────────────────────────┤
│                                                    │
│  RESTAURANT FLOOR                          [52–530]│
│                                                    │
│    [TABLE 0]     [TABLE 1]     [TABLE 2]           │
│     180, 165      300, 165      420, 165           │
│                                                    │
│    [TABLE 3]                   [TABLE 4]           │
│     180, 310                   420, 310            │
│                                                    │
│                                                    │
│  ATMOSPHERE STRIP (lamps, plants, wall art)[52–120]│
│                                                    │
├───────────────────────────────────────────────────┤
│  KITCHEN COUNTER                          [530–610]│
│  Cooking zone [40–220] │ Ready zone [260–440]      │
├───────────────────────────────────────────────────┤
│  TICKET RAIL                              [610–640]│
│  Kitchen order tickets (left→right)                │
└───────────────────────────────────────────────────┘
```

---

## Fixed Anchor Points

### HUD Bar (y = 0–52)
| Element | X | Y | Notes |
|---------|---|---|-------|
| Score label | 16 | 14 | left-aligned |
| Score value | 16 | 30 | left-aligned, large |
| Timer | 240 | 26 | center, centered |
| Combo name | 390 | 14 | right-aligned |
| Combo multiplier | 390 | 30 | right-aligned |

### Tables
| ID | Center X | Center Y | Chair positions |
|----|----------|----------|-----------------|
| 0 | 120 | 200 | top (120,160), bottom (120,240) |
| 1 | 260 | 200 | top (260,160), bottom (260,240) |
| 2 | 400 | 200 | top (400,160), bottom (400,240) |
| 3 | 150 | 360 | top (150,320), bottom (150,400) |
| 4 | 360 | 360 | top (360,320), bottom (360,400) |

_Tables 0-2: first row. Tables 3-4: second row (staggered)._
_Exact pixel values may shift ±10px during implementation for visual balance._

### Kitchen Counter
| Zone | Center X | Center Y | Hit area |
|------|----------|----------|----------|
| Full counter | 240 | 570 | 460×80 |
| Cooking zone | 130 | 570 | 200×80 |
| Ready zone (tap target) | 350 | 570 | 200×80 |

### Player Start Position
- Idle position: **(240, 470)** (center of floor, just above kitchen)
- Player never moves to y < 80 (HUD clearance)
- Player never moves to y > 520 (kitchen clearance)

---

## Atmosphere Elements (Fixed Positions)

### Pendant Lamps
| # | X | Y |
|---|---|---|
| 1 | 120 | 75 |
| 2 | 240 | 75 |
| 3 | 360 | 75 |

### Wall Frames
| # | X | Y | Size |
|---|---|---|------|
| 1 | 60 | 95 | 60×50 |
| 2 | 420 | 95 | 60×50 |

### Plants
| # | X | Y |
|---|---|---|
| 1 | 30 | 480 |
| 2 | 450 | 480 |

### Door Mat
- X: 240, Y: 80 (top center, below HUD)

### Menu Board (NEW in v0.6.0)
- X: 240, Y: 108
- Size: 200×50
- Style: chalkboard (dark green bg, chalk-white text)
- Content: "TODAY'S SPECIALS" + 3 emoji items

---

## Customer Spawn / Seat Positions

Customers spawn off-screen top (*x = table.x, y = −60*) and walk to their chair.

Seated customer position (relative to table center):
- Chair top: **(table.x, table.y − 40)** → customer sits at **(table.x, table.y − 55)**
- Chair bottom: **(table.x, table.y + 40)** → customer sits at **(table.x, table.y + 55)**

Customers always occupy the TOP chair (index 0). Bottom chairs are decorative in v0.6.0.

---

## Interaction Hit Areas

All tap targets use Phaser `setInteractive({ useHandCursor: true })` on the container.

| Target | Hit size | Priority |
|--------|----------|---------|
| Table (any state) | 110×76 | Normal |
| Kitchen counter | 460×80 | Normal |
| HUD buttons | 120×40 | High |
| Pause (desktop) | full screen ESC | — |

---

## Z-Order (depth layers)

| Layer | Depth | Contents |
|-------|-------|----------|
| Floor | 0 | Floor tiles, grout |
| Atmosphere low | 1 | Plants, door mat |
| Tables | 2 | Table + chair sprites |
| Table decorations | 3 | Candles, rings |
| Customers | 4 | Customer containers |
| Player | 5 | Player container |
| Kitchen | 6 | Kitchen counter |
| Atmosphere high | 7 | Pendant lamps, wall frames |
| HUD | 10 | HUD bar, score, timer |
| Overlays | 20 | Floating labels, tutorial text |
| Celebration | 30 | TABLE MASTER, stars |

---

## Speech Bubble Placement

Bubble always appears ABOVE the customer head.

- Bubble anchor: **(customer.x, customer.y − 60)**
- Bubble size: 48×42 (content + padding)
- Tail points: down toward customer, 8px triangle

---

## Patience Bar Placement

Placed above bubble when bubble is visible, else directly above customer:
- Bar anchor: **(customer.x, customer.y − 42)**
- Size: 36×5, pill shape (r=2.5)
- When bubble visible: bar at **(customer.x, customer.y − 78)**

---

## Carrying Tray Placement

Tray is always shown above player head:
- Plate center: **(player.x, player.y − 42)**
- Plate radius: 13px
- Emoji center: same point, 22px

---

## Table State Ring Placement

State ring drawn centered on table container at **(0, 0)** relative to table.
- Ring radius: 58px (just outside table body 110×76 diagonal)
- Line width: 3px
- Drawn in Table.ts `update()` method using alpha tween value
