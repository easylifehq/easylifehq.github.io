import { useState } from "react";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageSection } from "@/components/ui/PageSection";
import { TaskComposer } from "@/features/easylist/components/TaskComposer";
import { TaskDrawer } from "@/features/easylist/components/TaskDrawer";
import { useEasyList } from "@/features/easylist/EasyListContext";
import { TaskCard } from "@/features/easylist/components/TaskCard";
import { isCompletedToday, sortActiveTasks } from "@/features/easylist/lib/taskUtils";
import type { TaskRecord } from "@/lib/firestore/tasks";

export function EasyListInboxPage() {
  const { tasks, isLoading, error, addTask, saveTask, markComplete, markActive, deleteTask } = useEasyList();
  const [search, setSearch] = useState("");
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null);

  if (isLoading) {
    return <LoadingState label="Loading EasyList..." />;
  }

  const activeTasks = sortActiveTasks(tasks.filter((task) => !task.completed));
  const filteredTasks = activeTasks.filter((task) => {
    const haystack = `${task.title} ${task.notes} ${task.category}`.toLowerCase();
    return haystack.includes(search.trim().toLowerCase());
  });
  const completedToday = tasks.filter(isCompletedToday);

  return (
    <>
      <PageSection
        eyebrow="Capture"
        title="Add tasks fast"
        description="Write each task into its own row, or drop a messy brain dump in and turn it into rows first."
      >
        <TaskComposer onSubmit={addTask} />
      </PageSection>

      <PageSection
        eyebrow="Queue"
        title="What is ready to work on"
        description="As soon as you add it, it lands here with the rest of your active list."
      >
        <div className="toolbar-row toolbar-row-compact">
          <input
            type="search"
            className="search-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, notes, or category"
          />
          <div className="pill-row">
            <span className="info-pill">{activeTasks.length} open</span>
            <span className="info-pill">{completedToday.length} done today</span>
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
            <div className="empty-card-vnext">No active tasks match this view yet.</div>
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
