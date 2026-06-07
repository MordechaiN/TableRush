# PROJECT STATUS

**Last Updated:** 2026-06-07
**Current Version:** v2.0.0 (Final Alpha Sprint — Living Restaurant)

---

## Current Focus
Final Alpha Sprint (2026-06-07) — Content Progression: Living Restaurant

### Phase 1: Special Situations ✅
- ✅ Business Lunch: mid-session wave of 3-4 business customers (impatient, ×1.5 tip)
- ✅ Family Table: dessert round before checkout (×2.2 payout), announces DESSERT TIME
- ✅ Critic Night: critic arrives early (25-45s); critic angry if any table walks out
- ✅ Birthday Night: birthday customer triggers ×2 chain boost on next 3 payments
- ✅ VIP Night: VIP customer rate 10%→30%

### Phase 2: Restaurant Evolution ✅
- ✅ Level 4+: Coffee bar station (upper right)
- ✅ Level 6+: Dessert display case (pass zone right)
- ✅ Level 7+: VIP velvet rope across entry
- ✅ Level 10+: TABLE MASTER EDITION banner

### Phase 3: Session Variety ✅
- ✅ 5 session types with cinematic announcements: business_lunch, family_day, critic_night, birthday_night, vip_night
- ✅ Session types unlock progressively by level (business/family: L3+, birthday: L4+, critic: L5+, vip: L6+)
- ✅ rollSessionType() generates different distributions per level tier

### Phase 4: Player Stories ✅
- ✅ storyEvents[] tracked throughout session (10 event types)
- ✅ GameOverScene shows up to 4 story lines describing what was unique about this shift

### Documentation ✅
- ✅ MEMORY.md updated
- ✅ PROJECT_STATUS.md updated
- ✅ CHANGELOG.md updated
- ✅ ALPHA_COMPLETION_REPORT.md created
- ✅ COMMERCIAL_AUDIT.md created
- ✅ CONTENT_PROGRESSION_PLAN.md created

---

## Previously Complete: Final Product Sprint (2026-06-04)
- ✅ Float emojis depth 19 (above player/arrows): ordered food, 😋 eating, 💳 paying, 🍽️ dirty
- ✅ Pulsing seat ring: yellow circle marks customer position at table
- ✅ Queue count display: "N GUESTS WAITING" updated on every queue change
- ✅ Cooking-on-burner visual: food in pot bobbing on active burner
- ✅ READY pop text: bright green announcement below kitchen counter
- ✅ Escalating camera shake+flash at combo milestones ×2/3/4/5
- ✅ Green camera flash when food is ready
- ✅ Eating/paying state emojis (😋/💳) bouncing above table
- ✅ Player scale 2.0 (hero scale)
- ✅ Burgundy tablecloths (0x9B1C2A)
- ✅ Floor color overhaul (amber/terracotta)
- ✅ Main menu ambient sparkle particles
- ✅ Combo celebration: 34px text + 22 confetti pieces

## Previous: System Redesign Pass (2026-06-04) — top 5 alpha blockers resolved completely:
- ✅ Single focus indicator: only #1 priority arrow visible; all others alpha=0
- ✅ Customer seated position: moved from table.y-24 → table.y-6 — head+shoulders above table, chair back visible
- ✅ Two-item tray carry: CarrySystem(2) integrated; one kitchen trip picks up 2 dishes
- ✅ Physical food on counter: ready plates spawn with food emoji + table number, disappear on pickup
- ✅ Non-blocking dirty dishes: carryingDirty no longer blocks; player.showDirtyDish() badge independent of tray

Previous Visual Environment Pass — replacing prototype markers:
- ✅ Pendant lamps above all 5 dining tables, warm floor glow pools
- ✅ Thick granite service counter (no PICK UP label)
- ✅ Kitchen labels → small 50%-alpha inline text (no pill buttons)
- ✅ DISHWASHER / HOST / WAIT HERE text labels removed

Previous RC1 Sprint — 5 phases complete:
- ✅ Removed text labels: "DISHWASHER", "HOST", "WAIT HERE" — space communicates itself
- ✅ Replaced kitchen COOKING/READY pill badges with small 50%-alpha inline labels
- ✅ Replaced thin ledge + "PICK UP" text with thick granite service counter
- ✅ Added pendant lamp fixtures (amber hanging shades + cords) above all 5 dining tables
- ✅ Added warm glow pools (depth 0, 6.5% alpha) beneath each table for candlelit ambiance

