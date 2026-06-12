# TableRush v1.0.0 — Release Notes
_Release Date: 2026-06-12_

---

## First Public Release

TableRush is a fast-paced restaurant time-management game. You are the best waiter in the room — and the whole restaurant knows it.

Serve guests through every step of their visit — seat, order, cook, serve, pay, clean — in 3-minute shifts. Build combo streaks, survive Rush Hour, and prove yourself across 10 levels of escalating challenge.

**Play now:** https://mordechain.github.io/TableRush/

---

## What’s in v1.0.0

### Core Gameplay
- Complete 7-step restaurant service loop: queue → seat → order → cook → serve → pay → clean
- 5 dining tables, 5 menu items, 7 unique customer variants
- Patience system — every customer has a timer. Slow service = unhappy guests = score penalty
- Speed multiplier bonus — faster service earns more per dish
- Multi-item tray — carry up to 4 dishes in one trip (unlocks with level)
- Dirty dish workflow — carry dishes to the dishwasher station to keep tables turning

### Session Variety (6 session types)
- **Normal** — standard restaurant shift
- **VIP Night** — 30% VIP guest rate, higher tips but lower patience
- **Birthday Night** — one birthday party triggers a 3-payment chain bonus
- **Food Critic Night** — critic watches everything; rave review or public embarrassment
- **Family Day** — family tables order dessert round for a ×2.2 payout
- **Business Lunch** — impatient wave of executives at mid-session

### Combo System
- Consecutive happy customers build a combo streak
- Milestones: ×2 at 3 serves, ×3 at 6, ×4 at 10, ×5 (TABLE MASTER) at 15
- Combo Shield (Level 6+): first break from ×3+ falls to ×2 instead of resetting
- Combo lost: red flash + camera shake + descending tone

### Rush Hour
- Triggered at 60s and 150s into each session
- Double customer spawn rate for 25 seconds
- Cinematic entry banner, pulsing red border, countdown timer
- “RUSH SURVIVED!” celebration on exit

### Progression System
- 10 XP levels with unlocks at every level:
  - L1: Base game
  - L2: —
  - L3: 3-slot tray + flower vase table decor + family tables
  - L4: 4-slot tray (later) + speed boost +15% + birthday nights
  - L5: Food critic visits
  - L6: Combo Shield + VIP nights + dessert display decor
  - L7: Rush Hour bonus +40% + VIP rope decor
  - L8: Near-miss save bonus +300
  - L9: —
  - L10: TABLE MASTER edition banner

### Audio
- 16 synthesized sound events (Web Audio API — no external files)
- Ambient music: Cmaj7 → Am7 → Fmaj7 → G7 piano loop at 108 BPM
- Mobile-compatible audio unlock (plays after first tap)
- In-game mute toggles in Settings and Pause overlay
- Haptic feedback on mobile (payment, combo, angry customer)

### Animations
- Tray sway pendulum while waiter walks with food
- Customer chewing animation (bob + scaleY squish) while eating
- Happy exit celebration (jump + squash-and-stretch) on payment
- Rush Hour red border pulses around entire screen
- Combo heat overlay grows warmer with streak level
- Near-miss “THE SAVE!” hero text theater
- Per-table candle flickering at unique offsets
- Kitchen burner pilot flame flicker animation

### Visual Polish
- Dark walnut hardwood plank floor with grain detail
- Cool slate tile kitchen zone (visually distinct)
- Terracotta/cream wainscoting side walls with wall sconces
- 7 customer variants with personality props
- State visuals on tables (menu booklet, order ticket, plate, check presenter)
- Food burst particle effects on delivery
- Coin burst particle effects on payment

### UX
- First-session 7-step tutorial with spotlight guides
- Context-sensitive tap model — one tap does the right thing
- Single-focus priority arrow (only the #1 task shows its arrow)
- Main menu: best score, level, last session score, daily goal progress
- Game Over: shift report with story events, XP bar, next unlock hint

---

## Known Limitations

- Portrait orientation only (landscape not supported)
- No social sharing or external leaderboard
- Music loop repeats every ~8 seconds
- No keyboard gameplay (ESC for pause only)

---

## Browser Compatibility

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome | ✅ | ✅ |
| Safari | ✅ | ✅ |
| Firefox | ✅ | ✅ |
| Edge | ✅ | ✅ |

Requires: WebGL or Canvas 2D support (all modern browsers).

---

## Build

```
npm run build
# Output: dist/
# GitHub Pages: auto-deployed via CI on push to main
```

**Built with:** Phaser 3.87 · Vite 5 · TypeScript 5
