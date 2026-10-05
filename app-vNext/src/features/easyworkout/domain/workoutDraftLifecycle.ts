import { normalizeWorkoutEquipmentSetup, type WorkoutEquipmentSetup } from "../../../lib/workoutEquipmentSetup.ts";
import {
  normalizeWorkoutPlanningContext,
  type WorkoutPlanningContext,
} from "./workoutPlanning.ts";

export const WORKOUT_DRAFT_SCHEMA_VERSION = 7 as const;
export const WORKOUT_DRAFT_MAX_SERIALIZED_CHARS = 500_000;
export const WORKOUT_DRAFT_MAX_EXERCISES = 80;
export const WORKOUT_DRAFT_MAX_SETS_PER_EXERCISE = 100;
export const WORKOUT_MAX_AUTOMATIC_DURATION_MINUTES = 360;
export const UNSCOPED_WORKOUT_DRAFT_STORAGE_KEY = "easylife.easyworkout.activeDraft.v2";
export const UNSCOPED_LEGACY_WORKOUT_DRAFT_STORAGE_KEY = "easylife.easyworkout.activeDraft.v1";

export function getWorkoutDraftStorageKey(ownerId: string) {
  return `easylife.easyworkout.activeDraft.v3:${encodeURIComponent(ownerId)}`;
}

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
  "sync-failed-draft-retained": "Couldn't sync — draft retained",
};

export const workoutDraftStatusDetailCopy: Record<WorkoutDraftLifecycleStatus, string> = {
  "saving-local": "Writing edits locally.",
  "saved-local": "Latest edits saved locally.",
  syncing: "Local draft kept until confirmed.",
  synced: "Workout saved; local draft cleared.",
  "sync-failed-draft-retained": "Review the message below.",
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
  setup: WorkoutEquipmentSetup;
  notes: string;
  sets: WorkoutSetDraft[];
};

export type StoredWorkoutDraft = {
  schemaVersion: typeof WORKOUT_DRAFT_SCHEMA_VERSION;
  ownerId: string;
  weightUnit: "lb" | "kg";
  draftId: string;
  selectedRoutineId: string;
  routineOriginId: string | null;
  performedOn: string;
  startedAt: string;
  elapsedSeconds: number;
  durationMinutes: string;
  sessionNotes: string;
  completionReviewRequired: boolean;
  activeExerciseId?: string;
  exerciseLogs: WorkoutExerciseLogDraft[];
  appliedImportOperationIds: string[];
  planningContext: WorkoutPlanningContext;
  updatedAt: string;
};

export type WorkoutDraftRecovery = {
  draft: StoredWorkoutDraft | null;
  message: string;
  migrated: boolean;
};

const unreadableDraft = (): WorkoutDraftRecovery => ({
  draft: null,
  message: "The saved workout draft was unreadable and was left aside safely.",
  migrated: false,
});

const oversizedDraft = (): WorkoutDraftRecovery => ({
  draft: null,
  message: "The saved workout draft was too large to restore automatically and was left aside safely.",
  migrated: false,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const finiteNonNegative = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};
const text = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);
const textList = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())) : [];

function normalizeSet(value: unknown, createId: () => string, trustExplicitCompletion: boolean): WorkoutSetDraft {
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
    completed: trustExplicitCompletion && set.completed === true,
    deleted: set.deleted === true,
    rir: set.rir === null || set.rir === undefined ? null : Math.min(10, finiteNonNegative(set.rir)),
    durationSeconds: set.durationSeconds === undefined ? undefined : finiteNonNegative(set.durationSeconds),
    distanceMeters: set.distanceMeters === undefined ? undefined : finiteNonNegative(set.distanceMeters),
  };
}

function normalizeExercise(value: unknown, createId: () => string, trustExplicitCompletion: boolean): WorkoutExerciseLogDraft | null {
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
    setup: normalizeWorkoutEquipmentSetup(value.setup),
    notes: text(value.notes),
    sets: rawSets.length
      ? rawSets.map((set) => normalizeSet(set, createId, trustExplicitCompletion))
      : [normalizeSet({}, createId, trustExplicitCompletion)],
  };
}

