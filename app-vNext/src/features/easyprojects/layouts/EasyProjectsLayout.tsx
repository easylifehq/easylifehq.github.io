import { Outlet } from "react-router-dom";
import { EasyProjectsProvider } from "@/features/easyprojects/EasyProjectsContext";

export function EasyProjectsLayout() {
  return (
    <EasyProjectsProvider>
      <main className="page-wrap app-theme app-theme-easyprojects">
        <Outlet />
      </main>
    </EasyProjectsProvider>
  );
}
