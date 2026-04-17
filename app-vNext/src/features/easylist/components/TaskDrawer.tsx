import { useEffect, useState, type FormEvent } from "react";
import type { PlanningState } from "@/lib/firestore/calendarTaskBlocks";
import type { TaskDraft, TaskRecord } from "@/lib/firestore/tasks";
import { useEasyCalendar } from "@/features/easycalendar/EasyCalendarContext";
import { auth } from "@/lib/firebase/client";
import { createApplication } from "@/lib/firestore/applications";
import { createProject } from "@/lib/firestore/projects";
import { createProjectSection } from "@/lib/firestore/projectSections";
import { createProjectTaskLink } from "@/lib/firestore/projectTaskLinks";
import {
  addMinutes,
  combineDateAndTime,
  toDateInputValue,
  toTimeInputValue,
} from "@/features/easycalendar/lib/calendarUtils";
import {
  getEmptyTaskDraft,
  getPriorityMeta,
  normalizePriorityTier,
  PRIORITY_TIERS,
  taskToDraft,
} from "@/features/easylist/lib/taskUtils";

type TaskDrawerProps = {
  task: TaskRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, draft: TaskDraft) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onComplete: (taskId: string) => Promise<void>;
  onReopen: (taskId: string) => Promise<void>;
};

export function TaskDrawer({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onComplete,
  onReopen,
}: TaskDrawerProps) {
  const { scheduleTask } = useEasyCalendar();
  const [draft, setDraft] = useState<TaskDraft>(getEmptyTaskDraft());
  const [isSaving, setIsSaving] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [scheduleDuration, setScheduleDuration] = useState("30");
  const [planningState, setPlanningState] = useState<PlanningState>("scheduled");
  const [scheduleMessage, setScheduleMessage] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [routingMessage, setRoutingMessage] = useState("");
  const [isRouting, setIsRouting] = useState(false);

  useEffect(() => {
    if (task) {
      setDraft(taskToDraft(task));

      const baseDate = task.dueDate ?? new Date();
      const suggestedTime = new Date(baseDate);
      suggestedTime.setHours(9, 0, 0, 0);

      setScheduleDate(toDateInputValue(baseDate));
      setScheduleTime(toTimeInputValue(suggestedTime));
      setScheduleDuration(String(task.estimatedLength ?? 30));
      setPlanningState(task.linkedCalendarBlockIds.length ? "accepted" : "scheduled");
      setScheduleMessage("");
      setRoutingMessage("");
    }
  }, [task]);

  if (!task) return null;
  const currentTask = task;
  const taskId = currentTask.id;

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim()) return;

    setIsSaving(true);
    try {
      await onSave(taskId, {
        ...draft,
        title: draft.title.trim(),
        category: draft.category.trim(),
        notes: draft.notes.trim(),
        priorityLabel: getPriorityMeta(draft.priorityTier).label,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSchedule() {
    if (currentTask.completed) return;

    const startAt = combineDateAndTime(scheduleDate, scheduleTime);
    const durationMinutes = Math.max(5, Number(scheduleDuration) || 30);
    const endAt = addMinutes(startAt, durationMinutes);

    if (!startAt || !endAt) {
      setScheduleMessage("Pick a day and time before sending this to EasyCalendar.");
      return;
    }

    setIsScheduling(true);
    try {
      await scheduleTask(currentTask, {
        startAt,
        endAt,
        planningState,
        userAdjusted: true,
      });
      setScheduleMessage("Sent to EasyCalendar.");
    } finally {
      setIsScheduling(false);
    }
  }

  async function handleSendToProject() {
    const user = auth.currentUser;
    if (!user || isRouting) return;

    setIsRouting(true);
    try {
      const projectId = await createProject(user.uid, {
        title: currentTask.title || "Untitled project",
        description: [
          "Created from EasyList.",
          currentTask.notes ? `Source task notes: ${currentTask.notes}` : "",
        ].filter(Boolean).join("\n\n"),
        targetDate: currentTask.dueDate ? toDateInputValue(currentTask.dueDate) : "",
        status: "active",
      });
      const sectionId = await createProjectSection(user.uid, {
        projectId,
        title: "Next steps",
        order: 1,
      });
      await createProjectTaskLink(user.uid, {
        projectId,
        sectionId,
        taskId: currentTask.id,
        order: 1,
        parentLabel: "Routed from EasyList",
      });
      setRoutingMessage("Sent to EasyProjects with the original task linked.");
    } finally {
      setIsRouting(false);
    }
  }

  async function handleSendToPipeline() {
    const user = auth.currentUser;
    if (!user || isRouting) return;

    setIsRouting(true);
    try {
      await createApplication(user.uid, {
        company: currentTask.category || "Pipeline item",
        title: currentTask.title || "Untitled follow-up",
        status: "follow_up",
        priority: currentTask.priorityTier <= 4 ? "high" : currentTask.priorityTier >= 8 ? "low" : "medium",
        offerResponse: "",
        dateApplied: "",
        nextFollowUp: currentTask.dueDate ? toDateInputValue(currentTask.dueDate) : "",
        location: "",
        link: "",
        notes: [
          "Created from EasyList task.",
          currentTask.notes,
          `Source task id: ${currentTask.id}`,
        ].filter(Boolean).join("\n\n"),
        contactName: "",
        contactEmail: "",
      });
      setRoutingMessage("Sent to EasyPipeline as a follow-up item.");
    } finally {
      setIsRouting(false);
    }
  }

  return (
    <>
      <div className={`drawer-backdrop-vnext${isOpen ? " open" : ""}`} onClick={onClose} />
      <aside className={`task-drawer-vnext${isOpen ? " open" : ""}`} aria-hidden={!isOpen}>
        <div className="drawer-header-vnext">
          <div>
            <p className="eyebrow">Task details</p>
            <h2>Edit task</h2>
          </div>
          <button type="button" className="ghost-button compact-button" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="drawer-form" onSubmit={handleSave}>
          <label className="field-stack">
            <span>Title</span>
            <input
              type="text"
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            />
          </label>

          <label className="field-stack">
            <span>Due date</span>
            <input
              type="date"
              value={draft.dueDate ?? ""}
              onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value || null }))}
            />
          </label>

          <label className="field-stack">
            <span>Category</span>
            <input
              type="text"
              value={draft.category}
              onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
            />
          </label>

          <label className="field-stack">
            <span>Duration (minutes)</span>
            <input
              type="number"
              min="0"
              step="5"
              value={draft.estimatedLength ?? ""}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  estimatedLength: event.target.value ? Number(event.target.value) : null,
                }))
              }
            />
          </label>

          <label className="field-stack">
            <span>Priority</span>
            <select
              value={draft.priorityTier}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  priorityTier: normalizePriorityTier(event.target.value),
                }))
              }
            >
              {PRIORITY_TIERS.map((tier) => (
                <option key={tier} value={tier}>
                  {tier}. {getPriorityMeta(tier).label}
                </option>
              ))}
            </select>
          </label>

          <label className="field-stack">
            <span>Notes</span>
            <textarea
              rows={6}
              value={draft.notes}
              onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
            />
          </label>

          <div className="drawer-actions-vnext">
            <button
              type="button"
              className="danger-button"
              onClick={() => void onDelete(taskId).then(onClose)}
            >
              Delete
            </button>

            <div className="drawer-actions-right">
              {currentTask.completed ? (
                <button type="button" className="ghost-button" onClick={() => void onReopen(taskId).then(onClose)}>
                  Reopen
                </button>
              ) : (
                <button type="button" className="ghost-button" onClick={() => void onComplete(taskId).then(onClose)}>
                  Mark Complete
                </button>
              )}

              <button type="submit" className="primary-button" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>

        <section className="drawer-link-card">
          <div className="panel-header">
            <p className="eyebrow">EasyCalendar</p>
            <h2>Send this task to your calendar</h2>
            <p>
              Choose when you want to work on it. This creates a flexible linked
              task block in EasyCalendar.
            </p>
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

          <div className="drawer-link-footer">
            <p className="helper-copy">
              {currentTask.linkedCalendarBlockIds.length
                ? `Already linked ${currentTask.linkedCalendarBlockIds.length} time(s).`
                : "Not on the calendar yet."}
            </p>
            {scheduleMessage ? <p className="helper-copy">{scheduleMessage}</p> : null}
            <button
              type="button"
              className="primary-button"
              onClick={() => void handleSchedule()}
              disabled={isScheduling || currentTask.completed}
            >
              {isScheduling ? "Sending..." : "Send to EasyCalendar"}
            </button>
          </div>
        </section>

        <section className="drawer-link-card">
          <div className="panel-header">
            <p className="eyebrow">Routing</p>
            <h2>Send this task into a bigger workflow</h2>
            <p>
              Keep the source task intact while creating the project or pipeline
              context around it.
            </p>
          </div>

          <div className="drawer-actions-vnext">
            <button
              type="button"
              className="button-secondary"
              onClick={() => void handleSendToProject()}
              disabled={isRouting}
            >
              Send to EasyProjects
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() => void handleSendToPipeline()}
              disabled={isRouting}
            >
              Send to EasyPipeline
            </button>
          </div>
          {routingMessage ? <p className="helper-copy">{routingMessage}</p> : null}
        </section>
      </aside>
    </>
  );
}
