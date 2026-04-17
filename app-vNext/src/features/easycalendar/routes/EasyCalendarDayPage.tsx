import { useMemo, useState, type CSSProperties } from "react";
import { PageSection } from "@/components/ui/PageSection";
import { CalendarEventDrawer } from "@/features/easycalendar/components/CalendarEventDrawer";
import { CalendarTaskBlockDrawer } from "@/features/easycalendar/components/CalendarTaskBlockDrawer";
import { useEasyCalendar } from "@/features/easycalendar/EasyCalendarContext";
import {
  buildPlanMyDaySuggestions,
  formatDuration,
  formatLongDate,
  getItemsForDay,
  getOpenTimeWindowsForDay,
  getScheduledMinutesForDay,
  isSameDay,
  startOfDay,
} from "@/features/easycalendar/lib/calendarUtils";

export function EasyCalendarDayPage() {
  const {
    categories,
    events,
    taskBlocks,
    tasks,
    isLoading,
    error,
    deleteTaskBlock,
    scheduleTask,
  } = useEasyCalendar();
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [planMessage, setPlanMessage] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);
  const today = startOfDay(new Date());
  const items = getItemsForDay(today, events, taskBlocks, categories, tasks);
  const scheduledMinutes = getScheduledMinutesForDay(today, events, taskBlocks);
  const fixedEventCount = items.filter((item) => item.kind === "event").length;
  const taskBlockCount = items.filter((item) => item.kind === "task-block").length;
  const isOverloaded = scheduledMinutes > 9 * 60;
  const openWindows = useMemo(
    () => getOpenTimeWindowsForDay(today, events, taskBlocks),
    [events, taskBlocks, today]
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
      const plan = buildPlanMyDaySuggestions(today, tasks, events, remainingTaskBlocks);

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

  return (
    <>
      <PageSection
        eyebrow="Day View"
        title={formatLongDate(today)}
        description="Today's commitments and flexible work blocks, pulled live from Firestore."
      >
        {error ? <p className="error-copy">{error}</p> : null}
        <div className="stats-grid">
          <article className="stat-card-vnext">
            <span>Fixed events</span>
            <strong>{fixedEventCount}</strong>
          </article>
          <article className="stat-card-vnext">
            <span>Task blocks</span>
            <strong>{taskBlockCount}</strong>
          </article>
          <article className="stat-card-vnext">
            <span>Planned time</span>
            <strong>{formatDuration(scheduledMinutes)}</strong>
          </article>
        </div>
      </PageSection>

      <PageSection
        eyebrow="Plan My Day"
        title="Today timeline"
        description="A first planning pass that looks for open windows and suggests work from EasyList."
      >
        {isLoading ? <p className="helper-copy">Loading today's schedule...</p> : null}

        <div className="calendar-day-actions">
          <div className="calendar-status-card">
            <strong>{openWindows.length} open window{openWindows.length === 1 ? "" : "s"}</strong>
            <p>
              {openWindows.length
                ? `${formatDuration(openWindows.reduce((sum, window) => sum + window.minutes, 0))} still available today.`
                : "Your day is already packed with commitments or scheduled work."}
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

        <div className="calendar-detail-stack">
          {items.length > 0 ? (
            items.map((item) => (
              <button
                key={`${item.kind}-${item.id}`}
                type="button"
                onClick={() => {
                  if (item.kind === "task-block") {
                    setSelectedBlockId(item.id);
                  } else if (item.kind === "event") {
                    setSelectedEventId(item.id);
                  }
                }}
                className={`calendar-detail-card${item.kind === "deadline" ? " deadline" : item.isFlexible ? " flexible" : " fixed"}${item.isCompleted ? " completed" : ""}`}
                style={
                  {
                    "--calendar-block-color": item.color,
                  } as CSSProperties
                }
                disabled={item.kind === "deadline"}
              >
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.helper}</p>
                </div>
                <span>{item.badge}</span>
              </button>
            ))
          ) : (
            <div className="empty-card-vnext">
              <p className="helper-copy">
                No events or task blocks are scheduled for today yet.
              </p>
            </div>
          )}
        </div>
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
    </>
  );
}
