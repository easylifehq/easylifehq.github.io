import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { calendarDayDifference } from "../src/lib/dates/calendarDayDifference.ts";
import {
  commitSyntheticEnvelope,
  getSyntheticAuditStateStorageKey,
  SYNTHETIC_AUDIT_STATE_VERSION,
} from "../src/lib/runtime/syntheticAuditStorage.ts";
import { formatAuthoredDuration } from "../src/features/easydrinks/domain/preparation.ts";

test("synthetic storage is versioned, runtime-namespaced, and cross-deployment isolated", () => {
  const first = getSyntheticAuditStateStorageKey({ hostname: "f02f9244.easylife-wave10-1-audit.pages.dev", mode: "audit" });
  const second = getSyntheticAuditStateStorageKey({ hostname: "next.easylife-wave10-1-audit.pages.dev", mode: "audit" });
  const loopback = getSyntheticAuditStateStorageKey({ hostname: "localhost", mode: "loopback-demo" });
  assert.match(first, new RegExp(`:v${SYNTHETIC_AUDIT_STATE_VERSION}:audit:`));
  assert.notEqual(first, second);
  assert.notEqual(first, loopback);
  assert.throws(() => getSyntheticAuditStateStorageKey({ hostname: "audit host.example", mode: "audit" }));
});

test("synthetic commits persist before returning a new revision and fail without false success", () => {
  const current = { version: 1, revision: 7, value: "old" };
  let serialized = "";
  const next = commitSyntheticEnvelope(
    { setItem: (_key, value) => { serialized = value; } },
    "state-key",
    current,
    (value) => ({ ...value, value: "new" }),
  );
  assert.equal(next.revision, 8);
  assert.equal(next.value, "new");
  assert.deepEqual(JSON.parse(serialized), next);
  assert.equal(current.value, "old");

  assert.throws(() => commitSyntheticEnvelope(
    { setItem: () => { throw new Error("quota"); } },
    "state-key",
    current,
    (value) => ({ ...value, value: "must-not-succeed" }),
  ), /quota/);
  assert.equal(current.revision, 7);
  assert.equal(current.value, "old");
});

test("calendar-day differences are date-only, DST-safe, and invalid-date safe", () => {
  assert.equal(calendarDayDifference("2026-03-09", new Date(2026, 2, 8, 23, 55)), 1);
  assert.equal(calendarDayDifference("2026-11-01", new Date(2026, 10, 2, 0, 5)), -1);
  assert.equal(calendarDayDifference("2026-08-14", new Date(2026, 7, 14, 23, 59)), 0);
  assert.equal(calendarDayDifference("2026-02-30", new Date(2026, 1, 28)), null);
});

test("authored drink timers remain truthful at seconds and minute boundaries", () => {
  assert.equal(formatAuthoredDuration(1), "1 sec timer");
  assert.equal(formatAuthoredDuration(5), "5 sec timer");
  assert.equal(formatAuthoredDuration(59), "59 sec timer");
  assert.equal(formatAuthoredDuration(60), "1 min timer");
  assert.equal(formatAuthoredDuration(65), "1 min 5 sec timer");
  assert.equal(formatAuthoredDuration(120), "2 min timer");
});

test("audit providers, capture, export, reset, and Firebase guards share the local adapter", async () => {
  const [
    state,
    easyList,
    notes,
    calendar,
    drinks,
    search,
    capture,
    taskDrawer,
    settings,
    firebaseClient,
  ] = await Promise.all([
    readFile(new URL("../src/lib/runtime/syntheticAuditState.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/features/easylist/EasyListContext.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/features/easynotes/EasyNotesContext.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/features/easycalendar/EasyCalendarContext.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/features/easydrinks/EasyDrinksContext.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/features/coreloop/CoreLoopSearchContext.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/features/experiments/UniversalCapture.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/features/easylist/components/TaskDrawer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/features/settings/routes/SettingsPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/lib/firebase/client.ts", import.meta.url), "utf8"),
  ]);

  for (const source of [easyList, notes, calendar, drinks, search, capture, settings]) {
    assert.match(source, /useSyntheticAuditState/);
  }
  assert.match(state, /localStorage\.setItem\(activeKey, JSON\.stringify\(next\)\)/);
  assert.match(state, /easylife:drinks:guided:v1:local-preview:/);
  assert.match(state, /easylife:easygames:active:v2:local-preview:/);
  assert.match(capture, /if \(isDemoMode\)[\s\S]{0,180}createSyntheticTask/);
  assert.match(capture, /createSyntheticNote\(draft\)/);
  assert.match(taskDrawer, /if \(isDemoMode\)[\s\S]{0,180}setProjects\(\[\]\)[\s\S]{0,180}return/);
  assert.match(settings, /tasks: syntheticState\.tasks/);
  assert.match(settings, /drinkPreparations: syntheticState\.preparations/);
  assert.match(firebaseClient, /firestoreRuntimeTarget\.kind === "configured-project" \? firebaseConfig : emulatorOnlyConfig/);
});

test("verified UI corrections remain wired to their accessible and scoped contracts", async () => {
  const [focusTrap, composer, plan, settings, drinks, guided] = await Promise.all([
    readFile(new URL("../src/lib/a11y/useFocusTrap.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/features/easylist/components/TaskComposer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/features/easycalendar/routes/EasyCalendarDayPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/features/settings/routes/SettingsPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/features/easydrinks/routes/EasyDrinksPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/features/easydrinks/routes/GuidedDrinkPage.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(focusTrap, /sibling\.inert = true/);
  assert.match(focusTrap, /returnTarget\.focus/);
  assert.match(composer, /Task due date/);
  assert.match(composer, /onInvalid=/);
  assert.match(composer, /aria-invalid=/);
  assert.doesNotMatch(plan, /Block 45 minutes today/);
  assert.match(plan, /Use this day's capacity/);
  assert.match(plan, /Selected day/);
  assert.match(settings, /activeSection === "customize" \|\| activeSection === "trust"/);
  assert.match(drinks, /rankDrinksForPantry\(drinks, pantry\)/);
  assert.match(drinks, /drink\.steps\.length === 1/);
  assert.match(drinks, /Copied from/);
  assert.match(guided, /formatAuthoredDuration/);
});
