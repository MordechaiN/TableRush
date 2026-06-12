import Phaser from 'phaser';

export type PlayerEmotion = 'normal' | 'happy' | 'stressed' | 'excited' | 'proud';

const EMOTION_PRIORITY: Record<PlayerEmotion, number> = {
  normal: 0, happy: 1, proud: 2, stressed: 2, excited: 3,
};

export class Player extends Phaser.GameObjects.Container {
  private sprite!: Phaser.GameObjects.Image;
  private face!: Phaser.GameObjects.Graphics;
  private trayContainer: Phaser.GameObjects.Container | null = null;
  private emotionBadge: Phaser.GameObjects.Text | null = null;
  private dirtyBadge: Phaser.GameObjects.Graphics | null = null;
  private walkTween: Phaser.Tweens.Tween | null = null;
  private walkAnimTimer: Phaser.Time.TimerEvent | null = null;
  private walkFrame = 0;
  private idleTween: Phaser.Tweens.Tween | null = null;
  private traySway: Phaser.Tweens.Tween | null = null;
  private revertTimer: Phaser.Time.TimerEvent | null = null;
  public isWalking = false;
  private currentEmotion: PlayerEmotion = 'normal';
  private walkSpeedMultiplier = 1.0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.sprite = scene.add.image(0, 0, 'player');
    this.add(this.sprite);
    this.face = scene.add.graphics();
    this.add(this.face);
    this.setDepth(17);
    this.setScale(2.0);
    scene.add.existing(this);
    this.drawFace('normal');
    this.startIdleAnim();
  }

  setWalkSpeed(multiplier: number) {
    this.walkSpeedMultiplier = multiplier;
  }

  walkTo(x: number, y: number, onComplete?: () => void) {
    if (this.walkTween) this.walkTween.stop();

    // Reset tray rotation before new walk
    if (this.traySway) { this.traySway.stop(); this.traySway = null; }
    if (this.trayContainer) this.trayContainer.setRotation(0);

    this.stopIdleAnim();
    this.isWalking = true;
    this.sprite.setFlipX(x < this.x);
    this.startWalkAnim();

    // Tray sway: subtle pendulum while walking — makes carrying food feel physical
    if (this.trayContainer) {
      this.traySway = this.scene.tweens.add({
        targets: this.trayContainer,
        rotation: { from: -0.09, to: 0.09 },
        duration: 290, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }

    const dist = Math.hypot(x - this.x, y - this.y);
    this.walkTween = this.scene.tweens.add({
      targets: this, x, y,
      duration: dist * 1.15 / this.walkSpeedMultiplier, ease: 'Quad.easeOut',
      onComplete: () => {
        // Stop sway + snap tray back to level when arriving
        if (this.traySway) { this.traySway.stop(); this.traySway = null; }
        if (this.trayContainer) {
          this.scene.tweens.add({
            targets: this.trayContainer, rotation: 0,
            duration: 120, ease: 'Back.easeOut',
          });
        }
        this.stopWalkAnim();
        this.isWalking = false;
        this.startIdleAnim();
        onComplete?.();
      },
    });
  }

  // Always-visible tray: shows all capacity slots, filled or empty.
  // Call with itemIds=[] to show an empty tray. capacity=0 hides tray entirely.
  showTray(itemIds: number[], capacity: number) {
    this.clearCarry();
    if (capacity === 0) return;

    const tray = this.scene.add.container(0, -52);
    tray.setDepth(1);
    this.trayContainer = tray;
    this.add(tray);

    // Tray base
    if (this.scene.textures.exists('tray')) {
      tray.add(this.scene.add.image(0, 0, 'tray'));
    } else {
      const g = this.scene.add.graphics();
      const w = capacity * 26 + 12;
      g.fillStyle(0x7A4A1E, 1);
      g.fillRoundedRect(-w / 2, -12, w, 20, 5);
      g.fillStyle(0xC4874A, 0.55);
      g.fillRoundedRect(-w / 2 + 2, -11, w - 4, 8, 3);
      tray.add(g);
    }

    const slotSpacing = capacity <= 2 ? 24 : capacity === 3 ? 20 : 17;
    const totalW = (capacity - 1) * slotSpacing;
    const startX = -totalW / 2;
    const slotY = -12;
    const foodScale = capacity <= 2 ? 0.38 : capacity === 3 ? 0.32 : 0.27;

    for (let i = 0; i < capacity; i++) {
      const sx = startX + i * slotSpacing;
      if (i < itemIds.length) {
        const foodKey = `food_${itemIds[i]}`;
        if (this.scene.textures.exists(foodKey)) {
          tray.add(this.scene.add.image(sx, slotY, foodKey).setScale(foodScale).setOrigin(0.5));
        } else {
          const dot = this.scene.add.graphics();
          dot.fillStyle(0xFFFFFF, 0.8);
          dot.fillCircle(sx, slotY, 6);
          tray.add(dot);
        }
      } else {
        const ring = this.scene.add.graphics();
        ring.lineStyle(1.5, 0xFFFFFF, 0.45);
        ring.strokeCircle(sx, slotY, 8);
        ring.fillStyle(0x000000, 0.15);
        ring.fillCircle(sx, slotY, 8);
        tray.add(ring);
      }
    }

    // Pop-in bounce when tray is shown (e.g. after picking up food)
    tray.setScale(0);
    this.scene.tweens.add({ targets: tray, scale: 1, duration: 180, ease: 'Back.easeOut' });
  }

  clearCarry() {
    // Stop any active sway before destroying tray
    if (this.traySway) { this.traySway.stop(); this.traySway = null; }
    if (this.trayContainer) { this.trayContainer.destroy(); this.trayContainer = null; }
  }

  deliverAnim() {
    // Dish bounce: plant the plate with a satisfying arc-and-settle
    this.scene.tweens.add({
      targets: this.sprite,
      y: { from: 0, to: -14 }, scaleX: { from: 1, to: 1.2 }, scaleY: { from: 1, to: 1.2 },
      duration: 140, yoyo: true, ease: 'Back.easeOut',
    });
    // Tray pop on delivery
    if (this.trayContainer) {
      this.scene.tweens.add({
        targets: this.trayContainer,
        y: { from: -52, to: -62 },
        duration: 110, yoyo: true, ease: 'Quad.easeOut',
      });
    }
  }

  collectAnim() {
    this.scene.tweens.add({
      targets: this.sprite,
      y: { from: 0, to: 9 }, scaleX: { from: 1, to: 0.88 }, scaleY: { from: 1, to: 0.88 },
      duration: 140, yoyo: true, ease: 'Quad.easeIn',
    });
  }

  showDirtyDish() {
    this.dirtyBadge?.destroy();
    const g = this.scene.add.graphics();
    // Dirty plate indicator — small grey plate with orange food smear
    g.fillStyle(0xD8D0C4, 1);
    g.fillCircle(22, 8, 8);
    g.fillStyle(0xC0B8B0, 1);
    g.fillCircle(22, 8, 6);
    g.fillStyle(0xC08030, 0.85);
    g.fillCircle(21, 7, 3.5);
    g.lineStyle(1, 0xB0A898, 0.8);
    g.strokeCircle(22, 8, 8);
    this.dirtyBadge = g;
    this.add(this.dirtyBadge);
  }

  hideDirtyDish() {
    this.dirtyBadge?.destroy();
    this.dirtyBadge = null;
  }

  bounce() {
    this.scene.tweens.add({
      targets: this.sprite, y: { from: 0, to: -8 },
      duration: 100, yoyo: true, ease: 'Quad.easeOut',
    });
  }

  showBusy() {
    this.sprite.setTint(0xFF2222);
    this.scene.time.delayedCall(380, () => {
      this.currentEmotion === 'excited' ? this.sprite.setTint(0xFFDD44) : this.sprite.clearTint();
    });
    const origX = this.sprite.x;
    this.scene.tweens.add({
      targets: this.sprite, x: { from: origX - 5, to: origX + 5 },
      duration: 55, yoyo: true, repeat: 3,
      onComplete: () => { this.sprite.x = origX; },
    });
    this.drawFace('stressed');
    this.scene.time.delayedCall(440, () => this.drawFace(this.currentEmotion));
  }

  setEmotion(emotion: PlayerEmotion, revertAfterMs = 0) {
    if (emotion !== 'normal' &&
        EMOTION_PRIORITY[emotion] < EMOTION_PRIORITY[this.currentEmotion]) return;
    if (this.revertTimer) { this.revertTimer.remove(); this.revertTimer = null; }
    this.currentEmotion = emotion;
    this.drawFace(emotion);
    if (this.emotionBadge) { this.emotionBadge.destroy(); this.emotionBadge = null; }
    switch (emotion) {
      case 'excited': this.sprite.setTint(0xFFDD44); break;
      case 'stressed': this.sprite.setTint(0xFFBBBB); break;
      default: this.sprite.clearTint();
    }
    const BADGES: Partial<Record<PlayerEmotion, string>> = {
      happy: '♡', excited: '★', stressed: '!!', proud: '✓',
    };
    const badge = BADGES[emotion];
    if (badge) {
      this.emotionBadge = this.scene.add.text(18, -52, badge, { fontSize: '16px' }).setOrigin(0.5);
      this.add(this.emotionBadge);
      this.scene.tweens.add({ targets: this.emotionBadge, scale: { from: 0, to: 1 }, duration: 200, ease: 'Back.easeOut' });
    }
    if (revertAfterMs > 0) {
      this.revertTimer = this.scene.time.delayedCall(revertAfterMs, () => this.setEmotion('normal'));
    }
  }

  celebrateCombo(count: number) {
    if (count >= 15) {
      // TABLE MASTER — full celebration: jump + spin + tray flourish
      this.setEmotion('excited', 5000);
      this.scene.tweens.add({
        targets: this,
        y: { from: this.y, to: this.y - 18 },
        scaleX: { from: 1, to: 1.4 }, scaleY: { from: 1, to: 1.4 },
        duration: 260, yoyo: true, repeat: 1, ease: 'Back.easeOut',
      });
      if (this.trayContainer) {
        this.scene.tweens.add({
          targets: this.trayContainer, rotation: { from: 0, to: Math.PI * 2 },
          duration: 500, ease: 'Quad.easeOut',
          onComplete: () => { if (this.trayContainer) this.trayContainer.setRotation(0); },
        });
      }
    } else if (count >= 10) {
      this.setEmotion('excited', 4000);
      this.scene.tweens.add({
        targets: this,
        y: { from: this.y, to: this.y - 12 },
        scaleX: { from: 1, to: 1.3 }, scaleY: { from: 1, to: 1.3 },
        duration: 200, yoyo: true, repeat: 1, ease: 'Back.easeOut',
      });
    } else if (count >= 5) {
      this.setEmotion('excited', 3000);
      this.scene.tweens.add({ targets: this, scale: { from: 1, to: 1.15 }, duration: 160, yoyo: true, ease: 'Back.easeOut' });
    } else if (count >= 3) {
      this.setEmotion('excited', 2500);
    }
  }

  reactToAngry() {
    this.setEmotion('stressed', 2000);
    if (!this.isWalking) {
      this.stopIdleAnim();
      this.scene.tweens.add({
        targets: this.sprite, y: 6, duration: 260, yoyo: true, ease: 'Quad.easeIn',
        onComplete: () => { this.sprite.y = 0; if (!this.isWalking) this.startIdleAnim(); },
      });
    }
  }

  faceDirection(toX: number) { this.sprite.setFlipX(toX < this.x); }

  walkBob(duration: number) {
    this.scene.tweens.add({
      targets: this.sprite, y: { from: 0, to: -4 }, duration: 160, yoyo: true,
      repeat: Math.floor(duration / 320), ease: 'Sine.easeInOut',
    });
  }

  private drawFace(emotion: PlayerEmotion) {
    this.face.clear();
    const cx = 0, cy = -22;  // head center for 48×76 sprite (16-38=-22)
    this.face.fillStyle(0x3C2010);
    switch (emotion) {
      case 'normal':
        this.face.fillCircle(cx - 5, cy - 2, 2); this.face.fillCircle(cx + 5, cy - 2, 2);
        this.face.fillRect(cx - 4, cy + 4, 8, 2);
        break;
      case 'happy':
        this.face.fillCircle(cx - 5, cy - 2, 2); this.face.fillCircle(cx + 5, cy - 2, 2);
        this.face.lineStyle(2.5, 0x3C2010); this.face.beginPath();
        this.face.arc(cx, cy + 3, 5, 0, Math.PI, false); this.face.strokePath();
        break;
      case 'proud':
        this.face.lineStyle(2.5, 0x3C2010);
        this.face.beginPath(); this.face.arc(cx - 5, cy - 2, 3, Math.PI, 0, false); this.face.strokePath();
        this.face.beginPath(); this.face.arc(cx + 5, cy - 2, 3, Math.PI, 0, false); this.face.strokePath();
        this.face.lineStyle(3, 0x3C2010); this.face.beginPath();
        this.face.arc(cx, cy + 3, 6, 0, Math.PI, false); this.face.strokePath();
        break;
      case 'excited':
        this.face.fillCircle(cx - 5, cy - 2, 2.8); this.face.fillCircle(cx + 5, cy - 2, 2.8);
        this.face.fillStyle(0xFFFFFF, 0.9);
        this.face.fillCircle(cx - 4, cy - 3, 1.2); this.face.fillCircle(cx + 6, cy - 3, 1.2);
        this.face.fillStyle(0x3C2010); this.face.lineStyle(3, 0x3C2010); this.face.beginPath();
        this.face.arc(cx, cy + 3, 6, 0, Math.PI, false); this.face.strokePath();
        break;
      case 'stressed':
        this.face.fillRect(cx - 8, cy - 6, 6, 2); this.face.fillRect(cx + 2, cy - 5, 6, 2);
        this.face.fillCircle(cx - 5, cy - 1, 2); this.face.fillCircle(cx + 5, cy - 1, 2);
        this.face.lineStyle(2, 0x3C2010); this.face.beginPath();
        this.face.arc(cx, cy + 7, 5, Math.PI, 0, false); this.face.strokePath();
        break;
    }
  }

  private startWalkAnim() {
    this.stopWalkAnim();
    this.walkFrame = 0;
    this.walkAnimTimer = this.scene.time.addEvent({
      delay: 160, loop: true,
      callback: () => {
        this.walkFrame = 1 - this.walkFrame;
        const key = this.walkFrame === 1 ? 'player_walk' : 'player';
        if (this.scene.textures.exists(key)) this.sprite.setTexture(key);
      },
    });
  }

  private stopWalkAnim() {
    if (this.walkAnimTimer) { this.walkAnimTimer.remove(); this.walkAnimTimer = null; }
    if (this.scene.textures.exists('player')) this.sprite.setTexture('player');
    this.walkFrame = 0;
  }

  private startIdleAnim() {
    this.idleTween = this.scene.tweens.add({
      targets: this.sprite, y: { from: 0, to: -3 },
      duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  private stopIdleAnim() {
    if (this.idleTween) { this.idleTween.stop(); this.idleTween = null; }
    this.sprite.y = 0;
  }
}
