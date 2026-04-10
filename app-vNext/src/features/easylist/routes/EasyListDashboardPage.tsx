import { useMemo, useState } from "react";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageSection } from "@/components/ui/PageSection";
import { TaskCard } from "@/features/easylist/components/TaskCard";
import { TaskDrawer } from "@/features/easylist/components/TaskDrawer";
import { useEasyList } from "@/features/easylist/EasyListContext";
import { isCompletedToday, sortActiveTasks } from "@/features/easylist/lib/taskUtils";
import type { TaskRecord } from "@/lib/firestore/tasks";

export function EasyListDashboardPage() {
  const { tasks, isLoading, error, saveTask, markComplete, markActive, deleteTask } = useEasyList();
  const [search, setSearch] = useState("");
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null);

  const activeTasks = useMemo(
    () => sortActiveTasks(tasks.filter((task) => !task.completed)),
    [tasks]
  );
  const filteredTasks = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return activeTasks;
    }

    return activeTasks.filter((task) =>
      [task.title, task.notes, task.category].join(" ").toLowerCase().includes(term)
    );
  }, [activeTasks, search]);
  const completedTodayCount = useMemo(() => tasks.filter(isCompletedToday).length, [tasks]);

  if (isLoading) {
    return <LoadingState label="Loading EasyList..." />;
  }

  return (
    <>
      <PageSection
        eyebrow="Dashboard"
        title="Task list"
        description="Everything active in one quick list so you can jump straight into work."
      >
        <div className="toolbar-row toolbar-row-compact">
          <input
            type="search"
            className="search-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search your tasks"
          />
          <div className="pill-row">
            <span className="info-pill">{activeTasks.length} open</span>
            <span className="info-pill">{completedTodayCount} done today</span>
          </div>
        </div>

        {error ? <p className="error-copy">{error}</p> : null}

        <div className="task-list-vnext">
          {filteredTasks.length ? (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={setSelectedTask}
                onComplete={markComplete}
              />
            ))
          ) : (
            <div className="empty-card-vnext">No tasks match this view yet.</div>
          )}
        </div>
      </PageSection>

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
