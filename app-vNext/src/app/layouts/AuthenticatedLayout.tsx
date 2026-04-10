import { NavLink, Outlet } from "react-router-dom";
import { signOut } from "firebase/auth";
import { EasyCalendarProvider } from "@/features/easycalendar/EasyCalendarContext";
import { auth } from "@/lib/firebase/client";

const productLinks = [
  { to: "/app/hq", label: "EasyHQ" },
  { to: "/app/easylist/inbox", label: "EasyList" },
  { to: "/app/easycalendar/week", label: "EasyCalendar" },
  { to: "/app/settings", label: "Settings" },
];

export function AuthenticatedLayout() {
  return (
    <EasyCalendarProvider>
      <div className="app-shell-vnext">
        <aside className="app-sidebar">
          <div className="brand-block">
            <span className="brand-badge">EL</span>
            <div>
              <p className="brand-kicker">Easy System</p>
              <h1 className="brand-title">App vNext</h1>
            </div>
          </div>

          <nav className="sidebar-nav" aria-label="Primary">
            {productLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `sidebar-link${isActive ? " active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            className="ghost-button"
            onClick={() => {
              void signOut(auth);
            }}
          >
            Log Out
          </button>
        </aside>

        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </EasyCalendarProvider>
  );
}
