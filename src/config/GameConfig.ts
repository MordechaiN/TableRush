// ── Table Rush · balance & content configuration ─────────────────────────────
// Every tunable number in the game lives here.

export const GAME_DURATION = 180; // seconds per shift
export const MAX_TABLES = 5;

// Kitchen
export const BURNERS = 3;      // simultaneous cooking slots
export const SHELF_SLOTS = 3;  // "ORDER UP" pass slots

export interface MenuItem {
  id: number; name: string; emoji: string;
  price: number;        // base coins (multiplied by 5 at payout)
  cookTime: number;     // seconds on the stove
  unlockLevel: number;  // player level required before it appears on the menu
}
// Order matters: buildDish(i) in builders.ts maps to these indices.
export const MENU_ITEMS: MenuItem[] = [
  { id: 0, name: 'Salad',  emoji: '🥗', price: 10, cookTime: 3.0, unlockLevel: 1 },
  { id: 1, name: 'Burger', emoji: '🍔', price: 12, cookTime: 4.2, unlockLevel: 1 },
  { id: 2, name: 'Pasta',  emoji: '🍝', price: 14, cookTime: 5.0, unlockLevel: 1 },
  { id: 3, name: 'Sushi',  emoji: '🍣', price: 19, cookTime: 4.6, unlockLevel: 2 },
  { id: 4, name: 'Pizza',  emoji: '🍕', price: 16, cookTime: 5.8, unlockLevel: 1 },
  { id: 5, name: 'Cake',   emoji: '🍰', price: 24, cookTime: 6.4, unlockLevel: 4 },
];

export type Accessory = 'none' | 'glasses' | 'sunglasses' | 'cap' | 'flower' | 'bow';
export interface Archetype {
  name: string; outfit: number; hair: number; accessory: Accessory;
  speed: number;        // walk-speed multiplier
  patienceMul: number;  // patience multiplier (Elder waits longer, Teen doesn't)
}
export const CUSTOMER_VARIANTS: Archetype[] = [
  { name: 'Elegant',  outfit: 0xCC2244, hair: 0x2C1810, accessory: 'flower',     speed: 0.95, patienceMul: 1.10 },
  { name: 'Business', outfit: 0x1A3A6B, hair: 0x6B3A1F, accessory: 'glasses',    speed: 1.15, patienceMul: 0.85 },
  { name: 'Casual',   outfit: 0x2D7A2D, hair: 0xF5C842, accessory: 'none',       speed: 1.00, patienceMul: 1.00 },
  { name: 'Trendy',   outfit: 0xE06520, hair: 0x1A1A1A, accessory: 'sunglasses', speed: 1.10, patienceMul: 0.90 },
  { name: 'Romantic', outfit: 0x7B3FA0, hair: 0x3A2415, accessory: 'bow',        speed: 0.90, patienceMul: 1.15 },
  { name: 'Elder',    outfit: 0x1A7A7A, hair: 0xDDDDDD, accessory: 'glasses',    speed: 0.70, patienceMul: 1.35 },
  { name: 'Teen',     outfit: 0xC8B400, hair: 0xCC3322, accessory: 'cap',        speed: 1.30, patienceMul: 0.78 },
];

// Time-based difficulty tiers over the 3-minute shift.
export interface Tier {
  until: number;        // elapsed seconds this tier lasts to
  spawnMin: number;     // seconds between guests (random in range)
  spawnMax: number;
  orderPatience: number; // seconds a guest waits for you to take the order
  eatTime: number;       // seconds spent eating
}
export const DIFFICULTY_TIERS: Tier[] = [
  { until: 60,  spawnMin: 5.6, spawnMax: 7.2, orderPatience: 30, eatTime: 3.2 },
  { until: 120, spawnMin: 4.4, spawnMax: 5.6, orderPatience: 24, eatTime: 2.8 },
  { until: 999, spawnMin: 3.4, spawnMax: 4.4, orderPatience: 19, eatTime: 2.4 },
];

// Patience phases (fractions of the tier's orderPatience unless noted)
export const WAIT_PATIENCE_MUL = 1.6;  // fresh timer while food cooks (more forgiving)
export const COLD_DECAY = 1.7;         // decay speed-up once food sits ready on the pass
export const SERVING_DECAY = 0.4;      // decay while the waiter is already en route
export const PAY_PATIENCE = 14;        // seconds a guest waits to pay (absolute)

// Speed bonus by patience remaining at the moment food lands on the table
export const SPEED_MULTIPLIERS = [
  { minPct: 0.70, multiplier: 2.0, label: 'LIGHTNING' },
  { minPct: 0.45, multiplier: 1.5, label: 'FAST' },
  { minPct: 0.00, multiplier: 1.0, label: '' },
];

// Combo milestones — consecutive payments without a walkout
export const COMBO_MILESTONES = [
  { min: 0,  multiplier: 1.0, label: '' },
  { min: 3,  multiplier: 2.0, label: 'HOT STREAK' },
  { min: 6,  multiplier: 3.0, label: 'ON FIRE' },
  { min: 10, multiplier: 4.0, label: 'TABLE LEGEND' },
  { min: 15, multiplier: 5.0, label: 'TABLE MASTER' },
];

// VIP guests — gold crown, big tip, short fuse (unlocked at level 5)
export const VIP_UNLOCK_LEVEL = 5;
export const VIP_CHANCE = 0.10;
export const VIP_PAY = 2.5;
export const VIP_PATIENCE = 0.75;

// Final rush — last 30 seconds pay double
export const FINAL_RUSH_AT = 30;
export const FINAL_RUSH_MUL = 2;

// Tray capacity by player level (real, implemented unlocks)
export function trayCapacity(level: number): number {
  return level >= 6 ? 3 : level >= 3 ? 2 : 1;
}

// Star thresholds for the end-of-shift rating.
// Calibrated against a perfect-play bot (~$9,900): 3★ demands sustained combos,
// 2★ rewards a clean but unhurried shift.
export const STAR_2 = 2600;
export const STAR_3 = 5200;

export function fmtScore(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
