<div align="center">

# 🍽️ Table Rush

**A cozy 3D restaurant rush. Seat, serve, sparkle — in three minutes.**

Built with **Three.js**. Warm, low-poly, mobile-first, family-friendly.

[![Play](https://img.shields.io/badge/%E2%96%B6%20Play-Live-brightgreen)](https://MordechaiN.github.io/TableRush/)
![Engine](https://img.shields.io/badge/engine-Three.js-blue)
![Build](https://img.shields.io/badge/build-Vite%205-purple)

</div>

---

## What is Table Rush?

A fast-paced casual restaurant game rendered in real-time 3D. You're the waiter:
guests walk in, sit down, and order. Tap a table to serve the dish, let them eat,
then tap again to collect payment. Chain serves for combo multipliers and rack up the
biggest tip jar before the 3-minute shift ends.

The whole restaurant — room, characters, food, rewards — is built from low-poly
Three.js geometry with soft shadows and warm lighting. No sprite sheets, no external
art files; every asset is generated in code.

## Gameplay loop

```
Guest arrives → sits → orders (🍔 bubble)
  → TAP table to serve  → waiter fetches the dish, plates it
  → guest eats → asks to pay (💰 bubble)
  → TAP table to collect → coins burst, score pops, guest leaves happy
```

- **Patience** ticks down on every waiting guest (the ring around their bubble).
  Let it run out and they storm off — and your combo resets.
- **Combos**: each successful serve raises your streak; milestones multiply score
  (×2 HOT STREAK → ×5 TABLE MASTER).
- **Speed bonus**: serve while patience is high for LIGHTNING/FAST multipliers.
- **VIPs** (gold crown) pay ×2.5 but are impatient.
- **Difficulty** ramps over the shift (faster spawns, shorter patience) via tiers.

### Controls
One tap. Tap any table showing a glowing ring / bubble to perform its next action.
Tap the 🔊 to mute. That's the whole game — readable in under a second.

## Tech stack

| Part | Tech |
|------|------|
| Rendering | **Three.js** (WebGL, real-time 3D, soft shadows) |
| Language | TypeScript (strict) |
| Build | Vite 5 |
| UI / HUD / menus | DOM + CSS (glassy, mobile-first) |
| Audio | Web Audio API synthesis (no files) |
| Persistence | localStorage |
| Deploy | GitHub Pages via GitHub Actions |

No game-engine framework, no asset pipeline — the 3D is procedural, the UI is HTML.

## Architecture

A small DOM/scene state machine, not a heavyweight engine:

```
index.html → src/main.ts (orchestrator)
   ├─ Title screen      src/three/title.ts   3D hero (cloche + food) + DOM menu
   ├─ Gameplay          src/three/RestaurantGame.ts   the 3D restaurant + loop
   ├─ Shared 3D art     src/three/builders.ts   room/food/chibi/bubbles/fx
   ├─ HUD + overlays    src/three/ui.ts   score/timer/combo, game-over, settings, credits
   ├─ Balance/config    src/config/GameConfig.ts   difficulty, combo, menu, durations
   └─ Systems           src/systems/ProgressionSystem.ts  (XP/level/best, localStorage)
                        src/systems/SoundManager.ts       (Web Audio)
```

`main.ts` switches between **Title → Playing → Game Over** and wires the renderer-
agnostic systems (config, progression, sound) into the Three.js client.

### Folder structure

```
TableRush/
├── index.html
├── src/
│   ├── main.ts                    # orchestrator (title → game → game over)
│   ├── config/GameConfig.ts       # all balance constants
│   ├── systems/
│   │   ├── ProgressionSystem.ts    # XP, level, high score, daily goal
│   │   └── SoundManager.ts         # Web Audio synthesis
│   └── three/
│       ├── title.ts                # 3D title / menu
│       ├── RestaurantGame.ts       # gameplay scene + loop
│       ├── builders.ts             # low-poly art builders
│       └── ui.ts                   # HUD, game over, settings, credits
├── prototype-threejs/             # the original validation prototype + report
├── docs/                          # proposals, screenshots
└── vite.config.ts
```

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # → dist/
npm run preview
npm run type-check
```

## Design philosophy

- **Premium & friendly first.** Warm creams, oranges, tomato reds, soft wood; soft
  shadows and cozy lighting. Never dark, muddy, or "debug".
- **Readable in < 1 second.** Visual state before text: glowing rings, emoji bubbles,
  patience rings, coin bursts. UI-UX-PRO principles — big touch targets, clear hierarchy.
- **Satisfying.** Every action has squash/pop/bounce; payments spray coins and pop the
  score; combos punch the camera.
- **Short & replayable.** A 3-minute shift you immediately want to beat.

## How it got here

Table Rush began as a Phaser 2D game. After a full visual reboot (warm palette, chibi
characters, juice, premium HUD), a Three.js gameplay prototype proved the 3D direction
was clearly better at trivial performance cost (~20k tris / ~170 draw calls). The game
was then rebuilt as this Three.js client; the proven balance/progression/audio systems
carried over unchanged. See `prototype-threejs/REPORT.md` and `docs/proposals/threejs/`.

## Roadmap

- [ ] More customer archetypes & special events (birthday, critic, family)
- [ ] Modeled/animated characters (skeletal) to replace the primitive chibis
- [ ] Upgrades / unlocks spend (kitchen, décor, speed)
- [ ] 3D reward sequences on level-up & new best
- [ ] Haptics + richer audio
- [ ] PWA install + social score share

## Known limitations

- Characters are primitive-built (capsule + sphere) — charming but not yet modeled.
- Single restaurant theme; no upgrade economy spend yet.
- 3D bundle ~150 KB gzip (Three.js).

## Credits

Concept & Product — Mordechai Neeman · Implementation — Claude (Anthropic)

MIT © 2026
