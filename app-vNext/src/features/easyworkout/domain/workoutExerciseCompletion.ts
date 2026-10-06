import type {
  WorkoutDraftExerciseType,
  WorkoutExerciseLogDraft,
  WorkoutSetDraft,
} from "./workoutDraftLifecycle.ts";
import { isValidWorkingSet } from "./workoutStatistics.ts";

export type WorkoutRowClass = "blank" | "valid" | "partial" | "warmup" | "deleted";

export type WorkoutCompletionBlock = {
  ok: false;
  reason: "name" | "no-valid-row" | "partial-row";
  message: string;
  setLocalId?: string;
  /** Which input of the partial row needs attention. */
  field?: WorkoutSetField;
};

export type WorkoutSetField = "reps" | "load" | "duration" | "distance";

const positive = (value: number | undefined) => typeof value === "number" && Number.isFinite(value) && value > 0;

function hasTypeRelevantValue(set: WorkoutSetDraft, type: WorkoutDraftExerciseType) {
  if (type === "duration") return positive(set.durationSeconds);
  if (type === "distance") return positive(set.distanceMeters);
  if (type === "bodyweight") return positive(set.reps);
  return positive(set.reps) || positive(set.weight);
}

/** True when a row carries no entered value at all, regardless of exercise type or set type. */
export const isEmptySetRow = (set: WorkoutSetDraft) =>
  !positive(set.reps) &&
  !positive(set.weight) &&
  !positive(set.durationSeconds) &&
  !positive(set.distanceMeters) &&
  !set.notes.trim() &&
  !positive(set.rir ?? undefined);

/** The input a partial row still needs, by exercise type. */
export function missingFieldForSet(set: WorkoutSetDraft, type: WorkoutDraftExerciseType): WorkoutSetField {
  if (type === "duration") return "duration";
  if (type === "distance") return "distance";
  if (type === "bodyweight" || !positive(set.reps)) return "reps";
  return "load";
}

/** Classifies a row by exercise-type validity; completed:false is not an input error. */
export function classifyWorkoutRow(set: WorkoutSetDraft, type: WorkoutDraftExerciseType): WorkoutRowClass {
  if (set.deleted) return "deleted";
  if (set.setType === "warmup") return "warmup";
  if (isValidWorkingSet({ ...set, completed: true }, type)) return "valid";
  if (hasTypeRelevantValue(set, type) || set.notes.trim()) return "partial";
  return "blank";
}

const rowsOf = (exercise: WorkoutExerciseLogDraft) =>
  exercise.sets.map((set) => ({ set, kind: classifyWorkoutRow(set, exercise.exerciseType) }));

export function isExerciseDone(exercise: WorkoutExerciseLogDraft) {
  return exercise.sets.some((set) => isValidWorkingSet(set, exercise.exerciseType, { requiresExplicitCompletion: true }));
}

const typeHint: Record<WorkoutDraftExerciseType, string> = {
  weighted: "reps and a positive load",
  bodyweight: "positive reps",
  assisted: "positive reps and an assistance value",
  duration: "a positive duration",
  distance: "a positive distance",
};

const fieldHint: Record<WorkoutSetField, string> = {
  reps: "reps greater than 0",
  load: "a load greater than 0 lb",
  duration: "a duration greater than 0 seconds",
  distance: "a distance greater than 0 meters",
};

/** Drops contiguous fully empty rows at the end; deleted rows are left as they are. */
export function trimTrailingEmptySets(exercise: WorkoutExerciseLogDraft): WorkoutExerciseLogDraft {
  const sets = [...exercise.sets];
  for (let index = sets.length - 1; index >= 0; index -= 1) {
    if (sets[index].deleted) continue;
    if (!isEmptySetRow(sets[index])) break;
    sets.splice(index, 1);
  }
  return sets.length === exercise.sets.length ? exercise : { ...exercise, sets };
}

/** Manual "+ Set": adds a blank row unless the last live row is already blank. */
export function addBlankSetIfNeeded(exercise: WorkoutExerciseLogDraft, createSet: () => WorkoutSetDraft): WorkoutExerciseLogDraft {
  const last = [...exercise.sets].reverse().find((set) => !set.deleted);
  return last && isEmptySetRow(last) ? exercise : { ...exercise, sets: [...exercise.sets, createSet()] };
}

/**
 * Appends one blank row only when the last live row is a completed entry.
 * Pure function of the exercise state, so repeated or replayed calls cannot add a second row.
 */
export function ensureTrailingBlankSet(
  exercise: WorkoutExerciseLogDraft,
  createSet: () => WorkoutSetDraft
): WorkoutExerciseLogDraft {
  const live = exercise.sets.filter((set) => !set.deleted);
  const last = live[live.length - 1];
  if (last && isEmptySetRow(last)) return exercise;
  if (last && !isValidWorkingSet({ ...last, setType: "standard", completed: true }, exercise.exerciseType)) return exercise;
  return { ...exercise, sets: [...exercise.sets, createSet()] };
}

