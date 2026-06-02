# TableRush — MEMORY

_A new Claude session must understand the entire project by reading this file._

---

## Project Vision
Fast-paced restaurant management game. Premium casual — think Overcooked/Good Pizza Great Pizza. Player serves customers through a complete lifecycle. Short 3-minute sessions. The core question for every mechanic: **"Will this make players want one more round?"**

## Design Philosophy
- Fun and retention over realism
- Player NEVER wonders what to do — highest-priority task always visually obvious
- First reward within 30s, first combo within 60s, want another round after 3 min
- Mobile-first (thumb-friendly UI)
- Simple but clean art — readability over polish

## Credits
- Game Concept & Product Owner: Mordechai Neeman
- Implementation: Claude Code

---

## Current State: v0.2.0 IMPLEMENTED AND VALIDATED

**v0.2.0 is fully implemented, passing 20/20 validation tests, and pushed to main.**
**AWAITING owner review before any further development.**

---

## Git Governance (CRITICAL)
- **Branch:** `main` ONLY. Direct commits. No PRs. No feature branches.
- **Workflow:** `git add . && git commit && git push origin main`
- **CI:** GitHub Actions → type check + build + deploy-pages on push to main

---

## Architecture
- **Engine:** Phaser 3.87 + Vite 5 + TypeScript (strict)
- **Entry:** `src/main.ts` → `window.game = new Phaser.Game(config)`
- **Textures:** All generated in BootScene using `scene.make.graphics()` → `generateTexture()`
- **Storage:** `localStorage` for progress (XP, level, highScore, bestStars, totalRounds, tutorialDone)
- **Build:** `VITE_BASE_PATH=/TableRush/ npm run build` for GitHub Pages

## Scene Flow
```
BootScene (generate textures)
  → MainMenuScene (Play / Settings / Credits / Level / High Score)
    → GameScene (3-min gameplay loop with tutorial on first play)
      ↔ PauseScene (ESC overlay)
    → GameOverScene (reward screen: stars, XP, level progress, stats)
    → SettingsScene
    → CreditsScene
```

## Key Files
```
src/main.ts                        — Phaser config + scene list (window.game exposed)
src/config/GameConfig.ts           — ALL constants (palette, difficulty tiers, menu items, combo milestones)
src/systems/ProgressionSystem.ts   — XP/Level/Stars persistence (localStorage)
src/scenes/BootScene.ts            — Procedural texture generation (warm art style)
src/scenes/GameScene.ts            — Core gameplay
src/scenes/GameOverScene.ts        — Reward screen (stars, XP bar, stats)
src/scenes/MainMenuScene.ts        — Main menu (shows level + best score)
src/entities/Customer.ts           — Customer state machine + mood faces + patience bar
src/entities/Table.ts              — Table state + priority pulse system
src/entities/Player.ts             — Waiter character + idle bob + tray carry display
screenshots/                       — Validation screenshots (v_01 through v_15)
V0_2_REVIEW.md                     — Player experience review + screenshot descriptions
VALIDATION_REPORT.md               — 20/20 test results
```

## Gameplay Systems (v0.2.0)

### Customer Lifecycle
```
entering → seated → requesting → ordering → waiting_food → eating → paying → leaving
                                                                              ↓
                                                                         table dirty → clean → empty
```
- `requesting`: customer shows ❓ bubble, table pulses blue
- `ordering`: player arrives, order AUTO-ASSIGNED (no popup), added to kitchen queue
- `waiting_food`: order cooking in kitchen queue
- Angry path: patience=0 → score penalty → table immediately CLEAN (no cleaning needed)

### Kitchen Queue System
- Array of `KitchenOrder` objects: `{ id, tableId, customerId, item, startTime, ready }`
- All orders cook in parallel (timers tick simultaneously)
- Kitchen area glows orange when any order is ready
- Player taps kitchen → picks up oldest ready order (shows food above waiter head)
- Destination table highlighted — player taps it to deliver

