import { PageSection } from "@/components/ui/PageSection";
import { useSettings } from "@/features/settings/SettingsContext";
import type { ThemeMode, VisibleAppId } from "@/lib/firestore/settings";

const themeOptions: Array<{
  value: ThemeMode;
  label: string;
  description: string;
}> = [
  {
    value: "classic",
    label: "Classic",
    description: "Clean and balanced. The default Easy look.",
  },
  {
    value: "candy",
    label: "Candy Mode",
    description: "Bright pink, glossy, and pretty with a much sweeter atmosphere.",
  },
  {
    value: "gamer",
    label: "Gamer Mode",
    description: "Dark, purple, and bolder with a moodier high-contrast feel.",
  },
  {
    value: "elvish",
    label: "Elvish",
    description: "Gold, green, and magical like stepping into a forest world.",
  },
];

const appVisibilityOptions: Array<{
  id: VisibleAppId;
  label: string;
  description: string;
}> = [
  {
    id: "easylist",
    label: "EasyList",
    description: "Tasks and to-dos.",
  },
  {
    id: "easynotes",
    label: "EasyNotes",
    description: "Notes, brain dumps, and drafts.",
  },
  {
    id: "easycalendar",
    label: "EasyCalendar",
    description: "Time planning and schedule blocks.",
  },
  {
    id: "easypipeline",
    label: "EasyPipeline",
    description: "Applications and job search tracking.",
  },
  {
    id: "easycontacts",
    label: "EasyContacts",
    description: "Networking and relationship tracking.",
  },
  {
    id: "easyprojects",
    label: "EasyProjects",
    description: "Projects, sections, milestones, and synced project tasks.",
  },
  {
    id: "easyworkout",
    label: "EasyWorkout",
    description: "Workout routines, logging, and strength progress.",
  },
];

export function SettingsPage() {
  const { settings, isLoading, error, setThemeMode, toggleVisibleApp, isAppVisible } =
    useSettings();

  return (
    <main className="page-wrap app-theme app-theme-settings">
      {error ? <p className="error-copy">{error}</p> : null}

      <div className="dashboard-grid">
        <PageSection
          eyebrow="Appearance"
          title="Theme mode"
          description="Pick the overall personality for the logged-in app experience."
        >
          <div className="settings-option-grid">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`settings-choice-card${settings.themeMode === option.value ? " active" : ""}`}
                onClick={() => void setThemeMode(option.value)}
              >
                <strong>{option.label}</strong>
                <p>{option.description}</p>
              </button>
            ))}
          </div>
        </PageSection>

        <PageSection
          eyebrow="Suite"
          title="Visible apps"
          description="Choose which apps show up in app switchers and on EasyHQ."
        >
          {isLoading ? <p className="helper-copy">Loading your preferences...</p> : null}

          <div className="settings-toggle-list">
            {appVisibilityOptions.map((app) => (
              <label key={app.id} className="settings-toggle-row">
                <div>
                  <strong>{app.label}</strong>
                  <p>{app.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={isAppVisible(app.id)}
                  onChange={() => void toggleVisibleApp(app.id)}
                />
              </label>
            ))}
          </div>
        </PageSection>
      </div>

      <PageSection
        eyebrow="What stays"
        title="Always visible"
        description="EasyHQ and Settings stay available so you always have a central home and a way back into preferences."
      >
        <div className="pill-row">
          <span className="info-pill">EasyHQ always available</span>
          <span className="info-pill">Settings always available</span>
        </div>
      </PageSection>
    </main>
  );
}
