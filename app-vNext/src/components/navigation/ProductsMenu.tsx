import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export type ProductsMenuItem = {
  href: string;
  label: string;
  description: string;
  group?: string;
  groupDescription?: string;
  isRoute?: boolean;
};

type ProductsMenuProps = {
  items: ProductsMenuItem[];
  label?: string;
  panelLabel?: string;
  className?: string;
  panelClassName?: string;
  showDescriptions?: boolean;
};

export function ProductsMenu({
  items,
  label = "Products",
  panelLabel,
  className = "",
  panelClassName = "",
  showDescriptions = false,
}: ProductsMenuProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const hasGroups = items.some((item) => item.group);
  const shouldShowDescriptions = showDescriptions;
  const groupedItems = items.reduce<Array<{ label: string; description?: string; items: ProductsMenuItem[] }>>(
    (groups, item) => {
      const label = item.group ?? "";
      const existingGroup = groups.find((group) => group.label === label);

      if (existingGroup) {
        existingGroup.items.push(item);
        return groups;
      }

      groups.push({
        label,
        description: item.groupDescription,
        items: [item],
      });
      return groups;
    },
    []
  );

  function isCurrentItem(item: ProductsMenuItem) {
    if (item.isRoute === false) return false;
    if (location.pathname === item.href) return true;

    const appRoot = item.href.startsWith("/app/")
      ? item.href.split("/").slice(0, 3).join("/")
      : item.href;

    return location.pathname === appRoot || location.pathname.startsWith(`${appRoot}/`);
  }

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleResize() {
      setIsOpen(false);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`products-menu${className ? ` ${className}` : ""}`}>
      <button
        type="button"
        className="menu-trigger-button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        {label}
      </button>

      <button
        type="button"
        className={`menu-backdrop${isOpen ? " open" : ""}`}
        aria-label="Close apps menu"
        onClick={() => setIsOpen(false)}
      />

      <div className={`menu-panel${isOpen ? " open" : ""}${panelClassName ? ` ${panelClassName}` : ""}`}>
        <div className="menu-panel-header">
          <strong>{panelLabel ?? label}</strong>
          <button type="button" className="ghost-button compact-button" onClick={() => setIsOpen(false)}>
            Close
          </button>
        </div>
        {(hasGroups ? groupedItems : [{ label: "", items }]).map((group) => (
          <div key={group.label || "all"} className={hasGroups ? "menu-link-group" : undefined}>
            {group.label ? (
              <div className="menu-link-group-header">
                <strong>{group.label}</strong>
                {shouldShowDescriptions && group.description ? <span>{group.description}</span> : null}
              </div>
            ) : null}
            {group.items.map((item) => {
              const isCurrent = isCurrentItem(item);

              return item.isRoute === false ? (
                <a
                  key={item.href}
                  href={item.href}
                  className="menu-link-card"
                  onClick={() => setIsOpen(false)}
                >
                  <strong>{item.label}</strong>
                  {shouldShowDescriptions ? <span className="menu-link-description">{item.description}</span> : null}
                </a>
              ) : (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`menu-link-card${isCurrent ? " active" : ""}`}
                  aria-current={isCurrent ? "page" : undefined}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="menu-link-title">
                    <strong>{item.label}</strong>
                  </span>
                  {shouldShowDescriptions ? <span className="menu-link-description">{item.description}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
