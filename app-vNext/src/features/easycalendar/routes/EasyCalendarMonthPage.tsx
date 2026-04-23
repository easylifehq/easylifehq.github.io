import { useMemo, useState, type CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { CalendarComposer } from "@/features/easycalendar/components/CalendarComposer";
import { CalendarEventDrawer } from "@/features/easycalendar/components/CalendarEventDrawer";
import { CalendarTaskBlockDrawer } from "@/features/easycalendar/components/CalendarTaskBlockDrawer";
import { useEasyCalendar } from "@/features/easycalendar/EasyCalendarContext";
import {
  addDays,
  formatDuration,
  getItemsForDay,
  getScheduledMinutesForDay,
  isSameDay,
  startOfDay,
  toDateInputValue,
} from "@/features/easycalendar/lib/calendarUtils";

function getMonthGrid(date: Date) {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const gridStart = addDays(monthStart, -monthStart.getDay());
  const gridEnd = addDays(monthEnd, 6 - monthEnd.getDay());
  const days: Date[] = [];

  for (let cursor = new Date(gridStart); cursor <= gridEnd; cursor = addDays(cursor, 1)) {
    days.push(new Date(cursor));
  }

  return days;
}

export function EasyCalendarMonthPage() {
  const { categories, events, taskBlocks, tasks, isLoading, error } = useEasyCalendar();
  const navigate = useNavigate();
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const today = startOfDay(new Date());
  const [viewedMonth, setViewedMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const days = useMemo(() => getMonthGrid(viewedMonth), [viewedMonth]);
  const selectedBlock = useMemo(
    () => taskBlocks.find((taskBlock) => taskBlock.id === selectedBlockId) || null,
    [selectedBlockId, taskBlocks]
  );
  const selectedTask = useMemo(
    () => selectedBlock ? tasks.find((task) => task.id === selectedBlock.taskId) || null : null,
    [selectedBlock, tasks]
  );
  const selectedEvent = useMemo(
    () => events.find((calendarEvent) => calendarEvent.id === selectedEventId) || null,
    [selectedEventId, events]
  );

  return (
    <>
      <PageSection eyebrow="Calendar" title={new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(viewedMonth)}>
        {error ? <p className="error-copy">{error}</p> : null}
        {isLoading ? <p className="helper-copy">Loading your month...</p> : null}
        <div className="calendar-month-command">
          <p>Tap any date to zoom into the day. Events, deadlines, and task blocks stay visually separate so the month is easier to scan.</p>
          <div className="calendar-inline-actions">
            <button
              type="button"
              className="button-secondary compact-button"
              onClick={() => setViewedMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
            >
              Prev
            </button>
            <button
              type="button"
              className="ghost-button compact-button"
              onClick={() => setViewedMonth(new Date(today.getFullYear(), today.getMonth(), 1))}
            >
              Today
            </button>
            <button
              type="button"
              className="button-secondary compact-button"
              onClick={() => setViewedMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
            >
              Next
            </button>
            <Link className="primary-button compact-button" to={`/app/easycalendar/day?date=${toDateInputValue(today)}`}>
              Open today
            </Link>
          </div>
        </div>
        <div className="calendar-type-legend" aria-label="Calendar item types">
          <span className="fixed">Event</span>
          <span className="deadline">Deadline</span>
          <span className="flexible">Task block</span>
        </div>
        <div className="calendar-month-surface">
        <div className="calendar-month-weekdays" aria-hidden="true">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((weekday) => (
            <span key={weekday}>{weekday}</span>
          ))}
        </div>
        <div className="calendar-month-grid">
          {days.map((day) => {
            const items = getItemsForDay(day, events, taskBlocks, categories, tasks);
            const scheduledMinutes = getScheduledMinutesForDay(day, events, taskBlocks);

            return (
              <article
                key={day.toISOString()}
                role="button"
                tabIndex={0}
                className={`calendar-month-day${isSameDay(day, today) ? " today" : ""}${day.getMonth() !== viewedMonth.getMonth() ? " muted" : ""}`}
                onClick={() => navigate(`/app/easycalendar/day?date=${toDateInputValue(day)}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(`/app/easycalendar/day?date=${toDateInputValue(day)}`);
                  }
                }}
              >
                <header className="calendar-day-header-vnext">
                  <div>
                    <h3>{day.getDate()}</h3>
                  </div>
                  <span className="calendar-duration-pill">
                    {scheduledMinutes > 0 ? formatDuration(scheduledMinutes) : "Open"}
                  </span>
                </header>

                <div className="calendar-item-stack">
                  {items.slice(0, 4).map((item) => {
                    const editableDeadline = item.kind === "deadline" && events.some((event) => event.id === item.id);
                    return (
                    <button
                      key={`${item.kind}-${item.id}`}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (item.kind === "task-block") {
                          setSelectedBlockId(item.id);
                        } else if (item.kind === "event" || editableDeadline) {
                          setSelectedEventId(item.id);
                        }
                      }}
                      className={`calendar-block-vnext compact${item.kind === "deadline" ? " deadline" : item.isFlexible ? " flexible" : " fixed"}${item.isCompleted ? " completed" : ""}`}
                      style={{ "--calendar-block-color": item.color } as CSSProperties}
                      disabled={item.kind === "deadline" && !editableDeadline}
                    >
                      <strong>{item.title}</strong>
                      <small>{item.kind === "event" ? "Event" : item.kind === "deadline" ? "Deadline" : "Task block"}</small>
                    </button>
                  );
                  })}
                  {items.length > 4 ? <p className="helper-copy">+{items.length - 4} more items</p> : null}
                </div>
              </article>
            );
          })}
        </div>
        </div>
      </PageSection>

      <details className="advanced-disclosure">
        <summary>Advanced scheduling</summary>
        <CalendarComposer />
      </details>

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
