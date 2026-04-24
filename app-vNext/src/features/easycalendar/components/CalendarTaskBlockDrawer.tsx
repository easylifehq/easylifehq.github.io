import { useEffect, useState } from "react";
import type { CalendarTaskBlockRecord, PlanningState } from "@/lib/firestore/calendarTaskBlocks";
import type { TaskRecord } from "@/lib/firestore/tasks";
import { useEasyCalendar } from "@/features/easycalendar/EasyCalendarContext";
import {
  addMinutes,
  combineDateAndTime,
  getDurationMinutes,
  toDateInputValue,
  toTimeInputValue,
} from "@/features/easycalendar/lib/calendarUtils";

type CalendarTaskBlockDrawerProps = {
  block: CalendarTaskBlockRecord | null;
  task: TaskRecord | null;
  isOpen: boolean;
  onClose: () => void;
};

export function CalendarTaskBlockDrawer({
  block,
  task,
  isOpen,
  onClose,
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

  function applyDuration(minutes: number) {
    setScheduleDuration(String(minutes));
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
    const startAt = combineDateAndTime(scheduleDate, scheduleTime);
    const endAt = addMinutes(startAt, Math.max(5, Number(scheduleDuration) || 30));

    if (!startAt || !endAt) {
      setStatusMessage("Pick a valid day and time before saving.");
      return;
    }

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
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsSaving(true);
    try {
      await deleteTaskBlock(currentBlock.id);
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
      <aside className={`task-drawer-vnext${isOpen ? " open" : ""}`} aria-hidden={!isOpen}>
        <div className="drawer-header-vnext">
          <div>
            <p className="eyebrow">EasyCalendar</p>
            <h2>Manage task block</h2>
            <p className="helper-copy">Move it, resize it, or finish it fast.</p>
          </div>
          <button type="button" className="ghost-button compact-button" onClick={onClose} aria-label="Close task block editor">
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
                type="time"
                value={scheduleTime}
                onChange={(event) => setScheduleTime(event.target.value)}
              />
            </label>

            <label className="field-stack">
              <span>Duration (minutes)</span>
              <input
                type="number"
                min="5"
                step="5"
                value={scheduleDuration}
                onChange={(event) => setScheduleDuration(event.target.value)}
              />
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
              {currentTask.completed ? " | Completed in EasyList" : " | Still active in EasyList"}
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
