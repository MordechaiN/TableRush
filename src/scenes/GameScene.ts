import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, COLORS,
  MENU_ITEMS, DIFFICULTY_TIERS, COMBO_MILESTONES, SPEED_MULTIPLIERS,
  GAME_DURATION,
} from '../config/GameConfig';
import { Table } from '../entities/Table';
import { Customer, OrderItem } from '../entities/Customer';
import { Player } from '../entities/Player';
import { ProgressionSystem } from '../systems/ProgressionSystem';

const TABLE_POSITIONS = [
  { x: 120, y: 290 },
  { x: 360, y: 290 },
  { x: 120, y: 440 },
  { x: 360, y: 440 },
  { x: 240, y: 570 },
];

const KITCHEN_X = GAME_WIDTH / 2;
const KITCHEN_Y = 120;

interface KitchenOrder {
  id: number;
  tableId: number;
  customerId: number;
  item: OrderItem;
  startTime: number;
  ready: boolean;
  ticketObj?: Phaser.GameObjects.Container;
  progressBar?: Phaser.GameObjects.Graphics;
}

export class GameScene extends Phaser.Scene {
  private tables: Table[] = [];
  private customers: Map<number, Customer> = new Map();
  private player!: Player;

  private kitchenOrders: KitchenOrder[] = [];
  private nextOrderId = 0;
  private nextCustomerId = 0;

  private score = 0;
  private comboCount = 0;
  private comboMultiplier = 1.0;
  private comboRecord = 0;
  private customersHappy = 0;
  private customersAngry = 0;
  private fastestDeliveryMs = Infinity;
  private nearMissSaves = 0;
  private orderStartTimes: Map<number, number> = new Map();

  private scoreTxt!: Phaser.GameObjects.Text;
  private comboTxt!: Phaser.GameObjects.Text;
  private timeTxt!: Phaser.GameObjects.Text;
  private comboProgressGfx!: Phaser.GameObjects.Graphics;

  private gameTimeMs = GAME_DURATION * 1000;
  private gameStartMs = 0;
  private gameTimer!: Phaser.Time.TimerEvent;
  private spawnTimer!: Phaser.Time.TimerEvent;

  private playerBusy = false;
  private carryingOrderId = -1;
  private carryingDirty = false;
  private waitingQueue: Customer[] = [];

  private kitchenGlow!: Phaser.GameObjects.Graphics;
  private kitchenGlowTween: Phaser.Tweens.Tween | null = null;
  private dishwasherGlow!: Phaser.GameObjects.Graphics;
  private dishwasherGlowTween: Phaser.Tweens.Tween | null = null;

  private rushHourActive = false;
  private rushHourOverlay!: Phaser.GameObjects.Graphics;
  private ticketRail!: Phaser.GameObjects.Container;

  private steamTimer: Phaser.Time.TimerEvent | null = null;
  private priorityLastUpdate = 0;
  private kitchenGlowPrimary = false;

  private tutorialStep = 0;
  private tutorialActive = false;
  private tutorialOverlay!: Phaser.GameObjects.Container;
  private tutorialWaitingForAction = false;

  constructor() { super({ key: 'GameScene' }); }

  create() {
    this.score = 0;
    this.comboCount = 0;
    this.comboMultiplier = 1.0;
    this.comboRecord = 0;
    this.customersHappy = 0;
    this.customersAngry = 0;
    this.fastestDeliveryMs = Infinity;
    this.nearMissSaves = 0;
    this.orderStartTimes.clear();
    this.playerBusy = false;
    this.carryingOrderId = -1;
    this.carryingDirty = false;
    this.waitingQueue = [];
    this.rushHourActive = false;
    this.kitchenOrders = [];
    this.nextOrderId = 0;
    this.nextCustomerId = 0;
    this.tables = [];
    this.customers.clear();
    this.gameStartMs = this.time.now;

    this.buildRestaurant();
    this.buildUI();

    this.player = new Player(this, GAME_WIDTH / 2, 700);

    this.steamTimer = this.time.addEvent({
      delay: 700, loop: true,
      callback: this.spawnKitchenSteam, callbackScope: this,
    });

    this.input.keyboard?.addKey('ESC').on('down', () => this.pauseGame());

    const isTutorial = !ProgressionSystem.isTutorialDone();
    if (isTutorial) {
      this.startTutorial();
    } else {
      this.startSpawnCycle();
      this.startGameTimer();
    }
  }

  // ─── Restaurant Layout ─────────────────────────────────────────────────────

  private buildRestaurant() {
    // ── Floor ────────────────────────────────────────────────────────────────
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.FLOOR_WARM);
    for (let row = 0; row < 14; row++) {
      for (let col = 0; col < 7; col++) {
        if ((row + col) % 2 === 0) {
          this.add.rectangle(col * 70 + 35, row * 70 + 35, 69, 69, COLORS.FLOOR_ALT, 1);
        }
      }
    }
    // Grout lines
    const grout = this.add.graphics().setDepth(0);
    grout.lineStyle(1, 0xD4C4A8, 0.45);
    for (let col = 1; col < 7; col++) grout.lineBetween(col * 70, 88, col * 70, GAME_HEIGHT);
    for (let row = 2; row < 13; row++) grout.lineBetween(0, row * 70 - 2, GAME_WIDTH, row * 70 - 2);
    // Tile depth shadow (bottom-right edge of each tile)
    const tileShadow = this.add.graphics().setDepth(0);
    tileShadow.fillStyle(0x000000, 0.055);
    for (let row = 2; row < 13; row++) {
      for (let col = 0; col < 7; col++) {
        tileShadow.fillRect(col * 70, row * 70 - 3, 70, 3);
        tileShadow.fillRect(col * 70 + 67, row * 70 - 70, 3, 70);
      }
    }

    // ── Zone floor tints — kitchen (cooler) vs dining (warmer) ───────────────
    const kitchenFloor = this.add.graphics().setDepth(0);
    kitchenFloor.fillStyle(0x553300, 0.07);
    kitchenFloor.fillRect(0, 88, GAME_WIDTH, 100);

    const diningArea = this.add.graphics().setDepth(0);
    diningArea.fillStyle(0xCC8833, 0.06);
    diningArea.fillRoundedRect(18, 188, GAME_WIDTH - 36, 450, 8);
    diningArea.lineStyle(1.5, 0xAA7030, 0.1);
    diningArea.strokeRoundedRect(18, 188, GAME_WIDTH - 36, 450, 8);

    // ── Walls ─────────────────────────────────────────────────────────────────
    this.add.rectangle(GAME_WIDTH / 2, 0, GAME_WIDTH, 90, COLORS.WALL_ACCENT);
    // Wainscoting detail
    const wall = this.add.graphics().setDepth(1);
    wall.lineStyle(2, 0xA06830, 0.5);
    wall.lineBetween(0, 86, GAME_WIDTH, 86);
    wall.lineStyle(1, 0xD4944C, 0.3);
    wall.lineBetween(10, 10, GAME_WIDTH - 10, 10);
    wall.lineBetween(10, 76, GAME_WIDTH - 10, 76);
    this.add.rectangle(GAME_WIDTH / 2, 88, GAME_WIDTH, 6, 0x9B6020);

    // ── Side Walls ────────────────────────────────────────────────────────────
    const wallH = GAME_HEIGHT - 88;
    const wallW = 16;
    // Left wall
    const lWall = this.add.graphics().setDepth(1);
    lWall.fillStyle(0xC8854A, 1);
    lWall.fillRect(0, 88, wallW, Math.floor(wallH * 0.58));
    lWall.fillStyle(0x9A5C28, 1);
    lWall.fillRect(0, 88 + Math.floor(wallH * 0.58), wallW, Math.floor(wallH * 0.38));
    lWall.fillStyle(0x7A3E18, 1);
    lWall.fillRect(0, 88 + Math.floor(wallH * 0.56), wallW, 5); // chair rail
    lWall.fillStyle(0x4A2410, 1);
    lWall.fillRect(0, GAME_HEIGHT - 16, wallW, 16); // baseboard
    // Left wall sconces (depth 2 so they appear above the wall strip)
    [240, 490].forEach(sy => {
      const sc = this.add.graphics().setDepth(2);
      sc.fillStyle(0xC8A060, 1);
      sc.fillRect(wallW - 4, sy - 4, 4, 8); // bracket arm
      sc.fillStyle(0xFFEE88, 0.9);
      sc.fillTriangle(wallW - 6, sy - 8, wallW + 4, sy - 8, wallW + 1, sy + 8); // shade
      sc.fillStyle(0xFFFF88, 0.25);
      sc.fillCircle(wallW, sy + 4, 18); // glow pool
    });
    // Right wall
    const rWall = this.add.graphics().setDepth(1);
    rWall.fillStyle(0xC8854A, 1);
    rWall.fillRect(GAME_WIDTH - wallW, 88, wallW, Math.floor(wallH * 0.58));
    rWall.fillStyle(0x9A5C28, 1);
    rWall.fillRect(GAME_WIDTH - wallW, 88 + Math.floor(wallH * 0.58), wallW, Math.floor(wallH * 0.38));
    rWall.fillStyle(0x7A3E18, 1);
    rWall.fillRect(GAME_WIDTH - wallW, 88 + Math.floor(wallH * 0.56), wallW, 5);
    rWall.fillStyle(0x4A2410, 1);
    rWall.fillRect(GAME_WIDTH - wallW, GAME_HEIGHT - 16, wallW, 16);
    [240, 490].forEach(sy => {
      const sc = this.add.graphics().setDepth(2);
      sc.fillStyle(0xC8A060, 1);
      sc.fillRect(GAME_WIDTH - wallW, sy - 4, 4, 8);
      sc.fillStyle(0xFFEE88, 0.9);
      sc.fillTriangle(GAME_WIDTH - wallW - 4, sy - 8, GAME_WIDTH + 4, sy - 8, GAME_WIDTH - 1, sy + 8);
      sc.fillStyle(0xFFFF88, 0.25);
      sc.fillCircle(GAME_WIDTH - wallW, sy + 4, 18);
    });

