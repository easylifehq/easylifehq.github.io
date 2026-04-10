// js/utils.js

const PRIORITY_CONFIG = {
  1: { label: "Gentle Goose", shortLabel: "Gentle", rank: 1, energy: 1 },
  2: { label: "Bright Bunny", shortLabel: "Bright", rank: 2, energy: 2 },
  3: { label: "Golden Gator", shortLabel: "Golden", rank: 3, energy: 3 },
  4: { label: "Power Panda", shortLabel: "Power", rank: 4, energy: 4 },
  5: { label: "Alpha Alligator", shortLabel: "Alpha", rank: 5, energy: 5 },
};

export function getPriorityMeta(priorityTier, priorityLabel = "") {
  const numericTier = Number(priorityTier) || 1;
  const fallback = PRIORITY_CONFIG[numericTier] || PRIORITY_CONFIG[1];

  return {
    tier: numericTier,
    label: priorityLabel || fallback.label,
    shortLabel: fallback.shortLabel,
    rank: fallback.rank,
    energy: fallback.energy,
  };
}

export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === "function") return value.toDate();

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function startOfDay(dateInput = new Date()) {
  const date = toDate(dateInput) || new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function addDays(dateInput, days) {
  const base = toDate(dateInput) || new Date();
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
}

export function isSameDay(a, b) {
  const dateA = toDate(a);
  const dateB = toDate(b);
  if (!dateA || !dateB) return false;

  return startOfDay(dateA).getTime() === startOfDay(dateB).getTime();
}

export function formatDate(dateInput, options = {}) {
  const date = toDate(dateInput);
  if (!date) return "No date";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: options.year ?? "numeric",
    ...options,
  }).format(date);
}

export function formatShortDate(dateInput) {
  const date = toDate(dateInput);
  if (!date) return "No date";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatWeekday(dateInput) {
  const date = toDate(dateInput);
  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
  }).format(date);
}

export function formatTime(dateInput) {
  const date = toDate(dateInput);
  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function toDateInputValue(dateInput) {
  const date = toDate(dateInput);
  if (!date) return "";

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getCurrentWeek(referenceDate = new Date()) {
  const today = startOfDay(referenceDate);

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index);

    return {
      key: toDateInputValue(date),
      date,
      dayLabel: formatWeekday(date),
      dateLabel: formatDate(date),
      shortDateLabel: formatShortDate(date),
      isToday: isSameDay(date, new Date()),
    };
  });
}

export function getWeekRangeLabel(weekDays = []) {
  if (!weekDays.length) return "";

  const first = weekDays[0]?.date;
  const last = weekDays[weekDays.length - 1]?.date;

  if (!first || !last) return "";

  const sameMonth = first.getMonth() === last.getMonth();

  if (sameMonth) {
    return `${new Intl.DateTimeFormat("en-US", { month: "long" }).format(first)} ${first.getDate()} – ${last.getDate()}`;
  }

  return `${formatDate(first)} – ${formatDate(last)}`;
}

