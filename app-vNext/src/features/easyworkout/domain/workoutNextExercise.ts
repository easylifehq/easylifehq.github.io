import type { WorkoutExerciseLogDraft } from "./workoutDraftLifecycle.ts";
import {
  findExerciseHistory,
  workoutExerciseIdentityKey,
  type ExerciseHistorySummary,
  type WorkoutExerciseOption,
} from "./workoutLogAssist.ts";
import {
  WORKOUT_FOCUS_GROUPS,
  normalizeWorkoutPlanningContext,
  workoutPlanningMetadataKey,
  type WorkoutExercisePlanningMetadata,
  type WorkoutFocusGroup,
  type WorkoutMovementPattern,
  type WorkoutPlanningContext,
} from "./workoutPlanning.ts";
import { isValidWorkingSet } from "./workoutStatistics.ts";

const TRANSITION_MINUTES = 1;
const MINUTES_PER_SET = 2.5;
const SUPPORTED_TYPES = new Set(["weighted", "bodyweight", "assisted"]);

export type PlanningExerciseOption = WorkoutExerciseOption & {
  planningMetadata?: WorkoutExercisePlanningMetadata | null;
};

export type WorkoutNextExerciseSuggestion = WorkoutExerciseOption & {
  movementPattern: WorkoutMovementPattern;
  focusGroups: WorkoutFocusGroup[];
  requiredEquipment: WorkoutExercisePlanningMetadata["requiredEquipment"];
  proposedSets: number;
  estimatedMinutes: number;
  patternCompletedSets: number;
  focusCompletedSets: number;
  lastCompletedOn: string | null;
  confidence: "low" | "medium";
  reason: string;
};

export type WorkoutNextExerciseResult = {
  state: "ready" | "needs-context" | "unclassified-completed" | "no-fit" | "no-candidates";
  missingContext: Array<"focus" | "equipment" | "time">;
  suggestions: WorkoutNextExerciseSuggestion[];
  unclassifiedCompletedExercises: string[];
  remainingMinutes: number | null;
  coverage: {
    completedSetsByFocus: Partial<Record<WorkoutFocusGroup, number>>;
    completedSetsByPattern: Partial<Record<WorkoutMovementPattern, number>>;
  };
};

type DeriveInput = {
  planningContext: WorkoutPlanningContext;
  elapsedSeconds: number;
  defaultSetCount: number;
  exerciseOptions: PlanningExerciseOption[];
  exerciseLogs: WorkoutExerciseLogDraft[];
  history: Record<string, ExerciseHistorySummary>;
};

const normalizeName = (value: string) => value.trim().toLocaleLowerCase();

function emptyResult(
  state: WorkoutNextExerciseResult["state"],
  missingContext: WorkoutNextExerciseResult["missingContext"],
  remainingMinutes: number | null,
  coverage: WorkoutNextExerciseResult["coverage"] = { completedSetsByFocus: {}, completedSetsByPattern: {} },
  unclassifiedCompletedExercises: string[] = []
): WorkoutNextExerciseResult {
  return { state, missingContext, suggestions: [], unclassifiedCompletedExercises, remainingMinutes, coverage };
}

function groupOptions(options: PlanningExerciseOption[]) {
  const groups = new Map<string, PlanningExerciseOption[]>();
  for (const option of options) {
    if (!option.name.trim()) continue;
    const key = workoutExerciseIdentityKey(option);
    const current = groups.get(key) || [];
    current.push(option);
    groups.set(key, current);
  }
  return groups;
}

function trustedOption(group: PlanningExerciseOption[] | undefined) {
  if (!group?.length) return null;
  const withMetadata = group.filter((entry) => entry.planningMetadata);
  if (!withMetadata.length) return null;
  const metadataKeys = new Set(withMetadata.map((entry) => workoutPlanningMetadataKey(entry.planningMetadata!)));
  if (metadataKeys.size !== 1) return null;
  return [...withMetadata].sort((left, right) =>
    left.selectionLabel.localeCompare(right.selectionLabel) ||
    String(left.exerciseId || "").localeCompare(String(right.exerciseId || ""))
  )[0];
}

