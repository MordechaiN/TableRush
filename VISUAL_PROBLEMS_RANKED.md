# Visual Problems Ranked — TableRush

*Assessed from 26 screenshots captured 2026-06-05. Ranked by impact on first impression, commercial quality, and player trust.*

---

## #1 — TABLE TEXTURES (Severity: CRITICAL)

**What you see:** Every table is a red-and-white checkerboard tablecloth with two ghostly white circles floating on it. All 5 tables are pixel-for-pixel identical regardless of state (empty, seated, ordering, eating, dirty).

**Why it kills the game:** Tables are 90% of the visual surface area during gameplay. This checkerboard is the first and dominant thing anyone sees. It looks like a restaurant diner simulation from 2003. A player glancing at a Steam screenshot would close the tab.

**Fix:** Clean ivory/linen cloth, no pattern, subtle ring-only place settings.

---

## #2 — DINING AREA RUG LOOKS LIKE A HITBOX INDICATOR (Severity: HIGH)

**What you see:** A large translucent burgundy-orange oval centered in the dining area. At 22% alpha on the warm floor, it reads as a muddy orange gradient halo — indistinguishable from a game mechanic indicator or debug radius visualization.

**Why it kills the game:** Players will think it's a mechanic (interaction zone? danger area?) rather than a decorative rug. It adds visual noise without adding clarity. It makes the game look unfinished.

**Fix:** Remove it entirely.

---

## #3 — KITCHEN LABELS LOOK LIKE DEBUG TEXT (Severity: HIGH)

**What you see:** "🔥 COOKING" and "✅ READY" at 13px Arial Black floating in the kitchen area. The emoji characters render inconsistently and at 13px look like font debug output.

**Why it kills the game:** Text labels on a game scene always read as "programmer didn't have time for icons." In a game about visual clarity, these labels make the kitchen look like a spreadsheet.

**Fix:** Remove emoji, increase font size, better typographic weight and position.

---

## #4 — CUSTOMER QUEUE AREA IS EMPTY / BROKEN-LOOKING (Severity: HIGH)

**What you see:** "1 GUEST WAITING" text + two 👣 footprint emoji icons + a tiny customer SVG at the bottom. For almost every gameplay screenshot, there are no customers at tables — the restaurant looks completely abandoned.

**Why it kills the game:** An empty restaurant during "gameplay" looks like a bug or broken game state. Any screenshot of this goes on the Steam page and immediately signals "game doesn't work."

**Fix:** Ensure the tutorial shows customers seated — auto-seat first customer or make seating flow obvious. Secondary: the queue zone footprints and customer figure need to be more prominent.

---

## #5 — ALL TABLE STATES LOOK IDENTICAL (Severity: HIGH)

**What you see:** Whether a table is empty, has a seated customer, has food waiting, or is dirty — the table texture itself never changes. The only visual differences are floating elements above the table (speech bubbles, food images, dirty markers). The table surface is always the same red checkerboard.

**Why it kills the game:** In every other game in this genre (Overcooked, Diner Dash, Cook Serve Delicious), table states are immediately readable. A dirty table looks dirty. An occupied table looks different. Here, every table looks the same.

**Fix:** Part of Fix #1 — clean cloth makes state-overlays more readable. Consider different cloth tints for states.

---

## #6 — MENU STRIP IS INVISIBLE (Severity: MEDIUM)

**What you see:** A 26px-tall dark rounded bar at the top with "MENU:" text and 5 food icons scaled to ~18px actual pixels. In the screenshots it's barely distinguishable from the kitchen area above and below.

**Why it kills the game:** The food menu is information players need during gameplay. If it's unreadable, players can't remember what customers ordered or what they're carrying.

**Fix:** Increase icon scale, reposition to be more prominent, or integrate into the kitchen zone design.

---

## #7 — SCORE DISPLAY USES EMOJI (Severity: MEDIUM)

**What you see:** "🍽️  0" — a plate emoji followed by spaces and then the score number in the dark score pill.

**Why it kills the game:** The 🍽️ emoji renders differently per OS/device. On some platforms it looks high-resolution; on others it's a blurry platform emoji. It breaks the consistent SVG art style. A commercial game uses consistent iconography, not OS font emojis.

**Fix:** Replace with "$" symbol or a custom icon, or just show "SCORE".

---

## #8 — COMBO DISPLAY IS DEAD GRAY WHEN INACTIVE (Severity: LOW-MEDIUM)

**What you see:** The center combo pill at "×1.0" is a flat gray with muted gray text. It looks disabled/empty. Players don't know it's a combo system unless they've already read a tutorial.

**Why it kills the game:** A feature that's invisible when inactive gets ignored. The combo system is a key engagement driver and it's currently invisible.

**Fix:** Show "×1" in a warmer, slightly brighter style at baseline. Use pulsing animation only at higher combos.

---

## #9 — CHAIRS ARE INVISIBLE (Severity: LOW)

**What you see:** The chairs behind and in front of tables are 30×34px brown shapes. Against the warm brown/orange floor and the mahogany table borders, they're almost entirely invisible. You can barely tell they're chairs.

**Why it kills the game:** Chairs are the visual cue that this is a restaurant. If customers are seated but chairs are invisible, the scene reads as "person floating in front of table."

**Fix:** Give chairs more contrast — lighter seat surface, visible backrest detail.

---

## #10 — PENDANT LAMPS HAVE NO GLASS/SHADE DETAIL (Severity: LOW)

**What you see:** Three pendant lamps above the dining area: a thin cord, a flat-color cap, and a colored triangle. These look like programmer triangles, not lamp shades.

**Why it kills the game:** The lamps are at depth 2 and visible in most screenshots. They're meant to add restaurant atmosphere but currently look like geometric shapes.

**Fix:** Add a glass bulb circle, improve shade gradient, maybe add a warm glow bloom beneath each.
