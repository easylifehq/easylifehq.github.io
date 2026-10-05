import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { workoutDraftStatusDetailCopy } from "../src/features/easyworkout/domain/workoutDraftLifecycle.ts";

test("workout feedback stays in owned regions without reserving empty rows", async () => {
  const source = await readFile(
    new URL("../src/features/easyworkout/routes/EasyWorkoutLogPage.tsx", import.meta.url),
    "utf8"
  );
  const styles = await readFile(new URL("../src/styles/globals.css", import.meta.url), "utf8");

  assert.match(source, /const \[validationMessage, setValidationMessage\] = useState\(""\)/);
  assert.match(
    source,
    /className="workout-validation-message"[\s\S]{0,240}aria-live="polite"[\s\S]{0,240}\{validationMessage\}/
  );
  assert.equal(source.match(/className="workout-validation-message"/g)?.length, 1);
  assert.equal(source.match(/className="workout-action-message"/g)?.length, 1);
  assert.match(
    source,
    /className="workout-action-message" role="status" aria-live="polite" aria-atomic="true"/
  );
  assert.doesNotMatch(source, /saveMessage && draftStatus === "saved-local"/);
  assert.match(source, /saveMessage \? <div className="calendar-info-card workout-action-message-card"/);
  assert.doesNotMatch(source, /aria-hidden=\{draftStatus !== "saved-local"\}/);

  const statusStart = source.indexOf("workout-save-status");
  const statusEnd = source.indexOf("</form>", statusStart);
  const statusMarkup = source.slice(statusStart, statusEnd);
  assert.match(
    statusMarkup,
    /<span>\{workoutDraftStatusDetailCopy\[draftStatus\]\}<\/span>/
  );
  assert.doesNotMatch(statusMarkup, /<span>\{[^}]*saveMessage/);
  assert.doesNotMatch(statusMarkup, /<span>Your latest edits can survive refresh/);

  const durationValidation = source.indexOf("const resolvedDurationMinutes = resolveWorkoutDurationMinutes");
  const offlineCheck = source.indexOf('if (typeof navigator !== "undefined" && !navigator.onLine)');
  const validationClear = source.lastIndexOf('setValidationMessage("")', offlineCheck);
  assert.ok(durationValidation >= 0 && validationClear > durationValidation && offlineCheck > validationClear);
  assert.doesNotMatch(source, /Couldn't sync-draft retained/);

  assert.doesNotMatch(styles, /\.workout-save-status\s*\{[^}]*min-height:/);
  assert.doesNotMatch(styles, /\.workout-action-message\s*\{[^}]*min-height:/);
  assert.doesNotMatch(styles, /\.workout-validation-message\s*\{[^}]*min-height:/);
  const emptyFeedbackRule = styles.match(
    /\.workout-action-message:empty,\s*\.workout-validation-message:empty\s*\{([\s\S]*?)\}/
  )?.[1] || "";
  assert.match(emptyFeedbackRule, /position:\s*absolute;/);
  assert.match(emptyFeedbackRule, /width:\s*1px;/);
  assert.match(emptyFeedbackRule, /height:\s*1px;/);
  assert.match(emptyFeedbackRule, /overflow:\s*hidden;/);
  assert.match(emptyFeedbackRule, /clip:\s*rect\(0 0 0 0\);/);
  assert.doesNotMatch(emptyFeedbackRule, /display:\s*none;/);
  for (const detail of Object.values(workoutDraftStatusDetailCopy)) {
    assert.ok(detail.length <= 36, `Lifecycle detail is too long for the compact 320px status row: ${detail}`);
  }
  const actionRule = styles.match(/\.workout-action-message\s*\{([\s\S]*?)\}/)?.[1] || "";
  const validationRule = styles.match(/\.workout-validation-message\s*\{([\s\S]*?)\}/)?.[1] || "";
  assert.doesNotMatch(actionRule, /position:\s*(?:absolute|fixed)|max-height:|overflow:\s*hidden/);
  assert.doesNotMatch(validationRule, /position:\s*(?:absolute|fixed)|max-height:|overflow:\s*hidden/);
  const actionCardRule = styles.match(/\.workout-action-message \.calendar-info-card\s*\{([\s\S]*?)\}/)?.[1] || "";
  assert.match(actionCardRule, /width:\s*100%;/);
  assert.match(actionCardRule, /margin-bottom:\s*0;/);
  assert.doesNotMatch(styles, /\.workout-action-message-card\.is-reserved/);
});
