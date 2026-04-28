import { Outlet } from "react-router-dom";
import { AppWorkspaceHeader } from "@/components/navigation/AppWorkspaceHeader";
import { EasyListProvider } from "@/features/easylist/EasyListContext";

const links = [
  { to: "/app/easylist/dashboard", label: "Lists" },
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
