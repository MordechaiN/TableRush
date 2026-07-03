// ── Table Rush · balance & content configuration ─────────────────────────────
// Every tunable number in the game lives here.

export const MAX_TABLES = 5;
export const QUEUE_SLOTS = 4;     // guests waiting at the door
export const HANDS_CAPACITY = 2;  // plates the waiter can carry at once

// Kitchen
export const BURNERS = 3;      // simultaneous cooking slots
export const SHELF_SLOTS = 3;  // "ORDER UP" pass slots

export interface MenuItem {
  id: number; name: string; emoji: string;
  price: number;        // base coins (tip = price × 5 × hearts fraction)
  cookTime: number;     // seconds on the stove
}
// Order matters: buildDish(i) in builders.ts maps to these indices.
export const MENU_ITEMS: MenuItem[] = [
  { id: 0, name: 'Salad',  emoji: '🥗', price: 10, cookTime: 3.0 },
  { id: 1, name: 'Burger', emoji: '🍔', price: 12, cookTime: 4.2 },
  { id: 2, name: 'Pasta',  emoji: '🍝', price: 14, cookTime: 5.0 },
  { id: 3, name: 'Sushi',  emoji: '🍣', price: 19, cookTime: 4.6 },
  { id: 4, name: 'Pizza',  emoji: '🍕', price: 16, cookTime: 5.8 },
  { id: 5, name: 'Cake',   emoji: '🍰', price: 24, cookTime: 6.4 },
];

export type Accessory = 'none' | 'glasses' | 'sunglasses' | 'cap' | 'flower' | 'bow';
export interface Archetype {
  name: string; outfit: number; hair: number; accessory: Accessory;
  speed: number;        // walk-speed multiplier
  patienceMul: number;  // hearts drain slower (>1) or faster (<1)
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

// ── Levels — Diner-Dash structure: a level is a fixed guest list and a score
// goal, not a timer. Win by reaching `goal`; `expert` is the 3-star line.
export interface LevelDef {
  id: number;
  customers: number;          // guests that arrive over the level
  spawnMin: number; spawnMax: number;
  heartsSeconds: number;      // seconds for a full 5-heart drain while waiting
  eatTime: number;            // seconds a guest spends eating
  goal: number; expert: number;
  dishes: number[];           // menu ids in play this level
  vip: boolean;               // gold-crown big tippers appear
  critic: boolean;            // the food critic may visit
}
export const LEVELS: LevelDef[] = [
  { id: 1, customers: 8,  spawnMin: 6.0, spawnMax: 8.5, heartsSeconds: 60, eatTime: 3.2, goal: 500,  expert: 1000, dishes: [0, 1],          vip: false, critic: false },
  { id: 2, customers: 12, spawnMin: 5.0, spawnMax: 7.5, heartsSeconds: 52, eatTime: 3.0, goal: 950,  expert: 1700, dishes: [0, 1, 2],       vip: false, critic: false },
  { id: 3, customers: 16, spawnMin: 4.2, spawnMax: 6.5, heartsSeconds: 46, eatTime: 2.8, goal: 1500, expert: 2600, dishes: [0, 1, 2, 4],    vip: true,  critic: false },
  { id: 4, customers: 20, spawnMin: 3.6, spawnMax: 5.6, heartsSeconds: 40, eatTime: 2.6, goal: 2200, expert: 3600, dishes: [0, 1, 2, 3, 4], vip: true,  critic: false },
  { id: 5, customers: 24, spawnMin: 3.0, spawnMax: 4.8, heartsSeconds: 35, eatTime: 2.4, goal: 3000, expert: 4800, dishes: [0, 1, 2, 3, 4, 5], vip: true, critic: true },
];

// Hearts decay multipliers per waiting phase (1 = the level's base rate)
export const DECAY_QUEUE = 1.0;    // standing in line
export const DECAY_HANDUP = 1.1;   // hand raised, waiting for the order to be taken
export const DECAY_COOKING = 0.45; // order placed, food on the stove
export const DECAY_COLD = 1.5;     // plate sits ready on the pass
export const DECAY_CHECK = 1.0;    // waiting for the bill
export const DECIDE_SECONDS = 2.2; // menu-reading pause before the hand goes up

// Action points (Diner-Dash style: every completed command scores)
export const POINTS = { seat: 10, order: 10, deliver: 20, clean: 10 };
export const DOUBLE_HANDS_BONUS = 15;  // delivering with both hands full, per plate
export const CHAIN_BONUS = 15;         // ×(n−1) for consecutive identical actions
export const MIN_TIP_FRAC = 0.3;       // tip floor at zero hearts left

// VIP guests — gold crown, big tip, short fuse
export const VIP_CHANCE = 0.14;
export const VIP_PAY = 2.5;
export const VIP_PATIENCE = 0.75;

// Food critic — impress with ≥85% hearts at payment for a rave review
export const CRITIC_CHANCE = 0.3;   // rolled once per level (levels that allow it)
export const CRITIC_PAY = 3;
export const CRITIC_RAVE_HEARTS = 0.85;

// Upgrade shop — every level's score banks into a persistent wallet, spent on
// three tracks that really change the simulation (see ProgressionSystem.getBoosts).
export type UpgradeId = 'shoes' | 'stove' | 'decor';
export interface UpgradeTrack {
  id: UpgradeId; name: string; emoji: string; desc: string;
  effectPerTier: number; // multiplier step per tier
  costs: number[];       // cost of tier 1..N
}
export const UPGRADE_TRACKS: UpgradeTrack[] = [
  { id: 'shoes', name: 'Swift Shoes', emoji: '👟', desc: '+8% waiter speed per tier',   effectPerTier: 0.08, costs: [800, 2000, 4500, 8500, 14000] },
  { id: 'stove', name: 'Pro Stove',   emoji: '🔥', desc: '−8% cooking time per tier',   effectPerTier: 0.08, costs: [1000, 2400, 5000, 9000, 15000] },
  { id: 'decor', name: 'Cozy Décor',  emoji: '🪴', desc: '+8% guest patience per tier', effectPerTier: 0.08, costs: [900, 2200, 4800, 8800, 14500] },
];

export function fmtScore(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
