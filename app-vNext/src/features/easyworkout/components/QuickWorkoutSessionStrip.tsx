import { WORKOUT_FOCUS_GROUPS, type WorkoutFocusGroup } from "@/features/easyworkout/domain/workoutPlanning";

type QuickWorkoutSessionStripProps = {
  performedOn: string;
  onPerformedOnChange: (value: string) => void;
  focusGroups: WorkoutFocusGroup[];
  onFocusGroupsChange: (groups: WorkoutFocusGroup[]) => void;
  sessionNotes: string;
  onSessionNotesChange: (value: string) => void;
};

export function QuickWorkoutSessionStrip({
  performedOn,
  onPerformedOnChange,
  focusGroups,
  onFocusGroupsChange,
  sessionNotes,
  onSessionNotesChange,
}: QuickWorkoutSessionStripProps) {
  const focusLabel = focusGroups.length ? focusGroups.join(" + ") : "Any";
  return (
    <div className="workout-session-strip">
      <label className="field-stack workout-strip-date">
        <span>Date</span>
        <input type="date" value={performedOn} onChange={(event) => onPerformedOnChange(event.target.value)} />
      </label>
      <details className="workout-strip-focus">
        <summary>
          <span>Focus:</span> <strong>{focusLabel}</strong>
        </summary>
        <fieldset>
          <legend>Session focus (up to 4)</legend>
          <div className="workout-planning-choices">
            {WORKOUT_FOCUS_GROUPS.map((focusGroup) => (
              <label key={focusGroup} className="workout-planning-choice">
                <input
                  type="checkbox"
                  checked={focusGroups.includes(focusGroup)}
                  onChange={(event) =>
                    onFocusGroupsChange(
                      event.target.checked
                        ? [...focusGroups, focusGroup].slice(0, 4)
                        : focusGroups.filter((entry) => entry !== focusGroup)
                    )
                  }
                />
                <span>{focusGroup}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </details>
      <label className="field-stack workout-strip-notes">
        <span>Session notes</span>
        <input value={sessionNotes} onChange={(event) => onSessionNotesChange(event.target.value)} placeholder="Energy, pump, machine setup, etc." />
      </label>
    </div>
  );
}
