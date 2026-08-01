import test from "node:test";
import assert from "node:assert/strict";
import {
  convertWeight,
  deriveWorkoutStatistics,
  estimateOneRepMax,
  isValidWorkingSet,
  shiftDateKey,
  weightedSetVolume,
} from "../src/features/easyworkout/domain/workoutStatistics.ts";
import { workoutDemoExercises, workoutDemoSessions } from "../src/features/easyworkout/demo/workoutDemoFixtures.ts";

const session = (id, performedOn, sets, overrides = {}) => ({
  id,
  performedOn,
  durationMinutes: 60,
  exercises: [{ exerciseId: "bench", exerciseName: "Bench Press", muscleGroup: "Chest", primaryMuscles: ["Chest"], secondaryMuscles: ["Triceps"], exerciseType: "weighted", sets }],
  ...overrides,
});

test("working-set validity excludes warm-ups, deleted, incomplete, and corrupt values", () => {
  assert.equal(isValidWorkingSet({ reps: 8, weight: 100, setType: "standard" }), true);
  assert.equal(isValidWorkingSet({ reps: 8, weight: 100, setType: "warmup" }), false);
  assert.equal(isValidWorkingSet({ reps: 8, weight: 100, deleted: true }), false);
  assert.equal(isValidWorkingSet({ reps: 8, weight: 100, completed: false }), false);
  assert.equal(isValidWorkingSet({ reps: -2, weight: 100 }), false);
});

test("weighted sets require a positive load so blank-input zeroes do not become records", () => {
  assert.equal(isValidWorkingSet({ reps: 8, weight: 0 }, "weighted"), false);
  assert.equal(isValidWorkingSet({ reps: 8, weight: 45 }, "weighted"), true);
});

test("exercise types stay incompatible", () => {
  assert.equal(weightedSetVolume({ reps: 10, weight: 100 }, "weighted"), 1000);
  assert.equal(weightedSetVolume({ reps: 10, weight: 100 }, "bodyweight"), 0);
  assert.equal(isValidWorkingSet({ durationSeconds: 45 }, "duration"), true);
  assert.equal(isValidWorkingSet({ distanceMeters: 500 }, "distance"), true);
});

test("Epley e1RM confidence is honest", () => {
  assert.equal(estimateOneRepMax(200, 1)?.value, 200);
  assert.equal(estimateOneRepMax(100, 10)?.confidence, "high");
  assert.equal(estimateOneRepMax(100, 12)?.confidence, "low");
  assert.equal(estimateOneRepMax(100, 16), null);
});

test("unit conversion round trips within tolerance", () => {
  const kg = convertWeight(225, "lb", "kg");
  assert.ok(Math.abs(convertWeight(kg, "kg", "lb") - 225) < 1e-8);
});

test("matched periods use equal inclusive calendar windows", () => {
  const stats = deriveWorkoutStatistics([
    session("current", "2026-08-01", [{ reps: 5, weight: 100 }]),
    session("previous", "2026-07-25", [{ reps: 5, weight: 100 }]),
  ], { nowDateKey: "2026-08-01", periodDays: 7 });
  assert.deepEqual(stats.period, { days: 7, currentStart: "2026-07-26", currentEnd: "2026-08-01", previousStart: "2026-07-19", previousEnd: "2026-07-25" });
  assert.equal(stats.pulse.sessions.delta, 0);
  assert.equal(stats.pulse.sessions.percentDelta, 0);
});

test("zero prior denominator suppresses percentages", () => {
  const stats = deriveWorkoutStatistics([session("only", "2026-08-01", [{ reps: 5, weight: 100 }])], { nowDateKey: "2026-08-01", periodDays: 7 });
  assert.equal(stats.pulse.workload.percentDelta, null);
});

