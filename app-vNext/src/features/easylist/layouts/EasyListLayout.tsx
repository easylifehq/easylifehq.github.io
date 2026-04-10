import { Outlet } from "react-router-dom";
import { AppWorkspaceHeader } from "@/components/navigation/AppWorkspaceHeader";
import { EasyListProvider } from "@/features/easylist/EasyListContext";

const links = [
  { to: "/app/easylist/dashboard", label: "Dashboard" },
  { to: "/app/easylist/add", label: "Add Tasks" },
  { to: "/app/easylist/archive", label: "Archive" },
];

export function EasyListLayout() {
  return (
    <EasyListProvider>
      <main className="page-wrap app-theme app-theme-easylist">
        <AppWorkspaceHeader appLabel="EasyList" links={links} />

        <Outlet />
      </main>
    </EasyListProvider>
  );
}
