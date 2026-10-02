import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { convertWeight, isValidWorkingSet } from "../src/features/easyworkout/domain/workoutStatistics.ts";

const quickCapture = await import("../src/features/experiments/domain/quickWorkoutCapture.ts").catch(() => ({}));

test("quick workout capture exposes a validated durable intent boundary", () => {
  assert.equal(typeof quickCapture.createQuickWorkoutCaptureIntent, "function");
  assert.equal(typeof quickCapture.recoverQuickWorkoutCaptureIntent, "function");
  assert.equal(typeof quickCapture.applyQuickWorkoutSetOperation, "function");
  assert.equal(typeof quickCapture.QuickWorkoutCaptureCoordinator, "function");
});

test("a valid weighted set becomes one durable deliberate intent", () => {
  const result = quickCapture.createQuickWorkoutCaptureIntent(
    {
      ownerId: "user-a",
      performedOn: "2026-10-02",
      text: "Bench press 135 x 8",
      notes: "smooth",
    },
    { createId: () => "set-intent-1", nowIso: () => "2026-10-02T08:00:00.000Z" }
  );

  assert.deepEqual(result, {
    ok: true,
    intent: {
      schemaVersion: 1,
      clientSetId: "set-intent-1",
      ownerId: "user-a",
      performedOn: "2026-10-02",
      sourceText: "Bench press 135 x 8",
      exerciseName: "Bench press",
      notes: "smooth",
      reps: 8,
      weight: 135,
      weightUnit: "lb",
      createdAt: "2026-10-02T08:00:00.000Z",
    },
  });
});

test("explicit pound suffixes are not mistaken for part of the exercise name", () => {
  const result = quickCapture.createQuickWorkoutCaptureIntent(
    { ownerId: "user-a", performedOn: "2026-10-02", text: "Bench press 135 x 8 lb", notes: "" },
    { createId: () => "set-intent-2", nowIso: () => "2026-10-02T08:00:00.000Z" }
  );
  assert.equal(result.ok, true);
  assert.equal(result.intent.exerciseName, "Bench press");
});

test("invalid or incomplete weighted input never creates a capture intent", () => {
  for (const input of [
    { ownerId: "user-a", performedOn: "2026-10-02", text: "Bench press", notes: "" },
    { ownerId: "user-a", performedOn: "2026-10-02", text: "Bench press 0 x 8", notes: "" },
    { ownerId: "user-a", performedOn: "2026-10-02", text: "Bench press 135 x 0", notes: "" },
    { ownerId: "user-a", performedOn: "2026-10-02", text: "Bench press 60 x 8 kg", notes: "" },
    { ownerId: "user-a", performedOn: "2026-10-02", text: "Bench press 60 x 8 kilograms", notes: "" },
    { ownerId: "user-a", performedOn: "2026-10-02", text: "Bench press -135 x 8", notes: "" },
    { ownerId: "user-a", performedOn: "2026-10-02", text: "Bench press 135 x 8.5", notes: "" },
    { ownerId: "user-a", performedOn: "2026-02-30", text: "Bench press 135 x 8", notes: "" },
    { ownerId: "", performedOn: "2026-10-02", text: "Bench press 135 x 8", notes: "" },
  ]) {
    const result = quickCapture.createQuickWorkoutCaptureIntent(input, {
      createId: () => "must-not-be-used",
      nowIso: () => "2026-10-02T08:00:00.000Z",
    });
    assert.equal(result.ok, false, JSON.stringify(input));
    assert.match(result.error, /required|positive|valid/i);
  }
});

