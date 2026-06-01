import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

export class PauseScene extends Phaser.Scene {
  constructor() { super({ key: 'PauseScene' }); }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Overlay
    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6);

    // Panel
    const panel = this.add.graphics();
    panel.fillStyle(COLORS.BG_MID);
    panel.fillRoundedRect(cx - 160, cy - 160, 320, 320, 16);
    panel.lineStyle(2, COLORS.BLUE);
    panel.strokeRoundedRect(cx - 160, cy - 160, 320, 320, 16);

    this.add.text(cx, cy - 110, '⏸ PAUSED', {
      fontSize: '36px', fontFamily: 'Arial Black', color: COLORS.TEXT_LIGHT, fontStyle: 'bold',
    }).setOrigin(0.5);

    this.makeBtn(cx, cy - 20, 'RESUME', COLORS.GREEN, () => {
      this.scene.resume('GameScene');
      this.scene.stop();
    });

    this.makeBtn(cx, cy + 60, 'RESTART', COLORS.ACCENT2, () => {
      this.scene.stop('GameScene');
      this.scene.stop();
      this.scene.start('GameScene');
    });

    this.makeBtn(cx, cy + 140, 'MAIN MENU', COLORS.DARK_GRAY, () => {
      this.scene.stop('GameScene');
      this.scene.stop();
      this.scene.start('MainMenuScene');
    });

    this.input.keyboard?.addKey('ESC').on('down', () => {
      this.scene.resume('GameScene');
      this.scene.stop();
    });
  }

  private makeBtn(x: number, y: number, label: string, color: number, cb: () => void) {
    const g = this.add.graphics();
    g.fillStyle(color);
    g.fillRoundedRect(x - 120, y - 22, 240, 44, 10);
    this.add.text(x, y, label, {
      fontSize: '20px', fontFamily: 'Arial Black', color: COLORS.TEXT_LIGHT,
    }).setOrigin(0.5);
    const zone = this.add.zone(x, y, 240, 44).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', cb);
  }
}
