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

type CommandIntent = "task" | "followup" | "plan" | "note" | "project" | "review" | "contact" | "workout";

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

const commandExample = "draft a task, note context, or plan review";

const intentMeta: Record<CommandIntent, { label: string; routeLabel: string }> = {
  task: { label: "Task draft", routeLabel: "Inbox" },
  followup: { label: "Follow-up draft", routeLabel: "Inbox" },
  plan: { label: "Plan preview", routeLabel: "Plan" },
  note: { label: "Context draft", routeLabel: "Notes" },
  project: { label: "Project draft", routeLabel: "Projects" },
  review: { label: "Review task", routeLabel: "Today" },
  contact: { label: "People note", routeLabel: "People" },
  workout: { label: "Workout note", routeLabel: "Workout" },
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
      intent: "followup",
      title: cleanTitle(text, [/^\s*(email|reply|respond to)\s+/i], "Review follow-up"),
      dueDate,
      priorityTier,
      estimatedLength: estimatedLength || 8,
      category: "Follow-up",
      route: "/app/easylist/add",
      helper: "Follow-up draft. Save an Inbox task before taking any real email, text, call, or message action.",
      confidence: "High",
      actionLabel: "Save follow-up task",
    };
  }

  if (/\b(calendar|schedule|meeting|appointment|at \d|am|pm)\b/.test(lower)) {
    return {
      intent: "plan",
      title: cleanTitle(text, [/^\s*(schedule|calendar)\s+/i], "New plan item"),
      dueDate,
      priorityTier: 4,
      estimatedLength: estimatedLength || 30,
      category: "Plan",
      route: "/app/easycalendar/day",
      helper: "Plan preview. Open Plan before placing anything on the day.",
      confidence: /\b(at \d|am|pm)\b/.test(lower) ? "High" : "Medium",
      actionLabel: "Stage plan preview",
    };
  }

  if (/\b(note|idea|thought|remember|context)\b/.test(lower)) {
    return {
      intent: "note",
      title: cleanTitle(text, [/^\s*(note|context|remember)\s+/i], "New note"),
      dueDate: null,
      priorityTier: 6,
      estimatedLength: null,
      category: "Notes",
      route: "/app/easynotes/new",
      helper: "Context draft. Open Notes when you are ready to save a normal note.",
      confidence: "High",
      actionLabel: "Stage context draft",
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
      helper: "Project draft. Open Projects before turning it into a larger plan.",
      confidence: "Medium",
      actionLabel: "Stage project draft",
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
      route: "/app/hq",
      helper: "Review task. Save one task or open Today for the main assistant path.",
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
      category: "People",
      route: "/app/easycontacts",
      helper: "People note. Save an Inbox task before any real call, text, or message.",
      confidence: "Medium",
      actionLabel: "Stage people note",
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
      helper: "Workout note. Open Workout before logging anything.",
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
    helper: "Task draft. Save one task to Inbox, then decide whether it needs time.",
    confidence: text.length > 8 ? "Medium" : "Low",
    actionLabel: "Save task to Inbox",
  };
}

export function CommandCenterPage() {
  const { events, taskBlocks, tasks, addTask, error } = useEasyCalendar();
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
      label: "Notes",
      value: "Context ready",
      detail: "Save normal notes in Notes",
      to: "/app/easynotes",
    },
  ];

  async function saveCommandTask() {
    if (!parsedCommand?.title) return;

    if (parsedCommand.intent === "plan" || parsedCommand.intent === "note" || parsedCommand.intent === "project" || parsedCommand.intent === "contact" || parsedCommand.intent === "workout") {
      setStatus(`Open ${intentMeta[parsedCommand.intent].routeLabel} to finish this preview. Nothing was saved here.`);
      return;
    }

    await addTask({
      itemKind: parsedCommand.dueDate ? "deadline" : "task",
      title: parsedCommand.title,
      notes: [parsedCommand.helper, `Original command: ${command}`].join("\n"),
      listName: "Inbox",
      category: parsedCommand.category,
      dueDate: parsedCommand.dueDate,
      estimatedLength: parsedCommand.estimatedLength,
      priorityTier: parsedCommand.priorityTier,
      priorityLabel: getPriorityMeta(parsedCommand.priorityTier).label,
      recurring: false,
    });
    setCommand("");
    setStatus(`Saved one Inbox task: "${parsedCommand.title}". No email, note, plan, notification, or calendar item was created.`);
  }

  return (
    <main className="page-wrap app-theme app-theme-easyhq command-center-page">
      {error ? <p className="error-copy">{error}</p> : null}

      <section className="command-hero" aria-labelledby="command-title">
        <div>
          <p className="eyebrow">Legacy review</p>
          <h1 id="command-title">Review one draft.</h1>
          <p>
            This older route stays available for review, but Today and Inbox are the primary assistant path.
            Nothing sends, syncs, schedules, or saves unless you choose a specific save action.
          </p>
        </div>
        <div className="command-hero-readout">
          <span>Draft state</span>
          <strong>{nextMove ? nextMove.title : "Capture the next loose end"}</strong>
          <p>
            {overdueTasks.length
              ? `${overdueTasks.length} overdue item${overdueTasks.length === 1 ? "" : "s"} need recovery.`
              : dueTodayTasks.length
                ? `${dueTodayTasks.length} item${dueTodayTasks.length === 1 ? "" : "s"} are due today.`
                : `${formatDuration(openMinutes)} open in Plan.`}
          </p>
          <div className="task-composer-actions">
            <Link className="primary-button" to={nextMove ? "/app/easylist/dashboard" : "/app/easylist/add"}>
              {nextMove ? "Review in Inbox" : "Capture in Inbox"}
            </Link>
            <Link className="button-secondary" to="/app/easycalendar/day">
              Review in Plan
            </Link>
          </div>
        </div>
      </section>

      <PageSection eyebrow="Draft review" title="One input">
        <div className="command-palette-panel">
          <label className="field-stack">
            <span>Draft input</span>
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

      <section className="command-status-row" aria-label="Today, Inbox, Plan, and Notes status">
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
