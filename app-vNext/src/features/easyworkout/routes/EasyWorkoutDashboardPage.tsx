import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { useEasyWorkout } from "@/features/easyworkout/EasyWorkoutContext";
import { getWorkoutDraftStorageKey, recoverWorkoutDraft } from "@/features/easyworkout/domain/workoutDraftLifecycle";
import { useAuth } from "@/features/auth/AuthContext";
import { useSettings } from "@/features/settings/SettingsContext";
import { workoutDemoMetadata } from "@/features/easyworkout/demo/workoutDemoFixtures";
import { GuidedNextWorkout } from "@/features/easyworkout/components/GuidedNextWorkout";
import { WorkoutHistoryTools } from "@/features/easyworkout/components/WorkoutHistoryTools";

const localDateKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export function EasyWorkoutDashboardPage() {
  const { sessions, routines, isLoading, error } = useEasyWorkout();
  const { isDemoMode, user } = useAuth();
  const { settings } = useSettings();
  const restoredDraft = useMemo(() => {
    try {
      if (!user) return null;
      const raw = window.localStorage.getItem(getWorkoutDraftStorageKey(user.uid));
      return raw ? recoverWorkoutDraft(JSON.parse(raw), { today: localDateKey(), nowIso: new Date().toISOString(), ownerId: user.uid, defaultWeightUnit: settings.easyWorkout.weightUnit, createId: () => crypto.randomUUID() }).draft : null;
    } catch {
      return null;
    }
  }, [settings.easyWorkout.weightUnit, user]);
  const demoParam = isDemoMode ? "&demo=1" : "";
  const demoSearch = isDemoMode ? "?demo=1" : "";
  const startTarget = routines[0] ? `/app/easyworkout/log?routineId=${routines[0].id}&workoutMode=1${demoParam}` : `/app/easyworkout/log?workoutMode=1${demoParam}`;

  return (
    <>
      <PageSection headingLevel={1} eyebrow="Workout" title="Start or resume" description="The logger stays fast; guidance and history stay transparent.">
        {isDemoMode ? <div className="demo-data-banner" role="note"><strong>Demo data</strong><span>{workoutDemoMetadata.fixtureVersion}. Synthetic and Firebase-write-free.</span></div> : null}
        {error ? <p className="error-copy">Workout data is partially unavailable: {error}</p> : null}
        <div className="deep-module-hero">
          <Link className="primary-button deep-module-primary-action" to={restoredDraft ? `/app/easyworkout/log?workoutMode=1${demoParam}` : startTarget}>
            <strong>{restoredDraft ? "Resume workout" : "Start workout"}</strong>
          </Link>
          <Link className="button-secondary deep-module-secondary-action" to={`/app/easyworkout/routines${demoSearch}`}>Routines</Link>
          <Link className="ghost-button deep-module-secondary-action" to={`/app/easystatistics?tab=workout${demoParam}`}>Workout progress</Link>
        </div>
        {restoredDraft ? <div className="workout-save-status status-saved-local" role="status"><strong>Saved on this device</strong><span>{restoredDraft.exerciseLogs.length} exercises · last local update {new Date(restoredDraft.updatedAt).toLocaleString()}</span></div> : null}
      </PageSection>

      <GuidedNextWorkout routines={routines} sessions={sessions} displayUnit={settings.easyWorkout.weightUnit} isDemoMode={isDemoMode} hasRestoredDraft={Boolean(restoredDraft)} />
      <WorkoutHistoryTools routines={routines} sessions={sessions} displayUnit={settings.easyWorkout.weightUnit} isDemoMode={isDemoMode} isLoading={isLoading} />
    </>
  );
}
