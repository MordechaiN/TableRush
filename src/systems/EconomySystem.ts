// Economy architecture — not yet active. Wire up when ready.

export type UpgradeId =
  | 'faster_walk'    // waiter moves faster
  | 'longer_patience' // customers wait longer
  | 'bonus_tips'     // tip percentage increased
  | 'extra_table';   // unlock 6th table

export type CosmeticId =
  | 'outfit_gold'
  | 'outfit_chef'
  | 'outfit_casual';

export type BoostId =
  | 'double_coins'    // 2× coins for one round
  | 'patience_freeze' // freeze all patience timers for 10s
  | 'time_extend';    // add 30s to round

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'upgrade' | 'cosmetic' | 'boost';
  unlockLevel: number;
}

const SHOP_CATALOG: ShopItem[] = [
  { id: 'faster_walk',     name: 'Running Shoes',     description: 'Move 30% faster',            cost: 500,  type: 'upgrade',  unlockLevel: 2 },
  { id: 'longer_patience', name: 'Calm Atmosphere',   description: 'Customers wait 20% longer',  cost: 800,  type: 'upgrade',  unlockLevel: 3 },
  { id: 'bonus_tips',      name: 'Charm School',      description: 'Tips increased by 25%',      cost: 1200, type: 'upgrade',  unlockLevel: 4 },
  { id: 'extra_table',     name: 'Corner Booth',      description: 'Unlock a 6th table',         cost: 3000, type: 'upgrade',  unlockLevel: 7 },
  { id: 'outfit_gold',     name: 'Gold Jacket',       description: 'Dazzle your customers',      cost: 600,  type: 'cosmetic', unlockLevel: 2 },
  { id: 'double_coins',    name: 'Happy Hour',        description: 'Double coins this round',    cost: 200,  type: 'boost',    unlockLevel: 1 },
  { id: 'patience_freeze', name: 'Zen Moment',        description: 'Freeze patience for 10s',    cost: 150,  type: 'boost',    unlockLevel: 3 },
  { id: 'time_extend',     name: 'Extra Shift',       description: 'Add 30s to the round',       cost: 300,  type: 'boost',    unlockLevel: 5 },
];

const STORAGE_KEY = 'tablerush_economy';

interface EconomyData {
  coins: number;
  purchased: string[];
}

function loadEconomy(): EconomyData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as EconomyData;
  } catch { /* ignore */ }
  return { coins: 0, purchased: [] };
}

function saveEconomy(data: EconomyData): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

export class EconomySystem {
  static getCoins(): number {
    return loadEconomy().coins;
  }

  static addCoins(amount: number): void {
    const data = loadEconomy();
    data.coins = Math.max(0, data.coins + amount);
    saveEconomy(data);
  }

  static spendCoins(amount: number): boolean {
    const data = loadEconomy();
    if (data.coins < amount) return false;
    data.coins -= amount;
    saveEconomy(data);
    return true;
  }

  static getShopItems(): ShopItem[] {
    return SHOP_CATALOG;
  }

  static isPurchased(id: string): boolean {
    return loadEconomy().purchased.includes(id);
  }

  static purchaseItem(id: string): boolean {
    const item = SHOP_CATALOG.find(i => i.id === id);
    if (!item || EconomySystem.isPurchased(id)) return false;
    if (!EconomySystem.spendCoins(item.cost)) return false;
    const data = loadEconomy();
    data.purchased.push(id);
    saveEconomy(data);
    return true;
  }

  // Conversion rate for converting round score to coins (future use)
  static coinsForScore(score: number): number {
    return Math.floor(score / 100);
  }
}
