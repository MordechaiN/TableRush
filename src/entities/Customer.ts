import Phaser from 'phaser';
import { MENU_ITEMS, COLORS } from '../config/GameConfig';

export type CustomerState = 'entering' | 'waiting_seat' | 'seated' | 'ordering' | 'waiting_food' | 'eating' | 'paying' | 'leaving' | 'angry';

export interface OrderItem {
  itemId: number;
  name: string;
  emoji: string;
  price: number;
}

export class Customer extends Phaser.GameObjects.Container {
  public state: CustomerState = 'entering';
  public tableId: number = -1;
  public order: OrderItem | null = null;
  public colorIndex: number;

  private sprite: Phaser.GameObjects.Image;
  private patienceBar!: Phaser.GameObjects.Graphics;
  private patienceBarBg!: Phaser.GameObjects.Image;
  private bubble!: Phaser.GameObjects.Container;
  private maxPatience: number;
  private patience: number;
  private patienceActive = false;

  constructor(scene: Phaser.Scene, x: number, y: number, colorIndex: number, maxPatience: number) {
    super(scene, x, y);
    this.colorIndex = colorIndex;
    this.maxPatience = maxPatience;
    this.patience = maxPatience;

    this.sprite = scene.add.image(0, 0, `customer_${colorIndex % 7}`);
    this.add(this.sprite);

    // Patience bar
    this.patienceBarBg = scene.add.image(0, -32, 'bar_bg');
    this.add(this.patienceBarBg);

    this.patienceBar = scene.add.graphics();
    this.add(this.patienceBar);

    // Speech bubble (hidden initially)
    this.bubble = scene.add.container(0, -60);
    this.bubble.setVisible(false);
    this.add(this.bubble);

    scene.add.existing(this);
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
  }

  showOrder(itemId: number) {
    const item = MENU_ITEMS[itemId];
    this.order = { itemId, name: item.name, emoji: item.emoji, price: item.price };

    this.bubble.removeAll(true);
    const bg = this.scene.add.image(0, 0, 'bubble');
    const txt = this.scene.add.text(0, -8, item.emoji, { fontSize: '22px' }).setOrigin(0.5);
    this.bubble.add([bg, txt]);
    this.bubble.setVisible(true);
    this.scene.tweens.add({ targets: this.bubble, scaleX: [0, 1], scaleY: [0, 1], duration: 200, ease: 'Back.easeOut' });
  }

  hideOrder() {
    this.bubble.setVisible(false);
  }

  isAngry() {
    return this.patience <= 0;
  }

  getPatienceFraction() {
    return Math.max(0, this.patience / this.maxPatience);
  }

  preUpdate(_time: number, delta: number) {
    if (this.patienceActive && this.patience > 0) {
      this.patience -= delta;
    }

    // Redraw patience bar
    const frac = this.getPatienceFraction();
    this.patienceBar.clear();
    if (this.state === 'seated' || this.state === 'waiting_food' || this.state === 'ordering') {
      const col = frac > 0.5 ? COLORS.GREEN : frac > 0.25 ? COLORS.ACCENT2 : COLORS.ACCENT;
      this.patienceBar.fillStyle(col);
      this.patienceBar.fillRoundedRect(-40 + 1, -37, 78 * frac, 6, 3);
    }
  }
}
