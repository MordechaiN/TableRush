# PROJECT STATUS

**Last Updated:** 2026-06-02
**Current Version:** v0.6.0

---

## Current Focus
v0.7.0 design phase — five redesign documents written. Awaiting owner approval before implementation begins.

## Completed Tasks
- [x] Project scaffold (Vite + TypeScript + Phaser 3)
- [x] All scenes: Boot, MainMenu, Game, Pause, GameOver, Credits, Settings
- [x] Full gameplay loop: spawn → request → auto-order → cook → deliver → eat → pay → clean
- [x] 5 tables, 7 customer variants (layered art), 5 menu items
- [x] Patience system with visual bar + angry customer (→ clean table, not dirty)
- [x] Named combo milestones: GOOD SERVICE / HOT STREAK / UNSTOPPABLE / TABLE MASTER
- [x] Speed multiplier scoring (×0.75–×2.0 based on patience at delivery)
- [x] Kitchen queue system with ticket rail UI
- [x] Priority pulse system (blue/orange/gold/red per table state)
- [x] Tutorial overlay (first session, 6 steps, localStorage tracked)
- [x] XP/Level/Stars progression (ProgressionSystem.ts, 10 levels)
- [x] End-of-round reward screen (stars, XP bar, level-up flash, stats)
- [x] Warm visual palette (cream floor, mahogany tables, navy waiter, warm UI)
- [x] Time-based difficulty tiers (not exponential ramp)
- [x] GitHub Actions CI/CD + GitHub Pages deploy (modern actions/deploy-pages)
- [x] SVG favicon added (no 404)
- [x] v0.3.0 — Game feel: physical delivery walk, cooking/eating/cleaning progress bars
- [x] v0.3.0 — exportSave() / importSave() on ProgressionSystem
- [x] v0.3.0 — Mobile: no pause button (ESC desktop-only)
- [x] v0.3.0 — Scale-punch floating labels, seatBounce on arrival
- [x] v0.4.0 — Waiter emotion system (5 states, face + tint + badge)
- [x] v0.4.0 — Busy feedback (red flash + shake + BUSY! text)
- [x] v0.4.0 — Combo reactions (x3/x5/x10 escalating celebrations)
- [x] v0.4.0 — Angry customer → waiter stressed reaction
- [x] v0.4.0 — Timer urgency (30s warning + last-10s pulse)
- [x] v0.4.0 — EconomySystem.ts architecture stub (ready for future)
- [x] v0.5.0 — Restaurant atmosphere (lamps, wall art, grout, wainscoting, candles)
- [x] v0.5.0 — 2-frame waiter walk animation (player/player_walk texture swap)
- [x] v0.5.0 — Steam particles from kitchen during cooking
- [x] v0.5.0 — Kitchen zone labels (COOKING / READY)
- [x] v0.5.0 — Visual texture improvements (player apron, table cloth, kitchen granite)
- [x] v0.5.0 — CarrySystem.ts architecture (1-item capacity, expandable to 2-3)
- [x] v0.6.0 — ART_DIRECTION.md / VISUAL_STYLE_GUIDE.md / LAYOUT_GUIDE.md written
- [x] v0.6.0 — Customer face coordinates fixed (eyeY was −4 on body, now −18 on head)
- [x] v0.6.0 — Patience bar moved above head (y=−42), pill shape, 36×5px
- [x] v0.6.0 — Speech bubble improved (shadow, shorter tail, warmer fill, 1.5px border)
- [x] v0.6.0 — All 7 customer variants: correct skin (#FDBA8C), head+body outlines, ears
- [x] v0.6.0 — Variant silhouettes: business tie/shoulders, elegant collar+necklace, trendy sunglasses extending, romantic flower, elder glasses+temples, teen cap brim
- [x] v0.6.0 — Player texture: head+body outlines, ears, apron pocket
- [x] v0.6.0 — Table: checkered linen cloth pattern
- [x] v0.6.0 — Kitchen: pot+pan silhouettes on burners
- [x] v0.6.0 — Menu board (chalkboard) above kitchen counter
- [x] v0.6.0 — Food plate background when carrying (food_plate texture + plateImage in Player)
- [x] v0.7.0 Phase 1 — Single dominant action priority system
  - `updateActionPriority()` in GameScene: 150ms rate-limited, hierarchy: urgent > paying > carrying > kitchen_ready > requesting > dirty
  - `setUrgencyLevel(isPrimary)` on Table: dims secondary pulses to 35% alpha
  - `setKitchenGlowPrimary(isPrimary)` in GameScene: full 0.1–0.7 alpha when primary, dim 0.04–0.25 when secondary
  - `setPriority('urgent')` auto-applied when customer patience < 25%
  - `takeOrder()`: removed premature `hideBubble()` — ❓ stays visible during walk
  - `showOrderFlash()` on Customer: warm tint flash on order assignment
- [ ] v0.7.0 Phase 2 — Customer behavior (balance values, anger escalation, personalities)
- [ ] v0.7.0 Phase 3 — Restaurant fantasy (names, reactions, tips)
- [ ] v0.7.0 Phase 4 — Reward systems (combo redesign, perfect service)
- [ ] v0.7.0 Phase 5 — Progression (XP, levels, unlocks)

## Known Blockers
- GitHub Pages requires one-time user action: Settings → Pages → Source → GitHub Actions
  URL: https://github.com/MordechaiN/TableRush/settings/pages
