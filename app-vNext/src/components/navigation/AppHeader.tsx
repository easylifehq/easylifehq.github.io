import { NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { ProductsMenu, type ProductsMenuItem } from "@/components/navigation/ProductsMenu";
import { auth } from "@/lib/firebase/client";

const appLinks = [
  { to: "/app/hq", label: "EasyHQ" },
  { to: "/app/easylist/dashboard", label: "EasyList" },
  { to: "/app/easycalendar/day", label: "EasyCalendar" },
  { to: "/app/settings", label: "Settings" },
];

const productItems: ProductsMenuItem[] = [
  {
    href: "/app/hq",
    label: "EasyHQ",
    description: "See your day at a glance.",
  },
  {
    href: "/app/easylist/dashboard",
    label: "EasyList",
    description: "Capture and organize what needs doing.",
  },
  {
    href: "/app/easycalendar/day",
    label: "EasyCalendar",
    description: "Plan your time and manage task blocks.",
  },
  {
    href: "/app/settings",
    label: "Settings",
    description: "Adjust account and app preferences.",
  },
];

export function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header-main">
        <div className="site-brand">
          <span className="brand-badge">EL</span>
          <div>
            <p className="brand-kicker">Easy System</p>
            <strong className="site-brand-title">App vNext</strong>
          </div>
        </div>

        <div className="app-header-actions">
          <ProductsMenu items={productItems} />
          <button
            type="button"
            className="button-secondary"
            onClick={() => {
              void signOut(auth);
            }}
          >
            Log Out
          </button>
        </div>
      </div>

      <nav className="app-top-nav" aria-label="App">
        {appLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `app-top-link${isActive ? " active" : ""}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
