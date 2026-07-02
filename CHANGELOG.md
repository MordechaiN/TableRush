# CHANGELOG

## v3.0.0 — The Living Restaurant (2026-07-02)

A ground-up rebuild of the gameplay scene around one idea: **the whole
restaurant pipeline is visible**. Nothing teleports.

### Core loop (new)
- Four-verb gameplay: **take the order → serve when it's ready → collect the
  payment → clear the table**. Every verb is a single tap on the table.
- **Visible kitchen**: the order chit flies to the kitchen, lands on a burner,
  the pan cooks with steam and a progress bubble, and the **chef physically
  carries** the finished plate to a glowing ORDER UP! slot on the pass.
- **Waiter pipeline**: picks plates off the pass onto a real tray, delivers,
  and carries dirty dishes to the bus bin. Action queue (up to 3 taps ahead)
  with dimmed rings on queued tables.
- **Dirty tables** block new seatings — clearing them is real gameplay.
- Walkouts at any waiting phase (ordering / cooking / bill) with distinct
  consequences: leave during the bill and you lose the payment *and* get dirty
  dishes.
- **Final Rush**: the last 30 seconds pay double.

### Mobile-first presentation
- **Aspect-adaptive camera**: binary-search framing fits the full play area at
  any aspect ratio — portrait phones get a steeper, closer view; desktop gets
  the wide room. (v2 cut side tables off on phones.)
- Portrait-first layout: kitchen across the top, five tables, entrance at the
  bottom; guests face the camera.
- Fixed-substep simulation — game time tracks real time even at low FPS.
- Title screen reframed for portrait; shows level and daily-goal chips.

### Characters
- Chibi rig upgraded: **arms** (swing when walking, carry trays, fork-to-mouth
  eating), head group for emotion tilts, sitting/standing/carrying poses.
- 7 guest archetypes with real personality: walk speed and patience differ
  (Elder shuffles but waits; Teen sprints and doesn't), plus accessories —
  glasses, sunglasses, cap, flower, hair bow.
- Chef with a classic toque who stirs pans and walks plates to the pass.

### Honest progression
- Every unlock hint now describes something implemented: Sushi at L2, tray
  capacity 2 at L3, Cake at L4, VIP guests at L5, tray capacity 3 at L6.
- Tray capacity is real: queue several serves and the waiter picks up multiple
  plates in one trip.
- Daily goal wired into the game-over card and title screen.

### Game feel & audio
- Coins fly from the table into the score pill (DOM flight + 3D burst).
- Red urgency vignette + pulsing priority arrow when a guest is about to walk.
- Pan sizzle loop scales with the number of cooking dishes; order-taken,
  order-up ding, delivery, payment, angry-walkout and combo-lost sounds wired.
- Camera intro sweep at shift start; pause overlay (⏸ / ESC) with sound
  toggles.

### Performance & code health
- Shared geometry/material caches — characters and tables allocate nothing
  after startup; particles (coins/sparks/steam) are pooled.
- Canvas-textured wood floor replaces 33 plank meshes; string lights are one
  InstancedMesh. ~220 draw calls / ~35k tris mid-rush.
- Renderer context force-lost on dispose (no context leak across replays).
- Repo cleaned: 55+ stale audit documents, 10 screenshot folders, the old
  prototype and dead scripts removed; `qa/playtest.mjs` is the one supported
  QA harness (`npm run playtest`).

## v2.0.0 — Three.js Rebuild (2026-06-13)

- Replaced the Phaser 2D client with a real-time 3D Three.js game: low-poly
  restaurant, tap-to-act waiter, guests with patience, combo multipliers,
  DOM HUD, procedural Web Audio. Bundle dropped ~1.6MB → ~600KB.

## v1.0.0 — First Public Release (2026-06-12)

- Phaser-based release: full serve loop, tray sway, customer animations,
  16 procedural sounds, mobile audio unlock, pause overlay with mute toggles.
