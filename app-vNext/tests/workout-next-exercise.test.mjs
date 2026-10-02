import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const nextExercise = await import("../src/features/easyworkout/domain/workoutNextExercise.ts").catch(() => ({}));
const workoutPlanning = await import("../src/features/easyworkout/domain/workoutPlanning.ts").catch(() => ({}));

const planning = (focusGroups, movementPattern, requiredEquipment) => ({
  focusGroups,
  movementPattern,
  requiredEquipment,
});

const option = (exerciseId, name, focusGroups, movementPattern, requiredEquipment, overrides = {}) => ({
  exerciseId,
  name,
  selectionLabel: name,
  muscleGroup: focusGroups[0] || "",
  primaryMuscles: [...focusGroups],
  secondaryMuscles: [],
  exerciseType: "weighted",
  planningMetadata: planning(focusGroups, movementPattern, requiredEquipment),
  ...overrides,
});

let setSequence = 0;
const set = (overrides = {}) => ({
  localId: `set-${++setSequence}`,
  reps: 8,
  weight: 100,
  notes: "",
  setType: "standard",
  completed: true,
  deleted: false,
  rir: null,
  ...overrides,
});

const log = (exerciseId, name, exerciseType, sets, overrides = {}) => ({
  localId: `log-${exerciseId || name}`,
  exerciseId,
  exerciseName: name,
  muscleGroup: "",
  primaryMuscles: [],
  secondaryMuscles: [],
  exerciseType,
  setup: {},
  notes: "",
  sets,
  ...overrides,
});

const history = (entries = []) => Object.fromEntries(entries.map(({ exerciseId, name, performedOn }) => [
  exerciseId ? `id:${exerciseId}` : `legacy:${name.toLowerCase()}`,
  {
    sourceSessionId: `session-${exerciseId || name}`,
    sourceExerciseId: exerciseId,
    lastWeight: 100,
    lastReps: 8,
    lastSets: [{ reps: 8, weight: 100 }],
    lastSetup: {},
    performedOn,
    bestWeight: 100,
    bestVolume: 800,
    sessionCount: 1,
  },
]));

const baseOptions = [
  option("pulldown", "Lat Pulldown", ["Back"], "vertical-pull", ["selectorized-machine"]),
  option("row", "Seated Row", ["Back"], "horizontal-pull", ["selectorized-machine"]),
  option("curl", "Bicep Curl", ["Biceps"], "elbow-flexion-supinated", ["dumbbell"]),
  option("hammer", "Hammer Curl", ["Biceps"], "elbow-flexion-neutral", ["dumbbell"]),
];

const derive = (overrides = {}) => nextExercise.deriveNextExerciseSuggestions({
  planningContext: {
    focusGroups: ["Back", "Biceps"],
    availableEquipment: ["selectorized-machine", "dumbbell"],
    plannedDurationMinutes: 30,
  },
  elapsedSeconds: 10 * 60,
  defaultSetCount: 3,
  exerciseOptions: baseOptions,
  exerciseLogs: [],
  history: {},
  ...overrides,
});

test("requires explicit focus, equipment, and planning time before ranking", () => {
  const result = derive({
    planningContext: { focusGroups: [], availableEquipment: [], plannedDurationMinutes: null },
  });
  assert.equal(result.state, "needs-context");
  assert.deepEqual(result.missingContext, ["focus", "equipment", "time"]);
  assert.deepEqual(result.suggestions, []);
});

test("planning duration accepts sequential editing and backspace without inventing a budget", async () => {
  assert.equal(workoutPlanning.parseWorkoutPlanningDurationInput("3"), null);
  assert.equal(workoutPlanning.parseWorkoutPlanningDurationInput("30"), 30);
  assert.equal(workoutPlanning.parseWorkoutPlanningDurationInput(""), null);
  assert.equal(workoutPlanning.parseWorkoutPlanningDurationInput("361"), null);
  const source = await readFile(new URL("../src/features/easyworkout/routes/EasyWorkoutLogPage.tsx", import.meta.url), "utf8");
  assert.match(source, /value=\{planningDurationInput\}/);
  assert.match(source, /setPlanningDurationInput\(event\.target\.value\)/);
  const planningInput = source.slice(Math.max(0, source.indexOf("value={planningDurationInput}") - 300), source.indexOf("value={planningDurationInput}"));
  assert.match(planningInput, /type="text"/);
  assert.doesNotMatch(planningInput, /type="number"/);
});

