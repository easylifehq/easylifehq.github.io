import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { PageSection } from "@/components/ui/PageSection";
import { useEasyCalendar } from "@/features/easycalendar/EasyCalendarContext";
import {
  buildPlanMyDaySuggestions,
  formatDuration,
  formatTimeLabel,
  getOpenTimeWindowsForDay,
  startOfDay,
} from "@/features/easycalendar/lib/calendarUtils";
import { formatDate, isCompletedToday, sortActiveTasks } from "@/features/easylist/lib/taskUtils";
import { useAuth } from "@/features/auth/AuthContext";
import { useSettings } from "@/features/settings/SettingsContext";
import { subscribeToApplications, type ApplicationRecord } from "@/lib/firestore/applications";
import { subscribeToWorkoutSessions, type WorkoutSessionRecord } from "@/lib/firestore/workoutSessions";
import { useLastAppRoute } from "@/lib/mobile/appRouteMemory";
import { buildNotificationPreview } from "@/lib/mobile/notificationPreview";
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

function toDateKey(date: Date) {
  return date.toISOString().split("T")[0];
}

function isSameDate(left: Date | null, right: Date) {
  return Boolean(left && startOfDay(left).getTime() === startOfDay(right).getTime());
}

export function HQPage() {
  const { user } = useAuth();
  const { events, taskBlocks, tasks, isLoading, error } = useEasyCalendar();
  const { settings, isAppVisible, isExperimentalFeatureEnabled } = useSettings();
  const mobileRuntime = useMobileRuntime();
  const lastAppRoute = useLastAppRoute();
  const showPlanningPreview = isExperimentalFeatureEnabled("dailyReview");
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSessionRecord[]>([]);
  const today = startOfDay(new Date());
  const todayKey = toDateKey(today);

  useEffect(() => {
    if (!user || !isExperimentalFeatureEnabled("dailyReview")) {
      setApplications([]);
      setWorkoutSessions([]);
      return;
    }

    const unsubscribeApps = subscribeToApplications(user.uid, setApplications);
    const unsubscribeWorkouts = subscribeToWorkoutSessions(user.uid, setWorkoutSessions);
    return () => {
      unsubscribeApps();
      unsubscribeWorkouts();
    };
  }, [user, isExperimentalFeatureEnabled]);

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
  const planPreview = buildPlanMyDaySuggestions(today, tasks, events, taskBlocks).suggestions.slice(0, 3);
  const notificationPreview = buildNotificationPreview(settings.notifications, tasks, events, taskBlocks);
  const followUpsDueToday = applications.filter((app) => app.nextFollowUp && app.nextFollowUp <= todayKey && app.status !== "archived");
  const weeklyWorkouts = workoutSessions.filter((session) => {
    const performed = new Date(`${session.performedOn}T00:00:00`);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    return session.performedOn && performed >= sevenDaysAgo;
  });
  const mostUrgent = overdueTasks[0] || dueTodayTasks[0] || followUpsDueToday[0] || null;
  const mostUrgentLabel =
    overdueTasks[0]?.title ||
    dueTodayTasks[0]?.title ||
    (followUpsDueToday[0] ? `${followUpsDueToday[0].company || followUpsDueToday[0].title} follow-up` : "");
  const quickWin = sortActiveTasks(tasks.filter((task) => !task.completed && (task.estimatedLength || 999) <= 20))[0] || null;
  const startHere = useMemo(() => {
    if (overdueTasks.length || dueTodayTasks.length) {
      return {
        label: "Start in EasyList",
        reason: `${overdueTasks.length + dueTodayTasks.length} task${overdueTasks.length + dueTodayTasks.length === 1 ? "" : "s"} need attention.`,
        to: "/app/easylist/dashboard",
      };
    }
    if (followUpsDueToday.length) {
      return {
        label: "Start in EasyPipeline",
        reason: `${followUpsDueToday.length} follow-up${followUpsDueToday.length === 1 ? "" : "s"} due today.`,
        to: "/app/easypipeline/dashboard",
      };
    }
    if (openWindows.length >= 3) {
      return {
        label: "Start in EasyCalendar",
        reason: "You have open room that could use a light plan.",
        to: "/app/easycalendar/day",
      };
    }
    if (!weeklyWorkouts.length) {
      return {
        label: "Start in EasyWorkout",
        reason: "No workouts are logged this week yet.",
        to: "/app/easyworkout/log",
      };
    }
    return {
      label: "Start in EasyNotes",
      reason: "Everything looks calm, so a quick brain dump is a good next move.",
      to: "/app/easynotes",
    };
  }, [dueTodayTasks.length, followUpsDueToday.length, openWindows.length, overdueTasks.length, weeklyWorkouts.length]);

  return (
    <main className="page-wrap app-theme app-theme-easyhq">
      {error ? <p className="error-copy">{error}</p> : null}

      <PageSection
        eyebrow="Start simple"
        title="Use the core first"
        description="Start with one task, one note, and one calendar handoff. The rest of the suite can open up when it helps."
      >
        {!mobileRuntime.isStandalone ? (
          <Link className="hq-install-card" to="/app/settings?section=install">
            <span className="settings-state-pill">Mobile</span>
            <strong>Install EasyLife on your phone</strong>
            <p>Add it to your home screen from Settings so it opens like an app.</p>
          </Link>
        ) : null}
        {lastAppRoute ? (
          <Link className="hq-resume-card" to={lastAppRoute.path}>
            <span className="settings-state-pill">Resume</span>
            <strong>Pick up in {lastAppRoute.label}</strong>
            <p>Return to the last app screen you were using.</p>
          </Link>
        ) : null}
        <div className="onboarding-steps-grid">
          <Link className="hq-link-card hq-link-card-primary" to="/app/easylist/add">
            <span className="info-pill">1</span>
            <strong>Add what is on your mind</strong>
            <p>Capture the loose work first.</p>
          </Link>
          <Link className="hq-link-card" to="/app/easynotes/new">
            <span className="info-pill">2</span>
            <strong>Write messy thoughts</strong>
            <p>Keep ideas somewhere calm.</p>
          </Link>
          <Link className="hq-link-card" to="/app/easycalendar/day">
            <span className="info-pill">3</span>
            <strong>Put work into time</strong>
            <p>Make the plan visible.</p>
          </Link>
          <Link className="hq-link-card" to="/app/settings">
            <span className="info-pill">Later</span>
            <strong>Turn on more apps</strong>
            <p>Add projects, pipeline, contacts, workouts, and stats when they help.</p>
          </Link>
        </div>
      </PageSection>

      <PageSection
        eyebrow="Demo Path"
        title="Show this flow first"
        description="A quick walkthrough for explaining the suite without opening every page."
      >
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
      </PageSection>

      <div className="dashboard-grid">
        <PageSection
          eyebrow="Today"
          title="Daily snapshot"
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
              <span>Open tasks</span>
              <strong>{topTasks.length} ready</strong>
            </article>
          </div>
        </PageSection>

        <PageSection
          eyebrow="Reminders"
          title="Notification preview"
          description="Upcoming reminders EasyLife is allowed to prepare based on your Settings choices."
        >
          <div className="hq-list">
            {notificationPreview.length ? (
              notificationPreview.map((item) => (
                <article key={item.id} className="hq-list-card">
                  <span className="settings-card-topline">
                    <span>{item.label}</span>
                    <span className="settings-state-pill">Preview</span>
                  </span>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </article>
              ))
            ) : (
              <article className="hq-list-card">
                <strong>No reminders queued</strong>
                <p>Turn on notification categories in Settings or add dated tasks and calendar blocks.</p>
              </article>
            )}
          </div>
        </PageSection>

        <PageSection
          eyebrow="Launch"
          title="Quick entry points"
        >
          <div className="hq-link-grid">
            {isAppVisible("easylist") ? (
              <Link className="hq-link-card hq-link-card-primary" to="/app/easylist/add">
                <strong>Add tasks</strong>
              </Link>
            ) : null}
            {isAppVisible("easycalendar") ? (
              <Link className="hq-link-card" to="/app/easycalendar/day">
                <strong>See today</strong>
              </Link>
            ) : null}
            {showPlanningPreview && isAppVisible("easycalendar") ? (
              <Link className="hq-link-card" to="/app/easycalendar/day">
                <strong>Plan My Day</strong>
              </Link>
            ) : null}
            {isAppVisible("easynotes") ? (
              <Link className="hq-link-card" to="/app/easynotes/new">
                <strong>Blank note</strong>
              </Link>
            ) : null}
            {isAppVisible("easypipeline") ? (
              <Link className="hq-link-card" to="/app/easypipeline/dashboard">
                <strong>Open EasyPipeline</strong>
              </Link>
            ) : null}
            {isAppVisible("easycontacts") ? (
              <Link className="hq-link-card" to="/app/easycontacts">
                <strong>Open EasyContacts</strong>
              </Link>
            ) : null}
            {isAppVisible("easyprojects") ? (
              <Link className="hq-link-card" to="/app/easyprojects">
                <strong>Open EasyProjects</strong>
              </Link>
            ) : null}
            {isAppVisible("easyworkout") ? (
              <Link className="hq-link-card" to="/app/easyworkout/log">
                <strong>Log a workout</strong>
              </Link>
            ) : null}
          </div>
        </PageSection>
      </div>

      {isExperimentalFeatureEnabled("dailyReview") ? (
        <PageSection
          eyebrow="Experimental"
          title="Daily Review"
        >
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
            <article className="stat-card-vnext">
              <span>Follow-ups</span>
              <strong>{followUpsDueToday.length}</strong>
            </article>
            <article className="stat-card-vnext">
              <span>Workouts this week</span>
              <strong>{weeklyWorkouts.length}</strong>
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
        </PageSection>
      ) : null}

      {showPlanningPreview ? (
        <>
      <div className="dashboard-grid">
        <PageSection
          eyebrow="Next up"
          title="Fixed events"
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
        </>
      ) : null}
    </main>
  );
}
