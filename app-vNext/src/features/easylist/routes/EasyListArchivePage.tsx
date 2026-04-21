import { useState } from "react";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageSection } from "@/components/ui/PageSection";
import { TaskCard } from "@/features/easylist/components/TaskCard";
import { TaskDrawer } from "@/features/easylist/components/TaskDrawer";
import { useEasyList } from "@/features/easylist/EasyListContext";
import { groupCompletedTasksByWeek } from "@/features/easylist/lib/taskUtils";
import type { TaskRecord } from "@/lib/firestore/tasks";

export function EasyListArchivePage() {
  const { tasks, isLoading, saveTask, markComplete, markActive, deleteTask } = useEasyList();
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null);

  if (isLoading) {
    return <LoadingState label="Loading archive..." />;
  }

  const completedTasks = tasks.filter((task) => task.completed && !task.deletedAt);
  const groupedWeeks = groupCompletedTasksByWeek(completedTasks);

  return (
    <>
      <PageSection
        eyebrow="History"
        title="Archive"
        description="Completed tasks grouped by week so you can see what got handled and when."
      >
        <div className="stats-grid">
          <article className="stat-card-vnext">
            <span>Completed tasks</span>
            <strong>{completedTasks.length}</strong>
          </article>
          <article className="stat-card-vnext">
            <span>Archive weeks</span>
            <strong>{groupedWeeks.length}</strong>
          </article>
        </div>
      </PageSection>

      <div className="stacked-sections">
        {groupedWeeks.length ? (
          groupedWeeks.map((group) => (
            <PageSection
              key={group.key}
              eyebrow="Completed"
              title={group.label}
              description={`${group.tasks.length} task${group.tasks.length === 1 ? "" : "s"} finished`}
            >
              <div className="task-list-vnext">
                {group.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={setSelectedTask}
                    onComplete={markComplete}
                    onReopen={markActive}
                  />
                ))}
              </div>
            </PageSection>
          ))
        ) : (
          <div className="empty-card-vnext">Nothing archived yet.</div>
        )}
      </div>

      <TaskDrawer
        task={selectedTask}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        onSave={saveTask}
        onDelete={deleteTask}
        onComplete={markComplete}
        onReopen={markActive}
      />
    </>
  );
}
