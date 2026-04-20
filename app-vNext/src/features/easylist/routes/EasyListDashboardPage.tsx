import { useMemo, useState } from "react";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageSection } from "@/components/ui/PageSection";
import { TaskCard } from "@/features/easylist/components/TaskCard";
import { TaskDrawer } from "@/features/easylist/components/TaskDrawer";
import { useEasyList } from "@/features/easylist/EasyListContext";
import { isCompletedToday, sortActiveTasks } from "@/features/easylist/lib/taskUtils";
import { useSettings } from "@/features/settings/SettingsContext";
import type { TaskRecord } from "@/lib/firestore/tasks";

function toDateInputValue(date: Date) {
  return date.toISOString().split("T")[0];
}

export function EasyListDashboardPage() {
  const { tasks, isLoading, error, saveTask, markComplete, markActive, deleteTask } = useEasyList();
  const { isExperimentalFeatureEnabled } = useSettings();
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
  const overdueTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sortActiveTasks(
      tasks.filter((task) => {
        if (task.completed || !task.dueDate) return false;
        const due = new Date(task.dueDate);
        due.setHours(0, 0, 0, 0);
        return due.getTime() < today.getTime();
      })
    );
  }, [tasks]);

  function rescheduleTask(task: TaskRecord, days: number) {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + days);
    return saveTask(task.id, {
      itemKind: task.itemKind,
      title: task.title,
      notes: task.notes,
      category: task.category,
      estimatedLength: task.estimatedLength,
      priorityTier: task.priorityTier,
      priorityLabel: task.priorityLabel,
      dueDate: toDateInputValue(nextDate),
      linkedCalendarEventId: task.linkedCalendarEventId,
      linkedNoteId: task.linkedNoteId,
      recurring: task.recurring,
    });
  }

  function makeSmallerStep(task: TaskRecord) {
    return saveTask(task.id, {
      itemKind: task.itemKind,
      title: task.title.startsWith("Next step:") ? task.title : `Next step: ${task.title}`,
      notes: [task.notes, "Experimental triage: break this into the next concrete step."].filter(Boolean).join("\n\n"),
      category: task.category || "Triage",
      estimatedLength: task.estimatedLength && task.estimatedLength > 25 ? 20 : task.estimatedLength,
      priorityTier: task.priorityTier,
      priorityLabel: task.priorityLabel,
      dueDate: toDateInputValue(new Date()),
      linkedCalendarEventId: task.linkedCalendarEventId,
      linkedNoteId: task.linkedNoteId,
      recurring: task.recurring,
    });
  }

  if (isLoading) {
    return <LoadingState label="Loading EasyList..." />;
  }

  return (
    <>
      <PageSection
        eyebrow="Tasks"
        title="Task list"
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

      {isExperimentalFeatureEnabled("overdueTriage") && overdueTasks.length ? (
        <PageSection
          eyebrow="Experimental"
          title="Overdue Review"
        >
          <div className="task-list-vnext">
            {overdueTasks.slice(0, 6).map((task) => (
              <article key={task.id} className="task-card-vnext triage-card">
                <div className="task-card-copy">
                  <div className="task-card-title-row">
                    <h3>{task.title}</h3>
                    <span className="priority-pill-vnext">Overdue</span>
                  </div>
                  <p>
                    Try one: reschedule to a real day, shrink it to a next step, or drop it if it no longer matters.
                  </p>
                </div>
                <div className="triage-actions">
                  <button type="button" className="button-secondary compact-button" onClick={() => void rescheduleTask(task, 1)}>
                    Tomorrow
                  </button>
                  <button type="button" className="button-secondary compact-button" onClick={() => void rescheduleTask(task, 7)}>
                    Next week
                  </button>
                  <button type="button" className="button-secondary compact-button" onClick={() => void makeSmallerStep(task)}>
                    Smaller step
                  </button>
                  <button type="button" className="ghost-button compact-button" onClick={() => void markComplete(task.id)}>
                    Done/drop
                  </button>
                </div>
              </article>
            ))}
          </div>
        </PageSection>
      ) : null}

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
