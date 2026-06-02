import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

export class PauseScene extends Phaser.Scene {
  constructor() { super({ key: 'PauseScene' }); }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6);

    const panel = this.add.graphics();
    panel.fillStyle(0xFFF8F0);
    panel.fillRoundedRect(cx - 160, cy - 150, 320, 300, 16);
    panel.lineStyle(2, COLORS.UI_ORANGE);
    panel.strokeRoundedRect(cx - 160, cy - 150, 320, 300, 16);

    this.add.text(cx, cy - 100, '⏸ PAUSED', {
      fontSize: '32px', fontFamily: 'Arial Black', color: COLORS.TEXT_DARK, fontStyle: 'bold',
    }).setOrigin(0.5);

    this.makeBtn(cx, cy - 10, 'RESUME', COLORS.UI_GREEN, () => {
      this.scene.resume('GameScene');
      this.scene.stop();
    });

    this.makeBtn(cx, cy + 60, 'RESTART', COLORS.UI_ORANGE, () => {
      this.scene.stop('GameScene');
      this.scene.stop();
      this.scene.start('GameScene');
    });

    this.makeBtn(cx, cy + 130, 'MAIN MENU', 0x888888, () => {
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
      fontSize: '20px', fontFamily: 'Arial Black', color: '#FFFFFF',
    }).setOrigin(0.5);
    const zone = this.add.zone(x, y, 240, 44).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', cb);
  }
}
