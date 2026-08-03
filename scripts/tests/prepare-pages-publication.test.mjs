import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import {
  copyFile,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  EXIT,
  HASH_INVENTORY_PATH,
  MANIFEST_PATH,
  PublicationError,
  analyzePublication,
  applyPublication,
  normalizeRelativePath,
  planPublication,
  runCli,
  stagePublication,
  verifyStagedCandidate,
} from "../prepare-pages-publication.mjs";

const execFile = promisify(execFileCallback);
const SOURCE_SHA = "a".repeat(40);
const BUILD_TIMESTAMP = "2026-08-03T12:34:56.000Z";
const METADATA = {
  sourceSha: SOURCE_SHA,
  buildTimestamp: BUILD_TIMESTAMP,
  buildTimestampPolicy: "test-fixture",
};

async function write(target, contents = "") {
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, contents);
}

async function makeFixture() {
  const parent = await mkdtemp(path.join(os.tmpdir(), "easylife-publication-test-"));
  const repo = path.join(parent, "repo");
  const dist = path.join(repo, "app-vNext", "dist");
  await mkdir(path.join(repo, ".git"), { recursive: true });
  await mkdir(path.join(repo, "scripts"), { recursive: true });
  await write(path.join(repo, "CODEX.md"), "# EasyLife fixture\n");
  await write(path.join(repo, "app-vNext", "package.json"), `${JSON.stringify({ name: "easy-system-app-vnext", version: "9.9.9" })}\n`);
  await write(path.join(repo, "CNAME"), "fixture.easylife.test\n");
  await write(path.join(repo, ".nojekyll"), "\n");
  await write(path.join(repo, "README-preserved.txt"), "unknown root file must remain\n");
  await write(path.join(repo, "index.html"), "old entry\n");
  await write(path.join(repo, "404.html"), "old fallback\n");
  await write(path.join(repo, "sw.js"), "old worker\n");
  await write(path.join(repo, "manifest.webmanifest"), "{}\n");
  await write(path.join(repo, "assets", "old-STALE.js"), "old\n");
  await write(path.join(repo, "icons", "obsolete.png"), "old\n");

  await write(path.join(dist, "index.html"), [
    "<!doctype html>",
    '<html><head><link rel="stylesheet" href="/assets/app-ABC123.css"></head>',
    '<body><div id="root"></div><script type="module" src="/assets/app-ABC123.js"></script></body></html>',
    "",
  ].join("\n"));
  await write(path.join(dist, "manifest.webmanifest"), `${JSON.stringify({
    name: "EasyLife",
    icons: [
      { src: "/icons/easylife-icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icons/easylife-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/easylife-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  }, null, 2)}\n`);
  await write(path.join(dist, "sw.js"), 'const CACHE_NAME = "easylife-shell-test";\n');
  await write(path.join(dist, "assets", "app-ABC123.js"), 'document.querySelector("#root");\n');
  await write(path.join(dist, "assets", "app-ABC123.css"), "body { color: #123; }\n");
  await write(path.join(dist, "icons", "easylife-icon.svg"), '<svg xmlns="http://www.w3.org/2000/svg"></svg>\n');
  await write(path.join(dist, "icons", "easylife-icon-192.png"), Buffer.from([1, 2, 3]));
  await write(path.join(dist, "icons", "easylife-icon-512.png"), Buffer.from([4, 5, 6]));
  await write(path.join(dist, "icons", "easylife-apple-touch-icon.png"), Buffer.from([7, 8, 9]));
  return { parent, repo, dist };
}

