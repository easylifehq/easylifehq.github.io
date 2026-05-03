import { PageSection } from "@/components/ui/PageSection";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { APP_VERSION } from "@/config/appVersion";
import { useAuth } from "@/features/auth/AuthContext";
import { AiCommandCenter } from "@/features/experiments/AiCommandCenter";
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
import { useMobileRuntime } from "@/lib/mobile/useMobileRuntime";
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendTestNotification,
  type NotificationPermissionState,
} from "@/lib/mobile/notifications";
import type {
  ExperimentalFeatureId,
  ThemeMode,
  VisibleAppId,
  CalendarDefaultView,
  NotesResumeBehavior,
  RoutingDefault,
  StartupRoute,
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
    description: "A dark theme with mint, ice-blue, and soft rose accents.",
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
  status: "Active" | "Partial" | "Coming soon";
  showsUp: string;
  recommendation: string;
}> = [
  {
    id: "dailyReview",
    label: "Daily Review",
    description: "Adds a compact read on today's load, wins, open time, and follow-ups.",
    category: "HQ",
    status: "Active",
    showsUp: "EasyHQ",
    recommendation: "Keep if you like HQ showing a planning pulse.",
  },
  {
    id: "startHere",
    label: "Start Here",
    description: "Suggests the best app to open first based on tasks, follow-ups, calendar room, and workouts.",
    category: "HQ",
    status: "Active",
    showsUp: "EasyHQ",
    recommendation: "Keep if you want HQ to suggest where to begin.",
  },
  {
    id: "inboxCapture",
    label: "Inbox Capture",
    description: "Planned global capture button for saving messy thoughts before choosing where they belong.",
    category: "Capture",
    status: "Coming soon",
    showsUp: "No active surface yet",
    recommendation: "Leave off until the global capture button is built.",
  },
  {
    id: "smartTaskEntry",
    label: "Smart Task Entry",
    description: "Legacy switch for task parsing work that is now mostly part of the standard Add Tasks flow.",
    category: "Planning",
    status: "Partial",
    showsUp: "EasyList Add Tasks",
    recommendation: "Can be retired soon unless we wire a specific smart-entry behavior to it.",
  },
  {
    id: "overdueTriage",
    label: "Overdue Triage",
    description: "Adds a recovery-oriented cleanup panel for overdue tasks instead of only flagging them.",
    category: "Planning",
    status: "Active",
    showsUp: "EasyList dashboard",
    recommendation: "Keep if you want the overdue cleanup panel.",
  },
  {
    id: "projectPlanner",
    label: "Project Planner AI",
    description: "Drafts project sections, due dates, and linked task suggestions from a rough goal.",
    category: "Projects",
    status: "Active",
    showsUp: "EasyProjects",
    recommendation: "Requires Assistant and draft creation to be on.",
  },
  {
    id: "notesFocusEditor",
    label: "Notes Focus Editor",
    description: "Uses a calmer writing surface with less chrome when editing a note.",
    category: "Notes",
    status: "Active",
    showsUp: "EasyNotes editor",
    recommendation: "Keep if you prefer the calmer note editor shell.",
  },
  {
    id: "notesProcessor",
    label: "Notes Processor",
    description: "Extracts likely tasks from notes for review before anything is created.",
    category: "Notes",
    status: "Active",
    showsUp: "EasyNotes editor",
    recommendation: "Keep if you want note-to-task/project review tools.",
  },
  {
    id: "mobileAppSheet",
    label: "Mobile App Switcher Sheet",
    description: "Uses a more intentional mobile Apps menu with backdrop and sheet behavior.",
    category: "Capture",
    status: "Active",
    showsUp: "Mobile header",
    recommendation: "Keep for a better phone app switcher.",
  },
  {
    id: "gymMode",
    label: "Gym Mode",
    description: "Adds faster workout entry points, larger in-gym controls, and training stat previews.",
    category: "Workout",
    status: "Active",
    showsUp: "EasyWorkout",
    recommendation: "Promote to a normal workout feature after this pass.",
  },
];

const experimentGroups = ["HQ", "Capture", "Planning", "Projects", "Notes", "Workout"] as const;

type SettingsSectionId =
  | "customize"
  | "apps"
  | "calendar"
  | "page-settings"
  | "data"
  | "install"
  | "distribution"
  | "notifications"
  | "assistant"
  | "experiments"
  | "account";

