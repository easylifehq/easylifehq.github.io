import {
  collection,
  onSnapshot,
  type DocumentData,
  type QueryDocumentSnapshot,
  type QuerySnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export const GAME_STATS_SCHEMA_VERSION = "easygames-stats-v1";
export const gameIds = ["pair-garden", "trail-scout"] as const;
export type GameId = (typeof gameIds)[number];

export type GameStatRecord = {
  id: GameId;
  ownerId: string;
  schemaVersion: typeof GAME_STATS_SCHEMA_VERSION;
  sessionsPlayed: number;
  bestScore: number;
  totalScore: number;
  lastPlayedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

function toDate(value: unknown) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof (value as { toDate?: () => Date }).toDate === "function") return (value as { toDate: () => Date }).toDate();
  return null;
}

function normalizeGameStat(snapshot: QueryDocumentSnapshot<DocumentData>): GameStatRecord | null {
  const data = snapshot.data();
  if (!gameIds.includes(snapshot.id as GameId)) return null;
  return {
    id: snapshot.id as GameId,
    ownerId: typeof data.ownerId === "string" ? data.ownerId : "",
    schemaVersion: GAME_STATS_SCHEMA_VERSION,
    sessionsPlayed: Number.isInteger(data.sessionsPlayed) && data.sessionsPlayed >= 0 ? data.sessionsPlayed : 0,
    bestScore: Number.isInteger(data.bestScore) && data.bestScore >= 0 ? data.bestScore : 0,
    totalScore: Number.isInteger(data.totalScore) && data.totalScore >= 0 ? data.totalScore : 0,
    lastPlayedAt: toDate(data.lastPlayedAt),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export function subscribeToGameStats(
  userId: string,
  callback: (records: GameStatRecord[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    collection(db, "users", userId, "gameStats"),
    (snapshot: QuerySnapshot<DocumentData>) => callback(snapshot.docs.map(normalizeGameStat).filter((record): record is GameStatRecord => Boolean(record))),
    (error) => onError?.(error)
  );
}
