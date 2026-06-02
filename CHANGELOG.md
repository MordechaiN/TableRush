# CHANGELOG

## v0.3.0 — 2026-06-02
### Added
- Cooking progress bars on kitchen tickets (green → orange as ready, clears on complete)
- Eating progress bar on customer sprite (fills over eat duration)
- Cleaning progress bar on table (animated fill during CLEAN_TIME)
- `exportSave()` / `importSave(json)` on ProgressionSystem for save portability
- Scale-punch animation on all floating score/status labels

### Changed
- Delivery now requires waiter to physically walk to table (`deliverFood` uses `walkTo`)
- Guard added: if customer goes angry during delivery walk, carry is cleared cleanly
- `cleanTable()` uses `table.startCleaningProgress()` instead of invisible `delayedCall`
- Pause button hidden on touch devices (ESC-only on desktop)
- `customer.seatBounce()` plays when customer first sits down
- `customer.startEating()` / `stopEating()` properly wired — eating bar visible during eat phase

## v0.2.0 — 2026-06-02
### Added
- Full visual redesign: warm palette (cream floor, mahogany tables, navy waiter)
- Layered procedural art: shadows, highlights, accessories on all characters
- 7 distinct customer variants with personality accessories (glasses, cap, flower, etc.)
- New customer lifecycle: `entering → requesting → ordering → waiting_food → eating → paying → leaving`
- Auto-order flow: player taps requesting customer, order assigned automatically (no popup)
- Kitchen queue system with ticket rail UI (tickets appear/disappear with animations)
- Priority pulse system: blue (requesting), orange (kitchen ready), gold (paying), red (urgent)
- Tutorial overlay for first session only (6 steps, tracked in localStorage)
- XP/Level/Stars progression system (ProgressionSystem.ts): 10 levels persisted
- Speed multiplier scoring: ×0.75–×2.0 based on patience at delivery
- Named combo milestones: GOOD SERVICE (×1.5 @ 3), HOT STREAK (×2.0 @ 5), UNSTOPPABLE (×2.5 @ 8), TABLE MASTER (×3.0 @ 10+)
- Star rating end-of-round: ⭐ (played), ⭐⭐ (70%+ happy), ⭐⭐⭐ (90%+ happy AND score ≥2000)
- End-of-round screen: stars animation, XP earned, XP bar tween, level-up flash, combo record, stats, next unlock hint
- SVG favicon (no more 404 on load)
- `window.game` exposed for testing/automation
- 15 validation screenshots

### Changed
- Patience: 45–120s (from broken 10–25s)
- Spawn interval: 8s start → 3.5s end (from 6s → 2.5s)
- Combo: reaches ×1.5 at 3 customers (from 10 customers for ×2)
- Angry customers leave table CLEAN — not dirty (correct behavior)
- Score penalty for angry leave: −50 to −150 (was 0)
- Body background: warm cream #F5E6C8 (was dark navy)
- All backgrounds, floors, and UI elements warm and inviting

## v0.1.1 — 2026-06-01
### Fixed
- GitHub Pages black screen: switched from gh-pages branch to actions/deploy-pages
- `vite.config.ts`: `VITE_BASE_PATH` env var; CI sets `/TableRush/` for absolute asset paths
- Verified fix: Playwright test at `/TableRush/` subpath — canvas renders correctly

## v0.1.0 — 2026-06-01
### Added
- Full MVP gameplay loop: customer spawn → order → cook → deliver → eat → pay → clean
- 5 tables with state machine (empty / occupied / dirty)
- 7 customer color variants with patience bar (green→yellow→red)
- 5 menu items: Burger, Pizza, Salad, Pasta, Sushi (different prices + cook times)
- Combo multiplier system (increments 0.1 per success, max 5x, resets on angry leave)
- 3-minute timed sessions with countdown HUD
- Difficulty ramp: spawn interval and patience both decrease each spawn
- High score persistence via localStorage
- Procedural texture generation (no external assets)
- Scenes: Boot, MainMenu, Game, Pause (ESC), GameOver, Credits, Settings
- Settings: SFX/Music toggles (UI), reset high score
- GameOver: animated score counter, new-record confetti
- GitHub Actions CI: build validation on push + GitHub Pages deploy on main
