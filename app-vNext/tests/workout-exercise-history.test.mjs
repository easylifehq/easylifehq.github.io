import test from "node:test";
import assert from "node:assert/strict";
import { deriveWorkoutStatistics } from "../src/features/easyworkout/domain/workoutStatistics.ts";

const NOW = "2026-08-01";
const ex = (exerciseType, sets, extra = {}) => ({ exerciseId: "x", exerciseName: "X", muscleGroup: "Chest", exerciseType, sets, ...extra });
const sess = (id, performedOn, exercises, extra = {}) => ({ id, performedOn, durationMinutes: 45, exercises, ...extra });
const history = (sessions, key = "x", unit = "lb") => {
  const stats = deriveWorkoutStatistics(sessions, { nowDateKey: NOW, displayUnit: unit });
  return stats.exerciseSummaries.find((s) => s.exerciseKey === key)?.history;
};

test("weighted history: newest-first rows with load, reps, e1RM, workload and exact source ids", () => {
  const h = history([
    sess("a", "2026-07-01", [ex("weighted", [{ reps: 5, weight: 100 }, { reps: 8, weight: 80 }])]),
    sess("b", "2026-07-08", [ex("weighted", [{ reps: 5, weight: 110 }])]),
  ]);
  assert.equal(h.kind, "weighted");
  assert.deepEqual(h.rows.map((r) => r.sessionId), ["b", "a"]);
  const a = h.rows[1];
  assert.equal(a.topWeight, 100);
  assert.equal(a.repsAtTopWeight, 5);
  assert.equal(a.setCount, 2);
  assert.equal(a.workload, 500 + 640);
  assert.ok(Math.abs(a.estimatedOneRepMax - 100 * (1 + 5 / 30)) < 1e-9);
  assert.equal(a.performedOn, "2026-07-01");
  assert.equal(h.comparison.state, "comparable");
  assert.equal(h.comparison.metricLabel, "Estimated 1RM");
  assert.ok(h.comparison.delta > 0);
  assert.equal(h.rows[0].holdsRecords.includes("Heaviest weight"), true);
  assert.equal(a.holdsRecords.includes("Most reps"), true, "8 reps at 80 is the most-reps best");
});

test("weighted history normalizes mixed lb/kg without rounding", () => {
  const h = history([
    sess("lb", "2026-07-01", [ex("weighted", [{ reps: 5, weight: 220.46226218 }])], { weightUnit: "lb" }),
    sess("kg", "2026-07-08", [ex("weighted", [{ reps: 5, weight: 100 }])], { weightUnit: "kg" }),
  ], "x", "kg");
  assert.ok(h.rows.every((r) => Math.abs(r.topWeight - 100) < 1e-6));
  const lbDisplay = history([sess("kg", "2026-07-08", [ex("weighted", [{ reps: 5, weight: 100 }])], { weightUnit: "kg" })], "x", "lb");
  assert.ok(Math.abs(lbDisplay.rows[0].topWeight - 220.46226218) < 1e-6);
});

test("history uses only explicitly completed sets for schema v4 and keeps legacy semantics", () => {
  const v4 = history([sess("v4", "2026-07-01", [ex("weighted", [{ reps: 5, weight: 100 }, { reps: 5, weight: 200, completed: true }, { reps: 5, weight: 300, completed: false }])], { schemaVersion: 4 })]);
  assert.equal(v4.rows[0].topWeight, 200);
  assert.equal(v4.rows[0].setCount, 1);
  const untouched = history([sess("v4", "2026-07-01", [ex("weighted", [{ reps: 5, weight: 100 }])], { schemaVersion: 4 })]);
  assert.equal(untouched, undefined);
  const legacy = history([sess("old", "2026-07-01", [ex("weighted", [{ reps: 5, weight: 100 }, { reps: 5, weight: 300, completed: false }])])]);
  assert.equal(legacy.rows[0].topWeight, 100);
});

