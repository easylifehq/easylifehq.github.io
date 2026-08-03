import type { FirebaseOptions } from "firebase/app";

const configuredValues = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredValues = [
  configuredValues.apiKey,
  configuredValues.authDomain,
  configuredValues.projectId,
  configuredValues.storageBucket,
  configuredValues.messagingSenderId,
  configuredValues.appId,
];

export const firebaseConfig: FirebaseOptions | null = requiredValues.every(
  (value) => typeof value === "string" && value.trim().length > 0
)
  ? configuredValues
  : null;

export const firebaseConfigured = firebaseConfig !== null;
