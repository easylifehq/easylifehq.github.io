import type { CalendarEventRecord } from "@/lib/firestore/calendarEvents";
import type { CalendarTaskBlockRecord } from "@/lib/firestore/calendarTaskBlocks";
import type { TaskRecord } from "@/lib/firestore/tasks";
import {
  getPriorityMeta,
  isDueToday,
  isDueTomorrow,
  isOverdue,
  sortActiveTasks,
  startOfDay as startOfTaskDay,
} from "@/features/easylist/lib/taskUtils";
import {
  DEFAULT_CATEGORIES,
  type CategoryRecord,
} from "@/lib/firestore/categories";
import { getWeekdayCodesFromRule } from "@/features/easycalendar/lib/recurrence";

export type CalendarDayItem = {
  id: string;
  title: string;
  startAt: Date | null;
  endAt: Date | null;
  kind: "event" | "task-block" | "deadline";
  color: string;
  badge: string;
  helper: string;
  allDay: boolean;
  isFlexible: boolean;
  isCompleted: boolean;
};

export type OpenTimeWindow = {
  startAt: Date;
  endAt: Date;
  minutes: number;
};

export type PlannedTaskSuggestion = {
  task: TaskRecord;
  startAt: Date;
  endAt: Date;
};

type RankedTaskCandidate = {
  task: TaskRecord;
  score: number;
};

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

export function startOfWeek(date: Date) {
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return startOfDay(addDays(date, mondayOffset));
}

export function isSameDay(left: Date | null, right: Date | null) {
  if (!left || !right) return false;

  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function getCategoryForKey(
  categories: CategoryRecord[],
  key: string | null | undefined
) {
  const normalizedKey = key?.trim().toLowerCase();
  const searchList = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  if (!normalizedKey) {
    return (
      searchList.find((category) => category.type === "todo") ||
      DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1]
    );
  }

  return (
    searchList.find((category) => {
      const idMatch = category.id.trim().toLowerCase() === normalizedKey;
      const nameMatch = category.name.trim().toLowerCase() === normalizedKey;
      const typeMatch = category.type?.trim().toLowerCase() === normalizedKey;

      return idMatch || nameMatch || typeMatch;
    }) ||
    searchList.find((category) => category.type === "todo") ||
    DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1]
  );
}

export function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatShortDay(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatTimeLabel(date: Date | null) {
  if (!date) return "Time TBD";

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function getHourFromTimeInput(value: string, fallbackHour = 8) {
  const [hours] = value.split(":").map(Number);
  return Number.isFinite(hours) && hours >= 0 && hours <= 23 ? hours : fallbackHour;
}

export function buildHourlySlots(date: Date, startHour = 8, count = 14) {
  return Array.from({ length: count }, (_, index) => {
    const startAt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour + index, 0, 0, 0);
    const endAt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour + index + 1, 0, 0, 0);

    return { startAt, endAt };
  });
}

export function toDateInputValue(date: Date | null) {
  if (!date) return "";

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function toTimeInputValue(date: Date | null) {
  if (!date) return "";

  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function combineDateAndTime(dateInput: string, timeInput: string) {
  if (!dateInput) return null;

  const [year, month, day] = dateInput.split("-").map(Number);
  const [hours, minutes] = (timeInput || "09:00").split(":").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day, hours || 0, minutes || 0, 0, 0);
}

export function addMinutes(date: Date | null, minutes: number) {
  if (!date) return null;

  return new Date(date.getTime() + minutes * 60000);
}

function getRecurringEventOccurrence(event: CalendarEventRecord, date: Date) {
  if (!event.startAt || !event.endAt) return null;
  if (isSameDay(event.startAt, date)) {
    return {
      startAt: event.startAt,
      endAt: event.endAt,
    };
  }

  if (!event.isRecurring || !event.recurrenceRule || event.startAt > date) return null;

  const rule = event.recurrenceRule.toUpperCase();
  const dateStart = startOfDay(date);
  const eventStart = startOfDay(event.startAt);
  const daysSinceStart = Math.round((dateStart.getTime() - eventStart.getTime()) / 86400000);
  const customWeekdays = getWeekdayCodesFromRule(rule);
  const dateWeekday = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][date.getDay()];
  const shouldRepeat =
    (rule === "FREQ=DAILY" && daysSinceStart >= 0) ||
    (rule === "FREQ=WEEKLY" && daysSinceStart >= 0 && daysSinceStart % 7 === 0) ||
    (rule.startsWith("FREQ=WEEKLY;BYDAY=") &&
      daysSinceStart >= 0 &&
      customWeekdays.includes(dateWeekday)) ||
    (rule === "FREQ=MONTHLY" &&
      date.getDate() === event.startAt.getDate() &&
      dateStart >= eventStart);

  if (!shouldRepeat) return null;

  const durationMinutes = getDurationMinutes(event.startAt, event.endAt);
  const startAt = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    event.startAt.getHours(),
    event.startAt.getMinutes(),
    0,
    0
  );

  return {
    startAt,
    endAt: addMinutes(startAt, durationMinutes),
  };
}