export function completeExercise(
  exercise: WorkoutExerciseLogDraft
): { ok: true; exercise: WorkoutExerciseLogDraft } | WorkoutCompletionBlock {
  if (!exercise.exerciseName.trim()) {
    return { ok: false, reason: "name", message: "Name this exercise before choosing Done & next exercise." };
  }
  const rows = rowsOf(exercise);
  const partial = rows.find((row) => row.kind === "partial");
  if (partial) {
    const field = missingFieldForSet(partial.set, exercise.exerciseType);
    return {
      ok: false,
      reason: "partial-row",
      setLocalId: partial.set.localId,
      field,
      message: `Set ${exercise.sets.indexOf(partial.set) + 1} needs ${fieldHint[field]}. Finish it or clear it; nothing you entered was changed.`,
    };
  }
  if (!rows.some((row) => row.kind === "valid")) {
    return { ok: false, reason: "no-valid-row", message: `Enter at least one working set with ${typeHint[exercise.exerciseType]} first.` };
  }
  const trimmed = trimTrailingEmptySets(exercise);
  return {
    ok: true,
    exercise: {
      ...trimmed,
      sets: trimmed.sets.map((set) => {
        if (set.deleted) return set;
        const completed = classifyWorkoutRow(set, trimmed.exerciseType) === "valid";
        return set.completed === completed ? set : { ...set, completed };
      }),
    },
  };
}

export function undoExerciseCompletion(exercise: WorkoutExerciseLogDraft): WorkoutExerciseLogDraft {
  return { ...exercise, sets: exercise.sets.map((set) => (set.completed ? { ...set, completed: false } : set)) };
}

const PERFORMANCE_FIELDS = ["reps", "weight", "durationSeconds", "distanceMeters", "setType"] as const;

export function applySetEdit(
  exercise: WorkoutExerciseLogDraft,
  setLocalId: string,
  patch: Partial<WorkoutSetDraft>,
  createSet?: () => WorkoutSetDraft
): WorkoutExerciseLogDraft {
  const edited: WorkoutExerciseLogDraft = {
    ...exercise,
    sets: exercise.sets.map((set) => {
      if (set.localId !== setLocalId) return set;
      const changesPerformance = PERFORMANCE_FIELDS.some((field) => field in patch && patch[field] !== set[field]);
      return { ...set, ...patch, ...(changesPerformance && set.completed ? { completed: false } : {}) };
    }),
  };
  return createSet ? ensureTrailingBlankSet(edited, createSet) : edited;
}

export function applyExerciseIdentityEdit(
  exercise: WorkoutExerciseLogDraft,
  patch: Partial<WorkoutExerciseLogDraft>
): WorkoutExerciseLogDraft {
  const changesIdentity =
    ("exerciseName" in patch && patch.exerciseName !== exercise.exerciseName) ||
    ("exerciseId" in patch && patch.exerciseId !== exercise.exerciseId) ||
    ("exerciseType" in patch && patch.exerciseType !== exercise.exerciseType);
  const next = { ...exercise, ...patch };
  return changesIdentity ? undoExerciseCompletion(next) : next;
}

export function completeExerciseAndAdvance(
  logs: WorkoutExerciseLogDraft[],
  exerciseLocalId: string,
  createExercise: () => WorkoutExerciseLogDraft
):
  | { ok: true; logs: WorkoutExerciseLogDraft[]; activeExerciseId: string; appended: boolean }
  | WorkoutCompletionBlock {
  const index = logs.findIndex((exercise) => exercise.localId === exerciseLocalId);
  if (index < 0) return { ok: false, reason: "name", message: "That exercise is no longer in this workout." };
  const completed = completeExercise(logs[index]);
  if (!completed.ok) return completed;
  const nextLogs = logs.map((exercise, current) => (current === index ? completed.exercise : exercise));
  const following = nextLogs[index + 1];
  if (following) return { ok: true, logs: nextLogs, activeExerciseId: following.localId, appended: false };
  const appended = createExercise();
  return { ok: true, logs: [...nextLogs, appended], activeExerciseId: appended.localId, appended: true };
}

export function deleteExerciseFromLogs(
  logs: WorkoutExerciseLogDraft[],
  exerciseLocalId: string,
  createExercise: () => WorkoutExerciseLogDraft
) {
  const index = logs.findIndex((exercise) => exercise.localId === exerciseLocalId);
  if (index < 0) return { logs, focusExerciseId: logs[0]?.localId ?? "" };
  const remaining = logs.filter((_, current) => current !== index);
  const nextLogs = remaining.length ? remaining : [createExercise()];
  return { logs: nextLogs, focusExerciseId: nextLogs[Math.min(index, nextLogs.length - 1)].localId };
}

export const focusedStartingExercises = (createExercise: () => WorkoutExerciseLogDraft) => [createExercise()];

export type WorkoutSaveBlock = { exerciseLocalId: string; setLocalId?: string; message: string };

/** Saving clears the local draft, so partial or unnamed entered work must be finished, removed, or undone first. */
export function findSaveBlock(logs: WorkoutExerciseLogDraft[]): WorkoutSaveBlock | null {
  for (const exercise of logs) {
    const rows = rowsOf(exercise);
    const label = exercise.exerciseName.trim() || "An unnamed exercise";
    const partial = rows.find((row) => row.kind === "partial");
    if (partial) {
      return {
        exerciseLocalId: exercise.localId,
        setLocalId: partial.set.localId,
        message: `${label} has unfinished set ${exercise.sets.indexOf(partial.set) + 1}. Finish it, remove it, or delete the exercise before saving.`,
      };
    }
    if (!exercise.exerciseName.trim() && rows.some((row) => row.kind === "valid")) {
      return { exerciseLocalId: exercise.localId, message: "An exercise has entered sets but no name. Name it or delete it before saving." };
    }
  }
  return null;
}
