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
  tone: string;
}> = [
  {
    value: "classic",
    label: "Classic",
    description: "Clean, balanced, and easiest to read for everyday planning.",
    tone: "Warm neutral",
  },
  {
    value: "candy",
    label: "Candy Mode",
    description: "Bright, glossy, and softer without sacrificing contrast.",
    tone: "Playful",
  },
  {
    value: "gamer",
    label: "Gamer Mode",
    description: "Dark, saturated, and high-contrast for a moodier setup.",
    tone: "Bold",
  },
  {
    value: "elvish",
    label: "Elvish",
    description: "Rich forest tones, gold accents, and a polished magical feel.",
    tone: "Enchanted",
  },
];

const appVisibilityOptions: Array<{
  id: VisibleAppId;
  label: string;
  description: string;
  home: string;
}> = [
  {
    id: "easylist",
    label: "EasyList",
    description: "Core: quick task capture and the main list.",
    home: "Core",
  },
  {
    id: "easynotes",
    label: "EasyNotes",
    description: "Core: fast notes and rough thoughts.",
    home: "Core",
  },
  {
    id: "easycalendar",
    label: "EasyCalendar",
    description: "Core: today, fixed events, and time blocks.",
    home: "Core",
  },
  {
    id: "easyworkout",
    label: "EasyWorkout",
    description: "Core: fast workout logging, with stats as a bonus.",
    home: "Core",
  },
  {
    id: "easypipeline",
    label: "EasyPipeline",
    description: "Optional: applications, follow-ups, and job-search momentum.",
    home: "Optional",
  },
  {
    id: "easycontacts",
    label: "EasyContacts",
    description: "Optional: people, relationship reminders, and networking context.",
    home: "Optional",
  },
  {
    id: "easyprojects",
    label: "EasyProjects",
    description: "Optional: sections, milestones, synced tasks, and AI planning.",
    home: "Optional",
  },
];

const experimentalFeatureOptions: Array<{
  id: ExperimentalFeatureId;
  label: string;
  description: string;
  category: "HQ" | "Capture" | "Planning" | "Projects" | "Notes" | "Workout";
  status: "Preview" | "Early" | "Polish";
  showsUp: string;
}> = [
  {
    id: "dailyReview",
    label: "Daily Review",
    description: "Adds a compact read on today's load, wins, open time, and follow-ups.",
    category: "HQ",
    status: "Preview",
    showsUp: "EasyHQ",
  },
  {
    id: "startHere",
    label: "Start Here",
    description: "Suggests the best app to open first based on tasks, follow-ups, calendar room, and workouts.",
    category: "HQ",
    status: "Preview",
    showsUp: "EasyHQ",
  },
  {
    id: "inboxCapture",
    label: "Inbox Capture",
    description: "Adds a global capture button for saving messy thoughts before choosing where they belong.",
    category: "Capture",
    status: "Early",
    showsUp: "Every app",
  },
  {
    id: "smartTaskEntry",
    label: "Smart Task Entry",
    description: "Keeps faster task parsing and bulk-entry helpers available while they mature.",
    category: "Planning",
    status: "Polish",
    showsUp: "EasyList Add Tasks",
  },
  {
    id: "overdueTriage",
    label: "Overdue Triage",
    description: "Adds a recovery-oriented cleanup panel for overdue tasks instead of only flagging them.",
    category: "Planning",
    status: "Early",
    showsUp: "EasyList dashboard",
  },
  {
    id: "projectPlanner",
    label: "Project Planner AI",
    description: "Drafts project sections, due dates, and linked task suggestions from a rough goal.",
    category: "Projects",
    status: "Early",
    showsUp: "EasyProjects",
  },
  {
    id: "notesFocusEditor",
    label: "Notes Focus Editor",
    description: "Uses a calmer writing surface with less chrome when editing a note.",
    category: "Notes",
    status: "Polish",
    showsUp: "EasyNotes editor",
  },
  {
    id: "notesProcessor",
    label: "Notes Processor",
    description: "Extracts likely tasks from notes for review before anything is created.",
    category: "Notes",
    status: "Early",
    showsUp: "EasyNotes editor",
  },
  {
    id: "mobileAppSheet",
    label: "Mobile App Switcher Sheet",
    description: "Uses a more intentional mobile Apps menu with backdrop and sheet behavior.",
    category: "Capture",
    status: "Polish",
    showsUp: "Mobile header",
  },
  {
    id: "gymMode",
    label: "Gym Mode",
    description: "Adds faster workout entry points, larger in-gym controls, and training stat previews.",
    category: "Workout",
    status: "Preview",
    showsUp: "EasyWorkout",
  },
];

