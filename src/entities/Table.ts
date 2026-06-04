import Phaser from 'phaser';

export type TableState = 'empty' | 'occupied' | 'dirty';

export type TablePriority = 'none' | 'dirty' | 'seating' | 'requesting' | 'kitchen_ready' | 'paying' | 'urgent';

export class Table extends Phaser.GameObjects.Container {
  public id: number;
  public state: TableState = 'empty';
  public customerId = -1;

  private tableBody!: Phaser.GameObjects.Image;
  // Arrow is a SCENE-LEVEL object (not a container child) so it renders above customers
  private actionArrow!: Phaser.GameObjects.Graphics;
  private dirtOverlay!: Phaser.GameObjects.Graphics;
  private stateVisual!: Phaser.GameObjects.Graphics;
  private stateGlow!: Phaser.GameObjects.Graphics;
  private stateGlowTween: Phaser.Tweens.Tween | null = null;
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

    // State glow — color changes based on table state (below table body)
    this.stateGlow = scene.add.graphics();
    this.stateGlow.setAlpha(0);
    this.add(this.stateGlow);

    this.tableBody = scene.add.image(0, 0, 'table');
    this.add(this.tableBody);

    // Dirty overlay — plates, glass, crumbs drawn procedurally
    this.dirtOverlay = scene.add.graphics().setVisible(false);
    this.add(this.dirtOverlay);

