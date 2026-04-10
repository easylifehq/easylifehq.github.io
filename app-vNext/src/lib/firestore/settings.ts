import { doc, onSnapshot, serverTimestamp, setDoc, type DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export type ThemeMode = "classic" | "candy" | "kirby" | "gamer" | "elvish";
export type VisibleAppId =
  | "easylist"
  | "easynotes"
  | "easycalendar"
  | "easypipeline"
  | "easycontacts";

export type UserShellSettings = {
  themeMode: ThemeMode;
  visibleApps: VisibleAppId[];
};

export const defaultShellSettings: UserShellSettings = {
  themeMode: "classic",
  visibleApps: ["easylist", "easynotes", "easycalendar", "easypipeline", "easycontacts"],
};

function normalizeVisibleApps(value: unknown): VisibleAppId[] {
  const valid: VisibleAppId[] = [
    "easylist",
    "easynotes",
    "easycalendar",
    "easypipeline",
    "easycontacts",
  ];

  if (!Array.isArray(value)) {
    return defaultShellSettings.visibleApps;
  }

  const filtered = value.filter((entry): entry is VisibleAppId =>
    valid.includes(entry as VisibleAppId)
  );

  return filtered.length ? filtered : defaultShellSettings.visibleApps;
}

function normalizeThemeMode(value: unknown): ThemeMode {
  const valid: ThemeMode[] = ["classic", "candy", "kirby", "gamer", "elvish"];
  return valid.includes(value as ThemeMode) ? (value as ThemeMode) : "classic";
}

export function getShellSettingsDoc(userId: string) {
  return doc(db, "users", userId, "appPreferences", "shell");
}

export function normalizeShellSettings(data: DocumentData | undefined): UserShellSettings {
  return {
    themeMode: normalizeThemeMode(data?.themeMode),
    visibleApps: normalizeVisibleApps(data?.visibleApps),
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
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
