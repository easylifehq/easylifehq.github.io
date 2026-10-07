import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const source = await readFile(new URL('../src/features/easyworkout/routes/EasyWorkoutLogPage.tsx', import.meta.url), 'utf8');
const modules = {};
for (const match of source.matchAll(/from "(@\/[^\"]+)"/g)) {
  const path = match[1];
  if (path.includes('/domain/') || path.includes('/lib/')) modules[path] = await import(new URL(`../src/${path.slice(2)}.ts`, import.meta.url));
}
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true } }).outputText;

function mount({ restoredSeconds = 0, owner = 'owner-a', storageFails = false, plannedMinutes = null } = {}) {
  let now = 0, cursor = 0, dirty = true, tree, recommendations = 0, savedSession = null, writes = [], removed = [], timers = new Map(), nextTimer = 0;
  const hooks = [], pendingEffects = [], listeners = new Map();
  const listen = (target) => ({ addEventListener(name, fn) { const key = `${target}:${name}`; const set = listeners.get(key) || new Set(); set.add(fn); listeners.set(key, set); }, removeEventListener(name, fn) { listeners.get(`${target}:${name}`)?.delete(fn); } });
  const storage = new Map();
  const localStorage = { getItem: (key) => storage.get(key) || null, setItem(key, value) { if (storageFails) throw new Error('synthetic unavailable storage'); storage.set(key, value); writes.push({ key, value: JSON.parse(value) }); }, removeItem(key) { storage.delete(key); removed.push(key); } };
  const timer = (fn, delay, repeat) => { const id = ++nextTimer; timers.set(id, { fn, at: now + delay, repeat }); return id; };
  const document = { visibilityState: 'visible', ...listen('document'), getElementById: () => null };
  const window = { localStorage, ...listen('window'), setTimeout: (fn, delay) => timer(fn, delay, 0), clearTimeout: (id) => timers.delete(id), setInterval: (fn, delay) => timer(fn, delay, delay), clearInterval: (id) => timers.delete(id), requestAnimationFrame: (fn) => fn() };
  const equal = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
  const react = { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }), useRef(value) { const i = cursor++; return hooks[i] ||= { current: value }; }, useState(value) { const i = cursor++; hooks[i] ||= { value: typeof value === 'function' ? value() : value }; return [hooks[i].value, (next) => { const value = typeof next === 'function' ? next(hooks[i].value) : next; if (!Object.is(value, hooks[i].value)) { hooks[i].value = value; dirty = true; } }]; }, useMemo(fn, deps) { const i = cursor++; if (!hooks[i] || !equal(hooks[i].deps, deps)) hooks[i] = { value: fn(), deps }; return hooks[i].value; }, useEffect(fn, deps) { const i = cursor++; if (!hooks[i] || !equal(hooks[i].deps, deps)) { const previous = hooks[i]; hooks[i] = { deps, cleanup: previous?.cleanup }; pendingEffects.push(() => { previous?.cleanup?.(); hooks[i].cleanup = fn(); }); } } };
  const settings = { easyWorkout: { weightUnit: 'lb', defaultSetCount: 3 } };
  const workout = { routines: [], exercises: [], sessions: [], isLoading: false, error: null, addSession: async (session) => { savedSession = session; return 'saved-session'; } };
  const lifecycle = modules['@/features/easyworkout/domain/workoutDraftLifecycle'];
  const recovery = lifecycle.recoverWorkoutDraft({ performedOn: '2026-10-07', sessionNotes: 'synthetic draft', durationMinutes: '', exerciseLogs: [{ localId: 'exercise-a', exerciseId: 'bench', exerciseName: 'Bench', muscleGroup: 'Chest', notes: '', sets: [{ localId: 'set-a', reps: 5, weight: 100, notes: '', completed: true }] }], elapsedSeconds: restoredSeconds }, { today: '2026-10-07', nowIso: '2026-10-07T00:00:00Z', ownerId: owner, defaultWeightUnit: 'lb', createId: () => 'synthetic-id' }).draft;
  recovery.elapsedSeconds = restoredSeconds;
  recovery.completionReviewRequired = false;
  recovery.exerciseLogs[0].sets[0].completed = true;
  recovery.planningContext = { focusGroups: ['Chest'], availableEquipment: ['barbell'], plannedDurationMinutes: plannedMinutes };
  storage.set(lifecycle.getWorkoutDraftStorageKey(owner), JSON.stringify(recovery));
  const require = (path) => {
    if (path === 'react') return { ...react, default: react, __esModule: true };
    if (path === 'react-router-dom') return { Link: 'Link', useNavigate: () => () => {}, useSearchParams: () => [new URLSearchParams('workoutMode=1')] };
    if (path.endsWith('/SettingsContext')) return { useSettings: () => ({ settings }) };
    if (path.endsWith('/AuthContext')) return { useAuth: () => ({ user: { uid: owner }, isDemoMode: false }) };
    if (path.endsWith('/EasyWorkoutContext')) return { useEasyWorkout: () => workout, defaultWorkoutExercises: [] };
    if (path.endsWith('/workoutNextExercise')) return { ...modules[path], deriveNextExerciseSuggestions: (...args) => { recommendations++; return modules[path].deriveNextExerciseSuggestions(...args); } };
    if (modules[path]) return modules[path];
    return new Proxy({}, { get: (_, name) => name });
  };
  class SyntheticDate extends Date { constructor(...args) { super(...(args.length ? args : [Date.UTC(2026, 9, 7) + now])); } static now() { return now; } }
  const context = { require, exports: {}, React: react, window, document, navigator: { onLine: true }, Date: SyntheticDate, crypto: { randomUUID: () => `id-${++nextTimer}` } };
  vm.runInNewContext(compiled, context);
  function render() { let limit = 40; while (dirty && limit--) { dirty = false; cursor = 0; tree = context.exports.EasyWorkoutLogPage(); pendingEffects.splice(0).forEach((fn) => fn()); } assert.ok(limit > 0, 'hook runner settled'); }
  function advance(ms) { const end = now + ms; while (true) { let chosen; for (const [id, item] of timers) if (item.at <= end && (!chosen || item.at < chosen[1].at)) chosen = [id, item]; if (!chosen) break; const [id, item] = chosen; now = item.at; if (item.repeat) item.at += item.repeat; else timers.delete(id); item.fn(); render(); } now = end; }
  function event(target, name, event = {}) { for (const fn of listeners.get(`${target}:${name}`) || []) fn(event); render(); }
  function nodes(node = tree) { return node && typeof node === 'object' ? [node, ...((node.props?.children || []).flat(Infinity).flatMap(nodes))] : []; }
  render(); advance(250); writes = []; recommendations = 0;
  return { advance, elapseWithoutTimers(ms) { now += ms; }, event, document, window, render, nodes, get writes() { return writes; }, get recommendations() { return recommendations; }, get savedSession() { return savedSession; }, get nextResult() { return nodes().find((node) => node.props?.nextExerciseResult).props.nextExerciseResult; }, get removed() { return removed; }, unmount() { hooks.forEach((hook) => hook?.cleanup?.()); }, editNotes(value) { nodes().find((node) => node.props?.onSessionNotesChange).props.onSessionNotesChange(value); render(); }, async save() { await nodes().find((node) => node.type === 'form').props.onSubmit({ preventDefault() {} }); render(); } };
}

