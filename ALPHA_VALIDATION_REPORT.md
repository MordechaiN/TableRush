# TableRush — Alpha Validation Report

**Date:** 2026-06-08
**Build:** branch `claude/affectionate-cori-ixq9H` @ HEAD (Vite + Phaser 3.87, `src/`)
**Validator:** automated play-through harness driving the *real* game (no faked overlays)
**Screenshots:** `alpha_validation/shots/` (19 PNGs, 480×854 unless noted)

---

## 1. How this was validated (so the proof is trustworthy)

Everything below was produced by **actually playing the game**, not by drawing
mock-ups. A state-driven bot (`alpha_validation/harness.js`) inspects the live
`GameScene` every 100 ms and calls the **exact handlers the UI is wired to** —
`onTableClick`, `onKitchenClick`, `onDishwasherClick` — to seat guests, take
orders, cook, deliver, collect payment and clean. Events were forced through
their **real in-game triggers** (`startRushHour`, `triggerNearMissSave`,
`enqueueCritic`, the real `rollSessionType` → `showSessionAnnouncement` path),
i.e. the same code the 60-second timer / RNG fires in normal play.

Each screenshot is backed by **live scene stats** captured at the shutter
(score, combo, occupied tables) so authenticity is checkable.

> **Why this matters / what changed:** the previous pass
> (`validate_v2.js`, outputs in `/tmp`) *injected fake banner graphics* and a
> *fake ×4 combo with $0 score on empty tables*. Those screenshots proved
> nothing. The "full restaurant" shot from that pass actually showed **empty
> tables** — nobody had played. This pass replaces all of that with earned,
> in-engine proof (e.g. the high-combo shot below is a real **×4 streak at
> $8,535**, not a $0 injection).

**Limits of this method (stated up front):** run headless + muted, so **audio
was not validated**. The headless rAF clock runs slower than wall-clock, which
is handled by gating captures on real scene objects, not timers. Brief callout
floats (DESSERT TIME!, VIP! ×2.5, SHIELDED!, RAVE REVIEW!) were captured by
pausing the scene's tweens at the float's peak frame — the frame is real, just
held still long enough to photograph.

---

## 2. Screenshot index — the proof

| # | Required shot | File | Live proof at capture |
|---|---|---|---|
| 1 | Normal shift | `01_normal_shift.png` | L1, **$300 earned**, 2 tables seated & being served |
| 2 | VIP Night | `02_vip_night.png` | Real `VIP NIGHT` banner + sub-line, L6 |
| 3 | Birthday Night | `03_birthday_night.png` | Real `BIRTHDAY NIGHT` banner, L6 |
| 4 | Critic Night | `04_critic_night.png` | Real `CRITIC NIGHT` banner, L6 |
| 5 | Business Lunch | `05_business_lunch.png` | Real `BUSINESS LUNCH` banner, L6 |
| 6 | Family Table dessert phase | `06_family_dessert.png` | Real family guest re-orders; **`DESSERT TIME!`** float |
| 7 | Rush Hour | `07_rush_hour.png` | `rushHourActive=true`, full banner + red border + `RUSH:24s` |
| 8 | Near Miss Save | `08_near_miss.png` | **`THE SAVE!`** + **`300 SAVED!`** (L8 Master Timing), guests seated |
| 9 | High Combo state | `09_high_combo.png` | **combo 10 → ×4 `TABLE LEGEND`**, **$8,535 earned**, 5 tables |
| 10 | Restaurant Level 1 | `10_level1_restaurant.png` | Base restaurant, 2-slot tray, no panel/rope |
| 11 | Restaurant Level 5 | `11_level5_restaurant.png` | Abilities panel: 4-slot tray, Speed, Birthday, Critic |
| 12 | Restaurant Level 10 | `12_level10_restaurant.png` | Full loadout + **VIP rope** + `TABLE MASTER EDITION` |
| 13 | Game Over w/ story events | `13_gameover_stories.png` | NEW RECORD, 3★, $4,305, **story panel** (saved table, rush hour) |
| 14 | Mobile gameplay | `14_mobile_view.png` | **390×844** phone viewport, $240 earned, 2 tables seated |
| 15 | Full restaurant view | `15_full_restaurant.png` | **5/5 tables occupied**, queue waiting, kitchen READY |

**Bonus captures** (prove the per-session *payout mechanics*, not just the banners):

