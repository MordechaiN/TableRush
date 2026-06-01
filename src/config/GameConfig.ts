export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 854;

export const COLORS = {
  BG_DARK: 0x1a1a2e,
  BG_MID: 0x16213e,
  ACCENT: 0xe94560,
  ACCENT2: 0xf5a623,
  GREEN: 0x2ecc71,
  BLUE: 0x3498db,
  PURPLE: 0x9b59b6,
  WHITE: 0xffffff,
  GRAY: 0x7f8c8d,
  DARK_GRAY: 0x2c3e50,
  TABLE_FILL: 0x2c3e50,
  TABLE_STROKE: 0x3498db,
  FLOOR: 0x1e2d40,
  TEXT_LIGHT: '#ffffff',
  TEXT_DIM: '#95a5a6',
  TEXT_ACCENT: '#e94560',
  TEXT_GOLD: '#f5a623',
};

export const CUSTOMER_COLORS = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6, 0x1abc9c, 0xe67e22];

export const MENU_ITEMS = [
  { id: 0, name: 'Burger', emoji: '🍔', price: 12, cookTime: 3000, color: 0xf39c12 },
  { id: 1, name: 'Pizza',  emoji: '🍕', price: 15, cookTime: 4000, color: 0xe74c3c },
  { id: 2, name: 'Salad',  emoji: '🥗', price: 10, cookTime: 2000, color: 0x2ecc71 },
  { id: 3, name: 'Pasta',  emoji: '🍝', price: 13, cookTime: 3500, color: 0xf5a623 },
  { id: 4, name: 'Sushi',  emoji: '🍣', price: 18, cookTime: 2500, color: 0x3498db },
];

export const DIFFICULTY = {
  INITIAL_SPAWN_INTERVAL: 6000,
  MIN_SPAWN_INTERVAL: 2500,
  SPAWN_RAMP_RATE: 0.97,
  INITIAL_PATIENCE: 25000,
  MIN_PATIENCE: 10000,
  PATIENCE_RAMP_RATE: 0.98,
  SCORE_MULTIPLIER_INCREMENT: 0.1,
};
