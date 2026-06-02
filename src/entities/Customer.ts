import Phaser from 'phaser';
import { MENU_ITEMS, COLORS } from '../config/GameConfig';

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

  private bodySprite!: Phaser.GameObjects.Image;
  private face!: Phaser.GameObjects.Graphics;
  private patienceBarFill!: Phaser.GameObjects.Graphics;
  private eatBarTrack!: Phaser.GameObjects.Graphics;
  private eatBarFill!: Phaser.GameObjects.Graphics;
  private bubble!: Phaser.GameObjects.Container;
  private bubbleTween: Phaser.Tweens.Tween | null = null;
  private lastMood = '';

  private maxPatience: number;
  private patience: number;
  private patienceActive = false;

  // Eating progress
  private eatStartMs = 0;
  private eatDuration = 0;

  // Head center in container space: (0, -16)
  // eyeY = -18 (2px above head center), mouthY = -13 (3px below)
  private static readonly HEAD_CY = -16;
  private static readonly EYE_Y = -18;
  private static readonly MOUTH_Y = -13;

  constructor(scene: Phaser.Scene, x: number, y: number, variantIndex: number, maxPatience: number) {
    super(scene, x, y);
    this.variantIndex = variantIndex % 7;
    this.maxPatience = maxPatience;
    this.patience = maxPatience;

    this.bodySprite = scene.add.image(0, 0, `customer_${this.variantIndex}`);
    this.add(this.bodySprite);

    this.face = scene.add.graphics();
    this.add(this.face);

    // Patience bar — pill shape, above character head
    // Track: 36×5px at y=-42 (11px above sprite top at y=-26)
    const patienceTrack = scene.add.graphics();
    patienceTrack.fillStyle(0x000000, 0.18);
    patienceTrack.fillRoundedRect(-18, -42, 36, 5, 2.5);
    this.add(patienceTrack);

    this.patienceBarFill = scene.add.graphics();
    this.add(this.patienceBarFill);

    // Eating progress bar — below character feet (sprite bottom ~y=26)
    this.eatBarTrack = scene.add.graphics();
    this.eatBarTrack.fillStyle(0x000000, 0.15);
    this.eatBarTrack.fillRoundedRect(-18, 30, 36, 4, 2);
    this.eatBarTrack.setVisible(false);
    this.add(this.eatBarTrack);

    this.eatBarFill = scene.add.graphics();
    this.eatBarFill.setVisible(false);
    this.add(this.eatBarFill);

    // Bubble anchored above patience bar (bubble body y=-84 to y=-48, tail tip y=-46, bar top y=-42 = 4px gap)
    this.bubble = scene.add.container(0, -66);
    this.bubble.setVisible(false);
    this.add(this.bubble);

    scene.add.existing(this);
    this.drawFace('neutral');
  }

  startPatience() {
    this.patienceActive = true;
  }

  stopPatience() {
    this.patienceActive = false;
  }

  refillPatience() {
    this.patience = this.maxPatience;
    this.patienceActive = false;
    this.patienceBarFill.clear();
  }

  getPatienceFraction() {
    return Math.max(0, this.patience / this.maxPatience);
  }

  isAngry() {
    return this.patience <= 0;
  }

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
    this.buildBubble('❓', 0x2196F3);
    this.bubblePulse();
  }

  showOrderBubble(item: OrderItem) {
    this.buildBubble(item.emoji, 0xFF6B35);
    this.bubble.setVisible(true);
  }

  showPayBubble(price: number) {
    this.buildBubble(`💳 $${price}`, 0xFFD700);
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
    this.buildBubble('😠', 0xF44336);
    this.scene.tweens.add({
      targets: this.bubble, x: { from: -3, to: 3 },
      duration: 80, yoyo: true, repeat: 4,
    });
  }

  hideBubble() {
    if (this.bubbleTween) { this.bubbleTween.stop(); this.bubbleTween = null; }
    this.bubble.setVisible(false);
  }

  seatBounce() {
    this.scene.tweens.add({
      targets: this, y: this.y - 10,
      duration: 150, yoyo: true, ease: 'Quad.easeOut',
    });
  }

  private buildBubble(content: string, borderColor: number) {
    if (this.bubbleTween) { this.bubbleTween.stop(); this.bubbleTween = null; }
    this.bubble.removeAll(true);

    const bg = this.scene.add.graphics();

    // Shadow (+2,+2 offset behind bubble)
    bg.fillStyle(0x000000, 0.15);
    bg.fillRoundedRect(-26, -16, 56, 36, 8);

    // Bubble fill (warm cream)
    bg.fillStyle(0xFFF8F0);
    bg.fillRoundedRect(-28, -18, 56, 36, 8);

    // Bubble border
    bg.lineStyle(1.5, borderColor);
    bg.strokeRoundedRect(-28, -18, 56, 36, 8);

    // Tail — shorter so it clears the patience bar (tip at y=20 in bubble space = y=-46 in container)
    bg.fillStyle(0xFFF8F0);
    bg.fillTriangle(-6, 14, 6, 14, 0, 20);
    bg.lineStyle(1.5, borderColor);
    bg.lineBetween(-6, 14, 0, 20);
    bg.lineBetween(6, 14, 0, 20);

    const txt = this.scene.add.text(0, -1, content, {
      fontSize: content.length > 3 ? '11px' : '20px',
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

  private bubblePulse() {
    this.bubbleTween = this.scene.tweens.add({
      targets: this.bubble,
      scaleX: { from: 0.92, to: 1.08 }, scaleY: { from: 0.92, to: 1.08 },
      duration: 550, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      delay: 250,
    });
  }

  private drawFace(mood: 'neutral' | 'happy' | 'hungry' | 'angry') {
    if (mood === this.lastMood) return;
    this.lastMood = mood;
    this.face.clear();

    const eyeY = Customer.EYE_Y;     // -18: 2px above head center (-16)
    const mouthY = Customer.MOUTH_Y; // -13: 3px below head center
    const eyeR = 1.5;

    // Angry: red overlay on head (head spans y=-26 to y=-6)
    if (mood === 'angry') {
      this.face.fillStyle(0xCC2222, 0.45);
      this.face.fillRoundedRect(-12, -26, 24, 20, 5);
    }

    // Eyebrows (angry/hungry only)
    this.face.fillStyle(0x3C2010);
    if (mood === 'angry') {
      // Sharp inward brows
      this.face.fillRect(-9, eyeY - 5, 5, 2);
      this.face.fillRect(4, eyeY - 4, 5, 2);
    } else if (mood === 'hungry') {
      // Mild angled brows
      this.face.fillRect(-9, eyeY - 4, 5, 1.5);
      this.face.fillRect(4, eyeY - 3, 5, 1.5);
    }

    // Eyes
    this.face.fillStyle(0x3C2010);
    this.face.fillCircle(-4, eyeY, eyeR);
    this.face.fillCircle(4, eyeY, eyeR);

    // Mouth
    if (mood === 'happy') {
      this.face.lineStyle(1.5, 0x3C2010);
      this.face.beginPath();
      this.face.arc(0, mouthY - 1, 4, 0.1, Math.PI - 0.1, false);
      this.face.strokePath();
    } else if (mood === 'angry') {
      this.face.lineStyle(1.5, 0xCC2222);
      this.face.beginPath();
      this.face.arc(0, mouthY + 2, 4, Math.PI + 0.2, -0.2, false);
      this.face.strokePath();
    } else if (mood === 'hungry') {
      this.face.fillStyle(0x8B5E3C);
      this.face.fillRoundedRect(-4, mouthY, 8, 1.5, 1);
    } else {
      // Neutral: flat line
      this.face.fillStyle(0x3C2010);
      this.face.fillRect(-3, mouthY, 6, 1.5);
    }
  }

  preUpdate(_time: number, delta: number) {
    if (this.patienceActive && this.patience > 0) {
      this.patience -= delta;
    }

    const frac = this.getPatienceFraction();

    // Mood face
    if (this.state === 'eating' || this.state === 'paying') {
      this.drawFace('happy');
    } else if (frac < 0.2) {
      this.drawFace('angry');
    } else if (frac < 0.5) {
      this.drawFace('hungry');
    } else {
      this.drawFace('neutral');
    }

    // Patience bar — pill shape at y=-42, 36×5px
    this.patienceBarFill.clear();
    if (this.patienceActive || this.state === 'waiting_food' || this.state === 'ordering') {
      const col = frac > 0.6 ? COLORS.UI_GREEN : frac > 0.3 ? 0xFF9800 : COLORS.UI_RED;
      this.patienceBarFill.fillStyle(col);
      this.patienceBarFill.fillRoundedRect(-18, -42, 36 * frac, 5, 2.5);
    }

    // Eating progress bar — below feet at y=30, 36×4px
    if (this.state === 'eating' && this.eatDuration > 0) {
      const elapsed = this.scene.time.now - this.eatStartMs;
      const eatFrac = Math.min(1, elapsed / this.eatDuration);
      this.eatBarFill.clear();
      this.eatBarFill.fillStyle(0x4CAF50);
      this.eatBarFill.fillRoundedRect(-18, 30, 36 * eatFrac, 4, 2);
    }
  }
}
