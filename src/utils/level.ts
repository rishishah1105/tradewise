export const XP_PER_LEVEL = 300;

export interface LevelInfo {
  level: number;          // 1-based
  xpIntoLevel: number;    // XP earned inside the current level
  xpForLevel: number;     // always XP_PER_LEVEL
  xpToNext: number;       // XP still needed to reach next level
  nextLevel: number;
  progressPercent: number; // 0-100, integer
  totalXp: number;
}

export function getLevelInfo(xp: number): LevelInfo {
  const totalXp = Math.max(0, Math.floor(Number.isFinite(xp) ? xp : 0));
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = totalXp - (level - 1) * XP_PER_LEVEL;
  return {
    level,
    xpIntoLevel,
    xpForLevel: XP_PER_LEVEL,
    xpToNext: XP_PER_LEVEL - xpIntoLevel,
    nextLevel: level + 1,
    progressPercent: Math.round((xpIntoLevel / XP_PER_LEVEL) * 100),
    totalXp,
  };
}
