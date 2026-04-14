import { PageSection } from "@/components/ui/PageSection";
import { useSettings } from "@/features/settings/SettingsContext";
import { auth } from "@/lib/firebase/client";
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
    label: "Classic Notebook",
    description: "Crisp paper, graphite text, and calm blue accents for everyday planning.",
    tone: "Notebook",
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
  {
    value: "aurora",
    label: "Aurora",
    description: "A premium dark theme with mint, ice-blue, and soft rose accents.",
    tone: "Northern lights",
  },
  {
    value: "studio",
    label: "Studio",
    description: "Clean white surfaces, graphite text, and cobalt accents for a professional feel.",
    tone: "Professional",
  },
  {
    value: "sunrise",
    label: "Sunrise",
    description: "Warm coral, sky blue, and gentle yellow accents without losing readability.",
    tone: "Bright",
  },
  {
    value: "midnightGarden",
    label: "Midnight Garden",
    description: "Deep green-black surfaces with lavender and moonlit blue accents.",
    tone: "Botanical dark",
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

      <nav className="settings-side-nav" aria-label="Settings sections">
        <a href="#customize">Customize</a>
        <a href="#apps">Apps</a>
        <a href="#experiments">Experimental</a>
        <a href="#account">User info</a>
      </nav>

      <div className="settings-layout-grid">
        <PageSection
          eyebrow="Appearance"
          title="Theme mode"
        >
          <div id="customize" className="settings-anchor" />
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
        >
          <div id="apps" className="settings-anchor" />
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
      >
        <div id="experiments" className="settings-anchor" />
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
        eyebrow="Account"
        title="User info"
      >
        <div id="account" className="settings-anchor" />
        <div className="settings-baseline-grid">
          <article className="mini-panel-vnext">
            <span>Email</span>
            <strong>{auth.currentUser?.email || "Signed in"}</strong>
            <p>Your EasyLife account.</p>
          </article>
          <article className="mini-panel-vnext">
            <span>Version</span>
            <strong>3.0.1</strong>
            <p>Desktop cleanup release.</p>
          </article>
          <article className="mini-panel-vnext">
            <span>Session</span>
            <strong>Log out</strong>
            <button type="button" className="button-secondary compact-button" onClick={() => void auth.signOut()}>
              Log out
            </button>
          </article>
        </div>
      </PageSection>
    </main>
  );
}
