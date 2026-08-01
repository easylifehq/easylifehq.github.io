import { convertWeight, isValidWorkingSet, type WorkoutDisplayUnit, type WorkoutExerciseType } from "./workoutStatistics.ts";

type RoutineExercise = { exerciseId: string | null; exerciseName: string; exerciseType?: WorkoutExerciseType; targetSets: number; targetReps: string; targetWeight: number | null };
export type GuidedRoutine = { id: string; name: string; dayLabel: string; exercises: RoutineExercise[]; createdAt?: Date | null; updatedAt?: Date | null };
type SessionSet = { reps?: number; weight?: number; durationSeconds?: number; distanceMeters?: number; completed?: boolean; deleted?: boolean; setType?: "warmup" | "standard" | "drop" | "failure" };
type SessionExercise = { exerciseId?: string | null; exerciseName?: string; exerciseType?: WorkoutExerciseType; sets?: SessionSet[] };
export type GuidedSession = { id: string; clientDraftId?: string; schemaVersion?: number; routineId?: string | null; routineName?: string; performedOn: string; weightUnit?: WorkoutDisplayUnit; durationMinutes?: number | null; notes?: string; exercises?: SessionExercise[]; createdAt?: Date | null; updatedAt?: Date | null };
export type GuidedExerciseSuggestion = { exerciseId: string | null; exerciseName: string; target: string; previous: string; suggestion: string; ruleId: "start-from-routine-v1" | "repeat-latest-effort-v1" | "optional-small-increase-v1"; sourceSessionId: string | null; sourceDate: string | null };
export type GuidedWorkoutPlan = { formulaVersion: "guided-workout-v1"; routineId: string; routineName: string; reason: string; lastPerformedOn: string | null; suggestions: GuidedExerciseSuggestion[] };
export type GuidedWorkoutAction = { label: "Start this routine" | "Resume saved draft"; to: string; note: string | null };

const exerciseKey = (exercise: { exerciseId?: string | null; exerciseName?: string }) => exercise.exerciseId || (exercise.exerciseName || "").trim().toLowerCase();
const targetRepCeiling = (target: string) => { const values = target.match(/\d+/g)?.map(Number) || []; return values.length ? Math.max(...values) : null; };
const formatNumber = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(1);
const matchingExercise = (session: GuidedSession, routineExercise: RoutineExercise) => (session.exercises || []).find((exercise) => exerciseKey(exercise) === exerciseKey(routineExercise)) || null;

function bestComparableSet(exercise: SessionExercise) {
  const kind = exercise.exerciseType || "weighted";
  const valid = (exercise.sets || []).filter((set) => isValidWorkingSet(set, kind));
  if (!valid.length) return null;
  if (kind === "duration") return valid.sort((a, b) => (b.durationSeconds || 0) - (a.durationSeconds || 0))[0];
  if (kind === "distance") return valid.sort((a, b) => (b.distanceMeters || 0) - (a.distanceMeters || 0))[0];
  if (kind === "bodyweight") return valid.sort((a, b) => (b.reps || 0) - (a.reps || 0))[0];
  return valid.sort((a, b) => (b.weight || 0) - (a.weight || 0) || (b.reps || 0) - (a.reps || 0))[0];
}

function formatPrevious(set: SessionSet, kind: WorkoutExerciseType, sourceUnit: WorkoutDisplayUnit, displayUnit: WorkoutDisplayUnit) {
  if (kind === "duration") return `${set.durationSeconds || 0} sec`;
  if (kind === "distance") return `${set.distanceMeters || 0} m`;
  if (kind === "bodyweight") return `${set.reps || 0} reps`;
  return `${formatNumber(convertWeight(set.weight || 0, sourceUnit, displayUnit))} ${displayUnit} × ${set.reps || 0}`;
}

export function selectGuidedRoutine(routines: GuidedRoutine[], sessions: GuidedSession[]) {
  return [...routines].sort((left, right) => {
    const leftDates = sessions.filter((session) => session.routineId === left.id || session.routineName === left.name).map((session) => session.performedOn).sort();
    const rightDates = sessions.filter((session) => session.routineId === right.id || session.routineName === right.name).map((session) => session.performedOn).sort();
    const lastLeft = leftDates[leftDates.length - 1] || "";
    const lastRight = rightDates[rightDates.length - 1] || "";
    return lastLeft.localeCompare(lastRight) || left.name.localeCompare(right.name);
  })[0] || null;
}

