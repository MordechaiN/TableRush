# TableRush — Mobile UX Audit
_2026-06-12 · Target: 390×844 (iPhone 13/14) · Game canvas: 480×854_

---

## Summary

The game is playable on mobile. All interactions are single-tap. The P0 fix for the tutorial card position was critical — it was being rendered below the Safari/Chrome viewport safe area on some devices. Everything else ranges from acceptable to good.

---

## Critical Mobile Issues (P0)

### Tutorial card was in browser chrome overlap zone

**Before fix:** `cardY = GAME_HEIGHT - 58 = 796`. On iPhone with browser chrome visible, the safe area bottom is ~810px. The card bottom was at y=830 — partially or fully hidden.

**After fix:** `cardY = GAME_HEIGHT - 192 = 662`. Card sits at y=634–724, well within safe area.

**Status: FIXED**

---

## Touch Target Audit

| Element | Size | Min recommended | Status |
|---------|------|-----------------|--------|
| Table 1-4 (top/middle) | 110×76px logical | 44×44px | ✅ OK |
| Table 5 (center) | 110×76px logical | 44×44px | ✅ OK |
| Kitchen zone | 460×80px | 44×44px | ✅ Large |
| Dishwasher | 60×56px | 44×44px | ⚠️ Tight |
| PLAY button | 200×52px | 44×44px | ✅ OK |
| Pause buttons | 260×48px | 44×44px | ✅ OK |
| SFX/Music toggles | 52×24px | 44×44px | ⚠️ Tight |

**Dishwasher (60×56px):** Just meets minimum but is in the top-left corner, far from where the player’s thumb is during normal gameplay. New players have to reach. No critical issue, but could be 80×60px.

---

## Thumb Reachability

```
Game canvas: 480px wide, 854px tall
Scaled to fit 390px iPhone: displayed ~81% width

Thumb reach zones (right-handed player):
Easy:    lower-right 60% of screen
Reach:   top half
Strain:  top-left corner

Critical elements by reach:
Tables 1-4 (y=290-440): REACH zone - requires both hands or deliberate reach
Table 5 (y=570, center): EASY zone - thumb-friendly
Kitchen (y=86-188): TOP ZONE - requires upward reach
Dishwasher (x=36, y=196): TOP-LEFT STRAIN - hardest spot to reach
Player/Queue (y=700-770): EASY zone - natural thumb rest
```

**Issue:** Kitchen and dishwasher are in the hardest-to-reach zones, and they’re the most frequently used (every service cycle). This is a layout concern that can’t be fixed without redesigning the game layout.

**Mitigation:** The game is designed for two hands. This is acceptable for a restaurant management game.

---

## Audio on Mobile

- AudioContext unlock on first tap: ✅ **FIXED** (SoundManager.unlock() called from uiClick)
- Music auto-starts after first button press: ✅
- Haptic feedback on key events: ✅ (payment, angry, combo)
- In-game mute controls: ✅ (PauseScene toggles)

---

## Viewport and Scaling

- `Phaser.Scale.FIT + CENTER_BOTH`: ✅
- Portrait-only: ✅ (landscape not supported, no prompt needed for mobile portrait game)
- No fullscreen API: ⚠️ Minor (browser chrome visible)
- No PWA manifest: ⚠️ (no home screen install)

---

## Readability on Mobile

| Element | Size (game px) | Size (iPhone logical px) | Readable? |
|---------|---------------|--------------------------|----------|
| HUD score | 19px | ~15px | ✅ OK |
| HUD timer | 19px | ~15px | ✅ OK |
| Action labels (new) | 12px | ~10px | ⚠️ Small but visible |
| Tutorial card text | 14px | ~11px | ✅ OK |
| Table numbers | 11px | ~9px | ⚠️ Tiny but decorative |
| Customer names | 11px | ~9px | ⚠️ Tiny (fades quickly anyway) |

Action labels at 12px are at the edge. They’re readable but not comfortable. Should be 13-14px for better mobile legibility.

---

## Verdict

Mobile UX is **playable and functional** after the P0 tutorial card fix. The table touch targets, audio unlock, and mute controls all work. The main limitations are structural (kitchen at top = hard reach) and minor (tiny action label font size).

**Mobile readiness: PASS with noted limitations.**
