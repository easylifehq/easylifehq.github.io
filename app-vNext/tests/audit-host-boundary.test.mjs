import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  AUDIT_PAGES_PROJECT_HOSTNAME,
  isAuditPagesHostname,
  isLoopbackRuntimeHostname,
  normalizeRuntimeHostname,
  resolveReviewRuntimeMode,
} from "../src/lib/runtime/reviewRuntime.ts";
import { resolveFirestoreRuntimeTarget } from "../src/lib/firebase/runtimeSafety.ts";

const previewHostname = `7414332d.${AUDIT_PAGES_PROJECT_HOSTNAME}`;
const branchHostname = `audit-7414332d.${AUDIT_PAGES_PROJECT_HOSTNAME}`;

test("the exact audit Pages project and genuine one-label deployment hosts are recognized", () => {
  assert.equal(isAuditPagesHostname(AUDIT_PAGES_PROJECT_HOSTNAME), true);
  assert.equal(isAuditPagesHostname(previewHostname), true);
  assert.equal(isAuditPagesHostname(branchHostname), true);
  assert.equal(isAuditPagesHostname(AUDIT_PAGES_PROJECT_HOSTNAME.toUpperCase()), true);
  assert.equal(normalizeRuntimeHostname(AUDIT_PAGES_PROJECT_HOSTNAME.toUpperCase()), AUDIT_PAGES_PROJECT_HOSTNAME);
});

test("production, arbitrary Pages projects, lookalikes, nested labels, and trailing dots are rejected", () => {
  for (const hostname of [
    "easylifehq.com",
    "www.easylifehq.com",
    "easylifehq.github.io",
    "another-project.pages.dev",
    "easylife-wave10-1-audit.pages.dev.evil.example",
    "evil-easylife-wave10-1-audit.pages.dev",
    "easylife-wave10-1-audit-pages.dev",
    `nested.label.${AUDIT_PAGES_PROJECT_HOSTNAME}`,
    `${AUDIT_PAGES_PROJECT_HOSTNAME}.`,
    `-invalid.${AUDIT_PAGES_PROJECT_HOSTNAME}`,
    `invalid-.${AUDIT_PAGES_PROJECT_HOSTNAME}`,
    `invalid_label.${AUDIT_PAGES_PROJECT_HOSTNAME}`,
    `é.${AUDIT_PAGES_PROJECT_HOSTNAME}`,
    ` ${AUDIT_PAGES_PROJECT_HOSTNAME}`,
  ]) {
    assert.equal(isAuditPagesHostname(hostname), false, hostname);
  }
});

test("loopback remains explicit and query-gated while public query, fragment, and storage-shaped inputs cannot activate review mode", () => {
  for (const hostname of ["localhost", "LOCALHOST", "127.0.0.1", "[::1]", "::1"]) {
    assert.equal(isLoopbackRuntimeHostname(hostname), true, hostname);
  }
  assert.equal(resolveReviewRuntimeMode({ hostname: "localhost", search: "?demo=1" }), "loopback-demo");
  assert.equal(resolveReviewRuntimeMode({ hostname: "127.0.0.1", search: "?visualQa=1" }), "loopback-demo");
  assert.equal(resolveReviewRuntimeMode({ hostname: "localhost", search: "" }), "none");
  assert.equal(resolveReviewRuntimeMode({ hostname: "localtest.me", search: "?demo=1" }), "none");
  assert.equal(resolveReviewRuntimeMode({ hostname: "easylifehq.com", search: "?demo=1#audit" }), "none");
  assert.equal(resolveReviewRuntimeMode({ hostname: "another-project.pages.dev", search: "?visualQa=1" }), "none");
  assert.equal(resolveReviewRuntimeMode({ hostname: AUDIT_PAGES_PROJECT_HOSTNAME, search: "?demo=0" }), "audit");
  assert.equal(resolveReviewRuntimeMode({ hostname: previewHostname, search: "" }), "audit");
});

test("audit hosts fail closed before any configured Firebase or explicit emulator selection", () => {
  assert.deepEqual(resolveFirestoreRuntimeTarget({ hostname: AUDIT_PAGES_PROJECT_HOSTNAME, search: "" }), {
    kind: "synthetic-audit",
    reason: "allowlisted-pages-host",
  });
  assert.deepEqual(resolveFirestoreRuntimeTarget({
    hostname: previewHostname,
    search: "?demo=0",
    explicitEmulatorHost: "localhost:8088",
  }), {
    kind: "synthetic-audit",
    reason: "allowlisted-pages-host",
  });
  assert.deepEqual(resolveFirestoreRuntimeTarget({ hostname: "easylifehq.com", search: "?demo=1" }), {
    kind: "configured-project",
  });
});

test("authentication, global capture, login containment, Firebase initialization, and the audit label share the centralized boundary", async () => {
  const [runtimeSource, authSource, captureSource, clientSource, routerSource, layoutSource] = await Promise.all([
    readFile(new URL("../src/lib/runtime/reviewRuntime.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/features/auth/AuthContext.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/features/experiments/UniversalCapture.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/lib/firebase/client.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/app/router/index.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/app/layouts/AuthenticatedLayout.tsx", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(runtimeSource, /localStorage|sessionStorage|document\.cookie|window\./);
  assert.match(authSource, /resolveReviewRuntimeMode/);
  assert.match(authSource, /reviewRuntime === "audit"/);
  assert.ok(authSource.indexOf("if (isDemoMode)") < authSource.indexOf("if (!firebaseConfigured)"));
  assert.match(captureSource, /const \{ isAuditMode \} = useAuth\(\)/);
  assert.ok(captureSource.indexOf("if (isAuditMode)") < captureSource.indexOf("onAuthStateChanged(auth"));
  assert.match(clientSource, /firestoreRuntimeTarget\.kind === "configured-project" && buildFirebaseConfigured/);
  assert.match(clientSource, /firestoreRuntimeTarget\.kind === "configured-project" \? firebaseConfig : emulatorOnlyConfig/);
  assert.match(routerSource, /function AuditOnlyRouteBoundary/);
  assert.match(routerSource, /isAuditMode && !isSyntheticAppRoute/);
  assert.match(routerSource, /pathname: "\/app\/hq", search: "", hash: ""/);
  assert.match(layoutSource, /Synthetic audit preview · local demo data only/);
});

test("service-worker navigation remains same-origin and cannot change the hostname decision", async () => {
  const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
  assert.match(source, /requestUrl\.origin !== self\.location\.origin/);
  assert.match(source, /event\.request\.mode === "navigate"/);
  assert.match(source, /caches\.match\("\/"\)/);
  assert.doesNotMatch(source, /pages\.dev|demo=1|visualQa=1/);
});

test("EasyDrinks, EasyGames, and Settings keep demo mutations synthetic or local", async () => {
  const [drinksSource, gamesSource, settingsSource] = await Promise.all([
    readFile(new URL("../src/features/easydrinks/EasyDrinksContext.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/features/easygames/EasyGamesContext.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/features/settings/SettingsContext.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(drinksSource, /if \(isDemoMode\) return `demo-shopping-/);
  assert.ok(drinksSource.indexOf("if (isDemoMode)") < drinksSource.indexOf("subscribeToDrinks(user.uid"));
  assert.match(gamesSource, /if \(isDemoMode\) \{ setSessions/);
  assert.ok(gamesSource.indexOf("if (isDemoMode)") < gamesSource.indexOf("subscribeToGameStats(user.uid"));
  assert.match(settingsSource, /if \(!user \|\| isDemoMode\) return/);
});
