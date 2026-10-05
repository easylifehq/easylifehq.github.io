import assert from "node:assert/strict";
import test from "node:test";
import { selectExerciseSummary } from "../src/features/easyworkout/domain/exerciseSelection.ts";

const summaries = [
  { exerciseName: "Bench Press" },
  { exerciseName: "Pull-up" },
  { exerciseName: "Plank" },
  { exerciseName: "Incline Bench Press" },
];

test("blank and whitespace-only queries select the first exercise", () => {
  for (const query of ["", "   "]) {
    const result = selectExerciseSummary(summaries, query);
    assert.equal(result.status, "selected");
    assert.equal(result.summary.exerciseName, "Bench Press");
  }
});

test("matching is case-insensitive and trims the query", () => {
  assert.equal(selectExerciseSummary(summaries, "plank").summary.exerciseName, "Plank");
  assert.equal(selectExerciseSummary(summaries, " PULL ").summary.exerciseName, "Pull-up");
});

test("substring matches keep first-match behavior", () => {
  assert.equal(selectExerciseSummary(summaries, "bench").summary.exerciseName, "Bench Press");
  assert.equal(selectExerciseSummary(summaries, "incline").summary.exerciseName, "Incline Bench Press");
});

test("a nonblank query with no match never falls back to another exercise", () => {
  const result = selectExerciseSummary(summaries, "  zzz  ");
  assert.equal(result.status, "no-match");
  assert.equal(result.query, "zzz");
  assert.equal(result.summary, undefined);
});

test("no summaries is empty for blank and nonblank queries", () => {
  assert.equal(selectExerciseSummary([], "").status, "empty");
  assert.equal(selectExerciseSummary([], "bench").status, "empty");
});
