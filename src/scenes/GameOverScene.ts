import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, COMBO_MILESTONES, fmtScore } from '../config/GameConfig';
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
    ProgressionSystem.recordSession(data.score, data.comboRecord);
    const prog = ProgressionSystem.getData();

    // Resume ambient music during results review (AudioContext active from gameplay)
    this.time.delayedCall(1400, () => SoundManager.startMusic());

    // ── Background — dark walnut floor + wainscoting walls ───────────────────
    const PLANK_H = 34;
    const plankCols = [0x2E1E0F, 0x251508, 0x2B1B0D, 0x221307, 0x301F10];
    const goFloor = this.add.graphics();
    const rowCount = Math.ceil(GAME_HEIGHT / PLANK_H) + 1;
    for (let row = 0; row < rowCount; row++) {
      goFloor.fillStyle(plankCols[row % plankCols.length], 1);
      goFloor.fillRect(0, row * PLANK_H, GAME_WIDTH, PLANK_H);
    }
    goFloor.fillStyle(0x000000, 0.25);
    for (let row = 1; row < rowCount; row++) {
      goFloor.fillRect(0, row * PLANK_H - 1, GAME_WIDTH, 1);
    }
    goFloor.fillStyle(0xFF9944, 0.04);
    for (let row = 0; row < rowCount; row++) {
      goFloor.fillRect(0, row * PLANK_H, GAME_WIDTH, 2);
    }

    // Side walls — terracotta upper / cream wainscoting lower
    const wallW = 16;
    const walls = this.add.graphics();
    walls.fillStyle(0xBF7A42);
    walls.fillRect(0, 0, wallW, Math.floor(GAME_HEIGHT * 0.58));
    walls.fillRect(GAME_WIDTH - wallW, 0, wallW, Math.floor(GAME_HEIGHT * 0.58));
    walls.fillStyle(0xEEE3D2);    // cream wainscoting
    walls.fillRect(0, Math.floor(GAME_HEIGHT * 0.58), wallW, Math.floor(GAME_HEIGHT * 0.4));
    walls.fillRect(GAME_WIDTH - wallW, Math.floor(GAME_HEIGHT * 0.58), wallW, Math.floor(GAME_HEIGHT * 0.4));
    walls.fillStyle(0x5A2E12);    // chair rail
    walls.fillRect(0, Math.floor(GAME_HEIGHT * 0.57), wallW, 4);
    walls.fillRect(GAME_WIDTH - wallW, Math.floor(GAME_HEIGHT * 0.57), wallW, 4);
    walls.fillStyle(0x251007);    // baseboard
    walls.fillRect(0, GAME_HEIGHT - 14, wallW, 14);
    walls.fillRect(GAME_WIDTH - wallW, GAME_HEIGHT - 14, wallW, 14);

    // Amber top accent
    this.add.rectangle(cx, 2, GAME_WIDTH, 5, COLORS.UI_ORANGE).setOrigin(0.5, 0);

    // Panel (fade in on entrance)
    const panel = this.add.image(cx, GAME_HEIGHT / 2, 'panel').setAlpha(0);
    this.tweens.add({ targets: panel, alpha: 1, duration: 350, ease: 'Quad.easeOut' });

    let y = 120;

    // ── Header — cinematic entrance ───────────────────────────────────────────
    const isRecord = summary.isNewHighScore;
    const isNewBestStars = summary.isNewBestStars && !isRecord && data.stars > 1;
    const headerText = isRecord ? 'NEW RECORD!'
      : isNewBestStars ? 'PERSONAL BEST!'
      : 'ROUND COMPLETE!';
    const headerColor = isRecord ? COLORS.TEXT_GOLD
      : isNewBestStars ? '#FFE066'
      : COLORS.TEXT_DARK;
    const headerSize = isRecord || isNewBestStars ? '32px' : '28px';
    const hdr = this.add.text(cx, y, headerText, {
      fontSize: headerSize, fontFamily: 'Arial Black', color: headerColor,
    }).setOrigin(0.5).setAlpha(0).setScale(0.7);
    this.tweens.add({
      targets: hdr, alpha: 1, scaleX: 1, scaleY: 1,
      duration: 380, ease: 'Back.easeOut',
    });
    if (isRecord || isNewBestStars) {
      // Shimmer loop on the header
      this.tweens.add({ targets: hdr, alpha: { from: 1, to: 0.7 }, duration: 700, yoyo: true, repeat: -1, delay: 500 });
    }
    y += (isRecord || isNewBestStars) ? 54 : 50;

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
      onUpdate: (tween) => scoreTxt.setText(fmtScore(Math.floor(tween.getValue() as number))),
    });

    // High score
    this.add.text(cx, y, `Best: ${fmtScore(prog.highScore)}`, {
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

    const headline = this.getShiftHeadline(data, summary.isNewHighScore, isNewBestStars);
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
      addStat(`${total} guests — ${data.customersHappy} happy · ${data.customersAngry} walked out`, '#888888');
    }

    // Best combo — always shown
    addStat(this.getComboStatLine(data.comboRecord), this.getComboStatColor(data.comboRecord));

    // Fastest delivery
    if (isFinite(data.fastestDeliveryMs) && data.fastestDeliveryMs > 0) {
      const sec = (data.fastestDeliveryMs / 1000).toFixed(1);
      addStat(`Fastest: ${sec}s kitchen-to-table`, '#888888');
    }

    // Close calls
    if (data.nearMissSaves > 0) {
      addStat(`${data.nearMissSaves} close call${data.nearMissSaves > 1 ? 's' : ''} — saved`, '#CC7733');
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
      // Level-up pill background
      const lvlBg = this.add.graphics().setAlpha(0);
      lvlBg.fillStyle(0xFF9900, 1);
      lvlBg.fillRoundedRect(cx - 140, y - 16, 280, 36, 12);
      const lvlTxt = this.add.text(cx, y + 2, `LEVEL UP  →  ${summary.levelAfter}`, {
        fontSize: '20px', fontFamily: 'Arial Black', color: '#FFFFFF',
      }).setOrigin(0.5).setAlpha(0).setScale(0.4);
      this.tweens.add({
        targets: [lvlTxt, lvlBg], alpha: 1, duration: 180, delay: 1200,
      });
      this.tweens.add({
        targets: lvlTxt, scaleX: 1, scaleY: 1,
        duration: 320, delay: 1200, ease: 'Back.easeOut',
        onComplete: () => {
          SoundManager.comboUp(3);
          this.cameras.main.flash(120, 255, 160, 40, false);
          // Coin burst
          for (let ci = 0; ci < 8; ci++) {
            const angle = (Math.PI * 2 / 8) * ci;
            const coin = this.add.graphics().setDepth(45);
            coin.fillStyle(0xFFD700, 1);
            coin.fillCircle(0, 0, 7);
            coin.lineStyle(2, 0xCC9900, 1);
            coin.strokeCircle(0, 0, 7);
            coin.setPosition(cx, y + 2);
            this.tweens.add({
              targets: coin,
              x: cx + Math.cos(angle) * 55,
              y: y + 2 + Math.sin(angle) * 40,
              alpha: 0, scale: 0,
              duration: 500, delay: ci * 35,
              ease: 'Quad.easeOut',
              onComplete: () => coin.destroy(),
            });
          }
        },
      });

      // Tray upgrade callout for levels 3 and 5
      const newTray = summary.levelAfter >= 5 ? 4 : summary.levelAfter >= 3 ? 3 : 0;
      const oldTray = summary.levelBefore >= 5 ? 4 : summary.levelBefore >= 3 ? 3 : 2;
      if (newTray > 0 && newTray > oldTray) {
        y += 34;
        const trayBg = this.add.graphics().setAlpha(0);
        trayBg.fillStyle(0x1A4A1A, 0.9);
        trayBg.fillRoundedRect(cx - 120, y - 12, 240, 30, 8);
        const trayUpgTxt = this.add.text(cx, y + 3, `Tray upgraded — carry ${newTray} items!`, {
          fontSize: '13px', fontFamily: 'Arial Black', color: '#66FF88',
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: [trayBg, trayUpgTxt], alpha: 1, duration: 350, delay: 1900 });
        this.tweens.add({
          targets: trayUpgTxt, scaleX: { from: 0.6, to: 1 }, scaleY: { from: 0.6, to: 1 },
          duration: 300, delay: 1900, ease: 'Back.easeOut',
        });
      }
    }

    y += 30;
    this.add.text(cx, y, summary.nextUnlockHint, {
      fontSize: '12px', color: '#888888', wordWrap: { width: 300 }, align: 'center',
    }).setOrigin(0.5);

    // Buttons
    const btnY = GAME_HEIGHT - 160;
    this.makeBtn(cx, btnY, 'PLAY AGAIN', 'btn_orange', () => this.scene.start('GameScene'));
    this.makeBtn(cx, btnY + 64, 'MAIN MENU', 'btn_green', () => this.scene.start('MainMenuScene'));

    if (summary.isNewHighScore || isNewBestStars) {
      this.spawnConfetti();
    }
  }

  private getShiftHeadline(data: GameOverData, isNewHighScore: boolean, isNewBestStars: boolean): string {
    const total = data.customersHappy + data.customersAngry;
    if (isNewHighScore && data.customersAngry === 0) {
      return 'Personal best — and not a single upset guest. Exceptional.';
    }
    if (isNewHighScore) {
      return "New personal best. You've never played this well.";
    }
    if (isNewBestStars) {
      return 'Your best star rating yet. The room noticed.';
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
    const icon = mult >= 5.0 ? '★' : mult >= 4.0 ? '★' : mult >= 3.0 ? '+' : '↑';
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
      const isFull = i < count;
      const tex = isFull ? 'star_full' : 'star_empty';
      const star = this.add.image(cx + (i - 1) * 52, y + 16, tex).setScale(0).setAlpha(1);
      const delay = 440 + i * 230;
      this.tweens.add({
        targets: star, scaleX: 1.35, scaleY: 1.35,
        duration: 260, delay, ease: 'Back.easeOut',
        onStart: () => {
          if (isFull) {
            SoundManager.starReveal(i + 1);
            this.cameras.main.flash(90, 255, 220, 60, false);
          }
        },
        onComplete: () => {
          this.tweens.add({ targets: star, scaleX: isFull ? 1.0 : 0.9, scaleY: isFull ? 1.0 : 0.9, duration: 160, ease: 'Quad.easeOut' });
          // 3-star final sparkle burst
          if (isFull && i === 2) {
            this.time.delayedCall(200, () => this.starBurstCelebration(cx, y + 16));
          }
        },
      });
    }
  }

  private starBurstCelebration(cx: number, cy: number) {
    this.cameras.main.flash(220, 255, 230, 100, false);
    const burstCount = 12;
    for (let i = 0; i < burstCount; i++) {
      const angle = (Math.PI * 2 / burstCount) * i;
      const dist = 70 + Math.random() * 40;
      const size = 4 + Math.floor(Math.random() * 5);
      const s = this.add.graphics().setDepth(50);
      if (i % 3 === 0) {
        s.fillStyle(0xFFD700, 0.9);
        s.fillTriangle(0, -size, size * 0.6, size * 0.6, -size * 0.6, size * 0.6);
      } else if (i % 3 === 1) {
        s.fillStyle(0xFFEE44, 0.85);
        s.fillCircle(0, 0, size * 0.7);
      } else {
        s.fillStyle(0xFFFF99, 0.8);
        s.fillRect(-size * 0.2, -size, size * 0.4, size * 2);
        s.fillRect(-size, -size * 0.2, size * 2, size * 0.4);
      }
      s.setPosition(cx, cy);
      this.tweens.add({
        targets: s,
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        alpha: 0, scale: 0,
        duration: 600 + i * 30,
        ease: 'Quad.easeOut',
        onComplete: () => s.destroy(),
      });
    }
    // Gold "PERFECT SHIFT!" banner
    const banner = this.add.text(cx, cy - 54, 'PERFECT SHIFT!', {
      fontSize: '22px', fontFamily: 'Arial Black', color: '#FFD700',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(50).setScale(0);
    this.tweens.add({
      targets: banner, scale: 1.1, duration: 350, ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({ targets: banner, scaleX: 1.0, scaleY: 1.0, duration: 120 });
        this.tweens.add({ targets: banner, alpha: 0, duration: 500, delay: 2200, onComplete: () => banner.destroy() });
      },
    });
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
