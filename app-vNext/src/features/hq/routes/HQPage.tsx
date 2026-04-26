import { Link } from "react-router-dom";
import { useMemo } from "react";
import { PageSection } from "@/components/ui/PageSection";
import { useEasyCalendar } from "@/features/easycalendar/EasyCalendarContext";
import {
  formatDuration,
  formatTimeLabel,
  getOpenTimeWindowsForDay,
  startOfDay,
} from "@/features/easycalendar/lib/calendarUtils";
import { isCompletedToday, sortActiveTasks } from "@/features/easylist/lib/taskUtils";
import { useSettings } from "@/features/settings/SettingsContext";
import { useLastAppRoute } from "@/lib/mobile/appRouteMemory";
import { useMobileRuntime } from "@/lib/mobile/useMobileRuntime";

const demoPath = [
  {
    label: "EasyList",
    title: "Capture one task",
    description: "Add one task, set its urgency, and make the list useful quickly.",
    to: "/app/easylist/add",
  },
  {
    label: "EasyNotes",
    title: "Write one messy note",
    description: "Open a blank note and turn useful lines into tasks or a project later.",
    to: "/app/easynotes/new",
  },
  {
    label: "EasyCalendar",
    title: "Put work into time",
    description: "Open day view and place flexible task blocks beside fixed events.",
    to: "/app/easycalendar/day",
  },
  {
    label: "Settings",
    title: "Show control",
    description: "Open Settings for themes, visible apps, calendar wake time, and labs.",
    to: "/app/settings",
  },
];

function isSameDate(left: Date | null, right: Date) {
  return Boolean(left && startOfDay(left).getTime() === startOfDay(right).getTime());
}

