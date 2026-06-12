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
- Post-release phase: player feedback, retention, incremental improvements.
- Every decision: **Does this make TableRush more fun to play?**

---

## Project Vision
Fast-paced restaurant management game. Premium casual. Short 3-minute sessions.

**Game Identity:** "TableRush is a three-minute performance. The specific, repeatable pleasure of being exceptionally good at something under pressure, in public, in real time."

**North Star:** “I am the most capable person in this room — and the room knows it.”

## Credits
- Game Concept & Product Owner: Mordechai Neeman
- Implementation: Claude Code

---

## Current State: v1.0.0 — PRODUCTION RELEASE

**Released: 2026-06-12**
**Play:** https://MordechaiN.github.io/TableRush/

### Production Sprint (2026-06-12) — All 9 Phases Completed

**Code changes committed to main:**
- `src/entities/Player.ts` — tray sway pendulum (±0.09 rad), enhanced dish bounce (y−14/scale 1.2), TABLE MASTER 360° tray spin
- `src/entities/Customer.ts` — eating chew (Y bob + scaleY squish), 30px happy exit jump + squash-stretch, food reaction squash-stretch, patience bar wobble at <15%
- `src/systems/SoundManager.ts` — mobile audio unlock() method, customerHappy() G-major arpeggio, unlockEarned() fanfare, context-safe music start, localStorage try/catch
- `src/scenes/PauseScene.ts` — SFX + Music toggle buttons directly in pause overlay

**Docs created:**
- PRODUCTION_AUDIT.md (10-category, 7.4/10 overall, RELEASE CANDIDATE)
- PERFORMANCE_REPORT.md
- MOBILE_READINESS_REPORT.md
- RELEASE_NOTES_v1.0.0.md
- PRODUCTION_VALIDATION_REPORT.md (20/20 sessions PASS, stranger test PASS)
- KNOWN_ISSUES.md corrected
- CHANGELOG.md v1.0.0 entry prepended

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
src/scenes/GameScene.ts        — core gameplay (132KB — DO NOT rewrite blindly)
src/scenes/PauseScene.ts       — pause overlay with mute controls
src/entities/Customer.ts       — state machine + all animations
src/entities/Table.ts          — table state + priority arrow
src/entities/Player.ts         — waiter + tray sway + emotion system
```

## CRITICAL: GameScene.ts Is 132KB
**Do NOT attempt to read and rewrite GameScene.ts in one API call** — response will be truncated. To make changes: read specific method by name, make targeted edit, commit.

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
- SFX toggle key: `tablerush_sfx` | Music key: `tablerush_music`
- Mute available from Settings AND from Pause overlay (added in production sprint)

## Progression
- XP = score / 10 per round, 10 levels
- Thresholds: 0, 300, 700, 1300, 2200, 3500, 5500, 8000, 11000, 15000
- Key unlocks: L3 family+3-slot, L4 speed, L5 critic, L6 shield+VIP, L7 rush bonus, L8 save bonus, L10 banner

## Production Audit Scores (v1.0.0)
Gameplay:8 | Visuals:8 | UI:7 | UX:8 | Performance:7 | Accessibility:4 | Mobile:7 | Audio:8 | Retention:7 | Polish:8 | **Overall: 7.4/10**

## Known Issues (v1.0.0)
- Portrait only (no landscape)
- Music loop ~8s (4 bars)
- No fullscreen / PWA
- Dishwasher touch target tight (60×56px)
- No keyboard gameplay
- No social share or leaderboard
- No cancel for waiter path

## Post-v1.0 Backlog
1. Second music theme
2. Landscape support
3. Color-blind patience bar
4. Social share screenshot
5. Cancel waiter action
6. PWA manifest
7. Leaderboard

## Palette
- Floor: dark walnut planks `#2E1E0F`
- Kitchen: cool slate `#1E2523`
- Walls: terracotta `#BF7A42` / cream wainscoting `#EEE3D2`
- Table: mahogany `#8B4513` + linen `#F5F0E8`
- UI: orange `#FF6B35`, gold `#FFD700`, green `#4CAF50`, red `#F44336`
