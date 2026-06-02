const XP_THRESHOLDS = [0, 300, 700, 1300, 2200, 3500, 5500, 8000, 11000, 15000];
const MAX_LEVEL = XP_THRESHOLDS.length - 1;

const UNLOCK_HINTS = [
  'Keep playing to level up!',
  'Level 2: New customer variant unlocked!',
  'Level 3: New menu item unlocked!',
  'Level 4: New restaurant theme unlocked!',
  'Level 5: Hard mode unlocked!',
  'Level 6: Expert customers unlocked!',
  'Level 7: Speed challenge unlocked!',
  'Level 8: VIP customers unlocked!',
  'Level 9: Master chef mode unlocked!',
  'Level 10: TABLE MASTER — you are legendary!',
];

interface ProgressData {
  xp: number;
  level: number;
  highScore: number;
  bestStars: number;
  totalRounds: number;
}

const STORAGE_KEY = 'tablerush_progress';

function load(): ProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ProgressData;
  } catch { /* ignore */ }
  return { xp: 0, level: 1, highScore: 0, bestStars: 0, totalRounds: 0 };
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

    // Level up
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

    return {
      xpEarned,
      levelBefore,
      levelAfter,
      xpBefore,
      xpAfter: data.xp,
      isNewHighScore,
      isNewBestStars,
      nextUnlockHint,
      thresholdForLevel: (lvl: number) => XP_THRESHOLDS[lvl] ?? XP_THRESHOLDS[MAX_LEVEL],
    };
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
}
