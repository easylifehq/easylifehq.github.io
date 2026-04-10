import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export type ProductsMenuItem = {
  href: string;
  label: string;
  description: string;
  isRoute?: boolean;
};

type ProductsMenuProps = {
  items: ProductsMenuItem[];
  label?: string;
  className?: string;
  panelClassName?: string;
  showDescriptions?: boolean;
};

export function ProductsMenu({
  items,
  label = "Products",
  className = "",
  panelClassName = "",
  showDescriptions = false,
}: ProductsMenuProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.hash]);

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

      <div className={`menu-panel${isOpen ? " open" : ""}${panelClassName ? ` ${panelClassName}` : ""}`}>
        {items.map((item) =>
          item.isRoute === false ? (
            <a
              key={item.href}
              href={item.href}
              className="menu-link-card"
              onClick={() => setIsOpen(false)}
            >
              <strong>{item.label}</strong>
              {showDescriptions ? <span>{item.description}</span> : null}
            </a>
          ) : (
            <Link
              key={item.href}
              to={item.href}
              className="menu-link-card"
              onClick={() => setIsOpen(false)}
            >
              <strong>{item.label}</strong>
              {showDescriptions ? <span>{item.description}</span> : null}
            </Link>
          )
        )}
      </div>
    </div>
  );
}
