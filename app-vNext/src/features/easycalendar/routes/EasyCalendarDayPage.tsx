import type { CSSProperties } from "react";
import { PageSection } from "@/components/ui/PageSection";
import { useEasyCalendar } from "@/features/easycalendar/EasyCalendarContext";
import {
  formatDuration,
  formatLongDate,
  getItemsForDay,
  getScheduledMinutesForDay,
  startOfDay,
} from "@/features/easycalendar/lib/calendarUtils";

export function EasyCalendarDayPage() {
  const { categories, events, taskBlocks, isLoading, error } = useEasyCalendar();
  const today = startOfDay(new Date());
  const items = getItemsForDay(today, events, taskBlocks, categories);
  const scheduledMinutes = getScheduledMinutesForDay(today, events, taskBlocks);
  const fixedEventCount = items.filter((item) => item.kind === "event").length;
  const taskBlockCount = items.filter((item) => item.kind === "task-block").length;
  const isOverloaded = scheduledMinutes > 9 * 60;

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
        description="This is the live day-level base the planning engine will build on."
      >
        {isLoading ? <p className="helper-copy">Loading today's schedule...</p> : null}
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
              <article
                key={`${item.kind}-${item.id}`}
                className={`calendar-detail-card${item.isFlexible ? " flexible" : " fixed"}${item.isCompleted ? " completed" : ""}`}
                style={
                  {
                    "--calendar-block-color": item.color,
                  } as CSSProperties
                }
              >
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.helper}</p>
                </div>
                <span>{item.badge}</span>
              </article>
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
    </>
  );
}
