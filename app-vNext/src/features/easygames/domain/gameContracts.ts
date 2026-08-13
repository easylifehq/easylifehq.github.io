import type { GameId } from "@/lib/firestore/gameStats";

export const gameDifficulties = ["easy", "standard", "hard"] as const;
export const gameModes = ["free", "daily"] as const;
export type GameDifficulty = (typeof gameDifficulties)[number];
export type GameMode = (typeof gameModes)[number];

export const difficultyLabels: Record<GameDifficulty, string> = { easy: "Easy", standard: "Standard", hard: "Hard" };
export const modeLabels: Record<GameMode, string> = { free: "Free play", daily: "Daily" };
export const EASYGAMES_GENERATOR_VERSION = "easygames-generator-v2";

export function utcDateKey(now = new Date()) { return now.toISOString().slice(0, 10); }

export function stableGameSeed(value: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) { hash ^= value.charCodeAt(index); hash = Math.imul(hash, 0x01000193) >>> 0; }
  return hash || 1;
}

export function dailyChallenge(gameId: GameId, difficulty: GameDifficulty, now = new Date()) {
  const dateKey = utcDateKey(now);
  const challengeKey = `${gameId}:${difficulty}:${EASYGAMES_GENERATOR_VERSION}:${dateKey}`;
  return { dateKey, challengeKey, seed: stableGameSeed(challengeKey) };
}

export function createGameSessionId(gameId: GameId, mode: GameMode, difficulty: GameDifficulty, seed: number, random = Math.random()) {
  return `${gameId}-${mode}-${difficulty}-${seed.toString(36)}-${Date.now().toString(36)}-${Math.floor(random * 0x100000).toString(36)}`.slice(0, 180);
}
