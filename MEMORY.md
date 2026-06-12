# TableRush — MEMORY

_A new Claude session must understand the entire project by reading this file._

---

## GOVERNANCE — READ THIS FIRST

### Branch Rule — PERMANENT
- **main is the ONLY branch.** No feature branches. No draft PRs. No pull requests.
- After every completed task: commit directly to main
- Never discuss branch management. Just push to main.

### Project Phase — PERMANENT
- Design phase: COMPLETE.
- Visual Reboot: COMPLETE (P0, P1, P0.5, P2 done).
- Alpha phase: COMPLETE.
- **Production Release: COMPLETE (2026-06-12). v1.0.0 shipped.**
- We are in the **post-release** phase. Focus: player feedback, retention, and incremental improvements.
- Every decision answers one question: **Does this make TableRush more fun to play?**

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

## Current State: v1.0.0 — PRODUCTION RELEASE

**Released: 2026-06-12**
**Play:** https://mordechaIn.github.io/TableRush/

### Production Sprint (2026-06-12) — All Phases Completed

**Phase 2-3: Game Feel + Animations (Player.ts, Customer.ts)**
- Tray sway pendulum when walking with food (±0.09 rad, 290ms, snaps level on arrival)
- Dish bounce on delivery: waiter extends y−14 at scale 1.2 simultaneously
- TABLE MASTER 360° tray spin at 15-serve streak
- Customer eating: Y bob + scaleY squish simultaneously (90ms×6) = actual chewing
- Happy exit: 30px jump + squash-and-stretch (was 16px simple bounce)
- Food reaction: squash-and-stretch instead of uniform scale
- Patience bar wobbles horizontally when critically low (<15%)

**Phase 4: Audio (SoundManager.ts)**
- `unlock()` method — resumes suspended AudioContext, starts music
- `uiClick()` calls `unlock()` first — music starts after first button tap on mobile
- `startMusic()` checks context state, retries after resume if needed
- `customerHappy()` new sound — warm G major arpeggio after payment coins
- `unlockEarned()` new sound — rising fanfare for level-ups
- localStorage try/catch safety for private browsing

**Phase 4b: Mute Controls (PauseScene.ts)**
- SFX and Music toggle buttons directly in pause overlay
- No need to go to Settings to mute mid-game

**Phase 5+: Documentation**
- PRODUCTION_AUDIT.md (10-category, scores 4–8/10, overall 7.4/10)
- PERFORMANCE_REPORT.md
- MOBILE_READINESS_REPORT.md
- RELEASE_NOTES_v1.0.0.md
- PRODUCTION_VALIDATION_REPORT.md (20/20 sessions PASS)
- KNOWN_ISSUES.md corrected (removed false "no audio" claim)

---

## Architecture
- **Engine:** Phaser 3.87 + Vite 5 + TypeScript (strict)
- **Canvas:** 480×854 (portrait, mobile-first)
- **Scale:** `Phaser.Scale.FIT` + `CENTER_BOTH`
- **Entry:** `src/main.ts` → `window.game = new Phaser.Game(config)`
- **Textures:** All generated in BootScene using `scene.make.graphics()` → `generateTexture()`. SVG assets loaded via `load.svg()`.
- **Storage:** `localStorage` for progress (XP, level, highScore, bestStars, totalRounds, tutorialDone, sfx, music)
- **Build:** `VITE_BASE_PATH=/TableRush/ npm run build` for GitHub Pages
- **Deploy:** GitHub Actions CI → type check + build + deploy-pages on push to main

## Scene Flow
```
BootScene (generate textures + load SVGs)
  → MainMenuScene (Play / Settings / Credits / Level / High Score / Daily Goal)
    → GameScene (3-min gameplay loop with tutorial on first play)
      ↔ PauseScene (ESC overlay + SFX/Music mute toggles)
    → GameOverScene (reward screen: stars, XP, level progress, shift report)
    → SettingsScene
    → CreditsScene
```

## Key Files
```
src/main.ts                        — Phaser config + scene list
src/config/GameConfig.ts           — ALL constants (palette, difficulty, menu items, combo milestones)
src/systems/ProgressionSystem.ts   — XP/Level/Stars persistence
src/systems/EconomySystem.ts       — Economy stub (not yet active)
src/systems/CarrySystem.ts         — 1–4 slot tray carry system
src/systems/SoundManager.ts        — Web Audio API synthesis (16 sounds + music)
src/scenes/BootScene.ts            — Procedural texture + SVG loading
src/scenes/GameScene.ts            — Core gameplay (132KB — do NOT rewrite without full read)
src/scenes/GameOverScene.ts        — Reward screen
src/scenes/MainMenuScene.ts        — Main menu
src/scenes/PauseScene.ts           — Pause overlay with mute controls
src/entities/Customer.ts           — Customer state machine + animations
src/entities/Table.ts              — Table state + priority arrow
src/entities/Player.ts             — Waiter + tray sway + emotion system
```

## CRITICAL: GameScene.ts Is 132KB
Do NOT attempt to read and rewrite GameScene.ts in a single API call — the response will be truncated and you'll lose data. To make changes:
1. Read the specific section you need (search for method by name)
2. Make targeted changes
3. Use the GitHub Contents API to fetch and diff

## SVG Assets (`public/assets/`)
- `characters/waiter.svg`, `characters/waiter_walk.svg`
- `characters/customer_0-6.svg` (7 variants)
- `food/salad.svg`, `food/burger.svg`, `food/pasta.svg`, `food/sushi.svg`, `food/pizza.svg`
- `decorations/potted_plant.svg`, `decorations/herb_plant.svg`
- `icons/plate_badge.svg`

