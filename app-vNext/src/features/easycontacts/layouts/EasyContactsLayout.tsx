import { Outlet } from "react-router-dom";
import { EasyContactsProvider } from "@/features/easycontacts/EasyContactsContext";

export function EasyContactsLayout() {
  return (
    <EasyContactsProvider>
      <main className="page-wrap">
        <header className="page-hero-vnext">
          <p className="eyebrow">EasyContacts</p>
          <h1>Your relationship layer.</h1>
          <p>Keep networking contacts, follow-up dates, and opportunity context in one shared place.</p>
        </header>
        <Outlet />
      </main>
    </EasyContactsProvider>
  );
}