async function digestTree(root) {
  const records = [];
  async function walk(current, relative = "") {
    for (const entry of (await readdir(current, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      if (relative === "" && entry.name === ".git") continue;
      const childRelative = relative ? `${relative}/${entry.name}` : entry.name;
      const child = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(child, childRelative);
      else records.push(`${childRelative}:${createHash("sha256").update(await readFile(child)).digest("hex")}`);
    }
  }
  await walk(root);
  return records;
}

async function copyManagedCandidateToRoot(candidate, repo) {
  for (const relative of ["index.html", "404.html", "sw.js", "manifest.webmanifest", MANIFEST_PATH, HASH_INVENTORY_PATH]) {
    await copyFile(path.join(candidate, relative), path.join(repo, relative));
  }
  await rm(path.join(repo, "assets"), { recursive: true, force: true });
  await rm(path.join(repo, "icons"), { recursive: true, force: true });
  await cp(path.join(candidate, "assets"), path.join(repo, "assets"), { recursive: true });
  await cp(path.join(candidate, "icons"), path.join(repo, "icons"), { recursive: true });
}

test("creates a complete deterministic candidate and preserves CNAME", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture.parent, { recursive: true, force: true }));
  const stage = path.join(fixture.parent, "candidate");
  const result = await stagePublication({ repoRoot: fixture.repo, buildRoot: fixture.dist, stageRoot: stage, metadata: METADATA });
  assert.equal(result.changed, true);
  const manifest = await verifyStagedCandidate(stage);
  assert.equal(manifest.source.sha, SOURCE_SHA);
  assert.equal(manifest.source.applicationVersion, "9.9.9");
  assert.equal(manifest.build.timestamp, BUILD_TIMESTAMP);
  assert.deepEqual(manifest.files.map((record) => record.path), [...manifest.files.map((record) => record.path)].sort());
  assert.deepEqual(await readFile(path.join(stage, "index.html")), await readFile(path.join(stage, "404.html")));
  assert.deepEqual(await readFile(path.join(stage, "CNAME")), await readFile(path.join(fixture.repo, "CNAME")));
});

test("repeat staging is byte-idempotent", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture.parent, { recursive: true, force: true }));
  const stage = path.join(fixture.parent, "candidate");
  const first = await stagePublication({ repoRoot: fixture.repo, buildRoot: fixture.dist, stageRoot: stage, metadata: METADATA });
  const before = await digestTree(stage);
  const second = await stagePublication({ repoRoot: fixture.repo, buildRoot: fixture.dist, stageRoot: stage, metadata: METADATA });
  assert.equal(first.changed, true);
  assert.equal(second.changed, false);
  assert.deepEqual(await digestTree(stage), before);
});

test("plans explicit stale managed assets while leaving unknown root files untouched", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture.parent, { recursive: true, force: true }));
  const stage = path.join(fixture.parent, "candidate");
  await stagePublication({ repoRoot: fixture.repo, buildRoot: fixture.dist, stageRoot: stage, metadata: METADATA });
  const plan = await planPublication({ repoRoot: fixture.repo, candidateRoot: stage });
  assert.ok(plan.delete.includes("assets/old-STALE.js"));
  assert.ok(plan.delete.includes("icons/obsolete.png"));
  assert.equal([...plan.create, ...plan.update, ...plan.delete].includes("README-preserved.txt"), false);
  assert.equal(await readFile(path.join(fixture.repo, "README-preserved.txt"), "utf8"), "unknown root file must remain\n");
});

test("normalizes Windows separators and rejects Windows, Linux, and traversal escapes", () => {
  assert.equal(normalizeRelativePath("assets\\chunk-ABC.js"), "assets/chunk-ABC.js");
  assert.equal(normalizeRelativePath("assets/chunk-ABC.js"), "assets/chunk-ABC.js");
  for (const unsafe of ["../old-site/x.js", "assets/../../docs/x", "/etc/passwd", "C:\\Users\\name\\secret", "assets//x.js"]) {
    assert.throws(() => normalizeRelativePath(unsafe), PublicationError);
  }
});

test("rejects an escaping symlink in build output", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture.parent, { recursive: true, force: true }));
  const outside = path.join(fixture.parent, "outside");
  await mkdir(outside);
  await write(path.join(outside, "escape.js"), "outside\n");
  try {
    await symlink(outside, path.join(fixture.dist, "assets", "escape"), "junction");
  } catch (error) {
    if (error.code === "EPERM") return t.skip("Host does not permit test symlinks.");
    throw error;
  }
  await assert.rejects(
    stagePublication({ repoRoot: fixture.repo, buildRoot: fixture.dist, stageRoot: path.join(fixture.parent, "candidate"), metadata: METADATA }),
    /Symbolic links are prohibited/,
  );
});

