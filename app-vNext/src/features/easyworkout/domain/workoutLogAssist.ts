import type { WorkoutExerciseRecord } from "../../../lib/firestore/workoutExercises.ts";
import type { WorkoutSessionRecord, WorkoutSetRecord } from "../../../lib/firestore/workoutSessions.ts";
import type { WorkoutSetDraft } from "./workoutDraftLifecycle.ts";
import { convertWeight, isValidWorkingSet, type WorkoutDisplayUnit } from "./workoutStatistics.ts";
import { normalizeWorkoutEquipmentSetup, type WorkoutEquipmentSetup } from "../../../lib/workoutEquipmentSetup.ts";

export type WorkoutExerciseOption = {
  exerciseId: string | null;
  name: string;
  selectionLabel: string;
  muscleGroup: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  exerciseType: "weighted" | "bodyweight" | "assisted" | "duration" | "distance";
};

export type ExerciseHistorySummary = {
  sourceSessionId: string;
  sourceExerciseId: string | null;
  lastWeight: number;
  lastReps: number;
  lastSets: Array<Pick<WorkoutSetRecord, "reps" | "weight" | "durationSeconds" | "distanceMeters">>;
  lastSetup: WorkoutEquipmentSetup;
  performedOn: string;
  bestWeight: number;
  bestVolume: number;
  sessionCount: number;
};

type BasicExercise = Pick<WorkoutExerciseRecord, "id" | "name" | "muscleGroup"> & Partial<WorkoutExerciseOption>;
type DefaultExercise = { name: string; muscleGroup: string };

const exerciseKey = (name: string) => name.trim().toLocaleLowerCase();
const stableHistoryKey = (exerciseId: string) => `id:${exerciseId}`;
const legacyHistoryKey = (name: string) => `legacy:${exerciseKey(name)}`;

function newestSessions(sessions: WorkoutSessionRecord[]) {
  return [...sessions].sort((left, right) =>
    right.performedOn.localeCompare(left.performedOn) ||
    (right.createdAt?.getTime() || 0) - (left.createdAt?.getTime() || 0) ||
    right.id.localeCompare(left.id)
  );
}

