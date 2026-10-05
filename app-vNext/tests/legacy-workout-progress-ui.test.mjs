import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { previewLegacyObservationDocument, validateLegacyObservationDocument } from "../src/features/easyworkout/domain/legacyWorkoutObservation.ts";
import { deriveLegacyWorkoutTrends } from "../src/features/easyworkout/domain/legacyWorkoutTrends.ts";
import { workoutLegacyDemoDocument } from "../src/features/easyworkout/demo/workoutLegacyDemoFixtures.ts";

const srcUrl = new URL("../src/", import.meta.url);
const read = (path) => readFile(new URL(path, srcUrl), "utf8");

test("synthetic demo fixture is valid and exercises every comparison boundary", () => {
  const result = validateLegacyObservationDocument(workoutLegacyDemoDocument);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  const preview = previewLegacyObservationDocument(workoutLegacyDemoDocument);
  for (const precision of ["day", "week", "month", "unknown"]) assert.ok(preview.precisionCounts[precision] > 0, precision);
  assert.ok(preview.excludedFromTrends.planned > 0);
  assert.ok(preview.excludedFromTrends.ambiguous > 0);
  const trends = deriveLegacyWorkoutTrends(result.document);
  assert.ok(trends.series.some((s) => s.comparability === "known" && s.points.length >= 3));
  assert.ok(trends.series.some((s) => s.comparability === "unknown-equipment-or-convention" && s.points.length >= 2));
  assert.ok(trends.series.some((s) => s.ordering === "source-order"));
  assert.match(workoutLegacyDemoDocument.batch.sourceKey, /^synthetic-/);
});

test("panel is read-only, caveated and renders precision, provenance and exclusions", async () => {
  const panel = await read("features/easyworkout/components/WorkoutLegacyProgressPanel.tsx");
  assert.match(panel, /Legacy progress/);
  assert.match(panel, /Recorded load/);
  assert.match(panel, /<caption>/);
  assert.match(panel, /scope="col"/);
  assert.match(panel, /table-scroll/);
  assert.match(panel, /caveat/);
  assert.match(panel, /sourceLocator/);
  assert.match(panel, /sourceHash/);
  assert.match(panel, /precision/);
  assert.match(panel, /excluded/i);
  assert.match(panel, /derived from supplied dates and source order|source order/i);
  assert.doesNotMatch(panel, /<button|<input|<form|<select|<textarea|onClick|onSubmit|onChange/);
  assert.doesNotMatch(panel, /firestore|setDoc|addDoc|fetch\(|localStorage|indexedDB/i);
  assert.doesNotMatch(panel, /promot|e1rm|estimated|personal record|\bPR\b|target|per week|rate of/i);
  assert.doesNotMatch(panel, /\b(Save|Import|Upload|Apply)\b/);
});

test("statistics page exposes local preview with synthetic initial data only in demo mode next to unchanged insights", async () => {
  const page = await read("features/easystatistics/routes/EasyStatisticsPage.tsx");
  assert.match(page, /activeTab === "workout" \? <WorkoutLegacyImportPreview initialDocument=\{isDemoMode \? workoutLegacyDemoDocument : undefined\}/);
  assert.match(page, /<WorkoutInsightsPanel sessions=\{workoutSessions\} routines=\{workoutRoutines\} exercises=\{workoutExercises\} goals=\{workoutGoals\} onCreateGoal=\{handleCreateGoal\} onEditGoal=\{handleEditGoal\} onGoalStatus=\{handleGoalStatus\} isLoading=\{isLoading\} error=\{statsError\} \/>/);
  assert.doesNotMatch(page, /legacyWorkoutObservation|legacyWorkoutTrends/);
});

test("legacy domain, trend and panel modules have no persistence path and are referenced only by the slice", async () => {
  const files = (await readdir(srcUrl, { recursive: true })).filter((f) => /\.(ts|tsx)$/.test(f)).map((f) => f.replaceAll("\\", "/"));
  const referencing = [];
  for (const file of files) {
    const text = await read(file);
    if (/legacyWorkout(Observation|Trends)|WorkoutLegacyProgressPanel|workoutLegacyDemoFixtures/.test(text)) referencing.push(file);
    if (!file.startsWith("features/easystatistics/") && /legacyWorkout(Observation|Trends)|workoutLegacyDemoFixtures/.test(text)) {
      assert.doesNotMatch(text, /lib\/firestore|firebase|setDoc|addDoc|updateDoc/, file);
    }
  }
  assert.deepEqual(referencing.sort(), [
    "features/easystatistics/routes/EasyStatisticsPage.tsx",
    "features/easyworkout/components/WorkoutLegacyImportPreview.tsx",
    "features/easyworkout/components/WorkoutLegacyProgressPanel.tsx",
    "features/easyworkout/components/WorkoutLegacyStoredHistory.tsx",
    "features/easyworkout/demo/workoutLegacyDemoFixtures.ts",
    "features/easyworkout/domain/legacyWorkoutDurableImport.ts",
    "features/easyworkout/domain/legacyWorkoutTrends.ts",
  ]);
});

test("styles are scoped to legacy-progress and reuse the existing scrolling table pattern", async () => {
  const css = await read("styles/globals.css");
  const start = css.indexOf("/* legacy-progress:start */");
  const end = css.indexOf("/* legacy-progress:end */");
  assert.ok(start >= 0 && end > start);
  const block = css.slice(start, end);
  const selectors = block.replace(/\/\*[\s\S]*?\*\//g, "").split("{").slice(0, -1).map((chunk) => chunk.split("}").pop().trim()).filter((s) => !s.startsWith("@media"));
  assert.ok(selectors.length > 0);
  for (const selector of selectors) assert.match(selector, /^\.legacy-progress/, selector);
  assert.match(block, /@media \(max-width: 480px\)/);
});
