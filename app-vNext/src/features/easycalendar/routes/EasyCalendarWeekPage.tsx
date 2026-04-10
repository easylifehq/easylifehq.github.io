import type { CSSProperties } from "react";
import { PageSection } from "@/components/ui/PageSection";
import { CalendarComposer } from "@/features/easycalendar/components/CalendarComposer";
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
  const { categories, events, taskBlocks, isLoading, error } = useEasyCalendar();

  const weekStart = startOfWeek(new Date());
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const totalMinutes = days.reduce(
    (sum, day) => sum + getScheduledMinutesForDay(day, events, taskBlocks),
    0
  );

  return (
    <>
      <PageSection
        eyebrow="Capture"
        title="Add to your calendar"
        description="Create fixed events here or pull an active EasyList task straight into a flexible calendar block."
      >
        <CalendarComposer />
      </PageSection>

      <PageSection
        eyebrow="Week View"
        title="Live calendar foundation"
        description="This route is now connected to your real Firestore calendar data."
      >
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

      <PageSection
        eyebrow="This Week"
        title="Week timeline"
        description="Fixed events stay solid. Task blocks stay softer so they read as flexible."
      >
        {isLoading ? <p className="helper-copy">Loading your calendar...</p> : null}
        <div className="calendar-week-grid">
          {days.map((day) => {
            const items = getItemsForDay(day, events, taskBlocks, categories);
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
                      <article
                        key={`${item.kind}-${item.id}`}
                        className={`calendar-block-vnext${item.isFlexible ? " flexible" : " fixed"}${item.isCompleted ? " completed" : ""}`}
                        style={
                          {
                            "--calendar-block-color": item.color,
                          } as CSSProperties
                        }
                      >
                        <strong>{item.title}</strong>
                        <span>{item.helper}</span>
                        <small>{item.badge}</small>
                      </article>
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

      <PageSection
        eyebrow="Categories"
        title="Color system"
        description="These colors are what the calendar will use for full event and task blocks."
      >
        <div className="calendar-category-grid">
          {categories.map((category) => (
            <article key={category.id} className="calendar-category-card">
              <span
                className="calendar-category-swatch"
                style={{ backgroundColor: category.color }}
              />
              <div>
                <strong>{category.name}</strong>
                <p>{category.type || "custom"}</p>
              </div>
            </article>
          ))}
        </div>
      </PageSection>
    </>
  );
}
