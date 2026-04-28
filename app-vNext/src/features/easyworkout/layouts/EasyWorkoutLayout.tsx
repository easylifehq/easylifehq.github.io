import { Outlet } from "react-router-dom";
import { AppWorkspaceHeader } from "@/components/navigation/AppWorkspaceHeader";
import { EasyWorkoutProvider } from "@/features/easyworkout/EasyWorkoutContext";

const links = [
  { to: "/app/easyworkout/dashboard", label: "Dashboard" },
  { to: "/app/easyworkout/log", label: "Log" },
  { to: "/app/easyworkout/routines", label: "Routines" },
];

export function EasyWorkoutLayout() {
  return (
    <EasyWorkoutProvider>
      <main className="page-wrap app-theme app-theme-easyworkout">
        <AppWorkspaceHeader appLabel="EasyWorkout" links={links} />

        <Outlet />
      </main>
    </EasyWorkoutProvider>
  );
}
