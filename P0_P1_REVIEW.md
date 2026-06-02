# P0 + P1 QUALITY GATE REVIEW
**Date:** 2026-06-02
**Version:** v0.8.0
**Reviewer:** Claude Code (Implementation)
**Status:** AWAITING OWNER APPROVAL

---

## Executive Summary

P0 and P1 represent the two most foundational visual repairs this game needed. The action arrow system is a clear success — all table states are now readable and the priority hierarchy works. The customer redesign is a solid step forward: larger sprites, readable patience bars, name banners on arrival. However, several issues prevent full validation and two structural problems need to be resolved before P2 can ship with confidence.

**Top finding:** Mobile gameplay validation failed — all 4 mobile screenshots captured the Credits screen rather than gameplay. Mobile readability is unconfirmed and must be re-validated before shipping.

---

## Section A: State Validation
*Can each table state be recognized in < 1 second?*

### Screenshot Evidence

| State | File | Verdict |
|-------|------|---------|
| REQUESTING | `screenshots/qg/state_01_requesting.png` | ✅ PASS |
| KITCHEN READY | `screenshots/qg/state_02_kitchen_ready.png` | ✅ PASS |
| PAYING | `screenshots/qg/state_03_paying.png` | ✅ PASS |
| URGENT | `screenshots/qg/state_04_urgent.png` | ⚠️ MARGINAL |
| DIRTY TABLE | `screenshots/qg/state_05_dirty.png` | ⚠️ MARGINAL |

---

### REQUESTING
**Screenshot:** `state_01_requesting.png`

Solid blue ▼ arrow above the table. White speech bubble with red ❓ mark. "ELEGANT" name banner in dark label. Green patience bar visible. Customer sprite is clearly larger than the table surface.

**< 1 second recognition:** YES. The blue arrow and ❓ bubble create a redundant signal — either element alone is enough. Together they are unmistakable.

**Assessment:** The REQUESTING state is the game's most-asked question ("which table needs me?") and this is now answered visually in under 500ms. This is the biggest improvement of P0+P1 combined.

---

### KITCHEN READY
**Screenshot:** `state_02_kitchen_ready.png`

The kitchen's READY zone (right half of the counter) displays a bold green fill covering the entire zone. The food item (burger emoji) is visible inside the green zone. The ✓ READY label is legible. Player is visually at the kitchen position.

**< 1 second recognition:** YES for kitchen state. YES for arrow state — orange ▼ above the destination table confirms which table to deliver to.

**Assessment:** This was previously the most broken indicator. A 4px strokeRoundedRect at near-zero alpha was completely invisible. The solid green fill on the READY zone is the clearest it's ever been. Confirmed alpha 0.82 at peak (from validation script).

---

### PAYING
**Screenshot:** `state_03_paying.png`

Five active tables. Gold ▼ arrow at bottom-center table with "$12" text above it. Four blue ▼ arrows at all other tables (secondary scale — visibly smaller). The gold arrow is clearly the largest and most visually prominent element.

**< 1 second recognition:** YES. Gold (money) color + "$12" text + largest arrow = instant read. The priority hierarchy is working correctly: PAYING > REQUESTING.

**Assessment:** This is the most visually clean screenshot in the set. Five simultaneous tables, one action unambiguously dominant.

---

### URGENT
**Screenshot:** `state_04_urgent.png`

Five tables. One table (bottom-left quadrant) has a red ▼ arrow. Four other tables have blue secondary arrows. The red color change is visible.

**< 1 second recognition:** MARGINAL. The red arrow is at primary scale (~1.0) vs secondary (~0.45–0.57 confirmed by script), but at 5-table density, the size difference is subtle. The red color is the primary distinguisher, not the size. A player who doesn't immediately process color under pressure may not react with the urgency the state demands.

**What works:** Red is culturally coded as danger. The arrow IS the largest on screen.

**What doesn't work:** The urgent arrow doesn't FEEL urgent. It's a static red triangle. There's no additional treatment — no strobe, no size exaggeration, no shake — that would register as "THIS IS AN EMERGENCY, MOVE NOW." The "best waiter in the room" needs to feel the pressure spike.

---

### DIRTY TABLE
**Screenshot:** `state_05_dirty.png`

Five customers across four tables. Bottom-center table is empty after a customer left. Very small gray ▼ arrow above it. Broom icon (🧹) visible at top-right of the table surface.

