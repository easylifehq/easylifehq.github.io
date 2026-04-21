import { useEffect } from "react";
import { useEasyCalendar } from "@/features/easycalendar/EasyCalendarContext";
import { useSettings } from "@/features/settings/SettingsContext";
import {
  buildScheduledReminders,
  getNotificationPermission,
  showScheduledReminder,
} from "@/lib/mobile/notifications";

export function NotificationScheduler() {
  const { settings } = useSettings();
  const { tasks, events, taskBlocks } = useEasyCalendar();

  useEffect(() => {
    if (getNotificationPermission() !== "granted") return;

    const reminders = buildScheduledReminders(
      settings.notifications,
      tasks,
      events,
      taskBlocks,
      settings.calendarWakeTime
    );
    const timers = reminders.map((reminder) => {
      const delay = Math.max(0, reminder.at.getTime() - Date.now());
      return window.setTimeout(() => {
        showScheduledReminder(reminder);
      }, delay);
    });

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [events, settings.calendarWakeTime, settings.notifications, taskBlocks, tasks]);

  return null;
}
