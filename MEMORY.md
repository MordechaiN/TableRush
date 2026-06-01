# TableRush — MEMORY

## Project Vision
Fast-paced restaurant management game. Player serves customers: seat → take order → cook → deliver → collect payment → clean. Short 3-min sessions, score/combo system, increasing difficulty.

## Architecture
- **Engine:** Phaser 3 with Vite + TypeScript
- **Entry:** `src/main.ts` → initializes Phaser game
- **Scenes:** BootScene → MainMenuScene → GameScene (PauseScene overlay) → GameOverScene
- **Entities:** Customer, Table, Player (Phaser Container subclasses)
- **Config:** `src/config/GameConfig.ts` — all tunable constants
- **Textures:** Procedurally generated in BootScene (no external assets)
- **Storage:** localStorage for high score, settings

## Scene Flow
```
BootScene (generate textures)
  → MainMenuScene (Play / Settings / Credits)
    → GameScene (3-min gameplay)
      ↔ PauseScene (overlay, ESC)
    → GameOverScene (score display, retry)
    → SettingsScene
    → CreditsScene
```

## Gameplay Systems
1. **Customer lifecycle:** entering → seated → ordering → waiting_food → eating → paying → leaving
2. **Player:** clicks tables to interact; moves to table, performs action
3. **Order menu:** tap table when customer is seated → popup shows 5 menu items
4. **Food delivery:** player walks to kitchen, waits cook time, walks back
5. **Payment:** collect payment + tip based on remaining patience
6. **Patience bar:** depletes while customer waits; reaching 0 = angry leave + combo reset
7. **Combo system:** consecutive successful payments → multiplier up to 5x
8. **Difficulty ramp:** spawn interval and patience duration both decrease each spawn

## Tables
- 5 tables with fixed positions in `TABLE_POSITIONS`
- States: empty | occupied | dirty | served
- Dirty tables must be cleaned before new customers can sit

## Menu Items
- Burger $12 (3s cook), Pizza $15 (4s), Salad $10 (2s), Pasta $13 (3.5s), Sushi $18 (2.5s)

## Repository Structure
```
/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .gitignore
├── .github/workflows/ci.yml
├── src/
│   ├── main.ts
│   ├── config/GameConfig.ts
│   ├── scenes/BootScene.ts
│   ├── scenes/MainMenuScene.ts
│   ├── scenes/GameScene.ts
│   ├── scenes/PauseScene.ts
│   ├── scenes/GameOverScene.ts
│   ├── scenes/CreditsScene.ts
│   ├── scenes/SettingsScene.ts
│   ├── entities/Customer.ts
│   ├── entities/Table.ts
│   └── entities/Player.ts
├── docs/
├── assets/
└── docs/ (MEMORY, STATUS, CHANGELOG, ROADMAP, KNOWN_ISSUES)
```

## Important Decisions
- No external assets — all textures procedurally generated in BootScene
- Single-tap interaction model (tap table = context-sensitive action)
- Player moves to table before acting (visual feedback)
- Order panel appears at bottom when taking order
- 3-minute timed game loop (not endless to force high-score chase)

## Deployment
- GitHub Pages via `peaceiris/actions-gh-pages@v3` on main push
- `vite.config.ts` uses `base: './'` for relative paths
- Local: `npm run dev` on port 3000

## Current Priorities
- MVP complete: all core mechanics implemented
- Next: verify build passes, test gameplay loop
