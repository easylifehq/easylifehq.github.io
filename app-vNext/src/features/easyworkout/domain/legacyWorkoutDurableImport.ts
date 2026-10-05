import {
  validateLegacyObservationDocument,
  type LegacyObservation,
  type LegacyObservationDocument,
  type LegacyValidationIssue,
} from "./legacyWorkoutObservation.ts";

export const LEGACY_IMPORT_COLLECTIONS = {
  batches: "legacyWorkoutImportBatches",
  observations: "legacyWorkoutImportObservations",
  confirmations: "legacyWorkoutImportReceipts",
  rollbacks: "legacyWorkoutImportRollbacks",
} as const;
export type LegacyImportCollectionKey = keyof typeof LEGACY_IMPORT_COLLECTIONS;
export type LegacyImportCollectionName = (typeof LEGACY_IMPORT_COLLECTIONS)[LegacyImportCollectionKey];

export const LEGACY_IMPORT_SCHEMA = {
  batch: "easyworkout-legacy-import-batch-v1",
  observation: "easyworkout-legacy-import-observation-v1",
  confirmation: "easyworkout-legacy-import-confirmation-v1",
  rollback: "easyworkout-legacy-import-rollback-v1",
} as const;
export const LEGACY_ROLLBACK_REASON = "owner-soft-rollback";
/** A single atomic transaction must stay well inside Firestore's request size limit. */
export const LEGACY_IMPORT_MAX_BYTES = 8 * 1024 * 1024;
/** Documented Firestore maximum of writes (including verify mutations for read-only documents) per transaction. */
export const LEGACY_IMPORT_MAX_TRANSACTION_MUTATIONS = 500;
/**
 * Durable v1 limit, deliberately below the local read-only parser's 5,000. One transaction reads every observation
 * plus the batch, confirmation and rollback slot, so it commits observations + 3 mutations (written or verified).
 * 450 + 3 = 453 leaves 47 mutations of headroom under the 500 cap. Chunking is intentionally not implemented in v1.
 */
export const LEGACY_IMPORT_MAX_OBSERVATIONS = 450;
const MAX_REPORTED_CONFLICTS = 50;
const DOCUMENT_OVERHEAD_BYTES = 128;

export type LegacyImportData = Record<string, unknown>;
export type LegacyImportRecord = { collection: LegacyImportCollectionName; id: string; data: LegacyImportData };
export type StoredLegacyImportRecords = Record<LegacyImportCollectionKey, Record<string, unknown>>;
export type LegacyImportRecordStatus = "new" | "existing" | "conflict";

// ---- Hashing and canonical JSON ---------------------------------------------------------------

const SHA256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];
const SHA256_INITIAL = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
const rotateRight = (value: number, bits: number) => (value >>> bits) | (value << (32 - bits));

/** Dependency-free synchronous SHA-256 so deterministic IDs and hashes work in the browser and in tests. */
export function sha256Hex(text: string): string {
  const bytes = new TextEncoder().encode(text);
  const padded = new Uint8Array(Math.ceil((bytes.length + 9) / 64) * 64);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  const bitLength = bytes.length * 8;
  view.setUint32(padded.length - 8, Math.floor(bitLength / 0x100000000));
  view.setUint32(padded.length - 4, bitLength >>> 0);

  const state = SHA256_INITIAL.slice();
  const words = new Array<number>(64).fill(0);
  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let index = 0; index < 16; index += 1) words[index] = view.getUint32(offset + index * 4);
    for (let index = 16; index < 64; index += 1) {
      const low = words[index - 15];
      const high = words[index - 2];
      const sigma0 = rotateRight(low, 7) ^ rotateRight(low, 18) ^ (low >>> 3);
      const sigma1 = rotateRight(high, 17) ^ rotateRight(high, 19) ^ (high >>> 10);
      words[index] = (words[index - 16] + sigma0 + words[index - 7] + sigma1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = state;
    for (let index = 0; index < 64; index += 1) {
      const sum1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
      const choose = (e & f) ^ (~e & g);
      const temp1 = (h + sum1 + choose + SHA256_K[index] + words[index]) >>> 0;
      const sum0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (sum0 + majority) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0; d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    [a, b, c, d, e, f, g, h].forEach((value, index) => { state[index] = (state[index] + value) >>> 0; });
  }
  return state.map((value) => value.toString(16).padStart(8, "0")).join("");
}

function canonicalize(value: unknown): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("canonical JSON cannot represent a non-finite number");
    return value;
  }
  if (Array.isArray(value)) return value.map((entry) => {
    if (entry === undefined) throw new TypeError("canonical JSON cannot represent an undefined array entry");
    return canonicalize(entry);
  });
  if (typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) throw new TypeError("canonical JSON only represents plain objects");
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([key, entry]) => [key, canonicalize(entry)] as const);
    return Object.fromEntries(entries);
  }
  throw new TypeError(`canonical JSON cannot represent ${typeof value}`);
}

