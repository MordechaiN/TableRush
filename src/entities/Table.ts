import Phaser from 'phaser';
import { COLORS } from '../config/GameConfig';

export type TableState = 'empty' | 'occupied' | 'dirty' | 'served';

export class Table extends Phaser.GameObjects.Container {
  public id: number;
  public state: TableState = 'empty';
  public customerId: number = -1;

  private tableImg: Phaser.GameObjects.Image;
  private stateIndicator: Phaser.GameObjects.Graphics;
  private dirtIndicator: Phaser.GameObjects.Text;
  private glowTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, id: number) {
    super(scene, x, y);
    this.id = id;

    this.tableImg = scene.add.image(0, 0, 'table');
    this.add(this.tableImg);

    // Chair indicators (4 sides)
    const chairOffsets = [[-44, 0], [44, 0], [0, -30], [0, 30]];
    chairOffsets.forEach(([cx, cy]) => {
      this.add(scene.add.image(cx, cy, 'chair'));
    });

    this.stateIndicator = scene.add.graphics();
    this.add(this.stateIndicator);

    this.dirtIndicator = scene.add.text(0, 0, '🧹', { fontSize: '24px' }).setOrigin(0.5).setVisible(false);
    this.add(this.dirtIndicator);

    scene.add.existing(this);
    this.setInteractive(new Phaser.Geom.Rectangle(-50, -35, 100, 70), Phaser.Geom.Rectangle.Contains);
  }

  setEmpty() {
    this.state = 'empty';
    this.customerId = -1;
    this.stateIndicator.clear();
    this.dirtIndicator.setVisible(false);
    this.stopGlow();
  }

  setOccupied(customerId: number) {
    this.state = 'occupied';
    this.customerId = customerId;
    this.dirtIndicator.setVisible(false);
  }

  setDirty() {
    this.state = 'dirty';
    this.customerId = -1;
    this.dirtIndicator.setVisible(true);
    this.startGlow(COLORS.GRAY);
  }

  setNeedsAttention() {
    this.startGlow(COLORS.ACCENT);
  }

  stopGlow() {
    if (this.glowTween) {
      this.glowTween.stop();
      this.glowTween = null;
    }
    this.tableImg.setAlpha(1);
  }

  private startGlow(color: number) {
    this.stopGlow();
    this.glowTween = this.scene.tweens.add({
      targets: this.tableImg,
      alpha: { from: 1, to: 0.6 },
      duration: 600,
      yoyo: true,
      repeat: -1,
    });
  }
}