export function normalizeTask(doc) {
  const data = doc.data();

  return {
    id: doc.id,
    title: data.title || "",
    dueDate: toDate(data.dueDate),
    notes: data.notes || "",
    category: data.category || "",
    estimatedLength: data.estimatedLength || "",
    recurring: Boolean(data.recurring),
    priorityTier: Number(data.priorityTier) || 1,
    priorityLabel: data.priorityLabel || "",
    completed: Boolean(data.completed),
    completedAt: toDate(data.completedAt),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export function isTaskDueOnDate(task, dateInput) {
  return isSameDay(task?.dueDate, dateInput);
}

export function isCompletedToday(task) {
  return Boolean(task?.completed) && isSameDay(task?.completedAt, new Date());
}

export function sortTasksForPlanner(a, b) {
  const aPriority = getPriorityMeta(a.priorityTier, a.priorityLabel).rank;
  const bPriority = getPriorityMeta(b.priorityTier, b.priorityLabel).rank;

  if (aPriority !== bPriority) return bPriority - aPriority;

  const aCreated = toDate(a.createdAt)?.getTime() || 0;
  const bCreated = toDate(b.createdAt)?.getTime() || 0;
  return aCreated - bCreated;
}

export function groupTasksByDay(tasks = [], weekDays = []) {
  const grouped = {};

  weekDays.forEach((day) => {
    grouped[day.key] = [];
  });

  tasks.forEach((task) => {
    if (!task?.dueDate) return;
    const key = toDateInputValue(task.dueDate);
    if (!grouped[key]) return;
    grouped[key].push(task);
  });

  Object.keys(grouped).forEach((key) => {
    grouped[key].sort(sortTasksForPlanner);
  });

  return grouped;
}

export function getEnergyLabel(completedTodayCount) {
  if (completedTodayCount === 0) return "Warmup Mode";
  if (completedTodayCount <= 2) return "Steady Heat";
  if (completedTodayCount <= 4) return "Locked In";
  if (completedTodayCount <= 6) return "Big Motion";
  return "Runway Cleared";
}

export function buildMotivationData(completedTodayCount, activeCount, completedTodayTasks = []) {
  const categories = completedTodayTasks
    .map((task) => task.category?.trim())
    .filter(Boolean);

  const categoryCounts = categories.reduce((acc, category) => {
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const mostUsedCategory =
    Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "No clear favorite";

  if (completedTodayCount === 0) {
    return {
      title: "You are not behind. You are setting the table.",
      body: "Take out one annoying task first. The whole board feels easier once the first thing is gone.",
      bestStreak: "No streak yet",
      topCategory: mostUsedCategory,
      tone: "Warmup Mode",
    };
  }

  if (completedTodayCount <= 2) {
    return {
      title: `Good start — ${completedTodayCount} thing${completedTodayCount === 1 ? "" : "s"} handled.`,
      body: "That’s the kind of cleanup that gives your real priorities more breathing room.",
      bestStreak: `${completedTodayCount} task${completedTodayCount === 1 ? "" : "s"} handled today`,
      topCategory: mostUsedCategory,
      tone: "Steady Heat",
    };
  }

  if (completedTodayCount <= 4) {
    return {
      title: `You knocked out ${completedTodayCount} things today.`,
      body: "This is exactly the point of EasyList: less friction, cleaner headspace, more room for the work that matters.",
      bestStreak: `${completedTodayCount} tasks down`,
      topCategory: mostUsedCategory,
      tone: "Locked In",
    };
  }

  return {
    title: `${completedTodayCount} handled today. Monster behavior.`,
    body: activeCount > 0
      ? "The list is getting bullied in the best way. Finish one more meaningful thing and call it a powerful day."
      : "Board looks clean. That’s elite. Nothing useless left hanging over your head.",
    bestStreak: `${completedTodayCount} tasks cleared`,
    topCategory: mostUsedCategory,
    tone: "Runway Cleared",
  };
}

/* =========================
   Archive helpers for Tab 6
   ========================= */

export function getStartOfWeek(dateInput) {
  const date = toDate(dateInput);
  if (!date) return null;

  const result = new Date(date);
  result.setHours(0, 0, 0, 0);

  const day = result.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  result.setDate(result.getDate() + diff);

  return result;
}

export function buildWeekLabel(dateInput) {
  const start = getStartOfWeek(dateInput);
  if (!start) return "Unknown week";
  return `Week of ${formatDate(start)}`;
}

export function groupCompletedTasksByWeek(tasks = []) {
  const groups = new Map();

  tasks.forEach((task) => {
    if (!task?.completed || !task?.completedAt) return;

    const weekStart = getStartOfWeek(task.completedAt);
    if (!weekStart) return;

    const key = toDateInputValue(weekStart);

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        weekStart,
        label: buildWeekLabel(weekStart),
        tasks: [],
      });
    }

    groups.get(key).tasks.push(task);
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      tasks: group.tasks.sort((a, b) => {
        const aTime = toDate(a.completedAt)?.getTime() || 0;
        const bTime = toDate(b.completedAt)?.getTime() || 0;
        return bTime - aTime;
      }),
    }))
    .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());
}
/* =========================
   COMPATIBILITY HELPERS (ARCHIVE)
========================= */

export function toDateSafe(value) {
  return toDate(value);
}

export function formatDisplayDate(dateInput, options = {}) {
  const date = toDate(dateInput);
  if (!date) return "—";

  const formatOptions = options.short
    ? { month: "short", day: "numeric" }
    : { month: "long", day: "numeric", year: "numeric" };

  return new Intl.DateTimeFormat("en-US", formatOptions).format(date);
}

export function truncateText(text = "", maxLength = 120) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}