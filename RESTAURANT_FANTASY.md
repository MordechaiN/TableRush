# RESTAURANT_FANTASY.md — TableRush

**Status: DESIGN DOCUMENT — awaiting approval**
**Last Updated: 2026-06-02**

---

## The Question

What fantasy are we selling?

The answer determines everything: what the player sees, what they feel, what they remember, and whether they come back.

Get the fantasy wrong and the game is a chore.
Get it right and the game is a place the player wants to live inside for three minutes at a time.

---

## 1. Core Fantasy

**"You are the best waiter in the room — and everyone knows it."**

Not the restaurant owner. Not the chef. Not the manager.

The waiter.

The person in motion. The one who reads the room. The one who arrives at the table at exactly the right moment, places the dish with quiet confidence, and is already turning toward the next customer before the first one says thank you.

This is the fantasy of **masterful service under pressure**.

It is not the fantasy of survival. Survival is passive — you endure.
It is not the fantasy of management. Management is abstract — you plan.
It is the fantasy of **performance**. Every round is a three-minute performance. The restaurant is the stage. The customers are the audience. The waiter — the player — is the star.

The emotional model is not "can I survive this?" but **"watch what I can do."**

---

### Why This Fantasy and Not the Others

| Fantasy Option | Problem |
|----------------|---------|
| Running a restaurant | Player is owner/manager — too abstract, no physical presence |
| Surviving dinner rush | Survival implies helplessness — creates dread, not pride |
| Building an empire | Long-term, wrong timescale for a 3-minute session |
| Earning huge tips | Transactional — money is means, not meaning |
| Making customers happy | Too soft — lacks the tension and performance edge |

**Masterful service under pressure** is the right fantasy because:
- It scales: a beginner survives, an expert performs
- It has natural highs (flow state, streak, flawless delivery) AND lows (near-miss, choice under pressure)
- It is physical — the waiter MOVES through the restaurant
- It rewards skill, attention, and reading the room
- It can be communicated visually in 3 seconds

---

## 2. Emotional Highs

These are the specific moments the game must manufacture. If a player experiences even three of these per round, they will play again.

### High 1: The Flow State Hit
The player is serving three tables simultaneously, nobody is angry, and everything lands perfectly without thinking. The hands know what to do. The body moves before the mind. For five seconds the player is not managing — they are performing. This is the highest possible moment the game offers.

**What it needs:** Three tasks, each clear, each landing at slightly different times so the player flows between them rather than juggling. The priority system (see GAMEPLAY_REDESIGN.md) creates conditions for this.

### High 2: The Last-Second Save
A customer is at 5% patience — the patience bar is flashing red, "LEAVING NOW!" is visible — and the player delivers the food with one second to spare. The customer's face shifts from angry to happy. The combo lives. The dopamine is enormous.

**What it needs:** The anger arc system (3-stage departure warning). Without the warning, there's no near-miss — just a surprise loss.

### High 3: The Lightning Delivery
The player picks up food from the kitchen and delivers it so fast that the customer still has 80%+ patience. "⚡⚡ LIGHTNING" appears. The tip is doubled. The score jumps.

**What it needs:** The speed multiplier (already implemented) plus a visible "LIGHTNING" moment with appropriate visual weight.

### High 4: The Combo Crescendo
The combo counter reaches TABLE MASTER. The waiter does the excited animation. The score multiplier is ×3.0. Every delivery is worth three times the base. The player is invincible. Everything feels fast, golden, and inevitable.

**What it needs:** Each combo tier must FEEL qualitatively different, not just numerically higher. At ×1.5, nothing changes. At ×2.0, the UI gets warmer. At ×3.0, the screen edge glows gold and the waiter leaves a faint star trail. The combo IS the fantasy in its peak expression.

### High 5: The Perfect Round
No customers left angry. The final score screen says "PERFECT SERVICE — 0 angry customers." The bonus applies. The player has not just survived — they have done something excellent.

**What it needs:** The perfect round bonus (BALANCE_REDESIGN.md) plus a distinct end-screen celebration for zero-angry rounds.

