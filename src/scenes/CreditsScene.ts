import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

export class CreditsScene extends Phaser.Scene {
  constructor() { super({ key: 'CreditsScene' }); }

  create() {
    const cx = GAME_WIDTH / 2;

    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BG_DARK);
    this.add.rectangle(cx, 0, GAME_WIDTH, 4, COLORS.ACCENT).setOrigin(0.5, 0);

    this.add.text(cx, 80, 'CREDITS', {
      fontSize: '42px', fontFamily: 'Arial Black', color: COLORS.TEXT_ACCENT, fontStyle: 'bold',
    }).setOrigin(0.5);

    const lines = [
      { label: '🎮 Game Concept & Product Owner', value: 'Mordechai Neeman' },
      { label: '💻 Implementation', value: 'Claude Code' },
      { label: '🛠 Engine', value: 'Phaser 3' },
      { label: '📦 Build Tool', value: 'Vite + TypeScript' },
    ];

    lines.forEach((line, i) => {
      const y = 200 + i * 100;
      this.add.text(cx, y, line.label, {
        fontSize: '16px', fontFamily: 'Arial', color: COLORS.TEXT_DIM,
      }).setOrigin(0.5);
      this.add.text(cx, y + 32, line.value, {
        fontSize: '24px', fontFamily: 'Arial Black', color: COLORS.TEXT_LIGHT, fontStyle: 'bold',
      }).setOrigin(0.5);
    });

    this.add.text(cx, GAME_HEIGHT - 120, 'TableRush v0.1.0', {
      fontSize: '16px', fontFamily: 'Arial', color: COLORS.TEXT_DIM,
    }).setOrigin(0.5);

    this.add.text(cx, GAME_HEIGHT - 90, '© 2026 Mordechai Neeman', {
      fontSize: '14px', fontFamily: 'Arial', color: COLORS.TEXT_DIM,
    }).setOrigin(0.5);

    this.makeBtn(cx, GAME_HEIGHT - 40, '← BACK', COLORS.DARK_GRAY, () => this.scene.start('MainMenuScene'));
  }

  private makeBtn(x: number, y: number, label: string, color: number, cb: () => void) {
    const g = this.add.graphics();
    g.fillStyle(color);
    g.fillRoundedRect(x - 120, y - 20, 240, 40, 10);
    this.add.text(x, y, label, {
      fontSize: '18px', fontFamily: 'Arial Black', color: COLORS.TEXT_LIGHT,
    }).setOrigin(0.5);
    const zone = this.add.zone(x, y, 240, 40).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', cb);
  }
}
