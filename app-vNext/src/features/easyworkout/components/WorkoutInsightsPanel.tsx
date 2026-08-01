import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { deriveWorkoutStatistics, type AnalyticsSession, type PeriodMetric } from "@/features/easyworkout/domain/workoutStatistics";
import { workoutDemoMetadata } from "@/features/easyworkout/demo/workoutDemoFixtures";
import { useAuth } from "@/features/auth/AuthContext";
import { useSettings } from "@/features/settings/SettingsContext";

const localDateKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

function comparisonCopy(metric: PeriodMetric, suffix = "") {
  if (metric.percentDelta === null) return `${metric.current.toLocaleString()}${suffix}; no comparable prior value`;
  const direction = metric.delta > 0 ? "up" : metric.delta < 0 ? "down" : "unchanged";
  return `${metric.current.toLocaleString()}${suffix}; ${direction} ${Math.abs(metric.percentDelta).toFixed(0)}%`;
}

type WorkoutInsightsPanelProps = {
  sessions: AnalyticsSession[];
  isLoading?: boolean;
  error?: string;
};

export function WorkoutInsightsPanel({ sessions, isLoading = false, error = "" }: WorkoutInsightsPanelProps) {
  const { isDemoMode } = useAuth();
  const { settings } = useSettings();
  const [periodDays, setPeriodDays] = useState<7 | 28 | 90>(28);
  const [exerciseQuery, setExerciseQuery] = useState("");
  const stats = useMemo(
    () => deriveWorkoutStatistics(sessions, { nowDateKey: localDateKey(), periodDays, displayUnit: settings.easyWorkout.weightUnit }),
    [periodDays, sessions, settings.easyWorkout.weightUnit]
  );
  const selectedExercise = stats.exerciseSummaries.find((summary) =>
    summary.exerciseName.toLowerCase().includes(exerciseQuery.trim().toLowerCase())
  ) || stats.exerciseSummaries[0];

  return (
    <div className="workout-insights-stack" id="workout-progress">
      {isDemoMode ? (
        <div className="demo-data-banner" role="note">
          <strong>Demo data</strong>
          <span>{workoutDemoMetadata.fixtureVersion} · {workoutDemoMetadata.rangeLabel}. No Firebase writes.</span>
        </div>
      ) : null}
      {error ? <p className="error-copy">Workout insight data is partially unavailable: {error}</p> : null}
      <PageSection eyebrow="Workout" title="Training pulse" description={`${periodDays}-day window compared with the immediately preceding ${periodDays} days. Sample: ${stats.pulse.currentSampleSize} current / ${stats.pulse.previousSampleSize} prior sessions.`}>
        <div className="statistics-tab-strip" role="group" aria-label="Workout insight period">
          {([7, 28, 90] as const).map((days) => (
            <button key={days} type="button" className={periodDays === days ? "active" : undefined} aria-pressed={periodDays === days} onClick={() => setPeriodDays(days)}>
              {days} days
            </button>
          ))}
        </div>
        {isLoading ? <p role="status">Loading workout history…</p> : null}
        {!isLoading && sessions.length === 0 ? (
          <div className="empty-card-vnext">
            <strong>Not enough data yet</strong>
            <p>Log one workout to start a pulse. Four comparable exercise exposures unlock a cautious trend.</p>
            <Link className="primary-button compact-button" to="/app/easyworkout/log?workoutMode=1">Start workout</Link>
          </div>
        ) : (
          <div className="statistics-hero-strip" aria-label="Training pulse summary">
            <article><span>Sessions</span><strong>{comparisonCopy(stats.pulse.sessions)}</strong></article>
            <article><span>Duration</span><strong>{comparisonCopy(stats.pulse.durationMinutes, " min")}</strong></article>
            <article><span>Working sets</span><strong>{comparisonCopy(stats.pulse.workingSets)}</strong></article>
            <article><span>Weighted workload</span><strong>{comparisonCopy(stats.pulse.workload, ` ${settings.easyWorkout.weightUnit}·reps`)}</strong></article>
          </div>
        )}
      </PageSection>

      <PageSection eyebrow="One next move" title={stats.insight.title} description={stats.insight.explanation}>
        <div className="workout-rule-receipt">
          <span>Rule {stats.insight.ruleId}</span>
          <span>Confidence: {stats.insight.confidence}</span>
          <span>Formula: {stats.formulaVersion}</span>
        </div>
        {stats.insight.sourceWorkoutIds[0] ? <Link className="button-secondary compact-button" to={`/app/easyworkout/session/${encodeURIComponent(stats.insight.sourceWorkoutIds[0])}`}>Open source workout</Link> : null}
      </PageSection>

      <div className="dashboard-grid">
        <PageSection eyebrow="Consistency" title="Weekly rhythm" description="Completed sessions by local calendar week. This is not plan completion.">
          <div className="statistics-progress-list" aria-label="Weekly session counts">
            {stats.weeklyConsistency.map((week) => <div key={week.weekStart}><span>Week of {week.weekStart}</span><strong>{week.sessions} session{week.sessions === 1 ? "" : "s"}</strong></div>)}
          </div>
        </PageSection>
        <PageSection eyebrow="Muscles" title="Estimated muscle-set exposure" description="Direct working sets count 1.0; secondary exposure counts 0.5. This is not recovery or guaranteed growth.">
          <div className="statistics-progress-list" aria-label="Estimated muscle-set exposure">
            {stats.muscleExposure.slice(0, 8).map((muscle) => (
              <div key={muscle.muscle}><span>{muscle.muscle} · {muscle.frequency} sessions</span><strong>{muscle.estimatedExposure.toFixed(1)} ({muscle.directSets} direct + {muscle.secondarySets} secondary)</strong></div>
            ))}
            {!stats.muscleExposure.length ? <div><span>No mapped sets</span><strong>Log a working set</strong></div> : null}
          </div>
          <p className="helper-copy">{stats.unmappedWorkingSets} current-period working sets lack a muscle mapping.</p>
        </PageSection>
      </div>

      <PageSection eyebrow="Exercise detail" title="Progress by exercise" description="Estimated 1RM uses Epley for 1–15 reps; 11–15 reps are low confidence and higher-rep sets are omitted.">
        <label className="field-stack workout-exercise-search">
          <span>Search or select exercise</span>
          <input list="workout-exercise-options" value={exerciseQuery} onChange={(event) => setExerciseQuery(event.target.value)} placeholder={stats.exerciseSummaries[0]?.exerciseName || "Bench Press"} />
          <datalist id="workout-exercise-options">{stats.exerciseSummaries.map((exercise) => <option key={exercise.exerciseKey} value={exercise.exerciseName} />)}</datalist>
        </label>
        {selectedExercise ? (
          <div className="workout-exercise-detail">
            <div className="statistics-insight-grid">
              <article className="statistics-insight-card"><span>Trend</span><strong>{selectedExercise.trend}</strong><p>{selectedExercise.sessionCount} comparable sessions · {selectedExercise.trendConfidence} confidence</p></article>
              {selectedExercise.records.slice(0, 5).map((record) => <article className="statistics-insight-card" key={`${record.type}-${record.label}`}><span>{record.label}</span><strong>{record.value.toFixed(record.unit === "reps" ? 0 : 1)} {record.unit}</strong><p>{record.performedOn} · <Link to={`/app/easyworkout/session/${encodeURIComponent(record.sourceWorkoutId)}`}>source</Link></p></article>)}
            </div>
            <div className="workout-chart-alternative" aria-label={`${selectedExercise.exerciseName} estimated one-repetition maximum history`}>
              <h3>{selectedExercise.exerciseName} estimated 1RM history</h3>
              <ol>{selectedExercise.observations.slice(-10).map((point) => <li key={`${point.sessionId}-${point.performedOn}`}><Link to={`/app/easyworkout/session/${encodeURIComponent(point.sessionId)}`}>{point.performedOn}</Link>: {point.estimatedOneRepMax.toFixed(1)} {settings.easyWorkout.weightUnit}, {point.confidence} confidence from {point.sourceWeight} × {point.sourceReps}</li>)}</ol>
            </div>
            <Link className="button-secondary compact-button" to={`/app/easyworkout/exercise/${encodeURIComponent(selectedExercise.exerciseId || selectedExercise.exerciseName)}`}>Open full exercise detail</Link>
          </div>
        ) : <p className="empty-card-vnext">Log another comparable session to unlock exercise detail.</p>}
      </PageSection>
    </div>
  );
}
