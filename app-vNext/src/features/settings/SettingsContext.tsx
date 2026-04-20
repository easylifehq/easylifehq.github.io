import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { toSafeFirebaseMessage } from "@/lib/firebase/errors";
import {
  defaultShellSettings,
  saveShellSettings,
  subscribeToShellSettings,
  type ExperimentalFeatureId,
  type ThemeMode,
  type UserShellSettings,
  type VisibleAppId,
  type EasyCalendarSettings,
  type EasyListSettings,
  type EasyNotesSettings,
  type EasyWorkoutSettings,
  type RoutingSettings,
  type NotificationSettings,
  type AssistantSettings,
  type StartupRoute,
} from "@/lib/firestore/settings";

const visualQaExperimentalFeatures: ExperimentalFeatureId[] = [
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

function getVisualQaSettings(): UserShellSettings | null {
  if (!import.meta.env.DEV) return null;

  const params = new URLSearchParams(window.location.search);
  if (params.get("visualQa") !== "1") return null;

  const theme = params.get("theme");
  const themeMode: ThemeMode =
    theme === "candy" ||
    theme === "gamer" ||
    theme === "elvish" ||
    theme === "classic" ||
    theme === "aurora" ||
    theme === "studio" ||
    theme === "sunrise" ||
    theme === "midnightGarden"
      ? theme
      : "classic";

  return {
    ...defaultShellSettings,
    themeMode,
    experimentalFeatures: visualQaExperimentalFeatures,
  };
}

type SettingsContextValue = {
  settings: UserShellSettings;
  isLoading: boolean;
  error: string;
  setThemeMode: (themeMode: ThemeMode) => Promise<void>;
  setStartupRoute: (startupRoute: StartupRoute) => Promise<void>;
  toggleVisibleApp: (appId: VisibleAppId) => Promise<void>;
  isAppVisible: (appId: VisibleAppId) => boolean;
  toggleExperimentalFeature: (featureId: ExperimentalFeatureId) => Promise<void>;
  isExperimentalFeatureEnabled: (featureId: ExperimentalFeatureId) => boolean;
  setCalendarWakeTime: (wakeTime: string) => Promise<void>;
  updateEasyListSettings: (nextSettings: Partial<EasyListSettings>) => Promise<void>;
  updateEasyNotesSettings: (nextSettings: Partial<EasyNotesSettings>) => Promise<void>;
  updateEasyWorkoutSettings: (nextSettings: Partial<EasyWorkoutSettings>) => Promise<void>;
  updateEasyCalendarSettings: (nextSettings: Partial<EasyCalendarSettings>) => Promise<void>;
  updateRoutingSettings: (nextSettings: Partial<RoutingSettings>) => Promise<void>;
  updateNotificationSettings: (nextSettings: Partial<NotificationSettings>) => Promise<void>;
  updateAssistantSettings: (nextSettings: Partial<AssistantSettings>) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserShellSettings>(defaultShellSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const visualQaSettings = getVisualQaSettings();
    if (visualQaSettings) {
      setSettings(visualQaSettings);
      setIsLoading(false);
      return;
    }

    if (!user) {
      setSettings(defaultShellSettings);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToShellSettings(
      user.uid,
      (nextSettings) => {
        setSettings(nextSettings);
        setIsLoading(false);
        setError("");
      },
      (nextError) => {
        setError(toSafeFirebaseMessage(nextError));
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  async function persist(nextSettings: UserShellSettings) {
    setSettings(nextSettings);
    if (!user) return;
    await saveShellSettings(user.uid, nextSettings);
  }

  async function setThemeMode(themeMode: ThemeMode) {
    await persist({ ...settings, themeMode });
  }

  async function setStartupRoute(startupRoute: StartupRoute) {
    await persist({ ...settings, startupRoute });
  }

  async function toggleVisibleApp(appId: VisibleAppId) {
    const isVisible = settings.visibleApps.includes(appId);
    const nextVisibleApps = isVisible
      ? settings.visibleApps.filter((entry) => entry !== appId)
      : [...settings.visibleApps, appId];

    await persist({
      ...settings,
      visibleApps: nextVisibleApps,
    });
  }

  async function toggleExperimentalFeature(featureId: ExperimentalFeatureId) {
    const isEnabled = settings.experimentalFeatures.includes(featureId);
    const nextExperimentalFeatures = isEnabled
      ? settings.experimentalFeatures.filter((entry) => entry !== featureId)
      : [...settings.experimentalFeatures, featureId];

    await persist({
      ...settings,
      experimentalFeatures: nextExperimentalFeatures,
    });
  }

  async function setCalendarWakeTime(calendarWakeTime: string) {
    await persist({ ...settings, calendarWakeTime });
  }

  async function updateEasyListSettings(nextSettings: Partial<EasyListSettings>) {
    await persist({ ...settings, easyList: { ...settings.easyList, ...nextSettings } });
  }

  async function updateEasyNotesSettings(nextSettings: Partial<EasyNotesSettings>) {
    await persist({ ...settings, easyNotes: { ...settings.easyNotes, ...nextSettings } });
  }

  async function updateEasyWorkoutSettings(nextSettings: Partial<EasyWorkoutSettings>) {
    await persist({ ...settings, easyWorkout: { ...settings.easyWorkout, ...nextSettings } });
  }

  async function updateEasyCalendarSettings(nextSettings: Partial<EasyCalendarSettings>) {
    await persist({ ...settings, easyCalendar: { ...settings.easyCalendar, ...nextSettings } });
  }

  async function updateRoutingSettings(nextSettings: Partial<RoutingSettings>) {
    await persist({ ...settings, routing: { ...settings.routing, ...nextSettings } });
  }

  async function updateNotificationSettings(nextSettings: Partial<NotificationSettings>) {
    await persist({ ...settings, notifications: { ...settings.notifications, ...nextSettings } });
  }

  async function updateAssistantSettings(nextSettings: Partial<AssistantSettings>) {
    await persist({ ...settings, assistant: { ...settings.assistant, ...nextSettings } });
  }

  const value = useMemo(
    () => ({
      settings,
      isLoading,
      error,
      setThemeMode,
      setStartupRoute,
      toggleVisibleApp,
      toggleExperimentalFeature,
      setCalendarWakeTime,
      updateEasyListSettings,
      updateEasyNotesSettings,
      updateEasyWorkoutSettings,
      updateEasyCalendarSettings,
      updateRoutingSettings,
      updateNotificationSettings,
      updateAssistantSettings,
      isAppVisible: (appId: VisibleAppId) => settings.visibleApps.includes(appId),
      isExperimentalFeatureEnabled: (featureId: ExperimentalFeatureId) =>
        settings.experimentalFeatures.includes(featureId),
    }),
    [settings, isLoading, error]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }

  return context;
}
