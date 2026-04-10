import { Outlet } from "react-router-dom";
import { MarketingHeader } from "@/components/navigation/MarketingHeader";

export function MarketingLayout() {
  return (
    <div className="marketing-shell">
      <MarketingHeader />
      <div className="marketing-content">
        <Outlet />
      </div>
    </div>
  );
}
