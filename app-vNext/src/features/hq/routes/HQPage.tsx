import { Link } from "react-router-dom";
import { useMemo } from "react";
import { PageSection } from "@/components/ui/PageSection";
import { classifyAssistantIntent } from "@/features/assistant/intentClassifier";
import { buildLocalDraftReviewHint } from "@/features/assistant/localDraftBuilder";
import { assistantCommandHintRow } from "@/features/hq/assistantCommandHints";
import { useEasyCalendar } from "@/features/easycalendar/EasyCalendarContext";
import {
  formatDuration,
  formatTimeLabel,
  getOpenTimeWindowsForDay,
  startOfDay,
} from "@/features/easycalendar/lib/calendarUtils";
import { sortActiveTasks } from "@/features/easylist/lib/taskUtils";
import { useLastAppRoute } from "@/lib/mobile/appRouteMemory";

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
  const { events, taskBlocks, tasks, error } = useEasyCalendar();
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
  const mostUrgent = overdueTasks[0] || dueTodayTasks[0] || null;
  const mostUrgentLabel = overdueTasks[0]?.title || dueTodayTasks[0]?.title || "";
  const quickWin = sortActiveTasks(tasks.filter((task) => !task.completed && (task.estimatedLength || 999) <= 20))[0] || null;
  const todaySummary = [
    { label: "Due", value: `${overdueTasks.length + dueTodayTasks.length}` },
    { label: "Plan", value: `${todayEvents.length}` },
    { label: "Open", value: formatDuration(openMinutes) },
  ];
  const todayIntentSuggestion = useMemo(
    () => classifyAssistantIntent(assistantCommandHintRow),
    []
  );
  const localDraftHint = useMemo(
    () => buildLocalDraftReviewHint(todayIntentSuggestion),
    [todayIntentSuggestion]
  );
  const startHere = useMemo(() => {
    const firstDueTask = overdueTasks[0] || dueTodayTasks[0] || null;
    const firstOpenWindow = openWindows[0] || null;

    if (firstDueTask) {
      return {
        label: firstDueTask.title || "Untitled task",
        reason: overdueTasks.length
          ? "This is behind. Handle it, reschedule it, or intentionally release it before checking the rest."
          : "This is due today. Decide the next step before checking anything else.",
        buttonLabel: "Approve Inbox",
        to: "/app/easylist/dashboard",
      };
    }
    if (quickWin) {
      return {
        label: quickWin.title || "Untitled task",
        reason: `${quickWin.estimatedLength || 20} minutes. Clear this small task while the day still has room.`,
        buttonLabel: "Approve Inbox",
        to: "/app/easylist/dashboard",
      };
    }
    if (openWindows.length >= 3) {
      return {
        label: firstOpenWindow
          ? `Plan the ${formatTimeLabel(firstOpenWindow.startAt)} open window`
          : "Plan open time",
        reason: "Give the next open window a light plan before adding more to the day.",
        buttonLabel: "Plan Today",
        to: "/app/easycalendar/day",
      };
    }
    return {
      label: "Remember the next note",
      reason: "Everything looks calm, so save the context before it turns into noise.",
      buttonLabel: "Open Memory",
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
          detail: mostUrgentLabel || "Open Inbox and choose the next step.",
          to: "/app/easylist/dashboard",
        }
      : null,
    nextEvents[0]
      ? {
          label: todayEvents.length >= 3 ? "Plan pressure" : "Plan",
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
          detail: followUpTasks[0].dueDate ? "Already dated in Inbox." : "No date yet. Decide whether it belongs today.",
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
          detail: "Add a loose thought to Inbox or keep the day open.",
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
          label: "Next in Plan",
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
        ? "Plan has shape. Use open windows for work that would otherwise leak."
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
              <p>Assistant read</p>
              <h1 id="hq-title">What needs attention now?</h1>
            </div>
          </div>
          <strong>{assistantRead}</strong>
          <div className="hq-today-summary" aria-label="Today summary">
            {todaySummary.map((item) => (
              <span key={item.label}>
                <b>{item.value}</b>
                {item.label}
              </span>
            ))}
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
              <Link to="/app/easylist/add" className="button-secondary">
                Review Draft
              </Link>
            </div>
          </div>
          <button type="button" className="hq-natural-capture" onClick={openNaturalCapture}>
            <span>Capture, classify, review, approve</span>
            <strong>{assistantCommandHintRow}</strong>
            <small>
              {localDraftHint.label}: {localDraftHint.title}. {localDraftHint.detail}
            </small>
            <em>Open</em>
          </button>
          <details className="hq-context-stack">
            <summary>
              <span>Context</span>
              <strong>{contextLead}</strong>
            </summary>
            <div>
              {lastAppRoute ? (
                <Link to={lastAppRoute.path}>
                  <span>Resume</span>
                  <strong>{lastAppRoute.label}</strong>
                  <p>Return to the last assistant surface you opened.</p>
                </Link>
              ) : null}
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
              <p>Use Inbox or Plan to give the open day a little structure.</p>
            </article>
          )}
        </div>
      </PageSection>
    </main>
  );
}
