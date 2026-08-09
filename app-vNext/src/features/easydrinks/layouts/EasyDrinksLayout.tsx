import { Outlet } from "react-router-dom";
import { AppWorkspaceHeader } from "@/components/navigation/AppWorkspaceHeader";
import { EasyDrinksProvider } from "@/features/easydrinks/EasyDrinksContext";

export function EasyDrinksLayout() {
  return (
    <EasyDrinksProvider>
      <main className="page-wrap app-theme app-theme-easydrinks">
        <AppWorkspaceHeader appLabel="Drinks" links={[{ to: "/app/easydrinks", label: "Saved drinks" }, { to: "/app/easydrinks/new", label: "New drink" }]} />
        <Outlet />
      </main>
    </EasyDrinksProvider>
  );
}
