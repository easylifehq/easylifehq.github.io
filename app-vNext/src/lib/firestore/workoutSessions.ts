import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
  type QuerySnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export type WorkoutSetRecord = {
  reps: number;
  weight: number;
  notes: string;
};

export type WorkoutExerciseLogRecord = {
  exerciseId: string | null;
  exerciseName: string;
  muscleGroup: string;
  notes: string;
  sets: WorkoutSetRecord[];
};

export type WorkoutSessionRecord = {
  id: string;
  routineId: string | null;
  routineName: string;
  performedOn: string;
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
    routineId: data.routineId || null,
    routineName: data.routineName || "",
    performedOn: data.performedOn || "",
    durationMinutes: typeof data.durationMinutes === "number" ? data.durationMinutes : null,
    notes: data.notes || "",
    exercises: Array.isArray(data.exercises) ? data.exercises : [],
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } satisfies WorkoutSessionRecord;
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
  const reference = await addDoc(getWorkoutSessionsCollection(userId), {
    ...draft,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reference.id;
}

export async function updateWorkoutSession(
  userId: string,
  sessionId: string,
  draft: WorkoutSessionDraft
) {
  await updateDoc(doc(db, "users", userId, "workoutSessions", sessionId), {
    ...draft,
    updatedAt: serverTimestamp(),
  });
}

export async function removeWorkoutSession(userId: string, sessionId: string) {
  await deleteDoc(doc(db, "users", userId, "workoutSessions", sessionId));
}
