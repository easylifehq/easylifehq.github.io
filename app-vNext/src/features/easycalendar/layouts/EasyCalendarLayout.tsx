import { Outlet } from "react-router-dom";
import { AppWorkspaceHeader } from "@/components/navigation/AppWorkspaceHeader";

const links = [
  { to: "/app/easycalendar/week", label: "Week" },
  { to: "/app/easycalendar/day", label: "Day" },
];

export function EasyCalendarLayout() {
  return (
    <main className="page-wrap app-theme app-theme-easycalendar">
      <AppWorkspaceHeader
        appLabel="EasyCalendar"
        title="Your time system."
        description="See fixed commitments, flexible task blocks, and the room you still have to work with."
        currentAppHref="/app/easycalendar/day"
        links={links}
      />

      <Outlet />
    </main>
  );
}
