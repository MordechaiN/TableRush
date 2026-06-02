import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';
import { ProgressionSystem, RoundResult } from '../systems/ProgressionSystem';

interface GameOverData {
  score: number;
  stars: number;
  customersHappy: number;
  customersAngry: number;
  comboRecord: number;
}

export class GameOverScene extends Phaser.Scene {
  constructor() { super({ key: 'GameOverScene' }); }

  create(data: GameOverData) {
    const cx = GAME_WIDTH / 2;

    // Process progression
    const result: RoundResult = {
      score: data.score,
      stars: data.stars,
      customersHappy: data.customersHappy,
      customersAngry: data.customersAngry,
      comboRecord: data.comboRecord,
    };
    const summary = ProgressionSystem.addRound(result);
    const prog = ProgressionSystem.getData();

    // Warm background
    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.FLOOR_WARM);
    this.add.rectangle(cx, 2, GAME_WIDTH, 4, COLORS.UI_ORANGE).setOrigin(0.5, 0);

    // Panel
    this.add.image(cx, GAME_HEIGHT / 2, 'panel');

    let y = 120;

    // Header
    const headerText = summary.isNewHighScore ? '🏆 NEW RECORD!' : 'ROUND COMPLETE!';
    const headerColor = summary.isNewHighScore ? COLORS.TEXT_GOLD : COLORS.TEXT_DARK;
    this.add.text(cx, y, headerText, {
      fontSize: '28px', fontFamily: 'Arial Black', color: headerColor,
    }).setOrigin(0.5);
    y += 50;

    // Stars
    this.showStars(cx, y, data.stars);
    y += 60;

    // Score
    this.add.text(cx, y, 'SCORE', {
      fontSize: '14px', fontFamily: 'Arial', color: '#888888', fontStyle: 'bold',
    }).setOrigin(0.5);
    y += 22;

    const scoreTxt = this.add.text(cx, y, '0', {
      fontSize: '56px', fontFamily: 'Arial Black', color: COLORS.TEXT_DARK, fontStyle: 'bold',
    }).setOrigin(0.5);
    y += 60;

    // Animate score count-up
    this.tweens.addCounter({
      from: 0, to: data.score,
      duration: Math.min(data.score * 4, 1500),
      onUpdate: (tween) => scoreTxt.setText(String(Math.floor(tween.getValue() as number))),
    });

    // High score
    this.add.text(cx, y, `Best: ${prog.highScore}`, {
      fontSize: '15px', fontFamily: 'Arial', color: COLORS.TEXT_GOLD,
    }).setOrigin(0.5);
    y += 30;

    // Stats row
    const statsY = y;
    this.add.text(cx - 80, statsY, `${data.customersHappy} happy`, {
      fontSize: '14px', color: COLORS.TEXT_GREEN,
    }).setOrigin(0.5);
    this.add.text(cx, statsY, `|`, { fontSize: '14px', color: '#AAAAAA' }).setOrigin(0.5);
    this.add.text(cx + 80, statsY, `${data.customersAngry} upset`, {
      fontSize: '14px', color: COLORS.TEXT_RED,
    }).setOrigin(0.5);
    y += 28;

    if (data.comboRecord >= 3) {
      this.add.text(cx, y, `🔥 Best combo: ${data.comboRecord} in a row`, {
        fontSize: '14px', color: COLORS.TEXT_ORANGE,
      }).setOrigin(0.5);
      y += 28;
    }

    // XP bar
    y += 8;
    this.add.text(cx, y, `Level ${summary.levelBefore}`, {
      fontSize: '13px', color: '#777777',
    }).setOrigin(0.5);
    y += 18;

    const xpBarW = 240;
    const xpStart = summary.thresholdForLevel(summary.levelBefore - 1) ?? 0;
    const xpEnd = summary.thresholdForLevel(summary.levelBefore);
    const xpRange = xpEnd - xpStart;
    const xpFracBefore = xpRange > 0 ? Math.min(1, (summary.xpBefore - xpStart) / xpRange) : 1;
    const xpFracAfter  = xpRange > 0 ? Math.min(1, (summary.xpAfter  - xpStart) / xpRange) : 1;

