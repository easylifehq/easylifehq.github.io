import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../src/${path}`, import.meta.url), "utf8");
const card = () => read("features/easyworkout/components/QuickWorkoutExerciseCard.tsx");
const page = () => read("features/easyworkout/routes/EasyWorkoutLogPage.tsx");
const styles = () => read("styles/globals.css");

test("header row holds Exercise N and delete; name and Quick note share the next row", async () => {
  const source = await card();
  const header = source.slice(source.indexOf('className="quick-workout-header"'), source.indexOf('className="quick-workout-identity"'));
  assert.match(header, /Exercise \{exerciseIndex \+ 1\}/);
  assert.match(header, /Delete exercise/);
  assert.doesNotMatch(header, /onExerciseNameChange|quick note/);
  const identity = source.slice(source.indexOf('className="quick-workout-identity"'), source.indexOf("{confirmingDelete ? ("));
  assert.match(identity, /onExerciseNameChange/);
  assert.match(identity, /<span>Quick note<\/span>/);
  assert.match(identity, /value=\{exercise\.notes\}/);
  assert.match(identity, /onExerciseNotesChange\(event\.target\.value\)/);
  assert.doesNotMatch(identity, /maxLength|slice\(/, "notes must never be truncated");
  assert.match(await styles(), /\.quick-workout-identity\s*\{[^}]*repeat\(auto-fit, minmax\(/);
});

test("Quick note reuses the existing notes field with no new schema", async () => {
  const source = await card();
  assert.doesNotMatch(source, /quickNote|exercise\.note\b/);
  assert.match(source, /Exercise details<\/summary>[\s\S]*<textarea[\s\S]*value=\{exercise\.notes\}/);
  assert.doesNotMatch(source, /More setup/);
});

test("redundant success cards are gone but errors and actionable states remain", async () => {
  const source = await page();
  assert.doesNotMatch(source, /Exercise marked done/);
  assert.doesNotMatch(source, /Only its completed working sets will be saved/);
  assert.match(source, /draftStatus === "syncing" \|\| draftStatus === "synced" \|\| draftStatus === "sync-failed-draft-retained"/);
  for (const kept of ["Local storage is unavailable", "changed in another tab", "too large to retain", "Couldn't sync", "No set was marked done", "Undo remove"]) {
    assert.ok(source.includes(kept), `${kept} must remain`);
  }
});

test("working sets and warm-ups are counted distinctly, excluding blank and incomplete rows", async () => {
  const source = await card();
  const fn = source.slice(source.indexOf("export function countQuickWorkoutSets"), source.indexOf("function previousSetHint"));
  assert.match(fn, /set\.deleted \|\| isEmptySetRow\(set\)/);
  assert.match(fn, /isValidWorkingSet\(\{ \.\.\.set, setType: "standard", completed: true \}, exercise\.exerciseType\)/);
  assert.match(fn, /set\.setType === "warmup"\) warmups \+= 1/);
  assert.match(fn, /else working \+= 1/);
  assert.match(fn, /incomplete \+= 1/);
  assert.match(source, /Working sets: \{counts\.working\}/);
  assert.match(source, /Warm-ups: \{counts\.warmups\}/);
  assert.match(source, /Incomplete: \{counts\.incomplete\}/);
});

test("previous-set hints are reference-only text, not inputs, never copied or completed", async () => {
  const source = await card();
  assert.match(source, /className="quick-workout-set-hint" data-reference-only="true"/);
  assert.match(source, /set\.setType === "warmup" \? undefined : lastTime\?\.sets\?\.\[workingOrdinal\]/);
  const start = source.indexOf('className="quick-workout-set-hint"');
  const hint = source.slice(start, source.indexOf("</span>", start));
  assert.doesNotMatch(hint, /onSetEdit|onUseLast|<input/);
  const pageSource = await page();
  assert.match(pageSource, /sets: previous\.lastSets,/);
  assert.match(source, /onUseLast\(lastTime\.setupLabel/);
  assert.match(await styles(), /\.quick-workout-set-hint\s*\{[^}]*font-style: italic/);
});
