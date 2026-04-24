import type { TaskRecord } from "@/lib/firestore/tasks";
import { formatDate, getPriorityMeta, isDueToday, isOverdue } from "@/features/easylist/lib/taskUtils";

type TaskCardProps = {
  task: TaskRecord;
  onEdit: (task: TaskRecord) => void;
  onComplete: (taskId: string) => Promise<void>;
  onReopen?: (taskId: string) => Promise<void>;
  isSelected?: boolean;
  onSelect?: (taskId: string, selected: boolean) => void;
  showContextMeta?: boolean;
};

export function TaskCard({
  task,
  onEdit,
  onComplete,
  onReopen,
  isSelected = false,
  onSelect,
  showContextMeta = false,
}: TaskCardProps) {
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
  const hasLinks = Boolean(scheduledCount || task.linkedCalendarEventId || task.linkedNoteId);

  const statusClass = overdue ? " overdue" : dueToday ? " due-today" : "";

  return (
    <article className={`task-card-vnext task-card-dense priority-tier-${priority.tier}${statusClass}${task.completed ? " completed" : ""}${isSelected ? " selected" : ""}`}>
      {onSelect ? (
        <label className="task-card-select" aria-label={`Select ${task.title || "task"}`}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(event) => onSelect(task.id, event.target.checked)}
          />
        </label>
      ) : task.completed ? null : (
        <button
          type="button"
          className="task-card-check"
          aria-label={`Complete ${task.title || "task"}`}
          onClick={() => void onComplete(task.id)}
        />
      )}
      <button type="button" className="task-card-main" onClick={() => onEdit(task)}>
        <div className="task-card-copy">
          <div className="task-card-title-row">
            <h3>{task.title || "Untitled task"}</h3>
            <span className="task-dense-meta">
              <span className={`task-priority-dot priority-tier-${priority.tier}`}>{priority.tier}</span>
              {dueLabel ? <span className={overdue ? "task-due-inline urgent" : "task-due-inline"}>{dueLabel}</span> : null}
              {task.itemKind === "deadline" ? <span className="task-due-inline urgent">Deadline</span> : null}
              {hasLinks ? <span className="task-due-inline">Linked</span> : null}
            </span>
          </div>
          {(task.listName !== "Main" || scheduledCount) && showContextMeta ? (
          <div className="task-meta-row task-meta-row-compact" aria-label="Task details">
            {task.listName !== "Main" ? <span className="task-meta-chip">{task.listName}</span> : null}
            {scheduledCount ? <span className="task-meta-chip scheduled">Planned {scheduledCount}x</span> : null}
          </div>
          ) : null}
        </div>
      </button>

      <div className="task-card-actions task-card-actions-quiet">
        {task.completed && onReopen ? (
          <button type="button" className="ghost-button" onClick={() => void onReopen(task.id)}>
            Reopen
          </button>
        ) : null}
      </div>
    </article>
  );
}
