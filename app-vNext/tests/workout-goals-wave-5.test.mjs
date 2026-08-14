import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildAccountExport, emptyAccountDataCollections, serializeDomainCsv } from "../src/features/coreloop/domain/accountExport.ts";
import { deriveRoutineComparisons } from "../src/features/easyworkout/domain/workoutStatistics.ts";
import { deriveWorkoutGoalProgress, workoutGoalDocumentId, WORKOUT_GOAL_SCHEMA_VERSION } from "../src/features/easyworkout/domain/workoutGoals.ts";

const weighted = (id, performedOn, unit, weight, durationMinutes = 40) => ({ id, routineId: "upper", routineName: "Upper", performedOn, weightUnit: unit, durationMinutes, exercises: [{ exerciseId: "bench", exerciseName: "Bench Press", exerciseType: "weighted", sets: [{ reps: 5, weight, completed: true, deleted: false, setType: "standard" }, { reps: 5, weight: 999, completed: false, deleted: false, setType: "standard" }, { reps: 5, weight: 999, completed: true, deleted: true, setType: "standard" }] }] });

test("matched routine comparisons normalize mixed units and preserve missing duration samples", () => {
  const comparisons = deriveRoutineComparisons([weighted("prior", "2026-07-04", "lb", 100, null), weighted("current", "2026-08-01", "kg", 45.359237)], { nowDateKey: "2026-08-01", periodDays: 28, displayUnit: "lb", routineId: "upper" });
  assert.equal(comparisons.length, 1);
  assert.equal(comparisons[0].completedWorkingSets.current, 1);
  assert.equal(comparisons[0].completedWorkingSets.previous, 1);
  assert.ok(Math.abs(comparisons[0].normalizedVolume.current - 500) < 0.01);
  assert.equal(comparisons[0].averageDurationMinutes.current, 40);
  assert.equal(comparisons[0].averageDurationMinutes.previous, null);
  assert.equal(comparisons[0].averageDurationMinutes.percentDelta, null);
});

test("routine comparison emits no percentage when prior denominator is zero", () => {
  const result = deriveRoutineComparisons([weighted("current", "2026-08-01", "lb", 100)], { nowDateKey: "2026-08-01", periodDays: 7, displayUnit: "lb" })[0];
  assert.equal(result.normalizedVolume.previous, 0);
  assert.equal(result.normalizedVolume.percentDelta, null);
});

test("weekly and e1RM achievement are derived from local workout evidence", () => {
  const stamp = new Date("2026-08-01T12:00:00Z");
  const goals = [
    { id: "weekly", ownerId: "owner", schemaVersion: WORKOUT_GOAL_SCHEMA_VERSION, formulaVersion: "completed-workout-week-v1", goalType: "weekly-workouts", status: "active", target: 2, sourceUnit: "count", exerciseId: null, exerciseName: "", createdAt: stamp, updatedAt: stamp, archivedAt: null },
    { id: "bench", ownerId: "owner", schemaVersion: WORKOUT_GOAL_SCHEMA_VERSION, formulaVersion: "epley-v1", goalType: "exercise-e1rm", status: "active", target: 220, sourceUnit: "lb", exerciseId: "bench", exerciseName: "Bench Press", createdAt: stamp, updatedAt: stamp, archivedAt: null },
  ];
  const sessions = [weighted("sunday", "2026-07-26", "lb", 200), weighted("today", "2026-08-01", "lb", 200), weighted("old", "2026-07-25", "lb", 225)];
  const progress = deriveWorkoutGoalProgress(goals, sessions, { nowDateKey: "2026-08-01" });
  assert.equal(progress[0].current, 2);
  assert.equal(progress[0].achieved, true);
  assert.equal(progress[1].achieved, true);
  assert.equal(progress[1].sourceWorkoutId, "old");
});

test("goal document IDs are deterministic for idempotent creates", () => {
  assert.equal(workoutGoalDocumentId({ goalType: "weekly-workouts", exerciseId: null }), "weekly-completed-workouts");
  assert.equal(workoutGoalDocumentId({ goalType: "exercise-e1rm", exerciseId: "bench" }), workoutGoalDocumentId({ goalType: "exercise-e1rm", exerciseId: "bench" }));
});

test("whole-account export includes versioned goals without ownership identifiers", () => {
  const workoutGoals = [{ id: "weekly", ownerId: "secret-owner", schemaVersion: WORKOUT_GOAL_SCHEMA_VERSION, formulaVersion: "completed-workout-week-v1", goalType: "weekly-workouts", status: "active", target: 3, sourceUnit: "count", exerciseId: null, exerciseName: "" }];
  const payload = buildAccountExport({ collections: { ...emptyAccountDataCollections, workoutGoals }, settings: {}, exportedAt: "2026-08-02T00:00:00.000Z", timeZone: "America/Denver", weightUnit: "lb", appVersion: "test" });
  assert.equal(payload.schemaVersion, "easylife-account-export-v2");
  assert.equal(payload.manifest.included.find((entry) => entry.domain === "workoutGoals").recordCount, 1);
  assert.equal(Object.hasOwn(payload.collections.workoutGoals[0], "ownerId"), false);
  assert.match(serializeDomainCsv("workoutGoals", workoutGoals), /easyworkout-goal-v1/);
  assert.doesNotMatch(serializeDomainCsv("workoutGoals", workoutGoals), /secret-owner/);
});

test("demo goal lifecycle is handled in memory before authenticated adapters are called", async () => {
  const source = await readFile(new URL("../src/features/easystatistics/routes/EasyStatisticsPage.tsx", import.meta.url), "utf8");
  assert.match(source, /if \(isDemoMode\) \{[\s\S]{0,800}setWorkoutGoals[\s\S]{0,800}return;[\s\S]{0,300}createWorkoutGoal/);
  assert.match(source, /if \(isDemoMode\) \{ setWorkoutGoals[\s\S]{0,500}return; \}[\s\S]{0,250}setWorkoutGoalStatus/);
});
