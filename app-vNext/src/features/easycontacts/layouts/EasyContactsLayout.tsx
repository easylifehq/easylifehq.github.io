import { Outlet } from "react-router-dom";
import { AppWorkspaceHeader } from "@/components/navigation/AppWorkspaceHeader";
import { EasyContactsProvider } from "@/features/easycontacts/EasyContactsContext";

export function EasyContactsLayout() {
  return (
    <EasyContactsProvider>
      <main className="page-wrap app-theme app-theme-easycontacts">
        <AppWorkspaceHeader
          appLabel="EasyContacts"
          title="Your relationship layer."
          description="Keep networking contacts, follow-up dates, and opportunity context in one shared place."
          currentAppHref="/app/easycontacts"
          compact
        />
        <Outlet />
      </main>
    </EasyContactsProvider>
  );
}
