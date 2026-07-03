import { UPGRADE_TRACKS, UpgradeId, LEVELS } from '../config/GameConfig';

// ── Persistent player progress: level unlocks, stars, wallet, upgrades ────────

export type Upgrades = { shoes: number; stove: number; decor: number };

interface ProgressData {
  levelReached: number;      // highest unlocked level (1-based)
  levelStars: number[];      // best stars per level, index = level id − 1
  highScore: number;
  totalRounds: number;
  lastScore: number;
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
        levelReached: Math.min(Math.max(p.levelReached ?? 1, 1), LEVELS.length),
        levelStars: Array.isArray(p.levelStars) ? p.levelStars.slice(0, LEVELS.length) : [],
        highScore: p.highScore ?? 0,
        totalRounds: p.totalRounds ?? 0,
        lastScore: p.lastScore ?? 0,
        dailyDate: p.dailyDate ?? '',
        dailyGoalDone: p.dailyGoalDone ?? false,
        coins: p.coins ?? 0,
        upgrades: { shoes: p.upgrades?.shoes ?? 0, stove: p.upgrades?.stove ?? 0, decor: p.upgrades?.decor ?? 0 },
      };
    }
  } catch { /* ignore */ }
  return {
    levelReached: 1, levelStars: [], highScore: 0, totalRounds: 0, lastScore: 0,
    dailyDate: '', dailyGoalDone: false, coins: 0, upgrades: { shoes: 0, stove: 0, decor: 0 },
  };
}

function save(data: ProgressData): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

export interface LevelOutcome {
  won: boolean;
  stars: number;             // 0–3
  coinsEarned: number;
  coinsAfter: number;
  unlockedNext: boolean;     // this win opened a new level
  isNewHighScore: boolean;
}

export class ProgressionSystem {
  /** Record a finished level. Score always banks into the wallet, win or lose. */
  static recordLevel(levelId: number, stars: number, score: number): LevelOutcome {
    const data = load();
    const won = stars >= 1;
    data.coins += score;
    data.totalRounds += 1;
    data.lastScore = score;
    const isNewHighScore = score > data.highScore;
    if (isNewHighScore) data.highScore = score;
    const prev = data.levelStars[levelId - 1] ?? 0;
    if (stars > prev) data.levelStars[levelId - 1] = stars;
    let unlockedNext = false;
    if (won && levelId >= data.levelReached && levelId < LEVELS.length) {
      data.levelReached = levelId + 1;
      unlockedNext = true;
    }
    // daily goal: beat 60% of your best at least once a day
    const today = new Date().toISOString().slice(0, 10);
    if (data.dailyDate !== today) { data.dailyDate = today; data.dailyGoalDone = false; }
    const target = Math.max(500, Math.floor(data.highScore * 0.6));
    if (!data.dailyGoalDone && score >= target) data.dailyGoalDone = true;
    save(data);
    return { won, stars, coinsEarned: score, coinsAfter: data.coins, unlockedNext, isNewHighScore };
  }

  static getDailyGoal(): { target: number; done: boolean } {
    const data = load();
    const today = new Date().toISOString().slice(0, 10);
    return {
      target: Math.max(500, Math.floor((data.highScore || 0) * 0.6)),
      done: data.dailyDate === today && data.dailyGoalDone,
    };
  }

  static getData(): ProgressData {
    return load();
  }

  static totalStars(): number {
    return load().levelStars.reduce((a, b) => a + (b || 0), 0);
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

  static resetAll(): void {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }

  static isTutorialDone(): boolean {
    return localStorage.getItem('tablerush_tutorial_done') === '1';
  }

  static markTutorialDone(): void {
    try { localStorage.setItem('tablerush_tutorial_done', '1'); } catch { /* ignore */ }
  }
}