const settingsSections: Array<{
  id: SettingsSectionId;
  label: string;
  eyebrow: string;
  description: string;
  group: "basics" | "advanced";
}> = [
  {
    id: "customize",
    label: "Personalize",
    eyebrow: "Appearance",
    description: "Choose the theme, opening screen, and everyday app setup.",
    group: "basics",
  },
  {
    id: "apps",
    label: "Apps",
    eyebrow: "Suite",
    description: "Choose which apps show up in your workspace.",
    group: "basics",
  },
  {
    id: "calendar",
    label: "Calendar",
    eyebrow: "EasyCalendar",
    description: "Wake-up time, default view, and planning defaults.",
    group: "basics",
  },
  {
    id: "page-settings",
    label: "Suite Controls",
    eyebrow: "App Defaults",
    description: "Tune the defaults that shape how each EasyLife app opens and hands work across the suite.",
    group: "advanced",
  },
  {
    id: "data",
    label: "Data",
    eyebrow: "Review",
    description: "Inspect, export, and understand what EasyLife is storing.",
    group: "advanced",
  },
  {
    id: "install",
    label: "Install",
    eyebrow: "Home Screen",
    description: "Add EasyLife to your phone home screen for faster daily use.",
    group: "basics",
  },
  {
    id: "distribution",
    label: "Share",
    eyebrow: "Distribution",
    description: "Prep the app for friends, TestFlight, stores, support, and rollback.",
    group: "advanced",
  },
  {
    id: "notifications",
    label: "Notifications",
    eyebrow: "Reminders",
    description: "Control reminder permission, categories, quiet hours, and test alerts.",
    group: "basics",
  },
  {
    id: "assistant",
    label: "Assistant",
    eyebrow: "AI Controls",
    description: "Set what AI can review, suggest, draft, and never do automatically.",
    group: "advanced",
  },
  {
    id: "experiments",
    label: "Labs",
    eyebrow: "Experimental",
    description: "Preview features that can be switched on or off.",
    group: "advanced",
  },
  {
    id: "account",
    label: "Account",
    eyebrow: "User Info",
    description: "See your account, app version, and sign-out control.",
    group: "basics",
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
    description: "Wake-up time, day layout, categories, recurring classes, and calendar defaults belong here.",
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

const startupRouteOptions: Array<{ value: StartupRoute; label: string; description: string }> = [
  { value: "/app/hq", label: "EasyHQ", description: "Start with today's workspace." },
  { value: "last-used", label: "Last used screen", description: "Resume where you left off." },
  { value: "/app/easylist/dashboard", label: "EasyList", description: "Open straight to your task list." },
  { value: "/app/easylist/add", label: "Add tasks", description: "Start in fast capture mode." },
  { value: "/app/easycalendar/day", label: "Today calendar", description: "Start with today hour by hour." },
  { value: "/app/easynotes", label: "EasyNotes", description: "Open your notes library." },
  { value: "/app/easynotes/new", label: "Blank note", description: "Start writing immediately." },
  { value: "/app/easyworkout/dashboard", label: "EasyWorkout", description: "Open the workout dashboard." },
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

const distributionChecklist: Array<{
  label: string;
  title: string;
  status: "Ready" | "Next" | "Later";
  description: string;
}> = [
  {
    label: "First share path",
    title: "Home-screen PWA link",
    status: "Ready",
    description: "Best for you and friends right now: open the site in Safari, then Add to Home Screen.",
  },
  {
    label: "iPhone beta path",
    title: "TestFlight later",
    status: "Next",
    description: "Use this when native wrapping, signing, and Apple developer setup are worth the extra ceremony.",
  },
  {
    label: "Store metadata",
    title: "Name, subtitle, screenshots, privacy, and support",
    status: "Next",
    description: "These need to be prepared before any App Store or Play Store submission.",
  },
  {
    label: "Safety net",
    title: "Rollback plan",
    status: "Ready",
    description: "Keep the previous stable release available in git so a bad deploy can be reverted quickly.",
  },
  {
    label: "Support",
    title: "Bug and login help path",
    status: "Ready",
    description: "The footer feedback link and Settings export tools give early testers a clear support route.",
  },
  {
    label: "Native builds",
    title: "Capacitor iOS and Android projects",
    status: "Later",
    description: "Add these when home-screen install is not enough for notifications, distribution, or store review.",
  },
];

const assistantBoundaries: Array<{
  label: string;
  title: string;
  status: "Allowed" | "Review" | "Blocked";
  description: string;
}> = [
  {
    label: "Planning",
    title: "Summaries and next-step suggestions",
    status: "Allowed",
    description: "The assistant can help organize work into readable plans when the feature is enabled.",
  },
  {
    label: "Creation",
    title: "Drafts only until you approve",
    status: "Review",
    description: "Projects, tasks, and note-derived actions should stay review-first before anything is saved.",
  },
  {
    label: "Automation",
    title: "No surprise changes",
    status: "Blocked",
    description: "The assistant should not delete, archive, send, schedule, or notify without a clear user action.",
  },
  {
    label: "Data",
    title: "Scoped to your account",
    status: "Review",
    description: "AI review should use only the current signed-in user's EasyLife data and visible context.",
  },
  {
    label: "Fallback",
    title: "Manual path stays available",
    status: "Allowed",
    description: "If AI is unavailable, the app should explain what happened and keep the manual workflow usable.",
  },
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
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<SettingsSectionId>("customize");
  const { user } = useAuth();
  const [dataCollections, setDataCollections] = useState<DataCollections>(emptyDataCollections);
  const [dataError, setDataError] = useState("");
  const [dataMessage, setDataMessage] = useState("");
  const [installMessage, setInstallMessage] = useState("");
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermissionState>(() =>
    typeof window === "undefined" ? "unsupported" : getNotificationPermission()
  );
  const [notificationMessage, setNotificationMessage] = useState("");
  const mobileRuntime = useMobileRuntime();
  const {
    settings,
    isLoading,
    error,
    setThemeMode,
    setStartupRoute,
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
    updateNotificationSettings,
    updateAssistantSettings,
  } = useSettings();

  const enabledExperiments = experimentalFeatureOptions.filter((feature) =>
    isExperimentalFeatureEnabled(feature.id)
  );
  const primarySections = settingsSections.filter((section) => section.group === "basics");
  const advancedSections = settingsSections.filter((section) => section.group === "advanced");
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
    const requestedSection = searchParams.get("section");
    if (settingsSections.some((section) => section.id === requestedSection)) {
      setActiveSection(requestedSection as SettingsSectionId);
    }
  }, [searchParams]);

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

  function handleOpenInstallShare() {
    const installUrl = window.location.origin;

    if (navigator.share) {
      void navigator
        .share({
          title: "EasyLife",
          text: "Add EasyLife to your home screen.",
          url: installUrl,
        })
        .then(() => setInstallMessage("Choose Add to Home Screen from the share sheet."))
        .catch(() => setInstallMessage("Share sheet closed. Open Safari's Share menu and choose Add to Home Screen."));
      return;
    }

    void navigator.clipboard
      .writeText(installUrl)
      .then(() => setInstallMessage("EasyLife link copied. Open it in Safari, then choose Add to Home Screen."));
  }

  async function handleRequestNotifications() {
    const nextPermission = await requestNotificationPermission();
    setNotificationPermission(nextPermission);

    if (nextPermission === "granted") {
      await updateNotificationSettings({ enabled: true });
      setNotificationMessage("Notifications are enabled. Use the category switches below to choose what can remind you.");
      return;
    }

    if (nextPermission === "denied") {
      await updateNotificationSettings({ enabled: false });
      setNotificationMessage("Notifications are blocked for this browser. Change the browser or iPhone site settings to allow them.");
      return;
    }

    setNotificationMessage("This browser does not support web notifications here.");
  }

  function handleSendTestNotification() {
    const sent = sendTestNotification();
    setNotificationMessage(
      sent
        ? "Test notification sent."
        : "Allow notifications first, then try the test again."
    );
  }

  return (
    <main className="page-wrap app-theme app-theme-settings settings-page">
      {error ? <p className="error-copy">{error}</p> : null}

      <section className="settings-hero panel-section">
        <div className="panel-header">
          <p className="eyebrow">Daily setup</p>
          <h1>Settings</h1>
          <p>Adjust the settings that shape today.</p>
        </div>
      </section>

      <section className="settings-section-shell">
        <nav className="settings-side-nav" aria-label="Settings sections">
          <details className="settings-side-details settings-section-picker">
            <summary>Change section</summary>
            <div className="settings-side-group">
              <p className="eyebrow">Everyday</p>
              {primarySections.map((section) => (
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
            </div>
            <div className="settings-side-group settings-side-group-advanced">
              <p className="eyebrow">Advanced</p>
              {advancedSections.map((section) => (
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
            </div>
          </details>
        </nav>

        <nav className="settings-mobile-nav" aria-label="Settings sections">
          <label className="settings-mobile-nav-label" htmlFor="settings-mobile-section">
            Settings section
          </label>
          <select
            id="settings-mobile-section"
            value={activeSection}
            onChange={(event) => setActiveSection(event.target.value as SettingsSectionId)}
          >
            {primarySections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.label}
              </option>
            ))}
            {advancedSections.map((section) => (
              <option key={section.id} value={section.id}>
                Advanced: {section.label}
              </option>
            ))}
          </select>
        </nav>

        <div className="settings-section-content">
          <div className="settings-section-heading">
            <p className="eyebrow">{activeSectionConfig.eyebrow}</p>
            <h2>{activeSectionConfig.label}</h2>
          </div>

      <div className="settings-layout-grid">
        {activeSection === "customize" ? (
        <PageSection
          eyebrow="Appearance"
          title="Theme mode"
        >
          <div id="customize" className="settings-anchor" />
          <div className="settings-customization-console">
            <div className="settings-theme-overview">
              <div>
                <span className="settings-card-topline">Current selection</span>
                <strong>{activeTheme.label}</strong>
                <p>{activeTheme.description}</p>
              </div>
              <span className="settings-state-pill">{activeTheme.tone}</span>
            </div>
            <details className="advanced-disclosure">
              <summary>Choose another theme</summary>
              <p className="helper-copy">
                Theme changes apply across EasyLife without changing your data or app setup.
              </p>
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
            </details>
          </div>
        </PageSection>
        ) : null}

        {activeSection === "customize" ? (
        <PageSection
          eyebrow="Startup"
          title="Opening screen"
        >
          <details className="advanced-disclosure">
            <summary>Change opening screen</summary>
            <div className="settings-toggle-list">
              <label className="field-stack">
                <span>Open EasyLife to</span>
                <select
                  value={settings.startupRoute}
                  onChange={(event) => void setStartupRoute(event.target.value as StartupRoute)}
                >
                  {startupRouteOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <p className="helper-copy">
                {startupRouteOptions.find((option) => option.value === settings.startupRoute)?.description}
              </p>
            </div>
          </details>
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
                <strong>Wake-up time</strong>
                <p>Your calendar day starts at this time in the hour-by-hour view.</p>
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
                <p>How many hours after wake-up time the planner should consider.</p>
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
          eyebrow="Suite controls"
          title="App defaults"
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

          <aside className="settings-command-note" aria-label="Suite defaults guidance">
            <div>
              <span className="settings-card-topline">How your apps open</span>
              <strong>Set how EasyLife opens, captures, and routes your work.</strong>
              <p>
                These controls tune how each app starts its work while keeping the underlying tools and saved data
                unchanged.
              </p>
            </div>
            <div className="settings-command-tags" aria-label="Covered settings areas">
              <span>Capture</span>
              <span>Plan</span>
              <span>Route</span>
            </div>
          </aside>

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
                <h3>Cross-app planning</h3>
                <p>Decide how task follow-ups should move between Projects and Pipeline.</p>
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

        {activeSection === "install" ? (
        <PageSection
          eyebrow="Home screen"
          title="Add EasyLife to your phone"
          description="Install EasyLife from Safari so it opens from your home screen like an app."
        >
          <div id="install" className="settings-anchor" />
          {installMessage ? <div className="calendar-info-card">{installMessage}</div> : null}
          <div className="settings-install-status">
            <article>
              <span>Launch mode</span>
              <strong>{mobileRuntime.runtimeLabel}</strong>
              <p>
                {mobileRuntime.isStandalone
                  ? "EasyLife is already opening from your home screen."
                  : "EasyLife is still running in the browser on this device."}
              </p>
            </article>
            <article>
              <span>Install status</span>
              <strong>{mobileRuntime.installLabel}</strong>
              <p>
                {mobileRuntime.isStandalone
                  ? "You are already in the smoother app-style version."
                  : "For the best phone setup, add EasyLife to your home screen from Safari."}
              </p>
            </article>
          </div>
          <div className="settings-install-hero">
            <article>
              <span className="settings-card-topline">
                <span>iPhone</span>
                <span className="settings-state-pill">Best path</span>
              </span>
              <strong>Tap Install EasyLife</strong>
              <p>This opens the share sheet when your browser allows it. From there, choose Add to Home Screen.</p>
            </article>
            <article>
              <span className="settings-card-topline">
                <span>Result</span>
                <span className="settings-state-pill">Home screen</span>
              </span>
              <strong>EasyLife opens like an app</strong>
              <p>After adding it, launch EasyLife from the icon instead of opening a normal browser tab.</p>
            </article>
          </div>

          <div className="settings-data-actions">
            <button type="button" className="primary-button" onClick={handleOpenInstallShare}>
              Install EasyLife
            </button>
            <a className="button-secondary" href="/" target="_blank" rel="noreferrer">
              Open install page
            </a>
          </div>

          <ol className="settings-install-steps">
            <li>
              <span>1</span>
              <p>Tap Install EasyLife from this Settings tab.</p>
            </li>
            <li>
              <span>2</span>
              <p>If the share sheet opens, scroll through the actions.</p>
            </li>
            <li>
              <span>3</span>
              <p>Choose Add to Home Screen.</p>
            </li>
            <li>
              <span>4</span>
              <p>Tap Add, then open EasyLife from the new icon.</p>
            </li>
          </ol>

          <div className="settings-review-grid">
            <article className="settings-review-card">
              <span className="settings-card-topline">
                <span>Android</span>
                <span className="settings-state-pill">Chrome</span>
              </span>
              <strong>Use Install app or Add to Home screen</strong>
              <p>Chrome usually shows this from the three-dot menu when the site is ready to install.</p>
            </article>
            <article className="settings-review-card">
              <span className="settings-card-topline">
                <span>Later</span>
                <span className="settings-state-pill">Native</span>
              </span>
              <strong>App Store readiness can still happen</strong>
              <p>This home-screen install path keeps daily use fast while TestFlight and store setup stay optional.</p>
            </article>
          </div>
        </PageSection>
        ) : null}

        {activeSection === "distribution" ? (
        <PageSection
          eyebrow="Distribution"
          title="Share-ready checklist"
          description="Use this before sending EasyLife to friends, TestFlight, or a store review."
        >
          <div id="distribution" className="settings-anchor" />
          <div className="settings-install-status">
            <article>
              <span>Best current path</span>
              <strong>iPhone home-screen install</strong>
              <p>Share the website link, then have testers add it from Safari.</p>
            </article>
            <article>
              <span>App version</span>
              <strong>{APP_VERSION}</strong>
              <p>Use this version in release notes, tester messages, and rollback notes.</p>
            </article>
          </div>

          <div className="settings-data-actions">
            <a className="primary-button" href="/app/settings?section=install">
              Open install guide
            </a>
            <a className="button-secondary" href="/app/settings?section=data">
              Open export tools
            </a>
          </div>

          <div className="settings-review-grid">
            {distributionChecklist.map((item) => (
              <article key={item.title} className="settings-review-card">
                <span className="settings-card-topline">
                  <span>{item.label}</span>
                  <span className="settings-state-pill">{item.status}</span>
                </span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>

          <ol className="settings-install-steps">
            <li>
              <span>1</span>
              <p>Run one final mobile QA pass on iPhone before sharing a link.</p>
            </li>
            <li>
              <span>2</span>
              <p>Send the site link with the Safari Add to Home Screen instructions.</p>
            </li>
            <li>
              <span>3</span>
              <p>Ask testers to check login, tasks, notes, calendar, workout, settings, export, and logout.</p>
            </li>
            <li>
              <span>4</span>
              <p>If a release feels wrong, roll back to the previous stable git commit and rebuild.</p>
            </li>
          </ol>
        </PageSection>
        ) : null}

        {activeSection === "notifications" ? (
        <PageSection
          eyebrow="Reminders"
          title="Notification scheduling"
          description="Allow task, calendar, and daily planning reminders. Workout alerts only happen when the workout lives on the calendar."
        >
          <div id="notifications" className="settings-anchor" />
          {notificationMessage ? <div className="calendar-info-card">{notificationMessage}</div> : null}

          <div className="settings-notification-hero">
            <article>
              <span>Permission</span>
              <strong>{notificationPermission}</strong>
              <p>Browsers and iPhones require permission before EasyLife can send reminders.</p>
            </article>
            <article>
              <span>Reminder categories</span>
              <strong>{settings.notifications.enabled ? "Enabled" : "Paused"}</strong>
              <p>EasyLife schedules local reminders while the app is open or installed, then avoids repeats.</p>
            </article>
          </div>

          <div className="settings-data-actions">
            <button type="button" className="primary-button" onClick={() => void handleRequestNotifications()}>
              Allow notifications
            </button>
            <button type="button" className="button-secondary" onClick={handleSendTestNotification}>
              Send test notification
            </button>
          </div>

          <div className="settings-toggle-list">
            <label className={`settings-toggle-row${settings.notifications.enabled ? " active" : ""}`}>
              <div>
                <span className="settings-card-topline">
                  <span>Master switch</span>
                  <span className="settings-state-pill">{settings.notifications.enabled ? "On" : "Off"}</span>
                </span>
                <strong>Use EasyLife reminders</strong>
                <p>Turns reminder categories on or off without changing your saved category choices.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.enabled}
                onChange={(event) => void updateNotificationSettings({ enabled: event.target.checked })}
              />
            </label>
            <label className={`settings-toggle-row${settings.notifications.taskDeadlines ? " active" : ""}`}>
              <div>
                <span className="settings-card-topline">
                  <span>EasyList</span>
                  <span className="settings-state-pill">Tasks</span>
                </span>
                <strong>Task deadline reminders</strong>
                <p>Remind you when unfinished tasks with due dates or deadlines are coming up.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.taskDeadlines}
                onChange={(event) => void updateNotificationSettings({ taskDeadlines: event.target.checked })}
              />
            </label>
            <label className={`settings-toggle-row${settings.notifications.calendarBlocks ? " active" : ""}`}>
              <div>
                <span className="settings-card-topline">
                  <span>EasyCalendar</span>
                  <span className="settings-state-pill">Blocks</span>
                </span>
                <strong>Calendar work-block reminders</strong>
                <p>Remind you about fixed events and scheduled work blocks, including workouts you put on the calendar.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.calendarBlocks}
                onChange={(event) => void updateNotificationSettings({ calendarBlocks: event.target.checked })}
              />
            </label>
            <label className={`settings-toggle-row${settings.notifications.dailyPlanning ? " active" : ""}`}>
              <div>
                <span className="settings-card-topline">
                  <span>Planning</span>
                  <span className="settings-state-pill">Daily</span>
                </span>
                <strong>Daily planning reminder</strong>
                <p>Use your calendar wake time as the daily planning reminder.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.dailyPlanning}
                onChange={(event) => void updateNotificationSettings({ dailyPlanning: event.target.checked })}
              />
            </label>
          </div>

          <div className="settings-notification-quiet">
            <label className="settings-inline-check">
              <input
                type="checkbox"
                checked={settings.notifications.quietHoursEnabled}
                onChange={(event) => void updateNotificationSettings({ quietHoursEnabled: event.target.checked })}
              />
              Use quiet hours
            </label>
            <label className="field-stack">
              <span>Quiet hours start</span>
              <input
                type="time"
                value={settings.notifications.quietHoursStart}
                onChange={(event) => void updateNotificationSettings({ quietHoursStart: event.target.value })}
              />
            </label>
            <label className="field-stack">
              <span>Quiet hours end</span>
              <input
                type="time"
                value={settings.notifications.quietHoursEnd}
                onChange={(event) => void updateNotificationSettings({ quietHoursEnd: event.target.value })}
              />
            </label>
          </div>
        </PageSection>
        ) : null}

        {activeSection === "assistant" ? (
        <PageSection
          eyebrow="AI Controls"
          title="Assistant foundation"
          description="EasyLife AI stays helpful, review-first, reversible, and scoped to your account."
        >
          <div id="assistant" className="settings-anchor" />
          <div className="settings-notification-hero">
            <article>
              <span>Assistant</span>
              <strong>{settings.assistant.enabled ? "Enabled" : "Paused"}</strong>
              <p>
                {settings.assistant.enabled
                  ? "AI helpers can appear where you have enabled matching preview features."
                  : "AI helpers stay hidden or inactive until you turn the assistant on."}
              </p>
            </article>
            <article>
              <span>Review rule</span>
              <strong>{settings.assistant.requireReviewBeforeSave ? "Required" : "Not required"}</strong>
              <p>Keep this on so AI suggestions become drafts before anything enters your real data.</p>
            </article>
          </div>

          <div className="settings-toggle-list">
            <label className={`settings-toggle-row${settings.assistant.enabled ? " active" : ""}`}>
              <div>
                <span className="settings-card-topline">
                  <span>Master switch</span>
                  <span className="settings-state-pill">{settings.assistant.enabled ? "On" : "Off"}</span>
                </span>
                <strong>Use EasyLife assistant helpers</strong>
                <p>Turns assistant surfaces on or off without changing individual Labs switches.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.assistant.enabled}
                onChange={(event) => void updateAssistantSettings({ enabled: event.target.checked })}
              />
            </label>

            <label className={`settings-toggle-row${settings.assistant.allowDataReview ? " active" : ""}`}>
              <div>
                <span className="settings-card-topline">
                  <span>Context</span>
                  <span className="settings-state-pill">Private</span>
                </span>
                <strong>Allow current data review</strong>
                <p>Allows assistant features to summarize selected EasyLife data from your account.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.assistant.allowDataReview}
                onChange={(event) => void updateAssistantSettings({ allowDataReview: event.target.checked })}
              />
            </label>

            <label className={`settings-toggle-row${settings.assistant.allowCrossAppSuggestions ? " active" : ""}`}>
              <div>
                <span className="settings-card-topline">
                  <span>Routing</span>
                  <span className="settings-state-pill">Suggestions</span>
                </span>
                <strong>Allow cross-app suggestions</strong>
                <p>Lets AI suggest moving a thought into Tasks, Calendar, Projects, Pipeline, or Notes.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.assistant.allowCrossAppSuggestions}
                onChange={(event) => void updateAssistantSettings({ allowCrossAppSuggestions: event.target.checked })}
              />
            </label>

            <label className={`settings-toggle-row${settings.assistant.allowDraftCreation ? " active" : ""}`}>
              <div>
                <span className="settings-card-topline">
                  <span>Drafts</span>
                  <span className="settings-state-pill">Review first</span>
                </span>
                <strong>Allow draft creation</strong>
                <p>Allows AI helpers to prepare draft tasks, project plans, or note actions for review.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.assistant.allowDraftCreation}
                onChange={(event) => void updateAssistantSettings({ allowDraftCreation: event.target.checked })}
              />
            </label>

            <label className={`settings-toggle-row${settings.assistant.requireReviewBeforeSave ? " active" : ""}`}>
              <div>
                <span className="settings-card-topline">
                  <span>Safety</span>
                  <span className="settings-state-pill">Required</span>
                </span>
                <strong>Require review before save</strong>
                <p>AI output should stay editable and reversible before it changes your workspace.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.assistant.requireReviewBeforeSave}
                onChange={(event) => void updateAssistantSettings({ requireReviewBeforeSave: event.target.checked })}
              />
            </label>
          </div>

          <div className="settings-notification-quiet">
            <label className="field-stack">
              <span>If AI is unavailable</span>
              <select
                value={settings.assistant.fallbackMode}
                onChange={(event) =>
                  void updateAssistantSettings({
                    fallbackMode: event.target.value as "quiet" | "explain" | "manual",
                  })
                }
              >
                <option value="explain">Explain and keep manual controls</option>
                <option value="manual">Open the manual workflow</option>
                <option value="quiet">Stay quiet</option>
              </select>
            </label>
          </div>

          <div className="settings-review-grid">
            {assistantBoundaries.map((item) => (
              <article key={item.title} className="settings-review-card">
                <span className="settings-card-topline">
                  <span>{item.label}</span>
                  <span className="settings-state-pill">{item.status}</span>
                </span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </article>
            ))}
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
        <AiCommandCenter />
        <div className="settings-labs-summary">
          <article>
            <span>Recommended first</span>
            <strong>Daily Review, Start Here, Mobile App Sheet</strong>
            <p>Active labs have visible app surfaces today. Coming soon switches are parked until we build them.</p>
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
                          <p className="helper-copy">{feature.recommendation}</p>
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
