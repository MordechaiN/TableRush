import Phaser from 'phaser';

export class Player extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Image;
  private carrying: Phaser.GameObjects.Text | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.sprite = scene.add.image(0, 0, 'player');
    this.add(this.sprite);
    scene.add.existing(this);
  }

  walkTo(x: number, y: number, onComplete?: () => void) {
    this.sprite.setFlipX(x < this.x);
    this.scene.tweens.add({
      targets: this,
      x, y,
      duration: Math.hypot(x - this.x, y - this.y) * 1.8,
      ease: 'Quad.easeInOut',
      onComplete,
    });
  }

  carryItem(emoji: string) {
    this.clearCarry();
    this.carrying = this.scene.add.text(0, -38, emoji, { fontSize: '20px' }).setOrigin(0.5);
    this.add(this.carrying);
  }

  clearCarry() {
    if (this.carrying) {
      this.carrying.destroy();
      this.carrying = null;
    }
  }

  bounce() {
    this.scene.tweens.add({
      targets: this,
      y: this.y - 8,
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }
}
