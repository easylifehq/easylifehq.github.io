import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./config";
import { resolveFirestoreRuntimeTarget } from "./runtimeSafety";

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const firestoreRuntimeTarget = resolveFirestoreRuntimeTarget({
  hostname: typeof window === "undefined" ? "" : window.location.hostname,
  search: typeof window === "undefined" ? "" : window.location.search,
  explicitEmulatorHost: import.meta.env.VITE_FIRESTORE_EMULATOR_HOST,
});

if (firestoreRuntimeTarget.kind === "emulator") {
  connectFirestoreEmulator(db, firestoreRuntimeTarget.host, firestoreRuntimeTarget.port);
}

export { app };
