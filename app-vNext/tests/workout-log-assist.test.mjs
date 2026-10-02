import test from "node:test";
import assert from "node:assert/strict";
import {
  buildWorkoutExerciseOptions,
  deriveExerciseHistory,
  fillSetsFromLastPerformance,
  findExerciseHistory,
} from "../src/features/easyworkout/domain/workoutLogAssist.ts";

const session = (overrides = {}) => ({
  id: "latest",
  routineId: "upper",
  routineName: "Upper",
  performedOn: "2026-09-01",
  weightUnit: "lb",
  durationMinutes: 45,
  notes: "",
  exercises: [],
  createdAt: new Date("2026-09-01T18:00:00Z"),
  updatedAt: null,
  ...overrides,
});

test("previous-performance assist uses the newest completed working sets in order", () => {
  const sessions = [
    session({
      exercises: [{ exerciseId: "bench", exerciseName: "Bench Press", muscleGroup: "Chest", notes: "", sets: [
        { reps: 10, weight: 95, notes: "", setType: "warmup", completed: true, deleted: false },
        { reps: 5, weight: 185, notes: "", setType: "standard", completed: true, deleted: false },
        { reps: 4, weight: 180, notes: "", setType: "standard", completed: true, deleted: false },
        { reps: 5, weight: 999, notes: "", setType: "standard", completed: false, deleted: false },
      ] }],
    }),
    session({ id: "older", performedOn: "2026-08-01", exercises: [{ exerciseId: "bench", exerciseName: "Bench Press", muscleGroup: "Chest", notes: "", sets: [
      { reps: 3, weight: 200, notes: "", setType: "standard", completed: true, deleted: false },
    ] }] }),
  ];
  const history = deriveExerciseHistory(sessions, "lb");
  const previous = findExerciseHistory(history, "bench press");
  assert.deepEqual(previous?.lastSets.map(({ reps, weight }) => ({ reps, weight })), [{ reps: 5, weight: 185 }, { reps: 4, weight: 180 }]);
  assert.equal(previous?.bestWeight, 200);
  assert.equal(previous?.sessionCount, 2);
});

test("schema-v4 history ignores sets without explicit completion while legacy history remains compatible", () => {
  const sessions = [
    session({
      id: "v4",
      schemaVersion: 4,
      performedOn: "2026-09-02",
      exercises: [{ exerciseId: "bench", exerciseName: "Bench Press", muscleGroup: "Chest", notes: "", sets: [
        { reps: 5, weight: 225, notes: "", setType: "standard", deleted: false },
        { reps: 5, weight: 185, notes: "", setType: "standard", completed: true, deleted: false },
      ] }],
    }),
    session({
      id: "legacy",
      performedOn: "2026-09-01",
      exercises: [{ exerciseId: "bench", exerciseName: "Bench Press", muscleGroup: "Chest", notes: "", sets: [
        { reps: 5, weight: 205, notes: "", setType: "standard", deleted: false },
      ] }],
    }),
  ];

  const previous = findExerciseHistory(deriveExerciseHistory(sessions, "lb"), "bench press");
  assert.deepEqual(previous?.lastSets.map(({ reps, weight }) => ({ reps, weight })), [{ reps: 5, weight: 185 }]);
  assert.equal(previous?.bestWeight, 205);
  assert.equal(previous?.sessionCount, 2);
});

test("all routine sets prefill from the last sequence and repeat the final set when needed", () => {
  const previous = {
    lastWeight: 185,
    lastReps: 5,
    lastSets: [{ reps: 5, weight: 185 }, { reps: 4, weight: 180 }],
    performedOn: "2026-09-01",
    bestWeight: 185,
    bestVolume: 1645,
    sessionCount: 1,
  };
  const sets = [1, 2, 3].map((index) => ({ localId: `set-${index}`, reps: 8, weight: 0, notes: "", setType: "standard", completed: false, deleted: false, rir: null }));
  const filled = fillSetsFromLastPerformance(sets, previous);
  assert.deepEqual(filled.map(({ reps, weight }) => ({ reps, weight })), [
    { reps: 5, weight: 185 },
    { reps: 4, weight: 180 },
    { reps: 4, weight: 180 },
  ]);
  assert.deepEqual(filled.map((set) => set.localId), ["set-1", "set-2", "set-3"]);
  assert.deepEqual(filled.map((set) => set.completed), [false, false, false]);
});

test("exercise options put recently used names first and deduplicate saved and built-in matches", () => {
  const sessions = [session({ exercises: [{ exerciseId: "row-history", exerciseName: "Seated Row", muscleGroup: "Back", primaryMuscles: ["Back"], secondaryMuscles: ["Biceps"], exerciseType: "weighted", notes: "", sets: [] }] })];
  const options = buildWorkoutExerciseOptions(
    [{ id: "row-saved", name: "Seated Row", muscleGroup: "Upper back", notes: "", createdAt: null, updatedAt: null }, { id: "curl", name: "Cable Curl", muscleGroup: "Biceps", notes: "", createdAt: null, updatedAt: null }],
    sessions,
    [{ name: "Seated Row", muscleGroup: "Back" }, { name: "Squat", muscleGroup: "Legs" }]
  );
  assert.deepEqual(options.map((option) => option.name), ["Seated Row", "Cable Curl", "Squat"]);
  assert.equal(options[0].exerciseId, "row-saved");
  assert.equal(options[0].muscleGroup, "Upper back");
});