Previous RC1 Sprint — 5 phases complete:
- ✅ Phase 1: UI/UX Redesign — HUD tri-badge pills, main menu logo card + animations, game over cinematic
- ✅ Phase 2: Art Direction — consistent visual language across all 6 scenes (tile floors, walls, cream panels)
- ✅ Phase 3: Animation — customer food reaction, happy exit, main menu entrance, game over header
- ✅ Phase 4: Audio — SoundManager.ts (Web Audio API, 12 sound types), all events wired, SFX toggle works
- ✅ Phase 5: Release Quality — zero console errors, full loop tested, docs updated

## Next Candidates
- Music: background restaurant ambiance (currently "coming in future update")
- Customer eating animation (visible fork motion / head nod while eating bar fills)
- More customer variant idle personalities (distinct per variant)
- End-of-shift tip screen with customer name callouts
- Menu scene polish (animated chalkboard)
- Multi-item carry (expand CarrySystem.ts to 2-3 items)

## Design Documents Status (all approved)
- [x] VISUAL_REBOOT_PLAN.md — approved, in progress
- [x] ADDICTION_AND_RETENTION_PLAN.md — approved, post-visual-reboot queue
- [x] GAME_IDENTITY.md — approved, strategic reference

## Visual Reboot Status
- [x] P0: Action arrow indicator — depth-15 scene arrow, scale pulse, 5 colors, primary/secondary scale
- [x] P1: Customer redesign — 48×72px, r=14 head, 2.5px outlines, r=3 eyes+highlight, 44×8 patience bar, name banners
- [x] Quality Gate: P0_P1_REVIEW.md complete — 6/10 pass, 2 marginal, mobile unconfirmed
- [x] P0.5 Hotfix: Urgent strobe, dirty amber, secondary 0.35, Elegant earrings+collar, Casual stripes, mobile confirmed
- [x] P2: Retention HUD — combo visible, 5-stage escalation, progress bar, streak loss feedback, shift report ← COMPLETE
- [x] Restaurant Reboot (v0.9.3) — seating overlay, chairs, mess graphics, instant clean, dishwasher, food inventory model ← COMPLETE
- [x] v1.0 Restaurant Immersion — side walls, zone badges, entrance door, table numbers, candle flicker, gold coins, main menu scene ← COMPLETE
- [x] v1.1 Restaurant Simulation — entrance queue, dirty dish carry, dishwasher station interactive, purple seating arrows, 7-step tutorial ← COMPLETE
- [x] v1.2 Living Restaurant — idle behaviors, rush hour, VIP customer, queue patience, player 1.25×, dishwasher steam ← COMPLETE
- [x] v1.3 Visual Clarity — dirty table orange tint, arrows 33% larger, ready ticket pop, kitchen UI cleaner, customer seated 4px higher ← COMPLETE
- [x] v1.4 Alpha — table state visuals (menu/ticket/plate/bill), kitchen COOKING/READY zones, host stand, queue zone, recipe strip, compact tutorial, menu board fix ← COMPLETE
- [x] v1.0.0 Release — Settings/Credits scene polish, tile backgrounds, card panels, version numbers, food emoji row, RELEASE_CHECKLIST.md ← COMPLETE
- [x] RC1 Polish Sprint — Audio (SoundManager, 12 sounds), HUD tri-badge pills, main menu logo card/animations, game over cinematic, customer food/exit reactions ← COMPLETE
- [ ] v1.1 — Music system (background restaurant ambiance)
- [ ] Customer eating/happy animations (more visible fork motion)
- [ ] Animated entrance customers
- [ ] P4: Table redesign (clean cloth, numbered)
- [ ] P5: Kitchen redesign (readable tickets, bold ready zone)
- [ ] P6: Speech bubbles (state-specific shapes)
- [ ] P7: Main menu (restaurant background)
- [ ] P8: Game Over (emotional headers)
- [ ] P9: Tutorial (fix text timing)

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
