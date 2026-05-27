import { Outlet } from "react-router-dom";
import { EasyWorkoutProvider } from "@/features/easyworkout/EasyWorkoutContext";

export function EasyWorkoutLayout() {
  return (
    <EasyWorkoutProvider>
      <main className="page-wrap app-theme app-theme-easyworkout">
        <Outlet />
      </main>
    </EasyWorkoutProvider>
  );
}