/** Key-sorted JSON with undefined properties omitted; the exact-content comparison form for every record. */
export function canonicalLegacyJson(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

function canonicalEquals(left: unknown, right: unknown): boolean {
  try { return canonicalLegacyJson(left) === canonicalLegacyJson(right); } catch { return false; }
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const has = (map: Record<string, unknown>, id: string) => Object.prototype.hasOwnProperty.call(map, id);

// ---- Deterministic identifiers -----------------------------------------------------------------

/** One batch per source key. Re-importing changed content under the same key conflicts instead of forking history. */
export function legacyBatchId(sourceKey: string): string {
  return `lwb-${sha256Hex(`easyworkout-legacy-import-batch-v1\n${sourceKey}`).slice(0, 32)}`;
}

export function legacyObservationId(batchId: string, sourceOrdinal: number): string {
  return `${batchId}-o${sourceOrdinal}`;
}

// ---- Plan --------------------------------------------------------------------------------------

export type LegacyImportPlan = {
  ownerId: string;
  batchId: string;
  contentHash: string;
  observationCount: number;
  setCount: number;
  estimatedBytes: number;
  tooLarge: boolean;
  document: LegacyObservationDocument;
  batch: LegacyImportRecord;
  observations: LegacyImportRecord[];
  confirmation: LegacyImportRecord;
};
export type LegacyImportPlanResult = { ok: true; plan: LegacyImportPlan } | { ok: false; errors: LegacyValidationIssue[] };

function observationData(ownerId: string, batchId: string, observation: LegacyObservation): LegacyImportData {
  return canonicalize({
    ownerId,
    schemaVersion: LEGACY_IMPORT_SCHEMA.observation,
    batchId,
    sourceOrdinal: observation.sourceOrdinal,
    sourceLocator: observation.sourceLocator,
    sourceHash: observation.sourceHash,
    sourceText: observation.sourceText,
    temporal: observation.temporal,
    exercise: observation.exercise,
    sets: observation.sets,
  }) as LegacyImportData;
}

function confirmationData(ownerId: string, batchId: string, contentHash: string, observationCount: number): LegacyImportData {
  return { ownerId, schemaVersion: LEGACY_IMPORT_SCHEMA.confirmation, batchId, contentHash, observationCount };
}

function rollbackData(ownerId: string, batchId: string, contentHash: string, observationCount: number): LegacyImportData {
  return { ownerId, schemaVersion: LEGACY_IMPORT_SCHEMA.rollback, batchId, contentHash, observationCount, reason: LEGACY_ROLLBACK_REASON };
}

export function buildLegacyImportPlan(ownerId: string, input: unknown): LegacyImportPlanResult {
  if (typeof ownerId !== "string" || ownerId.trim() === "") return { ok: false, errors: [{ path: "ownerId", code: "required-owner", message: "a signed-in owner is required" }] };
  const validated = validateLegacyObservationDocument(input);
  if (!validated.valid) return { ok: false, errors: validated.errors };
  const document = validated.document;
  if (document.observations.length > LEGACY_IMPORT_MAX_OBSERVATIONS) {
    return {
      ok: false,
      errors: [{
        path: "observations",
        code: "durable-observation-limit",
        message: `A saved import holds at most ${LEGACY_IMPORT_MAX_OBSERVATIONS} observations per file; this file has ${document.observations.length}. Split it into smaller files with different source keys`,
      }],
    };
  }
  const batchId = legacyBatchId(document.batch.sourceKey);
  const contentHash = `sha256:${sha256Hex(canonicalLegacyJson({ schemaVersion: document.schemaVersion, batch: document.batch, observations: document.observations }))}`;
  const observations = [...document.observations]
    .sort((left, right) => left.sourceOrdinal - right.sourceOrdinal)
    .map((observation): LegacyImportRecord => ({
      collection: LEGACY_IMPORT_COLLECTIONS.observations,
      id: legacyObservationId(batchId, observation.sourceOrdinal),
      data: observationData(ownerId, batchId, observation),
    }));
  const batch: LegacyImportRecord = {
    collection: LEGACY_IMPORT_COLLECTIONS.batches,
    id: batchId,
    data: {
      ownerId,
      schemaVersion: LEGACY_IMPORT_SCHEMA.batch,
      batchId,
      documentSchemaVersion: document.schemaVersion,
      sourceKey: document.batch.sourceKey,
      sourceLabel: document.batch.sourceLabel,
      sourceKind: document.batch.sourceKind,
      unitPolicy: document.batch.unitPolicy,
      interpretationPolicyVersion: document.batch.interpretationPolicyVersion,
      contentHash,
      observationCount: observations.length,
      sourceOrdinals: observations.map((record) => record.data.sourceOrdinal),
    },
  };
  const confirmation: LegacyImportRecord = {
    collection: LEGACY_IMPORT_COLLECTIONS.confirmations,
    id: batchId,
    data: confirmationData(ownerId, batchId, contentHash, observations.length),
  };
  const encoder = new TextEncoder();
  const estimatedBytes = [batch, ...observations, confirmation].reduce((sum, record) => sum + encoder.encode(canonicalLegacyJson(record.data)).length + DOCUMENT_OVERHEAD_BYTES, 0);
  return {
    ok: true,
    plan: {
      ownerId,
      batchId,
      contentHash,
      observationCount: observations.length,
      setCount: document.observations.reduce((sum, observation) => sum + observation.sets.length, 0),
      estimatedBytes,
      tooLarge: estimatedBytes > LEGACY_IMPORT_MAX_BYTES,
      document,
      batch,
      observations,
      confirmation,
    },
  };
}

// ---- Verification of stored imports ------------------------------------------------------------

export type LegacyVerifyFailureCode = "missing-batch" | "missing-confirmation" | "missing-observation" | "invalid" | "changed" | "unexpected-records";
export type LegacyVerifyResult = { ok: true; plan: LegacyImportPlan } | { ok: false; code: LegacyVerifyFailureCode; message: string };

/** Observation document IDs a stored batch claims to own, or null when its ordinal list is not trustworthy. */
export function legacyRollbackReadIds(batchData: unknown): string[] | null {
  if (!isRecord(batchData) || typeof batchData.batchId !== "string" || !Array.isArray(batchData.sourceOrdinals)) return null;
  const ordinals = batchData.sourceOrdinals;
  if (ordinals.length > LEGACY_IMPORT_MAX_OBSERVATIONS) return null;
  if (!ordinals.every((ordinal) => typeof ordinal === "number" && Number.isSafeInteger(ordinal) && ordinal >= 1)) return null;
  return (ordinals as number[]).map((ordinal) => legacyObservationId(batchData.batchId as string, ordinal));
}

const STRIPPED_OBSERVATION_KEYS = new Set(["ownerId", "schemaVersion", "batchId"]);

/**
 * Rebuilds the validated document from stored records, re-derives the canonical plan, and requires every stored
 * batch/observation/confirmation record to equal it exactly. Any gap or difference fails closed.
 */
export function verifyStoredLegacyImport(ownerId: string, batchId: string, stored: StoredLegacyImportRecords): LegacyVerifyResult {
  const fail = (code: LegacyVerifyFailureCode, message: string): LegacyVerifyResult => ({ ok: false, code, message });
  if (!has(stored.batches, batchId)) return fail("missing-batch", "The import batch record is missing.");
  const rawBatch = stored.batches[batchId];
  const ids = legacyRollbackReadIds(rawBatch);
  if (!isRecord(rawBatch) || ids === null) return fail("invalid", "The import batch record is not readable.");
  if (!has(stored.confirmations, batchId)) return fail("missing-confirmation", "The import confirmation receipt is missing.");

  const observations: unknown[] = [];
  for (const id of ids) {
    if (!has(stored.observations, id)) return fail("missing-observation", "An imported observation record is missing.");
    const raw = stored.observations[id];
    if (!isRecord(raw)) return fail("invalid", "An imported observation record is not readable.");
    observations.push(Object.fromEntries(Object.entries(raw).filter(([key]) => !STRIPPED_OBSERVATION_KEYS.has(key))));
  }
  const validated = validateLegacyObservationDocument({
    schemaVersion: rawBatch.documentSchemaVersion,
    batch: {
      sourceKey: rawBatch.sourceKey,
      sourceLabel: rawBatch.sourceLabel,
      sourceKind: rawBatch.sourceKind,
      unitPolicy: rawBatch.unitPolicy,
      interpretationPolicyVersion: rawBatch.interpretationPolicyVersion,
    },
    observations,
  });
  if (!validated.valid) return fail("invalid", "The stored import does not satisfy the v1 contract.");
  const rebuilt = buildLegacyImportPlan(ownerId, validated.document);
  if (!rebuilt.ok) return fail("invalid", "The stored import cannot be rebuilt for this owner.");
  const { plan } = rebuilt;
  if (plan.batchId !== batchId) return fail("changed", "The stored batch identity does not match its source key.");
  if (!canonicalEquals(rawBatch, plan.batch.data)) return fail("changed", "The stored batch record differs from its canonical form.");
  if (!canonicalEquals(stored.confirmations[batchId], plan.confirmation.data)) return fail("changed", "The stored confirmation receipt differs from its canonical form.");
  for (const record of plan.observations) {
    if (!has(stored.observations, record.id)) return fail("missing-observation", "An imported observation record is missing.");
    if (!canonicalEquals(stored.observations[record.id], record.data)) return fail("changed", "An imported observation record differs from its canonical form.");
  }
  const expectedIds = new Set(plan.observations.map((record) => record.id));
  for (const [id, raw] of Object.entries(stored.observations)) {
    if (expectedIds.has(id)) continue;
    if (id.startsWith(`${batchId}-o`) || (isRecord(raw) && raw.batchId === batchId)) return fail("unexpected-records", "Unexpected observation records reference this batch.");
  }
  return { ok: true, plan };
}

// ---- Import preview and write planning ---------------------------------------------------------

export type LegacyImportConflict = { kind: "batch" | "observation" | "confirmation"; id: string };
export type LegacyImportState = "new" | "partial" | "already-imported" | "conflict" | "rolled-back";
export type LegacyImportPreview = {
  batchId: string;
  state: LegacyImportState;
  counts: { total: number; new: number; existing: number; conflict: number };
  records: {
    batch: LegacyImportRecordStatus;
    confirmation: LegacyImportRecordStatus;
    observations: { total: number; new: number; existing: number; conflict: number };
  };
  conflicts: LegacyImportConflict[];
  conflictCount: number;
  observationCount: number;
  setCount: number;
  estimatedBytes: number;
  tooLarge: boolean;
  canConfirm: boolean;
  rollbackAvailable: boolean;
};
export type LegacyImportWritePlan = {
  status: "ready" | "already-imported" | "conflict" | "rolled-back" | "too-large";
  writes: LegacyImportRecord[];
  preview: LegacyImportPreview;
};

function classify(map: Record<string, unknown>, record: LegacyImportRecord): LegacyImportRecordStatus {
  if (!has(map, record.id)) return "new";
  return canonicalEquals(map[record.id], record.data) ? "existing" : "conflict";
}

export function planLegacyImportWrites(plan: LegacyImportPlan, stored: StoredLegacyImportRecords): LegacyImportWritePlan {
  const batch = classify(stored.batches, plan.batch);
  const confirmation = classify(stored.confirmations, plan.confirmation);
  const observationStatuses = plan.observations.map((record) => classify(stored.observations, record));
  const observations = {
    total: observationStatuses.length,
    new: observationStatuses.filter((status) => status === "new").length,
    existing: observationStatuses.filter((status) => status === "existing").length,
    conflict: observationStatuses.filter((status) => status === "conflict").length,
  };
  const counts = {
    total: observations.total + 2,
    new: observations.new + Number(batch === "new") + Number(confirmation === "new"),
    existing: observations.existing + Number(batch === "existing") + Number(confirmation === "existing"),
    conflict: observations.conflict + Number(batch === "conflict") + Number(confirmation === "conflict"),
  };
  const conflicts: LegacyImportConflict[] = [];
  if (batch === "conflict") conflicts.push({ kind: "batch", id: plan.batch.id });
  plan.observations.forEach((record, index) => { if (observationStatuses[index] === "conflict") conflicts.push({ kind: "observation", id: record.id }); });
  if (confirmation === "conflict") conflicts.push({ kind: "confirmation", id: plan.confirmation.id });

  const rolledBack = has(stored.rollbacks, plan.batchId);
  const state: LegacyImportState = rolledBack ? "rolled-back" : counts.conflict > 0 ? "conflict" : counts.new === counts.total ? "new" : counts.new === 0 ? "already-imported" : "partial";
  const canConfirm = (state === "new" || state === "partial") && !plan.tooLarge;
  const preview: LegacyImportPreview = {
    batchId: plan.batchId,
    state,
    counts,
    records: { batch, confirmation, observations },
    conflicts: conflicts.slice(0, MAX_REPORTED_CONFLICTS),
    conflictCount: conflicts.length,
    observationCount: plan.observationCount,
    setCount: plan.setCount,
    estimatedBytes: plan.estimatedBytes,
    tooLarge: plan.tooLarge,
    canConfirm,
    rollbackAvailable: state === "already-imported" && verifyStoredLegacyImport(plan.ownerId, plan.batchId, stored).ok,
  };

  if (state === "rolled-back") return { status: "rolled-back", writes: [], preview };
  if (state === "conflict") return { status: "conflict", writes: [], preview };
  if (plan.tooLarge) return { status: "too-large", writes: [], preview };
  if (state === "already-imported") return { status: "already-imported", writes: [], preview };
  const writes = [
    ...plan.observations.filter((_, index) => observationStatuses[index] === "new"),
    ...(batch === "new" ? [plan.batch] : []),
    ...(confirmation === "new" ? [plan.confirmation] : []),
  ];
  return { status: "ready", writes, preview };
}

export function previewLegacyDurableImport(plan: LegacyImportPlan, stored: StoredLegacyImportRecords): LegacyImportPreview {
  return planLegacyImportWrites(plan, stored).preview;
}

// ---- Rollback ----------------------------------------------------------------------------------

export type LegacyRollbackPlan =
  | { ok: true; status: "create" | "already-rolled-back"; receipt: LegacyImportRecord; plan: LegacyImportPlan }
  | { ok: false; code: LegacyVerifyFailureCode | "rollback-conflict"; message: string };

/** Soft rollback is a single create-only tombstone, planned only after the whole import re-verifies unchanged. */
export function planLegacyRollback(ownerId: string, batchId: string, stored: StoredLegacyImportRecords): LegacyRollbackPlan {
  const verified = verifyStoredLegacyImport(ownerId, batchId, stored);
  if (!verified.ok) return verified;
  const receipt: LegacyImportRecord = {
    collection: LEGACY_IMPORT_COLLECTIONS.rollbacks,
    id: batchId,
    data: rollbackData(ownerId, batchId, verified.plan.contentHash, verified.plan.observationCount),
  };
  if (!has(stored.rollbacks, batchId)) return { ok: true, status: "create", receipt, plan: verified.plan };
  if (canonicalEquals(stored.rollbacks[batchId], receipt.data)) return { ok: true, status: "already-rolled-back", receipt, plan: verified.plan };
  return { ok: false, code: "rollback-conflict", message: "A different rollback receipt already exists for this batch." };
}

// ---- Readback ----------------------------------------------------------------------------------

export type LegacyStoredImport = {
  batchId: string;
  document: LegacyObservationDocument;
  observationCount: number;
  setCount: number;
  rollbackAvailable: true;
};
export type LegacyReadbackIssue = { batchId: string; code: LegacyVerifyFailureCode; message: string };
export type LegacyReadback = {
  imports: LegacyStoredImport[];
  rolledBack: Array<{ batchId: string; sourceLabel: string | null }>;
  issues: LegacyReadbackIssue[];
};

export const emptyStoredLegacyImportRecords = (): StoredLegacyImportRecords => ({ batches: {}, observations: {}, confirmations: {}, rollbacks: {} });

/** Rebuilds only batches that verify intact and are not rolled back; everything else is reported, never trended. */
export function reconstructLegacyImports(ownerId: string, stored: StoredLegacyImportRecords): LegacyReadback {
  const readback: LegacyReadback = { imports: [], rolledBack: [], issues: [] };
  for (const batchId of Object.keys(stored.batches).sort()) {
    if (has(stored.rollbacks, batchId)) {
      const rawBatch = stored.batches[batchId];
      readback.rolledBack.push({ batchId, sourceLabel: isRecord(rawBatch) && typeof rawBatch.sourceLabel === "string" ? rawBatch.sourceLabel : null });
      continue;
    }
    const verified = verifyStoredLegacyImport(ownerId, batchId, stored);
    if (verified.ok) {
      readback.imports.push({ batchId, document: verified.plan.document, observationCount: verified.plan.observationCount, setCount: verified.plan.setCount, rollbackAvailable: true });
    } else {
      readback.issues.push({ batchId, code: verified.code, message: verified.message });
    }
  }
  for (const batchId of Object.keys(stored.confirmations).sort()) {
    if (!has(stored.batches, batchId) && !has(stored.rollbacks, batchId)) {
      readback.issues.push({ batchId, code: "missing-batch", message: "A confirmation receipt has no matching import batch." });
    }
  }
  return readback;
}
