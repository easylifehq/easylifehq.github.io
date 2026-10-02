import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const workoutImport = await import("../src/features/easyworkout/domain/workoutImportPreview.ts").catch(() => ({}));

const options = [
  { exerciseId: "bench-a", name: "Bench Press", selectionLabel: "Bench Press", muscleGroup: "Chest", primaryMuscles: ["Chest"], secondaryMuscles: ["Triceps"], exerciseType: "weighted" },
  { exerciseId: "lat-a", name: "Lat Pulldown", selectionLabel: "Lat Pulldown · lat-a", muscleGroup: "Back", primaryMuscles: ["Lats"], secondaryMuscles: ["Biceps"], exerciseType: "weighted" },
  { exerciseId: "lat-b", name: "Lat Pulldown", selectionLabel: "Lat Pulldown · lat-b", muscleGroup: "Back", primaryMuscles: ["Lats"], secondaryMuscles: ["Biceps"], exerciseType: "weighted" },
  { exerciseId: "pull-up", name: "Pull Up", selectionLabel: "Pull Up", muscleGroup: "Back", primaryMuscles: ["Lats"], secondaryMuscles: ["Biceps"], exerciseType: "bodyweight" },
  { exerciseId: "assist", name: "Assisted Pull-Up", selectionLabel: "Assisted Pull-Up", muscleGroup: "Back", primaryMuscles: ["Lats"], secondaryMuscles: ["Biceps"], exerciseType: "assisted" },
  { exerciseId: "plank", name: "Plank", selectionLabel: "Plank", muscleGroup: "Core", primaryMuscles: ["Core"], secondaryMuscles: [], exerciseType: "duration" },
  { exerciseId: "rower", name: "Rower", selectionLabel: "Rower", muscleGroup: "Cardio", primaryMuscles: ["Cardio"], secondaryMuscles: [], exerciseType: "distance" },
];

const set = (localId, overrides = {}) => ({
  localId,
  reps: 5,
  weight: 185,
  notes: "existing",
  setType: "standard",
  completed: false,
  deleted: false,
  rir: null,
  ...overrides,
});

const exercise = (localId, overrides = {}) => ({
  localId,
  exerciseId: "bench-a",
  exerciseName: "Bench Press",
  muscleGroup: "Chest",
  primaryMuscles: ["Chest"],
  secondaryMuscles: ["Triceps"],
  exerciseType: "weighted",
  setup: {},
  notes: "existing exercise",
  sets: [set(`${localId}-set`) ],
  ...overrides,
});

const draft = (overrides = {}) => ({
  schemaVersion: 6,
  ownerId: "user-a",
  weightUnit: "lb",
  draftId: "draft-12345678",
  selectedRoutineId: "",
  routineOriginId: null,
  performedOn: "2026-10-01",
  startedAt: "2026-10-01T08:00:00.000Z",
  elapsedSeconds: 120,
  durationMinutes: "30",
  sessionNotes: "keep me",
  completionReviewRequired: false,
  activeExerciseId: "existing-bench",
  exerciseLogs: [exercise("existing-bench")],
  appliedImportOperationIds: [],
  updatedAt: "2026-10-01T08:02:00.000Z",
  ...overrides,
});

const preview = (sourceText, overrides = {}) => workoutImport.parseWorkoutImportPreview({
  sourceText,
  draft: draft(overrides.draft),
  exerciseOptions: options,
  today: "2026-10-02",
  operationId: overrides.operationId ?? "import-operation-1",
});

test("supported text produces a review-only preview with explicit normalized units and setup", () => {
  const result = preview([
    "date: 2026-10-02",
    "unit: lb",
    "duration: 42",
    "",
    "Lat Pulldown [id=lat-a]: 3x8@110 lb | seat=2 | arm=4",
    "Bench Press: 10@100, 9@45 kg",
  ].join("\n"));

  assert.equal(result.canConfirm, true);
  assert.equal(result.sourceText.includes("Lat Pulldown"), true);
  assert.deepEqual(result.metadata, { performedOn: "2026-10-02", durationMinutes: "42" });
  assert.equal(result.metadataChanges.length, 2);
  assert.equal(result.rows[0].exercise.exerciseId, "lat-a");
  assert.deepEqual(result.rows[0].setup, { seat: "2", arm: "4" });
  assert.deepEqual(result.rows[0].sets.map((entry) => entry.reps), [8, 8, 8]);
  assert.deepEqual(result.rows[0].sets.map((entry) => entry.completed), [false, false, false]);
  assert.equal(result.rows[1].sets[0].sourceUnit, "lb");
  assert.equal(result.rows[1].sets[1].sourceUnit, "kg");
  assert.ok(Math.abs(result.rows[1].sets[1].weight - 99.208017984) < 1e-6);
  assert.deepEqual(draft().exerciseLogs, [exercise("existing-bench")]);
});

