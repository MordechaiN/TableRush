import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

export class GameOverScene extends Phaser.Scene {
  constructor() { super({ key: 'GameOverScene' }); }

  create(data: { score: number; highScore: number }) {
    const cx = GAME_WIDTH / 2;
    const isNew = data.score === data.highScore && data.score > 0;

    // Background
    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BG_DARK);
    this.add.rectangle(cx, 0, GAME_WIDTH, 4, COLORS.ACCENT).setOrigin(0.5, 0);

    this.add.text(cx, 160, isNew ? '🏆 NEW RECORD!' : 'TIME\'S UP!', {
      fontSize: '40px', fontFamily: 'Arial Black', color: isNew ? COLORS.TEXT_GOLD : COLORS.TEXT_ACCENT, fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, 240, 'YOUR SCORE', {
      fontSize: '20px', fontFamily: 'Arial', color: COLORS.TEXT_DIM,
    }).setOrigin(0.5);

    const scoreTxt = this.add.text(cx, 310, String(data.score), {
      fontSize: '72px', fontFamily: 'Arial Black', color: COLORS.TEXT_LIGHT, fontStyle: 'bold',
    }).setOrigin(0.5);

    // Animate score counting up
    const dur = Math.min(data.score * 5, 1500);
    this.tweens.addCounter({
      from: 0, to: data.score, duration: dur,
      onUpdate: (tween) => scoreTxt.setText(String(Math.floor(tween.getValue() as number))),
    });

    this.add.text(cx, 400, `BEST: ${data.highScore}`, {
      fontSize: '22px', fontFamily: 'Arial', color: COLORS.TEXT_GOLD,
    }).setOrigin(0.5);

    this.makeBtn(cx, 510, 'PLAY AGAIN', COLORS.ACCENT, () => this.scene.start('GameScene'));
    this.makeBtn(cx, 590, 'MAIN MENU', COLORS.DARK_GRAY, () => this.scene.start('MainMenuScene'));

    if (isNew) {
      this.spawnConfetti();
    }
  }

  private makeBtn(x: number, y: number, label: string, color: number, cb: () => void) {
    const g = this.add.graphics();
    g.fillStyle(color);
    g.fillRoundedRect(x - 140, y - 26, 280, 52, 12);
    this.add.text(x, y, label, {
      fontSize: '24px', fontFamily: 'Arial Black', color: COLORS.TEXT_LIGHT, fontStyle: 'bold',
    }).setOrigin(0.5);
    const zone = this.add.zone(x, y, 280, 52).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', cb);
  }

  private spawnConfetti() {
    const colors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf1c40f, 0x9b59b6];
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const c = this.add.rectangle(x, -10, 8, 8, colors[i % colors.length]);
      this.tweens.add({
        targets: c,
        y: GAME_HEIGHT + 20,
        x: x + Phaser.Math.Between(-80, 80),
        angle: Phaser.Math.Between(0, 360),
        duration: Phaser.Math.Between(1500, 3000),
        delay: Phaser.Math.Between(0, 1000),
        ease: 'Linear',
        repeat: -1,
      });
    }
  }
}
