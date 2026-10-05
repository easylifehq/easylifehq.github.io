export const UNIVERSAL_CAPTURE_LEGACY_DRAFT_KEY = "easylife.quickAddDraft";
export const UNIVERSAL_CAPTURE_QUARANTINE_KEY = "easylife.quickAddDraft.quarantine.v1";
const UNIVERSAL_CAPTURE_DRAFT_PREFIX = "easylife.quickAddDraft.v2";
const UNIVERSAL_CAPTURE_DRAFT_SCHEMA_VERSION = 2 as const;

export const UNIVERSAL_CAPTURE_MODES = [
  "raw",
  "task",
  "brainDump",
  "note",
  "event",
  "application",
  "contact",
  "project",
  "workout",
] as const;

export type UniversalCaptureMode = (typeof UNIVERSAL_CAPTURE_MODES)[number];

export type UniversalCaptureDraftInput = {
  mode: UniversalCaptureMode;
  text: string;
  details: Record<string, unknown>;
};

export type StoredUniversalCaptureDraft = UniversalCaptureDraftInput & {
  schemaVersion: typeof UNIVERSAL_CAPTURE_DRAFT_SCHEMA_VERSION;
  ownerId: string;
};

export type UniversalCaptureOwnerToken = {
  ownerId: string;
  epoch: number;
};

type CaptureStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readStorage(storage: CaptureStorage, key: string) {
  try {
    return { ok: true as const, value: storage.getItem(key) };
  } catch {
    return { ok: false as const, value: null };
  }
}

function normalizeDraft(value: unknown, ownerId: string): StoredUniversalCaptureDraft | null {
  if (!isRecord(value)) return null;
  if (value.schemaVersion !== UNIVERSAL_CAPTURE_DRAFT_SCHEMA_VERSION || value.ownerId !== ownerId) return null;
  if (!UNIVERSAL_CAPTURE_MODES.includes(value.mode as UniversalCaptureMode)) return null;
  if (typeof value.text !== "string" || !isRecord(value.details)) return null;
  return {
    schemaVersion: UNIVERSAL_CAPTURE_DRAFT_SCHEMA_VERSION,
    ownerId,
    mode: value.mode as UniversalCaptureMode,
    text: value.text,
    details: value.details,
  };
}

export function universalCaptureDraftStorageKey(ownerId: string) {
  const normalizedOwnerId = ownerId.trim();
  if (!normalizedOwnerId) throw new Error("An authenticated owner is required for a capture draft.");
  return `${UNIVERSAL_CAPTURE_DRAFT_PREFIX}:${encodeURIComponent(normalizedOwnerId)}`;
}

export function isUniversalCaptureDraftScopeReady(activeUserId: string, draftOwnerId: string) {
  const normalizedActiveUserId = activeUserId.trim();
  return Boolean(normalizedActiveUserId && normalizedActiveUserId === draftOwnerId.trim());
}

export function persistUniversalCaptureDraft(
  storage: CaptureStorage,
  ownerId: string,
  input: UniversalCaptureDraftInput
) {
  const key = universalCaptureDraftStorageKey(ownerId);
  const serialized = JSON.stringify({
    schemaVersion: UNIVERSAL_CAPTURE_DRAFT_SCHEMA_VERSION,
    ownerId: ownerId.trim(),
    mode: input.mode,
    text: input.text,
    details: input.details,
  } satisfies StoredUniversalCaptureDraft);
  try {
    storage.setItem(key, serialized);
    return storage.getItem(key) === serialized;
  } catch {
    return false;
  }
}

export function recoverUniversalCaptureDraft(storage: CaptureStorage, ownerId: string) {
  const stored = readStorage(storage, universalCaptureDraftStorageKey(ownerId));
  if (!stored.ok || !stored.value) return null;
  try {
    return normalizeDraft(JSON.parse(stored.value), ownerId.trim());
  } catch {
    return null;
  }
}

export function removeUniversalCaptureDraft(storage: CaptureStorage, ownerId: string) {
  const key = universalCaptureDraftStorageKey(ownerId);
  try {
    storage.removeItem(key);
    return storage.getItem(key) === null;
  } catch {
    return false;
  }
}

export function hasQuarantinedLegacyUniversalCaptureDraft(storage: CaptureStorage) {
  const legacy = readStorage(storage, UNIVERSAL_CAPTURE_LEGACY_DRAFT_KEY);
  const quarantine = readStorage(storage, UNIVERSAL_CAPTURE_QUARANTINE_KEY);
  return (legacy.ok && legacy.value !== null) || (quarantine.ok && quarantine.value !== null);
}

export function quarantineLegacyUniversalCaptureDraft(storage: CaptureStorage) {
  const legacy = readStorage(storage, UNIVERSAL_CAPTURE_LEGACY_DRAFT_KEY);
  const quarantine = readStorage(storage, UNIVERSAL_CAPTURE_QUARANTINE_KEY);
  const hasQuarantinedLegacyDraft =
    (legacy.ok && legacy.value !== null) || (quarantine.ok && quarantine.value !== null);
  if (!legacy.ok) {
    return { hasQuarantinedLegacyDraft: true, moved: false, sourceRetained: true };
  }
  if (legacy.value === null) {
    return { hasQuarantinedLegacyDraft, moved: false, sourceRetained: false };
  }

  if (!quarantine.ok || (quarantine.value !== null && quarantine.value !== legacy.value)) {
    return { hasQuarantinedLegacyDraft: true, moved: false, sourceRetained: true };
  }

  try {
    if (quarantine.value === null) {
      storage.setItem(UNIVERSAL_CAPTURE_QUARANTINE_KEY, legacy.value);
      if (storage.getItem(UNIVERSAL_CAPTURE_QUARANTINE_KEY) !== legacy.value) {
        return { hasQuarantinedLegacyDraft: true, moved: false, sourceRetained: true };
      }
    }
    // localStorage cannot atomically compare and delete across tabs, so the unowned source stays untouched.
    return { hasQuarantinedLegacyDraft: true, moved: false, sourceRetained: true };
  } catch {
    return { hasQuarantinedLegacyDraft: true, moved: false, sourceRetained: true };
  }
}

export class UniversalCaptureOwnerScope {
  ownerId = "";
  private epoch = 0;

  transition(ownerId: string) {
    const nextOwnerId = ownerId.trim();
    if (nextOwnerId === this.ownerId) return false;
    this.ownerId = nextOwnerId;
    this.epoch += 1;
    return true;
  }

  issueToken(ownerId: string): UniversalCaptureOwnerToken | null {
    const normalizedOwnerId = ownerId.trim();
    if (!normalizedOwnerId || normalizedOwnerId !== this.ownerId) return null;
    return { ownerId: normalizedOwnerId, epoch: this.epoch };
  }

  isCurrent(token: UniversalCaptureOwnerToken | null | undefined) {
    return Boolean(token && token.ownerId === this.ownerId && token.epoch === this.epoch);
  }
}
