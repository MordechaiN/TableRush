import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, COMBO_MILESTONES } from '../config/GameConfig';
import { ProgressionSystem, RoundResult } from '../systems/ProgressionSystem';
import { SoundManager } from '../systems/SoundManager';

interface GameOverData {
  score: number;
  stars: number;
  customersHappy: number;
  customersAngry: number;
  comboRecord: number;
  fastestDeliveryMs: number;
  nearMissSaves: number;
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

    // ── Background (tile floor + walls, consistent visual language) ──────────
    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.FLOOR_WARM);
    for (let row = 0; row < 14; row++) {
      for (let col = 0; col < 7; col++) {
        if ((row + col) % 2 === 0) {
          this.add.rectangle(col * 70 + 35, row * 70 + 35, 69, 69, COLORS.FLOOR_ALT, 0.45);
        }
      }
    }

    // Side walls
    const wallW = 16;
    const walls = this.add.graphics();
    walls.fillStyle(0xC8854A);
    walls.fillRect(0, 0, wallW, GAME_HEIGHT);
    walls.fillRect(GAME_WIDTH - wallW, 0, wallW, GAME_HEIGHT);
    walls.fillStyle(0x9A5C28);
    walls.fillRect(0, Math.floor(GAME_HEIGHT * 0.58), wallW, Math.floor(GAME_HEIGHT * 0.4));
    walls.fillRect(GAME_WIDTH - wallW, Math.floor(GAME_HEIGHT * 0.58), wallW, Math.floor(GAME_HEIGHT * 0.4));

    // Amber top accent
    this.add.rectangle(cx, 2, GAME_WIDTH, 5, COLORS.UI_ORANGE).setOrigin(0.5, 0);

    // Panel (fade in on entrance)
    const panel = this.add.image(cx, GAME_HEIGHT / 2, 'panel').setAlpha(0);
    this.tweens.add({ targets: panel, alpha: 1, duration: 350, ease: 'Quad.easeOut' });

    let y = 120;

    // ── Header — cinematic entrance ───────────────────────────────────────────
    const isRecord = summary.isNewHighScore;
    const headerText = isRecord ? '🏆 NEW RECORD!' : 'ROUND COMPLETE!';
    const headerColor = isRecord ? COLORS.TEXT_GOLD : COLORS.TEXT_DARK;
    const headerSize = isRecord ? '32px' : '28px';
    const hdr = this.add.text(cx, y, headerText, {
      fontSize: headerSize, fontFamily: 'Arial Black', color: headerColor,
    }).setOrigin(0.5).setAlpha(0).setScale(0.7);
    this.tweens.add({
      targets: hdr, alpha: 1, scaleX: 1, scaleY: 1,
      duration: 380, ease: 'Back.easeOut',
    });
    if (isRecord) {
      // Gold shimmer loop on the header
      this.tweens.add({ targets: hdr, alpha: { from: 1, to: 0.7 }, duration: 700, yoyo: true, repeat: -1, delay: 500 });
    }
    y += isRecord ? 54 : 50;

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

    // Shift Report
    const lineGfx = this.add.graphics();
    lineGfx.lineStyle(1, 0xDDCCAA, 0.8);
    lineGfx.lineBetween(cx - 110, y, cx + 110, y);
    y += 14;
    this.add.text(cx, y, 'SHIFT REPORT', {
      fontSize: '11px', fontFamily: 'Arial', color: '#AAAAAA', fontStyle: 'bold',
    }).setOrigin(0.5);
    y += 20;

    const headline = this.getShiftHeadline(data, summary.isNewHighScore);
    this.add.text(cx, y, headline, {
      fontSize: '13px', fontFamily: 'Arial', color: '#555555',
      wordWrap: { width: 270 }, align: 'center',
    }).setOrigin(0.5);
    y += 36;

    const total = data.customersHappy + data.customersAngry;
    const allHappy = data.customersAngry === 0;

    const addStat = (text: string, color: string) => {
      this.add.text(cx, y, text, { fontSize: '13px', fontFamily: 'Arial', color }).setOrigin(0.5);
      y += 22;
    };

    // Guests
    if (allHappy) {
      addStat(`✓  All ${total} guests left happy`, COLORS.TEXT_GREEN);
    } else {
      addStat(`👥  ${total} guests — ${data.customersHappy} happy · ${data.customersAngry} walked out`, '#888888');
    }

    // Best combo — always shown
    addStat(this.getComboStatLine(data.comboRecord), this.getComboStatColor(data.comboRecord));

    // Fastest delivery
    if (isFinite(data.fastestDeliveryMs) && data.fastestDeliveryMs > 0) {
      const sec = (data.fastestDeliveryMs / 1000).toFixed(1);
      addStat(`⚡  Fastest serve: ${sec}s kitchen-to-table`, '#888888');
    }

    // Close calls
    if (data.nearMissSaves > 0) {
      addStat(`💪  ${data.nearMissSaves} close call${data.nearMissSaves > 1 ? 's' : ''} — saved`, '#CC7733');
    }

    // XP bar
    y += 6;
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

  private getShiftHeadline(data: GameOverData, isNewHighScore: boolean): string {
    const total = data.customersHappy + data.customersAngry;
    if (isNewHighScore && data.customersAngry === 0) {
      return 'Personal best — and not a single upset guest. Exceptional.';
    }
    if (isNewHighScore) {
      return "New personal best. You've never played this well.";
    }
    if (data.comboRecord >= 15) {
      return `${data.comboRecord}-serve streak. The entire room fell silent. That's mastery.`;
    }
    if (data.comboRecord >= 10) {
      return `A ${data.comboRecord}-serve run. This is what a great shift looks like.`;
    }
    if (data.customersAngry === 0 && data.comboRecord >= 6) {
      return 'Flawless service and a hot streak. The room was yours.';
    }
    if (data.customersAngry === 0) {
      return 'Flawless. Every guest left happy.';
    }
    if (data.nearMissSaves >= 3) {
      return `${data.nearMissSaves} tables nearly walked — you saved them all.`;
    }
    if (data.comboRecord >= 6) {
      return `A ${data.comboRecord}-serve streak. The whole restaurant felt it.`;
    }
    if (data.comboRecord >= 3) {
      return 'You were on fire. Keep that streak alive.';
    }
    if (total > 0 && data.customersHappy / total >= 0.8) {
      return 'Strong shift. Most guests left satisfied.';
    }
    if (total > 0 && data.customersHappy > data.customersAngry) {
      return "More wins than losses. There's a comeback building.";
    }
    return 'You gave it everything you had.';
  }

  private getComboStatLine(count: number): string {
    let mult = 1.0;
    for (const m of COMBO_MILESTONES) {
      if (count >= m.min) mult = m.multiplier;
    }
    if (count === 0) return '○  No streak built';
    if (count <= 2) return `↑  Best streak: ${count} serve${count > 1 ? 's' : ''}`;
    const icon = mult >= 5.0 ? '💫' : mult >= 4.0 ? '⭐' : mult >= 3.0 ? '🔥🔥' : '🔥';
    return `${icon}  Best streak: ${count} serves → ×${mult.toFixed(1)}`;
  }

  private getComboStatColor(count: number): string {
    let mult = 1.0;
    for (const m of COMBO_MILESTONES) {
      if (count >= m.min) mult = m.multiplier;
    }
    if (mult >= 5.0) return COLORS.TEXT_GOLD;
    if (mult >= 4.0) return '#E91E63';
    if (mult >= 3.0) return COLORS.TEXT_ORANGE;
    if (mult >= 2.0) return '#FF8C42';
    return '#888888';
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
    btn.on('pointerdown', () => { SoundManager.uiClick(); cb(); });
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
