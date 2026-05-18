import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { ProductsMenu } from "@/components/navigation/ProductsMenu";
import { appProductItems } from "@/components/navigation/appProducts";
import { useSettings } from "@/features/settings/SettingsContext";

export function AppHeader() {
  const location = useLocation();
  const { isAppVisible } = useSettings();
  const visibleItems = appProductItems.filter((item) => !item.appId || isAppVisible(item.appId));
  const primaryItems = visibleItems.filter((item) => ["Today", "Inbox", "Plan", "Notes"].includes(item.label));
  const moreItems = visibleItems.filter((item) => !primaryItems.includes(item));
  const shellMoreItems = moreItems.map(({ group: _group, groupDescription: _groupDescription, ...item }) => item);
  const currentApp = useMemo(() => {
    const pathname = location.pathname;
    if (pathname.startsWith("/app/easylist")) return "Inbox";
    if (pathname.startsWith("/app/easycalendar")) return "Plan";
    if (pathname.startsWith("/app/easynotes")) return "Notes";
    if (pathname.startsWith("/app/easypipeline")) return "Follow-ups";
    if (pathname.startsWith("/app/easycontacts")) return "People";
    if (pathname.startsWith("/app/easyprojects")) return "Projects";
    if (pathname.startsWith("/app/easyworkout")) return "Workout";
    if (pathname.startsWith("/app/easystatistics")) return "Progress";
    if (pathname.startsWith("/app/settings")) return "Settings";
    return "Today";
  }, [location.pathname]);

  return (
    <header className="app-header">
      <div className="app-header-main">
        <div className="app-suite-control" role="group" aria-label={`EasyLife assistant menu, current area ${currentApp}`}>
          <div className="app-header-brand">
            <Link to="/app/hq" className="site-brand" aria-label="Go to Today">
              <span className="brand-badge">EL</span>
              <div>
                <strong className="site-brand-title">EasyLife</strong>
              </div>
            </Link>
          </div>

          <div className="app-header-actions">
            <nav className="app-primary-nav app-primary-nav--today-start" aria-label="Primary assistant areas, starting with Today">
              {primaryItems.map((item) => {
                const isCurrent = location.pathname === item.href || location.pathname.startsWith(item.href.split("/").slice(0, 3).join("/"));

                return (
                  <Link key={item.href} to={item.href} aria-current={isCurrent ? "page" : undefined}>
                    {item.label}
                  </Link>
                );
              })}
              <ProductsMenu items={shellMoreItems} label="Menu" panelLabel="Menu" panelClassName="app-more-panel" />
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
