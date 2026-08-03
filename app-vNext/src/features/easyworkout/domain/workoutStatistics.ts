export const WORKOUT_STATISTICS_FORMULA_VERSION = "easyworkout-stats-v1";
export const E1RM_FORMULA_VERSION = "epley-v1";
export const SECONDARY_MUSCLE_EXPOSURE_COEFFICIENT = 0.5;
export const ROUTINE_COMPARISON_FORMULA_VERSION = "easyworkout-routine-comparison-v1";

export type WorkoutDisplayUnit = "lb" | "kg";
export type WorkoutExerciseType = "weighted" | "bodyweight" | "assisted" | "duration" | "distance";
export type WorkoutSetType = "warmup" | "standard" | "drop" | "failure";
export type DataConfidence = "insufficient" | "low" | "medium" | "high";

export type AnalyticsSet = {
  reps?: number;
  weight?: number;
  notes?: string;
  setType?: WorkoutSetType;
  completed?: boolean;
  deleted?: boolean;
  rir?: number | null;
  durationSeconds?: number;
  distanceMeters?: number;
};
export type AnalyticsExercise = {
  exerciseId?: string | null;
  exerciseName?: string;
  muscleGroup?: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  exerciseType?: WorkoutExerciseType;
  sets?: AnalyticsSet[];
};
export type AnalyticsSession = {
  id: string;
  routineId?: string | null;
  routineName?: string;
  performedOn: string;
  weightUnit?: WorkoutDisplayUnit;
  durationMinutes?: number | null;
  exercises?: AnalyticsExercise[];
};
export type RoutineComparisonMetric = { current: number | null; previous: number | null; percentDelta: number | null; currentSamples: number; previousSamples: number };
export type RoutineComparison = {
  routineId: string;
  routineName: string;
  currentSessionCount: number;
  previousSessionCount: number;
  completedWorkingSets: RoutineComparisonMetric;
  normalizedVolume: RoutineComparisonMetric;
  averageDurationMinutes: RoutineComparisonMetric;
  prCount: RoutineComparisonMetric;
};
export type ExerciseObservation = {
  sessionId: string;
  performedOn: string;
  estimatedOneRepMax: number;
  confidence: DataConfidence;
  sourceReps: number;
  sourceWeight: number;
  sessionVolume: number;
};
export type ExerciseRecord = {
  type: "heaviest-weight" | "most-reps" | "estimated-1rm" | "set-volume" | "session-volume" | "rep-record";
  label: string;
  value: number;
  unit: string;
  sourceWorkoutId: string;
  performedOn: string;
  previousValue: number | null;
};
export type ExerciseSummary = {
  exerciseKey: string;
  exerciseId: string | null;
  exerciseName: string;
  sessionCount: number;
  observations: ExerciseObservation[];
  records: ExerciseRecord[];
  trend: "improving" | "plateau" | "declining" | "insufficient";
  trendConfidence: DataConfidence;
  trendChangePercent: number | null;
};
export type PeriodMetric = { current: number; previous: number; delta: number; percentDelta: number | null };
export type WorkoutStatistics = {
  formulaVersion: string;
  period: { days: number; currentStart: string; currentEnd: string; previousStart: string; previousEnd: string };
  pulse: {
    sessions: PeriodMetric;
    durationMinutes: PeriodMetric;
    workingSets: PeriodMetric;
    workload: PeriodMetric;
    currentSampleSize: number;
    previousSampleSize: number;
  };
  weeklyConsistency: Array<{ weekStart: string; sessions: number }>;
  muscleExposure: Array<{ muscle: string; directSets: number; secondarySets: number; estimatedExposure: number; frequency: number }>;
  unmappedWorkingSets: number;
  exerciseSummaries: ExerciseSummary[];
  insight: { ruleId: string; title: string; explanation: string; confidence: DataConfidence; sourceWorkoutIds: string[] };
};

