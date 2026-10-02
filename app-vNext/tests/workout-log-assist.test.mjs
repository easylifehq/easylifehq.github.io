import test from "node:test";
import assert from "node:assert/strict";
import * as workoutLogAssist from "../src/features/easyworkout/domain/workoutLogAssist.ts";
const {
  buildWorkoutExerciseOptions,
  deriveExerciseHistory,
  fillSetsFromLastPerformance,
  findExerciseHistory,
} = workoutLogAssist;

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
  const previous = findExerciseHistory(history, "bench press", "bench");
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

  const previous = findExerciseHistory(deriveExerciseHistory(sessions, "lb"), "bench press", "bench");
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

test("recalling historical measurements requires fresh completion even for a previously done row", () => {
  const previous = {
    lastWeight: 185,
    lastReps: 5,
    lastSets: [{ reps: 5, weight: 185 }],
    performedOn: "2026-09-01",
    bestWeight: 185,
    bestVolume: 925,
    sessionCount: 1,
  };
  const filled = fillSetsFromLastPerformance([
    { localId: "set-done", reps: 8, weight: 135, notes: "", setType: "standard", completed: true, deleted: false, rir: null },
  ], previous);
  assert.equal(filled[0].weight, 185);
  assert.equal(filled[0].reps, 5);
  assert.equal(filled[0].completed, false);
});

test("last setup follows stable exercise identity across renames and never crosses same-name machines", () => {
  const sessions = [
    session({
      id: "machine-b-newer",
      schemaVersion: 5,
      performedOn: "2026-09-03",
      exercises: [{ exerciseId: "pulldown-b", exerciseName: "Lat Pulldown", exerciseType: "weighted", setup: { seat: "7", arm: "1" }, notes: "", sets: [{ reps: 8, weight: 120, completed: true }] }],
    }),
    session({
      id: "machine-a-planned",
      schemaVersion: 5,
      performedOn: "2026-09-02",
      exercises: [{ exerciseId: "pulldown-a", exerciseName: "Lat Pulldown", exerciseType: "weighted", setup: { seat: "9", arm: "9" }, notes: "", sets: [{ reps: 8, weight: 999, completed: false }] }],
    }),
    session({
      id: "machine-a-completed",
      schemaVersion: 5,
      performedOn: "2026-09-01",
      weightUnit: "kg",
      exercises: [{ exerciseId: "pulldown-a", exerciseName: "Vertical Pull", exerciseType: "weighted", setup: { seat: "2", arm: "4" }, notes: "", sets: [{ reps: 8, weight: 50, completed: true }] }],
    }),
  ];

  const history = deriveExerciseHistory(sessions, "lb");
  const machineA = findExerciseHistory(history, "Lat Pulldown", "pulldown-a");
  const machineB = findExerciseHistory(history, "Lat Pulldown", "pulldown-b");

  assert.equal(machineA?.sourceSessionId, "machine-a-completed");
  assert.equal(machineA?.performedOn, "2026-09-01");
  assert.deepEqual(machineA?.lastSetup, { seat: "2", arm: "4" });
  assert.ok(Math.abs(machineA.lastWeight - 110.231) < 0.01);
  assert.equal(machineB?.sourceSessionId, "machine-b-newer");
  assert.deepEqual(machineB?.lastSetup, { seat: "7", arm: "1" });
});

test("stable identity uses name fallback only from legacy no-ID history", () => {
  const sessions = [
    session({
      id: "other-stable-machine",
      schemaVersion: 5,
      performedOn: "2026-09-03",
      exercises: [{ exerciseId: "pulldown-b", exerciseName: "Lat Pulldown", exerciseType: "weighted", setup: { seat: "8" }, notes: "", sets: [{ reps: 8, weight: 120, completed: true }] }],
    }),
    session({
      id: "legacy-no-id",
      performedOn: "2026-09-01",
      exercises: [{ exerciseId: null, exerciseName: "Lat Pulldown", exerciseType: "weighted", setup: { seat: "3", arm: "5" }, notes: "", sets: [{ reps: 10, weight: 90 }] }],
    }),
  ];

  const history = deriveExerciseHistory(sessions, "lb");
  const fallback = findExerciseHistory(history, "Lat Pulldown", "pulldown-a");
  assert.equal(fallback?.sourceSessionId, "legacy-no-id");
  assert.deepEqual(fallback?.lastSetup, { seat: "3", arm: "5" });
  assert.equal(findExerciseHistory(history, "Renamed Pulldown", "pulldown-a"), undefined);
});

