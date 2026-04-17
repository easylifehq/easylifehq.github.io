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
    };
  }, [events, taskBlocks, tasks, today, weekStart, workoutSessions]);

  return (
    <main className="page-wrap app-theme app-theme-easystatistics">
      {(error || workoutError) ? <p className="error-copy">{error || workoutError}</p> : null}

      <PageSection
        eyebrow="EasyStatistics"
        title="Progress hub"
        description="A calmer place for trends, streaks, and proof that the little things are adding up."
      >
        <div className="stats-grid">
          <article className="stat-card-vnext">
            <span>Completed this week</span>
            <strong>{stats.completedThisWeek.length}</strong>
          </article>
          <article className="stat-card-vnext">
            <span>Planned work blocks</span>
            <strong>{stats.plannedBlocksThisWeek.length}</strong>
          </article>
          <article className="stat-card-vnext">
            <span>Fixed events</span>
            <strong>{stats.eventsThisWeek.length}</strong>
          </article>
          <article className="stat-card-vnext">
            <span>Workouts</span>
            <strong>{stats.workoutsThisWeek.length}</strong>
          </article>
        </div>
      </PageSection>

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
        </div>
        <Link to="/app/easyworkout/dashboard" className="button-secondary compact-button">
          Open EasyWorkout
        </Link>
      </PageSection>
    </main>
  );
}
