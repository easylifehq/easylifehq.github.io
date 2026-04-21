import type { CalendarEventRecord } from "@/lib/firestore/calendarEvents";
import type { CalendarTaskBlockRecord } from "@/lib/firestore/calendarTaskBlocks";
import type { NotificationSettings } from "@/lib/firestore/settings";
import type { TaskRecord } from "@/lib/firestore/tasks";

export type NotificationPermissionState = "unsupported" | NotificationPermission;

export type ScheduledReminder = {
  id: string;
  title: string;
  body: string;
  at: Date;
  url: string;
};

const firedReminderStorageKey = "easylife-fired-reminders-v1";
const maxScheduleWindowMs = 1000 * 60 * 60 * 24;

export function getNotificationPermission(): NotificationPermissionState {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported" as const;
  return Notification.requestPermission();
}

export function sendTestNotification() {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return false;
  }

  new Notification("EasyLife reminders are ready", {
    body: "You can now use EasyLife notification settings.",
    icon: "/icons/easylife-icon-192.png",
    badge: "/icons/easylife-icon-192.png",
  });

  return true;
}

function parseTime(value: string) {
  const [hour = "0", minute = "0"] = value.split(":");
  return {
    hour: Number(hour),
    minute: Number(minute),
  };
}

function minutesFromDate(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

function minutesFromTime(value: string) {
  const parsed = parseTime(value);
  return parsed.hour * 60 + parsed.minute;
}

function isWithinQuietHours(date: Date, settings: NotificationSettings) {
  if (!settings.quietHoursEnabled) return false;

  const current = minutesFromDate(date);
  const quietStart = minutesFromTime(settings.quietHoursStart);
  const quietEnd = minutesFromTime(settings.quietHoursEnd);

  if (quietStart === quietEnd) return false;
  if (quietStart < quietEnd) return current >= quietStart && current < quietEnd;
  return current >= quietStart || current < quietEnd;
}

function moveOutOfQuietHours(date: Date, settings: NotificationSettings) {
  if (!isWithinQuietHours(date, settings)) return date;

  const next = new Date(date);
  const quietEnd = parseTime(settings.quietHoursEnd);
  next.setHours(quietEnd.hour, quietEnd.minute, 0, 0);

  if (next <= date) {
    next.setDate(next.getDate() + 1);
  }

  return next;
}

function isWithinScheduleWindow(date: Date, now: Date) {
  const delay = date.getTime() - now.getTime();
  return delay >= 0 && delay <= maxScheduleWindowMs;
}

function dailyPlanningDate(wakeTime: string, now: Date) {
  const parsed = parseTime(wakeTime);
  const reminderAt = new Date(now);
  reminderAt.setHours(parsed.hour, parsed.minute, 0, 0);

  if (reminderAt <= now) {
    reminderAt.setDate(reminderAt.getDate() + 1);
  }

  return reminderAt;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getFiredReminderIds() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(firedReminderStorageKey) || "[]");
    return Array.isArray(parsed) ? new Set(parsed.filter((entry): entry is string => typeof entry === "string")) : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

export function markReminderFired(id: string) {
  const fired = getFiredReminderIds();
  fired.add(id);
  const trimmed = Array.from(fired).slice(-200);
  window.localStorage.setItem(firedReminderStorageKey, JSON.stringify(trimmed));
}

export function buildScheduledReminders(
  settings: NotificationSettings,
  tasks: TaskRecord[],
  events: CalendarEventRecord[],
  taskBlocks: CalendarTaskBlockRecord[],
  wakeTime: string,
  now = new Date()
) {
  if (!settings.enabled) return [];

  const reminders: ScheduledReminder[] = [];

  if (settings.taskDeadlines) {
    tasks
      .filter((task) => !task.completed && task.dueDate)
      .forEach((task) => {
        const at = moveOutOfQuietHours(task.dueDate || now, settings);
        if (!isWithinScheduleWindow(at, now)) return;
        reminders.push({
          id: `task-deadline:${task.id}:${task.dueDate?.getTime() || 0}`,
          title: "Task deadline",
          body: task.title || "A task is due.",
          at,
          url: "/app/easylist/dashboard",
        });
      });
  }

  if (settings.calendarBlocks) {
    events
      .filter((event) => event.startAt)
      .forEach((event) => {
        const at = moveOutOfQuietHours(event.startAt || now, settings);
        if (!isWithinScheduleWindow(at, now)) return;
        reminders.push({
          id: `calendar-event:${event.id}:${event.startAt?.getTime() || 0}`,
          title: "Calendar event",
          body: event.title || "An event is starting.",
          at,
          url: "/app/easycalendar/day",
        });
      });

    taskBlocks
      .filter((block) => !block.completed && block.startAt)
      .forEach((block) => {
        const at = moveOutOfQuietHours(block.startAt || now, settings);
        if (!isWithinScheduleWindow(at, now)) return;
        reminders.push({
          id: `calendar-block:${block.id}:${block.startAt?.getTime() || 0}`,
          title: "Work block",
          body: block.titleSnapshot || "A scheduled work block is starting.",
          at,
          url: "/app/easycalendar/day",
        });
      });
  }

  if (settings.dailyPlanning) {
    const at = moveOutOfQuietHours(dailyPlanningDate(wakeTime, now), settings);
    if (isWithinScheduleWindow(at, now)) {
      reminders.push({
        id: `daily-planning:${dateKey(at)}`,
        title: "Plan your day",
        body: "Open EasyLife and set the shape of today.",
        at,
        url: "/app/hq",
      });
    }
  }

  const fired = getFiredReminderIds();
  return reminders
    .filter((reminder) => !fired.has(reminder.id))
    .sort((left, right) => left.at.getTime() - right.at.getTime());
}

export function showScheduledReminder(reminder: ScheduledReminder) {
  if (!("Notification" in window) || Notification.permission !== "granted") return false;

  const notification = new Notification(reminder.title, {
    body: reminder.body,
    icon: "/icons/easylife-icon-192.png",
    badge: "/icons/easylife-icon-192.png",
    tag: reminder.id,
  });

  notification.onclick = () => {
    window.focus();
    window.location.assign(reminder.url);
    notification.close();
  };

  markReminderFired(reminder.id);
  return true;
}