    // ── Wall art ──────────────────────────────────────────────────────────────
    if (this.textures.exists('wall_frame')) {
      this.add.image(76, 45, 'wall_frame').setOrigin(0.5).setDepth(1);
      this.add.image(GAME_WIDTH - 76, 45, 'wall_frame').setOrigin(0.5).setDepth(1);
    } else {
      // Fallback: simple drawn frames
      [[76, 45], [GAME_WIDTH - 76, 45]].forEach(([fx, fy]) => {
        const fr = this.add.graphics().setDepth(1);
        fr.fillStyle(0x7A5214); fr.fillRoundedRect(fx - 28, fy - 20, 56, 40, 3);
        fr.fillStyle(0xD4B896); fr.fillRect(fx - 24, fy - 16, 48, 32);
        fr.fillStyle(0x4A90D9, 0.6); fr.fillRect(fx - 24, fy - 16, 48, 18);
        fr.fillStyle(0xFFD700, 0.7); fr.fillCircle(fx, fy - 8, 6);
      });
    }

    // ── Pendant lamps ─────────────────────────────────────────────────────────
    [100, GAME_WIDTH / 2, GAME_WIDTH - 100].forEach(lx => {
      const lamp = this.add.graphics().setDepth(2);
      // Cord
      lamp.fillStyle(0x6B4C1A); lamp.fillRect(lx - 1, 88, 2, 36);
      // Shade cap
      lamp.fillStyle(0xC07020); lamp.fillRect(lx - 14, 122, 28, 4);
      // Shade body (trapezoid)
      lamp.fillStyle(0xFFBB30); lamp.fillTriangle(lx - 14, 126, lx + 14, 126, lx + 8, 148);
      lamp.fillStyle(0xFFDD66, 0.5); lamp.fillTriangle(lx - 10, 126, lx + 10, 126, lx + 4, 144);
      // Bulb glow
      lamp.fillStyle(0xFFFF99, 0.8); lamp.fillCircle(lx, 147, 3);
      // Light pool on floor (warm glow)
      const pool = this.add.graphics().setDepth(0);
      pool.fillStyle(0xFFFF88, 0.085); pool.fillCircle(lx, 320, 80);
    });

    // ── Recipe strip — thin visible strip in the kitchen zone (wall is behind HUD) ─
    const menuStrip = this.add.graphics().setDepth(2);
    menuStrip.fillStyle(0x0A1E0A, 0.85);
    menuStrip.fillRoundedRect(KITCHEN_X - 120, 62, 240, 26, 4);
    menuStrip.lineStyle(1, 0x336633, 0.5);
    menuStrip.strokeRoundedRect(KITCHEN_X - 120, 62, 240, 26, 4);
    this.add.text(KITCHEN_X, 66, 'MENU:', {
      fontSize: '7px', fontFamily: 'Arial Black', color: '#88DD88', letterSpacing: 1,
    }).setOrigin(1, 0).setDepth(3).setAlpha(0.85);
    this.add.text(KITCHEN_X + 2, 64, '🥗 🍔 🍝 🍣 🍕', {
      fontSize: '13px',
    }).setOrigin(0, 0).setDepth(3);

    // ── Kitchen ───────────────────────────────────────────────────────────────
    this.add.image(KITCHEN_X, KITCHEN_Y, 'kitchen').setOrigin(0.5, 0.5).setDepth(2);

    // Zone backgrounds — visual separation between COOKING (left) and READY (right)
    const cookZoneBg = this.add.graphics().setDepth(2.5);
    cookZoneBg.fillStyle(0xCC4400, 0.09);
    cookZoneBg.fillRoundedRect(10, KITCHEN_Y - 36, KITCHEN_X - 18, 72, 4);

    const readyZoneBg = this.add.graphics().setDepth(2.5);
    readyZoneBg.fillStyle(0x009933, 0.09);
    readyZoneBg.fillRoundedRect(KITCHEN_X + 8, KITCHEN_Y - 36, GAME_WIDTH - KITCHEN_X - 18, 72, 4);

    // Vertical zone divider
    const zoneDivider = this.add.graphics().setDepth(4);
    zoneDivider.lineStyle(2, 0x222222, 0.22);
    zoneDivider.lineBetween(KITCHEN_X + 4, KITCHEN_Y - 34, KITCHEN_X + 4, KITCHEN_Y + 34);

    // COOKING zone badge — centered at left-zone center (x ≈ KITCHEN_X/2 = 120)
    const cookBadge = this.add.graphics().setDepth(3);
    cookBadge.fillStyle(0xCC5500, 1);
    cookBadge.fillRoundedRect(14, KITCHEN_Y - 38, 128, 24, 12);
    this.add.text(78, KITCHEN_Y - 26, '🔥 COOKING', {
      fontSize: '11px', fontFamily: 'Arial Black', color: '#FFFFFF',
    }).setOrigin(0.5).setDepth(4);

    // READY zone badge — centered at right-zone center (x ≈ KITCHEN_X + (GAME_WIDTH-KITCHEN_X)/2 = 360)
    const readyBadge = this.add.graphics().setDepth(3);
    readyBadge.fillStyle(0x1A9944, 1);
    readyBadge.fillRoundedRect(KITCHEN_X + 14, KITCHEN_Y - 38, 128, 24, 12);
    this.add.text(KITCHEN_X + 78, KITCHEN_Y - 26, '✅ READY', {
      fontSize: '11px', fontFamily: 'Arial Black', color: '#FFFFFF',
    }).setOrigin(0.5).setDepth(4);

    // Kitchen glow — over the READY zone (right half of counter)
    this.kitchenGlow = this.add.graphics().setDepth(3);
    this.kitchenGlow.fillStyle(0x27AE60, 1.0);
    this.kitchenGlow.fillRoundedRect(KITCHEN_X + 8, KITCHEN_Y - 36, GAME_WIDTH - KITCHEN_X - 18, 72, 6);
    this.kitchenGlow.setAlpha(0);

    // Kitchen pickup counter ledge — front edge, bold and readable
    const ledge = this.add.graphics().setDepth(3);
    ledge.fillStyle(0x4A2808, 1);
    ledge.fillRoundedRect(10, KITCHEN_Y + 40, GAME_WIDTH - 20, 10, 3);
    ledge.fillStyle(0x7A4820, 1);
    ledge.fillRoundedRect(10, KITCHEN_Y + 38, GAME_WIDTH - 20, 6, 2);
    // "PICK UP" label on ledge
    this.add.text(KITCHEN_X, KITCHEN_Y + 48, '▲ PICK UP ▲', {
      fontSize: '7px', fontFamily: 'Arial Black', color: '#CC8840', letterSpacing: 3,
    }).setOrigin(0.5).setDepth(4).setAlpha(0.65);

    // Ticket rail
    this.ticketRail = this.add.container(KITCHEN_X, KITCHEN_Y + 10);
    this.ticketRail.setDepth(4);

    // Kitchen tap zone
    const kitchenZone = this.add.zone(KITCHEN_X, KITCHEN_Y, GAME_WIDTH - 20, 80)
      .setInteractive({ useHandCursor: true });
    kitchenZone.on('pointerdown', () => this.onKitchenClick());

