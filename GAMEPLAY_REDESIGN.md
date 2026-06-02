# GAMEPLAY REDESIGN — TableRush

**Status: AWAITING APPROVAL — do not implement**
**Author: Claude Code**
**Date: 2026-06-01**

---

## 1. What Is Wrong Now

### 1a. Order flow is mechanical, not fun
The current flow forces the player to:
1. Click seated customer → order popup appears
2. Click a menu item
3. Wait while watching nothing happen
4. Click the table again to deliver

This is a two-click-wait-click pattern with no player agency between steps. It feels like a form, not a game.

### 1b. No teaching
The game starts immediately with customers appearing. There is no indication that you should tap a seated customer to take their order. First-time players will wait and lose customers before understanding the mechanic.

### 1c. Angry customers leave dirty tables
Currently: customer leaves angry → table is dirty → player must still clean it. This is doubly punishing and unintuitive. The customer never received food, so the table should be fine.

### 1d. Player loses track of tasks
When 3-4 customers are at tables simultaneously, there is no priority indicator telling the player who needs help most urgently.

---

## 2. New Customer Lifecycle

Each customer goes through exactly these states:

```
ENTERING → SEATED → REQUESTING → ORDERING → WAITING_FOOD → EATING → PAYING → LEAVING
```

### State descriptions

| State | Visual Cue | Player Action |
|-------|-----------|---------------|
| ENTERING | Customer walks from door to table | None (watch) |
| SEATED | Customer settles, patience bar appears | None (brief settle delay ~1.5s) |
| REQUESTING | Speech bubble with ❓ appears, table pulses | Tap table → player walks over |
| ORDERING | Player arrives → order bubble auto-shows item | None (auto-resolved) |
| WAITING_FOOD | Order bubble shows item icon, patience ticks | Collect food from kitchen, tap table |
| EATING | Content animation, patience bar frozen | None |
| PAYING | 💳 icon appears, table pulses | Tap table to collect |
| LEAVING | Customer walks out smiling | None |

### Key design changes

**Order is automatic.** When the player walks to a REQUESTING customer, the order is taken automatically. No menu popup. The customer's order is randomly assigned from the menu and displayed in their speech bubble. This removes the awkward popup and keeps the game flowing.

**Two distinct interaction moments per customer:**
1. Walk to customer (take order) → go to kitchen → pick up food → walk back to deliver
2. Tap table to collect payment

This creates a satisfying two-act structure per customer.

**Kitchen queue is visible.** A horizontal ticket rail at the top of the kitchen area shows pending orders as colored food icons. The player taps the kitchen when a matching order is ready, picks it up, and delivers.

---

## 3. Angry Customer Behavior

When patience runs out:

- Customer shows 😡 expression
- Speech bubble turns red
- Customer stands, walks out
- **Score penalty:** −50 points × current difficulty multiplier
- **Combo reset:** multiplier returns to ×1.0
- **Table becomes immediately available** (no cleaning needed — customer never ate)
- Table does NOT become dirty

This is fair. The player is penalized for ignoring a customer but not punished twice.

---

## 4. Table Cleaning — When It Applies

Table cleaning ONLY happens after a customer eats and pays and leaves normally.

After a happy customer leaves:
- Table shows leftover visual (crumbs, empty plates)
- 🧹 indicator appears
- Player taps table to clean (1-2 second animation)
- Table becomes available again

Cleaning is a **positive ritual** — it marks a successful service cycle.

---

## 5. Player Guidance — Priority System

The game must always communicate who needs the player most.

### Attention priority (highest → lowest):
1. ❗ Customer patience < 25% → table pulses red urgently
2. 🍽️ Food is ready in kitchen → kitchen pulses warm orange
3. ❓ Customer requesting order → table pulses soft blue
4. 💳 Customer ready to pay → table pulses gold
5. 🧹 Table needs cleaning → table shows subtle broom icon

This creates a clear visual hierarchy. The player scans the screen, finds the most urgent pulse, acts.

### Waiter indicator
An arrow or highlight shows the waiter's current target when moving. The player always knows: "my waiter is going here."

---

## 6. Addiction Loop

### Per-customer rewards
| Achievement | Bonus |
|-------------|-------|
| Served before 75% patience used | ⚡ Fast Bonus +25 pts |
| Served before 50% patience used | ⚡⚡ Speed Bonus +50 pts |
| All 5 customers happy simultaneously | 🌟 Full House +100 pts |
| 5 consecutive happy customers | 🔥 Combo ×2 |
| 10 consecutive happy customers | 🔥🔥 Combo ×3 |

### End-of-round rating
After the 3-minute round ends:
- Count: customers served / customers who left angry
- Rating: 3 stars (all served) → 2 stars (< 3 angry) → 1 star (< 5 angry)
- Star rating shown prominently on Game Over screen
- High score = best score (not star count, but stars are displayed)

### Visual feedback moments
- Coin burst on payment collection
- Score pop with multiplier shown (+240 ×2!)
- Combo number animates when increasing
- Streak counter visible in HUD

---

## 7. Tutorial — First 30 Seconds

On first play:
1. One customer spawns and sits (no others)
2. Arrow points to customer, text: "Tap the table!"
3. Player taps → waiter walks → order taken automatically
4. Arrow points to kitchen: "Pick up the order!"
5. Player taps kitchen → picks up food
6. Arrow points back to table: "Deliver it!"
7. Player taps → food delivered
8. Customer eats → pays → arrow: "Collect payment!"
9. Tutorial complete → normal game begins

Tutorial state tracked in localStorage. Only shown once.

---

## 8. What Does Not Change

- 3-minute session length
- 5 tables maximum
- Menu items (Burger, Pizza, Salad, Pasta, Sushi)
- High score persistence
- Pause / Game Over / Main Menu screens
- TypeScript + Phaser 3 implementation

---

## 9. Implementation Priority

1. Fix customer state machine (new states)
2. Fix order flow (auto-order on arrival)
3. Fix angry customer (no dirty table)
4. Add priority visual system
5. Add bonus system
6. Add tutorial
7. Add end-of-round star rating
