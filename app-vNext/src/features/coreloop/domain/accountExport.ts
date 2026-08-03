export const ACCOUNT_EXPORT_SCHEMA_VERSION = "easylife-account-export-v2";
export const ACCOUNT_EXPORT_FORMULA_VERSION = "easylife-portability-v1";

export type AccountDataCollections = {
  tasks: unknown[];
  notes: unknown[];
  noteFolders: unknown[];
  calendarEvents: unknown[];
  calendarTaskBlocks: unknown[];
  calendarCategories: unknown[];
  workoutExercises: unknown[];
  workoutRoutines: unknown[];
  workoutSessions: unknown[];
  workoutGoals: unknown[];
  projects: unknown[];
  projectSections: unknown[];
  projectTaskLinks: unknown[];
  pipelineApplications: unknown[];
  pipelineDrafts: unknown[];
  contacts: unknown[];
};

export const emptyAccountDataCollections: AccountDataCollections = {
  tasks: [], notes: [], noteFolders: [], calendarEvents: [], calendarTaskBlocks: [], calendarCategories: [],
  workoutExercises: [], workoutRoutines: [], workoutSessions: [], workoutGoals: [], projects: [], projectSections: [],
  projectTaskLinks: [], pipelineApplications: [], pipelineDrafts: [], contacts: [],
};

export const accountExportGroups: Array<{ key: keyof AccountDataCollections; label: string; app: string; csv: boolean }> = [
  { key: "tasks", label: "Tasks", app: "Inbox", csv: true },
  { key: "notes", label: "Notes", app: "Notes", csv: true },
  { key: "noteFolders", label: "Folders", app: "Notes", csv: false },
  { key: "calendarEvents", label: "Events", app: "Plan", csv: true },
  { key: "calendarTaskBlocks", label: "Task blocks", app: "Plan", csv: true },
  { key: "calendarCategories", label: "Categories", app: "Plan", csv: false },
  { key: "workoutExercises", label: "Exercises", app: "Workout", csv: false },
  { key: "workoutRoutines", label: "Routines", app: "Workout", csv: false },
  { key: "workoutSessions", label: "Sessions", app: "Workout", csv: true },
  { key: "workoutGoals", label: "Goals", app: "Workout", csv: true },
  { key: "projects", label: "Projects", app: "Projects", csv: true },
  { key: "projectSections", label: "Sections", app: "Projects", csv: false },
  { key: "projectTaskLinks", label: "Task links", app: "Projects", csv: false },
  { key: "pipelineApplications", label: "Applications", app: "Job applications", csv: true },
  { key: "pipelineDrafts", label: "Email drafts", app: "Job applications", csv: false },
  { key: "contacts", label: "Contacts", app: "People", csv: true },
];

const forbiddenKeys = /^(uid|ownerId|clientDraftId|apiKey|authDomain|storageBucket|messagingSenderId|appId|measurementId|password|passwordHash|accessToken|refreshToken|credential|secret)$/i;

function cleanForExport(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(cleanForExport);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !forbiddenKeys.test(key))
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, cleanForExport(entry)])
    );
  }
  return value;
}

function recordId(value: unknown) {
  return value && typeof value === "object" && "id" in value ? String(value.id) : "";
}

export function buildAccountExport(input: {
  collections: AccountDataCollections;
  settings: unknown;
  exportedAt: string;
  timeZone: string;
  weightUnit: "lb" | "kg";
  appVersion: string;
}) {
  const collections = Object.fromEntries(
    accountExportGroups.map((group) => [
      group.key,
      [...input.collections[group.key]].sort((left, right) => recordId(left).localeCompare(recordId(right))).map(cleanForExport),
    ])
  );
  return {
    schemaVersion: ACCOUNT_EXPORT_SCHEMA_VERSION,
    formulaVersion: ACCOUNT_EXPORT_FORMULA_VERSION,
    exportedAt: input.exportedAt,
    metadata: { appVersion: input.appVersion, timeZone: input.timeZone, weightUnit: input.weightUnit },
    manifest: {
      compatibleWith: ["easylife-account-export-v1"],
      included: accountExportGroups.map((group) => ({ domain: group.key, label: `${group.app} — ${group.label}`, recordCount: input.collections[group.key].length })),
      unsupported: [
        "Authentication credentials and session tokens",
        "Firebase configuration and service credentials",
        "Device-specific transient drafts and browser caches",
        "Notification delivery history",
      ],
      identifierPolicy: "Stable record IDs are retained only where needed to preserve links between exported user records; account UID and transient client draft IDs are excluded.",
    },
    settings: cleanForExport(input.settings),
    collections,
  };
}

export function serializeAccountExport(payload: ReturnType<typeof buildAccountExport>) {
  return `${JSON.stringify(payload, null, 2)}\n`;
}

export function protectSpreadsheetCell(value: unknown) {
  const serialized = value == null ? "" : value instanceof Date ? value.toISOString() : typeof value === "object" ? JSON.stringify(cleanForExport(value)) : String(value);
  return /^\s*[=+\-@]/.test(serialized) ? `'${serialized}` : serialized;
}

function csvCell(value: unknown) {
  return `"${protectSpreadsheetCell(value).replace(/"/g, '""')}"`;
}

const csvColumns: Partial<Record<keyof AccountDataCollections, string[]>> = {
  tasks: ["id", "title", "notes", "listName", "category", "priorityTier", "dueDate", "completed", "createdAt", "updatedAt"],
  notes: ["id", "title", "bodyText", "tags", "folderId", "pinned", "createdAt", "updatedAt", "deletedAt"],
  calendarEvents: ["id", "title", "description", "startAt", "endAt", "allDay", "eventType", "linkedTaskId"],
  calendarTaskBlocks: ["id", "taskId", "titleSnapshot", "startAt", "endAt", "planningState", "completed"],
  workoutSessions: ["id", "routineId", "routineName", "performedOn", "weightUnit", "durationMinutes", "notes", "exercises", "createdAt", "updatedAt"],
  workoutGoals: ["id", "schemaVersion", "formulaVersion", "goalType", "status", "target", "sourceUnit", "exerciseId", "exerciseName", "createdAt", "updatedAt", "archivedAt"],
  projects: ["id", "title", "description", "targetDate", "status", "createdAt", "updatedAt"],
  pipelineApplications: ["id", "company", "title", "status", "priority", "dateApplied", "nextFollowUp", "location", "link", "notes", "contactName", "contactEmail"],
  contacts: ["id", "fullName", "relationship", "company", "role", "email", "phone", "status", "lastContactedAt", "nextFollowUpAt", "notes"],
};

export function serializeDomainCsv(key: keyof AccountDataCollections, records: unknown[]) {
  const columns = csvColumns[key];
  if (!columns) throw new Error(`${key} does not have a CSV contract.`);
  const rows = [...records].sort((left, right) => recordId(left).localeCompare(recordId(right)));
  return [
    columns.map(csvCell).join(","),
    ...rows.map((record) => columns.map((column) => csvCell(record && typeof record === "object" ? (record as Record<string, unknown>)[column] : "")).join(",")),
  ].join("\r\n") + "\r\n";
}
