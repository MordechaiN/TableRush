# RESTAURANT REBOOT PLAN
_TableRush v0.9.2 → v0.9.3 | 2026-06-03_

---

## Audit: 8 Problems Found

### Problem 1 — Customers stand ON tables (not seated behind them)
**Root cause:** Customer spawns at `table.y - 20`. Sprite 48×72px, origin 0.5 → feet at `table.y + 15`, inside the table body. Customer depth 15 > table depth 0 → customer renders on top of table.
**Fix:** Front face overlay (depth 16) covers `table.y + 14` to `table.y + 38`, hiding customer feet. Player depth raised from 10 to 17 so waiter remains fully visible. Add chairs for spatial context.

### Problem 2 — Kitchen UI is confusing
**Root cause:** Cooking zone / ready zone / ticket rail not clearly differentiated. Zone labels are small.
**Fix (deferred to P5 — Kitchen redesign):** Addressed partially by action priority system (v0.7.0). Full kitchen redesign is scheduled.

### Problem 3 — Dirty tables not readable
**Root cause:** Single 🧹 emoji at (38, -26) — too small, wrong color, looks like decoration.
**Fix:** Replace with procedural `dirtOverlay` Graphics: two plates with food remnants, a glass, scattered crumbs. Rich brown/cream/tan palette, high contrast against tablecloth.

### Problem 4 — Cleaning flow wastes player time and table space
**Root cause:** `startCleaningProgress()` locks the table as 'dirty' for 1500ms while a progress bar fills. During this time no new customer can sit, and the player is rooted at the table.
**Fix:** Table opens IMMEDIATELY when player arrives (no progress bar). Player bounces, `table.setEmpty()` fires instantly, `flashClean()` plays. New customers can sit the moment the player touches the table.

### Problem 5 — Restaurant doesn't feel alive
**Root cause:** No kitchen utility elements, no flow between kitchen and seating area.
**Fix:** Add dishwasher station on the left wall (below kitchen). Add front chairs at each table (player approach side). Add back chairs (customer side). These add environmental storytelling without gameplay changes.

### Problem 6 — Visual style not modern
**Root cause:** Customer depth ordering creates floating-on-table appearance. Chairs missing. Dirty tables look like decoration, not mess.
**Fix:** Depth ordering fix (Problems 1, 3, 4) addresses this directly.

### Problem 7 — Gameplay readability
**Root cause:** Priority arrows work well. Dirty table visual is the weak link (unreadable mess indicator).
**Fix:** Problem 3 fix resolves the dirtiness readability gap.

### Problem 8 — Restaurant fantasy not reinforced
**Root cause:** No seating context (no chairs), no kitchen workflow visible.
**Fix:** Chairs + dishwasher station create the visual language of a real restaurant.

---

## Priority Order

| # | Change | Impact | Risk | File |
|---|--------|--------|------|------|
| 1 | Front face table overlay (depth 16) | ⭐⭐⭐ | Low | GameScene.ts |
| 2 | Player depth 10 → 17 | ⭐⭐⭐ | Low | Player.ts |
| 3 | Add chairs (front + back) per table | ⭐⭐⭐ | None | GameScene.ts |
| 4 | Dirty table mess graphics | ⭐⭐⭐ | Low | Table.ts |
| 5 | Instant clean (remove progress bar) | ⭐⭐ | Low | Table.ts, GameScene.ts |
| 6 | Dishwasher station (environmental) | ⭐ | None | GameScene.ts |

---

## Before / After

### Customer seating

**Before:** Customer feet at `table.y + 15`, customer depth 15 > table depth 0. Customer appears to float on top of tablecloth. No chairs. No spatial context.

**After:** Front face overlay at depth 16 hides customer feet. Chairs on both sides of table. Customer appears seated behind table front edge. Player at depth 17 remains fully visible even at serving position.

### Dirty table

**Before:** Single 🧹 emoji at corner of table. 20px, barely readable. Looks like decoration.

**After:** Two plates with food remnants, a glass, scattered crumbs drawn as Graphics. Fills most of table surface. Unmistakably "this table needs cleaning."

### Cleaning

**Before:** Player walks to table → stands there for 1500ms while green bar fills → table opens. Dead time. Table blocked for 1.5s.

**After:** Player walks to table → bounces → table opens INSTANTLY → ✨ Clean! floats. No dead time. New customer can sit immediately.

---

## Depth Ordering After Fix

```
0   — Floor tiles, back chairs, table containers (default)
1   — Wall, wainscoting
2   — Kitchen, lamps, wall art
3   — HUD panel
4   — HUD text, combo progress
5   — Front chairs (visible below table, above floor)
10  — (vacated — previously player)
15  — Customers, action arrows
16  — Table front face overlays (new — hides customer feet)
17  — Player (raised from 10, renders above overlay)
25  — Floating text labels
50  — Tutorial overlay
```

---

## What This Does NOT Address

- Kitchen full redesign (P5 in visual reboot)
- Dishwasher as required gameplay mechanic (future task)
- Customer personality differentiation (v0.7.0 Phase 2)
- Y-sorted depth rendering (would require architecture refactor)
