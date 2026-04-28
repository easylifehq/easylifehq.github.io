import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ProductsMenu, type ProductsMenuItem } from "@/components/navigation/ProductsMenu";
import { useLocation } from "react-router-dom";
import {
  getMarketingSectionLinks,
  marketingProductItems,
} from "@/components/navigation/marketingNavigation";

export function MarketingHeader() {
  const location = useLocation();
  const marketingLinks = useMemo(
    () => getMarketingSectionLinks(location.pathname),
    [location.pathname]
  );

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="site-brand">
          <span className="brand-badge">EL</span>
          <div>
            <p className="brand-kicker">EasyLifeHQ</p>
            <strong className="site-brand-title">EasyLifeHQ</strong>
          </div>
        </Link>
        <span className="site-mobile-cue">Explore products</span>

        <nav className="site-nav-links" aria-label="Marketing">
          {marketingLinks.map((link) => (
            <a key={link.href} href={link.href} className="site-nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="site-header-actions">
          <ProductsMenu items={marketingProductItems} />
          <Link to="/login" className="button-primary">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