test('60 idle visible seconds cause zero storage writes and no unchanged recommendation recomputation', () => {
  const page = mount(); page.advance(60_000);
  assert.equal(page.writes.length, 0);
  assert.equal(page.recommendations, 0);
  page.event('window', 'pagehide');
  assert.equal(page.writes.at(-1).value.elapsedSeconds, 60);
});

test('content edit persists and hidden lifecycle captures active time, excludes hidden interval, and restores', () => {
  const page = mount({ restoredSeconds: 120 }); page.advance(1750);
  page.editNotes('edited synthetic note'); page.advance(250);
  assert.equal(page.writes.at(-1).value.sessionNotes, 'edited synthetic note');
  assert.equal(page.writes.at(-1).value.elapsedSeconds, 122);
  page.advance(900); page.document.visibilityState = 'hidden'; page.event('document', 'visibilitychange');
  assert.equal(page.writes.at(-1).value.elapsedSeconds, 123);
  page.advance(60_000); page.document.visibilityState = 'visible'; page.event('document', 'visibilitychange'); page.advance(1100); page.unmount();
  assert.equal(page.writes.at(-1).value.elapsedSeconds, 124);
});

test('owner storage keys stay isolated and conflicts prevent later flush', () => {
  const page = mount({ owner: 'owner-b' }); page.advance(2000); page.event('window', 'pagehide');
  assert.ok(page.writes.every((write) => write.key.endsWith('owner-b')));
  page.event('window', 'storage', { storageArea: page.window.localStorage, key: page.writes[0].key });
  const count = page.writes.length; page.advance(2000); page.event('window', 'pagehide'); page.unmount(); assert.equal(page.writes.length, count);
});