test("counts only deliberately completed valid working sets for movement coverage", () => {
  const result = derive({
    exerciseLogs: [
      log("pulldown", "Renamed Pulldown", "weighted", [
        set({ completed: false, weight: 180 }),
        set({ setType: "warmup" }),
        set({ deleted: true }),
        set({ completed: true, weight: 0 }),
      ]),
    ],
  });
  assert.equal(result.state, "ready");
  assert.equal(result.coverage.completedSetsByPattern["vertical-pull"] || 0, 0);
  assert.equal(result.coverage.completedSetsByFocus.Back || 0, 0);
});

test("uses stable identity across renames and ranks missing movement within the under-covered focus", () => {
  const result = derive({
    exerciseLogs: [
      log("pulldown", "Wide-Grip Pulldown", "weighted", [set(), set()]),
      log("curl", "Bicep Curl", "weighted", [set(), set(), set(), set()]),
    ],
    history: history([
      { exerciseId: "row", name: "Seated Row", performedOn: "2026-09-15" },
      { exerciseId: "hammer", name: "Hammer Curl", performedOn: "2026-09-01" },
    ]),
  });
  assert.equal(result.state, "ready");
  assert.equal(result.suggestions[0].exerciseId, "row");
  assert.equal(result.suggestions[0].movementPattern, "horizontal-pull");
  assert.equal(result.suggestions[0].patternCompletedSets, 0);
});

test("filters equipment mismatches and unsupported duration or distance exercises", () => {
  const result = derive({
    planningContext: {
      focusGroups: ["Back"],
      availableEquipment: ["dumbbell"],
      plannedDurationMinutes: 20,
    },
    exerciseOptions: [
      option("row", "Seated Row", ["Back"], "horizontal-pull", ["selectorized-machine"]),
      option("rower", "Row Erg", ["Back"], "conditioning", ["cardio-machine"], { exerciseType: "distance" }),
    ],
  });
  assert.equal(result.state, "no-candidates");
  assert.deepEqual(result.suggestions, []);
});

test("bodyweight and assisted candidates stay planned and unperformed at safe defaults", () => {
  const result = derive({
    planningContext: {
      focusGroups: ["Back", "Chest"],
      availableEquipment: ["bodyweight", "pull-up-bar"],
      plannedDurationMinutes: 20,
    },
    exerciseOptions: [
      option("pushup", "Push-up", ["Chest"], "horizontal-push", ["bodyweight"], { exerciseType: "bodyweight" }),
      option("assisted-pullup", "Assisted Pull-up", ["Back"], "vertical-pull", ["pull-up-bar"], { exerciseType: "assisted" }),
    ],
  });
  assert.equal(result.state, "ready");
  assert.deepEqual(result.suggestions.map((entry) => entry.exerciseType).sort(), ["assisted", "bodyweight"]);
  let id = 0;
  for (const suggestion of result.suggestions) {
    const created = nextExercise.createPlannedExerciseFromSuggestion(suggestion, () => `candidate-${++id}`);
    assert.ok(created.sets.every((entry) => entry.completed === false && entry.weight === 0));
  }
});

test("keeps same-name stable machines separate and excludes only the identity already present", () => {
  const options = [
    option("lat-a", "Lat Pulldown", ["Back"], "vertical-pull", ["selectorized-machine"]),
    option("lat-b", "Lat Pulldown", ["Back"], "horizontal-pull", ["selectorized-machine"], { selectionLabel: "Lat Pulldown · lat-b" }),
  ];
  const result = derive({
    planningContext: { focusGroups: ["Back"], availableEquipment: ["selectorized-machine"], plannedDurationMinutes: 20 },
    exerciseOptions: options,
    exerciseLogs: [log("lat-a", "Renamed Machine", "weighted", [set()])],
  });
  assert.equal(result.state, "ready");
  assert.deepEqual(result.suggestions.map((entry) => entry.exerciseId), ["lat-b"]);
});

test("blocks missing-movement claims when a completed in-focus exercise has ambiguous metadata", () => {
  const result = derive({
    exerciseLogs: [log(null, "Mystery Back Pull", "weighted", [set()], { muscleGroup: "Back" })],
  });
  assert.equal(result.state, "unclassified-completed");
  assert.deepEqual(result.unclassifiedCompletedExercises, ["Mystery Back Pull"]);
  assert.deepEqual(result.suggestions, []);
});

test("blocks unclassified completed work with blank groups or selected-focus primary muscles", () => {
  for (const ambiguousLog of [
    log(null, "Mystery Movement", "weighted", [set()]),
    log(null, "Legacy Pull", "weighted", [set()], { primaryMuscles: ["Back"] }),
  ]) {
    const result = derive({ exerciseLogs: [ambiguousLog] });
    assert.equal(result.state, "unclassified-completed");
    assert.deepEqual(result.suggestions, []);
  }
});

