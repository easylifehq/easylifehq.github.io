import { Outlet, useLocation } from "react-router-dom";
import { AppWorkspaceHeader } from "@/components/navigation/AppWorkspaceHeader";
import { EasyNotesProvider } from "@/features/easynotes/EasyNotesContext";

export function EasyNotesLayout() {
  const location = useLocation();
  const showLibraryChrome = location.pathname === "/app/easynotes";

  return (
    <EasyNotesProvider>
      <main className="page-wrap page-wrap-notes app-theme app-theme-easynotes">
        {showLibraryChrome ? <AppWorkspaceHeader appLabel="EasyNotes" links={[]} /> : null}
        <Outlet />
      </main>
    </EasyNotesProvider>
  );
}
