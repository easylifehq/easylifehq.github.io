import { PageSection } from "@/components/ui/PageSection";

export function HQPage() {
  return (
    <main className="page-wrap">
      <header className="page-hero-vnext">
        <p className="eyebrow">EasyHQ</p>
        <h1>Your control center.</h1>
        <p>
          This placeholder HQ page is where today&apos;s events, top tasks, and open time
          will come together once EasyList and EasyCalendar are migrated.
        </p>
      </header>

      <div className="dashboard-grid">
        <PageSection
          eyebrow="Today"
          title="Daily snapshot"
          description="Next version target: greeting, next events, top tasks, and open time."
        >
          <ul className="simple-list">
            <li>Today&apos;s next 3 fixed events</li>
            <li>Top 3 tasks to care about</li>
            <li>Open time summary</li>
          </ul>
        </PageSection>

        <PageSection
          eyebrow="Launch"
          title="Quick entry points"
          description="EasyHQ should route you into the right workspace fast."
        >
          <ul className="simple-list">
            <li>Open EasyList</li>
            <li>Open EasyCalendar</li>
            <li>Plan My Day</li>
          </ul>
        </PageSection>
      </div>
    </main>
  );
}
