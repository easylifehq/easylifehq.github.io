import test from "node:test";
import assert from "node:assert/strict";

const lifecycle = await import("../src/features/experiments/domain/universalCaptureDraft.ts").catch(() => ({}));
const implemented = [
  "universalCaptureDraftStorageKey",
  "persistUniversalCaptureDraft",
  "recoverUniversalCaptureDraft",
  "removeUniversalCaptureDraft",
  "quarantineLegacyUniversalCaptureDraft",
  "hasQuarantinedLegacyUniversalCaptureDraft",
  "UniversalCaptureOwnerScope",
].every((name) => typeof lifecycle[name] === "function");

class MemoryStorage {
  constructor(entries = [], options = {}) {
    this.values = new Map(entries);
    this.options = options;
  }

  get length() {
    return this.values.size;
  }

  key(index) {
    return Array.from(this.values.keys())[index] ?? null;
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    if (this.options.failSetFor === key) throw new Error("quota blocked");
    this.values.set(key, this.options.corruptSetFor === key ? `${value}-corrupt` : String(value));
  }

  removeItem(key) {
    if (this.options.failRemoveFor === key) throw new Error("remove blocked");
    this.values.delete(key);
  }
}

const draft = {
  mode: "note",
  text: "Account A private capture",
  details: { notes: "private details", date: "2026-10-03" },
};

test("universal capture exposes an owner-scoped draft and quarantine boundary", () => {
  assert.equal(implemented, true);
  assert.equal(lifecycle.UNIVERSAL_CAPTURE_LEGACY_DRAFT_KEY, "easylife.quickAddDraft");
  assert.equal(lifecycle.UNIVERSAL_CAPTURE_QUARANTINE_KEY, "easylife.quickAddDraft.quarantine.v1");
});

test("account A draft survives reload for A and is never restored for B", { skip: !implemented }, () => {
  const storage = new MemoryStorage();
  assert.equal(lifecycle.persistUniversalCaptureDraft(storage, "user-a", draft), true);
  const storedKey = lifecycle.universalCaptureDraftStorageKey("user-a");
  assert.match(storedKey, /user-a$/);
  assert.deepEqual(lifecycle.recoverUniversalCaptureDraft(storage, "user-a"), {
    schemaVersion: 2,
    ownerId: "user-a",
    ...draft,
  });
  assert.equal(lifecycle.recoverUniversalCaptureDraft(storage, "user-b"), null);

  const reloadedScope = new lifecycle.UniversalCaptureOwnerScope();
  assert.equal(reloadedScope.transition("user-a"), true);
  assert.deepEqual(lifecycle.recoverUniversalCaptureDraft(storage, reloadedScope.ownerId), {
    schemaVersion: 2,
    ownerId: "user-a",
    ...draft,
  });
});

test("owner transitions cover loading, logout, A to B, and repeated auth events", { skip: !implemented }, () => {
  const scope = new lifecycle.UniversalCaptureOwnerScope();
  assert.equal(scope.transition(""), false);
  assert.equal(scope.transition("user-a"), true);
  const accountAToken = scope.issueToken("user-a");
  assert.ok(accountAToken);
  assert.equal(scope.transition("user-a"), false);
  assert.equal(scope.isCurrent(accountAToken), true);

  assert.equal(scope.transition(""), true, "auth loading/logout clears the active owner");
  assert.equal(scope.ownerId, "");
  assert.equal(scope.isCurrent(accountAToken), false);
  assert.equal(scope.transition("user-b"), true);
  assert.equal(scope.issueToken("user-a"), null);
  const accountBToken = scope.issueToken("user-b");
  assert.ok(accountBToken);
  assert.equal(scope.isCurrent(accountBToken), true);
});

test("a stale async response from A cannot mutate B's capture epoch", { skip: !implemented }, () => {
  const scope = new lifecycle.UniversalCaptureOwnerScope();
  scope.transition("user-a");
  const accountARequest = scope.issueToken("user-a");
  scope.transition("user-b");
  const accountBRequest = scope.issueToken("user-b");

  assert.equal(scope.isCurrent(accountARequest), false);
  assert.equal(scope.isCurrent(accountBRequest), true);
  assert.equal(scope.transition("user-b"), false, "a repeated B auth event preserves B's epoch");
  assert.equal(scope.isCurrent(accountBRequest), true);
});

