import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';
import { ProgressionSystem } from '../systems/ProgressionSystem';

export class SettingsScene extends Phaser.Scene {
  private sfxOn = true;
  private musicOn = true;

  constructor() { super({ key: 'SettingsScene' }); }

  create() {
    const cx = GAME_WIDTH / 2;

    this.sfxOn = localStorage.getItem('tablerush_sfx') !== 'off';
    this.musicOn = localStorage.getItem('tablerush_music') !== 'off';

    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.FLOOR_WARM);
    this.add.rectangle(cx, 2, GAME_WIDTH, 4, COLORS.UI_ORANGE).setOrigin(0.5, 0);

    this.add.text(cx, 80, '⚙️ SETTINGS', {
      fontSize: '36px', fontFamily: 'Arial Black', color: COLORS.TEXT_DARK, fontStyle: 'bold',
    }).setOrigin(0.5);

    this.renderToggle(cx, 260, 'Sound Effects', this.sfxOn, (val) => {
      this.sfxOn = val;
      localStorage.setItem('tablerush_sfx', val ? 'on' : 'off');
    });

    this.renderToggle(cx, 360, 'Music', this.musicOn, (val) => {
      this.musicOn = val;
      localStorage.setItem('tablerush_music', val ? 'on' : 'off');
    });

    const resetTxt = this.add.text(cx, 480, '🗑️  Reset Progress', {
      fontSize: '18px', fontFamily: 'Arial', color: COLORS.TEXT_RED,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    resetTxt.on('pointerdown', () => {
      ProgressionSystem.resetHighScore();
      this.showToast('Progress reset!');
    });

    this.makeBtn(cx, GAME_HEIGHT - 50, '← BACK', () => this.scene.start('MainMenuScene'));
  }

  private renderToggle(x: number, y: number, label: string, value: boolean, onChange: (v: boolean) => void) {
    this.add.text(x - 60, y, label, {
      fontSize: '22px', fontFamily: 'Arial', color: COLORS.TEXT_DARK,
    }).setOrigin(1, 0.5);

    const bg = this.add.graphics();
    const knob = this.add.circle(0, 0, 14, 0xffffff);
    this.drawToggle(bg, knob, x + 80, y, value);

    const zone = this.add.zone(x + 80, y, 70, 36).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', () => {
      value = !value;
      onChange(value);
      this.drawToggle(bg, knob, x + 80, y, value);
    });
  }

  private drawToggle(bg: Phaser.GameObjects.Graphics, knob: Phaser.GameObjects.Arc, x: number, y: number, on: boolean) {
    bg.clear();
    bg.fillStyle(on ? COLORS.UI_GREEN : 0xAAAAAA);
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
    zone.on('pointerdown', cb);
  }
}
