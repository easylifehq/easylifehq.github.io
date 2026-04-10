import { NavLink } from "react-router-dom";

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
  if (!links.length) {
    return null;
  }

  return (
    <nav className="subnav" aria-label={`${appLabel} navigation`}>
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
  );
}
