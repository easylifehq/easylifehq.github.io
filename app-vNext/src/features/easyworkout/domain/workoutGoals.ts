export const WORKOUT_GOAL_SCHEMA_VERSION = "easyworkout-goal-v1";
export const WEEKLY_WORKOUT_GOAL_FORMULA_VERSION = "completed-workout-week-v1";

import {
  E1RM_FORMULA_VERSION,
  convertWeight,
  estimateOneRepMax,
  isValidLocalDateKey,
  isValidWorkingSet,
  shiftDateKey,
  type AnalyticsSession,
  type WorkoutDisplayUnit,
} from "./workoutStatistics.ts";

export type WorkoutGoalType = "weekly-workouts" | "exercise-e1rm";
export type WorkoutGoalStatus = "active" | "paused" | "archived";
export type WorkoutGoal = {
  id: string;
  ownerId: string;
  schemaVersion: typeof WORKOUT_GOAL_SCHEMA_VERSION;
  formulaVersion: typeof WEEKLY_WORKOUT_GOAL_FORMULA_VERSION | typeof E1RM_FORMULA_VERSION;
  goalType: WorkoutGoalType;
  status: WorkoutGoalStatus;
  target: number;
  sourceUnit: "count" | WorkoutDisplayUnit;
  exerciseId: string | null;
  exerciseName: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  archivedAt: Date | null;
};

export type WorkoutGoalDraft = Pick<WorkoutGoal, "goalType" | "target" | "sourceUnit" | "exerciseId" | "exerciseName">;

export type WorkoutGoalProgress = {
  goal: WorkoutGoal;
  current: number;
  target: number;
  unit: "workouts" | WorkoutDisplayUnit;
  achieved: boolean;
  sampleSize: number;
  periodLabel: string;
  sourceWorkoutId: string | null;
  confidence: "insufficient" | "low" | "high";
};

export function workoutGoalDocumentId(draft: Pick<WorkoutGoalDraft, "goalType" | "exerciseId">) {
  if (draft.goalType === "weekly-workouts") return "weekly-completed-workouts";
  const source = draft.exerciseId?.trim() || "unknown";
  return `exercise-e1rm-${encodeURIComponent(source)}`;
}

export function deriveWorkoutGoalProgress(goals: WorkoutGoal[], sessions: AnalyticsSession[], options: { nowDateKey: string }): WorkoutGoalProgress[] {
  const nowDateKey = isValidLocalDateKey(options.nowDateKey) ? options.nowDateKey : "1970-01-01";
  const date = new Date(`${nowDateKey}T12:00:00`);
  const weekStart = shiftDateKey(nowDateKey, -date.getDay());
  const eligibleSessions = sessions.filter((session) => isValidLocalDateKey(session.performedOn) && session.performedOn <= nowDateKey);
  return goals.map((goal) => {
    if (goal.goalType === "weekly-workouts") {
      const sources = eligibleSessions.filter((session) => session.performedOn >= weekStart);
      return {
        goal,
        current: sources.length,
        target: goal.target,
        unit: "workouts",
        achieved: sources.length >= goal.target,
        sampleSize: sources.length,
        periodLabel: `${weekStart}–${nowDateKey}`,
        sourceWorkoutId: sources.sort((left, right) => right.performedOn.localeCompare(left.performedOn))[0]?.id || null,
        confidence: sources.length ? "high" : "insufficient",
      };
    }
    const candidates = eligibleSessions.flatMap((session) => (session.exercises || [])
      .filter((exercise) => exercise.exerciseId === goal.exerciseId)
      .flatMap((exercise) => (exercise.sets || [])
        .filter((set) => isValidWorkingSet(set, exercise.exerciseType || "weighted"))
        .map((set) => ({ session, set, estimate: exercise.exerciseType === "weighted" ? estimateOneRepMax(set.weight || 0, set.reps || 0) : null }))))
      .filter((entry): entry is typeof entry & { estimate: NonNullable<typeof entry.estimate> } => Boolean(entry.estimate))
      .map((entry) => ({
        sessionId: entry.session.id,
        performedOn: entry.session.performedOn,
        value: convertWeight(entry.estimate.value, entry.session.weightUnit || "lb", goal.sourceUnit === "kg" ? "kg" : "lb"),
        confidence: entry.estimate.confidence,
      }))
      .sort((left, right) => right.value - left.value || left.performedOn.localeCompare(right.performedOn));
    const best = candidates[0];
    return {
      goal,
      current: best?.value || 0,
      target: goal.target,
      unit: goal.sourceUnit === "kg" ? "kg" : "lb",
      achieved: Boolean(best && best.value >= goal.target),
      sampleSize: candidates.length,
      periodLabel: "all completed history",
      sourceWorkoutId: best?.sessionId || null,
      confidence: !best ? "insufficient" : best.confidence === "low" ? "low" : "high",
    };
  });
}
