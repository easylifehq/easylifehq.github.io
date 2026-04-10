import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/app/easycalendar/week", label: "Week" },
  { to: "/app/easycalendar/day", label: "Day" },
];

export function EasyCalendarLayout() {
  return (
    <main className="page-wrap">
      <header className="page-hero-vnext">
        <p className="eyebrow">EasyCalendar</p>
        <h1>Your time system.</h1>
        <p>
          See fixed commitments, flexible task blocks, and the room you still
          have to work with.
        </p>
      </header>

      <nav className="subnav" aria-label="EasyCalendar navigation">
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
  );
}
