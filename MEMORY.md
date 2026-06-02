# TableRush — MEMORY

_A new Claude session must understand the entire project by reading this file._

---

## Project Vision
Fast-paced restaurant management game. Premium casual style (Overcooked / Good Pizza Great Pizza). Player serves customers through a complete lifecycle: seat → take order → cook → deliver → collect payment → clean table. Short 3-minute sessions designed for score-chasing and replayability.

## Design Philosophy
- Sessions: 3 minutes (score-chase design)
- "Just one more round" feeling via combo multiplier, speed bonuses, end-of-round stars
- Easy to learn (tutorial), satisfying to master (speed/combo optimization)
- Mobile-first, warm visual identity — NOT dark/cold/technical

## Credits
- Game Concept & Product Owner: Mordechai Neeman
- Implementation: Claude Code

---

## Current State: REDESIGN PENDING APPROVAL

**v0.1.1 is the current deployed version** (working but prototype-quality).
**Three redesign documents exist and are awaiting approval before implementation.**

See: GAMEPLAY_REDESIGN.md, VISUAL_REDESIGN.md, BALANCE_REDESIGN.md

Do NOT implement redesign until user approves.

---

## Architecture
- **Engine:** Phaser 3.87 + Vite 5 + TypeScript (strict)
- **Entry:** `src/main.ts` → Phaser.Game with scene list
- **Textures:** All generated in BootScene using `scene.make.graphics()` → `generateTexture()`
- **Storage:** `localStorage` for high score + settings
- **Build:** `VITE_BASE_PATH=/TableRush/ npm run build` for GitHub Pages

## Scene Flow
```
BootScene (generate textures)
  → MainMenuScene (Play / Settings / Credits / High Score)
    → GameScene (3-min gameplay loop)
      ↔ PauseScene (ESC overlay)
    → GameOverScene (score tally, new record, retry)
    → SettingsScene (SFX/Music toggles, reset score)
    → CreditsScene
```

## Key Files
```
src/main.ts                  — Phaser config + scene registration
src/config/GameConfig.ts     — ALL tunable constants (colors, difficulty, menu items)
src/scenes/BootScene.ts      — Procedural texture generation
src/scenes/GameScene.ts      — Core gameplay (500 lines)
src/entities/Customer.ts     — Customer state machine + patience bar
src/entities/Table.ts        — Table state + glow animations
src/entities/Player.ts       — Player container + walkTo() movement
```

## Current Gameplay Systems (v0.1.1 — to be redesigned)

### Customer Lifecycle
`entering → seated → ordering → waiting_food → eating → paying → leaving`

**Problems with current flow (redesign pending):**
- Order taken via menu popup (wrong — should be automatic on arrival)
- Patience only 25s initial (way too aggressive)
- Angry customer leaves dirty table (wrong — should be clean)
- No tutorial, no player guidance

### Redesign Intent (see GAMEPLAY_REDESIGN.md)
`entering → seated → requesting → ordering (auto) → waiting_food → eating → paying → leaving`
- Auto-order when waiter walks to customer
- Patience 45–120s depending on difficulty tier
- Angry customer: score penalty, combo reset, table immediately clean
- Priority pulse system to guide player

## Repository Structure
```
/
├── index.html
├── package.json / tsconfig.json / vite.config.ts
├── .gitignore
├── .github/workflows/ci.yml   — CI build + GitHub Pages deploy (Actions-based)
├── src/
│   ├── main.ts
│   ├── config/GameConfig.ts
│   ├── entities/Customer.ts / Table.ts / Player.ts
│   └── scenes/ (7 scenes)
├── MEMORY.md / PROJECT_STATUS.md / CHANGELOG.md
├── KNOWN_ISSUES.md / ROADMAP.md / TEST_REPORT.md / VALIDATION_REPORT.md
├── GAMEPLAY_REDESIGN.md  ← NEW (awaiting approval)
├── VISUAL_REDESIGN.md    ← NEW (awaiting approval)
├── BALANCE_REDESIGN.md   ← NEW (awaiting approval)
└── README.md
```

---

## Git Governance
- **Branch:** `main` (direct commits, no PRs)
- **Workflow:** `git add . && git commit && git push`
- **CI:** GitHub Actions on push to main → type check + build (VITE_BASE_PATH=/TableRush/) + deploy to GitHub Pages

## Deployment
- Local: `npm run dev` → http://localhost:3000
- Production: `VITE_BASE_PATH=/TableRush/ npm run build` → `dist/`
- GitHub Pages: auto-deployed via `actions/deploy-pages` on main push
- **REQUIRED:** Repo Settings → Pages → Source → **GitHub Actions**

---

## Known Issues (v0.1.1)
- No audio (Settings UI is placeholder only)
- Phaser bundle 1.48MB (expected, not a bug)
- Visual style is prototype-level (redesign pending approval)
- Patience values too aggressive (redesign pending approval)

## Current Priority
**AWAITING USER APPROVAL** on three redesign documents before implementing v0.2.0.
