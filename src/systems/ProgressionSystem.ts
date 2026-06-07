const XP_THRESHOLDS = [0, 300, 700, 1300, 2200, 3500, 5500, 8000, 11000, 15000];
const MAX_LEVEL = XP_THRESHOLDS.length - 1;

const UNLOCK_HINTS = [
  'Complete rounds to earn XP and reach Level 2!',
  'Level 2 — building momentum. Chain 3 serves to ignite your combo meter!',
  'Level 3 — TRAY UPGRADE: carry 3 items at once.',
  'Level 4 — SPEED BOOST: you move 15% faster every shift.',
  'Level 5 — TRAY UPGRADE: carry 4 items at once.',
  'Level 6 — COMBO SHIELD: your first combo break drops to ×2, not ×1.',
  'Level 7 — RUSH BONUS: rush hour earns +40% on every serve.',
  'Level 8 — MASTER TIMING: near-miss saves now award a +300 bonus.',
  'Level 9 — every second with a full tray and active combo is peak efficiency.',
  'Level 10 — TABLE MASTER. The restaurant is yours.',
];

const ABILITY_AT_LEVEL: Record<number, string> = {
  3: 'TRAY UPGRADE — carry 3 items',
  4: 'SPEED BOOST — 15% faster walks',
  5: 'TRAY UPGRADE — carry 4 items',
  6: 'COMBO SHIELD — breaks fall to ×2, not ×1',
  7: 'RUSH BONUS — rush hour earns +40%',
  8: 'MASTER TIMING — near-miss saves +300 bonus',
};

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
      };
    }
  } catch { /* ignore */ }
  return { xp: 0, level: 1, highScore: 0, bestStars: 0, totalRounds: 0, lastScore: 0, bestCombo: 0, dailyDate: '', dailyGoalDone: false };
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
}

export class ProgressionSystem {
  static addRound(result: RoundResult): RoundSummary {
    const data = load();
    const xpEarned = Math.floor(result.score / 10);
    const levelBefore = data.level;
    const xpBefore = data.xp;

    data.xp += xpEarned;
    data.totalRounds += 1;

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
    };
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
