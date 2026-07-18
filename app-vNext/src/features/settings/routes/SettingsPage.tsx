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
    label: "Control Light",
    description: "Clean light surfaces, graphite text, and precise blue accents.",
    tone: "Calm",
  },
  {
    value: "candy",
    label: "Candy",
    description: "Playful pink surfaces with bright accents and readable contrast.",
    tone: "Bright",
  },
  {
    value: "gamer",
    label: "Night",
    description: "Dark surfaces with violet and cyan accents for stronger contrast.",
    tone: "Night",
  },
  {
    value: "elvish",
    label: "Forest",
    description: "Deep green surfaces with warm gold accents and steady contrast.",
    tone: "Calm",
  },
  {
    value: "aurora",
    label: "Aurora Night",
    description: "Dark surfaces with mint, ice-blue, and soft rose accents.",
    tone: "Cool dark",
  },
  {
    value: "studio",
    label: "Focus",
    description: "Clean white surfaces, graphite text, and cobalt accents.",
    tone: "Focus",
  },
  {
    value: "sunrise",
    label: "Soft Morning",
    description: "Warm light surfaces with coral, blue, and yellow accents.",
    tone: "Warm",
  },
  {
    value: "midnightGarden",
    label: "Night Garden",
    description: "Deep green-black surfaces with lavender and moonlit blue accents.",
    tone: "Low light",
  },
];

const appVisibilityOptions: Array<{
  id: VisibleAppId;
  label: string;
  description: string;
  home: "Daily" | "Optional";
}> = [
  {
    id: "easylist",
    label: "Inbox",
    description: "Capture, task review, and loose follow-ups.",
    home: "Daily",
  },
  {
    id: "easynotes",
    label: "Notes",
    description: "Saved context, rough thoughts, and writing drafts.",
    home: "Daily",
  },
  {
    id: "easycalendar",
    label: "Plan",
    description: "Today, fixed events, and realistic day blocks.",
    home: "Daily",
  },
  {
    id: "easyworkout",
    label: "Workout",
    description: "Optional training context parked under More.",
    home: "Optional",
  },
  {
    id: "easystatistics",
    label: "Progress",
    description: "Optional trend readout for deeper review.",
    home: "Optional",
  },
  {
    id: "easypipeline",
    label: "Follow-ups",
    description: "Optional applications and longer follow-ups.",
    home: "Optional",
  },
  {
    id: "easycontacts",
    label: "People",
    description: "Optional people and manual place labels. No live location, maps, or geocoding.",
    home: "Optional",
  },
  {
    id: "easyprojects",
    label: "Projects",
    description: "Optional project sections and milestones.",
    home: "Optional",
  },
];

const appVisibilityGroups: Array<{
  id: "Daily" | "Optional";
  title: string;
  description: string;
}> = [
  {
    id: "Daily",
    title: "Assistant path",
    description: "Keep Today, Inbox, Plan, and Notes close to the first screen.",
  },
  {
    id: "Optional",
    title: "Parked in More",
    description: "Keep workout, projects, follow-ups, people, and progress out of the default path until needed.",
  },
];

