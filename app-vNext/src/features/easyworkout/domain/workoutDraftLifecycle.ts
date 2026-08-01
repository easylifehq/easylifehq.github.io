export const WORKOUT_DRAFT_SCHEMA_VERSION = 2 as const;
export const WORKOUT_DRAFT_STORAGE_KEY = "easylife.easyworkout.activeDraft.v2";
export const LEGACY_WORKOUT_DRAFT_STORAGE_KEY = "easylife.easyworkout.activeDraft.v1";

export type WorkoutDraftLifecycleStatus =
  | "saving-local"
  | "saved-local"
  | "syncing"
  | "synced"
  | "sync-failed-draft-retained";

export const workoutDraftStatusCopy: Record<WorkoutDraftLifecycleStatus, string> = {
  "saving-local": "Saving on this device",
  "saved-local": "Saved on this device",
  syncing: "Syncing",
  synced: "Workout saved",
  "sync-failed-draft-retained": "Couldn't sync—draft retained",
};

export type WorkoutDraftSetType = "warmup" | "standard" | "drop" | "failure";
export type WorkoutDraftExerciseType = "weighted" | "bodyweight" | "assisted" | "duration" | "distance";

export type WorkoutSetDraft = {
  localId: string;
  reps: number;
  weight: number;
  notes: string;
  setType: WorkoutDraftSetType;
  completed: boolean;
  deleted: boolean;
  rir: number | null;
  durationSeconds?: number;
  distanceMeters?: number;
};

export type WorkoutExerciseLogDraft = {
  localId: string;
  exerciseId: string | null;
  exerciseName: string;
  muscleGroup: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  exerciseType: WorkoutDraftExerciseType;
  notes: string;
  sets: WorkoutSetDraft[];
};

export type StoredWorkoutDraft = {
  schemaVersion: typeof WORKOUT_DRAFT_SCHEMA_VERSION;
  draftId: string;
  selectedRoutineId: string;
  routineOriginId: string | null;
  performedOn: string;
  startedAt: string;
  elapsedSeconds: number;
  durationMinutes: string;
  sessionNotes: string;
  activeExerciseId?: string;
  exerciseLogs: WorkoutExerciseLogDraft[];
  updatedAt: string;
};

export type WorkoutDraftRecovery = {
  draft: StoredWorkoutDraft | null;
  message: string;
  migrated: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const finiteNonNegative = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};
const text = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);
const textList = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())) : [];

function normalizeSet(value: unknown, createId: () => string): WorkoutSetDraft {
  const set = isRecord(value) ? value : {};
  const setKind = ["warmup", "standard", "drop", "failure"].includes(String(set.setType))
    ? (set.setType as WorkoutDraftSetType)
    : "standard";
  return {
    localId: text(set.localId) || createId(),
    reps: finiteNonNegative(set.reps),
    weight: finiteNonNegative(set.weight),
    notes: text(set.notes),
    setType: setKind,
    completed: set.completed !== false,
    deleted: set.deleted === true,
    rir: set.rir === null || set.rir === undefined ? null : Math.min(10, finiteNonNegative(set.rir)),
    durationSeconds: set.durationSeconds === undefined ? undefined : finiteNonNegative(set.durationSeconds),
    distanceMeters: set.distanceMeters === undefined ? undefined : finiteNonNegative(set.distanceMeters),
  };
}

function normalizeExercise(value: unknown, createId: () => string): WorkoutExerciseLogDraft | null {
  if (!isRecord(value)) return null;
  const rawSets = Array.isArray(value.sets) ? value.sets : [];
  const kind = ["weighted", "bodyweight", "assisted", "duration", "distance"].includes(String(value.exerciseType))
    ? (value.exerciseType as WorkoutDraftExerciseType)
    : "weighted";
  const muscleGroup = text(value.muscleGroup);
  const primaryMuscles = textList(value.primaryMuscles);
  return {
    localId: text(value.localId) || createId(),
    exerciseId: typeof value.exerciseId === "string" ? value.exerciseId : null,
    exerciseName: text(value.exerciseName),
    muscleGroup,
    primaryMuscles: primaryMuscles.length ? primaryMuscles : muscleGroup ? [muscleGroup] : [],
    secondaryMuscles: textList(value.secondaryMuscles),
    exerciseType: kind,
    notes: text(value.notes),
    sets: rawSets.length ? rawSets.map((set) => normalizeSet(set, createId)) : [normalizeSet({}, createId)],
  };
}

export function recoverWorkoutDraft(
  value: unknown,
  options: { today: string; nowIso: string; createId: () => string }
): WorkoutDraftRecovery {
  if (!isRecord(value)) {
    return { draft: null, message: "The saved workout draft was unreadable and was left aside safely.", migrated: false };
  }
  const exerciseLogs = (Array.isArray(value.exerciseLogs) ? value.exerciseLogs : [])
    .map((exercise) => normalizeExercise(exercise, options.createId))
    .filter((exercise): exercise is WorkoutExerciseLogDraft => Boolean(exercise));
  if (!exerciseLogs.length) {
    return { draft: null, message: "The saved workout draft did not contain a recoverable exercise.", migrated: false };
  }
  const migrated = value.schemaVersion !== WORKOUT_DRAFT_SCHEMA_VERSION;
  const selectedRoutineId = text(value.selectedRoutineId);
  return {
    draft: {
      schemaVersion: WORKOUT_DRAFT_SCHEMA_VERSION,
      draftId: text(value.draftId) || options.createId(),
      selectedRoutineId,
      routineOriginId: typeof value.routineOriginId === "string" ? value.routineOriginId : selectedRoutineId || null,
      performedOn: text(value.performedOn) || options.today,
      startedAt: text(value.startedAt) || options.nowIso,
      elapsedSeconds: finiteNonNegative(value.elapsedSeconds),
      durationMinutes: text(value.durationMinutes),
      sessionNotes: text(value.sessionNotes),
      activeExerciseId: text(value.activeExerciseId) || exerciseLogs[0]?.localId,
      exerciseLogs,
      updatedAt: text(value.updatedAt) || options.nowIso,
    },
    message: migrated ? "An older workout draft was upgraded and restored on this device." : "Workout draft restored on this device.",
    migrated,
  };
}

export function hasWorkoutDraftWork(draft: Pick<StoredWorkoutDraft, "selectedRoutineId" | "durationMinutes" | "sessionNotes" | "exerciseLogs">) {
  return Boolean(
    draft.selectedRoutineId || draft.durationMinutes || draft.sessionNotes.trim() ||
      draft.exerciseLogs.some((exercise) =>
        exercise.exerciseName.trim() || exercise.notes.trim() ||
        exercise.sets.some((set) => !set.deleted && (set.reps > 0 || set.weight > 0 || set.notes.trim() || (set.rir ?? 0) > 0)))
  );
}

export function canClearMatchingWorkoutDraft(storedDraftId: string | null | undefined, completedDraftId: string) {
  return Boolean(storedDraftId && storedDraftId === completedDraftId);
}

export class WorkoutSaveCoordinator<Result> {
  private pending = new Map<string, Promise<Result>>();
  private completed = new Map<string, Result>();

  save(draftId: string, persist: () => Promise<Result>) {
    if (this.completed.has(draftId)) return Promise.resolve(this.completed.get(draftId) as Result);
    const existing = this.pending.get(draftId);
    if (existing) return existing;
    const operation = persist().then((result) => {
      this.completed.set(draftId, result);
      return result;
    }).finally(() => this.pending.delete(draftId));
    this.pending.set(draftId, operation);
    return operation;
  }
}
