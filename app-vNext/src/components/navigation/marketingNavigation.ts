import type { ProductsMenuItem } from "@/components/navigation/ProductsMenu";

export const marketingProductItems: ProductsMenuItem[] = [
  {
    href: "/easyhq",
    label: "Today",
    description: "Open the assistant home.",
  },
  {
    href: "/easylist",
    label: "Inbox",
    description: "Capture loose tasks and follow-ups.",
  },
  {
    href: "/easynotes",
    label: "Notes",
    description: "Keep context close.",
  },
  {
    href: "/easycalendar",
    label: "Plan",
    description: "Shape the day around real life.",
  },
  {
    href: "/easypipeline",
    label: "Job applications",
    description: "Track applications and job follow-ups.",
  },
  {
    href: "/easyprojects",
    label: "Projects",
    description: "Break larger goals into next moves.",
  },
  {
    href: "/easycontacts",
    label: "People",
    description: "Keep context and follow-ups.",
  },
  {
    href: "/easyworkout",
    label: "Workout",
    description: "Keep training out of your head.",
  },
  {
    href: "/easystatistics",
    label: "Progress",
    description: "Review patterns without page clutter.",
  },
];

type SectionLink = {
  href: string;
  label: string;
};

export function getMarketingSectionLinks(pathname: string): SectionLink[] {
  if (pathname === "/easylist") {
    return [
      { href: "#overview", label: "Overview" },
      { href: "#features", label: "Features" },
      { href: "#workflow", label: "Workflow" },
      { href: "#start", label: "Start" },
    ];
  }

  if (pathname === "/easynotes") {
    return [
      { href: "#overview", label: "Overview" },
      { href: "#features", label: "Features" },
      { href: "#workflow", label: "Workflow" },
      { href: "#start", label: "Start" },
    ];
  }

  if (pathname === "/easypipeline") {
    return [
      { href: "#overview", label: "Overview" },
      { href: "#features", label: "Features" },
      { href: "#workflow", label: "Workflow" },
      { href: "#start", label: "Start" },
    ];
  }

  if (pathname === "/easycalendar") {
    return [
      { href: "#overview", label: "Overview" },
      { href: "#features", label: "Features" },
      { href: "#planning", label: "Planning" },
      { href: "#start", label: "Start" },
    ];
  }

  if (
    ["/easyhq", "/easyprojects", "/easycontacts", "/easyworkout", "/easystatistics"].includes(pathname)
  ) {
    return [
      { href: "#overview", label: "Overview" },
      { href: "#features", label: "Features" },
      { href: "#workflow", label: "Workflow" },
      { href: "#start", label: "Start" },
    ];
  }

  return [
    { href: "/#assistant-map", label: "Assistant" },
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/#why-easy", label: "Why Easy" },
  ];
}
