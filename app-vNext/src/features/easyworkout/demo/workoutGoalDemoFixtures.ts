import { E1RM_FORMULA_VERSION } from "../domain/workoutStatistics";
import { WEEKLY_WORKOUT_GOAL_FORMULA_VERSION, WORKOUT_GOAL_SCHEMA_VERSION, type WorkoutGoal } from "../domain/workoutGoals";

const stamp = new Date("2026-08-01T12:00:00Z");
export const workoutGoalDemoFixtures: WorkoutGoal[] = [
  { id: "weekly-completed-workouts", ownerId: "demo", schemaVersion: WORKOUT_GOAL_SCHEMA_VERSION, formulaVersion: WEEKLY_WORKOUT_GOAL_FORMULA_VERSION, goalType: "weekly-workouts", status: "active", target: 3, sourceUnit: "count", exerciseId: null, exerciseName: "", createdAt: stamp, updatedAt: stamp, archivedAt: null },
  { id: "exercise-e1rm-demo-bench", ownerId: "demo", schemaVersion: WORKOUT_GOAL_SCHEMA_VERSION, formulaVersion: E1RM_FORMULA_VERSION, goalType: "exercise-e1rm", status: "active", target: 220, sourceUnit: "lb", exerciseId: "demo-bench", exerciseName: "Bench Press", createdAt: stamp, updatedAt: stamp, archivedAt: null },
];