test("omitted units inherit the current draft unit visibly instead of defaulting to pounds", () => {
  const result = preview("Bench Press: 8@40", { draft: { weightUnit: "kg" } });
  assert.equal(result.canConfirm, true);
  assert.equal(result.unitContext.unit, "kg");
  assert.equal(result.unitContext.source, "draft");
  assert.equal(result.rows[0].sets[0].sourceUnit, "kg");
  assert.equal(result.rows[0].sets[0].weight, 40);
});

test("duplicate names require an explicit stable ID and unknown exercises borrow no metadata", () => {
  const ambiguous = preview("Lat Pulldown: 8@100 lb");
  assert.equal(ambiguous.canConfirm, false);
  assert.match(ambiguous.rows[0].errors.join(" "), /multiple saved exercises|stable id/i);

  const unknown = preview("Garage Pulldown: 8@100 lb");
  assert.equal(unknown.canConfirm, true);
  assert.equal(unknown.rows[0].exercise.exerciseId, null);
  assert.equal(unknown.rows[0].exercise.muscleGroup, "");
  assert.deepEqual(unknown.rows[0].exercise.primaryMuscles, []);
  assert.match(unknown.rows[0].warnings.join(" "), /unknown/i);
});

test("bodyweight and assisted syntax is accepted only from explicit matched exercise types", () => {
  const result = preview([
    "Pull Up [id=pull-up]: 3x8 reps",
    "Assisted Pull-Up [id=assist]: 2x6@40 lb",
  ].join("\n"));
  assert.equal(result.canConfirm, true);
  assert.equal(result.rows[0].exercise.exerciseType, "bodyweight");
  assert.deepEqual(result.rows[0].sets.map(({ reps, weight }) => ({ reps, weight })), [
    { reps: 8, weight: 0 }, { reps: 8, weight: 0 }, { reps: 8, weight: 0 },
  ]);
  assert.equal(result.rows[1].exercise.exerciseType, "assisted");
  assert.deepEqual(result.rows[1].sets.map(({ reps, weight }) => ({ reps, weight })), [
    { reps: 6, weight: 40 }, { reps: 6, weight: 40 },
  ]);
});

test("unsupported duration and distance exercise types are blocked instead of creating unusable sets", () => {
  for (const sourceText of ["Plank [id=plank]: 8@100 lb", "Rower [id=rower]: 8@100 lb"]) {
    const result = preview(sourceText);
    assert.equal(result.canConfirm, false, sourceText);
    assert.match(result.rows[0].errors.join(" "), /duration|distance|not supported/i);
  }
});

test("append blocks stable-ID type conflicts while replace can safely correct the draft row", () => {
  const sourceDraft = draft({
    exerciseLogs: [exercise("mistyped-pull-up", {
      exerciseId: "pull-up",
      exerciseName: "Pull Up",
      exerciseType: "weighted",
    })],
  });
  const parsed = workoutImport.parseWorkoutImportPreview({
    sourceText: "Pull Up [id=pull-up]: 3x8 reps",
    draft: sourceDraft,
    exerciseOptions: options,
    today: "2026-10-02",
    operationId: "import-operation-1",
  });
  const originalExerciseLogs = structuredClone(sourceDraft.exerciseLogs);
  assert.equal(parsed.canConfirm, true);
  assert.match(parsed.appendErrors.join(" "), /type|weighted|bodyweight/i);

  const appended = workoutImport.applyWorkoutImportPreview({
    draft: sourceDraft, preview: parsed, mode: "append", applyMetadata: false, createId: () => "unused",
  });
  assert.equal(appended.ok, false);
  assert.deepEqual(sourceDraft.exerciseLogs, originalExerciseLogs);

  const replaced = workoutImport.applyWorkoutImportPreview({
    draft: sourceDraft,
    preview: parsed,
    mode: "replace",
    applyMetadata: false,
    createId: (() => { let value = 0; return () => `replacement-${++value}`; })(),
  });
  assert.equal(replaced.ok, true);
  assert.equal(replaced.draft.exerciseLogs[0].exerciseType, "bodyweight");
  assert.deepEqual(replaced.draft.exerciseLogs[0].sets.map((entry) => entry.completed), [false, false, false]);
});

