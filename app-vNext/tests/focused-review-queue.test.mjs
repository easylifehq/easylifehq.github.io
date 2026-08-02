import test from "node:test";
import assert from "node:assert/strict";
import { deriveFocusedReviewQueue, getVisibleFocusedReviewItems, normalizeFocusedReviewProgress } from "../src/features/coreloop/domain/focusedReviewQueue.ts";

const task = (overrides) => ({ id: "task", itemKind: "task", title: "Task", notes: "", listName: "Main", category: "", estimatedLength: null, priorityTier: 5, priorityLabel: "", dueDate: null, linkedCalendarEventId: null, linkedNoteId: null, recurring: false, completed: false, completedAt: null, deletedAt: null, linkedCalendarBlockIds: [], createdAt: null, updatedAt: null, ...overrides });

test("focused review orders explainable categories and excludes supported false positives", () => {
  const queue = deriveFocusedReviewQueue({
    nowDateKey: "2026-08-02",
    tasks: [
      task({ id: "capture", title: "Raw thought", listName: "Inbox" }),
      task({ id: "overdue", title: "Late task", dueDate: new Date("2026-08-01T12:00:00"), priorityTier: 4 }),
      task({ id: "priority", title: "Important task", priorityTier: 2 }),
      task({ id: "scheduled", title: "Already protected", priorityTier: 1, linkedCalendarBlockIds: ["block"] }),
      task({ id: "done", title: "Done", completed: true, priorityTier: 1 }),
    ],
    projects: [
      { id: "missing", title: "Needs next action", description: "", targetDate: "", status: "active", createdAt: null, updatedAt: null },
      { id: "linked", title: "Has action", description: "", targetDate: "", status: "active", createdAt: null, updatedAt: null },
    ],
    projectLinks: [{ id: "link", projectId: "linked", sectionId: "", taskId: "scheduled", order: 1, parentLabel: "", createdAt: null, updatedAt: null }],
    applications: [{ id: "app", company: "Cedar", title: "Lead", status: "follow_up", priority: "high", offerResponse: "", dateApplied: "", nextFollowUp: "2026-08-02", location: "", link: "", notes: "", contactName: "", contactEmail: "", createdAt: null, updatedAt: null }],
    workouts: [{ id: "session", routineId: null, routineName: "Upper", performedOn: "2026-08-01", durationMinutes: 45, notes: "", exercises: [], createdAt: null, updatedAt: null }],
  });
  assert.deepEqual(queue.map((item) => item.kind), ["capture", "priority", "priority", "project", "application", "workout"]);
  assert.ok(!queue.some((item) => item.sourceId === "scheduled" || item.sourceId === "done" || item.sourceId === "linked"));
  assert.equal(queue[0].reason, "Unresolved Inbox capture");
});

test("focused review progress survives malformed storage and honors processed/deferred items", () => {
  const items = [
    { id: "capture:a", kind: "capture", sourceId: "a", title: "A", detail: "", reason: "", sourceTo: "", taskId: "a", sortDate: "" },
    { id: "project:b", kind: "project", sourceId: "b", title: "B", detail: "", reason: "", sourceTo: "", taskId: null, sortDate: "" },
  ];
  const progress = normalizeFocusedReviewProgress({ processedIds: ["capture:a", "capture:a", 4], deferredUntil: { "project:b": "2026-08-03", bad: 2 }, currentId: "project:b" });
  assert.deepEqual(progress.processedIds, ["capture:a"]);
  assert.deepEqual(getVisibleFocusedReviewItems(items, progress, "2026-08-02"), []);
  assert.deepEqual(getVisibleFocusedReviewItems(items, progress, "2026-08-03").map((item) => item.id), ["project:b"]);
  assert.equal(normalizeFocusedReviewProgress("bad").version, 1);
});

test("focused review keeps the three most recent completed workouts in newest-first order", () => {
  const queue = deriveFocusedReviewQueue({
    nowDateKey: "2026-08-02",
    tasks: [], projects: [], projectLinks: [], applications: [],
    workouts: [
      { id: "oldest", routineName: "Oldest", performedOn: "2026-07-27", durationMinutes: 30 },
      { id: "newest", routineName: "Newest", performedOn: "2026-08-02", durationMinutes: 30 },
      { id: "middle", routineName: "Middle", performedOn: "2026-07-31", durationMinutes: 30 },
      { id: "second", routineName: "Second", performedOn: "2026-08-01", durationMinutes: 30 },
    ],
  });
  assert.deepEqual(queue.map((item) => item.sourceId), ["newest", "second", "middle"]);
});