test("ignores unclassified completed work only when its canonical classification is clearly out of focus", () => {
  const result = derive({
    planningContext: { focusGroups: ["Back"], availableEquipment: ["selectorized-machine"], plannedDurationMinutes: 20 },
    exerciseOptions: [baseOptions[1]],
    exerciseLogs: [log(null, "Legacy Leg Extension", "weighted", [set()], { muscleGroup: "Legs" })],
  });
  assert.equal(result.state, "ready");
  assert.equal(result.suggestions[0].exerciseId, "row");
});

test("excludes conflicting candidate metadata instead of guessing", () => {
  const result = derive({
    planningContext: { focusGroups: ["Back"], availableEquipment: ["selectorized-machine"], plannedDurationMinutes: 20 },
    exerciseOptions: [
      option("row", "Seated Row", ["Back"], "horizontal-pull", ["selectorized-machine"]),
      option("row", "Seated Row", ["Back"], "vertical-pull", ["selectorized-machine"]),
    ],
  });
  assert.equal(result.state, "no-candidates");
  assert.deepEqual(result.suggestions, []);
});

test("no-history candidates remain planning-only with low confidence and no load target", () => {
  const result = derive({
    planningContext: { focusGroups: ["Back"], availableEquipment: ["selectorized-machine"], plannedDurationMinutes: 20 },
    exerciseOptions: [baseOptions[1]],
  });
  assert.equal(result.state, "ready");
  assert.equal(result.suggestions[0].confidence, "low");
  assert.equal(result.suggestions[0].lastCompletedOn, null);
  assert.equal("targetWeight" in result.suggestions[0], false);
});

test("uses exact disclosed time-fit boundaries without encouraging a rushed set", () => {
  const cases = [
    { remainingSeconds: 209, state: "no-fit", sets: 0 },
    { remainingSeconds: 210, state: "ready", sets: 1 },
    { remainingSeconds: 360, state: "ready", sets: 2 },
    { remainingSeconds: 510, state: "ready", sets: 3 },
  ];
  for (const scenario of cases) {
    const result = derive({
      planningContext: { focusGroups: ["Back"], availableEquipment: ["selectorized-machine"], plannedDurationMinutes: 20 },
      elapsedSeconds: 20 * 60 - scenario.remainingSeconds,
      exerciseOptions: [baseOptions[1]],
    });
    assert.equal(result.state, scenario.state, JSON.stringify(scenario));
    assert.equal(result.suggestions[0]?.proposedSets || 0, scenario.sets, JSON.stringify(scenario));
  }
});

test("ranking is deterministic when candidate and draft input order changes", () => {
  const exerciseLogs = [
    log("pulldown", "Lat Pulldown", "weighted", [set(), set()]),
    log("curl", "Bicep Curl", "weighted", [set(), set(), set()]),
  ];
  const first = derive({ exerciseOptions: [...baseOptions], exerciseLogs });
  const second = derive({ exerciseOptions: [...baseOptions].reverse(), exerciseLogs: [...exerciseLogs].reverse() });
  assert.deepEqual(
    first.suggestions.map((entry) => entry.exerciseId),
    second.suggestions.map((entry) => entry.exerciseId)
  );
});

test("adding a suggestion creates only zero-load unperformed planned sets", () => {
  const result = derive({
    planningContext: { focusGroups: ["Back"], availableEquipment: ["selectorized-machine"], plannedDurationMinutes: 20 },
    exerciseOptions: [baseOptions[1]],
  });
  assert.equal(result.state, "ready");
  let id = 0;
  const created = nextExercise.createPlannedExerciseFromSuggestion(result.suggestions[0], () => `new-${++id}`);
  assert.equal(created.exerciseId, "row");
  assert.equal(created.exerciseType, "weighted");
  assert.deepEqual(created.setup, {});
  assert.equal(created.sets.length, 3);
  assert.ok(created.sets.every((entry) => entry.completed === false && entry.weight === 0 && entry.deleted === false));
});

test("exercise catalog exposes explicit type, focus, movement, and equipment metadata controls", async () => {
  const source = await readFile(new URL("../src/features/easyworkout/routes/EasyWorkoutRoutinesPage.tsx", import.meta.url), "utf8");
  assert.match(source, /Exercise type/);
  assert.match(source, /Planning focus/);
  assert.match(source, /Movement pattern/);
  assert.match(source, /Required equipment/);
  assert.match(source, /normalizeWorkoutExercisePlanningMetadata/);
});
