# TableRush — MEMORY

_A new Claude session must understand the entire project by reading this file._

---

## Project Vision
Fast-paced restaurant management game. Player serves customers through a complete lifecycle: seat → take order → cook → deliver → collect payment → clean table. Short 3-minute sessions designed for score-chasing and replayability.

## Design Philosophy
- Sessions: 3 minutes (score-chase design)
- Addiction loop: combo multiplier, near-failure tension, constant feedback
- "Just one more round" feeling
- Easy to learn, hard to master
- No external assets — 100% procedural textures

## Credits
- Game Concept & Product Owner: Mordechai Neeman
- Implementation: Claude Code

---

## Architecture
- **Engine:** Phaser 3.87 + Vite 5 + TypeScript (strict)
- **Entry:** `src/main.ts` → Phaser.Game with scene list
- **Textures:** All generated in BootScene using `scene.make.graphics()` → `generateTexture()`
- **Storage:** `localStorage` for high score + settings

## Scene Flow
```
BootScene (generate textures)
  → MainMenuScene (Play / Settings / Credits / High Score)
    → GameScene (3-min gameplay loop)
      ↔ PauseScene (ESC overlay)
    → GameOverScene (score tally, new record, retry)
    → SettingsScene (SFX/Music toggles, reset score)
    → CreditsScene
```

## Key Files
```
src/main.ts                  — Phaser config + scene registration
src/config/GameConfig.ts     — ALL tunable constants (colors, difficulty, menu items)
src/scenes/BootScene.ts      — Procedural texture generation
src/scenes/GameScene.ts      — Core gameplay (500 lines)
src/entities/Customer.ts     — Customer state machine + patience bar
src/entities/Table.ts        — Table state + glow animations
src/entities/Player.ts       — Player container + walkTo() movement
```

## Gameplay Systems

### Customer Lifecycle (state machine)
`entering → seated → ordering → waiting_food → eating → paying → leaving`
- Angry path: any waiting state + patience=0 → `angry` → leaves, combo resets

### Player Interaction (tap-to-act)
- Tap table with **seated** customer → order menu popup (5 items)
- Tap table with **waiting_food** customer (player carrying food) → deliver
- Tap table with **paying** customer → collect payment
- Tap **dirty** table → clean

### Order Flow
1. Player taps seated customer → menu popup
2. Item selected → player `walkTo(kitchen)` → `cookTime` delay → player `walkTo(table)`
3. Player arrives at table with food → table glows, player must tap again to deliver
4. Customer eats (3–5s random) → state = paying
5. Player taps → payment collected, tip based on patience fraction

### Score
- Delivery: `itemPrice * 10 * multiplier`
- Payment: `(itemPrice + tip) * 10 * multiplier + 50`
- Combo multiplier: increments 0.1 per consecutive payment, max 5x
- Angry customer resets combo to 1x

### Difficulty (GameConfig.ts)
```
INITIAL_SPAWN_INTERVAL: 6000ms  → ramps down to MIN: 2500ms
INITIAL_PATIENCE:      25000ms  → ramps down to MIN: 10000ms
SPAWN_RAMP_RATE: 0.97 per spawn
PATIENCE_RAMP_RATE: 0.98 per spawn
```

### Tables
- 5 fixed positions in `TABLE_POSITIONS`
- States: `empty | occupied | dirty`
- Dirty tables block new customers until cleaned

### Menu Items (5)
| Name | Price | Cook Time |
|------|-------|-----------|
| Burger | $12 | 3s |
| Pizza | $15 | 4s |
| Salad | $10 | 2s |
| Pasta | $13 | 3.5s |
| Sushi | $18 | 2.5s |

---

## Repository Structure
```
/
├── index.html
├── package.json / tsconfig.json / vite.config.ts
├── .gitignore
├── .github/workflows/ci.yml   — CI build + GitHub Pages deploy on main push
├── src/
│   ├── main.ts
│   ├── config/GameConfig.ts
│   ├── entities/Customer.ts / Table.ts / Player.ts
│   └── scenes/BootScene.ts / MainMenuScene.ts / GameScene.ts /
│             PauseScene.ts / GameOverScene.ts / CreditsScene.ts / SettingsScene.ts
├── MEMORY.md / PROJECT_STATUS.md / CHANGELOG.md
├── KNOWN_ISSUES.md / ROADMAP.md / TEST_REPORT.md
└── README.md
```

---

## Git Governance
- **Branch:** `main` (direct commits, no PRs)
- **Workflow:** `git add . && git commit && git push`
- **CI:** GitHub Actions on push to main → build validation + GitHub Pages deploy

## Deployment
- Local: `npm run dev` → http://localhost:3000
- Production: `npm run build` → `dist/`
- GitHub Pages: auto-deployed from main via `peaceiris/actions-gh-pages@v3`
- `vite.config.ts` uses `base: './'` for relative asset paths

---

## Current Priorities
1. MVP complete and pushed to main ✅
2. All core mechanics verified ✅
3. Next: gameplay polish — audio, better animations, visual feedback

## Known Issues
- No audio (Settings UI is placeholder only)
- Phaser bundle > 500KB (expected, not a bug)
