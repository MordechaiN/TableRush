# FINAL EXPERIENCE REVIEW
_TableRush — v0.9.3 → v1.0 | 2026-06-03_

---

## The Test

For every screen: "Would a player believe this is a commercial mobile game?"

Current answer after v0.9.3: **No.** It reads as a polished prototype, not a product.

---

## Screen-by-Screen Audit

### Main Menu
| Element | Current State | Commercial Standard |
|---------|--------------|---------------------|
| Background | Same plain checkered floor | Restaurant interior scene |
| Title | Floating text on tile | Logo on atmospheric backdrop |
| Decorative elements | Two bouncing emojis | Restaurant windows, warm lighting |
| Buttons | Clean and readable | ✅ Already decent |
| Version number `v0.2.0` | Visible prototype signal | Not shown to players |

**Verdict: PROTOTYPE** — no sense of place, no restaurant fantasy.

### Game Scene — The Room
| Element | Current State | Commercial Standard |
|---------|--------------|---------------------|
| Left/right walls | NONE — floor bleeds to edges | Room boundaries with wainscoting |
| Floor | Low-contrast cream tiles | Bold tiles with grout shadows |
| Entrance | `🚪` emoji at bottom | Drawn double-door with glass |
| Ambient lighting | Nearly invisible (0.045 alpha) | Warm visible light pools |
| Side wall sconces | None | Visible lamp fixtures |

**Biggest single problem: no walls = no room.**

### Game Scene — The Kitchen
| Element | Current State | Commercial Standard |
|---------|--------------|---------------------|
| Counter | Dark rectangle | Warm professional surface |
| Zone labels | 10px text, barely readable | Bold badges with color backgrounds |
| Cooking zone | Slight orange tint | Obvious warm heat presence |
| Ready zone | Green flash glow (good) | Always-present subtle green glow |
| Order tickets | 50×52px, small emoji | Large readable ticket cards |
| Pass-through counter | None | Counter ledge / pickup window |

**Kitchen reads as: a gray box with text labels on it.**

### Game Scene — Tables & Seating
| Element | Current State | Commercial Standard |
|---------|--------------|---------------------|
| Tables | Good — linen pattern ✅ | ✅ |
| Customer seating | Good — overlay working ✅ | ✅ |
| Dirty table mess | Good — plates/glass ✅ | ✅ |
| Chairs | **Brown 26×26 boxes** | Actual chairs with backrest |
| Table numbers | None | Small number on each table |
| Candles | Barely visible (12px sprite) | Visible, flickering ambient light |

**Chairs are the biggest remaining visual problem in the seating area.**

### Game Scene — Feedback & Polish
| Element | Current State | Commercial Standard |
|---------|--------------|---------------------|
| Order taken | `✓ ORDER!` float | Float + ticket slide-in (exists) |
| Food delivered | `✓ SERVED!` float | Score burst (exists, works) |
| Payment | `💰 $N` float + 5 coin emojis | Gold coin burst, number arc, flash |
| Combo milestone | Screen flash + announcement | ✅ Good |
| Customer angry | Shake + float | ✅ Works |

**Payment needs a better coin burst — the `💰` emojis scatter and disappear, doesn't feel satisfying.**

### Game Scene — Ambience
| Element | Current State | Commercial Standard |
|---------|--------------|---------------------|
| Candle flicker | None — static sprite | Subtle alpha/scale pulse |
| Steam from kitchen | ✅ Already works | ✅ |
| Ambient motion | Only steam | Candle + plant sway + patron motion |
| Background music | None | Not scoped here |

---

## Priority Order

| # | Fix | Screen | Impact |
|---|-----|--------|--------|
| 1 | Side walls (left + right) | Game | ⭐⭐⭐ Transforms space from floor to room |
| 2 | Chair redesign (backrest visible) | Game | ⭐⭐⭐ Tables look like restaurant seating |
| 3 | Kitchen zone headers — bold badges | Game | ⭐⭐⭐ Kitchen becomes instantly readable |
| 4 | Entrance proper double-door | Game | ⭐⭐ Replaces biggest prototype signal |
| 5 | Floor — stronger contrast + shadows | Game | ⭐⭐ Depth and character |
| 6 | Candle flicker animation | Game | ⭐⭐ Life without gameplay changes |
| 7 | Table numbers | Game | ⭐⭐ Reads as a real restaurant |
| 8 | Payment coin burst — gold circles | Game | ⭐⭐ Satisfaction spike |
| 9 | Main menu — restaurant scene bg | Menu | ⭐⭐ Sets expectation before play |
| 10 | Version number hidden | Menu | ⭐ Removes prototype signal |
| 11 | Bigger kitchen tickets | Game | ⭐ Readability |
| 12 | Light pool opacity increase | Game | ⭐ Atmosphere |

---

## What This Fixes

After all changes:

- The restaurant is **enclosed** — walls define the space
- Tables are **seated** — chairs look like chairs
- The kitchen is **three zones** — ORDER IN / COOKING / READY, readable in under 1 second
- The room feels **alive** — candle flicker, ambient lighting
- Payment feels **rewarding** — gold coins burst, not emoji
- A screenshot would read as a **mobile restaurant game**, not a prototype

---

## What Remains After This Pass

- Customer emotional reactions (eating expressions, happy customer bounce)
- Background music + sound effects
- Menu scene restaurant art
- Hostess/waiting area mechanics
- Animated entrance (customers coming in through door)
