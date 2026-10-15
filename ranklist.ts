import { TeamEntry } from '../types';
import rawData from './officialRankList.json';

export const INITIAL_TEAMS: TeamEntry[] = (rawData as any[]).map((item, idx) => ({
  id: item.id || `team_${item.rank}_${idx}`,
  rank: Number(item.rank),
  college: String(item.college).trim(),
  teamName: item.teamName || `Team #${idx + 1}`,
  problemsSolved: item.problemsSolved ?? 1,
  isDiscarded: false,
}));

export const TOTAL_TEAMS_COUNT = INITIAL_TEAMS.length;
export const MAX_RANK = Math.max(...INITIAL_TEAMS.map(t => t.rank));
export const MIN_RANK = Math.min(...INITIAL_TEAMS.map(t => t.rank));

// Set of unique college names
export const UNIQUE_COLLEGES = Array.from(
  new Set(INITIAL_TEAMS.map(t => t.college))
).sort((a, b) => a.localeCompare(b));
