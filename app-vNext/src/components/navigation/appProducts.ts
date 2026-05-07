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
    group: "Start here",
    groupDescription: "Open the daily assistant surface first.",
  },
  {
    appId: "easylist",
    href: "/app/easylist/add",
    label: "Capture",
    description: "Add tasks and inbox items",
    group: "Start here",
    groupDescription: "Open the daily assistant surface first.",
  },
  {
    appId: "easycalendar",
    href: "/app/easycalendar/day",
    label: "Plan",
    description: "See today by time",
    group: "Start here",
    groupDescription: "Open the daily assistant surface first.",
  },
  {
    appId: "easynotes",
    href: "/app/easynotes",
    label: "Notes",
    description: "Save and review notes",
    group: "Start here",
    groupDescription: "Open the daily assistant surface first.",
  },
  {
    appId: "easyworkout",
    href: "/app/easyworkout/log",
    label: "Workout log",
    description: "Log training quickly",
    group: "Optional",
    groupDescription: "Open when you need extra context.",
  },
  {
    href: "/app/command",
    label: "Review",
    description: "Quick actions and review",
    group: "Optional",
    groupDescription: "Open when you need extra context.",
  },
  {
    appId: "easypipeline",
    href: "/app/easypipeline/dashboard",
    label: "Follow-ups",
    description: "Applications and follow-ups",
    group: "Optional",
    groupDescription: "Open when you need extra context.",
  },
  {
    appId: "easycontacts",
    href: "/app/easycontacts",
    label: "People",
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
    label: "Progress",
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
