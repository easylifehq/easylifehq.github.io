import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { gameDemoStats } from "@/features/easygames/demo/gameDemoFixtures";
import { toSafeFirebaseMessage } from "@/lib/firebase/errors";
import { GAME_STATS_SCHEMA_VERSION, recordGameSession, subscribeToGameStats, type GameId, type GameStatRecord } from "@/lib/firestore/gameStats";

type EasyGamesContextValue = {
  stats: GameStatRecord[];
  isLoading: boolean;
  error: string;
  userKey: string;
  finishSession: (gameId: GameId, score: number) => Promise<void>;
};

const EasyGamesContext = createContext<EasyGamesContextValue | undefined>(undefined);

export function EasyGamesProvider({ children }: { children: ReactNode }) {
  const { user, isDemoMode } = useAuth();
  const [stats, setStats] = useState<GameStatRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isDemoMode) {
      setStats(gameDemoStats);
      setIsLoading(false);
      setError("");
      return;
    }
    if (!user) {
      setStats([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    return subscribeToGameStats(user.uid, (records) => {
      setStats(records);
      setIsLoading(false);
      setError("");
    }, (nextError) => {
      setError(toSafeFirebaseMessage(nextError));
      setIsLoading(false);
    });
  }, [isDemoMode, user]);

  const finishSession = useCallback(async (gameId: GameId, score: number) => {
    const safeScore = Math.max(0, Math.round(score));
    if (isDemoMode) {
      setStats((current) => {
        const existing = current.find((record) => record.id === gameId);
        const now = new Date();
        const next: GameStatRecord = existing
          ? { ...existing, sessionsPlayed: existing.sessionsPlayed + 1, bestScore: Math.max(existing.bestScore, safeScore), totalScore: existing.totalScore + safeScore, lastPlayedAt: now, updatedAt: now }
          : { id: gameId, ownerId: "local-preview", schemaVersion: GAME_STATS_SCHEMA_VERSION, sessionsPlayed: 1, bestScore: safeScore, totalScore: safeScore, lastPlayedAt: now, createdAt: now, updatedAt: now };
        return [...current.filter((record) => record.id !== gameId), next];
      });
      return;
    }
    if (!user) return;
    await recordGameSession(user.uid, gameId, safeScore);
  }, [isDemoMode, user]);

  const value = useMemo(() => ({ stats, isLoading, error, userKey: user?.uid || "guest", finishSession }), [error, finishSession, isLoading, stats, user]);
  return <EasyGamesContext.Provider value={value}>{children}</EasyGamesContext.Provider>;
}

export function useEasyGames() {
  const context = useContext(EasyGamesContext);
  if (!context) throw new Error("useEasyGames must be used inside EasyGamesProvider");
  return context;
}
