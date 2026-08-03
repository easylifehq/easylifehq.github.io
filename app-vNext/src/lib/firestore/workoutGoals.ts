import { collection, doc, onSnapshot, runTransaction, serverTimestamp, updateDoc, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import {
  E1RM_FORMULA_VERSION,
} from "@/features/easyworkout/domain/workoutStatistics";
import {
  WEEKLY_WORKOUT_GOAL_FORMULA_VERSION,
  WORKOUT_GOAL_SCHEMA_VERSION,
  workoutGoalDocumentId,
  type WorkoutGoal,
  type WorkoutGoalDraft,
  type WorkoutGoalStatus,
} from "@/features/easyworkout/domain/workoutGoals";

const toDate = (value: unknown) => value instanceof Date ? value : typeof (value as { toDate?: () => Date } | null)?.toDate === "function" ? (value as { toDate: () => Date }).toDate() : null;
const goalsCollection = (userId: string) => collection(db, "users", userId, "workoutGoals");

function normalizeGoal(snapshot: QueryDocumentSnapshot<DocumentData>): WorkoutGoal | null {
  const data = snapshot.data();
  if (data.schemaVersion !== WORKOUT_GOAL_SCHEMA_VERSION || !["weekly-workouts", "exercise-e1rm"].includes(data.goalType)) return null;
  return {
    id: snapshot.id,
    ownerId: typeof data.ownerId === "string" ? data.ownerId : "",
    schemaVersion: WORKOUT_GOAL_SCHEMA_VERSION,
    formulaVersion: data.goalType === "weekly-workouts" ? WEEKLY_WORKOUT_GOAL_FORMULA_VERSION : E1RM_FORMULA_VERSION,
    goalType: data.goalType,
    status: ["active", "paused", "archived"].includes(data.status) ? data.status : "paused",
    target: typeof data.target === "number" ? data.target : 0,
    sourceUnit: data.sourceUnit === "kg" ? "kg" : data.sourceUnit === "lb" ? "lb" : "count",
    exerciseId: typeof data.exerciseId === "string" ? data.exerciseId : null,
    exerciseName: typeof data.exerciseName === "string" ? data.exerciseName : "",
    createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt), archivedAt: toDate(data.archivedAt),
  };
}

export function subscribeToWorkoutGoals(userId: string, callback: (goals: WorkoutGoal[]) => void, onError?: (error: Error) => void) {
  return onSnapshot(goalsCollection(userId), (snapshot) => callback(snapshot.docs.map(normalizeGoal).filter((goal): goal is WorkoutGoal => Boolean(goal)).sort((a, b) => a.id.localeCompare(b.id))), onError);
}

export async function createWorkoutGoal(userId: string, draft: WorkoutGoalDraft) {
  const id = workoutGoalDocumentId(draft);
  const reference = doc(goalsCollection(userId), id);
  await runTransaction(db, async (transaction) => {
    if ((await transaction.get(reference)).exists()) return;
    transaction.set(reference, {
      ...draft,
      ownerId: userId,
      schemaVersion: WORKOUT_GOAL_SCHEMA_VERSION,
      formulaVersion: draft.goalType === "weekly-workouts" ? WEEKLY_WORKOUT_GOAL_FORMULA_VERSION : E1RM_FORMULA_VERSION,
      status: "active",
      archivedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
  return id;
}

export async function editWorkoutGoal(userId: string, goalId: string, changes: Pick<WorkoutGoalDraft, "target" | "sourceUnit" | "exerciseId" | "exerciseName">) {
  await updateDoc(doc(goalsCollection(userId), goalId), { ...changes, updatedAt: serverTimestamp() });
}

export async function setWorkoutGoalStatus(userId: string, goalId: string, status: WorkoutGoalStatus) {
  await updateDoc(doc(goalsCollection(userId), goalId), { status, archivedAt: status === "archived" ? serverTimestamp() : null, updatedAt: serverTimestamp() });
}
