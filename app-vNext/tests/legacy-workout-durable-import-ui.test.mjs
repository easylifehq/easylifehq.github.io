import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const srcUrl = new URL("../src/", import.meta.url);
const read = (path) => readFile(new URL(path, srcUrl), "utf8");
const readRules = async () => (await readFile(new URL("../../firestore.rules", import.meta.url), "utf8")).replace(/\r\n/g, "\n");

const PREVIEW = "features/easyworkout/components/WorkoutLegacyImportPreview.tsx";
const HISTORY = "features/easyworkout/components/WorkoutLegacyStoredHistory.tsx";
const PANEL = "features/easyworkout/components/WorkoutLegacyProgressPanel.tsx";
const PAGE = "features/easystatistics/routes/EasyStatisticsPage.tsx";
const TRANSACTIONS = "lib/firestore/legacyWorkoutImportTransactions.ts";
const ADAPTER = "lib/firestore/legacyWorkoutImports.ts";
const DOMAIN = "features/easyworkout/domain/legacyWorkoutDurableImport.ts";

test("picker keeps local bytes in memory and requires an explicit confirm click before any write", async () => {
  const source = await read(PREVIEW);
  assert.match(source, /Nothing is uploaded until you confirm/);
  assert.doesNotMatch(source, /Nothing is uploaded or saved/);
  assert.match(source, /not the file itself/i);
  // The only call into the write handler is inside the confirm handler, triggered by the confirm button.
  assert.equal((source.match(/onConfirmImport\(/g) ?? []).length, 1);
  assert.match(source, /async function handleConfirm\(/);
  assert.match(source, /<button[^>]*onClick=\{handleConfirm\}[^>]*>\s*Confirm import to my account/);
  assert.doesNotMatch(source, /useEffect/);
  // Component remains storage-agnostic: handlers come from props.
  assert.doesNotMatch(source, /fetch\(|XMLHttpRequest|sendBeacon|firestore|firebase|setDoc|addDoc|updateDoc|localStorage|sessionStorage|indexedDB|console\./i);
});

test("storage preview shows counts, conflicts, rolled-back and already-stored states honestly", async () => {
  const source = await read(PREVIEW);
  assert.match(source, /buildLegacyImportPlan/);
  assert.match(source, /previewLegacyDurableImport/);
  for (const copy of [/New records/, /Already stored/, /Conflicts?/, /rolled back/i, /Nothing will be written/, /too large/i, /Import failed/, /Import saved/]) assert.match(source, copy);
  assert.match(source, /storagePreview\.conflicts/);
  assert.match(source, /disabled=\{[^}]*canConfirm/);
});

test("UI explains the 450-observation durable limit and surfaces the plan error before any write", async () => {
  const source = await read(PREVIEW);
  assert.match(source, /LEGACY_IMPORT_MAX_OBSERVATIONS/);
  assert.match(source, /at most \{LEGACY_IMPORT_MAX_OBSERVATIONS\} observations/);
  assert.match(source, /plan && !plan\.ok/);
  assert.match(source, /plan\.errors\[0\]\?\.message/);
  const domain = await read(DOMAIN);
  assert.match(domain, /export const LEGACY_IMPORT_MAX_OBSERVATIONS = 450;/);
  assert.match(domain, /durable-observation-limit/);
});

test("signed-out and demo contexts cannot write", async () => {
  const source = await read(PREVIEW);
  assert.match(source, /isDemoMode/);
  assert.match(source, /const canWrite = !isDemoMode && Boolean\(ownerId\) && typeof onConfirmImport === "function"/);
  assert.match(source, /Demo mode never saves/);
  assert.match(source, /Sign in to save/);
  assert.match(source, /disabled=\{[^}]*!canWrite/);
});

test("stored history reconstructs readback, offers a two-step unchanged-only rollback and reports withheld batches", async () => {
  const source = await read(HISTORY);
  assert.match(source, /reconstructLegacyImports/);
  assert.match(source, /WorkoutLegacyProgressPanel/);
  assert.match(source, /Roll back this import/);
  assert.match(source, /Confirm rollback/);
  assert.match(source, /Cancel/);
  assert.match(source, /unchanged/i);
  assert.match(source, /hidden from progress/i);
  assert.match(source, /No legacy history is stored yet/);
  assert.match(source, /Could not load stored legacy history/);
  assert.match(source, /Withheld/);
  assert.equal((source.match(/onRollbackImport\(/g) ?? []).length, 1);
  assert.doesNotMatch(source, /fetch\(|firestore|firebase|setDoc|addDoc|updateDoc|deleteDoc|localStorage|indexedDB|console\./i);
});

test("progress panel stays read-only and accepts an eyebrow for stored versus local data", async () => {
  const panel = await read(PANEL);
  assert.match(panel, /eyebrow\??:/);
  assert.doesNotMatch(panel, /<button|<input|<form|onClick|onChange|firestore|setDoc/);
});

test("statistics page wires owner subscription, confirm and rollback handlers without direct writes", async () => {
  const page = await read(PAGE);
  assert.match(page, /subscribeToLegacyWorkoutImports\(\s*user\.uid/);
  assert.match(page, /confirmLegacyWorkoutImport\(user\.uid/);
  assert.match(page, /rollbackLegacyWorkoutImport\(user\.uid/);
  assert.match(page, /if \(!user \|\| isDemoMode\)/);
  assert.match(page, /<WorkoutLegacyImportPreview[^>]*isDemoMode=\{isDemoMode\}/);
  assert.match(page, /initialDocument=\{isDemoMode \? workoutLegacyDemoDocument : undefined\}/);
  assert.match(page, /ownerId=\{isDemoMode \? null : user\?\.uid \?\? null\}/);
  assert.match(page, /<WorkoutInsightsPanel sessions=\{workoutSessions\} routines=\{workoutRoutines\} exercises=\{workoutExercises\} goals=\{workoutGoals\} onCreateGoal=\{handleCreateGoal\} onEditGoal=\{handleEditGoal\} onGoalStatus=\{handleGoalStatus\} isLoading=\{isLoading\} error=\{statsError\} \/>/);
  assert.doesNotMatch(page, /legacyWorkoutObservation|legacyWorkoutTrends|legacyWorkoutDurableImport/);
  assert.doesNotMatch(page, /setDoc\(|addDoc\(|writeBatch\(|runTransaction\(/);
});

test("transaction module is create-only: no update, delete, batch writes or timestamps", async () => {
  const source = await read(TRANSACTIONS);
  assert.match(source, /runTransaction\(/);
  assert.match(source, /transaction\.set\(/);
  assert.doesNotMatch(source, /transaction\.(update|delete)\(|setDoc|addDoc|updateDoc|deleteDoc|writeBatch|serverTimestamp|Timestamp\.now|new Date/);
  assert.match(source, /"users", ownerId/);
  assert.doesNotMatch(source, /workoutSessions|workoutGoals|workoutRoutines|workoutExercises/);
  const adapter = await read(ADAPTER);
  assert.match(adapter, /@\/lib\/firebase\/client/);
  assert.doesNotMatch(adapter, /setDoc|addDoc|updateDoc|deleteDoc/);
});

test("durable domain is pure and isolated from canonical workouts, statistics, goals and guidance", async () => {
  const source = await read(DOMAIN);
  const imports = [...source.matchAll(/from "([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(imports, ["./legacyWorkoutObservation.ts"]);
  assert.doesNotMatch(source, /firebase|firestore|fetch\(|localStorage|console\.|Date\.now|new Date|Math\.random|crypto\./);
  assert.doesNotMatch(source, /workoutSessions|workoutStatistics|workoutGoals|e1rm|guidance|promot/i);
});

test("persistence references stay inside the reviewed adapter, page and settings export files", async () => {
  const files = (await readdir(srcUrl, { recursive: true })).filter((f) => /\.(ts|tsx)$/.test(f)).map((f) => f.replaceAll("\\", "/"));
  const referencing = [];
  for (const file of files) {
    const text = await read(file);
    if (/@\/lib\/firestore\/legacyWorkoutImports|\.\/legacyWorkoutImportTransactions/.test(text)) referencing.push(file);
    if (/LEGACY_IMPORT_COLLECTIONS|legacyWorkoutImport(Batches|Observations|Receipts|Rollbacks)/.test(text)) referencing.push(`collections:${file}`);
  }
  assert.deepEqual(referencing.sort(), [
    "collections:features/coreloop/demo/coreLoopDemoFixtures.ts",
    "collections:features/coreloop/domain/accountExport.ts",
    "collections:features/easyworkout/domain/legacyWorkoutDurableImport.ts",
    "collections:features/settings/routes/SettingsPage.tsx",
    "collections:lib/firestore/legacyWorkoutImportTransactions.ts",
    "features/easystatistics/routes/EasyStatisticsPage.tsx",
    "features/settings/routes/SettingsPage.tsx",
    "lib/firestore/legacyWorkoutImports.ts",
  ].sort());
});

test("settings export subscribes to all four legacy collections and counts them in the manifest", async () => {
  const settings = await read("features/settings/routes/SettingsPage.tsx");
  for (const key of ["legacyWorkoutImportBatches", "legacyWorkoutImportObservations", "legacyWorkoutImportReceipts", "legacyWorkoutImportRollbacks"]) {
    assert.match(settings, new RegExp(`setCollection\\("${key}"\\)`), key);
    assert.match(settings, new RegExp(`handleError\\("${key}"\\)`), key);
  }
  for (const name of ["subscribeToLegacyImportBatches", "subscribeToLegacyImportObservations", "subscribeToLegacyImportReceipts", "subscribeToLegacyImportRollbacks"]) assert.match(settings, new RegExp(name), name);
  assert.match(settings, /dataPendingCount\(dataExportGroups\.length\)|setDataPendingCount\(dataExportGroups\.length\)/);
});

test("firestore rules add owner-only create-only legacy collections without weakening existing blocks", async () => {
  const rules = await readRules();
  for (const [collectionName, validator] of [
    ["legacyWorkoutImportBatches", "validLegacyBatch(userId, batchId)"],
    ["legacyWorkoutImportObservations", "validLegacyObservation(userId, observationId)"],
    ["legacyWorkoutImportReceipts", "validLegacyConfirmation(userId, batchId)"],
    ["legacyWorkoutImportRollbacks", "validLegacyRollback(userId, batchId)"],
  ]) {
    const start = rules.indexOf(`match /${collectionName}/{`);
    assert.ok(start > 0, collectionName);
    const block = rules.slice(start, rules.indexOf("\n      }\n", start));
    assert.match(block, /allow read: if isOwner\(userId\);/);
    assert.ok(block.includes(`allow create: if isOwner(userId) && ${validator};`), collectionName);
    assert.match(block, /allow update, delete: if false;/);
    assert.doesNotMatch(block, /allow (write|read, create|create, update)/);
  }
  // Legacy blocks precede the generic wildcard and the generic list does not gain the new names.
  assert.ok(rules.indexOf("match /legacyWorkoutImportRollbacks/") < rules.indexOf("match /{collectionId}/{documentId}"));
  const supported = rules.slice(rules.indexOf("function isSupportedUserCollection"), rules.indexOf("function validWorkoutSession"));
  assert.doesNotMatch(supported, /legacyWorkoutImport/);
  // Strictness markers.
  assert.match(rules, /batch\.ownerId == userId/);
  assert.match(rules, /observation\.ownerId == userId/);
  assert.match(rules, /receipt\.ownerId == userId/);
  assert.match(rules, /existsAfter\(batchPath\)/);
  assert.match(rules, /exists\(confirmationPath\)/);
  assert.match(rules, /observationId\.split\('-o'\)\[0\] == observation\.batchId/);
  assert.match(rules, /observationId\.matches\('\^lwb-\[0-9a-f\]\{32\}-o\[1-9\]\[0-9\]\*\$'\)/);
  assert.match(rules, /receipt\.reason == 'owner-soft-rollback'/);
  assert.match(rules, /\.keys\(\)\.hasOnly\(/);
  // Durable count limit, ordinal shape and bounded access calls.
  assert.match(rules, /batch\.observationCount <= 450/);
  assert.doesNotMatch(rules, /observationCount <= 5000/);
  assert.match(rules, /batch\.sourceOrdinals\.size\(\) == batch\.observationCount/);
  assert.match(rules, /receipt\.observationCount <= 450/);
  assert.match(rules, /batchAfter\.sourceOrdinals\.size\(\) == receipt\.observationCount/);
  assert.match(rules, /batch\.sourceOrdinals\[0\] >= 1/);
  // Observation creates make no access calls (they would multiply by up to 450 inside one transaction); the receipt
  // and tombstone make a handful, far below Firestore's 20-call transaction budget.
  const functionBody = (name) => rules.slice(rules.indexOf(`function ${name}(`), rules.indexOf("\n    }\n", rules.indexOf(`function ${name}(`)));
  const accessCalls = (body) => (body.match(/\b(get|exists|getAfter|existsAfter)\(/g) ?? []).length;
  assert.equal(accessCalls(functionBody("validLegacyObservation")), 0);
  assert.equal(accessCalls(functionBody("validLegacyBatch")), 0);
  assert.ok(accessCalls(functionBody("validLegacyConfirmation")) <= 6);
  assert.ok(accessCalls(functionBody("validLegacyRollback")) <= 3);
  // Existing protections remain.
  assert.match(rules, /match \/workoutGoals\/\{goalId\} \{[\s\S]*allow delete: if false;/);
  assert.match(rules, /allow read, write: if false;/);
  assert.match(rules, /match \/\{document=\*\*\} \{\s*allow read, create, update, delete: if false;/);
});
