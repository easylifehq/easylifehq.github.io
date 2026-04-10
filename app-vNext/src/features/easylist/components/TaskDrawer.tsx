import { useEffect, useState, type FormEvent } from "react";
import type { TaskDraft, TaskRecord } from "@/lib/firestore/tasks";
import {
  getEmptyTaskDraft,
  getPriorityMeta,
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
  const [draft, setDraft] = useState<TaskDraft>(getEmptyTaskDraft());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setDraft(taskToDraft(task));
    }
  }, [task]);

  if (!task) return null;
  const taskId = task.id;

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
            <span>Duration</span>
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
                  priorityTier: Number(event.target.value) as 1 | 2 | 3 | 4 | 5,
                }))
              }
            >
              {[1, 2, 3, 4, 5].map((tier) => (
                <option key={tier} value={tier}>
                  {getPriorityMeta(tier).label}
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
              {task.completed ? (
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
      </aside>
    </>
  );
}
