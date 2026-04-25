import { ProductMarketingPage } from "@/features/marketing/components/ProductMarketingPage";

export function EasyListMarketingPage() {
  return (
    <ProductMarketingPage
      pageClassName="marketing-page--mobile-dense-hero"
      eyebrow="EasyList"
      heroTitle="Clear the annoying stuff. Protect your real time."
      heroDescription="EasyList is the task system for all the small life and admin things that clutter your brain before bigger work can happen."
      heroPoints={["Brain dumps", "Flexible planner", "Archive history", "EasyCalendar handoff"]}
      heroCardTitle="A task system that keeps the noise manageable."
      heroCardBody="EasyList is where quick obligations, admin chores, reminders, and loose tasks stop living in your head and start moving."
      featuresTitle="Built for the stuff that quietly drains your energy"
      featuresDescription="It stays lightweight enough to use every day while still giving you priorities, planning, and momentum."
      features={[
        {
          tag: "Planner",
          title: "A weekly view that feels usable",
          description: "See what matters today, what is due soon, and what is just lingering without turning the whole app into chaos.",
        },
        {
          tag: "Capture",
          title: "Fast task entry",
          description: "Drop single tasks in quickly or use the brain-dump flow when you need to unload a lot at once.",
        },
        {
          tag: "Progress",
          title: "Handled today and archive history",
          description: "Keep visible proof of what got done instead of letting progress disappear the second you finish it.",
        },
      ]}
      stepsTitle="Get in, sort the week, move on"
      steps={[
        {
          title: "Capture what is floating around",
          description: "Add tasks directly or dump messy thoughts in first, then let the system help shape them.",
        },
        {
          title: "Prioritize what deserves attention",
          description: "Use due dates, priorities, and categories so you can tell urgent work from background clutter.",
        },
        {
          title: "Send work into EasyCalendar",
          description: "Place the real work into open time instead of leaving everything as a static list.",
        },
      ]}
      ctaTitle="Make life admin feel smaller."
      ctaBody="Use EasyList when the little tasks are starting to steal too much attention from the work you actually care about."
      demoPath={[
        {
          title: "Add one task",
          description: "Show the quick row entry and the plain 1-10 urgency scale.",
        },
        {
          title: "Use the brain dump",
          description: "Paste messy thoughts and turn them into reviewable task rows.",
        },
        {
          title: "Send work to time",
          description: "Open task details and send the task into EasyCalendar.",
        },
      ]}
    />
  );
}
