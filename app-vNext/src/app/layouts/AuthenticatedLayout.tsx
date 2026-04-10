import { Outlet, useLocation } from "react-router-dom";
import { AppHeader } from "@/components/navigation/AppHeader";
import { EasyCalendarProvider } from "@/features/easycalendar/EasyCalendarContext";
import { useSettings } from "@/features/settings/SettingsContext";

export function AuthenticatedLayout() {
  const location = useLocation();
  const { settings } = useSettings();
  const isDistractionFreeRoute = /^\/app\/easynotes\/[^/]+$/.test(location.pathname);

  return (
    <EasyCalendarProvider>
      <div className={`app-shell-vnext app-shell-header shell-theme-${settings.themeMode}`}>
        {isDistractionFreeRoute ? null : <AppHeader />}
        <div className="app-content app-content-shell">
          <Outlet />
        </div>
      </div>
    </EasyCalendarProvider>
  );
}
