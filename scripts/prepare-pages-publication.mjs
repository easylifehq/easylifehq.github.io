#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import {
  access,
  copyFile,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  rmdir,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const execFile = promisify(execFileCallback);

export const PUBLICATION_SCHEMA_VERSION = "easylife-pages-publication/v1";
export const MANIFEST_PATH = "pages-publication-manifest.json";
export const HASH_INVENTORY_PATH = "pages-publication-sha256.txt";
export const OWNED_FIXED_PATHS = Object.freeze([
  "404.html",
  HASH_INVENTORY_PATH,
  "index.html",
  "manifest.webmanifest",
  MANIFEST_PATH,
  "sw.js",
]);
export const OWNED_DIRECTORY_ROOTS = Object.freeze(["assets", "icons"]);
export const PRESERVED_ROOT_PATHS = Object.freeze([".nojekyll", "CNAME"]);
export const EXIT = Object.freeze({ OK: 0, VALIDATION: 1, MISMATCH: 2, APPLY_REFUSED: 3 });

const ALLOWED_ASSET_EXTENSIONS = new Set([
  ".avif", ".css", ".gif", ".ico", ".jpeg", ".jpg", ".js", ".png",
  ".svg", ".ttf", ".webp", ".woff", ".woff2",
]);
const REQUIRED_BUILD_FILES = Object.freeze(["index.html", "manifest.webmanifest", "sw.js"]);
const REQUIRED_ICON_FILES = Object.freeze([
  "icons/easylife-apple-touch-icon.png",
  "icons/easylife-icon-192.png",
  "icons/easylife-icon-512.png",
  "icons/easylife-icon.svg",
]);
const TEXT_EXTENSIONS = new Set([".css", ".html", ".js", ".json", ".svg", ".txt", ".webmanifest"]);
const PROHIBITED_SEGMENTS = new Set([
  ".git", ".github", "app-vNext", "docs", "functions", "node_modules", "old-site", "scripts", "tests",
]);
const PROHIBITED_FILE_PATTERNS = [
  /^\.env(?:\.|$)/i,
  /credential/i,
  /private[-_]?key/i,
  /service[-_]?account/i,
  /secret/i,
  /token/i,
  /\.map$/i,
  /\.(?:key|pem|p12|pfx)$/i,
  /^(?:firebase\.json|firestore\.rules|package(?:-lock)?\.json)$/i,
];
const SECRET_CONTENT_PATTERNS = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\bgh[opusr]_[A-Za-z0-9_]{20,}\b/,
  /\bAIza[0-9A-Za-z_-]{30,}\b/,
  /\b(?:sk|rk)-[A-Za-z0-9_-]{20,}\b/,
];

export class PublicationError extends Error {
  constructor(message, exitCode = EXIT.VALIDATION) {
    super(message);
    this.name = "PublicationError";
    this.exitCode = exitCode;
  }
}

export function normalizeRelativePath(value) {
  if (typeof value !== "string" || value.length === 0 || value.includes("\0")) {
    throw new PublicationError("Publication paths must be non-empty strings without null bytes.");
  }
  const normalized = value.replaceAll("\\", "/");
  if (normalized.startsWith("/") || /^[A-Za-z]:/.test(normalized)) {
    throw new PublicationError(`Absolute publication path rejected: ${value}`);
  }
  const segments = normalized.split("/");
  if (segments.some((segment) => segment === "" || segment === "." || segment === "..")) {
    throw new PublicationError(`Unsafe publication path rejected: ${value}`);
  }
  return segments.join("/");
}

function isWithin(parent, child) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

