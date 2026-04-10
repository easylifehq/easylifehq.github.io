import { NavLink, Outlet } from "react-router-dom";
import { EasyListProvider } from "@/features/easylist/EasyListContext";

const links = [
  { to: "/app/easylist/inbox", label: "Inbox" },
  { to: "/app/easylist/today", label: "Today" },
  { to: "/app/easylist/upcoming", label: "Upcoming" },
  { to: "/app/easylist/archive", label: "Archive" },
];

export function EasyListLayout() {
  return (
    <EasyListProvider>
      <main className="page-wrap">
        <header className="page-hero-vnext">
          <p className="eyebrow">EasyList</p>
          <h1>Your task system.</h1>
          <p>
            Capture, sort, complete, and review the work that needs to get done.
          </p>
        </header>

        <nav className="subnav" aria-label="EasyList navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `subnav-link${isActive ? " active" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <Outlet />
      </main>
    </EasyListProvider>
  );
}
