import { Outlet, useLocation } from "react-router-dom";
import { AppHeader } from "@/components/navigation/AppHeader";
import { EasyCalendarProvider } from "@/features/easycalendar/EasyCalendarContext";
import { UniversalCapture } from "@/features/experiments/UniversalCapture";
import { useSettings } from "@/features/settings/SettingsContext";

export function AuthenticatedLayout() {
  const location = useLocation();
  const { settings, isExperimentalFeatureEnabled } = useSettings();
  const isNotesFocusEditorEnabled = isExperimentalFeatureEnabled("notesFocusEditor");
  const isDistractionFreeRoute =
    isNotesFocusEditorEnabled && /^\/app\/easynotes\/[^/]+$/.test(location.pathname);
  const experimentalClasses = [
    isExperimentalFeatureEnabled("mobileAppSheet") ? "experiment-mobile-app-sheet" : "",
    isNotesFocusEditorEnabled ? "experiment-notes-focus-editor" : "",
    isExperimentalFeatureEnabled("gymMode") ? "experiment-gym-mode" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <EasyCalendarProvider>
      <div className={`app-shell-vnext app-shell-header shell-theme-${settings.themeMode}${experimentalClasses ? ` ${experimentalClasses}` : ""}`}>
        {isDistractionFreeRoute ? null : <AppHeader />}
        <div className="app-content app-content-shell">
          <Outlet />
        </div>
        <UniversalCapture />
      </div>
    </EasyCalendarProvider>
  );
}
