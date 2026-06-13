import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, COLORS,
  MENU_ITEMS, DIFFICULTY_TIERS, COMBO_MILESTONES, SPEED_MULTIPLIERS,
  GAME_DURATION, fmtScore,
} from '../config/GameConfig';
import { Table } from '../entities/Table';
import { Customer, OrderItem } from '../entities/Customer';
import { Player } from '../entities/Player';
import { CarrySystem } from '../systems/CarrySystem';
import { ProgressionSystem } from '../systems/ProgressionSystem';
import { SoundManager } from '../systems/SoundManager';

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
  private prevHighScore = 0;
  private newRecordAnnounced = false;

  private scoreTxt!: Phaser.GameObjects.Text;
  private comboTxt!: Phaser.GameObjects.Text;
  private timeTxt!: Phaser.GameObjects.Text;
  private comboProgressGfx!: Phaser.GameObjects.Graphics;
  private hudTimerPill!: Phaser.GameObjects.Graphics;
  private hudComboPill!: Phaser.GameObjects.Graphics;
  private queueCountTxt!: Phaser.GameObjects.Text;

  private gameTimeMs = GAME_DURATION * 1000;
  private gameStartMs = 0;
  private gameTimer!: Phaser.Time.TimerEvent;
  private spawnTimer!: Phaser.Time.TimerEvent;

  private playerBusy = false;
  private tray = new CarrySystem(2);
  private carryingDirty = false;
  private waitingQueue: Customer[] = [];
  private readyPlateSprites = new Map<number, Phaser.GameObjects.Container>();

  private kitchenGlow!: Phaser.GameObjects.Graphics;
  private kitchenGlowTween: Phaser.Tweens.Tween | null = null;
  private dishwasherGlow!: Phaser.GameObjects.Graphics;
  private dishwasherGlowTween: Phaser.Tweens.Tween | null = null;

  private rushHourActive = false;
  private rushHourOverlay!: Phaser.GameObjects.Graphics;
  private rushBorder: Phaser.GameObjects.Graphics | null = null;
  private rushBorderTween: Phaser.Tweens.Tween | null = null;
  private rushCountdownTxt: Phaser.GameObjects.Text | null = null;
  private rushEndTime = 0;
  private comboHeatOverlay!: Phaser.GameObjects.Graphics;
  private ticketRail!: Phaser.GameObjects.Container;
  private playerLevel = 1;
  private comboShieldReady = false;

  // Content progression
  private sessionType: 'normal' | 'vip_night' | 'birthday_night' | 'critic_night' | 'business_lunch' | 'family_day' = 'normal';
  private criticSpawned = false;
  private criticPresent = false;
  private criticAngrySeen = false;
  private criticTimer: Phaser.Time.TimerEvent | null = null;
  private birthdayBoostRemaining = 0;
  private birthdayCustomerQueued = false;
  private scoreMultiplier = 1.0;
  private scoreMultiplierTimer: Phaser.Time.TimerEvent | null = null;
  private storyEvents: string[] = [];

  private steamTimer: Phaser.Time.TimerEvent | null = null;
  private priorityLastUpdate = 0;
  private kitchenGlowPrimary = false;
  private cookingOnBurner: Map<number, Phaser.GameObjects.Container> = new Map();

  private tutorialStep = 0;
  private tutorialActive = false;
  private tutorialOverlay!: Phaser.GameObjects.Container;
  private tutorialWaitingForAction = false;
  private tutorialSpotlight: Phaser.GameObjects.Graphics | null = null;
  private tutorialSpotlightTween: Phaser.Tweens.Tween | null = null;

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
    this.newRecordAnnounced = false;
    this.orderStartTimes.clear();
    this.playerBusy = false;
    // Tray capacity scales with player level: 2 → 3 → 4 slots
    const { level, highScore } = ProgressionSystem.getData();
    this.playerLevel = level;
    this.prevHighScore = highScore;
    const trayCapacity = level >= 5 ? 4 : level >= 3 ? 3 : 2;
    this.tray = new CarrySystem(trayCapacity);
    this.carryingDirty = false;
    this.readyPlateSprites.forEach((plate) => {
      const timer = (plate as any)._steamTimer as Phaser.Time.TimerEvent | undefined;
      if (timer) timer.remove();
      const ring = (plate as any)._readyRing as Phaser.GameObjects.Graphics | undefined;
      if (ring) ring.destroy();
      plate.destroy();
    });
    this.readyPlateSprites.clear();
    this.waitingQueue = [];
    this.rushHourActive = false;
    this.rushBorder = null;
    this.rushBorderTween = null;
    this.rushCountdownTxt = null;
    this.rushEndTime = 0;
    this.comboShieldReady = false;
    this.sessionType = 'normal';
    this.criticSpawned = false;
    this.criticPresent = false;
    this.criticAngrySeen = false;
    this.criticTimer = null;
    this.birthdayBoostRemaining = 0;
    this.birthdayCustomerQueued = false;
    this.scoreMultiplier = 1.0;
    this.scoreMultiplierTimer = null;
    this.storyEvents = [];
    this.kitchenOrders = [];
    this.nextOrderId = 0;
    this.nextCustomerId = 0;
    this.tables = [];
    this.customers.clear();
    this.gameStartMs = this.time.now;

    this.buildRestaurant();
    this.buildUI();

    this.player = new Player(this, GAME_WIDTH / 2, 700);
    // Level 4+: speed boost
    if (level >= 4) this.player.setWalkSpeed(1.15);
    // Show empty tray slots immediately so player sees their capacity from the start
    this.player.showTray([], this.tray.maxCapacity);

    this.steamTimer = this.time.addEvent({
      delay: 700, loop: true,
      callback: this.spawnKitchenSteam, callbackScope: this,
    });

    this.input.keyboard?.addKey('ESC').on('down', () => this.pauseGame());

    SoundManager.startMusic();

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
    // ── Dining floor — dark walnut hardwood planks (Fix 1) ───────────────────
    const PLANK_H = 34;
    const plankCols = [0x2E1E0F, 0x251508, 0x2B1B0D, 0x221307, 0x301F10];
    const floorGfx = this.add.graphics().setDepth(0);
    const rowCount = Math.ceil((GAME_HEIGHT - 188) / PLANK_H) + 1;
    for (let row = 0; row < rowCount; row++) {
      floorGfx.fillStyle(plankCols[row % plankCols.length], 1);
      floorGfx.fillRect(0, 188 + row * PLANK_H, GAME_WIDTH, PLANK_H);
    }
    // Plank gap shadow (bottom edge of each board)
    floorGfx.fillStyle(0x000000, 0.28);
    for (let row = 1; row < rowCount; row++) {
      floorGfx.fillRect(0, 188 + row * PLANK_H - 1, GAME_WIDTH, 1);
    }
    // Grain highlight (top edge of each board — subtle warm sheen)
    floorGfx.fillStyle(0xFF9944, 0.04);
    for (let row = 0; row < rowCount; row++) {
      floorGfx.fillRect(0, 188 + row * PLANK_H, GAME_WIDTH, 2);
    }
    // Board end-grain joints (staggered vertical lines)
    const jointGfx = this.add.graphics().setDepth(0.1);
    jointGfx.lineStyle(1, 0x160A02, 0.28);
    for (let row = 0; row < rowCount; row++) {
      const py = 188 + row * PLANK_H;
      const xOff = (row % 3) * 26;
      for (let bx = 72 + xOff; bx < GAME_WIDTH - 10; bx += 80) {
        jointGfx.lineBetween(bx, py + 2, bx, py + PLANK_H - 3);
      }
    }

    // ── Kitchen floor — cool steel slate tiles (Fix 2) ───────────────────────
    const SLATE_W = 38, SLATE_H = 30;
    const kitchenSlate = this.add.graphics().setDepth(0.15);
    const slateRows = Math.ceil(100 / SLATE_H) + 1;
    const slateCols = Math.ceil(GAME_WIDTH / SLATE_W) + 1;
    for (let sr = 0; sr < slateRows; sr++) {
      for (let sc = 0; sc < slateCols; sc++) {
        kitchenSlate.fillStyle((sr + sc) % 2 === 0 ? 0x1E2523 : 0x191F1E, 1);
        kitchenSlate.fillRect(sc * SLATE_W, 88 + sr * SLATE_H, SLATE_W, SLATE_H);
      }
    }
    kitchenSlate.lineStyle(1, 0x0D1110, 0.65);
    for (let sc = 1; sc < slateCols; sc++) {
      kitchenSlate.lineBetween(sc * SLATE_W, 88, sc * SLATE_W, 188);
    }
    for (let sr = 1; sr < slateRows; sr++) {
      kitchenSlate.lineBetween(0, 88 + sr * SLATE_H, GAME_WIDTH, 88 + sr * SLATE_H);
    }

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
    // Left wall — terracotta upper / cream wainscoting lower (Fix 3)
    const lWall = this.add.graphics().setDepth(1);
    lWall.fillStyle(0xBF7A42, 1);
    lWall.fillRect(0, 88, wallW, Math.floor(wallH * 0.58));
    lWall.fillStyle(0xEEE3D2, 1);    // warm cream wainscoting
    lWall.fillRect(0, 88 + Math.floor(wallH * 0.58), wallW, Math.floor(wallH * 0.38));
    lWall.fillStyle(0x5A2E12, 1);    // dark mahogany chair rail
    lWall.fillRect(0, 88 + Math.floor(wallH * 0.57), wallW, 4);
    lWall.fillStyle(0x251007, 1);    // near-black baseboard
    lWall.fillRect(0, GAME_HEIGHT - 14, wallW, 14);
    // Left wall sconces (depth 2 so they appear above the wall strip)
    [240, 490].forEach((sy, si) => {
      const sc = this.add.graphics().setDepth(2);
      sc.fillStyle(0xC8A060, 1);
      sc.fillRect(wallW - 4, sy - 4, 4, 8); // bracket arm
      sc.fillStyle(0xFFEE88, 0.9);
      sc.fillTriangle(wallW - 6, sy - 8, wallW + 4, sy - 8, wallW + 1, sy + 8); // shade
      // Glow pool as separate object so it can flicker
      const glow = this.add.graphics().setDepth(2);
      glow.fillStyle(0xFFFF88, 0.25);
      glow.fillCircle(wallW, sy + 4, 18);
      this.tweens.add({
        targets: glow, alpha: { from: 0.85, to: 1.0 },
        duration: 600 + si * 220, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    });
    // Right wall — terracotta upper / cream wainscoting lower (Fix 3)
    const rWall = this.add.graphics().setDepth(1);
    rWall.fillStyle(0xBF7A42, 1);
    rWall.fillRect(GAME_WIDTH - wallW, 88, wallW, Math.floor(wallH * 0.58));
    rWall.fillStyle(0xEEE3D2, 1);    // warm cream wainscoting
    rWall.fillRect(GAME_WIDTH - wallW, 88 + Math.floor(wallH * 0.58), wallW, Math.floor(wallH * 0.38));
    rWall.fillStyle(0x5A2E12, 1);    // dark mahogany chair rail
    rWall.fillRect(GAME_WIDTH - wallW, 88 + Math.floor(wallH * 0.57), wallW, 4);
    rWall.fillStyle(0x251007, 1);    // near-black baseboard
    rWall.fillRect(GAME_WIDTH - wallW, GAME_HEIGHT - 14, wallW, 14);
    [240, 490].forEach((sy, si) => {
      const sc = this.add.graphics().setDepth(2);
      sc.fillStyle(0xC8A060, 1);
      sc.fillRect(GAME_WIDTH - wallW, sy - 4, 4, 8);
      sc.fillStyle(0xFFEE88, 0.9);
      sc.fillTriangle(GAME_WIDTH - wallW - 4, sy - 8, GAME_WIDTH + 4, sy - 8, GAME_WIDTH - 1, sy + 8);
      const rglow = this.add.graphics().setDepth(2);
      rglow.fillStyle(0xFFFF88, 0.25);
      rglow.fillCircle(GAME_WIDTH - wallW, sy + 4, 18);
      this.tweens.add({
        targets: rglow, alpha: { from: 0.85, to: 1.0 },
        duration: 700 + si * 180, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    });

    // ── Wall art — hung on side walls below the pendant lamps ────────────────
    // Two landscape frames on the upper dining wall (y=185–250), visible above tables
    [[55, 218], [GAME_WIDTH - 55, 218]].forEach(([fx, fy]) => {
      const fr = this.add.graphics().setDepth(1.5);
      // Frame (mahogany)
      fr.fillStyle(0x7A5214, 1);
      fr.fillRoundedRect(fx - 32, fy - 22, 64, 44, 3);
      // Mat
      fr.fillStyle(0xF0EBE0, 1);
      fr.fillRect(fx - 28, fy - 18, 56, 36);
      // Sky
      fr.fillStyle(0x87BEDD, 1);
      fr.fillRect(fx - 28, fy - 18, 56, 18);
      // Sun disc
      fr.fillStyle(0xFFD700, 0.9);
      fr.fillCircle(fx + 10, fy - 12, 7);
      // Warm horizon glow
      fr.fillStyle(0xFF8833, 0.2);
      fr.fillRect(fx - 28, fy - 2, 56, 5);
      // Ground (warm amber)
      fr.fillStyle(0x7A4018, 1);
      fr.fillRect(fx - 28, fy, 56, 18);
      // Two small trees silhouettes
      fr.fillStyle(0x1A3A0A, 1);
      fr.fillCircle(fx - 12, fy - 2, 7);
      fr.fillRect(fx - 14, fy, 4, 12);
      fr.fillCircle(fx + 12, fy - 4, 6);
      fr.fillRect(fx + 10, fy, 3, 12);
      // Frame gold highlight top-left
      fr.lineStyle(1, 0xC8902A, 0.5);
      fr.strokeRoundedRect(fx - 32, fy - 22, 64, 44, 3);
    });

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
    });
    // Per-table candlelight pools — accurate to actual table positions (Fix 4)
    TABLE_POSITIONS.forEach(pos => {
      const pool = this.add.graphics().setDepth(0.05);
      pool.fillStyle(0xFFBB44, 0.08);
      pool.fillEllipse(pos.x, pos.y + 10, 120, 70);
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
    [0, 1, 2, 3, 4].forEach((itemId, i) => {
      this.add.image(KITCHEN_X + 8 + i * 46, 76, `food_${itemId}`)
        .setScale(0.38).setOrigin(0.5).setDepth(3);
    });

    // ── Kitchen ───────────────────────────────────────────────────────────────

    // ── COOKING ZONE (left half) ────────────────────────────────────────────
    const cookZone = this.add.graphics().setDepth(2.5);
    // Cast iron charcoal surface — dark enough for flame contrast, not pitch black
    cookZone.fillStyle(0x3A2C22, 1);
    cookZone.fillRoundedRect(8, KITCHEN_Y - 34, KITCHEN_X - 16, 68, { tl: 4, tr: 0, bl: 4, br: 0 });
    // Warm amber vignette (more noticeable near the burners)
    cookZone.fillStyle(0xFF8833, 0.08);
    cookZone.fillRoundedRect(8, KITCHEN_Y - 10, KITCHEN_X - 16, 44, { tl: 0, tr: 0, bl: 4, br: 0 });

    // Burner plate (left) — lighter rings for contrast on dark background
    const burnerL = this.add.graphics().setDepth(2.7);
    const blx = 70, bly = KITCHEN_Y + 8;
    burnerL.fillStyle(0x282828, 1); burnerL.fillCircle(blx, bly, 22);
    burnerL.lineStyle(3, 0x888888, 1); burnerL.strokeCircle(blx, bly, 22);    // outer rim — silver
    burnerL.lineStyle(2, 0x666666, 1); burnerL.strokeCircle(blx, bly, 14);
    burnerL.lineStyle(1.5, 0x555555, 1); burnerL.strokeCircle(blx, bly, 7);
    burnerL.fillStyle(0x1A1A1A, 1); burnerL.fillCircle(blx, bly, 5);
    burnerL.lineStyle(1.5, 0x777777, 0.8);
    for (let a = 0; a < 6; a++) {
      const rad = (a * Math.PI * 2) / 6;
      burnerL.lineBetween(blx + Math.cos(rad) * 7, bly + Math.sin(rad) * 7, blx + Math.cos(rad) * 21, bly + Math.sin(rad) * 21);
    }

    // Burner plate (right)
    const burnerR = this.add.graphics().setDepth(2.7);
    const brx = 185, bry = KITCHEN_Y + 8;
    burnerR.fillStyle(0x282828, 1); burnerR.fillCircle(brx, bry, 22);
    burnerR.lineStyle(3, 0x888888, 1); burnerR.strokeCircle(brx, bry, 22);
    burnerR.lineStyle(2, 0x666666, 1); burnerR.strokeCircle(brx, bry, 14);
    burnerR.lineStyle(1.5, 0x555555, 1); burnerR.strokeCircle(brx, bry, 7);
    burnerR.fillStyle(0x1A1A1A, 1); burnerR.fillCircle(brx, bry, 5);
    burnerR.lineStyle(1.5, 0x777777, 0.8);
    for (let a = 0; a < 6; a++) {
      const rad = (a * Math.PI * 2) / 6;
      burnerR.lineBetween(brx + Math.cos(rad) * 7, bry + Math.sin(rad) * 7, brx + Math.cos(rad) * 21, bry + Math.sin(rad) * 21);
    }

    // Pilot flame on left burner — tall, bright, impossible to miss
    const pilotFlame = this.add.graphics().setDepth(2.9);
    // Outer flame body
    pilotFlame.fillStyle(0xFF4400, 0.95);
    pilotFlame.fillTriangle(blx - 8, bly - 8, blx, bly - 28, blx + 8, bly - 8);
    // Mid flame
    pilotFlame.fillStyle(0xFF8800, 0.9);
    pilotFlame.fillTriangle(blx - 5, bly - 9, blx, bly - 24, blx + 5, bly - 9);
    // Inner hot core
    pilotFlame.fillStyle(0xFFDD00, 0.85);
    pilotFlame.fillTriangle(blx - 3, bly - 10, blx, bly - 19, blx + 3, bly - 10);
    // White hot tip
    pilotFlame.fillStyle(0xFFFFAA, 0.7);
    pilotFlame.fillCircle(blx, bly - 20, 3);
    this.tweens.add({
      targets: pilotFlame,
      scaleY: { from: 0.85, to: 1.15 }, scaleX: { from: 0.92, to: 1.08 },
      alpha: { from: 0.88, to: 1.0 },
      duration: 200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Flame glow pool — orange halo on cooking surface (left burner)
    const flameGlow = this.add.graphics().setDepth(2.6);
    flameGlow.fillStyle(0xFF6600, 0.18);
    flameGlow.fillCircle(blx, bly, 32);
    this.tweens.add({
      targets: flameGlow, alpha: { from: 0.5, to: 1.0 },
      duration: 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Right burner smaller flame (simmers, less intense than pilot)
    const flameR = this.add.graphics().setDepth(2.9);
    flameR.fillStyle(0xFF4400, 0.8);
    flameR.fillTriangle(brx - 6, bry - 6, brx, bry - 18, brx + 6, bry - 6);
    flameR.fillStyle(0xFF8800, 0.75);
    flameR.fillTriangle(brx - 4, bry - 7, brx, bry - 15, brx + 4, bry - 7);
    flameR.fillStyle(0xFFDD00, 0.65);
    flameR.fillTriangle(brx - 2, bry - 8, brx, bry - 13, brx + 2, bry - 8);
    this.tweens.add({
      targets: flameR,
      scaleY: { from: 0.82, to: 1.18 }, alpha: { from: 0.75, to: 1.0 },
      duration: 260, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      delay: 110,
    });
    const flameGlowR = this.add.graphics().setDepth(2.6);
    flameGlowR.fillStyle(0xFF6600, 0.12);
    flameGlowR.fillCircle(brx, bry, 28);
    this.tweens.add({
      targets: flameGlowR, alpha: { from: 0.4, to: 0.9 },
      duration: 380, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 80,
    });

    // COOKING label
    this.add.text(KITCHEN_X / 2, KITCHEN_Y - 20, 'COOKING', {
      fontSize: '16px', fontFamily: 'Arial Black', color: '#FFAA33', letterSpacing: 2,
    }).setOrigin(0.5).setDepth(4);

    // ── PASS / READY ZONE (right half) ──────────────────────────────────────
    const passZone = this.add.graphics().setDepth(2.5);
    // Warm cream pass surface
    passZone.fillStyle(0xFFF8EE, 1);
    passZone.fillRoundedRect(KITCHEN_X + 8, KITCHEN_Y - 34, GAME_WIDTH - KITCHEN_X - 16, 68, { tl: 0, tr: 4, bl: 0, br: 4 });
    // Subtle warm border
    passZone.lineStyle(2, 0xE8C89A, 0.6);
    passZone.strokeRoundedRect(KITCHEN_X + 8, KITCHEN_Y - 34, GAME_WIDTH - KITCHEN_X - 16, 68, { tl: 0, tr: 4, bl: 0, br: 4 });

    // Heat lamp strip at top of ready zone
    const lampStrip = this.add.graphics().setDepth(3);
    lampStrip.fillStyle(0x3A1800, 1);
    lampStrip.fillRoundedRect(KITCHEN_X + 8, KITCHEN_Y - 34, GAME_WIDTH - KITCHEN_X - 16, 10, { tl: 0, tr: 4, bl: 0, br: 0 });
    // Amber bulbs
    [KITCHEN_X + 36, KITCHEN_X + 80, KITCHEN_X + 124, KITCHEN_X + 168, KITCHEN_X + 212].forEach(lbx => {
      if (lbx > GAME_WIDTH - 20) return;
      lampStrip.fillStyle(0xFF8800, 0.95); lampStrip.fillCircle(lbx, KITCHEN_Y - 29, 4);
    });
    this.tweens.add({
      targets: lampStrip, alpha: { from: 0.88, to: 1.0 },
      duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Warm heat glow from lamp on pass surface
    const heatPool = this.add.graphics().setDepth(2.6);
    heatPool.fillStyle(0xFF8800, 0.07);
    heatPool.fillRoundedRect(KITCHEN_X + 8, KITCHEN_Y - 24, GAME_WIDTH - KITCHEN_X - 16, 58, { tl: 0, tr: 4, bl: 0, br: 4 });

    // READY label
    this.add.text(KITCHEN_X + (GAME_WIDTH - KITCHEN_X) / 2, KITCHEN_Y - 20, 'READY', {
      fontSize: '16px', fontFamily: 'Arial Black', color: '#44DD77', letterSpacing: 2,
    }).setOrigin(0.5).setDepth(4);

    // Zone divider — amber gold chrome strip
    const zoneDivider = this.add.graphics().setDepth(4);
    zoneDivider.fillStyle(0xC8A030, 1);
    zoneDivider.fillRect(KITCHEN_X - 2, KITCHEN_Y - 34, 4, 68);

    // Kitchen glow — over the READY zone (shown when food is ready)
    this.kitchenGlow = this.add.graphics().setDepth(3);
    this.kitchenGlow.fillStyle(0x22CC55, 1.0);
    this.kitchenGlow.fillRoundedRect(KITCHEN_X + 8, KITCHEN_Y - 34, GAME_WIDTH - KITCHEN_X - 16, 68, { tl: 0, tr: 4, bl: 0, br: 4 });
    this.kitchenGlow.setAlpha(0);

    // Service counter — physical barrier, reads against dark floor (Fix 5)
    const counter = this.add.graphics().setDepth(3);
    // Charcoal granite countertop — lighter than before so it reads against dark floor
    counter.fillStyle(0x3A2820, 1);
    counter.fillRoundedRect(8, KITCHEN_Y + 36, GAME_WIDTH - 16, 16, 3);
    // Warm surface sheen highlight
    counter.fillStyle(0x5C3C28, 0.70);
    counter.fillRoundedRect(8, KITCHEN_Y + 36, GAME_WIDTH - 16, 5, 2);
    // Warm mahogany front face — amber-brown, clearly visible
    counter.fillStyle(0x8B4820, 1);
    counter.fillRoundedRect(8, KITCHEN_Y + 50, GAME_WIDTH - 16, 14, { tl: 0, tr: 0, bl: 5, br: 5 });
    // Counter top edge — bright line that reads as a physical surface edge
    counter.lineStyle(1.5, 0x7A5030, 0.55);
    counter.lineBetween(8, KITCHEN_Y + 36, GAME_WIDTH - 8, KITCHEN_Y + 36);
    // Panel dividers on wood face
    [GAME_WIDTH * 0.25, GAME_WIDTH * 0.5, GAME_WIDTH * 0.75].forEach(dx => {
      counter.fillStyle(0x602E10, 0.55);
      counter.fillRect(Math.round(dx) - 1, KITCHEN_Y + 50, 2, 14);
    });

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
      // Tablecloth (clean linen ivory — bottom half of table)
      overlay.fillStyle(COLORS.TABLE_CLOTH, 1);
      overlay.fillRoundedRect(tx + 8, ty + 33, 94, 35, { tl: 0, tr: 0, bl: 8, br: 8 });
      // Cloth bottom shadow
      overlay.fillStyle(0x000000, 0.06);
      overlay.fillRoundedRect(tx + 8, ty + 60, 94, 8, { tl: 0, tr: 0, bl: 8, br: 8 });
      // Place setting rings — lower half only (ring, no fill)
      overlay.lineStyle(1.5, 0xC8BCA8, 0.85);
      overlay.strokeCircle(tx + 32, ty + 38, 14);
      overlay.lineStyle(1, 0xD8D0C0, 0.55);
      overlay.strokeCircle(tx + 32, ty + 38, 10);
      overlay.lineStyle(1.5, 0xC8BCA8, 0.85);
      overlay.strokeCircle(tx + 78, ty + 38, 14);
      overlay.lineStyle(1, 0xD8D0C0, 0.55);
      overlay.strokeCircle(tx + 78, ty + 38, 10);

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

      // Pendant lamp — positioned well above back chair (chair center pos.y-54, chair top ~pos.y-78)
      const pShadeY = pos.y - 90;
      const pLamp = this.add.graphics().setDepth(2);
      pLamp.fillStyle(0x5C3C10, 1);
      pLamp.fillRect(pos.x - 1, pShadeY - 12, 2, 12);          // cord
      pLamp.fillStyle(0xAA6010, 1);
      pLamp.fillRect(pos.x - 11, pShadeY, 22, 4);              // shade cap
      pLamp.fillStyle(0xD4780A, 1);
      pLamp.fillTriangle(pos.x - 11, pShadeY + 4, pos.x + 11, pShadeY + 4, pos.x + 6, pShadeY + 18); // shade body
      pLamp.fillStyle(0xFFCC44, 0.45);
      pLamp.fillTriangle(pos.x - 7, pShadeY + 4, pos.x + 7, pShadeY + 4, pos.x + 3, pShadeY + 16);   // warm inner glow
      // (candlelight pools handled by per-table ellipses after this loop)
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

    // ── Queue zone — "WAIT HERE" floor marking for arriving guests ───────────
    const queueZone = this.add.graphics().setDepth(0);
    queueZone.fillStyle(0xDDCC88, 0.28);
    queueZone.fillRoundedRect(100, GAME_HEIGHT - 115, 240, 50, 8);
    queueZone.lineStyle(2, 0xBBAA44, 0.7);
    queueZone.strokeRoundedRect(100, GAME_HEIGHT - 115, 240, 50, 8);
    // Footprint markers — drawn as simple shoe-shaped ovals
    [175, 265].forEach((fx, i) => {
      const fp = this.add.graphics().setDepth(0).setAlpha(0.45);
      fp.fillStyle(0xCCBB88, 1);
      // Heel
      fp.fillEllipse(fx + (i === 1 ? 4 : -4), GAME_HEIGHT - 100, 10, 14);
      // Toe
      fp.fillEllipse(fx + (i === 1 ? -2 : 2), GAME_HEIGHT - 91, 8, 10);
    });

    // Rush hour overlay (hidden by default — subtle full-screen red warmth during rush)
    this.rushHourOverlay = this.add.graphics().setDepth(1).setAlpha(0);
    this.rushHourOverlay.fillStyle(0xFF2200, 1);
    this.rushHourOverlay.fillRect(0, 88, GAME_WIDTH, GAME_HEIGHT - 88);

    // Combo heat overlay — warm golden dining-room glow that grows with combo streak
    this.comboHeatOverlay = this.add.graphics().setDepth(0.6).setAlpha(0);
    this.comboHeatOverlay.fillStyle(0xFFAA00, 1);
    this.comboHeatOverlay.fillRect(0, 88, GAME_WIDTH, GAME_HEIGHT - 88);

    // Level-based table decorations
    const { level: playerLevel } = ProgressionSystem.getData();
    if (playerLevel >= 3) {
      TABLE_POSITIONS.forEach(pos => {
        // Small flower vase on upper-left of each tablecloth
        const vase = this.add.graphics().setDepth(4);
        vase.fillStyle(0x2266BB, 1);
        vase.fillRoundedRect(pos.x - 37, pos.y - 30, 8, 10, 2);
        vase.fillStyle(0x3377CC, 1);
        vase.fillRoundedRect(pos.x - 36, pos.y - 34, 6, 6, 2);
        vase.fillStyle(0x22AA44, 1);
        vase.fillRect(pos.x - 34, pos.y - 44, 2, 12);
        vase.fillStyle(0xFF88CC, 0.9);
        vase.fillCircle(pos.x - 34, pos.y - 46, 4);
        vase.fillStyle(0xFFBBDD, 0.65);
        vase.fillCircle(pos.x - 31, pos.y - 45, 3);
        vase.fillCircle(pos.x - 37, pos.y - 45, 3);
      });
    }
    if (playerLevel >= 5) {
      TABLE_POSITIONS.forEach(pos => {
        // Gold tablecloth rim tracing the visible top surface
        const rim = this.add.graphics().setDepth(3.8);
        rim.lineStyle(2, 0xFFD700, 0.55);
        rim.strokeRoundedRect(pos.x - 47, pos.y - 34, 94, 28, 6);
      });
    }

    // Plants — SVG potted plants at entrance corners
    this.add.image(28, GAME_HEIGHT - 74, 'potted_plant').setOrigin(0.5, 1).setDepth(2).setScale(1.1);
    this.add.image(GAME_WIDTH - 28, GAME_HEIGHT - 74, 'potted_plant').setOrigin(0.5, 1).setDepth(2).setScale(1.1);
    // Kitchen-side herb plants
    this.add.image(28, 178, 'herb_plant').setOrigin(0.5, 1).setDepth(2).setScale(0.9);
    this.add.image(GAME_WIDTH - 28, 178, 'herb_plant').setOrigin(0.5, 1).setDepth(2).setScale(0.9);

    this.buildLevelDecor();
  }

  private buildLevelDecor() {
    if (this.playerLevel < 4) return;

    // Level 4+: Coffee bar station (upper right, beside herb plant)
    if (this.playerLevel >= 4) {
      const cs = this.add.graphics().setDepth(2.5);
      // Machine body
      cs.fillStyle(0x2A1208, 1);
      cs.fillRoundedRect(GAME_WIDTH - 66, 152, 52, 26, 4);
      cs.fillStyle(0x1A0A04, 1);
      cs.fillRoundedRect(GAME_WIDTH - 64, 154, 48, 20, 3);
      // Boiler tank
      cs.fillStyle(0x888888, 1);
      cs.fillCircle(GAME_WIDTH - 48, 157, 7);
      cs.lineStyle(1.5, 0xAAAAAA, 0.8);
      cs.strokeCircle(GAME_WIDTH - 48, 157, 7);
      // Coffee cup spout
      cs.fillStyle(0xCC6600, 1);
      cs.fillRect(GAME_WIDTH - 56, 166, 4, 8);
      // Steam puff
      const steam = this.add.graphics().setDepth(2.6).setAlpha(0.5);
      steam.fillStyle(0xFFFFFF, 0.4);
      steam.fillCircle(GAME_WIDTH - 54, 162, 3);
      steam.fillCircle(GAME_WIDTH - 52, 159, 2);
      this.tweens.add({ targets: steam, alpha: { from: 0.2, to: 0.65 }, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.add.text(GAME_WIDTH - 40, 162, 'COFFEE', {
        fontSize: '6px', fontFamily: 'Arial Black', color: '#AA7733', letterSpacing: 1,
      }).setOrigin(0.5).setDepth(3);
    }

    // Level 6+: Dessert display case on right side of kitchen pass
    if (this.playerLevel >= 6) {
      const dc = this.add.graphics().setDepth(3.2);
      const dcX = GAME_WIDTH - 24, dcY = KITCHEN_Y - 10;
      dc.fillStyle(0xDDEEFF, 0.22);
      dc.fillRoundedRect(dcX - 20, dcY - 16, 36, 40, 4);
      dc.lineStyle(1.5, 0x99BBDD, 0.75);
      dc.strokeRoundedRect(dcX - 20, dcY - 16, 36, 40, 4);
      // Dessert items
      dc.fillStyle(0xFF6688, 1); dc.fillCircle(dcX - 8, dcY + 4, 5);   // strawberry tart
      dc.fillStyle(0xFFBB44, 1); dc.fillCircle(dcX + 7, dcY + 4, 5);   // crème brûlée
      dc.fillStyle(0x8844AA, 0.85); dc.fillCircle(dcX - 1, dcY - 7, 4); // chocolate mousse
      // Frosting detail
      dc.fillStyle(0xFFFFFF, 0.55); dc.fillCircle(dcX - 8, dcY + 2, 2);
      this.add.text(dcX - 2, dcY + 15, 'DESSERTS', {
        fontSize: '5px', fontFamily: 'Arial Black', color: '#AACCEE', letterSpacing: 1,
      }).setOrigin(0.5).setDepth(4);
    }

    // Level 7+: VIP velvet rope across entry
    if (this.playerLevel >= 7) {
      const rope = this.add.graphics().setDepth(1.5);
      const ry = GAME_HEIGHT - 112;
      // Left stanchion
      rope.fillStyle(0xFFD700, 1); rope.fillRect(28, ry, 7, 42); rope.fillRoundedRect(24, ry - 6, 15, 10, 3);
      rope.fillStyle(0xCC9900, 1); rope.fillRect(28, ry + 36, 10, 6);
      // Right stanchion
      rope.fillStyle(0xFFD700, 1); rope.fillRect(GAME_WIDTH - 35, ry, 7, 42); rope.fillRoundedRect(GAME_WIDTH - 39, ry - 6, 15, 10, 3);
      rope.fillStyle(0xCC9900, 1); rope.fillRect(GAME_WIDTH - 38, ry + 36, 10, 6);
      // Velvet rope
      rope.lineStyle(3.5, 0xAA0033, 0.92); rope.lineBetween(43, ry + 6, GAME_WIDTH - 35, ry + 6);
      rope.fillStyle(0xFF3366, 0.25); rope.fillRect(43, ry + 2, GAME_WIDTH - 78, 8);
      this.add.text(GAME_WIDTH / 2, ry - 10, 'VIP ENTRANCE', {
        fontSize: '8px', fontFamily: 'Arial Black', color: '#FFD700', letterSpacing: 2,
      }).setOrigin(0.5).setDepth(2).setAlpha(0.88);
    }

    // Level 10: Grand "TABLE MASTER" banner on wall above kitchen
    if (this.playerLevel >= 10) {
      const bannerGfx = this.add.graphics().setDepth(2.2);
      bannerGfx.fillStyle(0x1A0500, 0.88);
      bannerGfx.fillRoundedRect(GAME_WIDTH / 2 - 140, 68, 280, 18, 4);
      bannerGfx.lineStyle(1.5, 0xFFD700, 0.55);
      bannerGfx.strokeRoundedRect(GAME_WIDTH / 2 - 140, 68, 280, 18, 4);
      this.add.text(GAME_WIDTH / 2, 76, '★  TABLE MASTER EDITION  ★', {
        fontSize: '9px', fontFamily: 'Arial Black', color: '#FFD700', letterSpacing: 2,
      }).setOrigin(0.5).setDepth(3).setAlpha(0.9);
    }
  }

  // ─── UI ───────────────────────────────────────────────────────────────────

  private buildUI() {
    // Cream panel background
    this.add.image(GAME_WIDTH / 2, 28, 'hud_panel').setOrigin(0.5, 0.5).setDepth(3);

    // Score badge — left dark pill
    const scorePill = this.add.graphics().setDepth(3.5);
    scorePill.fillStyle(0x2D1810, 0.92);
    scorePill.fillRoundedRect(8, 7, 148, 42, 10);

    this.scoreTxt = this.add.text(82, 28, '$  0', {
      fontSize: '19px', fontFamily: 'Arial Black', color: '#FFD700',
    }).setOrigin(0.5, 0.5).setDepth(4);

    // Timer badge — right dark pill
    this.hudTimerPill = this.add.graphics().setDepth(3.5);
    this.hudTimerPill.fillStyle(0x2D1810, 0.92);
    this.hudTimerPill.fillRoundedRect(GAME_WIDTH - 156, 7, 148, 42, 10);

    this.timeTxt = this.add.text(GAME_WIDTH - 90, 28, '3:00', {
      fontSize: '19px', fontFamily: 'Arial Black', color: '#FFFFFF',
    }).setOrigin(0.5, 0.5).setDepth(4);

    if (!this.sys.game.device.input.touch) {
      const pauseBtn = this.add.text(GAME_WIDTH - 16, 28, '||', {
        fontSize: '17px', color: 'rgba(255,255,255,0.75)',
      }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true }).setDepth(5);
      pauseBtn.on('pointerdown', () => { SoundManager.uiClick(); this.pauseGame(); });
    }

    // Combo pill — centered, color changes with tier
    this.hudComboPill = this.add.graphics().setDepth(3.5);
    this.drawComboPill(0x7A5520, 0.35);

    this.comboTxt = this.add.text(GAME_WIDTH / 2, 28, '×1', {
      fontSize: '14px', fontFamily: 'Arial Black', color: '#D4AA55',
    }).setOrigin(0.5, 0.5).setDepth(4);

    // Combo progress strip — bottom 4px of HUD panel
    this.comboProgressGfx = this.add.graphics().setDepth(4);
    this.updateComboProgress();

    // Queue waiting count — shown above the waiting area when guests are queued
    this.queueCountTxt = this.add.text(GAME_WIDTH / 2, 738, '', {
      fontSize: '13px', fontFamily: 'Arial Black', color: '#FFEECC',
      stroke: '#3A1A00', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20).setVisible(false);
  }

  private updateQueueDisplay() {
    const n = this.waitingQueue.length;
    if (n === 0) {
      this.queueCountTxt.setVisible(false);
    } else {
      this.queueCountTxt.setText(n === 1 ? '1 GUEST WAITING' : `${n} GUESTS WAITING`);
      this.queueCountTxt.setVisible(true);
    }
  }

  // ─── Spawning ─────────────────────────────────────────────────────────────

  private startSpawnCycle() {
    this.rollSessionType();
    this.showAbilitiesPanel();
    this.time.delayedCall(1200, () => this.tryEnqueueCustomer());
    this.scheduleNextSpawn();

    // Critic night: critic arrives early (25-45s). Otherwise normal 5+ visit (45-105s).
    if (this.sessionType === 'critic_night') {
      const criticDelay = 25000 + Math.random() * 20000;
      this.criticTimer = this.time.delayedCall(criticDelay, () => this.enqueueCritic());
    } else if (this.playerLevel >= 5) {
      const criticDelay = 45000 + Math.random() * 60000;
      this.criticTimer = this.time.delayedCall(criticDelay, () => this.enqueueCritic());
    }

    // Business lunch: wave of business customers at 40-60s
    if (this.sessionType === 'business_lunch') {
      const waveDelay = 40000 + Math.random() * 20000;
      this.time.delayedCall(waveDelay, () => this.triggerBusinessLunchWave());
    }
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

    // VIP rate: 10% normally, 30% on VIP Night (Level 6+ session event)
    const vipRate = this.sessionType === 'vip_night' ? 0.30 : 0.10;
    if (!this.rushHourActive && !this.tutorialActive && Math.random() < vipRate) {
      customer.makeVIP();
    }

    // Birthday Night: queue one birthday customer this session (Level 4+)
    if (!customer.isVIP && !this.tutorialActive && this.sessionType === 'birthday_night' &&
        this.playerLevel >= 4 && !this.birthdayCustomerQueued) {
      this.birthdayCustomerQueued = true;
      customer.makeBirthday();
    }

    // Family Day: ~45% chance of family table (Level 3+)
    if (!customer.isVIP && !customer.isBirthday && !this.tutorialActive &&
        this.playerLevel >= 3 && this.sessionType === 'family_day' && Math.random() < 0.45) {
      customer.makeFamilyTable();
    }

    // Business Lunch: ~30% chance of business customer during session
    if (!customer.isVIP && !customer.isBirthday && !customer.isFamilyTable &&
        !this.tutorialActive && this.sessionType === 'business_lunch' && Math.random() < 0.30) {
      customer.makeBusinessCustomer();
    }

    SoundManager.customerArrival();
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
        this.updateQueueDisplay();
      },
    });
  }

  private removeCustomerFromQueue(customer: Customer) {
    const idx = this.waitingQueue.indexOf(customer);
    if (idx === -1 || customer.state === 'leaving') return;
    this.waitingQueue.splice(idx, 1);
    this.repositionQueue();
    this.updateSeatingArrows();
    this.updateQueueDisplay();

    customer.stopIdleBehavior();
    customer.state = 'leaving';
    customer.showAngryBubble();
    this.customersAngry++;
    SoundManager.customerAngry();

    const elapsed = (this.time.now - this.gameStartMs) / 1000;
    const tier = this.getDifficultyTier(elapsed);
    this.score = Math.max(0, this.score - Math.floor(tier.penalty * 0.5));
    this.scoreTxt.setText(`$  ${fmtScore(this.score)}`);
    this.showFloating('Left!', customer.x, customer.y - 50, COLORS.TEXT_RED);
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
    // Clear seating arrows on tables that no longer have queue waiting.
    // setPriority('seating') is handled exclusively by updateActionPriority so
    // only one arrow (the primary) ever shows — no mass-setPriority here.
    if (this.waitingQueue.length === 0) {
      for (const table of this.tables) {
        if (table.state === 'empty') table.clearPulse();
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
    this.updateQueueDisplay();

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
      SoundManager.seatCustomer();
      this.player.setEmotion('happy', 800);
      this.playerBusy = false;

      // Birthday arrival: confetti burst + announcement
      if (customer.isBirthday) {
        this.spawnBirthdayConfetti(table.x, table.y);
        this.time.delayedCall(200, () => {
          this.showFloating('HAPPY BIRTHDAY!', table.x, table.y - 80, '#FF88CC', 1.0);
        });
      }

      // Critic seated — announce and start tracking
      if (customer.isCritic) {
        this.criticPresent = true;
        this.time.delayedCall(400, () => {
          this.showFloating('CRITIC IS WATCHING!', GAME_WIDTH / 2, 90, '#AADDFF', 0.85);
        });
      }

      // Family seated — welcome annotation
      if (customer.isFamilyTable) {
        this.time.delayedCall(300, () => {
          this.showFloating('FAMILY TABLE', table.x, table.y - 70, '#FFBB77', 0.85);
        });
      }

      if (this.tutorialActive && this.tutorialStep === 0) this.advanceTutorial();
    };

    // Customer faces the table during escort + walks with a subtle bob
    customer.faceDirection(table.x);
    customer.walkBob(700);

    this.player.walkTo(table.x, table.y + 40, onBothArrived);
    this.tweens.add({
      targets: customer, x: table.x, y: table.y - 16,
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
        // Final-minute callout at the tier-3 transition (guests are least patient now)
        if (remaining <= 60 && remaining > 59) {
          this.showFloating('Final minute!', GAME_WIDTH / 2, 90, COLORS.TEXT_ORANGE);
          // Amber timer pill — visual warning before red at 30s
          this.hudTimerPill.clear();
          this.hudTimerPill.fillStyle(0xCC6600, 0.92);
          this.hudTimerPill.fillRoundedRect(GAME_WIDTH - 156, 7, 148, 42, 10);
          this.timeTxt.setColor('#FFCC44');
        }
        if (remaining <= 30) {
          if (remaining <= 30 && remaining > 29) {
            // Switch timer pill to danger red
            this.hudTimerPill.clear();
            this.hudTimerPill.fillStyle(0x8B1010, 0.95);
            this.hudTimerPill.fillRoundedRect(GAME_WIDTH - 156, 7, 148, 42, 10);
            this.timeTxt.setColor('#FF6666');
            this.showFloating('30s LEFT!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, COLORS.TEXT_RED);
            this.cameras.main.shake(150, 0.003);
            SoundManager.timerWarning();
          }
          // Pulse timer text on every second under 30s
          this.tweens.add({
            targets: this.timeTxt, scale: { from: 1.12, to: 1.0 },
            duration: 250, ease: 'Quad.easeOut',
          });
        }
        if (remaining <= 10 && remaining > 0) {
          SoundManager.timerWarning();
          this.timeTxt.setColor('#FF2222');
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

    if (customer.state === 'waiting_food' && !this.tray.isEmpty()) {
      // Inventory kitchen: match tray item to customer's order type (any instance of that food)
      const slot = this.tray.getSlots().find(s => s.emoji === customer.order?.emoji);
      if (slot) {
        this.deliverFood(table, customer, slot.orderId);
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
    if (!this.tray.canPickUp()) return;

    // Find ready orders not already on the tray
    const readyOrders = this.kitchenOrders.filter(
      o => o.ready && !this.tray.hasOrder(o.id)
    );
    if (readyOrders.length === 0) return;

    this.playerBusy = true;
    this.player.walkTo(KITCHEN_X, KITCHEN_Y + 50, () => {
      this.player.bounce();

      // Pick up as many as the tray allows (up to 2)
      const slots = Math.min(readyOrders.length, this.tray.maxCapacity - this.tray.count);
      for (let i = 0; i < slots; i++) {
        const order = readyOrders[i];
        this.tray.pickUp(order.id, order.item.emoji, order.item.itemId);
        this.orderStartTimes.set(order.id, this.time.now);
        this.removeTicket(order.id);
        this.destroyReadyPlate(order.id);
      }

      this.syncTrayDisplay();

      // Highlight tables whose customers ordered what we're carrying
      const carryItemIds = new Set(this.tray.getSlots().map(s => s.itemId));
      for (const t of this.tables) {
        const cust = this.getCustomerAtTable(t.id);
        if (cust?.state === 'waiting_food' && cust.order && carryItemIds.has(cust.order.itemId)) {
          t.setPriority('kitchen_ready');
        }
      }

      this.updateKitchenGlow();
      this.playerBusy = false;

      if (this.tutorialActive && this.tutorialStep === 2) this.advanceTutorial();
    });
  }

  // ─── Gameplay Steps ───────────────────────────────────────────────────────

  private destroyReadyPlate(orderId: number) {
    const plate = this.readyPlateSprites.get(orderId);
    if (!plate) return;
    const timer = (plate as any)._steamTimer as Phaser.Time.TimerEvent | undefined;
    if (timer) timer.remove();
    const ring = (plate as any)._readyRing as Phaser.GameObjects.Graphics | undefined;
    if (ring) ring.destroy();
    plate.destroy();
    this.readyPlateSprites.delete(orderId);
  }

  // Single source of truth for tray display. Call after every pick/drop.
  private syncTrayDisplay() {
    const itemIds = this.tray.getSlots().map(s => s.itemId);
    this.player.showTray(itemIds, this.tray.maxCapacity);
    if (this.carryingDirty) this.player.showDirtyDish();
  }

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
      const itemId = (this.tutorialActive && this.tutorialStep === 1) ? 0 : Math.floor(Math.random() * MENU_ITEMS.length);
      const item = MENU_ITEMS[itemId];
      const order: OrderItem = { itemId, name: item.name, emoji: item.emoji, price: item.price, cookTime: item.cookTime };

      customer.order = order;
      customer.state = 'waiting_food';
      customer.showOrderBubble(order);
      customer.showOrderFlash();
      this.player.setEmotion('happy', 900);
      table.setStateVisual('ticket');
      table.setFloatFoodImage(order.itemId, true);
      this.showFloating('✓ ORDER!', table.x, table.y - 70, '#4CAF50');
      SoundManager.orderTaken();

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
      this.showCookingOnBurner(kitchenOrder);

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
    this.hideCookingOnBurner(order.id);

    if (order.ticketObj) {
      order.progressBar?.clear();
      const badge = this.add.text(0, -16, '✓', {
        fontSize: '14px', color: COLORS.TEXT_GOLD, fontStyle: 'bold',
      }).setOrigin(0.5);
      order.ticketObj.add(badge);

      this.tweens.add({
        targets: order.ticketObj,
        scaleX: { from: 1.0, to: 1.38 }, scaleY: { from: 1.0, to: 1.38 },
        duration: 160, ease: 'Back.easeOut', yoyo: true,
      });
      SoundManager.foodReady();
      // Green flash: unmistakable "food is ready, go get it" signal
      this.cameras.main.flash(110, 80, 255, 80, false);
    }

    // Big READY pop above the kitchen — can't miss it
    this.showReadyPop(order.item.itemId);

    // Spawn a physical plate on the READY counter zone
    this.spawnReadyPlate(order);
    this.updateKitchenGlow();
  }

  private spawnReadyPlate(order: KitchenOrder) {
    const existingCount = this.readyPlateSprites.size;
    // Space plates evenly across the ready zone (right half of kitchen counter)
    const plateX = KITCHEN_X + 40 + existingCount * 52;
    const plateY = KITCHEN_Y + 8;

    const plate = this.add.container(plateX, plateY).setDepth(3.5);

    // Warm plate shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.22);
    shadow.fillEllipse(3, 7, 38, 14);
    plate.add(shadow);

    // Plate rim — warm white ceramic
    const plateBg = this.add.graphics();
    plateBg.fillStyle(0xF8F2E8, 1);
    plateBg.fillCircle(0, 0, 18);
    plateBg.lineStyle(2.5, 0xD4C8A8, 1);
    plateBg.strokeCircle(0, 0, 18);
    // Inner plate well
    plateBg.fillStyle(0xFFFBF4, 1);
    plateBg.fillCircle(0, 0, 13);
    // Subtle plate sheen
    plateBg.fillStyle(0xFFFFFF, 0.35);
    plateBg.fillEllipse(-5, -8, 10, 6);
    plate.add(plateBg);

    // Food image — large and clear
    plate.add(this.add.image(0, 1, `food_${order.item.itemId}`).setScale(0.5).setOrigin(0.5));

    // "READY" indicator ring pulse
    const readyRing = this.add.graphics().setDepth(3.4);
    readyRing.lineStyle(2, 0x22CC55, 0.8);
    readyRing.strokeCircle(plateX, plateY, 22);
    this.tweens.add({
      targets: readyRing, alpha: { from: 0.9, to: 0.1 }, scale: { from: 1, to: 1.5 },
      duration: 1200, repeat: -1, ease: 'Quad.easeOut',
    });
    (plate as any)._readyRing = readyRing;

    // Steam wisps
    const steamTimer = this.time.addEvent({
      delay: 700, loop: true,
      callback: () => {
        if (!plate.active) return;
        const wx = plateX + (Math.random() - 0.5) * 10;
        const wy = plateY - 18;
        const puff = this.add.graphics().setDepth(3.6);
        puff.fillStyle(0xFFFFFF, 0.3);
        puff.fillCircle(0, 0, 4 + Math.random() * 3);
        puff.setPosition(wx, wy);
        this.tweens.add({
          targets: puff, y: wy - 22, alpha: 0, scaleX: 2, scaleY: 2,
          duration: 800, ease: 'Quad.easeOut',
          onComplete: () => puff.destroy(),
        });
      },
    });
    (plate as any)._steamTimer = steamTimer;

    plate.setScale(0);
    this.tweens.add({ targets: plate, scale: 1, duration: 220, ease: 'Back.easeOut' });

    this.readyPlateSprites.set(order.id, plate);
  }

  // Cooking burner visual — shows food emoji above active burner while cooking
  private showCookingOnBurner(order: KitchenOrder) {
    const burnerSlots = [70, 185];
    const usedSlots = new Set<number>();
    this.cookingOnBurner.forEach(c => usedSlots.add((c as any)._slot ?? 0));
    const slot = usedSlots.has(0) ? 1 : 0;
    const bx = burnerSlots[slot] ?? 70;
    const by = KITCHEN_Y - 20;

    const container = this.add.container(bx, by).setDepth(4);
    (container as any)._slot = slot;

    // Pot silhouette (bigger for readability)
    const pot = this.add.graphics();
    pot.fillStyle(0x111111, 0.85);
    pot.fillRoundedRect(-16, -4, 32, 20, 5);
    pot.fillStyle(0x444444, 0.9);
    pot.fillRoundedRect(-14, -12, 8, 10, 3); // left handle
    pot.fillRoundedRect(6, -12, 8, 10, 3);   // right handle
    // Lid
    pot.fillStyle(0x555555, 0.9);
    pot.fillRoundedRect(-14, -8, 28, 6, 3);
    pot.lineStyle(1.5, 0x888888, 0.7);
    pot.strokeRoundedRect(-16, -4, 32, 20, 5);
    container.add(pot);

    const foodImg = this.add.image(0, 6, `food_${order.item.itemId}`).setScale(0.42).setOrigin(0.5);
    container.add(foodImg);

    // Boiling bob animation
    this.tweens.add({
      targets: container, y: { from: by, to: by - 5 },
      duration: 400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    container.setScale(0);
    this.tweens.add({ targets: container, scale: 1, duration: 180, ease: 'Back.easeOut' });

    this.cookingOnBurner.set(order.id, container);
  }

  private hideCookingOnBurner(orderId: number) {
    const container = this.cookingOnBurner.get(orderId);
    if (container) {
      this.tweens.add({
        targets: container, scale: 0, alpha: 0, duration: 150, ease: 'Quad.easeIn',
        onComplete: () => container.destroy(),
      });
      this.cookingOnBurner.delete(orderId);
    }
  }

  // Pops a big "READY!" announcement visible from dining area
  private showReadyPop(itemId: number) {
    const rx = GAME_WIDTH * 0.75;
    const ry = KITCHEN_Y + 80;
    const container = this.add.container(rx, ry).setDepth(22).setAlpha(0).setScale(0.3);
    const foodImg = this.add.image(-22, 0, `food_${itemId}`).setScale(0.5).setOrigin(0.5);
    const pop = this.add.text(4, 0, ' READY!', {
      fontSize: '22px', fontFamily: 'Arial Black', color: '#66FFAA',
      stroke: '#003300', strokeThickness: 5,
    }).setOrigin(0, 0.5);
    container.add([foodImg, pop]);

    this.tweens.add({
      targets: container, alpha: 1, scale: 1.2, y: ry - 14,
      duration: 220, ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: container, alpha: 0, y: ry - 48, scale: 0.9,
          duration: 600, delay: 1100, ease: 'Quad.easeIn',
          onComplete: () => container.destroy(),
        });
      },
    });
  }

  // orderId identifies which tray slot to drop; customer.order.emoji identifies the food type.
  private deliverFood(table: Table, customer: Customer, orderId: number) {
    if (!customer.order) return;
    this.playerBusy = true;
    table.clearPulse();

    this.player.walkTo(table.x, table.y + 40, () => {
      if (customer.state !== 'waiting_food') {
        this.tray.drop(orderId);
        this.syncTrayDisplay();
        this.kitchenOrders = this.kitchenOrders.filter(o => o.id !== orderId);
        this.playerBusy = false;
        return;
      }

      this.player.deliverAnim();
      this.player.setEmotion('happy', 2500);
      SoundManager.deliverFood();
      customer.patienceAtDelivery = customer.getPatienceFraction();
      customer.hideBubble();
      customer.state = 'eating';
      customer.showFoodReaction();
      customer.stopPatience();
      customer.refillPatience();
      table.setStateVisual('plate');
      table.clearFloatEmoji();
      // Eating indicator — "leave me alone" signal
      this.time.delayedCall(600, () => {
        if (customer.state === 'eating') table.setFloatEmoji('♡', true);
      });

      this.tray.drop(orderId);
      this.syncTrayDisplay();
      this.kitchenOrders = this.kitchenOrders.filter(o => o.id !== orderId);

      const speedMult = this.getSpeedMultiplier(customer.patienceAtDelivery);
      const rushMult = (this.rushHourActive && this.playerLevel >= 7) ? 1.4 : 1.0;
      const deliveryScore = Math.floor(customer.order!.price * 10 * speedMult * this.comboMultiplier * rushMult);
      this.addScore(deliveryScore);
      if (rushMult > 1) {
        this.time.delayedCall(180, () => this.showFloating('RUSH +40%!', table.x, table.y - 100, '#FF9944', 0.75));
      }

      // Delivery flash — warm white burst
      this.cameras.main.flash(120, 255, 255, 200, false);
      this.spawnFoodBurst(table.x, table.y - 20, customer.order!.itemId);

      const pickupTime = this.orderStartTimes.get(orderId);
      if (pickupTime !== undefined) {
        const deliveryMs = this.time.now - pickupTime;
        if (deliveryMs < this.fastestDeliveryMs) this.fastestDeliveryMs = deliveryMs;
        this.orderStartTimes.delete(orderId);
      }

      if (customer.patienceAtDelivery < 0.08) {
        this.triggerNearMissSave(table.x, table.y);
      }

      if (speedMult > 1) {
        const label = SPEED_MULTIPLIERS.find(s => customer.patienceAtDelivery >= s.minPct)?.label ?? '';
        if (label) this.showFloating(label, table.x, table.y - 70, COLORS.TEXT_GOLD, 1.2);
      }
      const deliverSize = this.comboMultiplier >= 5 ? 1.8 : this.comboMultiplier >= 4 ? 1.5 : this.comboMultiplier >= 3 ? 1.25 : 1.1;
      this.showFloating('✓ SERVED!', table.x, table.y - 55, '#4CAF50', deliverSize);
      this.showFloating(`+${deliveryScore}`, table.x, table.y - 35, COLORS.TEXT_ORANGE, deliverSize);
      this.playerBusy = false;

      const eatTime = 5000 + Math.random() * 3000;
      customer.startEating(eatTime);

      this.time.delayedCall(eatTime, () => {
        if (customer.state !== 'eating') return;

        // Family table dessert round: after first course, they order dessert
        if (customer.isFamilyTable && !customer.familyDessertDone) {
          customer.familyDessertDone = true;
          customer.stopEating();
          customer.refillPatience();
          customer.state = 'requesting';
          customer.startPatience();
          customer.showRequestBubble();
          table.setStateVisual('menu');
          table.clearFloatEmoji();
          table.setPriority('requesting');
          this.time.delayedCall(300, () => {
            this.showFloating('DESSERT TIME!', table.x, table.y - 70, '#FF44BB', 1.35);
          });
          return;
        }

        customer.stopEating();
        customer.state = 'paying';
        customer.startPatience();
        customer.showPayBubble(customer.order!.price);
        table.setStateVisual('bill');
        table.setPayingGlow();
        table.setPriority('paying');
        table.setFloatEmoji('$', true);

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
      const rushPayMult = (this.rushHourActive && this.playerLevel >= 7) ? 1.4 : 1.0;
      // Birthday boost: next 3 payments after a birthday customer double their score
      const birthdayMult = (!customer.isBirthday && this.birthdayBoostRemaining > 0) ? 2.0 : 1.0;
      // Family table: full meal (main + dessert) earns ×2.2
      const familyMult = (customer.isFamilyTable && customer.familyDessertDone) ? 2.2 : 1.0;
      // Business customer: quick service earns a generous tip (×1.5)
      const businessMult = customer.isBusinessCustomer ? 1.5 : 1.0;
      const payScore = Math.floor((customer.order!.price + tip) * 5 * this.comboMultiplier * vipMult * rushPayMult * birthdayMult * familyMult * businessMult);
      this.addScore(payScore);
      SoundManager.paymentCollected();

      // Big gold flash on payment
      this.cameras.main.flash(180, 255, 215, 0, false);
      this.cameras.main.shake(80, 0.003);

      const paySize = this.comboMultiplier >= 5 ? 2.0 : this.comboMultiplier >= 4 ? 1.7 : this.comboMultiplier >= 3 ? 1.4 : 1.2;
      this.showFloating(`$${payScore}`, table.x, table.y - 50, COLORS.TEXT_GOLD, paySize);
      this.spawnCoins(table.x, table.y);

      // XP preview (actual XP saved at end-of-round)
      const xpGain = Math.max(1, Math.floor(payScore / 20));
      this.time.delayedCall(350, () => {
        this.showFloating(`+${xpGain} XP`, table.x + 40, table.y - 70, '#AADDFF', 0.8);
      });

      if (customer.isVIP) {
        this.time.delayedCall(200, () => {
          this.showFloating('VIP! ×2.5', table.x, table.y - 100, COLORS.TEXT_GOLD, 1.3);
          this.cameras.main.flash(180, 255, 220, 0, false);
        });
      }

      // Birthday boost applied — show feedback and decrement
      if (birthdayMult > 1) {
        this.birthdayBoostRemaining--;
        this.time.delayedCall(260, () => {
          this.showFloating('BIRTHDAY CHEER! ×2', table.x, table.y - 115, '#FF88CC', 0.95);
        });
      }

      // Birthday customer pays → activate 3-payment chain boost
      if (customer.isBirthday) {
        this.birthdayBoostRemaining = 3;
        this.time.delayedCall(350, () => this.showBirthdayBoostAnnouncement());
        if (!this.storyEvents.includes('birthday_served')) this.storyEvents.push('birthday_served');
      }

      // Food critic pays → review based on how well the whole shift went
      if (customer.isCritic) {
        this.criticPresent = false;
        const wasGoodServe = customer.patienceAtDelivery >= 0.6;
        this.time.delayedCall(500, () => this.triggerCriticReview(wasGoodServe));
      }

      // Family full-meal bonus feedback
      if (familyMult > 1) {
        this.time.delayedCall(260, () => {
          this.showFloating('FAMILY FEAST! ×2.2', table.x, table.y - 115, '#FFBB77', 0.95);
        });
        if (!this.storyEvents.includes('family_served')) this.storyEvents.push('family_served');
      }

      // Business client fast-serve tip
      if (businessMult > 1) {
        this.time.delayedCall(240, () => {
          this.showFloating('BUSINESS TIP! ×1.5', table.x, table.y - 100, '#88CCFF', 0.9);
        });
      }

      this.customersHappy++;
      this.incrementCombo();
      this.player.setEmotion('proud', 3500);

      if (customer.patienceAtDelivery >= 0.75) {
        this.time.delayedCall(300, () => {
          this.showFloating('PERFECT!', table.x, table.y - 95, COLORS.TEXT_GOLD, 1.1);
        });
      }

      customer.stopIdleBehavior();
      customer.hideBubble();
      customer.showHappyExit();
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
    const savedTableX = table.x;
    const savedTableY = table.y;
    this.player.walkTo(table.x, table.y + 40, () => {
      this.player.collectAnim();
      table.setEmpty();
      table.flashClean();
      this.updateSeatingArrows();

      this.carryingDirty = true;
      this.player.showDirtyDish();
      this.setDishwasherGlowPrimary(true);
      this.showFloating('CLEAR!', savedTableX, savedTableY - 40, COLORS.TEXT_ORANGE, 1.3);
      this.spawnCleanBurst(savedTableX, savedTableY);
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
      this.player.hideDirtyDish();
      this.setDishwasherGlowPrimary(false);
      this.updateSeatingArrows();
      this.showFloating('CLEAN!', 80, 165, COLORS.TEXT_GREEN, 1.3);
      this.cameras.main.flash(80, 120, 255, 120, false);
      this.spawnDishwasherSteam();
      SoundManager.dishwasher();
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
    if (this.tutorialActive) return;
    this.rushHourActive = true;
    SoundManager.rushHour();

    this.cameras.main.shake(380, 0.010);
    this.cameras.main.flash(220, 255, 60, 60, false);

    // Cinematic full-screen RUSH HOUR banner
    const rushBg = this.add.graphics().setDepth(41).setAlpha(0);
    rushBg.fillStyle(0x220000, 0.82);
    rushBg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.tweens.add({
      targets: rushBg, alpha: 1, duration: 80,
      onComplete: () => this.tweens.add({ targets: rushBg, alpha: 0, duration: 500, delay: 600, onComplete: () => rushBg.destroy() }),
    });

    const banner = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, 'RUSH HOUR', {
      fontSize: '54px', fontFamily: 'Arial Black', color: '#FF3322',
      stroke: '#000000', strokeThickness: 8,
    }).setOrigin(0.5).setDepth(42).setScale(0);
    const subBanner = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 14, 'SURVIVE 25 SECONDS', {
      fontSize: '18px', fontFamily: 'Arial Black', color: '#FF9966',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(42).setAlpha(0);
    this.tweens.add({
      targets: banner, scale: 1.15, duration: 320, ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({ targets: banner, scaleX: 1.0, scaleY: 1.0, duration: 130 });
        this.tweens.add({ targets: subBanner, alpha: 1, duration: 250, delay: 120 });
        this.time.delayedCall(1800, () => {
          this.tweens.add({ targets: [banner, subBanner], alpha: 0, y: banner.y - 30, duration: 350, onComplete: () => { banner.destroy(); subBanner.destroy(); } });
        });
      },
    });

    // Pulsing red screen border — unmistakable danger signal
    this.rushBorder = this.add.graphics().setDepth(50).setAlpha(0);
    const bw = 10;
    this.rushBorder.fillStyle(0xFF2200, 1);
    this.rushBorder.fillRect(0, 0, GAME_WIDTH, bw);
    this.rushBorder.fillRect(0, GAME_HEIGHT - bw, GAME_WIDTH, bw);
    this.rushBorder.fillRect(0, bw, bw, GAME_HEIGHT - 2 * bw);
    this.rushBorder.fillRect(GAME_WIDTH - bw, bw, bw, GAME_HEIGHT - 2 * bw);
    this.rushBorderTween = this.tweens.add({
      targets: this.rushBorder,
      alpha: { from: 0.25, to: 0.85 },
      duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Rush countdown label in HUD
    this.rushEndTime = this.time.now + 25000;
    this.rushCountdownTxt = this.add.text(GAME_WIDTH / 2, 72, 'RUSH: 25s', {
      fontSize: '12px', fontFamily: 'Arial Black', color: '#FF5544',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.tweens.add({ targets: this.rushCountdownTxt, alpha: 1, duration: 300, delay: 500 });

    this.tweens.add({
      targets: this.rushHourOverlay,
      alpha: 0.06,
      duration: 600, ease: 'Quad.easeOut',
    });

    this.time.delayedCall(25000, () => this.endRushHour());
  }

  private endRushHour() {
    if (!this.rushHourActive) return;
    this.rushHourActive = false;

    // Remove border
    if (this.rushBorderTween) { this.rushBorderTween.stop(); this.rushBorderTween = null; }
    if (this.rushBorder) {
      this.tweens.add({ targets: this.rushBorder, alpha: 0, duration: 400, onComplete: () => { this.rushBorder?.destroy(); this.rushBorder = null; } });
    }
    if (this.rushCountdownTxt) {
      this.tweens.add({ targets: this.rushCountdownTxt, alpha: 0, duration: 300, onComplete: () => { this.rushCountdownTxt?.destroy(); this.rushCountdownTxt = null; } });
    }
    this.rushEndTime = 0;

    this.tweens.add({
      targets: this.rushHourOverlay, alpha: 0,
      duration: 1200, ease: 'Quad.easeOut',
    });

    // "RUSH SURVIVED!" — big celebration
    this.cameras.main.flash(280, 80, 200, 255, false);
    this.triggerCelebration('RUSH SURVIVED!', '#66DDFF');
    if (!this.storyEvents.includes('rush_survived')) this.storyEvents.push('rush_survived');
  }

  private triggerNearMissSave(tableX: number, tableY: number) {
    this.nearMissSaves++;
    SoundManager.nearMiss();
    if (!this.storyEvents.includes('near_miss')) this.storyEvents.push('near_miss');

    // Red vignette flash — the table was SECONDS away from losing
    const vig = this.add.graphics().setDepth(44).setAlpha(0);
    vig.fillStyle(0xFF2200, 0.28);
    vig.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.tweens.add({ targets: vig, alpha: 1, duration: 60, yoyo: true, repeat: 1, onComplete: () => vig.destroy() });

    // "THE SAVE!" hero text — big, impactful, center-screen
    const saveTxt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 90, 'THE SAVE!', {
      fontSize: '56px', fontFamily: 'Arial Black', color: '#FF6600',
      stroke: '#000000', strokeThickness: 9,
    }).setOrigin(0.5).setDepth(46).setScale(0);
    this.tweens.add({
      targets: saveTxt, scale: 1.2, duration: 300, ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({ targets: saveTxt, scaleX: 1.0, scaleY: 1.0, duration: 130 });
        this.time.delayedCall(1100, () => {
          this.tweens.add({ targets: saveTxt, alpha: 0, y: saveTxt.y - 50, duration: 380, ease: 'Quad.easeIn', onComplete: () => saveTxt.destroy() });
        });
      },
    });

    // Save bonus (Level 8+ earns master timing bonus)
    const saveBonus = this.playerLevel >= 8 ? 300 : 200;
    this.addScore(saveBonus);
    this.time.delayedCall(300, () => {
      this.showFloating(`+${saveBonus} SAVED!`, tableX, tableY - 80, '#FF9900', 1.3);
    });

    // Orange particle burst at the table
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 / 14) * i;
      const p = this.add.graphics().setDepth(47);
      if (i % 2 === 0) {
        p.fillStyle(0xFF6600, 0.95);
        p.fillTriangle(0, -5, 4, 3, -4, 3);
      } else {
        p.fillStyle(0xFFAA00, 0.85);
        p.fillCircle(0, 0, 4);
      }
      p.setPosition(tableX, tableY - 20);
      this.tweens.add({
        targets: p,
        x: tableX + Math.cos(angle) * (55 + Math.random() * 35),
        y: (tableY - 20) + Math.sin(angle) * (55 + Math.random() * 25) - 15,
        alpha: 0, scale: 0,
        duration: 650 + i * 25, ease: 'Quad.easeOut',
        onComplete: () => p.destroy(),
      });
    }

    this.cameras.main.shake(220, 0.009);
    this.cameras.main.flash(220, 255, 120, 0, false);
    this.player.setEmotion('excited', 2500);
  }

  private updateComboHeat() {
    if (!this.comboHeatOverlay) return;
    const targetAlpha = this.comboMultiplier >= 5 ? 0.11
      : this.comboMultiplier >= 4 ? 0.07
      : this.comboMultiplier >= 3 ? 0.04
      : this.comboMultiplier >= 2 ? 0.02
      : 0;
    this.tweens.add({
      targets: this.comboHeatOverlay, alpha: targetAlpha,
      duration: 700, ease: 'Quad.easeOut',
    });
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
    const adjusted = this.scoreMultiplier !== 1.0 ? Math.floor(amount * this.scoreMultiplier) : amount;
    this.score = Math.max(0, this.score + adjusted);
    this.scoreTxt.setText(`$  ${fmtScore(this.score)}`);
    this.scoreTxt.setColor(COLORS.TEXT_GOLD);
    const bounce = this.comboMultiplier >= 5 ? 1.7 : this.comboMultiplier >= 4 ? 1.55 : this.comboMultiplier >= 3 ? 1.45 : 1.3;
    const dur = this.comboMultiplier >= 3 ? 160 : 130;
    this.tweens.add({
      targets: this.scoreTxt, scaleX: bounce, scaleY: bounce,
      duration: dur, yoyo: true, ease: 'Back.easeOut',
      onComplete: () => this.scoreTxt.setColor('#FFFFFF'),
    });
    // First time the score beats the previous high score — celebrate live
    if (!this.newRecordAnnounced && this.prevHighScore > 0 && this.score > this.prevHighScore) {
      this.newRecordAnnounced = true;
      this.cameras.main.flash(180, 255, 215, 0, false);
      this.showFloating('NEW RECORD!', GAME_WIDTH / 2, GAME_HEIGHT / 2, COLORS.TEXT_GOLD, 1.2);
    }
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
    if (isNewMilestone) {
      const tier = this.comboMultiplier >= 5 ? 4 : this.comboMultiplier >= 4 ? 3 : this.comboMultiplier >= 3 ? 2 : 1;
      SoundManager.comboUp(tier);
      // Camera effects scale with combo tier
      if (this.comboMultiplier >= 5) {
        this.cameras.main.shake(260, 0.010);
        this.cameras.main.flash(200, 255, 215, 0, false);
      } else if (this.comboMultiplier >= 4) {
        this.cameras.main.shake(180, 0.007);
        this.cameras.main.flash(150, 255, 200, 50, false);
      } else if (this.comboMultiplier >= 3) {
        this.cameras.main.shake(120, 0.005);
        this.cameras.main.flash(100, 255, 230, 80, false);
      } else {
        this.cameras.main.flash(80, 255, 245, 120, false);
      }
    }
    // Arm combo shield when reaching ×3 tier (Level 6+)
    if (this.playerLevel >= 6 && this.comboMultiplier >= 3.0) {
      this.comboShieldReady = true;
    }

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
      this.cameras.main.shake(350, 0.013);
      this.triggerCelebration('TABLE MASTER!', '#FFD700');
      this.storyEvents.push('combo_master');
    } else if (this.comboCount === 10) {
      this.cameras.main.shake(250, 0.009);
      this.triggerCelebration('TABLE LEGEND!', COLORS.TEXT_GOLD);
      if (!this.storyEvents.includes('combo_master')) this.storyEvents.push('combo_legend');
    } else if (this.comboCount === 6) {
      this.spawnStarBurst(this.player.x, this.player.y - 20);
    }
  }

  private resetCombo() {
    const wasCombo = this.comboCount >= 3;
    const lostMult = this.comboMultiplier;

    // Combo Shield (Level 6+): first break from ×3+ falls to ×2 instead of ×1
    if (this.playerLevel >= 6 && this.comboShieldReady && wasCombo) {
      this.comboShieldReady = false;
      this.comboCount = 3;
      this.comboMultiplier = 2.0;
      this.updateComboHeat();
      this.showFloating('SHIELDED!', GAME_WIDTH / 2, 75, '#BB88FF', 0.9);
      SoundManager.comboLost();
      this.tweens.add({
        targets: this.comboTxt, scaleX: { from: 1.3, to: 1.0 }, scaleY: { from: 1.3, to: 1.0 },
        duration: 280, ease: 'Quad.easeOut',
        onComplete: () => this.updateComboDisplay(),
      });
      this.cameras.main.shake(80, 0.002);
      return;
    }

    this.comboCount = 0;
    this.comboMultiplier = 1.0;
    this.comboShieldReady = false;
    this.updateComboHeat();

    if (wasCombo) {
      SoundManager.comboLost();
      this.showFloating(`×${lostMult.toFixed(1)} LOST!`, GAME_WIDTH / 2, 80, '#FF4444');
      this.comboTxt.setStyle({ color: '#FF4444' });
      this.comboProgressGfx.clear();
      this.comboProgressGfx.fillStyle(0xFF4444, 0.85);
      this.comboProgressGfx.fillRoundedRect(100, 52, GAME_WIDTH - 200, 4, 2);
      this.tweens.add({
        targets: this.comboProgressGfx, alpha: 0, duration: 500,
        onComplete: () => { this.comboProgressGfx.setAlpha(1); this.updateComboDisplay(); },
      });
      this.tweens.add({
        targets: this.comboTxt, scaleX: { from: 1.3, to: 1.0 }, scaleY: { from: 1.3, to: 1.0 },
        duration: 320, ease: 'Quad.easeOut',
        onComplete: () => this.updateComboDisplay(),
      });
      this.cameras.main.shake(100, 0.003);
    } else {
      this.updateComboDisplay();
    }
  }

  private drawComboPill(color: number, alpha: number) {
    this.hudComboPill.clear();
    this.hudComboPill.fillStyle(color, alpha);
    this.hudComboPill.fillRoundedRect(166, 7, 148, 42, 10);
  }

  private updateComboDisplay() {
    const m = this.comboMultiplier;
    const n = this.comboCount;
    if (n === 0) {
      this.comboTxt.setText('×1');
      this.comboTxt.setStyle({ color: '#D4AA55', fontSize: '14px', fontFamily: 'Arial Black' });
      this.drawComboPill(0x7A5520, 0.35);
    } else if (n <= 2) {
      this.comboTxt.setText(`↑${n}`);
      this.comboTxt.setStyle({ color: '#D4A85A', fontSize: '15px', fontFamily: 'Arial Black' });
      this.drawComboPill(0xD4A849, 0.28);
    } else if (m <= 2.0) {
      this.comboTxt.setText('×2');
      this.comboTxt.setStyle({ color: '#FF8C42', fontSize: '17px', fontFamily: 'Arial Black' });
      this.drawComboPill(0xFF8C42, 0.35);
    } else if (m <= 3.0) {
      this.comboTxt.setText('×3');
      this.comboTxt.setStyle({ color: '#FF5722', fontSize: '19px', fontFamily: 'Arial Black' });
      this.drawComboPill(0xFF5722, 0.42);
    } else if (m <= 4.0) {
      this.comboTxt.setText('×4');
      this.comboTxt.setStyle({ color: '#E91E63', fontSize: '20px', fontFamily: 'Arial Black' });
      this.drawComboPill(0xE91E63, 0.48);
    } else {
      this.comboTxt.setText('×5');
      this.comboTxt.setStyle({ color: '#FFD700', fontSize: '22px', fontFamily: 'Arial Black' });
      this.drawComboPill(0xFFD700, 0.55);
    }
    this.updateComboProgress();
    this.updateComboHeat();
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
    const emoji = this.add.image(0, 2, `food_${order.item.itemId}`).setScale(0.5).setOrigin(0.5);

    // Table number badge on ticket — tells player which table to deliver to
    const numBg = this.add.graphics();
    numBg.fillStyle(0x7A3C10, 1);
    numBg.fillRoundedRect(10, -22, 14, 12, 3);
    const numTxt = this.add.text(17, -16, `${order.tableId + 1}`, {
      fontSize: '8px', fontFamily: 'Arial Black', color: '#FFD700',
    }).setOrigin(0.5);

    const progressTrack = this.add.graphics();
    progressTrack.fillStyle(0x2C1810, 0.25);
    progressTrack.fillRoundedRect(-20, 14, 40, 5, 2);

    const progressBar = this.add.graphics();

    container.add([bg, emoji, numBg, numTxt, progressTrack, progressBar]);
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
    if (this.time.now - this.priorityLastUpdate < 32) return;
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

    // 3. Carrying food: point at first table whose customer ordered what we're carrying
    if (primaryTableId === -1 && !this.tray.isEmpty()) {
      const carryEmojis = new Set(this.tray.getSlots().map(s => s.emoji));
      for (const table of this.tables) {
        const cust = this.getCustomerAtTable(table.id);
        if (cust?.state === 'waiting_food' && cust.order && carryEmojis.has(cust.order.emoji)) {
          primaryTableId = table.id;
          break;
        }
      }
    }

    // 4. Kitchen has ready order to pick up (and tray has room)
    if (primaryTableId === -1 && this.tray.canPickUp() && this.kitchenOrders.some(o => o.ready && !this.tray.hasOrder(o.id))) {
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

    // Drive arrow state: only the primary table shows its arrow
    for (const table of this.tables) {
      const isPrimary = (table.id === primaryTableId);
      // Assign priority type if this table should gain one
      if (isPrimary && primaryTableId !== -1) {
        // Determine the right priority for this table
        const cust = this.getCustomerAtTable(table.id);
        if (cust && cust.getPatienceFraction() < 0.25) table.setPriority('urgent');
        else if (cust?.state === 'paying') table.setPriority('paying');
        else if (cust?.state === 'waiting_food') table.setPriority('kitchen_ready');
        else if (cust?.state === 'requesting') table.setPriority('requesting');
        else if (table.state === 'dirty') table.setPriority('dirty');
        else if (table.state === 'empty' && this.waitingQueue.length > 0) table.setPriority('seating');
      }
      table.setUrgencyLevel(isPrimary);
    }
    this.setKitchenGlowPrimary(primaryKitchen);
  }

  // ─── Angry Customers ──────────────────────────────────────────────────────

  update() {
    this.updateActionPriority();

    // Rush hour countdown tick
    if (this.rushHourActive && this.rushCountdownTxt && this.rushEndTime > 0) {
      const remaining = Math.max(0, Math.ceil((this.rushEndTime - this.time.now) / 1000));
      this.rushCountdownTxt.setText(`RUSH: ${remaining}s`);
      if (remaining <= 5) this.rushCountdownTxt.setColor('#FF2222');
    }

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
    SoundManager.customerAngry();

    const elapsed = (this.time.now - this.gameStartMs) / 1000;
    const tier = this.getDifficultyTier(elapsed);
    const penalty = tier.penalty;

    this.score = Math.max(0, this.score - penalty);
    this.scoreTxt.setText(`$  ${fmtScore(this.score)}`);
    this.showFloating(`-${penalty}`, customer.x, customer.y - 40, COLORS.TEXT_RED);
    this.cameras.main.shake(200, 0.004);
    this.player.reactToAngry();

    this.resetCombo();

    // Critic saw an angry customer → guarantees poor review
    if (this.criticPresent && !customer.isCritic) {
      this.criticAngrySeen = true;
    }
    // Critic left themselves → immediate poor review
    if (customer.isCritic) {
      this.criticPresent = false;
      this.storyEvents.push('critic_angry');
      this.time.delayedCall(1200, () => this.triggerCriticReview(false));
    }

    // Angry customer → table goes straight to EMPTY (not dirty)
    const table = this.tables[customer.tableId];
    if (table) {
      table.setEmpty();
      this.updateSeatingArrows();
    }

    // Cancel their kitchen order and remove ready plate from counter
    const angryOrder = this.kitchenOrders.find(o => o.customerId === id);
    if (angryOrder) {
      this.removeTicket(angryOrder.id);
      this.destroyReadyPlate(angryOrder.id);
      this.tray.drop(angryOrder.id);
      this.kitchenOrders = this.kitchenOrders.filter(o => o.id !== angryOrder.id);
      this.syncTrayDisplay();
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

    const cardY = GAME_HEIGHT - 175;
    const cardW = GAME_WIDTH - 32;
    const cardX = 16;
    const cardH = 62;
    const radius = 12;

    // Warm cream notepad card
    const bg = this.add.graphics();
    bg.fillStyle(0xFFF8EC, 1);
    bg.fillRoundedRect(cardX, cardY - 28, cardW, cardH, radius);
    // Top accent stripe — warm amber, notepad-style
    bg.fillStyle(0xD4821A, 1);
    bg.fillRoundedRect(cardX, cardY - 28, cardW, 6, { tl: radius, tr: radius, bl: 0, br: 0 });
    // Subtle left line (notepad margin)
    bg.lineStyle(1.5, 0xE8C88A, 1);
    bg.lineBetween(cardX + 38, cardY - 22, cardX + 38, cardY + 28);
    // Light inner shadow
    bg.lineStyle(1, 0xE0C898, 0.7);
    bg.strokeRoundedRect(cardX, cardY - 28, cardW, cardH, radius);

    // Step number on left margin
    const stepLabels = ['1', '2', '3', '4', '5', '6', '7'];
    const icon = this.add.text(cardX + 19, cardY - 2, stepLabels[step] ?? '★', {
      fontSize: '18px', fontFamily: 'Arial Black', color: '#D4821A',
    }).setOrigin(0.5);

    // Instruction text — dark ink on cream
    const txt = this.add.text(cardX + 48, cardY - 2, text, {
      fontSize: '14px', fontFamily: 'Arial', color: '#2C1A08', fontStyle: 'bold',
      wordWrap: { width: cardW - 62 },
    }).setOrigin(0, 0.5);

    // Progress dots at bottom
    const total = 7;
    const gap = 16;
    const dotsX = GAME_WIDTH / 2 - (total - 1) * gap / 2;
    for (let d = 0; d < total; d++) {
      const dot = this.add.graphics();
      const filled = d < step;
      const active = d === step;
      dot.fillStyle(filled ? 0xD4821A : active ? 0xFF9900 : 0xCCBB99, 1);
      dot.fillCircle(dotsX + d * gap, cardY + 24, active ? 5 : 3.5);
      this.tutorialOverlay.add(dot);
    }

    this.tutorialOverlay.add([bg, icon, txt]);
    this.tutorialOverlay.setAlpha(0);
    this.tweens.add({ targets: this.tutorialOverlay, alpha: 1, duration: 200, ease: 'Quad.easeOut' });

    // Spotlight — pulsing circle that points to where the player should act next
    this.clearTutorialSpotlight();
    const spotTargets: Record<number, { x: number; y: number; r: number }> = {
      0: { x: TABLE_POSITIONS[0].x, y: TABLE_POSITIONS[0].y, r: 60 },    // first empty table
      1: { x: TABLE_POSITIONS[0].x, y: TABLE_POSITIONS[0].y, r: 60 },    // table with customer
      2: { x: KITCHEN_X / 2, y: KITCHEN_Y, r: 50 },                     // cooking zone
      3: { x: KITCHEN_X + (GAME_WIDTH - KITCHEN_X) / 2, y: KITCHEN_Y, r: 50 }, // ready zone
      4: { x: TABLE_POSITIONS[0].x, y: TABLE_POSITIONS[0].y, r: 60 },    // table with eating customer
      5: { x: TABLE_POSITIONS[0].x, y: TABLE_POSITIONS[0].y, r: 60 },    // dirty table
      6: { x: 36, y: 196, r: 44 },                                        // dishwasher
    };
    const spotCfg = spotTargets[step];
    if (spotCfg) {
      const sg = this.add.graphics().setDepth(48).setAlpha(0);
      sg.lineStyle(3, 0xFFCC44, 1);
      sg.strokeCircle(spotCfg.x, spotCfg.y, spotCfg.r);
      this.tutorialSpotlight = sg;
      this.tutorialSpotlightTween = this.tweens.add({
        targets: sg, alpha: { from: 0, to: 0.85 },
        duration: 280, ease: 'Quad.easeOut',
        onComplete: () => {
          if (!sg.active) return;
          this.tutorialSpotlightTween = this.tweens.add({
            targets: sg,
            alpha: { from: 0.85, to: 0.25 },
            scale: { from: 1, to: 1.12 },
            duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
          });
        },
      });
    }
  }

  private showAbilitiesPanel() {
    const level = this.playerLevel;
    if (level <= 2) return;

    const abilities: string[] = [];
    const traySlots = level >= 5 ? 4 : level >= 3 ? 3 : 2;
    abilities.push(`Tray: ${traySlots} slots`);
    if (level >= 4) abilities.push('Speed Boost: +15%');
    if (level >= 4) abilities.push('Birthday Parties active');
    if (level >= 5) abilities.push('Food Critic may visit');
    if (level >= 6) abilities.push('Combo Shield');
    if (level >= 6 && this.sessionType !== 'normal') {
      abilities.push(this.sessionType === 'vip_night' ? 'Tonight: VIP NIGHT!' : 'Tonight: BIRTHDAY NIGHT!');
    }
    if (level >= 7) abilities.push('Rush Bonus: +40%');
    if (level >= 8) abilities.push('Master Saves: +300');

    const panelH = 32 + abilities.length * 24;
    const panel = this.add.container(GAME_WIDTH / 2, 75).setDepth(55).setAlpha(0);

    const bg = this.add.graphics();
    bg.fillStyle(0x08060F, 0.88);
    bg.fillRoundedRect(-150, -10, 300, panelH + 20, 12);
    bg.lineStyle(1.5, 0x8866CC, 0.5);
    bg.strokeRoundedRect(-150, -10, 300, panelH + 20, 12);
    panel.add(bg);

    panel.add(this.add.text(0, 8, 'YOUR ABILITIES', {
      fontSize: '10px', fontFamily: 'Arial Black', color: '#9966CC', letterSpacing: 3,
    }).setOrigin(0.5));

    abilities.forEach((a, i) => {
      panel.add(this.add.text(0, 30 + i * 24, `★  ${a}`, {
        fontSize: '14px', fontFamily: 'Arial Black', color: '#CCAAFF',
      }).setOrigin(0.5));
    });

    this.tweens.add({ targets: panel, alpha: 1, duration: 320, delay: 400, ease: 'Quad.easeOut' });
    this.time.delayedCall(3000, () => {
      this.tweens.add({ targets: panel, alpha: 0, duration: 400, ease: 'Quad.easeIn', onComplete: () => panel.destroy() });
    });
  }

  private clearTutorialSpotlight() {
    if (this.tutorialSpotlightTween) { this.tutorialSpotlightTween.stop(); this.tutorialSpotlightTween = null; }
    if (this.tutorialSpotlight) { this.tutorialSpotlight.destroy(); this.tutorialSpotlight = null; }
  }

  private advanceTutorial() {
    this.tutorialStep++;
    const steps: string[] = [
      'They\'re ready to order! Tap the TABLE to hear what they want.',
      'Order sent! Tap the KITCHEN when the food is cooked.',
      'Food\'s up! Grab it and tap the TABLE to serve it.',
      'They\'re enjoying the meal. Tap the TABLE once they\'re ready to pay.',
      'Time to clean up — tap the TABLE to collect the dirty dishes.',
      'Now carry the dishes to the DISHWASHER.',
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
    this.clearTutorialSpotlight();
    ProgressionSystem.markTutorialDone();

    const successTxt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, "You're all set!", {
      fontSize: '28px', fontFamily: 'Arial Black', color: '#66FF99',
      stroke: '#003300', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(55).setScale(0);
    SoundManager.orderTaken();
    this.tweens.add({
      targets: successTxt, scale: 1, duration: 300, ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(900, () => {
          this.tweens.add({
            targets: [this.tutorialOverlay, successTxt], alpha: 0, duration: 420,
            onComplete: () => {
              successTxt.destroy();
              this.tutorialOverlay.destroy();
              this.startSpawnCycle();
            },
          });
        });
      },
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private spawnFoodBurst(x: number, y: number, itemId: number) {
    // 8 food image pieces burst outward then fade
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i - Math.PI / 2;
      const dist = 55 + Math.random() * 28;
      const piece = this.add.image(x, y, `food_${itemId}`).setScale(0.45).setOrigin(0.5).setDepth(22).setAlpha(0.95);
      this.tweens.add({
        targets: piece,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist - 18,
        alpha: 0, scale: 0.3,
        duration: 600 + i * 40,
        delay: i * 25,
        ease: 'Quad.easeOut',
        onComplete: () => piece.destroy(),
      });
    }
    // Large bright starburst ring
    const ring = this.add.graphics().setDepth(21);
    ring.lineStyle(5, 0xFFEE44, 1.0);
    ring.strokeCircle(x, y, 12);
    this.tweens.add({
      targets: ring, scaleX: 5, scaleY: 5, alpha: 0,
      duration: 500, ease: 'Quad.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  private showFloating(text: string, x: number, y: number, color: string, sizeMult = 1) {
    const px = Math.round(36 * sizeMult);
    const t = this.add.text(x, y, text, {
      fontSize: `${px}px`, fontFamily: 'Arial Black', color,
      stroke: '#000000', strokeThickness: Math.round(4 * sizeMult),
    }).setOrigin(0.5).setDepth(25).setScale(0);
    const halfW = t.width * 0.65 + 8;
    t.x = Math.max(halfW, Math.min(GAME_WIDTH - halfW, x));
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
    // Large gold burst flash
    const flash = this.add.graphics().setDepth(19);
    flash.fillStyle(0xFFD700, 0.55);
    flash.fillCircle(x, y, 44);
    this.tweens.add({
      targets: flash, alpha: 0, scaleX: 3.8, scaleY: 3.8,
      duration: 480, ease: 'Quad.easeOut',
      onComplete: () => flash.destroy(),
    });
    // 10 big gold coins arc outward
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 / 10) * i - Math.PI / 2;
      const dist = 66 + (i % 2) * 18;
      const coin = this.add.graphics().setDepth(20);
      coin.fillStyle(0xFFD700, 1);
      coin.fillCircle(0, 0, 11);
      coin.fillStyle(0xFFFF99, 0.55);
      coin.fillCircle(-3, -3, 5);
      coin.lineStyle(2, 0xCC9900, 1);
      coin.strokeCircle(0, 0, 11);
      coin.setPosition(x, y).setScale(0.4);
      this.tweens.add({
        targets: coin,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist - 14,
        alpha: 0, scaleX: 0, scaleY: 0,
        duration: 750, delay: i * 40,
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

  private spawnCleanBurst(x: number, y: number) {
    // Small sparkle burst — 6 white/green circles expanding from table center
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
      const dot = this.add.graphics().setDepth(22);
      dot.fillStyle(i % 2 === 0 ? 0xAAFFAA : 0xFFFFFF, 1);
      dot.fillCircle(0, 0, 5 + Math.random() * 3);
      dot.setPosition(x, y - 10);
      this.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * (40 + Math.random() * 20),
        y: (y - 10) + Math.sin(angle) * (32 + Math.random() * 16),
        alpha: 0, scaleX: 0.3, scaleY: 0.3,
        duration: 450 + i * 35, delay: i * 20, ease: 'Quad.easeOut',
        onComplete: () => dot.destroy(),
      });
    }
    // Expanding ring
    const ring = this.add.graphics().setDepth(21);
    ring.lineStyle(3, 0x66FF88, 0.9);
    ring.strokeCircle(x, y - 10, 8);
    this.tweens.add({
      targets: ring, scaleX: 4.5, scaleY: 3, alpha: 0,
      duration: 420, ease: 'Quad.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  private spawnStarBurst(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const star = this.add.graphics().setDepth(30);
      star.fillStyle(0xFFD700, 0.9);
      star.fillTriangle(0, -7, 3, -2, -3, -2);
      star.fillTriangle(-7, 3, 0, 0, 7, 3);
      star.fillStyle(0xFFEE44, 0.7);
      star.fillCircle(0, 0, 3);
      star.setPosition(x, y);
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

  private triggerCelebration(message = 'TABLE LEGEND!', color = COLORS.TEXT_GOLD) {
    this.cameras.main.flash(300, 255, 230, 100, false);

    // Big announcement text with stroke
    const txt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, message, {
      fontSize: '34px', fontFamily: 'Arial Black', color,
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(40).setScale(0);

    this.tweens.add({
      targets: txt, scale: 1.15,
      duration: 380, ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: txt, scaleX: 1.0, scaleY: 1.0,
          duration: 140,
          onComplete: () => {
            this.time.delayedCall(1400, () => {
              this.tweens.add({ targets: txt, alpha: 0, y: txt.y - 30, duration: 400, onComplete: () => txt.destroy() });
            });
          },
        });
      },
    });

    // Confetti burst — small geometric shapes
    for (let i = 0; i < 22; i++) {
      const sx = Phaser.Math.Between(30, GAME_WIDTH - 30);
      const sy = Phaser.Math.Between(GAME_HEIGHT / 4, GAME_HEIGHT * 3 / 4);
      const size = Phaser.Math.Between(5, 10);
      const star = this.add.graphics().setDepth(35).setAlpha(0.9);
      const type = i % 4;
      if (type === 0) { star.fillStyle(0xFFD700, 1); star.fillTriangle(0, -size, size * 0.6, size * 0.6, -size * 0.6, size * 0.6); }
      else if (type === 1) { star.fillStyle(0xFFEE88, 1); star.fillCircle(0, 0, size * 0.6); }
      else if (type === 2) { star.fillStyle(0xFFCC22, 1); star.fillRect(-size * 0.2, -size, size * 0.4, size * 2); star.fillRect(-size, -size * 0.2, size * 2, size * 0.4); }
      else { star.fillStyle(0xFFFF99, 1); star.fillRect(-size * 0.5, -size * 0.5, size, size); }
      star.setPosition(sx, sy);
      this.tweens.add({
        targets: star, y: sy - Phaser.Math.Between(100, 180), alpha: 0,
        angle: Phaser.Math.Between(-180, 180),
        duration: 800 + i * 40, delay: i * 35, ease: 'Quad.easeOut',
        onComplete: () => star.destroy(),
      });
    }
  }

  // ─── Content Events ───────────────────────────────────────────────────────

  private rollSessionType() {
    const roll = Math.random();
    if (this.playerLevel >= 6) {
      if      (roll < 0.14) { this.sessionType = 'business_lunch'; }
      else if (roll < 0.27) { this.sessionType = 'family_day'; }
      else if (roll < 0.41) { this.sessionType = 'vip_night'; }
      else if (roll < 0.54) { this.sessionType = 'birthday_night'; }
      else if (roll < 0.65) { this.sessionType = 'critic_night'; }
    } else if (this.playerLevel >= 5) {
      if      (roll < 0.16) { this.sessionType = 'business_lunch'; }
      else if (roll < 0.30) { this.sessionType = 'family_day'; }
      else if (roll < 0.44) { this.sessionType = 'birthday_night'; }
      else if (roll < 0.56) { this.sessionType = 'critic_night'; }
    } else if (this.playerLevel >= 4) {
      if      (roll < 0.18) { this.sessionType = 'business_lunch'; }
      else if (roll < 0.34) { this.sessionType = 'family_day'; }
      else if (roll < 0.50) { this.sessionType = 'birthday_night'; }
    } else if (this.playerLevel >= 3) {
      if (roll < 0.22) { this.sessionType = 'business_lunch'; }
      else if (roll < 0.42) { this.sessionType = 'family_day'; }
    }
    if (this.sessionType !== 'normal') {
      this.showSessionAnnouncement(this.sessionType);
    }
  }

  private showSessionAnnouncement(type: 'normal' | 'vip_night' | 'birthday_night' | 'critic_night' | 'business_lunch' | 'family_day') {
    const configs: Record<string, { label: string; col: number; textCol: string; sub: string }> = {
      vip_night:      { label: 'VIP NIGHT',       col: 0xFFD700, textCol: '#FFD700', sub: 'VIP guests arrive more often tonight' },
      birthday_night: { label: 'BIRTHDAY NIGHT',  col: 0xFF88CC, textCol: '#FF88CC', sub: 'A birthday party is on the way!' },
      critic_night:   { label: 'CRITIC NIGHT',    col: 0x7799BB, textCol: '#AADDFF', sub: 'A food critic is visiting. Serve them perfectly.' },
      business_lunch: { label: 'BUSINESS LUNCH',  col: 0x5599CC, textCol: '#88CCFF', sub: 'Lunch rush — business clients arrive close together.' },
      family_day:     { label: 'FAMILY DAY',       col: 0xFF9955, textCol: '#FFBB77', sub: 'A family reserved a table. They stay longer and tip well.' },
    };
    const cfg = configs[type];
    if (!cfg) return;

    const bg = this.add.graphics().setDepth(55).setAlpha(0);
    bg.fillStyle(0x08040E, 0.92);
    bg.fillRoundedRect(GAME_WIDTH / 2 - 165, GAME_HEIGHT / 2 - 62, 330, 94, 14);
    bg.lineStyle(2, cfg.col, 0.7);
    bg.strokeRoundedRect(GAME_WIDTH / 2 - 165, GAME_HEIGHT / 2 - 62, 330, 94, 14);

    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 28, cfg.label, {
      fontSize: '32px', fontFamily: 'Arial Black', color: cfg.textCol,
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(56).setAlpha(0).setScale(0);

    const sub = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 12, cfg.sub, {
      fontSize: '14px', fontFamily: 'Arial', color: '#DDDDDD',
    }).setOrigin(0.5).setDepth(56).setAlpha(0);

    const delay = 3600;
    this.tweens.add({ targets: bg, alpha: 1, duration: 280, delay, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: title, alpha: 1, scale: 1, duration: 350, delay: delay + 100, ease: 'Back.easeOut' });
    this.tweens.add({ targets: sub, alpha: 1, duration: 300, delay: delay + 300 });
    this.time.delayedCall(delay + 2600, () => {
      this.tweens.add({
        targets: [bg, title, sub], alpha: 0, duration: 400,
        onComplete: () => { bg.destroy(); title.destroy(); sub.destroy(); },
      });
    });
  }

  private enqueueCritic() {
    if (this.criticSpawned || this.tutorialActive) return;
    const MAX_QUEUE = this.rushHourActive ? 3 : 2;
    if (this.waitingQueue.length >= MAX_QUEUE) {
      // Queue full — retry in 10s
      this.criticTimer = this.time.delayedCall(10000, () => this.enqueueCritic());
      return;
    }
    this.criticSpawned = true;

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
    customer.makeCritic();

    SoundManager.customerArrival();
    this.time.delayedCall(500, () => {
      this.showFloating('CRITIC IN THE HOUSE!', GAME_WIDTH / 2, GAME_HEIGHT / 2, '#AADDFF', 1.0);
    });

    this.tweens.add({
      targets: customer, x: qPos.x, y: qPos.y,
      duration: 600, ease: 'Quad.easeOut',
      onComplete: () => {
        customer.seatBounce();
        customer.showNameBanner();
        customer.startIdleBehavior();
        customer.queueTimeout = this.time.delayedCall(18000, () => {
          if (this.waitingQueue.includes(customer)) this.removeCustomerFromQueue(customer);
        });
        this.updateSeatingArrows();
        this.updateQueueDisplay();
      },
    });
  }

  private triggerBusinessLunchWave() {
    if (this.tutorialActive) return;
    this.cameras.main.flash(200, 80, 130, 200, false);
    this.showFloating('BUSINESS LUNCH RUSH!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, '#88CCFF', 1.1);

    // Spawn 3-4 business customers in rapid succession
    const count = 3 + (Math.random() < 0.5 ? 1 : 0);
    for (let i = 0; i < count; i++) {
      this.time.delayedCall(i * 1400, () => this.tryEnqueueBusinessCustomer());
    }
    if (!this.storyEvents.includes('business_rush')) this.storyEvents.push('business_rush');
  }

  private tryEnqueueBusinessCustomer() {
    const MAX_QUEUE = 3;
    if (this.waitingQueue.length >= MAX_QUEUE) return;
    if (this.tutorialActive) return;

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
    customer.makeBusinessCustomer();

    SoundManager.customerArrival();
    this.tweens.add({
      targets: customer, x: qPos.x, y: qPos.y,
      duration: 600, ease: 'Quad.easeOut',
      onComplete: () => {
        customer.seatBounce();
        customer.showNameBanner();
        customer.startIdleBehavior();
        customer.queueTimeout = this.time.delayedCall(12000, () => {
          if (this.waitingQueue.includes(customer)) this.removeCustomerFromQueue(customer);
        });
        this.updateSeatingArrows();
        this.updateQueueDisplay();
      },
    });
  }

  private showBirthdayBoostAnnouncement() {
    const bg = this.add.graphics().setDepth(35).setAlpha(0);
    bg.fillStyle(0xAA1155, 0.9);
    bg.fillRoundedRect(GAME_WIDTH / 2 - 148, GAME_HEIGHT / 2 - 50, 296, 66, 14);
    bg.lineStyle(2, 0xFF88CC, 0.7);
    bg.strokeRoundedRect(GAME_WIDTH / 2 - 148, GAME_HEIGHT / 2 - 50, 296, 66, 14);

    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 22, 'BIRTHDAY BONUS!', {
      fontSize: '26px', fontFamily: 'Arial Black', color: '#FFE0F0',
      stroke: '#660033', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(36).setAlpha(0).setScale(0);

    const sub = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 8, 'Next 3 payments earn ×2 score!', {
      fontSize: '13px', fontFamily: 'Arial', color: '#FFCCEE',
    }).setOrigin(0.5).setDepth(36).setAlpha(0);

    this.tweens.add({ targets: bg, alpha: 1, duration: 250 });
    this.tweens.add({ targets: title, alpha: 1, scale: 1, duration: 320, ease: 'Back.easeOut' });
    this.tweens.add({ targets: sub, alpha: 1, duration: 280, delay: 160 });
    this.time.delayedCall(2200, () => {
      this.tweens.add({
        targets: [bg, title, sub], alpha: 0, duration: 380,
        onComplete: () => { bg.destroy(); title.destroy(); sub.destroy(); },
      });
    });
  }

  private triggerCriticReview(isRave: boolean) {
    if (this.scoreMultiplierTimer) { this.scoreMultiplierTimer.remove(); this.scoreMultiplierTimer = null; }

    // Any angry customer during critic's visit overrides to poor review
    const actualRave = isRave && !this.criticAngrySeen;

    if (actualRave) {
      if (!this.storyEvents.includes('critic_rave')) this.storyEvents.push('critic_rave');
      this.scoreMultiplier = 1.5;
      this.cameras.main.flash(320, 80, 255, 180, false);
      this.showFloating('RAVE REVIEW!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 70, '#66EEBB', 1.2);
      this.time.delayedCall(550, () => this.showFloating('+50% score for 30s', GAME_WIDTH / 2, GAME_HEIGHT / 2, '#44DDAA', 0.85));
      this.scoreMultiplierTimer = this.time.delayedCall(30000, () => {
        this.scoreMultiplier = 1.0;
        this.showFloating('Review expired', GAME_WIDTH / 2, 90, '#88BBAA', 0.7);
      });
    } else {
      if (!this.storyEvents.includes('critic_rave') && !this.storyEvents.includes('critic_angry')) {
        this.storyEvents.push('critic_poor');
      }
      this.scoreMultiplier = 0.75;
      this.cameras.main.shake(300, 0.007);
      this.cameras.main.flash(260, 255, 80, 80, false);
      this.showFloating('POOR REVIEW!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 70, '#FF5555', 1.2);
      this.time.delayedCall(550, () => this.showFloating('-25% score for 20s', GAME_WIDTH / 2, GAME_HEIGHT / 2, '#FF9988', 0.85));
      this.scoreMultiplierTimer = this.time.delayedCall(20000, () => {
        this.scoreMultiplier = 1.0;
        this.showFloating('Review expired', GAME_WIDTH / 2, 90, '#888888', 0.7);
      });
    }
  }

  private spawnBirthdayConfetti(x: number, y: number) {
    const colors = [0xFF4488, 0xFFDD00, 0x00CCFF, 0xFF8800, 0x88FF88];
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 / 14) * i - Math.PI / 2;
      const dist = 40 + Math.random() * 30;
      const conf = this.add.graphics().setDepth(22);
      const color = colors[i % colors.length];
      if (i % 3 === 0) { conf.fillStyle(color, 1); conf.fillRect(-3, -5, 6, 10); }
      else if (i % 3 === 1) { conf.fillStyle(color, 1); conf.fillCircle(0, 0, 4); }
      else { conf.fillStyle(color, 1); conf.fillTriangle(0, -5, 4, 4, -4, 4); }
      conf.setPosition(x, y - 20);
      conf.setAngle(Math.random() * 360);
      this.tweens.add({
        targets: conf,
        x: x + Math.cos(angle) * dist,
        y: (y - 20) + Math.sin(angle) * dist - 20,
        alpha: 0, scale: 0,
        duration: 700 + i * 40, ease: 'Quad.easeOut',
        onComplete: () => conf.destroy(),
      });
    }
  }

  private pauseGame() {
    SoundManager.stopMusic();
    this.scene.pause();
    this.scene.launch('PauseScene');
  }

  resumeMusic() {
    SoundManager.startMusic();
  }

  private spawnKitchenSteam() {
    const activeCooking = this.kitchenOrders.filter(o => !o.ready);
    // Always emit a small ambient puff (25% chance) even with no orders — kitchen is always hot
    if (activeCooking.length === 0) {
      if (Math.random() > 0.25) return;
      const sx = KITCHEN_X - 80 + Math.random() * 60;
      const sy = KITCHEN_Y - 32;
      const steam = this.add.graphics().setDepth(5);
      steam.fillStyle(0xFFFFFF, 0.12 + Math.random() * 0.08);
      steam.fillCircle(0, 0, 2 + Math.random() * 2);
      steam.setPosition(sx, sy);
      this.tweens.add({
        targets: steam,
        y: sy - 18 - Math.random() * 12, x: sx + (Math.random() - 0.5) * 10,
        alpha: 0, scaleX: 1.5, scaleY: 1.5,
        duration: 700 + Math.random() * 300, ease: 'Quad.easeOut',
        onComplete: () => steam.destroy(),
      });
      return;
    }

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
    this.criticTimer?.remove();
    this.criticTimer = null;
    this.scoreMultiplierTimer?.remove();
    this.scoreMultiplierTimer = null;
    SoundManager.stopMusic();
    SoundManager.roundEnd();

    const total = this.customersHappy + this.customersAngry;
    const happyRate = total > 0 ? this.customersHappy / total : 0;
    const stars = happyRate >= 0.9 && this.score >= 2000 ? 3
      : happyRate >= 0.7 ? 2 : 1;

    // "SHIFT OVER!" cinematic banner before results screen
    this.cameras.main.flash(300, 255, 255, 255, true);
    const shiftBanner = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'SHIFT OVER!', {
      fontSize: '52px', fontFamily: 'Arial Black', color: '#FFFFFF',
      stroke: '#1A0A00', strokeThickness: 8,
    }).setOrigin(0.5).setDepth(60).setScale(0).setAlpha(0.95);
    const scoreLabel = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, `Score: ${fmtScore(this.score)}`, {
      fontSize: '28px', fontFamily: 'Arial Black', color: '#FFD700',
      stroke: '#1A0A00', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(60).setAlpha(0).setScale(0.7);

    this.tweens.add({
      targets: shiftBanner, scale: 1.1, duration: 400, ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({ targets: shiftBanner, scaleX: 1.0, scaleY: 1.0, duration: 120 });
        this.tweens.add({ targets: scoreLabel, alpha: 1, scaleX: 1, scaleY: 1, duration: 300, delay: 100, ease: 'Back.easeOut' });
      },
    });

    this.time.delayedCall(1600, () => {
      this.scene.start('GameOverScene', {
        score: this.score,
        stars,
        customersHappy: this.customersHappy,
        customersAngry: this.customersAngry,
        comboRecord: this.comboRecord,
        fastestDeliveryMs: this.fastestDeliveryMs,
        nearMissSaves: this.nearMissSaves,
        storyEvents: this.storyEvents,
      });
    });
  }
}
