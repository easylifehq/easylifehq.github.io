import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("primary Capture and Plan routes expose one semantic page heading", async () => {
  const [inboxSource, planSource] = await Promise.all([
    readFile(new URL("../src/features/easylist/routes/EasyListInboxPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/features/easycalendar/routes/EasyCalendarDayPage.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(inboxSource, /<h1 id="easylist-inbox-title">Review the intake queue<\/h1>/);
  assert.match(planSource, /<PageSection\s+headingLevel=\{1\}\s+eyebrow="Plan"/);
});
