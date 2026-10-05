import assert from "node:assert/strict";
import test from "node:test";
import { workoutLegacyDemoDocument } from "../src/features/easyworkout/demo/workoutLegacyDemoFixtures.ts";
import { validateLegacyObservationDocument } from "../src/features/easyworkout/domain/legacyWorkoutObservation.ts";
import { LegacyImportError, confirmLegacyImportTransaction } from "../src/lib/firestore/legacyWorkoutImportTransactions.ts";
import {
  LEGACY_IMPORT_COLLECTIONS,
  LEGACY_IMPORT_MAX_OBSERVATIONS,
  LEGACY_IMPORT_MAX_TRANSACTION_MUTATIONS,
  buildLegacyImportPlan,
  canonicalLegacyJson,
  legacyBatchId,
  legacyObservationId,
  legacyRollbackReadIds,
  planLegacyImportWrites,
  planLegacyRollback,
  previewLegacyDurableImport,
  reconstructLegacyImports,
  sha256Hex,
  verifyStoredLegacyImport,
} from "../src/features/easyworkout/domain/legacyWorkoutDurableImport.ts";

const OWNER = "synthetic-owner";
const emptyStore = () => ({ batches: {}, observations: {}, confirmations: {}, rollbacks: {} });
const clone = (value) => JSON.parse(JSON.stringify(value));
const planFor = (document = workoutLegacyDemoDocument, owner = OWNER) => {
  const result = buildLegacyImportPlan(owner, document);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  return result.plan;
};
const applyWrites = (store, writes) => {
  for (const write of writes) {
    const key = Object.entries(LEGACY_IMPORT_COLLECTIONS).find(([, name]) => name === write.collection)[0];
    assert.equal(Object.hasOwn(store[key], write.id), false, `would overwrite ${write.collection}/${write.id}`);
    store[key][write.id] = clone(write.data);
  }
  return store;
};
const storedFrom = (plan) => applyWrites(emptyStore(), planLegacyImportWrites(plan, emptyStore()).writes);