const experimentGroups = ["HQ", "Capture", "Planning", "Projects", "Notes", "Workout"] as const;

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

  const enabledApps = appVisibilityOptions.filter((app) => isAppVisible(app.id));
  const enabledExperiments = experimentalFeatureOptions.filter((feature) =>
    isExperimentalFeatureEnabled(feature.id)
  );
  const activeTheme = themeOptions.find((theme) => theme.value === settings.themeMode) || themeOptions[0];

  return (
    <main className="page-wrap app-theme app-theme-settings settings-page">
      {error ? <p className="error-copy">{error}</p> : null}

      <section className="settings-hero panel-section">
        <div className="panel-header">
          <p className="eyebrow">Control Center</p>
          <h1>Settings</h1>
          <p>
            Tune how EasyLife looks, which apps stay visible, and which experimental tools are allowed into your day.
          </p>
        </div>
        <div className="settings-status-grid">
          <article className="settings-status-card">
            <span>Theme</span>
            <strong>{activeTheme.label}</strong>
            <p>{activeTheme.tone}</p>
          </article>
          <article className="settings-status-card">
            <span>Visible apps</span>
            <strong>{enabledApps.length} of {appVisibilityOptions.length}</strong>
            <p>Start with core apps, then add optional tools later.</p>
          </article>
          <article className="settings-status-card">
            <span>Experimental</span>
            <strong>{enabledExperiments.length} enabled</strong>
            <p>{enabledExperiments.length ? "Labs are active." : "Standard experience only."}</p>
          </article>
        </div>
      </section>

      <div className="settings-layout-grid">
        <PageSection
          eyebrow="Appearance"
          title="Theme mode"
          description="Choose the personality of the suite. Readability stays the priority in every mode."
        >
          <div className="settings-option-grid">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`settings-choice-card settings-theme-card settings-theme-${option.value}${
                  settings.themeMode === option.value ? " active" : ""
                }`}
                onClick={() => void setThemeMode(option.value)}
              >
                <span className="settings-card-topline">
                  <span>{option.tone}</span>
                  {settings.themeMode === option.value ? <span className="settings-state-pill">Active</span> : null}
                </span>
                <strong>{option.label}</strong>
                <p>{option.description}</p>
              </button>
            ))}
          </div>
        </PageSection>

        <PageSection
          eyebrow="Suite"
          title="Visible apps"
          description="Keep the core visible. Hide optional apps until you actually want that extra layer."
        >
          {isLoading ? <p className="helper-copy">Loading your preferences...</p> : null}

          <div className="settings-toggle-list settings-app-list">
            {appVisibilityOptions.map((app) => {
              const enabled = isAppVisible(app.id);
              return (
                <label key={app.id} className={`settings-toggle-row${enabled ? " active" : ""}`}>
                  <div>
                    <span className="settings-card-topline">
                      <span>{app.home}</span>
                      <span className="settings-state-pill">{enabled ? "Shown" : "Hidden"}</span>
                    </span>
                    <strong>{app.label}</strong>
                    <p>{app.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => void toggleVisibleApp(app.id)}
                  />
                </label>
              );
            })}
          </div>
        </PageSection>
      </div>

      <PageSection
        eyebrow="Labs"
          title="Experimental features"
        description="Leave these off while learning the app. Turn them on one at a time when the core feels comfortable."
      >
        <div className="settings-labs-summary">
          <article>
            <span>Recommended first</span>
            <strong>Daily Review, Start Here, Inbox Capture</strong>
            <p>These add the most value without changing how your core data works.</p>
          </article>
          <article>
            <span>Easy to undo</span>
            <strong>Every lab has its own switch</strong>
            <p>Turn a feature off here and its UI disappears from the suite.</p>
          </article>
        </div>

        <div className="settings-labs-grid">
          {experimentGroups.map((group) => (
            <section key={group} className="settings-lab-group">
              <div className="settings-lab-group-header">
                <p className="eyebrow">{group}</p>
                <span>
                  {
                    experimentalFeatureOptions.filter(
                      (feature) => feature.category === group && isExperimentalFeatureEnabled(feature.id)
                    ).length
                  }{" "}
                  on
                </span>
              </div>
              <div className="settings-toggle-list">
                {experimentalFeatureOptions
                  .filter((feature) => feature.category === group)
                  .map((feature) => {
                    const enabled = isExperimentalFeatureEnabled(feature.id);
                    return (
                      <label
                        key={feature.id}
                        className={`settings-toggle-row settings-toggle-row-experimental${enabled ? " active" : ""}`}
                      >
                        <div>
                          <span className="settings-card-topline">
                            <span>{feature.showsUp}</span>
                            <span className="settings-state-pill">{feature.status}</span>
                          </span>
                          <strong>{feature.label}</strong>
                          <p>{feature.description}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => void toggleExperimentalFeature(feature.id)}
                        />
                      </label>
                    );
                  })}
              </div>
            </section>
          ))}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Baseline"
        title="Always available"
        description="These stay pinned so you can always get home and recover your setup."
      >
        <div className="settings-baseline-grid">
          <article className="mini-panel-vnext">
            <span>Home base</span>
            <strong>EasyHQ</strong>
            <p>Your launcher, daily read, and suite overview.</p>
          </article>
          <article className="mini-panel-vnext">
            <span>Control center</span>
            <strong>Settings</strong>
            <p>The place to change themes, app visibility, and labs.</p>
          </article>
          <article className="mini-panel-vnext">
            <span>Data safety</span>
            <strong>Switches hide UI only</strong>
            <p>Visibility and lab toggles do not delete your app data.</p>
          </article>
        </div>
      </PageSection>
    </main>
  );
}
