import Phaser from 'phaser';

export type TableState = 'empty' | 'occupied' | 'dirty';

// Priority levels for visual pulse system
export type TablePriority = 'none' | 'dirty' | 'requesting' | 'kitchen_ready' | 'paying' | 'urgent';

export class Table extends Phaser.GameObjects.Container {
  public id: number;
  public state: TableState = 'empty';
  public customerId = -1;

  private tableBody!: Phaser.GameObjects.Image;
  private pulseRing!: Phaser.GameObjects.Graphics;
  private dirtIcon!: Phaser.GameObjects.Text;
  private cleanBarTrack!: Phaser.GameObjects.Graphics;
  private cleanBarFill!: Phaser.GameObjects.Graphics;
  private glowTween: Phaser.Tweens.Tween | null = null;
  private cleanTween: Phaser.Tweens.Tween | null = null;
  private currentPriority: TablePriority = 'none';
  private urgencyMultiplier = 1.0; // 1.0 = primary, 0.35 = secondary

  constructor(scene: Phaser.Scene, x: number, y: number, id: number) {
    super(scene, x, y);
    this.id = id;

    // Shadow
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.15);
    shadow.fillEllipse(0, 8, 110, 30);
    this.add(shadow);

    this.tableBody = scene.add.image(0, 0, 'table');
    this.add(this.tableBody);

    this.pulseRing = scene.add.graphics();
    this.add(this.pulseRing);

    this.dirtIcon = scene.add.text(38, -26, '🧹', { fontSize: '16px' }).setOrigin(0.5).setVisible(false);
    this.add(this.dirtIcon);

    this.cleanBarTrack = scene.add.graphics();
    this.cleanBarTrack.fillStyle(0x888888, 0.3);
    this.cleanBarTrack.fillRoundedRect(-30, 28, 60, 7, 3);
    this.cleanBarTrack.setVisible(false);
    this.add(this.cleanBarTrack);

    this.cleanBarFill = scene.add.graphics();
    this.cleanBarFill.setVisible(false);
    this.add(this.cleanBarFill);

    scene.add.existing(this);
    this.setInteractive(new Phaser.Geom.Rectangle(-55, -38, 110, 76), Phaser.Geom.Rectangle.Contains);
  }

  setEmpty() {
    this.state = 'empty';
    this.customerId = -1;
    this.dirtIcon.setVisible(false);
    this.clearPulse();
  }

  setOccupied(customerId: number) {
    this.state = 'occupied';
    this.customerId = customerId;
    this.dirtIcon.setVisible(false);
    this.clearPulse();
  }

  setDirty() {
    this.state = 'dirty';
    this.customerId = -1;
    this.dirtIcon.setVisible(true);
    this.setPriority('dirty');
  }

  setPriority(priority: TablePriority) {
    if (priority === this.currentPriority) return;
    this.currentPriority = priority;
    this.clearPulse();

    if (priority === 'none') return;

    const configs: Record<Exclude<TablePriority, 'none'>, { color: number; alpha: number; duration: number }> = {
      urgent:       { color: 0xF44336, alpha: 0.7, duration: 300 },
      paying:       { color: 0xFFD700, alpha: 0.6, duration: 600 },
      kitchen_ready:{ color: 0xFF6B35, alpha: 0.55, duration: 500 },
      requesting:   { color: 0x2196F3, alpha: 0.5, duration: 700 },
      dirty:        { color: 0x888888, alpha: 0.35, duration: 900 },
    };

    const cfg = configs[priority];
    const m = this.urgencyMultiplier;
    this.pulseRing.clear();
    this.pulseRing.lineStyle(4, cfg.color, cfg.alpha * m);
    this.pulseRing.strokeRoundedRect(-55, -38, 110, 76, 10);

    this.glowTween = this.scene.tweens.add({
      targets: this.pulseRing,
      alpha: { from: cfg.alpha * m, to: 0.1 * m },
      duration: cfg.duration,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  setUrgencyLevel(isPrimary: boolean) {
    const newMultiplier = isPrimary ? 1.0 : 0.35;
    if (this.urgencyMultiplier === newMultiplier) return;
    this.urgencyMultiplier = newMultiplier;
    if (this.currentPriority !== 'none') {
      const p = this.currentPriority;
      this.currentPriority = 'none';
      this.setPriority(p);
    }
  }

  clearPulse() {
    this.currentPriority = 'none';
    if (this.glowTween) { this.glowTween.stop(); this.glowTween = null; }
    this.pulseRing.clear();
    this.pulseRing.setAlpha(1);
  }

  startCleaningProgress(duration: number, onComplete: () => void) {
    this.cleanBarTrack.setVisible(true);
    this.cleanBarFill.setVisible(true);

    const prog = { value: 0 };
    this.cleanTween = this.scene.tweens.add({
      targets: prog,
      value: 1,
      duration,
      ease: 'Linear',
      onUpdate: () => {
        this.cleanBarFill.clear();
        this.cleanBarFill.fillStyle(0x4CAF50);
        this.cleanBarFill.fillRoundedRect(-30, 28, 60 * prog.value, 7, 3);
      },
      onComplete: () => {
        this.cleanBarTrack.setVisible(false);
        this.cleanBarFill.setVisible(false);
        this.cleanBarFill.clear();
        this.cleanTween = null;
        onComplete();
      },
    });
  }

  flashClean() {
    this.scene.tweens.add({
      targets: this.tableBody, alpha: { from: 0.5, to: 1 },
      duration: 300, ease: 'Quad.easeOut',
    });
  }
}
