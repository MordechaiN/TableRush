import Phaser from 'phaser';
import { COLORS, CUSTOMER_VARIANTS, GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

export class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload() {
    this.createTextures();
  }

  private createTextures() {
    const g = this.make.graphics({ x: 0, y: 0 });

    // ─── PLAYER (waiter) ───────────────────────────────────────────────────────
    // Standard idle pose — head center at pixel (20,14) radius 12
    g.clear();
    // Shadow
    g.fillStyle(0x000000, 0.12);
    g.fillEllipse(20, 58, 34, 10);
    // Legs
    g.fillStyle(0x1A1A3A);
    g.fillRoundedRect(11, 42, 8, 14, 2);
    g.fillRoundedRect(21, 42, 8, 14, 2);
    // Shoes
    g.fillStyle(0x0A0A0A);
    g.fillRoundedRect(9, 54, 11, 5, 2);
    g.fillRoundedRect(20, 54, 11, 5, 2);
    // Body (navy jacket)
    g.fillStyle(COLORS.WAITER_JACKET);
    g.fillRoundedRect(8, 22, 24, 22, 6);
    // White apron over jacket
    g.fillStyle(0xF8F8F8, 0.9);
    g.fillRoundedRect(12, 26, 16, 16, 3);
    // Apron strings
    g.lineStyle(1, 0xF0F0F0, 0.8);
    g.lineBetween(12, 27, 8, 32);
    g.lineBetween(28, 27, 32, 32);
    // White shirt collar
    g.fillStyle(COLORS.WAITER_SHIRT);
    g.fillTriangle(20, 22, 16, 27, 24, 27);
    // Bow tie
    g.fillStyle(0x111111);
    g.fillTriangle(18, 27, 20, 30, 22, 27);
    // Head
    g.fillStyle(COLORS.WAITER_SKIN);
    g.fillCircle(20, 14, 12);
    // Hair
    g.fillStyle(0x4A2C0A);
    g.fillRoundedRect(9, 4, 22, 8, 4);
    // Hair highlight
    g.fillStyle(0x6B3E14, 0.5);
    g.fillRoundedRect(10, 4, 10, 4, 2);
    // Head highlight
    g.fillStyle(0xFFFFFF, 0.18);
    g.fillCircle(15, 10, 4);
    g.generateTexture('player', 40, 62);

    // ─── PLAYER WALK FRAME ────────────────────────────────────────────────────
    // Stride pose: legs spread for walking cycle
    g.clear();
    // Shadow
    g.fillStyle(0x000000, 0.12);
    g.fillEllipse(20, 58, 38, 10);
    // Legs (walking stride)
    g.fillStyle(0x1A1A3A);
    g.fillRoundedRect(9, 40, 8, 16, 2);   // left leg forward
    g.fillRoundedRect(23, 44, 8, 12, 2);  // right leg back
    // Shoes
    g.fillStyle(0x0A0A0A);
    g.fillRoundedRect(7, 54, 12, 5, 2);   // forward shoe
    g.fillRoundedRect(22, 54, 10, 5, 2);  // back shoe
    // Body
    g.fillStyle(COLORS.WAITER_JACKET);
    g.fillRoundedRect(8, 22, 24, 22, 6);
    // Apron
    g.fillStyle(0xF8F8F8, 0.9);
    g.fillRoundedRect(12, 26, 16, 16, 3);
    // Collar
    g.fillStyle(COLORS.WAITER_SHIRT);
    g.fillTriangle(20, 22, 16, 27, 24, 27);
    // Bow tie
    g.fillStyle(0x111111);
    g.fillTriangle(18, 27, 20, 30, 22, 27);
    // Head
    g.fillStyle(COLORS.WAITER_SKIN);
    g.fillCircle(20, 14, 12);
    // Hair
    g.fillStyle(0x4A2C0A);
    g.fillRoundedRect(9, 4, 22, 8, 4);
    // Highlight
    g.fillStyle(0xFFFFFF, 0.18);
    g.fillCircle(15, 10, 4);
    g.generateTexture('player_walk', 40, 62);

    // ─── CUSTOMER VARIANTS ────────────────────────────────────────────────────
    CUSTOMER_VARIANTS.forEach((variant, i) => {
      g.clear();
      // Shadow
      g.fillStyle(0x000000, 0.1);
      g.fillEllipse(16, 50, 26, 8);
      // Legs
      g.fillStyle(0x333344);
      g.fillRoundedRect(9, 36, 6, 12, 2);
      g.fillRoundedRect(17, 36, 6, 12, 2);
      // Shoes
      g.fillStyle(0x222222);
      g.fillRoundedRect(8, 46, 7, 4, 1);
      g.fillRoundedRect(17, 46, 7, 4, 1);
      // Body (outfit color)
      g.fillStyle(variant.outfit);
      g.fillRoundedRect(6, 18, 20, 20, 5);
      // Collar detail
      g.fillStyle(0xFFFFFF, 0.2);
      g.fillTriangle(16, 18, 13, 24, 19, 24);
      // Head
      g.fillStyle(0xFDA07A);
      g.fillCircle(16, 10, 10);
      // Hair
      g.fillStyle(variant.hair);
      g.fillRoundedRect(7, 2, 18, 7, 4);
      // Hair highlight
      g.fillStyle(0xFFFFFF, 0.18);
      g.fillCircle(12, 5, 3);
      // Accessories
      if (variant.accessory === 'glasses') {
        g.lineStyle(1.5, 0x333333);
        g.strokeCircle(11, 11, 3);
        g.strokeCircle(21, 11, 3);
        g.strokeRect(14, 10, 3, 1);
      } else if (variant.accessory === 'sunglasses') {
        g.fillStyle(0x222222, 0.85);
        g.fillRoundedRect(8, 8, 7, 4, 2);
        g.fillRoundedRect(17, 8, 7, 4, 2);
        g.lineStyle(1, 0x444444);
        g.lineBetween(15, 10, 17, 10);
      } else if (variant.accessory === 'cap') {
        g.fillStyle(0x222244);
        g.fillRoundedRect(7, 2, 18, 5, 3);
        g.fillRect(5, 6, 22, 3);
        g.fillStyle(0x333366, 0.4);
        g.fillRoundedRect(9, 2, 6, 3, 1);
      } else if (variant.accessory === 'necklace') {
        g.lineStyle(1.5, 0xFFD700);
        g.beginPath();
        g.arc(16, 20, 5, 0.2, Math.PI - 0.2);
        g.strokePath();
      } else if (variant.accessory === 'flower') {
        g.fillStyle(0xFF69B4);
        g.fillCircle(23, 3, 4);
        g.fillStyle(0xFFFF00);
        g.fillCircle(23, 3, 2);
        g.fillStyle(0xFF69B4, 0.5);
        g.fillCircle(21, 1, 2.5);
      }
      g.generateTexture(`customer_${i}`, 32, 52);
    });

    // ─── TABLE (mahogany + improved tablecloth) ────────────────────────────────
    g.clear();
    // Mahogany body
    g.fillStyle(COLORS.TABLE_BODY);
    g.fillRoundedRect(0, 0, 110, 76, 12);
    // Table top
    g.fillStyle(COLORS.TABLE_TOP);
    g.fillRoundedRect(2, 2, 106, 72, 10);
    // Tablecloth
    g.fillStyle(COLORS.TABLE_CLOTH);
    g.fillRoundedRect(8, 6, 94, 64, 8);
    // Cloth border detail
    g.lineStyle(1.5, 0xEBE5DC, 0.65);
    g.strokeRoundedRect(11, 9, 88, 58, 6);
    // Place setting circles (suggests a restaurant table)
    g.fillStyle(0xF0EDE8, 0.35);
    g.fillCircle(32, 38, 17);
    g.fillCircle(78, 38, 17);
    g.lineStyle(1, 0xDDD8D0, 0.5);
    g.strokeCircle(32, 38, 17);
    g.strokeCircle(78, 38, 17);
    // Center fold line (tablecloth crease)
    g.lineStyle(0.5, 0xE0DAD4, 0.35);
    g.lineBetween(55, 10, 55, 66);
    // Cloth highlight
    g.fillStyle(0xFFFFFF, 0.18);
    g.fillRoundedRect(12, 10, 38, 5, 3);
    g.generateTexture('table', 110, 76);

    // ─── CHAIR ────────────────────────────────────────────────────────────────
    g.clear();
    g.fillStyle(COLORS.CHAIR);
    g.fillRoundedRect(0, 0, 26, 26, 5);
    g.fillStyle(0x7A4A27);
    g.fillRoundedRect(2, 2, 22, 22, 4);
    g.fillStyle(0xFFFFFF, 0.1);
    g.fillRoundedRect(4, 4, 10, 4, 2);
    g.generateTexture('chair', 26, 26);

    // ─── TRAY ─────────────────────────────────────────────────────────────────
    g.clear();
    g.fillStyle(0x999999, 0.95);
    g.fillEllipse(18, 10, 36, 10);
    g.fillStyle(0xAAAAAA, 0.5);
    g.fillEllipse(16, 9, 24, 6);
    g.lineStyle(1, 0xBBBBBB);
    g.strokeEllipse(18, 10, 36, 10);
    g.generateTexture('tray', 36, 14);

    // ─── KITCHEN AREA (dark granite counter) ─────────────────────────────────
    g.clear();
    const kw = GAME_WIDTH - 20;
    // Base - dark granite
    g.fillStyle(0x303030);
    g.fillRoundedRect(0, 0, kw, 80, 8);
    // Counter surface
    g.fillStyle(0x484848);
    g.fillRoundedRect(4, 4, kw - 8, 72, 6);
    // Cooking zone (left 45%) — warm orange tint
    g.fillStyle(0xFF8C00, 0.08);
    g.fillRoundedRect(6, 6, (kw - 8) * 0.45, 68, 5);
    // Burner rings on cooking zone
    [[55, 25], [100, 25], [55, 55], [100, 55]].forEach(([bx, by]) => {
      g.lineStyle(2, 0x777777, 0.9);
      g.strokeCircle(bx, by, 14);
      g.lineStyle(1.5, 0x888888, 0.5);
      g.strokeCircle(bx, by, 9);
      g.fillStyle(0xFF5500, 0.06);
      g.fillCircle(bx, by, 13);
    });
    // Divider
    g.lineStyle(1, 0x555555, 0.6);
    g.lineBetween(kw * 0.5, 8, kw * 0.5, 72);
    // Ready zone (right 45%) — cool green tint
    g.fillStyle(0x4CAF50, 0.07);
    g.fillRoundedRect(kw * 0.5 + 4, 6, (kw - 8) * 0.45, 68, 5);
    // Ready zone shelf line
    g.lineStyle(1, 0x4CAF50, 0.2);
    g.lineBetween(kw * 0.5 + 8, 48, kw - 10, 48);
    // Stainless highlight strip
    g.fillStyle(0xFFFFFF, 0.08);
    g.fillRoundedRect(6, 6, kw - 12, 6, 3);
    // Bottom edge bevel
    g.fillStyle(0x252525);
    g.fillRoundedRect(0, 74, kw, 6, 4);
    g.generateTexture('kitchen', kw, 80);

    // ─── KITCHEN TICKET ───────────────────────────────────────────────────────
    g.clear();
    g.fillStyle(0xFFF3E0);
    g.fillRoundedRect(0, 0, 50, 52, 6);
    g.lineStyle(2, 0xFF6B35);
    g.strokeRoundedRect(0, 0, 50, 52, 6);
    // Ticket tear line at top
    g.lineStyle(1, 0xFFBB88, 0.5);
    g.lineBetween(4, 10, 46, 10);
    g.generateTexture('ticket', 50, 52);

    // ─── KITCHEN TICKET (ready) ───────────────────────────────────────────────
    g.clear();
    g.fillStyle(0xFFFDE7);
    g.fillRoundedRect(0, 0, 50, 52, 6);
    g.lineStyle(2.5, 0xFFD700);
    g.strokeRoundedRect(0, 0, 50, 52, 6);
    g.lineStyle(1, 0xFFDD88, 0.5);
    g.lineBetween(4, 10, 46, 10);
    g.generateTexture('ticket_ready', 50, 52);

    // ─── CANDLE ───────────────────────────────────────────────────────────────
    g.clear();
    // Candle holder (small dish)
    g.fillStyle(0xC0A060, 0.8);
    g.fillEllipse(6, 20, 12, 4);
    // Wax body
    g.fillStyle(0xFFF8E8);
    g.fillRoundedRect(3, 7, 6, 14, 2);
    // Wax drip
    g.fillStyle(0xFFF0CC);
    g.fillRoundedRect(2, 5, 3, 6, 1);
    // Flame outer
    g.fillStyle(0xFFCC22, 0.9);
    g.fillEllipse(6, 5, 5, 8);
    // Flame inner
    g.fillStyle(0xFF8800);
    g.fillEllipse(6, 6, 3, 5);
    // Flame highlight
    g.fillStyle(0xFFFFFF, 0.8);
    g.fillCircle(6, 3, 1.2);
    g.generateTexture('candle', 12, 22);

    // ─── WALL FRAME (picture for restaurant wall) ─────────────────────────────
    g.clear();
    // Outer wooden frame
    g.fillStyle(0x7A5214);
    g.fillRoundedRect(0, 0, 60, 50, 3);
    // Inner frame bevel
    g.fillStyle(0x9B6A1A);
    g.fillRoundedRect(3, 3, 54, 44, 2);
    // Canvas
    g.fillStyle(0xE8D5B0);
    g.fillRect(6, 6, 48, 38);
    // Sky
    g.fillStyle(0x87CEEB);
    g.fillRect(6, 6, 48, 20);
    // Sun
    g.fillStyle(0xFFD700, 0.9);
    g.fillCircle(42, 14, 7);
    g.fillStyle(0xFFFF88, 0.4);
    g.fillCircle(42, 14, 10);
    // Horizon glow
    g.fillStyle(0xFF9060, 0.3);
    g.fillRect(6, 22, 48, 5);
    // Ground
    g.fillStyle(0x7A5214);
    g.fillRect(6, 26, 48, 18);
    // Tree left
    g.fillStyle(0x2D5A1B);
    g.fillCircle(16, 25, 8);
    g.fillStyle(0x4A3010);
    g.fillRect(14, 30, 4, 14);
    // Tree right
    g.fillStyle(0x3A7022);
    g.fillCircle(44, 27, 6);
    g.fillStyle(0x4A3010);
    g.fillRect(42, 31, 3, 13);
    // Frame gloss
    g.fillStyle(0xFFFFFF, 0.05);
    g.fillRoundedRect(3, 3, 26, 10, 2);
    g.generateTexture('wall_frame', 60, 50);

    // ─── HUD PANEL ────────────────────────────────────────────────────────────
    g.clear();
    g.fillStyle(0xFFF8F0);
    g.fillRoundedRect(0, 0, GAME_WIDTH, 56, 0);
    g.lineStyle(1, 0xEDD9A3);
    g.lineBetween(0, 56, GAME_WIDTH, 56);
    g.generateTexture('hud_panel', GAME_WIDTH, 56);

    // ─── BUTTONS ──────────────────────────────────────────────────────────────
    g.clear();
    g.fillStyle(COLORS.UI_ORANGE);
    g.fillRoundedRect(0, 0, 200, 52, 14);
    g.fillStyle(0xFFFFFF, 0.15);
    g.fillRoundedRect(4, 4, 192, 20, 10);
    g.generateTexture('btn_orange', 200, 52);

    g.clear();
    g.fillStyle(COLORS.UI_GREEN);
    g.fillRoundedRect(0, 0, 200, 52, 14);
    g.fillStyle(0xFFFFFF, 0.15);
    g.fillRoundedRect(4, 4, 192, 20, 10);
    g.generateTexture('btn_green', 200, 52);

    // ─── PANEL (card background) ──────────────────────────────────────────────
    g.clear();
    g.fillStyle(0xFFF8F0);
    g.fillRoundedRect(0, 0, 360, 480, 20);
    g.lineStyle(2, 0xEDD9A3);
    g.strokeRoundedRect(1, 1, 358, 478, 20);
    g.generateTexture('panel', 360, 480);

    // ─── XP BAR ───────────────────────────────────────────────────────────────
    g.clear();
    g.fillStyle(0xDDCCAA);
    g.fillRoundedRect(0, 0, 280, 16, 8);
    g.generateTexture('xp_bar_bg', 280, 16);

    g.clear();
    g.fillStyle(COLORS.UI_ORANGE);
    g.fillRoundedRect(0, 0, 280, 16, 8);
    g.fillStyle(0xFFFFFF, 0.25);
    g.fillRoundedRect(4, 3, 100, 5, 3);
    g.generateTexture('xp_bar_fill', 280, 16);

    // ─── STARS ────────────────────────────────────────────────────────────────
    g.clear();
    g.fillStyle(COLORS.UI_GOLD);
    this.drawStar(g, 24, 24, 5, 22, 10);
    g.lineStyle(1.5, 0xCC9900);
    this.drawStarStroke(g, 24, 24, 5, 22, 10);
    g.generateTexture('star_full', 48, 48);

    g.clear();
    g.fillStyle(0xDDCCAA);
    this.drawStar(g, 24, 24, 5, 22, 10);
    g.generateTexture('star_empty', 48, 48);

    g.destroy();
  }

  private drawStar(g: Phaser.GameObjects.Graphics, cx: number, cy: number, points: number, outerR: number, innerR: number) {
    const step = Math.PI / points;
    g.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = i * step - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.closePath();
    g.fillPath();
  }

  private drawStarStroke(g: Phaser.GameObjects.Graphics, cx: number, cy: number, points: number, outerR: number, innerR: number) {
    const step = Math.PI / points;
    g.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = i * step - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.closePath();
    g.strokePath();
  }

  create() {
    this.scene.start('MainMenuScene');
  }
}
