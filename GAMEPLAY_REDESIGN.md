# GAMEPLAY REDESIGN — TableRush

**Status: AWAITING APPROVAL — do not implement**
**Last Updated: 2026-06-02**

---

## Executive Summary

The game is mechanically complete. The loop is correct. The problem is that the loop has no **felt meaning**. Each action is invisible. Each success is silent. Each failure is random-feeling. The player finishes a round and doesn't understand what they did right or wrong, and has no reason to play again.

This document proposes solutions for every failure point.

---

## Problem 1: The Player Never Knows What to Do Next

### Observed Problem
At any moment the player faces simultaneous signals: blue table pulse, orange kitchen glow, gold paying pulse, red patience bar. All at equal visual intensity. No hierarchy. The player's eye cannot land anywhere.

### Root Cause
The priority pulse system treats all urgency equally. A requesting customer and a nearly-angry customer look like the same problem at the same volume.

### Proposed Solution: Single Dominant Action

At all times, exactly **one** object is the PRIMARY action target. It pulses at 100% intensity. All other actionable objects pulse at 35% intensity.

**Priority hierarchy (highest first):**
1. Customer patience < 20% AND player not carrying food → Save them. Urgent red pulse + border
2. Kitchen order ready AND player not carrying → Pick up food. Orange pulse, full glow
3. Player carrying food AND matching customer exists → Deliver. Orange arrow above player pointing to table
4. Customer in `requesting` state → Take order. Blue pulse, "wave" bounce on customer
5. Customer in `paying` state → Collect payment. Gold pulse
6. Table `dirty` → Clean. Broom icon + dim gray pulse

**Visual intensity model:**
- PRIMARY: full pulse, ring opacity 1.0, 500ms cycle
- SECONDARY (other actionables): ring opacity 0.35, 1000ms cycle
- INACTIVE: no pulse

This creates a clear visual hierarchy. The player's eye goes to the brightest object. Secondary tasks remain visible but don't compete.

### Also Needed: Directional Arrow for Delivery

When player picks up food from kitchen, show a small animated arrow above the player's head pointing toward the destination table. The arrow updates as the player moves. Disappears on delivery. This removes ambiguity about which table needs food.

---

## Problem 2: Taking an Order Has No Payoff

### Observed Problem
Player taps requesting customer → player walks → customer bubble silently changes from ❓ to food emoji → small ticket appears in kitchen. No drama. No "I did it" moment. Players report the game feels like "nothing is happening."

### Root Cause
The auto-order mechanic is correct design (no menus = fast paced = fun) but it lacks **feedback theater**. The player's action must feel meaningful and rewarded.

### Proposed Solution: Order Reveal Animation

When player reaches the requesting table and order is taken:

1. **Customer bubble pop**: ❓ → food emoji with Back.easeOut scale punch (0.3s)
2. **"+ORDER TAKEN" floating text**: rises from customer position in orange, scale punch
3. **Kitchen ticket slide-in**: the new ticket slides from right to left onto the rail with a satisfying settle
4. **Customer mood shift**: customer's expression changes from neutral/hungry to anticipating (slightly happy)
5. **Waiter nod**: player sprite does a quick bob (head dip) to signal acknowledgement

This sequence takes 0.4s total. It communicates: "I see you. I know what you want. It's on its way."

**Key: the food emoji bubble must stay visible until food is delivered.** Currently it hides after ordering. Keeping it visible reminds the player what each customer ordered AND makes the delivery confirmation more satisfying (bubble goes away WHEN the food arrives).

---

## Problem 3: The Correct Game Flow Is Not Self-Evident

### Observed Problem
New players don't know:
- That tapping the kitchen picks up food
- Which table to deliver to after pickup
- That they need to tap the customer again to collect payment
- What the broom icon means

### Root Cause
The game teaches these through a text-based tutorial that few players read carefully. Games must teach through **play**, not text.

### Proposed Solution: Contextual Prompt System

Small animated tooltips appear the first time a new interaction becomes available. Not a tutorial overlay — a contextual whisper.

| Moment | Prompt |
|--------|--------|
| First customer appears | "✋ Tap the table to take their order" |
| First order cooking | "👨‍🍳 Wait for kitchen to cook..." |
| First order ready | "👆 Tap kitchen to pick up!" |
| Player carrying food | "🍽️ Deliver to [table arrow]" |
| First customer paying | "💰 Tap to collect payment!" |
| First dirty table | "🧹 Tap to clean" |

Each prompt appears ONCE, for 3 seconds, then dismisses forever (localStorage tracked). Not a blocking tutorial — a hint that doesn't interrupt play.

### Also: "What To Do" pulse on player when idle

If the player stands still for more than 3 seconds and there are available actions, the player sprite gets a small bouncing "?" above their head with an arrow pointing toward the highest-priority task. Gentle nudge, not intrusive.