    // State visual — small object drawn on table surface to communicate current state
    // Positioned at upper-left (container x: -40 to -22, y: -30 to -8) — clear of:
    //   • customer sprite (center x:-24 to +24)
    //   • front-face overlay (starts at container y = -5)
    //   • candle (container x=34, y=-18)
    //   • table number badge (container x=33, y=-44)
    this.stateVisual = scene.add.graphics();
    this.add(this.stateVisual);

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
    this.stateVisual.clear();
    this.tableBody.clearTint();
    this.setGlowState('empty');
    this.clearPulse();
  }

  setOccupied(customerId: number) {
    this.state = 'occupied';
    this.customerId = customerId;
    this.dirtOverlay.setVisible(false);
    this.stateVisual.clear();
    this.tableBody.clearTint();
    this.setGlowState('seated');
    this.clearPulse();
  }

  setDirty() {
    this.state = 'dirty';
    this.customerId = -1;
    this.stateVisual.clear();
    this.drawDirtOverlay();
    this.dirtOverlay.setVisible(true);
    this.tableBody.clearTint();
    this.setGlowState('dirty');
    this.setPriority('dirty');
  }

  setPayingGlow() { this.setGlowState('paying'); }

  private setGlowState(state: 'empty' | 'seated' | 'paying' | 'dirty' | 'off') {
    if (this.stateGlowTween) { this.stateGlowTween.stop(); this.stateGlowTween = null; }
    this.stateGlow.clear();
    if (state === 'off' || state === 'empty') { this.stateGlow.setAlpha(0); return; }

    const colors: Record<string, number> = {
      seated: 0xFFEE88,
      paying: 0xFFD700,
      dirty: 0xFF8833,
    };
    const color = colors[state] ?? 0xFFFFFF;
    this.stateGlow.fillStyle(color, 1);
    this.stateGlow.fillEllipse(0, 6, 168, 128);
    const maxA = state === 'paying' ? 0.60 : state === 'dirty' ? 0.42 : 0.38;
    const minA = maxA * 0.38;
    this.stateGlow.setAlpha(maxA);
    this.stateGlowTween = this.scene.tweens.add({
      targets: this.stateGlow,
      alpha: { from: maxA, to: minA },
      duration: state === 'paying' ? 500 : 900,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  // Draw a small contextual object on the table surface to communicate state.
  // All drawings at container x: -40 to -20, y: -30 to -8 — above overlay, left of customer.
  setStateVisual(type: 'none' | 'menu' | 'ticket' | 'plate' | 'bill') {
    const g = this.stateVisual;
    g.clear();
    if (type === 'none') return;

    if (type === 'menu') {
      // Open menu booklet — dark green cover, cream pages
      g.fillStyle(0x1B5E20, 1);
      g.fillRoundedRect(-40, -29, 16, 20, 2);
      g.fillStyle(0xFFF8F0, 1);
      g.fillRoundedRect(-39, -28, 12, 17, 1);
      // Spine
      g.fillStyle(0x0A3D0A, 1);
      g.fillRect(-40, -29, 2, 20);
      // Text lines
      g.fillStyle(0x555555, 0.55);
      g.fillRect(-36, -25, 8, 1.5);
      g.fillRect(-36, -22, 8, 1.5);
      g.fillRect(-36, -19, 6, 1.5);
      g.fillRect(-36, -16, 7, 1.5);
      g.fillRect(-36, -13, 5, 1.5);
    } else if (type === 'ticket') {
      // Order ticket slip — white paper with printed lines and a warm stamp
      g.fillStyle(0xFFFFFF, 0.97);
      g.fillRoundedRect(-40, -31, 18, 25, 2);
      // Tear perforation
      g.lineStyle(0.8, 0xCCCCCC, 0.7);
      g.lineBetween(-40, -23, -22, -23);
      // Heading line
      g.fillStyle(0x222222, 0.5);
      g.fillRect(-38, -29, 14, 2);
      // Text lines
      g.fillStyle(0x444444, 0.35);
      g.fillRect(-38, -20, 12, 1.5);
      g.fillRect(-38, -17, 10, 1.5);
      g.fillRect(-38, -14, 12, 1.5);
      g.fillRect(-38, -11, 8, 1.5);
      // Stamp circle
      g.lineStyle(1.5, 0xFF6B35, 0.75);
      g.strokeCircle(-30, -9, 5);
      g.fillStyle(0xFF6B35, 0.18);
      g.fillCircle(-30, -9, 5);
    } else if (type === 'plate') {
      // Plate with food — rim, inner plate, food blob, garnish
      g.fillStyle(0xEDE8DC, 1);      // rim
      g.fillCircle(-30, -20, 16);
      g.fillStyle(0xFAF8F4, 1);      // inner
      g.fillCircle(-30, -20, 12);
      g.fillStyle(0xE07820, 0.95);   // main food
      g.fillCircle(-30, -20, 8);
      g.fillStyle(0x5A9920, 0.88);   // garnish
      g.fillCircle(-36, -23, 3);
      g.fillCircle(-24, -25, 2.5);
      g.lineStyle(1.5, 0xD0C8BA, 0.9);
      g.strokeCircle(-30, -20, 16);
    } else if (type === 'bill') {
      // Check presenter — dark leather folder with gold clasp
      g.fillStyle(0x3E1C02, 1);      // dark leather
      g.fillRoundedRect(-42, -29, 24, 17, 3);
      g.fillStyle(0x2A1002, 0.7);    // fold shadow
      g.fillRect(-31, -29, 2, 17);
      // Gold corner ornaments
      g.fillStyle(0xFFCC22, 0.9);
      g.fillRoundedRect(-41, -28, 3, 3, 0.5);
      g.fillRoundedRect(-20, -28, 3, 3, 0.5);
      // $ amount lines
      g.fillStyle(0xFFE0A0, 0.7);
      g.fillRect(-39, -22, 10, 1.5);
      g.fillRect(-39, -19, 8, 1.5);
      // Gold clasp
      g.fillStyle(0xFFCC22, 1);
      g.fillRoundedRect(-33, -22, 5, 7, 1.5);
      g.fillStyle(0xAA8800, 0.6);
      g.fillRoundedRect(-32, -21, 3, 5, 1);
    }
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
      seating:      { color: 0x9B59B6, duration: 700 },
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
    // Secondary tables are completely hidden — only the #1 priority indicator is visible.
    // Keeping the state (currentPriority, tweens) intact so it snaps back when promoted.
    if (isPrimary) {
      if (this.currentPriority !== 'none') {
        this.actionArrow.setVisible(true);
        this.actionArrow.setAlpha(0.95);
      }
    } else {
      this.actionArrow.setAlpha(0);
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
    const w = isUrgent ? 25 : 20;
    const h = isUrgent ? 20 : 16;
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