test("render scope is suspended before an owner transition effect can clear prior state", () => {
  assert.equal(typeof lifecycle.isUniversalCaptureDraftScopeReady, "function");
  assert.equal(lifecycle.isUniversalCaptureDraftScopeReady("user-a", "user-a"), true);
  assert.equal(lifecycle.isUniversalCaptureDraftScopeReady("user-b", "user-a"), false);
  assert.equal(lifecycle.isUniversalCaptureDraftScopeReady("", "user-a"), false);
  assert.equal(lifecycle.isUniversalCaptureDraftScopeReady("user-b", "user-b"), true);
});

test("legacy unowned bytes copy to neutral quarantine without becoming any owner's draft", { skip: !implemented }, () => {
  const legacyBytes = JSON.stringify(draft);
  const storage = new MemoryStorage([[lifecycle.UNIVERSAL_CAPTURE_LEGACY_DRAFT_KEY, legacyBytes]]);
  assert.deepEqual(lifecycle.quarantineLegacyUniversalCaptureDraft(storage), {
    hasQuarantinedLegacyDraft: true,
    moved: false,
    sourceRetained: true,
  });
  assert.equal(storage.getItem(lifecycle.UNIVERSAL_CAPTURE_LEGACY_DRAFT_KEY), legacyBytes);
  assert.equal(storage.getItem(lifecycle.UNIVERSAL_CAPTURE_QUARANTINE_KEY), legacyBytes);
  assert.equal(lifecycle.recoverUniversalCaptureDraft(storage, "user-a"), null);
  assert.equal(lifecycle.recoverUniversalCaptureDraft(storage, "user-b"), null);
  assert.equal(lifecycle.hasQuarantinedLegacyUniversalCaptureDraft(storage), true);
  assert.equal(typeof lifecycle.claimQuarantinedUniversalCaptureDraft, "undefined");
});

test("quarantine keeps original bytes when copy or removal cannot be verified", { skip: !implemented }, () => {
  const legacyBytes = JSON.stringify(draft);
  for (const storage of [
    new MemoryStorage([[lifecycle.UNIVERSAL_CAPTURE_LEGACY_DRAFT_KEY, legacyBytes]], { failSetFor: lifecycle.UNIVERSAL_CAPTURE_QUARANTINE_KEY }),
    new MemoryStorage([[lifecycle.UNIVERSAL_CAPTURE_LEGACY_DRAFT_KEY, legacyBytes]], { corruptSetFor: lifecycle.UNIVERSAL_CAPTURE_QUARANTINE_KEY }),
    new MemoryStorage([[lifecycle.UNIVERSAL_CAPTURE_LEGACY_DRAFT_KEY, legacyBytes]], { failRemoveFor: lifecycle.UNIVERSAL_CAPTURE_LEGACY_DRAFT_KEY }),
  ]) {
    assert.deepEqual(lifecycle.quarantineLegacyUniversalCaptureDraft(storage), {
      hasQuarantinedLegacyDraft: true,
      moved: false,
      sourceRetained: true,
    });
    assert.equal(storage.getItem(lifecycle.UNIVERSAL_CAPTURE_LEGACY_DRAFT_KEY), legacyBytes);
  }
});

test("quarantine leaves legacy bytes untouched and shows a neutral notice when source reads fail", { skip: !implemented }, () => {
  const legacyBytes = JSON.stringify(draft);
  class SourceReadUnavailableStorage extends MemoryStorage {
    getItem(key) {
      if (key === lifecycle.UNIVERSAL_CAPTURE_LEGACY_DRAFT_KEY) throw new Error("source read unavailable");
      return super.getItem(key);
    }
  }

  const storage = new SourceReadUnavailableStorage([
    [lifecycle.UNIVERSAL_CAPTURE_LEGACY_DRAFT_KEY, legacyBytes],
  ]);
  assert.deepEqual(lifecycle.quarantineLegacyUniversalCaptureDraft(storage), {
    hasQuarantinedLegacyDraft: true,
    moved: false,
    sourceRetained: true,
  });
  assert.equal(storage.values.get(lifecycle.UNIVERSAL_CAPTURE_LEGACY_DRAFT_KEY), legacyBytes);
});

