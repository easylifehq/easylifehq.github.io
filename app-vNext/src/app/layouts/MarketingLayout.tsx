import { Outlet } from "react-router-dom";
import { MarketingHeader } from "@/components/navigation/MarketingHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";

export function MarketingLayout() {
  return (
    <div className="marketing-shell">
      <MarketingHeader />
      <div className="marketing-content">
        <Outlet />
        <SiteFooter />
      </div>
    </div>
  );
}
