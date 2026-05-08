import { Link } from "react-router-dom";
import { useMemo } from "react";
import { PageSection } from "@/components/ui/PageSection";
import { assistantCommandHintRow } from "@/features/hq/assistantCommandHints";
import { useEasyCalendar } from "@/features/easycalendar/EasyCalendarContext";
import {
  formatDuration,
  formatTimeLabel,
  getOpenTimeWindowsForDay,
  getScheduledMinutesForDay,
  startOfDay,
} from "@/features/easycalendar/lib/calendarUtils";
import { isCompletedToday, sortActiveTasks } from "@/features/easylist/lib/taskUtils";
import { useSettings } from "@/features/settings/SettingsContext";
import { useLastAppRoute } from "@/lib/mobile/appRouteMemory";

type TodayContextItem = {
  label: string;
  title: string;
  detail: string;
  to: string;
};

type CapacityLevel = "Light" | "Steady" | "Full";

function isSameDate(left: Date | null, right: Date) {
  return Boolean(left && startOfDay(left).getTime() === startOfDay(right).getTime());
}

export function HQPage() {
  const { events, taskBlocks, tasks, error } = useEasyCalendar();
  const { isAppVisible } = useSettings();
  const lastAppRoute = useLastAppRoute();
  const today = startOfDay(new Date());

  const todayEvents = events
    .filter((event) => event.startAt && startOfDay(event.startAt).getTime() === today.getTime())
    .sort((left, right) => (left.startAt?.getTime() || 0) - (right.startAt?.getTime() || 0));
  const nextEvents = todayEvents.slice(0, 3);
  const dueTodayTasks = sortActiveTasks(tasks.filter((task) => !task.completed && isSameDate(task.dueDate, today)));
  const overdueTasks = sortActiveTasks(tasks.filter((task) => !task.completed && task.dueDate && startOfDay(task.dueDate).getTime() < today.getTime()));
  const openWindows = getOpenTimeWindowsForDay(today, events, taskBlocks);
  const openMinutes = openWindows.reduce((sum, window) => sum + window.minutes, 0);
  const scheduledMinutes = getScheduledMinutesForDay(today, events, taskBlocks);
  const completedTodayCount = tasks.filter(isCompletedToday).length;
  const mostUrgent = overdueTasks[0] || dueTodayTasks[0] || null;
  const mostUrgentLabel = overdueTasks[0]?.title || dueTodayTasks[0]?.title || "";
  const quickWin = sortActiveTasks(tasks.filter((task) => !task.completed && (task.estimatedLength || 999) <= 20))[0] || null;
  const dueTaskMinutes = [...overdueTasks, ...dueTodayTasks].reduce(
    (sum, task) => sum + (task.estimatedLength || 25),
    0
  );
  const pressureScore = dueTaskMinutes + scheduledMinutes + overdueTasks.length * 30 - completedTodayCount * 10;
  const capacityLevel: CapacityLevel = pressureScore >= openMinutes + 90 || overdueTasks.length >= 3
    ? "Full"
    : pressureScore >= Math.max(120, openMinutes * 0.55) || dueTodayTasks.length >= 3
      ? "Steady"
      : "Light";
  const capacityRead = {
    Light: {
      title: "Light capacity",
      detail: isAppVisible("easyworkout")
        ? "There is room for one meaningful task and a workout later."
        : "There is room for one meaningful task without crowding the day.",
    },
    Steady: {
      title: "Steady capacity",
      detail: isAppVisible("easyworkout")
        ? "Pick one due item first, then keep training short or routine-based."
        : "Pick one due item first, then keep the rest of the plan narrow.",
    },
    Full: {
      title: "Full capacity",
      detail: isAppVisible("easyworkout")
        ? "Recover urgent work first. Keep everything else optional."
        : "Recover urgent work first and avoid adding extra commitments.",
    },
  }[capacityLevel];
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
          : "This is due today. Decide the next step before checking anything else.",
        buttonLabel: "Review Capture",
        to: "/app/easylist/dashboard",
      };
    }
    if (quickWin) {
      return {
        label: quickWin.title || "Untitled task",
        reason: `${quickWin.estimatedLength || 20} minutes. Clear this small task while the day still has room.`,
        buttonLabel: "Review Capture",
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
    ? "One recovery thread is leading the stack. Clear it, reschedule it, or release it."
    : dueTodayTasks.length > 3
      ? "Today has enough moving parts. Pick one list, one time block, and keep the rest quiet."
      : nextEvents.length
        ? "The calendar has shape. Use open windows for work that would otherwise leak."
        : "The day is open. Capture the loose ends before they become noise.";

  function openNaturalCapture() {
    window.dispatchEvent(new Event("easylife:open-capture"));
  }

  return (
    <main className="page-wrap app-theme app-theme-easyhq">
      {error ? <p className="error-copy">{error}</p> : null}

      <section className="assistant-home" aria-labelledby="hq-title">
        <article className="hq-start-card">
          <div className="hq-start-heading">
            <div>
              <p>Capture -&gt; plan -&gt; remember</p>
              <h1 id="hq-title">Today, reduced.</h1>
            </div>
          </div>
          <strong>{assistantRead}</strong>
          <div className="hq-today-summary" aria-label="Today summary">
            <span>Today</span>
            <p>{todaySummary.join(" / ")}</p>
            <span>Try</span>
            <p>{assistantCommandHintRow}</p>
          </div>
          <div className="assistant-next-inline" aria-labelledby="assistant-next-title">
            <div>
              <span>Start here</span>
              <h2 id="assistant-next-title">{startHere.label}</h2>
              <p>{startHere.reason}</p>
            </div>
            <div className="task-composer-actions">
              <Link to={startHere.to} className="primary-button">
                {startHere.buttonLabel.replace("Open ", "")}
              </Link>
              {lastAppRoute ? (
                <Link to={lastAppRoute.path} className="button-secondary">
                  Resume {lastAppRoute.label}
                </Link>
              ) : null}
              <Link to="/app/easylist/add" className="button-secondary">
                Capture
              </Link>
            </div>
          </div>
          <div className={`hq-capacity-signal capacity-${capacityLevel.toLowerCase()}`} aria-label="Today's load">
            <div>
              <span>Today&apos;s load</span>
              <strong>{capacityRead.title}</strong>
              <p>{capacityRead.detail}</p>
            </div>
            <small>
              {formatDuration(dueTaskMinutes)} due work / {formatDuration(scheduledMinutes)} scheduled
            </small>
          </div>
          <button type="button" className="hq-natural-capture" onClick={openNaturalCapture}>
            <span>Quick capture</span>
            <strong>Open quick capture</strong>
            <em>Open</em>
          </button>
          <details className="hq-context-stack">
            <summary>
              <span>Signals</span>
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
            <span>Capacity</span>
            <strong>{capacityRead.title}</strong>
            <p>{capacityLevel === "Full" ? "Protect the day." : `${progressStatusLabel}: ${completedTodayCount} done today.`}</p>
          </article>
        </div>
      </section>

      <PageSection eyebrow="Review" title="Only what needs a decision">
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
    </main>
  );
}
