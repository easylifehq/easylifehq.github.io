import test from "node:test";
import assert from "node:assert/strict";
import { deriveWeeklyReview } from "../src/features/easystatistics/domain/weeklyReview.ts";
import { deriveGuidedWorkoutPlan, getGuidedWorkoutAction, selectGuidedRoutine } from "../src/features/easyworkout/domain/guidedWorkoutPlan.ts";
import { createWorkoutExportPayload, filterWorkoutHistory, getWorkoutPrSessionIds, serializeWorkoutCsv } from "../src/features/easyworkout/domain/workoutHistoryTools.ts";
import { workoutDemoRoutines, workoutDemoSessions } from "../src/features/easyworkout/demo/workoutDemoFixtures.ts";

const task = (id, title, dueDate = null, overrides = {}) => ({ id, title, completed: false, deletedAt: null, dueDate: dueDate ? new Date(`${dueDate}T12:00:00`) : null, linkedCalendarEventId: null, linkedCalendarBlockIds: [], createdAt: new Date("2026-08-01T12:00:00"), updatedAt: null, ...overrides });

test("weekly review ranks unresolved capture before planning and keeps one owner action per section", () => {
  const review = deriveWeeklyReview({
    nowDateKey: "2026-08-01",
    tasks: [task("capture", "Loose thought"), task("due", "Due item", "2026-08-01"), task("linked", "Project next action", null, { linkedCalendarBlockIds: ["block"] })],
    events: [{ id: "event", title: "Monday call", startAt: new Date("2026-08-03T10:00:00") }],
    taskBlocks: [],
    projects: [{ id: "missing", title: "Needs action", status: "active", targetDate: "2026-08-07" }, { id: "covered", title: "Covered", status: "active", targetDate: "2026-08-08" }],
    projectLinks: [{ projectId: "covered", taskId: "linked" }],
    applications: [{ id: "app", company: "Cedar", title: "Role", status: "follow_up", nextFollowUp: "2026-08-05" }],
    workouts: [{ id: "session", routineName: "Upper", performedOn: "2026-07-30" }],
  });
  assert.equal(review.leadSectionId, "captures");
  assert.equal(review.sections.find((section) => section.id === "captures").title, "1 capture needs a home");
  assert.equal(review.sections.find((section) => section.id === "projects").title, "1 project needs a next action");
  assert.deepEqual(review.sections.find((section) => section.id === "projects").items.map((item) => item.id), ["missing"]);
  assert.equal(review.sections.find((section) => section.id === "followups").items.length, 1);
  assert.equal(new Set(review.sections.map((section) => section.actionTo)).size, 6);
});

test("weekly review excludes completed, deleted, archived, and out-of-window data", () => {
  const review = deriveWeeklyReview({ nowDateKey: "2026-08-01", tasks: [task("done", "Done", null, { completed: true }), task("deleted", "Deleted", null, { deletedAt: new Date() }), task("later", "Later", "2026-08-20")], events: [], taskBlocks: [], projects: [], projectLinks: [], applications: [{ id: "archived", company: "Old", title: "Role", status: "archived", nextFollowUp: "2026-08-01" }], workouts: [{ id: "old", routineName: "Old", performedOn: "2026-07-01" }] });
  assert.equal(review.sections.find((section) => section.id === "captures").items.length, 0);
  assert.equal(review.sections.find((section) => section.id === "priorities").items.length, 0);
  assert.equal(review.sections.find((section) => section.id === "followups").items.length, 0);
  assert.equal(review.sections.find((section) => section.id === "workout").needsAction, true);
});

test("guided routine selection rotates to the least-recent saved routine", () => {
  const selected = selectGuidedRoutine([{ id: "upper", name: "Upper", dayLabel: "Upper", exercises: [] }, { id: "lower", name: "Lower", dayLabel: "Lower", exercises: [] }], [{ id: "u", routineId: "upper", routineName: "Upper", performedOn: "2026-08-01", exercises: [] }, { id: "l", routineId: "lower", routineName: "Lower", performedOn: "2026-07-28", exercises: [] }]);
  assert.equal(selected.id, "lower");
});

test("guided workout preserves an existing draft instead of promising a new routine", () => {
  assert.deepEqual(getGuidedWorkoutAction("upper", true, true), {
    label: "Resume saved draft",
    to: "/app/easyworkout/log?workoutMode=1&demo=1",
    note: "Finish or discard the saved draft before starting this routine. EasyLife will not replace unsaved work.",
  });
  assert.equal(getGuidedWorkoutAction("upper", false, false).to, "/app/easyworkout/log?routineId=upper&workoutMode=1");
});

test("guided workout offers only an optional small increase after two matched target exposures", () => {
  const routine = { id: "upper", name: "Upper", dayLabel: "Upper", exercises: [{ exerciseId: "bench", exerciseName: "Bench", targetSets: 3, targetReps: "5", targetWeight: null }] };
  const sessions = ["2026-08-01", "2026-07-25"].map((performedOn, index) => ({ id: `s${index}`, routineId: "upper", routineName: "Upper", performedOn, weightUnit: "lb", exercises: [{ exerciseId: "bench", exerciseName: "Bench", exerciseType: "weighted", sets: [{ reps: 5, weight: 185, completed: true }] }] }));
  const plan = deriveGuidedWorkoutPlan(routine, sessions, "lb");
  assert.equal(plan.suggestions[0].ruleId, "optional-small-increase-v1");
  assert.match(plan.suggestions[0].suggestion, /190 lb/);
  assert.match(plan.suggestions[0].suggestion, /Repeat 185 lb × 5/);
});

