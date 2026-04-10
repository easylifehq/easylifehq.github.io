import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/navigation/AppHeader";
import { EasyCalendarProvider } from "@/features/easycalendar/EasyCalendarContext";
import { useSettings } from "@/features/settings/SettingsContext";

export function AuthenticatedLayout() {
  const { settings } = useSettings();

  return (
    <EasyCalendarProvider>
      <div className={`app-shell-vnext app-shell-header shell-theme-${settings.themeMode}`}>
        <AppHeader />
        <div className="app-content app-content-shell">
          <Outlet />
        </div>
      </div>
    </EasyCalendarProvider>
  );
}
