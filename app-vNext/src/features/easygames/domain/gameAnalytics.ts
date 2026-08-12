import type { GameSessionRecord } from "@/lib/firestore/gameSessions";
import type { GameDifficulty } from "@/features/easygames/domain/gameContracts";
import type { GameId } from "@/lib/firestore/gameStats";

function dateNumber(dateKey: string) { const [year, month, day] = dateKey.split("-").map(Number); return Date.UTC(year, month - 1, day) / 86_400_000; }

export function completionRuns(records: GameSessionRecord[]) {
  const days = [...new Set(records.filter((record) => record.completed && record.dateKey).map((record) => record.dateKey!))].sort();
  let longest = 0; let current = 0; let previous: number | null = null;
  for (const day of days) { const value = dateNumber(day); current = previous != null && value === previous + 1 ? current + 1 : 1; longest = Math.max(longest, current); previous = value; }
  return { active: current, longest, latestDate: days.length ? days[days.length - 1] : null };
}

export function deriveGameStats(records: GameSessionRecord[], gameId?: GameId, difficulty?: GameDifficulty) {
  const filtered = records.filter((record) => (!gameId || record.gameId === gameId) && (!difficulty || record.difficulty === difficulty));
  const completed = filtered.filter((record) => record.completed);
  return { sessions: filtered.length, completions: completed.length, completionRate: filtered.length ? completed.length / filtered.length : 0, bestScore: completed.reduce((best, record) => Math.max(best, record.score), 0), efficientMoves: completed.length ? Math.min(...completed.map((record) => record.moves)) : null, dailyParticipation: new Set(filtered.map((record) => record.dateKey).filter(Boolean)).size, dailyCompletions: new Set(completed.map((record) => record.dateKey).filter(Boolean)).size };
}

export type GameAchievement = { id: string; title: string; detail: string; earned: boolean; };
export function deriveGameAchievements(records: GameSessionRecord[]): GameAchievement[] {
  const completed = records.filter((record) => record.completed);
  const byDate = new Map<string, Set<GameId>>();
  for (const record of completed) if (record.dateKey) { const games = byDate.get(record.dateKey) || new Set<GameId>(); games.add(record.gameId); byDate.set(record.dateKey, games); }
  return [
    { id: "first-finish", title: "First finish", detail: "Complete either original game once.", earned: completed.length >= 1 },
    { id: "ten-sessions", title: "Ten calm sessions", detail: "Finish or close ten bounded sessions.", earned: records.length >= 10 },
    { id: "pair-efficient", title: "Careful gardener", detail: "Finish Pair Garden within two moves of the pair count.", earned: completed.some((record) => record.gameId === "pair-garden" && record.moves <= Number(record.pairs || 0) + 2) },
    { id: "trail-hard", title: "Hard trail", detail: "Complete Trail Scout on Hard.", earned: completed.some((record) => record.gameId === "trail-scout" && record.difficulty === "hard") },
    { id: "daily-duo", title: "Daily duo", detail: "Complete both daily games on one UTC date.", earned: [...byDate.values()].some((games) => games.size === 2) },
  ];
}
