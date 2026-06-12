# KNOWN ISSUES

## Open

- Portrait orientation only — landscape not supported, no rotate prompt
- Music loop audibly repeats after ~8 seconds (4-bar loop)
- No fullscreen API / PWA manifest for mobile home screen install
- Dishwasher touch target (60×56px) is slightly below 44pt accessibility guideline
- No keyboard navigation for gameplay (ESC for pause only)
- No social sharing or external leaderboard
- No cancel action — cannot abort waiter movement once started
- **GameScene.ts replaced with placeholder** — see RESTORE_GAMESCENE.md for fix

## Resolved

- ~~No audio (placeholder toggles in Settings exist, no sounds implemented yet)~~ — **FIXED in v1.0.0**: Audio fully implemented. 16 sounds + ambient music via Web Audio API. Mobile unlock fixed via `SoundManager.unlock()`.
- ~~Combo invisible at ×1.0~~ — **FIXED in v0.9.0**: Combo always shows ("×1" grayed when inactive)
- ~~Action indicator invisible~~ — **FIXED in v0.8.0**: Priority arrow system redesigned
- ~~Tutorial card overlaps queue zone~~ — **FIXED in Junior Sprint**: Card moved to GAME_HEIGHT-175
- ~~Tutorial first order can be slow pizza~~ — **FIXED in Junior Sprint**: Forced Salad (1.5s) for tutorial step 1
- ~~Tutorial step texts too vague~~ — **FIXED in Junior Sprint**: All texts rewritten with explicit TAP THE X language
