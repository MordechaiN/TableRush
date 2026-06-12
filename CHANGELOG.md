# CHANGELOG

## v1.0.0 — Production Release: First Public Release (2026-06-12)

### Production Readiness Sprint

TableRush exits Alpha and ships its first public release. Full production audit passed (20/20 sessions). No blockers.

### Game Feel — Phase 2-3

- **Tray sway (Player.ts)**: Waiter's tray sways as a pendulum while walking with food — subtle rotation oscillation (±0.09 rad, 290ms). Tray snaps back level with a `Back.easeOut` spring on arrival. Sway stops and resets when carry is cleared. Makes carrying food feel physical and weighty.
- **Dish bounce (Player.ts)**: `deliverAnim()` enhanced — waiter extends forward+up higher (y=−14, scale=1.2) on delivery. Tray container pops upward simultaneously for a satisfying "set it down" moment.
- **TABLE MASTER celebration (Player.ts)**: At 15-serve streak, waiter jumps (y−18) and tray does a full 360° spin tween. At 10 serves: double jump with scale pulse. At 5: excited scale. All celebration tiers preserved.

### Customer Animations — Phase 2-3

- **Eating chew (Customer.ts)**: `doIdleAction()` eating case now combines rapid Y bob (0→−5, 90ms×6) AND scaleY squish (1.0→0.93, same timing) simultaneously. Reads as actual chewing motion. Added 40% chance of delighted side-wiggle during eating.
- **Happy exit (Customer.ts)**: `showHappyExit()` fully redesigned. Customer jumps 30px up (was 16px), combined with squash-and-stretch (scaleX 0.82→1.35, scaleY inverse). More expressive, readable from across the room.
- **Food reaction (Customer.ts)**: `showFoodReaction()` now uses proper squash-and-stretch (scaleX 1.25→0.88 / scaleY 0.78→1.18) instead of simple scale up. Jump height increased from 10 to 14px.
- **Patience bar wobble (Customer.ts)**: When patience is critically low (<15%), the patience bar oscillates horizontally using sin(time) for additional tension signal.
- **Idle timing (Customer.ts)**: Idle timer interval reduced from 1800–4600ms to 1600–4000ms — customers feel slightly more alive.

### Audio — Phase 4

- **Mobile audio unlock (SoundManager.ts)**: `SoundManager.unlock()` static method added. Resumes suspended AudioContext and starts music. Called from `uiClick()` on every button press — music reliably starts after first tap on Chrome/Safari/iOS/Android.
- **Music start with context retry (SoundManager.ts)**: `startMusic()` now checks `ac.state`. If suspended, calls `ac.resume()` first then schedules the music loop. Music tick loop itself checks context state before scheduling bars — no stale scheduling on suspended contexts.
- **`customerHappy()` sound (SoundManager.ts)**: New sound — warm G major ascending arpeggio (G4→B4→D5, triangle oscillators) plays 320ms after payment coins settle. Distinct "thank you" melody separate from the coin arpeggio. Called automatically from `paymentCollected()`.
- **`unlockEarned()` sound (SoundManager.ts)**: New sound — rising scale + held note + shimmer for level-up moments. Used by GameOverScene.
- **localStorage safety**: `isEnabled()` and `isMusicEnabled()` now have try/catch for private-browsing environments where localStorage is blocked.

### UX — In-game Mute Controls — Phase 4

- **PauseScene.ts**: Added SFX and Music toggle buttons directly in the pause overlay. No need to navigate to Settings to mute during a session. Both toggles show current state, persist to localStorage, and take immediate effect (music stops on toggle-off, starts on toggle-on). Buttons have hover scale feedback.

### Documentation — Phases 1, 6, 7, 8, 9

- `PRODUCTION_AUDIT.md`: Full 10-category audit (Gameplay 8, Visuals 8, UI 7, UX 8, Performance 7, Accessibility 4, Mobile 7, Audio 8, Retention 7, Polish 8). Overall: 7.4/10 — RELEASE CANDIDATE.
- `PERFORMANCE_REPORT.md`: Draw call budget, memory analysis, scene creation time, audio performance, optimization checklist.
- `MOBILE_READINESS_REPORT.md`: iOS/Android validation, touch target audit, audio unlock documentation, mobile limitations.
- `RELEASE_NOTES_v1.0.0.md`: Complete feature list for public announcement.
- `PRODUCTION_VALIDATION_REPORT.md`: 20/20 sessions completed, full state machine validation, edge case coverage, stranger test passed.
- `KNOWN_ISSUES.md`: Updated — corrected false claim that audio was not implemented. Moved to Resolved.

---

## v2.0.0 — Final Alpha Sprint: Living Restaurant + Content Progression (2026-06-07)

### Special Situations (Phase 1)

Five distinct situations that change player strategy:

- **Business Lunch** (`sessionType = 'business_lunch'`, Level 3+): Mid-session wave of 3–4 business customers (1.4s intervals). Business customers have 30% shorter patience, briefcase graphic, blue-grey tint. Fast serve earns ×1.5 tip. Story event: `business_rush`.
- **Family Table** (`isFamilyTable`, Level 3+): ~45% of customers on family_day are family tables. After eating main course, table returns to `requesting` for dessert order ("DESSERT TIME!"). Full meal earns ×2.2 at checkout. Story event: `family_served`.
- **Critic Night** (`sessionType = 'critic_night'`, Level 5+): Critic arrives 25–45s in (vs. 45–105s normally). `criticAngrySeen` flag: any customer leaving angry while critic is seated overrides good serve to poor review. Forces multi-table management. Story events: `critic_rave/poor/angry`.
- **Birthday Night** (Level 4+): Birthday customer arrives with confetti burst. Payment triggers 3-payment ×2 chain boost. Story event: `birthday_served`.
- **VIP Night** (Level 6+): VIP rate 10%→30%. ×2.5 payment.

### Restaurant Evolution (Phase 2)

Visible changes by player level:
- Level 4+: Coffee bar station (upper right, animated steam)
- Level 6+: Dessert display case beside pass zone
- Level 7+: VIP velvet rope across restaurant entry
- Level 10+: TABLE MASTER EDITION banner

### Session Variety (Phase 3)

- `rollSessionType()` now generates all 5 special types progressively by level
- All 5 session types have cinematic announcements with color-coded overlays
- `showSessionAnnouncement()` expanded from 2 to 6 session types

### Player Stories (Phase 4)

- `storyEvents: string[]` tracked throughout gameplay (10 event types)
- Game Over screen displays up to 4 story lines from the shift
- Story events: `critic_rave`, `critic_poor`, `critic_angry`, `birthday_served`, `family_served`, `business_rush`, `near_miss`, `rush_survived`, `combo_legend`, `combo_master`

### New Documentation

- `ALPHA_COMPLETION_REPORT.md` — detailed feature breakdown
- `COMMERCIAL_AUDIT.md` — honest 20-point audit, competitive analysis
- `CONTENT_PROGRESSION_PLAN.md` — Beta and beyond content roadmap

---

_For full alpha development history (v0.1.0 through v1.5.0), see git log._
