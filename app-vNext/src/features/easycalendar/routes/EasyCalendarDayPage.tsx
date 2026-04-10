import { PageSection } from "@/components/ui/PageSection";

export function EasyCalendarDayPage() {
  return (
    <main className="page-wrap">
      <header className="page-hero-vnext">
        <p className="eyebrow">EasyCalendar</p>
        <h1>Day view</h1>
        <p>Single-day planning, overload warnings, and accepted vs suggested task blocks.</p>
      </header>

      <PageSection eyebrow="Plan My Day" title="Day detail" description="Planned MVP behavior.">
        <ul className="simple-list">
          <li>Fixed events first</li>
          <li>Suggested task blocks second</li>
          <li>Clear overload warning if the day is unrealistic</li>
        </ul>
      </PageSection>
    </main>
  );
}
