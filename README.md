<div align="center">

# 🍽️ TableRush

**Fast-paced restaurant management game — 3 minutes to master the shift.**

[![Play Now](https://img.shields.io/badge/%F0%9F%8E%AE%20Play%20Now-Live-brightgreen)](https://MordechaiN.github.io/TableRush/)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](LICENSE)

</div>

---

## What is TableRush?

TableRush is a premium casual browser game where you play as a waiter managing a busy restaurant during a 3-minute dinner shift. Seat guests, take orders, pick up food, deliver it hot, collect payment, and clean tables — all while building a combo streak for maximum score.

**The feeling:** Being the most capable person in the room. The restaurant runs like a machine when you're on — and chaos when you're not.

---

## Quick Start

**[▶ Play at https://MordechaiN.github.io/TableRush/](https://MordechaiN.github.io/TableRush/)**

No install. No account. Works on any modern browser, desktop or mobile.

---

## Gameplay Loop

```
QUEUE → SEAT → ORDER → COOK → PICK UP → DELIVER → EAT → PAY → CLEAN → repeat
```

Every customer follows this loop. Your job is to manage all 5 tables simultaneously, minimize wait times, and chain consecutive serves for combo multipliers.

### Controls

| Action | How |
|--------|-----|
| Seat a waiting guest | Tap any empty table |
| Take a customer's order | Tap the table with blue arrow |
| Pick up ready food | Tap the kitchen (right side, green glow) |
| Deliver food | Tap the table with orange arrow |
| Collect payment | Tap the table with gold arrow |
| Clean dirty table | Tap the dirty table |
| Carry dirty dishes to dishwasher | Walk to dishwasher (left wall, below kitchen) |
| Pause game | Press ESC (desktop) or tap the ⏸ button |

**One priority arrow** is always visible — pointing at the most important action right now. Follow the arrow.

---

## Features

### Core Gameplay
- **5 tables** to manage simultaneously
- **7 customer variants** with distinct visuals and behaviors
- **5 menu items**: Salad (1.5s), Sushi (2s), Burger (2.5s), Pasta (3s), Pizza (4s)
- **Speed bonuses**: serve faster for better tips
- **Combo chain**: consecutive serves multiply your score (×1 → ×2 → ×3 → ×4 → ×5)
- **Near-miss saves**: serving a customer at <8% patience triggers THE SAVE! bonus
- **7-step tutorial** on first play

### Customer Types

| Type | Visual | Behavior |
|------|--------|----------|
| Normal | Standard | Regular patience |
| VIP 👑 | Gold tint + crown | 30% shorter patience, ×2.5 payment |
| Critic 📝 | Blue tint + notepad | 10% shorter patience; angry table → poor review |
| Birthday 🎂 | Party hat + confetti | Triggers 3-payment ×2 chain on checkout |
| Business 💼 | Blue tint + briefcase | 30% shorter patience, ×1.5 tip for fast service |
| Family 👨‍👩‍👧 | Family icon | 30% longer patience; orders dessert → ×2.2 payout |
| Queue walker | Any | Leaves after 18s waiting if not seated |

### Session Types

Six distinct dinner shifts unlock as you level up:

| Session | Level | Description |
|---------|-------|-------------|
| Normal | 1+ | Standard dinner service |
| Business Lunch | 3+ | Wave of impatient business clients mid-shift |
| Family Day | 3+ | Family tables order dessert; long stays |
| Birthday Night | 4+ | Birthday party triggers payment multiplier chain |
| Critic Night | 5+ | Critic arrives early; any walkout ruins the review |
| VIP Night | 6+ | 30% VIP rate, higher stakes |

### Combo System

| Streak | Multiplier | Milestone |
|--------|-----------|----------|
| 0–2 serves | ×1 | Building |
| 3–5 serves | ×2 | HOT STREAK 🔥 |
| 6–9 serves | ×3 | ON FIRE 🔥🔥 |
| 10–14 serves | ×4 | TABLE LEGEND ⭐ |
| 15+ serves | ×5 | TABLE MASTER 👑 |

**Combo Shield** (Level 6+): First combo break from ×3+ drops to ×2 instead of ×1.

---

## Progression System

10 levels driven by XP earned from each shift's score:

| Level | XP Required | Unlock |
|-------|-------------|--------|
| 1 | 0 | Base game, 2-slot tray |
| 2 | 300 | Building momentum |
| 3 | 700 | 3-slot tray; Business Lunch & Family Day |
| 4 | 1,300 | Birthday Night; +15% waiter speed |
| 5 | 2,200 | 4-slot tray; Food Critic visits |
| 6 | 3,500 | Combo Shield; VIP Night |
| 7 | 5,500 | Rush Bonus +40% |
| 8 | 8,000 | Master Timing: near-miss saves earn +300 |
| 9 | 11,000 | Peak efficiency mode |
| 10 | 15,000 | TABLE MASTER EDITION; max unlocked |

**Stars** (per shift): 1–3 stars based on score.  
**Daily Goal**: Dynamic target (60% of best score) resets each day.

---

## Session Stories

Every shift generates up to 4 story highlights on the game over screen:

- ⭐ *The food critic gave you a RAVE REVIEW*
- 🎂 *You served a birthday party*
- ♥ *You served a full family meal*  
- 💼 *You survived a business lunch rush*
- ⚡ *You saved a table from walking out*
- 🔥 *You powered through rush hour*
- ↑ *You built a 10+ serve streak*
- ★ *You built a 15+ serve streak — LEGEND*

---

## Architecture

### Tech Stack

| Component | Technology |
|-----------|------------|
| Game engine | Phaser 3.87 |
| Language | TypeScript (strict) |
| Build tool | Vite 5 |
| Canvas size | 480×854 (portrait, mobile-first) |
| Audio | Web Audio API (zero external files) |
| Persistence | localStorage |
| Deploy | GitHub Pages via GitHub Actions |

### Scene Flow

```
BootScene (generate textures + load SVGs)
  → MainMenuScene (play/settings/credits + daily goal)
    → GameScene (3-min gameplay loop + tutorial)
      ↔ PauseScene (overlay: resume/restart/menu + audio toggles)
    → GameOverScene (stars + XP + shift report + story lines)
    → SettingsScene
    → CreditsScene
```

### Folder Structure

```
TableRush/
├── src/
│   ├── config/
│   │   └── GameConfig.ts          # All constants (palette, difficulty, combo, menu)
│   ├── entities/
│   │   ├── Customer.ts            # Customer state machine + all animations
│   │   ├── Player.ts              # Waiter + tray sway + emotion system
│   │   └── Table.ts               # Table state + priority arrow + float emojis
│   ├── scenes/
│   │   ├── BootScene.ts           # Procedural textures + SVG loading
│   │   ├── MainMenuScene.ts       # Logo card + stats + daily goal
│   │   ├── GameScene.ts           # Core gameplay (132KB — monolith by design)
│   │   ├── PauseScene.ts          # Pause overlay + mute controls
│   │   ├── GameOverScene.ts       # Results screen + progression + stories
│   │   ├── SettingsScene.ts       # Audio settings
│   │   └── CreditsScene.ts        # Credits
│   ├── systems/
│   │   ├── SoundManager.ts        # 16 sounds + music (Web Audio API synthesis)
│   │   ├── ProgressionSystem.ts   # XP/level/highScore/dailyGoal (localStorage)
│   │   ├── CarrySystem.ts         # 2–4 slot tray inventory
│   │   └── EconomySystem.ts       # Shop/coins architecture (future use)
│   └── main.ts                    # Phaser config entry point
├── public/
│   └── assets/
│       ├── characters/            # SVGs: waiter.svg, waiter_walk.svg, customer_0-6.svg
│       ├── food/                  # SVGs: salad, burger, pasta, sushi, pizza
│       ├── decorations/           # SVGs: potted_plant, herb_plant
│       └── icons/                 # SVGs: plate_badge
├── .github/workflows/ci.yml   # Build + deploy to GitHub Pages
├── MEMORY.md                   # Project context for AI sessions
├── CHANGELOG.md                # Version history
└── KNOWN_ISSUES.md             # Open bugs + resolved items
```

---

## Local Development

### Prerequisites
- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/MordechaiN/TableRush.git
cd TableRush
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
```

Output in `dist/`. Preview:

```bash
npm run preview
```

### Deploy

GitHub Pages deployment is automatic via GitHub Actions on every push to `main`.

Manual build:

```bash
VITE_BASE_PATH=/TableRush/ npm run build
```

---

## Roadmap

### Near-term
- [ ] Music loop extension (4 bars → 8+ bars)
- [ ] Landscape support with rotate-to-portrait prompt
- [ ] Cancel waiter action (double-tap empty space)
- [ ] Widen dishwasher touch target (60px → 80px)
- [ ] Color-blind patience bar mode

### Medium-term
- [ ] Social share (screenshot + score card)
- [ ] PWA manifest (home screen install)
- [ ] Personal leaderboard

### Long-term
- [ ] Second music theme
- [ ] New restaurant venue (Level 10 reward)
- [ ] EconomySystem activation (coins → shop upgrades)

---

## Known Issues

See [KNOWN_ISSUES.md](KNOWN_ISSUES.md).

**Summary:**
- Portrait only — no landscape support
- Music loop ~8 seconds (audibly repeats)
- No fullscreen API / PWA manifest
- Dishwasher touch target slightly below 44pt guideline
- No keyboard gameplay (ESC for pause only)
- No social sharing
- No cancel for waiter movement

---

## Credits

| Role | Person |
|------|--------|
| Game Concept & Product Owner | Mordechai Neeman |
| Implementation | Claude (Anthropic) |

---

## License

MIT © 2026 Mordechai Neeman