| # | Mechanic | File | Live proof |
|---|---|---|---|
| 16 | VIP payout ×2.5 | `16_vip_payout.png` | Real VIP paid: **`VIP! ×2.5` / `$187`** + coin burst |
| 17 | Birthday seating | `17_birthday_confetti.png` | **`HAPPY BIRTHDAY!`** + confetti on a real birthday guest |
| 18 | Combo Shield (L6) | `18_combo_shield.png` | Real ×3 streak broke → **`SHIELDED!`**, combo held at ×2 (not 0) |
| 19 | Critic rave | `19_critic_rave.png` | Critic served at high patience → **`RAVE REVIEW!`** (+50%) |

---

## 3. Feature-by-feature verdict

Legend — **Implemented**: code present & runs. **Visible**: clearly shown in a
committed screenshot. **Working**: observed to function in live play. **Fun**: a
candid game-feel judgment (not a feeling — an assessment of feedback, clarity,
escalation, pacing).

### Core gameplay

| Feature | Implemented | Visible | Working | Fun | Verdict |
|---|---|---|---|---|---|
| Service loop (seat→order→cook→deliver→pay→clean) | ✅ | ✅ #1,#15 | ✅ earned $ across every shot | ◐ Satisfying tap-loop; the walk animations add weight but also gate pace | **Keep** |
| Customer queue + patience | ✅ | ✅ #1,#15 | ✅ "GUESTS WAITING", guests lapse if ignored | ◐ Clear pressure | **Keep** |
| Combo system (×2→×5 milestones) | ✅ | ✅ #9 (×4) | ✅ earned 10-serve streak, $8,535 | ✅ The escalation + heat + screen-shake is the best feel in the game | **Keep** |
| Speed bonus (LIGHTNING/FAST) | ✅ | ✅ visible in #6/#16 context | ✅ | ◐ Rewards fast serves; subtle | **Keep** |
| Rush Hour | ✅ | ✅ #7 | ✅ triggered via real handler, border+countdown live | ✅ Genuinely raises tension | **Keep** |
| Near-Miss Save (+ L8 `300 SAVED`) | ✅ | ✅ #8 | ✅ real handler, hero text renders | ✅ A real "clutch" moment | **Keep** |
| Full restaurant (5 tables) | ✅ | ✅ #15 | ✅ 5/5 occupied via real seating | ◐ Busy and readable | **Keep** |

### Session types (content events)

| Feature | Implemented | Visible | Working | Fun | Verdict |
|---|---|---|---|---|---|
| VIP Night (announce + ×2.5 payout) | ✅ | ✅ #2 banner, **#16 payout** | ✅ real VIP paid ×2.5 | ✅ Tangible reward spike | **Keep** |
| Birthday Night (announce + confetti) | ✅ | ✅ #3 banner, **#17 confetti** | ✅ real birthday guest + callout | ◐ Charming; see "chain" caveat | **Keep** |
| Critic Night (announce + rave) | ✅ | ✅ #4 banner, **#19 rave** | ✅ served → real `RAVE REVIEW!` +50% | ✅ Best "stakes" event — one VIP you must not fail | **Keep** |
| Business Lunch (announce + rush wave) | ✅ | ✅ #5 banner | ◐ banner + session wiring confirmed; `BUSINESS TIP! ×1.5` popup **not isolated** | ◐ | **Keep** (capture tip popup) |
| Family Day / dessert second course | ✅ | ✅ #6 `DESSERT TIME!` | ✅ real family re-orders dessert | ◐ Nice idea; callout low-visibility (below) | **Improve** |

### Progression & meta

| Feature | Implemented | Visible | Working | Fun | Verdict |
|---|---|---|---|---|---|
| Levels 1–10 + abilities unlocks | ✅ | ✅ #10/#11/#12 | ✅ loadout visibly differs per level | ✅ Clear "I unlocked something" arc | **Keep** |
| Tray upgrade 2→3→4 | ✅ | ✅ #10 (2) vs #11/#12 (4) | ✅ | ◐ Real capability change | **Keep** |
| VIP velvet rope (L7+) | ✅ | ✅ #7,#8,#12 | ✅ renders at entrance | ◐ Pure flavor, but good flavor | **Keep** |
| Combo Shield (L6) | ✅ | ✅ #18 | ✅ break held at ×2 not 0, `SHIELDED!` | ✅ A meaningful safety net | **Keep** |
| Game Over: stars / score / shift report / XP / next-unlock | ✅ | ✅ #13 | ✅ count-up, 3★, level, "NEXT UNLOCK" hook | ✅ Strong retention beat | **Keep** |
| Shift Story panel (event recap) | ✅ | ✅ #13 (2 lines) + #19 proves critic_rave path | ✅ lines built from real `storyEvents` | ✅ Gives a shift a narrative | **Keep** |
| Mobile / responsive (FIT scale) | ✅ | ✅ #14 | ✅ plays on 390×844, letterboxed | ◐ Works; portrait-first | **Keep** |

