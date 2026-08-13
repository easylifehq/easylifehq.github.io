export const SYNTHETIC_AUDIT_STATE_VERSION = 1;
export const SYNTHETIC_AUDIT_STATE_PREFIX = "easylife:synthetic-audit-state";

export type SyntheticReviewMode = "loopback-demo" | "audit";
export type RevisionedSyntheticEnvelope = {
  version: typeof SYNTHETIC_AUDIT_STATE_VERSION;
  revision: number;
};

export function getSyntheticAuditStateStorageKey(input: { hostname: string; mode: SyntheticReviewMode }) {
  const hostname = input.hostname.trim().toLocaleLowerCase("en-US");
  if (!hostname || /[^a-z0-9.:[\]-]/.test(hostname)) throw new Error("Synthetic state requires a valid runtime hostname.");
  return `${SYNTHETIC_AUDIT_STATE_PREFIX}:v${SYNTHETIC_AUDIT_STATE_VERSION}:${input.mode}:${hostname}`;
}

export function commitSyntheticEnvelope<T extends RevisionedSyntheticEnvelope>(
  storage: Pick<Storage, "setItem">,
  key: string,
  current: T,
  updater: (current: T) => T,
) {
  const next = {
    ...updater(current),
    version: SYNTHETIC_AUDIT_STATE_VERSION,
    revision: current.revision + 1,
  } as T;
  // This must finish before in-memory state changes or a caller announces success.
  storage.setItem(key, JSON.stringify(next));
  return next;
}
