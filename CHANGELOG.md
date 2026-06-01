# CHANGELOG

## v0.1.0 — 2026-06-01
### Added
- Initial MVP implementation
- Full gameplay loop: customer spawn → order → cook → deliver → pay → clean
- 5 tables, 7 customer types, 5 menu items
- Combo multiplier system (up to 5x)
- 3-minute timed sessions
- Patience system with visual bar
- Procedural textures (no external assets)
- All scenes: Boot, MainMenu, Game, Pause, GameOver, Credits, Settings
- High score persistence via localStorage
- GitHub Actions CI + GitHub Pages deploy workflow
- Difficulty ramp (spawn interval and patience decrease over time)
