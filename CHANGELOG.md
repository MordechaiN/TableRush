# CHANGELOG

## v0.1.1 — 2026-06-01
### Fixed
- GitHub Pages black screen: root cause was Pages serving from `main` branch root (dev `index.html` with `/src/main.ts` — TypeScript, unexecutable by browsers)
- Switched workflow to `actions/upload-pages-artifact` + `actions/deploy-pages` (official GitHub Pages deployment, eliminates gh-pages branch confusion)
- `vite.config.ts`: `VITE_BASE_PATH` env var; CI sets `/TableRush/` so built assets use absolute paths, unambiguous at any subpath
- Verified fix: Playwright headless test at simulated `/TableRush/` subpath — canvas renders, 0 errors, 0 network failures

## v0.2.0 — PENDING APPROVAL
### Planned (not yet implemented — awaiting approval)
- Full visual redesign: warm palette, layered procedural art, distinct characters
- Gameplay redesign: auto-order flow, priority pulse system, tutorial
- Balance redesign: 45–120s patience, speed bonuses, ×3 combo cap, star rating
- See: GAMEPLAY_REDESIGN.md, VISUAL_REDESIGN.md, BALANCE_REDESIGN.md

## v0.1.1 — 2026-06-01
### Fixed
- GitHub Pages black screen: switched from gh-pages branch to actions/deploy-pages
- vite.config.ts: VITE_BASE_PATH env var; CI sets /TableRush/ for absolute asset paths
- Verified: Playwright test at /TableRush/ subpath confirms canvas renders correctly

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
- All documentation: MEMORY, PROJECT_STATUS, CHANGELOG, ROADMAP, KNOWN_ISSUES, TEST_REPORT, README
