import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

export class CreditsScene extends Phaser.Scene {
  constructor() { super({ key: 'CreditsScene' }); }

  create() {
    const cx = GAME_WIDTH / 2;

    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.FLOOR_WARM);
    this.add.rectangle(cx, 2, GAME_WIDTH, 4, COLORS.UI_ORANGE).setOrigin(0.5, 0);

    this.add.text(cx, 80, '🎖️ CREDITS', {
      fontSize: '36px', fontFamily: 'Arial Black', color: COLORS.TEXT_DARK, fontStyle: 'bold',
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
        fontSize: '16px', fontFamily: 'Arial', color: '#888888',
      }).setOrigin(0.5);
      this.add.text(cx, y + 32, line.value, {
        fontSize: '22px', fontFamily: 'Arial Black', color: COLORS.TEXT_DARK, fontStyle: 'bold',
      }).setOrigin(0.5);
    });

    this.add.text(cx, GAME_HEIGHT - 100, 'TableRush v0.2.0', {
      fontSize: '16px', fontFamily: 'Arial', color: '#AAAAAA',
    }).setOrigin(0.5);

    this.add.text(cx, GAME_HEIGHT - 75, '© 2026 Mordechai Neeman', {
      fontSize: '14px', fontFamily: 'Arial', color: '#AAAAAA',
    }).setOrigin(0.5);

    this.makeBtn(cx, GAME_HEIGHT - 40, '← BACK', () => this.scene.start('MainMenuScene'));
  }

  private makeBtn(x: number, y: number, label: string, cb: () => void) {
    const g = this.add.graphics();
    g.fillStyle(COLORS.UI_ORANGE);
    g.fillRoundedRect(x - 120, y - 22, 240, 44, 10);
    this.add.text(x, y, label, {
      fontSize: '20px', fontFamily: 'Arial Black', color: '#FFFFFF',
    }).setOrigin(0.5);
    const zone = this.add.zone(x, y, 240, 44).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', cb);
  }
}
