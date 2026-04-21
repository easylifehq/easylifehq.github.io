import type { TaskRecord } from "@/lib/firestore/tasks";
import { formatDate, getPriorityMeta, isDueToday, isOverdue } from "@/features/easylist/lib/taskUtils";

type TaskCardProps = {
  task: TaskRecord;
  onEdit: (task: TaskRecord) => void;
  onComplete: (taskId: string) => Promise<void>;
  onReopen?: (taskId: string) => Promise<void>;
  isSelected?: boolean;
  onSelect?: (taskId: string, selected: boolean) => void;
};

export function TaskCard({ task, onEdit, onComplete, onReopen, isSelected = false, onSelect }: TaskCardProps) {
  const priority = getPriorityMeta(task.priorityTier, task.priorityLabel);
  const overdue = isOverdue(task);
  const dueToday = isDueToday(task);
  const scheduledCount = task.linkedCalendarBlockIds.length;
  const dueLabel = overdue
    ? "Overdue"
    : dueToday
      ? "Due today"
      : task.dueDate
        ? `Due ${formatDate(task.dueDate, true)}`
        : "";

  return (
    <article className={`task-card-vnext priority-tier-${priority.tier}${task.completed ? " completed" : ""}${isSelected ? " selected" : ""}`}>
      {onSelect ? (
        <label className="task-card-select" aria-label={`Select ${task.title || "task"}`}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(event) => onSelect(task.id, event.target.checked)}
          />
        </label>
      ) : null}
      <button type="button" className="task-card-main" onClick={() => onEdit(task)}>
        <div className="task-card-copy">
          <div className="task-card-title-row">
            <h3>{task.title || "Untitled task"}</h3>
            <span className="priority-pill-vnext">{priority.tier}</span>
          </div>
          {(task.itemKind === "deadline" || dueLabel || task.listName !== "Main" || scheduledCount || task.linkedCalendarEventId || task.linkedNoteId) ? (
          <div className="task-meta-row task-meta-row-compact">
            {task.listName !== "Main" ? <span className="task-meta-chip">{task.listName}</span> : null}
            <span className={`task-meta-chip${task.itemKind === "deadline" ? " urgent" : ""}`}>
              {task.itemKind === "deadline" ? "Deadline" : "Task"}
            </span>
            {dueLabel ? <span className={overdue ? "task-meta-chip urgent" : "task-meta-chip"}>{dueLabel}</span> : null}
            {scheduledCount ? <span className="task-meta-chip scheduled">Planned {scheduledCount}x</span> : null}
            {task.linkedCalendarEventId ? <span className="task-meta-chip scheduled">Linked event</span> : null}
            {task.linkedNoteId ? <span className="task-meta-chip scheduled">Linked note</span> : null}
          </div>
          ) : null}
        </div>
      </button>

      <div className="task-card-actions">
        {task.completed && onReopen ? (
          <button type="button" className="ghost-button" onClick={() => void onReopen(task.id)}>
            Reopen
          </button>
        ) : (
          <button type="button" className="primary-button compact-button" onClick={() => void onComplete(task.id)}>
            Complete
          </button>
        )}
      </div>
    </article>
  );
}
