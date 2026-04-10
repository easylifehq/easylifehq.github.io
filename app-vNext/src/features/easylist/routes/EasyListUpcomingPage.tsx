import { useState } from "react";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageSection } from "@/components/ui/PageSection";
import { TaskCard } from "@/features/easylist/components/TaskCard";
import { TaskDrawer } from "@/features/easylist/components/TaskDrawer";
import { useEasyList } from "@/features/easylist/EasyListContext";
import {
  addDays,
  isDueTomorrow,
  isOverdue,
  sortActiveTasks,
  startOfDay,
} from "@/features/easylist/lib/taskUtils";
import type { TaskRecord } from "@/lib/firestore/tasks";

export function EasyListUpcomingPage() {
  const { tasks, isLoading, saveTask, markComplete, markActive, deleteTask } = useEasyList();
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null);

  if (isLoading) {
    return <LoadingState label="Loading upcoming tasks..." />;
  }

  const activeTasks = sortActiveTasks(tasks.filter((task) => !task.completed));
  const today = startOfDay(new Date());
  const nextWeek = addDays(today, 7);

  const overdue = activeTasks.filter(isOverdue);
  const tomorrow = activeTasks.filter((task) => isDueTomorrow(task) && !isOverdue(task));
  const nextSevenDays = activeTasks.filter((task) => {
    if (!task.dueDate || isOverdue(task) || isDueTomorrow(task)) return false;
    const due = startOfDay(task.dueDate);
    return due > today && due <= nextWeek;
  });
  const later = activeTasks.filter((task) => {
    if (!task.dueDate) return false;
    return startOfDay(task.dueDate) > nextWeek;
  });
  const noDate = activeTasks.filter((task) => !task.dueDate);

  const groups = [
    { title: "Overdue", tasks: overdue },
    { title: "Tomorrow", tasks: tomorrow },
    { title: "Next 7 days", tasks: nextSevenDays },
    { title: "Later", tasks: later },
    { title: "No due date", tasks: noDate },
  ];

  return (
    <>
      <PageSection
        eyebrow="Planning"
        title="Upcoming"
        description="A cleaner forward-looking view of what is due soon, what is later, and what still needs a real date."
      >
        <div className="stacked-sections">
          {groups.map((group) => (
            <section key={group.title} className="group-block">
              <div className="group-heading">
                <h3>{group.title}</h3>
                <span>{group.tasks.length}</span>
              </div>
              <div className="task-list-vnext">
                {group.tasks.length ? (
                  group.tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={setSelectedTask}
                      onComplete={markComplete}
                    />
                  ))
                ) : (
                  <div className="empty-card-vnext">No tasks in this group.</div>
                )}
              </div>
            </section>
          ))}
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
