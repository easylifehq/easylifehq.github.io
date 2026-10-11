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
const origin = process.env.WORKOUT_PREVIEW_ORIGIN || `http://127.0.0.1:${vitePort}`;
if (new URL(origin).protocol !== "http:" || new URL(origin).hostname !== "127.0.0.1") throw new Error("Planner dogfood requires an explicit loopback origin");
const profile = await mkdtemp(path.join(tmpdir(), "easylife-quick-acceptance-"));
const vite = process.env.WORKOUT_PREVIEW_ORIGIN ? null : spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", String(vitePort), "--strictPort"], { stdio: "ignore", windowsHide: true });
const browser = spawn(await findChrome(), [
  "--headless=new", "--disable-gpu", "--disable-extensions", "--disable-background-networking", "--disable-component-update",
  "--disable-sync", "--no-first-run", "--no-default-browser-check",
  `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, "about:blank",
], { stdio: "ignore", windowsHide: true });

async function shutdown() {
  if (!path.resolve(profile).startsWith(path.resolve(tmpdir()) + path.sep + "easylife-quick-acceptance-")) throw new Error("Unsafe synthetic profile cleanup path");
  browser.kill();
  vite?.kill();
  if (process.platform === "win32") {
    for (const child of [browser, vite].filter(Boolean)) if (child.pid) spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], { windowsHide: true });
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


  const startUrl="/app/easyworkout/log?demo=1&workoutMode=1";
  await open(startUrl);await ev('sessionStorage.clear();localStorage.clear();true');await open(startUrl);
  await step('45-minute remaining plan contains several unperformed exercises with supplemental abs',async()=>{
    await waitFor(()=>ev('Boolean(window.__acc.q("Exercise 1 name"))'),'name');
    await ev('document.querySelector(".workout-strip-focus").open=true;true');await A('type("Session focus","Push")');await ev('window.__acc.q("Add supplemental abs").click();document.querySelector(".workout-next-lift-card").open=true;true');
    await A('type("Remaining minutes","45")');await A('click("Generate plan")');await sleep(350);
    const options=await ev('[...document.querySelectorAll(".workout-remaining-plan-option")].map(e=>({name:e.dataset.name,text:e.innerText}))');
    assert.ok(options.length>=3,JSON.stringify(options));assert.match(options.at(-1).text,/abs|core/i);
    assert.equal((await A('draft()')).value.exerciseLogs.filter(e=>e.exerciseName).length,0);
    assert.equal(await A('overflow()'),false);
  });
  await step('individual replacement leaves other proposals fixed and acceptance never completes a set',async()=>{
    const before=await ev('[...document.querySelectorAll(".workout-remaining-plan-option")].map(e=>e.dataset.name)');
    await A(`click(${JSON.stringify("Replace "+before[0])})`);await sleep(300);
    const firstReplacement=await ev('[...document.querySelectorAll(".workout-remaining-plan-option")].map(e=>e.dataset.name)');
    assert.notEqual(firstReplacement[0],before[0]);assert.deepEqual(firstReplacement.slice(1),before.slice(1));
    await A(`click(${JSON.stringify("Replace "+firstReplacement[0])})`);await sleep(300);
    const after=await ev('[...document.querySelectorAll(".workout-remaining-plan-option")].map(e=>e.dataset.name)');
    assert.ok(![before[0],firstReplacement[0]].includes(after[0]),JSON.stringify({before,firstReplacement,after}));
    assert.deepEqual(after.slice(1),before.slice(1));
    await ev(`(() => {const b=window.__acc.button(${JSON.stringify("Accept "+after[0])});b.click();b.click();return true})()`);await sleep(400);
    const draft=(await A('draft()')).value;const added=draft.exerciseLogs.filter(e=>e.exerciseName===after[0]);
    assert.equal(added.length,1);assert.ok(added[0].sets.every(s=>!s.completed&&s.weight===0&&s.reps===0));
    assert.equal(await A('overflow()'),false);
    const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await writeFile('../../planner-mobile.png',Buffer.from(shot.data,'base64'));
  });
  await step('sets-only planning survives draft reload; proposals stay separate from performed records',async()=>{
    await A('type("Remaining budget type","sets")');await A('type("Remaining sets","8")');await A('click("Generate plan")');await sleep(350);
    const counts=await ev('[...document.querySelectorAll(".workout-remaining-plan-option")].map(e=>Number(e.dataset.sets))');
    assert.ok(counts.length>=2);assert.ok(counts.reduce((a,b)=>a+b,0)<=8);
    await open(startUrl);await sleep(400);const draft=(await A('draft()')).value;
    assert.deepEqual(draft.planningContext.remainingBudget,{kind:'sets',amount:8});assert.ok(draft.exerciseLogs.every(e=>e.sets.every(s=>!s.completed)));
    assert.equal((await A('sessions()')).length,0);assert.equal(await A('overflow()'),false);
  });
  await step('supplemental abs alone request a main focus rather than fabricate a whole abs workout',async()=>{
    await ev('document.querySelector(".workout-strip-focus").open=true;document.querySelector(".workout-next-lift-card").open=true;true');
    await A('type("Session focus","Any")');await A('click("Generate plan")');await sleep(300);
    assert.equal(await ev('document.querySelectorAll(".workout-remaining-plan-option").length'),0);
    assert.match(await A('text()'),/Choose a focus above/);
  });
  await step('cardio proposes timed blocks and accepted duration stays blank at narrow phone widths',async()=>{
    await A('type("Session focus","Cardio")');await A('type("Remaining budget type","time")');await A('type("Remaining minutes","15")');await A('click("Generate plan")');await sleep(350);
    const name=await ev('[...document.querySelectorAll(".workout-remaining-plan-option")].find(e=>/conditioning/i.test(e.innerText))?.dataset.name');assert.ok(name);
    await A(`click(${JSON.stringify("Accept "+name)})`);await sleep(350);
    const added=(await A('draft()')).value.exerciseLogs.find(e=>e.exerciseName===name);
    assert.ok(['duration','distance'].includes(added.exerciseType));assert.ok(added.sets.every(s=>!s.completed&&!s.weight&&!s.reps&&!s.durationSeconds&&!s.distanceMeters));
    await send('Emulation.setDeviceMetricsOverride',{width:320,height:844,deviceScaleFactor:2,mobile:true});await sleep(250);assert.equal(await A('overflow()'),false);
    await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});await sleep(250);assert.equal(await A('overflow()'),false);
    const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await writeFile('../../planner-cardio-mobile.png',Buffer.from(shot.data,'base64'));
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
