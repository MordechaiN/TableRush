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
    // 40×62 — head center at pixel (20,14) radius 12
    // In container (origin 0.5): head center = (0, 14−31) = (0, −17)
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
    // Body outline
    g.lineStyle(1.5, 0x0D1550, 0.8);
    g.strokeRoundedRect(8, 22, 24, 22, 6);
    // White apron
    g.fillStyle(0xF8F8F8, 0.9);
    g.fillRoundedRect(12, 26, 16, 16, 3);
    // Apron pocket
    g.fillStyle(0xEEEEEE);
    g.fillRoundedRect(14, 38, 10, 4, 2);
    // Apron strings
    g.lineStyle(1, 0xF0F0F0, 0.7);
    g.lineBetween(12, 27, 8, 32);
    g.lineBetween(28, 27, 32, 32);
    // White shirt collar
    g.fillStyle(COLORS.WAITER_SHIRT);
    g.fillTriangle(20, 22, 16, 27, 24, 27);
    // Bow tie
    g.fillStyle(0x111111);
    g.fillTriangle(18, 27, 20, 30, 22, 27);
    // Head
    g.fillStyle(0xFDBA8C);
    g.fillCircle(20, 14, 12);
    // Ears
    g.fillStyle(0xE08B5A);
    g.fillCircle(8, 14, 3.5);
    g.fillCircle(32, 14, 3.5);
    // Head outline
    g.lineStyle(1.5, 0x3C2010, 0.7);
    g.strokeCircle(20, 14, 12);
    // Hair
    g.fillStyle(0x4A2C0A);
    g.fillRoundedRect(9, 4, 22, 8, 4);
    // Hair highlight
    g.fillStyle(0x6B3E14, 0.5);
    g.fillRoundedRect(10, 4, 10, 4, 2);
    // Head highlight
    g.fillStyle(0xFFFFFF, 0.15);
    g.fillCircle(15, 10, 4);
    g.generateTexture('player', 40, 62);

    // ─── PLAYER WALK FRAME ────────────────────────────────────────────────────
    g.clear();
    // Shadow (wider during stride)
    g.fillStyle(0x000000, 0.12);
    g.fillEllipse(20, 58, 38, 10);
    // Legs (walking stride — left forward, right back)
    g.fillStyle(0x1A1A3A);
    g.fillRoundedRect(9, 40, 8, 16, 2);   // left leg forward
    g.fillRoundedRect(23, 44, 8, 12, 2);  // right leg back
    // Shoes
    g.fillStyle(0x0A0A0A);
    g.fillRoundedRect(7, 54, 12, 5, 2);
    g.fillRoundedRect(22, 54, 10, 5, 2);
    // Body
    g.fillStyle(COLORS.WAITER_JACKET);
    g.fillRoundedRect(8, 22, 24, 22, 6);
    g.lineStyle(1.5, 0x0D1550, 0.8);
    g.strokeRoundedRect(8, 22, 24, 22, 6);
    // Apron
    g.fillStyle(0xF8F8F8, 0.9);
    g.fillRoundedRect(12, 26, 16, 16, 3);
    g.fillStyle(0xEEEEEE);
    g.fillRoundedRect(14, 38, 10, 4, 2);
    // Collar
    g.fillStyle(COLORS.WAITER_SHIRT);
    g.fillTriangle(20, 22, 16, 27, 24, 27);
    // Bow tie
    g.fillStyle(0x111111);
    g.fillTriangle(18, 27, 20, 30, 22, 27);
    // Head
    g.fillStyle(0xFDBA8C);
    g.fillCircle(20, 14, 12);
    // Ears
    g.fillStyle(0xE08B5A);
    g.fillCircle(8, 14, 3.5);
    g.fillCircle(32, 14, 3.5);
    // Head outline
    g.lineStyle(1.5, 0x3C2010, 0.7);
    g.strokeCircle(20, 14, 12);
    // Hair
    g.fillStyle(0x4A2C0A);
    g.fillRoundedRect(9, 4, 22, 8, 4);
    g.fillStyle(0xFFFFFF, 0.15);
    g.fillCircle(15, 10, 4);
    g.generateTexture('player_walk', 40, 62);

    // ─── CUSTOMER VARIANTS ────────────────────────────────────────────────────
    // 32×52 — head circle at (16,10) radius 10
    // In container (origin 0.5): head center = (0, 10−26) = (0, −16)
    CUSTOMER_VARIANTS.forEach((variant, i) => {
      g.clear();

      // Elder has shorter legs to appear older/shorter
      const isElder = variant.accessory === 'glasses';
      const legH = isElder ? 8 : 12;
      const legY = isElder ? 40 : 36;
      // Business has squared wider shoulders
      const isBusiness = variant.accessory === 'briefcase';
      const bodyW = isBusiness ? 22 : 20;
      const bodyX = 16 - bodyW / 2;

      // Shadow
      g.fillStyle(0x000000, 0.10);
      g.fillEllipse(16, 50, 26, 7);

      // Shoes
      g.fillStyle(0x2C1810);
      g.fillRoundedRect(8, legY + legH - 1, 7, 5, 2);
      g.fillRoundedRect(17, legY + legH - 1, 7, 5, 2);

      // Legs (dark neutral pants)
      g.fillStyle(0x1A1A2A);
      g.fillRoundedRect(9, legY, 6, legH, 2);
      g.fillRoundedRect(17, legY, 6, legH, 2);

      // Body
      g.fillStyle(variant.outfit);
      g.fillRoundedRect(bodyX, 18, bodyW, 20, 5);
      // Body outline
      g.lineStyle(1.5, 0x3C2010, 0.6);
      g.strokeRoundedRect(bodyX, 18, bodyW, 20, 5);

      // Collar V
      g.fillStyle(0xFFFFFF, 0.22);
      g.fillTriangle(16, 18, 13, 23, 19, 23);

      // Variant body accessories (drawn before head so head covers top)
      if (isBusiness) {
        // Tie (dark red down the front)
        g.fillStyle(0xCC1111);
        g.fillTriangle(16, 22, 14, 32, 18, 32);
        g.fillRect(15, 32, 2, 3);
      } else if (variant.accessory === 'necklace') {
        // Pearl necklace arc + pendant
        g.lineStyle(1.5, 0xFFD700);
        g.beginPath();
        g.arc(16, 24, 5, 0.3, Math.PI - 0.3, false);
        g.strokePath();
        g.fillStyle(0xFFD700);
        g.fillCircle(16, 29, 2);
      }

      // Elegant: tall collar (collar wings drawn before head; head will cover center)
      if (variant.accessory === 'necklace') {
        g.fillStyle(variant.outfit);
        g.fillRoundedRect(11, 14, 4, 8, 1);
        g.fillRoundedRect(17, 14, 4, 8, 1);
        g.lineStyle(1, 0x3C2010, 0.5);
        g.strokeRoundedRect(11, 14, 4, 8, 1);
        g.strokeRoundedRect(17, 14, 4, 8, 1);
      }

      // Head (skin warm #FDBA8C per ART_DIRECTION)
      g.fillStyle(0xFDBA8C);
      g.fillCircle(16, 10, 10);

      // Ears
      g.fillStyle(0xE08B5A);
      g.fillCircle(6, 11, 3);
      g.fillCircle(26, 11, 3);

      // Head highlight
      g.fillStyle(0xFFFFFF, 0.13);
      g.fillCircle(12, 7, 4);

      // Head outline
      g.lineStyle(1.5, 0x3C2010, 0.7);
      g.strokeCircle(16, 10, 10);

      // Hair (variant-specific styles)
      if (variant.accessory === 'cap') {
        // Teen: cap crown + extended brim (beyond head edges at x=6 and x=26)
        g.fillStyle(0x223366);
        g.fillRoundedRect(7, 1, 18, 6, 3);      // cap crown
        g.fillRect(4, 6, 24, 3);                 // brim extends to x=4 and x=28 (beyond head)
        g.fillStyle(0x334488, 0.6);
        g.fillRoundedRect(9, 1, 6, 3, 1);        // logo panel
        g.lineStyle(1, 0x111133, 0.5);
        g.strokeRect(4, 6, 24, 3);
      } else if (variant.accessory === 'flower') {
        // Romantic: hair + large flower extending beyond right head edge
        g.fillStyle(variant.hair);
        g.fillRoundedRect(7, 2, 18, 7, 4);
        g.fillStyle(0xFFFFFF, 0.2);
        g.fillRoundedRect(8, 2, 7, 3, 2);
        // Flower (extends to x=30, beyond head edge at x=26)
        g.fillStyle(0xFF85C2);
        g.fillCircle(25, 3, 4.5);
        g.fillStyle(0xFF4499);
        g.fillCircle(23, 1, 3);
        g.fillCircle(27, 1, 3);
        g.fillStyle(0xFFFF55);
        g.fillCircle(25, 3, 2);
      } else if (isElder) {
        // Elder: white/gray hair
        g.fillStyle(0xC8C8C8);
        g.fillRoundedRect(7, 1, 18, 8, 4);
        g.fillStyle(0xFFFFFF, 0.5);
        g.fillRoundedRect(8, 1, 7, 4, 2);
      } else {
        // Standard hair block
        g.fillStyle(variant.hair);
        g.fillRoundedRect(7, 2, 18, 7, 4);
        g.fillStyle(0xFFFFFF, 0.22);
        g.fillRoundedRect(8, 2, 7, 3, 2);
      }

      // Accessories (drawn last, on top of hair)
      if (isElder) {
        // Glasses with temples extending beyond head edges
        g.lineStyle(1.5, 0x444444);
        g.strokeCircle(11, 10, 3.5);
        g.strokeCircle(21, 10, 3.5);
        g.lineBetween(14.5, 10, 17.5, 10); // bridge
        g.lineBetween(7.5, 10, 3, 10);     // left temple (extends to x=3, beyond head at x=6)
        g.lineBetween(24.5, 10, 29, 10);   // right temple (extends to x=29, beyond head at x=26)
      } else if (variant.accessory === 'sunglasses') {
        // Trendy: sunglasses extend beyond head (head spans x=6 to x=26)
        g.fillStyle(0x111111, 0.92);
        g.fillRoundedRect(4, 7, 9, 5, 2);  // left lens x=4 (2px beyond head at 6)
        g.fillRoundedRect(19, 7, 9, 5, 2); // right lens ends at x=28 (2px beyond head at 26)
        g.lineStyle(1, 0x555555);
        g.lineBetween(13, 9.5, 19, 9.5);   // bridge
        g.lineStyle(1, 0x333333);
        g.lineBetween(4, 9, 2, 9);          // left arm
        g.lineBetween(28, 9, 30, 9);         // right arm
      }

      g.generateTexture(`customer_${i}`, 32, 52);
    });

    // ─── TABLE (mahogany + checkered linen) ───────────────────────────────────
    g.clear();
    // Mahogany body
    g.fillStyle(COLORS.TABLE_BODY);
    g.fillRoundedRect(0, 0, 110, 76, 12);
    // Table top
    g.fillStyle(COLORS.TABLE_TOP);
    g.fillRoundedRect(2, 2, 106, 72, 10);
    // Tablecloth base
    g.fillStyle(COLORS.TABLE_CLOTH);
    g.fillRoundedRect(8, 6, 94, 64, 8);
    // Subtle checkered linen pattern (8×8 grid of alternating shaded squares)
    const cSize = 8;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 12; col++) {
        if ((row + col) % 2 === 0) {
          g.fillStyle(0xEEE8DF, 0.5);
          g.fillRect(9 + col * cSize, 7 + row * cSize, cSize, cSize);
        }
      }
    }
    // Cloth border detail (re-draw over pattern)
    g.lineStyle(1.5, 0xEBE5DC, 0.6);
    g.strokeRoundedRect(11, 9, 88, 58, 6);
    // Place setting circles
    g.fillStyle(0xF0EDE8, 0.3);
    g.fillCircle(32, 38, 17);
    g.fillCircle(78, 38, 17);
    g.lineStyle(1, 0xDDD8D0, 0.45);
    g.strokeCircle(32, 38, 17);
    g.strokeCircle(78, 38, 17);
    // Center crease
    g.lineStyle(0.5, 0xE0DAD4, 0.3);
    g.lineBetween(55, 10, 55, 66);
    // Cloth highlight
    g.fillStyle(0xFFFFFF, 0.15);
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

    // ─── FOOD PLATE (for carry display) ───────────────────────────────────────
    // White plate circle drawn onto player tray in carryItem()
    // Separate texture for the plate circle itself
    g.clear();
    g.fillStyle(0xFFFFFF);
    g.fillCircle(13, 13, 13);
    g.fillStyle(0xF8F6F2);
    g.fillCircle(13, 13, 11);
    g.lineStyle(1, 0xE0D8D0);
    g.strokeCircle(13, 13, 13);
    g.generateTexture('food_plate', 26, 26);

    // ─── KITCHEN AREA (dark granite counter + pots/pans) ─────────────────────
    g.clear();
    const kw = GAME_WIDTH - 20;

    // Base granite
    g.fillStyle(0x303030);
    g.fillRoundedRect(0, 0, kw, 80, 8);
    // Counter surface
    g.fillStyle(0x484848);
    g.fillRoundedRect(4, 4, kw - 8, 72, 6);

    // Cooking zone (left 45%) — warm orange tint
    g.fillStyle(0xFF8C00, 0.07);
    g.fillRoundedRect(6, 6, (kw - 8) * 0.45, 68, 5);

    // Burner rings
    [[55, 25], [100, 25], [55, 55], [100, 55]].forEach(([bx, by]) => {
      g.lineStyle(2, 0x777777, 0.9);
      g.strokeCircle(bx, by, 14);
      g.lineStyle(1.5, 0x888888, 0.5);
      g.strokeCircle(bx, by, 9);
      g.fillStyle(0xFF5500, 0.05);
      g.fillCircle(bx, by, 13);
    });

    // Pot on burner (55, 25) — left front burner
    g.fillStyle(0x5A5A5A);
    g.fillRoundedRect(45, 17, 20, 15, 3);  // pot body
    g.fillStyle(0x7A7A7A);
    g.fillRoundedRect(43, 14, 24, 6, 2);   // pot rim
    g.fillStyle(0x888888);
    g.fillCircle(55, 14, 2.5);             // lid knob
    g.fillStyle(0x4A4A4A);
    g.fillRoundedRect(65, 20, 8, 3, 1);    // handle right
    g.fillRoundedRect(37, 20, 8, 3, 1);    // handle left
    // Steam hint from pot
    g.fillStyle(0xFFFFFF, 0.06);
    g.fillEllipse(55, 10, 10, 6);

    // Pan on burner (100, 55) — right back burner
    g.fillStyle(0x4A4A4A);
    g.fillRoundedRect(88, 47, 24, 14, 3);  // pan body
    g.fillStyle(0x6A6A6A);
    g.fillRoundedRect(86, 45, 28, 6, 2);   // pan rim
    g.fillStyle(0x4A4A4A);
    g.fillRoundedRect(112, 50, 14, 3, 1);  // long handle

    // Divider between zones
    g.lineStyle(1, 0x555555, 0.6);
    g.lineBetween(kw * 0.5, 8, kw * 0.5, 72);

    // Ready zone (right 45%) — cool green tint
    g.fillStyle(0x4CAF50, 0.06);
    g.fillRoundedRect(kw * 0.5 + 4, 6, (kw - 8) * 0.45, 68, 5);
    // Shelf line in ready zone
    g.lineStyle(1, 0x4CAF50, 0.18);
    g.lineBetween(kw * 0.5 + 8, 48, kw - 10, 48);

    // Stainless highlight strip across top
    g.fillStyle(0xFFFFFF, 0.07);
    g.fillRoundedRect(6, 6, kw - 12, 6, 3);
    // Bottom bevel
    g.fillStyle(0x252525);
    g.fillRoundedRect(0, 74, kw, 6, 4);
    g.generateTexture('kitchen', kw, 80);

    // ─── KITCHEN TICKET ───────────────────────────────────────────────────────
    g.clear();
    g.fillStyle(0xFFF3E0);
    g.fillRoundedRect(0, 0, 50, 52, 6);
    g.lineStyle(2, 0xFF6B35);
    g.strokeRoundedRect(0, 0, 50, 52, 6);
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
    g.fillStyle(0xC0A060, 0.8);
    g.fillEllipse(6, 20, 12, 4);
    g.fillStyle(0xFFF8E8);
    g.fillRoundedRect(3, 7, 6, 14, 2);
    g.fillStyle(0xFFF0CC);
    g.fillRoundedRect(2, 5, 3, 6, 1);
    g.fillStyle(0xFFCC22, 0.9);
    g.fillEllipse(6, 5, 5, 8);
    g.fillStyle(0xFF8800);
    g.fillEllipse(6, 6, 3, 5);
    g.fillStyle(0xFFFFFF, 0.8);
    g.fillCircle(6, 3, 1.2);
    g.generateTexture('candle', 12, 22);

    // ─── WALL FRAME (picture for restaurant wall) ─────────────────────────────
    g.clear();
    g.fillStyle(0x7A5214);
    g.fillRoundedRect(0, 0, 60, 50, 3);
    g.fillStyle(0x9B6A1A);
    g.fillRoundedRect(3, 3, 54, 44, 2);
    g.fillStyle(0xE8D5B0);
    g.fillRect(6, 6, 48, 38);
    g.fillStyle(0x87CEEB);
    g.fillRect(6, 6, 48, 20);
    g.fillStyle(0xFFD700, 0.9);
    g.fillCircle(42, 14, 7);
    g.fillStyle(0xFFFF88, 0.4);
    g.fillCircle(42, 14, 10);
    g.fillStyle(0xFF9060, 0.3);
    g.fillRect(6, 22, 48, 5);
    g.fillStyle(0x7A5214);
    g.fillRect(6, 26, 48, 18);
    g.fillStyle(0x2D5A1B);
    g.fillCircle(16, 25, 8);
    g.fillStyle(0x4A3010);
    g.fillRect(14, 30, 4, 14);
    g.fillStyle(0x3A7022);
    g.fillCircle(44, 27, 6);
    g.fillStyle(0x4A3010);
    g.fillRect(42, 31, 3, 13);
    g.fillStyle(0xFFFFFF, 0.05);
    g.fillRoundedRect(3, 3, 26, 10, 2);
    g.generateTexture('wall_frame', 60, 50);

    // ─── MENU BOARD (chalkboard above kitchen) ────────────────────────────────
    g.clear();
    // Wooden frame
    g.fillStyle(0x5C3D1E);
    g.fillRoundedRect(0, 0, 200, 58, 6);
    // Chalkboard surface (dark green)
    g.fillStyle(0x1B3A1B);
    g.fillRoundedRect(5, 5, 190, 48, 4);
    // Inner chalk border
    g.lineStyle(1, 0xFFFFFF, 0.22);
    g.strokeRoundedRect(8, 8, 184, 42, 3);
    // Chalk heading line
    g.fillStyle(0xFFFFFF, 0.55);
    g.fillRoundedRect(10, 11, 180, 2, 1);
    // Chalk decorative divider dots
    g.fillStyle(0xFFFFFF, 0.3);
    for (let di = 0; di < 9; di++) {
      g.fillCircle(20 + di * 20, 36, 1.5);
    }
    g.generateTexture('menu_board', 200, 58);

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
