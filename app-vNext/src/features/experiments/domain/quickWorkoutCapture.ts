import { convertWeight } from "../../easyworkout/domain/workoutStatistics.ts";

import { WORKOUT_SESSION_SCHEMA_VERSION } from "../../easyworkout/domain/workoutSessionContract.ts";

export { WORKOUT_SESSION_SCHEMA_VERSION };

export type QuickWorkoutCaptureIntent = {
  schemaVersion: 1;
  clientSetId: string;
  ownerId: string;
  performedOn: string;
  sourceText: string;
  exerciseName: string;
  notes: string;
  reps: number;
  weight: number;
  weightUnit: "lb";
  createdAt: string;
};

type IntentInput = {
  ownerId: string;
  performedOn: string;
  text: string;
  notes: string;
};

type IntentDependencies = {
  createId: () => string;
  nowIso: () => string;
};

const trimBounded = (value: unknown, maxLength: number) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

function isValidLocalDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function parseWeightedSet(text: string) {
  const compact = /^(.*?)\s+(\d+(?:\.\d+)?)\s*x\s*(\d+)\s*(?:lbs?|pounds?)?\s*$/i.exec(text);
  const explicit = /^(.*?)\s+(\d+)\s*(?:reps?|@)\s*(\d+(?:\.\d+)?)\s*(?:lbs?|pounds?)?\s*$/i.exec(text);
  const match = compact || explicit;
  if (!match) return null;
  const exerciseName = match[1].trim();
  const weight = Number(match[compact ? 2 : 3]);
  const reps = Number(match[compact ? 3 : 2]);
  if (!exerciseName || !Number.isFinite(reps) || reps <= 0 || !Number.isInteger(reps) || !Number.isFinite(weight) || weight <= 0) {
    return null;
  }
  return { exerciseName, reps, weight };
}

export function createQuickWorkoutCaptureIntent(
  input: IntentInput,
  dependencies: IntentDependencies = {
    createId: () => crypto.randomUUID(),
    nowIso: () => new Date().toISOString(),
  }
): { ok: true; intent: QuickWorkoutCaptureIntent } | { ok: false; error: string } {
  const ownerId = trimBounded(input.ownerId, 256);
  const performedOn = trimBounded(input.performedOn, 10);
  const sourceText = trimBounded(input.text, 2_000);
  if (!ownerId) return { ok: false, error: "A signed-in owner is required." };
  if (!isValidLocalDate(performedOn)) return { ok: false, error: "Choose a valid workout date." };
  if (/\b(?:kgs?|kilograms?)\b/i.test(sourceText)) {
    return { ok: false, error: "Enter a valid pound value; Quick Capture does not convert kilograms yet." };
  }
  const parsed = parseWeightedSet(sourceText);
  if (!parsed) return { ok: false, error: "Enter an exercise with positive weight and reps, such as Bench press 135 x 8." };
  const clientSetId = trimBounded(dependencies.createId(), 256);
  if (!clientSetId) return { ok: false, error: "A capture identity is required." };
  return {
    ok: true,
    intent: {
      schemaVersion: 1,
      clientSetId,
      ownerId,
      performedOn,
      sourceText,
      exerciseName: trimBounded(parsed.exerciseName, 160),
      notes: trimBounded(input.notes, 2_000),
      reps: parsed.reps,
      weight: parsed.weight,
      weightUnit: "lb",
      createdAt: dependencies.nowIso(),
    },
  };
}

const QUICK_WORKOUT_CAPTURE_MAX_BYTES = 20_000;

function normalizeQuickWorkoutCaptureIntent(value: unknown): QuickWorkoutCaptureIntent | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<QuickWorkoutCaptureIntent>;
  const schemaVersion = candidate.schemaVersion;
  const clientSetId = trimBounded(candidate.clientSetId, 256);
  const ownerId = trimBounded(candidate.ownerId, 256);
  const performedOn = trimBounded(candidate.performedOn, 10);
  const sourceText = trimBounded(candidate.sourceText, 2_000);
  const exerciseName = trimBounded(candidate.exerciseName, 160);
  const notes = trimBounded(candidate.notes, 2_000);
  const createdAt = trimBounded(candidate.createdAt, 64);
  const reps = candidate.reps;
  const weight = candidate.weight;
  if (
    schemaVersion !== 1 ||
    !clientSetId ||
    !ownerId ||
    !isValidLocalDate(performedOn) ||
    !sourceText ||
    !exerciseName ||
    typeof reps !== "number" ||
    !Number.isInteger(reps) ||
    reps <= 0 ||
    typeof weight !== "number" ||
    !Number.isFinite(weight) ||
    weight <= 0 ||
    candidate.weightUnit !== "lb" ||
    !createdAt ||
    Number.isNaN(Date.parse(createdAt))
  ) {
    return null;
  }
  return {
    schemaVersion: 1,
    clientSetId,
    ownerId,
    performedOn,
    sourceText,
    exerciseName,
    notes,
    reps,
    weight,
    weightUnit: "lb",
    createdAt,
  };
}

