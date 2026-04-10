import { Link } from "react-router-dom";
import { AppWorkspaceHeader } from "@/components/navigation/AppWorkspaceHeader";
import { PageSection } from "@/components/ui/PageSection";
import { useEasyCalendar } from "@/features/easycalendar/EasyCalendarContext";
import {
  buildPlanMyDaySuggestions,
  formatDuration,
  formatLongDate,
  formatTimeLabel,
  getOpenTimeWindowsForDay,
  startOfDay,
} from "@/features/easycalendar/lib/calendarUtils";
import { formatDate, isCompletedToday, sortActiveTasks } from "@/features/easylist/lib/taskUtils";
import { useSettings } from "@/features/settings/SettingsContext";

export function HQPage() {
  const { events, taskBlocks, tasks, isLoading, error } = useEasyCalendar();
  const { isAppVisible } = useSettings();
  const today = startOfDay(new Date());
  const todayEvents = events
    .filter((event) => event.startAt && startOfDay(event.startAt).getTime() === today.getTime())
    .sort((left, right) => (left.startAt?.getTime() || 0) - (right.startAt?.getTime() || 0));
  const nextEvents = todayEvents.slice(0, 3);
  const topTasks = sortActiveTasks(tasks.filter((task) => !task.completed)).slice(0, 3);
  const openWindows = getOpenTimeWindowsForDay(today, events, taskBlocks);
  const openMinutes = openWindows.reduce((sum, window) => sum + window.minutes, 0);
  const completedTodayCount = tasks.filter(isCompletedToday).length;
  const planPreview = buildPlanMyDaySuggestions(today, tasks, events, taskBlocks).suggestions.slice(0, 3);

  return (
    <main className="page-wrap app-theme app-theme-easyhq">
      <AppWorkspaceHeader
        appLabel="EasyHQ"
        title="Your control center."
        description={`${formatLongDate(today)}. ${openWindows.length
          ? `You still have ${formatDuration(openMinutes)} open today.`
          : "Your day is fully spoken for right now."}`}
        currentAppHref="/app/hq"
      />

      {error ? <p className="error-copy">{error}</p> : null}

      <div className="dashboard-grid">
        <PageSection
          eyebrow="Today"
          title="Daily snapshot"
          description="A quick read on what is fixed, what matters, and how much room you still have."
        >
          <div className="stats-grid">
            <article className="stat-card-vnext">
              <span>Next events</span>
              <strong>{nextEvents.length}</strong>
            </article>
            <article className="stat-card-vnext">
              <span>Open time</span>
              <strong>{formatDuration(openMinutes)}</strong>
            </article>
            <article className="stat-card-vnext">
              <span>Done today</span>
              <strong>{completedTodayCount}</strong>
            </article>
          </div>

          <div className="hq-summary-grid">
            <article className="mini-panel-vnext">
              <span>Today feels</span>
              <strong>{openWindows.length >= 3 ? "Flexible" : openWindows.length >= 1 ? "Structured" : "Packed"}</strong>
            </article>
            <article className="mini-panel-vnext">
              <span>Suggested plan</span>
              <strong>{planPreview.length} task{planPreview.length === 1 ? "" : "s"} ready</strong>
            </article>
          </div>
        </PageSection>

        <PageSection
          eyebrow="Launch"
          title="Quick entry points"
          description="Jump straight into the workspace you need."
        >
          <div className="hq-link-grid">
            {isAppVisible("easylist") ? (
              <Link className="hq-link-card" to="/app/easylist/dashboard">
                <strong>Open EasyList</strong>
                <p>Review priorities, inbox, and what still needs to get done.</p>
              </Link>
            ) : null}
            {isAppVisible("easycalendar") ? (
              <Link className="hq-link-card" to="/app/easycalendar/day">
                <strong>Open EasyCalendar</strong>
                <p>See today, move blocks, and adjust your schedule fast.</p>
              </Link>
            ) : null}
            {isAppVisible("easycalendar") ? (
              <Link className="hq-link-card" to="/app/easycalendar/day">
                <strong>Plan My Day</strong>
                <p>Run the day-planning pass and turn open time into progress.</p>
              </Link>
            ) : null}
            {isAppVisible("easynotes") ? (
              <Link className="hq-link-card" to="/app/easynotes">
                <strong>Open EasyNotes</strong>
                <p>Jot down rough thoughts, meeting notes, and drafts for later.</p>
              </Link>
            ) : null}
            {isAppVisible("easypipeline") ? (
              <Link className="hq-link-card" to="/app/easypipeline/dashboard">
                <strong>Open EasyPipeline</strong>
                <p>Review applications, follow-ups, and job-search momentum.</p>
              </Link>
            ) : null}
            {isAppVisible("easycontacts") ? (
              <Link className="hq-link-card" to="/app/easycontacts">
                <strong>Open EasyContacts</strong>
                <p>Keep track of people, follow-ups, and networking context.</p>
              </Link>
            ) : null}
          </div>
        </PageSection>
      </div>

      <div className="dashboard-grid">
        <PageSection
          eyebrow="Next up"
          title="Fixed events"
          description="The next commitments on today’s calendar."
        >
          {isLoading ? <p className="helper-copy">Loading today&apos;s events...</p> : null}
          <div className="hq-list">
            {nextEvents.length ? (
              nextEvents.map((event) => (
                <article key={event.id} className="hq-list-card">
                  <strong>{event.title || "Untitled event"}</strong>
                  <p>
                    {event.allDay
                      ? "All day"
                      : `${formatTimeLabel(event.startAt)} - ${formatTimeLabel(event.endAt)}`}
                  </p>
                </article>
              ))
            ) : (
              <div className="empty-card-vnext">No fixed events scheduled for today.</div>
            )}
          </div>
        </PageSection>

        <PageSection
          eyebrow="Focus"
          title="Top tasks"
          description="The tasks most worth caring about today."
        >
          <div className="hq-list">
            {topTasks.length ? (
              topTasks.map((task) => (
                <article key={task.id} className="hq-list-card">
                  <strong>{task.title || "Untitled task"}</strong>
                  <p>
                    {task.category || "No category"}
                    {task.dueDate ? ` | Due ${formatDate(task.dueDate, true)}` : " | No due date"}
                  </p>
                </article>
              ))
            ) : (
              <div className="empty-card-vnext">No active tasks to surface right now.</div>
            )}
          </div>
        </PageSection>
      </div>

      <PageSection
        eyebrow="Preview"
        title="What Plan My Day would place"
        description="A quick preview of the tasks the planner wants to fit into your remaining open windows."
      >
        <div className="hq-list">
          {planPreview.length ? (
            planPreview.map((suggestion) => (
              <article key={suggestion.task.id} className="hq-list-card">
                <strong>{suggestion.task.title || "Untitled task"}</strong>
                <p>
                  {formatTimeLabel(suggestion.startAt)} - {formatTimeLabel(suggestion.endAt)}
                </p>
              </article>
            ))
          ) : (
            <div className="empty-card-vnext">
              Nothing is ready to auto-suggest right now. Either the day is full or the open tasks need clearer durations.
            </div>
          )}
        </div>
      </PageSection>
    </main>
  );
}
