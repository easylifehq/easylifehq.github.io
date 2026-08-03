import test from "node:test";
import assert from "node:assert/strict";
import {
  buildReviewScheduleWindow,
  findExistingProjectHandoff,
  getProjectHandoffChoices,
  resolveReviewTaskHandoff,
} from "../src/features/coreloop/domain/reviewHandoffs.ts";

const task = (overrides = {}) => ({
  id: "task-1", itemKind: "task", title: "Place the reviewed task", notes: "", listName: "Inbox",
  category: "", estimatedLength: 45, priorityTier: 2, priorityLabel: "High", dueDate: null,
  linkedCalendarEventId: null, linkedNoteId: null, recurring: false, completed: false,
  completedAt: null, deletedAt: null, linkedCalendarBlockIds: [], createdAt: null, updatedAt: null,
  ...overrides,
});

test("review task handoffs distinguish loading, missing, completed, and ready records", () => {
  assert.equal(resolveReviewTaskHandoff("task-1", [], true).state, "loading");
  assert.equal(resolveReviewTaskHandoff("task-1", [], false).state, "missing");
  assert.equal(resolveReviewTaskHandoff("task-1", [task({ completed: true })], false).state, "completed");
  const ready = resolveReviewTaskHandoff("task-1", [task()], false);
  assert.equal(ready.state, "ready");
  assert.equal(ready.task?.title, "Place the reviewed task");
  assert.equal(resolveReviewTaskHandoff(null, [task()], false).state, "idle");
});

test("review scheduling uses the first open window and respects its end", () => {
  const selectedDate = new Date(2026, 7, 2, 0, 0, 0, 0);
  const startAt = new Date(2026, 7, 2, 10, 15, 0, 0);
  const endAt = new Date(2026, 7, 2, 10, 45, 0, 0);
  const bounded = buildReviewScheduleWindow({
    selectedDate, wakeHour: 8, defaultMinutes: 30, taskMinutes: 60,
    firstOpenWindow: { startAt, endAt },
  });
  assert.equal(bounded.startAt.getTime(), startAt.getTime());
  assert.equal(bounded.endAt.getTime(), endAt.getTime());

  const fallback = buildReviewScheduleWindow({
    selectedDate, wakeHour: 9, defaultMinutes: 25, taskMinutes: null, firstOpenWindow: null,
  });
  assert.equal(fallback.startAt.getHours(), 9);
  assert.equal((fallback.endAt.getTime() - fallback.startAt.getTime()) / 60_000, 25);
});

test("project handoff choices are active, deterministic, section-ordered, and duplicate-safe", () => {
  const projects = [
    { id: "z", title: "Zeta", status: "active" },
    { id: "a", title: "Alpha", status: "active" },
    { id: "done", title: "Done", status: "completed" },
  ];
  const sections = [
    { id: "later", projectId: "a", title: "Later", order: 2 },
    { id: "next", projectId: "a", title: "Next", order: 1 },
    { id: "hidden", projectId: "done", title: "Hidden", order: 1 },
  ];
  const choices = getProjectHandoffChoices(projects, sections);
  assert.deepEqual(choices.map((choice) => choice.project.id), ["a", "z"]);
  assert.deepEqual(choices[0].sections.map((section) => section.id), ["next", "later"]);

  const existing = findExistingProjectHandoff("task-1", [
    { id: "link-1", projectId: "a", sectionId: "next", taskId: "task-1", order: 1, parentLabel: "Next" },
  ]);
  assert.equal(existing?.id, "link-1");
  assert.equal(findExistingProjectHandoff("other", []), null);
});
