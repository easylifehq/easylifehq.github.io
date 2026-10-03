import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  workoutDraftStatusCopy,
  workoutDraftStatusDetailCopy,
} from "../src/features/easyworkout/domain/workoutDraftLifecycle.ts";

const chromeCandidates = process.platform === "win32"
  ? [
      process.env.CHROME_PATH,
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    ]
  : process.platform === "darwin"
    ? [process.env.CHROME_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
    : [process.env.CHROME_PATH, "google-chrome", "chromium", "chromium-browser"];

async function reservePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function findChrome() {
  for (const candidate of chromeCandidates.filter(Boolean)) {
    if (path.isAbsolute(candidate)) {
      try {
        await access(candidate);
        return candidate;
      } catch {
        continue;
      }
    }
    const lookup = spawnSync(process.platform === "win32" ? "where" : "which", [candidate], {
      encoding: "utf8",
      windowsHide: true,
    });
    const resolved = lookup.status === 0 ? lookup.stdout.split(/\r?\n/).find(Boolean)?.trim() : "";
    if (resolved) return resolved;
  }
  throw new Error("Chrome or Edge was not found. Set CHROME_PATH to run rendered workout layout verification.");
}

async function removeProfileAfterBrowserExit(profile) {
  let lastError;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
      await new Promise((resolve) => setTimeout(resolve, 100));
      await access(profile);
    } catch (error) {
      if (error?.code === "ENOENT") return;
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw lastError || new Error(`Headless browser profile was recreated after cleanup: ${profile}`);
}

async function waitForTarget(port) {
  let lastError;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const targets = await fetch(`http://127.0.0.1:${port}/json`).then((response) => response.json());
      const target = targets.find((item) => item.type === "page" && item.url.startsWith("data:text/html"));
      if (target) return target;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw lastError || new Error("Timed out waiting for the headless browser target.");
}

function connect(webSocketDebuggerUrl) {
  const socket = new WebSocket(webSocketDebuggerUrl);
  const ready = new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  let nextId = 1;
  const send = async (method, params = {}) => {
    await ready;
    return new Promise((resolve, reject) => {
      const id = nextId++;
      const timeout = setTimeout(() => reject(new Error(`${method} timed out`)), 10000);
      const onMessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.id !== id) return;
        clearTimeout(timeout);
        socket.removeEventListener("message", onMessage);
        if (message.error) reject(new Error(JSON.stringify(message.error)));
        else resolve(message.result);
      };
      socket.addEventListener("message", onMessage);
      socket.send(JSON.stringify({ id, method, params }));
    });
  };
  return { socket, send };
}

const css = await readFile(new URL("../src/styles/globals.css", import.meta.url), "utf8");
const profile = await mkdtemp(path.join(tmpdir(), "easylife-workout-layout-"));
const port = await reservePort();
const chrome = await findChrome();
const browser = spawn(chrome, [
  "--headless=new",
  "--disable-gpu",
  "--disable-extensions",
  "--disable-background-networking",
  "--disable-component-update",
  "--disable-sync",
  "--no-first-run",
  "--no-default-browser-check",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  "data:text/html,<title>workout-layout</title>",
], { stdio: "ignore" });
const browserStarted = new Promise((resolve, reject) => {
  browser.once("spawn", resolve);
  browser.once("error", reject);
});

