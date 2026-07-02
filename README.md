<div align="center">

# 🍽️ Table Rush

**Run the floor. Feed the rush. Three minutes on the clock.**

A premium casual restaurant game built with **Three.js** — warm, low-poly, mobile-first.

[![Play](https://img.shields.io/badge/%E2%96%B6%20Play-Live-brightgreen)](https://MordechaiN.github.io/TableRush/)
![Engine](https://img.shields.io/badge/engine-Three.js-blue)
![Build](https://img.shields.io/badge/build-Vite%205-purple)

<img src="docs/screenshots/gameplay_portrait.png" width="260" alt="Portrait gameplay"/> <img src="docs/screenshots/gameplay_landscape.png" width="460" alt="Landscape gameplay"/>

</div>

---

## What is Table Rush?

You're the waiter in a bustling little restaurant. Guests walk in, sit down and
order; the kitchen actually cooks — pans steam on the stove, the chef carries
finished plates to the **ORDER UP!** pass — and you run the floor: take orders,
serve plates, collect payments, clear tables. Chain flawless service into combo
multipliers and beat your best before the 3-minute shift ends.

**The whole pipeline is visible. Nothing teleports.**

```
Guest enters → sits → orders (🍔 bubble, patience ring)
  → TAP  take the order   → the chit flies to the kitchen
  →      the pan cooks    → steam + progress bubble → chef carries plate to the pass 🛎️
  → TAP  serve            → waiter picks it up onto the tray, delivers, guest eats
  → TAP  collect          → coins fly into your score 💰
  → TAP  clear the table  → dirty dishes go to the bus bin ✨ … next guest sits
```

### One verb: tap the table

Every table shows exactly one next action, color-coded by ring and bubble:

| Ring | Bubble | Action |
|------|--------|--------|
| 🟠 orange | dish emoji + patience ring | take the order |
| 🟠 orange (fast pulse) | 🛎️ | food is on the pass — serve it |
| 🟡 gold | 💰 | collect the payment |
| 🔵 blue | dirty plates | clear the table |

A floating arrow always marks the **single most urgent** table. Queue up to 3
taps ahead — queued tables dim their ring while the waiter works.

### Pressure & reward

- **Patience** ticks on every waiting guest; ready food goes *cold* faster.
  Walkouts reset your combo — and a guest who leaves without paying still
  leaves you the dirty dishes.
- **Combos**: consecutive payments climb ×2 HOT STREAK → ×5 TABLE MASTER.
- **Speed bonus**: deliver while patience is high for FAST ×1.5 / LIGHTNING ×2.
- **VIPs** (gold crown, level 5+) pay ×2.5 but have a short fuse.
- **The Food Critic** (level 7+, at most once per shift): dark suit, notepad.
  Land the food FAST or LIGHTNING and the rave review pays ×3 — anything
  slower gets a *"meh."*
- **Final Rush**: the last 30 seconds pay double.
- **Personalities**: the Elder shuffles in but waits patiently; the Teen
  sprints and won't. Seven archetypes with distinct outfits, accessories,
  walk styles and patience.

### Progression (all real, all implemented)

| Level | Unlock |
|-------|--------|
| 2 | Sushi 🍣 joins the menu |
| 3 | Bigger tray — carry 2 plates in one trip |
| 4 | Cake 🍰 joins the menu |
| 5 | VIP guests 👑 |
| 6 | Full tray — 3 plates |
| 7 | The Food Critic 🖋 |

XP = score ÷ 10. A daily goal (60% of your best) gives every session a target.
First launch runs a guided 6-step tutorial with a frozen clock.

**The wallet**: every shift's takings bank into a persistent wallet, spent in
the 🛒 Upgrades shop on three tracks (5 tiers each) that really change the
simulation:

| Track | Effect per tier |
|-------|-----------------|
| 👟 Swift Shoes | +8% waiter speed |
| 🔥 Pro Stove | −8% cooking time |
| 🪴 Cozy Décor | +8% guest patience |

## Controls

Tap (or click) a table — that's the game. ⏸ / ESC pauses. Sound toggles live
in the pause menu and settings.

## Tech stack

| Part | Tech |
|------|------|
| Rendering | **Three.js** — real-time 3D, PCF soft shadows, sRGB |
| Language | TypeScript (strict) |
| Build | Vite 5 |
| UI / HUD / menus | DOM + CSS |
| Audio | Web Audio API synthesis (zero audio files) |
| Art | 100% procedural: cached low-poly geometry + canvas textures |
| Persistence | localStorage |
| Install | PWA — manifest, home-screen icons, offline via service worker |
| QA | Playwright harness driving a real browser (`npm run playtest`) |
| Deploy | GitHub Pages via GitHub Actions |

## Architecture

```
index.html → src/main.ts                     orchestrator: title → game → game over
   ├─ src/three/title.ts                     3D animated title + menu chips
   ├─ src/three/RestaurantGame.ts            the gameplay scene & simulation
   │    ├─ src/three/kitchen.ts              burners, chef AI, ORDER UP! pass, ticket queue
   │    ├─ src/three/effects.ts              pooled coins / sparks / steam / floating text
   │    └─ src/three/builders.ts             shared art library (chibis, dishes, textures)
   ├─ src/three/ui.ts                        HUD, coin flight, pause / game-over overlays
   ├─ src/config/GameConfig.ts               every tunable number in the game
   └─ src/systems/
        ├─ ProgressionSystem.ts              XP, levels, unlocks, daily goal (localStorage)
        └─ SoundManager.ts                   procedural SFX, music loop, sizzle bed
```

Design decisions worth knowing:

- **Aspect-adaptive camera** — `frameCamera()` binary-searches the camera
  distance until a fixed set of gameplay-critical world points fits the
  viewport at the current aspect ratio. Portrait phones get a steep, close
  view; desktop gets the wide room. No layout forks.
- **Fixed-substep simulation** — the loop advances game time in ≤50ms steps,
  so cooking timers and patience run true even on a 20fps device.
- **Zero mid-game allocation** — geometry and single-color materials live in
  module-level caches; particles come from pre-allocated pools. ~220 draw
  calls / ~35k triangles in a full rush.
- **State machines everywhere** — guests (`entering → ordering → waiting →
  eating → paying → leaving`), tables, the chef and the waiter action queue
  are all explicit unions, no timers-driving-flags.

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
npm run type-check   # strict TS, no emit
npm run build        # type-check + production bundle → dist/
npm run playtest     # Playwright: tutorial → full shift → pause → replay → shop,
                     # fails on any console error (needs `npm run dev` running)
node scripts/gen-icons.mjs   # regenerate the PWA icons (drawn in canvas)
```

The game exposes QA hooks on `window.__game`: `autoStep()` (plays the best
available tap), `tapTable(i)`, `fastForward(s)`, and `metrics()` (draw calls,
tris, score, full state dump).

## Balancing

Everything lives in `src/config/GameConfig.ts`:

- `DIFFICULTY_TIERS` — spawn cadence, patience and eating speed per game minute.
- `MENU_ITEMS` — price, cook time, unlock level per dish.
- `COMBO_MILESTONES`, `SPEED_MULTIPLIERS`, VIP and Final Rush constants.
- `STAR_2` / `STAR_3` — calibrated against a perfect-play bot (~$9,900):
  3★ at $5,200 demands sustained combos.

## Extending the game

- **New dish**: add to `MENU_ITEMS`, give it a 3D model in
  `builders.buildDish()` and an emoji in `DISH_EMOJI`. Done — kitchen, bubbles
  and scoring pick it up.
- **New guest archetype**: add to `CUSTOMER_VARIANTS` (outfit, hair, accessory,
  speed, patience). New accessories go in `builders.chibi()`.
- **New unlock**: gate it on `ProgressionSystem` level, then describe it in
  `UNLOCK_HINTS` / `ABILITY_AT_LEVEL` — hints must stay honest.
- **New upgrade track**: add to `UPGRADE_TRACKS`, extend `Upgrades` +
  `getBoosts()` in `ProgressionSystem`, and apply the multiplier where it
  belongs in `RestaurantGame`/`kitchen`. The shop UI renders tracks
  automatically.

## Roadmap

- [ ] More special events: birthday parties, health inspector
- [ ] Skeletal characters to replace the primitive chibis
- [ ] Localized UI

## Credits

Concept & Product — Mordechai Neeman · Implementation — Claude (Anthropic)

MIT © 2026
