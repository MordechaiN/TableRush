import Phaser from 'phaser';
import { COLORS, CUSTOMER_VARIANTS, GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

export class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload() {
    this.createTextures();
  }

  private createTextures() {
    const g = this.make.graphics({ x: 0, y: 0 });

    // --- PLAYER (waiter) ---
    g.clear();
    // shadow
    g.fillStyle(0x000000, 0.12);
    g.fillEllipse(20, 58, 34, 10);
    // legs
    g.fillStyle(0x1A1A3A);
    g.fillRoundedRect(11, 42, 8, 14, 2);
    g.fillRoundedRect(21, 42, 8, 14, 2);
    // shoes
    g.fillStyle(0x111111);
    g.fillRoundedRect(9, 54, 10, 5, 2);
    g.fillRoundedRect(21, 54, 10, 5, 2);
    // body (navy jacket)
    g.fillStyle(COLORS.WAITER_JACKET);
    g.fillRoundedRect(8, 22, 24, 22, 6);
    // white shirt collar
    g.fillStyle(COLORS.WAITER_SHIRT);
    g.fillTriangle(20, 22, 16, 28, 24, 28);
    // bow tie
    g.fillStyle(0x111111);
    g.fillTriangle(18, 28, 20, 30, 22, 28);
    // head
    g.fillStyle(COLORS.WAITER_SKIN);
    g.fillCircle(20, 14, 12);
    // hair
    g.fillStyle(0x4A2C0A);
    g.fillRoundedRect(9, 4, 22, 7, 4);
    // white highlight on head
    g.fillStyle(0xFFFFFF, 0.2);
    g.fillCircle(15, 10, 4);
    g.generateTexture('player', 40, 62);

    // --- CUSTOMER VARIANTS ---
    CUSTOMER_VARIANTS.forEach((variant, i) => {
      g.clear();
      // shadow
      g.fillStyle(0x000000, 0.1);
      g.fillEllipse(16, 50, 26, 8);
      // legs
      g.fillStyle(0x333344);
      g.fillRoundedRect(9, 36, 6, 12, 2);
      g.fillRoundedRect(17, 36, 6, 12, 2);
      // body (outfit color)
      g.fillStyle(variant.outfit);
      g.fillRoundedRect(6, 18, 20, 20, 5);
      // head
      g.fillStyle(0xFDA07A);
      g.fillCircle(16, 10, 10);
      // hair
      g.fillStyle(variant.hair);
      g.fillRoundedRect(7, 2, 18, 7, 4);
      // highlight
      g.fillStyle(0xFFFFFF, 0.18);
      g.fillCircle(12, 7, 3);
      // accessories
      if (variant.accessory === 'glasses') {
        g.lineStyle(1.5, 0x333333);
        g.strokeCircle(11, 11, 3);
        g.strokeCircle(21, 11, 3);
        g.strokeRect(14, 10, 3, 1);
      } else if (variant.accessory === 'sunglasses') {
        g.fillStyle(0x222222, 0.8);
        g.fillRoundedRect(8, 8, 7, 4, 2);
        g.fillRoundedRect(17, 8, 7, 4, 2);
      } else if (variant.accessory === 'cap') {
        g.fillStyle(0x222244);
        g.fillRoundedRect(7, 2, 18, 5, 3);
        g.fillRect(5, 6, 22, 3);
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
      }
      g.generateTexture(`customer_${i}`, 32, 52);
    });

    // --- TABLE (mahogany + tablecloth) ---
    g.clear();
    // mahogany body
    g.fillStyle(COLORS.TABLE_BODY);
    g.fillRoundedRect(0, 0, 110, 76, 12);
    // table top lighter
    g.fillStyle(COLORS.TABLE_TOP);
    g.fillRoundedRect(2, 2, 106, 72, 10);
    // tablecloth
    g.fillStyle(COLORS.TABLE_CLOTH);
    g.fillRoundedRect(8, 6, 94, 64, 8);
    // subtle cloth highlight
    g.fillStyle(0xFFFFFF, 0.25);
    g.fillRoundedRect(12, 10, 40, 5, 3);
    g.generateTexture('table', 110, 76);

    // --- CHAIR ---
    g.clear();
    g.fillStyle(COLORS.CHAIR);
    g.fillRoundedRect(0, 0, 26, 26, 5);
    g.fillStyle(0x7A4A27);
    g.fillRoundedRect(2, 2, 22, 22, 4);
    g.fillStyle(0xFFFFFF, 0.1);
    g.fillRoundedRect(4, 4, 10, 4, 2);
    g.generateTexture('chair', 26, 26);

    // --- TRAY ---
    g.clear();
    g.fillStyle(0x888888, 0.9);
    g.fillEllipse(18, 10, 36, 10);
    g.lineStyle(1, 0xAAAAAA);
    g.strokeEllipse(18, 10, 36, 10);
    g.generateTexture('tray', 36, 14);

    // --- KITCHEN AREA ---
    g.clear();
    // counter surface
    g.fillStyle(0xD0D0D0);
    g.fillRoundedRect(0, 0, GAME_WIDTH - 20, 80, 8);
    g.fillStyle(0xE8E8E8);
    g.fillRoundedRect(4, 4, GAME_WIDTH - 28, 72, 6);
    // stainless highlight
    g.fillStyle(0xFFFFFF, 0.3);
    g.fillRoundedRect(8, 8, (GAME_WIDTH - 36) / 2, 8, 3);
    g.generateTexture('kitchen', GAME_WIDTH - 20, 80);

    // --- KITCHEN TICKET ---
    g.clear();
    g.fillStyle(0xFFF3E0);
    g.fillRoundedRect(0, 0, 50, 52, 6);
    g.lineStyle(2, 0xFF6B35);
    g.strokeRoundedRect(0, 0, 50, 52, 6);
    g.generateTexture('ticket', 50, 52);

    // --- KITCHEN TICKET (ready) ---
    g.clear();
    g.fillStyle(0xFFFDE7);
    g.fillRoundedRect(0, 0, 50, 52, 6);
    g.lineStyle(2.5, 0xFFD700);
    g.strokeRoundedRect(0, 0, 50, 52, 6);
    g.generateTexture('ticket_ready', 50, 52);

    // --- HUD PANEL ---
    g.clear();
    g.fillStyle(0xFFF8F0);
    g.fillRoundedRect(0, 0, GAME_WIDTH, 56, 0);
    g.lineStyle(1, 0xEDD9A3);
    g.lineBetween(0, 56, GAME_WIDTH, 56);
    g.generateTexture('hud_panel', GAME_WIDTH, 56);

    // --- BUTTON ---
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

    // --- PANEL (card background) ---
    g.clear();
    g.fillStyle(0xFFF8F0);
    g.fillRoundedRect(0, 0, 360, 480, 20);
    g.lineStyle(2, 0xEDD9A3);
    g.strokeRoundedRect(1, 1, 358, 478, 20);
    g.generateTexture('panel', 360, 480);

    // --- XP BAR BACKGROUND ---
    g.clear();
    g.fillStyle(0xDDCCAA);
    g.fillRoundedRect(0, 0, 280, 16, 8);
    g.generateTexture('xp_bar_bg', 280, 16);

    // --- XP BAR FILL ---
    g.clear();
    g.fillStyle(COLORS.UI_ORANGE);
    g.fillRoundedRect(0, 0, 280, 16, 8);
    g.fillStyle(0xFFFFFF, 0.25);
    g.fillRoundedRect(4, 3, 100, 5, 3);
    g.generateTexture('xp_bar_fill', 280, 16);

    // --- STAR FILLED ---
    g.clear();
    g.fillStyle(COLORS.UI_GOLD);
    this.drawStar(g, 24, 24, 5, 22, 10);
    g.lineStyle(1.5, 0xCC9900);
    this.drawStarStroke(g, 24, 24, 5, 22, 10);
    g.generateTexture('star_full', 48, 48);

    // --- STAR EMPTY ---
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
