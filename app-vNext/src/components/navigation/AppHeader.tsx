import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { ProductsMenu } from "@/components/navigation/ProductsMenu";
import { appProductItems } from "@/components/navigation/appProducts";
import { useSettings } from "@/features/settings/SettingsContext";

export function AppHeader() {
  const location = useLocation();
  const { isAppVisible } = useSettings();
  const visibleItems = appProductItems.filter((item) => !item.appId || isAppVisible(item.appId));
  const currentApp = useMemo(() => {
    const pathname = location.pathname;
    if (pathname.startsWith("/app/easylist")) return "EasyList";
    if (pathname.startsWith("/app/easycalendar")) return "EasyCalendar";
    if (pathname.startsWith("/app/easynotes")) return "EasyNotes";
    if (pathname.startsWith("/app/easypipeline")) return "EasyPipeline";
    if (pathname.startsWith("/app/easycontacts")) return "EasyContacts";
    if (pathname.startsWith("/app/easyprojects")) return "EasyProjects";
    if (pathname.startsWith("/app/easyworkout")) return "EasyWorkout";
    if (pathname.startsWith("/app/easystatistics")) return "EasyStatistics";
    if (pathname.startsWith("/app/settings")) return "Settings";
    return "EasyHQ";
  }, [location.pathname]);

  return (
    <header className="app-header">
      <div className="app-header-main">
        <div className="app-header-brand">
          <div className="site-brand">
            <span className="brand-badge">EL</span>
            <div>
              <strong className="site-brand-title">EasyLifeHQ</strong>
              <p className="app-current-label">{currentApp}</p>
            </div>
          </div>
        </div>

        <div className="app-header-actions">
          <ProductsMenu items={visibleItems} label="Apps" />
        </div>
      </div>
    </header>
  );
}