## Gameplay Systems

### Customer Lifecycle
```
entering → seated → requesting → ordering → waiting_food → eating → paying → leaving
                                                                         ↓
                                                                    table dirty → clean → empty
```
- Angry path: patience=0 → score penalty → table IMMEDIATELY empty (no cleaning needed)

### Kitchen Queue System
- Array of `KitchenOrder` objects cooking in parallel
- Player taps kitchen → picks up all ready orders (up to tray capacity)
- Physical ready plate sprites on counter; steam wisps; READY pop text
- Cooking-on-burner visual: food in pot, bobbing animation

### Priority Visual System
| Priority | Color | Condition |
|----------|-------|-----------|
| Urgent | Red | Patience < 25% |
| Paying | Gold | Customer PAYING |
| Kitchen Ready | Orange | Order ready + carrying |
| Requesting | Blue | Customer wants to order |
| Seating | Purple | Queue non-empty + empty table |
| Dirty | Brown | Table needs cleaning |

Only ONE table shows its arrow at a time (single-focus system).

### Score System
- Delivery: `price × 10 × speedMult × comboMult`
- Payment: `(price + tip) × 5 × comboMult × vipMult × ...`
- Speed multiplier: ×0.75–×2.0 based on patience remaining
- Angry customer: −50/−100/−150 penalty, combo reset

### Combo System
| Streak | Multiplier | Name |
|--------|-----------|------|
| 0–2 | ×1 | — |
| 3–5 | ×2 | HOT STREAK |
| 6–9 | ×3 | ON FIRE |
| 10–14 | ×4 | TABLE LEGEND |
| 15+ | ×5 | TABLE MASTER |

Combo Shield (Level 6+): first break from ×3+ falls to ×2.

### Session Types (Level-gated)
| Type | Level | Feature |
|------|-------|---------|
| normal | 1+ | Standard |
| business_lunch | 3+ | Mid-session wave, ×1.5 tips |
| birthday_night | 4+ | Birthday customer, ×2 chain |
| family_day | 3+ | Dessert round, ×2.2 payout |
| critic_night | 5+ | Critic tracks service quality |
| vip_night | 6+ | 30% VIP rate, ×2.5 tips |

### Difficulty Tiers
| Time | Patience | Spawn Interval |
|------|----------|----------------|
| 0–60s | 48–58s | 8000→7000ms |
| 60–120s | 30–38s | 5500→4500ms |
| 120–180s | 20–26s | 4000→3500ms |

### Progression System
- XP = score / 10 per round
- 10 levels (thresholds: 0, 300, 700, 1300, 2200, 3500, 5500, 8000, 11000, 15000)
- Persisted: xp, level, highScore, bestStars, totalRounds, lastScore, bestCombo, dailyGoal
- Tutorial: `tablerush_tutorial_done` = '1'

## Audio System (SoundManager.ts)
- Static class, Web Audio API synthesis (no external files)
- Mobile unlock: `SoundManager.unlock()` called from `uiClick()` on first interaction
- Music: 4-chord loop (Cmaj7→Am7→Fmaj7→G7), triangle oscillator piano, 108 BPM
- 16 sounds: uiClick, seatCustomer, orderTaken, foodReady, deliverFood, paymentCollected,
  customerHappy, comboUp(tier), comboLost, customerAngry, dishwasher, rushHour, roundEnd,
  timerWarning, customerArrival, nearMiss, unlockEarned, starReveal
- SFX key: `tablerush_sfx` | Music key: `tablerush_music`

## Known Issues (v1.0.0)
- Portrait only — no landscape
- Music repeats every ~8s (4-bar loop)
- No fullscreen API / PWA manifest
- Dishwasher touch target 60×56px (slightly below 44pt guideline)
- No keyboard gameplay (ESC pause only)
- No social share or leaderboard
- No cancel action for waiter path

## Post-v1.0.0 Roadmap Ideas
1. Second music theme variant
2. Landscape orientation support
3. Color-blind patience bar alternative
4. Social share screenshot
5. Cancel waiter action
6. PWA manifest / install-to-homescreen
7. External leaderboard (optional)

## Palette (warm restaurant)
- Floor: `#2E1E0F` dark walnut + `#251508` alt planks
- Table: `#8B4513` mahogany + `#F5F0E8` linen ivory
- Waiter: `#1A237E` navy jacket, `#FDA07A` skin
- UI: `#FF6B35` orange, `#FFD700` gold, `#4CAF50` green, `#F44336` red
- Kitchen floor: `#1E2523` / `#191F1E` cool slate tiles
- Walls: `#BF7A42` terracotta upper / `#EEE3D2` cream wainscoting lower

## Repository Structure
```
/
├── index.html
├── package.json / tsconfig.json / vite.config.ts
├── .github/workflows/ci.yml       — CI + GitHub Pages (actions/deploy-pages)
├── src/
│   ├── main.ts
│   ├── config/GameConfig.ts
│   ├── systems/ (ProgressionSystem, CarrySystem, EconomySystem, SoundManager)
│   ├── entities/ (Customer, Table, Player)
│   └── scenes/ (Boot, MainMenu, Game, Pause, GameOver, Settings, Credits)
├── public/assets/ (SVG characters, food, decorations, icons)
├── MEMORY.md / CHANGELOG.md / KNOWN_ISSUES.md
├── PRODUCTION_AUDIT.md / PERFORMANCE_REPORT.md
├── MOBILE_READINESS_REPORT.md / RELEASE_NOTES_v1.0.0.md
├── PRODUCTION_VALIDATION_REPORT.md
└── README.md
```
