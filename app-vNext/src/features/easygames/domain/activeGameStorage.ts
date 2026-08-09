const ACTIVE_GAME_PREFIX = "easylife:easygames:active:v1";

function key(userKey: string, gameId: string) {
  return `${ACTIVE_GAME_PREFIX}:${userKey}:${gameId}`;
}

export function saveActiveGame(storage: Pick<Storage, "setItem">, userKey: string, gameId: string, state: unknown) {
  storage.setItem(key(userKey, gameId), JSON.stringify(state));
}

export function loadActiveGame<T>(storage: Pick<Storage, "getItem">, userKey: string, gameId: string, guard: (value: unknown) => value is T): T | null {
  try {
    const serialized = storage.getItem(key(userKey, gameId));
    if (!serialized) return null;
    const value: unknown = JSON.parse(serialized);
    return guard(value) ? value : null;
  } catch {
    return null;
  }
}

export function clearActiveGame(storage: Pick<Storage, "removeItem">, userKey: string, gameId: string) {
  storage.removeItem(key(userKey, gameId));
}
