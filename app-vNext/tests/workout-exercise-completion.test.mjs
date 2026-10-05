import assert from "node:assert/strict";
import test from "node:test";
import {
  applyExerciseIdentityEdit,
  applySetEdit,
  classifyWorkoutRow,
  completeExercise,
  completeExerciseAndAdvance,
  deleteExerciseFromLogs,
  findSaveBlock,
  focusedStartingExercises,
  isExerciseDone,
  undoExerciseCompletion,
} from "../src/features/easyworkout/domain/workoutExerciseCompletion.ts";
import { isValidWorkingSet } from "../src/features/easyworkout/domain/workoutStatistics.ts";

let counter = 0;
const id = () => `id-${++counter}`;
const set = (patch = {}) => ({ localId: id(), reps: 0, weight: 0, notes: "", setType: "standard", completed: false, deleted: false, rir: null, ...patch });
const exercise = (patch = {}, sets = [set(), set(), set()]) => ({
  localId: id(), exerciseId: null, exerciseName: "Lat Pulldown", muscleGroup: "", primaryMuscles: [], secondaryMuscles: [],
  exerciseType: "weighted", setup: {}, notes: "", sets, ...patch,
});
const blankExercise = () => exercise({ exerciseName: "" });

test("fresh focused drafts start with exactly one exercise and all configured rows unperformed", () => {
  const logs = focusedStartingExercises(() => exercise({ exerciseName: "" }, [set(), set(), set(), set()]));
  assert.equal(logs.length, 1);
  assert.equal(logs[0].sets.length, 4);
  assert.ok(logs[0].sets.every((row) => row.completed === false));
});

test("classification follows exercise-type validity without treating completed:false as an error", () => {
  assert.equal(classifyWorkoutRow(set({ reps: 8, weight: 100 }), "weighted"), "valid");
  assert.equal(classifyWorkoutRow(set({ reps: 8, weight: 0 }), "weighted"), "partial");
  assert.equal(classifyWorkoutRow(set({ reps: 0, weight: 100 }), "weighted"), "partial");
  assert.equal(classifyWorkoutRow(set(), "weighted"), "blank");
  assert.equal(classifyWorkoutRow(set({ notes: "pause" }), "weighted"), "partial");
  assert.equal(classifyWorkoutRow(set({ reps: 10 }), "bodyweight"), "valid");
  assert.equal(classifyWorkoutRow(set({ reps: 10, weight: 0 }), "assisted"), "valid");
  assert.equal(classifyWorkoutRow(set({ reps: 0, weight: 20 }), "assisted"), "partial");
  assert.equal(classifyWorkoutRow(set({ durationSeconds: 60 }), "duration"), "valid");
  assert.equal(classifyWorkoutRow(set({ distanceMeters: 400 }), "distance"), "valid");
  assert.equal(classifyWorkoutRow(set({ reps: 8 }), "duration"), "blank");
  assert.equal(classifyWorkoutRow(set({ reps: 8, weight: 100, setType: "warmup" }), "weighted"), "warmup");
  assert.equal(classifyWorkoutRow(set({ reps: 8, weight: 100, deleted: true }), "weighted"), "deleted");
});

test("typing positive values never completes a set", () => {
  const ex = exercise();
  const typed = applySetEdit(ex, ex.sets[0].localId, { reps: 8, weight: 100 });
  assert.equal(typed.sets[0].completed, false);
  assert.ok(typed.sets.every((row) => !row.completed));
});

test("Done completes all and only valid entered rows atomically, leaving blank and warm-up rows unperformed", () => {
  const ex = exercise({}, [
    set({ reps: 8, weight: 100, setType: "warmup" }),
    set({ reps: 8, weight: 100 }),
    set({ reps: 6, weight: 110, setType: "drop" }),
    set(),
  ]);
  const result = completeExercise(ex);
  assert.equal(result.ok, true);
  assert.deepEqual(result.exercise.sets.map((row) => row.completed), [false, true, true, false]);
  assert.ok(result.exercise.sets.filter((row) => row.completed).every((row) => isValidWorkingSet(row, "weighted", { requiresExplicitCompletion: true })));
  assert.equal(isExerciseDone(result.exercise), true);
});

test("partial rows, missing name, or no valid working row block without changing anything", () => {
  const partial = exercise({}, [set({ reps: 8, weight: 100 }), set({ reps: 8, weight: 0 })]);
  const blocked = completeExercise(partial);
  assert.equal(blocked.ok, false);
  assert.equal(blocked.reason, "partial-row");
  assert.equal(blocked.setLocalId, partial.sets[1].localId);
  assert.ok(partial.sets.every((row) => row.completed === false));

  assert.equal(completeExercise(exercise({ exerciseName: " " }, [set({ reps: 8, weight: 100 })])).reason, "name");
  assert.equal(completeExercise(exercise()).reason, "no-valid-row");
  assert.equal(completeExercise(exercise({}, [set({ reps: 8, weight: 100, setType: "warmup" })])).reason, "no-valid-row");
});

