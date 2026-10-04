import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { historyColumns, formatHistoryCell, historyStateCopy } from "../src/features/easyworkout/domain/exerciseHistoryPresentation.ts";

const read = (path) => readFile(new URL(`../src/${path}`, import.meta.url), "utf8");

test("type-appropriate columns never mix incompatible dimensions", () => {
  const labels = (kind) => historyColumns(kind, "kg").map((c) => c.label);
  assert.deepEqual(labels("weighted"), ["Date", "Top load (kg)", "Reps at top load", "Estimated 1RM (kg)", "Workload (kg·reps)", "Sets", "Best"]);
  assert.deepEqual(labels("bodyweight"), ["Date", "Best set reps", "Total reps", "Sets", "Best"]);
  assert.deepEqual(labels("assisted"), ["Date", "Best set reps", "Assistance on that set (kg)", "Sets"]);
  assert.deepEqual(labels("duration"), ["Date", "Longest set (s)", "Total time (s)", "Sets", "Best"]);
  assert.deepEqual(labels("distance"), ["Date", "Longest set (m)", "Total distance (m)", "Sets", "Best"]);
  assert.deepEqual(labels("mixed"), []);
});

test("cells render finite values only and honest placeholders", () => {
  const row = { sessionId: "a", performedOn: "2026-07-01", setCount: 2, topWeight: 100.123, repsAtTopWeight: 5, estimatedOneRepMax: null, e1rmConfidence: null, workload: 1000, bestReps: null, totalReps: null, assistance: null, bestDurationSeconds: null, totalDurationSeconds: null, bestDistanceMeters: null, totalDistanceMeters: null, holdsRecords: ["Heaviest weight"] };
  assert.equal(formatHistoryCell(row, "topWeight"), "100.1");
  assert.equal(formatHistoryCell(row, "estimatedOneRepMax"), "n/a");
  assert.equal(formatHistoryCell(row, "holdsRecords"), "Heaviest weight");
  assert.equal(formatHistoryCell({ ...row, holdsRecords: [] }, "holdsRecords"), "—");
  assert.equal(formatHistoryCell({ ...row, topWeight: Number.NaN }, "topWeight"), "n/a");
});

test("state copy covers empty, single, not-comparable and mixed", () => {
  for (const state of ["empty", "single-session", "not-comparable", "mixed-types"]) assert.ok(historyStateCopy(state, "assisted").length > 20, state);
  assert.match(historyStateCopy("not-comparable", "assisted"), /assistance/i);
  assert.match(historyStateCopy("mixed-types", "mixed"), /not combined/i);
});

test("panel and detail page share the recent-session table and keep demo-isolated links", async () => {
  const table = await read("features/easyworkout/components/ExerciseRecentSessions.tsx");
  const panel = await read("features/easyworkout/components/WorkoutInsightsPanel.tsx");
  const detail = await read("features/easyworkout/routes/WorkoutExerciseInsightPage.tsx");
  assert.match(panel, /<ExerciseRecentSessions/);
  assert.match(detail, /<ExerciseRecentSessions/);
  assert.match(table, /demoOnlySearch/);
  assert.match(table, /<caption>/);
  assert.match(table, /scope="col"/);
  assert.match(table, /table-scroll/);
  assert.doesNotMatch(table, /average|score/i);
});
