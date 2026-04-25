import { ProductMarketingPage } from "@/features/marketing/components/ProductMarketingPage";

export function EasyWorkoutMarketingPage() {
  return (
    <ProductMarketingPage
      pageClassName="marketing-page--preview-realism"
      eyebrow="EasyWorkout"
      heroTitle="Start a workout and log without fighting the app."
      heroDescription="EasyWorkout keeps normal workout browsing separate from Gym Mode, so logging in the middle of a lift stays fast."
      heroPoints={["Gym Mode", "Free-form exercises", "Routines", "Compact sets"]}
      heroCardTitle="A workout logger that gets out of the way."
      heroCardBody="Start the session, type the exercise you actually did, add grip or setup notes, and move on."
      heroPreviewItems={[
        { app: "Gym Mode", detail: "Start push day" },
        { app: "Bench press", detail: "3 sets logged" },
        { app: "Cable row", detail: "Grip note saved" },
        { app: "Session", detail: "Ready to finish" },
      ]}
      featuresTitle="Built around the workout moment"
      featuresDescription="The workout page stays simple on purpose: big enough to tap, compact enough to avoid endless scrolling."
      features={[
        {
          tag: "Mode",
          title: "Gym Mode",
          description: "A focused workout surface hides unrelated controls when you are actively training.",
        },
        {
          tag: "Logging",
          title: "Type any exercise",
          description: "Exercise names are free-form, with notes for grips, setup, or machine details.",
        },
        {
          tag: "Reuse",
          title: "Routines when helpful",
          description: "Use saved routines for structure without forcing every workout through a rigid template.",
        },
      ]}
      stepsTitle="Log the workout with fewer interruptions"
      steps={[
        {
          title: "Start Gym Mode",
          description: "Open the workout page and enter the focused session view.",
        },
        {
          title: "Add exercises",
          description: "Use compact boxes, free-form names, notes, and sets.",
        },
        {
          title: "Save the session",
          description: "Keep the workout available for stats and future routine planning.",
        },
      ]}
      ctaTitle="Make workout logging feel lightweight."
      ctaBody="EasyWorkout is for getting the session down without turning the gym into data entry homework."
    />
  );
}