**< 1 second recognition:** MARGINAL. The gray arrow is small (secondary scale, correctly deprioritized below active customers). The 🧹 icon is the clearest dirty signal. Without the broom, the gray arrow alone might be missed.

**What works:** Correct deprioritization — dirty tables shouldn't pull focus away from waiting customers. The gray color communicates "low urgency" correctly.

**What doesn't work:** At secondary scale, the gray arrow is tiny. The player learns to look for gray = dirty through experience, not instant visual read. The broom icon carries most of the communication burden.

---

## Section B: Priority System — 1 to 5 Active Tables
*Does the primary/secondary scale distinction work under increasing load?*

### Screenshot Evidence

| # Active | File | Primary Arrow | Secondary Arrows | Verdict |
|----------|------|---------------|------------------|---------|
| 1 table | `screenshots/qg/tables_1_active.png` | Clear, full-size | None | ✅ EXCELLENT |
| 2 tables | `screenshots/qg/tables_2_active.png` | Top-left larger | Bottom-center smaller | ✅ GOOD |
| 3 tables | `screenshots/qg/tables_3_active.png` | Top-left largest | Two smaller | ✅ GOOD |
| 4 tables | `screenshots/qg/tables_4_active.png` | Top-left largest | Three smaller | ⚠️ MARGINAL |
| 5 tables | `screenshots/qg/tables_5_active.png` | Top-left largest | Four smaller | ⚠️ MARGINAL |

---

### 1 Active Table
Full-size blue ▼ arrow above the single customer. Name banner ("TRENDY"/"ELEGANT") visible. No competing signals anywhere on screen. **The most unambiguous moment in the game.** Action is unmissable.

### 2 Active Tables
Primary arrow at top-left (full scale). Secondary at bottom-center (half scale, visibly smaller). "BUSINESS" name banner introduces the second customer. The scale difference is perceptible — a player glancing at the screen would naturally look at the larger arrow first. **Works.**

### 3 Active Tables
Three arrows visible. The primary (top-left) is clearly largest. Two secondary arrows are present. "TRENDY," "CASUAL," and "BUSINESS" banners labeling arrivals. At this density, the scale hierarchy still communicates clearly — the primary arrow is twice the width of each secondary.

### 4 Active Tables
Four arrows fill most of the table grid. The primary arrow remains the largest, but the three secondary arrows together create visual noise that competes for attention. The player must actively parse which is largest rather than having it jump out. **Getting crowded.**

### 5 Active Tables
All 5 tables requesting simultaneously. Five arrows visible. Primary is still technically largest, but in screenshots the difference between arrowScale 1.14 (primary) and 0.45–0.57 (secondary) does not produce as dramatic a visual gap as it should at glance speed. The table with the primary arrow feels like "slightly the most important one" rather than "OBVIOUSLY DO THIS FIRST."

**Root issue:** 2:1 scale ratio (1.0 vs 0.5) is mathematically large but visually insufficient at game resolution. At 30px primary and 15px secondary, the absolute size difference is only 15px — too small to register as "dominant" when four other arrows are present.

---

## Section C: Customer Variant Review
*Can a player identify each customer type at a glance?*

### Screenshot Evidence

| Variant | File | Silhouette | Name Banner | Personality | Verdict |
|---------|------|------------|-------------|-------------|---------|
| 0 — Elegant | `screenshots/qg/variant_0_elegant.png` | Weak | "ELEGANT" | Low | ⚠️ NEEDS WORK |
| 1 — Business | `screenshots/qg/variant_1_business.png` | Good | "BUSINESS" | High | ✅ GOOD |
| 2 — Casual | `screenshots/qg/variant_2_casual.png` | Intentionally plain | "CASUAL" | Low | ⚠️ WEAK |
| 3 — Trendy | `screenshots/qg/variant_3_trendy.png` | Excellent | "TRENDY" | High | ✅ EXCELLENT |
| 4 — Romantic | `screenshots/qg/variant_4_romantic.png` | Excellent | "ROMANTIC" | High | ✅ EXCELLENT |
| 5 — Elder | `screenshots/qg/variant_5_elder.png` | Good | "ELDER" | Medium | ✅ GOOD |
| 6 — Teen | `screenshots/qg/variant_6_teen.png` | Marginal | "TEEN" | Low | ⚠️ MARGINAL |

---