test("invalid directives, impossible values, rep ranges, and malformed tokens block atomically", () => {
  const cases = [
    "unit: stone\nBench Press: 8@100 stone",
    "unit: lb\nunit: kg\nBench Press: 8@100 lb",
    "date: 2026-10-03\nBench Press: 8@100 lb",
    "duration: -1\nBench Press: 8@100 lb",
    "Bench Press: 0@100 lb",
    "Bench Press: 8@0 lb",
    "Bench Press: 8-10@100 lb",
    "Bench Press: 8@100 lb | pulley=3",
    "Bench Press: definitely eight",
  ];
  for (const sourceText of cases) {
    const result = preview(sourceText);
    assert.equal(result.canConfirm, false, sourceText);
    assert.ok(result.errors.length > 0 || result.rows.some((row) => row.errors.length > 0), sourceText);
  }
});

test("parser enforces existing exercise, set, and serialized-size bounds", () => {
  const tooManyExercises = preview(Array.from({ length: 81 }, (_, index) => `Lift ${index}: 8@10 lb`).join("\n"));
  assert.equal(tooManyExercises.canConfirm, false);
  assert.match(tooManyExercises.errors.join(" "), /80/);

  const tooManySets = preview(`Bench Press: ${Array.from({ length: 101 }, () => "8@10 lb").join(", ")}`);
  assert.equal(tooManySets.canConfirm, false);
  assert.match(tooManySets.rows[0].errors.join(" "), /100/);

  const oversized = preview("x".repeat(500_001));
  assert.equal(oversized.canConfirm, false);
  assert.match(oversized.errors.join(" "), /too large/i);
});

test("missing or malformed operation identities cannot create a confirmable preview", () => {
  for (const operationId of ["", "short", "../shared", "x".repeat(257)]) {
    const result = preview("Bench Press: 8@100 lb", { operationId });
    assert.equal(result.canConfirm, false, operationId);
    assert.match(result.errors.join(" "), /operation identity/i);
  }
});

test("append merges only stable identities and keeps unknown same-name machines separate", () => {
  const sourceDraft = draft({ exerciseLogs: [
    exercise("existing-bench"),
    exercise("garage-machine", { exerciseId: "garage-stable", exerciseName: "Garage Press", sets: [set("garage-set")] }),
    exercise("legacy-garage-machine", {
      exerciseId: null,
      exerciseName: "Garage Press",
      setup: { seat: "1" },
      sets: [set("legacy-garage-set")],
    }),
  ] });
  const parsed = workoutImport.parseWorkoutImportPreview({
    sourceText: "Bench Press [id=bench-a]: 8@135 lb\nGarage Press: 8@95 lb | seat=9",
    draft: sourceDraft,
    exerciseOptions: options,
    today: "2026-10-02",
    operationId: "import-operation-1",
  });
  const applied = workoutImport.applyWorkoutImportPreview({
    draft: sourceDraft, preview: parsed, mode: "append", applyMetadata: false, createId: (() => { let value = 0; return () => `new-${++value}`; })(),
  });
  assert.equal(applied.ok, true);
  assert.equal(applied.applied, true);
  assert.equal(applied.draft.draftId, "draft-12345678");
  assert.equal(applied.draft.exerciseLogs.length, 4);
  assert.equal(applied.draft.exerciseLogs[0].sets.length, 2);
  assert.equal(applied.draft.exerciseLogs[1].sets.length, 1);
  assert.equal(applied.draft.exerciseLogs[2].sets.length, 1);
  assert.deepEqual(applied.draft.exerciseLogs[2].setup, { seat: "1" });
  assert.equal(applied.draft.exerciseLogs[3].exerciseId, null);
  assert.deepEqual(applied.draft.exerciseLogs[3].setup, { seat: "9" });
  assert.deepEqual(applied.draft.exerciseLogs.flatMap((entry) => entry.sets.slice(1)).map((entry) => entry.completed), [false]);
  assert.equal(applied.draft.performedOn, "2026-10-01");
  assert.equal(applied.draft.durationMinutes, "30");
});