let connection;
try {
  await browserStarted;
  const target = await waitForTarget(port);
  connection = connect(target.webSocketDebuggerUrl);
  const { send } = connection;
  await send("Emulation.setDeviceMetricsOverride", {
    width: 320,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  const frameTree = await send("Page.getFrameTree");
  await send("Page.setDocumentContent", {
    frameId: frameTree.frameTree.frame.id,
    html: `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style>
      <form class="task-composer" style="width:276px">
        <label id="input-anchor">Workout input <input value="8"></label>
        <div class="workout-save-status status-saved-local" role="status" aria-live="polite" aria-atomic="true">
          <strong>${workoutDraftStatusCopy["saved-local"]}</strong><span>${workoutDraftStatusDetailCopy["saved-local"]}</span>
        </div>
        <div class="workout-action-message" role="status" aria-live="polite" aria-atomic="true"></div>
        <div class="workout-validation-message" role="status" aria-live="polite" aria-atomic="true"></div>
      </form>`,
  });
  const evaluation = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const box = (selector) => {
        const element = document.querySelector(selector);
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return { top: rect.top, height: rect.height, width: rect.width, position: style.position, clip: style.clip };
      };
      const status = document.querySelector('.workout-save-status');
      const statusTitle = status.querySelector('strong');
      const statusDetail = status.querySelector('span');
      const action = document.querySelector('.workout-action-message');
      const validation = document.querySelector('.workout-validation-message');
      const initial = { anchor: box('#input-anchor'), status: box('.workout-save-status'), action: box('.workout-action-message'), validation: box('.workout-validation-message'), form: box('form') };
      status.className = 'workout-save-status status-saving-local';
      statusTitle.textContent = ${JSON.stringify(workoutDraftStatusCopy["saving-local"])};
      statusDetail.textContent = ${JSON.stringify(workoutDraftStatusDetailCopy["saving-local"])};
      const saving = { anchor: box('#input-anchor'), status: box('.workout-save-status'), action: box('.workout-action-message'), validation: box('.workout-validation-message'), form: box('form') };
      status.className = 'workout-save-status status-saved-local';
      statusTitle.textContent = ${JSON.stringify(workoutDraftStatusCopy["saved-local"])};
      statusDetail.textContent = ${JSON.stringify(workoutDraftStatusDetailCopy["saved-local"])};
      const saved = { anchor: box('#input-anchor'), status: box('.workout-save-status'), action: box('.workout-action-message'), validation: box('.workout-validation-message'), form: box('form') };
      action.innerHTML = '<div class="calendar-info-card workout-action-message-card">This workout changed in another tab. Reload before editing or saving so one tab does not overwrite the other.</div>';
      const longAction = { anchor: box('#input-anchor'), status: box('.workout-save-status'), action: box('.workout-action-message'), validation: box('.workout-validation-message'), form: box('form') };
      action.textContent = '';
      validation.textContent = 'Mark at least one set done before saving. Weighted sets also need reps and a positive load.';
      const validationMessage = { anchor: box('#input-anchor'), status: box('.workout-save-status'), action: box('.workout-action-message'), validation: box('.workout-validation-message'), form: box('form') };
      return { initial, saving, saved, longAction, validationMessage };
    })()`,
  });
  const metrics = evaluation.result.value;

  assert.equal(metrics.initial.action.position, "absolute");
  assert.equal(metrics.initial.action.width, 1);
  assert.equal(metrics.initial.action.height, 1);
  assert.equal(metrics.initial.validation.position, "absolute");
  assert.equal(metrics.initial.validation.width, 1);
  assert.equal(metrics.initial.validation.height, 1);
  assert.equal(metrics.initial.status.height, metrics.saving.status.height);
  assert.equal(metrics.initial.status.height, metrics.saved.status.height);
  assert.equal(metrics.initial.status.top, metrics.saving.status.top);
  assert.equal(metrics.initial.anchor.top, metrics.saving.anchor.top);
  assert.ok(metrics.longAction.action.height > 1);
  assert.equal(metrics.longAction.anchor.top, metrics.initial.anchor.top);
  assert.equal(metrics.longAction.status.top, metrics.initial.status.top);
  assert.ok(metrics.validationMessage.validation.height > 1);
  assert.equal(metrics.validationMessage.anchor.top, metrics.initial.anchor.top);
  assert.equal(metrics.validationMessage.status.top, metrics.initial.status.top);
  assert.ok(metrics.longAction.form.height > metrics.initial.form.height);
  assert.ok(metrics.validationMessage.form.height > metrics.initial.form.height);
  console.log(JSON.stringify(metrics, null, 2));
} finally {
  if (connection) {
    try {
      await connection.send("Browser.close");
    } catch {
      browser.kill();
    }
    connection.socket.close();
  } else {
    browser.kill();
  }
  if (browser.exitCode === null && browser.signalCode === null) {
    await Promise.race([
      new Promise((resolve) => browser.once("exit", resolve)),
      new Promise((resolve) => setTimeout(resolve, 5000)),
    ]);
  }
  if (browser.exitCode === null && browser.signalCode === null) browser.kill();
  await removeProfileAfterBrowserExit(profile);
}
