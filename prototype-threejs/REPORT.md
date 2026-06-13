# Table Rush — Three.js Gameplay Prototype: Decision Report

A **playable** Three.js prototype (not a mockup) of the core loop. Run it by serving
this folder statically (it vendors `three` locally, no build step):
`npx serve prototype-threejs` → open `index.html`.

**Implemented & working:** warm low-poly restaurant (floor, walls, windows, kitchen
pass with heat lamps, pendant lamps, plants), a controllable **waiter** (tap-to-act,
pathing, carries 3D food on a tray), **customers** that walk in → sit → order →
eat → pay → leave (with patience), **3D food** models on plates, billboard **order/
pay bubbles** with patience rings, **actionable glow rings**, **coin-burst reward** +
floating score, soft shadows, subtle camera sway, DOM HUD (score/timer/FPS).

~470 lines, one file (`game.js`).

## 1. Screenshots
`shots/hero_all_states.png` · `shots/gameplay_in_motion.png` · `shots/restaurant_wide.png`

## 2. Video
A recorded session (webm) was captured during evaluation.

## 3. FPS
- Headless capture ran on **swiftshader (software, no GPU)** at ~20–22 fps — this is
  a CPU rasterizer and is **not** indicative of device performance.
- Real-device estimate: the scene is **~20k triangles / 171 draw calls** at peak
  (3 customers + coins + 3D food). That is trivial for any 2020+ mobile GPU →
  **comfortably 60 fps** with headroom. Draw-call count is the only thing to watch;
  merging static room geometry + instancing coins/customers would cut it to <60.

## 4. Memory
- **JS heap ~12 MB** at peak. GPU resources: ~179 geometries, 7 textures.
- `three` adds ~150 KB gzip to the bundle (already present).

## 5. Complexity
- Full visual loop in **~470 lines**. The 3D primitives-only art (no external model
  files) keeps it self-contained and tiny. Reaching production parity (5 tables, 7
  customer archetypes, sessions, tutorial, combos, progression UI) ≈ **~2,000–2,500
  lines** of Three rendering — comparable to, and arguably simpler than, the current
  3,300-line Phaser `GameScene`, because **depth sorting is free in 3D** (no more 40
  hand-tuned `setDepth` bands) and UI moves to clean HTML/CSS.

## 6. Migration estimate
Renderer-agnostic code that **ports as-is** (~30–40%): `GameConfig` (balance,
difficulty, combo, menu), `EconomySystem`, `ProgressionSystem`, `SoundManager`,
localStorage, all tuning constants.
**Rewrite:** `GameScene` rendering, `Player`/`Customer`/`Table` as Three objects,
`BootScene` procedural textures (deleted — 3D needs none), scene flow, UI → DOM.
**Estimate:** ~**3–4 weeks** to feature parity + polish for one developer.
**Risk:** low–medium — input/raycast and mobile perf tuning are the main items;
depth/lighting/“premium feel” are solved by the engine.

## 7. Recommendation — **C) Full Three.js (staged migration)**

The prototype answers the question with evidence: the 3D version looks **clearly more
premium** (real depth, soft shadows, 3D food, cozy lighting) at **trivial performance
cost**, and the code is *simpler* in the ways that matter (free depth sorting, HTML
UI). The gameplay logic is already separable from Phaser, so a migration reuses the
proven balance/economy/progression and rebuilds only the renderer + entities.

Recommend building **Table Rush v2 as a Three.js client**, staged:
1. Stand up the Three scene + entity rendering from this prototype.
2. Port the renderer-agnostic systems (config/economy/progression/sound).
3. Re-implement tables/customers/sessions/tutorial against the new renderer.
4. DOM/HTML UI to UI-UX-PRO standards; retire Phaser + SVG + procedural textures.

Keep the current Phaser build live as `main` until v2 reaches parity, then cut over.
