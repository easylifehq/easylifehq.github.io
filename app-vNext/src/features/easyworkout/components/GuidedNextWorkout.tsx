import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageSection } from "../../../components/ui/PageSection";
import { deriveGuidedWorkoutPlan, getGuidedWorkoutAction, selectGuidedRoutine } from "../domain/guidedWorkoutPlan";
import type { WorkoutRoutineRecord } from "../../../lib/firestore/workoutRoutines";
import type { WorkoutSessionRecord } from "../../../lib/firestore/workoutSessions";
import type { WorkoutDisplayUnit } from "../domain/workoutStatistics";

export function GuidedNextWorkout({ routines, sessions, displayUnit, isDemoMode, hasRestoredDraft }: { routines: WorkoutRoutineRecord[]; sessions: WorkoutSessionRecord[]; displayUnit: WorkoutDisplayUnit; isDemoMode: boolean; hasRestoredDraft: boolean }) {
  const recommendedRoutine = useMemo(() => selectGuidedRoutine(routines, sessions), [routines, sessions]);
  const [selectedRoutineId, setSelectedRoutineId] = useState("");
  useEffect(() => {
    if (!selectedRoutineId && recommendedRoutine) setSelectedRoutineId(recommendedRoutine.id);
    if (selectedRoutineId && !routines.some((routine) => routine.id === selectedRoutineId)) setSelectedRoutineId(recommendedRoutine?.id || "");
  }, [recommendedRoutine, routines, selectedRoutineId]);
  const selectedRoutine = routines.find((routine) => routine.id === selectedRoutineId) || recommendedRoutine;
  const plan = useMemo(() => selectedRoutine ? deriveGuidedWorkoutPlan(selectedRoutine, sessions, displayUnit) : null, [displayUnit, selectedRoutine, sessions]);
  const demoSearch = isDemoMode ? "?demo=1" : "";
  const action = plan ? getGuidedWorkoutAction(plan.routineId, isDemoMode, hasRestoredDraft) : null;

  return (
    <PageSection eyebrow="Guided next workout" title={plan?.routineName || "Choose a saved routine"} description="A transparent plan from your routine and comparable saved sets. No routine is changed and recovery is never inferred.">
      {!plan ? <div className="empty-card-vnext"><strong>No saved routine yet</strong><p>Create a routine first; guidance never invents one for you.</p><Link className="button-secondary compact-button" to={`/app/easyworkout/routines${demoSearch}`}>Open routines</Link></div> : (
        <>
          {routines.length > 1 ? <label className="field-stack workout-guidance-select"><span>Routine to review</span><select value={plan.routineId} onChange={(event) => setSelectedRoutineId(event.target.value)}>{routines.map((routine) => <option key={routine.id} value={routine.id}>{routine.name}</option>)}</select></label> : null}
          <div className="workout-next-move" aria-label="Guided workout rule">
            <div><span>Deterministic · {plan.formulaVersion}</span><strong>{plan.routineName}</strong><p>{plan.reason}</p><small>Suggestions are optional and remain tied to source workouts.</small></div>
            <div className="guided-workout-action"><Link className="primary-button compact-button" to={action!.to}>{action!.label}</Link>{action!.note ? <small role="status">{action!.note}</small> : null}</div>
          </div>
          <div className="task-list-vnext guided-workout-list">
            {plan.suggestions.map((suggestion) => (
              <article className="task-card-vnext" key={suggestion.exerciseId || suggestion.exerciseName}>
                <div className="task-card-copy"><div className="task-card-title-row"><h3>{suggestion.exerciseName}</h3><span className="priority-pill-vnext">{suggestion.target}</span></div><p><strong>Previous:</strong> {suggestion.previous}</p><p>{suggestion.suggestion}</p><small>Rule {suggestion.ruleId}</small></div>
                {suggestion.sourceSessionId ? <div className="task-card-actions"><Link className="button-secondary compact-button" to={`/app/easyworkout/session/${encodeURIComponent(suggestion.sourceSessionId)}${demoSearch}`}>Source {suggestion.sourceDate}</Link></div> : null}
              </article>
            ))}
          </div>
        </>
      )}
    </PageSection>
  );
}
