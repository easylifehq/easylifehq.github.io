import { Link } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { useEasyWorkout } from "@/features/easyworkout/EasyWorkoutContext";
import { useSettings } from "@/features/settings/SettingsContext";

function getSessionVolume(session: ReturnType<typeof useEasyWorkout>["sessions"][number]) {
  return session.exercises.reduce(
    (sum, exercise) =>
      sum +
      exercise.sets.reduce((exerciseSum, set) => exerciseSum + set.reps * set.weight, 0),
    0
  );
}

export function EasyWorkoutDashboardPage() {
  const { sessions, routines, isLoading, error, deleteSession } = useEasyWorkout();
  const { isExperimentalFeatureEnabled } = useSettings();
  const recentSessions = sessions.slice(0, 4);
  const weeklySessions = sessions.filter((session) => {
    if (!session.performedOn) return false;
    const sessionDate = new Date(session.performedOn);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    return sessionDate >= sevenDaysAgo;
  });
  const streak = weeklySessions.length;

  const topLifts = Object.values(
    sessions.reduce<Record<string, { exerciseName: string; weight: number; reps: number }>>(
      (accumulator, session) => {
        session.exercises.forEach((exercise) => {
          exercise.sets.forEach((set) => {
            const current = accumulator[exercise.exerciseName];
            if (!current || set.weight > current.weight) {
              accumulator[exercise.exerciseName] = {
                exerciseName: exercise.exerciseName,
                weight: set.weight,
                reps: set.reps,
              };
            }
          });
        });
        return accumulator;
      },
      {}
    )
  )
    .sort((left, right) => right.weight - left.weight)
    .slice(0, 5);
  const totalVolume = sessions.reduce((sum, session) => sum + getSessionVolume(session), 0);
  const exerciseStats = Object.values(
    sessions.reduce<
      Record<
        string,
        {
          exerciseName: string;
          sessionCount: number;
          bestWeight: number;
          totalVolume: number;
          lastPerformedOn: string;
        }
      >
    >((accumulator, session) => {
      session.exercises.forEach((exercise) => {
        const current = accumulator[exercise.exerciseName];
        const bestWeight = exercise.sets.reduce((best, set) => Math.max(best, set.weight), 0);
        const volume = exercise.sets.reduce((sum, set) => sum + set.reps * set.weight, 0);

        accumulator[exercise.exerciseName] = {
          exerciseName: exercise.exerciseName,
          sessionCount: (current?.sessionCount || 0) + 1,
          bestWeight: Math.max(current?.bestWeight || 0, bestWeight),
          totalVolume: (current?.totalVolume || 0) + volume,
          lastPerformedOn: current?.lastPerformedOn || session.performedOn,
        };
      });
      return accumulator;
    }, {})
  )
    .sort((left, right) => right.sessionCount - left.sessionCount || right.totalVolume - left.totalVolume)
    .slice(0, 6);
  const muscleGroups = sessions.reduce<Record<string, number>>((accumulator, session) => {
    session.exercises.forEach((exercise) => {
      accumulator[exercise.muscleGroup || "Other"] = (accumulator[exercise.muscleGroup || "Other"] || 0) + 1;
    });
    return accumulator;
  }, {});
  const mostHitMuscle = Object.entries(muscleGroups).sort((left, right) => right[1] - left[1])[0];

  return (
    <>
      <PageSection
        eyebrow="Lift Log"
        title="Ready to train"
        description="Open workout mode, log the lifts, and keep the rest out of the way."
      >
        {error ? <p className="error-copy">{error}</p> : null}
        <div className="deep-module-hero">
          <Link className="primary-button deep-module-primary-action" to="/app/easyworkout/log?workoutMode=1">
            <strong>Start workout</strong>
          </Link>
          <Link className="button-secondary deep-module-secondary-action" to="/app/easyworkout/routines">
            Routines
          </Link>
          <Link className="ghost-button deep-module-secondary-action" to="/app/easyworkout/log">
            Log old workout
          </Link>
        </div>

        <div className="workout-today-strip" aria-label="Workout snapshot">
          <article>
            <span>This week</span>
            <strong>{weeklySessions.length}</strong>
          </article>
          <article>
            <span>Total sessions</span>
            <strong>{sessions.length}</strong>
          </article>
          <article>
            <span>Recent activity</span>
            <strong>{streak} day{streak === 1 ? "" : "s"}</strong>
          </article>
        </div>
      </PageSection>

      {isExperimentalFeatureEnabled("gymMode") ? (
        <details className="advanced-disclosure">
          <summary>Training insights</summary>
          <div className="stats-grid">
            <article className="stat-card-vnext">
              <span>Total volume</span>
              <strong>{totalVolume.toLocaleString()}</strong>
            </article>
            <article className="stat-card-vnext">
              <span>Stacks saved</span>
              <strong>{routines.length}</strong>
            </article>
            <article className="stat-card-vnext">
              <span>Most hit</span>
              <strong>{mostHitMuscle?.[0] || "None yet"}</strong>
            </article>
            <article className="stat-card-vnext">
              <span>Recent PR pool</span>
              <strong>{topLifts.length}</strong>
            </article>
          </div>
          <div className="hq-link-grid">
            {routines.slice(0, 4).map((routine) => (
              <Link key={routine.id} className="hq-link-card" to={`/app/easyworkout/log?routineId=${routine.id}&gymMode=1`}>
                <strong>{routine.name}</strong>
                <p>{routine.exercises.length} exercise stack. Launch without editing the saved stack.</p>
              </Link>
            ))}
          </div>
        </details>
      ) : null}

      <details className="advanced-disclosure">
        <summary>History and records</summary>
      <div className="dashboard-grid">
        <PageSection
          eyebrow="Recent"
          title="Latest sessions"
          description="Quick proof of what you have actually done recently."
        >
          <div className="task-list-vnext">
            {isLoading ? <p className="helper-copy">Loading workouts...</p> : null}
            {!isLoading && recentSessions.length === 0 ? (
              <div className="empty-card-vnext">No workouts logged yet.</div>
            ) : null}
            {recentSessions.map((session) => (
              <article key={session.id} className="task-card-vnext">
                <div className="task-card-copy">
                  <div className="task-card-title-row">
                    <h3>{session.routineName || "Workout"}</h3>
                    <span className="priority-pill-vnext">{session.performedOn || "No date"}</span>
                  </div>
                  <p>
                    {session.exercises.length} exercise{session.exercises.length === 1 ? "" : "s"} |{" "}
                    {getSessionVolume(session).toLocaleString()} lbs volume
                  </p>
                </div>
                <div className="task-card-actions">
                  <button type="button" className="ghost-button" onClick={() => void deleteSession(session.id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </PageSection>

        <PageSection
          eyebrow="Strength"
          title="Top logged lifts"
          description="Best recent weights pulled from your workout history."
        >
          <div className="task-list-vnext">
            {topLifts.length === 0 ? (
              <div className="empty-card-vnext">Your lift records will show up here after you log workouts.</div>
            ) : (
              topLifts.map((lift) => (
                <article key={lift.exerciseName} className="mini-panel-vnext">
                  <span>{lift.exerciseName}</span>
                  <strong>
                    {lift.weight} lbs x {lift.reps}
                  </strong>
                </article>
              ))
            )}
          </div>
        </PageSection>
      </div>
      <PageSection
        eyebrow="Progress"
        title="Exercise history"
        description="The foundation view: what you hit the most, what is moving up, and what keeps showing up."
      >
        <div className="statistics-app-grid">
          {exerciseStats.length === 0 ? (
            <div className="empty-card-vnext">Exercise history will show up after a few saved workouts.</div>
          ) : (
            exerciseStats.map((exercise) => (
              <article key={exercise.exerciseName} className="statistics-insight-card">
                <span>{exercise.exerciseName}</span>
                <strong>{exercise.bestWeight} lbs best</strong>
                <p>
                  {exercise.sessionCount} session{exercise.sessionCount === 1 ? "" : "s"} |{" "}
                  {exercise.totalVolume.toLocaleString()} total volume
                </p>
              </article>
            ))
          )}
        </div>
      </PageSection>
      </details>
    </>
  );
}
