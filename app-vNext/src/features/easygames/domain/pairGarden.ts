export const PAIR_GARDEN_VERSION = 1;
export const pairSymbols = ["sun", "leaf", "drop", "moon", "spark", "stone"] as const;

export type PairGardenState = {
  version: typeof PAIR_GARDEN_VERSION;
  seed: number;
  sessionKey: string;
  deck: string[];
  revealed: number[];
  matched: number[];
  moves: number;
  status: "playing" | "paused" | "won";
  submitted: boolean;
};

function shuffled<T>(items: T[], seed: number) {
  const result = [...items];
  let value = Math.abs(Math.round(seed)) || 1;
  for (let index = result.length - 1; index > 0; index -= 1) {
    value = (value * 1664525 + 1013904223) % 4294967296;
    const target = value % (index + 1);
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export function createPairGarden(seed = Date.now()): PairGardenState {
  return {
    version: PAIR_GARDEN_VERSION,
    seed,
    sessionKey: `pair-${seed}`,
    deck: shuffled(pairSymbols.flatMap((symbol) => [symbol, symbol]), seed),
    revealed: [],
    matched: [],
    moves: 0,
    status: "playing",
    submitted: false,
  };
}

export function revealPairCard(state: PairGardenState, index: number): PairGardenState {
  if (state.status !== "playing" || state.revealed.length >= 2 || state.revealed.includes(index) || state.matched.includes(index) || index < 0 || index >= state.deck.length) return state;
  const revealed = [...state.revealed, index];
  return { ...state, revealed, moves: revealed.length === 2 ? state.moves + 1 : state.moves };
}

export function resolvePairCards(state: PairGardenState): PairGardenState {
  if (state.revealed.length !== 2) return state;
  const [left, right] = state.revealed;
  if (state.deck[left] !== state.deck[right]) return { ...state, revealed: [] };
  const matched = [...state.matched, left, right];
  return { ...state, revealed: [], matched, status: matched.length === state.deck.length ? "won" : state.status };
}

export function pairGardenScore(state: PairGardenState) {
  if (state.status !== "won") return 0;
  return Math.max(100, 1_000 - Math.max(0, state.moves - pairSymbols.length) * 55);
}

export function isPairGardenState(value: unknown): value is PairGardenState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<PairGardenState>;
  return state.version === PAIR_GARDEN_VERSION && Array.isArray(state.deck) && state.deck.length === 12 && Array.isArray(state.revealed) && Array.isArray(state.matched) && typeof state.moves === "number" && ["playing", "paused", "won"].includes(state.status || "");
}
