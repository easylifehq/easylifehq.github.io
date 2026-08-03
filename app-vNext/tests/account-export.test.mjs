import test from "node:test";
import assert from "node:assert/strict";
import { buildAccountExport, emptyAccountDataCollections, serializeAccountExport, serializeDomainCsv } from "../src/features/coreloop/domain/accountExport.ts";

test("whole-account export is versioned, deterministic, manifested, and secret-free", () => {
  const collections = {
    ...emptyAccountDataCollections,
    tasks: [{ id: "b", title: "Second", clientDraftId: "hidden", projectId: "relationship-project", apiKey: "nope" }, { id: "a", title: "First", createdAt: new Date("2026-08-01T12:00:00Z") }],
    contacts: [{ id: "person", fullName: "Maya", email: "maya@example.com", accessToken: "nope" }],
  };
  const input = { collections, settings: { easyWorkout: { weightUnit: "lb" }, storageBucket: "nope" }, exportedAt: "2026-08-02T00:00:00.000Z", timeZone: "America/Denver", weightUnit: "lb", appVersion: "4.37.1" };
  const first = serializeAccountExport(buildAccountExport(input));
  const second = serializeAccountExport(buildAccountExport(input));
  assert.equal(first, second);
  const parsed = JSON.parse(first);
  assert.equal(parsed.schemaVersion, "easylife-account-export-v1");
  assert.equal(parsed.metadata.timeZone, "America/Denver");
  assert.equal(parsed.metadata.weightUnit, "lb");
  assert.equal(parsed.manifest.included.length, 15);
  assert.deepEqual(parsed.collections.tasks.map((entry) => entry.id), ["a", "b"]);
  assert.equal(parsed.collections.tasks[1].projectId, "relationship-project");
  assert.ok(!first.includes("hidden") && !first.includes("nope") && !first.includes("storageBucket"));
  assert.ok(!Object.hasOwn(parsed, "user"));
});

test("CSV is correctly escaped, deterministic, and neutralizes spreadsheet formulas", () => {
  const records = [
    { id: "2", title: "@SUM(A1:A2)", notes: "line one\nline two", listName: "Inbox", category: "", priorityTier: 2 },
    { id: "1", title: "=2+2", notes: "A \"quoted\" value", listName: "Main", category: "", priorityTier: 1 },
  ];
  const csv = serializeDomainCsv("tasks", records);
  assert.equal(csv, serializeDomainCsv("tasks", records));
  assert.match(csv, /"'=2\+2"/);
  assert.match(csv, /"'@SUM\(A1:A2\)"/);
  assert.match(csv, /"A ""quoted"" value"/);
  assert.match(csv, /"line one\nline two"/);
  assert.ok(csv.indexOf("\"1\"") < csv.indexOf("\"2\""));
});