test("pending capture survives reload only for its authenticated owner", () => {
  const created = quickCapture.createQuickWorkoutCaptureIntent(
    { ownerId: "user-a", performedOn: "2026-10-02", text: "Bench press 135 x 8", notes: "" },
    { createId: () => "pending-1", nowIso: () => "2026-10-02T08:00:00.000Z" }
  );
  assert.equal(created.ok, true);
  const raw = quickCapture.serializeQuickWorkoutCaptureIntent(created.intent);

  assert.match(quickCapture.quickWorkoutCaptureStorageKey("user-a"), /user-a/);
  assert.notEqual(
    quickCapture.quickWorkoutCaptureStorageKey("user-a", "pending-1"),
    quickCapture.quickWorkoutCaptureStorageKey("user-a", "pending-2")
  );
  assert.notEqual(
    quickCapture.quickWorkoutCaptureStorageKey("user-a"),
    quickCapture.quickWorkoutCaptureStorageKey("user-b")
  );
  assert.deepEqual(quickCapture.recoverQuickWorkoutCaptureIntent(raw, "user-a"), {
    intent: created.intent,
    error: "",
  });
  assert.equal(quickCapture.recoverQuickWorkoutCaptureIntent(raw, "user-b").intent, null);
  assert.equal(quickCapture.recoverQuickWorkoutCaptureIntent("{bad", "user-a").intent, null);
  assert.equal(quickCapture.canClearMatchingQuickWorkoutCapture(raw, "user-a", "pending-1"), true);
  assert.equal(quickCapture.canClearMatchingQuickWorkoutCapture(raw, "user-a", "different"), false);
  assert.equal(quickCapture.canClearMatchingQuickWorkoutCapture(raw, "user-b", "pending-1"), false);
});

test("reload selects the oldest valid owner-scoped pending intent without collapsing other tabs", () => {
  const newer = captureIntent("pending-2", { createdAt: "2026-10-02T09:00:00.000Z" });
  const older = captureIntent("pending-1", { createdAt: "2026-10-02T08:00:00.000Z" });
  const otherOwner = captureIntent("other-1", { ownerId: "user-b", createdAt: "2026-10-02T07:00:00.000Z" });
  const entries = [
    { key: quickCapture.quickWorkoutCaptureStorageKey("user-a", newer.clientSetId), value: JSON.stringify(newer) },
    { key: quickCapture.quickWorkoutCaptureStorageKey("user-b", otherOwner.clientSetId), value: JSON.stringify(otherOwner) },
    { key: quickCapture.quickWorkoutCaptureStorageKey("user-a", older.clientSetId), value: JSON.stringify(older) },
  ];
  assert.equal(
    quickCapture.selectOldestPendingQuickWorkoutCapture(entries, "user-a")?.clientSetId,
    "pending-1"
  );
});

test("tampered pending payloads fail closed instead of becoming completed work", () => {
  const invalidPayloads = [
    { schemaVersion: 1, clientSetId: "x", ownerId: "user-a", performedOn: "2026-10-02", sourceText: "Bench", exerciseName: "Bench", notes: "", reps: 0, weight: 135, weightUnit: "lb", createdAt: "2026-10-02T08:00:00.000Z" },
    { schemaVersion: 1, clientSetId: "x", ownerId: "user-a", performedOn: "2026-02-30", sourceText: "Bench", exerciseName: "Bench", notes: "", reps: 8, weight: 135, weightUnit: "lb", createdAt: "2026-10-02T08:00:00.000Z" },
    { schemaVersion: 99, clientSetId: "x", ownerId: "user-a", performedOn: "2026-10-02", sourceText: "Bench", exerciseName: "Bench", notes: "", reps: 8, weight: 135, weightUnit: "lb", createdAt: "2026-10-02T08:00:00.000Z" },
  ];
  for (const payload of invalidPayloads) {
    assert.equal(
      quickCapture.recoverQuickWorkoutCaptureIntent(JSON.stringify(payload), "user-a").intent,
      null
    );
  }
});

const captureIntent = (clientSetId, overrides = {}) => ({
  schemaVersion: 1,
  clientSetId,
  ownerId: "user-a",
  performedOn: "2026-10-02",
  sourceText: "Bench press 135 x 8",
  exerciseName: "Bench press",
  notes: "",
  reps: 8,
  weight: 135,
  weightUnit: "lb",
  createdAt: "2026-10-02T08:00:00.000Z",
  ...overrides,
});

test("one intent creates one explicit schema-v4 completed set", () => {
  const result = quickCapture.applyQuickWorkoutSetOperation(null, captureIntent("intent-1"));
  assert.equal(result.applied, true);
  assert.equal(result.session.schemaVersion, 4);
  assert.equal(result.session.routineName, "Quick Add");
  assert.equal(result.session.weightUnit, "lb");
  assert.deepEqual(result.session.exercises[0].sets, [{
    clientSetId: "intent-1",
    reps: 8,
    weight: 135,
    notes: "",
    setType: "standard",
    completed: true,
    deleted: false,
    rir: null,
  }]);
  assert.equal(isValidWorkingSet(result.session.exercises[0].sets[0], "weighted", { requiresExplicitCompletion: true }), true);
});

