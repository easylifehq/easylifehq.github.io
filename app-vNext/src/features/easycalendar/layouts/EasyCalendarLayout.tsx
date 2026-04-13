import { Outlet } from "react-router-dom";
import { AppWorkspaceHeader } from "@/components/navigation/AppWorkspaceHeader";

const links = [
  { to: "/app/easycalendar/day", label: "Day" },
  { to: "/app/easycalendar/week", label: "Week" },
  { to: "/app/easycalendar/week", label: "Month" },
];

export function EasyCalendarLayout() {
  return (
    <main className="page-wrap app-theme app-theme-easycalendar">
      <AppWorkspaceHeader appLabel="EasyCalendar" links={links} />

      <Outlet />
    </main>
  );
}
