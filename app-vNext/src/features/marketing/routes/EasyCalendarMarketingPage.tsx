import { ProductMarketingPage } from "@/features/marketing/components/ProductMarketingPage";

export function EasyCalendarMarketingPage() {
  return (
    <ProductMarketingPage
      pageClassName="marketing-page--mobile-preview-lift marketing-page--light-demo-band"
      eyebrow="EasyCalendar"
      heroTitle="See when your life is full and where real work still fits."
      heroDescription="EasyCalendar mixes fixed commitments with flexible task blocks so your schedule becomes something you can actually plan around."
      heroPoints={["Day and week views", "Fixed vs flexible blocks", "Open window detection", "Plan My Day"]}
      heroCardTitle="A calmer time system."
      heroCardBody="Fixed events stay solid, task blocks stay flexible, and open windows become useful space instead of guesswork."
      heroPreviewItems={[
        { app: "8:30 AM", detail: "Class locked" },
        { app: "11:00 AM", detail: "Open planning window" },
        { app: "1:30 PM", detail: "Admin task block" },
        { app: "4:00 PM", detail: "Workout buffer" },
      ]}
      featuresTitle="Built to answer when things happen"
      featuresDescription="EasyCalendar is where the week planner actually lives, with a clear split between commitments and work you can move."
      features={[
        {
          tag: "Clarity",
          title: "Fixed and flexible time are clearly different",
          description: "Classes, work, and appointments stay authoritative while task blocks stay softer and easier to move.",
        },
        {
          tag: "Planning",
          title: "Open-window awareness",
          description: "See where the day still has room before you keep promising yourself extra work.",
        },
        {
          tag: "Flow",
          title: "Connected to EasyList",
          description: "Tasks can be scheduled, completed, reopened, and managed directly from the calendar.",
        },
      ]}
      stepsTitle="Plan around real life instead of wishful thinking"
      steps={[
        {
          title: "Put fixed commitments on the calendar",
          description: "Anchor the real immovable parts of the day first.",
        },
        {
          title: "Pull in work from EasyList",
          description: "Turn open time into flexible task blocks that still feel movable and realistic.",
        },
        {
          title: "Use Plan My Day",
          description: "Let the planner suggest what fits best without silently rewriting your whole schedule.",
        },
      ]}
      ctaTitle="Make your time visible before it disappears."
      ctaBody="EasyCalendar helps you see what the day can actually hold instead of stuffing more into it than reality allows."
      demoPath={[
        {
          title: "Open day view",
          description: "Show the hour-by-hour layout and wakeup-time start.",
        },
        {
          title: "Add a class or fixed event",
          description: "Show repeat options and category color control.",
        },
        {
          title: "Place a task",
          description: "Send a task from EasyList into open time.",
        },
      ]}
    />
  );
}
