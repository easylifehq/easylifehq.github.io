import { useEffect } from "react";

export function useMobileViewportCssVars() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;

    const updateViewportVars = () => {
      const viewport = window.visualViewport;
      const viewportHeight = viewport?.height ?? window.innerHeight;
      const keyboardInset = Math.max(0, window.innerHeight - viewportHeight - (viewport?.offsetTop ?? 0));

      root.style.setProperty("--easy-viewport-height", `${Math.round(viewportHeight)}px`);
      root.style.setProperty("--easy-keyboard-inset", `${Math.round(keyboardInset)}px`);
    };

    updateViewportVars();

    window.addEventListener("resize", updateViewportVars);
    window.addEventListener("orientationchange", updateViewportVars);
    window.visualViewport?.addEventListener("resize", updateViewportVars);
    window.visualViewport?.addEventListener("scroll", updateViewportVars);

    return () => {
      root.style.removeProperty("--easy-viewport-height");
      root.style.removeProperty("--easy-keyboard-inset");
      window.removeEventListener("resize", updateViewportVars);
      window.removeEventListener("orientationchange", updateViewportVars);
      window.visualViewport?.removeEventListener("resize", updateViewportVars);
      window.visualViewport?.removeEventListener("scroll", updateViewportVars);
    };
  }, []);
}
