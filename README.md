# TableRush

Fast-paced restaurant time-management game. Seat guests, take orders, serve food, collect payment — keep the rush alive!

**Play now:** https://MordechaiN.github.io/TableRush/

---

## How to Play

**Goal:** Earn as much money as possible in 3 minutes.

**Service loop:**
1. **Seat guests** — When a customer arrives, tap any empty table. The waiter escorts them automatically.
2. **Take their order** — Tap the table again. The order is sent to the kitchen automatically — no menu popup.
3. **Wait for food** — Watch the kitchen. When the READY zone glows green and you see a plate, tap the KITCHEN to pick it up.
4. **Deliver food** — Tap the customer’s table to deliver.
5. **Collect payment** — After the customer finishes eating, a $ sign appears. Tap the table to collect.
6. **Clean up** — Tap the dirty table to pick up dishes, then carry them to the dishwasher (top-left corner, glows amber).

**Combos:** Serve customers quickly in a row to build a combo multiplier (×1 → ×2 → ×3 → ×4 → ×5). One angry customer resets it.

**Priority arrows:** A colored arrow shows the “#1 thing to do right now.” The label tells you exactly what action to take. Always follow the arrow.

---

## Controls

**Mobile:** Tap to interact. Everything is single-tap.

**Desktop:** Click to interact. ESC to pause.

---

## Session Types

| Type | What changes |
|------|--------------|
| Normal | Standard shift |
| VIP Night (L6+) | More VIP guests, 2.5× tips |
| Birthday Night (L4+) | Birthday party — triggers 3-payment ×2 chain |
| Critic Night (L5+) | Food critic watches — impress them for +50% score |
| Family Day (L3+) | Family tables order dessert (2.2× payout) |
| Business Lunch (L3+) | Impatient exec wave at mid-session |

---

## Customer Types

| Icon | Who they are | Behavior |
|------|-------------|----------|
| Gold tint + crown | VIP | Less patient, 2.5× payment |
| Blue tint + notepad | Food Critic | Watching everything. Fast service = rave review |
| Party hat | Birthday | Triggers 3-payment bonus chain when they pay |
| Briefcase | Business | Very impatient, generous tip for fast service |
| Family icon | Family Table | Orders dessert after main course |

---

## Progression

10 levels. Each adds new abilities:

| Level | Unlock |
|-------|--------|
| 3 | 3-slot tray (carry more food) + family tables |
| 4 | Speed boost +15% + birthday parties |
| 5 | Food critic visits |
| 6 | Combo Shield + VIP/Birthday event nights |
| 7 | Rush Hour bonus +40% |
| 8 | Near-miss save bonus +300 |
| 10 | TABLE MASTER EDITION |

---

## Run Locally

```bash
npm install
npm run dev
```
Open http://localhost:3000

## Build

```bash
npm run build
```

Output in `dist/`. GitHub Pages auto-deploys on push to `main`.

---

## Credits

| Role | Person |
|------|--------|
| Game Concept & Product Owner | Mordechai Neeman |
| Implementation | Claude Code |

## License

MIT © 2026 Mordechai Neeman
