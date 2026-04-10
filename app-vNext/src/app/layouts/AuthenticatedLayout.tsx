import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/navigation/AppHeader";
import { EasyCalendarProvider } from "@/features/easycalendar/EasyCalendarContext";

export function AuthenticatedLayout() {
  return (
    <EasyCalendarProvider>
      <div className="app-shell-vnext app-shell-header">
        <AppHeader />
        <div className="app-content app-content-shell">
          <Outlet />
        </div>
      </div>
    </EasyCalendarProvider>
  );
}
