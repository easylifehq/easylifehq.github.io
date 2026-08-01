import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { useEasyWorkout } from "@/features/easyworkout/EasyWorkoutContext";
import { deriveWorkoutStatistics } from "@/features/easyworkout/domain/workoutStatistics";
import { getWorkoutDraftStorageKey, recoverWorkoutDraft } from "@/features/easyworkout/domain/workoutDraftLifecycle";
import { useAuth } from "@/features/auth/AuthContext";
import { useSettings } from "@/features/settings/SettingsContext";
import { workoutDemoMetadata } from "@/features/easyworkout/demo/workoutDemoFixtures";

const localDateKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export function EasyWorkoutDashboardPage() {
  const { sessions, routines, isLoading, error } = useEasyWorkout();
  const { isDemoMode, user } = useAuth();
  const { settings } = useSettings();
  const stats = useMemo(() => deriveWorkoutStatistics(sessions, { nowDateKey: localDateKey(), periodDays: 28, displayUnit: settings.easyWorkout.weightUnit }), [sessions, settings.easyWorkout.weightUnit]);
  const restoredDraft = useMemo(() => {
    try {
      if (!user) return null;
      const raw = window.localStorage.getItem(getWorkoutDraftStorageKey(user.uid));
      return raw ? recoverWorkoutDraft(JSON.parse(raw), { today: localDateKey(), nowIso: new Date().toISOString(), ownerId: user.uid, defaultWeightUnit: settings.easyWorkout.weightUnit, createId: () => crypto.randomUUID() }).draft : null;
    } catch {
      return null;
    }
  }, [settings.easyWorkout.weightUnit, user]);
  const recentSessions = sessions.slice(0, 5);
  const demoParam = isDemoMode ? "&demo=1" : "";
  const demoSearch = isDemoMode ? "?demo=1" : "";
  const startTarget = routines[0] ? `/app/easyworkout/log?routineId=${routines[0].id}&workoutMode=1${demoParam}` : `/app/easyworkout/log?workoutMode=1${demoParam}`;

  return (
    <>
      <PageSection headingLevel={1} eyebrow="Workout" title="Start or resume" description="The logger stays fast; deeper evidence lives in Progress.">
        {isDemoMode ? <div className="demo-data-banner" role="note"><strong>Demo data</strong><span>{workoutDemoMetadata.fixtureVersion}. Synthetic and Firebase-write-free.</span></div> : null}
        {error ? <p className="error-copy">Workout data is partially unavailable: {error}</p> : null}
        <div className="deep-module-hero">
          <Link className="primary-button deep-module-primary-action" to={restoredDraft ? `/app/easyworkout/log?workoutMode=1${demoParam}` : startTarget}>
            <strong>{restoredDraft ? "Resume workout" : "Start workout"}</strong>
          </Link>
          <Link className="button-secondary deep-module-secondary-action" to={`/app/easyworkout/routines${demoSearch}`}>Routines</Link>
          <Link className="ghost-button deep-module-secondary-action" to={`/app/easystatistics?tab=workout${demoParam}`}>Workout progress</Link>
        </div>
        {restoredDraft ? (
          <div className="workout-save-status status-saved-local" role="status">
            <strong>Saved on this device</strong><span>{restoredDraft.exerciseLogs.length} exercises · last local update {new Date(restoredDraft.updatedAt).toLocaleString()}</span>
          </div>
        ) : null}
        <div className="workout-next-move" aria-label="Recommended next workout action">
          <div><span>One next move · {stats.insight.ruleId}</span><strong>{stats.insight.title}</strong><p>{stats.insight.explanation}</p><small>Confidence: {stats.insight.confidence}. Recovery is unknown unless you log readiness or effort.</small></div>
          {stats.insight.sourceWorkoutIds[0] ? <Link className="button-secondary compact-button" to={`/app/easyworkout/session/${encodeURIComponent(stats.insight.sourceWorkoutIds[0])}${demoSearch}`}>Review evidence</Link> : <Link className="button-secondary compact-button" to={startTarget}>Start</Link>}
        </div>
      </PageSection>

      <PageSection eyebrow="History" title="Recent workouts" description="Open any session for exact records, workload, and source evidence.">
        {isLoading ? <p role="status">Loading workouts…</p> : null}
        {!isLoading && !recentSessions.length ? <div className="empty-card-vnext"><strong>No workouts logged yet</strong><p>One session starts the history. Four comparable exercise exposures unlock a cautious trend.</p></div> : null}
        <div className="task-list-vnext">
          {recentSessions.map((session) => (
            <article className="task-card-vnext" key={session.id}>
              <div className="task-card-copy"><div className="task-card-title-row"><h3>{session.routineName || "Workout"}</h3><span className="priority-pill-vnext">{session.performedOn}</span></div><p>{session.exercises.length} exercises · {session.durationMinutes || 0} minutes</p></div>
              <div className="task-card-actions"><Link className="button-secondary compact-button" to={`/app/easyworkout/session/${encodeURIComponent(session.id)}${demoSearch}`}>Review</Link></div>
            </article>
          ))}
        </div>
      </PageSection>
    </>
  );
}
