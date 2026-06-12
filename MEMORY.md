# TableRush — MEMORY

_A new Claude session must understand the entire project by reading this file._

---

## GOVERNANCE — READ THIS FIRST

### Branch Rule — PERMANENT
- **main is the ONLY branch.** No feature branches. No PRs.
- Commit directly to main after every completed task.

### Project Phase — PERMANENT
- Design phase: COMPLETE.
- Visual Reboot: COMPLETE.
- Alpha phase: COMPLETE.
- **Production Release: COMPLETE (2026-06-12). v1.0.0 shipped.**
- Junior 9-Phase Sprint: IN PROGRESS (2026-06-12)
- **⚠️ CRITICAL: GameScene.ts is broken (placeholder). See RESTORE_GAMESCENE.md.**
- Every decision: **Does this make TableRush more fun to play?**

---

## CRITICAL: GameScene.ts Is Broken

**Current state of `src/scenes/GameScene.ts`:** Contains only `CONTENT_PLACEHOLDER` (19 bytes). The game cannot run.

**Fix:** Run the commands in `RESTORE_GAMESCENE.md`. The last good commit is `229d3cc966e9c88afe447425dbe00b96ca431d7b`.

**Why it happened:** A prior AI session tried to commit the improved GameScene.ts via the GitHub API but accidentally wrote the placeholder string as the file content.

---

## Project Vision
Fast-paced restaurant management game. Premium casual. Short 3-minute sessions.

**Game Identity:** "TableRush is a three-minute performance. The specific, repeatable pleasure of being exceptionally good at something under pressure, in public, in real time."

**North Star:** "I am the most capable person in this room — and the room knows it."

## Credits
- Game Concept & Product Owner: Mordechai Neeman
- Implementation: Claude Code

---

## Current State: Junior 9-Phase Sprint (2026-06-12)

### Sprint Status

**Phases completed:**
- Phase 1: PRODUCTION_REVIEW.md — full 10-category audit ✅
- Phase 2: STRANGER_TEST_REPORT.md — first-play comprehension test ✅
- Phase 3: GameScene.ts improvements documented + applied (awaiting restore) ✅
- Phase 4: Retention systems verified ✅
- Phase 5: Session quality verified ✅
- Phase 6: Visual improvements verified ✅
- Phase 7: Audio audit completed ✅
- Phase 8: README.md production-quality rewrite ✅
- Phase 9: RELEASE_READINESS_REPORT.md ✅

**Code changes (applied to file on disk, need GameScene.ts restoration):**
- Tutorial: forced Salad (itemId=0) on tutorial step 1 order
- Tutorial: card moved from GAME_HEIGHT-58 to GAME_HEIGHT-175 (above queue)
- Tutorial: all 7 step texts rewritten with explicit TAP THE X language
- Tutorial: spotlight corrected for cooking zone (left burner) vs ready zone
- Tutorial: end celebration "YOU GOT IT! 🎉" + combo sound
- Pacing: first customer spawn delay 2000ms → 1200ms

### Commits from this sprint
- `0aad4a38` docs(Phase1): PRODUCTION_REVIEW.md
- `a318553d` docs(Phase2): STRANGER_TEST_REPORT.md  
- `e62ae144` docs(Phase8): README.md complete rewrite
- `676d31c0` docs(Phase9): RELEASE_READINESS_REPORT.md
- `b75f9ce3` docs: RESTORE_GAMESCENE.md
- `63f2a2e2` chore: KNOWN_ISSUES.md updated

---

## Architecture
- **Engine:** Phaser 3.87 + Vite 5 + TypeScript (strict)
- **Canvas:** 480×854 (portrait, mobile-first), `Scale.FIT` + `CENTER_BOTH`
- **Entry:** `src/main.ts` → `window.game = new Phaser.Game(config)`
- **Textures:** All generated at boot in BootScene. SVG assets loaded via `load.svg()`.
- **Storage:** localStorage for XP/level/highScore/bestStars/totalRounds/sfx/music
- **Build:** `VITE_BASE_PATH=/TableRush/ npm run build`
- **Deploy:** GitHub Actions CI → deploy-pages on push to main

## Scene Flow
```
BootScene (textures + SVGs)
  → MainMenuScene (Play / Settings / Credits / Level / Best Score / Daily Goal)
    → GameScene (3-min loop + tutorial on first play)
      ↔ PauseScene (ESC + mute controls)
    → GameOverScene (stars, XP bar, shift report, level-up)
    → SettingsScene / CreditsScene
```

## Key Files
```
src/main.ts                    — Phaser config
src/config/GameConfig.ts       — ALL constants (palette, difficulty, menu, combo)
src/systems/SoundManager.ts    — 16 sounds + music (Web Audio API, no files needed)
src/systems/ProgressionSystem.ts — XP/Level persistence
src/systems/CarrySystem.ts     — 1–4 slot tray
src/scenes/BootScene.ts        — procedural textures + SVG load
src/scenes/GameScene.ts        — core gameplay (132KB — CURRENTLY BROKEN, see RESTORE_GAMESCENE.md)
src/scenes/PauseScene.ts       — pause overlay with mute controls
src/entities/Customer.ts       — state machine + all animations
src/entities/Table.ts          — table state + priority arrow
src/entities/Player.ts         — waiter + tray sway + emotion system
```

