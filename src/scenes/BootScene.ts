import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

export class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload() {
    // Generate all textures programmatically - no external assets needed
    this.createTextures();
  }

  private createTextures() {
    const g = this.make.graphics({ x: 0, y: 0 });

    // Player texture
    g.clear();
    g.fillStyle(0x3498db);
    g.fillCircle(20, 14, 10);
    g.fillStyle(0x3498db);
    g.fillRoundedRect(8, 24, 24, 20, 4);
    g.fillStyle(0xffffff);
    g.fillCircle(20, 12, 7);
    g.generateTexture('player', 40, 50);

    // Customer textures (multiple colors)
    const custColors = [0xe74c3c, 0x2ecc71, 0xf39c12, 0x9b59b6, 0x1abc9c, 0xe67e22, 0x3498db];
    custColors.forEach((c, i) => {
      g.clear();
      g.fillStyle(c);
      g.fillCircle(16, 12, 10);
      g.fillRoundedRect(6, 22, 20, 18, 3);
      g.fillStyle(0xffffff);
      g.fillCircle(16, 10, 6);
      g.generateTexture(`customer_${i}`, 32, 42);
    });

    // Table texture
    g.clear();
    g.fillStyle(COLORS.TABLE_FILL);
    g.fillRoundedRect(0, 0, 100, 70, 8);
    g.lineStyle(2, COLORS.TABLE_STROKE);
    g.strokeRoundedRect(1, 1, 98, 68, 8);
    g.generateTexture('table', 100, 70);

    // Chair texture
    g.clear();
    g.fillStyle(0x34495e);
    g.fillRoundedRect(0, 0, 28, 28, 4);
    g.lineStyle(1, 0x4a6070);
    g.strokeRoundedRect(1, 1, 26, 26, 4);
    g.generateTexture('chair', 28, 28);

    // Food item textures
    const foodColors = [0xf39c12, 0xe74c3c, 0x2ecc71, 0xf5a623, 0x3498db];
    foodColors.forEach((c, i) => {
      g.clear();
      g.fillStyle(c);
      g.fillCircle(14, 14, 12);
      g.fillStyle(0xffffff, 0.3);
      g.fillCircle(10, 10, 4);
      g.generateTexture(`food_${i}`, 28, 28);
    });

    // Coin texture
    g.clear();
    g.fillStyle(0xf1c40f);
    g.fillCircle(12, 12, 11);
    g.fillStyle(0xf39c12);
    g.fillCircle(12, 12, 8);
    g.fillStyle(0xffd700, 0.6);
    g.fillCircle(9, 9, 3);
    g.generateTexture('coin', 24, 24);

    // Dirty plate
    g.clear();
    g.fillStyle(0x7f8c8d);
    g.fillCircle(14, 14, 12);
    g.fillStyle(0x95a5a6);
    g.fillCircle(14, 14, 8);
    g.generateTexture('dirty_plate', 28, 28);

    // Patience bar background
    g.clear();
    g.fillStyle(0x2c3e50);
    g.fillRoundedRect(0, 0, 80, 10, 5);
    g.generateTexture('bar_bg', 80, 10);

    // Speech bubble
    g.clear();
    g.fillStyle(0xffffff);
    g.fillRoundedRect(0, 0, 60, 40, 8);
    g.fillTriangle(10, 40, 20, 40, 15, 52);
    g.generateTexture('bubble', 60, 52);

    g.destroy();
  }

  create() {
    this.scene.start('MainMenuScene');
  }
}
