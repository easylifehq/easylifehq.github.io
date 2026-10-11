// Focused quick-log acceptance journeys at 390x844 mobile emulation.
// Synthetic only: local Vite dev server on loopback, `?demo=1` (owner "local-preview", no Firebase), throwaway browser profile.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { access, mkdtemp, rm, writeFile } from "node:fs/promises";
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
  if (!path.resolve(profile).startsWith(path.resolve(tmpdir()) + path.sep + "easylife-quick-acceptance-")) throw new Error("Unsafe synthetic profile cleanup path");
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
  await send("Network.setBlockedURLs", { urls: ["*googleapis.com*", "*firebaseio.com*", "*firebaseapp.com*"] });
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
  await ev(`sessionStorage.clear(); localStorage.clear(); true`);
  await open(startUrl);
  await step("four decimal per-hand sets, quick note, warm-up and one blank row", async () => {
    await waitFor(() => ev(`Boolean(window.__acc.q("Exercise 1 name"))`), "name field");
    await A(`type("Exercise 1 name", "Pec Fly")`);
    await A(`type("Pec Fly variant", "Cable Pec Fly (middle)")`);
    await A(`type("Cable Pec Fly (middle) weight mode", "per-hand")`);
    await A(`type("Exercise 1 quick note", "Synthetic: middle tower")`);
    for (let i=1; i<=4; i++) {
      await A(`type("Cable Pec Fly (middle) set ${i} reps", "10")`);
      await A(`type("Cable Pec Fly (middle) set ${i} load in lb", "7")`);
      await A(`type("Cable Pec Fly (middle) set ${i} load in lb", "7.")`);
      await A(`type("Cable Pec Fly (middle) set ${i} load in lb", "7.5")`);
    }
    await A(`type("Cable Pec Fly (middle) set 5 type", "warmup")`);
    await A(`type("Cable Pec Fly (middle) set 5 reps", "5")`);
    await A(`type("Cable Pec Fly (middle) set 5 load in lb", "5")`);
    await sleep(600);
    const draft=(await A(`draft()`)).value;
    assert.equal(draft.exerciseLogs[0].loadMode,'per-hand');
    assert.equal(draft.exerciseLogs[0].sets.length,6);
    assert.ok(draft.exerciseLogs[0].sets.slice(0,4).every(s=>s.weight===7.5&&!s.completed));
    assert.match(await A(`text()`),/Working sets: 4/); assert.match(await A(`text()`),/Warm-ups: 1/);
    assert.equal(await A(`overflow()`),false);
    const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
    await writeFile('../logging-modes-mobile.png',Buffer.from(shot.data,'base64'));
  });
  await step("draft reload preserves mode, variant, note and exact decimal values", async()=>{
    await open(startUrl); await sleep(500);
    const draft=(await A(`draft()`)).value;
    assert.equal(draft.exerciseLogs[0].notes,'Synthetic: middle tower');
    assert.equal(draft.exerciseLogs[0].loadMode,'per-hand');
    assert.equal(draft.exerciseLogs[0].exerciseName,'Cable Pec Fly (middle)');
    assert.equal(draft.exerciseLogs[0].sets[0].weight,7.5);
    assert.equal(await A(`overflow()`),false);
  });
  await step("Done saves four performed sets, preserves mode, excludes warm-up and blank",async()=>{
    await A(`click("Done & next exercise")`); await sleep(400);
    assert.match((await A(`articles()`))[0].text,/4 sets done/);
    await A(`click("Save workout")`);
    await waitFor(()=>ev(`location.pathname.includes("/easyworkout/session/")`),'saved session'); await install();
    const saved=(await A(`sessions()`))[0];
    assert.equal(saved.exercises.length,1);assert.equal(saved.exercises[0].sets.length,4);
    assert.equal(saved.exercises[0].loadMode,'per-hand');
    assert.ok(saved.exercises[0].sets.every(s=>s.completed&&s.weight===7.5));
  });
  await step("new log remembers variant and mode; another mode never borrows historical sets",async()=>{
    await open(startUrl);await sleep(400);
    await A(`type("Exercise 1 name", "Cable Pec Fly (middle)")`);await sleep(300);
    assert.equal(await ev(`window.__acc.q("Cable Pec Fly (middle) weight mode").value`),'per-hand');
    assert.match(await A(`text()`),/Previous: 10 [x×] 7.5 lb/);
    assert.equal((await A(`draft()`)).value.exerciseLogs[0].sets[0].weight,0);
    await A(`type("Cable Pec Fly (middle) weight mode", "total")`);await sleep(300);
    assert.doesNotMatch(await A(`text()`),/Previous:/);
    assert.equal((await A(`draft()`)).value.exerciseLogs[0].sets[0].weight,0);
    await A(`type("Cable Pec Fly (middle) variant", "Cable Pec Fly (high to low)")`);await sleep(300);
    assert.doesNotMatch(await A(`text()`),/Previous:/);
    assert.equal((await A(`draft()`)).value.exerciseLogs[0].exerciseName,'Cable Pec Fly (high to low)');
    assert.equal(await A(`overflow()`),false);
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
