import { signOut } from "firebase/auth";
import { ProductsMenu } from "@/components/navigation/ProductsMenu";
import { appProductItems } from "@/components/navigation/appProducts";
import { useSettings } from "@/features/settings/SettingsContext";
import { auth } from "@/lib/firebase/client";

export function AppHeader() {
  const { isAppVisible } = useSettings();
  const visibleItems = appProductItems.filter((item) => !item.appId || isAppVisible(item.appId));

  return (
    <header className="app-header">
      <div className="app-header-main">
        <div className="site-brand">
          <span className="brand-badge">EL</span>
          <div>
            <p className="brand-kicker">Easy System</p>
            <strong className="site-brand-title">Connected apps, one account</strong>
          </div>
        </div>

        <div className="app-header-actions">
          <ProductsMenu items={visibleItems} label="Apps" />
          <button
            type="button"
            className="button-secondary"
            onClick={() => {
              void signOut(auth);
            }}
          >
            Log Out
          </button>
        </div>
      </div>
    </header>
  );
}