test("retrying an acknowledged or ambiguous intent is a no-op and cannot inflate statistics", () => {
  const first = quickCapture.applyQuickWorkoutSetOperation(null, captureIntent("intent-1"));
  const retry = quickCapture.applyQuickWorkoutSetOperation(first.session, captureIntent("intent-1"));
  assert.equal(retry.applied, false);
  assert.deepEqual(retry.session, first.session);
  assert.equal(
    retry.session.exercises.flatMap((exercise) => exercise.sets).filter((set) =>
      isValidWorkingSet(set, "weighted", { requiresExplicitCompletion: true })
    ).length,
    1
  );
});

test("distinct intents with identical values remain legitimate separate sets", () => {
  const first = quickCapture.applyQuickWorkoutSetOperation(null, captureIntent("intent-1"));
  const second = quickCapture.applyQuickWorkoutSetOperation(first.session, captureIntent("intent-2"));
  assert.equal(second.applied, true);
  assert.deepEqual(second.session.exercises[0].sets.map((set) => set.clientSetId), ["intent-1", "intent-2"]);
});

test("transaction retries can merge concurrent different additions without losing either", () => {
  const initial = quickCapture.applyQuickWorkoutSetOperation(null, captureIntent("intent-1"));
  const afterOtherWriter = quickCapture.applyQuickWorkoutSetOperation(initial.session, captureIntent("intent-2", {
    sourceText: "Seated row 100 x 10",
    exerciseName: "Seated row",
    reps: 10,
    weight: 100,
  }));
  const retriedWriter = quickCapture.applyQuickWorkoutSetOperation(afterOtherWriter.session, captureIntent("intent-3"));

  assert.deepEqual(
    retriedWriter.session.exercises.flatMap((exercise) => exercise.sets.map((set) => set.clientSetId)),
    ["intent-1", "intent-3", "intent-2"]
  );
});

test("appending to legacy saved history preserves its established completion semantics", () => {
  const legacy = {
    routineId: null,
    routineName: "Gym Log",
    performedOn: "2026-10-02",
    durationMinutes: null,
    notes: "",
    exercises: [{
      exerciseId: null,
      exerciseName: "Bench press",
      muscleGroup: "Chest",
      notes: "",
      sets: [{ reps: 6, weight: 145, notes: "" }],
    }],
  };
  const result = quickCapture.applyQuickWorkoutSetOperation(legacy, captureIntent("intent-2"));
  assert.equal(result.session.schemaVersion, undefined);
  assert.equal(result.session.exercises[0].sets[0].completed, undefined);
  assert.equal(result.session.exercises[0].sets[1].completed, true);
});

test("pound captures are converted before appending to a kilogram session", () => {
  const legacyMetric = {
    routineId: null,
    routineName: "Gym Log",
    performedOn: "2026-10-02",
    weightUnit: "kg",
    durationMinutes: null,
    notes: "",
    exercises: [{
      exerciseId: null,
      exerciseName: "Bench press",
      muscleGroup: "Chest",
      notes: "",
      sets: [],
    }],
  };

  const result = quickCapture.applyQuickWorkoutSetOperation(legacyMetric, captureIntent("metric-intent"));
  const storedWeight = result.session.exercises[0].sets[0].weight;
  assert.equal(result.session.weightUnit, "kg");
  assert.ok(Math.abs(storedWeight - convertWeight(135, "lb", "kg")) < 1e-10);
  assert.ok(Math.abs(convertWeight(storedWeight * 8, "kg", "lb") - 1080) < 1e-8);
});

test("confirmation reconciliation ignores stale owners and advances the same-owner queue", () => {
  const confirmed = captureIntent("confirmed-a");
  const ownerB = captureIntent("pending-b", { ownerId: "user-b" });
  const nextA = captureIntent("pending-a-2", { createdAt: "2026-10-02T09:00:00.000Z" });
  const entries = [{
    key: quickCapture.quickWorkoutCaptureStorageKey("user-a", nextA.clientSetId),
    value: JSON.stringify(nextA),
  }];

  assert.deepEqual(
    quickCapture.resolveQuickWorkoutCaptureConfirmation(entries, "user-b", ownerB, confirmed),
    { isCurrent: false, nextIntent: null }
  );
  assert.equal(quickCapture.isActiveQuickWorkoutCapture("user-b", ownerB, confirmed), false);
  assert.equal(quickCapture.isActiveQuickWorkoutCapture("user-a", confirmed, confirmed), true);
  assert.deepEqual(
    quickCapture.resolveQuickWorkoutCaptureConfirmation(entries, "user-a", confirmed, confirmed),
    { isCurrent: true, nextIntent: nextA }
  );
});

