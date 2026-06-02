# TEST REPORT

## v0.6.0 — 2026-06-02

### Build & Type Check
| Check | Result | Notes |
|-------|--------|-------|
| `tsc` (TypeScript strict) | ✅ PASS | 0 errors |
| `vite build` | ✅ PASS | 57.74 kB game bundle + 1.48 MB Phaser |

### v0.6.0 Changes Verified (code-level)
| Change | Verified | Notes |
|--------|----------|-------|
| Customer eyeY fixed (−4 → −18) | ✅ | `Customer.EYE_Y = -18`, `EYE_Y` used in drawFace |
| Mouth at mouthY = −13 | ✅ | `Customer.MOUTH_Y = -13` |
| Angry overlay on head (not body) | ✅ | `fillRoundedRect(-12, -26, 24, 20, 5)` |
| Patience bar at y=−42 | ✅ | Track: `fillRoundedRect(-18, -42, 36, 5, 2.5)` |
| Bubble at y=−66 | ✅ | `this.bubble = scene.add.container(0, -66)` |
| Bubble shadow | ✅ | `fillStyle(0x000000, 0.15)` before main bg |
| Bubble tail shortened | ✅ | Triangle tip at y=20 (not 26) in bubble space |
| Eat bar at y=+30 | ✅ | `fillRoundedRect(-18, 30, 36, 4, 2)` |
| Player head outline | ✅ | `strokeCircle(20, 14, 12)` in player texture |
| Player ears | ✅ | `fillCircle(8, 14, 3.5)`, `fillCircle(32, 14, 3.5)` |
| Customer skin #FDBA8C | ✅ | All 7 variants: `fillStyle(0xFDBA8C)` |
| Customer head outline | ✅ | `strokeCircle(16, 10, 10)` in forEach loop |
| Customer body outline | ✅ | `strokeRoundedRect(bodyX, 18, bodyW, 20, 5)` |
| Teen cap brim beyond head | ✅ | `fillRect(4, 6, 24, 3)` — x=4 to x=28, head is x=6-26 |
| Trendy sunglasses beyond head | ✅ | Lenses at x=4-13 and x=19-28 |
| Romantic flower beyond head | ✅ | `fillCircle(25, 3, 4.5)` extends to x=29.5 |
| Elder shorter legs | ✅ | `legH = isElder ? 8 : 12` |
| Elder glasses temples | ✅ | `lineBetween(7.5, 10, 3, 10)` and `lineBetween(24.5, 10, 29, 10)` |
| Table checkered cloth | ✅ | 8×8 grid in table texture |
| Kitchen pot on burner | ✅ | Pot at (55,25) burner in kitchen texture |
| Kitchen pan on burner | ✅ | Pan at (100,55) burner in kitchen texture |
| Menu board texture created | ✅ | `generateTexture('menu_board', 200, 58)` |
| Menu board in GameScene | ✅ | Added above kitchen at `KITCHEN_Y - 54` |
| food_plate texture created | ✅ | `generateTexture('food_plate', 26, 26)` |
| plateImage in Player.carryItem | ✅ | `this.plateImage` field, added in carry, destroyed in clearCarry |

### Gameplay Regression (unchanged systems)
All v0.2.0 gameplay tests remain valid (see VALIDATION_REPORT.md). No gameplay logic was modified in v0.6.0 — only visual/texture changes.

---

## v0.1.0 — 2026-06-01

### Build & Type Check
| Check | Result | Notes |
|-------|--------|-------|
| `npm run type-check` | ✅ PASS | 0 errors |
| `npm run build` | ✅ PASS | Output: dist/ 1.5MB (Phaser bundled) |

### Scene Navigation
| Test | Result | Notes |
|------|--------|-------|
| Main Menu loads | ✅ PASS | Logo, buttons, high score display |
| Play button → GameScene | ✅ PASS | Scene transitions |
| Settings button | ✅ PASS | Toggles save to localStorage |
| Credits button | ✅ PASS | Displays credits correctly |
| Back buttons | ✅ PASS | All return to MainMenu |

### Gameplay Loop
| Test | Result | Notes |
|------|--------|-------|
| Customer spawns | ✅ PASS | Animates from door to table |
| Customer patience bar | ✅ PASS | Depletes; color changes green→yellow→red |
| Tap seated customer → order menu | ✅ PASS | 5 menu items displayed |
| Order selected → player walks to kitchen | ✅ PASS | Cook time delay per item |
| Tap table with food → delivery | ✅ PASS | Player walks to table, food delivered |
| Customer eats (timed) | ✅ PASS | State changes to 'paying' after eat time |
| Tap paying customer → collect payment | ✅ PASS | Coins spawn, score increases |
| Tip based on patience | ✅ PASS | Higher patience = higher tip |
| Table becomes dirty after customer leaves | ✅ PASS | Dirty indicator shown |
| Tap dirty table → clean | ✅ PASS | Player walks, cleans, table available |
| Angry customer leaves | ✅ PASS | Patience = 0 → customer exits, combo resets |

### Score System
| Test | Result | Notes |
|------|--------|-------|
| Score increases on delivery | ✅ PASS | Amount shown as floating text |
| Combo increments on payment | ✅ PASS | Combo text displayed |
| Multiplier increases | ✅ PASS | Up to 5x shown in HUD |
| Angry customer resets combo | ✅ PASS | Multiplier returns to 1x |
| High score saves | ✅ PASS | localStorage persists across sessions |

### Game States
| Test | Result | Notes |
|------|--------|-------|
| 3-minute timer counts down | ✅ PASS | Turns red at 30s |
| Timer hits 0 → GameOver | ✅ PASS | Transitions to GameOverScene |
| Pause (ESC) | ✅ PASS | PauseScene overlays, game pauses |
| Resume from pause | ✅ PASS | GameScene continues |
| Restart from pause | ✅ PASS | Fresh GameScene |
| Main Menu from pause | ✅ PASS | Stops GameScene |
| Play Again from GameOver | ✅ PASS | Fresh GameScene |
| New high score detection | ✅ PASS | Shows "NEW RECORD!" + confetti |

### Difficulty
| Test | Result | Notes |
|------|--------|-------|
| Spawn interval decreases over time | ✅ PASS | Tables fill faster |
| Patience decreases over time | ✅ PASS | Customers more impatient |

### Known Issues
- No audio (settings toggles are UI-only placeholders)
- Phaser chunk > 500KB (expected for a game engine, not a bug)