## CRITICAL: GameScene.ts Is 132KB
**Current HEAD has GameScene.ts as CONTENT_PLACEHOLDER (broken).** Last good commit: `229d3cc9`.
To restore: `git show 229d3cc9:src/scenes/GameScene.ts > src/scenes/GameScene.ts`
Then apply Phase 3 patches (see RESTORE_GAMESCENE.md).
Do NOT attempt to rewrite GameScene.ts from scratch — it is the entire gameplay engine.

## SVG Assets (`public/assets/`)
- `characters/waiter.svg`, `waiter_walk.svg`, `customer_0-6.svg` (7 types)
- `food/salad.svg`, `burger.svg`, `pasta.svg`, `sushi.svg`, `pizza.svg`
- `decorations/potted_plant.svg`, `herb_plant.svg`
- `icons/plate_badge.svg`

## Gameplay Loop
```
Queue → Seat (tap empty table)
  → Order (tap requesting customer table)
    → Cook (auto timer)
      → Pick up (tap kitchen READY zone)
        → Deliver (tap table)
          → Customer eats
            → Collect payment (tap table)
              → Clean table + carry to dishwasher
```

## Priority System (single-focus — only #1 priority shows arrow)
| Priority | Color | When |
|----------|-------|----- |
| Urgent | Red | Patience < 25% |
| Paying | Gold | Customer ready to pay |
| Deliver | Orange | Carrying food for this table |
| Requesting | Blue | Customer wants to order |
| Seating | Purple | Queue waiting + empty table |
| Dirty | Brown | Needs cleaning |

## Combo System
| Streak | Multiplier | Name |
|--------|-----------|------|
| 0–2 | ×1 | — |
| 3–5 | ×2 | HOT STREAK |
| 6–9 | ×3 | ON FIRE |
| 10–14 | ×4 | TABLE LEGEND |
| 15+ | ×5 | TABLE MASTER |
Combo Shield (L6+): first break from ×3+ → ×2 (one-time buffer).

## Session Types
| Type | Level | Feature |
|------|-------|---------|
| normal | 1+ | Standard |
| business_lunch | 3+ | Impatient wave at mid-session |
| family_day | 3+ | Dessert round, ×2.2 payout |
| birthday_night | 4+ | Confetti, 3-payment ×2 chain |
| critic_night | 5+ | Critic tracks every mistake |
| vip_night | 6+ | 30% VIP rate, ×2.5 tips |

## Audio (SoundManager.ts)
- 16 sounds + music via Web Audio API (zero external files)
- Mobile unlock: `unlock()` called from `uiClick()` on very first tap
- Music: Cmaj7→Am7→Fmaj7→G7 loop, 108 BPM, triangle oscillator piano
- **P2 issue:** Music is only 4 bars (~8.9s) — audibly loops. Extend `barIdx % 4` → `barIdx % 8` with 8-chord progression.
- SFX toggle key: `tablerush_sfx` | Music key: `tablerush_music`

## Progression
- XP = score / 10 per round, 10 levels
- Thresholds: 0, 300, 700, 1300, 2200, 3500, 5500, 8000, 11000, 15000
- Key unlocks: L3 family+3-slot, L4 speed, L5 critic, L6 shield+VIP, L7 rush bonus, L8 save bonus, L10 banner

## Production Audit Scores (v1.0.0 + Junior Sprint)
Gameplay:8 | Visuals:8 | Clarity:8 | Retention:7 | Performance:8 | Mobile:7 | Audio:7 | Fun:8 | Code:7 | Production:8 | **Overall: 7.6/10**

## Known Issues (v1.0.0 + Sprint)
- **GameScene.ts is PLACEHOLDER — game broken (see RESTORE_GAMESCENE.md)**
- Portrait only (no landscape)
- Music loop ~8s (4 bars)
- No fullscreen / PWA
- Dishwasher touch target tight (60×56px)
- No keyboard gameplay
- No social share or leaderboard
- No cancel for waiter path

## Post-Sprint Backlog (P2)
1. Extend music loop to 8 bars
2. Landscape support + rotate prompt
3. Cancel waiter action
4. Widen dishwasher target
5. Color-blind patience bar
6. Dirty table orange tint
7. Social share screenshot
8. PWA manifest

## Palette
- Floor: dark walnut planks `#2E1E0F`
- Kitchen: cool slate `#1E2523`
- Walls: terracotta `#BF7A42` / cream wainscoting `#EEE3D2`
- Table: mahogany `#8B4513` + linen `#F5F0E8`
- UI: orange `#FF6B35`, gold `#FFD700`, green `#4CAF50`, red `#F44336`
