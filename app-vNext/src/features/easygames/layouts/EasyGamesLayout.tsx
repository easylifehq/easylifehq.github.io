import { Outlet } from "react-router-dom";
import { AppWorkspaceHeader } from "@/components/navigation/AppWorkspaceHeader";
import { EasyGamesProvider } from "@/features/easygames/EasyGamesContext";

export function EasyGamesLayout() {
  return (
    <EasyGamesProvider>
      <main className="page-wrap app-theme app-theme-easygames">
        <AppWorkspaceHeader appLabel="Games" links={[{ to: "/app/easygames", label: "Game shelf" }, { to: "/app/easygames/pair-garden", label: "Pair Garden" }, { to: "/app/easygames/trail-scout", label: "Trail Scout" }]} />
        <Outlet />
      </main>
    </EasyGamesProvider>
  );
}
