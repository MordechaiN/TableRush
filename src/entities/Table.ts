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
  private dirtOverlay!: Phaser.GameObjects.Graphics;
  private arrowTween: Phaser.Tweens.Tween | null = null;
  private urgentAlphaTween: Phaser.Tweens.Tween | null = null;
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

    // Dirty overlay — plates, glass, crumbs drawn procedurally
    this.dirtOverlay = scene.add.graphics().setVisible(false);
    this.add(this.dirtOverlay);

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
    this.dirtOverlay.setVisible(false);
    this.clearPulse();
  }

  setOccupied(customerId: number) {
    this.state = 'occupied';
    this.customerId = customerId;
    this.dirtOverlay.setVisible(false);
    this.clearPulse();
  }

  setDirty() {
    this.state = 'dirty';
    this.customerId = -1;
    this.drawDirtOverlay();
    this.dirtOverlay.setVisible(true);
    this.setPriority('dirty');
  }

  private drawDirtOverlay() {
    const g = this.dirtOverlay;
    g.clear();

    // ALL graphics use y < -7 (container local space).
    // The front face overlay covers y ≥ -5 in local space, so these stay fully visible.
    // Table tablecloth occupies local y = -32 to +32 — all graphics are on the cloth surface.

    // Left plate (large, prominent dirty dish)
    g.fillStyle(0xF0EBE0, 1);
    g.fillCircle(-20, -20, 14);
    g.fillStyle(0xDED4C4, 1);
    g.fillCircle(-20, -20, 11);
    g.fillStyle(0xA8784A, 0.9);
    g.fillCircle(-22, -21, 7);
    g.fillCircle(-18, -18, 4);
    g.lineStyle(1.5, 0xB8B0A0, 0.8);
    g.strokeCircle(-20, -20, 13);

    // Right plate (smaller, also dirty)
    g.fillStyle(0xF0EBE0, 1);
    g.fillCircle(18, -18, 12);
    g.fillStyle(0xDED4C4, 1);
    g.fillCircle(18, -18, 9);
    g.fillStyle(0xC0905A, 0.8);
    g.fillCircle(17, -19, 5);
    g.lineStyle(1, 0xB8B0A0, 0.7);
    g.strokeCircle(18, -18, 11);

    // Glass (knocked slightly sideways)
    g.fillStyle(0xD8EEF4, 0.8);
    g.fillRoundedRect(-5, -32, 10, 14, 2);
    g.lineStyle(1.5, 0xA8CCD8, 0.9);
    g.strokeRoundedRect(-5, -32, 10, 14, 2);
    // Drink level inside
    g.fillStyle(0xFF8833, 0.5);
    g.fillRoundedRect(-4, -26, 8, 7, 1);

    // Fork (vertical, right side)
    g.lineStyle(1.5, 0xA09080, 0.7);
    g.lineBetween(34, -30, 34, -12);
    g.lineBetween(37, -30, 37, -12);
    // Knife
    g.lineStyle(1, 0xA09080, 0.6);
    g.lineBetween(35.5, -30, 35.5, -22);

    // Used napkin (crumpled rectangle)
    g.fillStyle(0xF5F0E8, 0.9);
    g.fillRoundedRect(-38, -28, 14, 11, 3);
    g.lineStyle(1, 0xDDD5C5, 0.6);
    g.strokeRoundedRect(-38, -28, 14, 11, 3);
    g.lineStyle(0.8, 0xCCC4B4, 0.4);
    g.lineBetween(-35, -25, -28, -25);
    g.lineBetween(-36, -21, -29, -21);

    // Crumbs (scattered across upper table surface)
    g.fillStyle(0xC8A878, 0.95);
    g.fillCircle(-6, -10, 2.5);
    g.fillCircle(6, -12, 2);
    g.fillCircle(10, -9, 1.5);
    g.fillCircle(-14, -11, 2);
    g.fillCircle(0, -15, 1.5);
    g.fillCircle(-25, -10, 1.5);
    g.fillCircle(28, -10, 2);
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

  flashClean() {
    this.scene.tweens.add({
      targets: this.tableBody, alpha: { from: 0.5, to: 1 },
      duration: 300, ease: 'Quad.easeOut',
    });
  }
}