test("stable exercise IDs group, same-name different IDs stay isolated, legacy names fall back", () => {
  const stats = deriveWorkoutStatistics([
    sess("1", "2026-07-01", [ex("weighted", [{ reps: 5, weight: 100 }], { exerciseId: "id-1", exerciseName: "Press" })]),
    sess("2", "2026-07-02", [ex("weighted", [{ reps: 5, weight: 50 }], { exerciseId: "id-2", exerciseName: "Press" })]),
    sess("3", "2026-07-03", [ex("weighted", [{ reps: 5, weight: 105 }], { exerciseId: "id-1", exerciseName: "Renamed press" })]),
    sess("4", "2026-07-04", [ex("weighted", [{ reps: 5, weight: 60 }], { exerciseId: null, exerciseName: " Cable Row " })]),
    sess("5", "2026-07-05", [ex("weighted", [{ reps: 5, weight: 65 }], { exerciseId: undefined, exerciseName: "cable row" })]),
  ], { nowDateKey: NOW });
  const by = (k) => stats.exerciseSummaries.find((s) => s.exerciseKey === k).history;
  assert.deepEqual(by("id-1").rows.map((r) => r.sessionId), ["3", "1"]);
  assert.deepEqual(by("id-2").rows.map((r) => r.sessionId), ["2"]);
  assert.deepEqual(by("name:cable row").rows.map((r) => r.sessionId), ["5", "4"]);
});

test("duplicate exercise blocks in one session merge into one row", () => {
  const h = history([sess("a", "2026-07-01", [ex("weighted", [{ reps: 5, weight: 100 }]), ex("weighted", [{ reps: 5, weight: 120 }])])]);
  assert.equal(h.rows.length, 1);
  assert.equal(h.rows[0].setCount, 2);
  assert.equal(h.rows[0].topWeight, 120);
});

test("bodyweight history is reps-only: no load, workload, e1RM or weighted records", () => {
  const stats = deriveWorkoutStatistics([
    sess("a", "2026-07-01", [ex("bodyweight", [{ reps: 8, weight: 0 }, { reps: 6, weight: 45 }])]),
    sess("b", "2026-07-08", [ex("bodyweight", [{ reps: 10 }])]),
  ], { nowDateKey: NOW });
  const summary = stats.exerciseSummaries[0];
  const h = summary.history;
  assert.equal(h.kind, "bodyweight");
  assert.equal(h.rows[0].bestReps, 10);
  assert.equal(h.rows[1].bestReps, 8);
  assert.equal(h.rows[1].totalReps, 14);
  for (const row of h.rows) {
    assert.equal(row.topWeight, null);
    assert.equal(row.workload, null);
    assert.equal(row.estimatedOneRepMax, null);
  }
  assert.deepEqual(summary.records.map((r) => r.type), ["most-reps"]);
  assert.equal(summary.records[0].value, 10);
  assert.equal(summary.records[0].sourceWorkoutId, "b");
  assert.equal(summary.observations.length, 0);
  assert.equal(h.comparison.metricLabel, "Best set reps");
  assert.equal(h.comparison.delta, 2);
});

test("assisted history labels assistance in the display unit and claims no record", () => {
  const stats = deriveWorkoutStatistics([
    sess("a", "2026-07-01", [ex("assisted", [{ reps: 6, weight: 100 }])], { weightUnit: "lb" }),
    sess("b", "2026-07-08", [ex("assisted", [{ reps: 8, weight: 40 }])], { weightUnit: "kg" }),
  ], { nowDateKey: NOW, displayUnit: "lb" });
  const summary = stats.exerciseSummaries[0];
  assert.equal(summary.history.kind, "assisted");
  assert.ok(Math.abs(summary.history.rows[0].assistance - 40 * 2.2046226218) < 1e-9);
  assert.equal(summary.history.rows[1].assistance, 100);
  assert.equal(summary.records.length, 0, "no simplistic lower-assistance or aggregate PR");
  assert.equal(summary.history.rows.every((r) => r.holdsRecords.length === 0), true);
  assert.equal(summary.history.comparison.state, "not-comparable");
  assert.equal(summary.history.comparison.delta, null);
  assert.equal(summary.history.rows.every((r) => r.workload === null && r.estimatedOneRepMax === null), true);
});

