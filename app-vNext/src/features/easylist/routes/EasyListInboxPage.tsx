import { useState } from "react";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageSection } from "@/components/ui/PageSection";
import { TaskCard } from "@/features/easylist/components/TaskCard";
import { TaskComposer } from "@/features/easylist/components/TaskComposer";
import { TaskDrawer } from "@/features/easylist/components/TaskDrawer";
import { useEasyList } from "@/features/easylist/EasyListContext";
import { sortActiveTasks, isCompletedToday } from "@/features/easylist/lib/taskUtils";
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
      <div className="dashboard-grid">
        <PageSection
          eyebrow="Capture"
          title="Add a task"
          description="This is the first real EasyList workflow in React. It writes to the same Firebase task collection as the current app."
        >
          <TaskComposer onSubmit={addTask} />
        </PageSection>

        <PageSection eyebrow="Momentum" title="Board snapshot" description="A quick pulse check.">
          <div className="stats-grid">
            <article className="stat-card-vnext">
              <span>Open tasks</span>
              <strong>{activeTasks.length}</strong>
            </article>
            <article className="stat-card-vnext">
              <span>Done today</span>
              <strong>{completedToday.length}</strong>
            </article>
            <article className="stat-card-vnext">
              <span>Search results</span>
              <strong>{filteredTasks.length}</strong>
            </article>
          </div>
        </PageSection>
      </div>

      <PageSection
        eyebrow="Inbox"
        title="All active tasks"
        description="Tasks without a due date are still considered active and will stay visible here."
      >
        <div className="toolbar-row">
          <input
            type="search"
            className="search-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, notes, or category"
          />
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
