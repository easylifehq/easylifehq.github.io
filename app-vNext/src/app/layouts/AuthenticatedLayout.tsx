import { Outlet, useLocation } from "react-router-dom";
import { AppHeader } from "@/components/navigation/AppHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { EasyCalendarProvider } from "@/features/easycalendar/EasyCalendarContext";
import { CoreLoopSearchProvider } from "@/features/coreloop/CoreLoopSearchContext";
import { GlobalCommandPalette } from "@/features/coreloop/components/GlobalCommandPalette";
import { UniversalCapture } from "@/features/experiments/UniversalCapture";
import { useAuth } from "@/features/auth/AuthContext";
import { useSettings } from "@/features/settings/SettingsContext";
import { useRememberAppRoute } from "@/lib/mobile/appRouteMemory";
import { NotificationScheduler } from "@/lib/mobile/NotificationScheduler";
import { useMobileThemeColor } from "@/lib/mobile/useMobileThemeColor";
import { useMobileRuntime } from "@/lib/mobile/useMobileRuntime";
import { useMobileViewportCssVars } from "@/lib/mobile/useMobileViewportCssVars";

export function AuthenticatedLayout() {
  const location = useLocation();
  const { isAuditMode } = useAuth();
  const { settings, isExperimentalFeatureEnabled } = useSettings();
  const { isStandalone } = useMobileRuntime();
  useRememberAppRoute();
  useMobileThemeColor(settings.themeMode);
  useMobileViewportCssVars();
  const isNotesFocusEditorEnabled = isExperimentalFeatureEnabled("notesFocusEditor");
  const isDistractionFreeRoute =
    isNotesFocusEditorEnabled && /^\/app\/easynotes\/[^/]+$/.test(location.pathname);
  const experimentalClasses = [
    isExperimentalFeatureEnabled("mobileAppSheet") ? "experiment-mobile-app-sheet" : "",
    isNotesFocusEditorEnabled ? "experiment-notes-focus-editor" : "",
    isExperimentalFeatureEnabled("gymMode") ? "experiment-gym-mode" : "",
    isStandalone ? "mobile-standalone-shell" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <EasyCalendarProvider>
      <CoreLoopSearchProvider>
        <div className={`app-shell-vnext app-shell-header shell-theme-${settings.themeMode}${experimentalClasses ? ` ${experimentalClasses}` : ""}`}>
          {isAuditMode ? <div className="audit-preview-label" role="note">Synthetic audit preview · local demo data only</div> : null}
          {isDistractionFreeRoute ? null : <AppHeader />}
          <div className="app-content app-content-shell">
            <Outlet />
            <SiteFooter />
          </div>
          <NotificationScheduler />
          <GlobalCommandPalette />
          <UniversalCapture />
        </div>
      </CoreLoopSearchProvider>
    </EasyCalendarProvider>
  );
}
