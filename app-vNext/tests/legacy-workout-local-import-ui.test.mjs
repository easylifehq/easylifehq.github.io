import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const srcUrl = new URL("../src/", import.meta.url);
const read = (path) => readFile(new URL(path, srcUrl), "utf8");

test("local legacy JSON preview is explicit, bounded, memory-only and uses the hardened parser", async () => {
  const source = await read("features/easyworkout/components/WorkoutLegacyImportPreview.tsx");
  assert.match(source, /type="file"/);
  assert.match(source, /accept="\.json,application\/json"/);
  assert.match(source, /parseLegacyObservationJson/);
  assert.match(source, /5 \* 1024 \* 1024/);
  assert.match(source, /Nothing is uploaded until you confirm/);
  assert.match(source, /sourceLabel/);
  assert.match(source, /warnings/);
  assert.match(source, /errors/);
  assert.match(source, /WorkoutLegacyProgressPanel/);
  assert.doesNotMatch(source, /fetch\(|XMLHttpRequest|sendBeacon|firestore|firebase|setDoc|addDoc|updateDoc|localStorage|sessionStorage|indexedDB|console\./i);
});

test("statistics workout tab exposes local preview while synthetic data remains demo-only", async () => {
  const page = await read("features/easystatistics/routes/EasyStatisticsPage.tsx");
  assert.match(page, /activeTab === "workout" \? <WorkoutLegacyImportPreview initialDocument=\{isDemoMode \? workoutLegacyDemoDocument : undefined\}/);
  assert.doesNotMatch(page, /isDemoMode \? <WorkoutLegacyProgressPanel/);
});
