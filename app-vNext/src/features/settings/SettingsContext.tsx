import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/features/auth/AuthContext";
import {
  defaultShellSettings,
  saveShellSettings,
  subscribeToShellSettings,
  type ThemeMode,
  type UserShellSettings,
  type VisibleAppId,
} from "@/lib/firestore/settings";

type SettingsContextValue = {
  settings: UserShellSettings;
  isLoading: boolean;
  error: string;
  setThemeMode: (themeMode: ThemeMode) => Promise<void>;
  toggleVisibleApp: (appId: VisibleAppId) => Promise<void>;
  isAppVisible: (appId: VisibleAppId) => boolean;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserShellSettings>(defaultShellSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
        setError(nextError.message);
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

  const value = useMemo(
    () => ({
      settings,
      isLoading,
      error,
      setThemeMode,
      toggleVisibleApp,
      isAppVisible: (appId: VisibleAppId) => settings.visibleApps.includes(appId),
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