test("rejects missing and malformed build entrypoints", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture.parent, { recursive: true, force: true }));
  await rm(path.join(fixture.dist, "sw.js"));
  await assert.rejects(
    stagePublication({ repoRoot: fixture.repo, buildRoot: fixture.dist, stageRoot: path.join(fixture.parent, "missing"), metadata: METADATA }),
    /Required build output missing: sw.js/,
  );
  await write(path.join(fixture.dist, "sw.js"), "worker\n");
  await write(path.join(fixture.dist, "index.html"), "<html>broken</html>\n");
  await assert.rejects(
    stagePublication({ repoRoot: fixture.repo, buildRoot: fixture.dist, stageRoot: path.join(fixture.parent, "malformed"), metadata: METADATA }),
    /Malformed index.html/,
  );
});

test("rejects source, documentation, archive, credential, and source-map content", async (t) => {
  const prohibited = [
    ["old-site/legacy.js", "legacy"],
    ["docs/readme.js", "docs"],
    ["app-vNext/source.js", "source"],
    ["firebase.json", "{}"],
    ["assets/app-ABC123.js.map", "{}"],
    ["assets/service-account.json", "{}"],
  ];
  for (const [relative, contents] of prohibited) {
    await t.test(relative, async (subtest) => {
      const fixture = await makeFixture();
      subtest.after(() => rm(fixture.parent, { recursive: true, force: true }));
      await write(path.join(fixture.dist, ...relative.split("/")), contents);
      await assert.rejects(
        stagePublication({ repoRoot: fixture.repo, buildRoot: fixture.dist, stageRoot: path.join(fixture.parent, "candidate"), metadata: METADATA }),
        PublicationError,
      );
    });
  }
});

test("rejects credential-shaped content and absolute machine paths", async (t) => {
  for (const contents of [
    'const token = "gho_abcdefghijklmnopqrstuvwxyz123456";\n',
    'const local = "C:\\\\Users\\\\someone\\\\project";\n',
    'const runner = "/home/runner/work/repo/file";\n',
  ]) {
    const fixture = await makeFixture();
    t.after(() => rm(fixture.parent, { recursive: true, force: true }));
    await write(path.join(fixture.dist, "assets", "leak-ABC.js"), contents);
    await assert.rejects(
      stagePublication({ repoRoot: fixture.repo, buildRoot: fixture.dist, stageRoot: path.join(fixture.parent, "candidate"), metadata: METADATA }),
      PublicationError,
    );
  }
});

test("allows only the explicitly approved public Firebase web API key", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture.parent, { recursive: true, force: true }));
  const publicKey = "AIza012345678901234567890123456789";
  await write(path.join(fixture.dist, "assets", "firebase-public.js"), `const apiKey="${publicKey}";\n`);
  await assert.rejects(
    stagePublication({ repoRoot: fixture.repo, buildRoot: fixture.dist, stageRoot: path.join(fixture.parent, "rejected"), metadata: METADATA }),
    /Unapproved Firebase web API key/,
  );
  const prior = process.env.VITE_FIREBASE_API_KEY;
  process.env.VITE_FIREBASE_API_KEY = publicKey;
  try {
    await stagePublication({ repoRoot: fixture.repo, buildRoot: fixture.dist, stageRoot: path.join(fixture.parent, "approved"), metadata: METADATA });
  } finally {
    if (prior === undefined) delete process.env.VITE_FIREBASE_API_KEY;
    else process.env.VITE_FIREBASE_API_KEY = prior;
  }
});

test("dry-run analysis changes zero repository bytes", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture.parent, { recursive: true, force: true }));
  const before = await digestTree(fixture.repo);
  const plan = await analyzePublication({ repoRoot: fixture.repo, buildRoot: fixture.dist, metadata: METADATA });
  assert.equal(plan.status, "mismatch");
  assert.deepEqual(await digestTree(fixture.repo), before);
});

test("check mode returns deterministic mismatch and success exit codes", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture.parent, { recursive: true, force: true }));
  assert.equal(await runCli(["--check", "--source-sha", SOURCE_SHA, "--build-timestamp", BUILD_TIMESTAMP], { repoRoot: fixture.repo }), EXIT.MISMATCH);
  const stage = path.join(fixture.parent, "candidate");
  await stagePublication({ repoRoot: fixture.repo, buildRoot: fixture.dist, stageRoot: stage, metadata: { ...METADATA, buildTimestampPolicy: "explicit-reproducible-input" } });
  await copyManagedCandidateToRoot(stage, fixture.repo);
  assert.equal(await runCli(["--check", "--source-sha", SOURCE_SHA, "--build-timestamp", BUILD_TIMESTAMP], { repoRoot: fixture.repo }), EXIT.OK);
});