test("guided workout repeats sparse evidence and converts mixed stored units", () => {
  const routine = { id: "lower", name: "Lower", dayLabel: "Lower", exercises: [{ exerciseId: "squat", exerciseName: "Squat", targetSets: 3, targetReps: "6-10", targetWeight: null }, { exerciseId: "new", exerciseName: "New move", targetSets: 2, targetReps: "8", targetWeight: null }] };
  const plan = deriveGuidedWorkoutPlan(routine, [{ id: "kg", routineId: "lower", routineName: "Lower", performedOn: "2026-08-01", weightUnit: "kg", exercises: [{ exerciseId: "squat", exerciseName: "Squat", exerciseType: "weighted", sets: [{ reps: 6, weight: 100 }] }] }], "lb");
  assert.equal(plan.suggestions[0].ruleId, "repeat-latest-effort-v1");
  assert.match(plan.suggestions[0].previous, /220\.5 lb/);
  assert.equal(plan.suggestions[1].ruleId, "start-from-routine-v1");
});

test("demo fixtures visibly prove guided optional progression", () => {
  const upper = workoutDemoRoutines.find((routine) => routine.id === "demo-routine-upper");
  const plan = deriveGuidedWorkoutPlan(upper, workoutDemoSessions, "lb");
  assert.equal(plan.suggestions.find((suggestion) => suggestion.exerciseName === "Bench Press").ruleId, "optional-small-increase-v1");
});

test("history filters compose routine, exercise, period, and PR-only rules", () => {
  const sessions = [
    { id: "new-pr", routineId: "upper", routineName: "Upper", performedOn: "2026-08-01", exercises: [{ exerciseId: "bench", exerciseName: "Bench", exerciseType: "weighted", sets: [{ reps: 5, weight: 200 }] }] },
    { id: "new-row", routineId: "upper", routineName: "Upper", performedOn: "2026-07-25", exercises: [{ exerciseId: "row", exerciseName: "Row", exerciseType: "weighted", sets: [{ reps: 8, weight: 100 }] }] },
    { id: "old", routineId: "lower", routineName: "Lower", performedOn: "2026-01-01", exercises: [{ exerciseId: "squat", exerciseName: "Squat", exerciseType: "weighted", sets: [{ reps: 5, weight: 300 }] }] },
  ];
  assert.deepEqual(filterWorkoutHistory(sessions, { routineId: "upper", exerciseQuery: "bench", periodDays: 30, prOnly: false }, "lb", "2026-08-01").map((session) => session.id), ["new-pr"]);
  const prIds = getWorkoutPrSessionIds(sessions, "lb");
  assert.ok(prIds.has("new-pr"));
  assert.deepEqual(filterWorkoutHistory(sessions, { routineId: "all", exerciseQuery: "", periodDays: 30, prOnly: true }, "lb", "2026-08-01").map((session) => session.id), ["new-pr", "new-row"]);
});

test("JSON and CSV exports preserve versions, stored units, timestamps, and escaped user text", () => {
  const payload = createWorkoutExportPayload({ routines: [{ id: "r", name: "Upper", dayLabel: "Upper", exercises: [], createdAt: new Date("2026-07-01T00:00:00Z"), updatedAt: null }], sessions: [{ id: "s", routineId: "r", routineName: "Upper", performedOn: "2026-08-01", weightUnit: "kg", durationMinutes: 50, notes: "steady, controlled", createdAt: new Date("2026-08-01T18:00:00Z"), updatedAt: null, exercises: [{ exerciseId: "bench", exerciseName: "Bench", exerciseType: "weighted", sets: [{ reps: 5, weight: 100, notes: "say \"go\"", deleted: false }] }] }], exportedAt: "2026-08-02T00:00:00Z", displayUnit: "lb" });
  assert.equal(payload.exportVersion, "easyworkout-export-v1");
  assert.equal(payload.sessions[0].weightUnit, "kg");
  assert.equal(payload.sessions[0].createdAt, "2026-08-01T18:00:00.000Z");
  const csv = serializeWorkoutCsv(payload);
  assert.match(csv, /easyworkout-stats-v1/);
  assert.match(csv, /"steady, controlled"/);
  assert.match(csv, /"say ""go"""/);
});

test("workout CSV neutralizes spreadsheet formulas in user-authored fields", () => {
  const payload = createWorkoutExportPayload({ routines: [], sessions: [{ id: "formula", routineId: null, routineName: "=2+2", performedOn: "2026-08-01", weightUnit: "lb", durationMinutes: 30, notes: " @SUM(A1:A2)", createdAt: null, updatedAt: null, exercises: [{ exerciseId: null, exerciseName: "+cmd", exerciseType: "weighted", sets: [{ reps: 5, weight: 100, notes: "-1+1" }] }] }], exportedAt: "2026-08-02T00:00:00Z", displayUnit: "lb" });
  const csv = serializeWorkoutCsv(payload);
  assert.match(csv, /"'=2\+2"/);
  assert.match(csv, /"'\+cmd"/);
  assert.match(csv, /"'-1\+1"/);
  assert.match(csv, /"' @SUM\(A1:A2\)"/);
});
