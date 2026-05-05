import { Link } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { useEasyWorkout } from "@/features/easyworkout/EasyWorkoutContext";
import { useSettings } from "@/features/settings/SettingsContext";

function getDateKeyOffset(days: number) {
  const next = new Date();
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() + days);
  return next.toISOString().split("T")[0];
}

function getSessionVolume(session: ReturnType<typeof useEasyWorkout>["sessions"][number]) {
  return session.exercises.reduce(
    (sum, exercise) =>
      sum +
      exercise.sets.reduce((exerciseSum, set) => exerciseSum + set.reps * set.weight, 0),
    0
  );
}

function getEstimatedMax(weight: number, reps: number) {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (36 / Math.max(37 - reps, 1)));
}

type TrainingCapacity = "Ready" | "Steady" | "Recover";

export function EasyWorkoutDashboardPage() {
  const { sessions, routines, isLoading, error, deleteSession } = useEasyWorkout();
  const { isExperimentalFeatureEnabled } = useSettings();
  const todayKey = getDateKeyOffset(0);
  const weekThreshold = getDateKeyOffset(-6);
  const monthThreshold = getDateKeyOffset(-29);
  const recentSessions = sessions.slice(0, 4);
  const todaySessions = sessions.filter((session) => session.performedOn === todayKey);
  const weeklySessions = sessions.filter((session) => {
    if (!session.performedOn) return false;
    return session.performedOn >= weekThreshold;
  });
  const monthlySessions = sessions.filter((session) => {
    if (!session.performedOn) return false;
    return session.performedOn >= monthThreshold;
  });
  const weeklyVolume = weeklySessions.reduce((sum, session) => sum + getSessionVolume(session), 0);
  const monthlyVolume = monthlySessions.reduce((sum, session) => sum + getSessionVolume(session), 0);
  const consistencyScore = Math.min(100, Math.round((weeklySessions.length / 4) * 100));
  const lastSession = recentSessions[0];
  const daysSinceLastSession = lastSession?.performedOn
    ? Math.max(
        0,
        Math.round((new Date(todayKey).getTime() - new Date(lastSession.performedOn).getTime()) / 86400000)
      )
    : null;
  const firstRoutine = routines[0];
  const trainingCapacity: TrainingCapacity = todaySessions.length
    ? "Recover"
    : weeklySessions.length >= 4
      ? "Steady"
      : daysSinceLastSession === null || daysSinceLastSession >= 2
        ? "Ready"
        : "Steady";
  const trainingCapacityRead = {
    Ready: {
      title: "Ready for a full session",
      detail: firstRoutine
        ? "Use a saved routine and keep the first working set honest."
        : "Start a focused session and let the log build the plan.",
    },
    Steady: {
      title: "Keep it steady",
      detail: weeklySessions.length >= 4
        ? "The week already has rhythm. Train, but avoid chasing extra volume."
        : "A normal session fits. Keep the plan simple and log what happens.",
    },
    Recover: {
      title: "Recovery signal",
      detail: "You already trained today. Review the log before adding more volume.",
    },
  }[trainingCapacity];

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
          bestReps: number;
          totalVolume: number;
          lastPerformedOn: string;
          estimatedMax: number;
        }
      >
    >((accumulator, session) => {
      session.exercises.forEach((exercise) => {
        const current = accumulator[exercise.exerciseName];
        const bestWeight = exercise.sets.reduce((best, set) => Math.max(best, set.weight), 0);
        const bestSet = exercise.sets.reduce(
          (best, set) => {
            const nextEstimatedMax = getEstimatedMax(set.weight, set.reps);
            if (nextEstimatedMax > best.estimatedMax) {
              return { reps: set.reps, estimatedMax: nextEstimatedMax };
            }
            return best;
          },
          { reps: 0, estimatedMax: 0 }
        );
        const volume = exercise.sets.reduce((sum, set) => sum + set.reps * set.weight, 0);

        accumulator[exercise.exerciseName] = {
          exerciseName: exercise.exerciseName,
          sessionCount: (current?.sessionCount || 0) + 1,
          bestWeight: Math.max(current?.bestWeight || 0, bestWeight),
          bestReps:
            bestWeight > (current?.bestWeight || 0)
              ? exercise.sets.find((set) => set.weight === bestWeight)?.reps || bestSet.reps
              : current?.bestReps || bestSet.reps,
          totalVolume: (current?.totalVolume || 0) + volume,
          lastPerformedOn: current?.lastPerformedOn || session.performedOn,
          estimatedMax: Math.max(current?.estimatedMax || 0, bestSet.estimatedMax),
        };
      });
      return accumulator;
    }, {})
  )
    .sort((left, right) => right.sessionCount - left.sessionCount || right.totalVolume - left.totalVolume)
    .slice(0, 6);
  const prHighlights = [...exerciseStats]
    .sort((left, right) => right.estimatedMax - left.estimatedMax || right.bestWeight - left.bestWeight)
    .slice(0, 3);
  const trainingRhythm = [
    { label: "7 days", sessions: weeklySessions.length, volume: weeklyVolume },
    { label: "30 days", sessions: monthlySessions.length, volume: monthlyVolume },
  ];
  const dailyPlanRead = todaySessions.length
    ? {
        label: "Logged today",
        title: "Today already has training progress.",
        detail: "Review the log, then return to Today before adding more volume.",
        actionLabel: "Review log",
        to: "/app/easyworkout/log",
      }
    : trainingCapacity === "Recover"
      ? {
          label: "Protect the plan",
          title: "Keep any extra work light.",
          detail: "Use the logger only if the rest of the day still has room.",
          actionLabel: "Open Today",
          to: "/app/hq",
        }
      : {
          label: "Fits today",
          title: firstRoutine ? "Use a saved routine when the day opens." : "Start a short session when the day opens.",
          detail: "The workout log can hold the session without taking over the daily plan.",
          actionLabel: firstRoutine ? "Use routine" : "Start workout",
          to: firstRoutine
            ? `/app/easyworkout/log?routineId=${firstRoutine.id}`
            : "/app/easyworkout/log?workoutMode=1",
        };
  const muscleGroups = sessions.reduce<
    Record<
      string,
      {
        name: string;
        exerciseHits: number;
        setCount: number;
        totalVolume: number;
        weeklyVolume: number;
        lastPerformedOn: string;
      }
    >
  >((accumulator, session) => {
    session.exercises.forEach((exercise) => {
      const name = exercise.muscleGroup || "Other";
      const current = accumulator[name];
      const setCount = exercise.sets.length;
      const volume = exercise.sets.reduce((sum, set) => sum + set.reps * set.weight, 0);
      const isThisWeek = !!session.performedOn && session.performedOn >= weekThreshold;

      accumulator[name] = {
        name,
        exerciseHits: (current?.exerciseHits || 0) + 1,
        setCount: (current?.setCount || 0) + setCount,
        totalVolume: (current?.totalVolume || 0) + volume,
        weeklyVolume: (current?.weeklyVolume || 0) + (isThisWeek ? volume : 0),
        lastPerformedOn:
          !current?.lastPerformedOn || current.lastPerformedOn < session.performedOn
            ? session.performedOn
            : current.lastPerformedOn,
      };
    });
    return accumulator;
  }, {});
  const muscleGroupStats = Object.values(muscleGroups).sort(
    (left, right) => right.weeklyVolume - left.weeklyVolume || right.exerciseHits - left.exerciseHits
  );
  const mostHitMuscle = muscleGroupStats[0];
  const muscleGroupsThisWeek = muscleGroupStats.filter((group) => group.weeklyVolume > 0).length;
  const needsAttentionMuscle = [...muscleGroupStats]
    .filter((group) => group.weeklyVolume === 0)
    .sort((left, right) => left.lastPerformedOn.localeCompare(right.lastPerformedOn))[0];
  const nextWorkoutMove = (() => {
    if (!sessions.length) {
      return {
        label: "Start here",
        title: "Log the first workout",
        body: "Start a live session so EasyWorkout can build your recent history, records, and coverage.",
        actionLabel: "Start workout",
        to: "/app/easyworkout/log?workoutMode=1",
      };
    }

    if (todaySessions.length) {
      return {
        label: "Today",
        title: "Review today's work",
        body: `${todaySessions.length} workout${todaySessions.length === 1 ? "" : "s"} already logged today. Add details or review the latest session before you move on.`,
        actionLabel: "Open log",
        to: "/app/easyworkout/log",
      };
    }

    if (needsAttentionMuscle) {
      return {
        label: "Coverage",
        title: `Train ${needsAttentionMuscle.name}`,
        body: `${needsAttentionMuscle.name} is quiet this week after last showing up ${needsAttentionMuscle.lastPerformedOn || "earlier"}. Cover the gap in your next session.`,
        actionLabel: firstRoutine ? "Use routine" : "Start workout",
        to: firstRoutine
          ? `/app/easyworkout/log?routineId=${firstRoutine.id}`
          : "/app/easyworkout/log?workoutMode=1",
      };
    }

    if (weeklySessions.length < 4) {
      return {
        label: "Rhythm",
        title: "Add one more session",
        body: `${weeklySessions.length} session${weeklySessions.length === 1 ? "" : "s"} in the last 7 days. One focused workout would strengthen the weekly rhythm.`,
        actionLabel: firstRoutine ? "Use routine" : "Start workout",
        to: firstRoutine
          ? `/app/easyworkout/log?routineId=${firstRoutine.id}`
          : "/app/easyworkout/log?workoutMode=1",
      };
    }

    return {
      label: "Maintain",
      title: "Keep the streak clean",
      body: "Your weekly rhythm is solid. Log the next session when it happens so records and coverage stay current.",
      actionLabel: "Log workout",
      to: "/app/easyworkout/log?workoutMode=1",
    };
  })();

  return (
    <>
      <PageSection
        eyebrow="EasyWorkout"
        title="Training dashboard"
        description="Start a session, check today's lift context, and keep the rest out of the way."
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

        <div className="workout-today-meta" aria-label="Today's workout context">
          <span>
            <em>Today</em>
            <strong>{todaySessions.length} workout{todaySessions.length === 1 ? "" : "s"}</strong>
          </span>
          <span>
            <em>This week</em>
            <strong>{weeklySessions.length} session{weeklySessions.length === 1 ? "" : "s"}</strong>
          </span>
          <span>
            <em>Last logged</em>
            <strong>{recentSessions[0]?.performedOn || "Not logged yet"}</strong>
          </span>
        </div>

        <div className={`workout-capacity-signal capacity-${trainingCapacity.toLowerCase()}`} aria-label="Training capacity signal">
          <div>
            <span>Coach capacity</span>
            <strong>{trainingCapacityRead.title}</strong>
            <p>{trainingCapacityRead.detail}</p>
          </div>
          <small>
            {weeklySessions.length} this week / {daysSinceLastSession === null ? "no recent log" : `${daysSinceLastSession}d since last`}
          </small>
        </div>

        <div className="workout-plan-bridge" aria-label="Workout connection to daily plan">
          <div className="workout-plan-bridge-copy">
            <span>{dailyPlanRead.label}</span>
            <strong>{dailyPlanRead.title}</strong>
            <p>{dailyPlanRead.detail}</p>
          </div>
          <div className="workout-plan-bridge-actions">
            <Link className="button-secondary compact-button" to={dailyPlanRead.to}>
              {dailyPlanRead.actionLabel}
            </Link>
            <Link className="ghost-button compact-button" to="/app/hq">
              Today
            </Link>
          </div>
        </div>

        <div className="workout-next-move" aria-label="Recommended next workout action">
          <div>
            <span>{nextWorkoutMove.label}</span>
            <strong>{nextWorkoutMove.title}</strong>
            <p>{nextWorkoutMove.body}</p>
          </div>
          <Link className="button-secondary compact-button" to={nextWorkoutMove.to}>
            {nextWorkoutMove.actionLabel}
          </Link>
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
              <span>Consistency</span>
              <strong>{consistencyScore}%</strong>
            </article>
            <article className="stat-card-vnext">
              <span>Stacks saved</span>
              <strong>{routines.length}</strong>
            </article>
            <article className="stat-card-vnext">
              <span>Most hit</span>
              <strong>{mostHitMuscle?.name || "None yet"}</strong>
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
          description="A quick look at your recent training progress."
        >
          <div className="task-list-vnext">
            {isLoading ? <p className="helper-copy">Loading workouts...</p> : null}
            {!isLoading && recentSessions.length === 0 ? (
              <div className="empty-card-vnext workout-empty-state">
                <span>EasyWorkout history</span>
                <strong>No workouts logged yet</strong>
                <p>Start a session when you are ready. Your latest workouts will collect here for quick review.</p>
                <Link className="primary-button compact-button" to="/app/easyworkout/log?workoutMode=1">
                  Start workout
                </Link>
              </div>
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
        eyebrow="PRs"
        title="Strength highlights"
        description="The lifts currently carrying your best numbers."
      >
        <div className="statistics-subgrid">
          {prHighlights.length === 0 ? (
            <div className="empty-card-vnext">Your PR-style highlights will show up after a few logged sets.</div>
          ) : (
            prHighlights.map((exercise) => (
              <article key={exercise.exerciseName} className="statistics-insight-card">
                <span>{exercise.exerciseName}</span>
                <strong>{exercise.estimatedMax} est. max</strong>
                <p>
                  {exercise.bestWeight} lbs x {exercise.bestReps || 1} best working set
                </p>
              </article>
            ))
          )}
        </div>
      </PageSection>
      <PageSection
        eyebrow="Progress"
        title="Exercise history"
        description="Your most repeated lifts and what they are doing over time."
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
      <PageSection
        eyebrow="Rhythm"
        title="Training consistency"
        description="A quick read on whether your training is building real momentum."
      >
        <div className="statistics-subgrid">
          <article className="statistics-insight-card">
            <span>Consistency score</span>
            <strong>{consistencyScore}%</strong>
            <p>
              {weeklySessions.length >= 4
                ? "You are in a strong weekly rhythm right now."
                : "A couple more sessions this week would tighten the streak."}
            </p>
          </article>
          <article className="statistics-insight-card">
            <span>Weekly volume</span>
            <strong>{weeklyVolume.toLocaleString()}</strong>
            <p>{weeklySessions.length} session{weeklySessions.length === 1 ? "" : "s"} in the last 7 days.</p>
          </article>
          <article className="statistics-insight-card">
            <span>Monthly volume</span>
            <strong>{monthlyVolume.toLocaleString()}</strong>
            <p>{monthlySessions.length} session{monthlySessions.length === 1 ? "" : "s"} in the last 30 days.</p>
          </article>
        </div>
        <div className="statistics-progress-list">
          {trainingRhythm.map((window) => (
            <div key={window.label}>
              <span>{window.label}</span>
              <strong>
                {window.sessions} sessions | {window.volume.toLocaleString()} volume
              </strong>
            </div>
          ))}
        </div>
      </PageSection>
      <PageSection
        eyebrow="Muscle groups"
        title="Training coverage"
        description="A clean read on where your work is landing this week."
      >
        <div className="statistics-insight-grid workout-muscle-overview">
          <article className="statistics-insight-card">
            <span>Most trained</span>
            <strong>{mostHitMuscle?.name || "No signal yet"}</strong>
            <p>
              {mostHitMuscle
                ? `${mostHitMuscle.setCount} set${mostHitMuscle.setCount === 1 ? "" : "s"} and ${mostHitMuscle.weeklyVolume.toLocaleString()} volume this week.`
                : "Log a few sessions to see which muscle groups lead the week."}
            </p>
          </article>
          <article className="statistics-insight-card">
            <span>Groups active</span>
            <strong>{muscleGroupsThisWeek}</strong>
            <p>
              {muscleGroupsThisWeek > 0
                ? `${muscleGroupStats.length} tracked group${muscleGroupStats.length === 1 ? "" : "s"} in your history.`
                : "No muscle groups trained yet this week."}
            </p>
          </article>
          <article className="statistics-insight-card">
            <span>Needs attention</span>
            <strong>{needsAttentionMuscle?.name || "Balanced week"}</strong>
            <p>
              {needsAttentionMuscle
                ? `Last hit ${needsAttentionMuscle.lastPerformedOn || "earlier"} and still quiet this week.`
                : "Every tracked muscle group has been touched this week."}
            </p>
          </article>
        </div>
        <div className="statistics-app-grid">
          {muscleGroupStats.length === 0 ? (
            <div className="empty-card-vnext">Muscle-group progress will show up after a few saved workouts.</div>
          ) : (
            muscleGroupStats.slice(0, 6).map((group) => (
              <article key={group.name} className="statistics-insight-card">
                <span>{group.name}</span>
                <strong>{group.weeklyVolume.toLocaleString()} week volume</strong>
                <p>
                  {group.setCount} set{group.setCount === 1 ? "" : "s"} | {group.exerciseHits} logged move
                  {group.exerciseHits === 1 ? "" : "s"}
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
