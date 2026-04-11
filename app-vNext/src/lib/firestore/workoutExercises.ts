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

export type WorkoutExerciseRecord = {
  id: string;
  name: string;
  muscleGroup: string;
  notes: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type WorkoutExerciseDraft = Omit<
  WorkoutExerciseRecord,
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

function normalizeExercise(snapshot: QueryDocumentSnapshot<DocumentData>) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    name: data.name || "",
    muscleGroup: data.muscleGroup || "",
    notes: data.notes || "",
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } satisfies WorkoutExerciseRecord;
}

function getWorkoutExercisesCollection(userId: string) {
  return collection(db, "users", userId, "workoutExercises");
}

export function subscribeToWorkoutExercises(
  userId: string,
  callback: (records: WorkoutExerciseRecord[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    getWorkoutExercisesCollection(userId),
    (snapshot: QuerySnapshot<DocumentData>) => {
      callback(
        snapshot.docs
          .map(normalizeExercise)
          .sort((left, right) => left.name.localeCompare(right.name))
      );
    },
    (error) => onError?.(error)
  );
}

export async function createWorkoutExercise(userId: string, draft: WorkoutExerciseDraft) {
  const reference = await addDoc(getWorkoutExercisesCollection(userId), {
    ...draft,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reference.id;
}

export async function updateWorkoutExercise(
  userId: string,
  exerciseId: string,
  draft: WorkoutExerciseDraft
) {
  await updateDoc(doc(db, "users", userId, "workoutExercises", exerciseId), {
    ...draft,
    updatedAt: serverTimestamp(),
  });
}

export async function removeWorkoutExercise(userId: string, exerciseId: string) {
  await deleteDoc(doc(db, "users", userId, "workoutExercises", exerciseId));
}