    const barTrack = this.add.graphics();
    barTrack.fillStyle(0xDDCCAA);
    barTrack.fillRoundedRect(cx - xpBarW / 2, y, xpBarW, 14, 7);

    const barFill = this.add.graphics();
    barFill.fillStyle(COLORS.UI_ORANGE);
    barFill.fillRoundedRect(cx - xpBarW / 2, y, xpBarW * xpFracBefore, 14, 7);

    // Animate bar fill to after
    this.tweens.add({
      targets: { v: xpFracBefore }, v: xpFracAfter,
      duration: 800, delay: 600, ease: 'Quad.easeOut',
      onUpdate: (tween) => {
        const v = tween.getValue() as number;
        barFill.clear();
        barFill.fillStyle(COLORS.UI_ORANGE);
        barFill.fillRoundedRect(cx - xpBarW / 2, y, xpBarW * v, 14, 7);
      },
    });
    y += 18;

    const xpLabel = summary.xpEarned > 0 ? `+${summary.xpEarned} XP` : '';
    if (xpLabel) {
      const xpTxt = this.add.text(cx, y, xpLabel, {
        fontSize: '13px', color: COLORS.TEXT_ORANGE,
      }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: xpTxt, alpha: 1, duration: 400, delay: 700 });
    }

    if (summary.levelAfter > summary.levelBefore) {
      y += 22;
      const lvlTxt = this.add.text(cx, y, `🎉 LEVEL UP → ${summary.levelAfter}!`, {
        fontSize: '18px', fontFamily: 'Arial Black', color: COLORS.TEXT_GOLD,
      }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: lvlTxt, alpha: 1, scaleX: 1.2, scaleY: 1.2, duration: 400, delay: 1200, yoyo: true, repeat: 2 });
    }

    y += 30;
    this.add.text(cx, y, summary.nextUnlockHint, {
      fontSize: '12px', color: '#888888', wordWrap: { width: 300 }, align: 'center',
    }).setOrigin(0.5);

    // Buttons
    const btnY = GAME_HEIGHT - 160;
    this.makeBtn(cx, btnY, 'PLAY AGAIN', 'btn_orange', () => this.scene.start('GameScene'));
    this.makeBtn(cx, btnY + 64, 'MAIN MENU', 'btn_green', () => this.scene.start('MainMenuScene'));

    if (summary.isNewHighScore) {
      this.spawnConfetti();
    }
  }

  private showStars(cx: number, y: number, count: number) {
    for (let i = 0; i < 3; i++) {
      const tex = i < count ? 'star_full' : 'star_empty';
      const star = this.add.image(cx + (i - 1) * 52, y + 16, tex).setScale(0.9).setAlpha(0);
      const delay = 400 + i * 200;
      this.tweens.add({
        targets: star, alpha: 1, scaleX: 1.1, scaleY: 1.1,
        duration: 300, delay,
        onComplete: () => {
          this.tweens.add({ targets: star, scaleX: 0.9, scaleY: 0.9, duration: 150 });
        },
      });
    }
  }

  private makeBtn(x: number, y: number, label: string, tex: string, cb: () => void) {
    const btn = this.add.image(x, y, tex).setInteractive({ useHandCursor: true });
    btn.on('pointerdown', cb);
    btn.on('pointerover', () => btn.setAlpha(0.85));
    btn.on('pointerout', () => btn.setAlpha(1));
    this.add.text(x, y, label, {
      fontSize: '22px', fontFamily: 'Arial Black', color: '#FFFFFF', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(1);
  }

  private spawnConfetti() {
    const colors = [0xFF6B35, 0xFFD700, 0x4CAF50, 0x2196F3, 0xF44336];
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const c = this.add.rectangle(x, -10, 8, 8, colors[i % colors.length]).setDepth(40);
      this.tweens.add({
        targets: c,
        y: GAME_HEIGHT + 20, x: x + Phaser.Math.Between(-80, 80),
        angle: Phaser.Math.Between(0, 360),
        duration: Phaser.Math.Between(1500, 3000),
        delay: Phaser.Math.Between(0, 800),
        ease: 'Linear', repeat: -1,
      });
    }
  }
}