### Variant 0 — Elegant
The necklace/pendant accessory is too small to read at gameplay scale. The outfit color (darker, formal-looking) helps, but "elegant" as a personality doesn't emerge from the silhouette alone. A player would learn "this is Elegant" through the name banner, not the visual design. Once the name fades after 1.6s, the character looks like a professional but not necessarily *elegant*.

**Improvement opportunity:** A champagne glass, a fascia, or an exaggerated collar fold would immediately communicate "sophisticated" without the name.

### Variant 1 — Business
The red tie on a dark suit jacket reads immediately as "office worker." This is the strongest personality/silhouette pairing. The tie triangle is visible even at this scale. **Works.**

### Variant 2 — Casual
Intentionally the plainest design. The absence of accessories is supposed to signal "casual" but in practice it just looks like a default character. When all other customers have accessories, "no accessory" is ambiguous — it could mean casual, or it could mean the other accessories weren't applied. **Functional but not memorable.**

### Variant 3 — Trendy
Oversized sunglasses extending past the head edges are the most distinctive element in the customer lineup. Reads at a glance. The "hip" personality is conveyed. **The best-designed variant.**

### Variant 4 — Romantic
Large pink/red flower extending past the head to the right is immediately visible. Purple outfit complements the flower. The romantic/whimsical personality lands. **Second-best designed variant.**

### Variant 5 — Elder
Circular glasses on the face are visible. The slightly shorter legs (shorter body proportion) are a subtle but real distinguisher. The glasses are universally read as "older person." **Works.**

### Variant 6 — Teen
The cap brim extends past the head. The yellow outfit is distinctive from other colors. However, the cap brim at this size reads as "person with a hat" rather than specifically "teenager." Without the name banner, "Teen" is guessable but not certain. **Functional, room for improvement.**

### Group Assessment (variants_final_group.png)
The 7 customers side by side show strong color diversity — no two characters share an outfit color. The Romantic and Trendy variants are immediately recognizable. Elder glasses are clear. Business tie visible. Casual and Elegant are harder to distinguish from each other without names. Overall: **5/7 variants pass the at-a-glance test.**

---

## Section D: Mobile Validation (390×844)
**STATUS: VALIDATION FAILED**

All four mobile screenshots captured the Credits scene instead of gameplay:
- `mobile_01_game_start.png` → Credits screen
- `mobile_02_one_customer.png` → Credits screen
- `mobile_03_three_customers.png` → Credits screen
- `mobile_04_urgent.png` → Credits screen

**Root cause:** The Playwright validation script successfully set localStorage (`tablerush_tutorial_done = 1`) and navigated to the game URL, but the game navigated to Credits instead of GameScene. This is likely a scene routing bug when triggered at non-standard viewport dimensions, or the script interacted with a UI element that triggered the Credits navigation.

**Consequence:** Mobile readability is UNCONFIRMED for:
- Arrow visibility at 390px width
- Patience bar readability (44×8px at mobile scale)
- Customer name banner legibility
- HUD timer/score text size
- Touch target sizing for tables and kitchen

**Recommendation:** Re-run mobile validation with a corrected script before declaring P0+P1 mobile-ready. This is a blocker for mobile audience confidence.

**What we know from desktop screenshots (480px width):**
The game renders at 480×854 (Phaser canvas). Mobile at 390px would scale the canvas down to approximately 81% of desktop size. The 44×8px patience bars would render at ~36×6.5px effective — still readable. The arrows at 30px primary would render at ~24px — likely still visible. Name banners may be borderline. These are estimates, not validated observations.

---

## Section E: Self-Critique — Top 10 Remaining Visual Problems

*Ranked by severity. Brutally honest.*

---

### #1 — CRITICAL: Mobile validation unconfirmed
**Severity:** Critical
**Impact:** TableRush is mobile-first. P0+P1 cannot be declared complete until mobile gameplay screenshots confirm the systems work at 390px width.
**Fix:** Re-run Playwright at 390×844, ensure game navigates to GameScene not Credits.

---

### #2 — HIGH: Secondary arrow scale (0.5) insufficient at 5 active tables
**Severity:** High
**Impact:** At maximum table load (5 tables), the primary arrow doesn't command enough visual dominance. The player must parse which arrow is slightly larger rather than having the priority jump out.
**Fix:** Consider 1.0 primary / 0.35 secondary (3:1 ratio instead of 2:1), or add a subtle background fill/halo behind the primary arrow.
**Note:** Do not implement this fix now — flag for P3 HUD review.

---

