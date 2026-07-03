import { initTitle, showTitle, hideTitle } from './three/title';
import { RestaurantGame, LevelResult } from './three/RestaurantGame';
import { createHud, showLevelEnd, showPause, showShop, showSettings, showCredits, Hud } from './three/ui';
import { ProgressionSystem } from './systems/ProgressionSystem';
import { SoundManager } from './systems/SoundManager';
import { LEVELS } from './config/GameConfig';

// ── Table Rush — orchestrator (title → level → level end) ────────────────────
const container = document.getElementById('game-container') as HTMLElement;
let game: RestaurantGame | null = null;
let hud: Hud | null = null;

function startLevel(levelId: number) {
  hideTitle();
  try { SoundManager.unlock(); } catch { /* audio needs a user gesture */ }
  const level = LEVELS[Math.min(levelId, LEVELS.length) - 1];
  hud = createHud(pauseGame);
  game = new RestaurantGame(container, {
    onHud: (h) => hud?.update(h),
    onOver: (r) => endLevel(r),
    onAnnounce: (text, kind) => hud?.announce(text, kind),
    onFlash: (kind) => hud?.flash(kind),
    onCoinFly: (x, y, n) => hud?.coinFly(x, y, n),
  }, level, ProgressionSystem.getBoosts());
  game.start(!ProgressionSystem.isTutorialDone());
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

function endLevel(result: LevelResult) {
  ProgressionSystem.markTutorialDone();
  hud?.destroy(); hud = null;
  const g = game; game = null;
  showLevelEnd(result, {
    onNext: () => { g?.dispose(); startLevel(result.levelId + 1); },
    onRetry: () => { g?.dispose(); startLevel(result.levelId); },
    onMenu: () => { g?.dispose(); showTitle(); },
  });
}

addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && game && !game.paused) pauseGame();
});

// installable + offline after first visit (production builds only)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* not fatal */ });
  });
}

initTitle({
  onPlay: () => startLevel(ProgressionSystem.getData().levelReached),
  onShop: () => showShop(() => showTitle()),
  onSettings: () => showSettings(() => { /* title stays */ }),
  onCredits: () => showCredits(() => { /* title stays */ }),
});
