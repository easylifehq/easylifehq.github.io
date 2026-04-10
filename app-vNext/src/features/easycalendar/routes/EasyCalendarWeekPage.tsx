import { PageSection } from "@/components/ui/PageSection";

export function EasyCalendarWeekPage() {
  return (
    <main className="page-wrap">
      <header className="page-hero-vnext">
        <p className="eyebrow">EasyCalendar</p>
        <h1>Week view</h1>
        <p>Placeholder shell for fixed events, linked task blocks, and open-gap planning.</p>
      </header>

      <PageSection
        eyebrow="Core"
        title="Week planning"
        description="This route will hold the main week grid for classes, work, appointments, and flexible task blocks."
      >
        <ul className="simple-list">
          <li>Full-color category blocks</li>
          <li>Fixed vs flexible block distinction</li>
          <li>Open-gap awareness</li>
        </ul>
      </PageSection>
    </main>
  );
}
