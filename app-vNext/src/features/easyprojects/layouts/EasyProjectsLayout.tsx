import { Outlet } from "react-router-dom";
import { AppWorkspaceHeader } from "@/components/navigation/AppWorkspaceHeader";
import { EasyProjectsProvider } from "@/features/easyprojects/EasyProjectsContext";

const links = [{ to: "/app/easyprojects", label: "Projects Home" }];

export function EasyProjectsLayout() {
  return (
    <EasyProjectsProvider>
      <main className="page-wrap app-theme app-theme-easyprojects">
        <AppWorkspaceHeader appLabel="EasyProjects" links={links} />
        <Outlet />
      </main>
    </EasyProjectsProvider>
  );
}
