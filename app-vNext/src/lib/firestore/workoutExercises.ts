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
import {
  normalizeWorkoutExercisePlanningMetadata,
  type WorkoutExercisePlanningMetadata,
} from "@/features/easyworkout/domain/workoutPlanning";
import type { WorkoutDraftExerciseType } from "@/features/easyworkout/domain/workoutDraftLifecycle";

export type WorkoutExerciseRecord = {
  id: string;
  name: string;
  muscleGroup: string;
  exerciseType?: WorkoutDraftExerciseType;
  planningMetadata?: WorkoutExercisePlanningMetadata | null;
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
  const exerciseType = ["weighted", "bodyweight", "assisted", "duration", "distance"].includes(String(data.exerciseType))
    ? data.exerciseType as WorkoutDraftExerciseType
    : undefined;

  return {
    id: snapshot.id,
    name: data.name || "",
    muscleGroup: data.muscleGroup || "",
    exerciseType,
    planningMetadata: normalizeWorkoutExercisePlanningMetadata(data.planningMetadata),
    notes: data.notes || "",
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } satisfies WorkoutExerciseRecord;
}

function exercisePayload(draft: WorkoutExerciseDraft) {
  return {
    name: draft.name.trim(),
    muscleGroup: draft.muscleGroup.trim(),
    notes: draft.notes.trim(),
    exerciseType: draft.exerciseType || "weighted",
    planningMetadata: normalizeWorkoutExercisePlanningMetadata(draft.planningMetadata) || null,
  };
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
    ...exercisePayload(draft),
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
    ...exercisePayload(draft),
    updatedAt: serverTimestamp(),
  });
}

export async function removeWorkoutExercise(userId: string, exerciseId: string) {
  await deleteDoc(doc(db, "users", userId, "workoutExercises", exerciseId));
}
