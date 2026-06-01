import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

export class SettingsScene extends Phaser.Scene {
  private sfxOn = true;
  private musicOn = true;

  constructor() { super({ key: 'SettingsScene' }); }

  create() {
    const cx = GAME_WIDTH / 2;

    this.sfxOn = localStorage.getItem('tablerush_sfx') !== 'off';
    this.musicOn = localStorage.getItem('tablerush_music') !== 'off';

    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BG_DARK);
    this.add.rectangle(cx, 0, GAME_WIDTH, 4, COLORS.ACCENT).setOrigin(0.5, 0);

    this.add.text(cx, 80, 'SETTINGS', {
      fontSize: '42px', fontFamily: 'Arial Black', color: COLORS.TEXT_ACCENT, fontStyle: 'bold',
    }).setOrigin(0.5);

    this.renderToggle(cx, 260, 'Sound Effects', this.sfxOn, (val) => {
      this.sfxOn = val;
      localStorage.setItem('tablerush_sfx', val ? 'on' : 'off');
    });

    this.renderToggle(cx, 360, 'Music', this.musicOn, (val) => {
      this.musicOn = val;
      localStorage.setItem('tablerush_music', val ? 'on' : 'off');
    });

    this.add.text(cx, 480, 'Reset High Score', {
      fontSize: '18px', fontFamily: 'Arial', color: COLORS.TEXT_DIM,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        localStorage.removeItem('tablerush_highscore');
        this.showToast('High score reset!');
      });

    this.makeBtn(cx, GAME_HEIGHT - 40, '← BACK', COLORS.DARK_GRAY, () => this.scene.start('MainMenuScene'));
  }

  private renderToggle(x: number, y: number, label: string, value: boolean, onChange: (v: boolean) => void) {
    this.add.text(x - 60, y, label, {
      fontSize: '22px', fontFamily: 'Arial', color: COLORS.TEXT_LIGHT,
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
    bg.fillStyle(on ? COLORS.GREEN : COLORS.GRAY);
    bg.fillRoundedRect(x - 32, y - 16, 64, 32, 16);
    knob.setPosition(on ? x + 16 : x - 16, y);
  }

  private showToast(msg: string) {
    const t = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, msg, {
      fontSize: '20px', fontFamily: 'Arial Black', color: COLORS.TEXT_LIGHT,
      backgroundColor: '#2c3e50', padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setDepth(100);
    this.tweens.add({ targets: t, alpha: 0, delay: 1200, duration: 500, onComplete: () => t.destroy() });
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
