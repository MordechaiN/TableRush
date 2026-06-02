# CHANGELOG

## v0.2.0 — IN PROGRESS
### Added
- Full visual redesign: warm palette (cream floor, mahogany tables, navy waiter)
- Layered procedural art: shadows, gradients, highlights on all characters
- 7 distinct customer variants with personality accessories
- New customer lifecycle: `entering → seated → requesting → ordering → waiting_food → eating → paying → leaving`
- Auto-order flow: player taps requesting customer, order assigned automatically (no popup)
- Kitchen queue system with ticket rail UI
- Priority pulse system: color-coded table animations always show highest-priority action
- Tutorial overlay (first session only, 6 steps, tracked in localStorage)
- XP/Level/Stars progression system (ProgressionSystem.ts)
- Speed multiplier scoring (×0.75 to ×2.0 based on patience at delivery)
- Named combo milestones: GOOD SERVICE (×1.5 @ 3), HOT STREAK (×2.0 @ 5), UNSTOPPABLE (×2.5 @ 8), TABLE MASTER (×3.0 @ 10+)
- Star rating end-of-round: ⭐ (played), ⭐⭐ (70%+ happy), ⭐⭐⭐ (90%+ happy AND score ≥2000)
- End-of-round screen: stars, XP earned, level progress bar, combo record, customers served, next unlock hint
- Angry customers leave clean tables (no cleaning needed — correct behavior)
- Time-based difficulty tiers instead of exponential ramp

### Changed
- Patience: 45–120s (from broken 10–25s)
- Spawn interval: 8s start → 3.5s end (from 6s → 2.5s)
- Combo: reaches ×1.5 at 3 customers (from 10 customers for ×2)
- Score penalty for angry leave: −50 to −150 (was 0)
- All backgrounds, floors, and UI elements warm and inviting (not cold/dark)

## v0.1.1 — 2026-06-01
### Fixed
- GitHub Pages black screen: root cause was Pages serving from `main` branch root (dev `index.html` with `/src/main.ts` — TypeScript, unexecutable by browsers)
- Switched workflow to `actions/upload-pages-artifact` + `actions/deploy-pages` (official GitHub Pages deployment)
- `vite.config.ts`: `VITE_BASE_PATH` env var; CI sets `/TableRush/` so built assets use absolute paths
- Verified fix: Playwright headless test at simulated `/TableRush/` subpath — canvas renders, 0 errors

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
