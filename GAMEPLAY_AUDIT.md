# TableRush — Gameplay Audit
_Conducted: 2026-06-12 · Auditor: Junior · Method: Full source code analysis_

---

## Summary

TableRush’s core loop is fundamentally sound. The problems are almost entirely in **first-time clarity** and **tutorial pacing**. A player who survives the first 60 seconds falls into flow. The challenge: getting them there.

---

## Why the game IS fun

- Serving 3+ tables simultaneously creates genuine multi-tasking pressure
- Combo system provides escalating reward: ×1 → ×2 → ×3 → ×4 → ×5
- Rush Hour is well-executed drama (cinematic banner, pulsing red border, countdown)
- Payment gold burst + camera shake is genuinely satisfying
- Near-miss saves feel heroic (“THE SAVE!” theater is excellent)
- 3-minute sessions fit mobile perfectly
- Level progression gives reasons to replay

---

## Why the game is NOT fun (yet)

### 1. The tutorial has up to 12 seconds of dead time

The first-ever game experience:
- **Step 3 (cooking wait):** 1.5–4 seconds of staring with no task. Pizza = 4 seconds.
- **Step 4 (eating wait):** 5–8 seconds with literally nothing to do.
- Total possible dead time in a 7-step tutorial: **6–12 seconds**.

This is a first impression killer. A new player thinks the game froze.

### 2. The tutorial card covered the customers it was describing

Tutorial card bottom was at y=830, queue customers spawned at y=760–770. Customer was **behind** the tutorial card on first play.

*(Fix applied: card moved to y=662–724, clear of queue)*

### 3. The tutorial spotlight pointed to the wrong kitchen zone

Step 2 spotlight: `x = KITCHEN_X/2 = 120` (cooking zone, left side).  
Player taps the full kitchen tap zone at `x = KITCHEN_X = 240` (center).  
Result: spotlight says “look here” while action happens elsewhere.

*(Fix applied: spotlight now covers full kitchen zone)*

### 4. The README described a mechanic that doesn’t exist

Old README said: “takes order popup” and “Pick a menu item.”  
Actual behavior: order is **auto-assigned**, no popup, no choice.

This is the only pre-play documentation. First-time players arrive with wrong expectations.

*(Fix applied: README completely rewritten)*

### 5. Kitchen tap gives zero feedback when food isn’t ready

Player taps kitchen too early: `if (readyOrders.length === 0) return;`  
Result: silence. Player thinks the game is broken.

*(Fix applied: "Still cooking..." float text)*

### 6. The READY! pop disappears in 1.1 seconds

The only clear “food is ready” signal fades after 1.1 seconds.  
If player is looking at a table, they miss it. Nothing to tell them food is ready.

*(Fix applied: duration extended to 2.8 seconds)*

### 7. The dishwasher has no persistent label

The dishwasher (top-left corner, x=36, y=196) has no permanent label.  
The amber glow only activates **after** picking up dirty dishes.  
Result: new player wanders looking for the machine.

*(Partial fix: `apply_p0_fixes.mjs` adds location hint in tutorial step 6)*

---

## Why a player quits after 5 minutes

1. Rush Hour hits at 60s. Player doesn’t yet understand patience management. Feels unfair.
2. A combo resets without obvious cause-and-effect. Player doesn’t know what they had.
3. After Round 1–2, the loop feels identical. Level 2 has no new content.

## Why a player returns

1. Daily goal on main menu — **best retention hook in the game**
2. Best score display: “beat your last score”
3. Levels 3+ have meaningful unlocks
4. 3-minute session length fits mobile habit loops

---

## Table State Legibility (post-audit)

| State | Signal | New label | Rating |
|-------|--------|-----------|--------|
| Empty + queue waiting | Purple arrow | SEAT GUEST | ✅ Clear |
| Requesting order | Blue arrow + ? bubble | TAKE ORDER | ✅ Clear |
| Waiting for food | Food image bouncing | (no arrow until carrying) | ⚠️ Confusing |
| Eating | ♡ emoji above table | (none) | ❌ Invisible |
| Paying | Gold arrow + $ emoji | COLLECT $ | ✅ Clear |
| Dirty | Dirt overlay + brown arrow | CLEAN TABLE | ✅ Clear |

**Remaining issue:** Eating state (5–8 seconds) has no clear “leave me alone” signal. The ♡ emoji is too subtle. Players tap occupied tables and get no feedback.

---

## Combo System Legibility

The combo system is completely unexplained to new players.
- `×1` displays grayed gold — player doesn’t know what this number means
- First `×2` happens after 3 serves with no explanation
- `×2.0 LOST!` is confusing if player didn’t know they had `×2`

**Recommended fix:** Add combo tutorial step: “Serve 3 in a row to start your combo! Score multiplies!”

---

## Pacing Analysis

| Phase | Time | What happens | Tension |
|-------|------|-------------|----------|
| Tutorial | 0–20s | 1 customer, guided | Dead time dominant |
| Early game | 20–60s | 2–3 customers | Starts getting interesting |
| Rush Hour 1 | ~60s | Cinematic + faster spawns | Exciting |
| Mid game | 85–150s | 3–4 customers + combos | Peak fun |
| Rush Hour 2 | ~150s | Second wave | Good |
| Final 30s | 150–180s | Timer danger, red HUD | Good |

**Insight:** The game only reaches “peak fun” at the 85s mark. The first 85 seconds need to be improved significantly.

---

## P0 Fixes Applied

- [x] Tutorial card position raised above queue (GAME_HEIGHT-192 vs -58)
- [x] Tutorial spotlight step 2 corrected (full kitchen zone)
- [x] Tutorial step 2 text: mentions READY! signal
- [x] Tutorial step 4 text: mentions eating bar and $ sign
- [x] Tutorial food forced to Salad (1500ms) during first order
- [x] Kitchen premature tap: shows “Still cooking...”
- [x] READY! pop extended from 1.1s to 2.8s
- [x] README rewritten with correct mechanics
- [x] Action labels on all priority arrows (Table.ts)

## P1 Fixes Applied

- [x] Empty tray hidden for Level 1-2 players (Player.ts)

## Remaining Issues (P1)

- [ ] Eating state visual needs stronger signal
- [ ] Combo system never explained
- [ ] Dishwasher needs persistent visible label
- [ ] No in-game score target