export function HQPage() {
  const { events, taskBlocks, tasks, isLoading, error } = useEasyCalendar();
  const { isAppVisible, isExperimentalFeatureEnabled } = useSettings();
  const mobileRuntime = useMobileRuntime();
  const lastAppRoute = useLastAppRoute();
  const showPlanningPreview = isExperimentalFeatureEnabled("dailyReview");
  const today = startOfDay(new Date());

  const todayEvents = events
    .filter((event) => event.startAt && startOfDay(event.startAt).getTime() === today.getTime())
    .sort((left, right) => (left.startAt?.getTime() || 0) - (right.startAt?.getTime() || 0));
  const nextEvents = todayEvents.slice(0, 3);
  const topTasks = sortActiveTasks(tasks.filter((task) => !task.completed)).slice(0, 3);
  const dueTodayTasks = sortActiveTasks(tasks.filter((task) => !task.completed && isSameDate(task.dueDate, today)));
  const overdueTasks = sortActiveTasks(tasks.filter((task) => !task.completed && task.dueDate && startOfDay(task.dueDate).getTime() < today.getTime()));
  const openWindows = getOpenTimeWindowsForDay(today, events, taskBlocks);
  const openMinutes = openWindows.reduce((sum, window) => sum + window.minutes, 0);
  const completedTodayCount = tasks.filter(isCompletedToday).length;
  const mostUrgent = overdueTasks[0] || dueTodayTasks[0] || null;
  const mostUrgentLabel = overdueTasks[0]?.title || dueTodayTasks[0]?.title || "";
  const quickWin = sortActiveTasks(tasks.filter((task) => !task.completed && (task.estimatedLength || 999) <= 20))[0] || null;
  const startHere = useMemo(() => {
    if (overdueTasks.length || dueTodayTasks.length) {
      return {
        label: "Start in EasyList",
        reason: `${overdueTasks.length + dueTodayTasks.length} task${overdueTasks.length + dueTodayTasks.length === 1 ? "" : "s"} need attention.`,
        to: "/app/easylist/dashboard",
      };
    }
    if (openWindows.length >= 3) {
      return {
        label: "Start in EasyCalendar",
        reason: "You have open room that could use a light plan.",
        to: "/app/easycalendar/day",
      };
    }
    return {
      label: "Start in EasyNotes",
      reason: "Everything looks calm, so a quick brain dump is a good next move.",
      to: "/app/easynotes",
    };
  }, [dueTodayTasks.length, openWindows.length, overdueTasks.length]);

  return (
    <main className="page-wrap app-theme app-theme-easyhq">
      {error ? <p className="error-copy">{error}</p> : null}

      <section className="hq-command-center" aria-labelledby="hq-title">
        <div className="hq-command-copy">
          <p className="eyebrow">EasyHQ</p>
          <h1 id="hq-title">Daily workspace</h1>
          <p>Start with the next useful move. Everything else can stay quiet until you need it.</p>
        </div>

        <article className="hq-start-card">
          <span className="settings-state-pill">Start here</span>
          <strong>{startHere.label}</strong>
          <p>{startHere.reason}</p>
          <div className="task-composer-actions">
            <Link to={startHere.to} className="primary-button">
              Go there
            </Link>
            {lastAppRoute ? (
              <Link to={lastAppRoute.path} className="button-secondary">
                Resume {lastAppRoute.label}
              </Link>
            ) : null}
          </div>
        </article>
      </section>

      <div className="hq-status-strip" aria-label="Today at a glance">
        <article>
          <span>Next</span>
          <strong>{nextEvents[0] ? nextEvents[0].title || "Untitled event" : "Nothing scheduled"}</strong>
          <p>
            {nextEvents[0]
              ? nextEvents[0].allDay
                ? "All day"
                : `${formatTimeLabel(nextEvents[0].startAt)} - ${formatTimeLabel(nextEvents[0].endAt)}`
              : "The calendar is clear."}
          </p>
        </article>
        <article>
          <span>Focus</span>
          <strong>{mostUrgent ? mostUrgentLabel : quickWin ? quickWin.title : "No task is shouting"}</strong>
          <p>{overdueTasks.length ? `${overdueTasks.length} overdue` : dueTodayTasks.length ? `${dueTodayTasks.length} due today` : quickWin ? "Quick win available" : "Good room to choose."}</p>
        </article>
        <article>
          <span>Room</span>
          <strong>{formatDuration(openMinutes)}</strong>
          <p>{openWindows.length >= 3 ? "Flexible day" : openWindows.length ? "Some space open" : "Mostly packed"}</p>
        </article>
      </div>

      <PageSection eyebrow="Move fast" title="Quick actions">
        <div className="hq-action-row">
          {isAppVisible("easylist") ? (
            <Link className="hq-link-card hq-link-card-primary" to="/app/easylist/add">
              <strong>Add task</strong>
              <p>Capture what is on your mind.</p>
            </Link>
          ) : null}
          {isAppVisible("easynotes") ? (
            <Link className="hq-link-card" to="/app/easynotes/new">
              <strong>Blank note</strong>
              <p>Start writing immediately.</p>
            </Link>
          ) : null}
          {isAppVisible("easycalendar") ? (
            <Link className="hq-link-card" to="/app/easycalendar/day">
              <strong>Today</strong>
              <p>See the day in time.</p>
            </Link>
          ) : null}
          {isAppVisible("easyworkout") ? (
            <Link className="hq-link-card" to="/app/easyworkout/log?workoutMode=1">
              <strong>Start workout</strong>
              <p>Open workout mode.</p>
            </Link>
          ) : null}
        </div>
      </PageSection>

      {!mobileRuntime.isStandalone ? (
        <Link className="hq-install-card" to="/app/settings?section=install">
          <span className="settings-state-pill">Mobile</span>
          <strong>Install EasyLife on your phone</strong>
          <p>Add it to your home screen from Settings so it opens like an app.</p>
        </Link>
      ) : null}

      {isExperimentalFeatureEnabled("dailyReview") ? (
        <details className="advanced-disclosure">
          <summary>Deeper daily read</summary>
          <div className="daily-review-grid">
            <article className="stat-card-vnext">
              <span>Due now</span>
              <strong>{dueTodayTasks.length}</strong>
            </article>
            <article className="stat-card-vnext">
              <span>Behind</span>
              <strong>{overdueTasks.length}</strong>
            </article>
            <article className="stat-card-vnext">
              <span>Finished</span>
              <strong>{completedTodayCount}</strong>
            </article>
            <article className="stat-card-vnext">
              <span>Open room</span>
              <strong>{formatDuration(openMinutes)}</strong>
            </article>
            <article className="stat-card-vnext">
              <span>Events today</span>
              <strong>{todayEvents.length}</strong>
            </article>
          </div>
          <div className="dashboard-grid daily-review-followup">
            <article className="mini-panel-vnext">
              <span>Read</span>
              <strong>
                {overdueTasks.length
                  ? "A few things need recovery, but this is fixable."
                  : dueTodayTasks.length > 4
                    ? "Today is loaded. Keep the plan simple."
                    : "The day looks calm enough to steer intentionally."}
              </strong>
            </article>
            <article className="mini-panel-vnext">
              <span>Most urgent</span>
              <strong>{mostUrgent ? mostUrgentLabel : "Nothing is shouting right now."}</strong>
            </article>
            <article className="mini-panel-vnext">
              <span>Quick win</span>
              <strong>{quickWin ? quickWin.title : "No tiny task is waiting."}</strong>
            </article>
            {isExperimentalFeatureEnabled("startHere") ? (
              <article className="mini-panel-vnext start-here-card">
                <span>Start Here</span>
                <strong>{startHere.label}</strong>
                <p>{startHere.reason}</p>
                <Link to={startHere.to} className="primary-button compact-button">
                  Go there
                </Link>
              </article>
            ) : null}
          </div>
        </details>
      ) : null}

      {showPlanningPreview ? (
        <details className="advanced-disclosure">
          <summary>Presentation flow</summary>
          {isLoading ? <p className="helper-copy">Loading today&apos;s events...</p> : null}
          <div className="hq-demo-path">
            {demoPath.map((step, index) => (
              <Link key={step.title} to={step.to} className="hq-demo-step">
                <span>{index + 1}</span>
                <div>
                  <small>{step.label}</small>
                  <strong>{step.title}</strong>
                  <p>{step.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </details>
      ) : null}
    </main>
  );
}
