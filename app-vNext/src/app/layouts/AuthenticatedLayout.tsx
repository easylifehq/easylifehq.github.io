import { Outlet, useLocation } from "react-router-dom";
import { AppHeader } from "@/components/navigation/AppHeader";
import { EasyCalendarProvider } from "@/features/easycalendar/EasyCalendarContext";
import { UniversalCapture } from "@/features/experiments/UniversalCapture";
import { useSettings } from "@/features/settings/SettingsContext";

export function AuthenticatedLayout() {
  const location = useLocation();
  const { settings, isExperimentalFeatureEnabled } = useSettings();
  const isDistractionFreeRoute = /^\/app\/easynotes\/[^/]+$/.test(location.pathname);

  return (
    <EasyCalendarProvider>
      <div className={`app-shell-vnext app-shell-header shell-theme-${settings.themeMode}`}>
        {isDistractionFreeRoute ? null : <AppHeader />}
        <div className="app-content app-content-shell">
          <Outlet />
        </div>
        {isExperimentalFeatureEnabled("inboxCapture") ? <UniversalCapture /> : null}
      </div>
    </EasyCalendarProvider>
  );
}
