import { Link } from "react-router-dom";
import { useMemo } from "react";
import { PageSection } from "@/components/ui/PageSection";
import { assistantAiAvailability, getAssistantAiFallbackCopy } from "@/features/assistant/aiAvailability";
import { assistantCommandHintRow } from "@/features/hq/assistantCommandHints";
import { getLocalAssistantContextRead } from "@/features/hq/assistantPreview";
import { useEasyCalendar } from "@/features/easycalendar/EasyCalendarContext";
import { EasyContactsProvider, useEasyContacts } from "@/features/easycontacts/EasyContactsContext";
import { EasyNotesProvider, useEasyNotes } from "@/features/easynotes/EasyNotesContext";
import {
  formatDuration,
  formatTimeLabel,
  getOpenTimeWindowsForDay,
  startOfDay,
} from "@/features/easycalendar/lib/calendarUtils";
import { sortActiveTasks } from "@/features/easylist/lib/taskUtils";
import { useLastAppRoute } from "@/lib/mobile/appRouteMemory";
import { useAuth } from "@/features/auth/AuthContext";

type TodayContextItem = {
  label: string;
  title: string;
  detail: string;
  to: string;
};

type TodayItemKind = "task" | "event" | "block" | "window";
type TodayItemIdentity = `${TodayItemKind}:${string}`;
type TodayReviewItem = TodayContextItem & { identity: TodayItemIdentity };
type TodayDataReadiness = "loading" | "partial" | "ready" | "unavailable";

type TodayDataState = {
  readiness: TodayDataReadiness;
  isUpdating: boolean;
  failureMessages: Array<{ area: "notes" | "people" | "plan"; message: string }>;
};

function getTodayDataState({
  dailyDataLoading,
  dailyDataError,
  hasDailyData,
  notesLoading,
  notesError,
  peopleLoading,
  peopleError,
}: {
  dailyDataLoading: boolean;
  dailyDataError: boolean;
  hasDailyData: boolean;
  notesLoading: boolean;
  notesError: boolean;
  peopleLoading: boolean;
  peopleError: boolean;
}): TodayDataState {
  const failureMessages = [
    dailyDataError ? { area: "plan" as const, message: "Part of your plan could not be loaded." } : null,
    notesError ? { area: "notes" as const, message: "Notes could not be loaded." } : null,
    peopleError ? { area: "people" as const, message: "People follow-ups could not be loaded." } : null,
  ].filter((item): item is TodayDataState["failureMessages"][number] => Boolean(item));
  const isUpdating = dailyDataLoading || notesLoading || peopleLoading;

  if (dailyDataLoading && !hasDailyData) {
    return { readiness: "loading", isUpdating, failureMessages };
  }
  if (dailyDataError && !hasDailyData) {
    return { readiness: "unavailable", isUpdating, failureMessages };
  }
  if (isUpdating || failureMessages.length) {
    return { readiness: "partial", isUpdating, failureMessages };
  }
  return { readiness: "ready", isUpdating, failureMessages };
}

function getTodayItemIdentity(kind: TodayItemKind, id: string): TodayItemIdentity {
  return `${kind}:${id}`;
}

function getFirstDistinctTodayItem<T extends { id: string }>(
  items: T[],
  kind: TodayItemKind,
  excludedIdentities: ReadonlySet<TodayItemIdentity>
) {
  return items.find((item) => !excludedIdentities.has(getTodayItemIdentity(kind, item.id))) || null;
}

function isSameDate(left: Date | null, right: Date) {
  return Boolean(left && startOfDay(left).getTime() === startOfDay(right).getTime());
}

