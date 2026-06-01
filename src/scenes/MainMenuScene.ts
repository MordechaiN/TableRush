import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

export class MainMenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MainMenuScene' }); }

  create() {
    const cx = GAME_WIDTH / 2;

    // Background
    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BG_DARK);

    // Decorative top strip
    this.add.rectangle(cx, 0, GAME_WIDTH, 4, COLORS.ACCENT).setOrigin(0.5, 0);

    // Logo area
    const logoY = 160;
    this.add.text(cx, logoY, 'TABLE', {
      fontSize: '72px',
      fontFamily: 'Arial Black, Arial',
      color: COLORS.TEXT_LIGHT,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, logoY + 72, 'RUSH', {
      fontSize: '72px',
      fontFamily: 'Arial Black, Arial',
      color: COLORS.TEXT_ACCENT,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, logoY + 138, 'Fast-Paced Restaurant Service', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: COLORS.TEXT_DIM,
    }).setOrigin(0.5);

    // Animated decoration
    const dec1 = this.add.text(cx - 140, logoY + 80, '🍔', { fontSize: '32px' }).setOrigin(0.5);
    const dec2 = this.add.text(cx + 140, logoY + 80, '🍕', { fontSize: '32px' }).setOrigin(0.5);
    this.tweens.add({ targets: dec1, y: logoY + 70, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: dec2, y: logoY + 90, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Buttons
    const btnY = 440;
    const btnSpacing = 80;

    this.makeButton(cx, btnY, 'PLAY', COLORS.ACCENT, () => this.scene.start('GameScene'));
    this.makeButton(cx, btnY + btnSpacing, 'SETTINGS', COLORS.DARK_GRAY, () => this.scene.start('SettingsScene'));
    this.makeButton(cx, btnY + btnSpacing * 2, 'CREDITS', COLORS.DARK_GRAY, () => this.scene.start('CreditsScene'));

    // High score display
    const hs = localStorage.getItem('tablerush_highscore') ?? '0';
    this.add.text(cx, btnY + btnSpacing * 3 + 30, `Best Score: ${hs}`, {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: COLORS.TEXT_GOLD,
    }).setOrigin(0.5);

    // Version
    this.add.text(cx, GAME_HEIGHT - 20, 'v0.1.0', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: COLORS.TEXT_DIM,
    }).setOrigin(0.5);

    // Pulse animation on PLAY button hint
    const hint = this.add.text(cx, btnY - 40, '▼ Tap to Begin ▼', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: COLORS.TEXT_DIM,
    }).setOrigin(0.5);
    this.tweens.add({ targets: hint, alpha: 0.2, duration: 900, yoyo: true, repeat: -1 });
  }

  private makeButton(x: number, y: number, label: string, color: number, cb: () => void) {
    const btn = this.add.graphics();
    btn.fillStyle(color);
    btn.fillRoundedRect(x - 140, y - 26, 280, 52, 12);

    const txt = this.add.text(x, y, label, {
      fontSize: '24px',
      fontFamily: 'Arial Black, Arial',
      color: COLORS.TEXT_LIGHT,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, 280, 52).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => { btn.clear(); btn.fillStyle(color, 0.7); btn.fillRoundedRect(x - 140, y - 26, 280, 52, 12); txt.setScale(1.05); });
    zone.on('pointerout', () => { btn.clear(); btn.fillStyle(color); btn.fillRoundedRect(x - 140, y - 26, 280, 52, 12); txt.setScale(1); });
    zone.on('pointerdown', cb);
  }
}
