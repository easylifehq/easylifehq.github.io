import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { buildLocalDraftFromSuggestion, buildPlanHandoffPreview } from "@/features/assistant/localDraftBuilder";
import { classifyAssistantIntent } from "@/features/assistant/intentClassifier";
import type { AssistantPlanHandoffPreview } from "@/features/assistant/localDraftTypes";
import { CalendarEventDrawer } from "@/features/easycalendar/components/CalendarEventDrawer";
import { CalendarTaskBlockDrawer } from "@/features/easycalendar/components/CalendarTaskBlockDrawer";
import { useEasyCalendar } from "@/features/easycalendar/EasyCalendarContext";
import { useAuth } from "@/features/auth/AuthContext";
import { buildReviewScheduleWindow, resolveReviewTaskHandoff } from "@/features/coreloop/domain/reviewHandoffs";
import { useSettings } from "@/features/settings/SettingsContext";
import type { CalendarEventType } from "@/lib/firestore/calendarEvents";
import type { CalendarTaskBlockRecord } from "@/lib/firestore/calendarTaskBlocks";
import { useFocusTrap } from "@/lib/a11y/useFocusTrap";
import {
  addMinutes,
  buildHourlySlots,
  buildPlanMyDaySuggestions,
  combineDateAndTime,
  formatDuration,
  formatShortDay,
  formatTimeLabel,
  getDurationMinutes,
  getHourFromTimeInput,
  formatLongDate,
  getItemsForDay,
  getOpenTimeWindowsForDay,
  getScheduledMinutesForDay,
  normalizeTimeInput,
  isSameDay,
  startOfDay,
  startOfWeek,
  toDateInputValue,
  toTimeInputValue,
  type PlannedTaskSuggestion,
} from "@/features/easycalendar/lib/calendarUtils";

type QuickCreateMode = "event" | "deadline" | "task-block";

type QuickCalendarDraft = {
  mode: QuickCreateMode;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  eventType: CalendarEventType;
  selectedTaskId: string;
};

type PlanPreview = {
  suggestions: PlannedTaskSuggestion[];
  replacedBlocks: CalendarTaskBlockRecord[];
};

type AppliedPlanUndo = {
  blocks: Array<{
    id: string;
    taskId: string;
  }>;
  replacedBlocks: CalendarTaskBlockRecord[];
};

type DeletedBlockUndo = {
  block: CalendarTaskBlockRecord;
  taskId: string;
  taskTitle: string;
};

type DayModeId = "light" | "normal" | "push" | "recovery";

