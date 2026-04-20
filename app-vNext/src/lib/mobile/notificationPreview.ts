import type { CalendarEventRecord } from "@/lib/firestore/calendarEvents";
import type { CalendarTaskBlockRecord } from "@/lib/firestore/calendarTaskBlocks";
import type { NotificationSettings } from "@/lib/firestore/settings";
import type { TaskRecord } from "@/lib/firestore/tasks";

export type NotificationPreviewItem = {
  id: string;
  label: string;
  title: string;
  detail: string;
  at: Date;
};

function formatReminderTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function isWithinNextWeek(date: Date, now: Date) {
  const weekFromNow = new Date(now);
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  return date >= now && date <= weekFromNow;
}

export function buildNotificationPreview(
  settings: NotificationSettings,
  tasks: TaskRecord[],
  events: CalendarEventRecord[],
  taskBlocks: CalendarTaskBlockRecord[],
  now = new Date()
) {
  if (!settings.enabled) return [];

  const previews: NotificationPreviewItem[] = [];

  if (settings.taskDeadlines) {
    tasks
      .filter((task) => !task.completed && task.dueDate && isWithinNextWeek(task.dueDate, now))
      .forEach((task) => {
        previews.push({
          id: `task-${task.id}`,
          label: "Task deadline",
          title: task.title,
          detail: `Due ${formatReminderTime(task.dueDate || now)}`,
          at: task.dueDate || now,
        });
      });
  }

  if (settings.calendarBlocks) {
    events
      .filter((event) => event.startAt && isWithinNextWeek(event.startAt, now))
      .forEach((event) => {
        previews.push({
          id: `event-${event.id}`,
          label: "Calendar event",
          title: event.title,
          detail: `Starts ${formatReminderTime(event.startAt || now)}`,
          at: event.startAt || now,
        });
      });

    taskBlocks
      .filter((block) => block.startAt && isWithinNextWeek(block.startAt, now))
      .forEach((block) => {
        previews.push({
          id: `block-${block.id}`,
          label: "Work block",
          title: block.titleSnapshot || "Work block",
          detail: `Starts ${formatReminderTime(block.startAt || now)}`,
          at: block.startAt || now,
        });
      });
  }

  if (settings.dailyPlanning) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    previews.push({
      id: "daily-planning",
      label: "Daily planning",
      title: "Plan your day",
      detail: `Prepared for ${formatReminderTime(tomorrow)}`,
      at: tomorrow,
    });
  }

  return previews
    .sort((left, right) => left.at.getTime() - right.at.getTime())
    .slice(0, 5);
}