test("deleting a set cannot increase workload and warm-ups cannot produce records", () => {
  const base = session("one", "2026-08-01", [{ reps: 5, weight: 100 }, { reps: 20, weight: 300, setType: "warmup" }]);
  const deleted = session("one", "2026-08-01", [{ reps: 5, weight: 100, deleted: true }, { reps: 20, weight: 300, setType: "warmup" }]);
  const baseStats = deriveWorkoutStatistics([base], { nowDateKey: "2026-08-01" });
  const deletedStats = deriveWorkoutStatistics([deleted], { nowDateKey: "2026-08-01" });
  assert.ok(deletedStats.pulse.workload.current <= baseStats.pulse.workload.current);
  assert.equal(deletedStats.exerciseSummaries[0].records.length, 0);
});

test("stable IDs keep same-name exercise variants separate", () => {
  const stats = deriveWorkoutStatistics([
    session("a", "2026-08-01", [{ reps: 5, weight: 100 }]),
    session("b", "2026-07-31", [{ reps: 5, weight: 90 }], { exercises: [{ exerciseId: "bench-machine", exerciseName: "Bench Press", exerciseType: "weighted", sets: [{ reps: 5, weight: 90 }] }] }),
  ], { nowDateKey: "2026-08-01" });
  assert.equal(stats.exerciseSummaries.length, 2);
});

test("muscle exposure separates direct and weighted secondary sets", () => {
  const stats = deriveWorkoutStatistics([session("one", "2026-08-01", [{ reps: 5, weight: 100 }, { reps: 5, weight: 100 }])], { nowDateKey: "2026-08-01" });
  assert.equal(stats.muscleExposure.find((item) => item.muscle === "Chest")?.estimatedExposure, 2);
  assert.equal(stats.muscleExposure.find((item) => item.muscle === "Triceps")?.estimatedExposure, 1);
});

test("four comparable plateau exposures are not overconfident", () => {
  const sessions = [0, 1, 2, 3].map((index) => session(String(index), shiftDateKey("2026-08-01", -index * 3), [{ reps: 5, weight: 100 }]));
  const summary = deriveWorkoutStatistics(sessions, { nowDateKey: "2026-08-01", periodDays: 28 }).exerciseSummaries[0];
  assert.equal(summary.trend, "plateau");
  assert.equal(summary.trendConfidence, "low");
});

test("empty and malformed histories never emit NaN or infinity", () => {
  const stats = deriveWorkoutStatistics([{ id: "bad", performedOn: "bad", durationMinutes: -10, exercises: [{ sets: [{ reps: Number.NaN, weight: Infinity }] }] }], { nowDateKey: "2026-08-01" });
  assert.equal(stats.pulse.sessions.current, 0);
  assert.equal(JSON.stringify(stats).includes("NaN"), false);
  assert.equal(JSON.stringify(stats).includes("Infinity"), false);
});

test("large history remains deterministic", () => {
  const history = Array.from({ length: 2000 }, (_, index) => session(`s${index}`, shiftDateKey("2026-08-01", -(index % 90)), [{ reps: 5 + (index % 4), weight: 100 + (index % 20) }]));
  const first = deriveWorkoutStatistics(history, { nowDateKey: "2026-08-01", periodDays: 90 });
  const second = deriveWorkoutStatistics(history, { nowDateKey: "2026-08-01", periodDays: 90 });
  assert.equal(first.pulse.workload.current, second.pulse.workload.current);
  assert.equal(first.insight.ruleId, second.insight.ruleId);
});

test("demo fixture proves breadth and excluded special sets", () => {
  assert.ok(workoutDemoExercises.length >= 12);
  assert.ok(workoutDemoSessions.length >= 36);
  assert.ok(workoutDemoSessions.some((item) => item.performedOn === "2026-03-08"));
  assert.ok(workoutDemoSessions.some((item) => item.exercises.some((exercise) => exercise.sets.some((set) => set.setType === "drop"))));
  assert.ok(workoutDemoSessions.some((item) => item.exercises.some((exercise) => exercise.sets.some((set) => set.deleted || set.completed === false))));
});