### High 6: The Big Tip Moment
A patient customer (Elder "Nonno," or any customer served lightning-fast) pays. The tip is 50% of the item price — a number the player can see and feel. "💰 BIG TIP!" appears. The waiter does a proud smile. This moment exists because the player made a CHOICE (served this customer first, walked faster) and was REWARDED for it.

**What it needs:** The deterministic tip system (BALANCE_REDESIGN.md). Tip must correlate to skill, not RNG.

---

## 3. Emotional Lows

Not all emotional lows are bad. There are two kinds:

**Good lows (tension):** The player is under pressure, knows what they need to do, almost didn't make it, but the outcome is still undetermined. This creates engagement.

**Bad lows (frustration):** The player loses without understanding why. The system felt arbitrary. They feel cheated, not challenged.

The game must have good lows and eliminate bad lows entirely.

### Good Low 1: The Impossible Choice
Two customers are both about to leave. The player can only save one. They choose. One goes angry. The player feels the weight of that decision — because they made it, not because the system failed them.

**What it needs:** Two customers reaching low patience simultaneously, which happens naturally as the game scales. The presence of the 3-stage anger arc (visible warning, visible countdown) means the player can see both timers, weigh the choice, and decide.

### Good Low 2: The Chain Break
The combo is at 7 — UNSTOPPABLE. Then one customer slips away. The multiplier drops from ×2.5 to ×1.0. The player sees exactly what they lost. They want it back immediately.

**What it needs:** Explicit combo loss display ("COMBO LOST — ×2.5 → ×1.0"). The sting is only motivating if it's legible.

### Good Low 3: The Kitchen Wait
An order is cooking. The player has nothing urgent to do for four seconds. They watch the progress bar and feel the pressure of time. This is acceptable tension IF the player knows what comes next and can trust the system.

**What it needs:** The priority system to give the player a secondary task during cook time (clean a table, collect a payment). If the player truly has nothing to do, the cook time is a rest beat, not dead time — and rest beats are acceptable in a 3-minute game.

### Bad Low (Eliminate): Surprise Anger
A customer goes angry with no warning. The player doesn't know why. They feel cheated, not challenged.

**Eliminate with:** The 3-stage anger arc.

### Bad Low (Eliminate): Invisible Loss
A customer leaves. The player barely notices. Nothing changes.

**Eliminate with:** The angry departure theater (visible walk, particle burst, prominent penalty text).

### Bad Low (Eliminate): Random Failure
The player did everything right but still got a bad outcome (e.g., wrong table highlighted, timer seemed wrong, carry system bug).

**Eliminate with:** Reliable systems and legible feedback. Every failure must feel like the player's choice, not the game's error.

---

## 4. Desired Player Emotions — Per Moment

This is the emotional score of a single service cycle, written as a player's inner monologue:

```
Customer enters.
"Oh — someone new. Let me get to them."
→ Curiosity, mild urgency

Player takes order.
"Got it. Pizza. On its way."
→ Competence, control

Kitchen cooks.
"Two other tables need me. Let me check—"
→ Awareness, scanning, mild tension

Kitchen ready.
"There it is. Time to move."
→ Purpose, momentum

Delivering food.
"They're at 70% patience — I've got this."
→ Confidence, forward motion

Customer receives food.
"😄 Perfect."
→ Satisfaction, briefly

Customer pays.
"⚡ Lightning delivery! Big tip!"
→ Pride, reward

Combo ticks up.
"Three in a row. Keep going."
→ Appetite for more
```

The dominant emotion should cycle: **urgency → competence → satisfaction → appetite for more.**

Never: confusion, helplessness, boredom, or arbitrary frustration.

---

## 5. Visual Cues That Support the Fantasy

The restaurant must communicate "you are performing well" or "danger is rising" at a glance. Every visual element should carry meaning aligned with the fantasy.

### Supporting the "Star Waiter" Identity

| Visual | Message |
|--------|---------|
| Player moves fluidly and quickly | "This waiter is in control" |
| Walk animation with stride, not shuffle | "This person knows their job" |
| Food on a real plate (not floating) | "This is a professional service" |
| Waiter emotion badge (proud, excited) | "This waiter has feelings — they care" |

