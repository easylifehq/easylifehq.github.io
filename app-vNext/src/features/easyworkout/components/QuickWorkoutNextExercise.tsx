import type { Dispatch, SetStateAction } from "react";
import {
  deriveNextExerciseSuggestions,
  type WorkoutNextExerciseSuggestion,
} from "@/features/easyworkout/domain/workoutNextExercise";
import {
  WORKOUT_EQUIPMENT_KINDS,
  parseWorkoutPlanningDurationInput,
  type WorkoutPlanningContext,
} from "@/features/easyworkout/domain/workoutPlanning";

type QuickWorkoutNextExerciseProps = {
  planningContext: WorkoutPlanningContext;
  setPlanningContext: Dispatch<SetStateAction<WorkoutPlanningContext>>;
  planningDurationInput: string;
  setPlanningDurationInput: (value: string) => void;
  nextExerciseResult: ReturnType<typeof deriveNextExerciseSuggestions>;
  onAddSuggestion: (suggestion: WorkoutNextExerciseSuggestion) => void;
};

/** Rendered below the final exercise. Focus comes from the session strip and is never asked for again. */
export function QuickWorkoutNextExercise({
  planningContext,
  setPlanningContext,
  planningDurationInput,
  setPlanningDurationInput,
  nextExerciseResult,
  onAddSuggestion,
}: QuickWorkoutNextExerciseProps) {
  return (
    <details className="calendar-info-card workout-next-lift-card">
      <summary className="workout-next-lift-summary">
        <strong>Need another exercise?</strong>
      </summary>
      <div className="workout-planning-controls">
        <fieldset>
          <legend>Available equipment</legend>
          <div className="workout-planning-choices">
            {WORKOUT_EQUIPMENT_KINDS.map((equipment) => (
              <label key={equipment} className="workout-planning-choice">
                <input
                  type="checkbox"
                  checked={planningContext.availableEquipment.includes(equipment)}
                  onChange={(event) => setPlanningContext((current) => ({
                    ...current,
                    availableEquipment: event.target.checked
                      ? [...current.availableEquipment, equipment]
                      : current.availableEquipment.filter((entry) => entry !== equipment),
                  }))}
                />
                <span>{equipment.replace(/-/g, " ")}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="field-label workout-planning-budget">
          <span>Planning budget</span>
          <span className="helper-copy">Target session minutes. Actual duration stays separate.</span>
          <input
            type="text"
            inputMode="numeric"
            value={planningDurationInput}
            onChange={(event) => {
              setPlanningDurationInput(event.target.value);
              setPlanningContext((current) => ({
                ...current,
                plannedDurationMinutes: parseWorkoutPlanningDurationInput(event.target.value),
              }));
            }}
            placeholder="45"
          />
        </label>
      </div>

      {nextExerciseResult.state === "needs-context" ? (
        <p className="helper-copy" role="status">Choose a session focus above, available equipment, and a planning budget to get a deterministic suggestion.</p>
      ) : nextExerciseResult.state === "unclassified-completed" ? (
        <p className="helper-copy" role="status">
          Suggestion paused: completed work for {nextExerciseResult.unclassifiedCompletedExercises.join(", ")} is not classified reliably yet.
        </p>
      ) : nextExerciseResult.state === "no-fit" ? (
        <p className="helper-copy" role="status">There is not enough planning time left for another set with the disclosed estimate.</p>
      ) : nextExerciseResult.state === "no-candidates" ? (
        <p className="helper-copy" role="status">No classified exercise fits the selected focus, equipment, and remaining time.</p>
      ) : (
        <div className="workout-next-lift-grid" aria-label="Next exercise suggestions">
          {nextExerciseResult.suggestions.map((suggestion, index) => (
            <article key={suggestion.exerciseId || suggestion.name} className="workout-next-lift-option">
              <div>
                <span>{index === 0 ? "Primary" : "Alternative"}</span>
                <strong>{suggestion.selectionLabel}</strong>
                <span>{suggestion.focusGroups.join(" + ")} · {suggestion.movementPattern.replace(/-/g, " ")}</span>
                <p>{suggestion.reason}</p>
                <p>About {suggestion.estimatedMinutes} minutes for {suggestion.proposedSets} planned set{suggestion.proposedSets === 1 ? "" : "s"}. Planning estimate only.</p>
                <p className="helper-copy">
                  {suggestion.lastCompletedOn
                    ? `Last comparable completed session: ${suggestion.lastCompletedOn}. No load is copied automatically.`
                    : "No comparable completed history. No load is suggested."}
                </p>
              </div>
              <button type="button" className="button-secondary compact-button" onClick={() => onAddSuggestion(suggestion)}>
                Add as planned
              </button>
            </article>
          ))}
        </div>
      )}
      <p className="helper-copy workout-planning-disclosure">
        Planning estimate only: 1 minute to transition plus 2.5 minutes per planned set. Ranking uses only explicitly completed, valid sets and trusted catalog metadata.
      </p>
    </details>
  );
}
