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
  return {
    focusGroups: normalizeEnumList(value.focusGroups, WORKOUT_FOCUS_GROUPS, 4),
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
