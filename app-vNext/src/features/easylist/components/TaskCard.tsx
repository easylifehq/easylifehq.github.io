import type { TaskRecord } from "@/lib/firestore/tasks";
import { formatDate, getPriorityMeta, isOverdue } from "@/features/easylist/lib/taskUtils";

type TaskCardProps = {
  task: TaskRecord;
  onEdit: (task: TaskRecord) => void;
  onComplete: (taskId: string) => Promise<void>;
  onReopen?: (taskId: string) => Promise<void>;
};

export function TaskCard({ task, onEdit, onComplete, onReopen }: TaskCardProps) {
  const priority = getPriorityMeta(task.priorityTier, task.priorityLabel);
  const overdue = isOverdue(task);
  const scheduledCount = task.linkedCalendarBlockIds.length;

  return (
    <article className={`task-card-vnext priority-tier-${priority.tier}${task.completed ? " completed" : ""}`}>
      <button type="button" className="task-card-main" onClick={() => onEdit(task)}>
        <div className="task-card-copy">
          <div className="task-card-title-row">
            <h3>{task.title || "Untitled task"}</h3>
            <span className="priority-pill-vnext">{priority.label}</span>
          </div>
          <p>
            {task.category || "No category"}
            {task.estimatedLength ? ` | ${task.estimatedLength} min` : ""}
            {task.dueDate ? ` | ${formatDate(task.dueDate, true)}` : " | No due date"}
            {overdue ? " | Overdue" : ""}
            {scheduledCount ? ` | In EasyCalendar (${scheduledCount})` : ""}
          </p>
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
