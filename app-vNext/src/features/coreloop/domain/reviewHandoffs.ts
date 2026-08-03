import type { ProjectRecord } from "@/lib/firestore/projects";
import type { ProjectSectionRecord } from "@/lib/firestore/projectSections";
import type { ProjectTaskLinkRecord } from "@/lib/firestore/projectTaskLinks";
import type { TaskRecord } from "@/lib/firestore/tasks";

export type ReviewTaskHandoff =
  | { state: "idle" | "loading" | "missing"; task: null }
  | { state: "completed" | "ready"; task: TaskRecord };

export function resolveReviewTaskHandoff(
  taskId: string | null,
  tasks: TaskRecord[],
  isLoading: boolean,
): ReviewTaskHandoff {
  if (!taskId) return { state: "idle", task: null };
  if (isLoading) return { state: "loading", task: null };
  const task = tasks.find((candidate) => candidate.id === taskId && !candidate.deletedAt);
  if (!task) return { state: "missing", task: null };
  return { state: task.completed ? "completed" : "ready", task };
}

export function buildReviewScheduleWindow(input: {
  selectedDate: Date;
  wakeHour: number;
  defaultMinutes: number;
  taskMinutes: number | null;
  firstOpenWindow?: { startAt: Date; endAt: Date } | null;
}) {
  const requestedMinutes = Math.max(15, input.taskMinutes || input.defaultMinutes || 30);
  const fallbackStart = new Date(
    input.selectedDate.getFullYear(),
    input.selectedDate.getMonth(),
    input.selectedDate.getDate(),
    input.wakeHour,
    0,
    0,
    0,
  );
  const startAt = new Date(input.firstOpenWindow?.startAt || fallbackStart);
  const requestedEnd = new Date(startAt.getTime() + requestedMinutes * 60_000);
  const openWindowEnd = input.firstOpenWindow?.endAt;
  const endAt = openWindowEnd && openWindowEnd > startAt && openWindowEnd < requestedEnd
    ? new Date(openWindowEnd)
    : requestedEnd;

  return { startAt, endAt };
}

export function getProjectHandoffChoices(
  projects: ProjectRecord[],
  sections: ProjectSectionRecord[],
) {
  return projects
    .filter((project) => project.status === "active")
    .map((project) => ({
      project,
      sections: sections
        .filter((section) => section.projectId === project.id)
        .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title)),
    }))
    .sort((left, right) => left.project.title.localeCompare(right.project.title) || left.project.id.localeCompare(right.project.id));
}

export function findExistingProjectHandoff(
  taskId: string,
  links: ProjectTaskLinkRecord[],
) {
  return links.find((link) => link.taskId === taskId) || null;
}
