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

export type RoutineExerciseDraft = {
  exerciseId: string | null;
  exerciseName: string;
  muscleGroup: string;
  targetSets: number;
  targetReps: string;
  targetWeight: number | null;
  restSeconds: number | null;
  notes: string;
};

export type WorkoutRoutineRecord = {
  id: string;
  name: string;
  notes: string;
  dayLabel: string;
  exercises: RoutineExerciseDraft[];
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type WorkoutRoutineDraft = Omit<
  WorkoutRoutineRecord,
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

function normalizeRoutine(snapshot: QueryDocumentSnapshot<DocumentData>) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    name: data.name || "",
    notes: data.notes || "",
    dayLabel: data.dayLabel || "",
    exercises: Array.isArray(data.exercises) ? data.exercises : [],
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } satisfies WorkoutRoutineRecord;
}

function getWorkoutRoutinesCollection(userId: string) {
  return collection(db, "users", userId, "workoutRoutines");
}

export function subscribeToWorkoutRoutines(
  userId: string,
  callback: (records: WorkoutRoutineRecord[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    getWorkoutRoutinesCollection(userId),
    (snapshot: QuerySnapshot<DocumentData>) => {
      callback(
        snapshot.docs
          .map(normalizeRoutine)
          .sort((left, right) => (right.updatedAt?.getTime() || 0) - (left.updatedAt?.getTime() || 0))
      );
    },
    (error) => onError?.(error)
  );
}

export async function createWorkoutRoutine(userId: string, draft: WorkoutRoutineDraft) {
  const reference = await addDoc(getWorkoutRoutinesCollection(userId), {
    ...draft,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reference.id;
}

export async function updateWorkoutRoutine(
  userId: string,
  routineId: string,
  draft: WorkoutRoutineDraft
) {
  await updateDoc(doc(db, "users", userId, "workoutRoutines", routineId), {
    ...draft,
    updatedAt: serverTimestamp(),
  });
}

export async function removeWorkoutRoutine(userId: string, routineId: string) {
  await deleteDoc(doc(db, "users", userId, "workoutRoutines", routineId));
}