test("repeated Done and next appends at most one blank exercise and does not change completed data", () => {
  const first = exercise({}, [set({ reps: 8, weight: 100 })]);
  const once = completeExerciseAndAdvance([first], first.localId, blankExercise);
  assert.equal(once.ok, true);
  assert.equal(once.logs.length, 2);
  assert.equal(once.activeExerciseId, once.logs[1].localId);
  const twice = completeExerciseAndAdvance(once.logs, first.localId, blankExercise);
  assert.equal(twice.ok, true);
  assert.equal(twice.logs.length, 2);
  assert.deepEqual(twice.logs[0], once.logs[0]);
  assert.equal(twice.activeExerciseId, once.logs[1].localId);
});

test("Done and next activates an existing next exercise rather than appending", () => {
  const first = exercise({}, [set({ reps: 8, weight: 100 })]);
  const second = exercise({ exerciseName: "Row" });
  const result = completeExerciseAndAdvance([first, second], first.localId, blankExercise);
  assert.equal(result.logs.length, 2);
  assert.equal(result.activeExerciseId, second.localId);
});

test("failed Done and next reports a block and returns no new logs", () => {
  const first = exercise({}, [set({ reps: 8, weight: 0 })]);
  const result = completeExerciseAndAdvance([first], first.localId, blankExercise);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "partial-row");
  assert.ok(result.message.length > 10);
  assert.equal(result.logs, undefined);
});

test("Undo done reopens, and performance or identity edits revoke completion", () => {
  const done = completeExercise(exercise({}, [set({ reps: 8, weight: 100 }), set({ reps: 8, weight: 100 })])).exercise;
  assert.ok(undoExerciseCompletion(done).sets.every((row) => !row.completed));
  for (const patch of [{ reps: 9 }, { weight: 105 }, { setType: "failure" }, { durationSeconds: 5 }, { distanceMeters: 5 }]) {
    const edited = applySetEdit(done, done.sets[0].localId, patch);
    assert.equal(edited.sets[0].completed, false, JSON.stringify(patch));
    assert.equal(edited.sets[1].completed, true);
  }
  assert.equal(applySetEdit(done, done.sets[0].localId, { notes: "felt good" }).sets[0].completed, true);
  assert.equal(applySetEdit(done, done.sets[0].localId, { reps: 8 }).sets[0].completed, true, "unchanged value keeps completion");
  assert.ok(applyExerciseIdentityEdit(done, { exerciseName: "Row" }).sets.every((row) => !row.completed));
  assert.ok(applyExerciseIdentityEdit(done, { exerciseType: "bodyweight" }).sets.every((row) => !row.completed));
  assert.ok(applyExerciseIdentityEdit(done, { notes: "x" }).sets.every((row) => row.completed));
  assert.ok(applyExerciseIdentityEdit(done, { setup: { seat: "2" } }).sets.every((row) => row.completed));
});

test("deleting the only exercise yields one blank exercise; otherwise picks a neighbour to focus", () => {
  const only = exercise();
  const replaced = deleteExerciseFromLogs([only], only.localId, blankExercise);
  assert.equal(replaced.logs.length, 1);
  assert.notEqual(replaced.logs[0].localId, only.localId);
  assert.equal(replaced.focusExerciseId, replaced.logs[0].localId);
  const [a, b, c] = [exercise(), exercise(), exercise()];
  assert.equal(deleteExerciseFromLogs([a, b, c], b.localId, blankExercise).focusExerciseId, c.localId);
  assert.equal(deleteExerciseFromLogs([a, b, c], c.localId, blankExercise).focusExerciseId, b.localId);
});

test("save blocks partial nonblank work but ignores blank trailing exercises and unperformed valid plans", () => {
  const done = completeExercise(exercise({}, [set({ reps: 8, weight: 100 })])).exercise;
  assert.equal(findSaveBlock([done, blankExercise()]), null);
  assert.equal(findSaveBlock([done, exercise({ exerciseName: "Row" }, [set({ reps: 8, weight: 100 })])]), null);
  const partial = exercise({ exerciseName: "Row" }, [set({ reps: 8, weight: 0 })]);
  const block = findSaveBlock([done, partial]);
  assert.equal(block.exerciseLocalId, partial.localId);
  assert.equal(block.setLocalId, partial.sets[0].localId);
  const unnamed = exercise({ exerciseName: "" }, [set({ reps: 8, weight: 100 })]);
  assert.equal(findSaveBlock([done, unnamed]).exerciseLocalId, unnamed.localId);
  assert.equal(findSaveBlock([done, exercise({ exerciseName: "Row" }, [set({ reps: 8, weight: 100, setType: "warmup" })])]), null);
});
