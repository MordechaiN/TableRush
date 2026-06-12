import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';
import { SoundManager } from '../systems/SoundManager';

export class PauseScene extends Phaser.Scene {
  constructor() { super({ key: 'PauseScene' }); }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Darkened overlay
    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.65);

    // Panel
    const panel = this.add.graphics();
    panel.fillStyle(0xFFF8F0);
    panel.fillRoundedRect(cx - 170, cy - 200, 340, 400, 18);
    panel.lineStyle(2, COLORS.UI_ORANGE, 0.7);
    panel.strokeRoundedRect(cx - 170, cy - 200, 340, 400, 18);

    // Header
    this.add.text(cx, cy - 152, 'PAUSED', {
      fontSize: '32px', fontFamily: 'Arial Black', color: COLORS.TEXT_DARK, fontStyle: 'bold',
    }).setOrigin(0.5);

    // Action buttons
    this.makeBtn(cx, cy - 76, 'RESUME', COLORS.UI_GREEN, () => {
      this.scene.resume('GameScene');
      this.scene.stop();
      SoundManager.startMusic();
    });

    this.makeBtn(cx, cy - 4, 'RESTART', COLORS.UI_ORANGE, () => {
      this.scene.stop('GameScene');
      this.scene.stop();
      this.scene.start('GameScene');
    });

    this.makeBtn(cx, cy + 68, 'MAIN MENU', 0x5A3A1E, () => {
      this.scene.stop('GameScene');
      this.scene.stop();
      this.scene.start('MainMenuScene');
    });

    // Divider
    const divGfx = this.add.graphics();
    divGfx.lineStyle(1, 0xDDCCAA, 0.8);
    divGfx.lineBetween(cx - 130, cy + 118, cx + 130, cy + 118);

    // ── Audio quick-toggles ──────────────────────────────────────────────────
    this.add.text(cx, cy + 134, 'AUDIO', {
      fontSize: '10px', fontFamily: 'Arial Black', color: '#AAAAAA', letterSpacing: 3,
    }).setOrigin(0.5);

    let sfxOn = localStorage.getItem('tablerush_sfx') !== 'off';
    let musicOn = localStorage.getItem('tablerush_music') !== 'off';

    // SFX toggle
    const sfxLabel = this.add.text(cx - 10, cy + 160, 'SFX', {
      fontSize: '14px', fontFamily: 'Arial Black', color: COLORS.TEXT_DARK,
    }).setOrigin(1, 0.5);

    const sfxBg = this.add.graphics();
    const sfxKnob = this.add.circle(0, 0, 11, 0xFFFFFF);
    const drawSFX = () => {
      sfxBg.clear();
      sfxBg.fillStyle(sfxOn ? COLORS.UI_GREEN : 0xCCCCCC);
      sfxBg.fillRoundedRect(cx + 2, cy + 148, 52, 24, 12);
      sfxKnob.setPosition(sfxOn ? cx + 42 : cx + 14, cy + 160);
    };
    drawSFX();
    const sfxZone = this.add.zone(cx + 28, cy + 160, 56, 28).setInteractive({ useHandCursor: true });
    sfxZone.on('pointerdown', () => {
      sfxOn = !sfxOn;
      localStorage.setItem('tablerush_sfx', sfxOn ? 'on' : 'off');
      drawSFX();
      if (sfxOn) SoundManager.uiClick();
    });

    // Music toggle
    this.add.text(cx - 10, cy + 192, 'MUSIC', {
      fontSize: '14px', fontFamily: 'Arial Black', color: COLORS.TEXT_DARK,
    }).setOrigin(1, 0.5);

    const musicBg = this.add.graphics();
    const musicKnob = this.add.circle(0, 0, 11, 0xFFFFFF);
    const drawMusic = () => {
      musicBg.clear();
      musicBg.fillStyle(musicOn ? COLORS.UI_GREEN : 0xCCCCCC);
      musicBg.fillRoundedRect(cx + 2, cy + 180, 52, 24, 12);
      musicKnob.setPosition(musicOn ? cx + 42 : cx + 14, cy + 192);
    };
    drawMusic();
    const musicZone = this.add.zone(cx + 28, cy + 192, 56, 28).setInteractive({ useHandCursor: true });
    musicZone.on('pointerdown', () => {
      musicOn = !musicOn;
      localStorage.setItem('tablerush_music', musicOn ? 'on' : 'off');
      drawMusic();
      if (!musicOn) SoundManager.stopMusic();
      else SoundManager.startMusic();
    });

    // ESC to resume
    this.input.keyboard?.addKey('ESC').on('down', () => {
      this.scene.resume('GameScene');
      this.scene.stop();
      SoundManager.startMusic();
    });
  }

  private makeBtn(x: number, y: number, label: string, color: number, cb: () => void) {
    const g = this.add.graphics();
    g.fillStyle(color);
    g.fillRoundedRect(x - 130, y - 24, 260, 48, 12);
    // Sheen
    g.fillStyle(0xFFFFFF, 0.15);
    g.fillRoundedRect(x - 126, y - 22, 252, 16, 10);
    const txt = this.add.text(x, y, label, {
      fontSize: '22px', fontFamily: 'Arial Black', color: '#FFFFFF',
    }).setOrigin(0.5);
    const zone = this.add.zone(x, y, 260, 48).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', () => { SoundManager.uiClick(); cb(); });
    zone.on('pointerover', () => { g.setAlpha(0.85); txt.setScale(1.04); });
    zone.on('pointerout',  () => { g.setAlpha(1.0);  txt.setScale(1.0); });
  }
}