test("empty stage succeeds while partial and stale stage targets fail closed", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture.parent, { recursive: true, force: true }));
  const empty = path.join(fixture.parent, "empty");
  await mkdir(empty);
  assert.equal((await stagePublication({ repoRoot: fixture.repo, buildRoot: fixture.dist, stageRoot: empty, metadata: METADATA })).changed, true);
  for (const name of ["partial", "stale", "interrupted"] ) {
    const target = path.join(fixture.parent, name);
    await write(path.join(target, name === "partial" ? "index.html" : "unexpected.tmp"), "partial\n");
    await assert.rejects(
      stagePublication({ repoRoot: fixture.repo, buildRoot: fixture.dist, stageRoot: target, metadata: METADATA }),
      /partial, stale, or unexpected/,
    );
  }
});

test("manifest and candidate contain no local path, username, or secret material", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture.parent, { recursive: true, force: true }));
  const stage = path.join(fixture.parent, "candidate");
  await stagePublication({ repoRoot: fixture.repo, buildRoot: fixture.dist, stageRoot: stage, metadata: METADATA });
  const serialized = (await Promise.all((await readdir(stage, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile() && [".html", ".js", ".json", ".txt", ".webmanifest"].includes(path.extname(entry.name)))
    .map(async (entry) => readFile(path.join(entry.parentPath, entry.name), "utf8")))).join("\n");
  assert.equal(serialized.includes(fixture.parent), false);
  assert.equal(serialized.includes(os.userInfo().username), false);
  assert.doesNotMatch(serialized, /gho_[A-Za-z0-9_]{20,}/);
});

test("apply is deliberate, refuses dirty state, and only mutates owned paths in an isolated repo", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture.parent, { recursive: true, force: true }));
  await execFile("git", ["init"], { cwd: fixture.repo });
  await execFile("git", ["config", "user.email", "publication-test@example.invalid"], { cwd: fixture.repo });
  await execFile("git", ["config", "user.name", "Publication Test"], { cwd: fixture.repo });
  await execFile("git", ["add", "."], { cwd: fixture.repo });
  await execFile("git", ["commit", "-m", "fixture"], { cwd: fixture.repo });

  await assert.rejects(
    applyPublication({ repoRoot: fixture.repo, buildRoot: fixture.dist, metadata: METADATA, confirmed: false }),
    (error) => error.exitCode === EXIT.APPLY_REFUSED,
  );
  await write(path.join(fixture.repo, "dirty.txt"), "dirty\n");
  await assert.rejects(
    applyPublication({ repoRoot: fixture.repo, buildRoot: fixture.dist, metadata: METADATA, confirmed: true }),
    (error) => error.exitCode === EXIT.APPLY_REFUSED,
  );
  await rm(path.join(fixture.repo, "dirty.txt"));
  const cnameBefore = await readFile(path.join(fixture.repo, "CNAME"));
  const unknownBefore = await readFile(path.join(fixture.repo, "README-preserved.txt"));
  const plan = await applyPublication({ repoRoot: fixture.repo, buildRoot: fixture.dist, metadata: METADATA, confirmed: true });
  assert.equal(plan.status, "mismatch");
  assert.equal(await stat(path.join(fixture.repo, "assets", "old-STALE.js")).then(() => true, () => false), false);
  assert.deepEqual(await readFile(path.join(fixture.repo, "CNAME")), cnameBefore);
  assert.deepEqual(await readFile(path.join(fixture.repo, "README-preserved.txt")), unknownBefore);
  assert.equal((await analyzePublication({ repoRoot: fixture.repo, buildRoot: fixture.dist, metadata: METADATA })).status, "match");
});

test("tampered staged candidates fail SHA verification", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture.parent, { recursive: true, force: true }));
  const stage = path.join(fixture.parent, "candidate");
  await stagePublication({ repoRoot: fixture.repo, buildRoot: fixture.dist, stageRoot: stage, metadata: METADATA });
  await write(path.join(stage, "assets", "app-ABC123.js"), "tampered\n");
  await assert.rejects(verifyStagedCandidate(stage), /integrity mismatch/);
});
