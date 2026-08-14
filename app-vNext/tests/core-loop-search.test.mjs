import test from "node:test";
import assert from "node:assert/strict";
import { filterCoreLoopCommands, getSearchPresentationState, isCaptureShortcut, isGlobalSearchShortcut, movePaletteIndex, searchCoreLoopDocuments } from "../src/features/coreloop/domain/globalSearch.ts";

const documents = [
  { id: "note:1", group: "Notes", title: "Cedar interview notes", detail: "Workflow example", searchText: "product operations", to: "/notes/1", updatedAt: new Date("2026-08-01T12:00:00Z") },
  { id: "person:1", group: "People", title: "Jordan Lee", detail: "Cedar Labs · Recruiter", searchText: "follow up", to: "/people/1", updatedAt: new Date("2026-08-01T13:00:00Z") },
  { id: "workout:1", group: "Workouts", title: "Upper", detail: "2026-08-01", searchText: "bench press", to: "/workout/1", updatedAt: new Date("2026-08-01T14:00:00Z") },
];

test("global search ranks title matches and groups supported records", () => {
  const results = searchCoreLoopDocuments(documents, "cedar");
  assert.deepEqual(results.map((result) => result.id), ["note:1", "person:1"]);
  assert.equal(results[0].group, "Notes");
  assert.equal(searchCoreLoopDocuments(documents, "bench press")[0].to, "/workout/1");
  assert.deepEqual(searchCoreLoopDocuments(documents, "missing"), []);
});

test("command matching and keyboard index movement remain deterministic", () => {
  assert.equal(filterCoreLoopCommands("").length, 7);
  assert.equal(filterCoreLoopCommands("weekly review")[0].id, "my-week");
  assert.equal(filterCoreLoopCommands("resume gym")[0].id, "workout");
  assert.equal(movePaletteIndex(-1, 1, 3), 0);
  assert.equal(movePaletteIndex(0, -1, 3), 2);
  assert.equal(movePaletteIndex(2, 1, 3), 0);
  assert.equal(movePaletteIndex(0, 1, 0), -1);
  assert.equal(isGlobalSearchShortcut({ ctrlKey: true, metaKey: false, shiftKey: false, key: "k" }), true);
  assert.equal(isCaptureShortcut({ ctrlKey: true, metaKey: false, shiftKey: false, key: "k" }), false);
  assert.equal(isCaptureShortcut({ ctrlKey: true, metaKey: false, shiftKey: true, key: "K" }), true);
  assert.equal(isGlobalSearchShortcut({ ctrlKey: true, metaKey: false, shiftKey: true, key: "K" }), false);
});

test("search states distinguish loading, empty, partial error, and offline", () => {
  assert.equal(getSearchPresentationState({ query: "", isLoading: true, errors: [], isOnline: true, resultCount: 0 }), "loading");
  assert.equal(getSearchPresentationState({ query: "x", isLoading: false, errors: [], isOnline: true, resultCount: 0 }), "empty");
  assert.equal(getSearchPresentationState({ query: "x", isLoading: false, errors: ["notes"], isOnline: true, resultCount: 2 }), "partial-error");
  assert.equal(getSearchPresentationState({ query: "x", isLoading: false, errors: [], isOnline: false, resultCount: 2 }), "offline");
});

test("search handles a realistic large synthetic account within the interaction budget", () => {
  const large = Array.from({ length: 15000 }, (_, index) => ({
    id: `note:${index}`,
    group: "Notes",
    title: index % 997 === 0 ? `Quarterly cedar review ${index}` : `Reference note ${index}`,
    detail: `Synthetic searchable content ${index}`,
    searchText: index % 997 === 0 ? "cedar operations follow-up" : "ordinary material",
    to: `/app/easynotes/${index}`,
    updatedAt: new Date(1_750_000_000_000 + index),
  }));
  const started = performance.now();
  const results = searchCoreLoopDocuments(large, "cedar operations");
  const elapsed = performance.now() - started;
  assert.equal(results.length, 16);
  assert.ok(elapsed < 500, `search took ${elapsed.toFixed(1)}ms`);
});
