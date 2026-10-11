export const WORKOUT_FOCUS_GROUPS = [
  "Back",
  "Biceps",
  "Chest",
  "Shoulders",
  "Triceps",
  "Legs",
  "Hamstrings",
  "Glutes",
  "Core",
  "Conditioning",
] as const;

export const WORKOUT_MOVEMENT_PATTERNS = [
  "vertical-pull",
  "horizontal-pull",
  "elbow-flexion-supinated",
  "elbow-flexion-neutral",
  "horizontal-push",
  "vertical-push",
  "squat",
  "hinge",
  "knee-dominant",
  "hip-extension",
  "elbow-extension",
  "shoulder-abduction",
  "trunk",
  "conditioning",
] as const;

export const WORKOUT_EQUIPMENT_KINDS = [
  "bodyweight",
  "pull-up-bar",
  "barbell",
  "dumbbell",
  "bench",
  "cable",
  "selectorized-machine",
  "plate-loaded-machine",
  "cardio-machine",
] as const;

export type WorkoutFocusGroup = (typeof WORKOUT_FOCUS_GROUPS)[number];
export type WorkoutMovementPattern = (typeof WORKOUT_MOVEMENT_PATTERNS)[number];
export type WorkoutEquipmentKind = (typeof WORKOUT_EQUIPMENT_KINDS)[number];

export type WorkoutExercisePlanningMetadata = {
  focusGroups: WorkoutFocusGroup[];
  movementPattern: WorkoutMovementPattern;
  requiredEquipment: WorkoutEquipmentKind[];
};

export type WorkoutPlanningContext = {
  focusPreset?: WorkoutFocusPreset | "Custom";
  avoidedExerciseKeys?: string[];
  recoveryDays?: number;
  equipmentMode?: "full-gym" | "limited";
  remainingBudget?: { kind: "time" | "sets"; amount: number };
  focusGroups: WorkoutFocusGroup[];
  availableEquipment: WorkoutEquipmentKind[];
  plannedDurationMinutes: number | null;
};

export const emptyWorkoutPlanningContext = (): WorkoutPlanningContext => ({
  focusGroups: [],
  availableEquipment: [],
  plannedDurationMinutes: null,
});

export function parseWorkoutPlanningDurationInput(value: string) {
  if (!/^\d+$/.test(value)) return null;
  const duration = Number(value);
  return Number.isInteger(duration) && duration >= 5 && duration <= 360 ? duration : null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

function normalizeEnumList<const Values extends readonly string[]>(value: unknown, allowed: Values, maximum: number) {
  if (!Array.isArray(value)) return [] as Values[number][];
  const canonical = new Map(allowed.map((entry) => [entry.toLocaleLowerCase(), entry]));
  const result: Values[number][] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const match = canonical.get(item.trim().toLocaleLowerCase());
    if (!match || result.includes(match)) continue;
    result.push(match);
    if (result.length >= maximum) break;
  }
  return result;
}

export function normalizeWorkoutPlanningContext(value: unknown): WorkoutPlanningContext {
  if (!isRecord(value)) return emptyWorkoutPlanningContext();
  const duration = Number(value.plannedDurationMinutes);
  const budget = isRecord(value.remainingBudget) ? value.remainingBudget : {};
  const amount = Number(budget.amount);
  const validBudget = Number.isInteger(amount) && (budget.kind === "time" ? amount >= 5 && amount <= 360 : budget.kind === "sets" && amount >= 1 && amount <= 80);
  return {
    ...(typeof value.focusPreset === "string" && (WORKOUT_FOCUS_PRESETS.includes(value.focusPreset as WorkoutFocusPreset) || value.focusPreset === "Custom") ? { focusPreset: value.focusPreset as WorkoutFocusPreset | "Custom" } : {}),
    ...(Array.isArray(value.avoidedExerciseKeys) ? { avoidedExerciseKeys: [...new Set(value.avoidedExerciseKeys.filter((key): key is string => typeof key === "string" && key.length > 0 && key.length <= 240))].slice(0, 80) } : {}),
    ...(Number.isInteger(value.recoveryDays) && Number(value.recoveryDays) >= 0 && Number(value.recoveryDays) <= 7 ? { recoveryDays: Number(value.recoveryDays) } : {}),
    ...(value.equipmentMode === "full-gym" || value.equipmentMode === "limited" ? { equipmentMode: value.equipmentMode } : {}),
    ...(validBudget ? { remainingBudget: { kind: budget.kind as "time" | "sets", amount } } : {}),
    focusGroups: normalizeEnumList(value.focusGroups, WORKOUT_FOCUS_GROUPS, 5),
    availableEquipment: normalizeEnumList(value.availableEquipment, WORKOUT_EQUIPMENT_KINDS, WORKOUT_EQUIPMENT_KINDS.length),
    plannedDurationMinutes: Number.isInteger(duration) && duration >= 5 && duration <= 360 ? duration : null,
  };
}

export function normalizeWorkoutExercisePlanningMetadata(value: unknown): WorkoutExercisePlanningMetadata | null {
  if (!isRecord(value)) return null;
  const focusGroups = normalizeEnumList(value.focusGroups, WORKOUT_FOCUS_GROUPS, 4);
  const rawMovementPattern = typeof value.movementPattern === "string" ? value.movementPattern : "";
  const movementPattern = rawMovementPattern
    ? WORKOUT_MOVEMENT_PATTERNS.find((entry) => entry === rawMovementPattern.trim().toLocaleLowerCase())
    : undefined;
  const requiredEquipment = normalizeEnumList(value.requiredEquipment, WORKOUT_EQUIPMENT_KINDS, WORKOUT_EQUIPMENT_KINDS.length);
  if (!focusGroups.length || !movementPattern || !requiredEquipment.length) return null;
  return { focusGroups, movementPattern, requiredEquipment };
}

export function workoutPlanningMetadataKey(value: WorkoutExercisePlanningMetadata) {
  return JSON.stringify({
    focusGroups: [...value.focusGroups].sort(),
    movementPattern: value.movementPattern,
    requiredEquipment: [...value.requiredEquipment].sort(),
  });
}


export const WORKOUT_FOCUS_PRESETS = ["Any", "Push", "Pull", "Legs", "Cardio"] as const;
export type WorkoutFocusPreset = typeof WORKOUT_FOCUS_PRESETS[number];
const presetGroups: Record<WorkoutFocusPreset, WorkoutFocusGroup[]> = {
  Any: [], Push: ["Chest", "Shoulders", "Triceps"], Pull: ["Back", "Biceps"],
  Legs: ["Legs", "Hamstrings", "Glutes"], Cardio: ["Conditioning"],
};
export function focusGroupsForPreset(preset: WorkoutFocusPreset, supplementalAbs = false): WorkoutFocusGroup[] {
  return [...presetGroups[preset], ...(supplementalAbs ? ["Core" as const] : [])];
}
export function focusPresetForGroups(groups: WorkoutFocusGroup[]): WorkoutFocusPreset | "Custom" {
  const hasStrength = groups.some(group => group !== "Core" && group !== "Conditioning");
  const main: WorkoutFocusGroup[] = groups.filter(group => group !== "Core" && (!hasStrength || group !== "Conditioning"));
  return WORKOUT_FOCUS_PRESETS.find(preset => presetGroups[preset].length === main.length && presetGroups[preset].every(group => main.includes(group))) || "Custom";
}
export function defaultWorkoutPlanningContext(): WorkoutPlanningContext {
  return { ...emptyWorkoutPlanningContext(), focusPreset: "Any", equipmentMode: "full-gym", availableEquipment: [...WORKOUT_EQUIPMENT_KINDS] };
}