### Player Interaction (tap-to-act, context-sensitive)
| Table state | Player action | Result |
|-------------|---------------|--------|
| Customer REQUESTING | Tap table | Player walks → auto-orders |
| Kitchen (order ready) | Tap kitchen | Player picks up food |
| Customer WAITING_FOOD (player carrying) | Tap table | Deliver food |
| Customer PAYING | Tap table | Collect payment |
| Table DIRTY | Tap table | Clean (1.5s) |

### Priority Visual System
| Priority | Color | Animation |
|----------|-------|-----------|
| Patience < 25% | Red pulse | Fast 300ms yoyo |
| Kitchen has ready order | Orange glow | 500ms yoyo |
| Customer REQUESTING | Blue pulse | 700ms yoyo |
| Customer PAYING | Gold shimmer | 600ms yoyo |
| Table DIRTY | Broom icon | Static |

### Score System
- Delivery: `item.price × 10 × speedMultiplier × comboMultiplier`
- Payment: `(item.price + tip) × 5 × comboMultiplier`
- Speed multiplier based on patience remaining at delivery time (×0.75–×2.0)
- Angry customer: penalty −50/−100/−150 per difficulty tier, combo reset

### Combo System (named milestones)
| Consecutive happy customers | Multiplier | Name |
|-----------------------------|------------|------|
| 0–2 | ×1.0 | — |
| 3–4 | ×1.5 | GOOD SERVICE |
| 5–7 | ×2.0 | HOT STREAK 🔥 |
| 8–9 | ×2.5 | UNSTOPPABLE 🔥🔥 |
| 10+ | ×3.0 | TABLE MASTER 💫 |

### Difficulty (time-based tiers, not ramp)
| Elapsed time | Patience range | Spawn interval |
|-------------|----------------|----------------|
| 0–60s | 90–120s | 8000→7000ms |
| 60–120s | 60–90s | 5500→4500ms |
| 120–180s | 45–65s | 4000→3500ms |

### Tutorial (first session only)
6 steps shown via text overlay at bottom of screen. Tracked in localStorage. One customer at a time during tutorial.

### Progression System (ProgressionSystem.ts)
- XP = score / 10 per round
- 10 levels, thresholds: [0, 300, 700, 1300, 2200, 3500, 5500, 8000, 11000, 15000]
- Persisted: xp, level, highScore, bestStars, totalRounds
- Tutorial done: `tablerush_tutorial_done` = '1'

### End-of-Round Screen (GameOverScene)
Shows: Score | Best Score | Stars (1-3) | XP earned | Level progress bar | Combo record | Customers served | Next unlock hint

### Star Rating
- ⭐⭐⭐: ≥90% customers served happy AND score ≥2000
- ⭐⭐: ≥70% customers served happy
- ⭐: completed the round

## Palette (warm restaurant)
- Floor: `#F5E6C8` / `#EDD9A3`
- Table: `#8B4513` mahogany + `#FDFAF6` tablecloth
- Waiter: `#1A237E` navy jacket, `#FDA07A` skin
- UI: `#FF6B35` orange, `#FFD700` gold, `#4CAF50` green, `#F44336` red

## Repository Structure
```
/
├── index.html                     (warm cream body bg, SVG favicon)
├── package.json / tsconfig.json / vite.config.ts
├── .github/workflows/ci.yml       — CI + GitHub Pages (actions/deploy-pages)
├── src/
│   ├── main.ts                    (window.game exposed for testing)
│   ├── config/GameConfig.ts
│   ├── systems/ProgressionSystem.ts
│   ├── entities/Customer.ts / Table.ts / Player.ts
│   └── scenes/ (7 scenes)
├── screenshots/                   (v0.2.0 validation screenshots)
├── MEMORY.md / PROJECT_STATUS.md / CHANGELOG.md
├── GAMEPLAY_REDESIGN.md / VISUAL_REDESIGN.md / BALANCE_REDESIGN.md
├── V0_2_REVIEW.md                 (player experience review)
├── VALIDATION_REPORT.md           (20/20 PASS)
└── README.md
```

## Known Issues (v0.2.0)
- No audio (Settings toggles are UI-only placeholders)
- Phaser bundle ~1.5MB (expected for game engine)
