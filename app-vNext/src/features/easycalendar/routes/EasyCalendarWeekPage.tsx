import { useMemo, useState, type CSSProperties } from "react";
import { PageSection } from "@/components/ui/PageSection";
import { CalendarComposer } from "@/features/easycalendar/components/CalendarComposer";
import { CalendarEventDrawer } from "@/features/easycalendar/components/CalendarEventDrawer";
import { CalendarTaskBlockDrawer } from "@/features/easycalendar/components/CalendarTaskBlockDrawer";
import { useEasyCalendar } from "@/features/easycalendar/EasyCalendarContext";
import {
  addDays,
  formatDuration,
  formatShortDay,
  getItemsForDay,
  getScheduledMinutesForDay,
  startOfWeek,
} from "@/features/easycalendar/lib/calendarUtils";

export function EasyCalendarWeekPage() {
  const { categories, events, taskBlocks, tasks, isLoading, error, addCategory, saveCategory } = useEasyCalendar();
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showComposer, setShowComposer] = useState(false);

  const weekStart = startOfWeek(new Date());
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const totalMinutes = days.reduce(
    (sum, day) => sum + getScheduledMinutesForDay(day, events, taskBlocks),
    0
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

  return (
    <>
      <PageSection eyebrow="Week" title="Calendar">
        {error ? <p className="error-copy">{error}</p> : null}
        <div className="stats-grid">
          <article className="stat-card-vnext">
            <span>Fixed events</span>
            <strong>{events.length}</strong>
          </article>
          <article className="stat-card-vnext">
            <span>Task blocks</span>
            <strong>{taskBlocks.length}</strong>
          </article>
          <article className="stat-card-vnext">
            <span>Scheduled time</span>
            <strong>{formatDuration(totalMinutes)}</strong>
          </article>
        </div>
      </PageSection>

      <PageSection eyebrow="This Week" title="Week timeline">
        {isLoading ? <p className="helper-copy">Loading your calendar...</p> : null}
        <div className="calendar-week-grid">
          {days.map((day) => {
            const items = getItemsForDay(day, events, taskBlocks, categories, tasks);
            const scheduledMinutes = getScheduledMinutesForDay(day, events, taskBlocks);

            return (
              <article key={day.toISOString()} className="calendar-day-card-vnext">
                <header className="calendar-day-header-vnext">
                  <div>
                    <p className="planner-day-name">{formatShortDay(day)}</p>
                    <h3>{day.getDate()}</h3>
                  </div>
                  <span className="calendar-duration-pill">
                    {scheduledMinutes > 0 ? formatDuration(scheduledMinutes) : "Open"}
                  </span>
                </header>

                <div className="calendar-item-stack">
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
                        className={`calendar-block-vnext${item.kind === "deadline" ? " deadline" : item.isFlexible ? " flexible" : " fixed"}${item.isCompleted ? " completed" : ""}`}
                        style={
                          {
                            "--calendar-block-color": item.color,
                          } as CSSProperties
                        }
                        disabled={item.kind === "deadline"}
                      >
                        <strong>{item.title}</strong>
                        <span>{item.helper}</span>
                        <small>{item.badge}</small>
                      </button>
                    ))
                  ) : (
                    <div className="empty-card-vnext planner-empty-card">
                      <p className="helper-copy">Nothing scheduled yet.</p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </PageSection>

      <PageSection eyebrow="Advanced" title="Scheduling tools">
        <div className="inline-action-card">
          <div>
            <strong>Add events and task blocks</strong>
            <p>Use the plus button for quick events. Open this when you want the full scheduler.</p>
          </div>
          <button type="button" className="button-secondary" onClick={() => setShowComposer((current) => !current)}>
            {showComposer ? "Hide tools" : "Open tools"}
          </button>
        </div>
        {showComposer ? <CalendarComposer /> : null}
      </PageSection>

      <PageSection eyebrow="Categories" title="Tags">
        <div className="calendar-category-grid">
          {categories.map((category) => (
            <article key={category.id} className="calendar-category-card">
              <label
                className="calendar-category-swatch"
                style={{ backgroundColor: category.color }}
                aria-label={`Change ${category.name} color`}
              >
                <input
                  type="color"
                  value={category.color}
                  onChange={(event) => {
                    const draft = {
                      name: category.name,
                      color: event.target.value,
                      type: category.type,
                      isDefault: false,
                    };

                    if (category.isDefault) {
                      void addCategory(draft);
                    } else {
                      void saveCategory(category.id, draft);
                    }
                  }}
                />
              </label>
              <div>
                <strong>{category.name}</strong>
              </div>
            </article>
          ))}
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
