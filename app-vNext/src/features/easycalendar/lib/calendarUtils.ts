import type { CalendarEventRecord } from "@/lib/firestore/calendarEvents";
import type { CalendarTaskBlockRecord } from "@/lib/firestore/calendarTaskBlocks";
import {
  DEFAULT_CATEGORIES,
  type CategoryRecord,
} from "@/lib/firestore/categories";

export type CalendarDayItem = {
  id: string;
  title: string;
  startAt: Date | null;
  endAt: Date | null;
  kind: "event" | "task-block";
  color: string;
  badge: string;
  helper: string;
  allDay: boolean;
  isFlexible: boolean;
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
  categories: CategoryRecord[]
) {
  const eventItems: CalendarDayItem[] = events
    .filter((event) => isSameDay(event.startAt, date))
    .map((event) => {
      const category = getCategoryForKey(categories, event.categoryId || event.eventType);

      return {
        id: event.id,
        title: event.title,
        startAt: event.startAt,
        endAt: event.endAt,
        kind: "event",
        color: category.color,
        badge: event.eventType === "other" ? "fixed event" : event.eventType,
        helper: event.allDay
          ? "All day"
          : `${formatTimeLabel(event.startAt)} - ${formatTimeLabel(event.endAt)}`,
        allDay: event.allDay,
        isFlexible: false,
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
        badge: taskBlock.planningState,
        helper: `${formatTimeLabel(taskBlock.startAt)} - ${formatTimeLabel(taskBlock.endAt)}`,
        allDay: false,
        isFlexible: true,
      };
    });

  return [...eventItems, ...taskBlockItems].sort((left, right) => {
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
  const fixedMinutes = events
    .filter((event) => isSameDay(event.startAt, date))
    .reduce((total, event) => total + getDurationMinutes(event.startAt, event.endAt), 0);

  const taskMinutes = taskBlocks
    .filter((taskBlock) => isSameDay(taskBlock.startAt, date))
    .reduce(
      (total, taskBlock) => total + getDurationMinutes(taskBlock.startAt, taskBlock.endAt),
      0
    );

  return fixedMinutes + taskMinutes;
}
