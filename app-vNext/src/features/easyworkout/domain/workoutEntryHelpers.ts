import type { WorkoutSessionRecord } from "../../../lib/firestore/workoutSessions.ts";
import type { WorkoutExerciseLogDraft } from "./workoutDraftLifecycle.ts";
export function formatWorkoutExerciseName(name: string) {
  const acronyms = new Set(["DB", "BB", "EZ", "RDL", "TRX", "HIIT"]);
  return name.trim().replace(/\s+/g, " ").replace(/[A-Za-z]+/g, word => acronyms.has(word.toUpperCase()) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}
/** Notes remain reference choices scoped to the exact exercise name, type and load convention. */
export function workoutQuickNoteChoices(sessions: WorkoutSessionRecord[], exercise: WorkoutExerciseLogDraft) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const session of [...sessions].sort((a,b) => b.performedOn.localeCompare(a.performedOn))) {
    for (const entry of session.exercises) {
      if ((entry.exerciseId || null) !== (exercise.exerciseId || null)) continue;
      if (entry.exerciseName.trim().toLowerCase() !== exercise.exerciseName.trim().toLowerCase() || (entry.exerciseType || "weighted") !== exercise.exerciseType || entry.loadMode !== exercise.loadMode) continue;
      const note = entry.notes.trim();
      if (!note || seen.has(note.toLowerCase())) continue;
      seen.add(note.toLowerCase()); result.push(note);
      if (result.length === 12) return result;
    }
  }
  return result;
}
