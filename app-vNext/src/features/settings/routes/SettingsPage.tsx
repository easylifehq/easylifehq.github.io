import { PageSection } from "@/components/ui/PageSection";
import { useSettings } from "@/features/settings/SettingsContext";
import type {
  ExperimentalFeatureId,
  ThemeMode,
  VisibleAppId,
} from "@/lib/firestore/settings";

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

const experimentalFeatureOptions: Array<{
  id: ExperimentalFeatureId;
  label: string;
  description: string;
}> = [
  {
    id: "smartTaskEntry",
    label: "Smart task entry",
    description: "Try faster task capture and parsing ideas before they become standard.",
  },
  {
    id: "notesFocusEditor",
    label: "Notes focus editor",
    description: "Try a more minimal writing-first EasyNotes editor.",
  },
  {
    id: "mobileAppSheet",
    label: "Mobile app switcher sheet",
    description: "Try the newer mobile Apps menu and sheet behavior.",
  },
  {
    id: "dailyReview",
    label: "Daily Review",
    description: "Add a compact intelligence panel to EasyHQ for today’s load and wins.",
  },
  {
    id: "startHere",
    label: "Start Here",
    description: "Let EasyHQ recommend the best app to open first.",
  },
  {
    id: "inboxCapture",
    label: "Inbox capture",
    description: "Use a global quick-capture button for messy thoughts before sorting them.",
  },
  {
    id: "overdueTriage",
    label: "Overdue triage",
    description: "Try a cleanup panel for overdue tasks in EasyList.",
  },
  {
    id: "notesProcessor",
    label: "Notes processor",
    description: "Extract likely tasks and follow-ups from notes before creating anything.",
  },
  {
    id: "gymMode",
    label: "Gym Mode",
    description: "Try faster workout logging, stack launchers, and long-term training stats.",
  },
];

export function SettingsPage() {
  const {
    settings,
    isLoading,
    error,
    setThemeMode,
    toggleVisibleApp,
    isAppVisible,
    toggleExperimentalFeature,
    isExperimentalFeatureEnabled,
  } = useSettings();

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
        eyebrow="Labs"
        title="Experimental features"
        description="Try newer ideas early. Turn any of these off if they get in your way."
      >
        <div className="settings-toggle-list">
          {experimentalFeatureOptions.map((feature) => (
            <label key={feature.id} className="settings-toggle-row settings-toggle-row-experimental">
              <div>
                <strong>{feature.label}</strong>
                <p>{feature.description}</p>
              </div>
              <input
                type="checkbox"
                checked={isExperimentalFeatureEnabled(feature.id)}
                onChange={() => void toggleExperimentalFeature(feature.id)}
              />
            </label>
          ))}
        </div>
      </PageSection>

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