    // ── Tables ────────────────────────────────────────────────────────────────
    TABLE_POSITIONS.forEach((pos, i) => {
      // Back chair (customer side, behind table) — depth 0, partially occluded by table
      this.add.image(pos.x, pos.y - 54, 'chair').setOrigin(0.5).setDepth(0);

      const t = new Table(this, pos.x, pos.y, i);
      t.on('pointerdown', () => this.onTableClick(i));
      this.tables.push(t);

      // Front face overlay — depth 16 (above customers at 15, below player at 17)
      // Replicates the BOTTOM HALF of the table texture to create a "seated behind table" illusion.
      // Covers from pos.y-5 (5px above table center) to pos.y+38 (table bottom).
      // Customer at pos.y-20 has: head+upper body visible (pos.y-42 → pos.y-5),
      // lower torso+feet hidden (pos.y-5 → pos.y+15). Reads as: person seated at table.
      const overlay = this.add.graphics().setDepth(16);
      // tx/ty map world coords back to texture origin so we can replicate pixel-accurate texture rows
      const tx = pos.x - 55, ty = pos.y - 38;
      // Mahogany outer (texture rows 33–76 → world pos.y-5 to pos.y+38)
      overlay.fillStyle(COLORS.TABLE_BODY, 1);
      overlay.fillRoundedRect(tx, ty + 33, 110, 43, { tl: 0, tr: 0, bl: 12, br: 12 });
      // Table top inner bevel
      overlay.fillStyle(COLORS.TABLE_TOP, 1);
      overlay.fillRoundedRect(tx + 2, ty + 33, 106, 41, { tl: 0, tr: 0, bl: 10, br: 10 });
      // Tablecloth (texture rows 33–70 → world pos.y-5 to pos.y+32)
      overlay.fillStyle(COLORS.TABLE_CLOTH, 1);
      overlay.fillRoundedRect(tx + 8, ty + 33, 94, 35, { tl: 0, tr: 0, bl: 8, br: 8 });
      // Checkered linen pattern (rows 3–7 of the 8-row grid)
      const cSize = 8;
      for (let row = 3; row < 8; row++) {
        for (let col = 0; col < 12; col++) {
          if ((row + col) % 2 === 0) {
            overlay.fillStyle(0xEEE8DF, 0.5);
            overlay.fillRect(tx + 9 + col * cSize, ty + 7 + row * cSize, cSize, cSize);
          }
        }
      }
      // Place setting circles — lower half (centers at ty+38 = pos.y, same as table texture)
      overlay.fillStyle(0xF0EDE8, 0.3);
      overlay.fillCircle(tx + 32, ty + 38, 17);
      overlay.fillCircle(tx + 78, ty + 38, 17);
      overlay.lineStyle(1, 0xDDD8D0, 0.45);
      overlay.strokeCircle(tx + 32, ty + 38, 17);
      overlay.strokeCircle(tx + 78, ty + 38, 17);
      // Center crease
      overlay.lineStyle(0.5, 0xE0DAD4, 0.3);
      overlay.lineBetween(tx + 55, ty + 38, tx + 55, ty + 66);

      // Front chair — flipped so backrest faces away from table (toward player)
      this.add.image(pos.x, pos.y + 62, 'chair').setOrigin(0.5).setDepth(5).setFlipY(true);

      // Table number badge (top-right corner of tablecloth)
      const numBg = this.add.graphics().setDepth(4);
      numBg.fillStyle(0x7A3C10, 0.88);
      numBg.fillRoundedRect(pos.x + 33, pos.y - 44, 20, 18, 4);
      this.add.text(pos.x + 43, pos.y - 35, `${i + 1}`, {
        fontSize: '11px', fontFamily: 'Arial Black', color: '#FFD700',
      }).setOrigin(0.5).setDepth(5);

      // Candle — larger, with flicker animation
      const candleKey = this.textures.exists('candle') ? 'candle' : null;
      const candleObj = candleKey
        ? this.add.image(pos.x + 34, pos.y - 18, candleKey).setOrigin(0.5).setDepth(3).setScale(1.4)
        : this.add.text(pos.x + 34, pos.y - 18, '🕯️', { fontSize: '14px' }).setOrigin(0.5).setDepth(3);
      // Flicker: each candle has a unique phase so they don't all pulse in sync
      const flickerDelay = i * 170;
      this.tweens.add({
        targets: candleObj,
        scaleX: { from: candleKey ? 1.28 : 0.92, to: candleKey ? 1.52 : 1.08 },
        scaleY: { from: candleKey ? 1.32 : 0.96, to: candleKey ? 1.48 : 1.06 },
        alpha: { from: 0.80, to: 1.0 },
        duration: 380 + i * 60,
        yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut',
        delay: flickerDelay,
      });
    });

    // ── Dishwasher station (left wall, below kitchen) ─────────────────────────
    const dw = this.add.graphics().setDepth(2);
    // Machine body (brushed steel)
    dw.fillStyle(0x8A8A8A, 1);
    dw.fillRoundedRect(8, 172, 56, 48, 5);
    // Panel face
    dw.fillStyle(0x6E6E6E, 1);
    dw.fillRoundedRect(10, 174, 52, 42, 4);
    // Door handle bar
    dw.fillStyle(0xB0B0B0, 1);
    dw.fillRoundedRect(12, 191, 48, 6, 3);
    dw.lineStyle(1, 0xCCCCCC, 0.5);
    dw.strokeRoundedRect(12, 191, 48, 6, 3);
    // Control panel strip at top
    dw.fillStyle(0x555555, 1);
    dw.fillRoundedRect(10, 174, 52, 14, { tl: 4, tr: 4, bl: 0, br: 0 });
    // Status light (green = ready)
    dw.fillStyle(0x22DD44, 1);
    dw.fillCircle(54, 181, 4);
    dw.lineStyle(1, 0x009922);
    dw.strokeCircle(54, 181, 4);
    // Water drip detail
    dw.fillStyle(0xAACCDD, 0.4);
    dw.fillCircle(36, 195, 3);
    dw.fillCircle(28, 202, 2);
    // Label below dishwasher
    this.add.text(36, 228, 'DISHWASHER', {
      fontSize: '7px', fontFamily: 'Arial Black', color: '#666666', letterSpacing: 1,
    }).setOrigin(0.5).setDepth(3);

    // Dishwasher glow (amber, shown when player carries dirty dishes)
    this.dishwasherGlow = this.add.graphics().setDepth(3).setAlpha(0);
    this.dishwasherGlow.fillStyle(0xFF8800, 1);
    this.dishwasherGlow.fillRoundedRect(8, 172, 56, 48, 5);

