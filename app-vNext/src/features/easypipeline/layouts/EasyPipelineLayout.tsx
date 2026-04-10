import { NavLink, Outlet } from "react-router-dom";
import { EasyPipelineProvider } from "@/features/easypipeline/EasyPipelineContext";

const links = [
  { to: "/app/easypipeline/dashboard", label: "Dashboard" },
  { to: "/app/easypipeline/stats", label: "Stats" },
  { to: "/app/easypipeline/email", label: "Email Drafts" },
];

export function EasyPipelineLayout() {
  return (
    <EasyPipelineProvider>
      <main className="page-wrap">
        <header className="page-hero-vnext">
          <p className="eyebrow">EasyPipeline</p>
          <h1>Your application tracker.</h1>
          <p>Keep roles moving, follow up on time, and hold the whole search in one lane.</p>
        </header>

        <nav className="subnav" aria-label="EasyPipeline navigation">
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
    </EasyPipelineProvider>
  );
}
