import { initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";
import { firebaseConfig, firebaseConfigured } from "./config";
import { resolveFirestoreRuntimeTarget } from "./runtimeSafety";

export const firestoreRuntimeTarget = resolveFirestoreRuntimeTarget({
  hostname: typeof window === "undefined" ? "" : window.location.hostname,
  search: typeof window === "undefined" ? "" : window.location.search,
  explicitEmulatorHost: import.meta.env.VITE_FIRESTORE_EMULATOR_HOST,
});

const emulatorOnlyConfig: FirebaseOptions | null = firestoreRuntimeTarget.kind === "emulator"
  ? {
      apiKey: "emulator-only",
      appId: "emulator-only",
      projectId: "demo-easylife-publication",
    }
  : null;

const runtimeConfig = firebaseConfig ?? emulatorOnlyConfig;
const app: FirebaseApp | null = runtimeConfig ? initializeApp(runtimeConfig) : null;

function unavailableService<T extends object>(service: string) {
  return new Proxy({} as T, {
    get() {
      throw new Error(`${service} is unavailable because approved Firebase client configuration was not supplied.`);
    },
  });
}

export const auth: Auth = app ? getAuth(app) : unavailableService<Auth>("Firebase Auth");
export const db: Firestore = app ? getFirestore(app) : unavailableService<Firestore>("Firestore");
export const firebaseRuntimeAvailable = app !== null;
export { firebaseConfigured };

if (app && firestoreRuntimeTarget.kind === "emulator") {
  connectFirestoreEmulator(db, firestoreRuntimeTarget.host, firestoreRuntimeTarget.port);
}

export { app };