export function getGuidedWorkoutAction(routineId: string, isDemoMode: boolean, hasRestoredDraft: boolean): GuidedWorkoutAction {
  const demoParam = isDemoMode ? "&demo=1" : "";
  if (hasRestoredDraft) return {
    label: "Resume saved draft",
    to: `/app/easyworkout/log?workoutMode=1${demoParam}`,
    note: "Finish or discard the saved draft before starting this routine. EasyLife will not replace unsaved work.",
  };
  return {
    label: "Start this routine",
    to: `/app/easyworkout/log?routineId=${encodeURIComponent(routineId)}&workoutMode=1${demoParam}`,
    note: null,
  };
}

export function deriveGuidedWorkoutPlan(routine: GuidedRoutine, sessions: GuidedSession[], displayUnit: WorkoutDisplayUnit): GuidedWorkoutPlan {
  const routineSessions = sessions.filter((session) => session.routineId === routine.id || session.routineName === routine.name)
    .sort((left, right) => right.performedOn.localeCompare(left.performedOn) || right.id.localeCompare(left.id));
  const suggestions = routine.exercises.map((exercise): GuidedExerciseSuggestion => {
    const history = sessions.map((session) => ({ session, exercise: matchingExercise(session, exercise) }))
      .filter((entry): entry is { session: GuidedSession; exercise: SessionExercise } => Boolean(entry.exercise))
      .map((entry) => ({ ...entry, set: bestComparableSet(entry.exercise) }))
      .filter((entry): entry is typeof entry & { set: SessionSet } => Boolean(entry.set))
      .sort((left, right) => right.session.performedOn.localeCompare(left.session.performedOn) || right.session.id.localeCompare(left.session.id));
    const latest = history[0];
    const prior = history[1];
    const kind = latest?.exercise.exerciseType || exercise.exerciseType || "weighted";
    const target = `${exercise.targetSets} × ${exercise.targetReps}${exercise.targetWeight ? ` at ${exercise.targetWeight} ${displayUnit}` : ""}`;
    if (!latest) return { exerciseId: exercise.exerciseId, exerciseName: exercise.exerciseName, target, previous: "No comparable saved set", suggestion: "Start from the saved routine target and choose a comfortable effort.", ruleId: "start-from-routine-v1", sourceSessionId: null, sourceDate: null };
    const sourceUnit = latest.session.weightUnit || "lb";
    const previous = formatPrevious(latest.set, kind, sourceUnit, displayUnit);
    const repCeiling = targetRepCeiling(exercise.targetReps);
    const latestWeight = convertWeight(latest.set.weight || 0, sourceUnit, displayUnit);
    const priorWeight = prior ? convertWeight(prior.set.weight || 0, prior.session.weightUnit || "lb", displayUnit) : 0;
    const supportsIncrease = kind === "weighted" && Boolean(prior && repCeiling && (latest.set.reps || 0) >= repCeiling && (prior.set.reps || 0) >= repCeiling && Math.abs(latestWeight - priorWeight) < 0.1);
    if (supportsIncrease) {
      const increment = displayUnit === "kg" ? 2.5 : 5;
      return { exerciseId: exercise.exerciseId, exerciseName: exercise.exerciseName, target, previous, suggestion: `Optional: try ${formatNumber(latestWeight + increment)} ${displayUnit} for ${exercise.targetReps}. Repeat ${previous} if readiness or form is uncertain.`, ruleId: "optional-small-increase-v1", sourceSessionId: latest.session.id, sourceDate: latest.session.performedOn };
    }
    return { exerciseId: exercise.exerciseId, exerciseName: exercise.exerciseName, target, previous, suggestion: `Repeat the latest comparable effort: ${previous}. Progress only after the saved target feels controlled.`, ruleId: "repeat-latest-effort-v1", sourceSessionId: latest.session.id, sourceDate: latest.session.performedOn };
  });
  return { formulaVersion: "guided-workout-v1", routineId: routine.id, routineName: routine.name, reason: routineSessions[0] ? `This saved routine was last completed ${routineSessions[0].performedOn}; EasyLife is rotating to the least-recent routine.` : "This saved routine has no matching session yet, so it comes first.", lastPerformedOn: routineSessions[0]?.performedOn || null, suggestions };
}
