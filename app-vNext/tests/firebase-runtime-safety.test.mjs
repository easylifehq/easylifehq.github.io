import test from "node:test";
import assert from "node:assert/strict";
import { resolveFirestoreRuntimeTarget } from "../src/lib/firebase/runtimeSafety.ts";

test("loopback demo and visual QA routes fail closed to the Firestore emulator", () => {
  assert.deepEqual(resolveFirestoreRuntimeTarget({ hostname: "127.0.0.1", search: "?demo=1" }), {
    kind: "emulator", host: "127.0.0.1", port: 8088, reason: "loopback-demo",
  });
  assert.equal(resolveFirestoreRuntimeTarget({ hostname: "localhost", search: "?visualQa=1" }).kind, "emulator");
});

test("a demo query on the deployed hostname never enables demo Firebase access", () => {
  assert.deepEqual(resolveFirestoreRuntimeTarget({ hostname: "easylifehq.github.io", search: "?demo=1" }), {
    kind: "configured-project",
  });
  assert.equal(resolveFirestoreRuntimeTarget({ hostname: "localhost", search: "" }).kind, "configured-project");
});

test("automated Firebase access accepts only an explicit loopback emulator", () => {
  assert.deepEqual(resolveFirestoreRuntimeTarget({ hostname: "", search: "", explicitEmulatorHost: "localhost:8088" }), {
    kind: "emulator", host: "127.0.0.1", port: 8088, reason: "explicit-test",
  });
  assert.throws(() => resolveFirestoreRuntimeTarget({ hostname: "", search: "", explicitEmulatorHost: "firestore.googleapis.com:443" }), /loopback host/);
});
