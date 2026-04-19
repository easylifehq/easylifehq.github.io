import { PageSection } from "@/components/ui/PageSection";
import { useEffect, useMemo, useState } from "react";
import { APP_VERSION } from "@/config/appVersion";
import { useAuth } from "@/features/auth/AuthContext";
import { useSettings } from "@/features/settings/SettingsContext";
import { auth } from "@/lib/firebase/client";
import { subscribeToApplications, subscribeToGeneratedDrafts } from "@/lib/firestore/applications";
import { subscribeToCalendarEvents } from "@/lib/firestore/calendarEvents";
import { subscribeToCalendarTaskBlocks } from "@/lib/firestore/calendarTaskBlocks";
import { subscribeToCategories } from "@/lib/firestore/categories";
import { subscribeToContacts } from "@/lib/firestore/contacts";
import { subscribeToNotes, subscribeToNoteFolders } from "@/lib/firestore/notes";
import { subscribeToProjects } from "@/lib/firestore/projects";
import { subscribeToProjectSections } from "@/lib/firestore/projectSections";
import { subscribeToProjectTaskLinks } from "@/lib/firestore/projectTaskLinks";
import { subscribeToTasks } from "@/lib/firestore/tasks";
import { subscribeToWorkoutExercises } from "@/lib/firestore/workoutExercises";
import { subscribeToWorkoutRoutines } from "@/lib/firestore/workoutRoutines";
import { subscribeToWorkoutSessions } from "@/lib/firestore/workoutSessions";
import type {
  ExperimentalFeatureId,
  ThemeMode,
  VisibleAppId,
  CalendarDefaultView,
  NotesResumeBehavior,
  RoutingDefault,
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
    id: "easystatistics",
    label: "EasyStatistics",
    description: "Core: progress, trends, and deeper cross-app stats.",
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

type SettingsSectionId =
  | "customize"
  | "apps"
  | "calendar"
  | "page-settings"
  | "data"
  | "experiments"
  | "account";

const settingsSections: Array<{
  id: SettingsSectionId;
  label: string;
  eyebrow: string;
  description: string;
}> = [
  {
    id: "customize",
    label: "Customize",
    eyebrow: "Appearance",
    description: "Theme, tone, and the overall feel of the app.",
  },
  {
    id: "apps",
    label: "Apps",
    eyebrow: "Suite",
    description: "Choose which apps show up in your workspace.",
  },
  {
    id: "calendar",
    label: "Calendar",
    eyebrow: "EasyCalendar",
    description: "Wakeup time and calendar-specific defaults.",
  },
  {
    id: "page-settings",
    label: "Pages",
    eyebrow: "Page Controls",
    description: "The future home for each app's own settings page.",
  },
  {
    id: "data",
    label: "Data",
    eyebrow: "Review",
    description: "Inspect, export, and understand what EasyLife is storing.",
  },
  {
    id: "experiments",
    label: "Labs",
    eyebrow: "Experimental",
    description: "Preview features that can be switched on or off.",
  },
  {
    id: "account",
    label: "Account",
    eyebrow: "User Info",
    description: "Account, version, and session controls.",
  },
];

const pageSettingsSections: Array<{
  id: string;
  label: string;
  title: string;
  description: string;
  status: string;
}> = [
  {
    id: "calendar",
    label: "Calendar",
    title: "EasyCalendar",
    description: "Wakeup time, day layout, categories, recurring classes, and calendar defaults belong here.",
    status: "Started",
  },
  {
    id: "list",
    label: "List",
    title: "EasyList",
    description: "Urgency scale, quick-add defaults, archive behavior, and task display controls will live here.",
    status: "Next",
  },
  {
    id: "notes",
    label: "Notes",
    title: "EasyNotes",
    description: "Open-note behavior, untitled note cleanup, folders, and note-to-task defaults will live here.",
    status: "Next",
  },
  {
    id: "workout",
    label: "Workout",
    title: "EasyWorkout",
    description: "Workout mode defaults, exercise box counts, and logging preferences will live here.",
    status: "Next",
  },
];

const defaultViewOptions: Array<{ value: CalendarDefaultView; label: string }> = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

const notesResumeOptions: Array<{ value: NotesResumeBehavior; label: string }> = [
  { value: "last-open-note", label: "Resume last open note" },
  { value: "library", label: "Open notes library" },
];

const routingOptions: Array<{ value: RoutingDefault; label: string }> = [
  { value: "ask", label: "Ask me each time" },
  { value: "projects", label: "Prefer EasyProjects" },
  { value: "pipeline", label: "Prefer EasyPipeline" },
  { value: "stay", label: "Keep in current app" },
];

type DataCollections = {
  tasks: unknown[];
  notes: unknown[];
  noteFolders: unknown[];
  calendarEvents: unknown[];
  calendarTaskBlocks: unknown[];
  calendarCategories: unknown[];
  workoutExercises: unknown[];
  workoutRoutines: unknown[];
  workoutSessions: unknown[];
  projects: unknown[];
  projectSections: unknown[];
  projectTaskLinks: unknown[];
  pipelineApplications: unknown[];
  pipelineDrafts: unknown[];
  contacts: unknown[];
};

const emptyDataCollections: DataCollections = {
  tasks: [],
  notes: [],
  noteFolders: [],
  calendarEvents: [],
  calendarTaskBlocks: [],
  calendarCategories: [],
  workoutExercises: [],
  workoutRoutines: [],
  workoutSessions: [],
  projects: [],
  projectSections: [],
  projectTaskLinks: [],
  pipelineApplications: [],
  pipelineDrafts: [],
  contacts: [],
};

const dataExportGroups: Array<{ key: keyof DataCollections; label: string; app: string }> = [
  { key: "tasks", label: "Tasks", app: "EasyList" },
  { key: "notes", label: "Notes", app: "EasyNotes" },
  { key: "noteFolders", label: "Folders", app: "EasyNotes" },
  { key: "calendarEvents", label: "Events", app: "EasyCalendar" },
  { key: "calendarTaskBlocks", label: "Task blocks", app: "EasyCalendar" },
  { key: "calendarCategories", label: "Categories", app: "EasyCalendar" },
  { key: "workoutExercises", label: "Exercises", app: "EasyWorkout" },
  { key: "workoutRoutines", label: "Routines", app: "EasyWorkout" },
  { key: "workoutSessions", label: "Sessions", app: "EasyWorkout" },
  { key: "projects", label: "Projects", app: "EasyProjects" },
  { key: "projectSections", label: "Sections", app: "EasyProjects" },
  { key: "projectTaskLinks", label: "Task links", app: "EasyProjects" },
  { key: "pipelineApplications", label: "Applications", app: "EasyPipeline" },
  { key: "pipelineDrafts", label: "Email drafts", app: "EasyPipeline" },
  { key: "contacts", label: "Contacts", app: "EasyContacts" },
];

function serializeForExport(value: unknown): unknown {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((entry) => serializeForExport(entry));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, serializeForExport(entry)])
    );
  }

  return value;
}

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(serializeForExport(payload), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function getRecordId(record: unknown) {
  return record && typeof record === "object" && "id" in record ? String(record.id) : "";
}

function getTaskLinkedBlockIds(record: unknown) {
  if (!record || typeof record !== "object" || !("linkedCalendarBlockIds" in record)) return [];
  const value = record.linkedCalendarBlockIds;
  return Array.isArray(value) ? value.map(String) : [];
}

function getStringField(record: unknown, field: string) {
  if (!record || typeof record !== "object" || !(field in record)) return "";
  const value = record[field as keyof typeof record];
  return typeof value === "string" ? value : "";
}

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSectionId>("customize");
  const { user } = useAuth();
  const [dataCollections, setDataCollections] = useState<DataCollections>(emptyDataCollections);
  const [dataError, setDataError] = useState("");
  const [dataMessage, setDataMessage] = useState("");
  const {
    settings,
    isLoading,
    error,
    setThemeMode,
    toggleVisibleApp,
    isAppVisible,
    toggleExperimentalFeature,
    isExperimentalFeatureEnabled,
    setCalendarWakeTime,
    updateEasyListSettings,
    updateEasyNotesSettings,
    updateEasyWorkoutSettings,
    updateEasyCalendarSettings,
    updateRoutingSettings,
  } = useSettings();

  const enabledApps = appVisibilityOptions.filter((app) => isAppVisible(app.id));
  const enabledExperiments = experimentalFeatureOptions.filter((feature) =>
    isExperimentalFeatureEnabled(feature.id)
  );
  const activeTheme = themeOptions.find((theme) => theme.value === settings.themeMode) || themeOptions[0];
  const activeSectionConfig =
    settingsSections.find((section) => section.id === activeSection) || settingsSections[0];
  const dataExport = useMemo(
    () => ({
      exportedAt: new Date().toISOString(),
      appVersion: APP_VERSION,
      user: {
        uid: user?.uid || "",
        email: user?.email || "",
      },
      settings,
      collections: dataCollections,
    }),
    [dataCollections, settings, user]
  );
  const dataTotals = useMemo(
    () => dataExportGroups.reduce((sum, group) => sum + dataCollections[group.key].length, 0),
    [dataCollections]
  );
  const linkedTaskCount = useMemo(
    () => dataCollections.tasks.filter((task) => getTaskLinkedBlockIds(task).length > 0).length,
    [dataCollections.tasks]
  );
  const orphanCalendarBlockCount = useMemo(() => {
    const taskIds = new Set(dataCollections.tasks.map((task) => getRecordId(task)));
    return dataCollections.calendarTaskBlocks.filter((block) => {
      const taskId = getStringField(block, "taskId");
      return taskId && !taskIds.has(taskId);
    }).length;
  }, [dataCollections.calendarTaskBlocks, dataCollections.tasks]);
  const projectLinkedTaskCount = useMemo(
    () => new Set(dataCollections.projectTaskLinks.map((link) => getStringField(link, "taskId")).filter(Boolean)).size,
    [dataCollections.projectTaskLinks]
  );
  const softDeletedNoteCount = useMemo(
    () => dataCollections.notes.filter((note) => Boolean(note && typeof note === "object" && "deletedAt" in note && note.deletedAt)).length,
    [dataCollections.notes]
  );

  useEffect(() => {
    if (!user) {
      setDataCollections(emptyDataCollections);
      setDataError("");
      return;
    }

    const handleError = (nextError: Error) => setDataError(nextError.message);
    const setCollection =
      <T,>(key: keyof DataCollections) =>
      (records: T[]) => {
        setDataCollections((current) => ({ ...current, [key]: records }));
        setDataError("");
      };

    const unsubscribers = [
      subscribeToTasks(user.uid, setCollection("tasks"), handleError),
      subscribeToNotes(user.uid, setCollection("notes"), handleError),
      subscribeToNoteFolders(user.uid, setCollection("noteFolders"), handleError),
      subscribeToCalendarEvents(user.uid, setCollection("calendarEvents"), handleError),
      subscribeToCalendarTaskBlocks(user.uid, setCollection("calendarTaskBlocks"), handleError),
      subscribeToCategories(user.uid, setCollection("calendarCategories"), handleError),
      subscribeToWorkoutExercises(user.uid, setCollection("workoutExercises"), handleError),
      subscribeToWorkoutRoutines(user.uid, setCollection("workoutRoutines"), handleError),
      subscribeToWorkoutSessions(user.uid, setCollection("workoutSessions"), handleError),
      subscribeToProjects(user.uid, setCollection("projects"), handleError),
      subscribeToProjectSections(user.uid, setCollection("projectSections"), handleError),
      subscribeToProjectTaskLinks(user.uid, setCollection("projectTaskLinks"), handleError),
      subscribeToApplications(user.uid, setCollection("pipelineApplications"), handleError),
      subscribeToGeneratedDrafts(user.uid, setCollection("pipelineDrafts"), handleError),
      subscribeToContacts(user.uid, setCollection("contacts"), handleError),
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [user]);

  function handleExportAll() {
    downloadJson(`easylife-export-${new Date().toISOString().slice(0, 10)}.json`, dataExport);
    setDataMessage("Export downloaded.");
  }

  function handleCopySummary() {
    const summary = [
      `EasyLife data summary (${new Date().toLocaleDateString()})`,
      ...dataExportGroups.map((group) => `${group.app} ${group.label}: ${dataCollections[group.key].length}`),
      `Linked tasks: ${linkedTaskCount}`,
      `Project-linked tasks: ${projectLinkedTaskCount}`,
      `Calendar blocks without matching tasks: ${orphanCalendarBlockCount}`,
      `Notes in trash: ${softDeletedNoteCount}`,
    ].join("\n");

    void navigator.clipboard.writeText(summary).then(() => setDataMessage("Summary copied."));
  }

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

      <section className="settings-section-shell">
        <nav className="settings-side-nav" aria-label="Settings sections">
          {settingsSections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={activeSection === section.id ? "active" : ""}
              onClick={() => setActiveSection(section.id)}
            >
              <span>{section.eyebrow}</span>
              <strong>{section.label}</strong>
            </button>
          ))}
        </nav>

        <label className="settings-mobile-nav field-stack">
          <span>Settings section</span>
          <select
            value={activeSection}
            onChange={(event) => setActiveSection(event.target.value as SettingsSectionId)}
          >
            {settingsSections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.label}
              </option>
            ))}
          </select>
        </label>

        <div className="settings-section-content">
          <div className="settings-section-heading">
            <p className="eyebrow">{activeSectionConfig.eyebrow}</p>
            <h2>{activeSectionConfig.label}</h2>
            <p>{activeSectionConfig.description}</p>
          </div>

      <div className="settings-layout-grid">
        {activeSection === "customize" ? (
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
        ) : null}

        {activeSection === "calendar" ? (
        <PageSection
          eyebrow="Calendar"
          title="Day setup"
        >
          <div id="calendar" className="settings-anchor" />
          <div className="settings-toggle-list">
            <label className="settings-toggle-row active">
              <div>
                <span className="settings-card-topline">
                  <span>EasyCalendar</span>
                  <span className="settings-state-pill">Day view</span>
                </span>
                <strong>Wakeup time</strong>
                <p>Your calendar day starts here when building the hour-by-hour view.</p>
              </div>
              <input
                type="time"
                value={settings.calendarWakeTime}
                onChange={(event) => void setCalendarWakeTime(event.target.value)}
              />
            </label>
            <label className="settings-toggle-row active">
              <div>
                <span className="settings-card-topline">
                  <span>Default view</span>
                  <span className="settings-state-pill">{settings.easyCalendar.defaultView}</span>
                </span>
                <strong>Open calendar to</strong>
                <p>The preferred calendar view for future navigation and shortcuts.</p>
              </div>
              <select
                value={settings.easyCalendar.defaultView}
                onChange={(event) =>
                  void updateEasyCalendarSettings({ defaultView: event.target.value as CalendarDefaultView })
                }
              >
                {defaultViewOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="settings-toggle-row active">
              <div>
                <span className="settings-card-topline">
                  <span>Planning</span>
                  <span className="settings-state-pill">{settings.easyCalendar.defaultTaskBlockMinutes} min</span>
                </span>
                <strong>Default task block length</strong>
                <p>Used by planning helpers when a task does not already have an estimate.</p>
              </div>
              <input
                type="number"
                min="5"
                max="240"
                step="5"
                value={settings.easyCalendar.defaultTaskBlockMinutes}
                onChange={(event) =>
                  void updateEasyCalendarSettings({ defaultTaskBlockMinutes: Number(event.target.value) })
                }
              />
            </label>
            <label className="settings-toggle-row active">
              <div>
                <span className="settings-card-topline">
                  <span>Planning window</span>
                  <span className="settings-state-pill">{settings.easyCalendar.planMyDayWindowHours} hours</span>
                </span>
                <strong>Plan My Day horizon</strong>
                <p>How much of the day the planner should consider after wakeup time.</p>
              </div>
              <input
                type="number"
                min="6"
                max="18"
                value={settings.easyCalendar.planMyDayWindowHours}
                onChange={(event) =>
                  void updateEasyCalendarSettings({ planMyDayWindowHours: Number(event.target.value) })
                }
              />
            </label>
          </div>
        </PageSection>
        ) : null}

        {activeSection === "page-settings" ? (
        <PageSection
          eyebrow="Page controls"
          title="App-specific settings"
        >
          <div id="page-settings" className="settings-anchor" />
          <div className="settings-page-section-list">
            {pageSettingsSections.map((section) => (
              <article key={section.id} className={`settings-page-section-card settings-page-section-${section.id}`}>
                <span className="settings-card-topline">
                  <span>{section.label}</span>
                  <span className="settings-state-pill">{section.status}</span>
                </span>
                <strong>{section.title}</strong>
                <p>{section.description}</p>
              </article>
            ))}
          </div>

          <div className="settings-app-preference-grid">
            <section className="settings-app-preference-card">
              <div className="panel-header">
                <p className="eyebrow">EasyList</p>
                <h3>Task defaults</h3>
                <p>Control how new quick-add rows behave before you type anything.</p>
              </div>
              <label className="field-stack">
                <span>Default urgency</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.easyList.defaultPriorityTier}
                  onChange={(event) =>
                    void updateEasyListSettings({ defaultPriorityTier: Number(event.target.value) })
                  }
                />
              </label>
              <label className="field-stack">
                <span>Quick-add rows</span>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={settings.easyList.quickAddRows}
                  onChange={(event) => void updateEasyListSettings({ quickAddRows: Number(event.target.value) })}
                />
              </label>
              <label className="settings-inline-check">
                <input
                  type="checkbox"
                  checked={settings.easyList.showCompletedMotion}
                  onChange={(event) => void updateEasyListSettings({ showCompletedMotion: event.target.checked })}
                />
                Keep completion motion on
              </label>
            </section>

            <section className="settings-app-preference-card">
              <div className="panel-header">
                <p className="eyebrow">EasyNotes</p>
                <h3>Writing defaults</h3>
                <p>Choose what happens when you come back to notes and process messy text.</p>
              </div>
              <label className="field-stack">
                <span>When opening notes</span>
                <select
                  value={settings.easyNotes.resumeBehavior}
                  onChange={(event) =>
                    void updateEasyNotesSettings({ resumeBehavior: event.target.value as NotesResumeBehavior })
                  }
                >
                  {notesResumeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="field-stack">
                <span>Note-to-task default</span>
                <select
                  value={settings.easyNotes.noteToTaskDefault}
                  onChange={(event) =>
                    void updateEasyNotesSettings({
                      noteToTaskDefault: event.target.value as "review" | "send-to-list",
                    })
                  }
                >
                  <option value="review">Review first</option>
                  <option value="send-to-list">Send to EasyList</option>
                </select>
              </label>
              <label className="settings-inline-check">
                <input
                  type="checkbox"
                  checked={settings.easyNotes.cleanupUntitledNotes}
                  onChange={(event) => void updateEasyNotesSettings({ cleanupUntitledNotes: event.target.checked })}
                />
                Clean up untitled empty notes
              </label>
            </section>

            <section className="settings-app-preference-card">
              <div className="panel-header">
                <p className="eyebrow">EasyWorkout</p>
                <h3>Workout mode defaults</h3>
                <p>Set how much structure is ready when you hit Start Workout.</p>
              </div>
              <label className="field-stack">
                <span>Focused exercise boxes</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.easyWorkout.focusedExerciseCount}
                  onChange={(event) =>
                    void updateEasyWorkoutSettings({ focusedExerciseCount: Number(event.target.value) })
                  }
                />
              </label>
              <label className="field-stack">
                <span>Default sets per exercise</span>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={settings.easyWorkout.defaultSetCount}
                  onChange={(event) => void updateEasyWorkoutSettings({ defaultSetCount: Number(event.target.value) })}
                />
              </label>
              <label className="settings-inline-check">
                <input
                  type="checkbox"
                  checked={settings.easyWorkout.showLastTimeHelper}
                  onChange={(event) => void updateEasyWorkoutSettings({ showLastTimeHelper: event.target.checked })}
                />
                Show last-time helper
              </label>
            </section>

            <section className="settings-app-preference-card">
              <div className="panel-header">
                <p className="eyebrow">Routing</p>
                <h3>Cross-app handoffs</h3>
                <p>Decide how task handoffs should behave as Projects and Pipeline get smarter.</p>
              </div>
              <label className="field-stack">
                <span>Project routing</span>
                <select
                  value={settings.routing.projectRoutingDefault}
                  onChange={(event) =>
                    void updateRoutingSettings({ projectRoutingDefault: event.target.value as RoutingDefault })
                  }
                >
                  {routingOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="field-stack">
                <span>Pipeline routing</span>
                <select
                  value={settings.routing.pipelineRoutingDefault}
                  onChange={(event) =>
                    void updateRoutingSettings({ pipelineRoutingDefault: event.target.value as RoutingDefault })
                  }
                >
                  {routingOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="settings-inline-check">
                <input
                  type="checkbox"
                  checked={settings.routing.preserveSourceContext}
                  onChange={(event) => void updateRoutingSettings({ preserveSourceContext: event.target.checked })}
                />
                Preserve source task context
              </label>
            </section>
          </div>
        </PageSection>
        ) : null}

        {activeSection === "apps" ? (
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
        ) : null}

        {activeSection === "data" ? (
        <PageSection
          eyebrow="Review"
          title="Data export and health"
          description="Download a portable JSON snapshot, scan what exists, and spot linked-data cleanup needs before anything disappears."
        >
          <div id="data" className="settings-anchor" />
          {dataError ? <p className="error-copy">{dataError}</p> : null}
          {dataMessage ? <div className="calendar-info-card">{dataMessage}</div> : null}

          <div className="settings-data-hero">
            <article>
              <span>Total records</span>
              <strong>{dataTotals}</strong>
              <p>Across tasks, notes, calendar, workouts, projects, pipeline, contacts, and settings.</p>
            </article>
            <article>
              <span>Linked tasks</span>
              <strong>{linkedTaskCount}</strong>
              <p>Tasks connected to one or more calendar blocks.</p>
            </article>
            <article>
              <span>Needs review</span>
              <strong>{orphanCalendarBlockCount + softDeletedNoteCount}</strong>
              <p>Calendar blocks missing tasks plus notes currently in trash.</p>
            </article>
          </div>

          <div className="settings-data-actions">
            <button type="button" className="primary-button" onClick={handleExportAll}>
              Download full export
            </button>
            <button type="button" className="button-secondary" onClick={handleCopySummary}>
              Copy data summary
            </button>
          </div>

          <div className="settings-data-grid">
            {dataExportGroups.map((group) => (
              <article key={group.key} className="settings-data-card">
                <span>{group.app}</span>
                <strong>{dataCollections[group.key].length}</strong>
                <p>{group.label}</p>
              </article>
            ))}
          </div>

          <div className="settings-review-grid">
            <article className="settings-review-card">
              <span className="settings-card-topline">
                <span>Calendar links</span>
                <span className="settings-state-pill">{orphanCalendarBlockCount ? "Review" : "Clean"}</span>
              </span>
              <strong>{orphanCalendarBlockCount} orphan block{orphanCalendarBlockCount === 1 ? "" : "s"}</strong>
              <p>These are flexible calendar blocks pointing at tasks that are no longer in the current task list.</p>
            </article>
            <article className="settings-review-card">
              <span className="settings-card-topline">
                <span>Project links</span>
                <span className="settings-state-pill">{projectLinkedTaskCount} tasks</span>
              </span>
              <strong>{dataCollections.projectTaskLinks.length} project task link{dataCollections.projectTaskLinks.length === 1 ? "" : "s"}</strong>
              <p>Project sections are connected back to EasyList tasks so larger work stays inspectable.</p>
            </article>
            <article className="settings-review-card">
              <span className="settings-card-topline">
                <span>Notes trash</span>
                <span className="settings-state-pill">{softDeletedNoteCount ? "Recoverable" : "Empty"}</span>
              </span>
              <strong>{softDeletedNoteCount} note{softDeletedNoteCount === 1 ? "" : "s"} in trash</strong>
              <p>Deleted notes remain reviewable from EasyNotes trash before permanent removal.</p>
            </article>
          </div>
        </PageSection>
        ) : null}
      </div>

      {activeSection === "experiments" ? (
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
      ) : null}

      {activeSection === "account" ? (
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
            <strong>{APP_VERSION}</strong>
            <p>Current release.</p>
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
      ) : null}
        </div>
      </section>
    </main>
  );
}
