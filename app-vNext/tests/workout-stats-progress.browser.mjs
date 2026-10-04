// Bounded synthetic workout-statistics progress journey (390x844 and desktop). Local Vite on loopback, ?demo=1 fixtures, throwaway browser profile, no Firebase.
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


  const route = "/app/easystatistics?tab=workout&demo=1";
  const pick = async (name) => {
    await ev(`(() => { const i = document.querySelector(".workout-exercise-search input"); window.__acc.setValue(i, ${JSON.stringify(name)}); return true; })()`);
    await sleep(250);
  };
  const table = () => ev(`(() => { const t = document.querySelector(".workout-recent-table"); return t ? { headers: [...t.querySelectorAll("thead th")].map((h) => h.textContent.trim()), rows: t.querySelectorAll("tbody tr").length, caption: t.querySelector("caption")?.textContent, links: [...t.querySelectorAll("tbody a")].map((a) => a.getAttribute("href")), text: t.innerText } : null; })()`);

  await open(route);
  await waitFor(() => ev(`Boolean(document.querySelector(".workout-exercise-search input"))`), "workout stats tab");

  await step("390px: weighted recent sessions table with source links, demo isolation, no overflow", async () => {
    await pick("Bench Press");
    const t = await waitFor(table, "recent table");
    assert.equal(await ev(`window.innerWidth`), 390);
    assert.ok(t.headers.includes("Estimated 1RM (lb)"), t.headers.join("|"));
    assert.ok(t.rows >= 2 && t.rows <= 5);
    assert.ok(t.links.length === t.rows && t.links.every((href) => /^\/app\/easyworkout\/session\/.+\?demo=1$/.test(href)), t.links.join(","));
    assert.doesNotMatch(t.text, /NaN|Infinity|undefined/);
    assert.equal(await A(`overflow()`), false);
  });

  await step("390px: bodyweight shows reps only, no load or e1RM columns", async () => {
    await pick("Pull-up");
    const t = await waitFor(async () => { const x = await table(); return x && x.headers.includes("Best set reps") ? x : null; }, "bodyweight table");
    assert.ok(!t.headers.some((h) => /load|1RM|Workload/i.test(h)), t.headers.join("|"));
    assert.equal(await ev(`document.querySelector(".workout-recent-sessions").dataset.historyKind`), "bodyweight");
    assert.equal(await A(`overflow()`), false);
  });

  await step("390px: duration shows native seconds columns", async () => {
    await pick("Plank");
    const t = await waitFor(async () => { const x = await table(); return x && x.headers.includes("Longest set (s)") ? x : null; }, "duration table");
    assert.ok(!t.headers.some((h) => /load|1RM|reps/i.test(h)), t.headers.join("|"));
  });

  await step("exercise detail opens with the same comparison, demo back link, no overflow", async () => {
    await A(`click("Open full exercise detail")`).catch(() => ev(`[...document.querySelectorAll("a")].find((a) => a.textContent.includes("Open full exercise detail")).click()`));
    await waitFor(() => ev(`location.pathname.startsWith("/app/easyworkout/exercise/") && [...document.querySelectorAll("h1")].some((h) => h.textContent.trim() === "Plank")`), "exercise detail");
    assert.match(await ev(`location.search`), /demo=1/);
    assert.ok(await ev(`[...document.querySelectorAll("h1")].some((h) => h.textContent.trim() === "Plank")`), "detail heading " + await ev(`[...document.querySelectorAll("h1,h2")].map((h) => h.textContent).join("|")`));
    assert.match(await ev(`document.querySelector(".workout-recent-table caption").textContent`), /newest first/);
    assert.equal(await A(`overflow()`), false);
    assert.match(await ev(`[...document.querySelectorAll("a")].find((a) => a.textContent.includes("Back to Workout progress")).getAttribute("href")`), /demo=1/);
  });

  await step("desktop 1280x800: stats panel and detail render without horizontal overflow", async () => {
    await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    await open(route);
    await waitFor(() => ev(`Boolean(document.querySelector(".workout-exercise-search input"))`), "stats desktop");
    await pick("Bench Press");
    await waitFor(table, "desktop table");
    assert.equal(await ev(`window.innerWidth`), 1280);
    assert.equal(await A(`overflow()`), false);
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
console.log(`${results.length - failed.length}/${results.length} stats progress steps passed`);
process.exit(failed.length ? 1 : 0);
