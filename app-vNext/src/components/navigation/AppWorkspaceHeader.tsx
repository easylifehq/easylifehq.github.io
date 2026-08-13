import { NavLink, useLocation } from "react-router-dom";
import { withReviewMode } from "@/features/coreloop/demo/reviewRoute";

type WorkspaceLink = {
  to: string;
  label: string;
};

type AppWorkspaceHeaderProps = {
  appLabel: string;
  links?: WorkspaceLink[];
};

export function AppWorkspaceHeader({
  appLabel,
  links = [],
}: AppWorkspaceHeaderProps) {
  const location = useLocation();
  if (!links.length) {
    return null;
  }

  return (
    <nav className="subnav" aria-label={`${appLabel} navigation`}>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={withReviewMode(link.to, location.search)}
          className={({ isActive }) => `subnav-link${isActive ? " active" : ""}`}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
