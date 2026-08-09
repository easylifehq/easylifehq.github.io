import { GAME_STATS_SCHEMA_VERSION, type GameStatRecord } from "@/lib/firestore/gameStats";

export const gameDemoStats: GameStatRecord[] = [
  { id: "pair-garden", ownerId: "local-preview", schemaVersion: GAME_STATS_SCHEMA_VERSION, sessionsPlayed: 4, bestScore: 835, totalScore: 2910, lastPlayedAt: new Date("2026-08-08T18:00:00Z"), createdAt: new Date("2026-08-06T18:00:00Z"), updatedAt: new Date("2026-08-08T18:00:00Z") },
  { id: "trail-scout", ownerId: "local-preview", schemaVersion: GAME_STATS_SCHEMA_VERSION, sessionsPlayed: 3, bestScore: 1210, totalScore: 3020, lastPlayedAt: new Date("2026-08-07T21:00:00Z"), createdAt: new Date("2026-08-05T21:00:00Z"), updatedAt: new Date("2026-08-07T21:00:00Z") },
];