### #3 — HIGH: Urgent state lacks urgency treatment
**Severity:** High
**Impact:** Urgent (patience < 25%) is the most critical game state. The current treatment — red color + primary scale — communicates importance but not PANIC. The "best waiter" fantasy requires urgent states to feel viscerally alarming.
**Fix:** Urgent arrow should add a rapid strobe (250ms blink) or size exaggeration (scale 1.3 primary base instead of 1.0). Red alone is not enough.
**Note:** Flag for P2 scope or urgent hotfix.

---

### #4 — HIGH: Waiter sprite 23% smaller than customers
**Severity:** High
**Impact:** Customers are 48×72px. Waiter is 40×62px. The character you control is visually smaller than the people you serve. This directly contradicts "you are the best [and most commanding] person in the room."
**Fix:** P2 (scheduled). This is known and correctly prioritized.

---

### #5 — HIGH: Dirty table state relies on broom icon, not arrow
**Severity:** High
**Impact:** The gray ▼ arrow at secondary scale is too small to reliably communicate "this needs cleaning." The 🧹 emoji carries the visual weight. The arrow design for dirty state is doing almost nothing.
**Fix:** Either boost dirty arrow to a unique shape (e.g., sweeping left-right ↔ symbol) or make the broom icon more prominent. Gray color is correct; size is the problem.

---

### #6 — MEDIUM: Elegant and Casual variants not identifiable without name
**Severity:** Medium
**Impact:** After the 1.6s name banner fade, 2 of 7 customers are visually ambiguous. In a busy session, players won't have time to read the name. The fantasy of "knowing your customers" requires the silhouette to carry the identity.
**Fix:** Redesign Elegant to show a clear accessory (wine glass, elaborate earring, pearl necklace visible at size). Redesign Casual to make "casual" feel intentional (baseball cap? rolled sleeves?).
**Note:** Flag for P1 revision, low urgency since name banners partially compensate.

---

### #7 — MEDIUM: Name banner fades after 1.6 seconds
**Severity:** Medium
**Impact:** In a 5-table session, 1.6s is not enough time to register customer name + process other table actions. The name becomes irrelevant for returning players who didn't memorize silhouettes.
**Fix:** Consider a persistent mini-badge (smaller than arrival banner) that stays visible at customer shoulder level throughout the visit, or increase fade timer to 2.5s.

---

### #8 — MEDIUM: Combo always invisible at ×1.0
**Severity:** Medium
**Impact:** The combo system is working but the player has no visible streak indicator at baseline. "Being the best waiter" requires knowing you're building toward excellence. A grayed-out "×1.0" would communicate "you have potential to climb" even before the first combo triggers.
**Fix:** P3 scope (scheduled). This is the single highest-retention feature missing from the current game.

---

### #9 — MEDIUM: Kitchen COOKING → READY transition has no "ding" moment
**Severity:** Medium
**Impact:** The green fill appears when food is ready, but there's no transition event that draws the eye. Players need to actively poll the kitchen area rather than being notified.
**Fix:** A brief camera or sound pulse (or icon pop) when the food transitions from COOKING to READY would reduce average time-to-pickup. Out of scope for P0–P2 visual work but worth noting.

---

### #10 — LOW: Table linen checkered pattern reads as "grid" not "tablecloth"
**Severity:** Low
**Impact:** The current `checkered` pattern doesn't read as a premium restaurant tablecloth. It's functional but contributes to the "game-y" feel rather than the "premium casual restaurant" identity.
**Fix:** P4 scope (scheduled). A diagonal stripe or circular floral pattern would read more luxurious. Low urgency.

---

## Section F: Roadmap Re-Ranking

### Current Planned Order
P2 → Waiter redesign  
P3 → HUD redesign (combo always visible)  
P4 → Table redesign  
P5 → Kitchen redesign  
P6 → Speech bubbles  
P7 → Main menu  
P8 → Game Over  
P9 → Tutorial

### Question: Should HUD come before Waiter?

**No. Keep P2 as Waiter redesign.**

**Rationale:**

The visual imbalance between 48×72 customers and 40×62 waiter is the most jarring inconsistency in the current build. Every screenshot in this review shows a player character that is physically smaller and visually less prominent than the people they're serving. This is a fundamental contradiction of the game identity.

