#!/usr/bin/env node

import { readFile, readdir, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const FIREBASE_ENVIRONMENT_FIELDS = Object.freeze({
  apiKey: "VITE_FIREBASE_API_KEY",
  authDomain: "VITE_FIREBASE_AUTH_DOMAIN",
  projectId: "VITE_FIREBASE_PROJECT_ID",
  storageBucket: "VITE_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "VITE_FIREBASE_MESSAGING_SENDER_ID",
  appId: "VITE_FIREBASE_APP_ID",
  measurementId: "VITE_FIREBASE_MEASUREMENT_ID",
});

export class ProductionPublicationError extends Error {}

function requiredFields() {
  return Object.keys(FIREBASE_ENVIRONMENT_FIELDS).filter((field) => field !== "measurementId");
}

export function readApprovedFirebaseConfig(environment) {
  const config = {};
  const missing = [];
  for (const [field, variable] of Object.entries(FIREBASE_ENVIRONMENT_FIELDS)) {
    const value = environment[variable]?.trim();
    if (value) config[field] = value;
    else if (field !== "measurementId") missing.push(variable);
  }
  if (missing.length > 0) {
    throw new ProductionPublicationError(`Missing required repository variables: ${missing.join(", ")}`);
  }
  return config;
}

export function validateFirebaseConfigIdentity(config, expectedProjectId) {
  if (expectedProjectId !== "pipeline-2f422" || config.projectId !== expectedProjectId) {
    throw new ProductionPublicationError("Firebase project identity does not match the approved EasyLife production project.");
  }
  const project = expectedProjectId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const internallyConsistent = new RegExp(`^${project}\\.(?:firebaseapp\\.com|web\\.app)$`).test(config.authDomain)
    && new RegExp(`^${project}\\.(?:appspot\\.com|firebasestorage\\.app)$`).test(config.storageBucket)
    && /^AIza[0-9A-Za-z_-]{20,}$/.test(config.apiKey)
    && /^\d{6,}$/.test(config.messagingSenderId)
    && new RegExp(`^1:${config.messagingSenderId}:web:[0-9a-fA-F]+$`).test(config.appId)
    && (!config.measurementId || /^G-[A-Z0-9]+$/.test(config.measurementId));
  if (!internallyConsistent) {
    throw new ProductionPublicationError("Firebase web configuration is not internally consistent.");
  }
}

function extractStringField(source, field) {
  const expression = new RegExp(`(?<![A-Za-z0-9_$])${field}\\s*:\\s*\"([^\"]+)\"`, "g");
  return [...source.matchAll(expression)].map((match) => match[1]);
}

export function assertProductionBundleConfiguration(bundleText, config) {
  const objectCandidates = [...bundleText.matchAll(/\{[^{}]{0,2500}(?<![A-Za-z0-9_$])apiKey\s*:\s*"[^"]+"[^{}]{0,2500}\}/g)]
    .map((match) => match[0])
    .filter((candidate) => requiredFields().every((field) => extractStringField(candidate, field).length === 1));
  if (objectCandidates.length !== 1) {
    throw new ProductionPublicationError("Production bundle must contain exactly one complete Firebase web configuration.");
  }
  const candidate = objectCandidates[0];
  for (const field of requiredFields()) {
    if (extractStringField(candidate, field)[0] !== config[field]) {
      throw new ProductionPublicationError(`Production bundle Firebase field mismatch: ${field}`);
    }
  }
  const measurement = extractStringField(candidate, "measurementId");
  if (config.measurementId && (measurement.length !== 1 || measurement[0] !== config.measurementId)) {
    throw new ProductionPublicationError("Production bundle Firebase field mismatch: measurementId");
  }
}

const PROHIBITED_SERVER_CONTENT = Object.freeze([
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/i,
  /["']type["']\s*:\s*["']service_account["']/i,
  /\bBearer\s+[A-Za-z0-9._~+/-]+=*/i,
  /\bgh[opusr]_[A-Za-z0-9_]{20,}\b/i,
  /\b(?:sk|rk)-[A-Za-z0-9_-]{20,}\b/i,
  /\bOPENAI_API_KEY\b/i,
  /\bprivate_key_id\b/i,
  /\bclient_email\b/i,
]);

async function listTextFiles(root, relative = "") {
  const current = path.join(root, relative);
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await listTextFiles(root, child));
    else if (entry.isFile() && /\.(?:css|html|js|json|svg|txt|webmanifest)$/.test(entry.name)) files.push(child);
  }
  return files.sort();
}

export async function verifyProductionPublication({ repoRoot, buildRoot, environment = process.env }) {
  const config = readApprovedFirebaseConfig(environment);
  const firebaseProjectFile = JSON.parse(await readFile(path.join(repoRoot, ".firebaserc"), "utf8"));
  const expectedProjectId = firebaseProjectFile.projects?.default;
  validateFirebaseConfigIdentity(config, expectedProjectId);

  const resolvedBuild = await realpath(buildRoot);
  const textFiles = await listTextFiles(resolvedBuild);
  let serialized = "";
  for (const relative of textFiles) {
    const contents = await readFile(path.join(resolvedBuild, ...relative.split("/")), "utf8");
    if (PROHIBITED_SERVER_CONTENT.some((pattern) => pattern.test(contents))) {
      throw new ProductionPublicationError(`Prohibited server credential content found in ${relative}.`);
    }
    if (/\b(?:C:\\\\Users\\\\|C:\\Users\\|\/home\/runner\/work\/|\/Users\/)/.test(contents)) {
      throw new ProductionPublicationError(`Absolute machine path found in ${relative}.`);
    }
    serialized += `${contents}\n`;
  }
  assertProductionBundleConfiguration(serialized, config);
  return {
    projectId: expectedProjectId,
    requiredVariableCount: requiredFields().length,
    measurementConfigured: Boolean(config.measurementId),
    textFileCount: textFiles.length,
  };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    const result = await verifyProductionPublication({ repoRoot, buildRoot: path.join(repoRoot, "app-vNext", "dist") });
    process.stdout.write(`production publication configuration verified (${result.requiredVariableCount}/6 required variables; measurement ${result.measurementConfigured ? "present" : "absent"}; ${result.textFileCount} text files scanned)\n`);
  } catch (error) {
    process.stderr.write(`production-publication-error: ${error.message}\n`);
    process.exitCode = 1;
  }
}
