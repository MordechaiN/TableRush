# TableRush — Player Experience Audit
*Full gameplay walkthrough, frame-by-frame observation*

---

## Methodology

Played through a complete session using Playwright (full browser simulation), screenshotting every state transition. Observations are recorded from the perspective of a first-time player who has never seen the game before.

---

## Phase-by-Phase Observations

### Main Menu
**What I see:** Golden-oak tile floor, TABLE RUSH logo card, animated food icons, PLAY button.
**What works:** Logo is readable. Button is clearly tappable.
**Problems:**
- Background is static. No movement = "screensaver" feeling, not "game" feeling.
- The table silhouettes in the background use old cream tablecloth color (not updated from color change).
- No preview of the restaurant — player has zero visual context for what they'll do.

---

### Game Start (0 seconds)
**What I see:** Full restaurant layout, waiter in center bottom.
**What works:** Floor looks rich and warm. Tables clearly visible with burgundy cloth.
**Problems:**
- Player has NO IDEA which table to tap first. Action arrows are not yet shown.
- "COOKING" and "READY" labels in kitchen are very small.
- No customer present yet — so nothing to do. 2-second wait with no feedback feels like a load screen.
- Tray shows 2 empty slots above waiter's head but this reads as "something is on the tray."

---

### Customer Arrives in Queue (5 seconds)
**What I see:** Customer appears at bottom center. Action arrow appears above an empty table.
**What works:** Arrow color-coded purple (seating). Sound of customer arriving.
**Problems:**
- Customer in queue is VERY SMALL. Hard to read them as a distinct person.
- The "waiting area" has no visual boundary — customer floats in empty floor space.
- No indication of HOW MANY customers are waiting.
- No host stand that reads as "the place you seat from."
- First-time player has no way to know "tap a TABLE (not the customer) to seat them."

---

### Customer Seated at Table
**What I see:** Waiter walks to table. Customer also walks to table. Yellow glow appears.
**What works:** Glow state is noticeable. Waiter walking animation plays.
**Problems:**
- Customer at table is nearly INVISIBLE — small sprite, same warm palette as floor.
- The glow covers the entire table area, making it unclear which person is the customer.
- Menu card appears on table but it's 16x20px — unreadable at a glance.
- No clear "TAKE ORDER" prompt. Player must know to tap the table again.
- The action arrow for "requesting" (blue) is correct but its relationship to table state is confusing.

---

### Order Taken (Food Cooking)
**What I see:** Order confirmation, ticket appears on kitchen rail.
**What works:** "✓ ORDER!" float text is now bigger (36px). Kitchen ticket appears.
**Problems:**
- NOTHING visible on table surface saying "this table is waiting for 🍔."
- Customer's order bubble (food emoji) is at their head level — barely visible under the action arrow.
- The kitchen ticket rail is small. With multiple orders, player loses track of what's cooking.
- No progress indicator visible from the dining area — player must walk to kitchen to check.
- Orange arrow shows on table (kitchen_ready) — this is confusing because food is NOT yet ready.

---

### Food Ready in Kitchen
**What I see:** Plate appears on READY zone. Ticket gets ✓ badge.
**What works:** Plate with food emoji is visible on kitchen shelf.
**Problems:**
- The "food is ready" signal is quiet. Only a small ring pulse around the plate.
- The READY zone label is very small text. Hard to distinguish COOKING from READY at a glance.
- No sound-based flash or camera response to food ready.
- Kitchen glow changes color but the change is too subtle.
- Player with multiple tables running simultaneously will miss ready plates.

---

### Food Picked Up and Delivered
**What I see:** Player walks to kitchen, picks up plate, walks to table, delivers.
**What works:** Delivery animation plays. Coin burst is bigger now. "✓ SERVED!" text appears.
**Problems:**
- No distinction between "player has picked up food" and "player is carrying nothing."
- Score numbers fly up and disappear quickly — 36px is better but still feels brief.
- Customer happy reaction (green flash + bounce) is subtle.
- No "eating" visual on the table — the plate drawn on table is tiny.

---

### Customer Eating
**What I see:** Customer stays at table. Eating progress bar appears.
**What works:** Eating progress bar fills over time. Customer does chewing idle animation.
**Problems:**
- Eating progress bar is BELOW the customer sprite at y+38. Impossible to see it at a glance.
- No obvious visual that says "this customer is eating, leave them alone."
- Table has "plate" state visual (tiny 32px graphic inside container) — invisible at this scale.
- Player has no clear task signal — nothing urgent happening, easy to lose focus.

---

### Customer Paying
**What I see:** Gold glow on table. Gold pulsing arrow. Customer shows 💳 bubble.
**What works:** Gold = paying is learnable. Arrow is gold = payment.
**Problems:**
- Bill visual on table is 24x17px — tiny dark leather folder. Not readable at distance.
- The "paying" glow is gold but same brightness as "READY" on kitchen — two gold elements compete.
- Customer bubble shows "💳 $13" but font is 12px — tiny.

---

### Dirty Table
**What I see:** Orange-red glow, dirty dishes overlay appears.
**What works:** Dirty dish overlay is detailed and recognizable.
**Problems:**
- The orange glow is similar to the "kitchen_ready" arrow — color ambiguity.
- Nothing screams "CLEAN ME FIRST" clearly to new players.
- No emoji above table marking it as dirty from across the room.

---

### Dishes to Dishwasher
**What I see:** Player picks up dishes. "→ DISHWASHER" text floats. Dishwasher glows amber.
**What works:** Amber glow on dishwasher activates. Direction hint shows.
**Problems:**
- Dishwasher is in far left corner — hard to find at first.
- "CLEAN!" text is 36px but appears at a corner of the screen far from the action.
- No "dishes cleaned" satisfaction animation.

---

## Critical Issues by Priority

### Priority 1 — IMMEDIATE (breaks experience)
1. **Customer invisible at table** — Players can't tell if a table is occupied by a person or just glowing.
2. **Nothing on table showing what food is ordered** — Players must remember or check kitchen.
3. **No waiting guest count** — Can't manage urgency without knowing queue depth.

### Priority 2 — HIGH (reduces engagement)
4. **Kitchen READY signal is quiet** — Missed ready plates = frustrated players.
5. **Combo milestones don't feel epic** — ×4 is HUGE but barely registers.
6. **Eating state is invisible** — No signal to "leave this table alone."
7. **Dirty table emoji is missing** — Dirty state needs an above-table indicator.

### Priority 3 — MEDIUM (feels incomplete)
8. **Main menu is static** — No ambient life.
9. **Customer scale too small** — Individual customers aren't readable as people.
10. **Tutorial still reads as dev notice** — Bottom card format doesn't guide the eye.

---

## What Would Make a First-Time Player Stay

The game mechanic is sound. The loop is satisfying when you get into it. The problem is the first 60 seconds:

1. Player doesn't see customers as distinct people at tables
2. Player doesn't know what a glowing table needs
3. Player misses ready food and doesn't understand why score is low
4. Player breaks combo without knowing why

Fix those four things and the retention improves dramatically.