test("double activation shares one in-flight write", async () => {
  const coordinator = new quickCapture.QuickWorkoutCaptureCoordinator();
  let calls = 0;
  let release;
  const save = () => {
    calls += 1;
    return new Promise((resolve) => {
      release = resolve;
    });
  };
  const first = coordinator.run("intent-1", save);
  const second = coordinator.run("intent-1", save);
  assert.equal(first, second);
  assert.equal(calls, 1);
  release("session-1");
  assert.equal(await first, "session-1");
});

test("an unconfirmed failure releases the guard so retry can reuse the same intent", async () => {
  const coordinator = new quickCapture.QuickWorkoutCaptureCoordinator();
  let calls = 0;
  await assert.rejects(
    coordinator.run("intent-1", async () => {
      calls += 1;
      throw new Error("response lost");
    }),
    /response lost/
  );
  const sessionId = await coordinator.run("intent-1", async () => {
    calls += 1;
    return "session-1";
  });
  assert.equal(sessionId, "session-1");
  assert.equal(calls, 2);
});

test("daily quick-add document identity is deterministic and date-bounded", () => {
  assert.equal(quickCapture.quickWorkoutSessionDocumentId("2026-10-02"), "quick-add-2026-10-02");
  assert.throws(() => quickCapture.quickWorkoutSessionDocumentId("2026-02-30"), /valid/i);
});

test("Firestore quick-add uses the pure merge inside a transaction", async () => {
  const source = await readFile(new URL("../src/lib/firestore/workoutSessions.ts", import.meta.url), "utf8");
  const helper = source.match(/export async function addSetToDailyWorkoutSession[\s\S]*?\n}\n\nexport async function updateWorkoutSession/)?.[0] || "";
  assert.match(helper, /QuickWorkoutCaptureIntent/);
  assert.match(helper, /operation\.ownerId !== userId/);
  assert.match(helper, /quickWorkoutSessionDocumentId/);
  assert.match(helper, /runTransaction/);
  assert.match(helper, /transaction\.get/);
  assert.match(helper, /applyQuickWorkoutSetOperation/);
  assert.match(helper, /transaction\.set/);
  assert.doesNotMatch(helper, /updateWorkoutSession\(/);
  assert.match(source, /clientSetId\?: string/);
});

test("Quick Capture persists before writing and exposes honest retry state", async () => {
  const source = await readFile(new URL("../src/features/experiments/UniversalCapture.tsx", import.meta.url), "utf8");
  assert.match(source, /createQuickWorkoutCaptureIntent/);
  assert.match(source, /serializeQuickWorkoutCaptureIntent/);
  assert.match(source, /selectOldestPendingQuickWorkoutCapture/);
  assert.match(source, /QuickWorkoutCaptureCoordinator/);
  assert.match(source, /isSavingStructuredRef/);
  assert.match(source, /navigator\.onLine === false/);
  assert.match(source, /Set not confirmed/);
  assert.match(source, /canClearMatchingQuickWorkoutCapture/);
  assert.match(source, /resolveQuickWorkoutCaptureConfirmation/);
  assert.match(source, /activeUserIdRef\.current/);
  assert.match(source, /disabled=\{[^}]*isSavingStructured/);
  assert.match(source, /role="status"/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /const \{ user: captureUser \} = useAuth\(\)/);
  assert.match(source, /const user = captureUser \|\| auth\.currentUser/);
  assert.match(
    source,
    /async function saveContextItem[\s\S]{0,300}if \(mode === "workout"\)[\s\S]{0,120}saveWorkoutSet\(options\)[\s\S]{0,200}const user = auth\.currentUser/
  );
  assert.match(
    source,
    /if \(!activeUserId\)[\s\S]{0,200}return;\s+}\s+pendingWorkoutCaptureRef\.current = null;\s+setPendingWorkoutCapture\(null\);/
  );
});