export function quickWorkoutCaptureStorageKey(ownerId: string, clientSetId?: string) {
  const prefix = `easylife.quickWorkout.pending.v1:${encodeURIComponent(trimBounded(ownerId, 256))}`;
  return clientSetId ? `${prefix}:${encodeURIComponent(trimBounded(clientSetId, 256))}` : prefix;
}

export function quickWorkoutSessionDocumentId(performedOn: string) {
  if (!isValidLocalDate(performedOn)) throw new Error("A valid workout date is required.");
  return `quick-add-${performedOn}`;
}

export function serializeQuickWorkoutCaptureIntent(intent: QuickWorkoutCaptureIntent) {
  const normalized = normalizeQuickWorkoutCaptureIntent(intent);
  if (!normalized) throw new Error("Invalid quick workout capture intent.");
  const serialized = JSON.stringify(normalized);
  if (serialized.length > QUICK_WORKOUT_CAPTURE_MAX_BYTES) throw new Error("Quick workout capture intent is too large.");
  return serialized;
}

export function recoverQuickWorkoutCaptureIntent(raw: string | null, ownerId: string) {
  if (!raw || raw.length > QUICK_WORKOUT_CAPTURE_MAX_BYTES) {
    return { intent: null, error: raw ? "The pending set was invalid and was not restored." : "" };
  }
  try {
    const intent = normalizeQuickWorkoutCaptureIntent(JSON.parse(raw));
    if (!intent || intent.ownerId !== trimBounded(ownerId, 256)) {
      return { intent: null, error: "The pending set did not belong to this account and was not restored." };
    }
    return { intent, error: "" };
  } catch {
    return { intent: null, error: "The pending set was unreadable and was not restored." };
  }
}

export function canClearMatchingQuickWorkoutCapture(raw: string | null, ownerId: string, clientSetId: string) {
  const recovered = recoverQuickWorkoutCaptureIntent(raw, ownerId).intent;
  return recovered?.clientSetId === clientSetId;
}

export function selectOldestPendingQuickWorkoutCapture(
  entries: Array<{ key: string; value: string | null }>,
  ownerId: string
) {
  const prefix = `${quickWorkoutCaptureStorageKey(ownerId)}:`;
  return entries
    .filter((entry) => entry.key.startsWith(prefix))
    .map((entry) => recoverQuickWorkoutCaptureIntent(entry.value, ownerId).intent)
    .filter((intent): intent is QuickWorkoutCaptureIntent => Boolean(intent))
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt) || left.clientSetId.localeCompare(right.clientSetId))[0] || null;
}

export function isActiveQuickWorkoutCapture(
  activeOwnerId: string,
  activeIntent: QuickWorkoutCaptureIntent | null,
  expectedIntent: QuickWorkoutCaptureIntent
) {
  const ownerId = trimBounded(activeOwnerId, 256);
  return (
    ownerId === expectedIntent.ownerId &&
    activeIntent?.ownerId === expectedIntent.ownerId &&
    activeIntent.clientSetId === expectedIntent.clientSetId
  );
}

export function resolveQuickWorkoutCaptureConfirmation(
  entries: Array<{ key: string; value: string | null }>,
  activeOwnerId: string,
  activeIntent: QuickWorkoutCaptureIntent | null,
  confirmedIntent: QuickWorkoutCaptureIntent
) {
  const ownerId = trimBounded(activeOwnerId, 256);
  const isCurrent = isActiveQuickWorkoutCapture(ownerId, activeIntent, confirmedIntent);
  if (!isCurrent) return { isCurrent: false, nextIntent: null };
  const remainingEntries = entries.filter((entry) => {
    const recovered = recoverQuickWorkoutCaptureIntent(entry.value, ownerId).intent;
    return recovered?.clientSetId !== confirmedIntent.clientSetId;
  });
  return {
    isCurrent: true,
    nextIntent: selectOldestPendingQuickWorkoutCapture(remainingEntries, ownerId),
  };
}

