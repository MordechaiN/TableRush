import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, fmtScore } from '../config/GameConfig';
import { ProgressionSystem } from '../systems/ProgressionSystem';
import { SoundManager } from '../systems/SoundManager';

export class MainMenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MainMenuScene' }); }

  create() {
    const cx = GAME_WIDTH / 2;
    const prog = ProgressionSystem.getData();
    // Ambient music — plays if AudioContext is already active (returns from game session)
    SoundManager.startMusic();

    // Dark walnut hardwood plank floor
    const PLANK_H = 34;
    const plankCols = [0x2E1E0F, 0x251508, 0x2B1B0D, 0x221307, 0x301F10];
    const menuFloor = this.add.graphics();
    const rowCount = Math.ceil(GAME_HEIGHT / PLANK_H) + 1;
    for (let row = 0; row < rowCount; row++) {
      menuFloor.fillStyle(plankCols[row % plankCols.length], 1);
      menuFloor.fillRect(0, row * PLANK_H, GAME_WIDTH, PLANK_H);
    }
    menuFloor.fillStyle(0x000000, 0.25);
    for (let row = 1; row < rowCount; row++) {
      menuFloor.fillRect(0, row * PLANK_H - 1, GAME_WIDTH, 1);
    }
    menuFloor.fillStyle(0xFF9944, 0.04);
    for (let row = 0; row < rowCount; row++) {
      menuFloor.fillRect(0, row * PLANK_H, GAME_WIDTH, 2);
    }

    // Top wall accent
    this.add.rectangle(cx, 45, GAME_WIDTH, 90, COLORS.WALL_ACCENT);

    // ── Side walls — same language as game scene ─────────────────────────────
    const wallW = 16;
    const menuWallH = GAME_HEIGHT - 90;
    const lW = this.add.graphics();
    lW.fillStyle(0xBF7A42, 1);
    lW.fillRect(0, 90, wallW, Math.floor(menuWallH * 0.58));
    lW.fillStyle(0xEEE3D2, 1);    // cream wainscoting
    lW.fillRect(0, 90 + Math.floor(menuWallH * 0.58), wallW, Math.floor(menuWallH * 0.4));
    lW.fillStyle(0x5A2E12, 1);    // chair rail
    lW.fillRect(0, 90 + Math.floor(menuWallH * 0.57), wallW, 4);
    lW.fillStyle(0x251007, 1);
    lW.fillRect(0, GAME_HEIGHT - 14, wallW, 14);
    const rW = this.add.graphics();
    rW.fillStyle(0xBF7A42, 1);
    rW.fillRect(GAME_WIDTH - wallW, 90, wallW, Math.floor(menuWallH * 0.58));
    rW.fillStyle(0xEEE3D2, 1);    // cream wainscoting
    rW.fillRect(GAME_WIDTH - wallW, 90 + Math.floor(menuWallH * 0.58), wallW, Math.floor(menuWallH * 0.4));
    rW.fillStyle(0x5A2E12, 1);    // chair rail
    rW.fillRect(GAME_WIDTH - wallW, 90 + Math.floor(menuWallH * 0.57), wallW, 4);
    rW.fillStyle(0x251007, 1);
    rW.fillRect(GAME_WIDTH - wallW, GAME_HEIGHT - 14, wallW, 14);

    // ── Window light shafts ──────────────────────────────────────────────────
    const shafts = this.add.graphics();
    shafts.fillStyle(0xFFEE88, 0.07);
    shafts.fillTriangle(24, 90, 180, 90, 110, 500);
    shafts.fillStyle(0xFFEE88, 0.05);
    shafts.fillTriangle(GAME_WIDTH - 24, 90, GAME_WIDTH - 180, 90, GAME_WIDTH - 110, 500);

    // ── Background table silhouettes — atmospheric restaurant backdrop ───────
    const bgTables = this.add.graphics().setAlpha(0.38);
    [[100, 590], [380, 590], [240, 730]].forEach(([tx, ty]) => {
      // Table body
      bgTables.fillStyle(0x8B4513, 1);
      bgTables.fillRoundedRect(tx - 52, ty - 30, 104, 60, 8);
      // Tablecloth (matches in-game linen ivory)
      bgTables.fillStyle(0xF5F0E8, 1);
      bgTables.fillRoundedRect(tx - 48, ty - 28, 96, 48, 6);
      // Chair silhouettes
      bgTables.fillStyle(0x5C3317, 1);
      bgTables.fillRoundedRect(tx - 28, ty + 22, 20, 22, 3);
      bgTables.fillRoundedRect(tx + 8, ty + 22, 20, 22, 3);
      bgTables.fillRoundedRect(tx - 28, ty - 48, 20, 20, 3);
      bgTables.fillRoundedRect(tx + 8, ty - 48, 20, 20, 3);
    });

    // ── Logo card backdrop ────────────────────────────────────────────────────
    const logoY = 155;
    const logoBg = this.add.graphics();
    logoBg.fillStyle(0x1A0E08, 0.72);
    logoBg.fillRoundedRect(cx - 210, logoY - 30, 420, 240, 20);
    logoBg.lineStyle(1.5, 0xD4A849, 0.45);
    logoBg.strokeRoundedRect(cx - 210, logoY - 30, 420, 240, 20);
    logoBg.setAlpha(0);
    this.tweens.add({ targets: logoBg, alpha: 1, duration: 500, ease: 'Quad.easeOut' });

    // Restaurant badge icon
    const badge = this.add.image(cx, logoY + 12, 'plate_badge')
      .setOrigin(0.5).setScale(0.75).setAlpha(0);
    this.tweens.add({ targets: badge, alpha: 1, y: logoY + 6, duration: 400, delay: 150, ease: 'Back.easeOut' });

    // "TABLE" word
    const tableWord = this.add.text(cx, logoY + 68, 'TABLE', {
      fontSize: '74px', fontFamily: 'Arial Black',
      color: COLORS.TEXT_LIGHT, fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: tableWord, alpha: 1, y: tableWord.y - 10, duration: 380, delay: 200, ease: 'Quad.easeOut' });

    // "RUSH" word
    const rushWord = this.add.text(cx, logoY + 140, 'RUSH', {
      fontSize: '74px', fontFamily: 'Arial Black',
      color: COLORS.TEXT_GOLD, fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: rushWord, alpha: 1, y: rushWord.y - 10, duration: 380, delay: 340, ease: 'Quad.easeOut' });

    // Tagline
    const tagline = this.add.text(cx, logoY + 200, 'Fast-Paced Restaurant Service', {
      fontSize: '15px', fontFamily: 'Arial', color: '#DDCCAA',
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: tagline, alpha: 0.8, duration: 380, delay: 480, ease: 'Quad.easeOut' });

    // ── Waiter mascot — drawn in logo card, tray-carrying hero ───────────────
    const wc = logoY + 105;   // waiter center y
    const wx = cx - 165;      // far-left of card, beside logo
    const waiterGfx = this.add.graphics().setAlpha(0).setDepth(2);

    // Body (navy jacket)
    waiterGfx.fillStyle(0x1A237E, 1);
    waiterGfx.fillRoundedRect(wx - 14, wc - 8, 28, 36, 4);
    // Shirt (white strip)
    waiterGfx.fillStyle(0xFFFFFF, 1);
    waiterGfx.fillRect(wx - 5, wc - 6, 10, 18);
    // Bow-tie
    waiterGfx.fillStyle(0xE53935, 1);
    waiterGfx.fillTriangle(wx - 5, wc - 6, wx - 1, wc - 2, wx - 5, wc + 2);
    waiterGfx.fillTriangle(wx + 5, wc - 6, wx + 1, wc - 2, wx + 5, wc + 2);
    // Head
    waiterGfx.fillStyle(0xFDA07A, 1);
    waiterGfx.fillCircle(wx, wc - 22, 14);
    // Hair
    waiterGfx.fillStyle(0x2C1810, 1);
    waiterGfx.fillEllipse(wx, wc - 33, 28, 12);
    // Eyes
    waiterGfx.fillCircle(wx - 5, wc - 23, 2.5);
    waiterGfx.fillCircle(wx + 5, wc - 23, 2.5);
    // Smile
    waiterGfx.lineStyle(2, 0x2C1810, 1);
    waiterGfx.beginPath();
    waiterGfx.arc(wx, wc - 18, 5, 0, Math.PI, false);
    waiterGfx.strokePath();
    // Arm holding tray
    waiterGfx.fillStyle(0x1A237E, 1);
    waiterGfx.fillRoundedRect(wx + 10, wc - 4, 16, 8, 3);
    // Tray
    waiterGfx.fillStyle(0x7A4A1E, 1);
    waiterGfx.fillRoundedRect(wx + 16, wc - 10, 34, 6, 2);
    waiterGfx.fillStyle(0xC4874A, 0.5);
    waiterGfx.fillRoundedRect(wx + 17, wc - 9, 32, 3, 1);
    // Food on tray
    const foodLeft = this.add.image(wx + 33, wc - 16, 'food_1').setScale(0.28).setOrigin(0.5).setAlpha(0).setDepth(2);

    this.tweens.add({ targets: [waiterGfx, foodLeft], alpha: 1, duration: 380, delay: 600, ease: 'Quad.easeOut' });
    // Idle bob
    this.tweens.add({ targets: waiterGfx, y: { from: 0, to: -6 }, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 700 });

    // Mirror waiter on right side (facing left, holding dessert)
    const wx2 = cx + 165;
    const waiterGfx2 = this.add.graphics().setAlpha(0).setDepth(2);
    waiterGfx2.fillStyle(0x1A237E, 1);
    waiterGfx2.fillRoundedRect(wx2 - 14, wc - 8, 28, 36, 4);
    waiterGfx2.fillStyle(0xFFFFFF, 1);
    waiterGfx2.fillRect(wx2 - 5, wc - 6, 10, 18);
    waiterGfx2.fillStyle(0xE53935, 1);
    waiterGfx2.fillTriangle(wx2 - 5, wc - 6, wx2 - 1, wc - 2, wx2 - 5, wc + 2);
    waiterGfx2.fillTriangle(wx2 + 5, wc - 6, wx2 + 1, wc - 2, wx2 + 5, wc + 2);
    waiterGfx2.fillStyle(0xFDA07A, 1);
    waiterGfx2.fillCircle(wx2, wc - 22, 14);
    waiterGfx2.fillStyle(0x2C1810, 1);
    waiterGfx2.fillEllipse(wx2, wc - 33, 28, 12);
    waiterGfx2.fillCircle(wx2 - 5, wc - 23, 2.5);
    waiterGfx2.fillCircle(wx2 + 5, wc - 23, 2.5);
    waiterGfx2.lineStyle(2, 0x2C1810, 1);
    waiterGfx2.beginPath();
    waiterGfx2.arc(wx2, wc - 18, 5, 0, Math.PI, false);
    waiterGfx2.strokePath();
    // Arm (other side)
    waiterGfx2.fillStyle(0x1A237E, 1);
    waiterGfx2.fillRoundedRect(wx2 - 26, wc - 4, 16, 8, 3);
    waiterGfx2.fillStyle(0x7A4A1E, 1);
    waiterGfx2.fillRoundedRect(wx2 - 50, wc - 10, 34, 6, 2);
    waiterGfx2.fillStyle(0xC4874A, 0.5);
    waiterGfx2.fillRoundedRect(wx2 - 49, wc - 9, 32, 3, 1);
    const foodRight = this.add.image(wx2 - 34, wc - 16, 'food_4').setScale(0.28).setOrigin(0.5).setAlpha(0).setDepth(2);

    this.tweens.add({ targets: [waiterGfx2, foodRight], alpha: 1, duration: 380, delay: 750, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: waiterGfx2, y: { from: 0, to: -6 }, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 900 });

    // ── Stats row ─────────────────────────────────────────────────────────────
    const statsY = 424;
    const statBg = this.add.graphics().setAlpha(0);
    statBg.fillStyle(0x000000, 0.28);
    statBg.fillRoundedRect(cx - 180, statsY - 22, 360, 52, 12);
    this.tweens.add({ targets: statBg, alpha: 1, duration: 350, delay: 550 });

    const statsGrp = [
      this.add.text(cx - 86, statsY + 4, `BEST: ${fmtScore(prog.highScore)}`, {
        fontSize: '18px', fontFamily: 'Arial Black', color: COLORS.TEXT_GOLD,
      }).setOrigin(0.5).setAlpha(0),
      this.add.text(cx, statsY + 4, '|', { fontSize: '16px', color: '#CCBBAA' }).setOrigin(0.5).setAlpha(0),
      this.add.text(cx + 86, statsY + 4, `Level ${prog.level}`, {
        fontSize: '18px', fontFamily: 'Arial Black', color: COLORS.TEXT_LIGHT,
      }).setOrigin(0.5).setAlpha(0),
    ];
    this.tweens.add({ targets: statsGrp, alpha: 1, duration: 350, delay: 580 });

    if (prog.bestStars > 0) {
      let starsStr = '';
      for (let i = 0; i < prog.bestStars; i++) starsStr += '★';
      const subLine = prog.totalRounds >= 3
        ? `Best: ${starsStr}  ·  ${prog.totalRounds} rounds`
        : `Best: ${starsStr}`;
      this.add.text(cx, statsY + 28, subLine, {
        fontSize: '13px', color: COLORS.TEXT_GOLD,
      }).setOrigin(0.5).setAlpha(0.85);
    } else if (prog.totalRounds >= 3) {
      this.add.text(cx, statsY + 28, `${prog.totalRounds} rounds played`, {
        fontSize: '13px', color: '#CCBBAA',
      }).setOrigin(0.5).setAlpha(0.75);
    }

    // ── Buttons (staggered entrance) ──────────────────────────────────────────
    const btnY = 510;
    const playBtn = this.makeBtnAnimated(cx, btnY, '▶  PLAY', 'btn_orange', () => this.scene.start('GameScene'), 650, 1.12);
    this.makeBtnAnimated(cx, btnY + 72, 'SETTINGS', 'btn_green', () => this.scene.start('SettingsScene'), 730);
    this.makeBtnAnimated(cx, btnY + 144, 'CREDITS', 'btn_green', () => this.scene.start('CreditsScene'), 800);
    void playBtn;

    // ── Bottom food row ───────────────────────────────────────────────────────
    [0, 1, 2, 3, 4].forEach((itemId, i) => {
      const ex = 52 + i * 92;
      const ey = 726 + (i % 2 === 0 ? 0 : 14);
      const fe = this.add.image(ex, ey, `food_${itemId}`).setScale(0.55).setOrigin(0.5).setAlpha(0.5);
      this.tweens.add({ targets: fe, y: ey - 8, duration: 1200 + i * 150, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });

    // Ambient rising particles — small geometric sparkles give menu breathing life
    const spawnMenuParticle = () => {
      const px = Phaser.Math.Between(30, GAME_WIDTH - 30);
      const py = GAME_HEIGHT - 40;
      const size = Phaser.Math.Between(3, 7);
      const p = this.add.graphics().setDepth(2);
      const type = Phaser.Math.Between(0, 2);
      if (type === 0) {
        // Diamond
        p.fillStyle(0xFFD700, 0.7);
        p.fillTriangle(0, -size, size, 0, 0, size);
        p.fillTriangle(0, -size, -size, 0, 0, size);
      } else if (type === 1) {
        // Circle
        p.fillStyle(0xFFCC44, 0.6);
        p.fillCircle(0, 0, size * 0.6);
      } else {
        // Cross
        p.fillStyle(0xFFEE88, 0.65);
        p.fillRect(-size * 0.2, -size, size * 0.4, size * 2);
        p.fillRect(-size, -size * 0.2, size * 2, size * 0.4);
      }
      p.setPosition(px, py).setAlpha(0);
      this.tweens.add({
        targets: p, y: py - Phaser.Math.Between(160, 300), alpha: { from: 0.7, to: 0 },
        duration: Phaser.Math.Between(2000, 3500), ease: 'Quad.easeOut',
        onComplete: () => p.destroy(),
      });
    };
    this.time.addEvent({ delay: 600, loop: true, callback: spawnMenuParticle });

    // Version watermark
    this.add.text(cx, GAME_HEIGHT - 10, 'v1.0.0', {
      fontSize: '11px', fontFamily: 'Arial', color: '#C8A060', letterSpacing: 2,
    }).setOrigin(0.5).setAlpha(0.6);
  }

  private makeBtnAnimated(
    x: number, y: number, label: string, tex: string,
    cb: () => void, delay = 0, scale = 1.0,
  ) {
    const btn = this.add.image(x, y, tex).setScale(scale).setAlpha(0).setInteractive({ useHandCursor: true });
    const txt = this.add.text(x, y, label, {
      fontSize: '22px', fontFamily: 'Arial Black', color: '#FFFFFF', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(1).setAlpha(0);

    this.tweens.add({ targets: [btn, txt], alpha: 1, y: y - 6, duration: 320, delay, ease: 'Back.easeOut' });

    btn.on('pointerdown', () => { SoundManager.uiClick(); cb(); });
    btn.on('pointerover', () => { btn.setAlpha(0.88); btn.setScale(scale * 1.04); });
    btn.on('pointerout', () => { btn.setAlpha(1); btn.setScale(scale); });
    return btn;
  }
}
