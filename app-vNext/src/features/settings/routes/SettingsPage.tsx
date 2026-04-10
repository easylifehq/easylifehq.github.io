import { AppWorkspaceHeader } from "@/components/navigation/AppWorkspaceHeader";
import { PageSection } from "@/components/ui/PageSection";

export function SettingsPage() {
  return (
    <main className="page-wrap">
      <AppWorkspaceHeader
        appLabel="Settings"
        title="Shared defaults."
        description="Preferences that shape the system across Easy apps."
        currentAppHref="/app/settings"
        compact
      />

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
