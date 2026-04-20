import type { PriorityTier, TaskDraft, TaskRecord } from "@/lib/firestore/tasks";

export const PRIORITY_TIERS: PriorityTier[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const PRIORITY_LABELS: Record<PriorityTier, string> = {
  1: "Should've been done yesterday",
  2: "Hair on fire",
  3: "Do next",
  4: "Very important",
  5: "Important",
  6: "Normal",
  7: "Soon-ish",
  8: "When there's room",
  9: "Low simmer",
  10: "Nice to have one day",
};

export function getPriorityMeta(priorityTier: number, priorityLabel = "") {
  const tier = normalizePriorityTier(priorityTier);

  return {
    tier,
    label: priorityLabel || PRIORITY_LABELS[tier],
    rank: tier,
  };
}

export function normalizePriorityTier(value: unknown): PriorityTier {
  const tier = Math.round(Number(value));
  if (tier >= 1 && tier <= 10) {
    return tier as PriorityTier;
  }

  return 5;
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

export type PlannerViewMode = "week" | "twoWeeks" | "month";

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

    return getPriorityMeta(a.priorityTier, a.priorityLabel).rank -
      getPriorityMeta(b.priorityTier, b.priorityLabel).rank;
  });
}

function getDayKeyFromDate(date: Date) {
  return toDateInputValue(startOfDay(date));
}

function formatDayName(date: Date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
}

function formatDayDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatMonthTitle(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getPlannerMeta(mode: PlannerViewMode) {
  const today = startOfDay(new Date());

  if (mode === "week") {
    const start = addDays(today, -1);
    const days = Array.from({ length: 8 }, (_, index) => {
      const date = addDays(start, index);
      return {
        key: getDayKeyFromDate(date),
        date,
        dayLabel: formatDayName(date),
        dateLabel: formatDayDate(date),
        isToday: isSameDay(date, today),
        inCurrentMonth: true,
      };
    });

    return {
      heading: "Your next 8 days",
      subtitle: "Yesterday through the next 6 days.",
      days,
      className: "week-view",
    };
  }

  if (mode === "twoWeeks") {
    const days = Array.from({ length: 14 }, (_, index) => {
      const date = addDays(today, index);
      return {
        key: getDayKeyFromDate(date),
        date,
        dayLabel: formatDayName(date),
        dateLabel: formatDayDate(date),
        isToday: isSameDay(date, today),
        inCurrentMonth: true,
      };
    });

    return {
      heading: "Next 2 weeks",
      subtitle: "A wider look at what is coming up.",
      days,
      className: "two-week-view",
    };
  }

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const gridStart = addDays(monthStart, -monthStart.getDay());
  const gridEnd = addDays(monthEnd, 6 - monthEnd.getDay());
  const days = [];

  for (let cursor = new Date(gridStart); cursor <= gridEnd; cursor = addDays(cursor, 1)) {
    days.push({
      key: getDayKeyFromDate(cursor),
      date: new Date(cursor),
      dayLabel: formatDayName(cursor),
      dateLabel: formatDayDate(cursor),
      isToday: isSameDay(cursor, today),
      inCurrentMonth: cursor.getMonth() === today.getMonth(),
    });
  }

  return {
    heading: formatMonthTitle(today),
    subtitle: "Full month view.",
    days,
    className: "month-view",
  };
}

export function groupTasksForPlanner(tasks: TaskRecord[], keys: string[]) {
  const grouped = Object.fromEntries(keys.map((key) => [key, [] as TaskRecord[]]));

  sortActiveTasks(tasks.filter((task) => !task.completed)).forEach((task) => {
    const key = getDayKeyFromDate(getTaskDay(task));
    if (grouped[key]) {
      grouped[key].push(task);
    }
  });

  return grouped;
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

export function getEnergyLabel(completedTodayCount: number) {
  if (completedTodayCount === 0) return "Warmup Mode";
  if (completedTodayCount <= 2) return "Steady Heat";
  if (completedTodayCount <= 4) return "Locked In";
  if (completedTodayCount <= 6) return "Big Motion";
  return "Runway Cleared";
}

export function buildMotivationData(completedTodayCount: number, activeTasks: TaskRecord[]) {
  const completedTodayTasks = activeTasks.filter(isCompletedToday);
  const categories = completedTodayTasks
    .map((task) => task.category.trim())
    .filter(Boolean);

  const counts = categories.reduce<Record<string, number>>((acc, category) => {
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const topCategory =
    Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "No clear favorite";

  if (completedTodayCount === 0) {
    return {
      title: "You are not behind. You are setting the table.",
      body: "Take out one annoying task first. The whole board feels easier once the first thing is gone.",
      bestStreak: "No streak yet",
      topCategory,
      tone: "Warmup Mode",
    };
  }

  if (completedTodayCount <= 2) {
    return {
      title: `Good start - ${completedTodayCount} thing${completedTodayCount === 1 ? "" : "s"} handled.`,
      body: "That kind of cleanup gives your real priorities more breathing room.",
      bestStreak: `${completedTodayCount} task${completedTodayCount === 1 ? "" : "s"} handled today`,
      topCategory,
      tone: "Steady Heat",
    };
  }

  if (completedTodayCount <= 4) {
    return {
      title: `You knocked out ${completedTodayCount} things today.`,
      body: "Less friction, cleaner headspace, and more room for the work that matters.",
      bestStreak: `${completedTodayCount} tasks down`,
      topCategory,
      tone: "Locked In",
    };
  }

  return {
    title: `${completedTodayCount} handled today. Monster behavior.`,
    body: activeTasks.length
      ? "The list is getting bullied in the best way. Finish one more meaningful thing and call it a powerful day."
      : "Board looks clean. Nothing useless is left hanging over your head.",
    bestStreak: `${completedTodayCount} tasks cleared`,
    topCategory,
    tone: "Runway Cleared",
  };
}

export function getEmptyTaskDraft(): TaskDraft {
  return {
    itemKind: "task",
    title: "",
    notes: "",
    category: "",
    estimatedLength: null,
    priorityTier: 3,
    priorityLabel: PRIORITY_LABELS[3],
    dueDate: null,
    linkedCalendarEventId: null,
    linkedNoteId: null,
    recurring: false,
  };
}

export function taskToDraft(task: TaskRecord): TaskDraft {
  return {
    itemKind: task.itemKind,
    title: task.title,
    notes: task.notes,
    category: task.category,
    estimatedLength: task.estimatedLength,
    priorityTier: normalizePriorityTier(task.priorityTier),
    priorityLabel: task.priorityLabel || PRIORITY_LABELS[task.priorityTier],
    dueDate: task.dueDate ? toDateInputValue(task.dueDate) : null,
    linkedCalendarEventId: task.linkedCalendarEventId,
    linkedNoteId: task.linkedNoteId,
    recurring: task.recurring,
  };
}
