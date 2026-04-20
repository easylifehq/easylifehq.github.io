import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const lastAppRouteKey = "easylife:last-app-route";

const ignoredResumePaths = new Set(["/app", "/app/hq", "/app/settings"]);

type LastAppRoute = {
  path: string;
  label: string;
  savedAt: string;
};

function getRouteLabel(path: string) {
  if (path.startsWith("/app/easylist")) return "EasyList";
  if (path.startsWith("/app/easycalendar")) return "EasyCalendar";
  if (path.startsWith("/app/easynotes")) return "EasyNotes";
  if (path.startsWith("/app/easyworkout")) return "EasyWorkout";
  if (path.startsWith("/app/easyprojects")) return "EasyProjects";
  if (path.startsWith("/app/easypipeline")) return "EasyPipeline";
  if (path.startsWith("/app/easycontacts")) return "EasyContacts";
  if (path.startsWith("/app/easystatistics")) return "EasyStatistics";
  return "EasyLife";
}

export function getLastAppRoute(): LastAppRoute | null {
  try {
    const rawValue = window.localStorage.getItem(lastAppRouteKey);
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue) as Partial<LastAppRoute>;
    if (!parsed.path || !parsed.label || !parsed.savedAt) return null;
    return {
      path: parsed.path,
      label: parsed.label,
      savedAt: parsed.savedAt,
    };
  } catch {
    return null;
  }
}

export function useRememberAppRoute() {
  const location = useLocation();

  useEffect(() => {
    const path = `${location.pathname}${location.search}`;
    if (!location.pathname.startsWith("/app") || ignoredResumePaths.has(location.pathname)) return;

    const nextRoute: LastAppRoute = {
      path,
      label: getRouteLabel(location.pathname),
      savedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(lastAppRouteKey, JSON.stringify(nextRoute));
  }, [location.pathname, location.search]);
}

export function useLastAppRoute() {
  const [lastRoute, setLastRoute] = useState<LastAppRoute | null>(() => getLastAppRoute());

  useEffect(() => {
    setLastRoute(getLastAppRoute());
  }, []);

  return lastRoute;
}
