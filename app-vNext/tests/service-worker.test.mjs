import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("service worker refreshes the offline shell after a successful navigation", async () => {
  const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
  assert.match(source, /networkResponse\.ok/);
  assert.match(source, /cache\.put\("\/", responseCopy\)/);
  assert.match(source, /catch\(\(\) => caches\.match\("\/"\)\)/);
});

test("service worker does not persist failed asset responses", async () => {
  const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
  const successfulResponseGuards = source.match(/if \(networkResponse\.ok\)/g) || [];
  assert.equal(successfulResponseGuards.length, 2);
});

test("service worker updates safely without deleting unrelated origin caches", async () => {
  const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
  assert.match(source, /cacheName\.startsWith\(CACHE_PREFIX\)/);
  assert.doesNotMatch(source, /self\.skipWaiting\(\)/);
  assert.match(source, /catch\(\(\) => caches\.match\(event\.request\)\)/);
});
