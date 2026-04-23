import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { useAuth } from "@/features/auth/AuthContext";
import { useEasyCalendar } from "@/features/easycalendar/EasyCalendarContext";
import { startOfDay } from "@/features/easycalendar/lib/calendarUtils";
import { subscribeToApplications, type ApplicationRecord } from "@/lib/firestore/applications";
import { subscribeToNotes, type NoteRecord } from "@/lib/firestore/notes";
import { subscribeToProjects, type ProjectRecord } from "@/lib/firestore/projects";
import { subscribeToProjectTaskLinks, type ProjectTaskLinkRecord } from "@/lib/firestore/projectTaskLinks";
import { subscribeToWorkoutSessions, type WorkoutSessionRecord } from "@/lib/firestore/workoutSessions";

function startOfWeek(date: Date) {
  const next = startOfDay(date);
  next.setDate(next.getDate() - next.getDay());
  return next;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
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

function getWordCount(notes: NoteRecord[]) {
  return notes.reduce((sum, note) => sum + note.bodyText.trim().split(/\s+/).filter(Boolean).length, 0);
}

export function EasyStatisticsPage() {
  const { user } = useAuth();
  const { tasks, events, taskBlocks, isLoading, error } = useEasyCalendar();
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSessionRecord[]>([]);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [projectLinks, setProjectLinks] = useState<ProjectTaskLinkRecord[]>([]);
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [statsError, setStatsError] = useState("");
  const today = startOfDay(new Date());
  const weekStart = startOfWeek(today);
  const monthStart = startOfMonth(today);

  useEffect(() => {
    if (!user) {
      setWorkoutSessions([]);
      setApplications([]);
      setProjects([]);
      setProjectLinks([]);
      setNotes([]);
      return;
    }

    const handleError = (nextError: Error) => setStatsError(nextError.message);
    const unsubscribeWorkouts = subscribeToWorkoutSessions(
      user.uid,
      (records) => {
        setWorkoutSessions(records);
        setStatsError("");
      },
      handleError
    );
    const unsubscribeApplications = subscribeToApplications(user.uid, setApplications, handleError);
    const unsubscribeProjects = subscribeToProjects(user.uid, setProjects, handleError);
    const unsubscribeProjectLinks = subscribeToProjectTaskLinks(user.uid, setProjectLinks, handleError);
    const unsubscribeNotes = subscribeToNotes(user.uid, setNotes, handleError);

    return () => {
      unsubscribeWorkouts();
      unsubscribeApplications();
      unsubscribeProjects();
      unsubscribeProjectLinks();
      unsubscribeNotes();
    };
  }, [user]);

  const stats = useMemo(() => {
    const activeTasks = tasks.filter((task) => !task.completed && !task.deletedAt);
    const completedTasks = tasks.filter((task) => task.completed && !task.deletedAt);
    const completedThisWeek = completedTasks.filter((task) => task.completedAt && task.completedAt >= weekStart);
    const tasksCreatedThisWeek = tasks.filter((task) => task.createdAt && task.createdAt >= weekStart);
    const tasksCreatedThisMonth = tasks.filter((task) => task.createdAt && task.createdAt >= monthStart);
    const dueThisWeek = activeTasks.filter((task) => task.dueDate && task.dueDate >= weekStart);
    const overdue = activeTasks.filter((task) => task.dueDate && startOfDay(task.dueDate).getTime() < today.getTime());
    const eventsThisWeek = events.filter((event) => event.startAt && event.startAt >= weekStart);
    const plannedBlocksThisWeek = taskBlocks.filter((block) => block.startAt && block.startAt >= weekStart);
    const plannedMinutes = plannedBlocksThisWeek.reduce((sum, block) => {
      if (!block.startAt || !block.endAt) return sum;
      return sum + Math.max(0, Math.round((block.endAt.getTime() - block.startAt.getTime()) / 60000));
    }, 0);
    const workoutsThisWeek = workoutSessions.filter((session) => isOnOrAfterDateKey(session.performedOn, weekStart));
    const workoutsThisMonth = workoutSessions.filter((session) => isOnOrAfterDateKey(session.performedOn, monthStart));
    const workoutVolume = workoutsThisWeek.reduce((sum, session) => sum + getWorkoutVolume(session), 0);
    const allTimeWorkoutVolume = workoutSessions.reduce((sum, session) => sum + getWorkoutVolume(session), 0);
    const exerciseCount = workoutsThisWeek.reduce((sum, session) => sum + session.exercises.length, 0);
    const exerciseVolume = new Map<string, number>();

    workoutSessions.forEach((session) => {
      session.exercises.forEach((exercise) => {
        const volume = exercise.sets.reduce((sum, set) => sum + set.reps * set.weight, 0);
        const exerciseName = exercise.exerciseName || "Untitled exercise";
        exerciseVolume.set(exerciseName, (exerciseVolume.get(exerciseName) || 0) + volume);
      });
    });

    const topExercise = [...exerciseVolume.entries()].sort((left, right) => right[1] - left[1])[0] || null;
    const completionRate = Math.round((completedTasks.length / Math.max(completedTasks.length + activeTasks.length, 1)) * 100);
    const nextTask = [...activeTasks]
      .filter((task) => task.dueDate)
      .sort((left, right) => (left.dueDate?.getTime() || 0) - (right.dueDate?.getTime() || 0))[0];
    const activeApplications = applications.filter((application) => application.status !== "archived");
    const applicationsCreatedThisMonth = applications.filter((application) => application.createdAt && application.createdAt >= monthStart);
    const interviewCount = applications.filter((application) => application.status === "interviewing").length;
    const offerCount = applications.filter((application) => application.status === "offer").length;
    const followUpsDue = applications.filter((application) => application.nextFollowUp && application.nextFollowUp <= today.toISOString().split("T")[0]).length;
    const responseCount = applications.filter((application) => ["follow_up", "interviewing", "offer"].includes(application.status)).length;
    const activeProjects = projects.filter((project) => project.status === "active");
    const completedProjects = projects.filter((project) => project.status === "completed");
    const linkedProjectTasks = projectLinks
      .map((link) => tasks.find((task) => task.id === link.taskId))
      .filter(Boolean);
    const completedProjectTasks = linkedProjectTasks.filter((task) => task?.completed).length;
    const liveNotes = notes.filter((note) => !note.deletedAt);
    const notesCreatedThisMonth = liveNotes.filter((note) => note.createdAt && note.createdAt >= monthStart);
    const wordCount = getWordCount(liveNotes);
    const pinnedNotes = liveNotes.filter((note) => note.pinned).length;

    return {
      activeTasks,
      completedTasks,
      completedThisWeek,
      tasksCreatedThisWeek,
      tasksCreatedThisMonth,
      dueThisWeek,
      overdue,
      eventsThisWeek,
      plannedBlocksThisWeek,
      plannedMinutes,
      workoutsThisWeek,
      workoutsThisMonth,
      workoutVolume,
      allTimeWorkoutVolume,
      exerciseCount,
      topExercise,
      completionRate,
      nextTask,
      activeApplications,
      applicationsCreatedThisMonth,
      interviewCount,
      offerCount,
      followUpsDue,
      responseCount,
      activeProjects,
      completedProjects,
      linkedProjectTasks,
      completedProjectTasks,
      liveNotes,
      notesCreatedThisMonth,
      wordCount,
      pinnedNotes,
    };
  }, [applications, events, monthStart, notes, projectLinks, projects, taskBlocks, tasks, today, weekStart, workoutSessions]);

  const weeklyRead =
    stats.overdue.length > 0
      ? `${stats.overdue.length} task${stats.overdue.length === 1 ? "" : "s"} need recovery first.`
      : stats.completedThisWeek.length > 0
        ? `${stats.completedThisWeek.length} task${stats.completedThisWeek.length === 1 ? "" : "s"} finished this week. Keep the rhythm.`
        : "Nothing completed yet this week. Start with one small win.";
  const lifeScore =
    stats.completedThisWeek.length +
    stats.workoutsThisWeek.length * 2 +
    stats.applicationsCreatedThisMonth.length +
    stats.notesCreatedThisMonth.length +
    stats.completedProjectTasks;
  const milestones = [
    `${tasks.length} task${tasks.length === 1 ? "" : "s"} created`,
    `${stats.allTimeWorkoutVolume.toLocaleString()} total workout volume`,
    `${applications.length} application${applications.length === 1 ? "" : "s"} tracked`,
    `${stats.wordCount.toLocaleString()} note word${stats.wordCount === 1 ? "" : "s"}`,
  ];

  return (
    <main className="page-wrap app-theme app-theme-easystatistics">
      {(error || statsError) ? <p className="error-copy">{error || statsError}</p> : null}

      <PageSection eyebrow="EasyStatistics" title="Progress hub" description={weeklyRead}>
        <div className="statistics-hero-strip">
          <article>
            <span>Life score</span>
            <strong>{lifeScore}</strong>
          </article>
          <article>
            <span>Done this week</span>
            <strong>{stats.completedThisWeek.length}</strong>
          </article>
          <article>
            <span>Planned time</span>
            <strong>{formatHours(stats.plannedMinutes)}</strong>
          </article>
          <article>
            <span>Workout volume</span>
            <strong>{stats.workoutVolume.toLocaleString()}</strong>
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
          <span>Career pulse</span>
          <strong>{stats.activeApplications.length} active</strong>
          <p>{stats.followUpsDue} follow-up{stats.followUpsDue === 1 ? "" : "s"} due and {stats.interviewCount} interview stage role{stats.interviewCount === 1 ? "" : "s"}.</p>
        </article>
        <article className="statistics-insight-card">
          <span>Training pulse</span>
          <strong>{stats.workoutsThisMonth.length} this month</strong>
          <p>{stats.topExercise ? `${stats.topExercise[0]} leads with ${stats.topExercise[1].toLocaleString()} volume.` : "Log a workout to unlock exercise highlights."}</p>
        </article>
      </div>

      <div className="statistics-milestone-row">
        {milestones.map((milestone) => (
          <span key={milestone}>{milestone}</span>
        ))}
      </div>

      <details className="advanced-disclosure" open>
        <summary>App breakdown</summary>
        <div className="statistics-app-grid">
          <PageSection eyebrow="EasyList" title="Tasks">
            {isLoading ? <p className="helper-copy">Loading task stats...</p> : null}
            <div className="statistics-progress-list">
              <div><span>Completed</span><strong>{stats.completedTasks.length}</strong></div>
              <div><span>Created this week</span><strong>{stats.tasksCreatedThisWeek.length}</strong></div>
              <div><span>Created this month</span><strong>{stats.tasksCreatedThisMonth.length}</strong></div>
              <div><span>Completion rate</span><strong>{stats.completionRate}%</strong></div>
            </div>
            <Link to="/app/easylist/dashboard" className="button-secondary compact-button">Open EasyList</Link>
          </PageSection>

          <PageSection eyebrow="EasyCalendar" title="Time">
            <div className="statistics-progress-list">
              <div><span>Planned work</span><strong>{formatHours(stats.plannedMinutes)}</strong></div>
              <div><span>Task blocks</span><strong>{stats.plannedBlocksThisWeek.length}</strong></div>
              <div><span>Fixed events</span><strong>{stats.eventsThisWeek.length}</strong></div>
              <div><span>Due this week</span><strong>{stats.dueThisWeek.length}</strong></div>
            </div>
            <Link to="/app/easycalendar/week" className="button-secondary compact-button">Open EasyCalendar</Link>
          </PageSection>

          <PageSection eyebrow="EasyWorkout" title="Training">
            <div className="statistics-progress-list">
              <div><span>Sessions this week</span><strong>{stats.workoutsThisWeek.length}</strong></div>
              <div><span>Sessions this month</span><strong>{stats.workoutsThisMonth.length}</strong></div>
              <div><span>Exercises logged</span><strong>{stats.exerciseCount}</strong></div>
              <div><span>All-time volume</span><strong>{stats.allTimeWorkoutVolume.toLocaleString()}</strong></div>
            </div>
            <Link to="/app/easyworkout/dashboard" className="button-secondary compact-button">Open EasyWorkout</Link>
          </PageSection>

          <PageSection eyebrow="EasyPipeline" title="Applications">
            <div className="statistics-progress-list">
              <div><span>Total tracked</span><strong>{applications.length}</strong></div>
              <div><span>Created this month</span><strong>{stats.applicationsCreatedThisMonth.length}</strong></div>
              <div><span>Responses</span><strong>{stats.responseCount}</strong></div>
              <div><span>Offers</span><strong>{stats.offerCount}</strong></div>
            </div>
            <Link to="/app/easypipeline/dashboard" className="button-secondary compact-button">Open EasyPipeline</Link>
          </PageSection>

          <PageSection eyebrow="EasyProjects" title="Projects">
            <div className="statistics-progress-list">
              <div><span>Active</span><strong>{stats.activeProjects.length}</strong></div>
              <div><span>Completed</span><strong>{stats.completedProjects.length}</strong></div>
              <div><span>Linked tasks</span><strong>{stats.linkedProjectTasks.length}</strong></div>
              <div><span>Project tasks done</span><strong>{stats.completedProjectTasks}</strong></div>
            </div>
            <Link to="/app/easyprojects" className="button-secondary compact-button">Open EasyProjects</Link>
          </PageSection>

          <PageSection eyebrow="EasyNotes" title="Notes">
            <div className="statistics-progress-list">
              <div><span>Live notes</span><strong>{stats.liveNotes.length}</strong></div>
              <div><span>Created this month</span><strong>{stats.notesCreatedThisMonth.length}</strong></div>
              <div><span>Pinned</span><strong>{stats.pinnedNotes}</strong></div>
              <div><span>Words captured</span><strong>{stats.wordCount.toLocaleString()}</strong></div>
            </div>
            <Link to="/app/easynotes" className="button-secondary compact-button">Open EasyNotes</Link>
          </PageSection>
        </div>
      </details>
    </main>
  );
}
