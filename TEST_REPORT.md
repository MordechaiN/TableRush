# TEST REPORT

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
