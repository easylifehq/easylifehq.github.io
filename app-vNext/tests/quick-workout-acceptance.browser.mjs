// Focused quick-log acceptance journeys at 390x844 mobile emulation.
// Synthetic only: local Vite dev server on loopback, `?demo=1` (owner "local-preview", no Firebase), throwaway browser profile.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { access, mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "google-chrome",
  "chromium",
].filter(Boolean);

async function reservePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function findChrome() {
  for (const candidate of chromeCandidates) {
    if (path.isAbsolute(candidate)) {
      try { await access(candidate); return candidate; } catch { continue; }
    }
    const lookup = spawnSync(process.platform === "win32" ? "where" : "which", [candidate], { encoding: "utf8", windowsHide: true });
    const resolved = lookup.status === 0 ? lookup.stdout.split(/\r?\n/).find(Boolean)?.trim() : "";
    if (resolved) return resolved;
  }
  throw new Error("Chrome or Edge was not found. Set CHROME_PATH.");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(fn, label, timeout = 15000) {
  const start = Date.now();
  let last;
  while (Date.now() - start < timeout) {
    try { last = await fn(); if (last) return last; } catch (error) { last = error; }
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${label}${last instanceof Error ? `: ${last.message}` : ""}`);
}

const vitePort = await reservePort();
const debugPort = await reservePort();
const origin = `http://127.0.0.1:${vitePort}`;
const profile = await mkdtemp(path.join(tmpdir(), "easylife-quick-acceptance-"));
const vite = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", String(vitePort), "--strictPort"], { stdio: "ignore", windowsHide: true });
const browser = spawn(await findChrome(), [
  "--headless=new", "--disable-gpu", "--disable-extensions", "--disable-background-networking", "--disable-component-update",
  "--disable-sync", "--no-first-run", "--no-default-browser-check",
  `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, "about:blank",
], { stdio: "ignore", windowsHide: true });

async function shutdown() {
  browser.kill();
  vite.kill();
  if (process.platform === "win32") {
    for (const child of [browser, vite]) if (child.pid) spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], { windowsHide: true });
  }
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try { await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); return; } catch { await sleep(200); }
  }
}

const results = [];
let socket;
try {
  await waitFor(async () => (await fetch(`${origin}/`)).ok, "vite dev server", 30000);
  const target = await waitFor(async () => {
    const targets = await fetch(`http://127.0.0.1:${debugPort}/json`).then((r) => r.json());
    return targets.find((item) => item.type === "page");
  }, "browser target");
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  let nextId = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = nextId++;
    const timer = setTimeout(() => reject(new Error(`${method} timed out`)), 15000);
    const onMessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id !== id) return;
      clearTimeout(timer);
      socket.removeEventListener("message", onMessage);
      if (message.error) reject(new Error(JSON.stringify(message.error))); else resolve(message.result);
    };
    socket.addEventListener("message", onMessage);
    socket.send(JSON.stringify({ id, method, params }));
  });
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send("Emulation.setTouchEmulationEnabled", { enabled: true });

  const ev = async (expression) => {
    const { result, exceptionDetails } = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description || exceptionDetails.text);
    return result.value;
  };
  const goto = async (route) => {
    await send("Page.navigate", { url: `${origin}${route}` });
    await sleep(300);
    await waitFor(() => ev(`document.readyState === "complete" && Boolean(document.querySelector("main, [role=main], form"))`), `page ${route}`);
  };
  const setOffline = (offline) => send("Network.emulateNetworkConditions", { offline, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });

  // Page-side helpers, re-installed after every navigation.
  const helperSource = `(() => {
    const q = (label) => document.querySelector('[aria-label="' + label + '"]');
    const setValue = (el, value) => {
      const proto = el.tagName === "SELECT" ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
      el.dispatchEvent(new Event(el.tagName === "SELECT" ? "change" : "input", { bubbles: true }));
    };
    const button = (text) => [...document.querySelectorAll("button")].find((b) => b.textContent.trim().startsWith(text) || b.getAttribute("aria-label") === text);
    window.__acc = {
      q, setValue, button,
      type: (label, value) => { const el = q(label); if (!el) throw new Error("missing " + label); setValue(el, value); },
      click: (text) => { const b = button(text); if (!b) throw new Error("missing button " + text); b.click(); },
      articles: () => [...document.querySelectorAll(".quick-workout-card")].map((a) => ({ text: a.innerText.replace(/\\s+/g, " ").trim(), collapsed: a.classList.contains("quick-workout-card-collapsed"), done: a.dataset.done })),
      draft: () => { const k = Object.keys(localStorage).find((x) => x.startsWith("easylife.easyworkout.activeDraft.v3:")); return k ? { key: k, value: JSON.parse(localStorage.getItem(k)) } : null; },
      sessions: () => JSON.parse(sessionStorage.getItem("easyworkout:demo-added-sessions:v1") || "[]"),
      text: () => document.body.innerText.replace(/\\s+/g, " "),
      overflow: () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
    return true;
  })()`;
  const install = () => ev(helperSource);
  const open = async (route) => { await goto(route); await install(); };
  const step = async (name, fn) => {
    try { await fn(); results.push({ name, ok: true }); console.log(`ok   ${name}`); }
    catch (error) { results.push({ name, ok: false, error }); console.log(`FAIL ${name}\n     ${error.message}`); }
  };
  const A = (expr) => ev(`window.__acc.${expr}`);

  const startUrl = "/app/easyworkout/log?demo=1&workoutMode=1";
  await open(startUrl);
  await ev(`sessionStorage.clear(); Object.keys(localStorage).forEach((k) => localStorage.removeItem(k)); true`);
  await open(startUrl);

  await step("start: one blank focused exercise, three rows, no horizontal overflow at 390px", async () => {
    await waitFor(() => ev(`Boolean(window.__acc.q("Exercise 1 name"))`), "exercise name input");
    const cards = await A(`articles()`);
    assert.equal(cards.length, 1, "fresh focused start shows exactly one exercise");
    assert.equal(await ev(`document.querySelectorAll('[role=group][aria-label^="Exercise 1 set"]').length`), 3);
    assert.equal(await A(`overflow()`), false, "no horizontal overflow");
    assert.equal(await ev(`window.innerWidth`), 390);
  });

  await step("edit then Done & next exercise (rapid double click adds one exercise)", async () => {
    await A(`type("Exercise 1 name", "Lat Pulldown")`);
    await sleep(150);
    await A(`type("Lat Pulldown set 1 reps", "8")`);
    await A(`type("Lat Pulldown set 1 load in lb", "100")`);
    await sleep(150);
    await ev(`(() => { const b = window.__acc.button("Done & next exercise"); b.click(); b.click(); return true; })()`);
    await sleep(400);
    const cards = await A(`articles()`);
    assert.equal(cards.length, 2, `expected done + one blank next exercise, got ${JSON.stringify(cards.map((c) => c.text))}`);
    assert.equal(cards[0].done, "true");
    assert.match(cards[0].text, /1 set done/);
    assert.match(cards[1].text, /exercise 2/i);
  });

  await step("Undo done reverts, Done again re-completes; suggestions render below the final exercise", async () => {
    await A(`click("Undo done for Lat Pulldown")`);
    await sleep(300);
    let cards = await A(`articles()`);
    assert.equal(cards[0].done, "false");
    await A(`click("Done & next exercise")`);
    await sleep(300);
    cards = await A(`articles()`);
    assert.equal(cards.length, 2, "re-completing must not append another blank exercise");
    const order = await ev(`(() => { const cards = [...document.querySelectorAll(".quick-workout-card")]; const s = document.querySelector(".workout-next-lift-card"); const last = cards[cards.length - 1]; return { hasSuggestions: Boolean(s), below: Boolean(s && (last.compareDocumentPosition(s) & Node.DOCUMENT_POSITION_FOLLOWING)) }; })()`);
    assert.equal(order.hasSuggestions, true, "suggestions affordance present");
    assert.equal(order.below, true, "suggestions follow the final exercise");
  });

  const state = {};
  await step("draft is owner-scoped and records completion", async () => {
    const draft = await A(`draft()`);
    assert.ok(draft, "draft persisted");
    assert.ok(draft.key.endsWith("local-preview"), draft.key);
    state.draftId = draft.value.draftId;
    assert.ok(state.draftId);
  });

  await step("reload restores the same draft and completion state", async () => {
    await open(startUrl);
    await waitFor(() => A(`articles()`).then((c) => c.length >= 2), "restored cards");
    const draft = await A(`draft()`);
    assert.equal(draft.value.draftId, state.draftId, "same draft restored");
    const cards = await A(`articles()`);
    assert.match(cards[0].text, /Lat Pulldown/);
    console.log("     restored cards:", JSON.stringify(cards.map((c) => [c.done, c.text.slice(0, 80)])));
  });

  const key = (k, extra = {}) => send("Input.dispatchKeyEvent", { type: "keyDown", key: k, code: k, ...extra }).then(() => send("Input.dispatchKeyEvent", { type: "keyUp", key: k, code: k }));
  const active = () => ev(`document.activeElement?.getAttribute("aria-label") || document.activeElement?.textContent?.trim() || document.activeElement?.tagName`);

  await step("Last Sets copy is editable draft data and stays unperformed", async () => {
    await A(`type("Exercise 2 name", "Bench Press")`);
    await sleep(200);
    await A(`click("Use last sets")`).catch(async () => A(`click("Use last sets & setup")`));
    await sleep(300);
    const draft = (await A(`draft()`)).value;
    const bench = draft.exerciseLogs[1];
    assert.equal(bench.exerciseName, "Bench Press");
    assert.ok(bench.sets.some((set) => set.reps > 0 && set.weight > 0), "last sets copied into rows");
    assert.ok(bench.sets.every((set) => !set.completed), "copied rows are not completed");
    const cards = await A(`articles()`);
    assert.equal(cards[1].done, "false");
    assert.match(await A(`text()`), /nothing marked done|No set was marked done/i);
  });

  await step("exercise delete: confirmation, Escape cancels, focus returns to trigger", async () => {
    await A(`click("Delete exercise Bench Press")`);
    await sleep(200);
    assert.equal(await ev(`Boolean(document.querySelector('[role=group][aria-label="Confirm deleting Bench Press"]'))`), true);
    assert.equal(await active(), "Cancel", "focus moves to Cancel");
    await key("Escape");
    await sleep(200);
    assert.equal(await ev(`Boolean(document.querySelector('[role=group][aria-label="Confirm deleting Bench Press"]'))`), false);
    assert.equal(await active(), "Delete exercise Bench Press", "focus returns to the delete trigger");
    assert.equal((await A(`articles()`)).length, 2, "Escape deletes nothing");
  });

  await step("partial row blocks Save without a scroll jump", async () => {
    // Keep set 1 weighted-valid, make set 2 partial (reps, no load).
    await A(`type("Bench Press set 2 load in lb", "")`);
    await sleep(200);
    await ev(`window.scrollTo(0, 120); true`);
    await sleep(100);
    const before = await ev(`window.scrollY`);
    await A(`click("Save workout")`);
    await sleep(500);
    const after = await ev(`window.scrollY`);
    assert.ok(Math.abs(after - before) <= 1, `scroll jumped ${before} -> ${after}`);
    assert.equal((await A(`sessions()`)).length, 0, "nothing saved");
    assert.match(await A(`text()`), /load|reps|partial|finish/i);
    assert.equal(await ev(`window.__acc.q("Bench Press set 2 load in lb") === document.activeElement`), true, "focus on the field to fix");
  });

  await step("complete Bench via Done & next; never-done trailing exercise with copied sets is excluded", async () => {
    await A(`type("Bench Press set 2 load in lb", "135")`);
    await sleep(100);
    await A(`click("Done & next exercise")`);
    await sleep(400);
    let cards = await A(`articles()`);
    assert.equal(cards.length, 3);
    // Third exercise: copy last sets but never press Done.
    await A(`type("Exercise 3 name", "Seated Row")`);
    await sleep(200);
    await A(`click("Use last sets")`).catch(async () => A(`click("Use last sets & setup")`));
    await sleep(300);
    const draft = (await A(`draft()`)).value;
    assert.ok(draft.exerciseLogs[2].sets.some((set) => set.reps > 0 && set.weight > 0), "row copy populated");
    assert.ok(draft.exerciseLogs[2].sets.every((set) => !set.completed));
    state.benchSets = draft.exerciseLogs[1].sets.filter((set) => set.completed && !set.deleted).length;
    assert.ok(state.benchSets >= 1);
  });

  await step("offline save keeps the draft and reports retained", async () => {
    await setOffline(true);
    assert.equal(await ev(`navigator.onLine`), false);
    await A(`click("Save workout")`);
    await sleep(500);
    assert.match(await A(`text()`), /Couldn.t sync/);
    assert.ok(await A(`draft()`), "draft retained offline");
    assert.equal((await A(`sessions()`)).length, 0);
  });

  await step("online retry with double Save creates exactly one session", async () => {
    await setOffline(false);
    assert.equal(await ev(`navigator.onLine`), true);
    await ev(`(() => { const f = document.querySelector("form.task-composer"); f.requestSubmit(); f.requestSubmit(); return true; })()`);
    await waitFor(() => ev(`location.pathname.includes("/easyworkout/session/")`), "session page");
    await sleep(500);
    const sessions = await A(`sessions()`);
    assert.equal(sessions.length, 1, `expected one saved session, got ${sessions.length}`);
    assert.equal(sessions[0].clientDraftId, state.draftId, "retry reused the draft id (idempotent)");
    const names = sessions[0].exercises.map((exercise) => exercise.exerciseName);
    assert.deepEqual(names, ["Lat Pulldown", "Bench Press"], "only explicitly completed exercises saved");
    assert.deepEqual(sessions[0].exercises.map((exercise) => exercise.sets.length), [1, state.benchSets]);
    assert.equal(await A(`draft()`), null, "draft cleared only after confirmed save");
    state.saved = sessions[0];
  });

  await step("history/statistics reflect only the explicitly completed valid sets", async () => {
    const detail = await A(`text()`);
    const volume = state.saved.exercises.reduce((sum, ex) => sum + ex.sets.reduce((s, set) => s + set.reps * set.weight, 0), 0);
    const workingSets = state.saved.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    assert.ok(detail.includes(`WORKING SETS ${workingSets}`) || new RegExp(`working sets ${workingSets}`, "i").test(detail), `working sets ${workingSets} in: ${detail.slice(0, 300)}`);
    assert.ok(detail.includes(volume.toLocaleString("en-US")), `workload ${volume} in review`);
    assert.match(detail, /Bench Press: improving/);
    assert.doesNotMatch(detail, /Seated Row/, "never-Done copied sets are not counted");
    await open("/app/easyworkout?demo=1");
    await sleep(1200);
    const dashboard = await A(`text()`);
    assert.match(dashboard, /Bench Press 3 × 5 Previous: [^S]*Source 2026-10-03/, "saved Bench sets feed the guided plan");
    assert.match(dashboard, /Seated Row 3 × 6-10 Previous: 137\.5 lb × 8[^S]*Source 2026-07-26/, "never-Done copied Seated Row sets did not become history");
    await open("/app/easyworkout/log?demo=1");
    await sleep(800);
    assert.match(await A(`text()`), /1 workout logged today/, "double save produced one session in history");
  });

  await step("ambiguous (pre-v4) draft restores into review, focused mode hides mass completion, Save blocked", async () => {
    await open(startUrl);
    await A(`type("Exercise 1 name", "Chest Press")`);
    await sleep(200);
    await A(`type("Chest Press set 1 reps", "5")`);
    await A(`type("Chest Press set 1 load in lb", "50")`);
    await sleep(300);
    await open("/app/easyworkout?demo=1"); // leave the log route so its draft flush cannot overwrite the downgrade
    await ev(`(() => { const d = window.__acc.draft(); d.value.schemaVersion = 3; localStorage.setItem(d.key, JSON.stringify(d.value)); return true; })()`);
    await open(startUrl);
    await sleep(500);
    const text = await A(`text()`);
    assert.match(text, /Review complete/i);
    assert.doesNotMatch(text, /Mark all shown sets done/i);
    const before = (await A(`sessions()`)).length;
    await A(`click("Save workout")`);
    await sleep(400);
    assert.equal((await A(`sessions()`)).length, before, "ambiguous draft cannot be saved before review");
  });

  // @@END@@
} catch (error) {
  results.push({ name: "harness", ok: false, error });
  console.log(`FAIL harness\n     ${error.stack || error.message}`);
} finally {
  try { socket?.close(); } catch { /* ignore */ }
  await shutdown();
}

const failed = results.filter((r) => !r.ok);
console.log(`${results.length - failed.length}/${results.length} acceptance steps passed`);
process.exit(failed.length ? 1 : 0);