### Supporting "The Restaurant is Alive"

| Visual | Message |
|--------|---------|
| Candles flickering at each table | "This is a real place, right now" |
| Steam from kitchen during cooking | "Food is actually being made" |
| Customers doing idle animations | "These are people, not icons" |
| Pendant lamps gently swaying | "There's atmosphere here" |
| Customer name/type label on arrival | "This is Sofia. She's elegant. She expects good service." |

### Supporting "Momentum is Building"

| Visual | Message |
|--------|---------|
| Combo counter warming orange → gold | "Something special is happening" |
| Screen edge golden glow at ×3.0 | "I am unstoppable right now" |
| Speed multiplier text "⚡ LIGHTNING" | "That was impressive" |
| Large floating score numbers | "Every action has immediate value" |

### Supporting "Stakes Are Real"

| Visual | Message |
|--------|---------|
| Red patience bar pulsing | "This customer is about to leave" |
| "LEAVING NOW!" text | "I have seconds — this is real" |
| Angry departure with visible walk out | "I actually lost that customer" |
| Combo loss display | "I can see exactly what that cost me" |

---

## 6. Mechanics That Support the Fantasy

These mechanics belong in the game because they reinforce the core fantasy of masterful service under pressure.

### Auto-Order (keep, improve feedback)
A master waiter doesn't ask "would you like the salmon or the pasta?" at every table. They read the customer, they know what's right. Auto-assignment is correct. The fantasy is: the player is experienced enough to handle the order intuitively. What's missing is the ORDER REVEAL MOMENT — the flash of the food emoji with a confident pop. Make the auto-order feel intentional.

### Speed Multiplier (keep, make visible)
The faster the service, the bigger the reward. This is the mechanical expression of the fantasy. The master waiter is fast. Speed is not just a timer — it's a form of respect for the customer's time. Every speed multiplier flash should feel like an acknowledgment of excellence.

### Combo System (keep, amplify visually)
Consecutive happy customers = the waiter is in their zone. The flow state. The combo is the game's acknowledgment that the player has transcended mechanics and is now just performing. The combo visual escalation (VISUAL_REDESIGN.md) is critical because it must LOOK like the restaurant is responding to the player's mastery.

### Customer Patience Diversity (add this)
Not every customer should have the same patience timer. The fantasy requires that the player READS the room. A business customer is always checking their watch. An elder customer is in no rush — he's been coming to this restaurant for 30 years. The player should look at a new arrival and feel something about them, not just see a sprite on a countdown.

### Physical Walk (keep)
The waiter physically walks to every interaction. This is the most important choice in the entire game. Without it, the game is a spreadsheet. With it, the player's body IS the waiter. Every walk is an investment. Every route choice matters. The physical presence is the core of the fantasy.

### Tips (keep, fix the formula)
Tips are the most honest feedback in a restaurant. A big tip means "you were excellent." The current random tip formula destroys this emotional clarity. Deterministic tips (based on patience at delivery) mean every tip is earned. The player knows: if I serve this customer while they're still happy, I get a great tip. That's the fantasy.

---

## 7. Mechanics That Hurt the Fantasy

These mechanics currently exist and undermine the player's feeling of being a master waiter.

### Silent Auto-Order
When the player taps a requesting customer and nothing visible happens for 0.5 seconds, the moment of competence — "I took that order" — disappears. The waiter should have a visible acknowledgement of every interaction. Currently the game makes the player feel like they hit a button, not served a person.

**Fix:** Order reveal animation (GAMEPLAY_REDESIGN.md, Problem 2).

### Equal-Volume Priority Pulses
When three tables pulse at the same intensity, the player's feeling of control collapses. A master waiter scans the room and instantly knows where to go. The current system makes the player scan four equal-urgency signals and guess. That is the opposite of mastery.

**Fix:** Single dominant action system (GAMEPLAY_REDESIGN.md, Problem 1).

