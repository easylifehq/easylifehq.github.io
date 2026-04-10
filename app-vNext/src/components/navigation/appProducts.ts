import type { ProductsMenuItem } from "@/components/navigation/ProductsMenu";

export const appProductItems: ProductsMenuItem[] = [
  {
    href: "/app/hq",
    label: "EasyHQ",
    description: "See your day at a glance.",
  },
  {
    href: "/app/easylist/dashboard",
    label: "EasyList",
    description: "Capture and organize what needs doing.",
  },
  {
    href: "/app/easynotes",
    label: "EasyNotes",
    description: "Keep quick notes, brain dumps, and meeting thoughts.",
  },
  {
    href: "/app/easycalendar/day",
    label: "EasyCalendar",
    description: "Plan your time and manage task blocks.",
  },
  {
    href: "/app/easypipeline/dashboard",
    label: "EasyPipeline",
    description: "Track applications, follow-ups, and momentum.",
  },
  {
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
