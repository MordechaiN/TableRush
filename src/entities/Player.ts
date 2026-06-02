import Phaser from 'phaser';

export class Player extends Phaser.GameObjects.Container {
  private sprite!: Phaser.GameObjects.Image;
  private trayLabel: Phaser.GameObjects.Text | null = null;
  private walkTween: Phaser.Tweens.Tween | null = null;
  private idleTween: Phaser.Tweens.Tween | null = null;
  public isWalking = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.sprite = scene.add.image(0, 0, 'player');
    this.add(this.sprite);

    scene.add.existing(this);
    this.startIdleAnim();
  }

  walkTo(x: number, y: number, onComplete?: () => void) {
    if (this.walkTween) this.walkTween.stop();
    this.stopIdleAnim();
    this.isWalking = true;
    this.sprite.setFlipX(x < this.x);

    const dist = Math.hypot(x - this.x, y - this.y);
    this.walkTween = this.scene.tweens.add({
      targets: this,
      x, y,
      duration: dist * 1.6,
      ease: 'Quad.easeInOut',
      onComplete: () => {
        this.isWalking = false;
        this.startIdleAnim();
        onComplete?.();
      },
    });
  }

  carryItem(emoji: string) {
    this.clearCarry();
    const tray = this.scene.add.image(0, -44, 'tray');
    this.add(tray);
    this.trayLabel = this.scene.add.text(0, -52, emoji, { fontSize: '18px' }).setOrigin(0.5);
    this.add(this.trayLabel);
  }

  clearCarry() {
    if (this.trayLabel) {
      // remove tray image (second-to-last child) and label
      const children = this.getAll();
      children.slice(1).forEach(c => c.destroy());
      this.trayLabel = null;
    }
  }

  bounce() {
    this.scene.tweens.add({
      targets: this.sprite, y: { from: 0, to: -8 },
      duration: 100, yoyo: true, ease: 'Quad.easeOut',
    });
  }

  private startIdleAnim() {
    this.idleTween = this.scene.tweens.add({
      targets: this.sprite,
      y: { from: 0, to: -3 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private stopIdleAnim() {
    if (this.idleTween) { this.idleTween.stop(); this.idleTween = null; }
    this.sprite.y = 0;
  }
}
