import { doc, onSnapshot, serverTimestamp, setDoc, type DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export type ThemeMode =
  | "classic"
  | "candy"
  | "gamer"
  | "elvish"
  | "aurora"
  | "studio"
  | "sunrise"
  | "midnightGarden";
export type VisibleAppId =
  | "easylist"
  | "easynotes"
  | "easycalendar"
  | "easypipeline"
  | "easycontacts"
  | "easyprojects"
  | "easyworkout";

export type ExperimentalFeatureId =
  | "smartTaskEntry"
  | "notesFocusEditor"
  | "mobileAppSheet"
  | "dailyReview"
  | "inboxCapture"
  | "overdueTriage"
  | "notesProcessor"
  | "startHere"
  | "projectPlanner"
  | "gymMode";

export type UserShellSettings = {
  themeMode: ThemeMode;
  visibleApps: VisibleAppId[];
  experimentalFeatures: ExperimentalFeatureId[];
};

export const defaultShellSettings: UserShellSettings = {
  themeMode: "classic",
  visibleApps: [
    "easylist",
    "easynotes",
    "easycalendar",
    "easyworkout",
  ],
  experimentalFeatures: [],
};

const validVisibleApps: VisibleAppId[] = [
  "easylist",
  "easynotes",
  "easycalendar",
  "easypipeline",
  "easycontacts",
  "easyprojects",
  "easyworkout",
];

const validExperimentalFeatures: ExperimentalFeatureId[] = [
  "smartTaskEntry",
  "notesFocusEditor",
  "mobileAppSheet",
  "dailyReview",
  "inboxCapture",
  "overdueTriage",
  "notesProcessor",
  "startHere",
  "projectPlanner",
  "gymMode",
];

function normalizeVisibleApps(value: unknown): VisibleAppId[] {
  if (!Array.isArray(value)) {
    return defaultShellSettings.visibleApps;
  }

  const filtered = value.filter((entry): entry is VisibleAppId =>
    validVisibleApps.includes(entry as VisibleAppId)
  );

  return filtered.length ? filtered : defaultShellSettings.visibleApps;
}

function normalizeExperimentalFeatures(value: unknown): ExperimentalFeatureId[] {
  if (!Array.isArray(value)) {
    return defaultShellSettings.experimentalFeatures;
  }

  return value.filter((entry): entry is ExperimentalFeatureId =>
    validExperimentalFeatures.includes(entry as ExperimentalFeatureId)
  );
}

function normalizeThemeMode(value: unknown): ThemeMode {
  if (value === "kirby") {
    return "candy";
  }

  const valid: ThemeMode[] = [
    "classic",
    "candy",
    "gamer",
    "elvish",
    "aurora",
    "studio",
    "sunrise",
    "midnightGarden",
  ];
  return valid.includes(value as ThemeMode) ? (value as ThemeMode) : "classic";
}

export function getShellSettingsDoc(userId: string) {
  return doc(db, "users", userId, "appPreferences", "shell");
}

export function normalizeShellSettings(data: DocumentData | undefined): UserShellSettings {
  return {
    themeMode: normalizeThemeMode(data?.themeMode),
    visibleApps: normalizeVisibleApps(data?.visibleApps),
    experimentalFeatures: normalizeExperimentalFeatures(data?.experimentalFeatures),
  };
}

export function subscribeToShellSettings(
  userId: string,
  callback: (settings: UserShellSettings) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    getShellSettingsDoc(userId),
    (snapshot) => {
      callback(normalizeShellSettings(snapshot.data()));
    },
    (error) => {
      onError?.(error);
    }
  );
}

export async function saveShellSettings(userId: string, settings: UserShellSettings) {
  await setDoc(
    getShellSettingsDoc(userId),
    {
      themeMode: settings.themeMode,
      visibleApps: settings.visibleApps,
      experimentalFeatures: settings.experimentalFeatures,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