---

## Problem 4: Angry Customer Departure Is Invisible

### Observed Problem
Customer patience reaches zero → they instantly disappear → score penalty floats briefly → combo resets. Player may not notice if mid-walk. The punishment feels arbitrary.

### Root Cause
No warning before departure. No visual consequence. The player learns nothing. They don't feel the loss as a meaningful failure — just a random negative event.

### Proposed Solution: Three-Stage Anger Arc

**Stage 1 — Impatient (patience 30–60%):**
- Customer face: `hungry` mood (already implemented)
- Customer taps table (small repeating animation: y−2 every 1.5s)
- Table pulse: orange, medium intensity

**Stage 2 — Angry (patience 10–30%):**
- Customer face: `angry` mood (already implemented)
- Customer stands up from seat (y offset −8, visible)
- Table pulse: red, HIGH intensity (primary priority)
- "😤 Losing patience!" floats above customer for 2s (appears ONCE at 15% threshold)

**Stage 3 — Leaving (patience 0–10% countdown):**
- "LEAVING NOW!" in red appears 3 seconds before departure
- Customer turns toward door
- Table pulses at maximum intensity

**On departure:**
- Customer walks toward door (off-screen), visible walk
- Red burst particles from where they sat
- "CUSTOMER LOST" text, size 24, red, stays for 1.5s
- Camera tiny shake
- Waiter stress reaction (already implemented)
- Score penalty text prominent (−50/−100/−150)

This makes the failure visible, legible, and preventable next time.

---

## Problem 5: The Tutorial Doesn't Create a First Success

### Observed Problem
Current 6-step tutorial: text overlays that must be dismissed. Player feels lectured. First real experience is confusing multi-customer pressure.

### Root Cause
Tutorial teaches features, not success. The first session should be scripted to create a single perfect service chain that makes the player feel like a great waiter.

### Proposed Solution: "Guided First Service"

Tutorial is a single scripted customer (pre-determined variant, pre-determined order).

Step-by-step with LARGE arrow indicators:

```
1. One customer enters. Sits down. Requests attention.
   ARROW → table. "Someone needs you!"
   
2. Player taps table. Order taken.
   Flash: "Order taken! 🍕 Pizza on the way!"
   ARROW → kitchen.
   
3. Kitchen cooks (sped up to 1.5s for tutorial).
   "Kitchen is cooking..."
   
4. Order ready. Kitchen glows.
   ARROW → kitchen. "Pick up the order!"
   
5. Player picks up. Arrow → table.
   "Deliver the food!"
   
6. Player delivers. Customer eats.
   "Excellent! Customer is happy! 😄"
   
7. Customer pays. Gold ring appears.
   ARROW → table. "Collect payment!"
   
8. Payment collected. BIG REWARD: 
   "PERFECT SERVICE! +200 bonus!
   ⭐ First round: serve as many customers as you can in 3 minutes!"
```

Tutorial: one customer, one cycle, scripted success. Then full game begins.

---

## Correct Core Loop (as designed — validation)

The user-specified flow IS what the game implements. What needs to change is the **feedback** at each step:

| Step | Current Feedback | Required Feedback |
|------|-----------------|-------------------|
| Customer enters | Walk animation | Walk + name tag flash (Elegant / Teen / etc.) |
| Customer requests | ❓ bubble + blue pulse | ❓ bubble + blue pulse + character wave animation |
| Player takes order | Silent bubble change | Pop animation + "+ORDER" toast + ticket slide-in |
| Order cooking | Ticket + small progress bar | Ticket + cook bar + steam particles (already done) |
| Order ready | Kitchen glow | Kitchen glow + "READY!" text flash |
| Player picks up | Food appears on tray | Food on plate + pickup animation + delivery arrow |
| Player delivers | Food disappears | Pop animation + "😋 Enjoy!" customer reaction |
| Customer eats | Eat bar fills | Eat bar + "mmm" emoji bubble |
| Customer pays | Gold ring | Gold ring + "💰 Thank you!" bubble + coin sparkle |
| Table dirty | Broom icon | Broom icon (fine as-is) |
| Table cleaned | Table clears | Clean shine effect |

---

## Implementation Priority

| Priority | Feature |
|----------|---------|
| 🔴 CRITICAL | Single dominant action visual hierarchy |
| 🔴 CRITICAL | Order reveal animation + kitchen ticket slide-in |
| 🟠 HIGH | Anger warning 3-stage arc |
| 🟠 HIGH | Delivery arrow indicator |
| 🟡 MEDIUM | Contextual first-time hints (not blocking tutorial) |
| 🟡 MEDIUM | Tutorial redesign (guided first service) |
| 🟢 LOW | Customer type name tag on arrival |
| 🟢 LOW | "Thank you!" payment bubble |
