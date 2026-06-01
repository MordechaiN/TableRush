import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, MENU_ITEMS, DIFFICULTY, CUSTOMER_COLORS } from '../config/GameConfig';
import { Table } from '../entities/Table';
import { Customer } from '../entities/Customer';
import { Player } from '../entities/Player';

const TABLE_POSITIONS: { x: number; y: number }[] = [
  { x: 120, y: 280 },
  { x: 360, y: 280 },
  { x: 120, y: 430 },
  { x: 360, y: 430 },
  { x: 240, y: 560 },
];

export class GameScene extends Phaser.Scene {
  private tables: Table[] = [];
  private customers: Map<number, Customer> = new Map();
  private player!: Player;

  private score = 0;
  private multiplier = 1;
  private combo = 0;
  private highScore = 0;

  private scoreTxt!: Phaser.GameObjects.Text;
  private multiplierTxt!: Phaser.GameObjects.Text;
  private timeTxt!: Phaser.GameObjects.Text;

  private gameTime = 180; // 3 minutes
  private gameTimer!: Phaser.Time.TimerEvent;
  private spawnTimer!: Phaser.Time.TimerEvent;

  private nextCustomerId = 0;
  private spawnInterval: number;
  private patienceDuration: number;

  private playerBusy = false;
  private orderPanel!: Phaser.GameObjects.Container;
  private menuVisible = false;
  private activeTableId = -1;

  constructor() {
    super({ key: 'GameScene' });
    this.spawnInterval = DIFFICULTY.INITIAL_SPAWN_INTERVAL;
    this.patienceDuration = DIFFICULTY.INITIAL_PATIENCE;
  }

  create() {
    this.score = 0;
    this.multiplier = 1;
    this.combo = 0;
    this.spawnInterval = DIFFICULTY.INITIAL_SPAWN_INTERVAL;
    this.patienceDuration = DIFFICULTY.INITIAL_PATIENCE;
    this.playerBusy = false;
    this.menuVisible = false;
    this.tables = [];
    this.customers.clear();
    this.highScore = parseInt(localStorage.getItem('tablerush_highscore') ?? '0');

    this.buildRestaurant();
    this.buildUI();

    this.player = new Player(this, GAME_WIDTH / 2, 680);

    this.startSpawnCycle();
    this.startGameTimer();

    // Pause on Escape
    this.input.keyboard?.addKey('ESC').on('down', () => this.pauseGame());
  }

  // ─── Restaurant Layout ────────────────────────────────────────────────────

  private buildRestaurant() {
    // Floor
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.FLOOR);
    // Floor tiles pattern
    for (let row = 0; row < 12; row++) {
      for (let col = 0; col < 6; col++) {
        if ((row + col) % 2 === 0) {
          this.add.rectangle(col * 80 + 40, row * 80 + 40, 79, 79, 0x1c2a3a);
        }
      }
    }

    // Kitchen area
    const kitchenY = 130;
    this.add.rectangle(GAME_WIDTH / 2, kitchenY, GAME_WIDTH - 20, 100, COLORS.DARK_GRAY).setStrokeStyle(2, 0x4a6070);
    this.add.text(GAME_WIDTH / 2, kitchenY, '🍳  KITCHEN', {
      fontSize: '20px', fontFamily: 'Arial', color: COLORS.TEXT_DIM,
    }).setOrigin(0.5);

    // Counter
    this.add.rectangle(GAME_WIDTH / 2, 190, GAME_WIDTH - 20, 16, 0x2980b9);

    // Tables
    TABLE_POSITIONS.forEach((pos, i) => {
      const t = new Table(this, pos.x, pos.y, i);
      t.on('pointerdown', () => this.onTableClick(i));
      this.tables.push(t);
    });

