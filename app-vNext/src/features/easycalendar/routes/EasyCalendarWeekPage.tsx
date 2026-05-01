import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { Link } from "react-router-dom";
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
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#4d7fe6");
  const [categoryMessage, setCategoryMessage] = useState("");
  const [categoryDrafts, setCategoryDrafts] = useState<Record<string, string>>({});

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

  async function handleAddCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newCategoryName.trim()) {
      setCategoryMessage("Name the category first.");
      return;
    }

    await addCategory({
      name: newCategoryName.trim(),
      color: newCategoryColor,
      type: newCategoryName.trim().toLowerCase().replace(/\s+/g, "-"),
      isDefault: false,
    });

    setNewCategoryName("");
    setNewCategoryColor("#4d7fe6");
    setCategoryMessage("Category added.");
  }

  return (
    <>
      <PageSection eyebrow="Week" title="Calendar">
        {error ? <p className="error-copy">{error}</p> : null}
        <div className="calendar-month-command">
          <p>Use week view when you want the wider scan, then jump back into a day from month view.</p>
          <div className="calendar-inline-actions">
            <Link to="/app/easycalendar/month" className="button-secondary compact-button">Month</Link>
            <Link to="/app/easycalendar/day" className="ghost-button compact-button">Today</Link>
          </div>
        </div>
        <div className="quiet-metrics-row" aria-label="Week snapshot">
          <span>{events.length} events</span>
          <span>{taskBlocks.length} task blocks</span>
          <span>{formatDuration(totalMinutes)} scheduled</span>
        </div>
      </PageSection>

      <PageSection eyebrow="This Week" title="Week timeline">
        {isLoading ? <p className="helper-copy">Loading your calendar...</p> : null}
        <div className="calendar-week-surface">
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
                    items.map((item) => {
                      const editableDeadline = item.kind === "deadline" && events.some((event) => event.id === item.id);
                      return (
                      <button
                        key={`${item.kind}-${item.id}`}
                        type="button"
                        onClick={() => {
                          if (item.kind === "task-block") {
                            setSelectedBlockId(item.id);
                          } else if (item.kind === "event" || editableDeadline) {
                            setSelectedEventId(item.id);
                          }
                        }}
                        className={`calendar-block-vnext${item.kind === "deadline" ? " deadline" : item.isFlexible ? " flexible" : " fixed"}${item.isCompleted ? " completed" : ""}`}
                        style={
                          {
                            "--calendar-block-color": item.color,
                          } as CSSProperties
                        }
                        disabled={item.kind === "deadline" && !editableDeadline}
                      >
                        <strong>{item.title}</strong>
                        <span>{item.helper}</span>
                        <small>{item.badge}</small>
                      </button>
                    );
                    })
                  ) : (
                    <div className="empty-card-vnext planner-empty-card">
                      <p className="helper-copy">Open day - add an event or task block when you are ready to plan it.</p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
        </div>
      </PageSection>

      <details className="advanced-disclosure">
        <summary>Scheduling tools</summary>
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
      </details>

      <details className="advanced-disclosure">
        <summary>Categories</summary>
        <form className="calendar-category-form" onSubmit={(event) => void handleAddCategory(event)}>
          <label className="field-stack">
            <span>New category</span>
            <input
              type="text"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder="Computer science"
            />
          </label>
          <label className="field-stack">
            <span>Color</span>
            <input
              type="color"
              value={newCategoryColor}
              onChange={(event) => setNewCategoryColor(event.target.value)}
            />
          </label>
          <button type="submit" className="primary-button">
            Add Category
          </button>
        </form>
        {categoryMessage ? <p className="helper-copy">{categoryMessage}</p> : null}
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
                  aria-label={`Change ${category.name} color`}
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
                <label className="field-stack calendar-category-name-edit">
                  <span>Category</span>
                  <input
                    aria-label={`Rename ${category.name} category`}
                    value={categoryDrafts[category.id] ?? category.name}
                    onChange={(event) =>
                      setCategoryDrafts((current) => ({ ...current, [category.id]: event.target.value }))
                    }
                    onBlur={(event) => {
                      const nextName = event.target.value.trim();
                      if (!nextName || nextName === category.name) return;
                      const draft = {
                        name: nextName,
                        color: category.color,
                        type: nextName.toLowerCase().replace(/\s+/g, "-"),
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
              </div>
            </article>
          ))}
        </div>
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
