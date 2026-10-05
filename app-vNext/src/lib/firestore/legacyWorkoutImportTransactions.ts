import { collection, doc, getDocs, onSnapshot, runTransaction, type Firestore } from "firebase/firestore";
import {
  LEGACY_IMPORT_COLLECTIONS,
  buildLegacyImportPlan,
  emptyStoredLegacyImportRecords,
  legacyRollbackReadIds,
  planLegacyImportWrites,
  planLegacyRollback,
  type LegacyImportCollectionKey,
  type LegacyImportConflict,
  type LegacyVerifyFailureCode,
  type StoredLegacyImportRecords,
} from "../../features/easyworkout/domain/legacyWorkoutDurableImport.ts";

export type LegacyImportErrorCode = "invalid" | "conflict" | "rolled-back" | "too-large" | "rollback-conflict" | LegacyVerifyFailureCode;

export class LegacyImportError extends Error {
  code: LegacyImportErrorCode;
  conflicts: LegacyImportConflict[];
  constructor(code: LegacyImportErrorCode, message: string, conflicts: LegacyImportConflict[] = []) {
    super(message);
    this.name = "LegacyImportError";
    this.code = code;
    this.conflicts = conflicts;
  }
}

export type LegacyImportOutcome = { batchId: string; status: "imported" | "already-imported"; created: number; existing: number };
export type LegacyRollbackOutcome = { batchId: string; status: "rolled-back" | "already-rolled-back" };

const COLLECTION_KEYS = Object.keys(LEGACY_IMPORT_COLLECTIONS) as LegacyImportCollectionKey[];
const legacyCollection = (db: Firestore, ownerId: string, key: LegacyImportCollectionKey) => collection(db, "users", ownerId, LEGACY_IMPORT_COLLECTIONS[key]);

/**
 * One atomic transaction: re-read every deterministic record, create only the missing ones, accept canonically
 * equivalent existing ones, and abort the whole import on any conflict. Existing documents are never written.
 * The plan is built (and the 450-observation limit enforced) before the transaction starts, so an oversized file
 * never reads or writes. Each read document is either written or verified, so a commit carries at most
 * observations + 3 mutations, inside Firestore's 500-write transaction cap.
 */
export async function confirmLegacyImportTransaction(db: Firestore, ownerId: string, input: unknown): Promise<LegacyImportOutcome> {
  const built = buildLegacyImportPlan(ownerId, input);
  if (!built.ok) throw new LegacyImportError("invalid", built.errors[0]?.message ?? "The legacy document is not valid.");
  const { plan } = built;
  return runTransaction(db, async (transaction) => {
    const stored = emptyStoredLegacyImportRecords();
    const read = async (key: LegacyImportCollectionKey, id: string) => {
      const snapshot = await transaction.get(doc(legacyCollection(db, ownerId, key), id));
      if (snapshot.exists()) stored[key][id] = snapshot.data();
    };
    await Promise.all([
      read("batches", plan.batchId),
      read("confirmations", plan.batchId),
      read("rollbacks", plan.batchId),
      ...plan.observations.map((record) => read("observations", record.id)),
    ]);
    const planned = planLegacyImportWrites(plan, stored);
    if (planned.status === "rolled-back") throw new LegacyImportError("rolled-back", "This source was rolled back and cannot be imported again. Use a new source key for a corrected file.");
    if (planned.status === "conflict") throw new LegacyImportError("conflict", `${planned.preview.conflictCount} stored record(s) differ from this file. Nothing was written.`, planned.preview.conflicts);
    if (planned.status === "too-large") throw new LegacyImportError("too-large", "This file is too large to import in one safe transaction.");
    for (const write of planned.writes) {
      const key = COLLECTION_KEYS.find((candidate) => LEGACY_IMPORT_COLLECTIONS[candidate] === write.collection) as LegacyImportCollectionKey;
      transaction.set(doc(legacyCollection(db, ownerId, key), write.id), write.data);
    }
    return {
      batchId: plan.batchId,
      status: planned.writes.length === 0 ? "already-imported" : "imported",
      created: planned.writes.length,
      existing: planned.preview.counts.total - planned.writes.length,
    } as LegacyImportOutcome;
  });
}

/**
 * Soft rollback: re-read the batch, every observation and the confirmation receipt, prove they are canonically
 * unchanged, then create only the immutable rollback tombstone. Provenance documents are never touched. The SDK
 * adds a verify mutation for each read-only document (at most 450 + 3 here); batches claiming more observations
 * are refused before any observation is read.
 */
export async function rollbackLegacyImportTransaction(db: Firestore, ownerId: string, batchId: string): Promise<LegacyRollbackOutcome> {
  return runTransaction(db, async (transaction) => {
    const stored = emptyStoredLegacyImportRecords();
    const read = async (key: LegacyImportCollectionKey, id: string) => {
      const snapshot = await transaction.get(doc(legacyCollection(db, ownerId, key), id));
      if (snapshot.exists()) stored[key][id] = snapshot.data();
    };
    await Promise.all([read("batches", batchId), read("confirmations", batchId), read("rollbacks", batchId)]);
    const observationIds = legacyRollbackReadIds(stored.batches[batchId]);
    if (observationIds) await Promise.all(observationIds.map((id) => read("observations", id)));
    const planned = planLegacyRollback(ownerId, batchId, stored);
    if (!planned.ok) throw new LegacyImportError(planned.code, planned.message);
    if (planned.status === "create") transaction.set(doc(legacyCollection(db, ownerId, "rollbacks"), planned.receipt.id), planned.receipt.data);
    return { batchId, status: planned.status === "create" ? "rolled-back" : "already-rolled-back" } as LegacyRollbackOutcome;
  });
}

export async function readStoredLegacyImportRecords(db: Firestore, ownerId: string): Promise<StoredLegacyImportRecords> {
  const stored = emptyStoredLegacyImportRecords();
  await Promise.all(COLLECTION_KEYS.map(async (key) => {
    for (const snapshot of (await getDocs(legacyCollection(db, ownerId, key))).docs) stored[key][snapshot.id] = snapshot.data();
  }));
  return stored;
}

/** Emits only once all four collections have reported, then again on every change. */
export function subscribeToStoredLegacyImportRecords(
  db: Firestore,
  ownerId: string,
  callback: (stored: StoredLegacyImportRecords) => void,
  onError?: (error: Error) => void,
) {
  const current = emptyStoredLegacyImportRecords();
  const ready = new Set<LegacyImportCollectionKey>();
  const unsubscribers = COLLECTION_KEYS.map((key) => onSnapshot(
    legacyCollection(db, ownerId, key),
    (snapshot) => {
      current[key] = Object.fromEntries(snapshot.docs.map((entry) => [entry.id, entry.data()]));
      ready.add(key);
      if (ready.size === COLLECTION_KEYS.length) callback({ batches: current.batches, observations: current.observations, confirmations: current.confirmations, rollbacks: current.rollbacks });
    },
    onError,
  ));
  return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
}

/** Raw `{ id, ...data }` records for one legacy collection, used by whole-account export. */
export function subscribeToLegacyImportCollection(
  db: Firestore,
  ownerId: string,
  key: LegacyImportCollectionKey,
  callback: (records: Array<Record<string, unknown>>) => void,
  onError?: (error: Error) => void,
) {
  return onSnapshot(
    legacyCollection(db, ownerId, key),
    (snapshot) => callback(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })).sort((left, right) => left.id.localeCompare(right.id))),
    onError,
  );
}
