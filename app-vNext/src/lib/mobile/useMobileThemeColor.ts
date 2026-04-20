import { useEffect } from "react";
import type { ThemeMode } from "@/lib/firestore/settings";

const themeChromeColors: Record<ThemeMode, string> = {
  classic: "#f8faf8",
  candy: "#ffdff1",
  gamer: "#12091c",
  elvish: "#0d1b14",
  aurora: "#071117",
  studio: "#f7f8fb",
  sunrise: "#fff4df",
  midnightGarden: "#07100d",
};

export function useMobileThemeColor(themeMode: ThemeMode) {
  useEffect(() => {
    const themeColor = themeChromeColors[themeMode] || themeChromeColors.classic;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const createdMeta = !meta;

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.append(meta);
    }

    meta.content = themeColor;
    document.documentElement.style.setProperty("--mobile-browser-theme-color", themeColor);

    return () => {
      if (createdMeta) {
        meta?.remove();
      }
      document.documentElement.style.removeProperty("--mobile-browser-theme-color");
    };
  }, [themeMode]);
}