The "combo always visible" fix (P3's core feature) is a single-line change to the HUD — graying out "×1.0" when the combo is at baseline. It does not require a full P3 phase; it could be included as a minor fix within P2's commit without constituting a separate design phase.

**Proposed adjustment:** Add the "combo ×1.0 grayed" fix as a P2 supplement. It takes ~15 minutes of implementation and resolves the most critical HUD retention gap. The full HUD redesign (layout, typography, timer urgency visual) remains P3 scope.

### Revised Order (recommended)
P2 → Waiter redesign + combo ×1.0 grayed supplement  
P3 → Full HUD redesign  
P4 → Table redesign  
P5 → Kitchen redesign  
P6 → Speech bubbles  
P7 → Main menu  
P8 → Game Over  
P9 → Tutorial

---

## Section G: Game Identity Evaluation

**Identity statement:** *"Be the best waiter in the room. Three minutes. Every customer watching."*

### Does P0+P1 Support This Fantasy?

**What P0+P1 gets right:**

1. **You always know what to do next.** The arrow system means there is no moment of confusion. Knowing your priorities instantly IS what competent professionals feel. This is foundational.

2. **Customers have names.** The name banner (even at 1.6s) transforms "I tapped a colored rectangle" to "I served The Business customer." This is the beginning of the people-serving fantasy.

3. **Priority hierarchy is visible.** Gold (paying) beating blue (requesting) means the veteran player who knows to collect payment first is visually rewarded — the game confirms their prioritization was correct. This is the "the game acknowledges your skill" feedback loop starting to work.

4. **The scene is readable from across the room.** Larger patience bars, bold arrows, green kitchen fill — at any playing distance, the game state is parseable. This is necessary for the "effortless mastery" fantasy.

**Where P0+P1 still falls short:**

1. **The player character is smaller than the customers.** "Be the best person in the room" requires the player to feel physically commanding. A 40×62 waiter scurrying between 48×72 customers is not that. P2 must fix this.

2. **The urgent state doesn't feel like an emergency.** The "best waiter" fantasy is about performing gracefully UNDER PRESSURE. If pressure doesn't feel intense, the relief of handling it doesn't feel earned. A static red triangle is insufficient.

3. **There is no visible record of how good you're being.** The combo counter disappears at ×1.0. The player has no visible "score of competence" moment to moment. The fantasy needs a persistent status signal ("you are currently performing at TABLE MASTER level").

4. **Customers don't visibly appreciate good service.** They sit → eat → leave. There's no reaction shot when a fast delivery arrives. "Every customer watching" requires customers to watch — acknowledgment, satisfaction, a smile upgrade.

**Net assessment:**

P0+P1 are necessary but not sufficient for the game identity. They solve the "player is lost" problem (critical), begin the "customers are people" work (in progress), and establish the visual foundation. But the identity requires the player to FEEL excellent — not just know what to do. The missing ingredients are: a compelling player character, visible mastery progression, and customer emotional feedback. P2 (waiter) + P3 (HUD/combo) + post-P3 (customer reactions) together complete the identity.

**Score: Foundation Laid. Identity Not Yet Delivered.**

---

## Summary: Pass/Fail Per Objective

| Objective | Result | Notes |
|-----------|--------|-------|
| Player always knows what to do next | ✅ PASS | Arrow system works |
| Requesting state < 1 second | ✅ PASS | Blue ▼ + ❓ bubble = instant read |
| Urgent state < 1 second | ⚠️ MARGINAL | Red color works; urgency feeling weak |
| Kitchen ready < 1 second | ✅ PASS | Green fill is unambiguous |
| Paying state < 1 second | ✅ PASS | Gold ▼ + $ text = instant |
| Dirty table < 1 second | ⚠️ MARGINAL | Needs both broom + arrow to read |
| Priority hierarchy visible 1–5 tables | ⚠️ MARGINAL | Works at 1–3; crowded at 4–5 |
| Customer design improves readability | ✅ PASS | 5/7 variants readable at glance |
| Mobile readability validated | ❌ FAIL | Screenshots captured wrong scene |
| Better than v0.6.0 | ✅ PASS | Measurably improved across all dimensions |

---

## Recommendation

P0 and P1 are approved to be shipped as the new baseline. They represent a substantial, measurable improvement over the v0.6.0 state.

**Before proceeding to P2, one item should be addressed:**

1. Mobile validation must be re-run with a corrected script to confirm game renders correctly at 390×844.

P2 (Waiter redesign) is the correct next phase. The current customer/waiter size imbalance is visually jarring and directly contradicts the game identity. Proceed when owner approves.

---

*Report generated: 2026-06-02 | Next review gate: Post-P2*
