import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { WORKOUT_DRAFT_MAX_EXERCISES, WORKOUT_DRAFT_MAX_SERIALIZED_CHARS, WORKOUT_DRAFT_MAX_SETS_PER_EXERCISE, WorkoutSaveCoordinator, canClearMatchingWorkoutDraft, getWorkoutDraftStorageKey, hasWorkoutDraftWork, recoverWorkoutDraft, recoverWorkoutDraftFromStorage, resolveWorkoutDurationMinutes, serializeWorkoutDraftForStorage } from "../src/features/easyworkout/domain/workoutDraftLifecycle.ts";
import { workoutSessionDocumentId } from "../src/lib/firestore/workoutSessionIdentity.ts";

const options = { today: "2026-08-01", nowIso: "2026-08-01T12:00:00.000Z", ownerId: "user-a", defaultWeightUnit: "lb", createId: (() => { let id = 0; return () => `generated-id-${++id}`; })() };
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

test("oversized and structurally abusive drafts are rejected before recovery work", () => {
  const serialized = `${" ".repeat(WORKOUT_DRAFT_MAX_SERIALIZED_CHARS + 1)}`;
  const oversizedText = recoverWorkoutDraftFromStorage(serialized, options);
  assert.equal(oversizedText.draft, null);
  assert.match(oversizedText.message, /too large/i);

  const tooManyExercises = recoverWorkoutDraft({ ...legacy, exerciseLogs: Array.from({ length: WORKOUT_DRAFT_MAX_EXERCISES + 1 }, () => legacy.exerciseLogs[0]) }, options);
  assert.equal(tooManyExercises.draft, null);
  assert.match(tooManyExercises.message, /too large/i);

  const tooManySets = recoverWorkoutDraft({ ...legacy, exerciseLogs: [{ ...legacy.exerciseLogs[0], sets: Array.from({ length: WORKOUT_DRAFT_MAX_SETS_PER_EXERCISE + 1 }, () => legacy.exerciseLogs[0].sets[0]) }] }, options);
  assert.equal(tooManySets.draft, null);
  assert.match(tooManySets.message, /too large/i);
});

test("draft serialization fails closed before local-storage quota pressure", () => {
  const recovered = recoverWorkoutDraft(legacy, options).draft;
  assert.ok(recovered);
  assert.ok(serializeWorkoutDraftForStorage(recovered));
  assert.equal(serializeWorkoutDraftForStorage({ ...recovered, sessionNotes: "x".repeat(WORKOUT_DRAFT_MAX_SERIALIZED_CHARS) }), null);
});

test("workout log flushes its latest controlled draft before page suspension or unload", async () => {
  const source = await readFile(new URL("../src/features/easyworkout/routes/EasyWorkoutLogPage.tsx", import.meta.url), "utf8");
  assert.match(source, /latestDraftRef\.current = \{/);
  assert.match(source, /addEventListener\("pagehide", persistLatestDraft\)/);
  assert.match(source, /visibilityState === "hidden"/);
  assert.match(source, /serializeWorkoutDraftForStorage\(\{ \.\.\.draft, updatedAt:/);
});

test("automatic workout duration excludes implausible overnight drafts and preserves explicit duration", () => {
  assert.equal(resolveWorkoutDurationMinutes("", 45 * 60), 45);
  assert.equal(resolveWorkoutDurationMinutes("", 6 * 60 * 60), 360);
  assert.equal(resolveWorkoutDurationMinutes("", 6 * 60 * 60 + 60), null);
  assert.equal(resolveWorkoutDurationMinutes("75", 24 * 60 * 60), 75);
  assert.equal(resolveWorkoutDurationMinutes("0", 120), null);
  assert.equal(resolveWorkoutDurationMinutes("1441", 120), null);
});

test("draft storage and recovery are isolated by authenticated owner", () => {
  assert.notEqual(getWorkoutDraftStorageKey("user-a"), getWorkoutDraftStorageKey("user-b"));
  const owned = { ...legacy, ownerId: "user-b" };
  const result = recoverWorkoutDraft(owned, options);
  assert.equal(result.draft, null);
  assert.match(result.message, /different account/i);
});

test("default blank weighted boxes are not persisted as active work", () => {
  assert.equal(hasWorkoutDraftWork({ selectedRoutineId: "", durationMinutes: "", sessionNotes: "", exerciseLogs: [{ localId: "exercise", exerciseId: null, exerciseName: "", muscleGroup: "", primaryMuscles: [], secondaryMuscles: [], exerciseType: "weighted", notes: "", sets: [{ localId: "set", reps: 8, weight: 0, notes: "", setType: "standard", completed: true, deleted: false, rir: null }] }] }), false);
});

test("Firestore idempotency accepts only collision-safe draft identities", () => {
  assert.equal(workoutSessionDocumentId("550e8400-e29b-41d4-a716-446655440000"), "550e8400-e29b-41d4-a716-446655440000");
  assert.throws(() => workoutSessionDocumentId("../shared"), /identity is invalid/i);
  assert.throws(() => workoutSessionDocumentId("short"), /identity is invalid/i);
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