test("quarantine retains a concurrent legacy write observed during copy verification", { skip: !implemented }, () => {
  const legacyBytes = JSON.stringify(draft);
  const newerBytes = JSON.stringify({ ...draft, text: "Newer tab capture" });
  class ConcurrentWriteBeforeRemoveStorage extends MemoryStorage {
    getItem(key) {
      const value = super.getItem(key);
      if (
        key === lifecycle.UNIVERSAL_CAPTURE_QUARANTINE_KEY &&
        value === legacyBytes &&
        !this.hasWrittenNewerValue
      ) {
        this.hasWrittenNewerValue = true;
        this.values.set(lifecycle.UNIVERSAL_CAPTURE_LEGACY_DRAFT_KEY, newerBytes);
      }
      return value;
    }
  }

  const storage = new ConcurrentWriteBeforeRemoveStorage([
    [lifecycle.UNIVERSAL_CAPTURE_LEGACY_DRAFT_KEY, legacyBytes],
  ]);
  assert.deepEqual(lifecycle.quarantineLegacyUniversalCaptureDraft(storage), {
    hasQuarantinedLegacyDraft: true,
    moved: false,
    sourceRetained: true,
  });
  assert.equal(storage.getItem(lifecycle.UNIVERSAL_CAPTURE_LEGACY_DRAFT_KEY), newerBytes);
  assert.equal(storage.getItem(lifecycle.UNIVERSAL_CAPTURE_QUARANTINE_KEY), legacyBytes);
});

test("quarantine never attempts a non-atomic legacy-source removal", { skip: !implemented }, () => {
  const legacyBytes = JSON.stringify(draft);
  const newerBytes = JSON.stringify({ ...draft, text: "Newer tab capture" });
  class DeleteWouldRaceStorage extends MemoryStorage {
    removeItem(key) {
      this.removeCalls = (this.removeCalls || 0) + 1;
      if (key === lifecycle.UNIVERSAL_CAPTURE_LEGACY_DRAFT_KEY) {
        this.values.set(key, newerBytes);
      }
      super.removeItem(key);
    }
  }

  const storage = new DeleteWouldRaceStorage([
    [lifecycle.UNIVERSAL_CAPTURE_LEGACY_DRAFT_KEY, legacyBytes],
  ]);
  assert.deepEqual(lifecycle.quarantineLegacyUniversalCaptureDraft(storage), {
    hasQuarantinedLegacyDraft: true,
    moved: false,
    sourceRetained: true,
  });
  assert.equal(storage.removeCalls || 0, 0);
  assert.equal(storage.getItem(lifecycle.UNIVERSAL_CAPTURE_LEGACY_DRAFT_KEY), legacyBytes);
  assert.equal(storage.getItem(lifecycle.UNIVERSAL_CAPTURE_QUARANTINE_KEY), legacyBytes);
});

test("owner-scoped persistence failures leave prior bytes recoverable", { skip: !implemented }, () => {
  const key = lifecycle.universalCaptureDraftStorageKey("user-a");
  const prior = JSON.stringify({ schemaVersion: 2, ownerId: "user-a", ...draft });
  const storage = new MemoryStorage([[key, prior]], { failSetFor: key });
  assert.equal(lifecycle.persistUniversalCaptureDraft(storage, "user-a", { ...draft, text: "replacement" }), false);
  assert.equal(storage.getItem(key), prior);
  assert.deepEqual(lifecycle.recoverUniversalCaptureDraft(storage, "user-a"), JSON.parse(prior));
});

test("only the matching owner key is removed after a confirmed save", { skip: !implemented }, () => {
  const storage = new MemoryStorage();
  lifecycle.persistUniversalCaptureDraft(storage, "user-a", draft);
  lifecycle.persistUniversalCaptureDraft(storage, "user-b", { ...draft, text: "B draft" });
  assert.equal(lifecycle.removeUniversalCaptureDraft(storage, "user-a"), true);
  assert.equal(lifecycle.recoverUniversalCaptureDraft(storage, "user-a"), null);
  assert.equal(lifecycle.recoverUniversalCaptureDraft(storage, "user-b").text, "B draft");
});

test("Universal Capture never renders owner-bound state while its owner scope is stale", async () => {
  const componentSource = await import("node:fs/promises").then(({ readFile }) =>
    readFile(new URL("../src/features/experiments/UniversalCapture.tsx", import.meta.url), "utf8")
  );
  assert.match(
    componentSource,
    /if \(!isUniversalCaptureDraftScopeReady\(activeUserId, draftOwnerId\)\) return null;[\s\S]{0,120}return \(/
  );
});
