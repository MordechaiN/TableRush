# ART DIRECTION — TableRush v0.6.0

## Theme: "Bella Notte Trattoria"

A warm, family-owned Italian bistro at dinner hour.
Amber lamplight. Dark wood. White linens. Clinking glasses.
The player is the star waiter on a busy Saturday night.

---

## Core Visual Principle

**Every pixel serves the player.**

- Can the player instantly read the game state at a glance? ✓
- Does every object communicate its purpose through shape and color? ✓
- Does the restaurant feel like a place, not an abstraction? ✓

The game is NOT a simulation. It is a fantasy. It should feel slightly idealized —
brighter colors, rounder shapes, more expressive characters than reality.

---

## Palette

### Primary (actions, highlights)
| Role | Hex | Use |
|------|-----|-----|
| Action orange | #FF6B35 | Buttons, kitchen ready, ordering |
| Reward gold | #FFD700 | Stars, combos, payment |
| Success green | #4CAF50 | Patience (high), clean, positive |
| Urgent red | #F44336 | Patience (low), angry, danger |
| Request blue | #2196F3 | Customer requesting attention |

### Environment
| Role | Hex | Use |
|------|-----|-----|
| Wall terracotta | #C17B3A | Back wall, accent |
| Wall warm | #D4955A | Wall surface |
| Floor cream | #F5E6C8 | Floor base |
| Floor tile alt | #EDD9A3 | Alternating tile |
| Floor grout | #D4C4A8 | Tile grid lines |
| Table mahogany | #8B4513 | Table body |
| Table cloth | #FDFAF6 | Tablecloth |
| Kitchen dark | #2C2C2C | Counter base |
| Kitchen steel | #484848 | Counter surface |

### Characters
| Role | Hex | Use |
|------|-----|-----|
| Waiter navy | #1A237E | Jacket |
| Waiter white | #FFFFFF | Shirt/apron |
| Skin warm | #FDBA8C | Base skin tone (all characters) |
| Skin shadow | #E08B5A | Shadow/ear/nose on face |
| Dark brown | #3C2010 | Eyes, eyebrows, outlines |
| Hair highlight | mix+40% | Per-character hair sheen |

### UI
| Role | Hex | Use |
|------|-----|-----|
| HUD background | #FFF8F0 | HUD panel |
| Text primary | #2C1810 | All body text |
| Text light | #FFFFFF | Text on dark backgrounds |
| Text gold | #FFD700 | Reward text |
| Text orange | #FF6B35 | Score, combo |
| Text red | #F44336 | Urgency |
| Text green | #4CAF50 | Positive |

---

## Character Design Rules

### Proportions
All characters use a "chibi-lite" ratio: head ≈ 35–40% of total height.
Bodies are slightly wide relative to height. Legs are short.
This reads clearly at small sizes.

### Silhouette rule
Each of the 7 customer variants must be identifiable by silhouette alone:
- Elegant: tall collar, necklace visible
- Business: narrow, squared shoulders  
- Casual: relaxed, no accessories
- Trendy: sunglasses protrude from head
- Romantic: flower on hair
- Elder: glasses, shorter
- Teen: cap brim extends beyond head

### Face placement
Customer head center in container space: **(0, −16)**
Eye center Y: **−18** (above head center)
Mouth center Y: **−13** (below head center)

Player head center in container space: **(0, −17)**
Eye center Y: **−19**
Mouth center Y: **−12**

### Face expression moods
| Mood | Eyes | Mouth | Context |
|------|------|-------|---------|
| neutral | filled circles r=1.5 | flat line | default |
| happy | filled circles r=1.5 | arc smile | eating/paying |
| hungry | filled circles r=1.5, brows angled | flat/tight | patience 30–60% |
| angry | filled, brows sharp | frown arc | patience < 25% |

---

## Food Design Rules

Food appears in three contexts:
1. **Kitchen tickets**: emoji at 22px, ticket background orange-bordered
2. **Player tray**: emoji at 22px on white plate circle (r=13) above tray
3. **Customer bubble**: emoji at 20px on warm-cream bubble

Food emoji selection is already correct (🥗🍔🍝🍣🍕). No changes needed.
The visual improvement is the PRESENTATION — food on a plate background.

---

## State Visual Language

| Object state | Color signal | Animation |
|---|---|---|
| Table: empty | No pulse | None |
| Table: requesting | Blue ring | 700ms pulse |
| Table: order cooking | None | None (ticket shows) |
| Table: food ready (carry) | Orange ring | 500ms pulse |
| Table: paying | Gold ring | 600ms pulse |
| Table: dirty | Gray broom | Static |
| Table: cleaning | Green fill bar | Linear fill |
| Kitchen: cooking | Steam particles | Continuous |
| Kitchen: ready | Orange glow + ring | 500ms pulse |
| Customer: patience high | Green bar | None |
| Customer: patience mid | Orange bar | None |
| Customer: patience low | Red bar | Bar flashes |

---

## What Must Change in v0.6.0

1. Customer face coordinates fixed — currently on the body, not the head
2. Customer figures more distinct — outlines on head/body, richer accessories
3. Player figure more readable — cleaner apron, better outline
4. Table cloth — subtle checkered linen pattern
5. Food display — plate background on tray
6. Patience bar redesign — thinner, pill-shaped, positioned correctly
7. Bubbles — shadow + cleaner border
8. Kitchen — add pot/pan silhouettes
9. Menu board — chalkboard in restaurant
10. Restaurant floor — deeper tile pattern
