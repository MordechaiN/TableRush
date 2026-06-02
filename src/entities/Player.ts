import Phaser from 'phaser';

export type PlayerEmotion = 'normal' | 'happy' | 'stressed' | 'excited' | 'proud';

// Priority: higher value = harder to override
const EMOTION_PRIORITY: Record<PlayerEmotion, number> = {
  normal: 0, happy: 1, proud: 2, stressed: 2, excited: 3,
};

export class Player extends Phaser.GameObjects.Container {
  private sprite!: Phaser.GameObjects.Image;
  private face!: Phaser.GameObjects.Graphics;
  private trayImage: Phaser.GameObjects.Image | null = null;
  private trayLabel: Phaser.GameObjects.Text | null = null;
  private emotionBadge: Phaser.GameObjects.Text | null = null;
  private walkTween: Phaser.Tweens.Tween | null = null;
  private idleTween: Phaser.Tweens.Tween | null = null;
  private revertTimer: Phaser.Time.TimerEvent | null = null;
  public isWalking = false;
  private currentEmotion: PlayerEmotion = 'normal';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.sprite = scene.add.image(0, 0, 'player');
    this.add(this.sprite);

    // Face overlay drawn above the player sprite (head center at container (0,-17))
    this.face = scene.add.graphics();
    this.add(this.face);

