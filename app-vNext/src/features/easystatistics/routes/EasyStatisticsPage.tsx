import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { useAuth } from "@/features/auth/AuthContext";
import { useEasyCalendar } from "@/features/easycalendar/EasyCalendarContext";
import { startOfDay } from "@/features/easycalendar/lib/calendarUtils";
import { subscribeToWorkoutSessions, type WorkoutSessionRecord } from "@/lib/firestore/workoutSessions";

function startOfWeek(date: Date) {
  const next = startOfDay(date);
  next.setDate(next.getDate() - next.getDay());
  return next;
}

function isOnOrAfterDateKey(dateKey: string, threshold: Date) {
  if (!dateKey) return false;
  return new Date(`${dateKey}T00:00:00`) >= threshold;
}

function getWorkoutVolume(session: WorkoutSessionRecord) {
  return session.exercises.reduce(
    (sessionTotal, exercise) =>
      sessionTotal + exercise.sets.reduce((setTotal, set) => setTotal + set.reps * set.weight, 0),
    0
  );
}

function formatHours(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} hr`;
}

export function EasyStatisticsPage() {
  const { user } = useAuth();
  const { tasks, events, taskBlocks, isLoading, error } = useEasyCalendar();
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSessionRecord[]>([]);
  const [workoutError, setWorkoutError] = useState("");
  const today = startOfDay(new Date());
  const weekStart = startOfWeek(today);

  useEffect(() => {
    if (!user) {
      setWorkoutSessions([]);
      return;
    }

    return subscribeToWorkoutSessions(
      user.uid,
      (records) => {
        setWorkoutSessions(records);
        setWorkoutError("");
      },
      (nextError) => setWorkoutError(nextError.message)
    );
  }, [user]);

  const stats = useMemo(() => {
    const activeTasks = tasks.filter((task) => !task.completed);
    const completedTasks = tasks.filter((task) => task.completed);
    const completedThisWeek = completedTasks.filter(
      (task) => task.completedAt && task.completedAt >= weekStart
    );
    const dueThisWeek = activeTasks.filter(
      (task) => task.dueDate && task.dueDate >= weekStart
    );
    const overdue = activeTasks.filter(
      (task) => task.dueDate && startOfDay(task.dueDate).getTime() < today.getTime()
    );
    const eventsThisWeek = events.filter((event) => event.startAt && event.startAt >= weekStart);
    const plannedBlocksThisWeek = taskBlocks.filter((block) => block.startAt && block.startAt >= weekStart);
    const plannedMinutes = plannedBlocksThisWeek.reduce((sum, block) => {
      if (!block.startAt || !block.endAt) return sum;
      return sum + Math.max(0, Math.round((block.endAt.getTime() - block.startAt.getTime()) / 60000));
    }, 0);
    const workoutsThisWeek = workoutSessions.filter((session) =>
      isOnOrAfterDateKey(session.performedOn, weekStart)
    );
    const workoutVolume = workoutsThisWeek.reduce((sum, session) => sum + getWorkoutVolume(session), 0);
    const exerciseCount = workoutsThisWeek.reduce((sum, session) => sum + session.exercises.length, 0);
    const completionRate = completedTasks.length
      ? Math.round((completedThisWeek.length / Math.max(completedThisWeek.length + activeTasks.length, 1)) * 100)
      : 0;
    const nextTask = [...activeTasks]
      .filter((task) => task.dueDate)
      .sort((left, right) => (left.dueDate?.getTime() || 0) - (right.dueDate?.getTime() || 0))[0];

    return {
      activeTasks,
      completedThisWeek,
      dueThisWeek,
      overdue,
      eventsThisWeek,
      plannedBlocksThisWeek,
      plannedMinutes,
      workoutsThisWeek,
      workoutVolume,
      exerciseCount,
      completionRate,
      nextTask,
    };
  }, [events, taskBlocks, tasks, today, weekStart, workoutSessions]);

  const weeklyRead =
    stats.overdue.length > 0
      ? `${stats.overdue.length} task${stats.overdue.length === 1 ? "" : "s"} need recovery first.`
      : stats.completedThisWeek.length > 0
        ? `${stats.completedThisWeek.length} task${stats.completedThisWeek.length === 1 ? "" : "s"} finished this week. Keep the rhythm.`
        : "Nothing completed yet this week. Start with one small win.";

  return (
    <main className="page-wrap app-theme app-theme-easystatistics">
      {(error || workoutError) ? <p className="error-copy">{error || workoutError}</p> : null}

      <PageSection
        eyebrow="EasyStatistics"
        title="Progress hub"
        description={weeklyRead}
      >
        <div className="statistics-hero-strip">
          <article>
            <span>Done this week</span>
            <strong>{stats.completedThisWeek.length}</strong>
          </article>
          <article>
            <span>Planned time</span>
            <strong>{formatHours(stats.plannedMinutes)}</strong>
          </article>
          <article>
            <span>Workouts</span>
            <strong>{stats.workoutsThisWeek.length}</strong>
          </article>
          <article>
            <span>Recovery</span>
            <strong>{stats.overdue.length}</strong>
          </article>
        </div>
      </PageSection>

      <div className="statistics-insight-grid">
        <article className="statistics-insight-card">
          <span>Focus next</span>
          <strong>{stats.nextTask?.title || "Pick one task"}</strong>
          <p>{stats.nextTask?.dueDate ? `Due ${stats.nextTask.dueDate.toLocaleDateString()}` : "Choose the one thing that would make today feel handled."}</p>
        </article>
        <article className="statistics-insight-card">
          <span>Calendar load</span>
          <strong>{stats.plannedBlocksThisWeek.length + stats.eventsThisWeek.length} blocks</strong>
          <p>{formatHours(stats.plannedMinutes)} planned around {stats.eventsThisWeek.length} fixed event{stats.eventsThisWeek.length === 1 ? "" : "s"}.</p>
        </article>
        <article className="statistics-insight-card">
          <span>Training pulse</span>
          <strong>{stats.exerciseCount} exercises</strong>
          <p>{stats.workoutVolume.toLocaleString()} total volume logged this week.</p>
        </article>
      </div>

      <details className="advanced-disclosure" open>
        <summary>App breakdown</summary>
        <div className="dashboard-grid">
        <PageSection eyebrow="EasyList" title="Tasks">
          {isLoading ? <p className="helper-copy">Loading task stats...</p> : null}
          <div className="hq-summary-grid">
            <article className="mini-panel-vnext">
              <span>Active</span>
              <strong>{stats.activeTasks.length}</strong>
            </article>
            <article className="mini-panel-vnext">
              <span>Due this week</span>
              <strong>{stats.dueThisWeek.length}</strong>
            </article>
            <article className="mini-panel-vnext">
              <span>Needs recovery</span>
              <strong>{stats.overdue.length}</strong>
            </article>
          </div>
          <Link to="/app/easylist/dashboard" className="button-secondary compact-button">
            Open EasyList
          </Link>
        </PageSection>

        <PageSection eyebrow="EasyCalendar" title="Time">
          <div className="hq-summary-grid">
            <article className="mini-panel-vnext">
              <span>Planned minutes</span>
              <strong>{stats.plannedMinutes}</strong>
            </article>
            <article className="mini-panel-vnext">
              <span>Task blocks</span>
              <strong>{stats.plannedBlocksThisWeek.length}</strong>
            </article>
            <article className="mini-panel-vnext">
              <span>Events</span>
              <strong>{stats.eventsThisWeek.length}</strong>
            </article>
          </div>
          <Link to="/app/easycalendar/week" className="button-secondary compact-button">
            Open EasyCalendar
          </Link>
        </PageSection>
        </div>
      </details>

      <details className="advanced-disclosure">
        <summary>Training details</summary>
        <PageSection eyebrow="EasyWorkout" title="Training">
          <div className="stats-grid">
            <article className="stat-card-vnext">
              <span>Sessions this week</span>
              <strong>{stats.workoutsThisWeek.length}</strong>
            </article>
            <article className="stat-card-vnext">
              <span>Exercises logged</span>
              <strong>{stats.exerciseCount}</strong>
            </article>
            <article className="stat-card-vnext">
              <span>Weekly volume</span>
              <strong>{stats.workoutVolume.toLocaleString()}</strong>
            </article>
            <article className="stat-card-vnext">
              <span>Task completion</span>
              <strong>{stats.completionRate}%</strong>
            </article>
          </div>
          <Link to="/app/easyworkout/dashboard" className="button-secondary compact-button">
            Open EasyWorkout
          </Link>
        </PageSection>
      </details>
    </main>
  );
}
