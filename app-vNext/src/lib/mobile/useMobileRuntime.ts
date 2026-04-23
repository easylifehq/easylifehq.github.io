import { useEffect, useState } from "react";

function isStandaloneDisplayMode() {
  if (typeof window === "undefined") return false;

  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || Boolean(navigatorWithStandalone.standalone);
}

export function useMobileRuntime() {
  const [isStandalone, setIsStandalone] = useState(() => isStandaloneDisplayMode());
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  useEffect(() => {
    const updateStandalone = () => setIsStandalone(isStandaloneDisplayMode());
    const updateOnline = () => setIsOnline(navigator.onLine);
    const mediaQuery = window.matchMedia("(display-mode: standalone)");

    updateStandalone();
    updateOnline();
    mediaQuery.addEventListener("change", updateStandalone);
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);

    return () => {
      mediaQuery.removeEventListener("change", updateStandalone);
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  return {
    isStandalone,
    isOnline,
    runtimeLabel: isStandalone ? "Home screen app" : "Browser",
    installLabel: isStandalone ? "Ready on your home screen" : "Add to Home Screen for the smoother phone version",
  };
}
