import test, { after, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { collection, deleteDoc, doc, getDoc, getDocs, runTransaction, setDoc, setLogLevel, updateDoc } from "firebase/firestore";
import { deriveWeeklyReview } from "../src/features/easystatistics/domain/weeklyReview.ts";
import { deriveGuidedWorkoutPlan, getGuidedWorkoutAction } from "../src/features/easyworkout/domain/guidedWorkoutPlan.ts";
import { createWorkoutExportPayload, filterWorkoutHistory, getWorkoutPrSessionIds, serializeWorkoutCsv } from "../src/features/easyworkout/domain/workoutHistoryTools.ts";
import { searchCoreLoopDocuments } from "../src/features/coreloop/domain/globalSearch.ts";
import { deriveFocusedReviewQueue } from "../src/features/coreloop/domain/focusedReviewQueue.ts";
import { buildAccountExport, emptyAccountDataCollections, serializeAccountExport } from "../src/features/coreloop/domain/accountExport.ts";
import { applyQuickWorkoutSetOperation, createQuickWorkoutCaptureIntent } from "../src/features/experiments/domain/quickWorkoutCapture.ts";
import { WORKOUT_SESSION_SCHEMA_VERSION } from "../src/features/easyworkout/domain/workoutSessionContract.ts";
import { workoutLegacyDemoDocument } from "../src/features/easyworkout/demo/workoutLegacyDemoFixtures.ts";
import { LEGACY_IMPORT_COLLECTIONS, buildLegacyImportPlan, reconstructLegacyImports } from "../src/features/easyworkout/domain/legacyWorkoutDurableImport.ts";
import {
  LegacyImportError,
  confirmLegacyImportTransaction,
  readStoredLegacyImportRecords,
  rollbackLegacyImportTransaction,
} from "../src/lib/firestore/legacyWorkoutImportTransactions.ts";

const projectId = "demo-easylife-wave2";
const ownerId = "closure-owner";
const otherId = "closure-other";
const emulatorAddress = process.env.FIRESTORE_EMULATOR_HOST || "";
const [emulatorHost, emulatorPortText] = emulatorAddress.split(":");
let rulesEnvironment;

setLogLevel("silent");

const ownerPath = (collectionName, documentId) => `users/${ownerId}/${collectionName}/${documentId}`;
const records = async (database, collectionName) => (await getDocs(collection(database, "users", ownerId, collectionName))).docs.map((snapshot) => ({ id: snapshot.id, ...snapshot.data() }));
const toDate = (value) => value?.toDate?.() || value || null;

before(async () => {
  assert.match(projectId, /^demo-/, "Emulator tests must use a Firebase demo project ID");
  assert.equal(emulatorHost, "127.0.0.1", "Emulator tests refuse any non-loopback Firestore host");
  assert.equal(Number(emulatorPortText), 8088, "Emulator tests refuse the production Firestore endpoint or an unexpected port");
  assert.notEqual(projectId, "pipeline-2f422");
  const rules = await readFile(new URL("../../firestore.rules", import.meta.url), "utf8");
  rulesEnvironment = await initializeTestEnvironment({ projectId, firestore: { host: emulatorHost, port: Number(emulatorPortText), rules } });
});

beforeEach(async () => rulesEnvironment.clearFirestore());
after(async () => rulesEnvironment.cleanup());

test("authenticated owner data drives My Week and the Today review entry without crossing accounts", async () => {
  const ownerDb = rulesEnvironment.authenticatedContext(ownerId).firestore();
  await Promise.all([
    setDoc(doc(ownerDb, ownerPath("tasks", "capture")), { title: "Sort weekend notes", completed: false, deletedAt: null, dueDate: null, linkedCalendarEventId: null, linkedCalendarBlockIds: [], createdAt: new Date("2026-08-01T12:00:00Z"), updatedAt: null }),
    setDoc(doc(ownerDb, ownerPath("tasks", "priority")), { title: "Send status", completed: false, deletedAt: null, dueDate: new Date("2026-08-01T12:00:00Z"), linkedCalendarEventId: null, linkedCalendarBlockIds: [], createdAt: new Date("2026-08-01T12:00:00Z"), updatedAt: null }),
    setDoc(doc(ownerDb, ownerPath("calendarEvents", "event")), { title: "Check-in", startAt: new Date("2026-08-03T16:00:00Z") }),
    setDoc(doc(ownerDb, ownerPath("calendarTaskBlocks", "block")), { title: "Protected focus", startAt: new Date("2026-08-04T16:00:00Z") }),
    setDoc(doc(ownerDb, ownerPath("projects", "project")), { title: "Weekly reset", status: "active", targetDate: "2026-08-07" }),
    setDoc(doc(ownerDb, ownerPath("applications", "application")), { company: "Cedar", title: "Operations", status: "follow_up", nextFollowUp: "2026-08-05" }),
    setDoc(doc(ownerDb, ownerPath("workoutSessions", "recent")), { routineName: "Upper", performedOn: "2026-07-30", exercises: [] }),
    setDoc(doc(ownerDb, ownerPath("notes", "note")), { title: "Review seed", bodyText: "One deliberate action", deletedAt: null, pinned: true }),
  ]);

  const [tasks, events, blocks, projects, applications, workouts] = await Promise.all([
    records(ownerDb, "tasks"), records(ownerDb, "calendarEvents"), records(ownerDb, "calendarTaskBlocks"), records(ownerDb, "projects"), records(ownerDb, "applications"), records(ownerDb, "workoutSessions"),
  ]);
  const review = deriveWeeklyReview({
    nowDateKey: "2026-08-01",
    tasks: tasks.map((item) => ({ ...item, dueDate: toDate(item.dueDate), createdAt: toDate(item.createdAt), updatedAt: toDate(item.updatedAt) })),
    events: events.map((item) => ({ ...item, startAt: toDate(item.startAt) })),
    taskBlocks: blocks.map((item) => ({ ...item, startAt: toDate(item.startAt) })),
    projects, projectLinks: [], applications, workouts,
  });
  assert.equal(review.leadSectionId, "captures");
  assert.equal(review.sections.find((section) => section.id === "projects").items.length, 1);
  assert.equal(review.sections.find((section) => section.id === "followups").items.length, 1);
  assert.equal(review.sections.find((section) => section.id === "workout").items.length, 1);

  const hqSource = await readFile(new URL("../src/features/hq/routes/HQPage.tsx", import.meta.url), "utf8");
  assert.match(hqSource, /Review my week/);
  assert.match(hqSource, /easystatistics\?tab=week/);
  await assertFails(getDoc(doc(rulesEnvironment.authenticatedContext(otherId).firestore(), ownerPath("tasks", "capture"))));
});

test("authenticated workout records drive guidance, PR filters, and versioned local exports", async () => {
  const ownerDb = rulesEnvironment.authenticatedContext(ownerId).firestore();
  const routine = { name: "Upper", dayLabel: "Upper", exercises: [{ exerciseId: "bench", exerciseName: "Bench Press", targetSets: 3, targetReps: "5", targetWeight: null }] };
  const session = (performedOn) => ({ clientDraftId: `draft-${performedOn}`, schemaVersion: 3, routineId: "upper", routineName: "Upper", performedOn, weightUnit: "lb", durationMinutes: 45, notes: "controlled", exercises: [{ exerciseId: "bench", exerciseName: "Bench Press", exerciseType: "weighted", sets: [{ reps: 5, weight: 185, completed: true, deleted: false, setType: "standard" }] }], createdAt: new Date(`${performedOn}T18:00:00Z`), updatedAt: null });
  await setDoc(doc(ownerDb, ownerPath("workoutRoutines", "upper")), routine);
  await setDoc(doc(ownerDb, ownerPath("workoutSessions", "session-new")), session("2026-08-01"));
  await setDoc(doc(ownerDb, ownerPath("workoutSessions", "session-prior")), session("2026-07-25"));

  const routineRecord = { id: "upper", ...(await getDoc(doc(ownerDb, ownerPath("workoutRoutines", "upper")))).data() };
  const sessions = (await records(ownerDb, "workoutSessions")).map((item) => ({ ...item, createdAt: toDate(item.createdAt), updatedAt: toDate(item.updatedAt) }));
  const plan = deriveGuidedWorkoutPlan(routineRecord, sessions, "lb");
  assert.equal(plan.suggestions[0].ruleId, "optional-small-increase-v1");
  assert.match(plan.suggestions[0].suggestion, /190 lb/);

  const prIds = getWorkoutPrSessionIds(sessions, "lb");
  const filtered = filterWorkoutHistory(sessions, { routineId: "upper", exerciseQuery: "bench", periodDays: 30, prOnly: true }, "lb", "2026-08-01");
  assert.equal(filtered.length, 1);
  assert.ok(filtered.every((item) => prIds.has(item.id)));
  const payload = createWorkoutExportPayload({ routines: [routineRecord], sessions: filtered, exportedAt: "2026-08-02T00:00:00Z", displayUnit: "lb" });
  assert.equal(payload.exportVersion, "easyworkout-export-v1");
  assert.match(serializeWorkoutCsv(payload), /easyworkout-stats-v1/);
});

test("draft handoff remains local while Firestore rules enforce owner-only session access", async () => {
  assert.equal(getGuidedWorkoutAction("upper", true, true).label, "Resume saved draft");
  const ownerDb = rulesEnvironment.authenticatedContext(ownerId).firestore();
  const otherDb = rulesEnvironment.authenticatedContext(otherId).firestore();
  const anonymousDb = rulesEnvironment.unauthenticatedContext().firestore();
  const sessionRef = doc(ownerDb, ownerPath("workoutSessions", "draft-safe-id"));
  await assertSucceeds(setDoc(sessionRef, { clientDraftId: "draft-safe-id", performedOn: "2026-08-01", routineName: "Upper", exercises: [] }));
  await assertSucceeds(getDoc(sessionRef));
  await assertFails(getDoc(doc(otherDb, ownerPath("workoutSessions", "draft-safe-id"))));
  await assertFails(updateDoc(doc(otherDb, ownerPath("workoutSessions", "draft-safe-id")), { routineName: "Hijacked" }));
  await assertFails(getDoc(doc(anonymousDb, ownerPath("workoutSessions", "draft-safe-id"))));
  await assertFails(setDoc(doc(anonymousDb, ownerPath("workoutSessions", "anonymous")), { performedOn: "2026-08-01" }));
});

test("workout session rules accept legacy shapes but reject corrupt, oversized, and mutable identities", async () => {
  const ownerDb = rulesEnvironment.authenticatedContext(ownerId).firestore();
  const legacyRef = doc(ownerDb, ownerPath("workoutSessions", "legacy-session"));
  await assertSucceeds(setDoc(legacyRef, { routineName: "Legacy", performedOn: "2026-08-01", exercises: [] }));

  const modernRef = doc(ownerDb, ownerPath("workoutSessions", "modern-session"));
  await assertSucceeds(setDoc(modernRef, { clientDraftId: "draft-safe-123", schemaVersion: 3, routineId: null, routineName: "Upper", performedOn: "2026-08-01", weightUnit: "lb", durationMinutes: 45, notes: "bounded", exercises: [], createdAt: new Date("2026-08-02T12:00:00Z"), updatedAt: new Date("2026-08-02T12:00:00Z") }));
  await assertFails(updateDoc(modernRef, { clientDraftId: "draft-other-456", updatedAt: new Date("2026-08-02T13:00:00Z") }));
  await assertFails(updateDoc(modernRef, { createdAt: new Date("2026-08-03T12:00:00Z") }));
  await assertFails(setDoc(doc(ownerDb, ownerPath("workoutSessions", "bad-date")), { routineName: "Upper", performedOn: "not-a-date", exercises: [] }));
  await assertFails(setDoc(doc(ownerDb, ownerPath("workoutSessions", "bad-duration")), { routineName: "Upper", performedOn: "2026-08-01", durationMinutes: 1441, exercises: [] }));
  await assertFails(setDoc(doc(ownerDb, ownerPath("workoutSessions", "bad-extra-field")), { routineName: "Upper", performedOn: "2026-08-01", exercises: [], accessToken: "must-not-be-stored" }));
});

test("current workout client payloads honor the session schema contract, retry identity, and owner boundary", async () => {
  const ownerDb = rulesEnvironment.authenticatedContext(ownerId).firestore();
  const otherDb = rulesEnvironment.authenticatedContext(otherId).firestore();
  const currentSession = {
    clientDraftId: "draft-current-v4",
    schemaVersion: WORKOUT_SESSION_SCHEMA_VERSION,
    routineId: "upper",
    routineName: "Upper",
    performedOn: "2026-10-02",
    weightUnit: "lb",
    durationMinutes: 42,
    notes: "current client payload",
    exercises: [{
      exerciseId: "bench",
      exerciseName: "Bench Press",
      muscleGroup: "Chest",
      exerciseType: "weighted",
      notes: "",
      sets: [{ reps: 5, weight: 185, notes: "", setType: "standard", completed: true, deleted: false }],
    }],
    createdAt: new Date("2026-10-02T12:00:00Z"),
    updatedAt: new Date("2026-10-02T12:00:00Z"),
  };
  await assertSucceeds(setDoc(doc(ownerDb, ownerPath("workoutSessions", "current-v4")), currentSession));
  await assertFails(setDoc(doc(otherDb, ownerPath("workoutSessions", "cross-owner-v4")), currentSession));
  await assertFails(setDoc(doc(ownerDb, ownerPath("workoutSessions", "draft-schema-v7")), { ...currentSession, clientDraftId: "draft-schema-v7", schemaVersion: 7 }));
  await assertFails(setDoc(doc(ownerDb, ownerPath("workoutSessions", "future-schema-v8")), { ...currentSession, clientDraftId: "future-schema-v8", schemaVersion: 8 }));

  const createdIntent = createQuickWorkoutCaptureIntent({
    ownerId,
    performedOn: "2026-10-02",
    text: "Bench press 135 x 8",
    notes: "quick capture",
  }, {
    createId: () => "quick-intent-current-v4",
    nowIso: () => "2026-10-02T12:30:00.000Z",
  });
  assert.equal(createdIntent.ok, true);
  const quickRef = doc(ownerDb, ownerPath("workoutSessions", "quick-add-2026-10-02"));
  const persistQuickIntent = () => runTransaction(ownerDb, async (transaction) => {
    const snapshot = await transaction.get(quickRef);
    const result = applyQuickWorkoutSetOperation(snapshot.exists() ? snapshot.data() : null, createdIntent.intent);
    if (result.applied) transaction.set(quickRef, result.session);
  });
  await assertSucceeds(persistQuickIntent());
  await assertSucceeds(persistQuickIntent());
  const quickSession = (await getDoc(quickRef)).data();
  assert.equal(quickSession.schemaVersion, WORKOUT_SESSION_SCHEMA_VERSION);
  assert.equal(quickSession.exercises.flatMap((exercise) => exercise.sets).length, 1);
  assert.equal(quickSession.exercises[0].sets[0].clientSetId, "quick-intent-current-v4");

  const legacyRef = doc(ownerDb, ownerPath("workoutSessions", "legacy-v3-append"));
  await assertSucceeds(setDoc(legacyRef, {
    schemaVersion: 3,
    routineId: null,
    routineName: "Gym Log",
    performedOn: "2026-10-03",
    weightUnit: "lb",
    durationMinutes: null,
    notes: "",
    exercises: [{ exerciseId: null, exerciseName: "Bench press", muscleGroup: "Chest", notes: "", sets: [{ reps: 6, weight: 145, notes: "" }] }],
  }));
  const legacyIntent = createQuickWorkoutCaptureIntent({
    ownerId,
    performedOn: "2026-10-03",
    text: "Bench press 150 x 6",
    notes: "",
  }, {
    createId: () => "legacy-append-intent",
    nowIso: () => "2026-10-03T12:30:00.000Z",
  });
  assert.equal(legacyIntent.ok, true);
  await assertSucceeds(runTransaction(ownerDb, async (transaction) => {
    const snapshot = await transaction.get(legacyRef);
    const result = applyQuickWorkoutSetOperation(snapshot.data(), legacyIntent.intent);
    transaction.set(legacyRef, result.session);
  }));
  const legacySession = (await getDoc(legacyRef)).data();
  assert.equal(legacySession.schemaVersion, 3);
  assert.equal(legacySession.exercises[0].sets[0].completed, undefined);
  assert.equal(legacySession.exercises[0].sets[1].completed, true);
});

test("authenticated owner records drive Wave 3 search, focused review, and safe whole-account export", async () => {
  const ownerDb = rulesEnvironment.authenticatedContext(ownerId).firestore();
  await Promise.all([
    setDoc(doc(ownerDb, ownerPath("notes", "search-note")), { title: "Cedar workflow", bodyText: "Interview proof", tags: ["career"], deletedAt: null }),
    setDoc(doc(ownerDb, ownerPath("contacts", "search-person")), { fullName: "Jordan Lee", company: "Cedar Labs", role: "Recruiter", archived: false }),
    setDoc(doc(ownerDb, ownerPath("tasks", "review-capture")), { title: "Sort the capture", notes: "", listName: "Inbox", priorityTier: 5, completed: false, deletedAt: null, linkedCalendarBlockIds: [] }),
    setDoc(doc(ownerDb, ownerPath("projects", "review-project")), { title: "Release packet", description: "", targetDate: "2026-08-07", status: "active" }),
    setDoc(doc(ownerDb, ownerPath("applications", "review-application")), { company: "Cedar", title: "Operations", status: "follow_up", priority: "high", nextFollowUp: "2026-08-02" }),
    setDoc(doc(ownerDb, ownerPath("workoutSessions", "review-workout")), { routineName: "Upper", performedOn: "2026-08-01", durationMinutes: 45, exercises: [] }),
  ]);
  const [notes, contacts, tasks, projects, applications, workouts] = await Promise.all([
    records(ownerDb, "notes"), records(ownerDb, "contacts"), records(ownerDb, "tasks"), records(ownerDb, "projects"), records(ownerDb, "applications"), records(ownerDb, "workoutSessions"),
  ]);
  const searchResults = searchCoreLoopDocuments([
    ...notes.map((note) => ({ id: `note:${note.id}`, group: "Notes", title: note.title, detail: note.bodyText, searchText: note.tags.join(" "), to: `/app/easynotes/${note.id}` })),
    ...contacts.map((contact) => ({ id: `contact:${contact.id}`, group: "People", title: contact.fullName, detail: contact.company, searchText: contact.role, to: `/app/easycontacts?contact=${contact.id}` })),
  ], "cedar");
  assert.deepEqual(new Set(searchResults.map((result) => result.group)), new Set(["Notes", "People"]));

  const queue = deriveFocusedReviewQueue({
    nowDateKey: "2026-08-02",
    tasks: tasks.map((task) => ({ itemKind: "task", category: "", estimatedLength: null, priorityLabel: "", dueDate: null, linkedCalendarEventId: null, linkedNoteId: null, recurring: false, completedAt: null, createdAt: null, updatedAt: null, ...task })),
    projects: projects.map((project) => ({ createdAt: null, updatedAt: null, ...project })),
    projectLinks: [],
    applications: applications.map((application) => ({ offerResponse: "", dateApplied: "", location: "", link: "", notes: "", contactName: "", contactEmail: "", createdAt: null, updatedAt: null, ...application })),
    workouts: workouts.map((workout) => ({ routineId: null, notes: "", createdAt: null, updatedAt: null, ...workout })),
  });
  assert.deepEqual(queue.slice(0, 4).map((item) => item.kind), ["capture", "project", "application", "workout"]);

  const payload = buildAccountExport({ collections: { ...emptyAccountDataCollections, tasks, notes, projects, pipelineApplications: applications, contacts, workoutSessions: workouts }, settings: { easyWorkout: { weightUnit: "lb" }, apiKey: "blocked" }, exportedAt: "2026-08-02T00:00:00.000Z", timeZone: "America/Denver", weightUnit: "lb", appVersion: "test" });
  const serialized = serializeAccountExport(payload);
  assert.match(serialized, /easylife-account-export-v2/);
  assert.doesNotMatch(serialized, /blocked/);
  await assertFails(getDocs(collection(rulesEnvironment.authenticatedContext(otherId).firestore(), "users", ownerId, "notes")));
});

test("workout goals enforce versioned ownership, lifecycle validation, and recoverable archive behavior", async () => {
  const ownerDb = rulesEnvironment.authenticatedContext(ownerId).firestore();
  const otherDb = rulesEnvironment.authenticatedContext(otherId).firestore();
  const weeklyRef = doc(ownerDb, ownerPath("workoutGoals", "weekly-completed-workouts"));
  const createdAt = new Date("2026-08-02T12:00:00Z");
  const goal = { ownerId, schemaVersion: "easyworkout-goal-v1", formulaVersion: "completed-workout-week-v1", goalType: "weekly-workouts", status: "active", target: 3, sourceUnit: "count", exerciseId: null, exerciseName: "", createdAt, updatedAt: createdAt, archivedAt: null };
  await assertSucceeds(setDoc(weeklyRef, goal));
  await assertSucceeds(setDoc(weeklyRef, goal));
  await assertFails(getDoc(doc(otherDb, ownerPath("workoutGoals", "weekly-completed-workouts"))));
  await assertFails(setDoc(doc(otherDb, `users/${otherId}/workoutGoals/stolen`), { ...goal, ownerId }));
  await assertFails(setDoc(doc(ownerDb, ownerPath("workoutGoals", "bad-schema")), { ...goal, schemaVersion: "unknown" }));
  await assertFails(updateDoc(weeklyRef, { target: 2.5, updatedAt: new Date("2026-08-02T13:00:00Z") }));
  await assertSucceeds(updateDoc(weeklyRef, { status: "paused", updatedAt: new Date("2026-08-02T13:00:00Z") }));
  await assertSucceeds(updateDoc(weeklyRef, { status: "archived", archivedAt: new Date("2026-08-02T14:00:00Z"), updatedAt: new Date("2026-08-02T14:00:00Z") }));
  await assertFails(deleteDoc(weeklyRef));
  await assertSucceeds(updateDoc(weeklyRef, { status: "active", archivedAt: null, updatedAt: new Date("2026-08-02T15:00:00Z") }));

  const e1rmRef = doc(ownerDb, ownerPath("workoutGoals", "exercise-e1rm-bench"));
  await assertSucceeds(setDoc(e1rmRef, { ...goal, formulaVersion: "epley-v1", goalType: "exercise-e1rm", target: 100, sourceUnit: "kg", exerciseId: "bench", exerciseName: "Bench Press" }));
  await assertFails(updateDoc(e1rmRef, { formulaVersion: "unreviewed-formula", updatedAt: new Date("2026-08-02T16:00:00Z") }));
});

test("all product-wave collections deny cross-owner and top-level access", async () => {
  const ownerDb = rulesEnvironment.authenticatedContext(ownerId).firestore();
  const otherDb = rulesEnvironment.authenticatedContext(otherId).firestore();
  const collectionNames = ["tasks", "calendarEvents", "calendarTaskBlocks", "categories", "projects", "projectSections", "projectTaskLinks", "applications", "generatedDrafts", "notes", "noteFolders", "contacts", "workoutExercises", "workoutRoutines"];
  for (const collectionName of collectionNames) {
    await assertSucceeds(setDoc(doc(ownerDb, ownerPath(collectionName, "boundary")), { marker: collectionName }));
    await assertFails(getDoc(doc(otherDb, ownerPath(collectionName, "boundary"))));
    await assertFails(setDoc(doc(otherDb, ownerPath(collectionName, "boundary")), { marker: "cross-account" }));
  }
  await assertSucceeds(setDoc(doc(ownerDb, "users", ownerId, "appPreferences", "shell"), { themeMode: "classic" }));
  await assertFails(getDoc(doc(otherDb, "users", ownerId, "appPreferences", "shell")));
  await assertFails(setDoc(doc(ownerDb, "public", "escape"), { marker: "outside-user-tree" }));
  await assertFails(setDoc(doc(ownerDb, "users", ownerId, "unknownCollection", "escape"), { marker: "unsupported" }));
  await assertFails(setDoc(doc(ownerDb, "users", ownerId, "tasks", "task", "nested", "escape"), { marker: "nested" }));
});

const legacyPlanFor = (owner = ownerId, document = workoutLegacyDemoDocument) => {
  const result = buildLegacyImportPlan(owner, document);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  return result.plan;
};
const legacyPath = (collectionName, documentId, owner = ownerId) => `users/${owner}/${collectionName}/${documentId}`;
const legacyDoc = (database, record, owner = ownerId) => doc(database, legacyPath(record.collection, record.id, owner));
const jsonClone = (value) => JSON.parse(JSON.stringify(value));
const legacyData = async (database, owner = ownerId) => {
  const snapshotOf = async (name) => Object.fromEntries((await getDocs(collection(database, "users", owner, name))).docs.map((snapshot) => [snapshot.id, snapshot.data()]));
  return { batches: await snapshotOf(LEGACY_IMPORT_COLLECTIONS.batches), observations: await snapshotOf(LEGACY_IMPORT_COLLECTIONS.observations), confirmations: await snapshotOf(LEGACY_IMPORT_COLLECTIONS.confirmations), rollbacks: await snapshotOf(LEGACY_IMPORT_COLLECTIONS.rollbacks) };
};
const asAdmin = (work) => rulesEnvironment.withSecurityRulesDisabled(async (context) => work(context.firestore()));
const rejectsWith = (promise, code) => assert.rejects(promise, (error) => error instanceof LegacyImportError && error.code === code, `expected LegacyImportError ${code}`);

test("legacy import rules are owner-only, create-only, schema-strict and identity-bound", async () => {
  const ownerDb = rulesEnvironment.authenticatedContext(ownerId).firestore();
  const otherDb = rulesEnvironment.authenticatedContext(otherId).firestore();
  const anonymousDb = rulesEnvironment.unauthenticatedContext().firestore();
  const plan = legacyPlanFor();
  const observation = plan.observations[0];
  const withoutKey = (record, key) => { const data = jsonClone(record.data); delete data[key]; return { ...record, data }; };

  // Dependent documents cannot precede the documents they certify.
  await assertFails(setDoc(legacyDoc(ownerDb, plan.confirmation), plan.confirmation.data));
  await assertFails(setDoc(legacyDoc(ownerDb, { collection: LEGACY_IMPORT_COLLECTIONS.rollbacks, id: plan.batchId }), { ownerId, schemaVersion: "easyworkout-legacy-import-rollback-v1", batchId: plan.batchId, contentHash: plan.contentHash, observationCount: plan.observationCount, reason: "owner-soft-rollback" }));

  // Invalid batch shapes.
  await assertFails(setDoc(legacyDoc(ownerDb, plan.batch), { ...plan.batch.data, ownerId: otherId }));
  await assertFails(setDoc(legacyDoc(ownerDb, plan.batch), { ...plan.batch.data, schemaVersion: "easyworkout-legacy-import-batch-v2" }));
  await assertFails(setDoc(legacyDoc(ownerDb, plan.batch), { ...plan.batch.data, unknownField: true }));
  await assertFails(setDoc(legacyDoc(ownerDb, plan.batch), { ...plan.batch.data, sourceKind: "scraped" }));
  await assertFails(setDoc(legacyDoc(ownerDb, plan.batch), { ...plan.batch.data, contentHash: "sha256:short" }));
  await assertFails(setDoc(legacyDoc(ownerDb, plan.batch), { ...plan.batch.data, batchId: "lwb-00000000000000000000000000000000" }));
  await assertFails(setDoc(legacyDoc(ownerDb, plan.batch), { ...plan.batch.data, observationCount: plan.observationCount + 1 }));
  await assertFails(setDoc(legacyDoc(ownerDb, plan.batch), { ...plan.batch.data, sourceLabel: "   " }));
  await assertFails(setDoc(legacyDoc(ownerDb, plan.batch), { ...plan.batch.data, unitPolicy: "kg" }));
  await assertFails(setDoc(legacyDoc(ownerDb, plan.batch), { ...plan.batch.data, createdAt: new Date() }));
  await assertFails(setDoc(legacyDoc(ownerDb, plan.batch), withoutKey(plan.batch, "sourceOrdinals").data));
  // Durable limit and ordinal-list shape: at most 450, length equals count, first >= 1, ascending span fits the count.
  const ordinals = plan.batch.data.sourceOrdinals;
  await assertFails(setDoc(legacyDoc(ownerDb, plan.batch), { ...plan.batch.data, observationCount: 451, sourceOrdinals: Array.from({ length: 451 }, (_, index) => index + 1) }));
  await assertFails(setDoc(legacyDoc(ownerDb, plan.batch), { ...plan.batch.data, sourceOrdinals: ordinals.slice(1) }));
  await assertFails(setDoc(legacyDoc(ownerDb, plan.batch), { ...plan.batch.data, sourceOrdinals: [...ordinals].reverse() }));
  await assertFails(setDoc(legacyDoc(ownerDb, plan.batch), { ...plan.batch.data, sourceOrdinals: [0, ...ordinals.slice(1)] }));
  await assertFails(setDoc(legacyDoc(ownerDb, plan.batch), { ...plan.batch.data, sourceOrdinals: [...ordinals.slice(0, -1), "7"] }));
  await assertFails(setDoc(legacyDoc(otherDb, plan.batch), plan.batch.data));
  await assertFails(setDoc(legacyDoc(anonymousDb, plan.batch), plan.batch.data));
  await assertFails(setDoc(doc(otherDb, legacyPath(LEGACY_IMPORT_COLLECTIONS.batches, plan.batchId, otherId)), plan.batch.data));
  await assertFails(setDoc(doc(ownerDb, legacyPath("legacyWorkoutImportUnlisted", plan.batchId)), plan.batch.data));

  await assertSucceeds(setDoc(legacyDoc(ownerDb, plan.batch), plan.batch.data));

  // Invalid observation shapes and provenance identity.
  const badObservations = [
    [observation, { ...observation.data, ownerId: otherId }],
    [observation, { ...observation.data, schemaVersion: "other" }],
    [observation, { ...observation.data, unknownField: 1 }],
    [observation, { ...observation.data, sourceHash: "sha256:ABC" }],
    [observation, { ...observation.data, sourceLocator: "" }],
    [observation, { ...observation.data, sourceText: "x".repeat(501) }],
    [observation, { ...observation.data, sourceOrdinal: 0 }],
    [observation, { ...observation.data, sourceOrdinal: 1.5 }],
    [observation, { ...observation.data, batchId: "lwb-ffffffffffffffffffffffffffffffff" }],
    [{ ...observation, id: `${plan.batchId}-o999` }, observation.data],
    [{ ...observation, id: "free-form-id" }, observation.data],
    [{ ...observation, id: `${plan.batchId}-o01` }, observation.data],
    [observation, { ...observation.data, temporal: { precision: "day", label: "Jan 6 2020", date: "2020-01-06", startDate: "2020-01-06" } }],
    [observation, { ...observation.data, temporal: { precision: "day", label: "Jan 6 2020", date: "2020-13-45" } }],
    [observation, { ...observation.data, temporal: { precision: "fortnight", label: "x" } }],
    [observation, { ...observation.data, exercise: { ...observation.data.exercise, equipment: "kettlebell" } }],
    [observation, { ...observation.data, exercise: { ...observation.data.exercise, extra: 1 } }],
    [observation, { ...observation.data, exercise: { ...observation.data.exercise, reviewedMapping: { seriesKey: "k", seriesLabel: "l", mappingBasis: "guess" } } }],
    [observation, { ...observation.data, sets: Array.from({ length: 51 }, () => ({ reps: 1, loadLb: 1, evidence: "performed", evidenceBasis: "explicit-checked" })) }],
    [observation, { ...observation.data, sets: "not-a-list" }],
    [observation, { ...observation.data, createdAt: new Date() }],
  ];
  for (const [record, data] of badObservations) await assertFails(setDoc(legacyDoc(ownerDb, record), data));
  await assertFails(setDoc(legacyDoc(otherDb, observation), observation.data));
  await assertFails(setDoc(legacyDoc(anonymousDb, observation), observation.data));
  for (const record of plan.observations) await assertSucceeds(setDoc(legacyDoc(ownerDb, record), record.data));
  // Optional fields and the null-load bodyweight shape are accepted.
  await assertSucceeds(setDoc(doc(ownerDb, legacyPath(LEGACY_IMPORT_COLLECTIONS.observations, `${plan.batchId}-o900`)), {
    ...observation.data, sourceOrdinal: 900,
    temporal: { precision: "week", label: "Original week tab label" },
    exercise: { sourceName: "Push-up", equipment: "bodyweight", loadConvention: "bodyweight", reviewedMapping: { seriesKey: "family-push-up", seriesLabel: "Push-up", mappingBasis: "owner-reviewed-alias-manifest" } },
    sets: [{ reps: 10, loadLb: null, evidence: "performed", evidenceBasis: "later-handwritten-policy" }],
  }));

  // A receipt cannot certify a batch whose first or last observation is absent. Middle gaps are the documented rules
  // boundary (no per-observation access calls); readback fails closed on them.
  const gapDocument = jsonClone(workoutLegacyDemoDocument);
  gapDocument.batch.sourceKey = "synthetic-gap-notebook";
  const gapPlan = legacyPlanFor(ownerId, gapDocument);
  await assertSucceeds(setDoc(legacyDoc(ownerDb, gapPlan.batch), gapPlan.batch.data));
  await assertFails(setDoc(legacyDoc(ownerDb, gapPlan.confirmation), gapPlan.confirmation.data));
  await assertSucceeds(setDoc(legacyDoc(ownerDb, gapPlan.observations[0]), gapPlan.observations[0].data));
  await assertFails(setDoc(legacyDoc(ownerDb, gapPlan.confirmation), gapPlan.confirmation.data));
  await assertSucceeds(setDoc(legacyDoc(ownerDb, gapPlan.observations.at(-1)), gapPlan.observations.at(-1).data));
  await assertSucceeds(setDoc(legacyDoc(ownerDb, gapPlan.confirmation), gapPlan.confirmation.data));
  const gapRecords = await readStoredLegacyImportRecords(ownerDb, ownerId);
  const gapReadback = reconstructLegacyImports(ownerId, gapRecords);
  assert.equal(gapReadback.issues.some((issue) => issue.batchId === gapPlan.batchId && issue.code === "missing-observation"), true);
  assert.equal(gapReadback.imports.some((entry) => entry.batchId === gapPlan.batchId), false);

  // Confirmation receipt must certify the existing batch exactly.
  const confirmation = plan.confirmation;
  await assertFails(setDoc(legacyDoc(ownerDb, confirmation), { ...confirmation.data, contentHash: `sha256:${"0".repeat(64)}` }));
  await assertFails(setDoc(legacyDoc(ownerDb, confirmation), { ...confirmation.data, observationCount: 1 }));
  await assertFails(setDoc(legacyDoc(ownerDb, confirmation), { ...confirmation.data, ownerId: otherId }));
  await assertFails(setDoc(legacyDoc(ownerDb, confirmation), { ...confirmation.data, unknownField: true }));
  await assertFails(setDoc(legacyDoc(ownerDb, confirmation), { ...confirmation.data, schemaVersion: "other" }));
  await assertFails(setDoc(legacyDoc(ownerDb, { ...confirmation, id: "lwb-ffffffffffffffffffffffffffffffff" }), { ...confirmation.data, batchId: "lwb-ffffffffffffffffffffffffffffffff" }));
  await assertFails(setDoc(legacyDoc(ownerDb, { ...confirmation, id: "mismatch" }), confirmation.data));
  await assertFails(setDoc(legacyDoc(otherDb, confirmation), confirmation.data));
  await assertSucceeds(setDoc(legacyDoc(ownerDb, confirmation), confirmation.data));

  // Rollback tombstone must match the existing confirmation exactly.
  const rollback = { collection: LEGACY_IMPORT_COLLECTIONS.rollbacks, id: plan.batchId, data: { ownerId, schemaVersion: "easyworkout-legacy-import-rollback-v1", batchId: plan.batchId, contentHash: plan.contentHash, observationCount: plan.observationCount, reason: "owner-soft-rollback" } };
  await assertFails(setDoc(legacyDoc(ownerDb, rollback), { ...rollback.data, contentHash: `sha256:${"0".repeat(64)}` }));
  await assertFails(setDoc(legacyDoc(ownerDb, rollback), { ...rollback.data, reason: "delete-everything" }));
  await assertFails(setDoc(legacyDoc(ownerDb, rollback), { ...rollback.data, unknownField: true }));
  await assertFails(setDoc(legacyDoc(ownerDb, rollback), { ...rollback.data, ownerId: otherId }));
  await assertFails(setDoc(legacyDoc(ownerDb, { ...rollback, id: "mismatch" }), rollback.data));
  await assertFails(setDoc(legacyDoc(otherDb, rollback), rollback.data));
  await assertSucceeds(setDoc(legacyDoc(ownerDb, rollback), rollback.data));

  // Everything is readable by the owner only, and nothing can be updated, replaced or deleted.
  const everyRecord = [plan.batch, plan.observations[0], plan.confirmation, rollback];
  for (const record of everyRecord) {
    await assertSucceeds(getDoc(legacyDoc(ownerDb, record)));
    await assertFails(getDoc(legacyDoc(otherDb, record)));
    await assertFails(getDoc(legacyDoc(anonymousDb, record)));
    await assertFails(updateDoc(legacyDoc(ownerDb, record), { sourceLabel: "Rewritten", reason: "rewritten" }));
    await assertFails(setDoc(legacyDoc(ownerDb, record), record.data));
    await assertFails(deleteDoc(legacyDoc(ownerDb, record)));
  }
  for (const name of Object.values(LEGACY_IMPORT_COLLECTIONS)) {
    await assertSucceeds(getDocs(collection(ownerDb, "users", ownerId, name)));
    await assertFails(getDocs(collection(otherDb, "users", ownerId, name)));
    await assertFails(getDocs(collection(anonymousDb, "users", ownerId, name)));
  }
});

test("durable legacy import commits atomically, persists across a fresh read, and retries idempotently", async () => {
  const ownerDb = rulesEnvironment.authenticatedContext(ownerId).firestore();
  const otherDb = rulesEnvironment.authenticatedContext(otherId).firestore();
  const plan = legacyPlanFor();

  const first = await confirmLegacyImportTransaction(ownerDb, ownerId, workoutLegacyDemoDocument);
  assert.equal(first.status, "imported");
  assert.equal(first.batchId, plan.batchId);
  assert.equal(first.created, plan.observations.length + 2);
  assert.equal(first.existing, 0);

  const afterFirst = await legacyData(ownerDb);
  assert.equal(Object.keys(afterFirst.observations).length, plan.observations.length);
  assert.deepEqual(Object.keys(afterFirst.batches), [plan.batchId]);
  assert.deepEqual(Object.keys(afterFirst.confirmations), [plan.batchId]);
  assert.deepEqual(afterFirst.rollbacks, {});
  assert.doesNotMatch(JSON.stringify(afterFirst), /createdAt|updatedAt/);

  const retry = await confirmLegacyImportTransaction(ownerDb, ownerId, workoutLegacyDemoDocument);
  assert.equal(retry.status, "already-imported");
  assert.equal(retry.created, 0);
  assert.deepEqual(await legacyData(ownerDb), afterFirst);

  // A fresh client (reload) reconstructs exactly the validated document.
  const freshDb = rulesEnvironment.authenticatedContext(ownerId).firestore();
  const readback = reconstructLegacyImports(ownerId, await readStoredLegacyImportRecords(freshDb, ownerId));
  assert.equal(readback.issues.length, 0);
  assert.equal(readback.imports.length, 1);
  assert.deepEqual(readback.imports[0].document, jsonClone(workoutLegacyDemoDocument));

  // Another owner sees nothing, can import the same source independently, and cannot touch the first owner.
  assert.equal(reconstructLegacyImports(otherId, await readStoredLegacyImportRecords(otherDb, otherId)).imports.length, 0);
  await assertFails(readStoredLegacyImportRecords(otherDb, ownerId));
  assert.equal((await confirmLegacyImportTransaction(otherDb, otherId, workoutLegacyDemoDocument)).status, "imported");
  assert.deepEqual(await legacyData(ownerDb), afterFirst);

  // Nothing leaked into canonical workout collections.
  assert.deepEqual(await records(ownerDb, "workoutSessions"), []);
  assert.deepEqual(await records(ownerDb, "workoutGoals"), []);
});

test("durable legacy import creates only missing records and aborts everything on any conflict", async () => {
  const ownerDb = rulesEnvironment.authenticatedContext(ownerId).firestore();
  const plan = legacyPlanFor();
  await confirmLegacyImportTransaction(ownerDb, ownerId, workoutLegacyDemoDocument);
  const intact = await legacyData(ownerDb);

  // Partial state: the missing records are created, existing ones are left byte-identical.
  await asAdmin(async (adminDb) => {
    await deleteDoc(legacyDoc(adminDb, plan.confirmation));
    await deleteDoc(legacyDoc(adminDb, plan.observations[2]));
  });
  const repaired = await confirmLegacyImportTransaction(ownerDb, ownerId, workoutLegacyDemoDocument);
  assert.equal(repaired.status, "imported");
  assert.equal(repaired.created, 2);
  assert.deepEqual(await legacyData(ownerDb), intact);

  // Conflict plus missing records: nothing at all is written.
  await asAdmin(async (adminDb) => {
    await deleteDoc(legacyDoc(adminDb, plan.confirmation));
    await deleteDoc(legacyDoc(adminDb, plan.observations[0]));
    await updateDoc(legacyDoc(adminDb, plan.observations[1]), { sets: [{ reps: 99, loadLb: 1, evidence: "performed", evidenceBasis: "explicit-checked" }] });
  });
  const damaged = await legacyData(ownerDb);
  await rejectsWith(confirmLegacyImportTransaction(ownerDb, ownerId, workoutLegacyDemoDocument), "conflict");
  assert.deepEqual(await legacyData(ownerDb), damaged);

  // A different document under the same source key also conflicts rather than overwriting.
  await asAdmin(async (adminDb) => {
    await setDoc(legacyDoc(adminDb, plan.observations[0]), plan.observations[0].data);
    await setDoc(legacyDoc(adminDb, plan.observations[1]), plan.observations[1].data);
  });
  const changed = jsonClone(workoutLegacyDemoDocument);
  changed.observations[3].sets[0].reps = 42;
  await rejectsWith(confirmLegacyImportTransaction(ownerDb, ownerId, changed), "conflict");
  assert.equal(Object.hasOwn((await legacyData(ownerDb)).confirmations, plan.batchId), false);

  await rejectsWith(confirmLegacyImportTransaction(ownerDb, ownerId, { schemaVersion: "nope" }), "invalid");
});

const legacyDocumentWith = (count, sourceKey) => {
  const document = jsonClone(workoutLegacyDemoDocument);
  document.batch.sourceKey = sourceKey;
  const template = document.observations[0];
  document.observations = Array.from({ length: count }, (_, index) => ({ ...jsonClone(template), sourceOrdinal: index + 1, sourceLocator: `synthetic-row-${index + 1}` }));
  return document;
};

test("a 451-observation legacy import is refused locally and writes nothing", async () => {
  const ownerDb = rulesEnvironment.authenticatedContext(ownerId).firestore();
  await rejectsWith(confirmLegacyImportTransaction(ownerDb, ownerId, legacyDocumentWith(451, "synthetic-over-limit-notebook")), "invalid");
  assert.deepEqual(await legacyData(ownerDb), { batches: {}, observations: {}, confirmations: {}, rollbacks: {} });
});

test("a 450-observation legacy import confirms, retries and rolls back in bounded transactions without touching canonical workout data", async () => {
  const ownerDb = rulesEnvironment.authenticatedContext(ownerId).firestore();
  const canonicalNames = ["workoutSessions", "workoutGoals", "workoutRoutines", "workoutExercises"];
  await asAdmin(async (adminDb) => {
    for (const name of canonicalNames) await setDoc(doc(adminDb, "users", ownerId, name, "synthetic-canonical"), { marker: `synthetic-${name}`, ownerId });
  });
  const canonical = async () => Object.fromEntries(await Promise.all(canonicalNames.map(async (name) => [
    name,
    Object.fromEntries((await getDocs(collection(ownerDb, "users", ownerId, name))).docs.map((snapshot) => [snapshot.id, snapshot.data()])),
  ])));
  const canonicalBefore = await canonical();
  const document = legacyDocumentWith(450, "synthetic-limit-notebook");
  const plan = legacyPlanFor(ownerId, document);
  assert.equal(plan.observations.length, 450);

  const outcome = await confirmLegacyImportTransaction(ownerDb, ownerId, document);
  assert.equal(outcome.status, "imported");
  assert.equal(outcome.created, 452);
  const afterConfirm = await legacyData(ownerDb);
  assert.equal(Object.keys(afterConfirm.observations).length, 450);
  const readback = reconstructLegacyImports(ownerId, await readStoredLegacyImportRecords(ownerDb, ownerId));
  assert.equal(readback.imports[0].observationCount, 450);
  assert.deepEqual(readback.issues, []);

  // Retry with everything stored reads 453 documents, writes none and changes nothing.
  assert.equal((await confirmLegacyImportTransaction(ownerDb, ownerId, document)).status, "already-imported");
  assert.deepEqual(await legacyData(ownerDb), afterConfirm);

  // Partial repair: only the missing receipt and one observation are created.
  await asAdmin(async (adminDb) => {
    await deleteDoc(legacyDoc(adminDb, plan.confirmation));
    await deleteDoc(legacyDoc(adminDb, plan.observations[225]));
  });
  const repaired = await confirmLegacyImportTransaction(ownerDb, ownerId, document);
  assert.equal(repaired.status, "imported");
  assert.equal(repaired.created, 2);
  assert.deepEqual(await legacyData(ownerDb), afterConfirm);

  // Rollback re-verifies all 450 observations, writes only the tombstone, and retries idempotently.
  assert.equal((await rollbackLegacyImportTransaction(ownerDb, ownerId, plan.batchId)).status, "rolled-back");
  const afterRollback = await legacyData(ownerDb);
  assert.deepEqual({ ...afterRollback, rollbacks: {} }, { ...afterConfirm, rollbacks: {} });
  assert.deepEqual(Object.keys(afterRollback.rollbacks), [plan.batchId]);
  assert.equal((await rollbackLegacyImportTransaction(ownerDb, ownerId, plan.batchId)).status, "already-rolled-back");
  assert.deepEqual(await legacyData(ownerDb), afterRollback);
  await rejectsWith(confirmLegacyImportTransaction(ownerDb, ownerId, document), "rolled-back");
  assert.equal(reconstructLegacyImports(ownerId, await readStoredLegacyImportRecords(ownerDb, ownerId)).imports.length, 0);

  assert.deepEqual(await canonical(), canonicalBefore);
});

test("legacy soft rollback is an immutable unchanged-only tombstone with idempotent retry and excluded readback", async () => {
  const ownerDb = rulesEnvironment.authenticatedContext(ownerId).firestore();
  const plan = legacyPlanFor();
  await confirmLegacyImportTransaction(ownerDb, ownerId, workoutLegacyDemoDocument);
  const provenance = await legacyData(ownerDb);

  const rolledBack = await rollbackLegacyImportTransaction(ownerDb, ownerId, plan.batchId);
  assert.equal(rolledBack.status, "rolled-back");
  const afterRollback = await legacyData(ownerDb);
  assert.deepEqual({ ...afterRollback, rollbacks: {} }, { ...provenance, rollbacks: {} });
  assert.deepEqual(Object.keys(afterRollback.rollbacks), [plan.batchId]);
  assert.equal(afterRollback.rollbacks[plan.batchId].reason, "owner-soft-rollback");

  const retry = await rollbackLegacyImportTransaction(ownerDb, ownerId, plan.batchId);
  assert.equal(retry.status, "already-rolled-back");
  assert.deepEqual(await legacyData(ownerDb), afterRollback);

  const readback = reconstructLegacyImports(ownerId, await readStoredLegacyImportRecords(ownerDb, ownerId));
  assert.deepEqual(readback.imports, []);
  assert.deepEqual(readback.rolledBack.map((entry) => entry.batchId), [plan.batchId]);

  // The tombstone also blocks re-import of the same source key without rewriting anything.
  await rejectsWith(confirmLegacyImportTransaction(ownerDb, ownerId, workoutLegacyDemoDocument), "rolled-back");
  assert.deepEqual(await legacyData(ownerDb), afterRollback);

  // A second source is unaffected by the first rollback.
  const second = jsonClone(workoutLegacyDemoDocument);
  second.batch.sourceKey = "synthetic-notebook-second";
  await confirmLegacyImportTransaction(ownerDb, ownerId, second);
  assert.equal(reconstructLegacyImports(ownerId, await readStoredLegacyImportRecords(ownerDb, ownerId)).imports.length, 1);
});

test("legacy soft rollback fails closed when any imported record is missing, changed or conflicting", async () => {
  const ownerDb = rulesEnvironment.authenticatedContext(ownerId).firestore();
  const plan = legacyPlanFor();
  const cases = [
    ["changed", (adminDb) => updateDoc(legacyDoc(adminDb, plan.observations[1]), { sourceLocator: "tampered" })],
    ["changed", (adminDb) => updateDoc(legacyDoc(adminDb, plan.batch), { sourceLabel: "Tampered" })],
    ["changed", (adminDb) => updateDoc(legacyDoc(adminDb, plan.observations[0]), { injected: true })],
    ["missing-observation", (adminDb) => deleteDoc(legacyDoc(adminDb, plan.observations[2]))],
    ["missing-confirmation", (adminDb) => deleteDoc(legacyDoc(adminDb, plan.confirmation))],
    ["missing-batch", (adminDb) => deleteDoc(legacyDoc(adminDb, plan.batch))],
  ];
  for (const [code, tamper] of cases) {
    await rulesEnvironment.clearFirestore();
    await confirmLegacyImportTransaction(ownerDb, ownerId, workoutLegacyDemoDocument);
    await asAdmin(tamper);
    const damaged = await legacyData(ownerDb);
    await rejectsWith(rollbackLegacyImportTransaction(ownerDb, ownerId, plan.batchId), code);
    assert.deepEqual(await legacyData(ownerDb), damaged, code);
  }

  // A conflicting pre-existing tombstone fails closed and is never replaced.
  await rulesEnvironment.clearFirestore();
  await confirmLegacyImportTransaction(ownerDb, ownerId, workoutLegacyDemoDocument);
  await asAdmin((adminDb) => setDoc(legacyDoc(adminDb, { collection: LEGACY_IMPORT_COLLECTIONS.rollbacks, id: plan.batchId }), { ownerId, schemaVersion: "easyworkout-legacy-import-rollback-v1", batchId: plan.batchId, contentHash: `sha256:${"1".repeat(64)}`, observationCount: plan.observationCount, reason: "owner-soft-rollback" }));
  await rejectsWith(rollbackLegacyImportTransaction(ownerDb, ownerId, plan.batchId), "rollback-conflict");

  // Unknown batches fail closed without writing.
  await rulesEnvironment.clearFirestore();
  await rejectsWith(rollbackLegacyImportTransaction(ownerDb, ownerId, plan.batchId), "missing-batch");
  assert.deepEqual(await legacyData(ownerDb), { batches: {}, observations: {}, confirmations: {}, rollbacks: {} });
});

test("stored legacy imports appear in the deterministic whole-account export without owner identity", async () => {
  const ownerDb = rulesEnvironment.authenticatedContext(ownerId).firestore();
  await confirmLegacyImportTransaction(ownerDb, ownerId, workoutLegacyDemoDocument);
  const plan = legacyPlanFor();
  await rollbackLegacyImportTransaction(ownerDb, ownerId, plan.batchId);
  const collections = {
    ...emptyAccountDataCollections,
    legacyWorkoutImportBatches: await records(ownerDb, LEGACY_IMPORT_COLLECTIONS.batches),
    legacyWorkoutImportObservations: await records(ownerDb, LEGACY_IMPORT_COLLECTIONS.observations),
    legacyWorkoutImportReceipts: await records(ownerDb, LEGACY_IMPORT_COLLECTIONS.confirmations),
    legacyWorkoutImportRollbacks: await records(ownerDb, LEGACY_IMPORT_COLLECTIONS.rollbacks),
  };
  const build = () => serializeAccountExport(buildAccountExport({ collections, settings: {}, exportedAt: "2026-10-05T00:00:00.000Z", timeZone: "UTC", weightUnit: "lb", appVersion: "test" }));
  const serialized = build();
  assert.equal(serialized, build());
  const parsed = JSON.parse(serialized);
  assert.equal(parsed.collections.legacyWorkoutImportBatches.length, 1);
  assert.equal(parsed.collections.legacyWorkoutImportObservations.length, plan.observations.length);
  assert.equal(parsed.collections.legacyWorkoutImportReceipts.length, 1);
  assert.equal(parsed.collections.legacyWorkoutImportRollbacks.length, 1);
  assert.equal(parsed.collections.legacyWorkoutImportObservations[0].sourceHash, workoutLegacyDemoDocument.observations[0].sourceHash);
  assert.doesNotMatch(serialized, new RegExp(ownerId));
});
