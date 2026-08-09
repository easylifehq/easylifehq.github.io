export const TRAIL_SCOUT_VERSION = 1;
export const TRAIL_SIZE = 5;

type TrailBoard = { rocks: number[]; goals: number[] };
const trailBoards: TrailBoard[] = [
  { rocks: [6, 8, 16, 18], goals: [4, 20, 24] },
  { rocks: [2, 7, 11, 17], goals: [9, 20, 24] },
  { rocks: [5, 8, 13, 16], goals: [4, 19, 22] },
];

export type TrailDirection = "up" | "right" | "down" | "left";
export type TrailScoutState = {
  version: typeof TRAIL_SCOUT_VERSION;
  seed: number;
  sessionKey: string;
  rocks: number[];
  goals: number[];
  player: number;
  movesRemaining: number;
  collected: number;
  status: "playing" | "paused" | "won" | "lost";
  submitted: boolean;
};

export function createTrailScout(seed = Date.now()): TrailScoutState {
  const board = trailBoards[Math.abs(Math.round(seed)) % trailBoards.length];
  return {
    version: TRAIL_SCOUT_VERSION,
    seed,
    sessionKey: `trail-${seed}`,
    rocks: [...board.rocks],
    goals: [...board.goals],
    player: 0,
    movesRemaining: 28,
    collected: 0,
    status: "playing",
    submitted: false,
  };
}

export function moveTrailScout(state: TrailScoutState, direction: TrailDirection): TrailScoutState {
  if (state.status !== "playing") return state;
  const row = Math.floor(state.player / TRAIL_SIZE);
  const column = state.player % TRAIL_SIZE;
  const delta = direction === "up" ? [-1, 0] : direction === "right" ? [0, 1] : direction === "down" ? [1, 0] : [0, -1];
  const nextRow = row + delta[0];
  const nextColumn = column + delta[1];
  if (nextRow < 0 || nextRow >= TRAIL_SIZE || nextColumn < 0 || nextColumn >= TRAIL_SIZE) return state;
  const player = nextRow * TRAIL_SIZE + nextColumn;
  if (state.rocks.includes(player)) return state;
  const foundGoal = state.goals.includes(player);
  const goals = foundGoal ? state.goals.filter((goal) => goal !== player) : state.goals;
  const movesRemaining = state.movesRemaining - 1;
  return {
    ...state,
    player,
    goals,
    collected: state.collected + (foundGoal ? 1 : 0),
    movesRemaining,
    status: goals.length === 0 ? "won" : movesRemaining <= 0 ? "lost" : "playing",
  };
}

export function trailScoutScore(state: TrailScoutState) {
  return state.collected * 250 + (state.status === "won" ? state.movesRemaining * 20 + 250 : 0);
}

export function isTrailScoutState(value: unknown): value is TrailScoutState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<TrailScoutState>;
  return state.version === TRAIL_SCOUT_VERSION && Array.isArray(state.rocks) && Array.isArray(state.goals) && Number.isInteger(state.player) && Number.isInteger(state.movesRemaining) && ["playing", "paused", "won", "lost"].includes(state.status || "");
}