const finite = (value: unknown) => typeof value === "number" && Number.isFinite(value);
const nonNegative = (value: unknown) => (finite(value) && (value as number) >= 0 ? (value as number) : null);
const getExerciseType = (exercise: AnalyticsExercise): WorkoutExerciseType => exercise.exerciseType || "weighted";
const getSetType = (set: AnalyticsSet): WorkoutSetType => set.setType || "standard";

export function isValidWorkingSet(set: AnalyticsSet, kind: WorkoutExerciseType = "weighted") {
  if (set.deleted || set.completed === false || getSetType(set) === "warmup") return false;
  if (kind === "duration") return (nonNegative(set.durationSeconds) ?? 0) > 0;
  if (kind === "distance") return (nonNegative(set.distanceMeters) ?? 0) > 0;
  if (kind === "bodyweight") return (nonNegative(set.reps) ?? 0) > 0;
  if (kind === "assisted") return (nonNegative(set.reps) ?? 0) > 0 && nonNegative(set.weight) !== null;
  return (nonNegative(set.reps) ?? 0) > 0 && (nonNegative(set.weight) ?? 0) > 0;
}

export function weightedSetVolume(set: AnalyticsSet, kind: WorkoutExerciseType = "weighted") {
  if (kind !== "weighted" || !isValidWorkingSet(set, kind)) return 0;
  return (nonNegative(set.weight) || 0) * (nonNegative(set.reps) || 0);
}

export function estimateOneRepMax(weight: number, reps: number) {
  if (!finite(weight) || !finite(reps) || weight <= 0 || reps <= 0 || reps > 15) return null;
  return {
    value: reps === 1 ? weight : weight * (1 + reps / 30),
    confidence: (reps <= 10 ? "high" : "low") as DataConfidence,
    formulaVersion: E1RM_FORMULA_VERSION,
  };
}

export function convertWeight(value: number, from: WorkoutDisplayUnit, to: WorkoutDisplayUnit) {
  if (!finite(value)) return 0;
  if (from === to) return value;
  return from === "lb" ? value / 2.2046226218 : value * 2.2046226218;
}

