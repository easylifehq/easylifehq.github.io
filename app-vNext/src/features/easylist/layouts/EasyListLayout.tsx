import { Outlet } from "react-router-dom";
import { AppWorkspaceHeader } from "@/components/navigation/AppWorkspaceHeader";
import { EasyListProvider } from "@/features/easylist/EasyListContext";

const links = [
  { to: "/app/easylist/dashboard", label: "Review" },
  { to: "/app/easylist/email", label: "Email drafts" },
];

export function EasyListLayout() {
  return (
    <EasyListProvider>
      <main className="page-wrap app-theme app-theme-easylist">
        <AppWorkspaceHeader appLabel="Inbox" links={links} />

        <Outlet />
      </main>
    </EasyListProvider>
  );
}