function getEventsForDay(date: Date, events: CalendarEventRecord[]) {
  return events
    .map((event) => {
      const occurrence = getRecurringEventOccurrence(event, date);
      return occurrence ? { event, ...occurrence } : null;
    })
    .filter(Boolean) as Array<{
      event: CalendarEventRecord;
      startAt: Date;
      endAt: Date | null;
    }>;
}

function maxDate(left: Date, right: Date) {
  return left.getTime() >= right.getTime() ? left : right;
}

export function getDurationMinutes(startAt: Date | null, endAt: Date | null) {
  if (!startAt || !endAt) return 0;

  return Math.max(0, Math.round((endAt.getTime() - startAt.getTime()) / 60000));
}

export function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (remainder === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainder} min`;
}

export function getItemsForDay(
  date: Date,
  events: CalendarEventRecord[],
  taskBlocks: CalendarTaskBlockRecord[],
  categories: CategoryRecord[],
  tasks: TaskRecord[] = []
) {
  const eventItems: CalendarDayItem[] = getEventsForDay(date, events)
    .map(({ event, startAt, endAt }) => {
      const category = getCategoryForKey(categories, event.categoryId || event.eventType);

      return {
        id: event.id,
        title: event.title,
        startAt,
        endAt,
        kind: event.itemKind === "deadline" ? "deadline" : "event",
        color: category.color,
        badge: event.itemKind === "deadline"
          ? "deadline"
          : event.isRecurring
          ? `${event.eventType === "other" ? "fixed event" : event.eventType} | repeats`
          : event.eventType === "other" ? "fixed event" : event.eventType,
        helper: event.allDay
          ? "All day"
          : event.itemKind === "deadline"
            ? `Due ${formatTimeLabel(startAt)}`
            : `${formatTimeLabel(startAt)} - ${formatTimeLabel(endAt)}`,
        allDay: event.allDay,
        isFlexible: false,
        isCompleted: false,
      };
    });

  const taskBlockItems: CalendarDayItem[] = taskBlocks
    .filter((taskBlock) => isSameDay(taskBlock.startAt, date))
    .map((taskBlock) => {
      const category = getCategoryForKey(categories, taskBlock.categoryId);

      return {
        id: taskBlock.id,
        title: taskBlock.titleSnapshot,
        startAt: taskBlock.startAt,
        endAt: taskBlock.endAt,
        kind: "task-block",
        color: category.color,
        badge: taskBlock.completed ? "completed" : taskBlock.planningState,
        helper: taskBlock.completed
          ? `Completed | ${formatTimeLabel(taskBlock.startAt)} - ${formatTimeLabel(taskBlock.endAt)}`
          : `${formatTimeLabel(taskBlock.startAt)} - ${formatTimeLabel(taskBlock.endAt)}`,
        allDay: false,
        isFlexible: true,
        isCompleted: taskBlock.completed,
      };
    });

  const scheduledTaskIds = new Set(
    taskBlocks
      .filter((taskBlock) => !taskBlock.completed)
      .map((taskBlock) => taskBlock.taskId)
  );

  const deadlineItems: CalendarDayItem[] = tasks
    .filter(
      (task) =>
        !task.completed &&
        task.dueDate &&
        isSameDay(task.dueDate, date) &&
        !task.linkedCalendarEventId &&
        !scheduledTaskIds.has(task.id)
    )
    .map((task) => {
      const category = getCategoryForKey(categories, task.category);
      const priority = getPriorityMeta(task.priorityTier, task.priorityLabel);

      return {
        id: task.id,
        title: task.title || "Untitled task",
        startAt: task.dueDate,
        endAt: task.dueDate,
        kind: "deadline",
        color: category.color,
        badge: task.itemKind === "deadline" ? "deadline" : "task due",
        helper: `${priority.label}${task.estimatedLength ? ` | ${task.estimatedLength} min` : ""}`,
        allDay: true,
        isFlexible: false,
        isCompleted: false,
      };
    });

  return [...eventItems, ...taskBlockItems, ...deadlineItems].sort((left, right) => {
    if (left.kind === "deadline" && right.kind !== "deadline") return 1;
    if (left.kind !== "deadline" && right.kind === "deadline") return -1;
    const leftTime = left.startAt?.getTime() || 0;
    const rightTime = right.startAt?.getTime() || 0;
    return leftTime - rightTime;
  });
}

export function getScheduledMinutesForDay(
  date: Date,
  events: CalendarEventRecord[],
  taskBlocks: CalendarTaskBlockRecord[]
) {
  const fixedMinutes = getEventsForDay(date, events)
    .reduce((total, event) => total + getDurationMinutes(event.startAt, event.endAt), 0);

  const taskMinutes = taskBlocks
    .filter((taskBlock) => isSameDay(taskBlock.startAt, date) && !taskBlock.completed)
    .reduce(
      (total, taskBlock) => total + getDurationMinutes(taskBlock.startAt, taskBlock.endAt),
      0
    );

  return fixedMinutes + taskMinutes;
}

export function getOpenTimeWindowsForDay(
  date: Date,
  events: CalendarEventRecord[],
  taskBlocks: CalendarTaskBlockRecord[],
  dayStartHour = 8,
  dayEndHour = 20
) {
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), dayStartHour, 0, 0, 0);
  const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), dayEndHour, 0, 0, 0);

  const occupied = [
    ...getEventsForDay(date, events)
      .filter((event) => event.startAt && event.endAt)
      .map((event) => ({ startAt: event.startAt as Date, endAt: event.endAt as Date })),
    ...taskBlocks
      .filter(
        (taskBlock) =>
          isSameDay(taskBlock.startAt, date) &&
          taskBlock.startAt &&
          taskBlock.endAt &&
          !taskBlock.completed
      )
      .map((taskBlock) => ({ startAt: taskBlock.startAt as Date, endAt: taskBlock.endAt as Date })),
  ].sort((left, right) => left.startAt.getTime() - right.startAt.getTime());

  const windows: OpenTimeWindow[] = [];
  let cursor = dayStart;

  occupied.forEach((entry) => {
    if (entry.startAt > cursor) {
      const minutes = getDurationMinutes(cursor, entry.startAt);
      if (minutes >= 15) {
        windows.push({
          startAt: new Date(cursor),
          endAt: new Date(entry.startAt),
          minutes,
        });
      }
    }

    cursor = maxDate(cursor, entry.endAt);
  });

  if (cursor < dayEnd) {
    const minutes = getDurationMinutes(cursor, dayEnd);
    if (minutes >= 15) {
      windows.push({
        startAt: new Date(cursor),
        endAt: new Date(dayEnd),
        minutes,
      });
    }
  }

  return windows;
}

export function buildPlanMyDaySuggestions(
  date: Date,
  tasks: TaskRecord[],
  events: CalendarEventRecord[],
  taskBlocks: CalendarTaskBlockRecord[],
  options: { wakeHour?: number; endHour?: number; defaultTaskBlockMinutes?: number } = {}
) {
  const activeLinkedBlockIds = new Set(
    taskBlocks.filter((taskBlock) => !taskBlock.completed).map((taskBlock) => taskBlock.id)
  );

  const candidateTasks = sortTasksForPlanning(
    tasks.filter(
      (task) =>
        !task.completed &&
        !task.linkedCalendarBlockIds.some((blockId) => activeLinkedBlockIds.has(blockId))
    ),
    date
  );

  const windows = getOpenTimeWindowsForDay(
    date,
    events,
    taskBlocks,
    options.wakeHour,
    options.endHour
  ).map((window) => ({
    ...window,
    startAt: new Date(window.startAt),
    endAt: new Date(window.endAt),
  }));

  const suggestions: PlannedTaskSuggestion[] = [];

  candidateTasks.forEach((task) => {
    if (suggestions.length >= 5) return;

    const durationMinutes = Math.max(15, task.estimatedLength || options.defaultTaskBlockMinutes || 30);
    const fittingWindow = [...windows]
      .filter((window) => window.minutes >= durationMinutes)
      .sort((left, right) => {
        const leftWaste = left.minutes - durationMinutes;
        const rightWaste = right.minutes - durationMinutes;
        return leftWaste - rightWaste;
      })[0];

    if (!fittingWindow) return;

    const startAt = new Date(fittingWindow.startAt);
    const endAt = addMinutes(startAt, durationMinutes);

    if (!endAt) return;

    suggestions.push({
      task,
      startAt,
      endAt,
    });

    fittingWindow.startAt = new Date(endAt);
    fittingWindow.minutes = getDurationMinutes(fittingWindow.startAt, fittingWindow.endAt);
  });

  return {
    windows,
    suggestions,
  };
}

function sortTasksForPlanning(tasks: TaskRecord[], date: Date) {
  return tasks
    .map((task) => ({
      task,
      score: getPlanningScore(task, date),
    }))
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }

      const orderedTasks = sortActiveTasks([left.task, right.task]);
      return orderedTasks[0]?.id === left.task.id ? -1 : 1;
    })
    .map((entry) => entry.task);
}

function getPlanningScore(task: TaskRecord, date: Date) {
  let score = 0;

  if (isOverdue(task)) {
    score += 500;
  } else if (isDueToday(task)) {
    score += 320;
  } else if (isDueTomorrow(task)) {
    score += 220;
  } else if (task.dueDate) {
    const daysUntilDue = Math.max(
      0,
      Math.round(
        (startOfTaskDay(task.dueDate).getTime() - startOfTaskDay(date).getTime()) / 86400000
      )
    );
    score += Math.max(40, 160 - daysUntilDue * 18);
  } else {
    score -= 30;
  }

  const priorityRank = getPriorityMeta(task.priorityTier, task.priorityLabel).rank;
  score += (6 - priorityRank) * 28;

  const durationMinutes = Math.max(15, task.estimatedLength || 30);
  if (durationMinutes <= 30) {
    score += 36;
  } else if (durationMinutes <= 60) {
    score += 24;
  } else if (durationMinutes <= 90) {
    score += 12;
  }

  if (!task.dueDate && !task.estimatedLength) {
    score -= 12;
  }

  return score;
}
