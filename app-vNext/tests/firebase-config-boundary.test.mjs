import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const configSource = await readFile(new URL("../src/lib/firebase/config.ts", import.meta.url), "utf8");
const clientSource = await readFile(new URL("../src/lib/firebase/client.ts", import.meta.url), "utf8");
const authContextSource = await readFile(new URL("../src/features/auth/AuthContext.tsx", import.meta.url), "utf8");

test("production Firebase client configuration is supplied only through explicit build inputs", () => {
  assert.doesNotMatch(configSource, /\bAIza[0-9A-Za-z_-]{30,}\b/);
  assert.doesNotMatch(configSource, /pipeline-2f422|firebaseapp\.com|firebasestorage\.app/);
  for (const name of [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
  ]) {
    assert.match(configSource, new RegExp(name));
  }
  assert.match(configSource, /firebaseConfig: FirebaseOptions \| null/);
});

test("review builds fail closed while loopback demo may use only an emulator identity", () => {
  assert.match(clientSource, /projectId: "demo-easylife-publication"/);
  assert.match(clientSource, /apiKey: "emulator-only"/);
  assert.match(clientSource, /approved Firebase client configuration was not supplied/);
  assert.match(authContextSource, /if \(!firebaseConfigured\)/);
  assert.ok(authContextSource.indexOf("if (isDemoMode)") < authContextSource.indexOf("if (!firebaseConfigured)"));
});