function resolveDraftOption(
  exercise: WorkoutExerciseLogDraft,
  optionGroups: Map<string, PlanningExerciseOption[]>,
  options: PlanningExerciseOption[]
) {
  if (exercise.exerciseId) return trustedOption(optionGroups.get(`id:${exercise.exerciseId}`));
  const matches = options.filter((option) => normalizeName(option.name) === normalizeName(exercise.exerciseName));
  const identityKeys = new Set(matches.map((option) => workoutExerciseIdentityKey(option)));
  return identityKeys.size === 1 ? trustedOption(optionGroups.get([...identityKeys][0])) : null;
}

function planningIntersectsFocus(metadata: WorkoutExercisePlanningMetadata, focus: Set<WorkoutFocusGroup>) {
  return metadata.focusGroups.some((group) => focus.has(group));
}

function compareDate(left: string | null, right: string | null) {
  if (left === right) return 0;
  if (left === null) return -1;
  if (right === null) return 1;
  return left.localeCompare(right);
}

export function deriveNextExerciseSuggestions(input: DeriveInput): WorkoutNextExerciseResult {
  const planningContext = normalizeWorkoutPlanningContext(input.planningContext);
  const missingContext: WorkoutNextExerciseResult["missingContext"] = [];
  if (!planningContext.focusGroups.length) missingContext.push("focus");
  if (!planningContext.availableEquipment.length) missingContext.push("equipment");
  if (planningContext.plannedDurationMinutes === null) missingContext.push("time");
  if (missingContext.length) return emptyResult("needs-context", missingContext, null);

  const remainingMinutes = Math.max(
    0,
    planningContext.plannedDurationMinutes! - Math.max(0, input.elapsedSeconds) / 60
  );
  const requestedSetCount = Math.max(1, Math.floor(input.defaultSetCount) || 1);
  const proposedSets = Math.min(
    requestedSetCount,
    Math.max(0, Math.floor(((remainingMinutes - TRANSITION_MINUTES) / MINUTES_PER_SET) + 1e-9))
  );
  if (proposedSets < 1) return emptyResult("no-fit", [], remainingMinutes);

  const focus = new Set(planningContext.focusGroups);
  const availableEquipment = new Set(planningContext.availableEquipment);
  const optionGroups = groupOptions(input.exerciseOptions);
  const completedSetsByFocus: Partial<Record<WorkoutFocusGroup, number>> = {};
  const completedSetsByPattern: Partial<Record<WorkoutMovementPattern, number>> = {};
  const unclassifiedCompletedExercises: string[] = [];

  for (const exercise of input.exerciseLogs) {
    const completedSetCount = exercise.sets.filter((set) =>
      isValidWorkingSet(set, exercise.exerciseType, { requiresExplicitCompletion: true })
    ).length;
    if (!completedSetCount) continue;
    const resolved = resolveDraftOption(exercise, optionGroups, input.exerciseOptions);
    const metadata = resolved?.planningMetadata || null;
    if (!metadata) {
      const statedGroups = [exercise.muscleGroup, ...exercise.primaryMuscles, ...exercise.secondaryMuscles];
      const canonicalGroups = statedGroups.filter((group): group is WorkoutFocusGroup =>
        WORKOUT_FOCUS_GROUPS.includes(group as WorkoutFocusGroup)
      );
      const isClearlyOutOfFocus = canonicalGroups.length > 0 && canonicalGroups.every((group) => !focus.has(group));
      if (!isClearlyOutOfFocus) {
        unclassifiedCompletedExercises.push(exercise.exerciseName || "Unnamed exercise");
      }
      continue;
    }
    if (!planningIntersectsFocus(metadata, focus)) continue;
    for (const group of metadata.focusGroups) {
      if (focus.has(group)) completedSetsByFocus[group] = (completedSetsByFocus[group] || 0) + completedSetCount;
    }
    completedSetsByPattern[metadata.movementPattern] =
      (completedSetsByPattern[metadata.movementPattern] || 0) + completedSetCount;
  }

  const coverage = { completedSetsByFocus, completedSetsByPattern };
  if (unclassifiedCompletedExercises.length) {
    return emptyResult(
      "unclassified-completed",
      [],
      remainingMinutes,
      coverage,
      [...new Set(unclassifiedCompletedExercises)].sort()
    );
  }

  const currentIdentityKeys = new Set(input.exerciseLogs
    .filter((exercise) => exercise.exerciseName.trim())
    .map((exercise) => workoutExerciseIdentityKey({ exerciseId: exercise.exerciseId, name: exercise.exerciseName })));
  const currentLegacyNames = new Set(input.exerciseLogs
    .filter((exercise) => !exercise.exerciseId && exercise.exerciseName.trim())
    .map((exercise) => normalizeName(exercise.exerciseName)));
  const candidates: WorkoutNextExerciseSuggestion[] = [];

  for (const [identityKey, group] of optionGroups) {
    const exercise = trustedOption(group);
    const metadata = exercise?.planningMetadata || null;
    if (!exercise || !metadata || currentIdentityKeys.has(identityKey)) continue;
    if (currentLegacyNames.has(normalizeName(exercise.name))) continue;
    if (!SUPPORTED_TYPES.has(exercise.exerciseType)) continue;
    if (!planningIntersectsFocus(metadata, focus)) continue;
    if (!metadata.requiredEquipment.every((equipment) => availableEquipment.has(equipment))) continue;
    const comparableFocusGroups = metadata.focusGroups.filter((groupName) => focus.has(groupName));
    const focusCompletedSets = comparableFocusGroups.length
      ? Math.min(...comparableFocusGroups.map((groupName) => completedSetsByFocus[groupName] || 0))
      : 0;
    const patternCompletedSets = completedSetsByPattern[metadata.movementPattern] || 0;
    const previous = findExerciseHistory(input.history, exercise.name, exercise.exerciseId);
    candidates.push({
      ...exercise,
      movementPattern: metadata.movementPattern,
      focusGroups: [...metadata.focusGroups],
      requiredEquipment: [...metadata.requiredEquipment],
      proposedSets,
      estimatedMinutes: TRANSITION_MINUTES + proposedSets * MINUTES_PER_SET,
      patternCompletedSets,
      focusCompletedSets,
      lastCompletedOn: previous?.performedOn || null,
      confidence: previous ? "medium" : "low",
      reason: patternCompletedSets === 0
        ? `No completed ${metadata.movementPattern} sets are classified in this workout.`
        : `${metadata.movementPattern} has ${patternCompletedSets} completed set${patternCompletedSets === 1 ? "" : "s"}.`,
    });
  }

  candidates.sort((left, right) =>
    Number(left.patternCompletedSets > 0) - Number(right.patternCompletedSets > 0) ||
    left.focusCompletedSets - right.focusCompletedSets ||
    left.patternCompletedSets - right.patternCompletedSets ||
    compareDate(left.lastCompletedOn, right.lastCompletedOn) ||
    workoutExerciseIdentityKey(left).localeCompare(workoutExerciseIdentityKey(right))
  );

  if (!candidates.length) return emptyResult("no-candidates", [], remainingMinutes, coverage);
  return {
    state: "ready",
    missingContext: [],
    suggestions: candidates.slice(0, 3),
    unclassifiedCompletedExercises: [],
    remainingMinutes,
    coverage,
  };
}

export function createPlannedExerciseFromSuggestion(
  suggestion: WorkoutNextExerciseSuggestion,
  createId: () => string
): WorkoutExerciseLogDraft {
  return {
    localId: createId(),
    exerciseId: suggestion.exerciseId,
    exerciseName: suggestion.name,
    muscleGroup: suggestion.muscleGroup,
    primaryMuscles: [...suggestion.primaryMuscles],
    secondaryMuscles: [...suggestion.secondaryMuscles],
    exerciseType: suggestion.exerciseType,
    setup: {},
    notes: "",
    sets: Array.from({ length: suggestion.proposedSets }, () => ({
      localId: createId(),
      reps: 8,
      weight: 0,
      notes: "",
      setType: "standard" as const,
      completed: false,
      deleted: false,
      rir: null,
    })),
  };
}