    // Door entrance
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 40, 80, 20, 0x8B4513);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 40, '🚪', { fontSize: '20px' }).setOrigin(0.5);
  }

  // ─── UI ───────────────────────────────────────────────────────────────────

  private buildUI() {
    // HUD bar at top
    this.add.rectangle(GAME_WIDTH / 2, 28, GAME_WIDTH, 56, 0x0d1b2a, 0.95);

    this.scoreTxt = this.add.text(16, 14, 'SCORE: 0', {
      fontSize: '18px', fontFamily: 'Arial Black', color: COLORS.TEXT_LIGHT, fontStyle: 'bold',
    });

    this.multiplierTxt = this.add.text(GAME_WIDTH / 2, 14, 'x1.0', {
      fontSize: '18px', fontFamily: 'Arial Black', color: COLORS.TEXT_GOLD, fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    this.timeTxt = this.add.text(GAME_WIDTH - 16, 14, '3:00', {
      fontSize: '18px', fontFamily: 'Arial Black', color: COLORS.TEXT_LIGHT, fontStyle: 'bold',
    }).setOrigin(1, 0);

    // Pause button
    const pauseBtn = this.add.text(GAME_WIDTH - 16, 36, '⏸', { fontSize: '22px' }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
    pauseBtn.on('pointerdown', () => this.pauseGame());

    // Order panel (hidden by default)
    this.orderPanel = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 100);
    this.orderPanel.setVisible(false);
  }

  // ─── Spawning ─────────────────────────────────────────────────────────────

  private startSpawnCycle() {
    this.spawnTimer = this.time.addEvent({
      delay: this.spawnInterval,
      callback: this.trySpawnCustomer,
      callbackScope: this,
      loop: true,
    });
    // Spawn first customer quickly
    this.time.delayedCall(1000, this.trySpawnCustomer, [], this);
  }

  private trySpawnCustomer() {
    const emptyTable = this.tables.find(t => t.state === 'empty');
    if (!emptyTable) return;

    const id = this.nextCustomerId++;
    const colorIdx = id % 7;
    const customer = new Customer(this, GAME_WIDTH / 2, GAME_HEIGHT + 30, colorIdx, this.patienceDuration);
    this.customers.set(id, customer);

    emptyTable.setOccupied(id);
    customer.tableId = emptyTable.id;
    customer.state = 'entering';

    // Walk to table
    this.tweens.add({
      targets: customer,
      x: emptyTable.x,
      y: emptyTable.y - 20,
      duration: 700,
      ease: 'Quad.easeOut',
      onComplete: () => {
        customer.state = 'seated';
        customer.startPatience();
        emptyTable.setNeedsAttention();
      },
    });

    // Ramp difficulty
    this.spawnInterval = Math.max(
      DIFFICULTY.MIN_SPAWN_INTERVAL,
      this.spawnInterval * DIFFICULTY.SPAWN_RAMP_RATE
    );
    this.patienceDuration = Math.max(
      DIFFICULTY.MIN_PATIENCE,
      this.patienceDuration * DIFFICULTY.PATIENCE_RAMP_RATE
    );
  }

  // ─── Game Timer ───────────────────────────────────────────────────────────

  private startGameTimer() {
    this.gameTime = 180;
    this.gameTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.gameTime--;
        const m = Math.floor(this.gameTime / 60);
        const s = this.gameTime % 60;
        this.timeTxt.setText(`${m}:${s.toString().padStart(2, '0')}`);
        if (this.gameTime <= 30) this.timeTxt.setColor('#e74c3c');
        if (this.gameTime <= 0) this.endGame();
      },
      loop: true,
    });
  }

  // ─── Table Interaction ───────────────────────────────────────────────────

  private onTableClick(tableId: number) {
    if (this.playerBusy) return;

    const table = this.tables[tableId];
    const customer = this.getCustomerAtTable(tableId);

    if (table.state === 'dirty') {
      this.cleanTable(table);
      return;
    }

    if (!customer) return;

    if (customer.state === 'seated') {
      this.takeOrder(table, customer);
    } else if (customer.state === 'waiting_food') {
      this.deliverFood(table, customer);
    } else if (customer.state === 'paying') {
      this.collectPayment(table, customer);
    }
  }

  private getCustomerAtTable(tableId: number): Customer | undefined {
    for (const [, c] of this.customers) {
      if (c.tableId === tableId) return c;
    }
    return undefined;
  }

  // ─── Gameplay Steps ──────────────────────────────────────────────────────

  private takeOrder(table: Table, customer: Customer) {
    this.playerBusy = true;
    table.stopGlow();
    customer.state = 'ordering';

    this.player.walkTo(table.x, table.y + 40, () => {
      this.player.bounce();
      this.showOrderMenu(table, customer);
    });
  }

  private showOrderMenu(table: Table, customer: Customer) {
    this.menuVisible = true;
    this.activeTableId = table.id;
    this.orderPanel.removeAll(true);

    const bg = this.add.graphics();
    bg.fillStyle(0x0d1b2a, 0.95);
    bg.fillRoundedRect(-220, -110, 440, 160, 16);
    bg.lineStyle(2, COLORS.BLUE);
    bg.strokeRoundedRect(-220, -110, 440, 160, 16);
    this.orderPanel.add(bg);

    const title = this.add.text(0, -90, 'Take Order', {
      fontSize: '18px', fontFamily: 'Arial Black', color: COLORS.TEXT_LIGHT,
    }).setOrigin(0.5);
    this.orderPanel.add(title);

    MENU_ITEMS.forEach((item, i) => {
      const bx = (i - 2) * 86;
      const itemBg = this.add.graphics();
      itemBg.fillStyle(COLORS.DARK_GRAY);
      itemBg.fillRoundedRect(bx - 38, -68, 76, 80, 8);
      this.orderPanel.add(itemBg);

      const emoji = this.add.text(bx, -38, item.emoji, { fontSize: '26px' }).setOrigin(0.5);
      const price = this.add.text(bx, 4, `$${item.price}`, {
        fontSize: '14px', fontFamily: 'Arial', color: COLORS.TEXT_GOLD,
      }).setOrigin(0.5);
      this.orderPanel.add([emoji, price]);

      const zone = this.add.zone(bx, -28, 76, 80).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => {
        this.orderSelected(table, customer, i);
      });
      this.orderPanel.add(zone);
    });

    this.orderPanel.setVisible(true);
    this.orderPanel.setDepth(10);

    // Cancel zone
    const cancelZone = this.add.zone(GAME_WIDTH / 2, 100, GAME_WIDTH, 200).setInteractive();
    cancelZone.once('pointerdown', () => {
      this.hideOrderMenu();
      this.playerBusy = false;
      customer.state = 'seated';
      table.setNeedsAttention();
      cancelZone.destroy();
    });
    this.orderPanel.add(cancelZone);
  }

  private hideOrderMenu() {
    this.orderPanel.setVisible(false);
    this.menuVisible = false;
  }

  private orderSelected(table: Table, customer: Customer, itemId: number) {
    this.hideOrderMenu();
    customer.showOrder(itemId);
    customer.state = 'waiting_food';
    customer.refillPatience();
    customer.startPatience();

    const item = MENU_ITEMS[itemId];
    this.player.walkTo(GAME_WIDTH / 2, 210, () => {
      this.player.bounce();
      this.player.carryItem(item.emoji);

      this.time.delayedCall(item.cookTime, () => {
        this.player.walkTo(table.x, table.y + 40, () => {
          this.playerBusy = false;
          table.setNeedsAttention();
        });
      });
    });
  }

  private deliverFood(table: Table, customer: Customer) {
    if (!customer.order) return;
    this.playerBusy = true;
    table.stopGlow();

    this.player.clearCarry();
    customer.hideOrder();
    customer.state = 'eating';
    customer.stopPatience();
    customer.refillPatience();

    this.showFloating(`+$${customer.order.price}`, table.x, table.y - 40, COLORS.TEXT_GOLD);
    this.addScore(customer.order.price * 10);

    this.player.bounce();

    // Customer eats, then pays
    const eatTime = 3000 + Math.random() * 2000;
    this.time.delayedCall(eatTime, () => {
      customer.state = 'paying';
      customer.startPatience();
      table.setNeedsAttention();
      this.playerBusy = false;
    });
  }

  private collectPayment(table: Table, customer: Customer) {
    if (!customer.order) return;
    this.playerBusy = true;
    table.stopGlow();

    const tip = Math.floor(customer.order.price * customer.getPatienceFraction() * 0.5);
    const total = customer.order.price + tip;

    this.showFloating(`💰 $${total}`, table.x, table.y - 50, COLORS.TEXT_GOLD);
    this.addScore(total * 10 + 50);
    this.incrementCombo();

    // Spawn coin animation
    this.spawnCoins(table.x, table.y);

    customer.state = 'leaving';
    customer.stopPatience();

    this.tweens.add({
      targets: customer,
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT + 60,
      duration: 600,
      ease: 'Quad.easeIn',
      onComplete: () => {
        const id = this.getCustomerIdByInstance(customer);
        if (id !== -1) this.customers.delete(id);
        customer.destroy();
      },
    });

    table.setDirty();
    this.playerBusy = false;
  }

  private cleanTable(table: Table) {
    this.playerBusy = true;
    this.player.walkTo(table.x, table.y + 40, () => {
      this.player.bounce();
      this.time.delayedCall(600, () => {
        table.setEmpty();
        this.playerBusy = false;
        this.showFloating('✓ Clean!', table.x, table.y - 30, COLORS.TEXT_LIGHT);
      });
    });
  }

  // ─── Score / Combo ────────────────────────────────────────────────────────

  private addScore(amount: number) {
    const earned = Math.floor(amount * this.multiplier);
    this.score += earned;
    this.scoreTxt.setText(`SCORE: ${this.score}`);
    this.tweens.add({ targets: this.scoreTxt, scaleX: 1.15, scaleY: 1.15, duration: 80, yoyo: true });
  }

  private incrementCombo() {
    this.combo++;
    if (this.combo > 1) {
      this.multiplier = Math.min(5, 1 + this.combo * DIFFICULTY.SCORE_MULTIPLIER_INCREMENT);
      this.multiplierTxt.setText(`x${this.multiplier.toFixed(1)}`);
      this.showFloating(`COMBO x${this.combo}!`, GAME_WIDTH / 2, 100, COLORS.TEXT_GOLD);
    }
  }

  private resetCombo() {
    this.combo = 0;
    this.multiplier = 1;
    this.multiplierTxt.setText('x1.0');
  }

  // ─── Angry customers ──────────────────────────────────────────────────────

  update() {
    for (const [id, customer] of this.customers) {
      if (customer.isAngry() && customer.state !== 'leaving' && customer.state !== 'angry') {
        this.customerLeaveAngry(id, customer);
      }
    }
  }

  private customerLeaveAngry(id: number, customer: Customer) {
    customer.state = 'angry';
    customer.stopPatience();
    this.resetCombo();

    const table = this.tables[customer.tableId];
    if (table) table.setDirty();

    this.showFloating('😠 Left!', customer.x, customer.y - 40, COLORS.TEXT_ACCENT);

    this.tweens.add({
      targets: customer,
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT + 60,
      duration: 500,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.customers.delete(id);
        customer.destroy();
      },
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private showFloating(text: string, x: number, y: number, color: string) {
    const t = this.add.text(x, y, text, {
      fontSize: '20px', fontFamily: 'Arial Black', color,
    }).setOrigin(0.5).setDepth(20);
    this.tweens.add({
      targets: t,
      y: y - 60,
      alpha: 0,
      duration: 1200,
      ease: 'Quad.easeOut',
      onComplete: () => t.destroy(),
    });
  }

  private spawnCoins(x: number, y: number) {
    for (let i = 0; i < 4; i++) {
      const coin = this.add.image(x, y, 'coin').setDepth(15);
      const angle = (Math.PI * 2 / 4) * i;
      this.tweens.add({
        targets: coin,
        x: x + Math.cos(angle) * 40,
        y: y + Math.sin(angle) * 40,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 600,
        delay: i * 80,
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

  private pauseGame() {
    this.scene.pause();
    this.scene.launch('PauseScene');
  }

  private endGame() {
    this.spawnTimer?.remove();
    this.gameTimer?.remove();

    if (this.score > this.highScore) {
      localStorage.setItem('tablerush_highscore', String(this.score));
    }

    this.time.delayedCall(500, () => {
      this.scene.start('GameOverScene', { score: this.score, highScore: Math.max(this.score, this.highScore) });
    });
  }
}
