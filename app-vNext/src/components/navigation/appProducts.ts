import type { ProductsMenuItem } from "@/components/navigation/ProductsMenu";
import type { VisibleAppId } from "@/lib/firestore/settings";

export type AppProductItem = ProductsMenuItem & {
  appId?: VisibleAppId;
};

export const appProductItems: AppProductItem[] = [
  {
    href: "/app/hq",
    label: "Today",
    description: "Start with the next move",
    group: "Daily",
    groupDescription: "Keep these first for normal daily use.",
  },
  {
    appId: "easylist",
    href: "/app/easylist/add",
    label: "EasyList",
    description: "Capture and clear tasks",
    group: "Daily",
    groupDescription: "Keep these first for normal daily use.",
  },
  {
    appId: "easynotes",
    href: "/app/easynotes",
    label: "EasyNotes",
    description: "Save and review notes",
    group: "Daily",
    groupDescription: "Keep these first for normal daily use.",
  },
  {
    appId: "easycalendar",
    href: "/app/easycalendar/day",
    label: "EasyCalendar",
    description: "See today by time",
    group: "Daily",
    groupDescription: "Keep these first for normal daily use.",
  },
  {
    appId: "easyworkout",
    href: "/app/easyworkout/log",
    label: "EasyWorkout",
    description: "Log training quickly",
    group: "Daily",
    groupDescription: "Keep these first for normal daily use.",
  },
  {
    href: "/app/command",
    label: "Plan help",
    description: "Quick actions and review",
    group: "Optional",
    groupDescription: "Open when you need extra context.",
  },
  {
    appId: "easypipeline",
    href: "/app/easypipeline/dashboard",
    label: "EasyPipeline",
    description: "Applications and follow-ups",
    group: "Optional",
    groupDescription: "Open when you need extra context.",
  },
  {
    appId: "easycontacts",
    href: "/app/easycontacts",
    label: "EasyContacts",
    description: "People and reminders",
    group: "Optional",
    groupDescription: "Open when you need extra context.",
  },
  {
    appId: "easyprojects",
    href: "/app/easyprojects",
    label: "EasyProjects",
    description: "Bigger goals and sections",
    group: "Optional",
    groupDescription: "Open when you need extra context.",
  },
  {
    appId: "easystatistics",
    href: "/app/easystatistics",
    label: "EasyStatistics",
    description: "Progress and trends",
    group: "Optional",
    groupDescription: "Open when you need extra context.",
  },
  {
    href: "/app/settings",
    label: "Settings",
    description: "Preferences and account",
    group: "Settings",
    groupDescription: "Tune what appears in the workspace.",
  },
];
