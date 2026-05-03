import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { useEasyProjects } from "@/features/easyprojects/EasyProjectsContext";

export function EasyProjectsTimelinePage() {
  const { projectId = "" } = useParams();
  const { projects, links, tasks, scheduleProjectTask } = useEasyProjects();
  const project = projects.find((entry) => entry.id === projectId) || null;
  const projectTasks = useMemo(
    () =>
      links
        .filter((link) => link.projectId === projectId)
        .map((link) => tasks.find((task) => task.id === link.taskId))
        .filter(Boolean),
    [links, projectId, tasks]
  );
  const [taskId, setTaskId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [message, setMessage] = useState("");
  const remainingTasks = projectTasks.filter((task) => task && !task.completed);
  const totalMinutes = remainingTasks.reduce((sum, task) => sum + (task?.estimatedLength || 30), 0);

  useEffect(() => {
    if (!taskId && remainingTasks[0]?.id) {
      setTaskId(remainingTasks[0].id);
    }
  }, [remainingTasks, taskId]);

  async function handleSchedule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const task = projectTasks.find((entry) => entry?.id === taskId);
    if (!task || !date) return;

    const startAt = new Date(`${date}T${time}:00`);
    const endAt = new Date(startAt.getTime() + Number(durationMinutes || 60) * 60000);
    await scheduleProjectTask({ task, startAt, endAt, planningState: "scheduled" });
    setMessage(`Scheduled ${task.title} into EasyCalendar.`);
    setDate("");
  }

  if (!project) {
    return (
      <PageSection eyebrow="Timeline" title="Project not found">
        <Link to="/app/easyprojects" className="button-secondary">
          Back to projects
        </Link>
      </PageSection>
    );
  }

  return (
    <>
      <PageSection
        eyebrow="Planning"
        title={`${project.title} timeline`}
        description="See the remaining workload and place project tasks on your calendar."
      >
        <div className="stats-grid">
          <article className="stat-card-vnext">
            <span>Open tasks</span>
            <strong>{remainingTasks.length}</strong>
          </article>
          <article className="stat-card-vnext">
            <span>Remaining workload</span>
            <strong>{totalMinutes} min</strong>
          </article>
          <article className="stat-card-vnext">
            <span>Target date</span>
            <strong>{project.targetDate || "Unset"}</strong>
          </article>
        </div>
      </PageSection>

      <PageSection
        eyebrow="Calendar prep"
        title="Schedule a project task"
        description="Use the same task-block system that EasyCalendar already understands."
      >
        <form className="task-composer" onSubmit={handleSchedule}>
          <div className="task-composer-grid">
            <label className="field-stack">
              <span>Task</span>
              <select value={taskId} onChange={(event) => setTaskId(event.target.value)}>
                <option value="">Select a task</option>
                {remainingTasks.map((task) => (
                  <option key={task?.id} value={task?.id}>
                    {task?.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-stack">
              <span>Date</span>
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </label>
            <label className="field-stack">
              <span>Time</span>
              <input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
            </label>
            <label className="field-stack">
              <span>Minutes</span>
              <input type="number" min="15" step="15" value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} />
            </label>
          </div>
          <div className="task-composer-actions">
            <Link to={`/app/easyprojects/${project.id}`} className="button-secondary">
              Back to project
            </Link>
            <button type="submit" className="primary-button">Send to EasyCalendar</button>
          </div>
        </form>
        {message ? <div className="calendar-info-card">{message}</div> : null}
      </PageSection>
    </>
  );
}