test("bodyweight and assisted completed history can recall setup without marking draft sets done", () => {
  const sessions = [session({
    schemaVersion: 5,
    exercises: [
      { exerciseId: "pullup", exerciseName: "Pull-up", exerciseType: "bodyweight", setup: { other: "neutral handles" }, notes: "", sets: [{ reps: 8, weight: 0, completed: true }] },
      { exerciseId: "assist", exerciseName: "Assisted Pull-up", exerciseType: "assisted", setup: { pad: "4" }, notes: "", sets: [{ reps: 8, weight: 35, completed: true }] },
    ],
  })];
  const history = deriveExerciseHistory(sessions, "kg");
  const bodyweight = findExerciseHistory(history, "Pull-up", "pullup");
  const assisted = findExerciseHistory(history, "Assisted Pull-up", "assist");
  assert.deepEqual(bodyweight?.lastSetup, { other: "neutral handles" });
  assert.deepEqual(assisted?.lastSetup, { pad: "4" });

  const draftSet = { localId: "set", reps: 1, weight: 0, notes: "", setType: "standard", completed: true, deleted: false, rir: null };
  assert.equal(fillSetsFromLastPerformance([draftSet], bodyweight)[0].completed, false);
  assert.equal(fillSetsFromLastPerformance([draftSet], assisted)[0].completed, false);
});

test("exercise options put recently used names first and deduplicate saved and built-in matches", () => {
  const sessions = [session({ exercises: [{ exerciseId: "row-saved", exerciseName: "Seated Row", muscleGroup: "Back", primaryMuscles: ["Back"], secondaryMuscles: ["Biceps"], exerciseType: "weighted", notes: "", sets: [] }] })];
  const options = buildWorkoutExerciseOptions(
    [{ id: "row-saved", name: "Seated Row", muscleGroup: "Upper back", notes: "", createdAt: null, updatedAt: null }, { id: "curl", name: "Cable Curl", muscleGroup: "Biceps", notes: "", createdAt: null, updatedAt: null }],
    sessions,
    [{ name: "Seated Row", muscleGroup: "Back" }, { name: "Squat", muscleGroup: "Legs" }]
  );
  assert.deepEqual(options.map((option) => option.name), ["Seated Row", "Cable Curl", "Squat"]);
  assert.equal(options[0].exerciseId, "row-saved");
  assert.equal(options[0].muscleGroup, "Upper back");
});

test("same-name saved machines remain distinct and require an unambiguous selection", () => {
  const options = buildWorkoutExerciseOptions(
    [
      { id: "pulldown-a", name: "Lat Pulldown", muscleGroup: "Back", notes: "Machine A", createdAt: null, updatedAt: null },
      { id: "pulldown-b", name: "Lat Pulldown", muscleGroup: "Back", notes: "Machine B", createdAt: null, updatedAt: null },
    ],
    [],
    [{ name: "Lat Pulldown", muscleGroup: "Back" }]
  );
  assert.equal(typeof workoutLogAssist.resolveWorkoutExerciseOption, "function");
  assert.deepEqual(options.map((option) => option.exerciseId), ["pulldown-a", "pulldown-b"]);
  assert.equal(new Set(options.map((option) => option.selectionLabel)).size, 2);
  assert.equal(workoutLogAssist.resolveWorkoutExerciseOption(options, options[0].selectionLabel, null)?.exerciseId, "pulldown-a");
  assert.equal(workoutLogAssist.resolveWorkoutExerciseOption(options, options[1].selectionLabel, null)?.exerciseId, "pulldown-b");
  assert.equal(workoutLogAssist.resolveWorkoutExerciseOption(options, "Lat Pulldown", "pulldown-a")?.exerciseId, "pulldown-a");
  assert.equal(workoutLogAssist.resolveWorkoutExerciseOption(options, "Lat Pulldown", null), undefined);
});
