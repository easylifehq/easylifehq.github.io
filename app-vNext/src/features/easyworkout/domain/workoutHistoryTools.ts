import { deriveWorkoutStatistics, isValidLocalDateKey, shiftDateKey, WORKOUT_STATISTICS_FORMULA_VERSION, type WorkoutDisplayUnit } from "./workoutStatistics.ts";
import type { GuidedRoutine, GuidedSession } from "./guidedWorkoutPlan.ts";

export type WorkoutHistoryFilters = { routineId: string; exerciseQuery: string; periodDays: number | null; prOnly: boolean };

export function getWorkoutPrSessionIds(sessions: GuidedSession[], displayUnit: WorkoutDisplayUnit) {
  const dates = sessions.map((session) => session.performedOn).filter(isValidLocalDateKey).sort();
  const nowDateKey = dates[dates.length - 1] || "1970-01-01";
  const statistics = deriveWorkoutStatistics(sessions, { nowDateKey, periodDays: 28, displayUnit });
  return new Set(statistics.exerciseSummaries.flatMap((summary) => summary.records.map((record) => record.sourceWorkoutId)));
}

export function filterWorkoutHistory(sessions: GuidedSession[], filters: WorkoutHistoryFilters, displayUnit: WorkoutDisplayUnit, nowDateKey: string) {
  const query = filters.exerciseQuery.trim().toLowerCase();
  const earliest = filters.periodDays ? shiftDateKey(nowDateKey, -(filters.periodDays - 1)) : null;
  const prSessionIds = filters.prOnly ? getWorkoutPrSessionIds(sessions, displayUnit) : null;
  return sessions.filter((session) => !earliest || session.performedOn >= earliest)
    .filter((session) => filters.routineId === "all" || session.routineId === filters.routineId)
    .filter((session) => !query || (session.routineName || "").toLowerCase().includes(query) || (session.exercises || []).some((exercise) => (exercise.exerciseName || "").toLowerCase().includes(query)))
    .filter((session) => !prSessionIds || prSessionIds.has(session.id))
    .sort((left, right) => right.performedOn.localeCompare(left.performedOn) || right.id.localeCompare(left.id));
}

const isoOrNull = (value: unknown) => value instanceof Date ? value.toISOString() : null;

export function createWorkoutExportPayload(input: {
  routines: Array<GuidedRoutine & { createdAt?: Date | null; updatedAt?: Date | null }>;
  sessions: Array<GuidedSession & { createdAt?: Date | null; updatedAt?: Date | null; durationMinutes?: number | null; notes?: string; clientDraftId?: string; schemaVersion?: number }>;
  exportedAt: string;
  displayUnit: WorkoutDisplayUnit;
}) {
  return {
    exportVersion: "easyworkout-export-v1" as const,
    schemaVersion: 1,
    formulaVersion: WORKOUT_STATISTICS_FORMULA_VERSION,
    exportedAt: input.exportedAt,
    displayUnit: input.displayUnit,
    routines: input.routines.map((routine) => ({ ...routine, createdAt: isoOrNull(routine.createdAt), updatedAt: isoOrNull(routine.updatedAt) })),
    sessions: input.sessions.map((session) => ({ ...session, weightUnit: session.weightUnit || "lb", createdAt: isoOrNull(session.createdAt), updatedAt: isoOrNull(session.updatedAt) })),
  };
}

const csvCell = (value: unknown) => {
  const serialized = String(value ?? "");
  const safe = typeof value === "string" && /^\s*[=+\-@]/.test(serialized) ? `'${serialized}` : serialized;
  return `"${safe.replace(/"/g, '""')}"`;
};

export function serializeWorkoutCsv(payload: ReturnType<typeof createWorkoutExportPayload>) {
  const header = ["exportVersion", "formulaVersion", "sessionId", "clientDraftId", "performedOn", "createdAt", "updatedAt", "routineId", "routineName", "durationMinutes", "storedWeightUnit", "exerciseId", "exerciseName", "exerciseType", "muscleGroup", "setNumber", "setType", "completed", "deleted", "reps", "weight", "durationSeconds", "distanceMeters", "rir", "setNotes", "sessionNotes"];
  const rows: unknown[][] = [];
  payload.sessions.forEach((session) => (session.exercises || []).forEach((exercise) => (exercise.sets || []).forEach((set, index) => rows.push([
    payload.exportVersion, payload.formulaVersion, session.id, session.clientDraftId, session.performedOn, session.createdAt, session.updatedAt, session.routineId, session.routineName, session.durationMinutes, session.weightUnit,
    exercise.exerciseId, exercise.exerciseName, exercise.exerciseType || "weighted", (exercise as { muscleGroup?: string }).muscleGroup, index + 1, set.setType || "standard", set.completed !== false, Boolean(set.deleted), set.reps, set.weight, set.durationSeconds, set.distanceMeters, (set as { rir?: number | null }).rir, (set as { notes?: string }).notes, session.notes,
  ]))));
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}
