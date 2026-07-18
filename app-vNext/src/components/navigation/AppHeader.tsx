import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { ProductsMenu } from "@/components/navigation/ProductsMenu";
import { appProductItems } from "@/components/navigation/appProducts";
import { useSettings } from "@/features/settings/SettingsContext";

export function AppHeader() {
  const location = useLocation();
  const { isAppVisible } = useSettings();
  const visibleItems = appProductItems.filter((item) => !item.appId || isAppVisible(item.appId));
  const currentApp = useMemo(() => {
    const pathname = location.pathname;
    if (pathname.startsWith("/app/easylist")) return "Inbox";
    if (pathname.startsWith("/app/easycalendar")) return "Plan";
    if (pathname.startsWith("/app/easynotes")) return "Notes";
    if (pathname.startsWith("/app/easypipeline")) return "Job applications";
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
        <div className="app-suite-control app-menu-shell" role="group" aria-label={`EasyLife assistant menu, current area ${currentApp}`}>
          <ProductsMenu
            items={visibleItems}
            label="Menu"
            panelLabel="EasyLife"
            className="app-drawer-menu"
            panelClassName="app-navigation-drawer"
            showDescriptions
            triggerAriaLabel="Open EasyLife navigation"
          />
          <div className="app-header-brand">
            <Link to="/app/hq" className="site-brand" aria-label="Go to Today">
              <span className="brand-badge">EL</span>
              <div>
                <strong className="site-brand-title">EasyLife</strong>
                <span className="site-brand-current">{currentApp}</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
