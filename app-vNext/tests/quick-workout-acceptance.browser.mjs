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

  await step("start: one blank focused exercise, one blank row, no horizontal overflow at 390px", async () => {
    await waitFor(() => ev(`Boolean(window.__acc.q("Exercise 1 name"))`), "exercise name input");
    const cards = await A(`articles()`);
    assert.equal(cards.length, 1, "fresh focused start shows exactly one exercise");
    assert.equal(await ev(`document.querySelectorAll('[role=group][aria-label^="Exercise 1 set"]').length`), 1, "a new exercise starts with exactly one blank set row");
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
    // Copied rows start as one row. Re-entering set 1 completes it, which grows exactly one blank row;
    // typing reps only into that row then makes set 2 partial (reps, no load).
    await A(`type("Bench Press set 1 reps", "9")`);
    await sleep(150);
    assert.equal(await ev(`document.querySelectorAll('[role=group][aria-label^="Bench Press set"]').length`), 2, "completing the trailing row appends exactly one blank row");
    await A(`type("Bench Press set 1 reps", "10")`);
    await A(`type("Bench Press set 2 reps", "8")`);
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
    assert.ok(new RegExp(`Bench Press 3 × 5 Previous: [^S]*Source ${state.saved.performedOn}`).test(dashboard), "saved Bench sets feed the guided plan");
    const benchSourceHref = await ev(`(() => { const a = [...document.querySelectorAll("a")].find((link) => link.textContent.trim() === ${JSON.stringify(`Source ${state.saved.performedOn}`)}); return a ? a.getAttribute("href") : null; })()`);
    assert.equal(benchSourceHref, `/app/easyworkout/session/${encodeURIComponent(state.saved.id)}?demo=1`, "Bench guidance source links to the just-saved session");
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

  // ---- Set-entry dogfood gaps (synthetic data, fresh draft per step) ----
  const freshLog = async () => {
    await open("/app/easyworkout?demo=1"); // leave the log route so its draft flush cannot rewrite storage
    await ev(`sessionStorage.clear(); Object.keys(localStorage).forEach((k) => localStorage.removeItem(k)); true`);
    await open(startUrl);
    await waitFor(() => ev(`Boolean(window.__acc.q("Exercise 1 name"))`), "exercise name input");
  };
  const setRows = (name) => ev(`document.querySelectorAll('[role=group][aria-label^="${name} set"]').length`);
  const draftSets = async (index = 0) => (await A(`draft()`)).value.exerciseLogs[index].sets.filter((set) => !set.deleted);
  const isBlank = (set) => !(set.reps > 0) && !(set.weight > 0) && !(set.durationSeconds > 0) && !(set.distanceMeters > 0);
  const enterSet = async (name, n, reps, load) => {
    await A(`type("${name} set ${n} reps", "${reps}")`);
    await A(`type("${name} set ${n} load in lb", "${load}")`);
    await sleep(120);
  };
  const saveAndRead = async () => {
    await A(`click("Save workout")`);
    await waitFor(() => ev(`location.pathname.includes("/easyworkout/session/")`), "session page");
    await sleep(400);
    return A(`sessions()`);
  };

  await step("typing 7, ., 5 keeps 7.5 shown and stored, and it survives draft reload", async () => {
    await freshLog();
    await A(`type("Exercise 1 name", "Dumbbell Curl")`);
    await sleep(150);
    await A(`type("Dumbbell Curl set 1 reps", "10")`);
    const load = `window.__acc.q("Dumbbell Curl set 1 load in lb")`;
    for (const [typed, shown] of [["7", "7"], ["7.", "7."], ["7.5", "7.5"]]) {
      await A(`type("Dumbbell Curl set 1 load in lb", "${typed}")`);
      await sleep(120);
      assert.equal(await ev(`${load}.value`), shown, `field shows ${shown} after typing ${typed}`);
    }
    await sleep(300);
    assert.equal((await draftSets())[0].weight, 7.5, "stored weight is 7.5");
    await open(startUrl);
    await waitFor(() => ev(`Boolean(window.__acc.q("Dumbbell Curl set 1 load in lb"))`), "restored load field");
    assert.equal(await ev(`${load}.value`), "7.5", "restored field shows 7.5");
    assert.equal((await draftSets())[0].weight, 7.5, "restored stored weight is 7.5");
  });

  await step("repeated type/click/blur on a completed row leaves exactly one trailing blank row", async () => {
    await freshLog();
    await A(`type("Exercise 1 name", "Cable Fly")`);
    await sleep(150);
    for (let i = 0; i < 5; i++) {
      await enterSet("Cable Fly", 1, 8 + (i % 2), 50 + 5 * (i % 2));
      await ev(`(() => { const el = window.__acc.q("Cable Fly set 1 load in lb"); el.focus(); el.click(); el.blur(); return true; })()`);
      await sleep(120);
      assert.equal(await setRows("Cable Fly"), 2, `iteration ${i + 1}: one completed row plus one blank row in the DOM`);
    }
    await sleep(300);
    const sets = await draftSets();
    assert.equal(sets.length, 2, "draft holds exactly two rows");
    assert.equal(sets.filter(isBlank).length, 1, "exactly one blank row");
    assert.equal(isBlank(sets[sets.length - 1]), true, "the blank row is trailing");
  });

  await step("Done with one valid set plus its trailing blank succeeds and saves exactly one set", async () => {
    await freshLog();
    await A(`type("Exercise 1 name", "Leg Press")`);
    await sleep(150);
    await enterSet("Leg Press", 1, 10, 200);
    assert.equal(await setRows("Leg Press"), 2, "valid set plus its trailing blank");
    await A(`click("Done & next exercise")`);
    await sleep(400);
    const cards = await A(`articles()`);
    assert.equal(cards[0].done, "true", "Done succeeded");
    assert.match(cards[0].text, /1 set done/);
    const sessions = await saveAndRead();
    assert.equal(sessions.length, 1);
    assert.deepEqual(sessions[0].exercises.map((exercise) => exercise.sets.length), [1], "exactly one set saved");
  });

  await step("Done with three valid sets succeeds and saves exactly three sets, no empty rows", async () => {
    await freshLog();
    await A(`type("Exercise 1 name", "Shoulder Press")`);
    await sleep(150);
    await enterSet("Shoulder Press", 1, 10, 40);
    await enterSet("Shoulder Press", 2, 8, 45);
    await enterSet("Shoulder Press", 3, 6, 50);
    await A(`click("Done & next exercise")`);
    await sleep(400);
    const cards = await A(`articles()`);
    assert.equal(cards[0].done, "true", "Done succeeded");
    assert.match(cards[0].text, /3 sets done/);
    const sessions = await saveAndRead();
    assert.equal(sessions.length, 1);
    const saved = sessions[0].exercises.map((exercise) => exercise.sets);
    assert.deepEqual(saved.map((sets) => sets.length), [3], "exactly three sets saved");
    assert.ok(saved[0].every((set) => set.reps > 0 && set.weight > 0), "no empty rows saved");
  });

  await step("partial row (reps, no load) blocks Done with a stable message, aria-invalid, then load fixes it", async () => {
    await freshLog();
    await A(`type("Exercise 1 name", "Row Machine")`);
    await sleep(150);
    await enterSet("Row Machine", 1, 10, 80);
    await A(`type("Row Machine set 2 reps", "8")`);
    await sleep(200);
    const messageRe = /Set 2 needs [^.]*\. Finish it or clear it; nothing you entered was changed\./g;
    const messages = [];
    for (let i = 0; i < 3; i++) {
      await A(`click("Done & next exercise")`);
      await sleep(300);
      const found = (await A(`text()`)).match(messageRe) || [];
      assert.equal(found.length, 1, `click ${i + 1}: exactly one blocking message, got ${JSON.stringify(found)}`);
      messages.push(found[0]);
      const cards = await A(`articles()`);
      assert.equal(cards.length, 1, "no exercise added while blocked");
      assert.equal(cards[0].done, "false", "exercise not marked done");
      assert.equal(await ev(`window.__acc.q("Row Machine set 2 load in lb").getAttribute("aria-invalid")`), "true", "load field marked aria-invalid");
      assert.equal(await ev(`window.__acc.q("Row Machine set 2 reps").value`), "8", "entered reps preserved");
      assert.equal(await ev(`window.__acc.q("Row Machine set 1 load in lb").value`), "80", "entered load preserved");
    }
    assert.ok(messages.every((message) => message === messages[0]), `identical message text: ${JSON.stringify(messages)}`);
    await A(`type("Row Machine set 2 load in lb", "85")`);
    await sleep(200);
    assert.equal(await ev(`window.__acc.q("Row Machine set 2 load in lb").getAttribute("aria-invalid")`), null, "aria-invalid clears on edit");
    await A(`click("Done & next exercise")`);
    await sleep(400);
    const cards = await A(`articles()`);
    assert.equal(cards[0].done, "true", "Done succeeds once the load is entered");
    assert.match(cards[0].text, /2 sets done/);
  });

  // ---- Rendered-interaction coverage: working vs warm-up counts, Quick note persistence, reference-only hints ----
  const countSpans = () => ev(`[...document.querySelectorAll(".quick-workout-card .quick-workout-counts span")].map((span) => span.textContent.trim())`);
  const hints = () => ev(`[...document.querySelectorAll(".quick-workout-set-hint")].map((hint) => ({ text: hint.textContent.trim(), referenceOnly: hint.dataset.referenceOnly, row: hint.closest("[role=group]").getAttribute("aria-label") }))`);
  const setSnapshot = async (index = 0) => (await A(`draft()`)).value.exerciseLogs[index].sets.filter((set) => !set.deleted).map((set) => ({ reps: set.reps, weight: set.weight, completed: Boolean(set.completed), setType: set.setType }));

  await step("counts: valid working vs warm-up counted separately; blank excluded, partial row preserved and not counted", async () => {
    await freshLog();
    await A(`type("Exercise 1 name", "Count Check Curl")`);
    await sleep(150);
    assert.deepEqual(await countSpans(), ["Working sets: 0", "Warm-ups: 0"], "a new blank row counts as nothing");
    await enterSet("Count Check Curl", 1, 10, 100);
    assert.deepEqual(await countSpans(), ["Working sets: 1", "Warm-ups: 0"], "one valid working set; trailing blank excluded");
    await A(`type("Count Check Curl set 2 type", "warmup")`);
    await enterSet("Count Check Curl", 2, 5, 40);
    assert.deepEqual(await countSpans(), ["Working sets: 1", "Warm-ups: 1"], "valid warm-up is counted separately, not as working");
    assert.equal(await setRows("Count Check Curl"), 3, "trailing blank row present");
    await A(`type("Count Check Curl set 3 reps", "6")`);
    await sleep(200);
    assert.deepEqual(await countSpans(), ["Working sets: 1", "Warm-ups: 1", "Incomplete: 1"], "partial row is reported but not counted as working or warm-up");
    await sleep(300);
    const sets = await setSnapshot();
    assert.deepEqual(sets.slice(0, 3).map((set) => [set.reps, set.weight, set.setType]), [[10, 100, "standard"], [5, 40, "warmup"], [6, 0, "standard"]], "partial row values preserved in the draft");
    await A(`type("Count Check Curl set 3 reps", "")`);
    await sleep(200);
    assert.deepEqual(await countSpans(), ["Working sets: 1", "Warm-ups: 1"], "clearing the partial row returns it to excluded-blank");
  });

  await step("Quick note: long note edits, mirrors Exercise details notes, persists after reload, no truncation", async () => {
    await freshLog();
    await A(`type("Exercise 1 name", "Note Check Press")`);
    await sleep(150);
    const note = `Neutral grip, 3-1-1 tempo, seat 4. ${"Pause at the bottom. ".repeat(14)}End.`;
    assert.ok(note.length > 300, "note is long enough to expose truncation");
    await A(`type("Exercise 1 quick note", ${JSON.stringify(note)})`);
    await sleep(400);
    assert.equal(await ev(`window.__acc.q("Exercise 1 quick note").value`), note, "field shows the full note");
    assert.equal(await ev(`document.querySelector(".quick-workout-more textarea").value`), note, "Exercise details notes is the same field, not a separate store");
    const draft = (await A(`draft()`)).value;
    assert.equal(draft.exerciseLogs[0].notes, note, "stored in the existing exercise notes field untruncated");
    await open(startUrl);
    await waitFor(() => ev(`Boolean(window.__acc.q("Exercise 1 quick note"))`), "restored quick note");
    assert.equal(await ev(`window.__acc.q("Exercise 1 quick note").value`), note, "note restored after reload");
    assert.equal((await A(`draft()`)).value.exerciseLogs[0].notes, note, "restored stored note untruncated");
    await enterSet("Note Check Press", 1, 8, 60);
    await A(`click("Done & next exercise")`);
    await sleep(400);
    const sessions = await saveAndRead();
    assert.equal(sessions[0].exercises[0].notes, note, "saved session keeps the full note");
  });

  await step("prior-set hints are reference-only: no draft, completion or count change until explicit entry, Use last, Done", async () => {
    await freshLog();
    await A(`type("Exercise 1 name", "Seated Row")`);
    await waitFor(() => hints().then((list) => list.length > 0), "prior-set hints");
    await sleep(300);
    const shown = await hints();
    assert.ok(shown.every((hint) => hint.referenceOnly === "true" && /^Previous: \d+ × \d+(\.\d)? lb$/.test(hint.text)), `reference-only hint text: ${JSON.stringify(shown)}`);
    assert.equal(shown[0].row, "Seated Row set 1");
    const hintText = shown[0].text;
    assert.deepEqual(await setSnapshot(), [{ reps: 0, weight: 0, completed: false, setType: "standard" }], "showing a hint left the blank draft row untouched");
    assert.equal(await ev(`window.__acc.q("Seated Row set 1 reps").value`), "", "hint is not written into the reps field");
    assert.equal(await ev(`window.__acc.q("Seated Row set 1 load in lb").value`), "", "hint is not written into the load field");
    assert.deepEqual(await countSpans(), ["Working sets: 0", "Warm-ups: 0"], "hints do not count as working sets or warm-ups");
    assert.equal((await A(`articles()`))[0].done, "false", "hints do not mark the exercise performed");
    // Explicit entry counts; the hint stays the same reference text.
    await enterSet("Seated Row", 1, 5, 100);
    await sleep(300);
    assert.deepEqual((await setSnapshot())[0], { reps: 5, weight: 100, completed: false, setType: "standard" }, "explicit entry is what the draft holds");
    assert.equal((await hints())[0].text, hintText, "hint text does not follow what was typed");
    assert.deepEqual(await countSpans(), ["Working sets: 1", "Warm-ups: 0"], "only the explicit row counts");
    // A warm-up row carries no working-set hint and counts do not move because of hints.
    await A(`type("Seated Row set 2 type", "warmup")`);
    await sleep(200);
    assert.equal((await hints()).some((hint) => hint.row === "Seated Row set 2"), false, "warm-up rows show no working-set hint");
    assert.deepEqual(await countSpans(), ["Working sets: 1", "Warm-ups: 0"], "an empty warm-up row with a nearby hint is not counted");
    // Use last is an explicit copy into editable, unperformed draft rows.
    await A(`click("Use last sets")`);
    await sleep(400);
    const copied = await setSnapshot();
    assert.ok(copied.some((set) => set.reps > 0 && set.weight > 0), "Use last copied values into the draft");
    assert.ok(copied.every((set) => !set.completed), "copied rows are not completed");
    assert.equal((await A(`articles()`))[0].done, "false", "Use last does not mark the exercise done");
    const validCopied = copied.filter((set) => set.reps > 0 && set.weight > 0);
    const spans = await countSpans();
    assert.equal(spans[0], `Working sets: ${validCopied.filter((set) => set.setType !== "warmup").length}`, "counts follow draft rows, not hints");
    // Done is the explicit completion.
    await A(`click("Done & next exercise")`);
    await sleep(400);
    const cards = await A(`articles()`);
    assert.equal(cards[0].done, "true", "Done explicitly completes");
    const workingCopied = validCopied.filter((set) => set.setType !== "warmup").length;
    assert.match(cards[0].text, new RegExp(`^.*${workingCopied} sets? done`), "Done completes the working sets only");
    const finalSets = await setSnapshot();
    assert.equal(finalSets.filter((set) => set.completed).length, workingCopied, "no warm-up or hint-only row was marked performed");
    assert.equal(finalSets.some((set) => set.setType === "warmup" && set.reps > 0), true, "warm-up row values stay preserved, not discarded");
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
