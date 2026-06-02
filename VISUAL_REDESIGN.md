# VISUAL REDESIGN — TableRush

**Status: AWAITING APPROVAL — do not implement**
**Last Updated: 2026-06-02**

---

## Executive Summary

v0.6.0 corrected the most critical bugs (face coordinates, UI positions, outlines). The bones are now right. The next visual problem is not correctness — it is **life**. The game looks like a stopped photograph of a restaurant. Nothing moves except when the player acts. Real restaurants are alive at all times. This document defines what visual life means for TableRush and how to achieve it.

---

## Problem 1: The Restaurant Feels Static

### Observed
Between player actions, the scene is frozen. Tables don't breathe. Customers sit like statues. Kitchen never moves. The restaurant has the energy of a screenshot, not a place.

### Analysis
Reference games all have ambient motion as a core feel:
- Good Pizza Great Pizza: customers nod, tap foot
- Overcooked: kitchen tools steam, ingredients jiggle
- Diner Dash: customers have varied idle animations

Static scenes feel like prototypes. Moving scenes feel like worlds.

### Proposed Solution: Ambient Motion Layer

**Tier 1 — Always running (no gameplay impact):**
- Pendant lamps: very slow sway (±2° rotation, 4s yoyo, Sine ease). Subtle.
- Kitchen steam: already implemented, keep + add slight opacity variation
- Candle flames: slight scale oscillation (0.9–1.1x, 1.5s yoyo per candle, random delay offset so they don't sync)

**Tier 2 — Customer idle animations (while seated, waiting):**
- Every 2–4s (random): customer does a subtle "looking around" tilt (y−3, 0.3s ease)
- At patience 60–100%: customer sits contentedly (no animation)
- At patience 30–60%: customer does periodic table-tap (arm dips y+2 briefly)
- At patience < 30%: customer drums table (rapid y+2 yoyo, 0.4s cycle)

These are drawn in `preUpdate`, driven by `patienceActive` and elapsed time.

**Tier 3 — Event-driven ambient:**
- When new customer arrives: door opens (brief flash at entrance)
- When customer leaves happy: brief wave animation at door edge
- When kitchen order is ready: bell ring flash on kitchen (bright white circle expands + fades)

---

## Problem 2: Characters Lack Personality

### Observed
7 customer variants look like 7 differently-colored shapes with small accessory differences. They feel like data entries, not characters.

### Analysis
Character appeal in mobile casual games comes from:
1. Distinctive silhouettes (mostly solved in v0.6.0)
2. Expressive reactions that feel human
3. Moment-to-moment personality (a Teen acts differently than an Elder)
4. Names / labels that create emotional attachment

### Proposed Solution: Character Personality Layer

**Names for each variant** (shown briefly on arrival):
| Variant | Name | Personality |
|---------|------|-------------|
| Elegant | Sofia | Patient, tips well |
| Business | Marco | Impatient, orders fast |
| Casual | Jake | Relaxed, takes time |
| Trendy | Zara | Selfie-aware, expressive |
| Romantic | Rosa | Warm, grateful on payment |
| Elder | Nonno | Very patient, tips generously |
| Teen | Kyle | Fast eater, no tip (but combo bonus) |

**Personality differences in patience:**
Not all customers have the same patience timers. The variant itself modulates the base patience:
- Nonno (Elder): +20% patience
- Sofia (Elegant): +10% patience, higher tip multiplier
- Marco (Business): −20% patience, higher price items
- Kyle (Teen): −10% patience but quick eater (−30% eat time)

These multipliers apply ON TOP of difficulty tier values.

**Payment personality:**
- Sofia: "Magnifique! 💋" bubble on payment
- Marco: "$$ EXCELLENT SERVICE" bubble
- Nonno: "Grazie, figlio mio! 🙏" bubble
- Kyle: "mid 🤙" bubble

---

## Problem 3: Food Looks Unappealing

### Observed
Food is an emoji on a plate circle. Technically correct per v0.6.0 spec. But the food doesn't make you hungry. In Good Pizza Great Pizza, food is the most satisfying visual in the game.

### Analysis
Food emojis are appropriate for this game's art style and scope. The issue is PRESENTATION not the emoji choice. In v0.6.0 the food now sits on a plate — that's a start. But the plate has no depth. No light. No appeal.

### Proposed Solution: Food Presentation Enhancement

**On the tray (player carrying):**
- Plate circle: keep white inner + subtle rim shadow
- Add tiny food-specific "steam" effect for hot dishes (Pasta, Pizza): 2 wisp circles floating up from plate, very subtle
- Add garnish dot for cold dishes (Salad, Sushi): small green circle at plate edge

**On customer table (eating):**
- When food is delivered: brief "wow" sparkle on customer bubble (3 small stars radiate)
- Food emoji on table (under customer) during eating phase — currently disappears
- After eating: empty plate visible for 0.5s before clearing (feels satisfying)

**On kitchen ticket:**
- Ticket bg already orange-bordered
- Add food-specific color tint on ticket bg:
  - Salad: light green tint
  - Burger: warm orange tint
  - Pasta: warm yellow tint
  - Sushi: cool blue tint
  - Pizza: deep orange tint

---

## Problem 4: The UI Lacks Character

### Observed
HUD is functional but sterile. It looks like a generic game template. Score, timer, combo — nothing makes it feel like TableRush specifically.

### Analysis
Branded UI contributes to memorability. The game should feel like a place called TableRush, not "generic restaurant game #47."

### Proposed Solution: UI Personality

**Score display:**
Current: "🍽️  0"
Proposed: Score shown in a warm wood-colored panel with a fork/knife icon. Font: slightly rounded, warm orange on cream. Not just a number — "Total Tips: 420" with a coin icon.

**Combo display:**
When combo is active, the combo display gets a flame effect behind it (orange/red gradient that intensifies with higher combo). The name "HOT STREAK" literally has heat shimmer.

**Timer display:**
Normal time: neutral warm color. Below 60s: amber. Below 30s: red with subtle pulse. Last 10s: large countdown font, each second animates in.

**HUD height:**
Current: 56px. Propose: 60px. Slightly more breathing room. Score left, restaurant name center (small, light text: "Bella Notte"), timer right.

---

## Problem 5: No Visual Progression Within a Round

### Observed
The game looks identical at second 1 and second 170. There's no visual escalation. No sense of building momentum.

### Analysis
Visual escalation creates psychological momentum. When the game looks harder, players feel more invested in surviving. When multiple systems are firing, the screen should feel alive with activity.

### Proposed Solution: Visual Escalation Layer

**60 seconds:** Normal atmosphere
**60–120 seconds:** Kitchen area gets slightly brighter orange glow. More steam wisps per cooking order. Customers arrive slightly faster (visual density increases).
**120–180 seconds (Rush Hour):**
- Background slightly darkens (0.96x brightness overlay) — barely perceptible
- "RUSH HOUR!" text flashes on-screen when this tier begins
- All pulse speeds increase by 20%
- Waiter can have a "determined" expression at this point

**High Combo Visual Escalation:**
- Combo 3: warm orange tint on entire floor (very subtle)
- Combo 5: orange + gold shimmer on player
- Combo 10: screen edge gets golden glow, player leaves a brief "trail" of stars while walking

---

## Visual System: What We're NOT Changing

To avoid scope creep, the following are locked and should not be revisited:
- Face coordinates (fixed in v0.6.0)
- Patient bar position and size
- Bubble layout and shadow
- Table/kitchen/player textures (accepted for now)
- Floor tile pattern
- Wall art positions

---

## Implementation Priority

| Priority | Feature |
|----------|---------|
| 🔴 CRITICAL | Nothing — v0.6.0 visuals are acceptable baseline |
| 🟠 HIGH | Ambient candle flicker + lamp sway |
| 🟠 HIGH | Customer idle animations (table tap at low patience) |
| 🟡 MEDIUM | Customer name labels on arrival |
| 🟡 MEDIUM | Food presentation (steam on hot dishes, garnish on cold) |
| 🟡 MEDIUM | Combo visual escalation (floor tint, player trail) |
| 🟢 LOW | Payment personality bubbles per customer type |
| 🟢 LOW | "RUSH HOUR" tier transition visual |
| 🟢 LOW | UI branding pass (named panels, styled timer) |