async function exists(target) {
  try {
    await access(target, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function sha256File(target) {
  return createHash("sha256").update(await readFile(target)).digest("hex");
}

async function sha256Buffer(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function listFiles(root, relative = "") {
  const current = path.join(root, ...relative.split("/").filter(Boolean));
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const childRelative = normalizeRelativePath(relative ? `${relative}/${entry.name}` : entry.name);
    if (entry.isSymbolicLink()) {
      throw new PublicationError(`Symbolic links are prohibited in publication inputs: ${childRelative}`);
    }
    if (entry.isDirectory()) {
      files.push(...await listFiles(root, childRelative));
    } else if (entry.isFile()) {
      files.push(childRelative);
    } else {
      throw new PublicationError(`Unsupported filesystem entry in publication input: ${childRelative}`);
    }
  }
  return files.sort();
}

function assertApprovedBuildPath(relative) {
  const safe = normalizeRelativePath(relative);
  const segments = safe.split("/");
  if (segments.some((segment) => PROHIBITED_SEGMENTS.has(segment))) {
    throw new PublicationError(`Prohibited publication content: ${safe}`);
  }
  if (segments.some((segment) => PROHIBITED_FILE_PATTERNS.some((pattern) => pattern.test(segment)))) {
    throw new PublicationError(`Credential-shaped or prohibited publication file: ${safe}`);
  }
  if (safe.startsWith("assets/")) {
    if (!ALLOWED_ASSET_EXTENSIONS.has(path.posix.extname(safe).toLowerCase())) {
      throw new PublicationError(`Unapproved asset extension: ${safe}`);
    }
    return safe;
  }
  if (safe.startsWith("icons/")) {
    if (!ALLOWED_ASSET_EXTENSIONS.has(path.posix.extname(safe).toLowerCase())) {
      throw new PublicationError(`Unapproved icon extension: ${safe}`);
    }
    return safe;
  }
  if (!REQUIRED_BUILD_FILES.includes(safe)) {
    throw new PublicationError(`Unapproved top-level build output: ${safe}`);
  }
  return safe;
}

async function assertNoSecretsOrMachinePaths(target, relative, repoRoot) {
  const extension = path.posix.extname(relative).toLowerCase();
  if (!TEXT_EXTENSIONS.has(extension)) return;
  const contents = await readFile(target, "utf8");
  for (const pattern of SECRET_CONTENT_PATTERNS) {
    if (pattern.test(contents)) {
      throw new PublicationError(`Credential-shaped content rejected in ${relative}.`);
    }
  }
  const normalizedRepo = repoRoot.replaceAll("\\", "/");
  const machinePatterns = [normalizedRepo, repoRoot, "C:\\Users\\", "C:\\\\Users\\\\", "/home/runner/work/", "/Users/"];
  if (machinePatterns.some((needle) => needle && contents.includes(needle))) {
    throw new PublicationError(`Absolute machine path rejected in ${relative}.`);
  }
}

async function validateRepository(repoRoot) {
  const resolved = await realpath(repoRoot);
  const required = ["CODEX.md", "app-vNext/package.json", "scripts"];
  for (const relative of required) {
    if (!await exists(path.join(resolved, ...relative.split("/")))) {
      throw new PublicationError(`Expected EasyLife repository marker missing: ${relative}`);
    }
  }
  if (!await exists(path.join(resolved, ".git"))) {
    throw new PublicationError("Expected EasyLife Git worktree metadata is missing.");
  }
  const appPackage = JSON.parse(await readFile(path.join(resolved, "app-vNext", "package.json"), "utf8"));
  if (appPackage.name !== "easy-system-app-vnext" || typeof appPackage.version !== "string") {
    throw new PublicationError("Unexpected app-vNext package identity.");
  }
  return { repoRoot: resolved, appVersion: appPackage.version };
}

async function resolveBuildMetadata(repoRoot, override = {}) {
  let sourceSha = override.sourceSha || process.env.EASYLIFE_PUBLICATION_SOURCE_SHA;
  let buildTimestamp = override.buildTimestamp || process.env.EASYLIFE_PUBLICATION_BUILD_TIMESTAMP;
  let buildTimestampPolicy = override.buildTimestampPolicy || "source-commit-time";
  if (!sourceSha) {
    ({ stdout: sourceSha } = await execFile("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" }));
  }
  sourceSha = sourceSha.trim();
  if (!/^[0-9a-f]{40}$/i.test(sourceSha)) {
    throw new PublicationError("Source SHA must be a full 40-character Git SHA.");
  }
  if (!buildTimestamp && process.env.SOURCE_DATE_EPOCH) {
    const epoch = Number(process.env.SOURCE_DATE_EPOCH);
    if (!Number.isSafeInteger(epoch) || epoch < 0) throw new PublicationError("Invalid SOURCE_DATE_EPOCH.");
    buildTimestamp = new Date(epoch * 1000).toISOString();
    buildTimestampPolicy = "source-date-epoch";
  }
  if (!buildTimestamp) {
    ({ stdout: buildTimestamp } = await execFile("git", ["show", "-s", "--format=%cI", sourceSha], { cwd: repoRoot, encoding: "utf8" }));
  }
  buildTimestamp = new Date(buildTimestamp.trim()).toISOString();
  if (buildTimestamp === "Invalid Date") throw new PublicationError("Invalid deterministic build timestamp.");
  return { sourceSha: sourceSha.toLowerCase(), buildTimestamp, buildTimestampPolicy };
}

async function validateBuild(repoRoot, buildRoot) {
  const resolvedBuild = await realpath(buildRoot);
  const expectedParent = await realpath(path.join(repoRoot, "app-vNext"));
  if (!isWithin(expectedParent, resolvedBuild)) {
    throw new PublicationError("Build output must remain inside app-vNext.");
  }
  const buildStat = await lstat(resolvedBuild);
  if (buildStat.isSymbolicLink() || !buildStat.isDirectory()) {
    throw new PublicationError("Build output must be a real directory, not a symlink.");
  }
  const files = await listFiles(resolvedBuild);
  for (const required of [...REQUIRED_BUILD_FILES, ...REQUIRED_ICON_FILES]) {
    if (!files.includes(required)) throw new PublicationError(`Required build output missing: ${required}`);
  }
  if (!files.some((file) => file.startsWith("assets/"))) {
    throw new PublicationError("Build output has no hashed assets.");
  }
  for (const relative of files) {
    assertApprovedBuildPath(relative);
    await assertNoSecretsOrMachinePaths(path.join(resolvedBuild, ...relative.split("/")), relative, repoRoot);
  }
  const indexBytes = await readFile(path.join(resolvedBuild, "index.html"));
  const indexText = indexBytes.toString("utf8");
  if (!/^<!doctype html>/i.test(indexText.trimStart()) || !indexText.includes('id="root"')) {
    throw new PublicationError("Malformed index.html: expected an HTML doctype and #root mount point.");
  }
  const assetReferences = [...indexText.matchAll(/(?:src|href)=["']\/?(assets\/[^"']+)["']/g)].map((match) => match[1]);
  if (assetReferences.length === 0) throw new PublicationError("Malformed index.html: no built assets are referenced.");
  for (const reference of assetReferences) {
    const safeReference = normalizeRelativePath(reference.split(/[?#]/, 1)[0]);
    if (!files.includes(safeReference)) throw new PublicationError(`index.html references missing asset: ${safeReference}`);
  }
  let webManifest;
  try {
    webManifest = JSON.parse(await readFile(path.join(resolvedBuild, "manifest.webmanifest"), "utf8"));
  } catch {
    throw new PublicationError("Malformed manifest.webmanifest.");
  }
  if (!webManifest.name || !Array.isArray(webManifest.icons) || webManifest.icons.length === 0) {
    throw new PublicationError("manifest.webmanifest is missing name or icons.");
  }
  for (const icon of webManifest.icons) {
    const iconPath = normalizeRelativePath(String(icon.src || "").replace(/^\//, ""));
    if (!files.includes(iconPath)) throw new PublicationError(`Manifest references missing icon: ${iconPath}`);
  }
  return { buildRoot: resolvedBuild, files, indexBytes };
}

async function copyPath(sourceRoot, destinationRoot, relative) {
  const safe = normalizeRelativePath(relative);
  const source = path.join(sourceRoot, ...safe.split("/"));
  const destination = path.join(destinationRoot, ...safe.split("/"));
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

async function fileRecord(root, relative, managed) {
  const target = path.join(root, ...relative.split("/"));
  const info = await stat(target);
  return { path: relative, managed, size: info.size, sha256: await sha256File(target) };
}

async function createCandidateInDirectory({ repoRoot, buildRoot, candidateRoot, metadata }) {
  const repo = await validateRepository(repoRoot);
  const build = await validateBuild(repo.repoRoot, buildRoot);
  const resolvedMetadata = await resolveBuildMetadata(repo.repoRoot, metadata);

  await mkdir(candidateRoot, { recursive: false });
  const managedPayload = [];
  for (const relative of build.files) {
    await copyPath(build.buildRoot, candidateRoot, relative);
    managedPayload.push(relative);
  }
  await writeFile(path.join(candidateRoot, "404.html"), build.indexBytes);
  managedPayload.push("404.html");

  const preserved = [];
  for (const relative of PRESERVED_ROOT_PATHS) {
    const source = path.join(repo.repoRoot, relative);
    if (!await exists(source)) continue;
    const sourceStat = await lstat(source);
    if (sourceStat.isSymbolicLink() || !sourceStat.isFile()) {
      throw new PublicationError(`Preserved root file must be a regular file: ${relative}`);
    }
    await copyPath(repo.repoRoot, candidateRoot, relative);
    preserved.push(relative);
  }
  if (!preserved.includes("CNAME")) throw new PublicationError("CNAME is required and must be preserved byte-for-byte.");

  const uniqueManaged = [...new Set(managedPayload)].sort();
  const fileRecords = [];
  for (const relative of [...uniqueManaged, ...preserved].sort()) {
    fileRecords.push(await fileRecord(candidateRoot, relative, uniqueManaged.includes(relative)));
  }
  const indexRecord = fileRecords.find((record) => record.path === "index.html");
  const fallbackRecord = fileRecords.find((record) => record.path === "404.html");
  if (!indexRecord || indexRecord.sha256 !== fallbackRecord?.sha256) {
    throw new PublicationError("index.html and 404.html must be byte-identical.");
  }
  const manifest = {
    schemaVersion: PUBLICATION_SCHEMA_VERSION,
    source: { sha: resolvedMetadata.sourceSha, applicationVersion: repo.appVersion },
    build: {
      timestamp: resolvedMetadata.buildTimestamp,
      timestampPolicy: resolvedMetadata.buildTimestampPolicy,
    },
    contract: {
      authoritativeSource: "app-vNext",
      buildOutput: "app-vNext/dist",
      publicationTarget: "repository-root",
      ownedPaths: [...OWNED_FIXED_PATHS, "assets/**", "icons/**"].sort(),
      preservedPaths: preserved,
      manifestSelfHash: "excluded-to-avoid-circular-content",
      hashInventorySelfHash: "excluded-to-avoid-circular-content",
    },
    entrypoints: {
      application: "index.html",
      deepRouteFallback: "404.html",
      paritySha256: indexRecord.sha256,
    },
    files: fileRecords,
  };
  await writeFile(path.join(candidateRoot, MANIFEST_PATH), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  const inventoryPaths = [...fileRecords.map((record) => record.path), MANIFEST_PATH].sort();
  const inventoryLines = [];
  for (const relative of inventoryPaths) {
    inventoryLines.push(`${await sha256File(path.join(candidateRoot, ...relative.split("/")))}  ${relative}`);
  }
  await writeFile(path.join(candidateRoot, HASH_INVENTORY_PATH), `${inventoryLines.join("\n")}\n`, "utf8");
  await verifyStagedCandidate(candidateRoot);
  return manifest;
}

async function directoryIsEmpty(target) {
  return (await readdir(target)).length === 0;
}

async function directoriesEqual(left, right) {
  const leftFiles = await listFiles(left);
  const rightFiles = await listFiles(right);
  if (JSON.stringify(leftFiles) !== JSON.stringify(rightFiles)) return false;
  for (const relative of leftFiles) {
    const leftHash = await sha256File(path.join(left, ...relative.split("/")));
    const rightHash = await sha256File(path.join(right, ...relative.split("/")));
    if (leftHash !== rightHash) return false;
  }
  return true;
}

export async function stagePublication({ repoRoot, buildRoot, stageRoot, metadata = {} }) {
  const absoluteStage = path.resolve(stageRoot);
  const absoluteRepo = path.resolve(repoRoot);
  if (isWithin(absoluteRepo, absoluteStage)) {
    throw new PublicationError("Staging directory must be isolated outside the repository.");
  }
  await mkdir(path.dirname(absoluteStage), { recursive: true });
  const temporary = await mkdtemp(path.join(path.dirname(absoluteStage), ".easylife-pages-stage-"));
  try {
    await rm(temporary, { recursive: true, force: true });
    const manifest = await createCandidateInDirectory({ repoRoot, buildRoot, candidateRoot: temporary, metadata });
    if (await exists(absoluteStage)) {
      const stageStat = await lstat(absoluteStage);
      if (stageStat.isSymbolicLink() || !stageStat.isDirectory()) {
        throw new PublicationError("Staging target must be a real directory.");
      }
      if (!await directoryIsEmpty(absoluteStage)) {
        if (await directoriesEqual(temporary, absoluteStage)) return { manifest, changed: false };
        throw new PublicationError("Staging target contains partial, stale, or unexpected content; refusing replacement.");
      }
      await rmdir(absoluteStage);
    }
    await rename(temporary, absoluteStage);
    return { manifest, changed: true };
  } finally {
    if (await exists(temporary)) await rm(temporary, { recursive: true, force: true });
  }
}

export async function verifyStagedCandidate(stageRoot) {
  const resolved = await realpath(stageRoot);
  const files = await listFiles(resolved);
  if (!files.includes(MANIFEST_PATH) || !files.includes(HASH_INVENTORY_PATH)) {
    throw new PublicationError("Staged candidate is missing publication metadata.");
  }
  const manifest = JSON.parse(await readFile(path.join(resolved, MANIFEST_PATH), "utf8"));
  if (manifest.schemaVersion !== PUBLICATION_SCHEMA_VERSION || !Array.isArray(manifest.files)) {
    throw new PublicationError("Staged candidate manifest schema is invalid.");
  }
  const manifestPaths = manifest.files.map((record) => normalizeRelativePath(record.path));
  if (JSON.stringify(manifestPaths) !== JSON.stringify([...manifestPaths].sort())) {
    throw new PublicationError("Manifest file ordering is not stable.");
  }
  for (const record of manifest.files) {
    const target = path.join(resolved, ...record.path.split("/"));
    if (!await exists(target)) throw new PublicationError(`Manifest file is missing: ${record.path}`);
    const info = await stat(target);
    if (info.size !== record.size || await sha256File(target) !== record.sha256) {
      throw new PublicationError(`Manifest integrity mismatch: ${record.path}`);
    }
  }
  const inventory = (await readFile(path.join(resolved, HASH_INVENTORY_PATH), "utf8")).trimEnd().split("\n");
  const inventoryPaths = [];
  for (const line of inventory) {
    const match = /^([0-9a-f]{64})  (.+)$/.exec(line);
    if (!match) throw new PublicationError("Malformed SHA-256 inventory.");
    const relative = normalizeRelativePath(match[2]);
    inventoryPaths.push(relative);
    if (await sha256File(path.join(resolved, ...relative.split("/"))) !== match[1]) {
      throw new PublicationError(`SHA-256 inventory mismatch: ${relative}`);
    }
  }
  if (JSON.stringify(inventoryPaths) !== JSON.stringify([...inventoryPaths].sort())) {
    throw new PublicationError("SHA-256 inventory ordering is not stable.");
  }
  const expectedFiles = [...new Set([...manifestPaths, MANIFEST_PATH, HASH_INVENTORY_PATH])].sort();
  if (JSON.stringify(files) !== JSON.stringify(expectedFiles)) {
    throw new PublicationError("Staged candidate contains files outside its manifest contract.");
  }
  const indexHash = await sha256File(path.join(resolved, "index.html"));
  if (indexHash !== await sha256File(path.join(resolved, "404.html"))) {
    throw new PublicationError("Staged index.html and 404.html are not identical.");
  }
  if (indexHash !== manifest.entrypoints?.paritySha256) {
    throw new PublicationError("Entrypoint parity hash does not match the staged files.");
  }
  return manifest;
}

function managedRootPath(relative) {
  return OWNED_FIXED_PATHS.includes(relative) || OWNED_DIRECTORY_ROOTS.some((root) => relative.startsWith(`${root}/`));
}

async function listManagedRootFiles(repoRoot) {
  const managed = [];
  for (const relative of OWNED_FIXED_PATHS) {
    if (await exists(path.join(repoRoot, relative))) managed.push(relative);
  }
  for (const directory of OWNED_DIRECTORY_ROOTS) {
    const target = path.join(repoRoot, directory);
    if (!await exists(target)) continue;
    const info = await lstat(target);
    if (info.isSymbolicLink() || !info.isDirectory()) {
      throw new PublicationError(`Managed root must be a real directory: ${directory}`);
    }
    for (const child of await listFiles(target)) managed.push(`${directory}/${child}`);
  }
  return managed.sort();
}

export async function planPublication({ repoRoot, candidateRoot }) {
  const repo = await validateRepository(repoRoot);
  const candidate = await realpath(candidateRoot);
  await verifyStagedCandidate(candidate);
  const candidateFiles = (await listFiles(candidate)).filter(managedRootPath).sort();
  const currentFiles = await listManagedRootFiles(repo.repoRoot);
  const create = [];
  const update = [];
  const unchanged = [];
  for (const relative of candidateFiles) {
    const current = path.join(repo.repoRoot, ...relative.split("/"));
    if (!await exists(current)) {
      create.push(relative);
    } else if (await sha256File(current) === await sha256File(path.join(candidate, ...relative.split("/")))) {
      unchanged.push(relative);
    } else {
      update.push(relative);
    }
  }
  const candidateSet = new Set(candidateFiles);
  const remove = currentFiles.filter((relative) => !candidateSet.has(relative));
  const plan = {
    schemaVersion: PUBLICATION_SCHEMA_VERSION,
    status: create.length || update.length || remove.length ? "mismatch" : "match",
    create,
    update,
    delete: remove,
    unchanged,
    preserved: [...PRESERVED_ROOT_PATHS].filter((relative) => exists(path.join(repo.repoRoot, relative))),
  };
  plan.preserved = (await Promise.all(PRESERVED_ROOT_PATHS.map(async (relative) =>
    await exists(path.join(repo.repoRoot, relative)) ? relative : null))).filter(Boolean).sort();
  return plan;
}

async function createTemporaryCandidate({ repoRoot, buildRoot, metadata }) {
  const parent = await mkdtemp(path.join(os.tmpdir(), "easylife-pages-publication-"));
  const candidate = path.join(parent, "candidate");
  await createCandidateInDirectory({ repoRoot, buildRoot, candidateRoot: candidate, metadata });
  return { parent, candidate };
}

export async function analyzePublication({ repoRoot, buildRoot, metadata = {} }) {
  const temporary = await createTemporaryCandidate({ repoRoot, buildRoot, metadata });
  try {
    return await planPublication({ repoRoot, candidateRoot: temporary.candidate });
  } finally {
    await rm(temporary.parent, { recursive: true, force: true });
  }
}

async function assertCleanGit(repoRoot) {
  const { stdout } = await execFile("git", ["status", "--porcelain=v1", "--untracked-files=all"], { cwd: repoRoot, encoding: "utf8" });
  if (stdout.trim()) {
    throw new PublicationError("Apply refused: repository has tracked, staged, or untracked changes.", EXIT.APPLY_REFUSED);
  }
  const { stdout: branch } = await execFile("git", ["branch", "--show-current"], { cwd: repoRoot, encoding: "utf8" });
  if (!branch.trim()) throw new PublicationError("Apply refused: detached HEAD is ambiguous.", EXIT.APPLY_REFUSED);
}

async function atomicCopy(source, destination) {
  await mkdir(path.dirname(destination), { recursive: true });
  const temporary = `${destination}.easylife-publish-${process.pid}.tmp`;
  await copyFile(source, temporary);
  await rename(temporary, destination);
}

async function pruneEmptyManagedDirectories(repoRoot) {
  for (const ownedRoot of OWNED_DIRECTORY_ROOTS) {
    const root = path.join(repoRoot, ownedRoot);
    if (!await exists(root)) continue;
    const directories = [];
    async function collect(current) {
      for (const entry of await readdir(current, { withFileTypes: true })) {
        if (entry.isDirectory() && !entry.isSymbolicLink()) {
          const child = path.join(current, entry.name);
          await collect(child);
          directories.push(child);
        }
      }
    }
    await collect(root);
    for (const directory of directories.sort((a, b) => b.length - a.length)) {
      try { await rmdir(directory); } catch (error) { if (error.code !== "ENOTEMPTY") throw error; }
    }
  }
}

export async function applyPublication({ repoRoot, buildRoot, metadata = {}, confirmed = false }) {
  if (!confirmed) throw new PublicationError("Apply refused: pass --confirm-apply deliberately.", EXIT.APPLY_REFUSED);
  const repo = await validateRepository(repoRoot);
  await assertCleanGit(repo.repoRoot);
  const cnameBefore = await readFile(path.join(repo.repoRoot, "CNAME"));
  const temporary = await createTemporaryCandidate({ repoRoot: repo.repoRoot, buildRoot, metadata });
  try {
    const plan = await planPublication({ repoRoot: repo.repoRoot, candidateRoot: temporary.candidate });
    for (const relative of [...plan.create, ...plan.update].sort()) {
      if (!managedRootPath(relative)) throw new PublicationError(`Apply plan escaped owned paths: ${relative}`);
      await atomicCopy(
        path.join(temporary.candidate, ...relative.split("/")),
        path.join(repo.repoRoot, ...relative.split("/")),
      );
    }
    for (const relative of plan.delete) {
      if (!managedRootPath(relative)) throw new PublicationError(`Delete plan escaped owned paths: ${relative}`);
      await unlink(path.join(repo.repoRoot, ...relative.split("/")));
    }
    await pruneEmptyManagedDirectories(repo.repoRoot);
    const cnameAfter = await readFile(path.join(repo.repoRoot, "CNAME"));
    if (await sha256Buffer(cnameBefore) !== await sha256Buffer(cnameAfter)) {
      throw new PublicationError("CNAME changed during apply; stop and restore the preserved file.");
    }
    const postPlan = await planPublication({ repoRoot: repo.repoRoot, candidateRoot: temporary.candidate });
    if (postPlan.status !== "match") throw new PublicationError("Apply completed but root integrity still mismatches candidate.");
    return plan;
  } finally {
    await rm(temporary.parent, { recursive: true, force: true });
  }
}

function stablePlanText(plan) {
  const lines = [`status ${plan.status}`];
  for (const key of ["create", "update", "delete", "unchanged", "preserved"]) {
    lines.push(`${key} ${plan[key].length}`);
    for (const relative of plan[key]) lines.push(`  ${key} ${relative}`);
  }
  return `${lines.join("\n")}\n`;
}

async function writePlan(plan, target) {
  if (!target) return;
  const absolute = path.resolve(target);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
}

function parseArgs(argv) {
  const options = { confirmApply: false, metadata: {} };
  const modes = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (["--check", "--dry-run", "--apply"].includes(arg)) {
      modes.push(arg.slice(2));
    } else if (["--stage", "--verify-stage"].includes(arg)) {
      const value = argv[++index];
      if (!value) throw new PublicationError(`${arg} requires a directory.`);
      modes.push(arg.slice(2));
      options.modeValue = value;
    } else if (arg === "--confirm-apply") {
      options.confirmApply = true;
    } else if (arg === "--plan") {
      options.planPath = argv[++index];
      if (!options.planPath) throw new PublicationError("--plan requires a file path.");
    } else if (arg === "--source-sha") {
      options.metadata.sourceSha = argv[++index];
    } else if (arg === "--build-timestamp") {
      options.metadata.buildTimestamp = argv[++index];
      options.metadata.buildTimestampPolicy = "explicit-reproducible-input";
    } else {
      throw new PublicationError(`Unknown argument: ${arg}`);
    }
  }
  if (modes.length !== 1) throw new PublicationError("Choose exactly one mode: --check, --dry-run, --stage, --verify-stage, or --apply.");
  options.mode = modes[0];
  return options;
}

export async function runCli(argv, { repoRoot } = {}) {
  const options = parseArgs(argv);
  const repository = path.resolve(repoRoot || path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
  const buildRoot = path.join(repository, "app-vNext", "dist");
  if (options.mode === "verify-stage") {
    const manifest = await verifyStagedCandidate(options.modeValue);
    process.stdout.write(`verified ${manifest.files.length} payload files\n`);
    return EXIT.OK;
  }
  if (options.mode === "stage") {
    const result = await stagePublication({ repoRoot: repository, buildRoot, stageRoot: options.modeValue, metadata: options.metadata });
    const plan = await planPublication({ repoRoot: repository, candidateRoot: options.modeValue });
    await writePlan(plan, options.planPath);
    process.stdout.write(`staged ${result.manifest.files.length} payload files (${result.changed ? "created" : "idempotent"})\n`);
    process.stdout.write(stablePlanText(plan));
    return EXIT.OK;
  }
  if (options.mode === "apply") {
    const plan = await applyPublication({ repoRoot: repository, buildRoot, metadata: options.metadata, confirmed: options.confirmApply });
    await writePlan(plan, options.planPath);
    process.stdout.write(stablePlanText(plan));
    return EXIT.OK;
  }
  const plan = await analyzePublication({ repoRoot: repository, buildRoot, metadata: options.metadata });
  await writePlan(plan, options.planPath);
  process.stdout.write(stablePlanText(plan));
  if (options.mode === "check" && plan.status !== "match") return EXIT.MISMATCH;
  return EXIT.OK;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    process.exitCode = await runCli(process.argv.slice(2));
  } catch (error) {
    const exitCode = error instanceof PublicationError ? error.exitCode : EXIT.VALIDATION;
    process.stderr.write(`publication-error: ${error.message}\n`);
    process.exitCode = exitCode;
  }
}
