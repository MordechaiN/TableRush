# BEFORE / AFTER REPORT — P0 + P1 Visual Reboot
**Date:** 2026-06-02
**Version:** v0.8.0

---

## What Was Implemented

### P0 — Action Indicator Redesign
**Problem solved:** Phase 1 validation confirmed the original pulse ring (`strokeRoundedRect`, 4px, 0.035–0.5 alpha) was invisible against the warm beige tablecloth. Players could not see which table to act on.

**What changed:**
1. **Table.ts** — Removed `pulseRing` (invisible). Added `actionArrow` as a **scene-level Graphics object** at depth 15 (above customers, above player). Arrow is a solid filled triangle (▼) with 2.5px black outline.
2. **Arrow position:** 72px above table center world y — safely above customer sprite top (at table.y − 56), above patience bar (at table.y − 70), and visible regardless of customer presence.
3. **Color by state:** Blue = requesting, Orange = kitchen_ready, Gold = paying, Red = urgent, Gray = dirty.
4. **Pulse by scale, not alpha:** Arrow tweens between 88%–114% of base scale. Alpha locked at 0.95 — never fades below visibility.
5. **Primary vs secondary:** Primary table arrow = scale 1.0 (30px wide). Secondary tables = scale 0.5 (15px wide). Primary action always clearly dominant.
6. **Kitchen glow redesign:** Replaced 4px `strokeRoundedRect` (invisible) with solid `fillRoundedRect` over the READY zone — bright green (#27AE60) fill covering the right half of the counter. Tweens alpha 0.45–0.82 (primary), 0.18–0.38 (secondary). Always visible when an order is ready.

### P1 — Customer Redesign
**Problem solved:** 32×52px sprites with 1.5px outlines and 1.5px eyes were unreadable at mobile play distance. Customers felt like colored rectangles, not people.

**What changed:**
1. **Sprite size:** 48×72px (up from 32×52px) — 50% larger in each dimension, 2.25× more area.
2. **Head radius:** r=14 (up from r=10) — head is now 40% of sprite height.
3. **Outline weight:** 2.5px near-black on head and body (up from 1.5px). Maximum contrast against any background.
4. **Eyes:** r=3 with white iris base + dark pupil + bright highlight dot. Expressive at a glance (up from r=1.5 dark dots — barely visible).
5. **Mouth:** Arc radius r=5 with 2px stroke (up from r=4, 1.5px stroke). Happy/angry/hungry moods visually distinct.
6. **Patience bar:** 44×8px pill (up from 36×5px) — 78% wider, 60% taller. Green/orange/red is readable from playing distance.
7. **Eat bar:** 44×5px (up from 36×4px).
8. **Bubble position:** Adjusted for larger sprite — container at y=−88 (up from y=−66), tail tip clears patience bar with 4px gap.
9. **Name banner:** Variant name appears in a small badge above the customer on arrival, fades after 1.6s. Answers "who is this customer?" instantly.
10. **Variant silhouettes redesigned** for 48×72 canvas:
    - Business: bolder tie (larger triangle), visible wide shoulders
    - Elegant: visible collar wings + large pendant drop
    - Teen: wide cap brim clearly extending past head edges
    - Elder: thick glasses with prominent temples
    - Trendy: oversized sunglasses extending past head edges
    - Romantic: large flower extending right of head
    - Casual: clean round face, clearly the "default" type
11. **Skin tone updated:** #FFCB9A (lighter, cleaner cartoonish skin — was #FDBA8C)
12. **Ear radius:** 4.5px (up from 3px) — visible at small sizes.

---

## Screenshot Evidence

### BEFORE (from Phase 1 validation — v_03, v_04, v_05)
- `screenshots/v_03_customer_requesting.png` — 32×52 customer, invisible pulse ring, 5px patience bar
- `screenshots/v_05_food_ready.png` — kitchen glow completely invisible
- `screenshots/v_08_paying.png` — multi-table state, no visible priority differentiation

### AFTER (from P0+P1 implementation)
- `screenshots/v2_02_first_customer.png` — **Blue ▼ arrow** clearly visible above table. "ELEGANT" name banner. Larger customer character. Bigger patience bar.
- `screenshots/v2_03_multi_customers.png` — **Three customers** at three tables. Each has a blue ▼ arrow. Primary table (top-left) has full-size arrow. Secondary tables have smaller arrows. Priority hierarchy is visually clear.
- `screenshots/v2_04_kitchen_ready.png` — Multiple customers all requesting. Arrow indicators clearly mark each active table without visual ambiguity.
- `screenshots/p0p1_05_kitchen_ready.png` — **Kitchen ready zone** shows bold green fill on right counter half. Kitchen glow alpha confirmed at 0.49 via game state inspection.

---

## Measured Improvements

| Metric | Before | After |
|--------|--------|-------|
| Priority indicator alpha floor | ~0.035 | 0.95 (locked) |
| Priority indicator mechanism | Alpha tween (invisible) | Scale tween (always visible) |
| Kitchen ready visibility | ~0 (invisible) | 0.45–0.82 (always visible) |
| Customer sprite size | 32×52px | 48×72px (+50% each axis) |
| Patience bar size | 36×5px | 44×8px (+22%, +60%) |
| Outline weight | 1.5px | 2.5px (+67%) |
| Eye radius | 1.5px | 3px (+100%) + highlight |
| Customer identity | Color only | Name banner + silhouette |
| Primary/secondary distinction | Alpha 1.0 vs 0.35 (both invisible) | Scale 1.0 vs 0.5 (both visible) |

---

## Critical Issues Fixed

1. **The single most important fix:** The priority system (built in Phase 1) was architecturally correct but visually inert. Players could not see the system working at all. The arrow replacement makes the system visible for the first time.

2. **Customer identity:** Players can now read which type of customer they're serving by silhouette and name, not just outfit color. This is the foundation of the "you are serving people, not icons" fantasy.

3. **Kitchen state clarity:** The solid green fill on the ready zone is the most readable kitchen signal yet. No squinting required.

---

## Remaining Issues (Not in P0/P1 Scope)

- **Secondary arrow at 0.5 scale** (15px wide) is small — visible but could be more distinct. P3 (HUD redesign) will address overall indicator sizing strategy.
- **Waiter sprite** still 40×62px (P2 scope — not yet implemented).
- **Combo always visible** — combo text still disappears at ×1.0 (P3 scope).
- **Table linen pattern** still checkered (P4 scope).
- **Speech bubble shapes** all identical regardless of state (P6 scope).
- **Tutorial step text timing** bug still present (P9 scope).

---

## Architecture Notes

**Key design decision:** The action arrow was initially placed inside the Table container. This caused it to render under the customer sprite (customers are added to scene later, higher z-order). Moved the arrow to be a standalone scene-level Graphics object at depth 15. This guarantees the arrow renders above all gameplay entities at all times.

**No gameplay changes:** Zero changes to game logic, spawn rates, patience values, combos, scoring, progression, or any gameplay system. Only visual presentation changed.

---

*Status: COMPLETE — Awaiting approval to proceed to P2.*
