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
    href: "/app/easylist/dashboard",
    label: "EasyList",
    description: "Capture and organize what needs doing.",
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
    description: "Plan your time and manage task blocks.",
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
    href: "/app/settings",
    label: "Settings",
    description: "Adjust account and app preferences.",
  },
];
