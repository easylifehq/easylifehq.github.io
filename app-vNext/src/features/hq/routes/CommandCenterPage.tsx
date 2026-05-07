import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { useEasyCalendar } from "@/features/easycalendar/EasyCalendarContext";
import {
  formatDuration,
  formatTimeLabel,
  getOpenTimeWindowsForDay,
  startOfDay,
  toDateInputValue,
} from "@/features/easycalendar/lib/calendarUtils";
import {
  getPriorityMeta,
  isDueToday,
  isOverdue,
  sortActiveTasks,
} from "@/features/easylist/lib/taskUtils";
import type { PriorityTier } from "@/lib/firestore/tasks";

type CommandIntent = "task" | "email" | "calendar" | "note" | "project" | "review" | "contact" | "workout";

type CommandDraft = {
  intent: CommandIntent;
  title: string;
  dueDate: string | null;
  priorityTier: PriorityTier;
  estimatedLength: number | null;
  category: string;
  route: string;
  helper: string;
  confidence: "High" | "Medium" | "Low";
  actionLabel: string;
};

const commandExample = "add a task, save a note, or plan the next block";

const intentMeta: Record<CommandIntent, { label: string; routeLabel: string }> = {
  task: { label: "Task", routeLabel: "EasyList" },
  email: { label: "Email", routeLabel: "Email Triage" },
  calendar: { label: "Calendar", routeLabel: "Calendar" },
  note: { label: "Note", routeLabel: "Notes" },
  project: { label: "Project", routeLabel: "Projects" },
  review: { label: "Review", routeLabel: "Today Review" },
  contact: { label: "Contact", routeLabel: "Contacts" },
  workout: { label: "Workout", routeLabel: "Workout" },
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function nextWeekdayDate(targetDay: number) {
  const today = new Date();
  const currentDay = today.getDay();
  const daysUntil = (targetDay + 7 - currentDay) % 7 || 7;
  return toDateInputValue(addDays(today, daysUntil));
}

function parseDueDate(lower: string) {
  if (/\btoday|tonight|asap|now\b/.test(lower)) return toDateInputValue(new Date());
  if (/\btomorrow|tmrw|tmr\b/.test(lower)) return toDateInputValue(addDays(new Date(), 1));

  const weekdayMatch = lower.match(/\b(next\s+)?(sun(?:day)?|mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?)\b/);
  if (!weekdayMatch) return null;

  const weekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return nextWeekdayDate(weekdays.indexOf(weekdayMatch[2].slice(0, 3)));
}

function parsePriority(lower: string, dueDate: string | null): PriorityTier {
  if (/\b(urgent|emergency|asap|now|overdue)\b/.test(lower)) return 2;
  if (/\b(final|exam|deadline|due|important|professor|landlord|health|doctor|security|bank)\b/.test(lower)) return 3;
  if (/\b(someday|low|later|maybe)\b/.test(lower)) return 6;
  return dueDate ? 3 : 5;
}

function cleanTitle(text: string, patterns: RegExp[], fallback: string) {
  const cleaned = patterns.reduce((value, pattern) => value.replace(pattern, ""), text).trim();
  return (cleaned || fallback).slice(0, 140);
}

function parseCommand(value: string): CommandDraft {
  const text = value.trim();
  const lower = text.toLowerCase();
  const dueDate = parseDueDate(lower);
  const estimatedMatch = lower.match(/\b(\d{1,3})\s*(?:min|minutes|m)\b/);
  const estimatedLength = estimatedMatch ? Number(estimatedMatch[1]) : null;
  const priorityTier = parsePriority(lower, dueDate);

  if (/\b(email|gmail|inbox|reply|respond|archive)\b/.test(lower)) {
    return {
      intent: "email",
      title: cleanTitle(text, [/^\s*(email|reply|respond to)\s+/i], "Review email"),
      dueDate,
      priorityTier,
      estimatedLength: estimatedLength || 8,
      category: "Email",
      route: "/app/easylist/email",
      helper: "Email command. Open Gmail triage, then approve task, draft, or archive actions.",
      confidence: "High",
      actionLabel: "Save review task",
    };
  }

  if (/\b(calendar|schedule|meeting|appointment|at \d|am|pm)\b/.test(lower)) {
    return {
      intent: "calendar",
      title: cleanTitle(text, [/^\s*(schedule|calendar)\s+/i], "New calendar item"),
      dueDate,
      priorityTier: 4,
      estimatedLength: estimatedLength || 30,
      category: "Calendar",
      route: "/app/easycalendar/day",
      helper: "Calendar command. Use the day view to place this into time.",
      confidence: /\b(at \d|am|pm)\b/.test(lower) ? "High" : "Medium",
      actionLabel: "Stage calendar item",
    };
  }

  if (/\b(note|idea|thought|remember)\b/.test(lower)) {
    return {
      intent: "note",
      title: cleanTitle(text, [/^\s*(note|remember)\s+/i], "New note"),
      dueDate: null,
      priorityTier: 6,
      estimatedLength: null,
      category: "Notes",
      route: "/app/easynotes/new",
      helper: "Note command. Capture this as context before it becomes clutter.",
      confidence: "High",
      actionLabel: "Stage note",
    };
  }

  if (/\b(project|roadmap|milestone|launch|phase)\b/.test(lower)) {
    return {
      intent: "project",
      title: cleanTitle(text, [/^\s*(project|plan)\s+/i], "New project"),
      dueDate,
      priorityTier: 5,
      estimatedLength,
      category: "Projects",
      route: "/app/easyprojects",
      helper: "Project command. Start with a project shell, then break it into tasks.",
      confidence: "Medium",
      actionLabel: "Stage project",
    };
  }

  if (/\b(review|reset|weekly|plan day|plan my day)\b/.test(lower)) {
    return {
      intent: "review",
      title: text.slice(0, 140),
      dueDate: toDateInputValue(new Date()),
      priorityTier: 4,
      estimatedLength: estimatedLength || 20,
      category: "Review",
      route: "/app/command",
      helper: "Review command. Keep the next decision in this cockpit before opening deeper tools.",
      confidence: "High",
      actionLabel: "Save planning task",
    };
  }

  if (/\b(contact|follow up|follow-up|call|text|message)\b/.test(lower)) {
    return {
      intent: "contact",
      title: cleanTitle(text, [/^\s*(contact|call|text|message|follow up with|follow-up with)\s+/i], "Follow up"),
      dueDate,
      priorityTier,
      estimatedLength: estimatedLength || 10,
      category: "Contacts",
      route: "/app/easycontacts",
      helper: "Contact command. Keep the relationship visible, then choose whether it needs a task.",
      confidence: "Medium",
      actionLabel: "Stage follow-up",
    };
  }

  if (/\b(workout|gym|lift|run|cardio|legs|push|pull)\b/.test(lower)) {
    return {
      intent: "workout",
      title: cleanTitle(text, [/^\s*(workout|gym|log workout|lift)\s+/i], "Workout"),
      dueDate: dueDate || toDateInputValue(new Date()),
      priorityTier: 5,
      estimatedLength: estimatedLength || 45,
      category: "Workout",
      route: "/app/easyworkout/log",
      helper: "Workout command. Open the logger with the session shape already in mind.",
      confidence: "Medium",
      actionLabel: "Stage workout",
    };
  }

  return {
    intent: "task",
    title: text.slice(0, 140),
    dueDate,
    priorityTier,
    estimatedLength,
    category: "Inbox",
    route: "/app/easylist/dashboard",
    helper: "Task command. Save it to EasyList, then decide whether it needs time.",
    confidence: text.length > 8 ? "Medium" : "Low",
    actionLabel: "Save to EasyList",
  };
}

export function CommandCenterPage() {
  const { events, taskBlocks, tasks, addTask, scheduleTask, error } = useEasyCalendar();
  const location = useLocation();
  const [command, setCommand] = useState("");
  const [status, setStatus] = useState("Type one thing, then choose where it belongs.");
  const funDrinksEnabled = location.hash === "#fun-drinks";
  const today = startOfDay(new Date());
  const parsedCommand = command.trim() ? parseCommand(command) : null;

  const activeTasks = useMemo(() => sortActiveTasks(tasks.filter((task) => !task.completed)), [tasks]);
  const overdueTasks = activeTasks.filter(isOverdue);
  const dueTodayTasks = activeTasks.filter(isDueToday);
  const todayEvents = events
    .filter((event) => event.startAt && startOfDay(event.startAt).getTime() === today.getTime())
    .sort((left, right) => (left.startAt?.getTime() || 0) - (right.startAt?.getTime() || 0));
  const openWindows = getOpenTimeWindowsForDay(today, events, taskBlocks);
  const openMinutes = openWindows.reduce((sum, window) => sum + window.minutes, 0);
  const nextMove = overdueTasks[0] || dueTodayTasks[0] || activeTasks[0] || null;
  const nextEvent = todayEvents[0] || null;
  const reviewItems = [
    ...overdueTasks.slice(0, 3).map((task) => ({
      label: "Recover",
      title: task.title,
      detail: "Behind. Handle, reschedule, or intentionally release.",
      to: "/app/easylist/dashboard",
    })),
    ...dueTodayTasks.slice(0, 3).map((task) => ({
      label: "Due today",
      title: task.title,
      detail: `${getPriorityMeta(task.priorityTier, task.priorityLabel).label}${task.estimatedLength ? ` / ${task.estimatedLength} min` : ""}`,
      to: "/app/easylist/dashboard",
    })),
    nextEvent
      ? {
          label: "Next event",
          title: nextEvent.title || "Untitled event",
          detail: nextEvent.allDay ? "All day" : `${formatTimeLabel(nextEvent.startAt)} - ${formatTimeLabel(nextEvent.endAt)}`,
          to: "/app/easycalendar/day",
        }
      : null,
  ].filter((item): item is { label: string; title: string; detail: string; to: string } => Boolean(item)).slice(0, 6);
  const cockpitStatuses = [
    {
      label: "Today",
      value: nextMove ? nextMove.title : "No task selected",
      detail: overdueTasks.length
        ? `${overdueTasks.length} overdue`
        : dueTodayTasks.length
          ? `${dueTodayTasks.length} due today`
          : "Clear for capture",
      to: nextMove ? "/app/easylist/dashboard" : "/app/easylist/add",
    },
    {
      label: "Inbox",
      value: `${activeTasks.length} open`,
      detail: "Capture first, sort later",
      to: "/app/easylist/dashboard",
    },
    {
      label: "Plan",
      value: nextEvent ? nextEvent.title || "Next event" : formatDuration(openMinutes),
      detail: nextEvent
        ? nextEvent.allDay
          ? "All day"
          : `${formatTimeLabel(nextEvent.startAt)} start`
        : openWindows[0]
          ? `Open at ${formatTimeLabel(openWindows[0].startAt)}`
          : "No open room",
      to: "/app/easycalendar/day",
    },
    {
      label: "Memory",
      value: "Notes ready",
      detail: "Save context you will need later",
      to: "/app/easynotes",
    },
  ];

  async function saveCommandTask() {
    if (!parsedCommand?.title) return;

    if (parsedCommand.intent === "calendar" || parsedCommand.intent === "note" || parsedCommand.intent === "project" || parsedCommand.intent === "contact" || parsedCommand.intent === "workout") {
      setStatus(`Open ${intentMeta[parsedCommand.intent].routeLabel} to finish this one. I kept it as a staged command.`);
      return;
    }

    await addTask({
      itemKind: parsedCommand.dueDate ? "deadline" : "task",
      title: parsedCommand.title,
      notes: [parsedCommand.helper, `Original command: ${command}`].join("\n"),
      listName: parsedCommand.category === "Email" ? "Email" : "Inbox",
      category: parsedCommand.category,
      dueDate: parsedCommand.dueDate,
      estimatedLength: parsedCommand.estimatedLength,
      priorityTier: parsedCommand.priorityTier,
      priorityLabel: getPriorityMeta(parsedCommand.priorityTier).label,
      recurring: false,
    });
    setCommand("");
    setStatus(`Saved "${parsedCommand.title}" to EasyList.`);
  }

  async function scheduleNextMove() {
    if (!nextMove || !openWindows[0]) return;
    const duration = Math.max(15, Math.min(nextMove.estimatedLength || 30, openWindows[0].minutes));
    const endAt = new Date(openWindows[0].startAt.getTime() + duration * 60000);
    await scheduleTask(nextMove, {
      startAt: openWindows[0].startAt,
      endAt,
      planningState: "scheduled",
      userAdjusted: false,
    });
    setStatus(`Placed "${nextMove.title}" into the next open window.`);
  }

  return (
    <main className="page-wrap app-theme app-theme-easyhq command-center-page">
      {error ? <p className="error-copy">{error}</p> : null}

      <section className="command-hero" aria-labelledby="command-title">
        <div>
          <p className="eyebrow">Today</p>
          <h1 id="command-title">Command the day.</h1>
          <p>
            Start with one loose thought. EasyLife can hold it as a task, note, plan item, or review point.
          </p>
        </div>
        <div className="command-hero-readout">
          <span>Current state</span>
          <strong>{nextMove ? nextMove.title : "Capture the next loose end"}</strong>
          <p>
            {overdueTasks.length
              ? `${overdueTasks.length} overdue item${overdueTasks.length === 1 ? "" : "s"} need recovery.`
              : dueTodayTasks.length
                ? `${dueTodayTasks.length} item${dueTodayTasks.length === 1 ? "" : "s"} are due today.`
                : `${formatDuration(openMinutes)} open on the calendar.`}
          </p>
          <div className="task-composer-actions">
            <Link className="primary-button" to={nextMove ? "/app/easylist/dashboard" : "/app/easylist/add"}>
              {nextMove ? "Open next task" : "Capture something"}
            </Link>
            <button className="button-secondary" type="button" onClick={scheduleNextMove} disabled={!nextMove || !openWindows[0]}>
              Time-block it
            </button>
          </div>
        </div>
      </section>

      <PageSection eyebrow="Command" title="One input">
        <div className="command-palette-panel">
          <label className="field-stack">
            <span>Command</span>
            <textarea
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                  event.preventDefault();
                  void saveCommandTask();
                }
              }}
              rows={3}
              placeholder={`Try: ${commandExample}`}
            />
          </label>
          {parsedCommand ? (
            <article className="command-preview-card">
              <span>{intentMeta[parsedCommand.intent].label}</span>
              <strong>{parsedCommand.title || "Untitled command"}</strong>
              <p>{parsedCommand.helper}</p>
              <div className="email-task-preview">
                <span>{parsedCommand.category}</span>
                <span>{parsedCommand.dueDate || "No date"}</span>
                <span>{parsedCommand.estimatedLength ? `${parsedCommand.estimatedLength} min` : "No estimate"}</span>
                <span>{parsedCommand.priorityTier}. {getPriorityMeta(parsedCommand.priorityTier).label}</span>
                <span>{parsedCommand.confidence} confidence</span>
              </div>
              <div className="task-composer-actions">
                <button className="primary-button" type="button" onClick={saveCommandTask}>
                  {parsedCommand.actionLabel}
                </button>
                <Link className="button-secondary" to={parsedCommand.route}>
                  Open {intentMeta[parsedCommand.intent].routeLabel}
                </Link>
                <button className="button-secondary" type="button" onClick={() => setCommand("")}>
                  Clear
                </button>
              </div>
            </article>
          ) : null}
          <p className="helper-copy">{status}</p>
        </div>
      </PageSection>

      <section className="command-status-row" aria-label="Today, Inbox, Plan, and Memory status">
        {cockpitStatuses.map((item) => (
          <Link to={item.to} key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.detail}</p>
          </Link>
        ))}
      </section>

      {reviewItems.length ? (
        <section className="command-review-strip" aria-label="Needs review">
          <span>Review</span>
          <strong>{reviewItems[0].title}</strong>
          <p>{reviewItems[0].detail}</p>
          <Link className="button-secondary compact-button" to={reviewItems[0].to}>
            Open
          </Link>
        </section>
      ) : null}

      {funDrinksEnabled ? (
        <PageSection eyebrow="Off-hours" title="A tiny plan for drinks without taking over">
          <div id="fun-drinks" className="command-flow-grid">
            {[
              ["Pick", "One place", "Choose the spot, time, and who is actually coming."],
              ["Pace", "Two-drink note", "Add food, water, and a clear stop time before the night gets fuzzy."],
              ["Exit", "Ride check", "Decide the ride home before the first order, then keep the plan simple."],
              ["Tomorrow", "Light reset", "Park one small task for tomorrow so Today stays serious when you come back."],
            ].map(([step, title, body]) => (
              <article key={step}>
                <span>{step}</span>
                <strong>{title}</strong>
                <p>{body}</p>
              </article>
            ))}
          </div>
          <div className="task-composer-actions">
            <Link className="primary-button" to="/app/easycalendar/day">
              Find open time
            </Link>
            <Link className="button-secondary" to="/app/easylist/add">
              Add a reminder
            </Link>
          </div>
        </PageSection>
      ) : null}
    </main>
  );
}
