import { ProductMarketingPage } from "@/features/marketing/components/ProductMarketingPage";

export function EasyStatisticsMarketingPage() {
  return (
    <ProductMarketingPage
      eyebrow="Progress"
      heroTitle="Keep progress fun without crowding every page."
      heroDescription="Progress gives trends and area-by-area data a dedicated place so the core assistant stays clean."
      heroPoints={["Overview", "Area stats", "Trends", "Less page clutter"]}
      heroCardTitle="The numbers get their own room."
      heroCardBody="Stats are useful when you ask for them, not when they are crammed into every workflow."
      featuresTitle="Progress without claustrophobia"
      featuresDescription="Use the statistics hub to see how the system is working across tasks, calendar, notes, workouts, projects, and pipeline."
      features={[
        {
          tag: "Overview",
          title: "A high-level read",
          description: "See the overall shape without digging through each app.",
        },
        {
          tag: "Deep dive",
          title: "Per-area detail",
          description: "Open the specific stats for the page or workflow you care about.",
        },
        {
          tag: "Focus",
          title: "Primary pages stay lighter",
          description: "Move heavy stats into the hub so task and calendar pages can stay usable.",
        },
      ]}
      stepsTitle="Review progress when you want it"
      steps={[
        {
          title: "Open Progress",
          description: "Start with the overall dashboard.",
        },
        {
          title: "Choose an area",
          description: "Look deeper into the workflow that needs attention.",
        },
        {
          title: "Adjust the system",
          description: "Use the data to tune priorities, habits, and planning choices.",
        },
      ]}
      ctaTitle="Use data without letting it run the app."
      ctaBody="Progress keeps the fun metrics available while the main pages stay focused."
    />
  );
}
