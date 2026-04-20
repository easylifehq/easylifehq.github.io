import { Outlet, useLocation } from "react-router-dom";
import { AppHeader } from "@/components/navigation/AppHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { EasyCalendarProvider } from "@/features/easycalendar/EasyCalendarContext";
import { UniversalCapture } from "@/features/experiments/UniversalCapture";
import { useSettings } from "@/features/settings/SettingsContext";
import { useRememberAppRoute } from "@/lib/mobile/appRouteMemory";
import { useMobileRuntime } from "@/lib/mobile/useMobileRuntime";
import { useMobileViewportCssVars } from "@/lib/mobile/useMobileViewportCssVars";

export function AuthenticatedLayout() {
  const location = useLocation();
  const { settings, isExperimentalFeatureEnabled } = useSettings();
  const { isStandalone, isOnline } = useMobileRuntime();
  useRememberAppRoute();
  useMobileViewportCssVars();
  const isNotesFocusEditorEnabled = isExperimentalFeatureEnabled("notesFocusEditor");
  const isDistractionFreeRoute =
    isNotesFocusEditorEnabled && /^\/app\/easynotes\/[^/]+$/.test(location.pathname);
  const experimentalClasses = [
    isExperimentalFeatureEnabled("mobileAppSheet") ? "experiment-mobile-app-sheet" : "",
    isNotesFocusEditorEnabled ? "experiment-notes-focus-editor" : "",
    isExperimentalFeatureEnabled("gymMode") ? "experiment-gym-mode" : "",
    isStandalone ? "mobile-standalone-shell" : "",
    isOnline ? "" : "mobile-offline-shell",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <EasyCalendarProvider>
      <div className={`app-shell-vnext app-shell-header shell-theme-${settings.themeMode}${experimentalClasses ? ` ${experimentalClasses}` : ""}`}>
        {isDistractionFreeRoute ? null : <AppHeader />}
        {!isOnline ? (
          <div className="mobile-runtime-banner" role="status">
            EasyLife is offline. You can keep viewing cached screens, but new syncs may wait.
          </div>
        ) : null}
        <div className="app-content app-content-shell">
          <Outlet />
          <SiteFooter />
        </div>
        <UniversalCapture />
      </div>
    </EasyCalendarProvider>
  );
}
