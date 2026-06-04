# TableRush — Commercial Readiness Audit

## Scores (1–10)

| Category | Score | Notes |
|---|---|---|
| Visual appeal | 4/10 | Cream-on-cream floor/tablecloths blend together. Palette reads "UI prototype" |
| First impression | 4/10 | Bland beige floor fills 60% of screen. No instant "restaurant" read |
| UX clarity | 6/10 | Action arrows and glow states help; feedback text is too small to register |
| Restaurant fantasy | 5/10 | Sprites are detailed but color palette breaks the fantasy |
| Game feel | 4/10 | Tweens exist. Feedback moments are tiny — no visceral payoff |
| Retention | 5/10 | 3-min loop + combo system works, but rewards feel mechanical |
| Progression | 5/10 | XP/levels function; nothing screams "unlock earned" |
| Emotional engagement | 3/10 | Score numbers float off and die quietly — no ceremony |
| Commercial quality | 4/10 | Solid prototype; not something a stranger would screenshot and share |

**Overall: 4.4 / 10**

---

## Top 10 Reasons It Feels Like a Project, Not a Game

*Ranked by visual/emotional impact, not implementation effort.*

1. **Floor + tablecloth palette collapse** — Cream floor (0xF5E6C8) + near-white tablecloths (0xFDFAF6) = invisible tables on invisible floor. The most-seen pixel in the game is the wrong color. A rich warm-oak floor and deep-red tablecloths would instantly communicate "restaurant."

2. **Score feedback is silent** — `showFloating()` renders at 24px with no stroke. On a bright background it disappears in 0.3 seconds. Commercial games make the POINT SCORED moment the loudest visual event on screen.

3. **The protagonist is a bystander** — Player at scale 1.5 looks like any other sprite on the board. The character you *are* should be the obvious visual anchor.

4. **Coin burst and food burst are timid** — 5 × 14px emoji particles and 8 × 8px coin circles. These are the reward SFX of the game — they should feel *extravagant*, not decorative.

5. **No dominant brand color** — Every commercial mobile game has one color that says "this is US." TableRush has terracotta walls, cream floor, beige chairs, pale tablecloths — no single identity color.

6. **The combo system is invisible** — A ×4 multiplier is HUGE. The player barely notices it unless they look at the HUD. Missing an escalating visual SCREAM when combos stack.

7. **Game-over screen is a scoresheet** — It functions. It does not celebrate or commiserate. No "PERFECT SCORE" ceremony, no confetti, no emotional weight.

8. **Tutorial looks like a dev notice** — Dark card + white text at the bottom of screen = error toast. Commercial tutorial UX draws the eye to the ACTION, not the bottom.

9. **Menu screen has no ambient life** — Static background during the 2–3 second wait before play. Commercial menus breathe: floating particles, animated hero, pulsing button.

10. **Stars on results screen have no fanfare** — Stars appear but don't animate with individual impact. Three stars should feel like winning a World Cup, not a gradual fill.

---

## Implementation Priority

### TOP 1 — Floor & Tablecloth Color Overhaul
Rich warm-oak floor + deep restaurant-burgundy tablecloths. Fixes the most-seen pixels in the game.

### TOP 2 — Action Feedback Scale-Up
36px base with black stroke, 8 × 22px food burst particles, 10 × 11px coins. The reward moment must be undeniable.

### TOP 3 — Hero Waiter Visibility
Player scale 1.5 → 2.0. The protagonist must own the screen.
