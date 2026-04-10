import { ProductMarketingPage } from "@/features/marketing/components/ProductMarketingPage";

export function EasyNotesMarketingPage() {
  return (
    <ProductMarketingPage
      eyebrow="EasyNotes"
      heroTitle="Write first. Sort it out later."
      heroDescription="EasyNotes is for brain dumps, meeting notes, rough drafts, and fast thought capture with a calm mobile-first writing experience."
      heroPoints={["Mobile-friendly", "Clean note list", "Minimal formatting", "Draft handoff to EasyList"]}
      heroCardTitle="Closer to Apple Notes than a bloated workspace."
      heroCardBody="The goal is fast writing, simple structure, and a note system that stays calm enough to use every day."
      featuresTitle="Notes that stay simple on purpose"
      featuresDescription="Enough structure to be useful, not so much that the interface gets in your way."
      features={[
        {
          tag: "Capture",
          title: "Quick notes and brain dumps",
          description: "Open the app, create a note fast, and get thoughts down before they disappear.",
        },
        {
          tag: "Mobile",
          title: "Built around phone usage",
          description: "The main controller stays simple, the note view stays focused, and the interface avoids unnecessary noise.",
        },
        {
          tag: "Action",
          title: "Turn ideas into EasyList drafts",
          description: "Useful notes can become draft tasks without automatically cluttering your schedule.",
        },
      ]}
      stepsTitle="Capture, refine, then hand off"
      steps={[
        {
          title: "Throw thoughts into one note fast",
          description: "Use the note list and create flow as a simple filing system instead of a complicated workspace.",
        },
        {
          title: "Keep formatting minimal",
          description: "Use headings, tables, and lists when helpful, all tucked behind a single format control.",
        },
        {
          title: "Send action items to EasyList drafts",
          description: "Let the system help turn notes into structured next steps without auto-scheduling them.",
        },
      ]}
      ctaTitle="Keep your notes space calm."
      ctaBody="Use EasyNotes when you want a clean place to think on mobile without turning every note into a project."
    />
  );
}
