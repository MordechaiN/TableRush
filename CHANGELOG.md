# CHANGELOG

## V1.2.1 — Game-feel micro-polish (2026-07-11)

The Game-Director pass: play, watch, critique, fix, repeat.

- **Everyone blinks** — guests, waiter, chef, dish washer, and the title
  mascot all have natural, randomized blinks.
- **Birds** glide past the island with a wing-beat bob; steam **curls**
  sideways as it rises instead of climbing a straight rail.
- The waiter **leans into his run** and settles upright when he stops.
- **Food gloss**: every dish got its own glossy material — cheese, sauces,
  broth and icing now catch the light.
- **"PHEW!"** — rescuing a guest below a quarter-heart plays a relieved
  near-miss sting with a floating callout.
- **First-shop dopamine**: Swift Shoes tier 1 now costs $600, under a
  typical first-level score, so the first shop visit always affords
  something.
- Overlay cards **spring in**; the MENU button became a cream ghost button
  (the last muddy element in the UI).
- **Landscape title composition fixed**: the mascot stood behind the level
  chips and PLAY button — he now presents from the left on his podium.
  The floating mid-air shadow plane is gone; the cardboard-looking pizza
  orbiter became a layer cake.
- Dead code deleted: unused `punch` camera anim, `MAX_TABLES`,
  `rushHour`/`timerWarning` sounds.

## V1.2 — The Candy Diner redesign (2026-07-11)

A complete art-direction reboot. The gameplay simulation carried over
untouched; almost everything the player *sees* was rebuilt around one
committed visual identity: **a floating "Candy Diner" diorama** on a
mint-to-cream sky. The engine disappears; the toy shines.

### New art direction
- **Documented color system** (`src/config/Palette.ts`): sky, floor-zone,
  architecture, brand, feedback and character tokens shared by the 3D
  materials, the canvas textures and the UI CSS.
- **Floating island diorama**: rounded caramel platform with a soft under-
  shadow, drifting clouds, no fog, no infinite floor.
- **Color-blocked zones read instantly**: mint checkerboard = kitchen,
  blond wood = dining room, cream pavers = entrance path.
- **Entrance façade**: scalloped red-striped awning, OPEN sign, porthole
  swing doors, wait-here rings.

### Camera
- Replaced the perspective camera with an **orthographic diorama camera** —
  board-game clarity, zero edge distortion, rows never overlap. Aspect-aware
  elevation with binary-search framing; gentle ortho zoom intro; QA-verified
  100% effective taps through the same screen-space picker.

### Characters v2
- Bigger heads, egg-shaped two-tone bodies, **real eyes** (sclera, pupil,
  sparkle highlight, brows), blush and smiles on every face.
- Distinct silhouettes: hunched Elder, tall Business, small **Kid** (new
  archetype), plus the coral-aproned chef who now pops from every angle.

### Kitchen & food
- Cream-enamel stove with coral knobs, slim hood, retro mint fridge,
  chrome duct; bigger food portions and steam rising off hot plates.

### UI
- Cream cards with white outlines and chocolate ink replace the dark pills;
  goal bar got **star nodes that pop** when the ⭐ goal and ⭐⭐⭐ line are hit;
  combo pill wears the celebration purple; overlays sit on a sky gradient.
- Title screen: animated sun rays, drifting CSS clouds, candy logo.

## V1.1 — The Premium Polish update (2026-07-10)

A full studio pass over presentation, feel, content and accessibility —
the same Diner-Dash loop, now dressed for launch.

### Look & identity
- **Real display type**: Baloo 2 (variable, self-hosted, OFL) replaces Arial
  Black everywhere — logo, HUD, buttons, canvas-drawn signage and price tags.
- **The waiter is the mascot**: he waves from a podium on the title screen
  while the menu's dishes orbit behind him. The metal cloche is gone.
- **Faces that read**: every character got a protruding face, eyes that clear
  the hairline, and a smile. Bodies are taller so they read from the steep
  portrait camera.
- **Warm, cohesive room**: red-gingham tablecloths, a patterned cream rug,
  brighter honey floors, cream-enamel stove with a copper hood, framed café
  art, a ticking wall clock, and string lights that finally hang from cords.
- **Swinging entrance doors** under an OPEN sign — guests push through them.

### The restaurant is more alive
- **Burner flames** flicker under cooking pans; the stove throws warm light
  that scales with how busy the kitchen is.
- **A dish washer** works the tub: bus a table and he scrubs, with steam.
- Footstep dust when the waiter hustles; door chime when guests arrive.

### Game feel & clarity
- **Tap ripples**: every tap answers instantly — gold when it lands on an
  action, gray when it misses.
- **Tutorial pointing hand**: a bobbing 👆 hovers over the suggested next tap
  during the first level.
- Camera flattened slightly in portrait; the entrance moved closer, cutting
  dead space so tables and guests render larger.

### Content & economy
- **Three new levels** (6 Noodle Fever, 7 Prime Time, 8 Full House) and
  **two new dishes** — Ramen 🍜 and Steak 🥩.
- **Level select on the title screen**: every unlocked level is replayable
  for stars; the current level is highlighted.