export function EasyCalendarDayPage() {
  const {
    categories,
    events,
    taskBlocks,
    tasks,
    isLoading,
    error,
    addEvent,
    deleteTaskBlock,
    scheduleTask,
  } = useEasyCalendar();
  const { isDemoMode } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [quickEvent, setQuickEvent] = useState<QuickCalendarDraft | null>(null);
  const [quickEventMessage, setQuickEventMessage] = useState("");
  const [isSavingQuickEvent, setIsSavingQuickEvent] = useState(false);
  const [planMessage, setPlanMessage] = useState("");
  const [planPreview, setPlanPreview] = useState<PlanPreview | null>(null);
  const [appliedPlanUndo, setAppliedPlanUndo] = useState<AppliedPlanUndo | null>(null);
  const [deletedBlockUndo, setDeletedBlockUndo] = useState<DeletedBlockUndo | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isUndoingPlan, setIsUndoingPlan] = useState(false);
  const [showPlanHandoff, setShowPlanHandoff] = useState(false);
  const [planHandoffPreview, setPlanHandoffPreview] = useState<AssistantPlanHandoffPreview | null>(null);
  const quickCreatePanelRef = useRef<HTMLElement | null>(null);
  const quickCreateCloseRef = useRef<HTMLButtonElement | null>(null);
  const selectedDate = useMemo(() => {
    const dateParam = searchParams.get("date");
    if (!dateParam) return startOfDay(new Date());
    const [year, month, day] = dateParam.split("-").map(Number);
    const parsed = new Date(year, (month || 1) - 1, day || 1);
    return Number.isNaN(parsed.getTime()) ? startOfDay(new Date()) : startOfDay(parsed);
  }, [searchParams]);

  useEffect(() => {
    setPlanPreview(null);
    setAppliedPlanUndo(null);
    setDeletedBlockUndo(null);
    setPlanMessage("");
    setShowPlanHandoff(false);
    setPlanHandoffPreview(null);
  }, [selectedDate]);

  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + index);
    return day;
  }), [weekStart]);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const items = getItemsForDay(selectedDate, events, taskBlocks, categories, tasks);
  const scheduledMinutes = getScheduledMinutesForDay(selectedDate, events, taskBlocks);
  const fixedEventCount = items.filter((item) => item.kind === "event").length;
  const taskBlockCount = items.filter((item) => item.kind === "task-block").length;
  const isOverloaded = scheduledMinutes > 9 * 60;
  const wakeHour = getHourFromTimeInput(settings.calendarWakeTime, 8);
  const planWindowHours = settings.easyCalendar.planMyDayWindowHours;
  const dayEndHour = Math.min(wakeHour + planWindowHours, 24);
  const hourlySlots = useMemo(() => buildHourlySlots(selectedDate, wakeHour, planWindowHours), [selectedDate, wakeHour, planWindowHours]);
  const openWindows = useMemo(
    () => getOpenTimeWindowsForDay(selectedDate, events, taskBlocks, wakeHour, dayEndHour),
    [events, taskBlocks, selectedDate, wakeHour, dayEndHour]
  );
  const activeTasks = useMemo(() => tasks.filter((task) => !task.completed && !task.deletedAt), [tasks]);
  const openMinutes = openWindows.reduce((sum, window) => sum + window.minutes, 0);
  const recoveryTaskCount = activeTasks.filter(
    (task) => task.dueDate && startOfDay(task.dueDate).getTime() < selectedDate.getTime()
  ).length;
  const activeDayMode: DayModeId =
    isOverloaded || recoveryTaskCount
      ? "recovery"
      : scheduledMinutes <= 3 * 60 && openMinutes >= 4 * 60
        ? "light"
        : scheduledMinutes >= 7 * 60 || openMinutes < 90
          ? "push"
          : "normal";
  const dayModeOptions: Array<{ id: DayModeId; label: string; detail: string }> = [
    {
      id: "light",
      label: "Light day",
      detail: "Keep one meaningful move and leave room to breathe.",
    },
    {
      id: "normal",
      label: "Normal day",
      detail: "Choose one main block, one admin block, and one reset.",
    },
    {
      id: "push",
      label: "Push day",
      detail: "Protect the must-do work and stop adding extras.",
    },
    {
      id: "recovery",
      label: "Recovery day",
      detail: "Rescue overdue work before planning anything ambitious.",
    },
  ];
  const activeDayModeOption = dayModeOptions.find((mode) => mode.id === activeDayMode) || dayModeOptions[1];
  const fixedCommitmentLabel = `${fixedEventCount} fixed commitment${fixedEventCount === 1 ? "" : "s"}`;
  const focusBlockLabel = `${taskBlockCount} focus block${taskBlockCount === 1 ? "" : "s"}`;
  const overdueItemVerb = recoveryTaskCount === 1 ? "needs" : "need";
  const capacityReason =
    activeDayMode === "recovery"
      ? recoveryTaskCount
        ? `${recoveryTaskCount} overdue item${recoveryTaskCount === 1 ? "" : "s"} ${overdueItemVerb} rescue before this day takes on more.`
        : `${formatDuration(scheduledMinutes)} is already planned, so this day needs recovery space.`
      : activeDayMode === "light"
        ? `${formatDuration(openMinutes)} is open after ${formatDuration(scheduledMinutes)} planned; keep one useful block and leave the margin alone.`
        : activeDayMode === "push"
          ? `${formatDuration(openMinutes)} is open around ${fixedCommitmentLabel} and ${focusBlockLabel}; extras should wait.`
          : `${formatDuration(scheduledMinutes)} planned with ${formatDuration(openMinutes)} open; choose one main block and one admin pass.`;
  const nextPlanningAction = recoveryTaskCount
    ? "Start by rescuing overdue work before adding anything new."
    : isOverloaded
      ? "Protect the fixed commitments and move one flexible block out."
      : openWindows.length
        ? "Preview a plan, then approve only the blocks that fit the open windows."
      : "Review fixed commitments before adding more to this day.";
  const requestedScheduleTaskId = searchParams.get("scheduleTask");
  const scheduleHandoff = resolveReviewTaskHandoff(requestedScheduleTaskId, tasks, isLoading);

  useEffect(() => {
    if (!requestedScheduleTaskId || scheduleHandoff.state === "loading" || scheduleHandoff.state === "idle") return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("scheduleTask");
    const nextSearch = nextParams.toString();

    if (scheduleHandoff.state === "missing") {
      setPlanMessage("That review task is no longer available. Choose another task from Plan.");
    } else if (scheduleHandoff.state === "completed") {
      setPlanMessage("That review task is already complete, so it was not added to Plan.");
    } else if (scheduleHandoff.state === "ready") {
      const handoffTask = scheduleHandoff.task;
      const window = buildReviewScheduleWindow({
        selectedDate,
        wakeHour,
        defaultMinutes: settings.easyCalendar.defaultTaskBlockMinutes,
        taskMinutes: handoffTask.estimatedLength,
        firstOpenWindow: openWindows[0] || null,
      });
      setQuickEvent({
        mode: "task-block",
        date: toDateInputValue(window.startAt),
        startTime: normalizeTimeInput(toTimeInputValue(window.startAt)),
        endTime: normalizeTimeInput(toTimeInputValue(window.endAt), "10:00"),
        title: "",
        eventType: "work",
        selectedTaskId: handoffTask.id,
      });
      setQuickEventMessage("");
      setPlanMessage(`Review handoff ready. Choose when to place “${handoffTask.title || "Untitled task"}”.`);
    }

    navigate(
      { pathname: "/app/easycalendar/day", search: nextSearch ? `?${nextSearch}` : "" },
      { replace: true },
    );
  }, [
    isLoading,
    navigate,
    openWindows,
    requestedScheduleTaskId,
    scheduleHandoff.state,
    scheduleHandoff.task,
    searchParams,
    selectedDate,
    settings.easyCalendar.defaultTaskBlockMinutes,
    tasks,
    wakeHour,
  ]);
  const assistantPlanSuggestion = useMemo(
    () => classifyAssistantIntent("Block 45 minutes today for the highest-friction item after fixed commitments."),
    []
  );
  const assistantPlanDraft = useMemo(
    () => buildLocalDraftFromSuggestion(assistantPlanSuggestion, "plan"),
    [assistantPlanSuggestion]
  );
  const selectedBlock = useMemo(
    () => taskBlocks.find((taskBlock) => taskBlock.id === selectedBlockId) || null,
    [selectedBlockId, taskBlocks]
  );
  const selectedEvent = useMemo(
    () => events.find((calendarEvent) => calendarEvent.id === selectedEventId) || null,
    [selectedEventId, events]
  );
  const selectedTask = useMemo(
    () =>
      selectedBlock
        ? tasks.find((task) => task.id === selectedBlock.taskId) || null
        : null,
    [selectedBlock, tasks]
  );

  useFocusTrap(Boolean(quickEvent), quickCreatePanelRef, {
    initialFocusRef: quickCreateCloseRef,
    onEscape: () => setQuickEvent(null),
  });

  function openDate(date: Date) {
    navigate(`/app/easycalendar/day?date=${toDateInputValue(date)}`);
  }

  function moveDay(amount: number) {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + amount);
    openDate(nextDate);
  }

  function handlePlanMyDayPreview() {
    const existingSuggestedBlocks = taskBlocks.filter(
      (taskBlock) =>
        isSameDay(taskBlock.startAt, selectedDate) &&
        taskBlock.planningState === "suggested" &&
        !taskBlock.completed
    );
    const remainingTaskBlocks = taskBlocks.filter(
      (taskBlock) => !existingSuggestedBlocks.some((existing) => existing.id === taskBlock.id)
    );
    const plan = buildPlanMyDaySuggestions(selectedDate, tasks, events, remainingTaskBlocks, {
      wakeHour,
      endHour: dayEndHour,
      defaultTaskBlockMinutes: settings.easyCalendar.defaultTaskBlockMinutes,
    });

    setAppliedPlanUndo(null);

    if (!plan.suggestions.length) {
      setPlanPreview(null);
      setPlanMessage(
        plan.windows.length
          ? "No good task fits were found for this day yet."
          : "There are no open windows to place suggested work on this day."
      );
      return;
    }

    setPlanMessage("");
    setPlanPreview({
      suggestions: plan.suggestions,
      replacedBlocks: existingSuggestedBlocks,
    });
  }

  async function handleApplyPlanPreview() {
    if (!planPreview) return;

    setIsPlanning(true);
    setPlanMessage("");

    try {
      if (planPreview.replacedBlocks.length) {
        await Promise.all(planPreview.replacedBlocks.map((taskBlock) => deleteTaskBlock(taskBlock.id, taskBlock.taskId)));
      }

      const scheduleResults = await Promise.allSettled(
        planPreview.suggestions.map((suggestion) =>
          scheduleTask(suggestion.task, {
            startAt: suggestion.startAt,
            endAt: suggestion.endAt,
            planningState: "suggested",
            userAdjusted: false,
          }).then((blockId) => (blockId ? { id: blockId, taskId: suggestion.task.id } : null))
        )
      );
      const blocks = scheduleResults.flatMap((result) =>
        result.status === "fulfilled" && result.value ? [result.value] : []
      );
      const failedCount = scheduleResults.filter((result) => result.status === "rejected").length;
      const hasUndoableChange = blocks.length > 0 || planPreview.replacedBlocks.length > 0;

      setAppliedPlanUndo(hasUndoableChange ? { blocks, replacedBlocks: planPreview.replacedBlocks } : null);
      setPlanPreview(null);
      setPlanMessage(
        failedCount
          ? `Added ${blocks.length} suggested block${blocks.length === 1 ? "" : "s"}; ${failedCount} could not be added.${
              hasUndoableChange ? " Undo is available below." : ""
            }`
          : hasUndoableChange
            ? `Added ${blocks.length} suggested block${blocks.length === 1 ? "" : "s"}. Undo is available below.`
            : "No suggested blocks were added."
      );
    } finally {
      setIsPlanning(false);
    }
  }

  async function handleUndoAppliedPlan() {
    if (!appliedPlanUndo) return;

    setIsUndoingPlan(true);
    setPlanMessage("");

    try {
      await Promise.all(appliedPlanUndo.blocks.map((block) => deleteTaskBlock(block.id, block.taskId)));
      if (appliedPlanUndo.replacedBlocks.length) {
        await Promise.all(
          appliedPlanUndo.replacedBlocks.map((block) => {
            const task = tasks.find((candidate) => candidate.id === block.taskId);
            if (!task) return Promise.resolve(null);
            return scheduleTask(task, {
              startAt: block.startAt,
              endAt: block.endAt,
              planningState: block.planningState,
              userAdjusted: block.userAdjusted,
            });
          })
        );
      }

      setAppliedPlanUndo(null);
      setPlanMessage(
        appliedPlanUndo.replacedBlocks.length
          ? "Plan undone. Your earlier suggested blocks were restored."
          : "Plan undone. The suggested blocks were removed."
      );
    } finally {
      setIsUndoingPlan(false);
    }
  }

  async function handleUndoDeletedBlock() {
    if (!deletedBlockUndo) return;

    const task = tasks.find((candidate) => candidate.id === deletedBlockUndo.taskId);
    if (!task) {
      setPlanMessage("That task is not available to restore anymore.");
      setDeletedBlockUndo(null);
      return;
    }

    const restoreScrollY = window.scrollY;
    const restoredBlockId = await scheduleTask(task, {
      startAt: deletedBlockUndo.block.startAt,
      endAt: deletedBlockUndo.block.endAt,
      planningState: deletedBlockUndo.block.planningState,
      userAdjusted: deletedBlockUndo.block.userAdjusted,
    });

    setDeletedBlockUndo(null);
    setPlanMessage(restoredBlockId ? "Removed block restored." : "Could not restore that block.");
    window.requestAnimationFrame(() => window.scrollTo({ top: restoreScrollY }));
  }

  function openQuickEvent(slotStart: Date) {
    const safeMinutes = Math.max(15, settings.easyCalendar.defaultTaskBlockMinutes || 30);
    const slotEnd = addMinutes(slotStart, safeMinutes) || addMinutes(slotStart, 30) || slotStart;
    setQuickEvent({
      mode: "event",
      date: toDateInputValue(slotStart),
      startTime: normalizeTimeInput(toTimeInputValue(slotStart)),
      endTime: toTimeInputValue(slotEnd),
      title: "",
      eventType: "appointment",
      selectedTaskId: "",
    });
    setQuickEventMessage("");
  }

  async function handleQuickEventSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!quickEvent) return;

    const safeStartTime = normalizeTimeInput(quickEvent.startTime);
    const safeEndTime = normalizeTimeInput(quickEvent.endTime, "10:00");
    const startAt = combineDateAndTime(quickEvent.date, safeStartTime);
    const endAt = combineDateAndTime(quickEvent.date, safeEndTime);

    if (quickEvent.mode === "task-block" && !quickEvent.selectedTaskId) {
      setQuickEventMessage("Choose a task first.");
      return;
    }

    if (quickEvent.mode !== "task-block" && !quickEvent.title.trim()) {
      setQuickEventMessage(quickEvent.mode === "deadline" ? "Name the deadline first." : "Name the event first.");
      return;
    }

    if (!startAt) {
      setQuickEventMessage("Choose a valid time first.");
      return;
    }

    if (quickEvent.mode !== "deadline" && (!endAt || endAt <= startAt)) {
      setQuickEventMessage("End time needs to be after the start.");
      return;
    }

    setQuickEvent((current) => current ? { ...current, startTime: safeStartTime, endTime: safeEndTime } : current);
    setIsSavingQuickEvent(true);
    try {
      if (quickEvent.mode === "task-block") {
        const task = activeTasks.find((activeTask) => activeTask.id === quickEvent.selectedTaskId);
        if (!task || !endAt) {
          setQuickEventMessage("That task is not available anymore.");
          return;
        }

        await scheduleTask(task, {
          startAt,
          endAt,
          planningState: "scheduled",
          userAdjusted: true,
        });
        setQuickEvent(null);
        setQuickEventMessage("");
        setPlanMessage(
          isDemoMode
            ? `Demo preview complete for “${task.title || "Untitled task"}”. No Firebase write ran.`
            : `Placed “${task.title || "Untitled task"}” in Plan.`,
        );
        return;
      }

      await addEvent({
        title: quickEvent.title.trim(),
        description: "",
        itemKind: quickEvent.mode === "deadline" ? "deadline" : "event",
        categoryId: null,
        startAt,
        endAt: quickEvent.mode === "deadline" ? startAt : endAt,
        allDay: false,
        isRecurring: false,
        recurrenceRule: null,
        eventType: quickEvent.eventType,
      });
      setQuickEvent(null);
      setQuickEventMessage("");
    } finally {
      setIsSavingQuickEvent(false);
    }
  }

  return (
    <>
      <PageSection
        headingLevel={1}
        eyebrow="Plan"
        title="Plan a realistic day"
        description={`${formatLongDate(selectedDate)}. Use today's capacity before adding more.`}
      >
        {error ? <p className="error-copy">{error}</p> : null}
        <div className="calendar-day-topbar">
          <div className="calendar-inline-actions">
            <Link to="/app/easycalendar/month" className="button-secondary compact-button">
              Month view
            </Link>
            <button type="button" className="ghost-button compact-button" onClick={() => moveDay(-1)}>
              Prev day
            </button>
            <button type="button" className="ghost-button compact-button" onClick={() => moveDay(1)}>
              Next day
            </button>
          </div>
          <button type="button" className="primary-button compact-button" onClick={() => openQuickEvent(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), wakeHour, 0, 0, 0))}>
            Add time
          </button>
        </div>

        <div className="calendar-week-strip" aria-label="Week">
          {weekDays.map((day) => (
            <button
              key={day.toISOString()}
              type="button"
              className={isSameDay(day, selectedDate) ? "active" : ""}
              onClick={() => openDate(day)}
            >
              <span>{formatShortDay(day).split(" ")[0]}</span>
              <strong>{day.getDate()}</strong>
            </button>
          ))}
        </div>

        <div className="calendar-plan-read" aria-label="Assistant day planning read">
          <div className="calendar-plan-read-main">
            <span>Assistant capacity read</span>
            <strong>{activeDayModeOption.label}</strong>
            <p>{capacityReason}</p>
            <em>{activeDayModeOption.detail}</em>
          </div>
          <div className="calendar-plan-read-metrics" aria-label="Day planning metrics">
            <span><strong>{formatDuration(scheduledMinutes)}</strong> planned</span>
            <span><strong>{formatDuration(openMinutes)}</strong> open</span>
            <span><strong>{fixedEventCount}</strong> fixed</span>
            <span><strong>{taskBlockCount}</strong> focus</span>
          </div>
          <div className="calendar-plan-read-action">
            <span>Next planning action</span>
            <p>{nextPlanningAction}</p>
          </div>
        </div>

        <div className="calendar-plan-handoff-card" aria-label="Assistant plan handoff preview">
          <div>
            <span>Assistant plan draft</span>
            <strong>{assistantPlanDraft.title}</strong>
            <p>Preview the shape locally before anything is placed on the day.</p>
          </div>
          <button
            type="button"
            className="button-secondary compact-button"
            onClick={() => {
              const preview = buildPlanHandoffPreview(assistantPlanDraft, {
                date: toDateInputValue(selectedDate),
                startTime: toTimeInputValue(
                  openWindows[0]?.startAt ||
                    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), wakeHour, 0, 0, 0)
                ),
                endTime: toTimeInputValue(
                  openWindows[0]?.endAt ||
                    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), Math.min(wakeHour + 1, 23), 0, 0, 0)
                ),
                dayMode: activeDayMode,
              });
              setPlanHandoffPreview(preview);
              setShowPlanHandoff(Boolean(preview));
            }}
          >
            Preview plan handoff
          </button>
        </div>

        {showPlanHandoff && planHandoffPreview ? (
          <div className="calendar-plan-handoff-preview" aria-label="Editable unscheduled plan draft preview">
            <div className="assistant-local-draft-header">
              <span>Explicit handoff preview</span>
              <strong>Editable unscheduled day draft</strong>
            </div>
            <div className="calendar-plan-handoff-grid">
              <label className="field-stack">
                <span>Plan title</span>
                <input
                  type="text"
                  value={planHandoffPreview.title}
                  onChange={(event) =>
                    setPlanHandoffPreview((current) => current ? { ...current, title: event.target.value } : current)
                  }
                />
              </label>
              <label className="field-stack">
                <span>Day mode</span>
                <select
                  value={planHandoffPreview.dayMode}
                  onChange={(event) =>
                    setPlanHandoffPreview((current) =>
                      current ? { ...current, dayMode: event.target.value as DayModeId } : current
                    )
                  }
                >
                  {dayModeOptions.map((mode) => (
                    <option key={mode.id} value={mode.id}>{mode.label}</option>
                  ))}
                </select>
              </label>
              <label className="field-stack">
                <span>Date</span>
                <input
                  type="date"
                  value={planHandoffPreview.date}
                  onChange={(event) =>
                    setPlanHandoffPreview((current) => current ? { ...current, date: event.target.value } : current)
                  }
                />
              </label>
              <label className="field-stack">
                <span>Start</span>
                <input
                  type="time"
                  value={planHandoffPreview.startTime}
                  onChange={(event) =>
                    setPlanHandoffPreview((current) => current ? { ...current, startTime: event.target.value } : current)
                  }
                />
              </label>
              <label className="field-stack">
                <span>End</span>
                <input
                  type="time"
                  value={planHandoffPreview.endTime}
                  onChange={(event) =>
                    setPlanHandoffPreview((current) => current ? { ...current, endTime: event.target.value } : current)
                  }
                />
              </label>
              <label className="field-stack calendar-plan-handoff-notes">
                <span>Review notes</span>
                <textarea
                  rows={3}
                  value={planHandoffPreview.notes}
                  onChange={(event) =>
                    setPlanHandoffPreview((current) => current ? { ...current, notes: event.target.value } : current)
                  }
                />
              </label>
            </div>
            {planHandoffPreview.warnings.map((warning) => (
              <p key={warning} className="assistant-local-draft-warning">
                {warning}
              </p>
            ))}
          </div>
        ) : null}

        <div className="calendar-type-legend calendar-type-legend-quiet" aria-label="Plan item types">
          <span className="fixed">Fixed</span>
          <span className="deadline">Due</span>
          <span className="flexible">Focus block</span>
        </div>
      </PageSection>

      <PageSection
        eyebrow="Today"
        title="Timeline"
        description="Scan fixed commitments, planned blocks, and open windows in order."
      >
        {isLoading ? <p className="helper-copy">Loading today...</p> : null}

        <div className="calendar-day-actions calendar-command-bar">
          <div className="calendar-status-card">
            <strong>{openWindows.length} open window{openWindows.length === 1 ? "" : "s"}</strong>
            <p>
              {openWindows.length
                ? `${formatDuration(openWindows.reduce((sum, window) => sum + window.minutes, 0))} available.`
                : "No open windows left on this day."}
            </p>
          </div>

          <button
            type="button"
            className="ghost-button compact-button calendar-plan-preview-button"
            onClick={handlePlanMyDayPreview}
            disabled={isPlanning || isUndoingPlan}
          >
            Preview plan
          </button>
        </div>

        {planPreview ? (
          <div className="calendar-plan-preview-card">
            <div>
              <strong>
                Preview {planPreview.suggestions.length} suggested block{planPreview.suggestions.length === 1 ? "" : "s"}
              </strong>
              <p>
                {planPreview.replacedBlocks.length
                  ? `Applying will replace ${planPreview.replacedBlocks.length} current suggestion${
                      planPreview.replacedBlocks.length === 1 ? "" : "s"
                    }.`
                  : "Review the suggested shape before adding anything to the day."}
              </p>
            </div>
            <ol>
              {planPreview.suggestions.map((suggestion) => (
                <li key={`${suggestion.task.id}-${suggestion.startAt.toISOString()}`}>
                  <span>{formatTimeLabel(suggestion.startAt)} - {formatTimeLabel(suggestion.endAt)}</span>
                  <strong>{suggestion.task.title || "Untitled task"}</strong>
                </li>
              ))}
            </ol>
            <div className="calendar-plan-actions">
              <button type="button" className="ghost-button compact-button" onClick={() => setPlanPreview(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="primary-button compact-button"
                onClick={() => void handleApplyPlanPreview()}
                disabled={isPlanning}
              >
                {isPlanning ? "Adding..." : "Add suggestions"}
              </button>
            </div>
          </div>
        ) : null}

        {planMessage ? <div className="calendar-info-card">{planMessage}</div> : null}

        {deletedBlockUndo ? (
          <div className="calendar-plan-undo-card">
            <div>
              <strong>Block removed.</strong>
              <p>{deletedBlockUndo.taskTitle || "This task block"} can be restored while you stay on this day.</p>
            </div>
            <button type="button" className="ghost-button compact-button" onClick={() => void handleUndoDeletedBlock()}>
              Undo remove
            </button>
          </div>
        ) : null}

        {appliedPlanUndo ? (
          <div className="calendar-plan-undo-card">
            <div>
              <strong>Suggested blocks added. Undo is still available.</strong>
              <p>Undo removes the new suggested blocks and restores replaced suggestions.</p>
            </div>
            <button
              type="button"
              className="ghost-button compact-button"
              onClick={() => void handleUndoAppliedPlan()}
              disabled={isUndoingPlan}
            >
              {isUndoingPlan ? "Undoing..." : "Undo plan"}
            </button>
          </div>
        ) : null}

        {isOverloaded ? (
          <div className="calendar-warning-card">
            <strong>This day looks overloaded.</strong>
            <p>
              You have {formatDuration(scheduledMinutes)} on the day already, so
              Plan should suggest carefully instead of packing in more.
            </p>
          </div>
        ) : null}

        <div
          className="calendar-day-surface"
          onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
          onTouchEnd={(event) => {
            if (touchStartX === null) return;
            const endX = event.changedTouches[0]?.clientX ?? touchStartX;
            const delta = endX - touchStartX;
            setTouchStartX(null);
            if (Math.abs(delta) < 48) return;
            moveDay(delta < 0 ? 1 : -1);
          }}
        >
        <div className="calendar-hour-grid">
          {hourlySlots.map((slot, slotIndex) => {
            const slotItems = items.filter((item) => {
              if (item.kind === "deadline") return false;
              if (!item.startAt || !item.endAt) return false;
              const startsInSlot = item.startAt >= slot.startAt && item.startAt < slot.endAt;
              const startsBeforeFirstVisibleSlot =
                slotIndex === 0 && item.startAt < slot.startAt && item.endAt > slot.startAt;
              return startsInSlot || startsBeforeFirstVisibleSlot;
            });

            return (
              <section key={slot.startAt.toISOString()} className="calendar-hour-row">
                <time>{formatTimeLabel(slot.startAt)}</time>
                <div className="calendar-hour-content">
                  {slotItems.length ? (
                    slotItems.map((item) => {
                      const actualDurationMinutes = getDurationMinutes(item.startAt, item.endAt);
                      const durationMinutes = Math.max(30, actualDurationMinutes);
                      const blockHeight = Math.min(220, Math.max(44, Math.round(durationMinutes * 0.9)));
                      const helperDetail =
                        item.allDay || actualDurationMinutes <= 0
                          ? item.helper
                          : `${item.helper} / ${formatDuration(actualDurationMinutes)}`;

                      return (
                        <button
                          key={`${item.kind}-${item.id}-${slot.startAt.toISOString()}`}
                          type="button"
                          onClick={() => {
                            if (item.kind === "task-block") {
                              setSelectedBlockId(item.id);
                            } else if (item.kind === "event") {
                              setSelectedEventId(item.id);
                            }
                          }}
                          className={`calendar-detail-card${item.isFlexible ? " flexible" : " fixed"}${item.isCompleted ? " completed" : ""}`}
                          style={
                            {
                              "--calendar-block-color": item.color,
                              "--calendar-block-min-height": `${blockHeight}px`,
                            } as CSSProperties
                          }
                        >
                          <div>
                            <strong>{item.title}</strong>
                            <p>{helperDetail}</p>
                          </div>
                          <span>{item.badge}</span>
                        </button>
                      );
                    })
                  ) : (
                    <button
                      type="button"
                      className="calendar-empty-hour calendar-empty-hour-button"
                      onClick={() => openQuickEvent(slot.startAt)}
                    >
                      + Add
                    </button>
                  )}
                </div>
              </section>
            );
          })}
        </div>
        </div>

        <details className="advanced-disclosure calendar-deadline-stack">
          <summary>Due items</summary>
          {items.filter((item) => item.kind === "deadline").length ? (
            items
              .filter((item) => item.kind === "deadline")
              .map((item) => {
                const editableDeadline = events.some((event) => event.id === item.id);
                return (
                <button
                  key={`${item.kind}-${item.id}`}
                  type="button"
                  className="calendar-detail-card deadline"
                  style={{ "--calendar-block-color": item.color } as CSSProperties}
                  onClick={() => {
                    if (editableDeadline) {
                      setSelectedEventId(item.id);
                    }
                  }}
                  disabled={!editableDeadline}
                >
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.helper}</p>
                  </div>
                  <span>{item.badge}</span>
                </button>
              );
              })
          ) : (
            <p className="helper-copy">No due items on this day.</p>
          )}
        </details>
      </PageSection>

      <CalendarTaskBlockDrawer
        block={selectedBlock}
        task={selectedTask}
        isOpen={Boolean(selectedBlock)}
        onClose={() => setSelectedBlockId(null)}
        onDeleted={(block, task) => {
          setDeletedBlockUndo({
            block,
            taskId: task.id,
            taskTitle: task.title || block.titleSnapshot,
          });
          setPlanMessage("");
        }}
      />
      <CalendarEventDrawer
        event={selectedEvent}
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEventId(null)}
      />

      {quickEvent ? (
        <div className="drawer-backdrop open" role="presentation" onClick={() => setQuickEvent(null)}>
          <aside
            ref={quickCreatePanelRef}
            className="drawer-panel-vnext calendar-quick-create-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Quick add plan item"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="drawer-header-vnext">
              <div>
                <p className="eyebrow">Quick add</p>
                <h2>
                  {quickEvent.mode === "task-block"
                    ? "Place task"
                    : quickEvent.mode === "deadline"
                      ? "New due item"
                      : "New fixed time"}
                </h2>
              </div>
              <button ref={quickCreateCloseRef} type="button" className="ghost-button compact-button" onClick={() => setQuickEvent(null)}>
                Close
              </button>
            </div>

            <form className="task-composer" onSubmit={(event) => void handleQuickEventSubmit(event)}>
              <div className="calendar-quick-create-tabs" aria-label="Quick add type">
                {[
                  ["event", "Fixed time"],
                  ["deadline", "Due"],
                  ["task-block", "Focus block"],
                ].map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    className={quickEvent.mode === mode ? "active" : ""}
                    onClick={() =>
                      setQuickEvent((current) =>
                        current ? { ...current, mode: mode as QuickCreateMode, title: mode === "task-block" ? "" : current.title } : current
                      )
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>

              {quickEvent.mode === "task-block" ? (
                <label className="field-stack">
                  <span>Choose task</span>
                  <select
                    autoFocus
                    value={quickEvent.selectedTaskId}
                    onChange={(event) =>
                      setQuickEvent((current) => current ? { ...current, selectedTaskId: event.target.value } : current)
                    }
                  >
                    <option value="">Choose a task...</option>
                    {activeTasks.map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label className="field-stack">
                  <span>{quickEvent.mode === "deadline" ? "Due item" : "Title"}</span>
                  <input
                    autoFocus
                    value={quickEvent.title}
                    onChange={(event) => setQuickEvent((current) => current ? { ...current, title: event.target.value } : current)}
                    placeholder={quickEvent.mode === "deadline" ? "Due item..." : "Appointment, practice, focus time..."}
                  />
                </label>
              )}

              <div className="task-composer-grid">
                <label className="field-stack">
                  <span>Date</span>
                  <input
                    type="date"
                    value={quickEvent.date}
                    onChange={(event) => setQuickEvent((current) => current ? { ...current, date: event.target.value } : current)}
                  />
                </label>
                <label className="field-stack">
                  <span>{quickEvent.mode === "deadline" ? "Due time" : "Start"}</span>
                  <input
                    type="time"
                    step="900"
                    value={quickEvent.startTime}
                    onChange={(event) => setQuickEvent((current) => current ? { ...current, startTime: event.target.value } : current)}
                    onBlur={() => setQuickEvent((current) => current ? { ...current, startTime: normalizeTimeInput(current.startTime) } : current)}
                  />
                </label>
                {quickEvent.mode !== "deadline" ? (
                  <label className="field-stack">
                    <span>End</span>
                    <input
                      type="time"
                      step="900"
                      value={quickEvent.endTime}
                      onChange={(event) => setQuickEvent((current) => current ? { ...current, endTime: event.target.value } : current)}
                      onBlur={() => setQuickEvent((current) => current ? { ...current, endTime: normalizeTimeInput(current.endTime, "10:00") } : current)}
                    />
                  </label>
                ) : null}
                {quickEvent.mode !== "task-block" ? (
                  <label className="field-stack">
                    <span>Context</span>
                    <select
                      value={quickEvent.eventType}
                      onChange={(event) =>
                        setQuickEvent((current) =>
                          current ? { ...current, eventType: event.target.value as CalendarEventType } : current
                        )
                      }
                    >
                      <option value="appointment">Appointment</option>
                      <option value="class">Class</option>
                      <option value="work">Work</option>
                      <option value="personal">Personal</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                ) : null}
              </div>

              {quickEventMessage ? <p className="error-copy">{quickEventMessage}</p> : null}

              <div className="task-composer-actions">
                <button type="button" className="ghost-button" onClick={() => setQuickEvent(null)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={isSavingQuickEvent}>
                  {isSavingQuickEvent
                    ? "Adding..."
                    : quickEvent.mode === "task-block"
                      ? "Place task"
                      : quickEvent.mode === "deadline"
                        ? "Add due item"
                        : "Add fixed time"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      ) : null}
    </>
  );
}