test('storage failure reports recovery status and lifecycle flush does not throw', () => {
  const page = mount({ storageFails: true });
  assert.ok(page.nodes().some((node) => node.props?.children?.includes('Local storage is unavailable. Keep this page open and copy the workout before leaving.')));
  page.advance(2000); assert.doesNotThrow(() => page.event('window', 'pagehide')); assert.doesNotThrow(() => page.unmount());
});


test('recommendation thresholds stay exact while displayed remaining time advances each second', () => {
  const page = mount({ plannedMinutes: 9 });
  page.advance(30_000);
  assert.equal(page.recommendations, 0);
  assert.equal(page.nextResult.remainingMinutes, 8.5);
  page.advance(1000);
  assert.equal(page.recommendations, 1);
  assert.equal(page.nextResult.remainingMinutes, 9 - 31 / 60);
  page.advance(29_000);
  assert.equal(page.recommendations, 1);
  assert.equal(page.nextResult.remainingMinutes, 8);
  assert.equal(page.writes.length, 0);
});

test('explicit save snapshots active seconds between ticks and suppresses subsequent lifecycle writes', async () => {
  const page = mount({ restoredSeconds: 88 }); page.elapseWithoutTimers(2000);
  await page.save();
  assert.equal(page.savedSession.durationMinutes, 2);
  assert.ok(page.removed.length > 0);
  const count = page.writes.length;
  page.advance(2000); page.event('window', 'pagehide'); page.unmount();
  assert.equal(page.writes.length, count);
});


test('recommendation cache budget exactly matches derivation for every second of varied plans', () => {
  const domain = modules['@/features/easyworkout/domain/workoutNextExercise'];
  const option = { exerciseId: 'candidate', name: 'Synthetic press', selectionLabel: 'Synthetic press', muscleGroup: 'Chest', primaryMuscles: ['Chest'], secondaryMuscles: [], exerciseType: 'weighted', planningMetadata: { focusGroups: ['Chest'], movementPattern: 'horizontal-push', requiredEquipment: ['barbell'] } };
  for (const minutes of [5, 9, 20]) for (const defaultSetCount of [1, 3, 5]) {
    let budget, cached;
    for (let elapsedSeconds = 0; elapsedSeconds <= minutes * 60; elapsedSeconds++) {
      const remainingMinutes = Math.max(0, minutes - elapsedSeconds / 60);
      const nextBudget = domain.workoutRecommendationSetBudget(remainingMinutes, defaultSetCount);
      const actual = domain.deriveNextExerciseSuggestions({ planningContext: { focusGroups: ['Chest'], availableEquipment: ['barbell'], plannedDurationMinutes: minutes }, elapsedSeconds, defaultSetCount, exerciseOptions: [option], exerciseLogs: [], history: {} });
      if (budget !== nextBudget) { budget = nextBudget; cached = actual; }
      assert.deepEqual({ ...cached, remainingMinutes }, actual);
    }
  }
});


test('unmount flush retains a content edit before its debounce fires', () => {
  const page = mount(); page.elapseWithoutTimers(2000);
  page.editNotes('pending content edit'); page.unmount();
  assert.equal(page.writes.length, 1);
  assert.equal(page.writes[0].value.sessionNotes, 'pending content edit');
  assert.equal(page.writes[0].value.elapsedSeconds, 2);
});

test('pagehide samples stalled visible clock, pageshow resumes after cached restoration', () => {
  const page = mount(); page.elapseWithoutTimers(4000);
  page.event('window', 'pagehide');
  assert.equal(page.writes.at(-1).value.elapsedSeconds, 4);
  page.advance(60_000); page.event('window', 'pageshow'); page.advance(2000); page.unmount();
  assert.equal(page.writes.at(-1).value.elapsedSeconds, 6);
});

test('active clock retains subsecond intervals, clamps delayed samples, and excludes hidden time', () => {
  const { WorkoutActiveClock } = modules['@/features/easyworkout/domain/workoutActiveClock'];
  const clock = new WorkoutActiveClock(10, 0, true);
  assert.equal(clock.snapshot(600), 10);
  assert.equal(clock.setVisible(1200, false), 11);
  assert.equal(clock.snapshot(50_000), 11);
  clock.setVisible(60_000, true);
  assert.equal(clock.snapshot(60_800), 12);
  assert.equal(clock.snapshot(120_800), 42);
});
