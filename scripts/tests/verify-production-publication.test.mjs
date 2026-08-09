import assert from "node:assert/strict";
import test from "node:test";

import {
  ProductionPublicationError,
  assertProductionBundleConfiguration,
  readApprovedFirebaseConfig,
  validateFirebaseConfigIdentity,
} from "../verify-production-publication.mjs";

const CONFIG = Object.freeze({
  apiKey: "AIza012345678901234567890123456789",
  authDomain: "pipeline-2f422.firebaseapp.com",
  projectId: "pipeline-2f422",
  storageBucket: "pipeline-2f422.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef0123456789",
  measurementId: "G-ABC123XYZ",
});

const ENVIRONMENT = Object.freeze({
  VITE_FIREBASE_API_KEY: CONFIG.apiKey,
  VITE_FIREBASE_AUTH_DOMAIN: CONFIG.authDomain,
  VITE_FIREBASE_PROJECT_ID: CONFIG.projectId,
  VITE_FIREBASE_STORAGE_BUCKET: CONFIG.storageBucket,
  VITE_FIREBASE_MESSAGING_SENDER_ID: CONFIG.messagingSenderId,
  VITE_FIREBASE_APP_ID: CONFIG.appId,
  VITE_FIREBASE_MEASUREMENT_ID: CONFIG.measurementId,
});

function bundle(config = CONFIG) {
  return `const approved={apiKey:"${config.apiKey}",authDomain:"${config.authDomain}",projectId:"${config.projectId}",storageBucket:"${config.storageBucket}",messagingSenderId:"${config.messagingSenderId}",appId:"${config.appId}",measurementId:"${config.measurementId}"};`;
}

test("requires all six named production variables without echoing their values", () => {
  assert.deepEqual(readApprovedFirebaseConfig(ENVIRONMENT), CONFIG);
  assert.throws(
    () => readApprovedFirebaseConfig({ ...ENVIRONMENT, VITE_FIREBASE_APP_ID: "" }),
    (error) => error instanceof ProductionPublicationError
      && error.message.includes("VITE_FIREBASE_APP_ID")
      && !error.message.includes(CONFIG.apiKey),
  );
});

test("accepts only the approved internally consistent Firebase project", () => {
  assert.doesNotThrow(() => validateFirebaseConfigIdentity(CONFIG, "pipeline-2f422"));
  assert.throws(() => validateFirebaseConfigIdentity({ ...CONFIG, projectId: "another-project" }, "pipeline-2f422"));
  assert.throws(() => validateFirebaseConfigIdentity({ ...CONFIG, appId: "1:999999:web:abcdef" }, "pipeline-2f422"));
});

test("proves the production bundle embeds the complete approved web configuration", () => {
  assert.doesNotThrow(() => assertProductionBundleConfiguration(bundle(), CONFIG));
  assert.throws(() => assertProductionBundleConfiguration(bundle({ ...CONFIG, projectId: "another-project" }), CONFIG));
  assert.throws(() => assertProductionBundleConfiguration("const reviewBuild=true;", CONFIG));
});
