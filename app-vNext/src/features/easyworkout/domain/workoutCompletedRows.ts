import type { WorkoutExerciseLogDraft } from "./workoutDraftLifecycle.ts";
import { isValidWorkingSet } from "./workoutStatistics.ts";
/** A completion flag alone cannot make an invalid or deleted row a performed set. */
export function completedWorkoutRows(exercise: WorkoutExerciseLogDraft) {
  return exercise.sets.filter(set => isValidWorkingSet({ ...set, setType: "standard" }, exercise.exerciseType, { requiresExplicitCompletion: true }));
}