export type QuickWorkoutSetRecord = {
  clientSetId?: string;
  reps: number;
  weight: number;
  notes: string;
  setType?: "warmup" | "standard" | "drop" | "failure";
  completed?: boolean;
  deleted?: boolean;
  rir?: number | null;
  [key: string]: unknown;
};

export type QuickWorkoutExerciseRecord = {
  exerciseId: string | null;
  exerciseName: string;
  muscleGroup: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  exerciseType?: "weighted";
  notes: string;
  sets: QuickWorkoutSetRecord[];
  [key: string]: unknown;
};

export type QuickWorkoutSession = {
  schemaVersion?: number;
  routineId: string | null;
  routineName: string;
  performedOn: string;
  weightUnit?: "lb" | "kg";
  durationMinutes: number | null;
  notes: string;
  exercises: QuickWorkoutExerciseRecord[];
  [key: string]: unknown;
};

export function applyQuickWorkoutSetOperation(
  existing: QuickWorkoutSession | null,
  candidate: QuickWorkoutCaptureIntent
) {
  const intent = normalizeQuickWorkoutCaptureIntent(candidate);
  if (!intent) throw new Error("Invalid quick workout capture intent.");
  if (existing && existing.performedOn !== intent.performedOn) {
    throw new Error("Pending set date does not match the workout session.");
  }
  const alreadyApplied = Boolean(existing?.exercises.some((exercise) =>
    exercise.sets.some((set) => set.clientSetId === intent.clientSetId)
  ));
  if (existing && alreadyApplied) return { applied: false, session: existing };

  const session: QuickWorkoutSession = existing
    ? {
        ...existing,
        exercises: existing.exercises.map((exercise) => ({
          ...exercise,
          sets: exercise.sets.map((set) => ({ ...set })),
        })),
      }
    : {
        schemaVersion: WORKOUT_SESSION_SCHEMA_VERSION,
        routineId: null,
        routineName: "Quick Add",
        performedOn: intent.performedOn,
        weightUnit: intent.weightUnit,
        durationMinutes: null,
        notes: "",
        exercises: [],
      };
  const set: QuickWorkoutSetRecord = {
    clientSetId: intent.clientSetId,
    reps: intent.reps,
    weight: session.weightUnit === "kg" ? convertWeight(intent.weight, "lb", "kg") : intent.weight,
    notes: intent.notes,
    setType: "standard",
    completed: true,
    deleted: false,
    rir: null,
  };
  const normalizedName = intent.exerciseName.toLocaleLowerCase();
  const exerciseIndex = session.exercises.findIndex(
    (exercise) => exercise.exerciseName.trim().toLocaleLowerCase() === normalizedName
  );
  if (exerciseIndex >= 0) {
    const exercise = session.exercises[exerciseIndex];
    session.exercises[exerciseIndex] = {
      ...exercise,
      notes: exercise.notes || intent.notes,
      sets: [...exercise.sets, set],
    };
  } else {
    session.exercises.push({
      exerciseId: null,
      exerciseName: intent.exerciseName,
      muscleGroup: "",
      primaryMuscles: [],
      secondaryMuscles: [],
      exerciseType: "weighted",
      notes: intent.notes,
      sets: [set],
    });
  }
  return { applied: true, session };
}

export class QuickWorkoutCaptureCoordinator {
  private inFlight: { clientSetId: string; promise: Promise<unknown> } | null = null;

  run<T>(clientSetId: string, save: () => Promise<T>) {
    if (this.inFlight?.clientSetId === clientSetId) return this.inFlight.promise as Promise<T>;
    if (this.inFlight) return Promise.reject(new Error("Another workout set is still pending."));
    let promise: Promise<T>;
    try {
      promise = Promise.resolve(save());
    } catch (error) {
      promise = Promise.reject(error);
    }
    this.inFlight = { clientSetId, promise };
    const clear = () => {
      if (this.inFlight?.promise === promise) this.inFlight = null;
    };
    void promise.then(clear, clear);
    return promise;
  }
}
