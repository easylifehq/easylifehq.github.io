import type { ApplicationRecord } from "@/lib/firestore/applications";
import type { ProjectRecord } from "@/lib/firestore/projects";
import type { ProjectTaskLinkRecord } from "@/lib/firestore/projectTaskLinks";
import type { TaskRecord } from "@/lib/firestore/tasks";
import type { WorkoutSessionRecord } from "@/lib/firestore/workoutSessions";

export const FOCUSED_REVIEW_FORMULA_VERSION = "easylife-focused-review-v1";

export type FocusedReviewKind = "capture" | "priority" | "project" | "application" | "workout";
export type FocusedReviewItem = {
  id: string;
  kind: FocusedReviewKind;
  sourceId: string;
  title: string;
  detail: string;
  reason: string;
  sourceTo: string;
  taskId: string | null;
  sortDate: string;
};

export type FocusedReviewProgress = {
  version: 1;
  processedIds: string[];
  deferredUntil: Record<string, string>;
  currentId: string | null;
};

export const emptyFocusedReviewProgress: FocusedReviewProgress = {
  version: 1,
  processedIds: [],
  deferredUntil: {},
  currentId: null,
};

const kindOrder: Record<FocusedReviewKind, number> = { capture: 0, priority: 1, project: 2, application: 3, workout: 4 };

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function shiftDateKey(value: string, days: number) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

function taskSource(taskId: string) {
  return `/app/easylist/dashboard?task=${encodeURIComponent(taskId)}`;
}

export function deriveFocusedReviewQueue(input: {
  nowDateKey: string;
  tasks: TaskRecord[];
  projects: ProjectRecord[];
  projectLinks: ProjectTaskLinkRecord[];
  applications: ApplicationRecord[];
  workouts: WorkoutSessionRecord[];
}): FocusedReviewItem[] {
  const activeTasks = input.tasks.filter((task) => !task.completed && !task.deletedAt);
  const projectsWithActiveTasks = new Set(
    input.projectLinks
      .filter((link) => activeTasks.some((task) => task.id === link.taskId))
      .map((link) => link.projectId)
  );
  const items: FocusedReviewItem[] = [];

  activeTasks.forEach((task) => {
    const dueKey = task.dueDate ? localDateKey(task.dueDate) : "";
    const isCapture = ["inbox", "capture", "brain dump"].includes((task.listName || "").trim().toLocaleLowerCase());
    const isOverdue = Boolean(dueKey && dueKey < input.nowDateKey);
    const isUnscheduledPriority = task.priorityTier <= 3 && task.linkedCalendarBlockIds.length === 0;
    if (isCapture) {
      items.push({ id: `capture:${task.id}`, kind: "capture", sourceId: task.id, title: task.title || "Untitled capture", detail: task.notes || "Raw Inbox capture", reason: "Unresolved Inbox capture", sourceTo: taskSource(task.id), taskId: task.id, sortDate: dueKey || "9999-12-31" });
    } else if (isOverdue || isUnscheduledPriority) {
      items.push({ id: `priority:${task.id}`, kind: "priority", sourceId: task.id, title: task.title || "Untitled priority", detail: isOverdue ? `Overdue since ${dueKey}` : "Important and not scheduled", reason: isOverdue ? "Overdue priority" : "Unscheduled priority", sourceTo: taskSource(task.id), taskId: task.id, sortDate: dueKey || "9999-12-31" });
    }
  });

  input.projects
    .filter((project) => project.status === "active" && !projectsWithActiveTasks.has(project.id))
    .forEach((project) => items.push({ id: `project:${project.id}`, kind: "project", sourceId: project.id, title: project.title || "Untitled project", detail: project.targetDate ? `Target ${project.targetDate}` : "No active linked task", reason: "Project needs a next action", sourceTo: `/app/easyprojects/${encodeURIComponent(project.id)}`, taskId: null, sortDate: project.targetDate || "9999-12-31" }));

  input.applications
    .filter((application) => application.status !== "archived" && Boolean(application.nextFollowUp) && application.nextFollowUp <= input.nowDateKey)
    .forEach((application) => items.push({ id: `application:${application.id}`, kind: "application", sourceId: application.id, title: `${application.company} — ${application.title}`, detail: `Follow-up due ${application.nextFollowUp}`, reason: "Application needs follow-up", sourceTo: `/app/easypipeline/dashboard?application=${encodeURIComponent(application.id)}`, taskId: null, sortDate: application.nextFollowUp }));

  const workoutThreshold = shiftDateKey(input.nowDateKey, -7);
  input.workouts
    .filter((session) => session.performedOn <= input.nowDateKey && session.performedOn >= workoutThreshold)
    .sort((left, right) => right.performedOn.localeCompare(left.performedOn) || left.id.localeCompare(right.id))
    .slice(0, 3)
    .forEach((session) => items.push({ id: `workout:${session.id}`, kind: "workout", sourceId: session.id, title: session.routineName || "Workout session", detail: `${session.performedOn}${session.durationMinutes ? ` · ${session.durationMinutes} min` : ""}`, reason: "Completed workout ready to review", sourceTo: `/app/easyworkout/session/${encodeURIComponent(session.id)}`, taskId: null, sortDate: session.performedOn }));

  return items.sort((left, right) => {
    const kindDifference = kindOrder[left.kind] - kindOrder[right.kind];
    if (kindDifference) return kindDifference;
    const dateDifference = left.kind === "workout"
      ? right.sortDate.localeCompare(left.sortDate)
      : left.sortDate.localeCompare(right.sortDate);
    return dateDifference || left.title.localeCompare(right.title) || left.id.localeCompare(right.id);
  });
}

export function getVisibleFocusedReviewItems(items: FocusedReviewItem[], progress: FocusedReviewProgress, nowDateKey: string) {
  const processed = new Set(progress.processedIds);
  return items.filter((item) => !processed.has(item.id) && (!progress.deferredUntil[item.id] || progress.deferredUntil[item.id] <= nowDateKey));
}

export function normalizeFocusedReviewProgress(value: unknown): FocusedReviewProgress {
  if (!value || typeof value !== "object") return emptyFocusedReviewProgress;
  const input = value as Partial<FocusedReviewProgress>;
  const processedIds = Array.isArray(input.processedIds) ? input.processedIds.filter((id): id is string => typeof id === "string") : [];
  const deferredUntil = input.deferredUntil && typeof input.deferredUntil === "object"
    ? Object.fromEntries(Object.entries(input.deferredUntil).filter((entry): entry is [string, string] => typeof entry[1] === "string"))
    : {};
  return { version: 1, processedIds: [...new Set(processedIds)].sort(), deferredUntil, currentId: typeof input.currentId === "string" ? input.currentId : null };
}
