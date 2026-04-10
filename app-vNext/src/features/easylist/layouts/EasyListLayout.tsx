import { Outlet } from "react-router-dom";
import { AppWorkspaceHeader } from "@/components/navigation/AppWorkspaceHeader";
import { EasyListProvider } from "@/features/easylist/EasyListContext";

const links = [
  { to: "/app/easylist/dashboard", label: "Dashboard" },
  { to: "/app/easylist/inbox", label: "Inbox" },
  { to: "/app/easylist/today", label: "Today" },
  { to: "/app/easylist/upcoming", label: "Upcoming" },
  { to: "/app/easylist/archive", label: "Archive" },
];

export function EasyListLayout() {
  return (
    <EasyListProvider>
      <main className="page-wrap app-theme app-theme-easylist">
        <AppWorkspaceHeader
          appLabel="EasyList"
          title="Your task system."
          description="Capture, sort, complete, and plan the work that needs to get done."
          currentAppHref="/app/easylist/dashboard"
          links={links}
        />

        <Outlet />
      </main>
    </EasyListProvider>
  );
}
