import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';
import { ProgressionSystem } from '../systems/ProgressionSystem';
import { SoundManager } from '../systems/SoundManager';

export class MainMenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MainMenuScene' }); }

  create() {
    const cx = GAME_WIDTH / 2;
    const prog = ProgressionSystem.getData();

    // Warm background
    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.FLOOR_WARM);

    // Tile pattern
    for (let row = 0; row < 14; row++) {
      for (let col = 0; col < 7; col++) {
        if ((row + col) % 2 === 0) {
          this.add.rectangle(col * 70 + 35, row * 70 + 35, 69, 69, COLORS.FLOOR_ALT, 0.6);
        }
      }
    }

    // Top wall accent
    this.add.rectangle(cx, 45, GAME_WIDTH, 90, COLORS.WALL_ACCENT);

    // ── Side walls — same language as game scene ─────────────────────────────
    const wallW = 16;
    const menuWallH = GAME_HEIGHT - 90;
    const lW = this.add.graphics();
    lW.fillStyle(0xC8854A, 1);
    lW.fillRect(0, 90, wallW, Math.floor(menuWallH * 0.58));
    lW.fillStyle(0x9A5C28, 1);
    lW.fillRect(0, 90 + Math.floor(menuWallH * 0.58), wallW, Math.floor(menuWallH * 0.4));
    lW.fillStyle(0x4A2410, 1);
    lW.fillRect(0, GAME_HEIGHT - 16, wallW, 16);
    const rW = this.add.graphics();
    rW.fillStyle(0xC8854A, 1);
    rW.fillRect(GAME_WIDTH - wallW, 90, wallW, Math.floor(menuWallH * 0.58));
    rW.fillStyle(0x9A5C28, 1);
    rW.fillRect(GAME_WIDTH - wallW, 90 + Math.floor(menuWallH * 0.58), wallW, Math.floor(menuWallH * 0.4));
    rW.fillStyle(0x4A2410, 1);
    rW.fillRect(GAME_WIDTH - wallW, GAME_HEIGHT - 16, wallW, 16);

    // ── Window light shafts ──────────────────────────────────────────────────
    const shafts = this.add.graphics();
    shafts.fillStyle(0xFFEE88, 0.07);
    shafts.fillTriangle(24, 90, 180, 90, 110, 500);
    shafts.fillStyle(0xFFEE88, 0.05);
    shafts.fillTriangle(GAME_WIDTH - 24, 90, GAME_WIDTH - 180, 90, GAME_WIDTH - 110, 500);

    // ── Background table silhouettes — very subtle atmosphere ───────────────
    const bgTables = this.add.graphics().setAlpha(0.07);
    [[100, 590], [380, 590], [240, 730]].forEach(([tx, ty]) => {
      // Table body
      bgTables.fillStyle(0x8B4513, 1);
      bgTables.fillRoundedRect(tx - 52, ty - 30, 104, 60, 8);
      // Tablecloth
      bgTables.fillStyle(0xFDFAF6, 1);
      bgTables.fillRoundedRect(tx - 48, ty - 28, 96, 48, 6);
      // Chair silhouettes
      bgTables.fillStyle(0x5C3317, 1);
      bgTables.fillRoundedRect(tx - 28, ty + 22, 20, 22, 3);
      bgTables.fillRoundedRect(tx + 8, ty + 22, 20, 22, 3);
      bgTables.fillRoundedRect(tx - 28, ty - 48, 20, 20, 3);
      bgTables.fillRoundedRect(tx + 8, ty - 48, 20, 20, 3);
    });

    // Logo
    const logoY = 180;
    this.add.text(cx, logoY, 'TABLE', {
      fontSize: '72px', fontFamily: 'Arial Black',
      color: COLORS.TEXT_LIGHT, fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, logoY + 74, 'RUSH', {
      fontSize: '72px', fontFamily: 'Arial Black',
      color: COLORS.TEXT_GOLD, fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, logoY + 146, 'Fast-Paced Restaurant Service', {
      fontSize: '16px', fontFamily: 'Arial', color: COLORS.TEXT_LIGHT,
    }).setOrigin(0.5);

    // Decorative food icons
    const d1 = this.add.text(cx - 150, logoY + 74, '🍔', { fontSize: '34px' }).setOrigin(0.5);
    const d2 = this.add.text(cx + 150, logoY + 74, '🍕', { fontSize: '34px' }).setOrigin(0.5);
    this.tweens.add({ targets: d1, y: logoY + 64, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: d2, y: logoY + 84, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Level / high score display
    const statsY = 400;
    const statBg = this.add.graphics();
    statBg.fillStyle(0x00000020, 0.25);
    statBg.fillRoundedRect(cx - 170, statsY - 20, 340, 50, 12);

    this.add.text(cx - 80, statsY + 5, `🏆 ${prog.highScore}`, {
      fontSize: '18px', fontFamily: 'Arial Black', color: COLORS.TEXT_GOLD,
    }).setOrigin(0.5);

    this.add.text(cx, statsY + 5, '|', { fontSize: '16px', color: '#DDDDDD' }).setOrigin(0.5);

    this.add.text(cx + 80, statsY + 5, `Level ${prog.level}`, {
      fontSize: '18px', fontFamily: 'Arial Black', color: COLORS.TEXT_LIGHT,
    }).setOrigin(0.5);

    if (prog.bestStars > 0) {
      let starsStr = '';
      for (let i = 0; i < prog.bestStars; i++) starsStr += '⭐';
      this.add.text(cx, statsY + 32, `Best: ${starsStr}`, {
        fontSize: '14px', color: COLORS.TEXT_GOLD,
      }).setOrigin(0.5);
    }

    // Buttons
    const btnY = 490;
    this.makeBtn(cx, btnY, '▶  PLAY', 'btn_orange', () => this.scene.start('GameScene'));
    this.makeBtn(cx, btnY + 68, 'SETTINGS', 'btn_green', () => this.scene.start('SettingsScene'));
    this.makeBtn(cx, btnY + 136, 'CREDITS', 'btn_green', () => this.scene.start('CreditsScene'));

    // Decorative food row below buttons — fills lower empty space
    const foodRow = ['🥗', '🍔', '🍝', '🍣', '🍕'];
    foodRow.forEach((emoji, i) => {
      const ex = 52 + i * 92;
      const ey = 710 + (i % 2 === 0 ? 0 : 14);
      const fe = this.add.text(ex, ey, emoji, { fontSize: '28px' }).setOrigin(0.5).setAlpha(0.55);
      this.tweens.add({
        targets: fe, y: ey - 8,
        duration: 1200 + i * 150, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    });

    // Version watermark
    this.add.text(cx, GAME_HEIGHT - 10, 'v1.0.0', {
      fontSize: '11px', fontFamily: 'Arial', color: '#C8A060', letterSpacing: 2,
    }).setOrigin(0.5).setAlpha(0.6);
  }

  private makeBtn(x: number, y: number, label: string, tex: string, cb: () => void) {
    const btn = this.add.image(x, y, tex).setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => { SoundManager.uiClick(); cb(); });
    btn.on('pointerover', () => btn.setAlpha(0.85));
    btn.on('pointerout', () => btn.setAlpha(1));
    this.add.text(x, y, label, {
      fontSize: '22px', fontFamily: 'Arial Black', color: '#FFFFFF', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(1);
  }
}