    // Dishwasher interactive zone
    this.add.zone(36, 196, 60, 56).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.onDishwasherClick());

    // ── Entrance — proper double-door with glass panels ───────────────────────
    const dcx = GAME_WIDTH / 2;
    const doorGfx = this.add.graphics().setDepth(3);
    // Outer door frame (warm mahogany arch)
    doorGfx.fillStyle(0x7A4018, 1);
    doorGfx.fillRoundedRect(dcx - 52, GAME_HEIGHT - 56, 104, 54, { tl: 10, tr: 10, bl: 0, br: 0 });
    // Left door panel
    doorGfx.fillStyle(0xB87040, 1);
    doorGfx.fillRoundedRect(dcx - 49, GAME_HEIGHT - 52, 46, 50, { tl: 5, tr: 0, bl: 0, br: 0 });
    // Right door panel
    doorGfx.fillStyle(0xB87040, 1);
    doorGfx.fillRoundedRect(dcx + 3, GAME_HEIGHT - 52, 46, 50, { tl: 0, tr: 5, bl: 0, br: 0 });
    // Glass upper panes (warm daylight tint)
    doorGfx.fillStyle(0xCCE8F8, 0.52);
    doorGfx.fillRoundedRect(dcx - 46, GAME_HEIGHT - 49, 38, 22, 2);
    doorGfx.fillRoundedRect(dcx + 8, GAME_HEIGHT - 49, 38, 22, 2);
    // Window cross frames
    doorGfx.fillStyle(0x7A4018, 1);
    doorGfx.fillRect(dcx - 28, GAME_HEIGHT - 49, 2, 22); // left vertical
    doorGfx.fillRect(dcx - 46, GAME_HEIGHT - 38, 38, 2); // left horizontal
    doorGfx.fillRect(dcx + 26, GAME_HEIGHT - 49, 2, 22); // right vertical
    doorGfx.fillRect(dcx + 8, GAME_HEIGHT - 38, 38, 2); // right horizontal
    // Door handles
    doorGfx.fillStyle(0xFFCC44, 1);
    doorGfx.fillRoundedRect(dcx - 8, GAME_HEIGHT - 28, 8, 4, 2);
    doorGfx.fillRoundedRect(dcx + 1, GAME_HEIGHT - 28, 8, 4, 2);
    // Center mullion between panels
    doorGfx.fillStyle(0x7A4018, 1);
    doorGfx.fillRect(dcx - 3, GAME_HEIGHT - 52, 6, 50);
    // Door mat (striped welcome mat)
    const matGfx = this.add.graphics().setDepth(2);
    matGfx.fillStyle(0x4A2A10, 0.65);
    matGfx.fillRoundedRect(dcx - 56, GAME_HEIGHT - 14, 112, 13, 3);
    matGfx.fillStyle(0x6B3A18, 0.4);
    for (let mi = 0; mi < 5; mi++) {
      matGfx.fillRect(dcx - 52 + mi * 20, GAME_HEIGHT - 12, 14, 9);
    }

    // Host stand — small mahogany podium right of the entrance
    const hs = this.add.graphics().setDepth(2);
    // Podium base
    hs.fillStyle(0x7A4018, 1);
    hs.fillRoundedRect(GAME_WIDTH - 95, GAME_HEIGHT - 98, 56, 44, 5);
    // Podium top
    hs.fillStyle(0xA0581E, 1);
    hs.fillRoundedRect(GAME_WIDTH - 98, GAME_HEIGHT - 102, 62, 12, 4);
    // Clipboard / reservation book
    hs.fillStyle(0xFFF5E8, 0.95);
    hs.fillRoundedRect(GAME_WIDTH - 90, GAME_HEIGHT - 99, 38, 42, 3);
    hs.lineStyle(1, 0xCCBBA8, 0.5);
    hs.strokeRoundedRect(GAME_WIDTH - 90, GAME_HEIGHT - 99, 38, 42, 3);
    // Lines on clipboard
    hs.fillStyle(0x999080, 0.45);
    for (let li = 0; li < 6; li++) {
      hs.fillRect(GAME_WIDTH - 87, GAME_HEIGHT - 95 + li * 6, 32, 1.5);
    }
    // Gold pen
    hs.fillStyle(0xFFCC22, 1);
    hs.fillRoundedRect(GAME_WIDTH - 58, GAME_HEIGHT - 100, 3, 14, 1);
    this.add.text(GAME_WIDTH - 67, GAME_HEIGHT - 108, 'HOST', {
      fontSize: '8px', fontFamily: 'Arial Black', color: '#9A5820',
    }).setOrigin(0.5).setDepth(3);

    // ── Queue zone — "WAIT HERE" floor marking for arriving guests ───────────
    const queueZone = this.add.graphics().setDepth(0);
    queueZone.fillStyle(0xDDCC88, 0.28);
    queueZone.fillRoundedRect(100, GAME_HEIGHT - 115, 240, 50, 8);
    queueZone.lineStyle(2, 0xBBAA44, 0.7);
    queueZone.strokeRoundedRect(100, GAME_HEIGHT - 115, 240, 50, 8);
    // Footprint icons
    ['👣', '👣'].forEach((icon, i) => {
      this.add.text(175 + i * 90, GAME_HEIGHT - 98, icon, {
        fontSize: '16px',
      }).setOrigin(0.5).setDepth(0).setAlpha(0.55);
    });
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 120, 'WAIT HERE', {
      fontSize: '9px', fontFamily: 'Arial Black', color: '#AA8800', letterSpacing: 3,
    }).setOrigin(0.5).setDepth(1).setAlpha(0.8);

    // Rush hour overlay (hidden by default — subtle full-screen red warmth during rush)
    this.rushHourOverlay = this.add.graphics().setDepth(1).setAlpha(0);
    this.rushHourOverlay.fillStyle(0xFF2200, 1);
    this.rushHourOverlay.fillRect(0, 88, GAME_WIDTH, GAME_HEIGHT - 88);

    // Plants — moved to depth 2 so they appear in front of side walls
    this.add.text(28, GAME_HEIGHT - 80, '🪴', { fontSize: '36px' }).setOrigin(0.5).setDepth(2);
    this.add.text(GAME_WIDTH - 28, GAME_HEIGHT - 80, '🪴', { fontSize: '36px' }).setOrigin(0.5).setDepth(2);
    // Kitchen-side plants — moved to x=28/452 so they sit just inside the walls
    this.add.text(28, 172, '🌿', { fontSize: '20px' }).setOrigin(0.5).setDepth(2);
    this.add.text(GAME_WIDTH - 28, 172, '🌿', { fontSize: '20px' }).setOrigin(0.5).setDepth(2);
  }

  // ─── UI ───────────────────────────────────────────────────────────────────

  private buildUI() {
    this.add.image(GAME_WIDTH / 2, 28, 'hud_panel').setOrigin(0.5, 0.5).setDepth(3);

    this.scoreTxt = this.add.text(14, 28, '🍽️  0', {
      fontSize: '21px', fontFamily: 'Arial Black', color: COLORS.TEXT_DARK, fontStyle: 'bold',
    }).setOrigin(0, 0.5).setDepth(4);

    this.comboTxt = this.add.text(GAME_WIDTH / 2, 28, '×1.0', {
      fontSize: '14px', fontFamily: 'Arial Black', color: '#AAAAAA',
    }).setOrigin(0.5, 0.5).setDepth(4);

    this.timeTxt = this.add.text(GAME_WIDTH - 14, 28, '3:00', {
      fontSize: '17px', fontFamily: 'Arial Black', color: COLORS.TEXT_DARK, fontStyle: 'bold',
    }).setOrigin(1, 0.5).setDepth(4);

    if (!this.sys.game.device.input.touch) {
      const pauseBtn = this.add.text(GAME_WIDTH - 14, 28, '⏸', { fontSize: '20px' })
        .setOrigin(1.6, 0.5).setInteractive({ useHandCursor: true }).setDepth(5);
      pauseBtn.on('pointerdown', () => this.pauseGame());
    }

    // Combo progress strip — bottom 4px of HUD panel shows path to next multiplier
    this.comboProgressGfx = this.add.graphics().setDepth(4);
    this.updateComboProgress();
  }

  // ─── Spawning ─────────────────────────────────────────────────────────────

  private startSpawnCycle() {
    this.time.delayedCall(2000, () => this.tryEnqueueCustomer());
    this.scheduleNextSpawn();
  }

  private scheduleNextSpawn() {
    const elapsed = (this.time.now - this.gameStartMs) / 1000;
    const tier = this.getDifficultyTier(elapsed);
    const progress = Math.min(1, elapsed / tier.maxTime);
    const baseInterval = Phaser.Math.Linear(tier.spawnStart, tier.spawnEnd, progress);
    const interval = this.rushHourActive ? baseInterval * 0.5 : baseInterval;

    this.spawnTimer = this.time.addEvent({
      delay: interval,
      callback: () => {
        this.tryEnqueueCustomer();
        this.scheduleNextSpawn();
      },
      callbackScope: this,
    });
  }

  private getDifficultyTier(elapsedSeconds: number) {
    for (const tier of DIFFICULTY_TIERS) {
      if (elapsedSeconds <= tier.maxTime) return tier;
    }
    return DIFFICULTY_TIERS[DIFFICULTY_TIERS.length - 1];
  }

  private tryEnqueueCustomer() {
    const MAX_QUEUE = this.rushHourActive ? 3 : 2;
    if (this.waitingQueue.length >= MAX_QUEUE) return;
    if (this.tutorialActive && this.customers.size >= 1) return;

    const elapsed = (this.time.now - this.gameStartMs) / 1000;
    const tier = this.getDifficultyTier(elapsed);
    const patience = Phaser.Math.Between(tier.patienceMin, tier.patienceMax);

    const id = this.nextCustomerId++;
    const qIdx = this.waitingQueue.length;
    const qPos = this.getQueuePosition(qIdx);
    const customer = new Customer(this, GAME_WIDTH / 2, GAME_HEIGHT + 30, id % 7, patience);
    this.customers.set(id, customer);
    this.waitingQueue.push(customer);
    customer.state = 'entering';

    // VIP chance: 10% outside rush hour only
    if (!this.rushHourActive && !this.tutorialActive && Math.random() < 0.10) {
      customer.makeVIP();
    }

    this.tweens.add({
      targets: customer,
      x: qPos.x, y: qPos.y,
      duration: 600, ease: 'Quad.easeOut',
      onComplete: () => {
        customer.seatBounce();
        customer.showNameBanner();
        customer.startIdleBehavior();

        // Queue patience: 18 seconds before leaving
        customer.queueTimeout = this.time.delayedCall(18000, () => {
          if (this.waitingQueue.includes(customer)) this.removeCustomerFromQueue(customer);
        });

        this.updateSeatingArrows();
      },
    });
  }

  private removeCustomerFromQueue(customer: Customer) {
    const idx = this.waitingQueue.indexOf(customer);
    if (idx === -1 || customer.state === 'leaving') return;
    this.waitingQueue.splice(idx, 1);
    this.repositionQueue();
    this.updateSeatingArrows();

    customer.stopIdleBehavior();
    customer.state = 'leaving';
    customer.showAngryBubble();
    this.customersAngry++;

    const elapsed = (this.time.now - this.gameStartMs) / 1000;
    const tier = this.getDifficultyTier(elapsed);
    this.score = Math.max(0, this.score - Math.floor(tier.penalty * 0.5));
    this.scoreTxt.setText(`🍽️  ${this.score}`);
    this.showFloating('Left! 😡', customer.x, customer.y - 50, COLORS.TEXT_RED);
    this.cameras.main.shake(100, 0.002);
    this.resetCombo();

    this.time.delayedCall(400, () => {
      const cid = this.getCustomerIdByInstance(customer);
      this.tweens.add({
        targets: customer, y: GAME_HEIGHT + 60, alpha: 0,
        duration: 500, ease: 'Quad.easeIn',
        onComplete: () => {
          if (cid !== -1) this.customers.delete(cid);
          customer.cleanup();
          customer.destroy();
        },
      });
    });
  }

  private getQueuePosition(idx: number): { x: number; y: number } {
    const slots = [
      { x: 160, y: 760 },
      { x: 245, y: 770 },
      { x: 330, y: 760 },
    ];
    return slots[Math.min(idx, slots.length - 1)];
  }

  private repositionQueue() {
    this.waitingQueue.forEach((c, idx) => {
      const pos = this.getQueuePosition(idx);
      this.tweens.add({ targets: c, x: pos.x, y: pos.y, duration: 280, ease: 'Quad.easeOut' });
    });
  }

  private updateSeatingArrows() {
    const showSeating = this.waitingQueue.length > 0 && !this.carryingDirty;
    for (const table of this.tables) {
      if (table.state === 'empty') {
        if (showSeating) table.setPriority('seating');
        else table.clearPulse();
      }
    }
  }

  private seatNextCustomer(table: Table) {
    if (this.waitingQueue.length === 0) return;
    this.playerBusy = true;
    table.clearPulse();

    const customer = this.waitingQueue.shift()!;
    // Cancel queue patience timeout
    if (customer.queueTimeout) { customer.queueTimeout.remove(); customer.queueTimeout = null; }
    this.repositionQueue();
    this.updateSeatingArrows();

    const customerId = this.getCustomerIdByInstance(customer);
    table.setOccupied(customerId);
    customer.tableId = table.id;
    customer.state = 'entering';

    let arrivals = 0;
    const onBothArrived = () => {
      arrivals++;
      if (arrivals < 2) return;
      customer.state = 'requesting';
      customer.startPatience();
      customer.showRequestBubble();
      customer.seatBounce();
      customer.startIdleBehavior();
      table.setStateVisual('menu');
      table.setPriority('requesting');
      this.playerBusy = false;

      if (this.tutorialActive && this.tutorialStep === 0) this.advanceTutorial();
    };

    this.player.walkTo(table.x, table.y + 40, onBothArrived);
    this.tweens.add({
      targets: customer, x: table.x, y: table.y - 24,
      duration: 700, ease: 'Quad.easeOut',
      onComplete: onBothArrived,
    });
  }

  // ─── Game Timer ───────────────────────────────────────────────────────────

  private startGameTimer() {
    // Rush hour waves at 60s and 150s into the session
    this.time.delayedCall(60000, () => this.startRushHour());
    this.time.delayedCall(150000, () => this.startRushHour());

    this.gameTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        const elapsed = (this.time.now - this.gameStartMs) / 1000;
        const remaining = Math.max(0, GAME_DURATION - elapsed);
        const m = Math.floor(remaining / 60);
        const s = Math.floor(remaining % 60);
        this.timeTxt.setText(`${m}:${s.toString().padStart(2, '0')}`);
        if (remaining <= 30) {
          this.timeTxt.setColor(COLORS.TEXT_RED);
          if (remaining <= 30 && remaining > 29) {
            this.showFloating('⏰ 30s LEFT!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, COLORS.TEXT_RED);
            this.cameras.main.shake(150, 0.003);
          }
        }
        if (remaining <= 10 && remaining > 0) {
          this.tweens.add({
            targets: this.timeTxt, scale: { from: 1, to: 1.2 },
            duration: 400, yoyo: true,
          });
        }
        if (remaining <= 0) this.endGame();
      },
      loop: true,
    });
  }

  // ─── Table Interaction ────────────────────────────────────────────────────

  private onTableClick(tableId: number) {
    if (this.playerBusy) {
      this.player.showBusy();
      this.showFloating('BUSY!', this.player.x, this.player.y - 60, COLORS.TEXT_RED);
      return;
    }

    // While carrying dirty dishes only dishwasher is actionable
    if (this.carryingDirty) {
      this.showFloating('→ DISHWASHER!', this.player.x, this.player.y - 60, COLORS.TEXT_ORANGE);
      return;
    }

    const table = this.tables[tableId];
    const customer = this.getCustomerAtTable(tableId);

    if (table.state === 'dirty') {
      this.collectDirtyDishes(table);
      return;
    }

    if (table.state === 'empty' && this.waitingQueue.length > 0) {
      this.seatNextCustomer(table);
      return;
    }

    if (!customer) return;

    if (customer.state === 'requesting') {
      this.takeOrder(table, customer);
      return;
    }

    if (customer.state === 'waiting_food' && this.carryingOrderId !== -1) {
      const order = this.kitchenOrders.find(o => o.id === this.carryingOrderId);
      if (order && order.item.itemId === (customer.order?.itemId ?? -1)) {
        this.deliverFood(table, customer, order);
        return;
      }
    }

    if (customer.state === 'paying') {
      this.collectPayment(table, customer);
      return;
    }
  }

  private onKitchenClick() {
    if (this.playerBusy) {
      this.player.showBusy();
      this.showFloating('BUSY!', this.player.x, this.player.y - 60, COLORS.TEXT_RED);
      return;
    }
    if (this.carryingDirty) {
      this.showFloating('→ DISHWASHER!', this.player.x, this.player.y - 60, COLORS.TEXT_ORANGE);
      return;
    }
    if (this.carryingOrderId !== -1) return;

    const readyOrder = this.kitchenOrders.find(o => o.ready);
    if (!readyOrder) return;

    this.playerBusy = true;
    this.player.walkTo(KITCHEN_X, KITCHEN_Y + 50, () => {
      this.player.bounce();
      this.carryingOrderId = readyOrder.id;
      this.orderStartTimes.set(readyOrder.id, this.time.now);
      this.player.carryItem(readyOrder.item.emoji);
      this.playerBusy = false;

      // Highlight all tables whose customers can accept this item type (inventory model)
      for (const table of this.tables) {
        const cust = this.getCustomerAtTable(table.id);
        if (cust?.state === 'waiting_food' && cust.order?.itemId === readyOrder.item.itemId) {
          table.setPriority('kitchen_ready');
        }
      }

      this.removeTicket(readyOrder.id);
      this.updateKitchenGlow();

      if (this.tutorialActive && this.tutorialStep === 2) {
        this.advanceTutorial();
      }
    });
  }

  // ─── Gameplay Steps ───────────────────────────────────────────────────────

  private getCustomerAtTable(tableId: number): Customer | undefined {
    for (const [, c] of this.customers) {
      if (c.tableId === tableId) return c;
    }
    return undefined;
  }

  private takeOrder(table: Table, customer: Customer) {
    this.playerBusy = true;
    customer.state = 'ordering';
    table.clearPulse();

    this.player.walkTo(table.x, table.y + 40, () => {
      this.player.bounce();

      // Auto-assign a random menu item
      const itemId = Math.floor(Math.random() * MENU_ITEMS.length);
      const item = MENU_ITEMS[itemId];
      const order: OrderItem = { itemId, name: item.name, emoji: item.emoji, price: item.price, cookTime: item.cookTime };

      customer.order = order;
      customer.state = 'waiting_food';
      customer.showOrderBubble(order);
      customer.showOrderFlash();
      table.setStateVisual('ticket');
      this.showFloating('✓ ORDER!', table.x, table.y - 70, '#4CAF50');

      this.playerBusy = false;

      // Add to kitchen queue
      const kitchenOrder: KitchenOrder = {
        id: this.nextOrderId++,
        tableId: table.id,
        customerId: this.getCustomerIdByInstance(customer),
        item: order,
        startTime: this.time.now,
        ready: false,
      };
      this.kitchenOrders.push(kitchenOrder);
      this.addTicket(kitchenOrder);

      // Cook timer
      this.time.delayedCall(item.cookTime, () => {
        kitchenOrder.ready = true;
        this.onOrderReady(kitchenOrder);
      });

      if (this.tutorialActive && this.tutorialStep === 1) {
        this.advanceTutorial();
      }
    });
  }

  private onOrderReady(order: KitchenOrder) {
    if (order.ticketObj) {
      order.progressBar?.clear();
      const badge = this.add.text(0, -16, '✓', {
        fontSize: '14px', color: COLORS.TEXT_GOLD, fontStyle: 'bold',
      }).setOrigin(0.5);
      order.ticketObj.add(badge);

      // Scale-punch the ticket so the player notices it's ready
      this.tweens.add({
        targets: order.ticketObj,
        scaleX: { from: 1.0, to: 1.38 }, scaleY: { from: 1.0, to: 1.38 },
        duration: 160, ease: 'Back.easeOut', yoyo: true,
      });
    }
    this.updateKitchenGlow();
  }

  private deliverFood(table: Table, customer: Customer, order: KitchenOrder) {
    if (!customer.order) return;
    this.playerBusy = true;
    table.clearPulse();

    this.player.walkTo(table.x, table.y + 40, () => {
      // Customer may have gotten angry while player was walking over
      if (customer.state !== 'waiting_food') {
        this.player.clearCarry();
        this.carryingOrderId = -1;
        this.kitchenOrders = this.kitchenOrders.filter(o => o.id !== order.id);
        this.playerBusy = false;
        return;
      }

      this.player.deliverAnim();
      customer.patienceAtDelivery = customer.getPatienceFraction();
      customer.hideBubble();
      customer.state = 'eating';
      customer.stopPatience();
      customer.refillPatience();
      table.setStateVisual('plate');

      this.player.clearCarry();
      this.carryingOrderId = -1;
      this.kitchenOrders = this.kitchenOrders.filter(o => o.id !== order.id);

      const speedMult = this.getSpeedMultiplier(customer.patienceAtDelivery);
      const deliveryScore = Math.floor(customer.order!.price * 10 * speedMult * this.comboMultiplier);
      this.addScore(deliveryScore);

      const pickupTime = this.orderStartTimes.get(order.id);
      if (pickupTime !== undefined) {
        const deliveryMs = this.time.now - pickupTime;
        if (deliveryMs < this.fastestDeliveryMs) this.fastestDeliveryMs = deliveryMs;
        this.orderStartTimes.delete(order.id);
      }

      if (customer.patienceAtDelivery < 0.08) {
        this.nearMissSaves++;
        this.showFloating('💪 CLOSE CALL!', table.x, table.y - 85, '#FF4444');
      }

      if (speedMult > 1) {
        const label = SPEED_MULTIPLIERS.find(s => customer.patienceAtDelivery >= s.minPct)?.label ?? '';
        if (label) this.showFloating(label, table.x, table.y - 60, COLORS.TEXT_GOLD);
      }
      const deliverSize = this.comboMultiplier >= 5 ? 1.6 : this.comboMultiplier >= 4 ? 1.35 : this.comboMultiplier >= 3 ? 1.15 : 1;
      this.showFloating('✓ SERVED!', table.x, table.y - 55, '#4CAF50');
      this.showFloating(`+${deliveryScore}`, table.x, table.y - 35, COLORS.TEXT_ORANGE, deliverSize);
      this.playerBusy = false;

      const eatTime = 2000 + Math.random() * 2000;
      customer.startEating(eatTime);

      this.time.delayedCall(eatTime, () => {
        if (customer.state !== 'eating') return;
        customer.stopEating();
        customer.state = 'paying';
        customer.startPatience();
        customer.showPayBubble(customer.order!.price);
        table.setStateVisual('bill');
        table.setPriority('paying');

        if (this.tutorialActive && this.tutorialStep === 3) {
          this.advanceTutorial();
        }
      });
    });
  }

  private collectPayment(table: Table, customer: Customer) {
    if (!customer.order) return;
    this.playerBusy = true;
    table.clearPulse();

    this.player.walkTo(table.x, table.y + 40, () => {
      this.player.deliverAnim();

      const tip = Math.floor(customer.order!.price * customer.patienceAtDelivery * 0.3);
      const vipMult = customer.isVIP ? 2.5 : 1.0;
      const payScore = Math.floor((customer.order!.price + tip) * 5 * this.comboMultiplier * vipMult);
      this.addScore(payScore);
      const paySize = this.comboMultiplier >= 5 ? 1.8 : this.comboMultiplier >= 4 ? 1.5 : this.comboMultiplier >= 3 ? 1.25 : 1;
      this.showFloating(`💰 $${payScore}`, table.x, table.y - 50, COLORS.TEXT_GOLD, paySize);
      this.spawnCoins(table.x, table.y);

      if (customer.isVIP) {
        this.time.delayedCall(200, () => {
          this.showFloating('⭐ VIP! ×2.5', table.x, table.y - 100, COLORS.TEXT_GOLD);
          this.cameras.main.flash(140, 255, 220, 0, false);
        });
      }

      this.customersHappy++;
      this.incrementCombo();
      this.player.setEmotion('proud', 1800);

      if (customer.patienceAtDelivery >= 0.75) {
        this.time.delayedCall(300, () => {
          this.showFloating('⭐ PERFECT!', table.x, table.y - 95, COLORS.TEXT_GOLD);
        });
      }

      customer.stopIdleBehavior();
      customer.hideBubble();
      customer.state = 'leaving';
      customer.stopPatience();

      this.tweens.add({
        targets: customer,
        x: GAME_WIDTH / 2, y: GAME_HEIGHT + 60,
        duration: 700, ease: 'Quad.easeIn',
        onComplete: () => {
          const id = this.getCustomerIdByInstance(customer);
          if (id !== -1) this.customers.delete(id);
          customer.cleanup();
          customer.destroy();
        },
      });

      table.setDirty();
      this.playerBusy = false;

      if (this.tutorialActive && this.tutorialStep === 4) {
        this.advanceTutorial();
      }
    });
  }

  private collectDirtyDishes(table: Table) {
    this.playerBusy = true;
    table.clearPulse();
    this.player.walkTo(table.x, table.y + 40, () => {
      this.player.collectAnim();
      table.setEmpty();
      table.flashClean();
      this.updateSeatingArrows();

      this.carryingDirty = true;
      this.player.carryDishes();
      this.setDishwasherGlowPrimary(true);
      this.showFloating('→ DISHWASHER', table.x, table.y - 30, COLORS.TEXT_ORANGE);
      this.playerBusy = false;

      if (this.tutorialActive && this.tutorialStep === 5) {
        this.advanceTutorial();
      }
    });
  }

  private onDishwasherClick() {
    if (!this.carryingDirty) return;
    if (this.playerBusy) {
      this.player.showBusy();
      return;
    }

    this.playerBusy = true;
    // Dishwasher center x=36, y=196
    this.player.walkTo(80, 210, () => {
      this.player.bounce();
      this.carryingDirty = false;
      this.player.clearCarry();
      this.setDishwasherGlowPrimary(false);
      this.updateSeatingArrows();
      this.showFloating('✨ Clean!', 80, 180, COLORS.TEXT_GREEN);
      this.spawnDishwasherSteam();
      this.playerBusy = false;

      if (this.tutorialActive && this.tutorialStep === 6) {
        this.advanceTutorial();
      }
    });
  }

  private setDishwasherGlowPrimary(active: boolean) {
    if (this.dishwasherGlowTween) { this.dishwasherGlowTween.stop(); this.dishwasherGlowTween = null; }
    if (!active) {
      this.dishwasherGlow.setAlpha(0);
      return;
    }
    this.dishwasherGlowTween = this.tweens.add({
      targets: this.dishwasherGlow,
      alpha: { from: 0.12, to: 0.40 },
      duration: 380, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  private startRushHour() {
    if (this.rushHourActive) return;
    this.rushHourActive = true;

    this.triggerCelebration('⚡ RUSH HOUR! ⚡', '#FF4444');
    this.cameras.main.shake(280, 0.005);

    this.tweens.add({
      targets: this.rushHourOverlay,
      alpha: 0.045,
      duration: 600, ease: 'Quad.easeOut',
    });

    this.time.delayedCall(25000, () => this.endRushHour());
  }

  private endRushHour() {
    if (!this.rushHourActive) return;
    this.rushHourActive = false;

    this.tweens.add({
      targets: this.rushHourOverlay, alpha: 0,
      duration: 1000, ease: 'Quad.easeOut',
    });
    this.showFloating('😌 Rush is over', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, '#88CCFF');
  }

  private spawnDishwasherSteam() {
    for (let i = 0; i < 6; i++) {
      const sx = 12 + Math.random() * 46;
      const steam = this.add.graphics().setDepth(4);
      steam.fillStyle(0xFFFFFF, 0.28 + Math.random() * 0.18);
      steam.fillCircle(0, 0, 4 + Math.random() * 4);
      steam.setPosition(sx, 174);
      this.tweens.add({
        targets: steam,
        y: 174 - 35 - Math.random() * 30,
        x: sx + (Math.random() - 0.5) * 22,
        alpha: 0, scale: 2.2,
        duration: 550 + Math.random() * 350,
        delay: i * 70,
        ease: 'Quad.easeOut',
        onComplete: () => steam.destroy(),
      });
    }
  }

  // ─── Score / Combo ────────────────────────────────────────────────────────

  private addScore(amount: number) {
    this.score = Math.max(0, this.score + amount);
    this.scoreTxt.setText(`🍽️  ${this.score}`);
    this.scoreTxt.setColor(COLORS.TEXT_GOLD);
    this.tweens.add({
      targets: this.scoreTxt, scaleX: 1.3, scaleY: 1.3,
      duration: 130, yoyo: true, ease: 'Back.easeOut',
      onComplete: () => this.scoreTxt.setColor(COLORS.TEXT_DARK),
    });
  }

  private getSpeedMultiplier(patienceFrac: number): number {
    for (const s of SPEED_MULTIPLIERS) {
      if (patienceFrac >= s.minPct) return s.multiplier;
    }
    return 0.75;
  }

  private getComboMilestone() {
    let milestone = COMBO_MILESTONES[0];
    for (const m of COMBO_MILESTONES) {
      if (this.comboCount >= m.min) milestone = m;
    }
    return milestone;
  }

  private incrementCombo() {
    this.comboCount++;
    if (this.comboCount > this.comboRecord) this.comboRecord = this.comboCount;

    const prev = this.comboMultiplier;
    const milestone = this.getComboMilestone();
    this.comboMultiplier = milestone.multiplier;

    if (milestone.label && this.comboMultiplier > prev) {
      this.showComboAnnouncement(milestone.label, this.comboMultiplier);
    }

    const isNewMilestone = this.comboMultiplier > prev;
    this.updateComboDisplay();
    this.tweens.add({
      targets: this.comboTxt,
      scaleX: { from: isNewMilestone ? 1.5 : 1.2, to: 1.0 },
      scaleY: { from: isNewMilestone ? 1.5 : 1.2, to: 1.0 },
      duration: isNewMilestone ? 320 : 200,
      ease: 'Back.easeOut',
    });

    // Waiter reactions at combo milestones
    this.player.celebrateCombo(this.comboCount);
    if (this.comboCount === 15) {
      this.triggerCelebration('💫 TABLE MASTER! 💫', '#FFD700');
    } else if (this.comboCount === 10) {
      this.triggerCelebration('⭐ TABLE LEGEND! ⭐', COLORS.TEXT_GOLD);
    } else if (this.comboCount === 6) {
      this.spawnStarBurst(this.player.x, this.player.y - 20);
    }
  }

  private resetCombo() {
    const wasCombo = this.comboCount >= 3;
    const lostMult = this.comboMultiplier;
    this.comboCount = 0;
    this.comboMultiplier = 1.0;
    if (wasCombo) {
      this.showFloating(`💔 ×${lostMult.toFixed(1)} LOST!`, GAME_WIDTH / 2, 80, '#FF4444');
      this.comboTxt.setStyle({ color: '#FF4444' });
      // Flash the progress bar red, then clear it
      this.comboProgressGfx.clear();
      this.comboProgressGfx.fillStyle(0xFF4444, 0.85);
      this.comboProgressGfx.fillRoundedRect(100, 52, GAME_WIDTH - 200, 4, 2);
      this.tweens.add({
        targets: this.comboProgressGfx, alpha: 0,
        duration: 500,
        onComplete: () => {
          this.comboProgressGfx.setAlpha(1);
          this.updateComboDisplay();
        },
      });
      this.tweens.add({
        targets: this.comboTxt,
        scaleX: { from: 1.3, to: 1.0 },
        scaleY: { from: 1.3, to: 1.0 },
        duration: 320, ease: 'Quad.easeOut',
        onComplete: () => this.updateComboDisplay(),
      });
      this.cameras.main.shake(100, 0.003);
    } else {
      this.updateComboDisplay();
    }
  }

  private updateComboDisplay() {
    const m = this.comboMultiplier;
    const n = this.comboCount;
    if (n === 0) {
      this.comboTxt.setText('×1.0');
      this.comboTxt.setStyle({ color: '#AAAAAA', fontSize: '14px', fontFamily: 'Arial Black' });
    } else if (n <= 2) {
      // Building to first milestone — show anticipation
      this.comboTxt.setText(`↑${n}`);
      this.comboTxt.setStyle({ color: '#D4A85A', fontSize: '15px', fontFamily: 'Arial Black' });
    } else if (m <= 2.0) {
      this.comboTxt.setText('🔥 ×2.0');
      this.comboTxt.setStyle({ color: '#FF8C42', fontSize: '17px', fontFamily: 'Arial Black' });
    } else if (m <= 3.0) {
      this.comboTxt.setText('🔥🔥 ×3.0');
      this.comboTxt.setStyle({ color: '#FF5722', fontSize: '19px', fontFamily: 'Arial Black' });
    } else if (m <= 4.0) {
      this.comboTxt.setText('⭐ ×4.0');
      this.comboTxt.setStyle({ color: '#E91E63', fontSize: '20px', fontFamily: 'Arial Black' });
    } else {
      this.comboTxt.setText('💫 ×5.0');
      this.comboTxt.setStyle({ color: '#FFD700', fontSize: '22px', fontFamily: 'Arial Black' });
    }
    this.updateComboProgress();
  }

  private updateComboProgress() {
    const n = this.comboCount;
    let tierIdx = 0;
    for (let i = COMBO_MILESTONES.length - 1; i >= 0; i--) {
      if (n >= COMBO_MILESTONES[i].min) { tierIdx = i; break; }
    }
    const isMaxTier = tierIdx === COMBO_MILESTONES.length - 1;
    let progress = isMaxTier ? 1 : 0;
    if (!isMaxTier) {
      const cur = COMBO_MILESTONES[tierIdx].min;
      const nxt = COMBO_MILESTONES[tierIdx + 1].min;
      progress = (n - cur) / (nxt - cur);
    }
    const tierColors = [0xAAAAAA, 0xFF8C42, 0xFF5722, 0xE91E63, 0xFFD700];
    const color = tierColors[Math.min(tierIdx, tierColors.length - 1)];
    this.comboProgressGfx.clear();
    this.comboProgressGfx.fillStyle(0x000000, 0.18);
    this.comboProgressGfx.fillRoundedRect(100, 52, GAME_WIDTH - 200, 4, 2);
    if (progress > 0) {
      this.comboProgressGfx.fillStyle(color, isMaxTier ? 1.0 : 0.85);
      this.comboProgressGfx.fillRoundedRect(100, 52, (GAME_WIDTH - 200) * progress, 4, 2);
    }
  }

  private showComboAnnouncement(label: string, multiplier: number) {
    const size = 14 + Math.floor((multiplier - 1) * 4);
    const color = multiplier >= 5.0 ? '#FFD700'
      : multiplier >= 4.0 ? '#E91E63'
      : multiplier >= 3.0 ? '#FF5722'
      : COLORS.TEXT_ORANGE;
    const strokeThickness = multiplier >= 3.0 ? 3 : 0;

    const txt = this.add.text(GAME_WIDTH / 2, 80, label, {
      fontSize: `${size}px`, fontFamily: 'Arial Black', color,
      stroke: '#000000', strokeThickness,
    }).setOrigin(0.5).setDepth(30).setAlpha(0).setX(GAME_WIDTH + 100);

    this.tweens.add({
      targets: txt, x: GAME_WIDTH / 2, alpha: 1,
      duration: 300, ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1400, () => {
          this.tweens.add({ targets: txt, alpha: 0, duration: 300, onComplete: () => txt.destroy() });
        });
      },
    });
    if (multiplier >= 3.0) {
      this.cameras.main.flash(200, 255, 200, 80, false);
    }
    if (multiplier >= 4.0) {
      this.spawnStarBurst(GAME_WIDTH / 2, 80);
    }
  }

  // ─── Kitchen Ticket UI ────────────────────────────────────────────────────

  private addTicket(order: KitchenOrder) {
    const idx = this.kitchenOrders.length - 1;
    const startX = -Math.min(4, this.kitchenOrders.length) * 28;
    const x = startX + idx * 56;

    const container = this.add.container(x, 0);
    const bg = this.add.image(0, 0, 'ticket');
    const emoji = this.add.text(0, 2, order.item.emoji, { fontSize: '22px' }).setOrigin(0.5);

    const progressTrack = this.add.graphics();
    progressTrack.fillStyle(0x2C1810, 0.25);
    progressTrack.fillRoundedRect(-20, 14, 40, 5, 2);

    const progressBar = this.add.graphics();

    container.add([bg, emoji, progressTrack, progressBar]);
    this.ticketRail.add(container);
    order.ticketObj = container;
    order.progressBar = progressBar;

    // slide in from right
    container.setX(200);
    this.tweens.add({ targets: container, x, duration: 250, ease: 'Quad.easeOut' });
  }

  private removeTicket(orderId: number) {
    const order = this.kitchenOrders.find(o => o.id === orderId);
    if (order?.ticketObj) {
      this.tweens.add({
        targets: order.ticketObj, scaleX: 0, scaleY: 0, alpha: 0,
        duration: 200, ease: 'Quad.easeIn',
        onComplete: () => order.ticketObj?.destroy(),
      });
      order.ticketObj = undefined;
    }
  }

  private updateKitchenGlow() {
    const hasReady = this.kitchenOrders.some(o => o.ready);
    if (!hasReady && this.kitchenGlowTween) {
      this.kitchenGlowTween.stop();
      this.kitchenGlowTween = null;
      this.kitchenGlow.setAlpha(0);
      this.kitchenGlowPrimary = false;
    }
    // Glow startup is handled by setKitchenGlowPrimary via updateActionPriority
  }

  private setKitchenGlowPrimary(isPrimary: boolean) {
    if (this.kitchenGlowPrimary === isPrimary) return;
    this.kitchenGlowPrimary = isPrimary;

    const hasReady = this.kitchenOrders.some(o => o.ready);
    if (!hasReady) return;

    if (this.kitchenGlowTween) { this.kitchenGlowTween.stop(); this.kitchenGlowTween = null; }

    const maxAlpha = isPrimary ? 0.82 : 0.38;
    const minAlpha = isPrimary ? 0.45 : 0.18;

    this.kitchenGlowTween = this.tweens.add({
      targets: this.kitchenGlow,
      alpha: { from: maxAlpha, to: minAlpha },
      duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  private updateActionPriority() {
    if (this.time.now - this.priorityLastUpdate < 150) return;
    this.priorityLastUpdate = this.time.now;

    // Carrying dirty dishes: only dishwasher matters
    if (this.carryingDirty) {
      for (const table of this.tables) table.setUrgencyLevel(false);
      this.setKitchenGlowPrimary(false);
      return;
    }

    let primaryTableId = -1;
    let primaryKitchen = false;

    // 1. Urgent: patience < 25% on active customers
    const urgentCheckStates = ['requesting', 'ordering', 'waiting_food', 'paying'];
    for (const table of this.tables) {
      const customer = this.getCustomerAtTable(table.id);
      if (customer &&
          urgentCheckStates.includes(customer.state) &&
          customer.getPatienceFraction() < 0.25) {
        table.setPriority('urgent');
        if (primaryTableId === -1) primaryTableId = table.id;
      }
    }

    // 2. Paying customers
    if (primaryTableId === -1) {
      for (const table of this.tables) {
        const customer = this.getCustomerAtTable(table.id);
        if (customer?.state === 'paying') { primaryTableId = table.id; break; }
      }
    }

    // 3. Carrying food: highlight the first table whose customer can accept what we're holding
    if (primaryTableId === -1 && this.carryingOrderId !== -1) {
      const order = this.kitchenOrders.find(o => o.id === this.carryingOrderId);
      if (order) {
        for (const table of this.tables) {
          const cust = this.getCustomerAtTable(table.id);
          if (cust?.state === 'waiting_food' && cust.order?.itemId === order.item.itemId) {
            primaryTableId = table.id;
            break;
          }
        }
        if (primaryTableId === -1) primaryTableId = order.tableId;
      }
    }

    // 4. Kitchen has ready order to pick up
    if (primaryTableId === -1 && this.carryingOrderId === -1 && this.kitchenOrders.some(o => o.ready)) {
      primaryKitchen = true;
    }

    // 5. Requesting customers
    if (primaryTableId === -1 && !primaryKitchen) {
      for (const table of this.tables) {
        const customer = this.getCustomerAtTable(table.id);
        if (customer?.state === 'requesting') { primaryTableId = table.id; break; }
      }
    }

    // 6. Seating: queue waiting + empty tables available
    if (primaryTableId === -1 && !primaryKitchen && this.waitingQueue.length > 0) {
      for (const table of this.tables) {
        if (table.state === 'empty') { primaryTableId = table.id; break; }
      }
    }

    // 7. Dirty tables
    if (primaryTableId === -1 && !primaryKitchen) {
      for (const table of this.tables) {
        if (table.state === 'dirty') { primaryTableId = table.id; break; }
      }
    }

    for (const table of this.tables) {
      table.setUrgencyLevel(table.id === primaryTableId);
    }
    this.setKitchenGlowPrimary(primaryKitchen);
  }

  // ─── Angry Customers ──────────────────────────────────────────────────────

  update() {
    this.updateActionPriority();

    for (const [id, customer] of this.customers) {
      const nonAngryStates = ['leaving', 'eating', 'paying'];
      if (customer.isAngry() && !nonAngryStates.includes(customer.state)) {
        this.customerLeaveAngry(id, customer);
      }
    }

    for (const order of this.kitchenOrders) {
      if (!order.ready && order.progressBar) {
        const frac = Math.min(1, (this.time.now - order.startTime) / order.item.cookTime);
        order.progressBar.clear();
        order.progressBar.fillStyle(frac > 0.8 ? 0xFF9800 : 0x4CAF50);
        order.progressBar.fillRoundedRect(-20, 14, 40 * frac, 5, 2);
      }
    }
  }

  private customerLeaveAngry(id: number, customer: Customer) {
    customer.state = 'leaving';
    customer.stopPatience();
    customer.showAngryBubble();
    this.customersAngry++;

    const elapsed = (this.time.now - this.gameStartMs) / 1000;
    const tier = this.getDifficultyTier(elapsed);
    const penalty = tier.penalty;

    this.score = Math.max(0, this.score - penalty);
    this.scoreTxt.setText(`🍽️  ${this.score}`);
    this.showFloating(`-${penalty} 😠`, customer.x, customer.y - 40, COLORS.TEXT_RED);
    this.cameras.main.shake(200, 0.004);
    this.player.reactToAngry();

    this.resetCombo();

    // Angry customer → table goes straight to EMPTY (not dirty)
    const table = this.tables[customer.tableId];
    if (table) {
      table.setEmpty();
      this.updateSeatingArrows();
    }

    customer.stopIdleBehavior();

    this.time.delayedCall(400, () => {
      this.tweens.add({
        targets: customer,
        x: GAME_WIDTH / 2, y: GAME_HEIGHT + 60,
        duration: 500, ease: 'Quad.easeIn',
        onComplete: () => {
          this.customers.delete(id);
          customer.cleanup();
          customer.destroy();
        },
      });
    });
  }

  // ─── Tutorial ─────────────────────────────────────────────────────────────

  private startTutorial() {
    this.tutorialActive = true;
    this.tutorialStep = 0;

    this.tutorialOverlay = this.add.container(0, 0).setDepth(50);

    this.startGameTimer();
    this.time.delayedCall(800, () => this.tryEnqueueCustomer());

    this.showTutorialStep(0, 'Guest at the door! Tap a TABLE to seat them.');
  }

  private showTutorialStep(step: number, text: string) {
    this.tutorialOverlay.removeAll(true);

    // Compact floating card — not a full-screen overlay
    const cardY = GAME_HEIGHT - 60;
    const bg = this.add.graphics();
    bg.fillStyle(0x120804, 0.92);
    bg.fillRoundedRect(16, cardY - 26, GAME_WIDTH - 32, 54, 10);
    bg.lineStyle(2, 0xCC8833, 0.65);
    bg.strokeRoundedRect(16, cardY - 26, GAME_WIDTH - 32, 54, 10);

    const txt = this.add.text(GAME_WIDTH / 2, cardY - 6, text, {
      fontSize: '14px', fontFamily: 'Arial Black', color: '#FFFFFF',
      align: 'center', wordWrap: { width: GAME_WIDTH - 56 },
    }).setOrigin(0.5);

    // Progress dots
    const total = 7;
    const gap = 14;
    const dotsX = GAME_WIDTH / 2 - (total - 1) * gap / 2;
    for (let d = 0; d < total; d++) {
      const dot = this.add.graphics();
      dot.fillStyle(d < step ? 0xFF9900 : d === step ? 0xFFCC44 : 0x555555, 1);
      dot.fillCircle(dotsX + d * gap, cardY + 18, d === step ? 4.5 : 3);
      this.tutorialOverlay.add(dot);
    }

    this.tutorialOverlay.add([bg, txt]);
    this.tutorialOverlay.setAlpha(0);
    this.tweens.add({ targets: this.tutorialOverlay, alpha: 1, duration: 240, ease: 'Quad.easeOut' });
  }

  private advanceTutorial() {
    this.tutorialStep++;
    const steps: string[] = [
      'Tap the TABLE to take their order.',
      'Food cooking! Tap the KITCHEN when it\'s ready.',
      'Pick up the food and tap the TABLE to deliver.',
      'Customer eating... Tap TABLE to collect payment.',
      'Table dirty! Tap TABLE to pick up dishes.',
      'Carry dishes to the DISHWASHER.',
    ];

    if (this.tutorialStep <= 6) {
      const msg = steps[this.tutorialStep - 1] ?? '';
      if (msg) this.showTutorialStep(this.tutorialStep, msg);
    }

    if (this.tutorialStep >= 7) {
      this.endTutorial();
    }
  }

  private endTutorial() {
    this.tutorialActive = false;
    ProgressionSystem.markTutorialDone();

    this.tweens.add({
      targets: this.tutorialOverlay, alpha: 0, duration: 500,
      onComplete: () => {
        this.tutorialOverlay.destroy();
        this.startSpawnCycle();
      },
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private showFloating(text: string, x: number, y: number, color: string, sizeMult = 1) {
    const px = Math.round(20 * sizeMult);
    const t = this.add.text(x, y, text, {
      fontSize: `${px}px`, fontFamily: 'Arial Black', color,
    }).setOrigin(0.5).setDepth(25).setScale(0);
    this.tweens.add({
      targets: t, scale: 1.25,
      duration: 120, ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: t, scale: 1,
          duration: 80,
          onComplete: () => {
            this.tweens.add({
              targets: t, y: y - 60, alpha: 0,
              duration: 1000, ease: 'Quad.easeOut',
              onComplete: () => t.destroy(),
            });
          },
        });
      },
    });
  }

  private spawnCoins(x: number, y: number) {
    // Gold burst flash
    const flash = this.add.graphics().setDepth(19);
    flash.fillStyle(0xFFD700, 0.4);
    flash.fillCircle(x, y, 30);
    this.tweens.add({
      targets: flash, alpha: 0, scaleX: 2.8, scaleY: 2.8,
      duration: 380, ease: 'Quad.easeOut',
      onComplete: () => flash.destroy(),
    });
    // 8 gold coins arc outward
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i - Math.PI / 2;
      const dist = 52 + (i % 2) * 14; // alternating distances
      const coin = this.add.graphics().setDepth(20);
      coin.fillStyle(0xFFD700, 1);
      coin.fillCircle(0, 0, 8);
      coin.fillStyle(0xFFFF99, 0.55);
      coin.fillCircle(-2, -2, 4);
      coin.lineStyle(1.5, 0xCC9900, 1);
      coin.strokeCircle(0, 0, 8);
      coin.setPosition(x, y).setScale(0.4);
      this.tweens.add({
        targets: coin,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist - 10,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 660,
        delay: i * 45,
        ease: 'Quad.easeOut',
        onComplete: () => coin.destroy(),
      });
    }
  }

  private getCustomerIdByInstance(target: Customer): number {
    for (const [id, c] of this.customers) {
      if (c === target) return id;
    }
    return -1;
  }

  private spawnStarBurst(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const star = this.add.text(x, y, '⭐', { fontSize: '14px' }).setOrigin(0.5).setDepth(30);
      this.tweens.add({
        targets: star,
        x: x + Math.cos(angle) * 55,
        y: y + Math.sin(angle) * 55,
        alpha: 0, scale: 0,
        duration: 650, delay: i * 40, ease: 'Quad.easeOut',
        onComplete: () => star.destroy(),
      });
    }
  }

  private triggerCelebration(message = '🌟 TABLE LEGEND! 🌟', color = COLORS.TEXT_GOLD) {
    this.cameras.main.flash(250, 255, 230, 100, false);

    const txt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, message, {
      fontSize: '26px', fontFamily: 'Arial Black', color,
    }).setOrigin(0.5).setDepth(40).setScale(0);

    this.tweens.add({
      targets: txt, scale: 1.1,
      duration: 350, ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1200, () => {
          this.tweens.add({ targets: txt, alpha: 0, duration: 300, onComplete: () => txt.destroy() });
        });
      },
    });

    for (let i = 0; i < 14; i++) {
      const sx = Phaser.Math.Between(40, GAME_WIDTH - 40);
      const sy = Phaser.Math.Between(GAME_HEIGHT / 3, GAME_HEIGHT * 2 / 3);
      const star = this.add.text(sx, sy, '✨', { fontSize: '20px' }).setOrigin(0.5).setDepth(35);
      this.tweens.add({
        targets: star, y: sy - 130, alpha: 0,
        duration: 900, delay: i * 55, ease: 'Quad.easeOut',
        onComplete: () => star.destroy(),
      });
    }
  }

  private pauseGame() {
    this.scene.pause();
    this.scene.launch('PauseScene');
  }

  private spawnKitchenSteam() {
    const activeCooking = this.kitchenOrders.filter(o => !o.ready);
    if (activeCooking.length === 0) return;

    const count = Math.min(activeCooking.length, 3);
    for (let i = 0; i < count; i++) {
      const sx = KITCHEN_X - 100 + i * 70 + (Math.random() - 0.5) * 25;
      const sy = KITCHEN_Y - 32;
      const steam = this.add.graphics().setDepth(5);
      steam.fillStyle(0xFFFFFF, 0.25 + Math.random() * 0.15);
      steam.fillCircle(0, 0, 3 + Math.random() * 3);
      steam.setPosition(sx, sy);
      this.tweens.add({
        targets: steam,
        y: sy - 30 - Math.random() * 25,
        x: sx + (Math.random() - 0.5) * 14,
        alpha: 0,
        scaleX: 2 + Math.random(),
        scaleY: 2 + Math.random(),
        duration: 850 + Math.random() * 400,
        ease: 'Quad.easeOut',
        onComplete: () => steam.destroy(),
      });
    }
  }

  private endGame() {
    this.spawnTimer?.remove();
    this.gameTimer?.remove();
    this.steamTimer?.remove();
    this.steamTimer = null;

    const total = this.customersHappy + this.customersAngry;
    const happyRate = total > 0 ? this.customersHappy / total : 0;
    const stars = happyRate >= 0.9 && this.score >= 2000 ? 3
      : happyRate >= 0.7 ? 2 : 1;

    this.time.delayedCall(500, () => {
      this.scene.start('GameOverScene', {
        score: this.score,
        stars,
        customersHappy: this.customersHappy,
        customersAngry: this.customersAngry,
        comboRecord: this.comboRecord,
        fastestDeliveryMs: this.fastestDeliveryMs,
        nearMissSaves: this.nearMissSaves,
      });
    });
  }
}