test("replace is explicit, reports removals, and metadata changes require a separate confirmation", () => {
  const parsed = preview("date: 2026-10-02\nduration: 42\nBench Press: 8@135 lb");
  assert.deepEqual(parsed.replacementSummary, { exerciseCount: 1, setCount: 1 });

  const withoutMetadata = workoutImport.applyWorkoutImportPreview({ draft: draft(), preview: parsed, mode: "replace", applyMetadata: false, createId: () => "new-id" });
  assert.equal(withoutMetadata.ok, true);
  assert.equal(withoutMetadata.draft.performedOn, "2026-10-01");
  assert.equal(withoutMetadata.draft.durationMinutes, "30");

  const withMetadata = workoutImport.applyWorkoutImportPreview({ draft: draft(), preview: parsed, mode: "replace", applyMetadata: true, createId: () => "new-id" });
  assert.equal(withMetadata.ok, true);
  assert.equal(withMetadata.draft.performedOn, "2026-10-02");
  assert.equal(withMetadata.draft.durationMinutes, "42");
  assert.equal(withMetadata.draft.exerciseLogs[0].sets[0].completed, false);
});

test("stale previews, invalid previews, and invalid modes leave the exact draft unchanged", () => {
  const original = draft();
  const parsed = preview("Bench Press: 8@135 lb");
  const edited = { ...original, sessionNotes: "edited while preview was open" };
  const stale = workoutImport.applyWorkoutImportPreview({ draft: edited, preview: parsed, mode: "append", applyMetadata: false, createId: () => "unused" });
  assert.equal(stale.ok, false);
  assert.match(stale.error, /changed|refresh/i);
  assert.deepEqual(edited, { ...original, sessionNotes: "edited while preview was open" });

  const invalid = workoutImport.applyWorkoutImportPreview({ draft: original, preview: preview("Bench Press: bad"), mode: "append", applyMetadata: false, createId: () => "unused" });
  assert.equal(invalid.ok, false);
  assert.deepEqual(original, draft());
});

test("one import operation applies at most once while repeated identical planned sets remain legitimate", () => {
  const parsed = preview("Bench Press: 8@135 lb, 8@135 lb");
  const first = workoutImport.applyWorkoutImportPreview({ draft: draft(), preview: parsed, mode: "append", applyMetadata: false, createId: (() => { let value = 0; return () => `new-${++value}`; })() });
  assert.equal(first.ok, true);
  assert.equal(first.draft.exerciseLogs[0].sets.length, 3);
  assert.deepEqual(first.draft.exerciseLogs[0].sets.slice(1).map((entry) => entry.weight), [135, 135]);
  const retry = workoutImport.applyWorkoutImportPreview({ draft: first.draft, preview: parsed, mode: "append", applyMetadata: false, createId: () => "must-not-run" });
  assert.equal(retry.ok, true);
  assert.equal(retry.applied, false);
  assert.deepEqual(retry.draft, first.draft);
});

test("workout log exposes an accessible review gate before atomically changing the active draft", async () => {
  const source = await readFile(new URL("../src/features/easyworkout/routes/EasyWorkoutLogPage.tsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/styles/globals.css", import.meta.url), "utf8");
  assert.match(source, /parseWorkoutImportPreview/);
  assert.match(source, /applyWorkoutImportPreview/);
  assert.match(source, /Preview planned sets/);
  assert.match(source, /name="workout-import-mode"/);
  assert.match(source, /value="append"/);
  assert.match(source, /value="replace"/);
  assert.match(source, /Apply imported date and duration/);
  assert.match(source, /Import as planned sets/);
  assert.match(source, /role="alert"/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /latestDraftRef\.current/);
  assert.match(source, /appliedImportOperationIds/);
  assert.match(source, /workoutImportPreview\.appendErrors\.length/);
  assert.match(source, /disabled=\{Boolean\(workoutImportPreview\.appendErrors\.length\)\}/);
  assert.doesNotMatch(source, /function parseWorkoutPaste/);
  assert.doesNotMatch(source, /setWorkoutPaste\(""\)/);
  assert.match(styles, /\.workout-import-preview/);
  assert.match(styles, /\.workout-import-preview-row[\s\S]{0,500}overflow-wrap:\s*anywhere/);
  assert.match(styles, /\.workout-import-preview[\s\S]{0,1200}min-height:\s*44px/);
  assert.match(styles, /\.workout-import-preview \.workout-section-heading > div[\s\S]{0,200}display:\s*grid/);
  assert.match(styles, /\.workout-import-preview \.workout-check-row[\s\S]{0,250}min-height:\s*44px/);
});
