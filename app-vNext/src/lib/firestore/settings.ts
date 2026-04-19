import { doc, onSnapshot, serverTimestamp, setDoc, type DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export type ThemeMode =
  | "classic"
  | "candy"
  | "gamer"
  | "elvish"
  | "aurora"
  | "studio"
  | "sunrise"
  | "midnightGarden";
export type VisibleAppId =
  | "easylist"
  | "easynotes"
  | "easycalendar"
  | "easypipeline"
  | "easycontacts"
  | "easyprojects"
  | "easyworkout"
  | "easystatistics";

export type ExperimentalFeatureId =
  | "smartTaskEntry"
  | "notesFocusEditor"
  | "mobileAppSheet"
  | "dailyReview"
  | "inboxCapture"
  | "overdueTriage"
  | "notesProcessor"
  | "startHere"
  | "projectPlanner"
  | "gymMode";

export type CalendarDefaultView = "day" | "week" | "month";
export type NotesResumeBehavior = "last-open-note" | "library";
export type RoutingDefault = "ask" | "projects" | "pipeline" | "stay";

export type EasyListSettings = {
  defaultPriorityTier: number;
  quickAddRows: number;
  showCompletedMotion: boolean;
};

export type EasyNotesSettings = {
  resumeBehavior: NotesResumeBehavior;
  cleanupUntitledNotes: boolean;
  noteToTaskDefault: "review" | "send-to-list";
};

export type EasyWorkoutSettings = {
  focusedExerciseCount: number;
  defaultSetCount: number;
  showLastTimeHelper: boolean;
};

export type EasyCalendarSettings = {
  defaultView: CalendarDefaultView;
  defaultTaskBlockMinutes: number;
  planMyDayWindowHours: number;
};

export type RoutingSettings = {
  projectRoutingDefault: RoutingDefault;
  pipelineRoutingDefault: RoutingDefault;
  preserveSourceContext: boolean;
};

export type UserShellSettings = {
  themeMode: ThemeMode;
  visibleApps: VisibleAppId[];
  experimentalFeatures: ExperimentalFeatureId[];
  calendarWakeTime: string;
  easyList: EasyListSettings;
  easyNotes: EasyNotesSettings;
  easyWorkout: EasyWorkoutSettings;
  easyCalendar: EasyCalendarSettings;
  routing: RoutingSettings;
};

export const defaultShellSettings: UserShellSettings = {
  themeMode: "classic",
  visibleApps: [
    "easylist",
    "easynotes",
    "easycalendar",
    "easyworkout",
    "easystatistics",
  ],
  experimentalFeatures: [],
  calendarWakeTime: "08:00",
  easyList: {
    defaultPriorityTier: 5,
    quickAddRows: 3,
    showCompletedMotion: true,
  },
  easyNotes: {
    resumeBehavior: "last-open-note",
    cleanupUntitledNotes: true,
    noteToTaskDefault: "review",
  },
  easyWorkout: {
    focusedExerciseCount: 6,
    defaultSetCount: 3,
    showLastTimeHelper: true,
  },
  easyCalendar: {
    defaultView: "day",
    defaultTaskBlockMinutes: 30,
    planMyDayWindowHours: 16,
  },
  routing: {
    projectRoutingDefault: "ask",
    pipelineRoutingDefault: "ask",
    preserveSourceContext: true,
  },
};

const validVisibleApps: VisibleAppId[] = [
  "easylist",
  "easynotes",
  "easycalendar",
  "easypipeline",
  "easycontacts",
  "easyprojects",
  "easyworkout",
  "easystatistics",
];

const validExperimentalFeatures: ExperimentalFeatureId[] = [
  "smartTaskEntry",
  "notesFocusEditor",
  "mobileAppSheet",
  "dailyReview",
  "inboxCapture",
  "overdueTriage",
  "notesProcessor",
  "startHere",
  "projectPlanner",
  "gymMode",
];

function normalizeVisibleApps(value: unknown): VisibleAppId[] {
  if (!Array.isArray(value)) {
    return defaultShellSettings.visibleApps;
  }

  const filtered = value.filter((entry): entry is VisibleAppId =>
    validVisibleApps.includes(entry as VisibleAppId)
  );

  return filtered.length ? filtered : defaultShellSettings.visibleApps;
}

function normalizeExperimentalFeatures(value: unknown): ExperimentalFeatureId[] {
  if (!Array.isArray(value)) {
    return defaultShellSettings.experimentalFeatures;
  }

  return value.filter((entry): entry is ExperimentalFeatureId =>
    validExperimentalFeatures.includes(entry as ExperimentalFeatureId)
  );
}

function normalizeThemeMode(value: unknown): ThemeMode {
  if (value === "kirby") {
    return "candy";
  }

  const valid: ThemeMode[] = [
    "classic",
    "candy",
    "gamer",
    "elvish",
    "aurora",
    "studio",
    "sunrise",
    "midnightGarden",
  ];
  return valid.includes(value as ThemeMode) ? (value as ThemeMode) : "classic";
}

function normalizeTimeInput(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  return /^\d{2}:\d{2}$/.test(value) ? value : fallback;
}

function normalizeNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function normalizeBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeStringUnion<T extends string>(value: unknown, valid: T[], fallback: T): T {
  return valid.includes(value as T) ? (value as T) : fallback;
}

export function getShellSettingsDoc(userId: string) {
  return doc(db, "users", userId, "appPreferences", "shell");
}

export function normalizeShellSettings(data: DocumentData | undefined): UserShellSettings {
  const easyListData = data?.easyList || {};
  const easyNotesData = data?.easyNotes || {};
  const easyWorkoutData = data?.easyWorkout || {};
  const easyCalendarData = data?.easyCalendar || {};
  const routingData = data?.routing || {};

  return {
    themeMode: normalizeThemeMode(data?.themeMode),
    visibleApps: normalizeVisibleApps(data?.visibleApps),
    experimentalFeatures: normalizeExperimentalFeatures(data?.experimentalFeatures),
    calendarWakeTime: normalizeTimeInput(data?.calendarWakeTime, defaultShellSettings.calendarWakeTime),
    easyList: {
      defaultPriorityTier: normalizeNumber(
        easyListData.defaultPriorityTier,
        defaultShellSettings.easyList.defaultPriorityTier,
        1,
        10
      ),
      quickAddRows: normalizeNumber(easyListData.quickAddRows, defaultShellSettings.easyList.quickAddRows, 1, 8),
      showCompletedMotion: normalizeBoolean(
        easyListData.showCompletedMotion,
        defaultShellSettings.easyList.showCompletedMotion
      ),
    },
    easyNotes: {
      resumeBehavior: normalizeStringUnion<NotesResumeBehavior>(
        easyNotesData.resumeBehavior,
        ["last-open-note", "library"],
        defaultShellSettings.easyNotes.resumeBehavior
      ),
      cleanupUntitledNotes: normalizeBoolean(
        easyNotesData.cleanupUntitledNotes,
        defaultShellSettings.easyNotes.cleanupUntitledNotes
      ),
      noteToTaskDefault: normalizeStringUnion(
        easyNotesData.noteToTaskDefault,
        ["review", "send-to-list"],
        defaultShellSettings.easyNotes.noteToTaskDefault
      ),
    },
    easyWorkout: {
      focusedExerciseCount: normalizeNumber(
        easyWorkoutData.focusedExerciseCount,
        defaultShellSettings.easyWorkout.focusedExerciseCount,
        1,
        10
      ),
      defaultSetCount: normalizeNumber(
        easyWorkoutData.defaultSetCount,
        defaultShellSettings.easyWorkout.defaultSetCount,
        1,
        8
      ),
      showLastTimeHelper: normalizeBoolean(
        easyWorkoutData.showLastTimeHelper,
        defaultShellSettings.easyWorkout.showLastTimeHelper
      ),
    },
    easyCalendar: {
      defaultView: normalizeStringUnion<CalendarDefaultView>(
        easyCalendarData.defaultView,
        ["day", "week", "month"],
        defaultShellSettings.easyCalendar.defaultView
      ),
      defaultTaskBlockMinutes: normalizeNumber(
        easyCalendarData.defaultTaskBlockMinutes,
        defaultShellSettings.easyCalendar.defaultTaskBlockMinutes,
        5,
        240
      ),
      planMyDayWindowHours: normalizeNumber(
        easyCalendarData.planMyDayWindowHours,
        defaultShellSettings.easyCalendar.planMyDayWindowHours,
        6,
        18
      ),
    },
    routing: {
      projectRoutingDefault: normalizeStringUnion<RoutingDefault>(
        routingData.projectRoutingDefault,
        ["ask", "projects", "pipeline", "stay"],
        defaultShellSettings.routing.projectRoutingDefault
      ),
      pipelineRoutingDefault: normalizeStringUnion<RoutingDefault>(
        routingData.pipelineRoutingDefault,
        ["ask", "projects", "pipeline", "stay"],
        defaultShellSettings.routing.pipelineRoutingDefault
      ),
      preserveSourceContext: normalizeBoolean(
        routingData.preserveSourceContext,
        defaultShellSettings.routing.preserveSourceContext
      ),
    },
  };
}

export function subscribeToShellSettings(
  userId: string,
  callback: (settings: UserShellSettings) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    getShellSettingsDoc(userId),
    (snapshot) => {
      callback(normalizeShellSettings(snapshot.data()));
    },
    (error) => {
      onError?.(error);
    }
  );
}

export async function saveShellSettings(userId: string, settings: UserShellSettings) {
  await setDoc(
    getShellSettingsDoc(userId),
    {
      themeMode: settings.themeMode,
      visibleApps: settings.visibleApps,
      experimentalFeatures: settings.experimentalFeatures,
      calendarWakeTime: settings.calendarWakeTime,
      easyList: settings.easyList,
      easyNotes: settings.easyNotes,
      easyWorkout: settings.easyWorkout,
      easyCalendar: settings.easyCalendar,
      routing: settings.routing,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
