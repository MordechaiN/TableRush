import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

export class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload() {
    this.load.svg('player', 'assets/characters/waiter.svg', { width: 48, height: 76 });
    this.load.svg('player_walk', 'assets/characters/waiter_walk.svg', { width: 48, height: 76 });
    for (let i = 0; i < 7; i++) {
      this.load.svg(`customer_${i}`, `assets/characters/customer_${i}.svg`, { width: 48, height: 72 });
    }
    this.load.svg('food_0', 'assets/food/salad.svg', { width: 48, height: 48 });
    this.load.svg('food_1', 'assets/food/burger.svg', { width: 48, height: 48 });
    this.load.svg('food_2', 'assets/food/pasta.svg', { width: 48, height: 48 });
    this.load.svg('food_3', 'assets/food/sushi.svg', { width: 48, height: 48 });
    this.load.svg('food_4', 'assets/food/pizza.svg', { width: 48, height: 48 });
    this.load.svg('potted_plant', 'assets/decorations/potted_plant.svg', { width: 48, height: 64 });
    this.load.svg('herb_plant', 'assets/decorations/herb_plant.svg', { width: 32, height: 36 });
    this.load.svg('plate_badge', 'assets/icons/plate_badge.svg', { width: 48, height: 48 });
  }

  private createTextures() {
    const g = this.make.graphics({ x: 0, y: 0 });

    // ─── TABLE (mahogany + clean linen cloth) ─────────────────────────────────
    g.clear();
    // Mahogany outer body
    g.fillStyle(COLORS.TABLE_BODY);
    g.fillRoundedRect(0, 0, 110, 76, 12);
    // Table top surface
    g.fillStyle(COLORS.TABLE_TOP);
    g.fillRoundedRect(2, 2, 106, 72, 10);
    // Clean linen tablecloth (no pattern — solid ivory)
    g.fillStyle(COLORS.TABLE_CLOTH);
    g.fillRoundedRect(8, 6, 94, 64, 8);
    // Cloth top highlight (subtle linen sheen)
    g.fillStyle(0xFFFFFF, 0.40);
    g.fillRoundedRect(10, 8, 44, 5, 3);
    // Cloth bottom shadow
    g.fillStyle(0x000000, 0.06);
    g.fillRoundedRect(8, 62, 94, 8, { tl: 0, tr: 0, bl: 8, br: 8 });
    // Cloth border stitching (thin elegant line)
    g.lineStyle(1, 0xD8CCBA, 0.8);
    g.strokeRoundedRect(10, 8, 90, 60, 7);
    // Place setting: left plate (ring only — no fill)
    g.lineStyle(1.5, 0xC8BCA8, 0.9);
    g.strokeCircle(32, 38, 14);
    g.lineStyle(1, 0xD8D0C0, 0.6);
    g.strokeCircle(32, 38, 10);
    // Place setting: right plate
    g.lineStyle(1.5, 0xC8BCA8, 0.9);
    g.strokeCircle(78, 38, 14);
    g.lineStyle(1, 0xD8D0C0, 0.6);
    g.strokeCircle(78, 38, 10);
    // Center candle holder dot
    g.fillStyle(0xBEAE90, 0.5);
    g.fillCircle(55, 38, 3);
    g.generateTexture('table', 110, 76);

    // ─── CHAIR (top-down: backrest at top, seat below, front legs at base) ────
    g.clear();
    // Back leg posts (dark, visible behind backrest)
    g.fillStyle(0x3D1E0A);
    g.fillRoundedRect(2, 1, 7, 6, 2);
    g.fillRoundedRect(21, 1, 7, 6, 2);
    // Backrest bar
    g.fillStyle(0x7A4A20);
    g.fillRoundedRect(1, 2, 28, 11, 3);
    g.fillStyle(0x9B6035); // lighter face
    g.fillRoundedRect(2, 3, 26, 9, 2);
    // Backrest detail rails (visible spindles)
    g.fillStyle(0x7A4A20, 0.65);
    g.fillRect(8, 3, 3, 9);
    g.fillRect(19, 3, 3, 9);
    // Seat body
    g.fillStyle(0x6B3D18);
    g.fillRoundedRect(0, 13, 30, 19, 5);
    // Seat top (warm wood surface)
    g.fillStyle(0x8B5228);
    g.fillRoundedRect(2, 14, 26, 16, 4);
    // Seat sheen highlight
    g.fillStyle(0xFFFFFF, 0.16);
    g.fillRoundedRect(4, 15, 11, 5, 2);
    // Seat outline
    g.lineStyle(1.2, 0x4A2510, 0.5);
    g.strokeRoundedRect(0, 13, 30, 19, 5);
    // Front leg posts (dark corners at base)
    g.fillStyle(0x3D1E0A);
    g.fillRoundedRect(3, 29, 6, 5, 2);
    g.fillRoundedRect(21, 29, 6, 5, 2);
    g.generateTexture('chair', 30, 34);

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
    this.createTextures();
    // The 3D Three.js intro (src/intro.ts) is the landing screen and launches
    // GameScene on PLAY — so Boot just prepares textures and idles behind it.
  }
}
