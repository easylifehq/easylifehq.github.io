export type WorkoutLoadMode = "total" | "per-hand";

export function normalizeWorkoutLoadMode(value: unknown): WorkoutLoadMode | undefined {
  return value === "total" || value === "per-hand" ? value : undefined;
}

// Absence means historically unspecified. Never infer or double an old load.
export function workoutLoadIdentitySuffix(mode?: WorkoutLoadMode) {
  return mode ? `|load:${mode}` : "";
}

export function workoutLoadLabel(mode?: WorkoutLoadMode) {
  return mode === "per-hand" ? "per hand" : mode === "total" ? "total" : "mode unspecified";
}

// Variants have distinct names so they remain distinct in saved history and search.
export const PEC_FLY_VARIANTS = [
  "Machine Pec Fly",
  "Cable Pec Fly (low to high)",
  "Cable Pec Fly (middle)",
  "Cable Pec Fly (high to low)",
] as const;
