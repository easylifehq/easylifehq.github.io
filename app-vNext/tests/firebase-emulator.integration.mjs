import test, { after, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { collection, doc, getDoc, getDocs, setDoc, setLogLevel, updateDoc } from "firebase/firestore";
import { deriveWeeklyReview } from "../src/features/easystatistics/domain/weeklyReview.ts";
import { deriveGuidedWorkoutPlan, getGuidedWorkoutAction } from "../src/features/easyworkout/domain/guidedWorkoutPlan.ts";
import { createWorkoutExportPayload, filterWorkoutHistory, getWorkoutPrSessionIds, serializeWorkoutCsv } from "../src/features/easyworkout/domain/workoutHistoryTools.ts";

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

test("all product-wave collections deny cross-owner and top-level access", async () => {
  const ownerDb = rulesEnvironment.authenticatedContext(ownerId).firestore();
  const otherDb = rulesEnvironment.authenticatedContext(otherId).firestore();
  const collectionNames = ["tasks", "calendarEvents", "calendarTaskBlocks", "projects", "projectTaskLinks", "applications", "notes", "workoutRoutines", "workoutSessions"];
  for (const collectionName of collectionNames) {
    await assertSucceeds(setDoc(doc(ownerDb, ownerPath(collectionName, "boundary")), { marker: collectionName }));
    await assertFails(getDoc(doc(otherDb, ownerPath(collectionName, "boundary"))));
    await assertFails(setDoc(doc(otherDb, ownerPath(collectionName, "boundary")), { marker: "cross-account" }));
  }
  await assertFails(setDoc(doc(ownerDb, "public", "escape"), { marker: "outside-user-tree" }));
});
