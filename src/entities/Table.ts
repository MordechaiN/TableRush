import Phaser from 'phaser';

export type TableState = 'empty' | 'occupied' | 'dirty';

export type TablePriority = 'none' | 'dirty' | 'requesting' | 'kitchen_ready' | 'paying' | 'urgent';

export class Table extends Phaser.GameObjects.Container {
  public id: number;
  public state: TableState = 'empty';
  public customerId = -1;

  private tableBody!: Phaser.GameObjects.Image;
  // Arrow is a SCENE-LEVEL object (not a container child) so it renders above customers
  private actionArrow!: Phaser.GameObjects.Graphics;
  private dirtIcon!: Phaser.GameObjects.Text;
  private cleanBarTrack!: Phaser.GameObjects.Graphics;
  private cleanBarFill!: Phaser.GameObjects.Graphics;
  private arrowTween: Phaser.Tweens.Tween | null = null;
  private urgentAlphaTween: Phaser.Tweens.Tween | null = null;
  private cleanTween: Phaser.Tweens.Tween | null = null;
  private currentPriority: TablePriority = 'none';
  private arrowBaseScale = 1.0; // 1.0 = primary, 0.35 = secondary

  // World position of arrow anchor (above and outside customer sprite area)
  private arrowWorldX: number;
  private arrowWorldY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, id: number) {
    super(scene, x, y);
    this.id = id;

    // Arrow anchor: 75px above table center, above customer sprite top (table.y−20, sprite top table.y−56)
    this.arrowWorldX = x;
    this.arrowWorldY = y - 72;

    // Shadow
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.15);
    shadow.fillEllipse(0, 8, 110, 30);
    this.add(shadow);

    this.tableBody = scene.add.image(0, 0, 'table');
    this.add(this.tableBody);

    this.dirtIcon = scene.add.text(38, -26, '🧹', { fontSize: '20px' }).setOrigin(0.5).setVisible(false);
    this.add(this.dirtIcon);

    this.cleanBarTrack = scene.add.graphics();
    this.cleanBarTrack.fillStyle(0x888888, 0.3);
    this.cleanBarTrack.fillRoundedRect(-30, 28, 60, 7, 3);
    this.cleanBarTrack.setVisible(false);
    this.add(this.cleanBarTrack);

    this.cleanBarFill = scene.add.graphics();
    this.cleanBarFill.setVisible(false);
    this.add(this.cleanBarFill);

    // Action arrow: scene-level graphics at depth 15 — renders above everything
    this.actionArrow = scene.add.graphics().setDepth(15);
    this.actionArrow.setPosition(this.arrowWorldX, this.arrowWorldY);
    this.actionArrow.setVisible(false);

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

    if (this.arrowTween) { this.arrowTween.stop(); this.arrowTween = null; }

    if (priority === 'none') {
      this.actionArrow.setVisible(false);
      return;
    }

    const configs: Record<Exclude<TablePriority, 'none'>, { color: number; duration: number }> = {
      urgent:       { color: 0xE74C3C, duration: 140 },
      paying:       { color: 0xFFD700, duration: 580 },
      kitchen_ready:{ color: 0xFF6B35, duration: 480 },
      requesting:   { color: 0x3498DB, duration: 680 },
      dirty:        { color: 0xC4823A, duration: 900 },
    };

    const cfg = configs[priority];
    this.drawArrow(cfg.color, priority === 'urgent');
    this.actionArrow.setAlpha(0.95);
    this.actionArrow.setScale(this.arrowBaseScale);
    this.actionArrow.setVisible(true);

    const s = this.arrowBaseScale;

    if (priority === 'urgent') {
      // Urgent: faster scale swing + rapid alpha strobe — conveys panic
      const urgentScale = s * 1.25;
      this.arrowTween = this.scene.tweens.add({
        targets: this.actionArrow,
        scale: { from: s * 0.92, to: urgentScale },
        duration: cfg.duration,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
      this.urgentAlphaTween = this.scene.tweens.add({
        targets: this.actionArrow,
        alpha: { from: 0.98, to: 0.48 },
        duration: 180,
        yoyo: true, repeat: -1, ease: 'Quad.easeInOut',
      });
    } else {
      this.arrowTween = this.scene.tweens.add({
        targets: this.actionArrow,
        scale: { from: s * 0.88, to: s * 1.14 },
        duration: cfg.duration,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }
  }

  setUrgencyLevel(isPrimary: boolean) {
    const newBaseScale = isPrimary ? 1.0 : 0.35;
    if (this.arrowBaseScale === newBaseScale) return;
    this.arrowBaseScale = newBaseScale;
    if (this.currentPriority !== 'none') {
      const p = this.currentPriority;
      this.currentPriority = 'none';
      this.setPriority(p);
    }
  }

  clearPulse() {
    this.currentPriority = 'none';
    if (this.arrowTween) { this.arrowTween.stop(); this.arrowTween = null; }
    if (this.urgentAlphaTween) { this.urgentAlphaTween.stop(); this.urgentAlphaTween = null; }
    this.actionArrow.setAlpha(0.95);
    this.actionArrow.setVisible(false);
  }

  private drawArrow(color: number, isUrgent = false) {
    this.actionArrow.clear();
    const w = isUrgent ? 18 : 15;
    const h = isUrgent ? 14 : 12;
    // Drop shadow
    this.actionArrow.fillStyle(0x000000, 0.28);
    this.actionArrow.fillTriangle(-(w - 1), -8, (w - 1), -8, 0, h + 2);
    // Main fill
    this.actionArrow.fillStyle(color, 1.0);
    this.actionArrow.fillTriangle(-w, -10, w, -10, 0, h);
    // Highlight (upper portion)
    this.actionArrow.fillStyle(0xFFFFFF, isUrgent ? 0.48 : 0.38);
    this.actionArrow.fillTriangle(-Math.round(w * 0.6), -10, Math.round(w * 0.6), -10, 0, -1);
    // Bold black outline
    this.actionArrow.lineStyle(2.5, 0x1A1A1A, 1.0);
    this.actionArrow.strokeTriangle(-w, -10, w, -10, 0, h);
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
