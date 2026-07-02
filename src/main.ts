import { initTitle, showTitle, hideTitle } from './three/title';
import { RestaurantGame, GameResult } from './three/RestaurantGame';
import { createHud, showGameOver, showPause, showSettings, showCredits, Hud } from './three/ui';
import { ProgressionSystem } from './systems/ProgressionSystem';
import { SoundManager } from './systems/SoundManager';

// ── Table Rush — orchestrator (title → game → game over) ─────────────────────
const container = document.getElementById('game-container') as HTMLElement;
let game: RestaurantGame | null = null;
let hud: Hud | null = null;
let wasTutorial = false;

function startGame() {
  hideTitle();
  try { SoundManager.unlock(); } catch { /* audio needs a user gesture */ }
  wasTutorial = !ProgressionSystem.isTutorialDone();
  hud = createHud(pauseGame);
  const level = ProgressionSystem.getData().level;
  game = new RestaurantGame(container, {
    onHud: (h) => hud?.update(h),
    onOver: (r) => endGame(r),
    onAnnounce: (text, kind) => hud?.announce(text, kind),
    onFlash: (kind) => hud?.flash(kind),
    onCoinFly: (x, y, n) => hud?.coinFly(x, y, n),
  }, level);
  game.start(wasTutorial);
  (window as unknown as { __game: RestaurantGame }).__game = game;
}

function pauseGame() {
  if (!game || game.paused) return;
  game.pause();
  showPause({
    onResume: () => game?.resume(),
    onQuit: () => {
      hud?.destroy(); hud = null;
      game?.dispose(); game = null;
      showTitle();
    },
  });
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

addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && game && !game.paused) pauseGame();
});

initTitle({
  onPlay: startGame,
  onSettings: () => showSettings(() => { /* title stays */ }),
  onCredits: () => showCredits(() => { /* title stays */ }),
});
