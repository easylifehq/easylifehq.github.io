import { db } from "@/lib/firebase/client";
import type { LegacyImportCollectionKey, StoredLegacyImportRecords } from "@/features/easyworkout/domain/legacyWorkoutDurableImport";
import {
  confirmLegacyImportTransaction,
  rollbackLegacyImportTransaction,
  subscribeToLegacyImportCollection,
  subscribeToStoredLegacyImportRecords,
} from "./legacyWorkoutImportTransactions";

export { LegacyImportError } from "./legacyWorkoutImportTransactions";
export type { LegacyImportOutcome, LegacyRollbackOutcome } from "./legacyWorkoutImportTransactions";
export type { StoredLegacyImportRecords };

export function subscribeToLegacyWorkoutImports(userId: string, callback: (stored: StoredLegacyImportRecords) => void, onError?: (error: Error) => void) {
  return subscribeToStoredLegacyImportRecords(db, userId, callback, onError);
}

const exportSubscription = (key: LegacyImportCollectionKey) => (userId: string, callback: (records: Array<Record<string, unknown>>) => void, onError?: (error: Error) => void) =>
  subscribeToLegacyImportCollection(db, userId, key, callback, onError);

export const subscribeToLegacyImportBatches = exportSubscription("batches");
export const subscribeToLegacyImportObservations = exportSubscription("observations");
export const subscribeToLegacyImportReceipts = exportSubscription("confirmations");
export const subscribeToLegacyImportRollbacks = exportSubscription("rollbacks");

export function confirmLegacyWorkoutImport(userId: string, document: unknown) {
  return confirmLegacyImportTransaction(db, userId, document);
}

export function rollbackLegacyWorkoutImport(userId: string, batchId: string) {
  return rollbackLegacyImportTransaction(db, userId, batchId);
}
