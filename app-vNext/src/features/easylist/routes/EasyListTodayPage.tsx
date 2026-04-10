import { useState } from "react";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageSection } from "@/components/ui/PageSection";
import { TaskCard } from "@/features/easylist/components/TaskCard";
import { TaskDrawer } from "@/features/easylist/components/TaskDrawer";
import { useEasyList } from "@/features/easylist/EasyListContext";
import {
  isDueToday,
  isOverdue,
  sortActiveTasks,
} from "@/features/easylist/lib/taskUtils";
import type { TaskRecord } from "@/lib/firestore/tasks";

export function EasyListTodayPage() {
  const { tasks, isLoading, saveTask, markComplete, markActive, deleteTask } = useEasyList();
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null);

  if (isLoading) {
    return <LoadingState label="Loading today's tasks..." />;
  }

  const activeTasks = sortActiveTasks(tasks.filter((task) => !task.completed));
  const overdueTasks = activeTasks.filter(isOverdue);
  const dueTodayTasks = activeTasks.filter((task) => isDueToday(task) && !isOverdue(task));
  const noDateTasks = activeTasks.filter((task) => !task.dueDate);

  return (
    <>
      <PageSection
        eyebrow="Focus"
        title="Today"
        description="Overdue tasks first, then due today, then active tasks without dates that are still sitting on today's board."
      >
        <div className="stats-grid">
          <article className="stat-card-vnext">
            <span>Overdue</span>
            <strong>{overdueTasks.length}</strong>
          </article>
          <article className="stat-card-vnext">
            <span>Due today</span>
            <strong>{dueTodayTasks.length}</strong>
          </article>
          <article className="stat-card-vnext">
            <span>No date</span>
            <strong>{noDateTasks.length}</strong>
          </article>
        </div>
      </PageSection>

      <div className="stacked-sections">
        <TaskSection
          title="Overdue"
          tasks={overdueTasks}
          emptyLabel="Nothing overdue right now."
          onEdit={setSelectedTask}
          onComplete={markComplete}
        />
        <TaskSection
          title="Due today"
          tasks={dueTodayTasks}
          emptyLabel="Nothing due today."
          onEdit={setSelectedTask}
          onComplete={markComplete}
        />
        <TaskSection
          title="Still on today's board"
          tasks={noDateTasks}
          emptyLabel="No undated tasks are hanging around."
          onEdit={setSelectedTask}
          onComplete={markComplete}
        />
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

function TaskSection({
  title,
  tasks,
  emptyLabel,
  onEdit,
  onComplete,
}: {
  title: string;
  tasks: TaskRecord[];
  emptyLabel: string;
  onEdit: (task: TaskRecord) => void;
  onComplete: (taskId: string) => Promise<void>;
}) {
  return (
    <PageSection eyebrow="Tasks" title={title}>
      <div className="task-list-vnext">
        {tasks.length ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onComplete={onComplete}
            />
          ))
        ) : (
          <div className="empty-card-vnext">{emptyLabel}</div>
        )}
      </div>
    </PageSection>
  );
}
