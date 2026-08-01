import { Link, useParams } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { useEasyWorkout } from "@/features/easyworkout/EasyWorkoutContext";
import { deriveWorkoutStatistics, isValidWorkingSet, weightedSetVolume } from "@/features/easyworkout/domain/workoutStatistics";
import { useSettings } from "@/features/settings/SettingsContext";

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export function WorkoutSessionReviewPage() {
  const { sessionId = "" } = useParams();
  const { sessions } = useEasyWorkout();
  const { settings } = useSettings();
  const session = sessions.find((item) => item.id === decodeURIComponent(sessionId));
  if (!session) return <PageSection headingLevel={1} eyebrow="Workout review" title="Workout not found" description="The source session is unavailable in this data state."><Link className="button-secondary" to="/app/easyworkout/dashboard">Workout dashboard</Link></PageSection>;

  const stats = deriveWorkoutStatistics(sessions, { nowDateKey: today(), periodDays: 90, displayUnit: settings.easyWorkout.weightUnit });
  let workingSets = 0;
  let workload = 0;
  const muscles = new Set<string>();
  session.exercises.forEach((exercise) => {
    const kind = exercise.exerciseType || "weighted";
    exercise.sets.forEach((set) => {
      if (!isValidWorkingSet(set, kind)) return;
      workingSets += 1;
      workload += weightedSetVolume(set, kind);
    });
    (exercise.primaryMuscles?.length ? exercise.primaryMuscles : exercise.muscleGroup ? [exercise.muscleGroup] : []).forEach((muscle) => muscles.add(muscle));
  });
  const records = stats.exerciseSummaries.flatMap((summary) => summary.records.map((record) => ({ summary, record }))).filter(({ record }) => record.sourceWorkoutId === session.id);
  const comparable = stats.exerciseSummaries.find((summary) => session.exercises.some((exercise) => (exercise.exerciseId && exercise.exerciseId === summary.exerciseId) || exercise.exerciseName === summary.exerciseName));
  const nextObservation = comparable && comparable.trend !== "insufficient"
    ? `${comparable.exerciseName}: ${comparable.trend} across ${comparable.sessionCount} comparable sessions (${comparable.trendConfidence} confidence).`
    : "Log another comparable session before changing the plan.";

  return (
    <PageSection headingLevel={1} eyebrow="Post-workout review" title={session.routineName || "Workout complete"} description={`${session.performedOn} · Source workout ${session.id}`}>
      <div className="statistics-hero-strip">
        <article><span>Duration</span><strong>{session.durationMinutes || 0} min</strong></article>
        <article><span>Working sets</span><strong>{workingSets}</strong></article>
        <article><span>Weighted workload</span><strong>{workload.toLocaleString()} {settings.easyWorkout.weightUnit}·reps</strong></article>
        <article><span>Muscles trained</span><strong>{[...muscles].join(", ") || "Unmapped"}</strong></article>
      </div>
      <div className="workout-next-move"><div><span>Next time · rule comparable-trend-v1</span><strong>{nextObservation}</strong><p>This is a transparent observation from logged evidence, not AI or a recovery diagnosis.</p></div></div>
      <div className="statistics-app-grid">
        {records.length ? records.map(({ summary, record }) => <article className="statistics-insight-card" key={`${summary.exerciseKey}-${record.type}-${record.label}`}><span>{summary.exerciseName}</span><strong>{record.label}</strong><p>{record.value.toFixed(record.unit === "reps" ? 0 : 1)} {record.unit} · exact source is this workout</p></article>) : <p className="empty-card-vnext">No new all-history record in this session. Comparable workload still counts toward the trend.</p>}
      </div>
      <div className="task-composer-actions"><Link className="primary-button" to="/app/easystatistics?tab=workout">Open Workout progress</Link><Link className="button-secondary" to="/app/easyworkout/dashboard">Workout dashboard</Link></div>
    </PageSection>
  );
}