export function buildWorkoutExerciseOptions(
  exercises: BasicExercise[],
  sessions: WorkoutSessionRecord[],
  defaults: DefaultExercise[]
) {
  const options = new Map<string, WorkoutExerciseOption>();
  const add = (
    entry: Partial<WorkoutExerciseOption> & { name?: string; muscleGroup?: string },
    fillOnly = false
  ) => {
    const name = entry.name?.trim() || "";
    const normalizedName = exerciseKey(name);
    if (!normalizedName) return;
    const matchingNameEntries = [...options.entries()].filter(([, option]) => exerciseKey(option.name) === normalizedName);
    if (fillOnly && matchingNameEntries.length) {
      matchingNameEntries.forEach(([key, current]) => options.set(key, {
        ...current,
        muscleGroup: current.muscleGroup || entry.muscleGroup || "",
        primaryMuscles: current.primaryMuscles.length ? current.primaryMuscles : entry.primaryMuscles || [],
        secondaryMuscles: current.secondaryMuscles.length ? current.secondaryMuscles : entry.secondaryMuscles || [],
        exerciseType: current.exerciseType || entry.exerciseType || "weighted",
      }));
      return;
    }
    const stableId = entry.exerciseId || null;
    const key = stableId ? `id:${stableId}` : `name:${normalizedName}`;
    const legacy = stableId ? options.get(`name:${normalizedName}`) : undefined;
    const current = options.get(key) || legacy;
    if (stableId && legacy) options.delete(`name:${normalizedName}`);
    options.set(key, {
      exerciseId: stableId || current?.exerciseId || null,
      name: current?.name || name,
      selectionLabel: current?.selectionLabel || name,
      muscleGroup: fillOnly ? current?.muscleGroup || entry.muscleGroup || "" : entry.muscleGroup || current?.muscleGroup || "",
      primaryMuscles: fillOnly
        ? current?.primaryMuscles.length ? current.primaryMuscles : entry.primaryMuscles || []
        : entry.primaryMuscles?.length ? entry.primaryMuscles : current?.primaryMuscles || [],
      secondaryMuscles: fillOnly
        ? current?.secondaryMuscles.length ? current.secondaryMuscles : entry.secondaryMuscles || []
        : entry.secondaryMuscles?.length ? entry.secondaryMuscles : current?.secondaryMuscles || [],
      exerciseType: fillOnly ? current?.exerciseType || entry.exerciseType || "weighted" : entry.exerciseType || current?.exerciseType || "weighted",
    });
  };

  // Preserve recent-use order, then fill in saved and built-in choices.
  newestSessions(sessions).forEach((session) => {
    session.exercises.forEach((exercise) => add({
      exerciseId: exercise.exerciseId,
      name: exercise.exerciseName,
      muscleGroup: exercise.muscleGroup,
      primaryMuscles: exercise.primaryMuscles,
      secondaryMuscles: exercise.secondaryMuscles,
      exerciseType: exercise.exerciseType,
    }));
  });
  exercises.forEach((exercise) => add({ exerciseId: exercise.id, ...exercise }));
  defaults.forEach((exercise) => add(exercise, true));
  const nameCounts = [...options.values()].reduce<Record<string, number>>((counts, option) => {
    const key = exerciseKey(option.name);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
  return [...options.values()].map((option) => ({
    ...option,
    selectionLabel: nameCounts[exerciseKey(option.name)] > 1
      ? `${option.name} · ${option.exerciseId || "legacy"}`
      : option.name,
  }));
}

export function resolveWorkoutExerciseOption(
  options: WorkoutExerciseOption[],
  input: string,
  currentExerciseId?: string | null
) {
  const normalizedInput = exerciseKey(input);
  if (!normalizedInput) return undefined;
  const exactSelection = options.find((option) => exerciseKey(option.selectionLabel) === normalizedInput);
  if (exactSelection) return exactSelection;
  const nameMatches = options.filter((option) => exerciseKey(option.name) === normalizedInput);
  if (currentExerciseId) {
    const current = nameMatches.find((option) => option.exerciseId === currentExerciseId);
    if (current) return current;
  }
  return nameMatches.length === 1 ? nameMatches[0] : undefined;
}

export function deriveExerciseHistory(
  sessions: WorkoutSessionRecord[],
  displayUnit: WorkoutDisplayUnit
) {
  const summaries: Record<string, ExerciseHistorySummary> = {};

  newestSessions(sessions).forEach((session) => {
    session.exercises.forEach((exercise) => {
      const normalizedName = exerciseKey(exercise.exerciseName);
      if (!normalizedName) return;
      const key = exercise.exerciseId ? stableHistoryKey(exercise.exerciseId) : legacyHistoryKey(exercise.exerciseName);
      const kind = exercise.exerciseType || "weighted";
      const validSets = exercise.sets.filter((set) => isValidWorkingSet(set, kind, {
        requiresExplicitCompletion: typeof session.schemaVersion === "number" && session.schemaVersion >= 4,
      }));
      if (!validSets.length) return;
      const sourceUnit = session.weightUnit || "lb";
      const convertedSets = validSets.map((set) => ({
        reps: set.reps,
        weight: convertWeight(set.weight, sourceUnit, displayUnit),
        durationSeconds: set.durationSeconds,
        distanceMeters: set.distanceMeters,
      }));
      const bestSetWeight = convertedSets.reduce((best, set) => Math.max(best, set.weight), 0);
      const exerciseVolume = convertedSets.reduce((sum, set) => sum + set.reps * set.weight, 0);
      const bestSet = convertedSets.find((set) => set.weight === bestSetWeight) || convertedSets[0];
      const current = summaries[key];

      if (!current) {
        summaries[key] = {
          sourceSessionId: session.id,
          sourceExerciseId: exercise.exerciseId,
          lastWeight: bestSet.weight,
          lastReps: bestSet.reps,
          lastSets: convertedSets,
          lastSetup: normalizeWorkoutEquipmentSetup(exercise.setup),
          performedOn: session.performedOn,
          bestWeight: bestSetWeight,
          bestVolume: exerciseVolume,
          sessionCount: 1,
        };
        return;
      }

      summaries[key] = {
        ...current,
        bestWeight: Math.max(current.bestWeight, bestSetWeight),
        bestVolume: Math.max(current.bestVolume, exerciseVolume),
        sessionCount: current.sessionCount + 1,
      };
    });
  });

  return summaries;
}

export function findExerciseHistory(
  history: Record<string, ExerciseHistorySummary>,
  exerciseName: string,
  exerciseId?: string | null
) {
  if (exerciseId) {
    return history[stableHistoryKey(exerciseId)] || history[legacyHistoryKey(exerciseName)];
  }
  return history[legacyHistoryKey(exerciseName)];
}

export function fillSetsFromLastPerformance(
  sets: WorkoutSetDraft[],
  previous: ExerciseHistorySummary | undefined
) {
  if (!previous?.lastSets.length) return sets;
  return sets.map((set, index) => {
    const source = previous.lastSets[Math.min(index, previous.lastSets.length - 1)];
    return {
      ...set,
      completed: false,
      reps: source.reps,
      weight: source.weight,
      durationSeconds: source.durationSeconds,
      distanceMeters: source.distanceMeters,
    };
  });
}
