import Phaser from 'phaser';
import { MENU_ITEMS, COLORS, CUSTOMER_VARIANTS } from '../config/GameConfig';

export type CustomerState =
  | 'entering' | 'seated' | 'requesting' | 'ordering'
  | 'waiting_food' | 'eating' | 'paying' | 'leaving';

export interface OrderItem {
  itemId: number;
  name: string;
  emoji: string;
  price: number;
  cookTime: number;
}

export class Customer extends Phaser.GameObjects.Container {
  public state: CustomerState = 'entering';
  public tableId = -1;
  public order: OrderItem | null = null;
  public readonly variantIndex: number;
  public patienceAtDelivery = 1.0;
  public isVIP = false;
  public isCritic = false;
  public isBirthday = false;
  public isBusinessCustomer = false;
  public isFamilyTable = false;
  public familyDessertDone = false;
  public queueTimeout: Phaser.Time.TimerEvent | null = null;

  private bodySprite!: Phaser.GameObjects.Image;
  private face!: Phaser.GameObjects.Graphics;
  private patienceBarFill!: Phaser.GameObjects.Graphics;
  private eatBarTrack!: Phaser.GameObjects.Graphics;
  private eatBarFill!: Phaser.GameObjects.Graphics;
  private bubble!: Phaser.GameObjects.Container;
  private bubbleTween: Phaser.Tweens.Tween | null = null;
  private lastMood = '';
  private idleTimer: Phaser.Time.TimerEvent | null = null;

  private maxPatience: number;
  private patience: number;
  private patienceActive = false;

  private eatStartMs = 0;
  private eatDuration = 0;

  // 48×72 sprite, origin 0.5 → container center at pixel (24, 36)
  // Head center at pixel (24, 14) → container (0, 14−36) = (0, −22)
  private static readonly HEAD_CY = -21;
  private static readonly EYE_Y = -22;   // big chibi eyes, just above head center
  private static readonly MOUTH_Y = -15; // wide smile below center

  constructor(scene: Phaser.Scene, x: number, y: number, variantIndex: number, maxPatience: number) {
    super(scene, x, y);
    this.variantIndex = variantIndex % 7;
    this.maxPatience = maxPatience;
    this.patience = maxPatience;

    this.bodySprite = scene.add.image(0, 0, `customer_${this.variantIndex}`);
    this.add(this.bodySprite);

    this.face = scene.add.graphics();
    this.add(this.face);

    // Patience bar — 44×8px pill at y=−50 (above sprite top at −36)
    const patienceTrack = scene.add.graphics();
    patienceTrack.fillStyle(0x000000, 0.20);
    patienceTrack.fillRoundedRect(-22, -50, 44, 8, 4);
    this.add(patienceTrack);

    this.patienceBarFill = scene.add.graphics();
    this.add(this.patienceBarFill);

    // Eating progress bar — below sprite feet at y=38 (sprite bottom ≈ y=36)
    this.eatBarTrack = scene.add.graphics();
    this.eatBarTrack.fillStyle(0x000000, 0.15);
    this.eatBarTrack.fillRoundedRect(-22, 38, 44, 5, 2.5);
    this.eatBarTrack.setVisible(false);
    this.add(this.eatBarTrack);

    this.eatBarFill = scene.add.graphics();
    this.eatBarFill.setVisible(false);
    this.add(this.eatBarFill);

    // Bubble: body y=-18 to +18 local, tail tip at y=34 → abs y=-88+34=-54 = patience bar top (−50) − 4px gap
    this.bubble = scene.add.container(0, -88);
    this.bubble.setVisible(false);
    this.add(this.bubble);

    // Depth 12: above table surface/glow (2-3), below table front face overlay (16) and arrows (15)
    this.setDepth(12);
    scene.add.existing(this);
    this.drawFace('neutral');
  }

  startPatience() { this.patienceActive = true; }
  stopPatience()  { this.patienceActive = false; }

  refillPatience() {
    this.patience = this.maxPatience;
    this.patienceActive = false;
    this.patienceBarFill.clear();
  }

  getPatienceFraction() {
    return Math.max(0, this.patience / this.maxPatience);
  }

  isAngry() { return this.patience <= 0; }