- **Fourth upgrade track**: 😊 Warm Welcome (+6% tips per tier).
- Level names on every level; goals recalibrated against bot playthroughs.

### Audio
- **Room-tone ambience** during levels: soft murmurs and cutlery clinks over
  a warm noise bed.
- Music grew brushed off-beat hats and a glockenspiel answer every 4th bar.

### Accessibility & mobile
- **Settings**: Haptics toggle and a Camera Motion & Flashes toggle
  (reduced motion: no sway, no screen flashes, no confetti).
- **Safe-area insets** everywhere (notches, home indicators, rounded corners);
  `viewport-fit=cover`.
- Win screen confetti; consistent one-design-language overlays.

### Fixes & performance
- Fixed a double requestAnimationFrame chain that kept the title screen
  rendering behind gameplay (GPU/battery drain).
- HUD DOM writes only on change; HUD state emits throttled to 5Hz.
- Speech bubbles slightly smaller so the queue never covers the goal bar
  in landscape.

## V1.0 — The Diner-Dash rebuild (2026-07-03)

Complete gameplay redesign: **every tap is an explicit command** — the waiter
never decides anything on their own. (The previous smart-routing design felt
idle; this is the classic time-management loop done properly.)

- **Waiting line at the door**: guests queue up with 🪑 + hearts bubbles.
  **You seat them**: tap the guest (gold selection ring, clean tables glow
  green), then tap a table — the waiter escorts them over.
- **Hand raised → take the order** (tap the table); the chit flies to the
  visible kitchen; the chef cooks and carries the plate to the pass **with a
  table-number flag**.
- **Tap the plate to pick it up** — the waiter carries up to **two plates,
  one per hand** (double-hand deliveries pay a bonus) — then tap the matching
  numbered table to deliver.
- Eat → **collect the bill** (tip = dish price × remaining hearts; VIP ×2.5;
  critic rave ×3 at ≥85% hearts) → **bus the dirty table** to the dish tub.
- **Hearts patience** everywhere (queue, hand-up, kitchen wait, bill), with
  per-archetype drain rates. Walkouts at zero hearts.
- **Chain bonuses** for consecutive identical actions (seat-seat-seat…),
  with escalating fanfares.
- **Level structure replaces the timer**: 5 levels, each a fixed guest list
  with ⭐ goal / ⭐⭐⭐ expert scores shown on a progress bar; win to unlock
  the next; stars and coins persist. Level 1 doubles as the tutorial.
- Wallet + upgrade shop, PWA install/offline, and the visible kitchen all
  carry over.
- Verified end-to-end with real mouse AND touch input on dev, the production
  build, and a GitHub-Pages subpath simulation: 56–58 presses per level,
  **100% of presses effective**, win and lose paths both exercised, zero
  console errors.

## v3.3.1 — CRITICAL: real taps now work everywhere (2026-07-03)

Real-input hotfix. Raycasting against large invisible hitboxes silently
swallowed taps at steep camera angles: the empty front table's box occluded
the guest behind it, so **most tables were unclickable on phones** (portrait
= steepest camera). Bot-driven QA called `tap()` directly and never saw it.

- Input rewritten as **screen-space picking**: the nearest actionable table
  to the tap wins, with a generous forgiveness radius — works at any camera
  angle, any aspect ratio, mouse or touch.
- Action queue raised 3 → 4 so rapid taps aren't dropped.
- iOS input hardening: `touch-action` (kills double-tap zoom — Safari
  ignores `user-scalable=no`), no tap highlight, no text selection.
- New QA gate: `npm run playtest:human` plays the entire game with **real
  mouse and touch events only** (no direct game calls) and fails if fewer
  than 70% of presses have an effect. Verified on dev, the production build,
  and a GitHub-Pages subpath simulation: 74–93% effective presses,
  $6,200–$7,500 scores, zero console errors.

## v3.3.0 — The Critic (2026-07-02)

- **Food Critic** (level 7+, at most once per shift): dark suit, gray hair,
  notepad in hand. Deliver FAST or LIGHTNING for a **RAVE REVIEW ×3**;
  anything slower earns a *"meh."* Fills the previously-empty level 7 unlock.
- Unlock hints updated (still 100% honest).

## v3.2.0 — Install It (2026-07-02)

- **PWA**: web app manifest, drawn app icons (steaming burger badge, incl.
  maskable), and a service worker — Table Rush installs to the home screen
  and plays fully offline after the first visit (network-first HTML shell,
  cache-first fingerprinted assets).
- `scripts/gen-icons.mjs` regenerates the icon set from canvas code.

## v3.1.0 — The Economy Update (2026-07-02)

- **Wallet**: every shift's takings bank into a persistent wallet, shown on
  the title screen and the game-over card ("+$X banked").
- **🛒 Upgrades shop** (title screen): three 5-tier tracks that really change
  the simulation — 👟 Swift Shoes (+8% waiter speed/tier), 🔥 Pro Stove
  (−8% cook time/tier), 🪴 Cozy Décor (+8% guest patience/tier).
- Game-over stars now pop in one by one with reveal chimes.
- QA harness covers the shop: earn → buy → verify tier + deduction persist.

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
