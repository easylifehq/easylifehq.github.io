import { PageSection } from "@/components/ui/PageSection";

export function SettingsPage() {
  return (
    <main className="page-wrap">
      <header className="page-hero-vnext">
        <p className="eyebrow">Settings</p>
        <h1>App defaults</h1>
        <p>Shared user preferences for week start, default duration, and future category management.</p>
      </header>

      <PageSection
        eyebrow="Defaults"
        title="Shared settings"
        description="This route will later back Firestore settings documents for all Easy apps."
      >
        <ul className="simple-list">
          <li>Week start day</li>
          <li>Default task duration</li>
          <li>Calendar density</li>
          <li>Category management</li>
        </ul>
      </PageSection>
    </main>
  );
}
