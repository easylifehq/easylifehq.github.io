import { NavLink } from "react-router-dom";
import { ProductsMenu } from "@/components/navigation/ProductsMenu";
import { appProductItems } from "@/components/navigation/appProducts";

type WorkspaceLink = {
  to: string;
  label: string;
};

type AppWorkspaceHeaderProps = {
  appLabel: string;
  title: string;
  description: string;
  currentAppHref: string;
  links?: WorkspaceLink[];
  compact?: boolean;
};

export function AppWorkspaceHeader({
  appLabel,
  title,
  description,
  currentAppHref,
  links = [],
  compact = false,
}: AppWorkspaceHeaderProps) {
  const switcherItems = appProductItems.filter((item) => item.href !== currentAppHref);

  return (
    <>
      <header className={`page-hero-vnext workspace-hero${compact ? " compact" : ""}`}>
        <div className="workspace-hero-top">
          <div>
            <p className="eyebrow">{appLabel}</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>

          <div className="workspace-hero-actions">
            <ProductsMenu items={switcherItems} label="Open Another App" />
          </div>
        </div>
      </header>

      {links.length ? (
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
      ) : null}
    </>
  );
}
