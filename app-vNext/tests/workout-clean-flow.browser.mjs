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
  await send('Emulation.setFocusEmulationEnabled',{enabled:true});
  await open(startUrl);await ev('sessionStorage.clear();localStorage.clear();true');await open(startUrl);
  await step('four entered working rows complete as four; last set is explicitly labeled',async()=>{
    await waitFor(()=>ev('Boolean(window.__acc.q("Exercise 1 name"))'),'name');
    await A('type("Exercise 1 name","Lat Pulldown")');
    for(const [i,reps,load] of [[1,12,65],[2,12,70],[3,10,80],[4,7,95]]){
      await A('type('+JSON.stringify('Lat Pulldown set '+i+' reps')+','+JSON.stringify(String(reps))+')');
      await A('type('+JSON.stringify('Lat Pulldown set '+i+' load in lb')+','+JSON.stringify(String(load))+')');
    }
    await A('click("Done & next exercise")');await sleep(350);
    const cards=await A('articles()');assert.match(cards[0].text,/4 sets done/);assert.match(cards[0].text,/Last set: 7 reps x 95 lb/);
    assert.equal((await A('draft()')).value.exerciseLogs[0].sets.filter(s=>s.completed).length,4);
  });
  await step('bodyweight two reps accepts zero load and preserves optional added weight honestly',async()=>{
    await A('type("Exercise 2 name","Pull-ups")');await A('type("Pull-ups exercise type","bodyweight")');
    await A('type("Pull-ups set 1 reps","2")');await A('click("Done & next exercise")');await sleep(350);
    const row=(await A('draft()')).value.exerciseLogs[1];assert.equal(row.exerciseType,'bodyweight');assert.equal(row.sets[0].weight,0);assert.equal(row.sets[0].reps,2);assert.equal(row.sets[0].completed,true);
    assert.match((await A('articles()'))[1].text,/0 lb added/);
  });
  await step('each hand is discoverable, decimal stays 7.5, delete confirmation is a modal with cancel',async()=>{
    await A('type("Exercise 3 name","DB Lateral Raise")');await ev('window.__acc.q("DB Lateral Raise each hand").click();true');
    assert.match(await A('text()'),/Each hand/);
    await A('type("DB Lateral Raise set 1 reps","12")');await A('type("DB Lateral Raise set 1 load in lb","7.5")');await sleep(350);
    assert.equal((await A('draft()')).value.exerciseLogs[2].sets[0].weight,7.5);
    await A('click("Delete exercise DB Lateral Raise")');await sleep(150);
    assert.equal(await ev('Boolean(document.querySelector("dialog.quick-workout-confirm:modal"))'),true);
    const modalShot=await send('Page.captureScreenshot',{format:'png'});await writeFile('../../clean-flow-delete-modal.png',Buffer.from(modalShot.data,'base64'));
    await A('click("Cancel")');await sleep(100);assert.equal(await ev('Boolean(document.querySelector("dialog.quick-workout-confirm"))'),false);
    assert.equal((await A('draft()')).value.exerciseLogs[2].sets[0].weight,7.5);
  });
  await step('PPL controls visible by default with both supplements persisted and planned separately',async()=>{
    await open('/app/easyworkout/dashboard?demo=1');await ev('sessionStorage.clear();localStorage.clear();true');await open(startUrl);await waitFor(()=>ev('Boolean(window.__acc.q("Exercise 1 name"))'),'new synthetic draft');
    await A('type("Exercise 1 name","Bench Press")');await A('type("Exercise 1 quick note","Slow eccentric")');await A('type("Bench Press set 1 reps","8")');await A('type("Bench Press set 1 load in lb","100")');await A('click("Done & next exercise")');await sleep(350);
    assert.equal(await ev('Boolean(window.__acc.q("Session focus"))'),true);
    await A('type("Session focus","Push")');await ev('window.__acc.q("Add supplemental abs").click();true');await ev('window.__acc.q("Add supplemental cardio").click();true');await sleep(350);
    assert.deepEqual((await A('draft()')).value.planningContext.focusGroups,['Chest','Shoulders','Triceps','Core','Conditioning']);
    await ev('document.querySelector(".workout-next-lift-card").open=true;true');await A('type("Remaining minutes","45")');await A('click("Generate workout")');await sleep(300);
    const names=await ev('[...document.querySelectorAll(".workout-remaining-plan-option")].map(e=>e.innerText)');assert.ok(names.some(x=>/core/i.test(x)));assert.ok(names.some(x=>/conditioning/i.test(x)));assert.ok(names.some(x=>/chest|shoulders|triceps/i.test(x)));
    assert.equal(await ev('Boolean(document.querySelector(".app-search-command"))'),false);
  });
  await step('offline save retains exact draft and local backup includes performed and unperformed rows',async()=>{
    await sleep(350);
    const before=(await A('draft()')).value.exerciseLogs;
    await ev('window.__backupBlob=null;URL.createObjectURL=blob=>{window.__backupBlob=blob;return "blob:synthetic"};HTMLAnchorElement.prototype.click=function(){};true');
    await A('click("Download draft backup")');const backup=await ev('window.__backupBlob.text().then(JSON.parse)');assert.deepEqual(backup.exerciseLogs,before);
    await send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});await A('click("Save workout")');await sleep(350);
    assert.match(await A('text()'),/draft retained/i);assert.deepEqual((await A('draft()')).value.exerciseLogs,before);assert.equal((await A('sessions()')).length,0);
    await send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
    await open(startUrl);await sleep(350);assert.deepEqual((await A('draft()')).value.exerciseLogs,before);
    await send('Emulation.setDeviceMetricsOverride',{width:320,height:844,deviceScaleFactor:2,mobile:true});await sleep(150);assert.equal(await A('overflow()'),false);
    const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await writeFile('../../clean-flow-mobile.png',Buffer.from(shot.data,'base64'));
  });
  await step('synthetic confirmed save reaches optional score; sparse history honestly has no score',async()=>{
    await A('click("Save workout")');await waitFor(()=>ev('Boolean([...document.querySelectorAll("summary")].find(e=>e.textContent.includes("Optional workout score")))'),'confirmed demo review');
    await ev('[...document.querySelectorAll("summary")].find(e=>e.textContent.includes("Optional workout score")).click();true');
    assert.match(await A('text()'),/No score yet/);assert.match(await A('text()'),/Insufficient comparable history/);
    assert.equal((await A('sessions()')).length,1);
  });
  await step('learned quick notes appear only for the matching exercise; new typed names capitalize acronyms',async()=>{
    await open(startUrl);await waitFor(()=>ev('Boolean(window.__acc.q("Exercise 1 name"))'),'fresh log');
    await A('type("Exercise 1 name","Bench Press")');await sleep(150);
    assert.ok(await ev('[...document.querySelectorAll("datalist option")].some(o=>o.value==="Slow eccentric")'));
    await A('type("Exercise 1 quick note","Slow eccentric")');assert.equal(await ev('window.__acc.q("Exercise 1 quick note").value'),'Slow eccentric');
    await A('type("Exercise 1 name","Machine Pec Fly")');await sleep(150);assert.equal(await ev('[...document.querySelectorAll("datalist option")].some(o=>o.value==="Slow eccentric")'),false);
    await A('type("Exercise 1 name","db lateral raise")');await sleep(150);await ev('window.__acc.q("Exercise 1 name").focus();true');await sleep(100);assert.equal(await ev('document.activeElement===window.__acc.q("Exercise 1 name")'),true);await ev('window.__acc.q("Exercise 1 name").blur();true');await sleep(150);
    assert.equal(await ev('window.__acc.q("Exercise 1 name").value'),'DB Lateral Raise');
  });
  await step('capitalization retains cable variant selection; a warm-up never silently becomes a performed fourth set',async()=>{
    await A('type("Exercise 1 name","Cable Pec Fly (middle)")');await sleep(150);await ev('window.__acc.q("Exercise 1 name").focus();true');await sleep(100);await ev('window.__acc.q("Exercise 1 name").blur();true');await sleep(150);
    assert.equal(await ev('window.__acc.q("Cable Pec Fly (Middle) variant").value'),'Cable Pec Fly (middle)');
    await A('type("Exercise 1 name","Lat Pulldown")');
    for(const [i,reps,load] of [[1,12,65],[2,12,70],[3,10,80],[4,7,95]]){
      await A('type('+JSON.stringify('Lat Pulldown set '+i+' reps')+','+JSON.stringify(String(reps))+')');await A('type('+JSON.stringify('Lat Pulldown set '+i+' load in lb')+','+JSON.stringify(String(load))+')');
    }
    await A('type("Lat Pulldown set 1 type","warmup")');await A('click("Done & next exercise")');await sleep(350);
    assert.match((await A('articles()'))[0].text,/3 sets done.*1 warm-ups entered \(not marked done\)/);assert.equal((await A('draft()')).value.exerciseLogs[0].sets[0].completed,false);
  });

  await step('compact clean logger and full-workout acceptance are connected to the active draft',async()=>{
    await open('/app/easyworkout/dashboard?demo=1');await ev('sessionStorage.clear();localStorage.clear();true');await open(startUrl);await waitFor(()=>ev('Boolean(window.__acc.q("Exercise 1 name"))'),'new draft');
    assert.equal(await ev('document.querySelector(".quick-workout-load-controls")'),null);
    assert.equal(await ev('window.__acc.q("Remaining sets")'),null);
    await ev('document.querySelector(".workout-next-lift-card").open=true;true');await A('type("Remaining minutes","45")');await A('click("Generate workout")');await sleep(350);
    const proposed=await ev('[...document.querySelectorAll(".workout-remaining-plan-option")].map(e=>e.dataset.name)');assert.ok(proposed.length>=3);
    assert.match(await A('text()'),/completed workouts in the last 7 days/);
    const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await writeFile('../../clean-flow-whole-plan.png',Buffer.from(shot.data,'base64'));
    await ev('window.__acc.button("Add workout to this session").click();window.__acc.button("Add workout to this session").click();true');await sleep(350);
    let draft=(await A('draft()')).value;assert.deepEqual(draft.exerciseLogs.filter(e=>e.exerciseName).map(e=>e.exerciseName),proposed);assert.ok(draft.exerciseLogs.flatMap(e=>e.sets).every(s=>!s.completed&&s.weight===0&&s.reps===0));
    await open(startUrl);await sleep(350);draft=(await A('draft()')).value;assert.deepEqual(draft.exerciseLogs.filter(e=>e.exerciseName).map(e=>e.exerciseName),proposed);
    await ev('document.querySelector(".workout-next-lift-card").open=false;true');assert.equal(await A('overflow()'),false);
    const cleanShot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await writeFile('../../clean-flow-accepted-mobile.png',Buffer.from(cleanShot.data,'base64'));
  });
  await step('Each hand is a small checkbox near details; new rows use total and toggles never convert numbers',async()=>{
    const name=(await A('draft()')).value.exerciseLogs[0].exerciseName;
    await A('type('+JSON.stringify(name+' set 1 reps')+',"8")');await A('type('+JSON.stringify(name+' set 1 load in lb')+',"7.5")');await sleep(350);
    assert.equal((await A('draft()')).value.exerciseLogs[0].loadMode,'total');
    const checkbox=await ev('(()=>{const e=window.__acc.q('+JSON.stringify(name+' each hand')+');return {type:e.type,width:e.getBoundingClientRect().width,checked:e.checked,mixed:e.indeterminate}})()');assert.equal(checkbox.type,'checkbox');assert.ok(checkbox.width<=20);assert.equal(checkbox.checked,false);assert.equal(checkbox.mixed,false);
    await ev('window.__acc.q('+JSON.stringify(name+' each hand')+').click();true');await sleep(350);assert.equal((await A('draft()')).value.exerciseLogs[0].loadMode,'per-hand');assert.equal((await A('draft()')).value.exerciseLogs[0].sets[0].weight,7.5);
    await ev('window.__acc.q('+JSON.stringify(name+' each hand')+').click();true');await sleep(350);assert.equal((await A('draft()')).value.exerciseLogs[0].sets[0].weight,7.5);
  });
  await step('legacy unspecified draft keeps numbers and remains explicitly indeterminate until owner choice',async()=>{
    await open('/app/easyworkout/dashboard?demo=1');await ev('(()=>{const d=window.__acc.draft();delete d.value.exerciseLogs[0].loadMode;localStorage.setItem(d.key,JSON.stringify(d.value));return true})()');await open(startUrl);await sleep(350);
    const name=(await A('draft()')).value.exerciseLogs[0].exerciseName;assert.equal((await A('draft()')).value.exerciseLogs[0].loadMode,undefined);assert.equal((await A('draft()')).value.exerciseLogs[0].sets[0].weight,7.5);assert.equal(await ev('window.__acc.q('+JSON.stringify(name+' each hand')+').indeterminate'),true);
  });
  await step('all focus choices and individual muscles are accessible; explicit planning choices survive reload',async()=>{
    assert.deepEqual(await ev('[...window.__acc.q("Session focus").options].map(o=>o.value)'),['Any','Push','Pull','Legs','Cardio']);
    await A('type("Session focus","Pull")');await ev('document.querySelector(".workout-muscles-picker").open=true;true');assert.ok(await ev('[...document.querySelectorAll(".workout-muscles-picker label")].some(e=>e.innerText.includes("Back"))'));
    await ev('document.querySelector(".workout-next-lift-card").open=true;document.querySelector(".workout-planning-advanced").open=true;true');await A('type("Recorded rest days","2")');await sleep(350);await open(startUrl);await sleep(350);assert.equal((await A('draft()')).value.planningContext.recoveryDays,2);assert.equal((await A('draft()')).value.planningContext.focusPreset,'Pull');assert.equal(await A('overflow()'),false);
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
