import test from "node:test";
import assert from "node:assert/strict";
import { buildAccountExport, emptyAccountDataCollections, serializeAccountExport, serializeDomainCsv } from "../src/features/coreloop/domain/accountExport.ts";

test("whole-account export is versioned, deterministic, manifested, and secret-free", () => {
  const collections = {
    ...emptyAccountDataCollections,
    tasks: [{ id: "b", title: "Second", clientDraftId: "hidden", projectId: "relationship-project", apiKey: "nope" }, { id: "a", title: "First", createdAt: new Date("2026-08-01T12:00:00Z") }],
    contacts: [{ id: "person", fullName: "Maya", email: "maya@example.com", accessToken: "nope", token: "nope", idToken: "nope", authorization: "nope", bearerToken: "nope", clientSecret: "nope", session: "nope", cookie: "nope", privateKey: "nope", serviceAccount: "nope" }],
  };
  const input = { collections, settings: { easyWorkout: { weightUnit: "lb" }, storageBucket: "nope" }, exportedAt: "2026-08-02T00:00:00.000Z", timeZone: "America/Denver", weightUnit: "lb", appVersion: "4.37.1" };
  const first = serializeAccountExport(buildAccountExport(input));
  const second = serializeAccountExport(buildAccountExport(input));
  assert.equal(first, second);
  const parsed = JSON.parse(first);
  assert.equal(parsed.schemaVersion, "easylife-account-export-v2");
  assert.deepEqual(parsed.manifest.compatibleWith, ["easylife-account-export-v1"]);
  assert.equal(parsed.metadata.timeZone, "America/Denver");
  assert.equal(parsed.metadata.weightUnit, "lb");
  assert.equal(parsed.manifest.included.length, 20);
  assert.deepEqual(parsed.collections.tasks.map((entry) => entry.id), ["a", "b"]);
  assert.equal(parsed.collections.tasks[1].projectId, "relationship-project");
  assert.ok(!first.includes("hidden") && !first.includes("nope") && !first.includes("storageBucket"));
  assert.ok(!Object.hasOwn(parsed, "user"));
});

test("whole-account export includes legacy workout import collections deterministically without owner identity or CSV", () => {
  const record = (id, extra = {}) => ({ id, ownerId: "synthetic-owner", schemaVersion: "easyworkout-legacy-import-batch-v1", ...extra });
  const collections = {
    ...emptyAccountDataCollections,
    legacyWorkoutImportBatches: [record("lwb-b", { sourceKey: "synthetic-b" }), record("lwb-a", { sourceKey: "synthetic-a", token: "nope" })],
    legacyWorkoutImportObservations: [record("lwb-a-o2", { sourceOrdinal: 2, sourceHash: `sha256:${"a".repeat(64)}`, sets: [{ reps: 8, loadLb: 30 }] }), record("lwb-a-o1", { sourceOrdinal: 1 })],
    legacyWorkoutImportReceipts: [record("lwb-a", { contentHash: "sha256:x" })],
    legacyWorkoutImportRollbacks: [record("lwb-b", { reason: "owner-soft-rollback" })],
  };
  const input = { collections, settings: {}, exportedAt: "2026-08-02T00:00:00.000Z", timeZone: "UTC", weightUnit: "lb", appVersion: "test" };
  const first = serializeAccountExport(buildAccountExport(input));
  assert.equal(first, serializeAccountExport(buildAccountExport({ ...input, collections: { ...collections, legacyWorkoutImportBatches: [...collections.legacyWorkoutImportBatches].reverse() } })));
  const parsed = JSON.parse(first);
  assert.deepEqual(parsed.collections.legacyWorkoutImportBatches.map((entry) => entry.id), ["lwb-a", "lwb-b"]);
  assert.deepEqual(parsed.collections.legacyWorkoutImportObservations.map((entry) => entry.id), ["lwb-a-o1", "lwb-a-o2"]);
  assert.equal(parsed.collections.legacyWorkoutImportReceipts.length, 1);
  assert.equal(parsed.collections.legacyWorkoutImportRollbacks.length, 1);
  const domains = parsed.manifest.included.map((entry) => entry.domain);
  for (const key of ["legacyWorkoutImportBatches", "legacyWorkoutImportObservations", "legacyWorkoutImportReceipts", "legacyWorkoutImportRollbacks"]) assert.ok(domains.includes(key), key);
  assert.equal(parsed.manifest.included.find((entry) => entry.domain === "legacyWorkoutImportObservations").recordCount, 2);
  assert.ok(!first.includes("synthetic-owner") && !first.includes("nope"));
  assert.equal(parsed.collections.legacyWorkoutImportObservations[1].sets[0].loadLb, 30);
  assert.throws(() => serializeDomainCsv("legacyWorkoutImportBatches", []), /does not have a CSV contract/);
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

