import { Outlet } from "react-router-dom";
import { AppWorkspaceHeader } from "@/components/navigation/AppWorkspaceHeader";
import { EasyNotesProvider } from "@/features/easynotes/EasyNotesContext";

export function EasyNotesLayout() {
  return (
    <EasyNotesProvider>
      <main className="page-wrap page-wrap-notes app-theme app-theme-easynotes">
        <AppWorkspaceHeader
          appLabel="EasyNotes"
          title="Your note shelf."
          description="Write fast, stay focused, and send rough thoughts into the rest of the system when you're ready."
          currentAppHref="/app/easynotes"
          compact
        />
        <Outlet />
      </main>
    </EasyNotesProvider>
  );
}
