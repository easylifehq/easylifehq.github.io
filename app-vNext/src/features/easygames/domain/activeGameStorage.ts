import type { GameDifficulty, GameMode } from "@/features/easygames/domain/gameContracts";

const ACTIVE_GAME_PREFIX = "easylife:easygames:active:v2";
export type GameSlot = { gameId: string; mode: GameMode; difficulty: GameDifficulty; dateKey: string | null; };

export function activeGameKey(userKey: string, slot: GameSlot) { return `${ACTIVE_GAME_PREFIX}:${encodeURIComponent(userKey)}:${slot.gameId}:${slot.mode}:${slot.difficulty}:${slot.mode === "daily" ? slot.dateKey || "invalid" : "free"}`; }
export function saveActiveGame(storage: Pick<Storage, "setItem">, userKey: string, slot: GameSlot, state: unknown) { try { storage.setItem(activeGameKey(userKey, slot), JSON.stringify(state)); return true; } catch { return false; } }
export function loadActiveGame<T>(storage: Pick<Storage, "getItem">, userKey: string, slot: GameSlot, guard: (value: unknown) => value is T): T | null { try { const serialized = storage.getItem(activeGameKey(userKey, slot)); if (!serialized) return null; const value: unknown = JSON.parse(serialized); return guard(value) ? value : null; } catch { return null; } }
export function clearActiveGame(storage: Pick<Storage, "removeItem">, userKey: string, slot: GameSlot) { try { storage.removeItem(activeGameKey(userKey, slot)); } catch { /* active recovery is best effort */ } }
export function hasMeaningfulProgress(state: { revision: number; status: string; }) { return state.revision > 0 && !["won", "lost"].includes(state.status); }
export function shouldAcceptRemoteGame(current: { revision: number; updatedAt: string; }, incoming: { revision: number; updatedAt: string; }) { return incoming.revision > current.revision || (incoming.revision === current.revision && incoming.updatedAt > current.updatedAt); }
