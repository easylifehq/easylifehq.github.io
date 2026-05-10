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
    group: "Assistant path",
    groupDescription: "Core assistant surfaces.",
  },
  {
    appId: "easylist",
    href: "/app/easylist/add",
    label: "Inbox",
    description: "Capture and approve loose items",
    group: "Assistant path",
    groupDescription: "Core assistant surfaces.",
  },
  {
    appId: "easycalendar",
    href: "/app/easycalendar/day",
    label: "Plan",
    description: "Shape today by time",
    group: "Assistant path",
    groupDescription: "Core assistant surfaces.",
  },
  {
    appId: "easynotes",
    href: "/app/easynotes",
    label: "Notes",
    description: "Save messy thinking",
    group: "Assistant path",
    groupDescription: "Core assistant surfaces.",
  },
  {
    appId: "easyworkout",
    href: "/app/easyworkout/log",
    label: "Workout",
    description: "Log training quickly",
    group: "More",
    groupDescription: "Open when you need extra context.",
  },
  {
    href: "/app/command",
    label: "Review queue",
    description: "Check assistant follow-ups",
    group: "More",
    groupDescription: "Open when you need extra context.",
  },
  {
    appId: "easypipeline",
    href: "/app/easypipeline/dashboard",
    label: "Follow-ups",
    description: "Applications and follow-ups",
    group: "More",
    groupDescription: "Open when you need extra context.",
  },
  {
    appId: "easycontacts",
    href: "/app/easycontacts",
    label: "People",
    description: "People and reminders",
    group: "More",
    groupDescription: "Open when you need extra context.",
  },
  {
    appId: "easyprojects",
    href: "/app/easyprojects",
    label: "Projects",
    description: "Bigger goals and sections",
    group: "More",
    groupDescription: "Open when you need extra context.",
  },
  {
    appId: "easystatistics",
    href: "/app/easystatistics",
    label: "Progress",
    description: "Progress and trends",
    group: "More",
    groupDescription: "Open when you need extra context.",
  },
  {
    href: "/app/settings",
    label: "Settings",
    description: "Preferences and account",
    group: "More",
    groupDescription: "Tune what appears in the workspace.",
  },
];