    this.setDepth(10);
    scene.add.existing(this);
    this.drawFace('normal');
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
    this.trayImage = this.scene.add.image(0, -44, 'tray');
    this.add(this.trayImage);
    this.trayLabel = this.scene.add.text(0, -52, emoji, { fontSize: '18px' }).setOrigin(0.5);
    this.add(this.trayLabel);
  }

  clearCarry() {
    this.trayImage?.destroy(); this.trayImage = null;
    this.trayLabel?.destroy(); this.trayLabel = null;
  }

  bounce() {
    this.scene.tweens.add({
      targets: this.sprite, y: { from: 0, to: -8 },
      duration: 100, yoyo: true, ease: 'Quad.easeOut',
    });
  }

  // Flash red + shake to signal "I'm busy!"
  showBusy() {
    this.sprite.setTint(0xFF2222);
    this.scene.time.delayedCall(380, () => {
      if (this.currentEmotion === 'excited') {
        this.sprite.setTint(0xFFDD44);
      } else {
        this.sprite.clearTint();
      }
    });

    // Shake the sprite within the container (doesn't fight walkTo)
    const origX = this.sprite.x;
    this.scene.tweens.add({
      targets: this.sprite,
      x: { from: origX - 5, to: origX + 5 },
      duration: 55, yoyo: true, repeat: 3,
      onComplete: () => { this.sprite.x = origX; },
    });

    // Briefly show stressed face then revert
    this.drawFace('stressed');
    this.scene.time.delayedCall(440, () => this.drawFace(this.currentEmotion));
  }

  setEmotion(emotion: PlayerEmotion, revertAfterMs = 0) {
    // Don't downgrade from a higher-priority emotion (except explicit revert to normal)
    if (emotion !== 'normal' &&
        EMOTION_PRIORITY[emotion] < EMOTION_PRIORITY[this.currentEmotion]) return;

    if (this.revertTimer) { this.revertTimer.remove(); this.revertTimer = null; }

    this.currentEmotion = emotion;
    this.drawFace(emotion);

    // Remove old badge
    if (this.emotionBadge) { this.emotionBadge.destroy(); this.emotionBadge = null; }

    // Sprite tint
    switch (emotion) {
      case 'excited': this.sprite.setTint(0xFFDD44); break;
      case 'stressed': this.sprite.setTint(0xFFBBBB); break;
      default: this.sprite.clearTint();
    }

    // Floating emoji badge above head
    const BADGES: Partial<Record<PlayerEmotion, string>> = {
      happy: '😊', excited: '🤩', stressed: '😰', proud: '😤',
    };
    const badge = BADGES[emotion];
    if (badge) {
      this.emotionBadge = this.scene.add.text(14, -46, badge, { fontSize: '14px' }).setOrigin(0.5);
      this.add(this.emotionBadge);
      this.scene.tweens.add({
        targets: this.emotionBadge, scale: { from: 0, to: 1 },
        duration: 200, ease: 'Back.easeOut',
      });
    }

    if (revertAfterMs > 0) {
      this.revertTimer = this.scene.time.delayedCall(revertAfterMs, () => this.setEmotion('normal'));
    }
  }

  // Called from GameScene when combo milestones hit
  celebrateCombo(count: number) {
    if (count >= 10) {
      this.setEmotion('excited', 4000);
      this.scene.tweens.add({
        targets: this,
        scaleX: { from: 1, to: 1.3 }, scaleY: { from: 1, to: 1.3 },
        duration: 200, yoyo: true, repeat: 1, ease: 'Back.easeOut',
      });
    } else if (count >= 5) {
      this.setEmotion('excited', 3000);
      this.scene.tweens.add({
        targets: this, scale: { from: 1, to: 1.15 },
        duration: 160, yoyo: true, ease: 'Back.easeOut',
      });
    } else if (count >= 3) {
      this.setEmotion('excited', 2500);
    }
  }

  // Called from GameScene when a customer leaves angry
  reactToAngry() {
    this.setEmotion('stressed', 2000);
    if (!this.isWalking) {
      this.stopIdleAnim();
      this.scene.tweens.add({
        targets: this.sprite, y: 6,
        duration: 260, yoyo: true, ease: 'Quad.easeIn',
        onComplete: () => {
          this.sprite.y = 0;
          if (!this.isWalking) this.startIdleAnim();
        },
      });
    }
  }

  private drawFace(emotion: PlayerEmotion) {
    this.face.clear();
    // Player texture: 40×62, head fillCircle at pixel (20,14) radius 12.
    // Container origin = image center (20,31). Head center in container = (0,-17).
    const cx = 0, cy = -17;

    this.face.fillStyle(0x3C2010);

    switch (emotion) {
      case 'normal':
        this.face.fillCircle(cx - 4, cy - 2, 1.5);
        this.face.fillCircle(cx + 4, cy - 2, 1.5);
        this.face.fillRect(cx - 3, cy + 4, 6, 1.5);
        break;

      case 'happy':
        this.face.fillCircle(cx - 4, cy - 2, 1.5);
        this.face.fillCircle(cx + 4, cy - 2, 1.5);
        this.face.lineStyle(2, 0x3C2010);
        this.face.beginPath();
        this.face.arc(cx, cy + 3, 4, 0, Math.PI, false);
        this.face.strokePath();
        break;

      case 'proud':
        // Confident squinted eyes + wide smile
        this.face.lineStyle(2, 0x3C2010);
        this.face.beginPath(); this.face.arc(cx - 4, cy - 2, 2.5, Math.PI, 0, false); this.face.strokePath();
        this.face.beginPath(); this.face.arc(cx + 4, cy - 2, 2.5, Math.PI, 0, false); this.face.strokePath();
        this.face.lineStyle(2.5, 0x3C2010);
        this.face.beginPath();
        this.face.arc(cx, cy + 3, 5, 0, Math.PI, false);
        this.face.strokePath();
        break;

      case 'excited':
        // Big sparkly eyes + wide open smile
        this.face.fillCircle(cx - 4, cy - 2, 2.2);
        this.face.fillCircle(cx + 4, cy - 2, 2.2);
        this.face.fillStyle(0xFFFFFF, 0.9);
        this.face.fillCircle(cx - 3, cy - 3, 1);
        this.face.fillCircle(cx + 5, cy - 3, 1);
        this.face.fillStyle(0x3C2010);
        this.face.lineStyle(2.5, 0x3C2010);
        this.face.beginPath();
        this.face.arc(cx, cy + 3, 5, 0, Math.PI, false);
        this.face.strokePath();
        break;

      case 'stressed':
        // Worried inner-up brows + frown
        this.face.fillRect(cx - 7, cy - 6, 5, 1.5);
        this.face.fillRect(cx + 2, cy - 5, 5, 1.5);
        this.face.fillCircle(cx - 4, cy - 1, 1.5);
        this.face.fillCircle(cx + 4, cy - 1, 1.5);
        this.face.lineStyle(1.5, 0x3C2010);
        this.face.beginPath();
        this.face.arc(cx, cy + 7, 4, Math.PI, 0, false);
        this.face.strokePath();
        break;
    }
  }

  private startIdleAnim() {
    this.idleTween = this.scene.tweens.add({
      targets: this.sprite,
      y: { from: 0, to: -3 },
      duration: 900, yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private stopIdleAnim() {
    if (this.idleTween) { this.idleTween.stop(); this.idleTween = null; }
    this.sprite.y = 0;
  }
}
