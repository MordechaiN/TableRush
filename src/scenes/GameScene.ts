import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, COLORS,
  MENU_ITEMS, DIFFICULTY_TIERS, COMBO_MILESTONES, SPEED_MULTIPLIERS,
  GAME_DURATION, CLEAN_TIME,
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

  private scoreTxt!: Phaser.GameObjects.Text;
  private comboTxt!: Phaser.GameObjects.Text;
  private timeTxt!: Phaser.GameObjects.Text;

  private gameTimeMs = GAME_DURATION * 1000;
  private gameStartMs = 0;
  private gameTimer!: Phaser.Time.TimerEvent;
  private spawnTimer!: Phaser.Time.TimerEvent;

  private playerBusy = false;
  private carryingOrderId = -1;

  private kitchenGlow!: Phaser.GameObjects.Graphics;
  private kitchenGlowTween: Phaser.Tweens.Tween | null = null;
  private ticketRail!: Phaser.GameObjects.Container;

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
    this.playerBusy = false;
    this.carryingOrderId = -1;
    this.kitchenOrders = [];
    this.nextOrderId = 0;
    this.nextCustomerId = 0;
    this.tables = [];
    this.customers.clear();
    this.gameStartMs = this.time.now;

    this.buildRestaurant();
    this.buildUI();

    this.player = new Player(this, GAME_WIDTH / 2, 700);

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
    // Warm floor with tile pattern
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.FLOOR_WARM);
    for (let row = 0; row < 14; row++) {
      for (let col = 0; col < 7; col++) {
        if ((row + col) % 2 === 0) {
          this.add.rectangle(col * 70 + 35, row * 70 + 35, 69, 69, COLORS.FLOOR_ALT, 1);
        }
      }
    }

    // Wall accent strip at top
    this.add.rectangle(GAME_WIDTH / 2, 0, GAME_WIDTH, 90, COLORS.WALL_ACCENT);
    this.add.rectangle(GAME_WIDTH / 2, 88, GAME_WIDTH, 6, COLORS.WALL);

    // Kitchen counter
    this.add.image(KITCHEN_X, KITCHEN_Y, 'kitchen').setOrigin(0.5, 0.5);

    this.add.text(KITCHEN_X, KITCHEN_Y - 26, '🍳 KITCHEN', {
      fontSize: '14px', fontFamily: 'Arial Black',
      color: '#555555', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Kitchen glow (shows when order ready)
    this.kitchenGlow = this.add.graphics();
    this.kitchenGlow.lineStyle(4, COLORS.UI_ORANGE, 0);
    this.kitchenGlow.strokeRoundedRect(
      KITCHEN_X - (GAME_WIDTH - 20) / 2, KITCHEN_Y - 40,
      GAME_WIDTH - 20, 80, 8
    );
    this.kitchenGlow.setAlpha(0);

    // Ticket rail
    this.ticketRail = this.add.container(KITCHEN_X, KITCHEN_Y + 10);

    // Kitchen tap zone
    const kitchenZone = this.add.zone(KITCHEN_X, KITCHEN_Y, GAME_WIDTH - 20, 80)
      .setInteractive({ useHandCursor: true });
    kitchenZone.on('pointerdown', () => this.onKitchenClick());

    // Tables
    TABLE_POSITIONS.forEach((pos, i) => {
      const t = new Table(this, pos.x, pos.y, i);
      t.on('pointerdown', () => this.onTableClick(i));
      this.tables.push(t);
    });

    // Door
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 30, 80, 16, COLORS.WALL_ACCENT);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 36, '🚪', { fontSize: '22px' }).setOrigin(0.5);

    // Decorative plants
    this.add.text(24, GAME_HEIGHT - 80, '🪴', { fontSize: '32px' }).setOrigin(0.5);
    this.add.text(GAME_WIDTH - 24, GAME_HEIGHT - 80, '🪴', { fontSize: '32px' }).setOrigin(0.5);
  }

  // ─── UI ───────────────────────────────────────────────────────────────────

  private buildUI() {
    this.add.image(GAME_WIDTH / 2, 28, 'hud_panel').setOrigin(0.5, 0.5);

    this.scoreTxt = this.add.text(14, 28, '🍽️  0', {
      fontSize: '17px', fontFamily: 'Arial Black', color: COLORS.TEXT_DARK, fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    this.comboTxt = this.add.text(GAME_WIDTH / 2, 28, '', {
      fontSize: '16px', fontFamily: 'Arial Black', color: COLORS.TEXT_ORANGE,
    }).setOrigin(0.5, 0.5);

    this.timeTxt = this.add.text(GAME_WIDTH - 14, 28, '3:00', {
      fontSize: '17px', fontFamily: 'Arial Black', color: COLORS.TEXT_DARK, fontStyle: 'bold',
    }).setOrigin(1, 0.5);

    if (!this.sys.game.device.input.touch) {
      const pauseBtn = this.add.text(GAME_WIDTH - 14, 28, '⏸', { fontSize: '20px' })
        .setOrigin(1.6, 0.5).setInteractive({ useHandCursor: true }).setDepth(5);
      pauseBtn.on('pointerdown', () => this.pauseGame());
    }
  }

  // ─── Spawning ─────────────────────────────────────────────────────────────

  private startSpawnCycle() {
    // First customer after short delay
    this.time.delayedCall(2000, () => this.trySpawnCustomer());
    this.scheduleNextSpawn();
  }

  private scheduleNextSpawn() {
    const elapsed = (this.time.now - this.gameStartMs) / 1000;
    const tier = this.getDifficultyTier(elapsed);
    const progress = Math.min(1, elapsed / tier.maxTime);
    const interval = Phaser.Math.Linear(tier.spawnStart, tier.spawnEnd, progress);

    this.spawnTimer = this.time.addEvent({
      delay: interval,
      callback: () => {
        this.trySpawnCustomer();
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

  private trySpawnCustomer() {
    // Keep at least 1 table free
    const emptyTables = this.tables.filter(t => t.state === 'empty');
    if (emptyTables.length === 0) return;
    if (this.tutorialActive && this.customers.size >= 1) return;

    const table = emptyTables[Math.floor(Math.random() * emptyTables.length)];
    const elapsed = (this.time.now - this.gameStartMs) / 1000;
    const tier = this.getDifficultyTier(elapsed);
    const patience = Phaser.Math.Between(tier.patienceMin, tier.patienceMax);

    const id = this.nextCustomerId++;
    const customer = new Customer(this, GAME_WIDTH / 2, GAME_HEIGHT + 30, id % 7, patience);
    this.customers.set(id, customer);

    table.setOccupied(id);
    customer.tableId = table.id;
    customer.state = 'entering';

    this.tweens.add({
      targets: customer,
      x: table.x, y: table.y - 20,
      duration: 800, ease: 'Quad.easeOut',
      onComplete: () => {
        customer.state = 'requesting';
        customer.startPatience();
        customer.showRequestBubble();
        customer.seatBounce();
        table.setPriority('requesting');

        if (this.tutorialActive && this.tutorialStep === 0) {
          this.advanceTutorial();
        }
      },
    });
  }

  // ─── Game Timer ───────────────────────────────────────────────────────────

  private startGameTimer() {
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

    const table = this.tables[tableId];
    const customer = this.getCustomerAtTable(tableId);

    if (table.state === 'dirty') {
      this.cleanTable(table);
      return;
    }

    if (!customer) return;

    if (customer.state === 'requesting') {
      this.takeOrder(table, customer);
      return;
    }

    if (customer.state === 'waiting_food' && this.carryingOrderId !== -1) {
      const order = this.kitchenOrders.find(o => o.id === this.carryingOrderId);
      if (order && order.tableId === tableId) {
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
    if (this.carryingOrderId !== -1) return;

    const readyOrder = this.kitchenOrders.find(o => o.ready);
    if (!readyOrder) return;

    this.playerBusy = true;
    this.player.walkTo(KITCHEN_X, KITCHEN_Y + 50, () => {
      this.player.bounce();
      this.carryingOrderId = readyOrder.id;
      this.player.carryItem(readyOrder.item.emoji);
      this.playerBusy = false;

      // Highlight destination table
      const table = this.tables[readyOrder.tableId];
      if (table) table.setPriority('kitchen_ready');

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
    customer.hideBubble();
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

      this.player.bounce();
      customer.patienceAtDelivery = customer.getPatienceFraction();
      customer.hideBubble();
      customer.state = 'eating';
      customer.stopPatience();
      customer.refillPatience();

      this.player.clearCarry();
      this.carryingOrderId = -1;
      this.kitchenOrders = this.kitchenOrders.filter(o => o.id !== order.id);

      const speedMult = this.getSpeedMultiplier(customer.patienceAtDelivery);
      const deliveryScore = Math.floor(customer.order!.price * 10 * speedMult * this.comboMultiplier);
      this.addScore(deliveryScore);

      if (speedMult > 1) {
        const label = SPEED_MULTIPLIERS.find(s => customer.patienceAtDelivery >= s.minPct)?.label ?? '';
        if (label) this.showFloating(label, table.x, table.y - 60, COLORS.TEXT_GOLD);
      }
      this.showFloating(`+${deliveryScore}`, table.x, table.y - 40, COLORS.TEXT_ORANGE);
      this.playerBusy = false;

      const eatTime = 2000 + Math.random() * 2000;
      customer.startEating(eatTime);

      this.time.delayedCall(eatTime, () => {
        if (customer.state !== 'eating') return;
        customer.stopEating();
        customer.state = 'paying';
        customer.startPatience();
        customer.showPayBubble(customer.order!.price);
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
      this.player.bounce();

      const tip = Math.floor(customer.order!.price * customer.patienceAtDelivery * 0.3);
      const payScore = Math.floor((customer.order!.price + tip) * 5 * this.comboMultiplier);
      this.addScore(payScore);
      this.showFloating(`💰 $${payScore}`, table.x, table.y - 50, COLORS.TEXT_GOLD);
      this.spawnCoins(table.x, table.y);

      this.customersHappy++;
      this.incrementCombo();
      this.player.setEmotion('proud', 1800);

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

  private cleanTable(table: Table) {
    this.playerBusy = true;
    table.clearPulse();
    this.player.walkTo(table.x, table.y + 40, () => {
      this.player.bounce();
      table.startCleaningProgress(CLEAN_TIME, () => {
        table.setEmpty();
        table.flashClean();
        this.playerBusy = false;
        this.showFloating('✨ Clean!', table.x, table.y - 30, COLORS.TEXT_GREEN);

        if (this.tutorialActive && this.tutorialStep === 5) {
          this.advanceTutorial();
        }
      });
    });
  }

  // ─── Score / Combo ────────────────────────────────────────────────────────

  private addScore(amount: number) {
    this.score = Math.max(0, this.score + amount);
    this.scoreTxt.setText(`🍽️  ${this.score}`);
    this.tweens.add({ targets: this.scoreTxt, scaleX: 1.1, scaleY: 1.1, duration: 80, yoyo: true });
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

    if (this.comboMultiplier > 1) {
      this.comboTxt.setText(`🔥 ×${this.comboMultiplier.toFixed(1)}`);
    }

    // Waiter reactions at combo milestones
    this.player.celebrateCombo(this.comboCount);
    if (this.comboCount >= 10) {
      this.triggerCelebration();
    } else if (this.comboCount === 5) {
      this.spawnStarBurst(this.player.x, this.player.y - 20);
    }
  }

  private resetCombo() {
    this.comboCount = 0;
    this.comboMultiplier = 1.0;
    this.comboTxt.setText('');
  }

  private showComboAnnouncement(label: string, multiplier: number) {
    const size = 14 + Math.floor((multiplier - 1) * 6);
    const txt = this.add.text(GAME_WIDTH / 2, 80, label, {
      fontSize: `${size}px`, fontFamily: 'Arial Black', color: COLORS.TEXT_ORANGE,
    }).setOrigin(0.5).setDepth(30).setAlpha(0).setX(GAME_WIDTH + 100);

    this.tweens.add({
      targets: txt, x: GAME_WIDTH / 2, alpha: 1,
      duration: 300, ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1200, () => {
          this.tweens.add({ targets: txt, alpha: 0, duration: 250, onComplete: () => txt.destroy() });
        });
      },
    });
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
    if (hasReady && !this.kitchenGlowTween) {
      this.kitchenGlow.setAlpha(0.6);
      this.kitchenGlowTween = this.tweens.add({
        targets: this.kitchenGlow, alpha: { from: 0.1, to: 0.7 },
        duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    } else if (!hasReady && this.kitchenGlowTween) {
      this.kitchenGlowTween.stop();
      this.kitchenGlowTween = null;
      this.kitchenGlow.setAlpha(0);
    }
  }

  // ─── Angry Customers ──────────────────────────────────────────────────────

  update() {
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
    if (table) table.setEmpty();

    this.time.delayedCall(400, () => {
      this.tweens.add({
        targets: customer,
        x: GAME_WIDTH / 2, y: GAME_HEIGHT + 60,
        duration: 500, ease: 'Quad.easeIn',
        onComplete: () => {
          this.customers.delete(id);
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
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.55);
    bg.fillRect(0, GAME_HEIGHT - 160, GAME_WIDTH, 160);
    this.tutorialOverlay.add(bg);

    this.startGameTimer();
    this.time.delayedCall(1000, () => this.trySpawnCustomer());

    this.showTutorialStep(0, 'A customer arrived!\nTap the TABLE to take their order.');
  }

  private showTutorialStep(step: number, text: string) {
    // Remove old text
    this.tutorialOverlay.getAll().slice(1).forEach(o => o.destroy());

    const txt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 100, text, {
      fontSize: '16px', fontFamily: 'Arial', color: '#FFFFFF',
      align: 'center', wordWrap: { width: GAME_WIDTH - 40 },
    }).setOrigin(0.5);

    const stepTxt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 150, `Tip ${step + 1}/6`, {
      fontSize: '12px', color: COLORS.TEXT_GOLD,
    }).setOrigin(0.5);

    this.tutorialOverlay.add([txt, stepTxt]);
  }

  private advanceTutorial() {
    this.tutorialStep++;
    const steps: [string, string][] = [
      [/* step 0 done, show 1 */ '', 'Order taken! It\'s cooking in the kitchen.\nWhen it\'s ready, tap the KITCHEN to pick it up.'],
      [/* 1 done, show 2 */ '', 'Food picked up! Now tap the TABLE to deliver it.'],
      [/* 2 done, show 3 */ '', 'Delivered! Customer is eating.\nWhen they\'re done, tap the table to COLLECT PAYMENT.'],
      [/* 3 done, show 4 */ '', 'Payment collected! Great service!\nNow clean the DIRTY TABLE.'],
      [/* 4 done, show 5 */ '', 'Table cleaned! You\'re a natural!\nServe more customers to earn combos and stars!'],
    ];

    if (this.tutorialStep <= 5) {
      const [, msg] = steps[this.tutorialStep - 1] ?? ['', ''];
      if (msg) this.showTutorialStep(this.tutorialStep, msg);
    }

    if (this.tutorialStep >= 6) {
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

  private showFloating(text: string, x: number, y: number, color: string) {
    const t = this.add.text(x, y, text, {
      fontSize: '20px', fontFamily: 'Arial Black', color,
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
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
      const coin = this.add.text(x, y, '💰', { fontSize: '16px' }).setOrigin(0.5).setDepth(20);
      this.tweens.add({
        targets: coin,
        x: x + Math.cos(angle) * 44, y: y + Math.sin(angle) * 44,
        alpha: 0, scaleX: 0, scaleY: 0,
        duration: 600, delay: i * 60, ease: 'Quad.easeOut',
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

  private triggerCelebration() {
    this.cameras.main.flash(250, 255, 230, 100, false);

    const txt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, '🌟 TABLE MASTER! 🌟', {
      fontSize: '26px', fontFamily: 'Arial Black', color: COLORS.TEXT_GOLD,
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

  private endGame() {
    this.spawnTimer?.remove();
    this.gameTimer?.remove();

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
      });
    });
  }
}