  startEating(duration: number) {
    this.eatStartMs = this.scene.time.now;
    this.eatDuration = duration;
    this.eatBarTrack.setVisible(true);
    this.eatBarFill.setVisible(true);
  }

  stopEating() {
    this.eatDuration = 0;
    this.eatBarTrack.setVisible(false);
    this.eatBarFill.setVisible(false);
    this.eatBarFill.clear();
  }

  showRequestBubble() {
    this.buildBubble('?', 0x3498DB);
    this.bubblePulse();
  }

  showOrderBubble(item: OrderItem) {
    this.buildBubbleWithFood(item.itemId, 0xFF6B35);
  }

  showPayBubble(price: number) {
    this.buildBubble(`$${price}`, 0xFFD700);
  }

  showOrderFlash() {
    this.bodySprite.setTint(0xFFCC88);
    this.scene.tweens.add({
      targets: this.bodySprite, alpha: { from: 0.65, to: 1 },
      duration: 120, ease: 'Quad.easeOut',
      onComplete: () => {
        this.scene.time.delayedCall(160, () => this.bodySprite.clearTint());
      },
    });
  }

  showAngryBubble() {
    this.buildBubble('!!', 0xF44336);
    this.scene.tweens.add({
      targets: this.bubble, x: { from: -4, to: 4 },
      duration: 75, yoyo: true, repeat: 4,
    });
  }

  hideBubble() {
    if (this.bubbleTween) { this.bubbleTween.stop(); this.bubbleTween = null; }
    this.bubble.setVisible(false);
  }

