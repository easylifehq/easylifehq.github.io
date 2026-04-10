import type { TaskDraft, TaskRecord } from "@/lib/firestore/tasks";

const PRIORITY_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Gentle Goose",
  2: "Bright Bunny",
  3: "Golden Gator",
  4: "Power Panda",
  5: "Alpha Alligator",
};

export function getPriorityMeta(priorityTier: number, priorityLabel = "") {
  const tier = (Number(priorityTier) || 3) as 1 | 2 | 3 | 4 | 5;

  return {
    tier,
    label: priorityLabel || PRIORITY_LABELS[tier],
    rank: tier,
  };
}

export function startOfDay(dateInput = new Date()) {
  const date = new Date(dateInput);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function addDays(dateInput: Date, amount: number) {
  const next = new Date(dateInput);
  next.setDate(next.getDate() + amount);
  return next;
}

export function isSameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false;

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatDate(date: Date | null, short = false) {
  if (!date) return "No date";

  return new Intl.DateTimeFormat("en-US", short
    ? { month: "short", day: "numeric" }
    : { month: "long", day: "numeric", year: "numeric" }).format(date);
}

export function formatTime(date: Date | null) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function toDateInputValue(date: Date | null) {
  if (!date) return "";

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getTaskDay(task: TaskRecord) {
  return task.dueDate ?? new Date();
}

export function isCompletedToday(task: TaskRecord) {
  return Boolean(task.completed) && isSameDay(task.completedAt, new Date());
}

export function isOverdue(task: TaskRecord) {
  if (task.completed || !task.dueDate) return false;
  return startOfDay(task.dueDate) < startOfDay(new Date());
}

export function isDueToday(task: TaskRecord) {
  return !task.completed && isSameDay(task.dueDate, new Date());
}

export function isDueTomorrow(task: TaskRecord) {
  return !task.completed && isSameDay(task.dueDate, addDays(startOfDay(new Date()), 1));
}

export function sortActiveTasks(tasks: TaskRecord[]) {
  return [...tasks].sort((a, b) => {
    const aOverdue = Number(isOverdue(a));
    const bOverdue = Number(isOverdue(b));
    if (aOverdue !== bOverdue) return bOverdue - aOverdue;

    const aDue = getTaskDay(a).getTime();
    const bDue = getTaskDay(b).getTime();
    if (aDue !== bDue) return aDue - bDue;

    return getPriorityMeta(b.priorityTier, b.priorityLabel).rank -
      getPriorityMeta(a.priorityTier, a.priorityLabel).rank;
  });
}

export function buildWeekLabel(date: Date | null) {
  if (!date) return "Unknown week";

  const start = startOfDay(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);

  return `Week of ${formatDate(start)}`;
}

export function groupCompletedTasksByWeek(tasks: TaskRecord[]) {
  const groups = new Map<string, { label: string; tasks: TaskRecord[]; sortKey: number }>();

  tasks.forEach((task) => {
    if (!task.completedAt) return;

    const completed = startOfDay(task.completedAt);
    const day = completed.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    completed.setDate(completed.getDate() + diff);

    const key = toDateInputValue(completed);
    const label = buildWeekLabel(completed);

    if (!groups.has(key)) {
      groups.set(key, {
        label,
        tasks: [],
        sortKey: completed.getTime(),
      });
    }

    groups.get(key)?.tasks.push(task);
  });

  return [...groups.entries()]
    .map(([key, value]) => ({
      key,
      label: value.label,
      tasks: [...value.tasks].sort(
        (a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0)
      ),
      sortKey: value.sortKey,
    }))
    .sort((a, b) => b.sortKey - a.sortKey);
}

export function getEmptyTaskDraft(): TaskDraft {
  return {
    title: "",
    notes: "",
    category: "",
    estimatedLength: null,
    priorityTier: 3,
    priorityLabel: PRIORITY_LABELS[3],
    dueDate: null,
    recurring: false,
  };
}

export function taskToDraft(task: TaskRecord): TaskDraft {
  return {
    title: task.title,
    notes: task.notes,
    category: task.category,
    estimatedLength: task.estimatedLength,
    priorityTier: task.priorityTier,
    priorityLabel: task.priorityLabel || PRIORITY_LABELS[task.priorityTier],
    dueDate: task.dueDate ? toDateInputValue(task.dueDate) : null,
    recurring: task.recurring,
  };
}
