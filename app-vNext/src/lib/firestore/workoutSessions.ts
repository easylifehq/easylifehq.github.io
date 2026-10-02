import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
  type QuerySnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { workoutSessionDocumentId } from "./workoutSessionIdentity";
import { normalizeWorkoutEquipmentSetup, type WorkoutEquipmentSetup } from "../workoutEquipmentSetup";
import {
  applyQuickWorkoutSetOperation,
  quickWorkoutSessionDocumentId,
  type QuickWorkoutCaptureIntent,
  type QuickWorkoutSession,
} from "@/features/experiments/domain/quickWorkoutCapture";

export type WorkoutSetRecord = {
  clientSetId?: string;
  reps: number;
  weight: number;
  notes: string;
  setType?: "warmup" | "standard" | "drop" | "failure";
  completed?: boolean;
  deleted?: boolean;
  rir?: number | null;
  durationSeconds?: number;
  distanceMeters?: number;
};

export type WorkoutExerciseLogRecord = {
  exerciseId: string | null;
  exerciseName: string;
  muscleGroup: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  exerciseType?: "weighted" | "bodyweight" | "assisted" | "duration" | "distance";
  setup?: WorkoutEquipmentSetup;
  notes: string;
  sets: WorkoutSetRecord[];
};

export type WorkoutSessionRecord = {
  id: string;
  clientDraftId?: string;
  schemaVersion?: number;
  routineId: string | null;
  routineName: string;
  performedOn: string;
  weightUnit?: "lb" | "kg";
  durationMinutes: number | null;
  notes: string;
  exercises: WorkoutExerciseLogRecord[];
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type WorkoutSessionDraft = Omit<
  WorkoutSessionRecord,
  "id" | "createdAt" | "updatedAt"
>;

function toDate(value: unknown) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeSession(snapshot: QueryDocumentSnapshot<DocumentData>) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    clientDraftId: typeof data.clientDraftId === "string" ? data.clientDraftId : undefined,
    schemaVersion: typeof data.schemaVersion === "number" ? data.schemaVersion : undefined,
    routineId: data.routineId || null,
    routineName: data.routineName || "",
    performedOn: data.performedOn || "",
    weightUnit: data.weightUnit === "kg" ? "kg" : "lb",
    durationMinutes: typeof data.durationMinutes === "number" ? data.durationMinutes : null,
    notes: data.notes || "",
    exercises: Array.isArray(data.exercises)
      ? data.exercises.map((exercise: WorkoutExerciseLogRecord) => ({
          ...exercise,
          setup: normalizeWorkoutEquipmentSetup(exercise?.setup),
        }))
      : [],
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } satisfies WorkoutSessionRecord;
}

function normalizeWorkoutSessionDraft(draft: WorkoutSessionDraft): WorkoutSessionDraft {
  return {
    ...draft,
    exercises: draft.exercises.map((exercise) => ({
      ...exercise,
      setup: normalizeWorkoutEquipmentSetup(exercise.setup),
    })),
  };
}

function getWorkoutSessionsCollection(userId: string) {
  return collection(db, "users", userId, "workoutSessions");
}

export function subscribeToWorkoutSessions(
  userId: string,
  callback: (records: WorkoutSessionRecord[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    getWorkoutSessionsCollection(userId),
    (snapshot: QuerySnapshot<DocumentData>) => {
      callback(
        snapshot.docs
          .map(normalizeSession)
          .sort((left, right) => {
            const byDate = right.performedOn.localeCompare(left.performedOn);
            if (byDate !== 0) return byDate;
            return (right.createdAt?.getTime() || 0) - (left.createdAt?.getTime() || 0);
          })
      );
    },
    (error) => onError?.(error)
  );
}

export async function createWorkoutSession(userId: string, draft: WorkoutSessionDraft) {
  const normalizedDraft = normalizeWorkoutSessionDraft(draft);
  if (draft.clientDraftId) {
    const reference = doc(getWorkoutSessionsCollection(userId), workoutSessionDocumentId(draft.clientDraftId));
    await runTransaction(db, async (transaction) => {
      const existing = await transaction.get(reference);
      if (existing.exists()) return;
      transaction.set(reference, {
        ...normalizedDraft,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
    return reference.id;
  }

  const reference = await addDoc(getWorkoutSessionsCollection(userId), {
    ...normalizedDraft,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reference.id;
}

export async function addSetToDailyWorkoutSession(
  userId: string,
  operation: QuickWorkoutCaptureIntent
) {
  if (operation.ownerId !== userId) throw new Error("Quick workout capture owner does not match the signed-in user.");
  const sessionsQuery = query(
    getWorkoutSessionsCollection(userId),
    where("performedOn", "==", operation.performedOn)
  );
  const snapshot = await getDocs(sessionsQuery);
  const existingSession = snapshot.docs
    .map(normalizeSession)
    .filter((session) => session.routineName === "Quick Add" || session.routineName === "Gym Log")
    .sort((left, right) => left.id.localeCompare(right.id))[0];
  const sessionId = existingSession?.id || quickWorkoutSessionDocumentId(operation.performedOn);
  const reference = doc(getWorkoutSessionsCollection(userId), sessionId);

  await runTransaction(db, async (transaction) => {
    const existingSnapshot = await transaction.get(reference);
    const existing = existingSnapshot.exists()
      ? existingSnapshot.data() as QuickWorkoutSession
      : null;
    const result = applyQuickWorkoutSetOperation(existing, operation);
    if (!result.applied) return;
    transaction.set(reference, {
      ...result.session,
      ...(existingSnapshot.exists() ? {} : { createdAt: serverTimestamp() }),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  });

  return reference.id;
}

export async function updateWorkoutSession(
  userId: string,
  sessionId: string,
  draft: WorkoutSessionDraft
) {
  const normalizedDraft = normalizeWorkoutSessionDraft(draft);
  await updateDoc(doc(db, "users", userId, "workoutSessions", sessionId), {
    ...normalizedDraft,
    updatedAt: serverTimestamp(),
  });
}

export async function removeWorkoutSession(userId: string, sessionId: string) {
  await deleteDoc(doc(db, "users", userId, "workoutSessions", sessionId));
}
