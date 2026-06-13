import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, fmtScore } from '../config/GameConfig';
import { ProgressionSystem } from '../systems/ProgressionSystem';
import { SoundManager } from '../systems/SoundManager';

export class SettingsScene extends Phaser.Scene {
  private sfxOn = true;
  private musicOn = true;

  constructor() { super({ key: 'SettingsScene' }); }

  create() {
    const cx = GAME_WIDTH / 2;

    this.sfxOn = localStorage.getItem('tablerush_sfx') !== 'off';
    this.musicOn = localStorage.getItem('tablerush_music') !== 'off';

    // Background — dark walnut hardwood planks
    const PLANK_H = 34;
    const plankCols = [0x2E1E0F, 0x251508, 0x2B1B0D, 0x221307, 0x301F10];
    const floorGfx = this.add.graphics();
    const rowCount = Math.ceil(GAME_HEIGHT / PLANK_H) + 1;
    for (let row = 0; row < rowCount; row++) {
      floorGfx.fillStyle(plankCols[row % plankCols.length], 1);
      floorGfx.fillRect(0, row * PLANK_H, GAME_WIDTH, PLANK_H);
    }
    floorGfx.fillStyle(0x000000, 0.25);
    for (let row = 1; row < rowCount; row++) {
      floorGfx.fillRect(0, row * PLANK_H - 1, GAME_WIDTH, 1);
    }
    floorGfx.fillStyle(0xFF9944, 0.04);
    for (let row = 0; row < rowCount; row++) {
      floorGfx.fillRect(0, row * PLANK_H, GAME_WIDTH, 2);
    }

    // Top accent stripe
    this.add.rectangle(cx, 2, GAME_WIDTH, 4, COLORS.UI_ORANGE).setOrigin(0.5, 0);

    // Side walls — terracotta upper / cream wainscoting lower
    const wallW = 16;
    const wallH = GAME_HEIGHT - 90;
    const lW = this.add.graphics();
    lW.fillStyle(0xBF7A42, 1);
    lW.fillRect(0, 90, wallW, Math.floor(wallH * 0.58));
    lW.fillStyle(0xEEE3D2, 1);
    lW.fillRect(0, 90 + Math.floor(wallH * 0.58), wallW, Math.floor(wallH * 0.4));
    lW.fillStyle(0x5A2E12, 1);
    lW.fillRect(0, 90 + Math.floor(wallH * 0.57), wallW, 4);
    lW.fillStyle(0x251007, 1);
    lW.fillRect(0, GAME_HEIGHT - 14, wallW, 14);
    const rW = this.add.graphics();
    rW.fillStyle(0xBF7A42, 1);
    rW.fillRect(GAME_WIDTH - wallW, 90, wallW, Math.floor(wallH * 0.58));
    rW.fillStyle(0xEEE3D2, 1);
    rW.fillRect(GAME_WIDTH - wallW, 90 + Math.floor(wallH * 0.58), wallW, Math.floor(wallH * 0.4));
    rW.fillStyle(0x5A2E12, 1);
    rW.fillRect(GAME_WIDTH - wallW, 90 + Math.floor(wallH * 0.57), wallW, 4);
    rW.fillStyle(0x251007, 1);
    rW.fillRect(GAME_WIDTH - wallW, GAME_HEIGHT - 14, wallW, 14);

    // Top wall bar
    this.add.rectangle(cx, 45, GAME_WIDTH, 90, COLORS.WALL_ACCENT);

    // Header
    this.add.text(cx, 56, 'SETTINGS', {
      fontSize: '32px', fontFamily: 'Arial Black', color: COLORS.TEXT_LIGHT, fontStyle: 'bold',
    }).setOrigin(0.5);

    // Settings card panel
    const panelG = this.add.graphics();
    panelG.fillStyle(0xFFFCF5, 1);
    panelG.fillRoundedRect(cx - 190, 115, 380, 500, 16);
    panelG.lineStyle(2, 0xDDCCAA, 0.8);
    panelG.strokeRoundedRect(cx - 190, 115, 380, 500, 16);

    // ── AUDIO section ──────────────────────────────────────────────────────
    this.add.text(cx, 148, 'AUDIO', {
      fontSize: '11px', fontFamily: 'Arial Black', color: '#BBAA88', letterSpacing: 3,
    }).setOrigin(0.5);

    this.renderToggle(cx, 210, 'Sound Effects', this.sfxOn, (val) => {
      this.sfxOn = val;
      localStorage.setItem('tablerush_sfx', val ? 'on' : 'off');
    });

    this.renderToggle(cx, 290, 'Music', this.musicOn, (val) => {
      this.musicOn = val;
      localStorage.setItem('tablerush_music', val ? 'on' : 'off');
      if (!val) SoundManager.stopMusic();
    });

    // Divider
    const div = this.add.graphics();
    div.lineStyle(1, 0xEEDDBB, 1);
    div.lineBetween(cx - 160, 368, cx + 160, 368);

    // ── PROGRESS section ────────────────────────────────────────────────────
    this.add.text(cx, 386, 'PROGRESS', {
      fontSize: '11px', fontFamily: 'Arial Black', color: '#BBAA88', letterSpacing: 3,
    }).setOrigin(0.5);

    const prog = ProgressionSystem.getData();
    this.add.text(cx, 416, `Level ${prog.level}  ·  High Score: ${fmtScore(prog.highScore)}`, {
      fontSize: '16px', fontFamily: 'Arial Black', color: COLORS.TEXT_DARK,
    }).setOrigin(0.5);

    const resetTxt = this.add.text(cx, 462, 'Reset High Score', {
      fontSize: '18px', fontFamily: 'Arial', color: COLORS.TEXT_RED,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    resetTxt.on('pointerover', () => resetTxt.setAlpha(0.7));
    resetTxt.on('pointerout', () => resetTxt.setAlpha(1));
    resetTxt.on('pointerdown', () => {
      SoundManager.uiClick();
      ProgressionSystem.resetHighScore();
      this.showToast('High score cleared!');
    });

    // Version info at bottom of card
    this.add.text(cx, 584, 'TableRush v1.0.0', {
      fontSize: '13px', fontFamily: 'Arial', color: '#CCBBAA',
    }).setOrigin(0.5);

    this.makeBtn(cx, GAME_HEIGHT - 44, '← BACK', () => {
      this.scene.stop();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).TableRushUI?.show();
    });
  }

  private renderToggle(x: number, y: number, label: string, value: boolean, onChange: (v: boolean) => void) {
    this.add.text(x - 60, y, label, {
      fontSize: '20px', fontFamily: 'Arial', color: COLORS.TEXT_DARK,
    }).setOrigin(1, 0.5);

    const bg = this.add.graphics();
    const knob = this.add.circle(0, 0, 14, 0xffffff);
    this.drawToggle(bg, knob, x + 80, y, value);

    const zone = this.add.zone(x + 80, y, 70, 36).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', () => {
      value = !value;
      onChange(value);
      this.drawToggle(bg, knob, x + 80, y, value);
      SoundManager.uiClick();
    });
  }

  private drawToggle(bg: Phaser.GameObjects.Graphics, knob: Phaser.GameObjects.Arc, x: number, y: number, on: boolean) {
    bg.clear();
    bg.fillStyle(on ? COLORS.UI_GREEN : 0xCCCCCC);
    bg.fillRoundedRect(x - 32, y - 16, 64, 32, 16);
    knob.setPosition(on ? x + 16 : x - 16, y);
  }

  private showToast(msg: string) {
    const t = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, msg, {
      fontSize: '20px', fontFamily: 'Arial Black', color: '#FFFFFF',
      backgroundColor: '#333333', padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setDepth(100);
    this.tweens.add({ targets: t, alpha: 0, delay: 1200, duration: 500, onComplete: () => t.destroy() });
  }

  private makeBtn(x: number, y: number, label: string, cb: () => void) {
    const g = this.add.graphics();
    g.fillStyle(COLORS.UI_ORANGE);
    g.fillRoundedRect(x - 120, y - 22, 240, 44, 10);
    this.add.text(x, y, label, {
      fontSize: '20px', fontFamily: 'Arial Black', color: '#FFFFFF',
    }).setOrigin(0.5);
    const zone = this.add.zone(x, y, 240, 44).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', () => { SoundManager.uiClick(); cb(); });
  }
}
