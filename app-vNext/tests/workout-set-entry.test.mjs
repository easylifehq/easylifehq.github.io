import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
  addBlankSetIfNeeded,
  applySetEdit,
  completeExercise,
  ensureTrailingBlankSet,
  isEmptySetRow,
  removeSetAt,
  trimTrailingEmptySets,
} from "../src/features/easyworkout/domain/workoutExerciseCompletion.ts";
import {
  recoverWorkoutDraftFromStorage,
  serializeWorkoutDraftForStorage,
} from "../src/features/easyworkout/domain/workoutDraftLifecycle.ts";
import { reconcileDecimalText, sanitizeDecimalInput, settleDecimalText, toDecimalDraft } from "../src/features/easyworkout/domain/workoutNumericInput.ts";
import { isValidWorkingSet, weightedSetVolume } from "../src/features/easyworkout/domain/workoutStatistics.ts";

let counter = 0;
const id = () => `set-entry-${++counter}`;
const set = (patch = {}) => ({ localId: id(), reps: 0, weight: 0, notes: "", setType: "standard", completed: false, deleted: false, rir: null, ...patch });
const exercise = (sets = [set()], patch = {}) => ({
  localId: id(), exerciseId: null, exerciseName: "Synthetic Curl", muscleGroup: "", primaryMuscles: [], secondaryMuscles: [],
  exerciseType: "weighted", setup: {}, notes: "", sets, ...patch,
});

test("fractional pound loads like 7.5 survive typing, validation, statistics and draft restore", () => {
  assert.equal(sanitizeDecimalInput("7.5"), "7.5");
  assert.equal(toDecimalDraft("7.5"), 7.5);
  // In-progress text is kept while it still means the stored number, so "7." can become "7.5".
  assert.equal(reconcileDecimalText("7.", 7), "7.");
  assert.equal(reconcileDecimalText("7.50", 7.5), "7.50");
  assert.equal(reconcileDecimalText("7.5", 0), "");
  assert.equal(reconcileDecimalText("stale", 12.5), "12.5");

  const row = set({ reps: 10, weight: 7.5 });
  assert.equal(isValidWorkingSet({ ...row, completed: true }, "weighted"), true);
  assert.equal(weightedSetVolume({ ...row, completed: true }, "weighted"), 75);

  const done = completeExercise(exercise([row])).exercise;
  assert.equal(done.sets[0].weight, 7.5);
  const draft = {
    schemaVersion: 7, ownerId: "synthetic-owner", weightUnit: "lb", draftId: "synthetic-draft-1", selectedRoutineId: "", routineOriginId: null,
    performedOn: "2026-01-02", startedAt: "2026-01-02T10:00:00.000Z", elapsedSeconds: 0, durationMinutes: "", sessionNotes: "",
    completionReviewRequired: false, exerciseLogs: [done], appliedImportOperationIds: [],
    planningContext: { focusGroups: [], availableEquipment: [], plannedDurationMinutes: null }, updatedAt: "2026-01-02T10:00:00.000Z",
  };
  const raw = serializeWorkoutDraftForStorage(draft);
  const restored = recoverWorkoutDraftFromStorage(raw, { today: "2026-01-02", nowIso: "2026-01-02T10:00:00.000Z", ownerId: "synthetic-owner", createId: id });
  assert.equal(restored.draft.exerciseLogs[0].sets[0].weight, 7.5);
  assert.equal(restored.draft.exerciseLogs[0].sets[0].completed, true);
});

test("completing the trailing blank row appends exactly one blank row, idempotently", () => {
  const ex = exercise();
  const blank = () => set();
  const typedReps = applySetEdit(ex, ex.sets[0].localId, { reps: 8 }, blank);
  assert.equal(typedReps.sets.length, 1, "a partial row does not grow the list");
  const completed = applySetEdit(typedReps, ex.sets[0].localId, { weight: 7.5 }, blank);
  assert.equal(completed.sets.length, 2);
  assert.equal(isEmptySetRow(completed.sets[1]), true);
  // repeated edits, replays, or re-delivery of the same change cannot add duplicates
  let replay = completed;
  for (let index = 0; index < 5; index += 1) {
    replay = applySetEdit(replay, ex.sets[0].localId, { weight: 7.5 }, blank);
    replay = ensureTrailingBlankSet(replay, blank);
  }
  assert.equal(replay.sets.length, 2);
  assert.deepEqual(replay, completed);
  // editing the earlier row never grows past the one trailing blank
  assert.equal(applySetEdit(completed, ex.sets[0].localId, { reps: 9 }, blank).sets.length, 2);
  // completing the new trailing row grows by exactly one again
  const third = applySetEdit(completed, completed.sets[1].localId, { reps: 8, weight: 10 }, blank);
  assert.equal(third.sets.length, 3);
});

test("Done accepts one or many valid sets and removes only trailing empty rows", () => {
  const one = completeExercise(exercise([set({ reps: 8, weight: 7.5 }), set()]));
  assert.equal(one.ok, true);
  assert.equal(one.exercise.sets.length, 1);
  assert.equal(one.exercise.sets[0].completed, true);

  const many = completeExercise(exercise([
    set({ reps: 8, weight: 7.5 }), set({ reps: 8, weight: 10 }), set({ reps: 6, weight: 12.5 }), set(), set(),
  ]));
  assert.equal(many.ok, true);
  assert.equal(many.exercise.sets.length, 3);
  assert.ok(many.exercise.sets.every((row) => row.completed));

  const inner = completeExercise(exercise([set({ reps: 8, weight: 10 }), set(), set({ reps: 8, weight: 12 }), set()]));
  assert.equal(inner.ok, true);
  assert.equal(inner.exercise.sets.length, 3, "only trailing empties are removed; interior blank is ignored");

  const unchanged = exercise([set({ reps: 8, weight: 10 })]);
  assert.equal(trimTrailingEmptySets(unchanged), unchanged);
});

