import { Link } from "react-router-dom";
import { ProductsMenu, type ProductsMenuItem } from "@/components/navigation/ProductsMenu";

const marketingLinks = [
  { href: "/#products", label: "Products" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#why-easy", label: "Why Easy" },
];

const productItems: ProductsMenuItem[] = [
  {
    href: "/#easyhq",
    label: "EasyHQ",
    description: "Your calm daily control center.",
    isRoute: false,
  },
  {
    href: "/#easylist",
    label: "EasyList",
    description: "Tasks, priorities, and brain dumps.",
    isRoute: false,
  },
  {
    href: "/#easycalendar",
    label: "EasyCalendar",
    description: "Time blocks, open windows, and planning.",
    isRoute: false,
  },
];

export function MarketingHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="site-brand">
          <span className="brand-badge">EL</span>
          <div>
            <p className="brand-kicker">Easy System</p>
            <strong className="site-brand-title">EasyLife</strong>
          </div>
        </Link>

        <nav className="site-nav-links" aria-label="Marketing">
          {marketingLinks.map((link) => (
            <a key={link.href} href={link.href} className="site-nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="site-header-actions">
          <ProductsMenu items={productItems} />
          <Link to="/login" className="button-primary">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
