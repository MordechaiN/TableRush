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
  private bubble!: Phaser.GameObjects.Container;
  private bubbleTween: Phaser.Tweens.Tween | null = null;

  private maxPatience: number;
  private patience: number;
  private patienceActive = false;

  constructor(scene: Phaser.Scene, x: number, y: number, variantIndex: number, maxPatience: number) {
    super(scene, x, y);
    this.variantIndex = variantIndex % 7;
    this.maxPatience = maxPatience;
    this.patience = maxPatience;

    this.bodySprite = scene.add.image(0, 0, `customer_${this.variantIndex}`);
    this.add(this.bodySprite);

    this.face = scene.add.graphics();
    this.add(this.face);

    // Patience bar track
    const track = scene.add.graphics();
    track.fillStyle(0x2C1810, 0.4);
    track.fillRoundedRect(-30, 30, 60, 8, 4);
    this.add(track);

    this.patienceBarFill = scene.add.graphics();
    this.add(this.patienceBarFill);

    this.bubble = scene.add.container(0, -52);
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

  private buildBubble(content: string, borderColor: number) {
    if (this.bubbleTween) { this.bubbleTween.stop(); this.bubbleTween = null; }
    this.bubble.removeAll(true);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0xFDFAF6);
    bg.fillRoundedRect(-28, -18, 56, 36, 8);
    bg.lineStyle(2, borderColor);
    bg.strokeRoundedRect(-28, -18, 56, 36, 8);
    // bubble tail
    bg.fillStyle(0xFDFAF6);
    bg.fillTriangle(-6, 18, 6, 18, 0, 26);

    const txt = this.scene.add.text(0, 0, content, {
      fontSize: content.length > 3 ? '11px' : '20px',
      color: '#2C1810',
    }).setOrigin(0.5);

    this.bubble.add([bg, txt]);
    this.bubble.setScale(0);
    this.bubble.setVisible(true);
    this.scene.tweens.add({
      targets: this.bubble, scaleX: 1, scaleY: 1,
      duration: 200, ease: 'Back.easeOut',
    });
  }

  private bubblePulse() {
    this.bubbleTween = this.scene.tweens.add({
      targets: this.bubble, scaleX: { from: 0.9, to: 1.1 }, scaleY: { from: 0.9, to: 1.1 },
      duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      delay: 250,
    });
  }

  private drawFace(mood: 'neutral' | 'happy' | 'hungry' | 'angry') {
    this.face.clear();
    const eyeY = -4;
    this.face.fillStyle(0x2C1810);

    if (mood === 'angry') {
      // angry eyebrows
      this.face.fillStyle(0xF44336, 0.9);
      this.face.fillRect(-8, eyeY - 6, 5, 2);
      this.face.fillRect(3, eyeY - 6, 5, 2);
    }
    // eyes
    this.face.fillStyle(0x2C1810);
    this.face.fillCircle(-5, eyeY, mood === 'happy' ? 2 : 2.5);
    this.face.fillCircle(5, eyeY, mood === 'happy' ? 2 : 2.5);

    // mouth
    this.face.lineStyle(2, 0x2C1810);
    if (mood === 'happy') {
      this.face.beginPath();
      this.face.arc(0, eyeY + 6, 5, 0, Math.PI, false);
      this.face.strokePath();
    } else if (mood === 'angry') {
      this.face.beginPath();
      this.face.arc(0, eyeY + 10, 5, Math.PI, 0, false);
      this.face.strokePath();
    } else if (mood === 'hungry') {
      this.face.fillStyle(0x2C1810);
      this.face.fillRect(-4, eyeY + 8, 8, 2);
    } else {
      this.face.fillStyle(0x2C1810);
      this.face.fillRect(-4, eyeY + 7, 8, 2);
    }
  }

  preUpdate(_time: number, delta: number) {
    if (this.patienceActive && this.patience > 0) {
      this.patience -= delta;
    }

    const frac = this.getPatienceFraction();

    // Update mood face
    if (this.state === 'eating' || this.state === 'paying') {
      this.drawFace('happy');
    } else if (frac < 0.2) {
      this.drawFace('angry');
    } else if (frac < 0.5) {
      this.drawFace('hungry');
    } else {
      this.drawFace('neutral');
    }

    // Patience bar
    this.patienceBarFill.clear();
    if (this.patienceActive || this.state === 'waiting_food' || this.state === 'ordering') {
      const col = frac > 0.6 ? COLORS.UI_GREEN : frac > 0.3 ? 0xFF9800 : COLORS.UI_RED;
      this.patienceBarFill.fillStyle(col);
      this.patienceBarFill.fillRoundedRect(-30, 30, 60 * frac, 8, 4);
    }
  }
}