### Surprise Customer Departure
When a customer leaves with no warning, the player feels victimized by a timer they didn't see. This is the exact opposite of the fantasy. The master waiter is never surprised by an angry customer — they saw it coming, they made a choice (possibly wrong), and they live with that choice. Right now the game makes choices FOR the player. The fantasy requires the player to make the choices.

**Fix:** 3-stage anger arc (GAMEPLAY_REDESIGN.md, Problem 4).

### Random Tips
If the tip is random, big tips feel like luck, not skill. The emotional high of "⚡ Big tip!" only exists if the player knows they EARNED it. Random tips strip the meaning from one of the best moments in the fantasy.

**Fix:** Deterministic tip formula (BALANCE_REDESIGN.md, Problem 3).

### Static Restaurant (No Ambient Life)
Between player actions, the scene is frozen. A living restaurant hums, flickers, moves. When everything is static, the player is aware they are interacting with a program, not inhabiting a place. The fantasy requires that the restaurant exist independently of the player's inputs.

**Fix:** Ambient motion layer (VISUAL_REDESIGN.md, Problem 1).

### Generic Customers (No Personality)
Seven customer sprites with no names, no personalities, no individual reactions. Every customer feels identical. In a real restaurant, the waiter builds a quick relationship with each table — even in three minutes. The player should feel something different when they see Nonno (patient, will tip generously) versus Marco (impatient, will leave fast). Right now, customers are colored timers with faces.

**Fix:** Customer personality system (VISUAL_REDESIGN.md, Problem 2 + BALANCE_REDESIGN.md, variant modifiers).

---

## 8. Bridging the Gap: Systems → Living Restaurant

The game currently feels like systems and timers because every interaction is **symmetric and transactional**. Every customer has the same loop. Every delivery has the same reward. Every round starts and ends the same way.

A living restaurant has **asymmetry, personality, and consequence**.

Here is the specific gap, and how to close it:

### Gap: Customers Are State Machines, Not People

**Current:** Customer enters → timer starts → state changes → leaves.
**Living version:** Customer has a name, a personality modifier, an idle animation, a specific reaction to good/bad service, a line of text on payment that is uniquely theirs.

The implementation cost is small (names are just data, personality modifiers are multipliers). The emotional impact is enormous. When "Nonno" sits down and you know he's patient and will tip well, you FEEL something about serving him. That feeling is the restaurant coming alive.

### Gap: The Waiter Is an Input Handler, Not a Person

**Current:** Player clicks to trigger state transitions.
**Living version:** The waiter reacts to everything, has emotional states that carry through multiple interactions, and expresses personality when the fantasy is at its peak.

When the combo hits ×3.0, the waiter's face changes. The stride gets faster (walk speed bonus visual). There are star sparkles. The player identifies with their character. The waiter is having a great night — and so is the player.

### Gap: The Restaurant Is a Background, Not a Place

**Current:** Static colored floor, tables, kitchen.
**Living version:** Candles flicker. The kitchen hisses and steams. Customers murmur (through idle animations). The pendant lamps sway in the draft from the door when a new customer enters.

None of this requires audio. All of it can be done with the existing tween system. The restaurant should feel like it is running whether or not the player interacts. It exists independently.

### Gap: Time Passes But Nothing Changes

**Current:** Second 1 and second 170 look identical.
**Living version:** The restaurant builds in energy. By the third tier (Rush Hour), the scene should visually communicate "this is the dinner rush." Tables are full. The kitchen is glowing. The waiter is moving faster. The player can SEE that they've survived into the hard part.

---

## Summary

The fantasy is: **"You are the best waiter in the room — and everyone knows it."**

The fantasy works when:
- The player's actions have immediate, legible, meaningful feedback
- The customers feel like people with individual personalities
- The restaurant feels alive before the player acts
- The high moments (combo, lightning tip, last-second save) are unmistakable
- The low moments (near-miss, combo break) are the player's own choices, not the system's arbitrariness

The fantasy is broken when:
- Actions are silent or ambiguous
- All priority signals look the same
- Customers leave without warning
- Tips are random
- The restaurant is static

Every design decision from this point forward should be tested against the fantasy:

**Does this make the player feel like the best waiter in the room?**

If yes: implement it.
If no: change it or cut it.
