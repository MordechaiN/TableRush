import { initTitle, showTitle, hideTitle } from './three/title';
import { RestaurantGame, GameResult } from './three/RestaurantGame';
import { createHud, showGameOver, showSettings, showCredits, Hud } from './three/ui';
import { ProgressionSystem } from './systems/ProgressionSystem';
import { SoundManager } from './systems/SoundManager';

// ── Table Rush v2 — Three.js client ───────────────────────────────────────────
const container = document.getElementById('game-container') as HTMLElement;
let game: RestaurantGame | null = null;
let hud: Hud | null = null;
let wasTutorial = false;

function startGame() {
  hideTitle();
  try { SoundManager.unlock(); } catch { /* */ }
  wasTutorial = !ProgressionSystem.isTutorialDone();
  hud = createHud();
  game = new RestaurantGame(
    container,
    (h) => hud?.update(h),
    (r) => endGame(r),
    (text, kind) => hud?.announce(text, kind),
    (kind) => hud?.flash(kind),
  );
  game.start(wasTutorial);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__game = game;
}

function endGame(result: GameResult) {
  if (wasTutorial) ProgressionSystem.markTutorialDone();
  hud?.destroy(); hud = null;
  const g = game; game = null;
  showGameOver(result, {
    onReplay: () => { g?.dispose(); startGame(); },
    onMenu: () => { g?.dispose(); showTitle(); },
  });
}

initTitle({
  onPlay: startGame,
  onSettings: () => showSettings(() => { /* title stays */ }),
  onCredits: () => showCredits(() => { /* title stays */ }),
});
