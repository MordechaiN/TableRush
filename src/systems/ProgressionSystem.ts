import { UPGRADE_TRACKS, UpgradeId } from '../config/GameConfig';

const XP_THRESHOLDS = [0, 300, 700, 1300, 2200, 3500, 5500, 8000, 11000, 15000];
const MAX_LEVEL = XP_THRESHOLDS.length - 1;

// Every hint below describes a real, implemented unlock (see GameConfig +
// RestaurantGame): menu items gate on unlockLevel, tray capacity on
// trayCapacity(level), VIP spawns on VIP_UNLOCK_LEVEL.
const UNLOCK_HINTS = [
  'Reach Level 2 to add Sushi 🍣 to the menu!',
  'Reach Level 2 to add Sushi 🍣 to the menu!',
  'Reach Level 3 for a bigger tray — carry 2 plates at once.',
  'Reach Level 4 to add Cake 🍰 to the menu!',
  'Reach Level 5 to unlock VIP guests 👑 (tips ×2.5).',
  'Reach Level 6 for the full tray — carry 3 plates at once.',
  'Reach Level 7 — the FOOD CRITIC 🖋 starts visiting…',
  'Master rank ahead — chase your best score!',
  'Master rank ahead — chase your best score!',
  'Level 10 — TABLE MASTER. The restaurant is yours.',
];

const ABILITY_AT_LEVEL: Record<number, string> = {
  2: 'NEW DISH — Sushi 🍣 joins the menu',
  3: 'BIGGER TRAY — carry 2 plates at once',
  4: 'NEW DISH — Cake 🍰 joins the menu',
  5: 'VIP GUESTS — gold crowns tip ×2.5',
  6: 'FULL TRAY — carry 3 plates at once',
  7: 'FOOD CRITIC — impress them for a ×3 RAVE REVIEW',
};

export type Upgrades = { shoes: number; stove: number; decor: number };

interface ProgressData {
  xp: number;
  level: number;
  highScore: number;
  bestStars: number;
  totalRounds: number;
  lastScore: number;
  bestCombo: number;
  dailyDate: string;
  dailyGoalDone: boolean;
  coins: number;
  upgrades: Upgrades;
}

const STORAGE_KEY = 'tablerush_progress';

function load(): ProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<ProgressData>;
      return {
        xp: p.xp ?? 0,
        level: p.level ?? 1,
        highScore: p.highScore ?? 0,
        bestStars: p.bestStars ?? 0,
        totalRounds: p.totalRounds ?? 0,
        lastScore: p.lastScore ?? 0,
        bestCombo: p.bestCombo ?? 0,
        dailyDate: p.dailyDate ?? '',
        dailyGoalDone: p.dailyGoalDone ?? false,
        coins: p.coins ?? 0,
        upgrades: { shoes: p.upgrades?.shoes ?? 0, stove: p.upgrades?.stove ?? 0, decor: p.upgrades?.decor ?? 0 },
      };
    }
  } catch { /* ignore */ }
  return {
    xp: 0, level: 1, highScore: 0, bestStars: 0, totalRounds: 0, lastScore: 0, bestCombo: 0,
    dailyDate: '', dailyGoalDone: false, coins: 0, upgrades: { shoes: 0, stove: 0, decor: 0 },
  };
}

function save(data: ProgressData): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

export interface RoundResult {
  score: number;
  stars: number;
  customersHappy: number;
  customersAngry: number;
  comboRecord: number;
}

export interface RoundSummary {
  xpEarned: number;
  levelBefore: number;
  levelAfter: number;
  xpBefore: number;
  xpAfter: number;
  isNewHighScore: boolean;
  isNewBestStars: boolean;
  nextUnlockHint: string;
  unlockedAbility?: string;
  xpToNextLevel: number;
  thresholdForLevel: (level: number) => number;
  coinsEarned: number;
  coinsAfter: number;
}

