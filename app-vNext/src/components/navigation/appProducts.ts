import type { ProductsMenuItem } from "@/components/navigation/ProductsMenu";
import type { VisibleAppId } from "@/lib/firestore/settings";

export type AppProductItem = ProductsMenuItem & {
  appId?: VisibleAppId;
};

export const appProductItems: AppProductItem[] = [
  {
    href: "/app/hq",
    label: "EasyHQ",
    description: "Home",
  },
  {
    href: "/app/command",
    label: "Command",
    description: "AI cockpit",
  },
  {
    appId: "easylist",
    href: "/app/easylist/add",
    label: "EasyList",
    description: "Tasks + email",
  },
  {
    appId: "easynotes",
    href: "/app/easynotes",
    label: "EasyNotes",
    description: "Notes",
  },
  {
    appId: "easycalendar",
    href: "/app/easycalendar/day",
    label: "EasyCalendar",
    description: "Calendar",
  },
  {
    appId: "easypipeline",
    href: "/app/easypipeline/dashboard",
    label: "EasyPipeline",
    description: "Pipeline",
  },
  {
    appId: "easycontacts",
    href: "/app/easycontacts",
    label: "EasyContacts",
    description: "Contacts",
  },
  {
    appId: "easyprojects",
    href: "/app/easyprojects",
    label: "EasyProjects",
    description: "Projects",
  },
  {
    appId: "easyworkout",
    href: "/app/easyworkout/log",
    label: "EasyWorkout",
    description: "Workout",
  },
  {
    appId: "easystatistics",
    href: "/app/easystatistics",
    label: "EasyStatistics",
    description: "Stats",
  },
  {
    href: "/app/settings",
    label: "Settings",
    description: "Settings",
  },
];
