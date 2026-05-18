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
    description: "Saved context and drafts",
    group: "Assistant path",
    groupDescription: "Core assistant surfaces.",
  },
  {
    appId: "easyworkout",
    href: "/app/easyworkout/log",
    label: "Workout",
    description: "Optional training context",
    group: "Menu",
    groupDescription: "Optional workspace areas.",
  },
  {
    href: "/app/command",
    label: "Review",
    description: "Local draft review",
    group: "Menu",
    groupDescription: "Optional workspace areas.",
  },
  {
    appId: "easypipeline",
    href: "/app/easypipeline/dashboard",
    label: "Follow-ups",
    description: "Optional follow-up context",
    group: "Menu",
    groupDescription: "Optional workspace areas.",
  },
  {
    appId: "easycontacts",
    href: "/app/easycontacts",
    label: "People",
    description: "Optional people context",
    group: "Menu",
    groupDescription: "Optional workspace areas.",
  },
  {
    appId: "easyprojects",
    href: "/app/easyprojects",
    label: "Projects",
    description: "Optional project sections",
    group: "Menu",
    groupDescription: "Optional workspace areas.",
  },
  {
    appId: "easystatistics",
    href: "/app/easystatistics",
    label: "Progress",
    description: "Optional deeper trends",
    group: "Menu",
    groupDescription: "Optional workspace areas.",
  },
  {
    href: "/app/settings",
    label: "Settings",
    description: "Preferences and account",
    group: "Menu",
    groupDescription: "Tune what appears in the workspace.",
  },
];
