import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { gameDemoStats } from "@/features/easygames/demo/gameDemoFixtures";
import { gameDemoSessions } from "@/features/easygames/demo/gameSessionDemoFixtures";
import { loadGameSessionOutbox, queueGameSession, removeGameSessionFromOutbox } from "@/features/easygames/domain/gameSessionOutbox";
import { toSafeFirebaseMessage } from "@/lib/firebase/errors";
import { subscribeToGameStats, type GameStatRecord } from "@/lib/firestore/gameStats";
import { GAME_SCORE_FORMULA_VERSION, GAME_SESSION_SCHEMA_VERSION, subscribeToGameSessions, syncGameSession, type GameSessionDraft, type GameSessionRecord } from "@/lib/firestore/gameSessions";

type EasyGamesContextValue = { stats: GameStatRecord[]; sessions: GameSessionRecord[]; isLoading: boolean; error: string; userKey: string; finishSession: (draft: GameSessionDraft) => Promise<void>; };
const EasyGamesContext = createContext<EasyGamesContextValue | undefined>(undefined);

function localRecord(draft: GameSessionDraft, ownerId: string): GameSessionRecord { return { id: draft.sessionId, ownerId, schemaVersion: GAME_SESSION_SCHEMA_VERSION, formulaVersion: GAME_SCORE_FORMULA_VERSION, gameId: draft.gameId, difficulty: draft.difficulty, mode: draft.mode, dateKey: draft.dateKey, challengeKey: draft.challengeKey, generatorVersion: draft.generatorVersion, seed: draft.seed, puzzleSpec: draft.puzzleSpec, completed: draft.completed, score: draft.score, moves: draft.moves, pairs: draft.pairs, goalsCollected: draft.goalsCollected, totalGoals: draft.totalGoals, movesRemaining: draft.movesRemaining, startedAt: new Date(draft.startedAt), completedAt: new Date(draft.completedAt), createdAt: new Date(draft.completedAt) }; }
function withPendingSessions(records: GameSessionRecord[], drafts: GameSessionDraft[], ownerId: string) {
  const syncedIds = new Set(records.map((record) => record.id));
  return [...drafts.filter((draft) => !syncedIds.has(draft.sessionId)).map((draft) => localRecord(draft, ownerId)), ...records]
    .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0) || b.id.localeCompare(a.id));
}

export function EasyGamesProvider({ children }: { children: ReactNode; }) {
  const { user, isDemoMode } = useAuth(); const [stats, setStats] = useState<GameStatRecord[]>([]); const [sessions, setSessions] = useState<GameSessionRecord[]>([]); const [loadingSources, setLoadingSources] = useState(0); const [error, setError] = useState("");
  const userKey = isDemoMode ? "local-preview" : user?.uid || "signed-out";

  const flushOutbox = useCallback(async () => { if (!user || isDemoMode) return; for (const draft of loadGameSessionOutbox(localStorage, user.uid)) { try { await syncGameSession(user.uid, draft); removeGameSessionFromOutbox(localStorage, user.uid, draft.sessionId); } catch (nextError) { setError(`Game result is safe on this device and will retry when online. ${toSafeFirebaseMessage(nextError)}`); break; } } }, [isDemoMode, user]);

  useEffect(() => {
    if (isDemoMode) { setStats(gameDemoStats); setSessions(gameDemoSessions); setLoadingSources(0); setError(""); return; }
    if (!user) { setStats([]); setSessions([]); setLoadingSources(0); setError(""); return; }
    let pending = 2; setLoadingSources(pending); setSessions(withPendingSessions([], loadGameSessionOutbox(localStorage, user.uid), user.uid)); const settle = () => { pending = Math.max(0, pending - 1); setLoadingSources(pending); }; const fail = (nextError: Error) => { setError(toSafeFirebaseMessage(nextError)); settle(); };
    const unsubscribers = [subscribeToGameStats(user.uid, (records) => { setStats(records); settle(); }, fail), subscribeToGameSessions(user.uid, (records) => { setSessions(withPendingSessions(records, loadGameSessionOutbox(localStorage, user.uid), user.uid)); settle(); }, fail)];
    void flushOutbox(); const handleOnline = () => void flushOutbox(); window.addEventListener("online", handleOnline); return () => { unsubscribers.forEach((unsubscribe) => unsubscribe()); window.removeEventListener("online", handleOnline); };
  }, [flushOutbox, isDemoMode, user]);

  const finishSession = useCallback(async (draft: GameSessionDraft) => {
    if (isDemoMode) { setSessions((current) => current.some((record) => record.id === draft.sessionId) ? current : [localRecord(draft, "local-preview"), ...current]); return; }
    if (!user) return;
    if (!queueGameSession(localStorage, user.uid, draft)) throw new Error("This browser could not save the completed result locally. Keep this tab open and try again.");
    setSessions((current) => current.some((record) => record.id === draft.sessionId) ? current : [localRecord(draft, user.uid), ...current]);
    void flushOutbox();
  }, [flushOutbox, isDemoMode, user]);

  const value = useMemo(() => ({ stats, sessions, isLoading: loadingSources > 0, error, userKey, finishSession }), [stats, sessions, loadingSources, error, userKey, finishSession]);
  return <EasyGamesContext.Provider value={value}>{children}</EasyGamesContext.Provider>;
}
export function useEasyGames() { const context = useContext(EasyGamesContext); if (!context) throw new Error("useEasyGames must be used inside EasyGamesProvider"); return context; }
