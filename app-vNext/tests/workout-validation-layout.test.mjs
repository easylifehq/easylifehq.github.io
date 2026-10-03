import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("workout validation remains in one reserved slot across draft-save status changes", async () => {
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

  const saveStatusRule = styles.match(/\.workout-save-status\s*\{([\s\S]*?)\}/)?.[1] || "";
  assert.match(saveStatusRule, /min-height:\s*(?!0(?:[;\s]|$))[^;]+;/);
  const actionRule = styles.match(/\.workout-action-message\s*\{([\s\S]*?)\}/)?.[1] || "";
  assert.match(actionRule, /min-height:\s*(?!0(?:[;\s]|$))[^;]+;/);
  assert.doesNotMatch(styles, /\.workout-action-message-card\.is-reserved/);
  const validationRule = styles.match(/\.workout-validation-message\s*\{([\s\S]*?)\}/)?.[1] || "";
  assert.match(validationRule, /min-height:\s*(?!0(?:[;\s]|$))[^;]+;/);
});
