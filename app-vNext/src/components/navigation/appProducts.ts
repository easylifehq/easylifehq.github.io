import type { ProductsMenuItem } from "@/components/navigation/ProductsMenu";
import type { VisibleAppId } from "@/lib/firestore/settings";

export type AppProductItem = ProductsMenuItem & {
  appId?: VisibleAppId;
};

export const appProductItems: AppProductItem[] = [
  {
    href: "/app/hq",
    label: "Today",
    description: "See what matters now.",
    group: "Daily",
    groupDescription: "Everyday capture, writing, and planning.",
  },
  {
    appId: "easylist",
    href: "/app/easylist/add",
    label: "Inbox",
    description: "Review unprocessed captures.",
    group: "Daily",
    groupDescription: "Everyday capture, writing, and planning.",
  },
  {
    appId: "easynotes",
    href: "/app/easynotes",
    label: "Notes",
    description: "Write and return to your thinking.",
    group: "Daily",
    groupDescription: "Everyday capture, writing, and planning.",
  },
  {
    appId: "easycalendar",
    href: "/app/easycalendar/day",
    label: "Plan",
    description: "Organize upcoming work.",
    group: "Daily",
    groupDescription: "Everyday capture, writing, and planning.",
  },
  {
    appId: "easycontacts",
    href: "/app/easycontacts",
    label: "People",
    description: "Keep relationship context together.",
    group: "Life",
    groupDescription: "Relationships and longer-term work.",
  },
  {
    appId: "easyprojects",
    href: "/app/easyprojects",
    label: "Projects",
    description: "Keep longer-term work together.",
    group: "Life",
    groupDescription: "Relationships and longer-term work.",
  },
  {
    appId: "easypipeline",
    href: "/app/easypipeline/dashboard",
    label: "Job applications",
    description: "Track applications and job follow-ups.",
    group: "Career",
    groupDescription: "Applications and job follow-ups.",
  },
  {
    appId: "easyworkout",
    href: "/app/easyworkout/dashboard",
    label: "Workout overview",
    description: "Review recent training.",
    group: "Workout",
    groupDescription: "Training and saved routines.",
  },
  {
    appId: "easyworkout",
    href: "/app/easyworkout/log?workoutMode=1",
    label: "Active workout",
    description: "Start or continue a session.",
    group: "Workout",
    groupDescription: "Training and saved routines.",
  },
  {
    appId: "easyworkout",
    href: "/app/easyworkout/routines",
    label: "Workout plans",
    description: "Use saved routines.",
    group: "Workout",
    groupDescription: "Training and saved routines.",
  },
  {
    href: "/app/command",
    label: "Review",
    description: "Review saved drafts.",
    group: "Utilities",
    groupDescription: "Review, trends, and preferences.",
  },
  {
    appId: "easystatistics",
    href: "/app/easystatistics",
    label: "Progress",
    description: "Review trends.",
    group: "Utilities",
    groupDescription: "Review, trends, and preferences.",
  },
  {
    href: "/app/settings",
    label: "Settings",
    description: "Manage preferences and account.",
    group: "Utilities",
    groupDescription: "Review, trends, and preferences.",
  },
];