const experimentalFeatureOptions: Array<{
  id: ExperimentalFeatureId;
  label: string;
  description: string;
  category: "Today" | "Inbox" | "Plan" | "Projects" | "Notes" | "Workout";
  status: "Active" | "Partial" | "Coming soon";
  showsUp: string;
  recommendation: string;
}> = [
  {
    id: "dailyReview",
    label: "Daily Review",
    description: "Adds a compact read on today's load, wins, open time, and follow-ups.",
    category: "Today",
    status: "Active",
    showsUp: "Today",
    recommendation: "Keep if you like Today showing a planning pulse.",
  },
  {
    id: "startHere",
    label: "Next Step",
    description: "Suggests the next surface to open based on tasks, follow-ups, calendar room, and workouts.",
    category: "Today",
    status: "Active",
    showsUp: "Today",
    recommendation: "Keep if you want Today to suggest where to begin.",
  },
  {
    id: "inboxCapture",
    label: "Inbox capture",
    description: "Planned global capture button for saving messy thoughts before choosing where they belong.",
    category: "Inbox",
    status: "Coming soon",
    showsUp: "No active surface yet",
    recommendation: "Leave off until the global capture button is built.",
  },
  {
    id: "smartTaskEntry",
    label: "Smart Task Entry",
    description: "Legacy switch for task parsing work that is now mostly part of the standard Add Tasks flow.",
    category: "Plan",
    status: "Partial",
    showsUp: "Inbox capture",
    recommendation: "Can be retired soon unless we wire a specific smart-entry behavior to it.",
  },
  {
    id: "overdueTriage",
    label: "Overdue Triage",
    description: "Adds a recovery-oriented cleanup panel for overdue tasks instead of only flagging them.",
    category: "Plan",
    status: "Active",
    showsUp: "Inbox review",
    recommendation: "Keep if you want the overdue cleanup panel.",
  },
  {
    id: "projectPlanner",
    label: "Gated Project Planner",
    description: "Review-first project draft lane. Provider-backed planning remains gated and must be approved before use.",
    category: "Projects",
    status: "Active",
    showsUp: "More / Projects",
    recommendation: "Leave off unless you are intentionally testing the approved project draft gate.",
  },
  {
    id: "notesFocusEditor",
    label: "Notes Focus Editor",
    description: "Uses a calmer writing surface with less chrome when editing a note.",
    category: "Notes",
    status: "Active",
    showsUp: "Notes editor",
    recommendation: "Keep if you prefer the calmer note editor shell.",
  },
  {
    id: "notesProcessor",
    label: "Notes Processor",
    description: "Extracts likely tasks from notes for review before anything is created.",
    category: "Notes",
    status: "Active",
    showsUp: "Notes editor",
    recommendation: "Keep if you want note-to-task/project review tools.",
  },
  {
    id: "mobileAppSheet",
    label: "Mobile More Sheet",
    description: "Uses a more intentional mobile More menu with backdrop and sheet behavior.",
    category: "Inbox",
    status: "Active",
    showsUp: "Mobile header",
    recommendation: "Keep for a better phone More menu.",
  },
  {
    id: "gymMode",
    label: "Gym Mode",
    description: "Adds faster workout entry points, larger in-gym controls, and training stat previews.",
    category: "Workout",
    status: "Active",
    showsUp: "More / Workout",
    recommendation: "Promote to a normal workout feature after this pass.",
  },
];

const experimentGroups = ["Today", "Inbox", "Plan", "Projects", "Notes", "Workout"] as const;

type SettingsSectionId =
  | "customize"
  | "trust"
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
    label: "Control Panel",
    eyebrow: "Assistant Controls",
    description: "Tune the theme, opening screen, and first assistant path.",
    group: "basics",
  },
  {
    id: "trust",
    label: "Trust & Privacy",
    eyebrow: "Boundaries",
    description: "What EasyLife can do now, what stays manual, and where your export lives.",
    group: "basics",
  },
  {
    id: "apps",
    label: "More",
    eyebrow: "Assistant Path",
    description: "Choose what stays core and what remains parked under More.",
    group: "basics",
  },
  {
    id: "calendar",
    label: "Plan",
    eyebrow: "Planning",
    description: "Wake-up time, default view, and planning defaults.",
    group: "basics",
  },
  {
    id: "page-settings",
    label: "Surface Tuning",
    eyebrow: "Assistant Defaults",
    description: "Tune how Inbox, Plan, Notes, and optional context open from the assistant.",
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
    label: "Browser Reminders",
    eyebrow: "Local Reminders",
    description: "Control browser reminder permission, categories, quiet hours, and test alerts.",
    group: "basics",
  },
  {
    id: "assistant",
    label: "Assistant",
    eyebrow: "Assistant Controls",
    description: "Set what assistant helpers can review, suggest, draft, and never do automatically.",
    group: "advanced",
  },
  {
    id: "experiments",
    label: "Feature Switches",
    eyebrow: "Experimental",
    description: "Keep experimental assistant helpers explicit and reversible.",
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

const defaultViewOptions: Array<{ value: CalendarDefaultView; label: string }> = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

const startupRouteOptions: Array<{ value: StartupRoute; label: string; description: string }> = [
  { value: "/app/hq", label: "Today", description: "Start with the assistant's daily read." },
  { value: "last-used", label: "Last used screen", description: "Resume where you left off." },
  { value: "/app/easylist/dashboard", label: "Inbox review", description: "Open straight to captured items." },
  { value: "/app/easylist/add", label: "Inbox capture", description: "Start in fast inbox mode." },
  { value: "/app/easycalendar/day", label: "Plan", description: "Start with today hour by hour." },
  { value: "/app/easynotes", label: "Notes", description: "Open saved context." },
  { value: "/app/easynotes/new", label: "Blank note", description: "Start writing immediately." },
  { value: "/app/easyworkout/dashboard", label: "Workout", description: "Open optional training context." },
];

const notesResumeOptions: Array<{ value: NotesResumeBehavior; label: string }> = [
  { value: "last-open-note", label: "Resume last open note" },
  { value: "library", label: "Open notes library" },
];

const routingOptions: Array<{ value: RoutingDefault; label: string }> = [
  { value: "ask", label: "Ask me each time" },
  { value: "projects", label: "Prefer Projects" },
  { value: "pipeline", label: "Prefer Follow-ups" },
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
    description: "Keep the previous stable release available in git so a bad release can be reverted quickly.",
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
    description: "Add these later if home-screen install is not enough for distribution or store review.",
  },
];

