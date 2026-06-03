export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 854;

export const COLORS = {
  // Floor / environment
  FLOOR_WARM:    0xF5E6C8,
  FLOOR_ALT:     0xEDD9A3,
  WALL:          0xFFF8F0,
  WALL_ACCENT:   0xC17B3A,

  // Table
  TABLE_BODY:    0x8B4513,
  TABLE_TOP:     0xA0522D,
  TABLE_CLOTH:   0xFDFAF6,
  CHAIR:         0x5C3317,

  // Characters
  WAITER_JACKET: 0x1A237E,
  WAITER_SHIRT:  0xFFFFFF,
  WAITER_SKIN:   0xFDA07A,

  // UI
  UI_ORANGE:     0xFF6B35,
  UI_GOLD:       0xFFD700,
  UI_GREEN:      0x4CAF50,
  UI_RED:        0xF44336,
  UI_BLUE:       0x2196F3,

  // Text
  TEXT_DARK:     '#2C1810',
  TEXT_LIGHT:    '#FFFFFF',
  TEXT_GOLD:     '#FFD700',
  TEXT_ORANGE:   '#FF6B35',
  TEXT_RED:      '#F44336',
  TEXT_GREEN:    '#4CAF50',

  // Legacy aliases used in older code paths
  WHITE:         0xFFFFFF,
  BG_DARK:       0xFFF8F0,
};

export const CUSTOMER_VARIANTS = [
  { outfit: 0xCC2244, hair: 0x2C1810, accessory: 'necklace', name: 'Elegant' },
  { outfit: 0x1A3A6B, hair: 0x6B3A1F, accessory: 'briefcase', name: 'Business' },
  { outfit: 0x2D7A2D, hair: 0xF5C842, accessory: 'none', name: 'Casual' },
  { outfit: 0xE06520, hair: 0x1A1A1A, accessory: 'sunglasses', name: 'Trendy' },
  { outfit: 0x7B3FA0, hair: 0x1A1A1A, accessory: 'flower', name: 'Romantic' },
  { outfit: 0x1A7A7A, hair: 0xAAAAAA, accessory: 'glasses', name: 'Elder' },
  { outfit: 0xC8B400, hair: 0xCC2222, accessory: 'cap', name: 'Teen' },
];

export const MENU_ITEMS = [
  { id: 0, name: 'Salad',  emoji: '🥗', price: 10, cookTime: 1500 },
  { id: 1, name: 'Burger', emoji: '🍔', price: 12, cookTime: 2500 },
  { id: 2, name: 'Pasta',  emoji: '🍝', price: 13, cookTime: 3000 },
  { id: 3, name: 'Sushi',  emoji: '🍣', price: 18, cookTime: 2000 },
  { id: 4, name: 'Pizza',  emoji: '🍕', price: 15, cookTime: 4000 },
];

// Time-based difficulty tiers (0–60s, 60–120s, 120–180s)
export const DIFFICULTY_TIERS = [
  { maxTime: 60,  patienceMin: 48000, patienceMax: 58000, spawnStart: 8000, spawnEnd: 7000, penalty: 50 },
  { maxTime: 120, patienceMin: 30000, patienceMax: 38000, spawnStart: 5500, spawnEnd: 4500, penalty: 100 },
  { maxTime: 180, patienceMin: 20000, patienceMax: 26000, spawnStart: 4000, spawnEnd: 3500, penalty: 150 },
];

// Combo milestones — five escalating stages
export const COMBO_MILESTONES = [
  { min: 0,  multiplier: 1.0, label: '' },
  { min: 3,  multiplier: 2.0, label: 'HOT STREAK 🔥' },
  { min: 6,  multiplier: 3.0, label: 'ON FIRE 🔥🔥' },
  { min: 10, multiplier: 4.0, label: '⭐ TABLE LEGEND' },
  { min: 15, multiplier: 5.0, label: '💫 TABLE MASTER' },
];

// Speed multiplier based on patience % remaining at delivery
export const SPEED_MULTIPLIERS = [
  { minPct: 0.75, multiplier: 2.0, label: '⚡⚡ LIGHTNING' },
  { minPct: 0.50, multiplier: 1.5, label: '⚡ FAST' },
  { minPct: 0.25, multiplier: 1.0, label: '' },
  { minPct: 0.00, multiplier: 0.75, label: '🐢 SLOW' },
];

export const GAME_DURATION = 180; // seconds
export const MAX_TABLES = 5;
export const CLEAN_TIME = 1500; // ms to clean a table