test("a partial row blocks Done, keeps every entered value, and names the field stably", () => {
  const missingLoad = exercise([set({ reps: 8, weight: 10 }), set({ reps: 5 }), set()]);
  const snapshot = JSON.stringify(missingLoad);
  const first = completeExercise(missingLoad);
  const second = completeExercise(missingLoad);
  assert.equal(first.ok, false);
  assert.equal(first.reason, "partial-row");
  assert.equal(first.field, "load");
  assert.equal(first.setLocalId, missingLoad.sets[1].localId);
  assert.match(first.message, /Set 2 needs a load greater than 0 lb/);
  assert.deepEqual(second, first, "feedback is stable across repeated attempts");
  assert.equal(JSON.stringify(missingLoad), snapshot, "nothing entered is discarded or mutated");

  const missingReps = completeExercise(exercise([set({ weight: 7.5 })]));
  assert.equal(missingReps.field, "reps");
  assert.match(missingReps.message, /Set 1 needs reps/);
  assert.equal(completeExercise(exercise([set({ notes: "n" })], { exerciseType: "duration" })).field, "duration");
});

test("new focused exercises start with one blank row and the UI uses the shared helpers", async () => {
  const page = await readFile(new URL("../src/features/easyworkout/routes/EasyWorkoutLogPage.tsx", import.meta.url), "utf8");
  assert.match(page, /const focusedBlankExercise = \(_setCount\?: number\) => emptyExerciseLog\(1, 0\)/);
  assert.match(page, /applySetEdit\(exercise, setLocalId, patch, isFocusedWorkoutMode \? blankFocusedSet : undefined\)/);
  assert.equal((page.match(/<DecimalLoadInput/g) || []).length, 1);
  const card = await readFile(new URL("../src/features/easyworkout/components/QuickWorkoutExerciseCard.tsx", import.meta.url), "utf8");
  assert.match(card, /<DecimalLoadInput/);
  assert.match(card, /aria-invalid=\{invalidFieldId === quickFieldId\(set\.localId, "load"\)/);
  assert.doesNotMatch(card, /weight: toDecimalDraft/);
});

test("deleting the trailing blank row re-adds exactly one blank row; other deletions never stack blanks", async () => {
  const blank = () => set();
  const ex = exercise([set({ reps: 8, weight: 7.5 }), set()]);
  const afterBlankDelete = removeSetAt(ex, 1, blank);
  assert.equal(afterBlankDelete.sets.length, 2);
  assert.equal(afterBlankDelete.sets[0], ex.sets[0]);
  assert.equal(isEmptySetRow(afterBlankDelete.sets[1]), true);
  // deleting the re-added blank again still leaves exactly one
  assert.equal(removeSetAt(afterBlankDelete, 1, blank).sets.length, 2);
  // deleting a completed interior row keeps the single existing trailing blank
  const two = exercise([set({ reps: 8, weight: 7.5 }), set({ reps: 6, weight: 10 }), set()]);
  const interior = removeSetAt(two, 0, blank);
  assert.equal(interior.sets.length, 2);
  assert.equal(interior.sets.filter(isEmptySetRow).length, 1);
  // deleting the only row leaves one blank row
  const only = removeSetAt(exercise([set()]), 0, blank);
  assert.equal(only.sets.length, 1);
  assert.equal(isEmptySetRow(only.sets[0]), true);
  // without a blank factory (non-focused mode) removal is a plain filter
  assert.equal(removeSetAt(ex, 1).sets.length, 1);
  // undoing a blank-row delete cannot stack a second blank
  assert.equal(addBlankSetIfNeeded(afterBlankDelete, () => ex.sets[1]), afterBlankDelete);

  const page = await readFile(new URL("../src/features/easyworkout/routes/EasyWorkoutLogPage.tsx", import.meta.url), "utf8");
  assert.match(page, /removeSetAt\(exercise, setIndex, blankFocusedSet\)/);
});

test("a lone decimal point or trailing dot settles on blur instead of staying visible", async () => {
  assert.equal(sanitizeDecimalInput("."), ".");
  assert.equal(toDecimalDraft("."), 0);
  // while focused "." is kept so "7.5" can be typed via ".5"
  assert.equal(reconcileDecimalText(".", 0), ".");
  assert.equal(settleDecimalText(0), "", "a lone '.' settles to an empty field");
  assert.equal(settleDecimalText(7), "7", "'7.' settles to 7");
  assert.equal(settleDecimalText(7.5), "7.5");
  assert.equal(reconcileDecimalText(settleDecimalText(0), 0), "");

  const input = await readFile(new URL("../src/features/easyworkout/components/DecimalLoadInput.tsx", import.meta.url), "utf8");
  assert.match(input, /onBlur=\{\(event\) => \{\s*setText\(settleDecimalText\(value\)\);\s*onBlur\?\.\(event\);/);
});

test("manual + Set never stacks a second blank row and new rows are unperformed", () => {
  const ex = exercise([set({ reps: 8, weight: 7.5, completed: false })]);
  const once = addBlankSetIfNeeded(ex, () => set());
  const twice = addBlankSetIfNeeded(once, () => set());
  assert.equal(once.sets.length, 2);
  assert.equal(twice, once);
  assert.equal(once.sets[1].completed, false);
});
