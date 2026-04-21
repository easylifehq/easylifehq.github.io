import { ProductMarketingPage } from "@/features/marketing/components/ProductMarketingPage";

export function EasyContactsMarketingPage() {
  return (
    <ProductMarketingPage
      eyebrow="EasyContacts"
      heroTitle="Remember the people attached to the work."
      heroDescription="EasyContacts keeps names, context, and follow-ups separate from the pipeline board so relationships stay clear."
      heroPoints={["People", "Context", "Follow-ups", "Pipeline links"]}
      heroCardTitle="A simple relationship memory."
      heroCardBody="Keep useful context close without stuffing every person into tasks, notes, or applications."
      featuresTitle="Contacts without the spreadsheet fog"
      featuresDescription="EasyContacts is for remembering who matters, why they matter, and what needs follow-up."
      features={[
        {
          tag: "Context",
          title: "Keep notes tied to people",
          description: "Save the details you will want later when it is time to follow up.",
        },
        {
          tag: "Follow-up",
          title: "Use reminders when needed",
          description: "Bring contact follow-ups into the rest of the EasyLife planning flow.",
        },
        {
          tag: "Pipeline",
          title: "Support career workflows",
          description: "Keep networking context near applications without crowding the application tracker.",
        },
      ]}
      stepsTitle="Keep relationship context close"
      steps={[
        {
          title: "Add a contact",
          description: "Save the person and the context you want to remember.",
        },
        {
          title: "Connect the reason",
          description: "Tie the contact to an opportunity, project, or follow-up.",
        },
        {
          title: "Return when it matters",
          description: "Use EasyContacts when a name should not disappear after one note.",
        },
      ]}
      ctaTitle="Stop losing useful people-context."
      ctaBody="EasyContacts keeps relationship details from getting buried in your task list."
    />
  );
}
