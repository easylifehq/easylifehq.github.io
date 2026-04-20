import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { CalendarEventDrawer } from "@/features/easycalendar/components/CalendarEventDrawer";
import { CalendarTaskBlockDrawer } from "@/features/easycalendar/components/CalendarTaskBlockDrawer";
import { useEasyCalendar } from "@/features/easycalendar/EasyCalendarContext";
import { useSettings } from "@/features/settings/SettingsContext";
import type { CalendarEventType } from "@/lib/firestore/calendarEvents";
import {
  addMinutes,
  buildHourlySlots,
  buildPlanMyDaySuggestions,
  combineDateAndTime,
  formatDuration,
  formatTimeLabel,
  getDurationMinutes,
  getHourFromTimeInput,
  formatLongDate,
  getItemsForDay,
  getOpenTimeWindowsForDay,
  getScheduledMinutesForDay,
  isSameDay,
  startOfDay,
  toDateInputValue,
  toTimeInputValue,
} from "@/features/easycalendar/lib/calendarUtils";

type QuickEventDraft = {
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  eventType: CalendarEventType;
};

export function EasyCalendarDayPage() {
  const {
    categories,
    events,
    taskBlocks,
    tasks,
    isLoading,
    error,
    addEvent,
    deleteTaskBlock,
    scheduleTask,
  } = useEasyCalendar();
  const { settings } = useSettings();
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [quickEvent, setQuickEvent] = useState<QuickEventDraft | null>(null);
  const [quickEventMessage, setQuickEventMessage] = useState("");
  const [isSavingQuickEvent, setIsSavingQuickEvent] = useState(false);
  const [planMessage, setPlanMessage] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);
  const today = startOfDay(new Date());
  const items = getItemsForDay(today, events, taskBlocks, categories, tasks);
  const scheduledMinutes = getScheduledMinutesForDay(today, events, taskBlocks);
  const fixedEventCount = items.filter((item) => item.kind === "event").length;
  const taskBlockCount = items.filter((item) => item.kind === "task-block").length;
  const isOverloaded = scheduledMinutes > 9 * 60;
  const wakeHour = getHourFromTimeInput(settings.calendarWakeTime, 8);
  const planWindowHours = settings.easyCalendar.planMyDayWindowHours;
  const dayEndHour = Math.min(wakeHour + planWindowHours, 24);
  const hourlySlots = useMemo(() => buildHourlySlots(today, wakeHour, planWindowHours), [today, wakeHour, planWindowHours]);
  const openWindows = useMemo(
    () => getOpenTimeWindowsForDay(today, events, taskBlocks, wakeHour, dayEndHour),
    [events, taskBlocks, today, wakeHour, dayEndHour]
  );
  const selectedBlock = useMemo(
    () => taskBlocks.find((taskBlock) => taskBlock.id === selectedBlockId) || null,
    [selectedBlockId, taskBlocks]
  );
  const selectedEvent = useMemo(
    () => events.find((calendarEvent) => calendarEvent.id === selectedEventId) || null,
    [selectedEventId, events]
  );
  const selectedTask = useMemo(
    () =>
      selectedBlock
        ? tasks.find((task) => task.id === selectedBlock.taskId) || null
        : null,
    [selectedBlock, tasks]
  );

  async function handlePlanMyDay() {
    setIsPlanning(true);
    setPlanMessage("");

    try {
      const existingSuggestedBlocks = taskBlocks.filter(
        (taskBlock) =>
          isSameDay(taskBlock.startAt, today) &&
          taskBlock.planningState === "suggested" &&
          !taskBlock.completed
      );

      if (existingSuggestedBlocks.length) {
        await Promise.all(existingSuggestedBlocks.map((taskBlock) => deleteTaskBlock(taskBlock.id)));
      }

      const remainingTaskBlocks = taskBlocks.filter(
        (taskBlock) => !existingSuggestedBlocks.some((existing) => existing.id === taskBlock.id)
      );
      const plan = buildPlanMyDaySuggestions(today, tasks, events, remainingTaskBlocks, {
        wakeHour,
        endHour: dayEndHour,
        defaultTaskBlockMinutes: settings.easyCalendar.defaultTaskBlockMinutes,
      });

      if (!plan.suggestions.length) {
        setPlanMessage(
          plan.windows.length
            ? "No good task fits were found for today yet."
            : "There are no open windows to place suggested work today."
        );
        return;
      }

      await Promise.all(
        plan.suggestions.map((suggestion) =>
          scheduleTask(suggestion.task, {
            startAt: suggestion.startAt,
            endAt: suggestion.endAt,
            planningState: "suggested",
            userAdjusted: false,
          })
        )
      );

      setPlanMessage(
        `Planned ${plan.suggestions.length} suggested block${
          plan.suggestions.length === 1 ? "" : "s"
        } for today.`
      );
    } finally {
      setIsPlanning(false);
    }
  }

  function openQuickEvent(slotStart: Date) {
    const slotEnd = addMinutes(slotStart, settings.easyCalendar.defaultTaskBlockMinutes) || addMinutes(slotStart, 30) || slotStart;
    setQuickEvent({
      date: toDateInputValue(slotStart),
      startTime: toTimeInputValue(slotStart),
      endTime: toTimeInputValue(slotEnd),
      title: "",
      eventType: "appointment",
    });
    setQuickEventMessage("");
  }

  async function handleQuickEventSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!quickEvent) return;

    const startAt = combineDateAndTime(quickEvent.date, quickEvent.startTime);
    const endAt = combineDateAndTime(quickEvent.date, quickEvent.endTime);

    if (!quickEvent.title.trim()) {
      setQuickEventMessage("Name the event first.");
      return;
    }

    if (!startAt || !endAt || endAt <= startAt) {
      setQuickEventMessage("End time needs to be after the start.");
      return;
    }

    setIsSavingQuickEvent(true);
    try {
      await addEvent({
        title: quickEvent.title.trim(),
        description: "",
        itemKind: "event",
        categoryId: null,
        startAt,
        endAt,
        allDay: false,
        isRecurring: false,
        recurrenceRule: null,
        eventType: quickEvent.eventType,
      });
      setQuickEvent(null);
      setQuickEventMessage("");
    } finally {
      setIsSavingQuickEvent(false);
    }
  }

  return (
    <>
      <PageSection
        eyebrow="Day View"
        title={formatLongDate(today)}
        description="Today, hour by hour."
      >
        {error ? <p className="error-copy">{error}</p> : null}
        <div className="quiet-metrics-row" aria-label="Calendar snapshot">
          <span>{fixedEventCount} event{fixedEventCount === 1 ? "" : "s"}</span>
          <span>{taskBlockCount} task block{taskBlockCount === 1 ? "" : "s"}</span>
          <span>{formatDuration(scheduledMinutes)} planned</span>
        </div>
      </PageSection>

      <PageSection
        eyebrow="Calendar"
        title="Today timeline"
      >
        {isLoading ? <p className="helper-copy">Loading today's schedule...</p> : null}

        <div className="calendar-view-links calendar-view-links-sticky" aria-label="Calendar views">
          <Link to="/app/easycalendar/day" className="view-button-vnext active">Day</Link>
          <Link to="/app/easycalendar/week" className="view-button-vnext">Week</Link>
          <Link to="/app/easycalendar/month" className="view-button-vnext">Month</Link>
        </div>

        <div className="calendar-day-actions calendar-command-bar">
          <div className="calendar-status-card">
            <strong>{openWindows.length} open window{openWindows.length === 1 ? "" : "s"}</strong>
            <p>
              {openWindows.length
                ? `${formatDuration(openWindows.reduce((sum, window) => sum + window.minutes, 0))} available.`
                : "No open windows left today."}
            </p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={() => void handlePlanMyDay()}
            disabled={isPlanning}
          >
            {isPlanning ? "Planning..." : "Plan My Day"}
          </button>
        </div>

        {planMessage ? <div className="calendar-info-card">{planMessage}</div> : null}

        {isOverloaded ? (
          <div className="calendar-warning-card">
            <strong>This day looks overloaded.</strong>
            <p>
              You have {formatDuration(scheduledMinutes)} on the calendar already, so
              the planner should suggest carefully instead of packing in more.
            </p>
          </div>
        ) : null}

        <div className="calendar-day-surface">
        <div className="calendar-hour-grid">
          {hourlySlots.map((slot, slotIndex) => {
            const slotItems = items.filter((item) => {
              if (item.kind === "deadline") return false;
              if (!item.startAt || !item.endAt) return false;
              const startsInSlot = item.startAt >= slot.startAt && item.startAt < slot.endAt;
              const startsBeforeFirstVisibleSlot =
                slotIndex === 0 && item.startAt < slot.startAt && item.endAt > slot.startAt;
              return startsInSlot || startsBeforeFirstVisibleSlot;
            });

            return (
              <section key={slot.startAt.toISOString()} className="calendar-hour-row">
                <time>{formatTimeLabel(slot.startAt)}</time>
                <div className="calendar-hour-content">
                  {slotItems.length ? (
                    slotItems.map((item) => {
                      const durationMinutes = Math.max(30, getDurationMinutes(item.startAt, item.endAt));
                      const blockHeight = Math.min(220, Math.max(44, Math.round(durationMinutes * 0.9)));

                      return (
                      <button
                        key={`${item.kind}-${item.id}-${slot.startAt.toISOString()}`}
                        type="button"
                        onClick={() => {
                          if (item.kind === "task-block") {
                            setSelectedBlockId(item.id);
                          } else if (item.kind === "event") {
                            setSelectedEventId(item.id);
                          }
                        }}
                        className={`calendar-detail-card${item.isFlexible ? " flexible" : " fixed"}${item.isCompleted ? " completed" : ""}`}
                        style={
                          {
                            "--calendar-block-color": item.color,
                            "--calendar-block-min-height": `${blockHeight}px`,
                          } as CSSProperties
                        }
                      >
                        <div>
                          <strong>{item.title}</strong>
                          <p>{item.helper}</p>
                        </div>
                        <span>{item.badge}</span>
                      </button>
                    );
                    })
                  ) : (
                    <button
                      type="button"
                      className="calendar-empty-hour calendar-empty-hour-button"
                      onClick={() => openQuickEvent(slot.startAt)}
                    >
                      + Add
                    </button>
                  )}
                </div>
              </section>
            );
          })}
        </div>
        </div>

        <details className="advanced-disclosure calendar-deadline-stack">
          <summary>Deadlines</summary>
          {items.filter((item) => item.kind === "deadline").length ? (
            items
              .filter((item) => item.kind === "deadline")
              .map((item) => (
                <button
                  key={`${item.kind}-${item.id}`}
                  type="button"
                  className="calendar-detail-card deadline"
                  style={{ "--calendar-block-color": item.color } as CSSProperties}
                  disabled
                >
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.helper}</p>
                  </div>
                  <span>{item.badge}</span>
                </button>
              ))
          ) : (
            <p className="helper-copy">No task deadlines today.</p>
          )}
        </details>
      </PageSection>

      <CalendarTaskBlockDrawer
        block={selectedBlock}
        task={selectedTask}
        isOpen={Boolean(selectedBlock)}
        onClose={() => setSelectedBlockId(null)}
      />
      <CalendarEventDrawer
        event={selectedEvent}
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEventId(null)}
      />

      {quickEvent ? (
        <div className="drawer-backdrop open" role="presentation" onClick={() => setQuickEvent(null)}>
          <aside
            className="drawer-panel-vnext calendar-quick-create-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Quick add calendar event"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="drawer-header-vnext">
              <div>
                <p className="eyebrow">Quick add</p>
                <h2>New event</h2>
              </div>
              <button type="button" className="ghost-button compact-button" onClick={() => setQuickEvent(null)}>
                Close
              </button>
            </div>

            <form className="task-composer" onSubmit={(event) => void handleQuickEventSubmit(event)}>
              <label className="field-stack">
                <span>Title</span>
                <input
                  autoFocus
                  value={quickEvent.title}
                  onChange={(event) => setQuickEvent((current) => current ? { ...current, title: event.target.value } : current)}
                  placeholder="Class, practice, appointment..."
                />
              </label>

              <div className="task-composer-grid">
                <label className="field-stack">
                  <span>Date</span>
                  <input
                    type="date"
                    value={quickEvent.date}
                    onChange={(event) => setQuickEvent((current) => current ? { ...current, date: event.target.value } : current)}
                  />
                </label>
                <label className="field-stack">
                  <span>Start</span>
                  <input
                    type="time"
                    value={quickEvent.startTime}
                    onChange={(event) => setQuickEvent((current) => current ? { ...current, startTime: event.target.value } : current)}
                  />
                </label>
                <label className="field-stack">
                  <span>End</span>
                  <input
                    type="time"
                    value={quickEvent.endTime}
                    onChange={(event) => setQuickEvent((current) => current ? { ...current, endTime: event.target.value } : current)}
                  />
                </label>
                <label className="field-stack">
                  <span>Kind</span>
                  <select
                    value={quickEvent.eventType}
                    onChange={(event) =>
                      setQuickEvent((current) =>
                        current ? { ...current, eventType: event.target.value as CalendarEventType } : current
                      )
                    }
                  >
                    <option value="appointment">Appointment</option>
                    <option value="class">Class</option>
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="other">Other</option>
                  </select>
                </label>
              </div>

              {quickEventMessage ? <p className="error-copy">{quickEventMessage}</p> : null}

              <div className="task-composer-actions">
                <button type="button" className="ghost-button" onClick={() => setQuickEvent(null)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={isSavingQuickEvent}>
                  {isSavingQuickEvent ? "Adding..." : "Add event"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      ) : null}
    </>
  );
}