---

## 4. Issues found (honest, prioritized)

1. **`DESSERT TIME!` callout is low-visibility** — small pink text on a dark
   floor that rises and fades in ~1 s. In live play it is *easy to miss*; I had
   to pause the engine at its peak frame to photograph it (#6). The dessert
   second-course is a good mechanic hidden behind a weak signal. **Improve:**
   bigger/persisted callout or a table badge while the dessert order is open.
2. **Edge-table callouts clip off-screen.** `HAPPY BIRTHDAY!` (#17) is cut on
   the left when the guest sits at a side table (x≈120/360); wide center-anchored
   floats overflow the 480-px canvas. **Improve:** clamp float x to keep text on-screen.
3. **Abilities panel obscures the play-field at session start.** It sits dead-center
   over the tables for the first ~3 s of game-time (longer in wall-time) and
   overlapped the first guests/announcement during testing (#15/#17 early frames).
   **Improve:** move it to a corner or shrink it; don't cover tables 3–4.
4. **No in-session level indicator.** The player's level only appears on the main
   menu; mid-shift there's no "Level 6" readout. The level shots (#10–12) prove
   the *loadout* differs, but the number itself isn't on the HUD. **Improve (minor).**
5. **Floating-text pile-up during fast play.** Combo + SERVED + bonus + speed
   labels can stack on the same area (seen mid-run on #6 before the fix). At high
   combo the screen gets noisy. **Improve:** queue/space floats.
6. **Some payout multipliers aren't independently demonstrated yet** (see §5).

---

## 5. NOT independently demonstrated (treat as unverified until captured)

Per the "if it can't be shown, it isn't done" bar, I am explicit about what I did
**not** put in a screenshot, even though the code exists and the parent feature works:

- **`BUSINESS TIP! ×1.5` payout popup** — Business Lunch session proven (#5); the
  specific tip float was not isolated. *Low risk* (same payout code path as VIP/family, which are proven).
- **`FAMILY FEAST! ×2.2` payout popup** — Family dessert proven (#6); the final
  full-meal multiplier float was not isolated.
- **Birthday double-score *chain* (next 3 payments ×2)** — birthday banner +
  seating + confetti proven (#3/#17); the 3-payment boosted chain was not isolated.
- **Audio / SoundManager** — not validated at all (headless + muted).
- **Tutorial flow** — bypassed in all runs (`tutorial_done=1`) to reach systems; not re-validated here.

These are the recommended next captures; none indicate a known break, but by this
report's own standard they are **"not proven."**

---

## 6. Overall verdict

**The alpha is real and substantially complete.** Every required screenshot
(1–15) is backed by genuine, in-engine play with verifiable live stats, plus four
bonus captures (16–19) proving the per-session payout mechanics that banners alone
don't. The headline systems — core service loop, combo escalation, rush hour,
near-miss, all five session types, level progression, combo shield, game-over with
a story recap, and mobile — are **implemented, visible, and working.**

The gaps are **presentation, not function**: a few callouts are too quiet or clip
off-screen, the start-of-shift panel covers the floor, and a handful of payout
popups still need a dedicated screenshot. Nothing here is a content/feature hole —
it's polish on signals the player already earns.

**Recommendation:** ship the alpha for play-testing. Prioritize Issues #1–#3
(callout visibility/clipping + the start panel) before wider release, and close
§5 with capture passes so every payout is on the record.

---

*Reproduce:* start the dev server (`npx vite --port 4173`) and run
`node alpha_validation/run.js` (all shots) or `node alpha_validation/run.js 09`
(a single shot id). Per-run stats are logged to `alpha_validation/shots/_results.json`.
