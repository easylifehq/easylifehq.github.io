import { Outlet } from "react-router-dom";
import { EasyNotesProvider } from "@/features/easynotes/EasyNotesContext";

export function EasyNotesLayout() {
  return (
    <EasyNotesProvider>
      <main className="page-wrap page-wrap-notes">
        <Outlet />
      </main>
    </EasyNotesProvider>
  );
}
