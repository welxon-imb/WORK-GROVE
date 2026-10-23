/**
 * User Level, XP, Rank and Roman numeral tier calculations for WORK GROVE
 * When an account is created, users start at Tier V, progressing upward: V -> IV -> III -> II -> I.
 */

export interface UserRankInfo {
  rankName: string;
  tierRoman: string;
  badgeColor: string;
  nextXpThreshold: number;
  currentLevelXp: number;
  borderAnimationClass: string;
  glowColor: string;
}

export const RANKS = [
  { name: 'Bronze', minXp: 0, color: 'from-amber-700 to-amber-900 text-amber-100 border-amber-600', ring: 'ring-amber-500 shadow-[0_0_18px_rgba(217,119,6,0.6)]', glow: '#d97706' },
  { name: 'Silver', minXp: 100, color: 'from-slate-400 to-slate-600 text-white border-slate-300', ring: 'ring-slate-300 shadow-[0_0_20px_rgba(203,213,225,0.7)]', glow: '#94a3b8' },
  { name: 'Gold', minXp: 300, color: 'from-yellow-500 to-amber-600 text-white border-yellow-300', ring: 'ring-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.8)]', glow: '#eab308' },
  { name: 'Premium', minXp: 600, color: 'from-blue-600 to-indigo-700 text-white border-blue-400', ring: 'ring-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.8)]', glow: '#6366f1' },
  { name: 'Master', minXp: 1000, color: 'from-purple-600 to-violet-800 text-white border-purple-400', ring: 'ring-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.9)]', glow: '#a855f7' },
  { name: 'Super Master', minXp: 1500, color: 'from-rose-600 via-pink-600 to-amber-500 text-white border-rose-300', ring: 'ring-rose-500 shadow-[0_0_35px_rgba(244,63,94,1.0)]', glow: '#f43f5e' },
];

// Starts at V on new account creation, then climbs up to I!
export const ROMAN_TIERS = ['V', 'IV', 'III', 'II', 'I'];

export function calculateUserRank(xp: number = 0): UserRankInfo {
  let matchedRank = RANKS[0];
  let rankIndex = 0;

  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXp) {
      matchedRank = RANKS[i];
      rankIndex = i;
      break;
    }
  }

  // Determine Roman Numeral Sub-Tier (V to I) within the current rank bracket
  const nextRankMin = RANKS[rankIndex + 1] ? RANKS[rankIndex + 1].minXp : matchedRank.minXp + 500;
  const bracketSpan = Math.max(1, nextRankMin - matchedRank.minXp);
  const progressInBracket = Math.max(0, xp - matchedRank.minXp);
  const tierIndex = Math.min(4, Math.floor((progressInBracket / bracketSpan) * 5));

  return {
    rankName: matchedRank.name,
    tierRoman: ROMAN_TIERS[tierIndex],
    badgeColor: matchedRank.color,
    nextXpThreshold: nextRankMin,
    currentLevelXp: xp,
    borderAnimationClass: matchedRank.ring,
    glowColor: matchedRank.glow
  };
}
