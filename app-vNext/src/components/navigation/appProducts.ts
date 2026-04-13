import type { ProductsMenuItem } from "@/components/navigation/ProductsMenu";
import type { VisibleAppId } from "@/lib/firestore/settings";

export type AppProductItem = ProductsMenuItem & {
  appId?: VisibleAppId;
};

export const appProductItems: AppProductItem[] = [
  {
    href: "/app/hq",
    label: "EasyHQ",
    description: "See your day at a glance.",
  },
  {
    appId: "easylist",
    href: "/app/easylist/add",
    label: "EasyList",
    description: "Add tasks first; sorting can happen later.",
  },
  {
    appId: "easynotes",
    href: "/app/easynotes",
    label: "EasyNotes",
    description: "Keep quick notes, brain dumps, and meeting thoughts.",
  },
  {
    appId: "easycalendar",
    href: "/app/easycalendar/day",
    label: "EasyCalendar",
    description: "See today and place work into time.",
  },
  {
    appId: "easypipeline",
    href: "/app/easypipeline/dashboard",
    label: "EasyPipeline",
    description: "Track applications, follow-ups, and momentum.",
  },
  {
    appId: "easycontacts",
    href: "/app/easycontacts",
    label: "EasyContacts",
    description: "Manage networking contacts and follow-up dates.",
  },
  {
    appId: "easyprojects",
    href: "/app/easyprojects",
    label: "EasyProjects",
    description: "Break big goals into sections, tasks, and progress.",
  },
  {
    appId: "easyworkout",
    href: "/app/easyworkout/log",
    label: "EasyWorkout",
    description: "Log sets fast; routines and stats are there when you want them.",
  },
  {
    href: "/app/settings",
    label: "Settings",
    description: "Adjust account and app preferences.",
  },
];
