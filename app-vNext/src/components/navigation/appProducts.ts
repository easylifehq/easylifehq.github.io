import type { ProductsMenuItem } from "@/components/navigation/ProductsMenu";
import type { VisibleAppId } from "@/lib/firestore/settings";

export type AppProductItem = ProductsMenuItem & {
  appId?: VisibleAppId;
};

export const appProductItems: AppProductItem[] = [
  {
    href: "/app/hq",
    label: "Today",
    description: "Daily command surface",
    group: "Start here",
    groupDescription: "Core assistant surfaces.",
  },
  {
    appId: "easylist",
    href: "/app/easylist/add",
    label: "Capture",
    description: "Drop tasks and inbox items",
    group: "Start here",
    groupDescription: "Core assistant surfaces.",
  },
  {
    appId: "easycalendar",
    href: "/app/easycalendar/day",
    label: "Plan",
    description: "Shape today by time",
    group: "Start here",
    groupDescription: "Core assistant surfaces.",
  },
  {
    appId: "easynotes",
    href: "/app/easynotes",
    label: "Notes",
    description: "Save messy thinking",
    group: "Start here",
    groupDescription: "Core assistant surfaces.",
  },
  {
    appId: "easyworkout",
    href: "/app/easyworkout/log",
    label: "Workout",
    description: "Log training quickly",
    group: "Optional",
    groupDescription: "Open when you need extra context.",
  },
  {
    href: "/app/command",
    label: "Command",
    description: "Review loose ends",
    group: "Optional",
    groupDescription: "Open when you need extra context.",
  },
  {
    appId: "easypipeline",
    href: "/app/easypipeline/dashboard",
    label: "Pipeline",
    description: "Applications and follow-ups",
    group: "Optional",
    groupDescription: "Open when you need extra context.",
  },
  {
    appId: "easycontacts",
    href: "/app/easycontacts",
    label: "Contacts",
    description: "People and reminders",
    group: "Optional",
    groupDescription: "Open when you need extra context.",
  },
  {
    appId: "easyprojects",
    href: "/app/easyprojects",
    label: "Projects",
    description: "Bigger goals and sections",
    group: "Optional",
    groupDescription: "Open when you need extra context.",
  },
  {
    appId: "easystatistics",
    href: "/app/easystatistics",
    label: "Stats",
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
