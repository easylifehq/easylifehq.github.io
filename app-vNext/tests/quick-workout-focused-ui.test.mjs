import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../src/${path}`, import.meta.url), "utf8");
const page = () => read("features/easyworkout/routes/EasyWorkoutLogPage.tsx");
const card = () => read("features/easyworkout/components/QuickWorkoutExerciseCard.tsx");
const strip = () => read("features/easyworkout/components/QuickWorkoutSessionStrip.tsx");
const next = () => read("features/easyworkout/components/QuickWorkoutNextExercise.tsx");
const styles = () => read("styles/globals.css");

test("fresh focused drafts start with one exercise and never use the multi-box starting count", async () => {
  const source = await page();
  assert.match(source, /focusedStartingExercises/);
  assert.doesNotMatch(source, /startingWorkoutLogs/);
  assert.doesNotMatch(source, /focusedExerciseCount/);
  assert.match(source, /restoredDraft\?\.exerciseLogs\.length\s*\?\s*restoredDraft\.exerciseLogs/);
});

test("focused mode drops the redundant hero, toolbars, Daily Plan, lift count, Add 3 and Clear controls", async () => {
  const source = (await page()) + (await card()) + (await strip()) + (await next());
  for (const removed of ["Add 3 boxes", "Clear blank boxes", "lifts ready", "Type, log, move on", "Lifts, sets, quick notes", "removeBlankExerciseBoxes", "addExerciseBoxes(3)", "workout-mode-quick-actions"]) {
    assert.ok(!source.includes(removed), `${removed} must be gone`);
  }
  const pageSource = await page();
  assert.match(pageSource, /!isFocusedWorkoutMode \? \(\s*<div className="toolbar-row/);
  assert.match(pageSource, /!isFocusedWorkoutMode \? \(\s*<div className="workout-plan-bridge/);
  assert.match(pageSource, /eyebrow=\{isFocusedWorkoutMode \? undefined : "Full log"\}/);
  assert.match(pageSource, /headingLevel=\{1\}/);
  assert.match(pageSource, /title=\{isFocusedWorkoutMode \? "Workout" : "Log workout"\}/);
});

test("session strip owns date, focus and notes and writes the single planning focus", async () => {
  const source = await strip();
  assert.match(source, /type="date"/);
  assert.match(source, /Session notes/);
  assert.match(source, /WORKOUT_FOCUS_GROUPS/);
  assert.match(source, /focusGroups/);
  assert.match(source, /\.slice\(0, 4\)/);
  assert.match(source, /Focus:/);
  const pageSource = await page();
  assert.match(pageSource, /<QuickWorkoutSessionStrip/);
  assert.match(pageSource, /isFocusedWorkoutMode \? \(\s*<QuickWorkoutSessionStrip/);
});

test("exercise card replaces per-row Mark done with exercise-level Done, Edit and Undo done", async () => {
  const source = await card();
  assert.match(source, /Done &amp; next exercise|Done & next exercise/);
  assert.match(source, />\s*Edit\s*</);
  assert.match(source, /Undo done/);
  assert.doesNotMatch(source, /Mark done/);
  assert.doesNotMatch(source, /aria-pressed=\{set\.completed\}/);
  assert.match(source, /onDone/);
  assert.match(source, /onUndoDone/);
});

test("compact rows have accessible removal, and notes plus machine setup live behind More setup", async () => {
  const source = await card();
  assert.match(source, /aria-label=\{`Remove set \$\{setIndex \+ 1\}`\}/);
  assert.match(source, /aria-label=\{`Delete exercise/);
  assert.match(source, /More setup/);
  const moreStart = source.indexOf("More setup");
  const after = source.slice(moreStart);
  for (const needle of ["Exercise notes", "SETUP_FIELDS.map", "other setup", "notes</span>"]) {
    assert.ok(after.includes(needle), `${needle} must be inside More setup`);
  }
  assert.doesNotMatch(source.slice(0, moreStart), /Exercise notes/);
  for (const label of ["seat setting", "arm setting", "back setting", "pad setting"]) assert.ok(source.includes(label));
  assert.match(source, /\+ Set/);
});

