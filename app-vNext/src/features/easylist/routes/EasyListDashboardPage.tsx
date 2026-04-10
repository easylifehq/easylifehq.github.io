import { useMemo, useState } from "react";
import { PageSection } from "@/components/ui/PageSection";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useEasyList } from "@/features/easylist/EasyListContext";
import { TaskDrawer } from "@/features/easylist/components/TaskDrawer";
import type { TaskRecord } from "@/lib/firestore/tasks";
import {
  type PlannerViewMode,
  buildMotivationData,
  formatDate,
  formatTime,
  getEnergyLabel,
  getPlannerMeta,
  getPriorityMeta,
  groupTasksForPlanner,
  isCompletedToday,
} from "@/features/easylist/lib/taskUtils";

const VIEW_MODES: PlannerViewMode[] = ["week", "twoWeeks", "month"];

export function EasyListDashboardPage() {
  const { tasks, isLoading, saveTask, markComplete, markActive, deleteTask } = useEasyList();
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null);
  const [viewMode, setViewMode] = useState<PlannerViewMode>("week");

  const activeTasks = useMemo(() => tasks.filter((task) => !task.completed), [tasks]);
  const completedTodayTasks = useMemo(
    () =>
      tasks
        .filter(isCompletedToday)
        .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0)),
    [tasks]
  );

  const planner = useMemo(() => getPlannerMeta(viewMode), [viewMode]);
  const grouped = useMemo(
    () => groupTasksForPlanner(activeTasks, planner.days.map((day) => day.key)),
    [activeTasks, planner.days]
  );
  const motivation = useMemo(
    () => buildMotivationData(completedTodayTasks.length, tasks),
    [completedTodayTasks.length, tasks]
  );

  if (isLoading) {
    return <LoadingState label="Loading your EasyList dashboard..." />;
  }

  return (
    <>
      <PageSection
        eyebrow="Planner"
        title={planner.heading}
        description={planner.subtitle}
      >
        <div className="planner-toolbar-vnext">
          <div className="view-switcher-vnext" role="tablist" aria-label="Planner view">
            {VIEW_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                className={`view-button-vnext${viewMode === mode ? " active" : ""}`}
                onClick={() => setViewMode(mode)}
              >
                {mode === "week" ? "1 Week" : mode === "twoWeeks" ? "2 Weeks" : "Month"}
              </button>
            ))}
          </div>
        </div>

        <div className={`planner-grid-vnext ${planner.className}`}>
          {planner.days.map((day) => {
            const dayTasks = grouped[day.key] || [];

            return (
              <article
                key={day.key}
                className={`planner-day-card${day.isToday ? " today" : ""}${day.inCurrentMonth ? "" : " muted"}`}
              >
                <header className="planner-day-header">
                  <div>
                    <p className="planner-day-name">{day.dayLabel}</p>
                    <h3>{day.dateLabel}</h3>
                  </div>
                  {day.isToday ? <span className="info-pill">Today</span> : null}
                </header>

                <div className="planner-day-stack">
                  {dayTasks.length ? (
                    dayTasks.map((task) => {
                      const priority = getPriorityMeta(task.priorityTier, task.priorityLabel);
                      return (
                        <button
                          key={task.id}
                          type="button"
                          className={`planner-task-card priority-tier-${priority.tier}`}
                          onClick={() => setSelectedTask(task)}
                        >
                          <div>
                            <strong>{task.title || "Untitled task"}</strong>
                            <span>
                              {task.category || "No category"}
                              {task.estimatedLength ? ` · ${task.estimatedLength} min` : ""}
                            </span>
                          </div>
                          <em>{priority.label}</em>
                        </button>
                      );
                    })
                  ) : (
                    <div className="empty-card-vnext planner-empty-card">No tasks parked here yet.</div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </PageSection>

      <div className="dashboard-grid">
        <PageSection
          eyebrow="Handled today"
          title="What you already knocked out"
          description={`${completedTodayTasks.length} done`}
        >
          <div className="task-list-vnext">
            {completedTodayTasks.length ? (
              completedTodayTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  className="completed-task-row-vnext"
                  onClick={() => setSelectedTask(task)}
                >
                  <div>
                    <strong>{task.title || "Untitled task"}</strong>
                    <span>{task.completedAt ? `Handled at ${formatTime(task.completedAt)}` : "Handled today"}</span>
                  </div>
                  <span className="completed-pill-vnext">Handled</span>
                </button>
              ))
            ) : (
              <div className="empty-card-vnext">Nothing knocked out yet today.</div>
            )}
          </div>
        </PageSection>

        <PageSection
          eyebrow="Momentum"
          title={motivation.title}
          description={motivation.body}
        >
          <div className="stats-grid">
            <article className="stat-card-vnext">
              <span>Open tasks</span>
              <strong>{activeTasks.length}</strong>
            </article>
            <article className="stat-card-vnext">
              <span>Done today</span>
              <strong>{completedTodayTasks.length}</strong>
            </article>
            <article className="stat-card-vnext">
              <span>Energy</span>
              <strong>{getEnergyLabel(completedTodayTasks.length)}</strong>
            </article>
          </div>

          <div className="momentum-notes-vnext">
            <article className="mini-panel-vnext">
              <span>Best streak</span>
              <strong>{motivation.bestStreak}</strong>
            </article>
            <article className="mini-panel-vnext">
              <span>Top category</span>
              <strong>{motivation.topCategory}</strong>
            </article>
            <article className="mini-panel-vnext">
              <span>Current tone</span>
              <strong>{motivation.tone}</strong>
            </article>
          </div>
        </PageSection>
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
