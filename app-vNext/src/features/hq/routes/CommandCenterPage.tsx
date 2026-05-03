import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
  isCompletedToday,
  isDueToday,
  isOverdue,
  sortActiveTasks,
} from "@/features/easylist/lib/taskUtils";
import type { PriorityTier } from "@/lib/firestore/tasks";

type CommandIntent = "task" | "email" | "calendar" | "note" | "project" | "review";

type CommandDraft = {
  intent: CommandIntent;
  title: string;
  dueDate: string | null;
  priorityTier: PriorityTier;
  estimatedLength: number | null;
  category: string;
  route: string;
  helper: string;
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function parseCommand(value: string): CommandDraft {
  const text = value.trim();
  const lower = text.toLowerCase();
  const dueDate = /\btoday|tonight|asap|now\b/.test(lower)
    ? toDateInputValue(new Date())
    : /\btomorrow|tmrw|tmr\b/.test(lower)
      ? toDateInputValue(addDays(new Date(), 1))
      : null;
  const estimatedMatch = lower.match(/\b(\d{1,3})\s*(?:min|minutes|m)\b/);
  const estimatedLength = estimatedMatch ? Number(estimatedMatch[1]) : null;

  if (/\b(email|gmail|inbox|reply|respond|archive)\b/.test(lower)) {
    return {
      intent: "email",
      title: text.replace(/^\s*(email|reply|respond to)\s+/i, "Reply about ").slice(0, 140),
      dueDate,
      priorityTier: dueDate ? 3 : 5,
      estimatedLength: estimatedLength || 8,
      category: "Email",
      route: "/app/easylist/email",
      helper: "Email command. Open Gmail triage, then approve task, draft, or archive actions.",
    };
  }

  if (/\b(calendar|schedule|meeting|appointment|at \d|am|pm)\b/.test(lower)) {
    return {
      intent: "calendar",
      title: text.replace(/^\s*(schedule|calendar)\s+/i, "").slice(0, 140),
      dueDate,
      priorityTier: 4,
      estimatedLength: estimatedLength || 30,
      category: "Calendar",
      route: "/app/easycalendar/day",
      helper: "Calendar command. Use the day view to place this into time.",
    };
  }

  if (/\b(note|idea|thought|remember)\b/.test(lower)) {
    return {
      intent: "note",
      title: text.replace(/^\s*(note|remember)\s+/i, "").slice(0, 140),
      dueDate: null,
      priorityTier: 6,
      estimatedLength: null,
      category: "Notes",
      route: "/app/easynotes/new",
      helper: "Note command. Capture this as context before it becomes clutter.",
    };
  }

  if (/\b(project|roadmap|milestone|launch|phase)\b/.test(lower)) {
    return {
      intent: "project",
      title: text.replace(/^\s*(project|plan)\s+/i, "").slice(0, 140),
      dueDate,
      priorityTier: 5,
      estimatedLength,
      category: "Projects",
      route: "/app/easyprojects",
      helper: "Project command. Start with a project shell, then break it into tasks.",
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
      helper: "Review command. Use the review queue and weekly reset layers below.",
    };
  }

  return {
    intent: "task",
    title: text.slice(0, 140),
    dueDate,
    priorityTier: dueDate ? 3 : 5,
    estimatedLength,
    category: "Inbox",
    route: "/app/easylist/dashboard",
    helper: "Task command. Save it to EasyList, then decide whether it needs time.",
  };
}

export function CommandCenterPage() {
  const { events, taskBlocks, tasks, addTask, scheduleTask, isLoading, error } = useEasyCalendar();
  const [command, setCommand] = useState("");
  const [status, setStatus] = useState("Type a command, then approve what EasyLife thinks it is.");
  const [activeLayer, setActiveLayer] = useState("today");
  const today = startOfDay(new Date());
  const parsedCommand = command.trim() ? parseCommand(command) : null;

  const activeTasks = useMemo(() => sortActiveTasks(tasks.filter((task) => !task.completed)), [tasks]);
  const overdueTasks = activeTasks.filter(isOverdue);
  const dueTodayTasks = activeTasks.filter(isDueToday);
  const completedToday = tasks.filter(isCompletedToday);
  const todayEvents = events
    .filter((event) => event.startAt && startOfDay(event.startAt).getTime() === today.getTime())
    .sort((left, right) => (left.startAt?.getTime() || 0) - (right.startAt?.getTime() || 0));
  const openWindows = getOpenTimeWindowsForDay(today, events, taskBlocks);
  const openMinutes = openWindows.reduce((sum, window) => sum + window.minutes, 0);
  const nextMove = overdueTasks[0] || dueTodayTasks[0] || activeTasks[0] || null;
  const nextEvent = todayEvents[0] || null;
  const quickWins = activeTasks.filter((task) => (task.estimatedLength || 999) <= 20).slice(0, 4);
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

  async function saveCommandTask() {
    if (!parsedCommand?.title) return;

    if (parsedCommand.intent === "calendar" || parsedCommand.intent === "note" || parsedCommand.intent === "project") {
      setStatus(`Open ${parsedCommand.intent} to finish this one. I kept it as a staged command.`);
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
          <p className="eyebrow">Today Command Center</p>
          <h1 id="command-title">One calm cockpit. Layers underneath.</h1>
          <p>
            EasyLife reads your day, chooses a next move, and keeps deeper systems tucked one tap away.
          </p>
        </div>
        <div className="command-hero-readout">
          <span>Next best move</span>
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

      <PageSection eyebrow="Command Palette" title="Type anything">
        <div className="command-palette-panel">
          <label className="field-stack">
            <span>Command</span>
            <textarea
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              rows={3}
              placeholder="Examples: email Thomas about final tomorrow, plan my day 20 min, note idea for finance lab, schedule study block at 7pm"
            />
          </label>
          {parsedCommand ? (
            <article className="command-preview-card">
              <span>{parsedCommand.intent}</span>
              <strong>{parsedCommand.title || "Untitled command"}</strong>
              <p>{parsedCommand.helper}</p>
              <div className="email-task-preview">
                <span>{parsedCommand.category}</span>
                <span>{parsedCommand.dueDate || "No date"}</span>
                <span>{parsedCommand.estimatedLength ? `${parsedCommand.estimatedLength} min` : "No estimate"}</span>
                <span>{parsedCommand.priorityTier}. {getPriorityMeta(parsedCommand.priorityTier).label}</span>
              </div>
              <div className="task-composer-actions">
                <button className="primary-button" type="button" onClick={saveCommandTask}>
                  {parsedCommand.intent === "task" || parsedCommand.intent === "email" || parsedCommand.intent === "review"
                    ? "Save to EasyList"
                    : "Stage command"}
                </button>
                <Link className="button-secondary" to={parsedCommand.route}>
                  Open {parsedCommand.intent}
                </Link>
              </div>
            </article>
          ) : null}
          <p className="helper-copy">{status}</p>
        </div>
      </PageSection>

      <section className="command-layer-tabs" aria-label="Command Center layers">
        {[
          ["today", "Today"],
          ["review", "Review Queue"],
          ["plan", "Daily Flow"],
          ["context", "Context"],
          ["weekly", "Weekly Reset"],
          ["email", "Email Actions"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={activeLayer === key ? "toggle-button active" : "toggle-button"}
            type="button"
            onClick={() => setActiveLayer(key)}
          >
            {label}
          </button>
        ))}
      </section>

      {activeLayer === "today" ? (
        <PageSection eyebrow="Daily Cockpit" title="The minimum useful picture">
          <div className="command-metric-grid">
            <article>
              <span>Due now</span>
              <strong>{overdueTasks.length + dueTodayTasks.length}</strong>
              <p>{overdueTasks.length} overdue / {dueTodayTasks.length} due today</p>
            </article>
            <article>
              <span>Calendar</span>
              <strong>{todayEvents.length}</strong>
              <p>{nextEvent ? `Next: ${nextEvent.title}` : "No fixed event next"}</p>
            </article>
            <article>
              <span>Open room</span>
              <strong>{formatDuration(openMinutes)}</strong>
              <p>{openWindows[0] ? `First gap at ${formatTimeLabel(openWindows[0].startAt)}` : "No open windows"}</p>
            </article>
            <article>
              <span>Done today</span>
              <strong>{completedToday.length}</strong>
              <p>{isLoading ? "Loading..." : "Momentum without clutter"}</p>
            </article>
          </div>
        </PageSection>
      ) : null}

      {activeLayer === "review" ? (
        <PageSection eyebrow="Smart Review Queue" title="Do, defer, draft, archive, plan">
          <div className="assistant-attention-list">
            {reviewItems.length ? reviewItems.map((item) => (
              <Link className="assistant-attention-item" to={item.to} key={`${item.label}-${item.title}`}>
                <span>{item.label}</span>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </Link>
            )) : (
              <article className="assistant-attention-item">
                <span>Clear</span>
                <strong>No review items are shouting.</strong>
                <p>Open email or capture a thought if something is still in your head.</p>
              </article>
            )}
          </div>
        </PageSection>
      ) : null}

      {activeLayer === "plan" ? (
        <PageSection eyebrow="Daily Planning Flow" title="Three minutes to steer the day">
          <div className="command-flow-grid">
            {[
              ["1", "Review today", `${overdueTasks.length + dueTodayTasks.length} due items and ${todayEvents.length} events.`],
              ["2", "Choose top 3", nextMove ? `Start with ${nextMove.title}.` : "Capture the one thing that matters."],
              ["3", "Block time", openWindows[0] ? `Use the ${formatDuration(openWindows[0].minutes)} window at ${formatTimeLabel(openWindows[0].startAt)}.` : "Calendar is full. Keep the list tiny."],
              ["4", "Clear inbox", "Scan email for asks, drafts, meetings, and archive-only noise."],
              ["5", "Start", "Open the smallest next action and leave the rest parked."],
            ].map(([step, title, body]) => (
              <article key={step}>
                <span>{step}</span>
                <strong>{title}</strong>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </PageSection>
      ) : null}

      {activeLayer === "context" ? (
        <PageSection eyebrow="Context Cards" title="Related systems without dashboard clutter">
          <div className="command-context-grid">
            <Link to="/app/easylist/dashboard"><span>Task</span><strong>{nextMove?.title || "No task selected"}</strong><p>Priority, due date, estimated time, and linked time blocks.</p></Link>
            <Link to="/app/easylist/email"><span>Email</span><strong>Inbox signals</strong><p>Replies, school mail, meetings, drafts, and archive-safe noise.</p></Link>
            <Link to="/app/easynotes"><span>Notes</span><strong>Recent thinking</strong><p>Capture before deciding whether it becomes a task or project.</p></Link>
            <Link to="/app/easyprojects"><span>Projects</span><strong>Longer arcs</strong><p>Keep the big plan underneath today’s next action.</p></Link>
          </div>
        </PageSection>
      ) : null}

      {activeLayer === "weekly" ? (
        <PageSection eyebrow="Weekly Reset" title="A clean sweep for the next seven days">
          <div className="command-flow-grid">
            {[
              ["Overdue", `${overdueTasks.length}`, "Recover or intentionally drop."],
              ["Waiting", "Email", "Create follow-up tasks from Gmail."],
              ["Deadlines", `${activeTasks.filter((task) => task.dueDate).length}`, "Make sure every deadline has a next action."],
              ["Projects", "Review", "Pick one project that deserves a push."],
              ["People", "Follow up", "Check contacts and pipeline reminders."],
              ["Health", "Plan", "Put workouts into the week before it fills."],
            ].map(([label, value, body]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </PageSection>
      ) : null}

      {activeLayer === "email" ? (
        <PageSection eyebrow="Email Actions Layer" title="Powerful, but approval-first">
          <div className="email-integration-grid">
            <article><span>Read</span><strong>Sync Gmail</strong><p>Pull recent inbox, unread, school, or meeting threads.</p></article>
            <article><span>Extract</span><strong>Find tasks</strong><p>Turn likely asks into review cards before saving anything.</p></article>
            <article><span>Draft</span><strong>Create Gmail drafts</strong><p>Draft replies after approval. Sending remains manual.</p></article>
          </div>
          <div className="task-composer-actions">
            <Link className="primary-button" to="/app/easylist/email">Open Email Triage</Link>
          </div>
        </PageSection>
      ) : null}
    </main>
  );
}