test("sha256Hex matches the standard vectors", () => {
  assert.equal(sha256Hex(""), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  assert.equal(sha256Hex("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  assert.equal(sha256Hex("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq"), "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1");
  assert.equal(sha256Hex("é".repeat(100)).length, 64);
});

test("canonical JSON sorts keys, drops undefined and rejects non-finite numbers", () => {
  assert.equal(canonicalLegacyJson({ b: 1, a: { d: [3, { z: 1, y: undefined }], c: null } }), '{"a":{"c":null,"d":[3,{"z":1}]},"b":1}');
  assert.throws(() => canonicalLegacyJson({ a: Number.NaN }));
  assert.throws(() => canonicalLegacyJson({ a: new Date() }));
});

test("batch and observation IDs are deterministic, safe, and distinct per source and ordinal", () => {
  const id = legacyBatchId("synthetic-notebook-a");
  assert.equal(id, legacyBatchId("synthetic-notebook-a"));
  assert.match(id, /^lwb-[0-9a-f]{32}$/);
  assert.notEqual(id, legacyBatchId("synthetic-notebook-b"));
  assert.match(legacyBatchId("weird/../key with spaces & ünïcode\n"), /^lwb-[0-9a-f]{32}$/);
  assert.equal(legacyObservationId(id, 7), `${id}-o7`);
  assert.match(legacyObservationId(id, 123456), /^lwb-[0-9a-f]{32}-o[1-9][0-9]*$/);
});

test("plan builds canonical owner-scoped records with verbatim provenance and no timestamps", () => {
  const plan = planFor();
  assert.equal(plan.batchId, legacyBatchId(workoutLegacyDemoDocument.batch.sourceKey));
  assert.equal(plan.observations.length, workoutLegacyDemoDocument.observations.length);
  assert.equal(plan.batch.data.ownerId, OWNER);
  assert.equal(plan.batch.data.schemaVersion, "easyworkout-legacy-import-batch-v1");
  assert.equal(plan.batch.data.documentSchemaVersion, "easyworkout-legacy-observations-v1");
  assert.deepEqual(plan.batch.data.sourceOrdinals, workoutLegacyDemoDocument.observations.map((o) => o.sourceOrdinal));
  assert.equal(plan.batch.data.observationCount, plan.observations.length);
  assert.match(plan.batch.data.contentHash, /^sha256:[0-9a-f]{64}$/);
  assert.equal(plan.confirmation.id, plan.batchId);
  assert.equal(plan.confirmation.data.schemaVersion, "easyworkout-legacy-import-confirmation-v1");
  assert.equal(plan.confirmation.data.contentHash, plan.batch.data.contentHash);
  for (const record of plan.observations) {
    assert.equal(record.data.ownerId, OWNER);
    assert.equal(record.data.batchId, plan.batchId);
    assert.equal(record.data.schemaVersion, "easyworkout-legacy-import-observation-v1");
    assert.equal(record.id, legacyObservationId(plan.batchId, record.data.sourceOrdinal));
  }
  const first = plan.observations[0].data;
  const source = workoutLegacyDemoDocument.observations[0];
  assert.equal(first.sourceHash, source.sourceHash);
  assert.equal(first.sourceLocator, source.sourceLocator);
  assert.equal(first.sourceText, source.sourceText);
  assert.deepEqual(first.exercise, source.exercise);
  assert.deepEqual(first.sets, source.sets);
  assert.doesNotMatch(canonicalLegacyJson(plan), /createdAt|updatedAt|serverTimestamp/);
  // Same input, same plan; different owner changes only ownerId.
  assert.equal(canonicalLegacyJson(planFor()), canonicalLegacyJson(planFor()));
  assert.equal(planFor(workoutLegacyDemoDocument, "other-owner").batchId, plan.batchId);
  assert.equal(planFor(workoutLegacyDemoDocument, "other-owner").batch.data.contentHash, plan.batch.data.contentHash);
});

const documentWith = (count, overrides = () => ({})) => {
  const document = clone(workoutLegacyDemoDocument);
  document.batch.sourceKey = `synthetic-count-${count}`;
  document.observations = Array.from({ length: count }, (_, index) => ({
    ...clone(workoutLegacyDemoDocument.observations[0]),
    sourceOrdinal: index + 1,
    sourceLocator: `synthetic-row-${index + 1}`,
    ...overrides(index),
  }));
  return document;
};

test("plan refuses invalid documents and blank owners", () => {
  assert.equal(buildLegacyImportPlan(OWNER, { schemaVersion: "nope" }).ok, false);
  assert.equal(buildLegacyImportPlan("  ", workoutLegacyDemoDocument).ok, false);
});

test("durable import allows at most 450 observations per v1 batch, below the 500-write transaction cap", () => {
  assert.equal(LEGACY_IMPORT_MAX_OBSERVATIONS, 450);
  assert.equal(LEGACY_IMPORT_MAX_TRANSACTION_MUTATIONS, 500);
});

test("451 observations are rejected locally before any write planning, while the local parser still accepts them", () => {
  const over = documentWith(451);
  assert.equal(validateLegacyObservationDocument(over).valid, true);
  const result = buildLegacyImportPlan(OWNER, over);
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "durable-observation-limit");
  assert.equal(result.errors[0].path, "observations");
  assert.match(result.errors[0].message, /450/);
  assert.equal(result.plan, undefined);
  // The 5,000-observation local read-only contract limit is untouched.
  assert.equal(validateLegacyObservationDocument(documentWith(5000)).valid, true);
  assert.equal(buildLegacyImportPlan(OWNER, documentWith(5000)).ok, false);
});

test("the transaction entry point rejects 451 observations before touching the database", async () => {
  // A null database would throw a different error if the transaction were ever started.
  await assert.rejects(
    confirmLegacyImportTransaction(null, OWNER, documentWith(451)),
    (error) => error instanceof LegacyImportError && error.code === "invalid" && /450/.test(error.message),
  );
});

test("a 450-observation batch plans within the documented transaction limit", () => {
  const sets = Array.from({ length: 50 }, () => ({ reps: 8, loadLb: 100.5, evidence: "performed", evidenceBasis: "later-handwritten-policy" }));
  const plan = planFor(documentWith(450, () => ({ sourceText: "x".repeat(500), sets })));
  assert.equal(plan.observationCount, 450);
  assert.equal(plan.observations.length, 450);
  assert.equal(plan.tooLarge, false);
  const planned = planLegacyImportWrites(plan, emptyStore());
  assert.equal(planned.status, "ready");
  assert.equal(planned.writes.length, 452);
  // Every record the transaction reads is either written or verified: observations + batch + receipt + rollback slot.
  const mutations = plan.observationCount + 3;
  assert.ok(mutations <= LEGACY_IMPORT_MAX_TRANSACTION_MUTATIONS, `${mutations} mutations`);
  assert.equal(LEGACY_IMPORT_MAX_TRANSACTION_MUTATIONS - mutations, 47);
  assert.equal(previewLegacyDurableImport(plan, emptyStore()).canConfirm, true);
});

test("the oversized-bytes guard still blocks a plan that exceeds the payload budget", () => {
  const plan = { ...planFor(), tooLarge: true };
  assert.equal(previewLegacyDurableImport(plan, emptyStore()).canConfirm, false);
  assert.equal(planLegacyImportWrites(plan, emptyStore()).status, "too-large");
});

test("preview classifies every record as new when nothing is stored", () => {
  const plan = planFor();
  const preview = previewLegacyDurableImport(plan, emptyStore());
  assert.equal(preview.state, "new");
  assert.equal(preview.canConfirm, true);
  assert.equal(preview.counts.total, plan.observations.length + 2);
  assert.equal(preview.counts.new, preview.counts.total);
  assert.equal(preview.counts.existing, 0);
  assert.equal(preview.counts.conflict, 0);
  assert.equal(preview.records.batch, "new");
  assert.equal(preview.records.confirmation, "new");
  assert.deepEqual(preview.records.observations, { total: plan.observations.length, new: plan.observations.length, existing: 0, conflict: 0 });
  assert.equal(preview.rollbackAvailable, false);
  const { writes, status } = planLegacyImportWrites(plan, emptyStore());
  assert.equal(status, "ready");
  assert.equal(writes.length, preview.counts.total);
});

test("preview accepts byte-equivalent and key-reordered existing records and plans no writes", () => {
  const plan = planFor();
  const store = storedFrom(plan);
  // Reorder keys: canonically equivalent.
  const id = plan.observations[0].id;
  store.observations[id] = Object.fromEntries(Object.entries(store.observations[id]).reverse());
  const preview = previewLegacyDurableImport(plan, store);
  assert.equal(preview.state, "already-imported");
  assert.equal(preview.canConfirm, false);
  assert.equal(preview.counts.existing, preview.counts.total);
  assert.equal(preview.rollbackAvailable, true);
  const planned = planLegacyImportWrites(plan, store);
  assert.equal(planned.status, "already-imported");
  assert.deepEqual(planned.writes, []);
});

test("partial stores create only missing records", () => {
  const plan = planFor();
  const store = storedFrom(plan);
  delete store.confirmations[plan.batchId];
  delete store.observations[plan.observations[2].id];
  const preview = previewLegacyDurableImport(plan, store);
  assert.equal(preview.state, "partial");
  assert.equal(preview.canConfirm, true);
  assert.equal(preview.counts.new, 2);
  const { writes } = planLegacyImportWrites(plan, store);
  assert.deepEqual(writes.map((w) => `${w.collection}/${w.id}`).sort(), [
    `${LEGACY_IMPORT_COLLECTIONS.confirmations}/${plan.batchId}`,
    `${LEGACY_IMPORT_COLLECTIONS.observations}/${plan.observations[2].id}`,
  ].sort());
});

test("any conflict blocks the whole import and is reported by kind and id", () => {
  const plan = planFor();
  for (const mutate of [
    (store) => { store.observations[plan.observations[1].id].sets[0].reps += 1; },
    (store) => { store.batches[plan.batchId].sourceLabel = "Changed label"; },
    (store) => { store.confirmations[plan.batchId].contentHash = `sha256:${"0".repeat(64)}`; },
    (store) => { store.observations[plan.observations[0].id].ownerId = "someone-else"; },
    (store) => { store.observations[plan.observations[0].id].injected = true; },
  ]) {
    const store = storedFrom(plan);
    mutate(store);
    const preview = previewLegacyDurableImport(plan, store);
    assert.equal(preview.state, "conflict");
    assert.equal(preview.canConfirm, false);
    assert.ok(preview.counts.conflict >= 1);
    assert.equal(preview.conflicts.length, preview.conflictCount);
    assert.ok(["batch", "observation", "confirmation"].includes(preview.conflicts[0].kind));
    const planned = planLegacyImportWrites(plan, store);
    assert.equal(planned.status, "conflict");
    assert.deepEqual(planned.writes, []);
  }
  // A conflict next to missing records still writes nothing.
  const store = storedFrom(plan);
  delete store.observations[plan.observations[0].id];
  store.batches[plan.batchId].sourceKind = "other";
  assert.deepEqual(planLegacyImportWrites(plan, store).writes, []);
});

test("a changed document under the same source key conflicts instead of overwriting", () => {
  const store = storedFrom(planFor());
  const changed = clone(workoutLegacyDemoDocument);
  changed.observations[0].sets[0].reps = 99;
  const plan = planFor(changed);
  assert.equal(plan.batchId, legacyBatchId(workoutLegacyDemoDocument.batch.sourceKey));
  const preview = previewLegacyDurableImport(plan, store);
  assert.equal(preview.state, "conflict");
  assert.ok(preview.conflicts.some((c) => c.kind === "batch"));
  assert.ok(preview.conflicts.some((c) => c.kind === "observation"));
  assert.equal(planLegacyImportWrites(plan, store).writes.length, 0);
});

test("retry after a successful import is idempotent and never rewrites", () => {
  const plan = planFor();
  const store = storedFrom(plan);
  const before = canonicalLegacyJson(store);
  for (let attempt = 0; attempt < 3; attempt += 1) assert.deepEqual(planLegacyImportWrites(plan, store).writes, []);
  assert.equal(canonicalLegacyJson(store), before);
});

test("verification proves intact imports and fails closed on missing or changed records", () => {
  const plan = planFor();
  assert.equal(verifyStoredLegacyImport(OWNER, plan.batchId, storedFrom(plan)).ok, true);
  const cases = [
    ["missing-batch", (s) => { delete s.batches[plan.batchId]; }],
    ["missing-confirmation", (s) => { delete s.confirmations[plan.batchId]; }],
    ["missing-observation", (s) => { delete s.observations[plan.observations[0].id]; }],
    ["changed", (s) => { s.observations[plan.observations[0].id].sourceHash = `sha256:${"9".repeat(64)}`; }],
    ["changed", (s) => { s.batches[plan.batchId].contentHash = `sha256:${"9".repeat(64)}`; }],
    ["changed", (s) => { s.observations[plan.observations[0].id].extra = 1; }],
    ["changed", (s) => { s.batches[plan.batchId].ownerId = "intruder"; }],
    ["unexpected-records", (s) => { s.observations[`${plan.batchId}-o9999`] = { ...clone(s.observations[plan.observations[0].id]), sourceOrdinal: 9999 }; }],
    ["invalid", (s) => { s.batches[plan.batchId].sourceOrdinals = "nope"; }],
    ["invalid", (s) => { s.batches[plan.batchId].sourceOrdinals = Array.from({ length: 451 }, (_, i) => i + 1); s.batches[plan.batchId].observationCount = 451; }],
  ];
  for (const [code, mutate] of cases) {
    const store = storedFrom(plan);
    mutate(store);
    const result = verifyStoredLegacyImport(OWNER, plan.batchId, store);
    assert.equal(result.ok, false, code);
    assert.equal(result.code, code);
  }
  assert.equal(verifyStoredLegacyImport("different-owner", plan.batchId, storedFrom(plan)).ok, false);
});

test("rollback plans an immutable tombstone only after proving the import is unchanged", () => {
  const plan = planFor();
  const store = storedFrom(plan);
  const result = planLegacyRollback(OWNER, plan.batchId, store);
  assert.equal(result.ok, true);
  assert.equal(result.status, "create");
  assert.equal(result.receipt.collection, LEGACY_IMPORT_COLLECTIONS.rollbacks);
  assert.equal(result.receipt.id, plan.batchId);
  assert.deepEqual(Object.keys(result.receipt.data).sort(), ["batchId", "contentHash", "observationCount", "ownerId", "reason", "schemaVersion"]);
  assert.equal(result.receipt.data.schemaVersion, "easyworkout-legacy-import-rollback-v1");
  assert.equal(result.receipt.data.contentHash, plan.batch.data.contentHash);
  // Provenance is never touched by the plan: it produces exactly one create.
  const mutated = clone(store);
  mutated.observations[plan.observations[3].id].sets[0].loadLb = 1;
  assert.equal(planLegacyRollback(OWNER, plan.batchId, mutated).ok, false);
  const missing = clone(store);
  delete missing.confirmations[plan.batchId];
  assert.equal(planLegacyRollback(OWNER, plan.batchId, missing).ok, false);
});

test("rollback retry is idempotent and a conflicting tombstone fails closed", () => {
  const plan = planFor();
  const store = storedFrom(plan);
  const first = planLegacyRollback(OWNER, plan.batchId, store);
  store.rollbacks[plan.batchId] = clone(first.receipt.data);
  const retry = planLegacyRollback(OWNER, plan.batchId, store);
  assert.equal(retry.ok, true);
  assert.equal(retry.status, "already-rolled-back");
  store.rollbacks[plan.batchId].contentHash = `sha256:${"1".repeat(64)}`;
  const conflict = planLegacyRollback(OWNER, plan.batchId, store);
  assert.equal(conflict.ok, false);
  assert.equal(conflict.code, "rollback-conflict");
});

test("a rolled-back batch blocks re-import and never mutates provenance", () => {
  const plan = planFor();
  const store = storedFrom(plan);
  const provenance = canonicalLegacyJson(store);
  store.rollbacks[plan.batchId] = planLegacyRollback(OWNER, plan.batchId, store).receipt.data;
  const preview = previewLegacyDurableImport(plan, store);
  assert.equal(preview.state, "rolled-back");
  assert.equal(preview.canConfirm, false);
  assert.equal(preview.rollbackAvailable, false);
  assert.deepEqual(planLegacyImportWrites(plan, store).writes, []);
  const { rollbacks, ...rest } = store;
  assert.equal(canonicalLegacyJson({ ...rest, rollbacks: {} }), provenance);
});

test("rollback read IDs come from the stored batch ordinals and are bounded", () => {
  const plan = planFor();
  assert.deepEqual(legacyRollbackReadIds(plan.batch.data), plan.observations.map((o) => o.id));
  assert.equal(legacyRollbackReadIds(null), null);
  assert.equal(legacyRollbackReadIds({ ...plan.batch.data, sourceOrdinals: [1, 1.5] }), null);
  assert.equal(legacyRollbackReadIds({ ...plan.batch.data, sourceOrdinals: Array.from({ length: 451 }, (_, i) => i + 1) }), null);
  assert.equal(legacyRollbackReadIds({ ...plan.batch.data, sourceOrdinals: Array.from({ length: 450 }, (_, i) => i + 1) }).length, 450);
});

test("readback reconstructs validated documents, excludes rolled-back batches and reports problems", () => {
  const plan = planFor();
  const store = storedFrom(plan);
  const readback = reconstructLegacyImports(OWNER, store);
  assert.equal(readback.imports.length, 1);
  assert.equal(readback.imports[0].batchId, plan.batchId);
  assert.equal(readback.imports[0].rollbackAvailable, true);
  assert.deepEqual(readback.imports[0].document, JSON.parse(JSON.stringify(workoutLegacyDemoDocument)));
  assert.deepEqual(readback.issues, []);
  assert.deepEqual(readback.rolledBack, []);

  const second = clone(workoutLegacyDemoDocument);
  second.batch.sourceKey = "synthetic-notebook-second";
  second.batch.sourceLabel = "Second synthetic notebook";
  const secondPlan = planFor(second);
  applyWrites(store, planLegacyImportWrites(secondPlan, store).writes);
  assert.equal(reconstructLegacyImports(OWNER, store).imports.length, 2);

  store.rollbacks[plan.batchId] = planLegacyRollback(OWNER, plan.batchId, store).receipt.data;
  const afterRollback = reconstructLegacyImports(OWNER, store);
  assert.deepEqual(afterRollback.imports.map((i) => i.batchId), [secondPlan.batchId]);
  assert.deepEqual(afterRollback.rolledBack.map((r) => r.batchId), [plan.batchId]);
  assert.equal(afterRollback.rolledBack[0].sourceLabel, workoutLegacyDemoDocument.batch.sourceLabel);

  store.observations[secondPlan.observations[0].id].sets[0].reps = 77;
  const afterCorruption = reconstructLegacyImports(OWNER, store);
  assert.equal(afterCorruption.imports.length, 0);
  assert.equal(afterCorruption.issues.length, 1);
  assert.equal(afterCorruption.issues[0].batchId, secondPlan.batchId);
  assert.equal(afterCorruption.issues[0].code, "changed");

  // Another owner's data is never reconstructed under this owner.
  assert.equal(reconstructLegacyImports("someone-else", storedFrom(plan)).imports.length, 0);
});

test("readback of a batch with no confirmation receipt is withheld and reported", () => {
  const plan = planFor();
  const store = storedFrom(plan);
  delete store.confirmations[plan.batchId];
  const readback = reconstructLegacyImports(OWNER, store);
  assert.equal(readback.imports.length, 0);
  assert.equal(readback.issues[0].code, "missing-confirmation");
});
