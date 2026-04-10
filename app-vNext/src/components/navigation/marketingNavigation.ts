import type { ProductsMenuItem } from "@/components/navigation/ProductsMenu";

export const marketingProductItems: ProductsMenuItem[] = [
  {
    href: "/easylist",
    label: "EasyList",
    description: "Clear the small stuff and protect your time.",
  },
  {
    href: "/easynotes",
    label: "EasyNotes",
    description: "Write first, organize later.",
  },
  {
    href: "/easycalendar",
    label: "EasyCalendar",
    description: "Plan time around real life.",
  },
  {
    href: "/easypipeline",
    label: "EasyPipeline",
    description: "Track applications and follow-ups clearly.",
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
      { href: "#mobile", label: "Mobile" },
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

  return [
    { href: "/#products", label: "Products" },
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/#why-easy", label: "Why Easy" },
  ];
}