function parseDate(value?: string) {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatFollowUpDate(value?: string) {
  const target = parseDate(value);
  if (!target) return "No follow-up date";
  const today = startOfDay(new Date());
  const diffDays = Math.round((startOfDay(target).getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"} overdue`;
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  return `Due in ${diffDays} days`;
}

function getContactPlaceLabel(contact: { currentCity?: string; region?: string; lastKnownPlace?: string }) {
  return contact.currentCity || contact.region || contact.lastKnownPlace || "";
}

function HQPageContent() {
  const { isDemoMode } = useAuth();
  const {
    events,
    taskBlocks,
    tasks,
    isDailyDataLoading,
    error: calendarError,
  } = useEasyCalendar();
  const { notes, isLoading: notesLoading, error: notesError } = useEasyNotes();
  const { contacts, isLoading: peopleLoading, error: peopleError } = useEasyContacts();
  const lastAppRoute = useLastAppRoute();
  const today = startOfDay(new Date());
  const hasDailyData = Boolean(events.length || taskBlocks.length || tasks.length);
  const todayDataInputs = {
    dailyDataLoading: isDailyDataLoading,
    dailyDataError: Boolean(calendarError),
    hasDailyData,
    notesLoading,
    notesError: Boolean(notesError),
    peopleLoading,
    peopleError: Boolean(peopleError),
  };
  const todayDataState = getTodayDataState(todayDataInputs);

  const todayEvents = events
    .filter((event) => event.startAt && startOfDay(event.startAt).getTime() === today.getTime())
    .sort((left, right) => (left.startAt?.getTime() || 0) - (right.startAt?.getTime() || 0));
  const nextEvents = todayEvents.slice(0, 3);
  const dueTodayTasks = sortActiveTasks(tasks.filter((task) => !task.completed && isSameDate(task.dueDate, today)));
  const overdueTasks = sortActiveTasks(tasks.filter((task) => !task.completed && task.dueDate && startOfDay(task.dueDate).getTime() < today.getTime()));
  const unplannedInboxTasks = useMemo(
    () =>
      tasks
        .filter(
          (task) =>
            !task.completed &&
            !task.deletedAt &&
            !task.dueDate &&
            !task.linkedCalendarEventId &&
            !task.linkedCalendarBlockIds.length
        )
        .sort((left, right) => {
          const leftTime = left.createdAt?.getTime() || left.updatedAt?.getTime() || 0;
          const rightTime = right.createdAt?.getTime() || right.updatedAt?.getTime() || 0;
          return rightTime - leftTime;
        }),
    [tasks]
  );
  const recentUnplannedInboxTasks = unplannedInboxTasks.slice(0, 3);
  const openWindows = getOpenTimeWindowsForDay(today, events, taskBlocks);
  const openMinutes = openWindows.reduce((sum, window) => sum + window.minutes, 0);
  const mostUrgent = overdueTasks[0] || dueTodayTasks[0] || null;
  const mostUrgentLabel = overdueTasks[0]?.title || dueTodayTasks[0]?.title || "";
  const savedContextNote = notes.find((note) => note.pinned) || notes[0] || null;
  const dueContact = contacts
    .filter((contact) => {
      const followUpAt = parseDate(contact.nextFollowUpAt);
      return followUpAt && followUpAt.getTime() <= today.getTime();
    })
    .sort((left, right) => (parseDate(left.nextFollowUpAt)?.getTime() || 0) - (parseDate(right.nextFollowUpAt)?.getTime() || 0))[0] || null;
  const peopleFollowUps = contacts
    .filter((contact) => parseDate(contact.nextFollowUpAt))
    .sort((left, right) => (parseDate(left.nextFollowUpAt)?.getTime() || 0) - (parseDate(right.nextFollowUpAt)?.getTime() || 0));
  const visiblePeopleFollowUps = peopleFollowUps.slice(0, 3);
  const duePeopleFollowUpCount = peopleFollowUps.filter((contact) => {
    const followUpAt = parseDate(contact.nextFollowUpAt);
    return followUpAt && followUpAt.getTime() <= today.getTime();
  }).length;
  const placeContact =
    (dueContact && getContactPlaceLabel(dueContact) ? dueContact : null) ||
    contacts.find((contact) => getContactPlaceLabel(contact) && (contact.visitNote || contact.movedRecently)) ||
    contacts.find((contact) => getContactPlaceLabel(contact)) ||
    null;
  const contactPlace = placeContact ? getContactPlaceLabel(placeContact) : "";
  const quickWins = sortActiveTasks(tasks.filter((task) => !task.completed && (task.estimatedLength || 999) <= 20));
  const quickWin = quickWins[0] || null;
  const todaySummary = [
    { label: "Due", value: `${overdueTasks.length + dueTodayTasks.length}` },
    { label: "Plan", value: `${todayEvents.length}` },
    { label: "Open", value: formatDuration(openMinutes) },
  ];
  const startHere = useMemo(() => {
    const firstDueTask = overdueTasks[0] || dueTodayTasks[0] || null;
    const firstOpenWindow = openWindows[0] || null;

    if (firstDueTask) {
      return {
        identity: getTodayItemIdentity("task", firstDueTask.id),
        label: firstDueTask.title || "Untitled task",
        reason: overdueTasks.length
          ? "This is behind. Choose the next step in Inbox."
          : "This is due today. Review it before adding more.",
        buttonLabel: "Open Inbox",
        to: "/app/easylist/add",
      };
    }
    if (quickWin) {
      return {
        identity: getTodayItemIdentity("task", quickWin.id),
        label: quickWin.title || "Untitled task",
        reason: `${quickWin.estimatedLength || 20} minutes. Good for a small gap.`,
        buttonLabel: "Open Inbox",
        to: "/app/easylist/add",
      };
    }
    if (openWindows.length >= 3) {
      return {
        identity: firstOpenWindow
          ? getTodayItemIdentity(
              "window",
              `${firstOpenWindow.startAt.getTime()}-${firstOpenWindow.endAt.getTime()}`
            )
          : null,
        label: firstOpenWindow
          ? `Plan the ${formatTimeLabel(firstOpenWindow.startAt)} open window`
          : "Plan open time",
        reason: "Give the next open window a light plan before adding more to the day.",
        buttonLabel: "Plan Today",
        to: "/app/easycalendar/day",
      };
    }
    return {
      identity: null,
      label: "Keep the next note close",
      reason: "Everything looks calm. Review context in Notes.",
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
    savedContextNote
      ? {
          label: savedContextNote.pinned ? "Pinned context" : "Saved context",
          title: savedContextNote.title || "Untitled note",
          detail: savedContextNote.tags.length
            ? `Tags: ${savedContextNote.tags.slice(0, 2).join(", ")}`
            : "Keep this note close before deciding the next move.",
          to: "/app/easynotes",
        }
      : null,
    placeContact && contactPlace
      ? {
          label: dueContact?.id === placeContact.id ? "People due" : "People near place",
          title: placeContact.fullName || "Someone in People",
          detail: dueContact?.id === placeContact.id
            ? `Follow-up is due; saved place label only: ${contactPlace}.`
            : `Saved label only: ${contactPlace}. No map lookup.`,
          to: "/app/easycontacts",
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
      ]).slice(0, 4);
  const contextLead = getLocalAssistantContextRead({
    overdueCount: overdueTasks.length,
    dueTodayCount: dueTodayTasks.length,
    eventCount: todayEvents.length,
    openTimeLabel: formatDuration(openMinutes),
    noteTitle: savedContextNote?.title || undefined,
    contactName: placeContact?.fullName || undefined,
    contactPlace: contactPlace || undefined,
  });
  const reviewIdentities = new Set<TodayItemIdentity>(startHere.identity ? [startHere.identity] : []);
  const overdueReviewTask = getFirstDistinctTodayItem(overdueTasks, "task", reviewIdentities);
  if (overdueReviewTask) {
    reviewIdentities.add(getTodayItemIdentity("task", overdueReviewTask.id));
  }
  const dueTodayReviewTask = getFirstDistinctTodayItem(dueTodayTasks, "task", reviewIdentities);
  if (dueTodayReviewTask) {
    reviewIdentities.add(getTodayItemIdentity("task", dueTodayReviewTask.id));
  }
  const nextReviewEvent = getFirstDistinctTodayItem(nextEvents, "event", reviewIdentities);
  if (nextReviewEvent) {
    reviewIdentities.add(getTodayItemIdentity("event", nextReviewEvent.id));
  }
  const quickWinReviewTask = getFirstDistinctTodayItem(quickWins, "task", reviewIdentities);

  const attentionItems = [
    overdueReviewTask
      ? {
          identity: getTodayItemIdentity("task", overdueReviewTask.id),
          label: "Recover",
          title: overdueReviewTask.title,
          detail: "This is behind. Handle, reschedule, or intentionally release it.",
          to: "/app/easylist/dashboard",
        }
      : null,
    dueTodayReviewTask
      ? {
          identity: getTodayItemIdentity("task", dueTodayReviewTask.id),
          label: "Due today",
          title: dueTodayReviewTask.title,
          detail: `${dueTodayTasks.length} due item${dueTodayTasks.length === 1 ? "" : "s"} still need a decision.`,
          to: "/app/easylist/dashboard",
        }
      : null,
    nextReviewEvent
      ? {
          identity: getTodayItemIdentity("event", nextReviewEvent.id),
          label: "Next in Plan",
          title: nextReviewEvent.title || "Untitled event",
          detail: nextReviewEvent.allDay
            ? "All day"
            : `${formatTimeLabel(nextReviewEvent.startAt)} - ${formatTimeLabel(nextReviewEvent.endAt)}`,
          to: "/app/easycalendar/day",
        }
      : null,
    quickWinReviewTask
      ? {
          identity: getTodayItemIdentity("task", quickWinReviewTask.id),
          label: "Tiny win",
          title: quickWinReviewTask.title,
          detail: `${quickWinReviewTask.estimatedLength || 20} minutes. Good for a small gap.`,
          to: "/app/easylist/dashboard",
        }
      : null,
  ]
    .filter((item): item is TodayReviewItem => Boolean(item))
    .slice(0, 3);
  const assistantRead = contextLead;
  const todayAiFallbackCopy = getAssistantAiFallbackCopy("today");
  const canShowDailyContent = todayDataState.readiness === "ready" || todayDataState.readiness === "partial";
  const canShowCalmFallback =
    !todayDataInputs.dailyDataLoading &&
    !todayDataInputs.dailyDataError &&
    !todayDataInputs.notesLoading &&
    !todayDataInputs.notesError &&
    !todayDataInputs.peopleLoading &&
    !todayDataInputs.peopleError;
  const canShowStartHere = Boolean(startHere.identity) || canShowCalmFallback;
  const canShowSummary = !todayDataInputs.dailyDataLoading && !todayDataInputs.dailyDataError;
  const canShowReview =
    attentionItems.length > 0 || (!todayDataInputs.dailyDataLoading && !todayDataInputs.dailyDataError);
  const weeklyReviewTo = `/app/easystatistics?tab=week${isDemoMode ? "&demo=1" : ""}`;
  const lastAssistantPlace = lastAppRoute
    ? {
        ...lastAppRoute,
        label: lastAppRoute.label === "EasyLife" ? "Today" : lastAppRoute.label,
      }
    : null;

  function openNaturalCapture() {
    window.dispatchEvent(new Event("easylife:open-capture"));
  }

  return (
    <main
      className="page-wrap app-theme app-theme-easyhq"
      data-today-readiness={todayDataState.readiness}
    >
      <section className="assistant-home" aria-labelledby="hq-title">
        <article className="hq-start-card" aria-busy={todayDataState.isUpdating || undefined}>
          <div className="hq-start-heading">
            <div>
              <p>Today</p>
              <h1 id="hq-title">Start with what matters.</h1>
            </div>
            <span className="assistant-availability-pill">{assistantAiAvailability.badge}</span>
          </div>
          {todayDataState.readiness === "partial" && todayDataState.isUpdating ? (
            <div className="hq-status-strip" role="status" aria-live="polite">
              <article>
                <span>Updating</span>
                <strong>Checking today…</strong>
                <p>Available actions stay visible while the rest catches up.</p>
              </article>
            </div>
          ) : null}
          {todayDataState.failureMessages.length ? (
            <div className="hq-status-strip" role="alert" aria-label="Today data notice">
              {todayDataState.failureMessages.map((failure) => (
                <article key={failure.area}>
                  <span>{failure.area}</span>
                  <strong>{failure.message}</strong>
                </article>
              ))}
            </div>
          ) : null}
          {canShowDailyContent ? <strong>{assistantRead}</strong> : null}
          {canShowDailyContent && canShowSummary ? (
            <div className="hq-today-summary" aria-label="Today summary">
              {todaySummary.map((item) => (
                <span key={item.label}>
                  <b>{item.value}</b>
                  {item.label}
                </span>
              ))}
            </div>
          ) : null}
          {canShowDailyContent && canShowStartHere ? (
            <div className="assistant-next-inline" aria-labelledby="assistant-next-title">
              <div>
                <span>Start here</span>
                <h2 id="assistant-next-title">{startHere.label}</h2>
                <p>{startHere.reason}</p>
              </div>
              <div className="task-composer-actions">
                <Link to={startHere.to} className="primary-button">
                  {startHere.buttonLabel}
                </Link>
                <Link to="/app/easylist/add" className="button-secondary">
                  Capture thought
                </Link>
              </div>
            </div>
          ) : !canShowDailyContent ? (
            <div
              className="assistant-next-inline"
              role={todayDataState.readiness === "loading" ? "status" : undefined}
              aria-live={todayDataState.readiness === "loading" ? "polite" : undefined}
            >
              <div>
                <span>Today</span>
                <h2 id="assistant-next-title">
                  {todayDataState.readiness === "unavailable" ? "Today’s plan is unavailable." : "Checking today…"}
                </h2>
                <p>
                  {todayDataState.readiness === "unavailable"
                    ? "Capture still works while the rest of Today stays unchanged."
                    : "Your saved plan is still loading."}
                </p>
              </div>
              {todayDataState.readiness === "unavailable" ? (
                <Link to="/app/easycalendar/day" className="button-secondary">
                  Open Plan
                </Link>
              ) : null}
            </div>
          ) : null}
          <button type="button" className="hq-natural-capture" onClick={openNaturalCapture}>
            <span>Capture</span>
            <strong>{assistantCommandHintRow}</strong>
            <small>{todayAiFallbackCopy}</small>
            <em>Quick add</em>
          </button>
          {canShowDailyContent ? <details className="hq-context-stack">
            <summary>
              <span>Context</span>
              <strong>{contextLead}</strong>
            </summary>
            <div>
              {lastAssistantPlace ? (
                <Link to={lastAssistantPlace.path}>
                  <span>Continue</span>
                  <strong>{lastAssistantPlace.label}</strong>
                  <p>Return to where you left off.</p>
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
          </details> : null}
        </article>
      </section>

      {canShowDailyContent && unplannedInboxTasks.length ? (
        <PageSection eyebrow="Inbox to review" title={`${unplannedInboxTasks.length} unplanned item${unplannedInboxTasks.length === 1 ? "" : "s"}`}>
          <div className="assistant-attention-list">
            {recentUnplannedInboxTasks.map((task) => (
              <Link className="assistant-attention-item" to="/app/easylist/dashboard" key={task.id}>
                <span>Needs review</span>
                <strong>{task.title || "Untitled task"}</strong>
                <p>{task.notes || "No date or Plan block yet. Decide whether it belongs today, later, or just stays in Inbox."}</p>
              </Link>
            ))}
            <Link className="assistant-attention-item" to="/app/easylist/dashboard">
              <span>Review only</span>
              <strong>Open Inbox before planning the day.</strong>
              <p>Nothing is scheduled automatically. You choose what moves into Plan.</p>
            </Link>
          </div>
        </PageSection>
      ) : null}

      {visiblePeopleFollowUps.length ? (
        <PageSection
          eyebrow="People follow-ups"
          title={duePeopleFollowUpCount ? `${duePeopleFollowUpCount} people follow-up${duePeopleFollowUpCount === 1 ? "" : "s"} due` : "Upcoming People follow-ups"}
        >
          <div className="assistant-attention-list">
            {visiblePeopleFollowUps.map((contact) => (
              <Link className="assistant-attention-item" to={`/app/easycontacts?contact=${contact.id}`} key={contact.id}>
                <span>{formatFollowUpDate(contact.nextFollowUpAt)}</span>
                <strong>{contact.fullName || "Unnamed person"}</strong>
                <p>{contact.notes || "Manual reminder only. Open People to decide what to do next."}</p>
              </Link>
            ))}
            <Link className="assistant-attention-item" to="/app/easycontacts">
              <span>Manual only</span>
              <strong>No calendar sync, email, texts, or hidden writes.</strong>
              <p>Today only surfaces saved People follow-up dates. You choose any action yourself.</p>
            </Link>
          </div>
        </PageSection>
      ) : null}

      {canShowDailyContent && canShowReview ? <PageSection eyebrow="Review" title="Only what needs a decision">
        <div className="assistant-attention-list">
          {attentionItems.length ? (
            attentionItems.map((item) => (
              <Link className="assistant-attention-item" to={item.to} key={item.identity}>
                <span>{item.label}</span>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </Link>
            ))
          ) : (
            <article className="assistant-attention-item">
              <span>Clear</span>
              <strong>No other loose end needs a decision right now.</strong>
              <p>Start here still holds the next move.</p>
            </article>
          )}
        </div>
        <Link className="button-secondary compact-button" to={weeklyReviewTo}>Review my week</Link>
      </PageSection> : null}

      <PageSection eyebrow="Demo path" title="The calm assistant loop">
        <div className="hq-demo-path" aria-label="EasyLife first-run demo path">
          <Link to="/app/easynotes/new" className="hq-demo-step">
            <span>1</span>
            <div>
              <small>Write first</small>
              <strong>Start in Notes</strong>
              <p>Capture the rough thought before organizing it. Notes shows save and browser-recovery feedback.</p>
            </div>
          </Link>
          <Link to="/app/easylist/add" className="hq-demo-step">
            <span>2</span>
            <div>
              <small>Clarify</small>
              <strong>Add the next task to Inbox</strong>
              <p>Save one concrete next step, see confirmation, then choose what belongs in Today.</p>
            </div>
          </Link>
          <Link to="/app/easycalendar/day" className="hq-demo-step">
            <span>3</span>
            <div>
              <small>Plan lightly</small>
              <strong>Give the day a shape</strong>
              <p>Use Plan after review. Nothing moves into the day unless you decide it should.</p>
            </div>
          </Link>
          <Link to="/app/settings/privacy" className="hq-demo-step">
            <span>4</span>
            <div>
              <small>Trust check</small>
              <strong>End at Settings</strong>
              <p>Confirm what is real today: local review-first helpers, no live AI, no sending, and no external sync.</p>
            </div>
          </Link>
        </div>
      </PageSection>
    </main>
  );
}

export function HQPage() {
  return (
    <EasyNotesProvider>
      <EasyContactsProvider>
        <HQPageContent />
      </EasyContactsProvider>
    </EasyNotesProvider>
  );
}
