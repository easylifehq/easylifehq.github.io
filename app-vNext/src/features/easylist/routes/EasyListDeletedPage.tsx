import { useState } from "react";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageSection } from "@/components/ui/PageSection";
import { TaskDrawer } from "@/features/easylist/components/TaskDrawer";
import { useEasyList } from "@/features/easylist/EasyListContext";
import { formatDate } from "@/features/easylist/lib/taskUtils";
import type { TaskRecord } from "@/lib/firestore/tasks";

export function EasyListDeletedPage() {
  const {
    tasks,
    isLoading,
    saveTask,
    markComplete,
    markActive,
    restoreDeletedTask,
    removeTaskPermanently,
  } = useEasyList();
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null);
  const deletedTasks = tasks
    .filter((task) => task.deletedAt)
    .sort((a, b) => (b.deletedAt?.getTime() || 0) - (a.deletedAt?.getTime() || 0));

  if (isLoading) {
    return <LoadingState label="Loading deleted tasks..." />;
  }

  return (
    <>
      <PageSection
        eyebrow="Soft delete"
        title="Deleted tasks"
        description="Tasks you delete from EasyList land here first, so accidental cleanup is recoverable."
      >
        <div className="task-list-vnext">
          {deletedTasks.length ? (
            deletedTasks.map((task) => (
              <article key={task.id} className="task-card-vnext deleted-task-card">
                <button type="button" className="task-card-main" onClick={() => setSelectedTask(task)}>
                  <div className="task-card-copy">
                    <div className="task-card-title-row">
                      <h3>{task.title || "Untitled task"}</h3>
                      <span className="priority-pill-vnext">{task.listName || "Main"}</span>
                    </div>
                    <div className="task-meta-row task-meta-row-compact">
                      <span className="task-meta-chip urgent">
                        Deleted {task.deletedAt ? formatDate(task.deletedAt, true) : "recently"}
                      </span>
                    </div>
                  </div>
                </button>
                <div className="task-card-actions">
                  <button type="button" className="primary-button compact-button" onClick={() => void restoreDeletedTask(task.id)}>
                    Restore
                  </button>
                  <button type="button" className="ghost-button compact-button" onClick={() => void removeTaskPermanently(task.id)}>
                    Delete forever
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-card-vnext">Nothing is deleted right now.</div>
          )}
        </div>
      </PageSection>

      <TaskDrawer
        task={selectedTask}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        onSave={saveTask}
        onDelete={removeTaskPermanently}
        onComplete={markComplete}
        onReopen={markActive}
      />
    </>
  );
}