  showFoodReaction() {
    // Excited bob + tint when food arrives — anticipation paid off
    this.bodySprite.setTint(0xAAEEAA);
    // Jump up
    this.scene.tweens.add({
      targets: this, y: this.y - 12,
      duration: 160, yoyo: true, ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.time.delayedCall(100, () => this.bodySprite.clearTint());
      },
    });
    // Excited scale squeeze (happiness squash)
    this.scene.tweens.add({
      targets: this.bodySprite,
      scaleX: { from: 1.2, to: 0.9 }, scaleY: { from: 0.8, to: 1.15 },
      duration: 130, yoyo: true, repeat: 1, ease: 'Quad.easeOut',
    });
  }

  showHappyExit() {
    // Big celebration: jump high + gold flash + scale bounce
    // This fires right before the customer walks out after payment
    this.bodySprite.setTint(0xFFDD44);

    // Jump up high
    this.scene.tweens.add({
      targets: this,
      y: this.y - 28,
      duration: 240, yoyo: true, ease: 'Quad.easeOut',
      onComplete: () => this.bodySprite.clearTint(),
    });

    // Happy squash-and-stretch
    this.scene.tweens.add({
      targets: this.bodySprite,
      scaleX: { from: 0.85, to: 1.3 }, scaleY: { from: 1.3, to: 0.85 },
      duration: 120, yoyo: true, repeat: 1, ease: 'Quad.easeOut',
    });
  }

  seatBounce() {
    this.scene.tweens.add({
      targets: this, y: this.y - 12,
      duration: 140, yoyo: true, ease: 'Quad.easeOut',
    });
  }

  // Face left or right based on target x position
  faceDirection(toX: number) {
    this.bodySprite.setFlipX(toX < this.x);
  }

  // Walking bob — subtle scale pulse during escort (call with matchDuration)
  walkBob(duration: number) {
    this.scene.tweens.add({
      targets: this.bodySprite,
      y: { from: 0, to: -4 },
      duration: 160, yoyo: true,
      repeat: Math.floor(duration / 320),
      ease: 'Sine.easeInOut',
    });
  }

  showNameBanner() {
    const name = CUSTOMER_VARIANTS[this.variantIndex].name.toUpperCase();
    const txt = this.scene.add.text(0, -100, name, {
      fontSize: '11px', fontFamily: 'Arial Black', color: '#FFFFFF',
      backgroundColor: '#1A1A1AAA', padding: { x: 6, y: 3 },
    }).setOrigin(0.5).setDepth(15);
    this.add(txt);
    this.scene.tweens.add({
      targets: txt,
      alpha: { from: 0, to: 1 },
      y: { from: -97, to: -103 },
      duration: 280, ease: 'Quad.easeOut',
      onComplete: () => {
        this.scene.time.delayedCall(1600, () => {
          this.scene.tweens.add({
            targets: txt, alpha: 0, duration: 350,
            onComplete: () => this.remove(txt, true),
          });
        });
      },
    });
  }

  makeVIP() {
    this.isVIP = true;
    this.bodySprite.setTint(0xFFBB00);
    this.maxPatience = Math.floor(this.maxPatience * 0.7);
    this.patience = this.maxPatience;

    // VIP crown — drawn as a gold Graphics crown shape
    const crown = this.scene.add.graphics();
    crown.fillStyle(0xFFCC00, 1);
    crown.fillTriangle(-10, 0, -4, -8, 0, -2);
    crown.fillTriangle(0, -10, 4, -2, 0, -2);
    crown.fillTriangle(4, -2, 8, -8, 12, 0);
    crown.fillRect(-10, 0, 22, 6);
    crown.fillStyle(0xFFEE44, 0.7);
    crown.fillCircle(-4, -7, 2.5);
    crown.fillCircle(1, -9, 2.5);
    crown.fillCircle(6, -7, 2.5);
    crown.setPosition(-6, -108);
    this.add(crown);
    this.scene.tweens.add({
      targets: crown, y: { from: -104, to: -116 },
      duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  makeCritic() {
    this.isCritic = true;
    this.bodySprite.setTint(0x7799BB);
    this.maxPatience = Math.floor(this.maxPatience * 0.9);
    this.patience = this.maxPatience;

    // Notepad + pencil — the critic's signature prop
    const pad = this.scene.add.graphics();
    pad.fillStyle(0xFFF5E0, 1);
    pad.fillRoundedRect(-8, -5, 16, 18, 2);
    pad.lineStyle(1, 0xCCBBAA, 0.9);
    pad.strokeRoundedRect(-8, -5, 16, 18, 2);
    pad.fillStyle(0xCCBBAA, 0.6);
    pad.fillRect(-5, 1, 10, 1.5);
    pad.fillRect(-5, 5, 10, 1.5);
    pad.fillRect(-5, 9, 7, 1.5);
    // Pencil alongside pad
    pad.fillStyle(0xFFCC00, 1);
    pad.fillRect(7, -8, 3, 12);
    pad.fillStyle(0xFF8800, 1);
    pad.fillTriangle(7, 4, 10, 4, 8.5, 8);
    pad.setPosition(18, -10);
    this.add(pad);
    this.scene.tweens.add({
      targets: pad, angle: { from: -6, to: 6 },
      duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  makeBusinessCustomer() {
    this.isBusinessCustomer = true;
    this.maxPatience = Math.floor(this.maxPatience * 0.70);
    this.patience = this.maxPatience;
    this.bodySprite.setTint(0x5599CC);

    // Briefcase — signals busy executive
    const brief = this.scene.add.graphics();
    brief.fillStyle(0x2A180A, 1);
    brief.fillRoundedRect(-9, -2, 18, 12, 2);
    brief.lineStyle(1.5, 0x7A4030, 1);
    brief.strokeRoundedRect(-9, -2, 18, 12, 2);
    brief.fillStyle(0x2A180A, 1);
    brief.fillRoundedRect(-5, -7, 10, 7, 2);
    brief.lineStyle(1, 0x5A3020, 1);
    brief.strokeRoundedRect(-5, -7, 10, 7, 2);
    brief.lineStyle(1.5, 0x5A3020, 0.7);
    brief.lineBetween(-9, 4, 9, 4);
    brief.setPosition(18, -6);
    this.add(brief);
  }

  makeFamilyTable() {
    this.isFamilyTable = true;
    this.maxPatience = Math.floor(this.maxPatience * 1.30);
    this.patience = this.maxPatience;

    // Small family silhouette icon
    const fam = this.scene.add.graphics();
    fam.fillStyle(0xFFCC88, 1);
    fam.fillCircle(-7, -8, 4.5);
    fam.fillCircle(2, -7, 4);
    fam.fillCircle(-13, -5, 3);
    fam.fillStyle(0xA06040, 1);
    fam.fillRoundedRect(-11, -4, 8, 8, 2);
    fam.fillRoundedRect(-2, -3, 7, 7, 2);
    fam.fillRoundedRect(-15, -2, 5, 6, 2);
    fam.setPosition(18, -8);
    this.add(fam);
  }

  makeBirthday() {
    this.isBirthday = true;

    // Party hat above patience bar (hat base at y=-62, tip at y=-84)
    const hat = this.scene.add.graphics();
    hat.fillStyle(0xFF4488, 1);
    hat.fillTriangle(-10, 0, 10, 0, 0, -22);
    hat.fillStyle(0xFFDD00, 0.8);
    hat.fillTriangle(-7, 0, 7, 0, 0, -15);
    hat.fillStyle(0x00CCFF, 0.9);
    // Polka dots on hat
    hat.fillCircle(-4, -6, 2);
    hat.fillCircle(3, -12, 2);
    // Pom pom tip
    hat.fillStyle(0xFFFFFF, 0.95);
    hat.fillCircle(0, -22, 3);
    hat.setPosition(-1, -62);
    this.add(hat);

    // Subtle continuous bounce to draw attention
    this.scene.tweens.add({
      targets: hat, y: { from: -62, to: -68 },
      duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  startIdleBehavior() {
    this.stopIdleBehavior();
    this.scheduleNextIdle();
  }

  stopIdleBehavior() {
    if (this.idleTimer) { this.idleTimer.remove(); this.idleTimer = null; }
  }

  cleanup() {
    this.stopIdleBehavior();
    if (this.queueTimeout) { this.queueTimeout.remove(); this.queueTimeout = null; }
    if (this.bubbleTween) { this.bubbleTween.stop(); this.bubbleTween = null; }
  }

  private scheduleNextIdle() {
    const delay = 1600 + Math.random() * 2400;
    this.idleTimer = this.scene.time.delayedCall(delay, () => {
      this.doIdleAction();
      if (this.state !== 'leaving') this.scheduleNextIdle();
    });
  }

  private doIdleAction() {
    if (this.state === 'leaving' || this.state === 'entering') return;

    if (this.state === 'requesting' || this.state === 'ordering') {
      // Impatient shuffle: horizontal wiggle
      this.scene.tweens.add({
        targets: this.bodySprite,
        x: { from: -4, to: 4 },
        duration: 80, yoyo: true, repeat: 3, ease: 'Sine.easeInOut',
      });
    } else if (this.state === 'waiting_food') {
      // Tap table: lean forward + slight bob
      this.scene.tweens.add({
        targets: this.bodySprite,
        y: { from: 0, to: 6 },
        duration: 150, yoyo: true, ease: 'Quad.easeOut',
      });
    } else if (this.state === 'eating') {
      // Chewing animation: bob + squash on scaleY (food going down)
      this.scene.tweens.add({
        targets: this.bodySprite,
        y: { from: 0, to: -5 },
        duration: 95, yoyo: true, repeat: 5, ease: 'Quad.easeInOut',
      });
      this.scene.tweens.add({
        targets: this.bodySprite,
        scaleY: { from: 1.0, to: 0.94 },
        duration: 95, yoyo: true, repeat: 5, ease: 'Quad.easeInOut',
      });
      // Occasional happy wiggle when really enjoying the food
      if (Math.random() < 0.4) {
        this.scene.time.delayedCall(300, () => {
          if (this.state !== 'eating') return;
          this.scene.tweens.add({
            targets: this.bodySprite,
            x: { from: -3, to: 3 },
            duration: 100, yoyo: true, repeat: 2, ease: 'Sine.easeInOut',
          });
        });
      }
    } else if (this.state === 'paying') {
      // Wave urgently for attention: wider rapid wiggle
      this.scene.tweens.add({
        targets: this.bodySprite,
        x: { from: -6, to: 6 },
        duration: 65, yoyo: true, repeat: 5, ease: 'Sine.easeInOut',
      });
    }
  }

  private buildBubble(content: string, borderColor: number) {
    if (this.bubbleTween) { this.bubbleTween.stop(); this.bubbleTween = null; }
    this.bubble.removeAll(true);

    const bg = this.scene.add.graphics();

    // Shadow (+2,+2)
    bg.fillStyle(0x000000, 0.15);
    bg.fillRoundedRect(-26, -16, 58, 38, 9);

    // Bubble fill
    bg.fillStyle(0xFFF8F0);
    bg.fillRoundedRect(-28, -18, 58, 38, 9);

    // Border
    bg.lineStyle(2, borderColor);
    bg.strokeRoundedRect(-28, -18, 58, 38, 9);

    // Tail — tip at y=34 local = abs y −88+34 = −54, patience bar top at −50 → 4px gap
    bg.fillStyle(0xFFF8F0);
    bg.fillTriangle(-7, 16, 7, 16, 0, 34);
    bg.lineStyle(2, borderColor);
    bg.lineBetween(-7, 16, 0, 34);
    bg.lineBetween(7, 16, 0, 34);

    const txt = this.scene.add.text(0, -1, content, {
      fontSize: content.length > 3 ? '12px' : '22px',
      color: '#2C1810',
    }).setOrigin(0.5);

    this.bubble.add([bg, txt]);
    this.bubble.setScale(0);
    this.bubble.setVisible(true);
    this.scene.tweens.add({
      targets: this.bubble, scaleX: 1, scaleY: 1,
      duration: 220, ease: 'Back.easeOut',
    });
  }

  private buildBubbleWithFood(itemId: number, borderColor: number) {
    if (this.bubbleTween) { this.bubbleTween.stop(); this.bubbleTween = null; }
    this.bubble.removeAll(true);

    const bg = this.scene.add.graphics();

    bg.fillStyle(0x000000, 0.15);
    bg.fillRoundedRect(-26, -16, 58, 38, 9);

    bg.fillStyle(0xFFF8F0);
    bg.fillRoundedRect(-28, -18, 58, 38, 9);

    bg.lineStyle(2, borderColor);
    bg.strokeRoundedRect(-28, -18, 58, 38, 9);

    bg.fillStyle(0xFFF8F0);
    bg.fillTriangle(-7, 16, 7, 16, 0, 34);
    bg.lineStyle(2, borderColor);
    bg.lineBetween(-7, 16, 0, 34);
    bg.lineBetween(7, 16, 0, 34);

    const foodKey = `food_${itemId}`;
    const foodImg = this.scene.add.image(0, -1, foodKey).setScale(0.55).setOrigin(0.5);

    this.bubble.add([bg, foodImg]);
    this.bubble.setScale(0);
    this.bubble.setVisible(true);
    this.scene.tweens.add({
      targets: this.bubble, scaleX: 1, scaleY: 1,
      duration: 220, ease: 'Back.easeOut',
    });
    this.bubblePulse();
  }

  private bubblePulse() {
    this.bubbleTween = this.scene.tweens.add({
      targets: this.bubble,
      scaleX: { from: 0.93, to: 1.07 }, scaleY: { from: 0.93, to: 1.07 },
      duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      delay: 250,
    });
  }

  private drawFace(mood: 'neutral' | 'happy' | 'hungry' | 'angry') {
    if (mood === this.lastMood) return;
    this.lastMood = mood;
    this.face.clear();

    const eyeY = Customer.EYE_Y;
    const mouthY = Customer.MOUTH_Y;
    const eyeX = 6;          // eye spacing from center
    const irisR = 3.3;       // big chibi pupils
    const whiteR = 4.6;

    // Angry: red overlay on head region
    if (mood === 'angry') {
      this.face.fillStyle(0xE34234, 0.32);
      this.face.fillRoundedRect(-15, -36, 30, 30, 8);
    }

    // Eye whites
    this.face.fillStyle(0xFFFFFF, 1);
    this.face.fillCircle(-eyeX, eyeY, whiteR);
    this.face.fillCircle(eyeX, eyeY, whiteR);

    // Irises (big, friendly) — happy/eating squints into a curve instead
    if (mood === 'happy') {
      this.face.lineStyle(3, 0x2C1810);
      this.face.beginPath(); this.face.arc(-eyeX, eyeY + 1, 3.2, Math.PI + 0.25, -0.25, false); this.face.strokePath();
      this.face.beginPath(); this.face.arc(eyeX, eyeY + 1, 3.2, Math.PI + 0.25, -0.25, false); this.face.strokePath();
    } else {
      this.face.fillStyle(0x2C1810);
      this.face.fillCircle(-eyeX, eyeY + 0.4, irisR);
      this.face.fillCircle(eyeX, eyeY + 0.4, irisR);
      // Big catchlights
      this.face.fillStyle(0xFFFFFF, 0.95);
      this.face.fillCircle(-eyeX + 1.3, eyeY - 1, 1.5);
      this.face.fillCircle(eyeX + 1.3, eyeY - 1, 1.5);
      this.face.fillStyle(0xFFFFFF, 0.6);
      this.face.fillCircle(-eyeX - 1.2, eyeY + 1.2, 0.8);
      this.face.fillCircle(eyeX - 1.2, eyeY + 1.2, 0.8);
    }

    // Eyebrows
    this.face.fillStyle(0x2C1810);
    if (mood === 'angry') {
      this.face.fillRoundedRect(-11, eyeY - 7, 8, 2.6, 1.3);
      this.face.fillRoundedRect(3, eyeY - 6, 8, 2.6, 1.3);
    } else if (mood === 'hungry') {
      this.face.fillRoundedRect(-10, eyeY - 6, 7, 2, 1);
      this.face.fillRoundedRect(3, eyeY - 5, 7, 2, 1);
    }

    // Mouth
    if (mood === 'happy') {
      this.face.fillStyle(0x6B2A1A);
      this.face.beginPath();
      this.face.arc(0, mouthY - 1, 5.5, 0.12, Math.PI - 0.12, false);
      this.face.lineTo(-5.4, mouthY - 1);
      this.face.closePath(); this.face.fillPath();
      // tongue
      this.face.fillStyle(0xFF7A7A);
      this.face.fillEllipse(0, mouthY + 2.5, 5, 2.6);
    } else if (mood === 'angry') {
      this.face.lineStyle(2.4, 0x9E2A1E);
      this.face.beginPath();
      this.face.arc(0, mouthY + 3, 5, Math.PI + 0.2, -0.2, false);
      this.face.strokePath();
    } else if (mood === 'hungry') {
      this.face.lineStyle(2.2, 0x8B5E3C);
      this.face.beginPath();
      this.face.arc(0, mouthY + 2, 3.5, Math.PI + 0.3, -0.3, false);
      this.face.strokePath();
    } else {
      this.face.lineStyle(2.2, 0x3C2010);
      this.face.beginPath();
      this.face.arc(0, mouthY - 1, 4, 0.25, Math.PI - 0.25, false);
      this.face.strokePath();
    }
  }

  preUpdate(_time: number, delta: number) {
    if (this.patienceActive && this.patience > 0) {
      this.patience -= delta;
    }

    const frac = this.getPatienceFraction();

    if (this.state === 'eating' || this.state === 'paying') {
      this.drawFace('happy');
    } else if (frac < 0.2) {
      this.drawFace('angry');
    } else if (frac < 0.5) {
      this.drawFace('hungry');
    } else {
      this.drawFace('neutral');
    }

    // Patience bar — 44×8px pill at y=−50
    this.patienceBarFill.clear();
    if (this.patienceActive || this.state === 'waiting_food' || this.state === 'ordering') {
      const col = frac > 0.6 ? COLORS.UI_GREEN : frac > 0.3 ? 0xFF9800 : COLORS.UI_RED;
      this.patienceBarFill.fillStyle(col);
      this.patienceBarFill.fillRoundedRect(-22, -50, 44 * frac, 8, 4);

      // Wobble warning when patience is critically low (< 15%)
      if (frac < 0.15 && frac > 0) {
        const wobble = Math.sin(this.scene.time.now * 0.018) * 1.5;
        this.patienceBarFill.x = wobble;
      } else {
        this.patienceBarFill.x = 0;
      }
    }

    // Eating progress bar — below feet at y=38
    if (this.state === 'eating' && this.eatDuration > 0) {
      const elapsed = this.scene.time.now - this.eatStartMs;
      const eatFrac = Math.min(1, elapsed / this.eatDuration);
      this.eatBarFill.clear();
      this.eatBarFill.fillStyle(0x4CAF50);
      this.eatBarFill.fillRoundedRect(-22, 38, 44 * eatFrac, 5, 2.5);
    }
  }
}