export function deriveRoutineComparisons(sessionsInput: AnalyticsSession[], options: { nowDateKey: string; periodDays: number; displayUnit: WorkoutDisplayUnit; routineId?: string }): RoutineComparison[] {
  const days = Math.max(1, Math.floor(options.periodDays));
  const currentStart = shiftDateKey(options.nowDateKey, -(days - 1));
  const previousEnd = shiftDateKey(currentStart, -1);
  const previousStart = shiftDateKey(previousEnd, -(days - 1));
  const sessions = sessionsInput.filter((session) => isValidLocalDateKey(session.performedOn) && session.performedOn <= options.nowDateKey);
  const prSessionIds = new Set<string>();
  const bestE1rm = new Map<string, number>();
  [...sessions].sort((a, b) => a.performedOn.localeCompare(b.performedOn) || a.id.localeCompare(b.id)).forEach((session) => {
    let newRecord = false;
    (session.exercises || []).forEach((exercise) => {
      if (getExerciseType(exercise) !== "weighted") return;
      const key = exerciseKey(exercise);
      validSets(exercise).forEach((set) => {
        const estimate = estimateOneRepMax(set.weight || 0, set.reps || 0);
        if (!estimate) return;
        const value = convertWeight(estimate.value, session.weightUnit || "lb", options.displayUnit);
        if (value > (bestE1rm.get(key) || 0)) { bestE1rm.set(key, value); newRecord = true; }
      });
    });
    if (newRecord) prSessionIds.add(session.id);
  });
  const groups = new Map<string, { name: string; sessions: AnalyticsSession[] }>();
  sessions.forEach((session) => {
    const id = session.routineId || "unassigned";
    if (options.routineId && options.routineId !== "all" && id !== options.routineId) return;
    const current = groups.get(id) || { name: session.routineName || "Unassigned workouts", sessions: [] };
    current.sessions.push(session); groups.set(id, current);
  });
  const percent = (current: number | null, previous: number | null, currentSamples: number, previousSamples: number) => previous !== null && previous > 0 && current !== null && currentSamples > 0 && previousSamples > 0 ? ((current - previous) / previous) * 100 : null;
  return [...groups.entries()].map(([routineId, group]) => {
    const summarize = (start: string, end: string) => {
      const windowSessions = group.sessions.filter((session) => session.performedOn >= start && session.performedOn <= end);
      let sets = 0, volume = 0;
      const durations: number[] = [];
      windowSessions.forEach((session) => {
        if (typeof session.durationMinutes === "number" && Number.isFinite(session.durationMinutes) && session.durationMinutes >= 0) durations.push(session.durationMinutes);
        (session.exercises || []).forEach((exercise) => {
          const valid = validSets(exercise); sets += valid.length;
          volume += convertWeight(valid.reduce((sum, set) => sum + weightedSetVolume(set, getExerciseType(exercise)), 0), session.weightUnit || "lb", options.displayUnit);
        });
      });
      return { sessions: windowSessions.length, sets, volume, duration: durations.length ? durations.reduce((sum, value) => sum + value, 0) / durations.length : null, durationSamples: durations.length, prs: windowSessions.filter((session) => prSessionIds.has(session.id)).length };
    };
    const current = summarize(currentStart, options.nowDateKey), previous = summarize(previousStart, previousEnd);
    const make = (a: number | null, b: number | null, aSamples: number, bSamples: number): RoutineComparisonMetric => ({ current: a, previous: b, percentDelta: percent(a, b, aSamples, bSamples), currentSamples: aSamples, previousSamples: bSamples });
    return { routineId, routineName: group.name, currentSessionCount: current.sessions, previousSessionCount: previous.sessions, completedWorkingSets: make(current.sets, previous.sets, current.sessions, previous.sessions), normalizedVolume: make(current.volume, previous.volume, current.sessions, previous.sessions), averageDurationMinutes: make(current.duration, previous.duration, current.durationSamples, previous.durationSamples), prCount: make(current.prs, previous.prs, current.sessions, previous.sessions) };
  }).sort((a, b) => b.currentSessionCount - a.currentSessionCount || a.routineName.localeCompare(b.routineName));
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function isValidLocalDateKey(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
export function shiftDateKey(value: string, days: number) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}
function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
function confidenceForSamples(count: number): DataConfidence {
  if (count < 4) return "insufficient";
  if (count < 6) return "low";
  if (count < 8) return "medium";
  return "high";
}
function metric(current: number, previous: number, currentSamples: number, previousSamples: number): PeriodMetric {
  return { current, previous, delta: current - previous, percentDelta: previous > 0 && currentSamples > 0 && previousSamples > 0 ? ((current - previous) / previous) * 100 : null };
}
function validSets(exercise: AnalyticsExercise) {
  const kind = getExerciseType(exercise);
  return (exercise.sets || []).filter((set) => isValidWorkingSet(set, kind));
}
function exerciseKey(exercise: AnalyticsExercise) {
  return exercise.exerciseId?.trim() || `name:${(exercise.exerciseName || "Unknown exercise").trim().toLowerCase()}`;
}

function buildExerciseSummaries(sessions: AnalyticsSession[], unit: WorkoutDisplayUnit): ExerciseSummary[] {
  const groups = new Map<string, { exerciseId: string | null; exerciseName: string; entries: Array<{ session: AnalyticsSession; exercise: AnalyticsExercise }> }>();
  sessions.forEach((session) => (session.exercises || []).forEach((exercise) => {
    const key = exerciseKey(exercise);
    const current = groups.get(key) || { exerciseId: exercise.exerciseId || null, exerciseName: exercise.exerciseName?.trim() || "Unknown exercise", entries: [] };
    current.entries.push({ session, exercise });
    groups.set(key, current);
  }));

  return [...groups.entries()].map(([key, group]) => {
    const entries = group.entries.sort((a, b) => a.session.performedOn.localeCompare(b.session.performedOn));
    const observations: ExerciseObservation[] = [];
    const candidates: Array<{ type: ExerciseRecord["type"]; label: string; value: number; unit: string; sessionId: string; performedOn: string }> = [];
    const entriesBySession = new Map<string, { session: AnalyticsSession; exercises: AnalyticsExercise[] }>();
    entries.forEach(({ session, exercise }) => {
      const current = entriesBySession.get(session.id) || { session, exercises: [] };
      current.exercises.push(exercise);
      entriesBySession.set(session.id, current);
    });
    entriesBySession.forEach(({ session, exercises }) => {
      const sourceUnit = session.weightUnit || "lb";
      const weighted = exercises.flatMap((exercise) => getExerciseType(exercise) === "weighted" ? validSets(exercise) : []);
      const estimated = weighted.map((set) => ({ set, result: estimateOneRepMax(set.weight || 0, set.reps || 0) }))
        .filter((entry): entry is { set: AnalyticsSet; result: NonNullable<ReturnType<typeof estimateOneRepMax>> } => Boolean(entry.result))
        .sort((a, b) => b.result.value - a.result.value)[0];
      const sessionVolume = convertWeight(weighted.reduce((sum, set) => sum + weightedSetVolume(set, "weighted"), 0), sourceUnit, unit);
      if (estimated) observations.push({
        sessionId: session.id,
        performedOn: session.performedOn,
        estimatedOneRepMax: convertWeight(estimated.result.value, sourceUnit, unit),
        confidence: estimated.result.confidence,
        sourceReps: estimated.set.reps || 0,
        sourceWeight: convertWeight(estimated.set.weight || 0, sourceUnit, unit),
        sessionVolume,
      });
      weighted.forEach((set) => {
        const rawWeight = set.weight || 0;
        const weight = convertWeight(rawWeight, sourceUnit, unit);
        const reps = set.reps || 0;
        const e1rm = estimateOneRepMax(rawWeight, reps);
        candidates.push(
          { type: "heaviest-weight", label: "Heaviest weight", value: weight, unit, sessionId: session.id, performedOn: session.performedOn },
          { type: "most-reps", label: "Most reps", value: reps, unit: "reps", sessionId: session.id, performedOn: session.performedOn },
          { type: "set-volume", label: "Best set workload", value: weight * reps, unit: `${unit}·reps`, sessionId: session.id, performedOn: session.performedOn },
          { type: "rep-record", label: `Best ${reps}-rep load`, value: weight, unit, sessionId: session.id, performedOn: session.performedOn }
        );
        if (e1rm) candidates.push({ type: "estimated-1rm", label: "Best estimated 1RM", value: convertWeight(e1rm.value, sourceUnit, unit), unit, sessionId: session.id, performedOn: session.performedOn });
      });
      if (sessionVolume > 0) candidates.push({ type: "session-volume", label: "Best session workload", value: sessionVolume, unit: `${unit}·reps`, sessionId: session.id, performedOn: session.performedOn });
    });
    const records = [...new Set(candidates.map((candidate) => `${candidate.type}:${candidate.label}`))].map((recordKey) => {
      const sorted = candidates.filter((candidate) => `${candidate.type}:${candidate.label}` === recordKey)
        .sort((a, b) => b.value - a.value || a.performedOn.localeCompare(b.performedOn) || a.sessionId.localeCompare(b.sessionId));
      const winner = sorted[0];
      return { type: winner.type, label: winner.label, value: winner.value, unit: winner.unit, sourceWorkoutId: winner.sessionId, performedOn: winner.performedOn, previousValue: sorted[1]?.value ?? null } satisfies ExerciseRecord;
    });
    const sampleCount = observations.length;
    const confidence = confidenceForSamples(sampleCount);
    const half = Math.floor(sampleCount / 2);
    const previousCenter = half ? median(observations.slice(0, half).map((item) => item.estimatedOneRepMax)) : 0;
    const recentCenter = half ? median(observations.slice(-half).map((item) => item.estimatedOneRepMax)) : 0;
    const change = previousCenter > 0 ? ((recentCenter - previousCenter) / previousCenter) * 100 : null;
    const trend: ExerciseSummary["trend"] = confidence === "insufficient" || change === null ? "insufficient" : Math.abs(change) <= 2.5 ? "plateau" : change > 0 ? "improving" : "declining";
    return { exerciseKey: key, exerciseId: group.exerciseId, exerciseName: group.exerciseName, sessionCount: new Set(entries.map((entry) => entry.session.id)).size, observations, records, trend, trendConfidence: confidence, trendChangePercent: change };
  }).sort((a, b) => b.sessionCount - a.sessionCount || a.exerciseName.localeCompare(b.exerciseName));
}

export function deriveWorkoutStatistics(sessionsInput: AnalyticsSession[], options: { nowDateKey: string; periodDays?: number; displayUnit?: WorkoutDisplayUnit; draftStatus?: string }): WorkoutStatistics {
  const displayUnit = options.displayUnit || "lb";
  const sessions = sessionsInput.filter((session) => isValidLocalDateKey(session.performedOn) && session.performedOn <= options.nowDateKey);
  const days = Math.max(1, Math.floor(options.periodDays || 28));
  const currentStart = shiftDateKey(options.nowDateKey, -(days - 1));
  const previousEnd = shiftDateKey(currentStart, -1);
  const previousStart = shiftDateKey(previousEnd, -(days - 1));
  const currentSessions = sessions.filter((session) => session.performedOn >= currentStart && session.performedOn <= options.nowDateKey);
  const previousSessions = sessions.filter((session) => session.performedOn >= previousStart && session.performedOn <= previousEnd);
  const summarize = (windowSessions: AnalyticsSession[]) => {
    let workingSets = 0, workload = 0, durationMinutes = 0;
    windowSessions.forEach((session) => {
      durationMinutes += Math.max(0, finite(session.durationMinutes) ? (session.durationMinutes as number) : 0);
      (session.exercises || []).forEach((exercise) => {
        const sets = validSets(exercise);
        workingSets += sets.length;
        const sourceWorkload = sets.reduce((sum, set) => sum + weightedSetVolume(set, getExerciseType(exercise)), 0);
        workload += convertWeight(sourceWorkload, session.weightUnit || "lb", displayUnit);
      });
    });
    return { sessions: windowSessions.length, durationMinutes, workingSets, workload };
  };
  const current = summarize(currentSessions), previous = summarize(previousSessions);
  const muscleMap = new Map<string, { directSets: number; secondarySets: number; sessions: Set<string> }>();
  let unmappedWorkingSets = 0;
  currentSessions.forEach((session) => (session.exercises || []).forEach((exercise) => {
    const count = validSets(exercise).length;
    if (!count) return;
    const primary = [...new Set((exercise.primaryMuscles?.filter(Boolean).length ? exercise.primaryMuscles : exercise.muscleGroup ? [exercise.muscleGroup] : []).map((muscle) => muscle.trim()).filter(Boolean))];
    const primaryKeys = new Set(primary.map((muscle) => muscle.toLowerCase()));
    const secondary = [...new Set((exercise.secondaryMuscles || []).map((muscle) => muscle.trim()).filter((muscle) => muscle && !primaryKeys.has(muscle.toLowerCase())))];
    if (!primary.length && !secondary.length) unmappedWorkingSets += count;
    primary.forEach((muscle) => {
      const value = muscleMap.get(muscle) || { directSets: 0, secondarySets: 0, sessions: new Set<string>() };
      value.directSets += count; value.sessions.add(session.id); muscleMap.set(muscle, value);
    });
    secondary.forEach((muscle) => {
      const value = muscleMap.get(muscle) || { directSets: 0, secondarySets: 0, sessions: new Set<string>() };
      value.secondarySets += count; value.sessions.add(session.id); muscleMap.set(muscle, value);
    });
  }));
  const sundayStart = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day, 12);
    return shiftDateKey(value, -date.getDay());
  };
  const weekStarts: string[] = [];
  for (let weekStart = sundayStart(currentStart); weekStart <= options.nowDateKey; weekStart = shiftDateKey(weekStart, 7)) {
    weekStarts.push(weekStart);
  }
  const weeklyConsistency = weekStarts.map((weekStart) => ({ weekStart, sessions: currentSessions.filter((session) => session.performedOn >= weekStart && session.performedOn <= shiftDateKey(weekStart, 6)).length }));
  const exerciseSummaries = buildExerciseSummaries(sessions, displayUnit);
  const exactRecord = exerciseSummaries.flatMap((summary) => summary.records.map((record) => ({ summary, record }))).sort((a, b) => b.record.performedOn.localeCompare(a.record.performedOn))[0];
  const improving = exerciseSummaries.find((summary) => summary.trend === "improving");
  const insight = options.draftStatus === "sync-failed-draft-retained"
    ? { ruleId: "protect-unsynced-draft-v1", title: "Retry the retained workout", explanation: "The workout is safe on this device, but cloud sync has not completed.", confidence: "high" as DataConfidence, sourceWorkoutIds: [] }
    : exactRecord
      ? { ruleId: "review-latest-record-v1", title: `Review ${exactRecord.summary.exerciseName}`, explanation: `${exactRecord.record.label} is ${exactRecord.record.value.toFixed(1)} ${exactRecord.record.unit} from ${exactRecord.record.performedOn}.`, confidence: exactRecord.summary.trendConfidence, sourceWorkoutIds: [exactRecord.record.sourceWorkoutId] }
      : improving
        ? { ruleId: "review-exercise-trend-v1", title: `${improving.exerciseName} is moving`, explanation: `${improving.sessionCount} comparable sessions support an improving estimated-1RM trend.`, confidence: improving.trendConfidence, sourceWorkoutIds: improving.observations.map((item) => item.sessionId) }
        : { ruleId: "collect-comparable-session-v1", title: "Log another comparable session", explanation: "There is not enough compatible workout history for a responsible trend yet.", confidence: "insufficient" as DataConfidence, sourceWorkoutIds: [] };
  return {
    formulaVersion: WORKOUT_STATISTICS_FORMULA_VERSION,
    period: { days, currentStart, currentEnd: options.nowDateKey, previousStart, previousEnd },
    pulse: {
      sessions: metric(current.sessions, previous.sessions, current.sessions, previous.sessions),
      durationMinutes: metric(current.durationMinutes, previous.durationMinutes, current.sessions, previous.sessions),
      workingSets: metric(current.workingSets, previous.workingSets, current.sessions, previous.sessions),
      workload: metric(current.workload, previous.workload, current.sessions, previous.sessions),
      currentSampleSize: current.sessions, previousSampleSize: previous.sessions,
    },
    weeklyConsistency,
    muscleExposure: [...muscleMap.entries()].map(([muscle, value]) => ({ muscle, directSets: value.directSets, secondarySets: value.secondarySets, estimatedExposure: value.directSets + value.secondarySets * SECONDARY_MUSCLE_EXPOSURE_COEFFICIENT, frequency: value.sessions.size })).sort((a, b) => b.estimatedExposure - a.estimatedExposure || a.muscle.localeCompare(b.muscle)),
    unmappedWorkingSets,
    exerciseSummaries,
    insight,
  };
}