const assistantBoundaries: Array<{
  label: string;
  title: string;
  status: "Allowed" | "Review" | "Blocked";
  description: string;
}> = [
  {
    label: "Local help",
    title: "Drafts and suggestions only",
    status: "Allowed",
    description: "Experimental helpers can prepare drafts and suggestions inside EasyLife when you turn them on.",
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
    description: "The assistant does not send messages, edit external calendars, use live location, or make hidden changes for you.",
  },
  {
    label: "Data",
    title: "Scoped to your account",
    status: "Review",
    description: "Assistant review uses selected visible EasyLife context only after you enable it; no background scanning or live AI provider is assumed here.",
  },
  {
    label: "Fallback",
    title: "Manual path stays available",
    status: "Allowed",
    description: "If helper intelligence is unavailable, the app should explain what happened and keep the manual workflow usable.",
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
  { key: "tasks", label: "Tasks", app: "Inbox" },
  { key: "notes", label: "Notes", app: "Notes" },
  { key: "noteFolders", label: "Folders", app: "Notes" },
  { key: "calendarEvents", label: "Events", app: "Plan" },
  { key: "calendarTaskBlocks", label: "Task blocks", app: "Plan" },
  { key: "calendarCategories", label: "Categories", app: "Plan" },
  { key: "workoutExercises", label: "Exercises", app: "Workout" },
  { key: "workoutRoutines", label: "Routines", app: "Workout" },
  { key: "workoutSessions", label: "Sessions", app: "Workout" },
  { key: "projects", label: "Projects", app: "Projects" },
  { key: "projectSections", label: "Sections", app: "Projects" },
  { key: "projectTaskLinks", label: "Task links", app: "Projects" },
  { key: "pipelineApplications", label: "Applications", app: "Follow-ups" },
  { key: "pipelineDrafts", label: "Email drafts", app: "Follow-ups" },
  { key: "contacts", label: "Contacts", app: "People" },
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
  const { user, isDemoMode } = useAuth();
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
  const notificationPermissionDenied = notificationPermission === "denied";
  const notificationPermissionUnsupported = notificationPermission === "unsupported";
  const truePushReadiness =
    notificationPermission === "granted"
      ? "Permission ready"
      : notificationPermission === "denied"
        ? "Blocked"
        : notificationPermission === "unsupported"
          ? "Unsupported"
          : "Needs permission";
  const canSendTestReminder = notificationPermission === "granted" && settings.notifications.enabled;

  useEffect(() => {
    const requestedSection = searchParams.get("section");
    if (settingsSections.some((section) => section.id === requestedSection)) {
      setActiveSection(requestedSection as SettingsSectionId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user || isDemoMode) {
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
  }, [isDemoMode, user]);

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
      setNotificationMessage("Browser reminders are enabled here. Use the category switches below to choose what can remind you.");
      return;
    }

    if (nextPermission === "denied") {
      await updateNotificationSettings({ enabled: false });
      setNotificationMessage("Browser reminders are blocked here. Change this site's browser or iPhone settings, then return to EasyLife.");
      return;
    }

    setNotificationMessage("This browser does not support local web reminders here.");
  }

  function handleSendTestNotification() {
    if (!canSendTestReminder) {
      setNotificationMessage("Allow browser reminders first, then send a local test reminder.");
      return;
    }

    const sent = sendTestNotification();
    setNotificationMessage(
      sent
        ? "Local test reminder sent."
        : "Allow browser reminders first, then try the test again."
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
        <div className="settings-status-grid" aria-label="Current assistant status">
          <article className="settings-status-card">
            <span>Signed in</span>
            <strong>{auth.currentUser?.email || user?.email || "EasyLife account"}</strong>
          </article>
          <article className="settings-status-card">
            <span>Control skin</span>
            <strong>{activeTheme.label}</strong>
          </article>
          <article className="settings-status-card">
            <span>Opens to</span>
            <strong>
              {startupRouteOptions.find((option) => option.value === settings.startupRoute)?.label || "Today"}
            </strong>
          </article>
          <article className="settings-status-card">
            <span>Trust mode</span>
            <strong>Review first</strong>
          </article>
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
          {activeSection === "customize" ? null : (
            <div className="settings-section-heading">
              <p className="eyebrow">{activeSectionConfig.eyebrow}</p>
              <h2>{activeSectionConfig.label}</h2>
            </div>
          )}

      <div className="settings-layout-grid">
        {activeSection === "customize" ? (
        <PageSection
          eyebrow="Control panel"
          title="Assistant controls"
        >
          <div id="customize" className="settings-anchor" />
          <div className="settings-customization-console">
            <div className="settings-theme-overview">
              <div>
                <span className="settings-card-topline">Active control skin</span>
                <strong>{activeTheme.label}</strong>
                <p>{activeTheme.description}</p>
              </div>
              <span className="settings-state-pill">{activeTheme.tone}</span>
            </div>
            <details className="advanced-disclosure">
              <summary>Choose another control skin</summary>
              <p className="helper-copy">
                Pick the mode that feels easiest to read. This only changes color, contrast, and surface tone.
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
          </div>
        </PageSection>
        ) : null}

        {activeSection === "trust" ? (
        <PageSection
          eyebrow="Boundaries"
          title="Trust & Privacy"
          description="EasyLife is an early web app for tasks, notes, planning, and follow-ups."
        >
          <div id="trust" className="settings-anchor" />
          <div className="settings-review-grid">
            <article className="settings-review-card">
              <span className="settings-card-topline">
                <span>Experimental helpers</span>
                <span className="settings-state-pill">Draft only</span>
              </span>
              <strong>No hidden actions</strong>
              <p>
                Experimental features create drafts and suggestions inside EasyLife. They do not send messages,
                edit external calendars, use live location, or make hidden changes for you.
              </p>
            </article>
            <article className="settings-review-card">
              <span className="settings-card-topline">
                <span>Email and texts</span>
                <span className="settings-state-pill">Not connected</span>
              </span>
              <strong>Drafts stay inside EasyLife</strong>
              <p>
                EasyLife can show review-only reply text, but it does not send email, send texts, create outside
                drafts, archive mail, or contact anyone from this demo.
              </p>
            </article>
            <article className="settings-review-card">
              <span className="settings-card-topline">
                <span>Reminders</span>
                <span className="settings-state-pill">Browser only</span>
              </span>
              <strong>Local reminders only</strong>
              <p>
                Reminders use this browser on this device. EasyLife is not running server-delivered push
                delivery, and timing may depend on browser permission and whether EasyLife is open or installed.
              </p>
            </article>
            <article className="settings-review-card">
              <span className="settings-card-topline">
                <span>People places</span>
                <span className="settings-state-pill">Manual</span>
              </span>
              <strong>No live location</strong>
              <p>People can use manual place labels. EasyLife is not using maps, geocoding, or device location.</p>
            </article>
            <article className="settings-review-card">
              <span className="settings-card-topline">
                <span>Contacts</span>
                <span className="settings-state-pill">Manual</span>
              </span>
              <strong>No contact import or sync</strong>
              <p>
                People is not reading your phone contacts, Google Contacts, Apple Contacts, Outlook, address book,
                email, texts, calendar, or social accounts. Future import needs consent, preview, dedupe, field mapping,
                and rollback.
              </p>
            </article>
            <article className="settings-review-card">
              <span className="settings-card-topline">
                <span>Export</span>
                <span className="settings-state-pill">Export first</span>
              </span>
              <strong>Your data is inspectable</strong>
              <p>
                Use Data export to download a JSON snapshot before any account deletion request. EasyLife does not
                have a self-serve delete button or backend deletion action in this demo.
              </p>
            </article>
            <article className="settings-review-card">
              <span className="settings-card-topline">
                <span>Draft recovery</span>
                <span className="settings-state-pill">This browser</span>
              </span>
              <strong>Unsaved drafts are local to this browser</strong>
              <p>
                Inbox, Notes, and Workout can recover unsaved drafts on this device while you keep browser storage.
                Private windows, clearing site data, or switching browsers can remove those unsaved drafts.
              </p>
            </article>
            <article className="settings-review-card">
              <span className="settings-card-topline">
                <span>Legal</span>
                <span className="settings-state-pill">Draft copy</span>
              </span>
              <strong>Privacy Policy and Terms</strong>
              <p>Draft policy labels are visible here until final hosted Privacy and Terms pages are approved.</p>
              <div className="settings-policy-placeholders" aria-label="Legal placeholders">
                <span>Privacy Policy draft</span>
                <span>Terms draft</span>
              </div>
            </article>
          </div>
          <div className="settings-data-actions">
            <button type="button" className="primary-button" onClick={() => setActiveSection("data")}>
              Open export tools
            </button>
            <button type="button" className="button-secondary" onClick={() => setActiveSection("notifications")}>
              Browser reminder settings
            </button>
            <button type="button" className="button-secondary" onClick={() => setActiveSection("assistant")}>
              Assistant review controls
            </button>
          </div>
        </PageSection>
        ) : null}

        {activeSection === "calendar" ? (
        <PageSection
          eyebrow="Planning"
          title="Day setup"
        >
          <div id="calendar" className="settings-anchor" />
          <div className="settings-review-grid">
            <article className="settings-review-card">
              <span className="settings-card-topline">
                <span>External calendar sync</span>
                <span className="settings-state-pill">Not live</span>
              </span>
              <strong>Plan stays inside EasyLife</strong>
              <p>
                EasyLife is not reading from or writing to Google Calendar, Apple Calendar, Outlook, or ICS feeds.
                External calendar sync needs a separately approved consent and review flow.
              </p>
            </article>
            <article className="settings-review-card">
              <span className="settings-card-topline">
                <span>Future sync rule</span>
                <span className="settings-state-pill">Review first</span>
              </span>
              <strong>No hidden calendar writes</strong>
              <p>
                A future sync must preview imported items, name the source of truth, show conflicts, and let you
                approve or roll back changes before anything touches an outside calendar.
              </p>
            </article>
          </div>
          <div className="settings-toggle-list">
            <label className="settings-toggle-row active">
              <div>
                <span className="settings-card-topline">
                  <span>Plan</span>
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
          eyebrow="Assistant defaults"
          title="Surface defaults"
        >
          <div id="page-settings" className="settings-anchor" />

          <aside className="settings-command-note" aria-label="Assistant defaults guidance">
            <div>
              <span className="settings-card-topline">Core control lane</span>
              <strong>Tune Today, Inbox, Plan, and Notes first.</strong>
              <p>
                Optional workout, project, people, progress, and follow-up controls stay lower on the page so the
                assistant path stays focused.
              </p>
            </div>
            <div className="settings-command-tags" aria-label="Covered settings areas">
              <span>Inbox</span>
              <span>Plan</span>
              <span>Route</span>
            </div>
          </aside>

          <div className="settings-app-preference-grid">
            <section className="settings-app-preference-card">
              <div className="panel-header">
                <p className="eyebrow">Inbox</p>
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
                <p className="eyebrow">Notes</p>
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
                  <option value="send-to-list">Send to Inbox</option>
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
                <p className="eyebrow">More / optional</p>
                <h3>Training defaults</h3>
                <p>Keep training setup available without making it part of the first assistant path.</p>
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
                <p className="eyebrow">More / optional</p>
                <h3>Project and follow-up routing</h3>
                <p>Decide how larger work moves only when you choose to use the optional surfaces.</p>
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
          eyebrow="Assistant Path"
          title="More and core surfaces"
          description="Keep Today, Inbox, Plan, and Notes as the default path. Park everything else under More."
        >
          <div id="apps" className="settings-anchor" />
          {isLoading ? <p className="helper-copy">Loading your preferences...</p> : null}

          <div className="settings-app-groups">
            {appVisibilityGroups.map((group) => (
              <section key={group.id} className="settings-app-group">
                <div className="settings-lab-group-header">
                  <div>
                    <span className="eyebrow">{group.id}</span>
                    <strong>{group.title}</strong>
                  </div>
                  <p>{group.description}</p>
                </div>
                <div className="settings-toggle-list settings-app-list">
                  {appVisibilityOptions
                    .filter((app) => app.home === group.id)
                    .map((app) => {
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
              </section>
            ))}
          </div>
        </PageSection>
        ) : null}

        {activeSection === "data" ? (
        <PageSection
          eyebrow="Review"
          title="Data export and health"
          description="Download a portable JSON snapshot, review saved record counts, and use this as the first step before any future deletion request."
        >
          <div id="data" className="settings-anchor" />
          {dataError ? <p className="error-copy">{dataError}</p> : null}
          {dataMessage ? <div className="calendar-info-card">{dataMessage}</div> : null}

          <div className="settings-data-hero">
            <article>
              <span>Total records</span>
              <strong>{dataTotals}</strong>
              <p>Across Inbox, Notes, Plan, Workout, Projects, Follow-ups, People, and Settings.</p>
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
            <button type="button" className="button-secondary" onClick={() => setActiveSection("account")}>
              Account deletion status
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
              <p>Project sections are connected back to Inbox tasks so larger work stays inspectable.</p>
            </article>
            <article className="settings-review-card">
              <span className="settings-card-topline">
                <span>Notes trash</span>
                <span className="settings-state-pill">{softDeletedNoteCount ? "Recoverable" : "Empty"}</span>
              </span>
              <strong>{softDeletedNoteCount} note{softDeletedNoteCount === 1 ? "" : "s"} in trash</strong>
              <p>Deleted notes remain reviewable from Notes trash before permanent removal.</p>
            </article>
            <article className="settings-review-card">
              <span className="settings-card-topline">
                <span>Account deletion</span>
                <span className="settings-state-pill">Not self-serve</span>
              </span>
              <strong>No deletion action runs here</strong>
              <p>
                This screen only exports and summarizes your data. Account deletion needs a separately approved
                backend-safe flow with identity confirmation, export proof, rollback rules, and audit logging.
              </p>
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
          eyebrow="Local reminders"
          title="Browser reminders"
          description="Allow local browser reminders for tasks, Plan blocks, and daily planning. Workout reminders only happen when the workout lives on Plan."
        >
          <div id="notifications" className="settings-anchor" />
          {notificationMessage ? <div className="calendar-info-card">{notificationMessage}</div> : null}
          {notificationPermissionDenied ? (
            <div className="calendar-info-card">
              Browser reminders are denied for this site. Open browser or iPhone site settings, allow local browser reminders
              for EasyLife, then come back and try again.
            </div>
          ) : null}
          {notificationPermissionUnsupported ? (
            <div className="calendar-info-card">
              This browser does not support local web reminders here. EasyLife still works normally; use Today and Plan as
              the source of truth until reminders are available on this device.
            </div>
          ) : null}

          <div className="settings-notification-hero">
            <article>
              <span>Permission</span>
              <strong>{notificationPermission}</strong>
              <p>Browsers and iPhones require permission before EasyLife can show local reminders.</p>
            </article>
            <article>
              <span>Reminder categories</span>
              <strong>{settings.notifications.enabled ? "Enabled" : "Paused"}</strong>
              <p>EasyLife uses local browser reminders on this device. This is not server-delivered push.</p>
            </article>
          </div>

          <div className="settings-review-grid">
            <article className="settings-review-card">
              <span className="settings-card-topline">
                <span>True push</span>
                <span className="settings-state-pill">Not live</span>
              </span>
              <strong>Server push is gated</strong>
              <p>
                EasyLife is not storing push tokens, sending server push, or scheduling automatic reminder jobs.
                True push needs a separately approved test with one synthetic message and a kill switch.
              </p>
            </article>
            <article className="settings-review-card">
              <span className="settings-card-topline">
                <span>First allowed test</span>
                <span className="settings-state-pill">Manual only</span>
              </span>
              <strong>No real content in the first push</strong>
              <p>
                The future first test should say only that push is connected. It must not include task, note, Plan,
                Workout, People, AI, or private reminder content.
              </p>
            </article>
            <article className="settings-review-card">
              <span className="settings-card-topline">
                <span>Device registration</span>
                <span className="settings-state-pill">Disabled</span>
              </span>
              <strong>No push token is requested or stored</strong>
              <p>
                This screen does not call Firebase Messaging, ask for a push token, save a device record, or expose
                push credentials. A future token record needs separate approval and a visible remove-this-device path.
              </p>
            </article>
            <article className="settings-review-card">
              <span className="settings-card-topline">
                <span>True push readiness</span>
                <span className="settings-state-pill">{truePushReadiness}</span>
              </span>
              <strong>Permission stays user-initiated</strong>
              <p>
                Local browser reminder permission can only be requested from the button below. True push registration
                remains locked until a later exact deploy/test approval.
              </p>
            </article>
          </div>

          <div className="settings-data-actions">
            <button type="button" className="primary-button" onClick={() => void handleRequestNotifications()}>
              Allow browser reminders
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={handleSendTestNotification}
              disabled={!canSendTestReminder}
              title={canSendTestReminder ? "Send a local test reminder." : "Allow browser reminders before testing."}
            >
              Send test reminder
            </button>
            <button type="button" className="button-secondary" disabled title="Requires separate P4 token-registration approval.">
              Register push device
            </button>
            <button type="button" className="button-secondary" disabled title="Requires the later one synthetic push test gate.">
              Send synthetic push
            </button>
          </div>

          <div className="settings-toggle-list">
            <label className={`settings-toggle-row${settings.notifications.enabled ? " active" : ""}`}>
              <div>
                <span className="settings-card-topline">
                  <span>Reminder control</span>
                  <span className="settings-state-pill">{settings.notifications.enabled ? "On" : "Off"}</span>
                </span>
                <strong>Use browser reminders</strong>
                <p>Turns local reminder categories on or off without changing your saved category choices.</p>
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
                  <span>Inbox</span>
                  <span className="settings-state-pill">Tasks</span>
                </span>
                <strong>Task deadline browser reminders</strong>
                <p>Show a local browser reminder when unfinished tasks with due dates or deadlines are coming up.</p>
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
                  <span>Plan</span>
                  <span className="settings-state-pill">Blocks</span>
                </span>
                <strong>Plan block browser reminders</strong>
                <p>Show local reminders for fixed events and scheduled work blocks, including workouts you put on Plan.</p>
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
                <strong>Daily planning browser reminder</strong>
                <p>Use your wake time as the local daily planning reminder.</p>
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
          eyebrow="Assistant controls"
          title="Assistant foundation"
          description="Assistant helpers are local, review-first controls for drafts and suggestions. No live AI provider is assumed here."
        >
          <div id="assistant" className="settings-anchor" />
          <div className="settings-notification-hero">
            <article>
              <span>Assistant</span>
              <strong>{settings.assistant.enabled ? "Enabled" : "Paused"}</strong>
              <p>
                {settings.assistant.enabled
                  ? "Assistant helpers can appear only where you have enabled matching review-first surfaces."
                  : "Assistant helpers stay hidden or inactive until you turn the assistant on."}
              </p>
            </article>
            <article>
              <span>Review rule</span>
              <strong>{settings.assistant.requireReviewBeforeSave ? "Required" : "Not required"}</strong>
              <p>Keep this on so assistant suggestions remain drafts before anything changes in your workspace.</p>
            </article>
          </div>

          <article className="settings-review-card settings-defaults-card">
            <span className="settings-card-topline">
              <span>New user defaults</span>
              <span className="settings-state-pill">Off</span>
            </span>
            <strong>Helper features start disabled</strong>
            <p>
              New accounts start with assistant helpers, visible EasyLife review, cross-surface suggestions, draft
              creation, and experimental switches off. Turn them on here only when you want review-first helper surfaces.
            </p>
          </article>

          <article className="settings-review-card settings-defaults-card">
            <span className="settings-card-topline">
              <span>AI provider</span>
              <span className="settings-state-pill">Not live</span>
            </span>
            <strong>Provider calls stay gated</strong>
            <p>
              EasyLife's first provider lane is limited to one future synthetic Inbox test after separate approval.
              This Settings screen does not turn on live AI, store provider keys, run model calls, or save provider output.
            </p>
          </article>

          <div className="settings-toggle-list">
            <label className={`settings-toggle-row${settings.assistant.enabled ? " active" : ""}`}>
              <div>
                <span className="settings-card-topline">
                  <span>Assistant control</span>
                  <span className="settings-state-pill">{settings.assistant.enabled ? "On" : "Off"}</span>
                </span>
                <strong>Use EasyLife assistant helpers</strong>
                <p>Turns assistant helper surfaces on or off without calling a live AI provider.</p>
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
                <strong>Allow visible EasyLife review</strong>
                <p>Allows enabled helper features to summarize selected visible EasyLife data only after you open a review surface. No background scanning.</p>
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
                <strong>Allow cross-surface suggestions</strong>
                <p>Lets helper features suggest where a thought you typed could go. Nothing scans, moves, saves, sends, or syncs until you choose it.</p>
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
                <p>
                  Allows helper features to prepare draft tasks, project plans, notes, or reply text for your review.
                  Drafts are not sent, synced, archived, or created in outside apps.
                </p>
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
                <p>Assistant output should stay editable and reversible before it changes your workspace.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.assistant.requireReviewBeforeSave}
                disabled={settings.assistant.requireReviewBeforeSave}
                onChange={(event) => {
                  if (event.target.checked) {
                    void updateAssistantSettings({ requireReviewBeforeSave: true });
                  }
                }}
              />
            </label>
          </div>

          <div className="settings-notification-quiet">
            <label className="field-stack">
              <span>If assistant help is unavailable</span>
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
        eyebrow="Feature switches"
          title="Assistant experiments"
      >
        <div id="experiments" className="settings-anchor" />
        <AiCommandCenter />
        <div className="settings-labs-summary">
          <article>
            <span>Recommended first</span>
            <strong>Daily Review, Next Step, Mobile More Sheet</strong>
            <p>Active labs have visible assistant surfaces today. Coming soon switches are parked until we build them.</p>
          </article>
          <article>
            <span>Easy to undo</span>
            <strong>Every lab has its own switch</strong>
            <p>Turn a feature off here and its UI disappears from the assistant.</p>
          </article>
          <article>
            <span>Default state</span>
            <strong>Every experiment starts off</strong>
            <p>Saved settings or demo QA can enable switches later, but a new user starts with no experimental helpers on.</p>
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
            <strong>Current browser</strong>
            <p>This is the only sign-out control in Settings.</p>
            <button type="button" className="button-secondary compact-button" onClick={() => void auth.signOut()}>
              Log out
            </button>
          </article>
          <article className="mini-panel-vnext">
            <span>Account deletion</span>
            <strong>Not self-serve yet</strong>
            <p>
              Export first from Data. No delete button or backend deletion action runs here; full deletion needs a
              separately approved backend-safe flow.
            </p>
            <button type="button" className="button-secondary compact-button" onClick={() => setActiveSection("data")}>
              Open export tools
            </button>
          </article>
        </div>
        <div className="settings-review-grid">
          <article className="settings-review-card">
            <span className="settings-card-topline">
              <span>Deletion gate</span>
              <span className="settings-state-pill">Blocked</span>
            </span>
            <strong>Backend approval required</strong>
            <p>
              A real deletion flow would need identity re-check, export confirmation, exact collection scope,
              recoverability rules, and proof that auth and stored records are removed together.
            </p>
          </article>
          <article className="settings-review-card">
            <span className="settings-card-topline">
              <span>Current safe action</span>
              <span className="settings-state-pill">Export</span>
            </span>
            <strong>Download before requesting deletion</strong>
            <p>
              The available path is review, download, and copy a data summary. EasyLife will not silently delete,
              archive, or hide saved data from this screen.
            </p>
          </article>
        </div>
      </PageSection>
      ) : null}
        </div>
      </section>
    </main>
  );
}
