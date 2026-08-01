import test from "node:test";
import assert from "node:assert/strict";
import { WorkoutSaveCoordinator, canClearMatchingWorkoutDraft, recoverWorkoutDraft } from "../src/features/easyworkout/domain/workoutDraftLifecycle.ts";

const options = { today: "2026-08-01", nowIso: "2026-08-01T12:00:00.000Z", createId: (() => { let id = 0; return () => `id-${++id}`; })() };
const legacy = { selectedRoutineId: "routine-a", performedOn: "2026-07-31", durationMinutes: "52", sessionNotes: "Exact note", activeExerciseId: "exercise-local", exerciseLogs: [{ localId: "exercise-local", exerciseId: "bench", exerciseName: "Bench Press", muscleGroup: "Chest", notes: "Paused", sets: [{ localId: "set-local", reps: 5, weight: 185, notes: "clean" }] }] };

test("legacy draft migrates without losing routine, active exercise, notes, duration, or sets", () => {
  const result = recoverWorkoutDraft(legacy, options);
  assert.equal(result.migrated, true);
  assert.equal(result.draft?.routineOriginId, "routine-a");
  assert.equal(result.draft?.activeExerciseId, "exercise-local");
  assert.equal(result.draft?.sessionNotes, "Exact note");
  assert.equal(result.draft?.durationMinutes, "52");
  assert.equal(result.draft?.exerciseLogs[0].sets[0].weight, 185);
  assert.equal(result.draft?.exerciseLogs[0].sets[0].setType, "standard");
});

test("malformed and old drafts fail safely with readable recovery", () => {
  assert.equal(recoverWorkoutDraft("bad", options).draft, null);
  assert.match(recoverWorkoutDraft("bad", options).message, /unreadable/i);
  assert.equal(recoverWorkoutDraft({ exerciseLogs: [] }, options).draft, null);
});

test("only the matching confirmed draft can be cleared", () => {
  assert.equal(canClearMatchingWorkoutDraft("draft-a", "draft-a"), true);
  assert.equal(canClearMatchingWorkoutDraft("draft-b", "draft-a"), false);
  assert.equal(canClearMatchingWorkoutDraft(null, "draft-a"), false);
});

test("rapid saves and two-tab-equivalent retries share one persistence operation", async () => {
  const coordinator = new WorkoutSaveCoordinator();
  let calls = 0;
  const persist = async () => { calls += 1; await new Promise((resolve) => setTimeout(resolve, 5)); return "session-a"; };
  const [first, second] = await Promise.all([coordinator.save("draft-a", persist), coordinator.save("draft-a", persist)]);
  const third = await coordinator.save("draft-a", persist);
  assert.equal(first, "session-a");
  assert.equal(second, "session-a");
  assert.equal(third, "session-a");
  assert.equal(calls, 1);
});

test("failed final save remains retryable", async () => {
  const coordinator = new WorkoutSaveCoordinator();
  let calls = 0;
  await assert.rejects(() => coordinator.save("draft-fail", async () => { calls += 1; throw new Error("offline"); }));
  const result = await coordinator.save("draft-fail", async () => { calls += 1; return "session-retry"; });
  assert.equal(result, "session-retry");
  assert.equal(calls, 2);
});