export function recoverWorkoutDraft(
  value: unknown,
  options: { today: string; nowIso: string; ownerId: string; defaultWeightUnit?: "lb" | "kg"; createId: () => string }
): WorkoutDraftRecovery {
  if (!isRecord(value)) {
    return unreadableDraft();
  }
  const isCurrentSchema = value.schemaVersion === WORKOUT_DRAFT_SCHEMA_VERSION;
  const trustsExplicitCompletion = typeof value.schemaVersion === "number" && value.schemaVersion >= 4;
  const rawExerciseLogs = Array.isArray(value.exerciseLogs) ? value.exerciseLogs : [];
  if (
    rawExerciseLogs.length > WORKOUT_DRAFT_MAX_EXERCISES ||
    rawExerciseLogs.some((exercise) => isRecord(exercise) && Array.isArray(exercise.sets) && exercise.sets.length > WORKOUT_DRAFT_MAX_SETS_PER_EXERCISE)
  ) {
    return oversizedDraft();
  }
  const exerciseLogs = rawExerciseLogs
    .map((exercise) => normalizeExercise(exercise, options.createId, trustsExplicitCompletion))
    .filter((exercise): exercise is WorkoutExerciseLogDraft => Boolean(exercise));
  if (!exerciseLogs.length) {
    return { draft: null, message: "The saved workout draft did not contain a recoverable exercise.", migrated: false };
  }
  if (typeof value.ownerId === "string" && value.ownerId !== options.ownerId) {
    return { draft: null, message: "This workout draft belongs to a different account and was not opened.", migrated: false };
  }
  const migrated = value.schemaVersion !== WORKOUT_DRAFT_SCHEMA_VERSION;
  const selectedRoutineId = text(value.selectedRoutineId);
  const recoveredDraftId = text(value.draftId);
  const appliedImportOperationIds = textList(value.appliedImportOperationIds)
    .map((operationId) => operationId.trim().slice(0, 256))
    .filter(Boolean)
    .slice(-20);
  return {
    draft: {
      schemaVersion: WORKOUT_DRAFT_SCHEMA_VERSION,
      ownerId: options.ownerId,
      weightUnit: value.weightUnit === "kg" || value.weightUnit === "lb" ? value.weightUnit : options.defaultWeightUnit || "lb",
      draftId: /^[a-zA-Z0-9_-]{8,180}$/.test(recoveredDraftId) ? recoveredDraftId : options.createId(),
      selectedRoutineId,
      routineOriginId: typeof value.routineOriginId === "string" ? value.routineOriginId : selectedRoutineId || null,
      performedOn: text(value.performedOn) || options.today,
      startedAt: text(value.startedAt) || options.nowIso,
      elapsedSeconds: finiteNonNegative(value.elapsedSeconds),
      durationMinutes: text(value.durationMinutes),
      sessionNotes: text(value.sessionNotes),
      completionReviewRequired: trustsExplicitCompletion ? value.completionReviewRequired === true : true,
      activeExerciseId: text(value.activeExerciseId) || exerciseLogs[0]?.localId,
      exerciseLogs,
      appliedImportOperationIds,
      planningContext: normalizeWorkoutPlanningContext(value.planningContext),
      updatedAt: text(value.updatedAt) || options.nowIso,
    },
    message: migrated
      ? trustsExplicitCompletion
        ? "Workout draft updated safely. Your completed-set choices were preserved."
        : "An older workout draft was restored. Review which sets you performed before saving."
      : "Workout draft restored on this device.",
    migrated,
  };
}

export function recoverWorkoutDraftFromStorage(
  raw: string,
  options: Parameters<typeof recoverWorkoutDraft>[1]
): WorkoutDraftRecovery {
  if (raw.length > WORKOUT_DRAFT_MAX_SERIALIZED_CHARS) return oversizedDraft();
  try {
    return recoverWorkoutDraft(JSON.parse(raw), options);
  } catch {
    return unreadableDraft();
  }
}

export function serializeWorkoutDraftForStorage(draft: StoredWorkoutDraft) {
  const serialized = JSON.stringify(draft);
  return serialized.length <= WORKOUT_DRAFT_MAX_SERIALIZED_CHARS ? serialized : null;
}

export function resolveWorkoutDurationMinutes(manualDuration: string, elapsedSeconds: number) {
  if (manualDuration.trim()) {
    const parsed = Number(manualDuration);
    return Number.isFinite(parsed) && parsed > 0 && parsed <= 1440 ? Math.round(parsed) : null;
  }
  const automaticMinutes = Math.max(1, Math.round(Math.max(0, elapsedSeconds) / 60));
  return automaticMinutes <= WORKOUT_MAX_AUTOMATIC_DURATION_MINUTES ? automaticMinutes : null;
}

export function hasWorkoutDraftWork(
  draft: Pick<StoredWorkoutDraft, "selectedRoutineId" | "durationMinutes" | "sessionNotes" | "exerciseLogs"> &
    { planningContext?: WorkoutPlanningContext }
) {
  const planningContext = draft.planningContext;
  return Boolean(
    draft.selectedRoutineId || draft.durationMinutes || draft.sessionNotes.trim() ||
      planningContext?.focusGroups.length || planningContext?.availableEquipment.length || planningContext?.plannedDurationMinutes ||
      draft.exerciseLogs.some((exercise) =>
        exercise.exerciseName.trim() || exercise.notes.trim() || Object.values(exercise.setup || {}).some((entry) => Boolean(entry?.trim())) ||
        exercise.sets.some((set) => !set.deleted && (
          set.weight > 0 ||
          set.notes.trim() ||
          (set.rir ?? 0) > 0 ||
          (set.durationSeconds ?? 0) > 0 ||
          (set.distanceMeters ?? 0) > 0 ||
          (exercise.exerciseType !== "weighted" && set.reps > 0)
        )))
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
