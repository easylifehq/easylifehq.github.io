import type { WorkoutSessionRecord, WorkoutExerciseLogRecord } from "../../../lib/firestore/workoutSessions.ts";
import { convertWeight, isValidWorkingSet, sessionRequiresExplicitCompletion } from "./workoutStatistics.ts";
const identity = (e: WorkoutExerciseLogRecord) => JSON.stringify([e.exerciseName.trim().toLowerCase(), e.exerciseId || null, e.exerciseType || "weighted", e.loadMode || "unspecified"]);
const rows = (e: WorkoutExerciseLogRecord, s: WorkoutSessionRecord) => e.sets.filter(row => isValidWorkingSet(row, e.exerciseType || "weighted", { requiresExplicitCompletion: sessionRequiresExplicitCompletion(s) }));
const workload = (e: WorkoutExerciseLogRecord, s: WorkoutSessionRecord) => rows(e,s).reduce((total,row) => total + row.reps * convertWeight(row.weight,s.weightUnit || "lb","lb"),0);
/** Optional workload index, never an effort, fitness or recovery rating. 100 is the owner's median. */
export function workoutHistoryScore(current: WorkoutSessionRecord, history: WorkoutSessionRecord[]): { score: number | null; explanation: string } {
  const insufficient = { score: null, explanation: "Insufficient comparable history. Each logged exercise needs three earlier weighted workouts with the same variant, load convention and working-set count." };
  const entries = current.exercises.filter(e => rows(e,current).length);
  if (!entries.length || entries.some(e => (e.exerciseType || "weighted") !== "weighted") || new Set(entries.map(identity)).size !== entries.length) return insufficient;
  const ratios: number[] = [];
  const distinctHistory = [...new Map(history.map(s => [s.id, s])).values()];
  for (const entry of entries) {
    const samples = distinctHistory.filter(s => s.id !== current.id && s.performedOn < current.performedOn).sort((a,b) => b.performedOn.localeCompare(a.performedOn)).flatMap(s => {
      const matches = s.exercises.filter(e => identity(e) === identity(entry) && rows(e,s).length === rows(entry,current).length);
      return matches.length === 1 ? [workload(matches[0],s)] : [];
    }).filter(n => Number.isFinite(n) && n > 0).slice(0,3);
    if (samples.length < 3) return insufficient;
    samples.sort((a,b) => a-b); ratios.push(workload(entry,current)/samples[1]);
  }
  const score = Math.round(100 * ratios.reduce((a,b) => a+b,0)/ratios.length);
  if (!Number.isFinite(score)) return insufficient;
  return { score, explanation: "100 = your median weighted workload across three earlier comparable workouts per exercise. This averages exercise ratios; it does not rate effort or judge an easy day. Bodyweight, assisted and timed work are not scored." };
}
