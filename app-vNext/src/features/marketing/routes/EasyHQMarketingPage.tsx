import { ProductMarketingPage } from "@/features/marketing/components/ProductMarketingPage";

export function EasyHQMarketingPage() {
  return (
    <ProductMarketingPage
      eyebrow="EasyHQ"
      heroTitle="Open the app and know where to go next."
      heroDescription="EasyHQ is the command center: a calm launch point for the day, the next useful action, and the apps you actually use."
      heroPoints={["Startup page", "Daily pulse", "Quick actions", "App switching"]}
      heroCardTitle="Less wandering. More starting."
      heroCardBody="HQ keeps the important entry points close so the whole suite feels like one app instead of scattered tools."
      featuresTitle="A cleaner way into the suite"
      featuresDescription="HQ is where EasyLife turns into a daily operating system instead of a pile of pages."
      features={[
        {
          tag: "Launch",
          title: "Pick where the app opens",
          description: "Use Settings to open at HQ, the last-used screen, tasks, calendar, notes, or workout.",
        },
        {
          tag: "Focus",
          title: "See the day without digging",
          description: "Use the daily pulse and start-here prompts to choose the next app with less guessing.",
        },
        {
          tag: "Mobile",
          title: "Built for home-screen use",
          description: "Install the app to your phone home screen and get back to the workspace quickly.",
        },
      ]}
      stepsTitle="Start from the command center"
      steps={[
        {
          title: "Open EasyLifeHQ",
          description: "Launch from the browser or your phone home screen.",
        },
        {
          title: "Check the day",
          description: "Scan the daily pulse, visible apps, and quick entry points.",
        },
        {
          title: "Jump into the right app",
          description: "Move to tasks, calendar, notes, workout, projects, pipeline, contacts, or stats.",
        },
      ]}
      ctaTitle="Make the app feel like home base."
      ctaBody="EasyHQ keeps the suite simple by giving everything a clear front door."
      demoPath={[
        {
          title: "Show startup settings",
          description: "Pick HQ or last-used as the launch target.",
        },
        {
          title: "Use quick actions",
          description: "Open the most common capture paths from one place.",
        },
        {
          title: "Switch apps",
          description: "Show how the suite stays connected without feeling crowded.",
        },
      ]}
    />
  );
}
