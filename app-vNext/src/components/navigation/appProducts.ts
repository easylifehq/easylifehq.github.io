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
    appId: "easycontacts",
    href: "/app/easycontacts",
    label: "People",
    description: "People and place memory",
    group: "Assistant path",
    groupDescription: "Core assistant surfaces.",
  },
  {
    href: "/app/settings",
    label: "Settings",
    description: "Preferences and account",
    group: "Assistant path",
    groupDescription: "Core assistant surfaces.",
  },
  {
    appId: "easyworkout",
    href: "/app/easyworkout/log",
    label: "Workout",
    description: "Training log",
    group: "More",
    groupDescription: "Extra workspaces.",
  },
  {
    href: "/app/command",
    label: "Review",
    description: "Draft review",
    group: "More",
    groupDescription: "Extra workspaces.",
  },
  {
    appId: "easypipeline",
    href: "/app/easypipeline/dashboard",
    label: "Follow-ups",
    description: "Follow-up workspace",
    group: "More",
    groupDescription: "Extra workspaces.",
  },
  {
    appId: "easyprojects",
    href: "/app/easyprojects",
    label: "Projects",
    description: "Project workspace",
    group: "More",
    groupDescription: "Extra workspaces.",
  },
  {
    appId: "easystatistics",
    href: "/app/easystatistics",
    label: "Progress",
    description: "Trends",
    group: "More",
    groupDescription: "Extra workspaces.",
  },
];
