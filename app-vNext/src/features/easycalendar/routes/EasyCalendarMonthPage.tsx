import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
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
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const today = startOfDay(new Date());
  const days = useMemo(() => getMonthGrid(today), [today]);
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
      <PageSection eyebrow="Month" title="Calendar">
        {error ? <p className="error-copy">{error}</p> : null}
        {isLoading ? <p className="helper-copy">Loading your month...</p> : null}
        <div className="calendar-view-links calendar-view-links-sticky" aria-label="Calendar views">
          <Link to="/app/easycalendar/day" className="view-button-vnext">Day</Link>
          <Link to="/app/easycalendar/week" className="view-button-vnext">Week</Link>
          <Link to="/app/easycalendar/month" className="view-button-vnext active">Month</Link>
        </div>
        <div className="calendar-month-surface">
        <div className="calendar-month-grid">
          {days.map((day) => {
            const items = getItemsForDay(day, events, taskBlocks, categories, tasks);
            const scheduledMinutes = getScheduledMinutesForDay(day, events, taskBlocks);

            return (
              <article
                key={day.toISOString()}
                className={`calendar-month-day${isSameDay(day, today) ? " today" : ""}${day.getMonth() !== today.getMonth() ? " muted" : ""}`}
              >
                <header className="calendar-day-header-vnext">
                  <div>
                    <p className="planner-day-name">
                      {new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(day)}
                    </p>
                    <h3>{day.getDate()}</h3>
                  </div>
                  <span className="calendar-duration-pill">
                    {scheduledMinutes > 0 ? formatDuration(scheduledMinutes) : "Open"}
                  </span>
                </header>

                <div className="calendar-item-stack">
                  {items.slice(0, 4).map((item) => (
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
                      className={`calendar-block-vnext compact${item.kind === "deadline" ? " deadline" : item.isFlexible ? " flexible" : " fixed"}${item.isCompleted ? " completed" : ""}`}
                      style={{ "--calendar-block-color": item.color } as CSSProperties}
                      disabled={item.kind === "deadline"}
                    >
                      <strong>{item.title}</strong>
                      <small>{item.badge}</small>
                    </button>
                  ))}
                  {items.length > 4 ? <p className="helper-copy">+{items.length - 4} more</p> : null}
                </div>
              </article>
            );
          })}
        </div>
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
