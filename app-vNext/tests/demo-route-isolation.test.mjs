import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("every workout statistics source link preserves demo isolation", async () => {
  const source = await readFile(
    new URL("../src/features/easyworkout/components/WorkoutInsightsPanel.tsx", import.meta.url),
    "utf8"
  );
  const sessionLinks = source.match(/to=\{`\/app\/easyworkout\/session\/\$\{[^`]+`\}/g) || [];

  assert.ok(sessionLinks.length >= 3, "expected all statistics session-link variants");
  for (const link of sessionLinks) {
    assert.match(link, /\$\{demoOnlySearch\}/, `demo query missing from ${link}`);
  }
});