test("exercise delete uses inline confirmation with Escape cancel and focus placement", async () => {
  const source = await card();
  assert.match(source, /Cancel/);
  assert.match(source, /Delete exercise<|>\s*Delete exercise\s*</);
  assert.match(source, /event\.key !== "Escape"/);
  assert.match(source, /cancelButtonRef\.current\?\.focus\(\)/);
  assert.match(source, /deleteTriggerRef\.current\?\.focus\(\)/);
  assert.match(source, /role="group"/);
  const pageSource = await page();
  assert.match(pageSource, /deleteExerciseFromLogs/);
});

test("next exercise suggestions sit below the exercise list, reuse top-level focus, and ask only for equipment and budget", async () => {
  const source = await next();
  assert.match(source, /Need another exercise\?/);
  assert.doesNotMatch(source, /Session focus/);
  assert.doesNotMatch(source, /WORKOUT_FOCUS_GROUPS/);
  for (const text of ["Available equipment", "Planning budget", "Planning estimate only", "Add as planned"]) assert.ok(source.includes(text));
  const pageSource = await page();
  const listEnd = pageSource.indexOf("</QuickWorkoutExerciseCard>") >= 0 ? pageSource.indexOf("</QuickWorkoutExerciseCard>") : pageSource.indexOf("<QuickWorkoutExerciseCard");
  const nextAt = pageSource.indexOf("<QuickWorkoutNextExercise");
  const saveRow = pageSource.indexOf('className="task-composer-actions workout-log-actions"');
  assert.ok(listEnd >= 0 && nextAt > listEnd && saveRow > nextAt, "suggestions render after the cards and before the save row");
});

test("page wires completion, save protection and stable regions without regressing 98c9", async () => {
  const source = await page();
  assert.match(source, /completeExerciseAndAdvance/);
  assert.match(source, /undoExerciseCompletion/);
  assert.match(source, /applySetEdit/);
  assert.match(source, /applyExerciseIdentityEdit/);
  const submit = source.slice(source.indexOf("async function handleSaveSession"));
  const blockAt = submit.indexOf("findSaveBlock(exerciseLogs)");
  assert.ok(blockAt > 0 && blockAt < submit.indexOf("const cleanedExercises"));
  assert.match(submit.slice(blockAt, blockAt + 400), /setValidationMessage\(/);
  assert.equal(source.match(/className="workout-validation-message"/g)?.length, 1);
  assert.equal(source.match(/className="workout-action-message"/g)?.length, 1);
  assert.match(source, /Undo remove/);
  assert.doesNotMatch(source, /<div className="calendar-plan-undo-card">\s*<div>\s*<strong>Set removed/);
  assert.match(source, /Done & next exercise/);
});

test("compact focused styles keep 390px layouts free of horizontal overflow", async () => {
  const css = await styles();
  for (const selector of [".workout-session-strip", ".quick-workout-card", ".quick-workout-set-row", ".quick-workout-icon-button"]) {
    assert.ok(css.includes(selector), `${selector} styles`);
  }
  assert.match(css, /\.quick-workout-icon-button\s*\{[^}]*min-(?:width|height):\s*44px/);
});

test("focused recovery cannot mass-complete sets, while full-log keeps the legacy shortcut", async () => {
  const source = await page();
  const shortcut = source.indexOf("Mark all shown sets done");
  assert.ok(shortcut > 0, "full-log shortcut remains");
  const button = source.slice(source.lastIndexOf("<button", shortcut), shortcut);
  const guardStart = source.lastIndexOf("{!isFocusedWorkoutMode ? (", shortcut);
  assert.ok(guardStart > 0 && guardStart > source.lastIndexOf("workout-completion-review", shortcut) - 600, "shortcut is guarded to full-log mode");
  assert.ok(source.indexOf("Review complete", shortcut) > shortcut, "Review complete is retained");
  assert.match(source, /Choose Done & next exercise on each exercise you performed/);
  assert.ok(button.includes("onClick"));
});
