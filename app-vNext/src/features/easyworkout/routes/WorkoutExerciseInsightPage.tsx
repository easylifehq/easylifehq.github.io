import { Link, useParams } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { useEasyWorkout } from "@/features/easyworkout/EasyWorkoutContext";
import { deriveWorkoutStatistics } from "@/features/easyworkout/domain/workoutStatistics";
import { useSettings } from "@/features/settings/SettingsContext";
import { useAuth } from "@/features/auth/AuthContext";

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export function WorkoutExerciseInsightPage() {
  const { exerciseId = "" } = useParams();
  const { sessions } = useEasyWorkout();
  const { settings } = useSettings();
  const { isDemoMode } = useAuth();
  const demoSearch = isDemoMode ? "&demo=1" : "";
  const demoOnlySearch = isDemoMode ? "?demo=1" : "";
  const decoded = decodeURIComponent(exerciseId).toLowerCase();
  const stats = deriveWorkoutStatistics(sessions, { nowDateKey: today(), periodDays: 90, displayUnit: settings.easyWorkout.weightUnit });
  const exercise = stats.exerciseSummaries.find((item) => item.exerciseId === exerciseId || item.exerciseName.toLowerCase() === decoded);

  if (!exercise) {
    return <PageSection headingLevel={1} eyebrow="Exercise detail" title="Not enough data yet" description="This exercise has no compatible saved history."><Link className="button-secondary" to={`/app/easystatistics?tab=workout${demoSearch}`}>Back to Workout progress</Link></PageSection>;
  }

  return (
    <PageSection headingLevel={1} eyebrow="Exercise detail" title={exercise.exerciseName} description={`${exercise.sessionCount} comparable sessions · ${exercise.trend} trend · ${exercise.trendConfidence} confidence.`}>
      <div className="workout-rule-receipt"><span>Formula: Epley v1</span><span>1–10 reps high confidence</span><span>11–15 reps low confidence</span></div>
      <div className="statistics-app-grid">
        {exercise.records.map((record) => (
          <article className="statistics-insight-card" key={`${record.type}-${record.label}`}>
            <span>{record.label}</span><strong>{record.value.toFixed(record.unit === "reps" ? 0 : 1)} {record.unit}</strong>
            <p>{record.previousValue === null ? "First compatible record" : `Previous best ${record.previousValue.toFixed(1)} ${record.unit}`} · <Link to={`/app/easyworkout/session/${encodeURIComponent(record.sourceWorkoutId)}${demoOnlySearch}`}>{record.performedOn}</Link></p>
          </article>
        ))}
      </div>
      <div className="workout-chart-alternative">
        <h2>Accessible trend data</h2>
        <p>The curve uses one best compatible estimated-1RM observation per session.</p>
        <table><thead><tr><th>Date</th><th>Estimated 1RM</th><th>Source set</th><th>Confidence</th></tr></thead><tbody>
          {exercise.observations.map((point) => <tr key={point.sessionId}><td><Link to={`/app/easyworkout/session/${encodeURIComponent(point.sessionId)}${demoOnlySearch}`}>{point.performedOn}</Link></td><td>{point.estimatedOneRepMax.toFixed(1)} {settings.easyWorkout.weightUnit}</td><td>{point.sourceWeight.toFixed(1)} {settings.easyWorkout.weightUnit} × {point.sourceReps}</td><td>{point.confidence}</td></tr>)}
        </tbody></table>
      </div>
      <Link className="button-secondary" to={`/app/easystatistics?tab=workout${demoSearch}`}>Back to Workout progress</Link>
    </PageSection>
  );
}
