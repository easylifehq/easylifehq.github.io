import { Outlet } from "react-router-dom";
import { AppWorkspaceHeader } from "@/components/navigation/AppWorkspaceHeader";
import { EasyDrinksProvider } from "@/features/easydrinks/EasyDrinksContext";

export function EasyDrinksLayout() { return <EasyDrinksProvider><main className="page-wrap app-theme app-theme-easydrinks"><AppWorkspaceHeader appLabel="Drinks" links={[{ to: "/app/easydrinks", label: "Make & pantry" }, { to: "/app/easydrinks/new", label: "New recipe" }]} /><Outlet /></main></EasyDrinksProvider>; }
