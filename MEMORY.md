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
- `src/entities/Player.ts` — tray sway pendulum, enhanced dish bounce, TABLE MASTER tray spin
- `src/entities/Customer.ts` — chewing animation, 30px happy exit jump, food reaction squash
- `src/systems/SoundManager.ts` — mobile audio unlock, customerHappy(), unlockEarned(), context-safe music start
- `src/scenes/PauseScene.ts` — SFX + Music mute toggles in pause overlay

**Docs created:**
- PRODUCTION_AUDIT.md (10-category scores, overall 7.4/10)
- PERFORMANCE_REPORT.md
- MOBILE_READINESS_REPORT.md
- RELEASE_NOTES_v1.0.0.md
- PRODUCTION_VALIDATION_REPORT.md (20/20 sessions PASS)
- KNOWN_ISSUES.md (fixed false audio claim)
- CHANGELOG.md (v1.0.0 entry prepended)

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
src/systems/SoundManager.ts    — 16 sounds + ambient music (Web Audio API)
src/systems/ProgressionSystem.ts — XP/Level persistence
src/systems/CarrySystem.ts     — 1–4 slot tray
src/scenes/BootScene.ts        — procedural textures + SVG load
src/scenes/GameScene.ts        — core gameplay (132KB — DO NOT rewrite blindly)
src/scenes/PauseScene.ts       — pause + mute controls
src/entities/Customer.ts       — state machine + animations
src/entities/Table.ts          — table state + priority arrow
src/entities/Player.ts         — waiter + tray sway + emotions
```

## CRITICAL: GameScene.ts Is 132KB
**Do NOT attempt to read and rewrite GameScene.ts in one API call** — response will be truncated. To make changes: read a specific section by method name, make targeted edit, commit.

## SVG Assets (`public/assets/`)
- `characters/waiter.svg`, `waiter_walk.svg`
- `characters/customer_0-6.svg` (7 variants)
- `food/salad.svg`, `burger.svg`, `pasta.svg`, `sushi.svg`, `pizza.svg`
- `decorations/potted_plant.svg`, `herb_plant.svg`
- `icons/plate_badge.svg`

## Gameplay Loop
```
Queue arrives → Seat customer (tap empty table)
  → Take order (tap table with requesting customer)
    → Food cooks in kitchen (auto timer)
      → Pick up food (tap kitchen when READY)
        → Deliver food (tap table)
          → Customer eats
            → Collect payment (tap table)
              → Clean table (tap dirty table) → carry to dishwasher
```

## Priority System (single-focus — only #1 shows arrow)
| Priority | Color | When |
|----------|-------|----- |
| Urgent | Red | Patience < 25% |
| Paying | Gold | Customer ready to pay |
| Deliver | Orange | Carrying food for this table |
| Requesting | Blue | Customer wants to order |
| Seating | Purple | Queue waiting + empty table |
| Dirty | Brown | Table needs cleaning |

## Combo System
| Streak | Multiplier | Name |
|--------|-----------|------|
| 0–2 | ×1 | — |
| 3–5 | ×2 | HOT STREAK |
| 6–9 | ×3 | ON FIRE |
| 10–14 | ×4 | TABLE LEGEND |
| 15+ | ×5 | TABLE MASTER |
Combo Shield (L6+): first break from ×3+ → ×2.

## Session Types
| Type | Level | Feature |
|------|-------|---------|
| normal | 1+ | Standard |
| business_lunch | 3+ | Wave at mid-session, ×1.5 tips |
| family_day | 3+ | Dessert round, ×2.2 payout |
| birthday_night | 4+ | Confetti, 3-payment ×2 chain |
| critic_night | 5+ | Critic watches, rave or disaster |
| vip_night | 6+ | 30% VIP rate, ×2.5 tips |

## Audio
- 16 sounds + ambient music via Web Audio API (no files)
- Mobile unlock: `unlock()` called from `uiClick()` on first tap
- Music: Cmaj7→Am7→Fmaj7→G7 loop, 108 BPM, triangle piano
- SFX key: `tablerush_sfx` | Music key: `tablerush_music`

## Progression
- XP = score / 10 per round
- 10 levels (thresholds: 0,300,700,1300,2200,3500,5500,8000,11000,15000)
- Level unlocks: L3 family+3-slot tray, L4 speed+4-slot, L5 critic, L6 shield+VIP, L7 rush bonus, L8 save bonus, L10 banner

## Production Audit Results (v1.0.0)
| Category | Score |
|----------|-------|
| Gameplay | 8/10 |
| Visuals | 8/10 |
| UI | 7/10 |
| UX | 8/10 |
| Performance | 7/10 |
| Accessibility | 4/10 |
| Mobile | 7/10 |
| Audio | 8/10 |
| Retention | 7/10 |
| Polish | 8/10 |
| **Overall** | **7.4/10** |

## Known Issues (v1.0.0)
- Portrait only — no landscape
- Music repeats every ~8s (4-bar loop)
- No fullscreen API / PWA manifest
- Dishwasher touch target slightly small (60×56px)
- No keyboard gameplay (ESC only)
- No social share or leaderboard
- No cancel waiter action

## Post-v1.0 Improvements (Backlog)
1. Second music theme variant
2. Landscape support
3. Color-blind patience bar alternative
4. Social share screenshot
5. Cancel waiter action
6. PWA manifest
7. Leaderboard

## Palette
- Floor: `#2E1E0F` dark walnut planks
- Table: `#8B4513` mahogany + `#F5F0E8` linen
- Kitchen floor: `#1E2523` cool slate
- Walls: `#BF7A42` terracotta / `#EEE3D2` cream wainscoting
- UI: `#FF6B35` orange, `#FFD700` gold, `#4CAF50` green
