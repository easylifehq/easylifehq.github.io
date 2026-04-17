import type { TaskRecord } from "@/lib/firestore/tasks";
import { formatDate, getPriorityMeta, isDueToday, isOverdue } from "@/features/easylist/lib/taskUtils";

type TaskCardProps = {
  task: TaskRecord;
  onEdit: (task: TaskRecord) => void;
  onComplete: (taskId: string) => Promise<void>;
  onReopen?: (taskId: string) => Promise<void>;
};

export function TaskCard({ task, onEdit, onComplete, onReopen }: TaskCardProps) {
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
        : "No deadline";

  return (
    <article className={`task-card-vnext priority-tier-${priority.tier}${task.completed ? " completed" : ""}`}>
      <button type="button" className="task-card-main" onClick={() => onEdit(task)}>
        <div className="task-card-copy">
          <div className="task-card-title-row">
            <h3>{task.title || "Untitled task"}</h3>
            <span className="priority-pill-vnext">{priority.label}</span>
          </div>
          <div className="task-meta-row">
            <span className={overdue ? "task-meta-chip urgent" : "task-meta-chip"}>{dueLabel}</span>
            <span className="task-meta-chip">{task.estimatedLength ? `${task.estimatedLength} min` : "No time estimate"}</span>
            {scheduledCount ? <span className="task-meta-chip scheduled">Planned {scheduledCount}x</span> : null}
            <span className="task-meta-chip">{task.category || "No category"}</span>
          </div>
          {task.notes ? <small>{task.notes}</small> : null}
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
