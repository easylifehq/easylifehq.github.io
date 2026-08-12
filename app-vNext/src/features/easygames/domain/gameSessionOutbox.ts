import type { GameSessionDraft } from "@/lib/firestore/gameSessions";

const PREFIX = "easylife:easygames:outbox:v1";
function key(userKey: string) { return `${PREFIX}:${encodeURIComponent(userKey)}`; }
export function loadGameSessionOutbox(storage: Pick<Storage, "getItem">, userKey: string): GameSessionDraft[] { try { const value: unknown = JSON.parse(storage.getItem(key(userKey)) || "[]"); return Array.isArray(value) ? value.filter((item): item is GameSessionDraft => Boolean(item && typeof item === "object" && typeof (item as GameSessionDraft).sessionId === "string")) : []; } catch { return []; } }
export function queueGameSession(storage: Pick<Storage, "getItem" | "setItem">, userKey: string, draft: GameSessionDraft) { const records = loadGameSessionOutbox(storage, userKey); if (!records.some((record) => record.sessionId === draft.sessionId)) records.push(draft); try { storage.setItem(key(userKey), JSON.stringify(records)); return true; } catch { return false; } }
export function removeGameSessionFromOutbox(storage: Pick<Storage, "getItem" | "setItem">, userKey: string, sessionId: string) { const records = loadGameSessionOutbox(storage, userKey).filter((record) => record.sessionId !== sessionId); try { storage.setItem(key(userKey), JSON.stringify(records)); } catch { /* retry remains best effort */ } }
