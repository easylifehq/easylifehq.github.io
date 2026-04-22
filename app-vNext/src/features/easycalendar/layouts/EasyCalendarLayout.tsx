import { Outlet } from "react-router-dom";

export function EasyCalendarLayout() {
  return (
    <main className="page-wrap app-theme app-theme-easycalendar">
      <Outlet />
    </main>
  );
}