export class ProgressionSystem {
  static addRound(result: RoundResult): RoundSummary {
    const data = load();
    const xpEarned = Math.floor(result.score / 10);
    const levelBefore = data.level;
    const xpBefore = data.xp;

    data.xp += xpEarned;
    data.totalRounds += 1;
    data.coins += result.score; // the shift's takings bank into the wallet

    while (data.level < MAX_LEVEL && data.xp >= XP_THRESHOLDS[data.level]) {
      data.level += 1;
    }

    const isNewHighScore = result.score > data.highScore;
    if (isNewHighScore) data.highScore = result.score;

    const isNewBestStars = result.stars > data.bestStars;
    if (isNewBestStars) data.bestStars = result.stars;

    save(data);

    const levelAfter = data.level;
    const nextLevel = Math.min(levelAfter, MAX_LEVEL);
    const nextUnlockHint = UNLOCK_HINTS[nextLevel] ?? UNLOCK_HINTS[MAX_LEVEL];
    const unlockedAbility = levelAfter > levelBefore ? ABILITY_AT_LEVEL[levelAfter] : undefined;
    const nextThreshold = XP_THRESHOLDS[levelAfter] ?? XP_THRESHOLDS[MAX_LEVEL];
    const xpToNextLevel = Math.max(0, nextThreshold - data.xp);

    return {
      xpEarned,
      levelBefore,
      levelAfter,
      xpBefore,
      xpAfter: data.xp,
      isNewHighScore,
      isNewBestStars,
      nextUnlockHint,
      unlockedAbility,
      xpToNextLevel,
      thresholdForLevel: (lvl: number) => XP_THRESHOLDS[lvl] ?? XP_THRESHOLDS[MAX_LEVEL],
      coinsEarned: result.score,
      coinsAfter: data.coins,
    };
  }

  static getUpgrades(): Upgrades {
    return load().upgrades;
  }

  /** Gameplay multipliers from purchased upgrades. */
  static getBoosts(): { speed: number; cook: number; patience: number } {
    const u = load().upgrades;
    const per = (id: UpgradeId) => UPGRADE_TRACKS.find(t => t.id === id)!.effectPerTier;
    return {
      speed: 1 + u.shoes * per('shoes'),
      cook: Math.max(0.5, 1 - u.stove * per('stove')),
      patience: 1 + u.decor * per('decor'),
    };
  }

  /** Attempt to buy the next tier of a track. Returns the new state on success. */
  static buyUpgrade(id: UpgradeId): { ok: boolean; tier: number; coins: number } {
    const data = load();
    const track = UPGRADE_TRACKS.find(t => t.id === id)!;
    const tier = data.upgrades[id];
    if (tier >= track.costs.length) return { ok: false, tier, coins: data.coins };
    const cost = track.costs[tier];
    if (data.coins < cost) return { ok: false, tier, coins: data.coins };
    data.coins -= cost;
    data.upgrades[id] = tier + 1;
    save(data);
    return { ok: true, tier: tier + 1, coins: data.coins };
  }

  static recordSession(score: number, combo: number): void {
    const data = load();
    data.lastScore = score;
    if (combo > data.bestCombo) data.bestCombo = combo;
    const today = new Date().toISOString().slice(0, 10);
    if (data.dailyDate !== today) {
      data.dailyDate = today;
      data.dailyGoalDone = false;
    }
    const target = Math.max(500, Math.floor((data.highScore || score) * 0.6));
    if (!data.dailyGoalDone && score >= target) data.dailyGoalDone = true;
    save(data);
  }

  static getDailyGoal(): { target: number; lastScore: number; done: boolean } {
    const data = load();
    const today = new Date().toISOString().slice(0, 10);
    const active = data.dailyDate === today;
    const target = Math.max(500, Math.floor((data.highScore || 0) * 0.6));
    return { target, lastScore: active ? data.lastScore : 0, done: active && data.dailyGoalDone };
  }

  static getData(): ProgressData {
    return load();
  }

  static resetHighScore(): void {
    const data = load();
    data.highScore = 0;
    data.bestStars = 0;
    save(data);
  }

  static resetAll(): void {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }

  static isTutorialDone(): boolean {
    return localStorage.getItem('tablerush_tutorial_done') === '1';
  }

  static markTutorialDone(): void {
    try { localStorage.setItem('tablerush_tutorial_done', '1'); } catch { /* ignore */ }
  }

  static exportSave(): string {
    return JSON.stringify({
      progress: load(),
      tutorialDone: ProgressionSystem.isTutorialDone(),
    });
  }

  static importSave(json: string): boolean {
    try {
      const parsed = JSON.parse(json) as { progress?: ProgressData; tutorialDone?: boolean };
      if (parsed.progress) save(parsed.progress);
      if (parsed.tutorialDone) ProgressionSystem.markTutorialDone();
      return true;
    } catch {
      return false;
    }
  }
}
