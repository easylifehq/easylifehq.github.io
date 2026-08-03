import { useEffect, useRef, useState } from "react";
import type { CalendarTaskBlockRecord, PlanningState } from "@/lib/firestore/calendarTaskBlocks";
import type { TaskRecord } from "@/lib/firestore/tasks";
import { useEasyCalendar } from "@/features/easycalendar/EasyCalendarContext";
import { useFocusTrap } from "@/lib/a11y/useFocusTrap";
import {
  addMinutes,
  combineDateAndTime,
  getDurationMinutes,
  normalizeDurationMinutes,
  normalizeTimeInput,
  toDateInputValue,
  toTimeInputValue,
} from "@/features/easycalendar/lib/calendarUtils";

type CalendarTaskBlockDrawerProps = {
  block: CalendarTaskBlockRecord | null;
  task: TaskRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: (block: CalendarTaskBlockRecord, task: TaskRecord) => void;
};

export function CalendarTaskBlockDrawer({
  block,
  task,
  isOpen,
  onClose,
  onDeleted,
}: CalendarTaskBlockDrawerProps) {
  const {
    saveTaskBlock,
    deleteTaskBlock,
    completeTaskFromCalendar,
    reopenTaskFromCalendar,
  } = useEasyCalendar();
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [scheduleDuration, setScheduleDuration] = useState("30");
  const [planningState, setPlanningState] = useState<PlanningState>("scheduled");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const drawerRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useFocusTrap(isOpen, drawerRef, {
    initialFocusRef: closeButtonRef,
    onEscape: onClose,
  });

  function applyDuration(minutes: number) {
    setScheduleDuration(String(normalizeDurationMinutes(minutes)));
  }

  useEffect(() => {
    if (!block) return;

    setScheduleDate(toDateInputValue(block.startAt));
    setScheduleTime(toTimeInputValue(block.startAt) || "09:00");
    setScheduleDuration(String(getDurationMinutes(block.startAt, block.endAt) || 30));
    setPlanningState(block.completed ? "accepted" : block.planningState);
    setStatusMessage("");
  }, [block]);

  if (!block || !task) return null;
  const currentBlock = block;
  const currentTask = task;

  async function handleSave() {
    const safeTime = normalizeTimeInput(scheduleTime);
    const safeDuration = normalizeDurationMinutes(scheduleDuration);
    const startAt = combineDateAndTime(scheduleDate, safeTime);
    const endAt = addMinutes(startAt, safeDuration);
    const restoreScrollY = window.scrollY;

    if (!startAt || !endAt) {
      setStatusMessage("Pick a valid day and time before saving.");
      return;
    }

    setScheduleTime(safeTime);
    setScheduleDuration(String(safeDuration));
    setIsSaving(true);
    try {
      await saveTaskBlock(currentBlock.id, {
        taskId: currentTask.id,
        titleSnapshot: currentTask.title || currentBlock.titleSnapshot,
        categoryId: currentTask.category.trim() || currentBlock.categoryId || null,
        startAt,
        endAt,
        isFlexible: true,
        planningState,
        userAdjusted: true,
      });
      setStatusMessage("Task block updated.");
      window.requestAnimationFrame(() => window.scrollTo({ top: restoreScrollY }));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsSaving(true);
    try {
      await deleteTaskBlock(currentBlock.id, currentTask.id);
      onDeleted?.(currentBlock, currentTask);
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTaskToggle() {
    setIsSaving(true);
    try {
      if (currentTask.completed) {
        await reopenTaskFromCalendar(currentTask.id);
        setStatusMessage("Task reopened.");
      } else {
        await completeTaskFromCalendar(currentTask.id);
        setStatusMessage("Task completed.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className={`drawer-backdrop-vnext${isOpen ? " open" : ""}`} onClick={onClose} />
      <aside
        ref={drawerRef}
        className={`task-drawer-vnext${isOpen ? " open" : ""}`}
        aria-hidden={!isOpen}
        aria-modal={isOpen ? "true" : undefined}
        aria-label="Manage task block"
        role="dialog"
        tabIndex={-1}
      >
        <div className="drawer-header-vnext">
          <div>
            <p className="eyebrow">Plan</p>
            <h2>Manage task block</h2>
            <p className="helper-copy">Move it, resize it, or finish it fast.</p>
          </div>
          <button ref={closeButtonRef} type="button" className="ghost-button compact-button" onClick={onClose} aria-label="Close task block editor">
            Close
          </button>
        </div>

        <section className="drawer-link-card">
          <div className="calendar-drawer-summary">
            <span>{currentTask.completed ? "Completed" : "Active"}</span>
            <span>{scheduleDate || "No date"}</span>
            <span>{scheduleTime || "No time"}</span>
          </div>

          <div className="panel-header">
            <p className="eyebrow">Linked task</p>
            <h2>{currentTask.title || "Untitled task"}</h2>
            <p>Adjust the block without leaving the calendar.</p>
          </div>

          <div className="task-composer-grid">
            <label className="field-stack">
              <span>Day</span>
              <input
                type="date"
                value={scheduleDate}
                onChange={(event) => setScheduleDate(event.target.value)}
              />
            </label>

            <label className="field-stack">
              <span>Start time</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="7:30 or 730"
                step="900"
                value={scheduleTime}
                onChange={(event) => setScheduleTime(event.target.value)}
                onBlur={() => setScheduleTime((current) => normalizeTimeInput(current))}
              />
              <small className="helper-copy">
                Type 7:30 or 730. Plan rounds to 15-minute increments and keeps this block inside the selected day.
              </small>
            </label>

            <label className="field-stack">
              <span>Duration (minutes)</span>
              <input
                type="number"
                min="15"
                step="15"
                value={scheduleDuration}
                onChange={(event) => setScheduleDuration(event.target.value)}
                onBlur={() => setScheduleDuration((current) => String(normalizeDurationMinutes(current)))}
              />
              <small className="helper-copy">Use 15-minute steps. Longer blocks are capped at 12 hours for this demo.</small>
            </label>

            <label className="field-stack">
              <span>State</span>
              <select
                value={planningState}
                onChange={(event) => setPlanningState(event.target.value as PlanningState)}
              >
                <option value="suggested">Suggested</option>
                <option value="scheduled">Scheduled</option>
                <option value="accepted">Accepted</option>
              </select>
            </label>
          </div>

          <div className="calendar-drawer-quick-actions">
            <span className="helper-copy">Quick duration</span>
            <div className="pill-row">
              <button type="button" className="ghost-button compact-button" onClick={() => applyDuration(15)}>15m</button>
              <button type="button" className="ghost-button compact-button" onClick={() => applyDuration(30)}>30m</button>
              <button type="button" className="ghost-button compact-button" onClick={() => applyDuration(60)}>1h</button>
              <button type="button" className="ghost-button compact-button" onClick={() => applyDuration(90)}>90m</button>
            </div>
          </div>

          <div className="drawer-link-footer">
            <p className="helper-copy">
              {currentTask.category || "No category"}
              {currentTask.completed ? " | Completed in Inbox" : " | Still active in Inbox"}
            </p>
            {statusMessage ? <p className="helper-copy">{statusMessage}</p> : null}
          </div>

          <div className="drawer-actions-vnext">
            <button type="button" className="danger-button" onClick={() => void handleDelete()}>
              Remove
            </button>

            <div className="drawer-actions-right">
              <button type="button" className="ghost-button" onClick={() => void handleTaskToggle()}>
                {currentTask.completed ? "Reopen Task" : "Complete Task"}
              </button>
              <button type="button" className="primary-button" disabled={isSaving} onClick={() => void handleSave()}>
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </section>
      </aside>
    </>
  );
}
