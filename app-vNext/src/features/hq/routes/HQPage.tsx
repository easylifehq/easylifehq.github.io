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

type TodayContextItem = {
  label: string;
  title: string;
  detail: string;
  to: string;
};

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
  const activeTaskCount = tasks.filter((task) => !task.completed).length;
  const dueTodayTasks = sortActiveTasks(tasks.filter((task) => !task.completed && isSameDate(task.dueDate, today)));
  const overdueTasks = sortActiveTasks(tasks.filter((task) => !task.completed && task.dueDate && startOfDay(task.dueDate).getTime() < today.getTime()));
  const openWindows = getOpenTimeWindowsForDay(today, events, taskBlocks);
  const openMinutes = openWindows.reduce((sum, window) => sum + window.minutes, 0);
  const completedTodayCount = tasks.filter(isCompletedToday).length;
  const mostUrgent = overdueTasks[0] || dueTodayTasks[0] || null;
  const mostUrgentLabel = overdueTasks[0]?.title || dueTodayTasks[0]?.title || "";
  const quickWin = sortActiveTasks(tasks.filter((task) => !task.completed && (task.estimatedLength || 999) <= 20))[0] || null;
  const todaySummary = [
    `${overdueTasks.length + dueTodayTasks.length} due`,
    `${todayEvents.length} event${todayEvents.length === 1 ? "" : "s"}`,
    `${formatDuration(openMinutes)} open`,
  ];
  const taskStatusLabel = overdueTasks.length
    ? "Overdue task"
    : dueTodayTasks.length
      ? "Due today"
      : quickWin
        ? "Quick win"
        : "Tasks";
  const calendarStatusLabel = nextEvents[0] ? "Next event" : "Calendar";
  const progressStatusLabel = completedTodayCount ? "Done today" : "Open room";
  const startHere = useMemo(() => {
    const firstDueTask = overdueTasks[0] || dueTodayTasks[0] || null;
    const firstOpenWindow = openWindows[0] || null;

    if (firstDueTask) {
      return {
        label: firstDueTask.title || "Untitled task",
        reason: overdueTasks.length
          ? "This is behind. Handle it, reschedule it, or intentionally release it before checking the rest."
          : "This is due today. Decide the next step before opening the module list.",
        buttonLabel: "Open task list",
        to: "/app/easylist/dashboard",
      };
    }
    if (quickWin) {
      return {
        label: quickWin.title || "Untitled task",
        reason: `${quickWin.estimatedLength || 20} minutes. Clear this small task while the day still has room.`,
        buttonLabel: "Open task list",
        to: "/app/easylist/dashboard",
      };
    }
    if (openWindows.length >= 3) {
      return {
        label: firstOpenWindow
          ? `Plan the ${formatTimeLabel(firstOpenWindow.startAt)} open window`
          : "Plan open time",
        reason: "Give the next open window a light plan before adding more to the day.",
        buttonLabel: "Open Calendar",
        to: "/app/easycalendar/day",
      };
    }
    return {
      label: "Capture the next note",
      reason: "Everything looks calm, so a quick note can keep loose thoughts out of the way.",
      buttonLabel: "Open Notes",
      to: "/app/easynotes",
    };
  }, [dueTodayTasks, openWindows, overdueTasks, quickWin]);

  const dayPhase = new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening";
  const nextOpenWindow = openWindows[0];
  const followUpTasks = sortActiveTasks(
    tasks.filter((task) => {
      if (task.completed || task.deletedAt) return false;
      const searchableText = `${task.title} ${task.notes} ${task.category} ${task.listName}`.toLowerCase();
      return /\b(email|reply|respond|follow up|follow-up|call|text|message)\b/.test(searchableText);
    })
  );
  const contextSignals = [
    overdueTasks.length || dueTodayTasks.length
      ? {
          label: overdueTasks.length ? "Due recovery" : "Due work",
          title: overdueTasks.length
            ? `${overdueTasks.length} overdue`
            : `${dueTodayTasks.length} due today`,
          detail: mostUrgentLabel || "Open the list and choose the next step.",
          to: "/app/easylist/dashboard",
        }
      : null,
    nextEvents[0]
      ? {
          label: todayEvents.length >= 3 ? "Calendar pressure" : "Calendar",
          title: nextEvents[0].title || "Untitled event",
          detail: nextEvents[0].allDay
            ? "All day"
            : `${formatTimeLabel(nextEvents[0].startAt)} - ${formatTimeLabel(nextEvents[0].endAt)}`,
          to: "/app/easycalendar/day",
        }
      : null,
    followUpTasks[0]
      ? {
          label: "Follow-up hint",
          title: followUpTasks[0].title || "Untitled follow-up",
          detail: followUpTasks[0].dueDate ? "Already dated in the list." : "No date yet. Decide whether it belongs today.",
          to: "/app/easylist/email",
        }
      : null,
    nextOpenWindow
      ? {
          label: "Open room",
          title: `${formatDuration(nextOpenWindow.minutes)} open`,
          detail: `Starts around ${formatTimeLabel(nextOpenWindow.startAt)}`,
          to: "/app/easycalendar/day",
        }
      : null,
  ].filter((item): item is TodayContextItem => Boolean(item));
  const contextItems = (contextSignals.length
    ? contextSignals
    : [
        {
          label: "Open room",
          title: "No pressure is standing out",
          detail: "Capture a loose thought or keep the day open.",
          to: "/app/easylist/add",
        },
      ]).slice(0, 3);
  const contextLead = contextItems[0]?.title || "No pressure is standing out.";
  const attentionItems = [
    overdueTasks[0]
      ? {
          label: "Recover",
          title: overdueTasks[0].title,
          detail: "This is behind. Handle, reschedule, or intentionally release it.",
          to: "/app/easylist/dashboard",
        }
      : null,
    dueTodayTasks[0]
      ? {
          label: "Due today",
          title: dueTodayTasks[0].title,
          detail: `${dueTodayTasks.length} due item${dueTodayTasks.length === 1 ? "" : "s"} still need a decision.`,
          to: "/app/easylist/dashboard",
        }
      : null,
    nextEvents[0]
      ? {
          label: "Next on calendar",
          title: nextEvents[0].title || "Untitled event",
          detail: nextEvents[0].allDay
            ? "All day"
            : `${formatTimeLabel(nextEvents[0].startAt)} - ${formatTimeLabel(nextEvents[0].endAt)}`,
          to: "/app/easycalendar/day",
        }
      : null,
    quickWin
      ? {
          label: "Tiny win",
          title: quickWin.title,
          detail: `${quickWin.estimatedLength || 20} minutes. Good for a small gap.`,
          to: "/app/easylist/dashboard",
        }
      : null,
  ].filter((item): item is { label: string; title: string; detail: string; to: string } => Boolean(item)).slice(0, 3);
  const assistantRead = overdueTasks.length
    ? "There is one small recovery thread. Clear that first, then the day gets easier."
    : dueTodayTasks.length > 3
      ? "Today has enough moving parts. Pick one list, one time block, and keep the rest quiet."
      : nextEvents.length
        ? "The calendar has shape. Use the open windows for the work that would otherwise leak."
        : "The day is open. Capture the loose ends now so they do not become noise later.";
  const systems = [
    {
      label: "List",
      title: `${activeTaskCount} open`,
      detail: mostUrgent ? mostUrgentLabel : "Nothing urgent is waiting.",
      to: "/app/easylist/dashboard",
      visible: isAppVisible("easylist"),
    },
    {
      label: "Email",
      title: "Triage",
      detail: "Pull real asks out of inbox noise before they slip.",
      to: "/app/easylist/email",
      visible: isAppVisible("easylist"),
    },
    {
      label: "Calendar",
      title: nextEvents[0] ? nextEvents[0].title || "Next event" : "Open day",
      detail: nextOpenWindow
        ? `${formatDuration(nextOpenWindow.minutes)} open around ${formatTimeLabel(nextOpenWindow.startAt)}`
        : `${todayEvents.length} event${todayEvents.length === 1 ? "" : "s"} today`,
      to: "/app/easycalendar/day",
      visible: isAppVisible("easycalendar"),
    },
    {
      label: "Notes",
      title: "Capture",
      detail: "Park the messy thought before it becomes another task.",
      to: "/app/easynotes/new",
      visible: isAppVisible("easynotes"),
    },
    {
      label: "Projects",
      title: "Longer arc",
      detail: "Keep plans connected to tasks without crowding today.",
      to: "/app/easyprojects",
      visible: isAppVisible("easyprojects"),
    },
  ];
  return (
    <main className="page-wrap app-theme app-theme-easyhq">
      {error ? <p className="error-copy">{error}</p> : null}

      <section className="assistant-home" aria-labelledby="hq-title">
        <article className="hq-start-card">
          <div className="hq-start-heading">
            <div>
              <p>{dayPhase} brief</p>
              <h1 id="hq-title">Choose today&apos;s next move.</h1>
            </div>
            <span>EasyLifeHQ</span>
          </div>
          <strong>{assistantRead}</strong>
          <div className="hq-today-summary" aria-label="Today summary">
            <span>Today</span>
            <p>{todaySummary.join(" / ")}</p>
          </div>
          <details className="hq-context-stack">
            <summary>
              <span>Context</span>
              <strong>{contextLead}</strong>
            </summary>
            <div>
              {contextItems.map((item) => (
                <Link to={item.to} key={`${item.label}-${item.title}`}>
                  <span>{item.label}</span>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </Link>
              ))}
            </div>
          </details>
          <div className="assistant-next-inline" aria-labelledby="assistant-next-title">
            <div>
              <span>Next best move</span>
              <h2 id="assistant-next-title">{startHere.label}</h2>
              <p>{startHere.reason}</p>
            </div>
            <div className="task-composer-actions">
              <Link to={startHere.to} className="primary-button">
                {startHere.buttonLabel}
              </Link>
              {lastAppRoute ? (
                <Link to={lastAppRoute.path} className="button-secondary">
                  Resume {lastAppRoute.label}
                </Link>
              ) : null}
              <Link to="/app/easylist/add" className="button-secondary">
                Add task
              </Link>
            </div>
          </div>
        </article>

        <div className="hq-status-strip" aria-label="Module status context">
          <article>
            <span>{calendarStatusLabel}</span>
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
            <span>{taskStatusLabel}</span>
            <strong>{mostUrgent ? mostUrgentLabel : quickWin ? quickWin.title : "No task is shouting"}</strong>
            <p>{overdueTasks.length ? `${overdueTasks.length} overdue` : dueTodayTasks.length ? `${dueTodayTasks.length} due today` : quickWin ? "Quick win available" : "Good room to choose."}</p>
          </article>
          <article className="hq-status-secondary">
            <span>{progressStatusLabel}</span>
            <strong>
              {activeTaskCount} open task{activeTaskCount === 1 ? "" : "s"} / {todayEvents.length} event
              {todayEvents.length === 1 ? "" : "s"}
            </strong>
            <p>
              {completedTodayCount} done today / {formatDuration(openMinutes)} open on calendar
            </p>
          </article>
        </div>
      </section>

      <PageSection eyebrow="Capture" title="Fast ways to put a thought somewhere safe">
        <div className="hq-action-row">
          <Link className="hq-link-card hq-link-card-primary" to="/app/easylist/add">
            <strong>Add task</strong>
            <p>Turn a loose obligation into one clear next action.</p>
          </Link>
          <Link className="hq-link-card" to="/app/easylist/email">
            <strong>Scan email</strong>
            <p>Review likely replies, bills, meetings, and archive noise.</p>
          </Link>
          <Link className="hq-link-card" to="/app/easynotes/new">
            <strong>Blank note</strong>
            <p>Use this when the thought is still too messy to become a task.</p>
          </Link>
          <Link className="hq-link-card" to="/app/easycalendar/day">
            <strong>Today</strong>
            <p>Place work in time when the list is no longer enough.</p>
          </Link>
          {isAppVisible("easyworkout") ? (
            <Link className="hq-link-card" to="/app/easyworkout/log?workoutMode=1">
              <strong>Workout</strong>
              <p>Log a session without leaving the day view behind.</p>
            </Link>
          ) : null}
        </div>
      </PageSection>

      <PageSection eyebrow="Attention" title="The things EasyLife would keep from slipping">
        <div className="assistant-attention-list">
          {attentionItems.length ? (
            attentionItems.map((item) => (
              <Link className="assistant-attention-item" to={item.to} key={`${item.label}-${item.title}`}>
                <span>{item.label}</span>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </Link>
            ))
          ) : (
            <article className="assistant-attention-item">
              <span>Clear</span>
              <strong>No loose end is demanding the first move.</strong>
              <p>Use capture or calendar to give the open day a little structure.</p>
            </article>
          )}
        </div>
      </PageSection>

      <PageSection eyebrow="Systems" title="Keep modules quiet until they are useful">
        <div className="assistant-system-grid">
          {systems
            .filter((system) => system.visible)
            .map((system) => (
              <Link className="hq-link-card" to={system.to} key={system.label}>
                <span>{system.label}</span>
                <strong>{system.title}</strong>
                <p>{system.detail}</p>
              </Link>
          ))}
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
                <span>Next action</span>
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