test("duration and distance keep native single metrics and bests", () => {
  const d = deriveWorkoutStatistics([
    sess("a", "2026-07-01", [ex("duration", [{ durationSeconds: 30 }, { durationSeconds: 45 }])]),
    sess("b", "2026-07-08", [ex("duration", [{ durationSeconds: 60 }])]),
  ], { nowDateKey: NOW }).exerciseSummaries[0];
  assert.equal(d.history.rows[1].bestDurationSeconds, 45);
  assert.equal(d.history.rows[1].totalDurationSeconds, 75);
  assert.equal(d.history.rows[0].bestReps, null);
  assert.deepEqual(d.records.map((r) => [r.type, r.value, r.unit, r.sourceWorkoutId]), [["longest-duration", 60, "s", "b"]]);
  const m = deriveWorkoutStatistics([
    sess("a", "2026-07-01", [ex("distance", [{ distanceMeters: 1000 }])]),
    sess("b", "2026-07-08", [ex("distance", [{ distanceMeters: 800 }, { distanceMeters: 900 }])]),
  ], { nowDateKey: NOW }).exerciseSummaries[0];
  assert.equal(m.history.rows[0].bestDistanceMeters, 900);
  assert.equal(m.history.rows[0].totalDistanceMeters, 1700);
  assert.deepEqual(m.records.map((r) => [r.type, r.value, r.unit, r.sourceWorkoutId]), [["longest-distance", 1000, "m", "a"]]);
  assert.equal(m.history.comparison.delta, -100);
});

test("mixed exercise types under one key are not combined", () => {
  const h = history([
    sess("a", "2026-07-01", [ex("weighted", [{ reps: 5, weight: 100 }])]),
    sess("b", "2026-07-08", [ex("bodyweight", [{ reps: 10 }])]),
  ]);
  assert.equal(h.kind, "mixed");
  assert.deepEqual(h.rows, []);
  assert.equal(h.comparison.state, "mixed-types");
  assert.equal(h.comparison.delta, null);
});

test("empty, one-sample, and malformed states are explicit and never NaN or infinite", () => {
  assert.equal(history([]), undefined);
  const one = history([sess("a", "2026-07-01", [ex("weighted", [{ reps: 5, weight: 100 }])])]);
  assert.equal(one.comparison.state, "single-session");
  assert.equal(one.comparison.delta, null);
  const bad = history([
    sess("a", "2026-07-01", [ex("weighted", [{ reps: NaN, weight: 100 }, { reps: 5, weight: Infinity }, { reps: -1, weight: 5 }, { reps: 5, weight: 100 }])]),
    sess("b", "2026-07-02", [ex("weighted", [{ reps: 20, weight: 50 }])]),
    sess("c", "2026-07-03", [{ exerciseId: "x", exerciseName: "X", exerciseType: "weighted" }]),
  ]);
  assert.equal(bad.rows.length, 2);
  assert.equal(bad.rows.find((r) => r.sessionId === "b").estimatedOneRepMax, null, "above 15 reps has no e1RM");
  assert.equal(bad.rows.find((r) => r.sessionId === "a").setCount, 1);
  assert.doesNotMatch(JSON.stringify(bad, (_, v) => (typeof v === "number" && !Number.isFinite(v) ? "BAD" : v)), /BAD/);
  assert.equal(bad.comparison.state, "not-comparable", "latest session has no e1RM to compare");
});

test("recent history is capped but exposes the total session count", () => {
  const sessions = Array.from({ length: 8 }, (_, i) => sess(`s${i}`, `2026-07-0${i + 1}`, [ex("weighted", [{ reps: 5, weight: 100 + i }])]));
  const h = history(sessions);
  assert.equal(h.rows.length, 5);
  assert.equal(h.totalSessions, 8);
  assert.equal(h.rows[0].sessionId, "s7");
});
