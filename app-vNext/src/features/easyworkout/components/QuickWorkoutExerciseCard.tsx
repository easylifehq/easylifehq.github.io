import { useEffect, useRef, useState, type KeyboardEvent, type MutableRefObject } from "react";
import { DecimalLoadInput } from "@/features/easyworkout/components/DecimalLoadInput";
import type { WorkoutExerciseLogDraft, WorkoutSetDraft } from "@/features/easyworkout/domain/workoutDraftLifecycle";
import {
  sanitizeDecimalInput,
  sanitizeWholeNumberInput,
  toDecimalDraft,
  toWholeNumberDraft,
} from "@/features/easyworkout/domain/workoutNumericInput";
import {
  WORKOUT_SETUP_OTHER_MAX_LENGTH,
  WORKOUT_SETUP_SHORT_MAX_LENGTH,
  type WorkoutEquipmentSetup,
} from "@/lib/workoutEquipmentSetup";

export const quickFieldId = (localId: string, field: string) => `quick-workout-${localId}-${field}`;

/** The control a user must change to fix a partial row, by exercise type. */
export function quickFieldForSet(exercise: WorkoutExerciseLogDraft, set: WorkoutSetDraft) {
  if (exercise.exerciseType === "duration") return quickFieldId(set.localId, "duration");
  if (exercise.exerciseType === "distance") return quickFieldId(set.localId, "distance");
  if (exercise.exerciseType === "bodyweight" || set.reps <= 0) return quickFieldId(set.localId, "reps");
  return quickFieldId(set.localId, "load");
}

export type QuickWorkoutLastTime = {
  performedOn: string;
  setsLabel: string;
  setupLabel: string;
  bestWeight: number;
  currentHasSetup: boolean;
};

type QuickWorkoutExerciseCardProps = {
  exercise: WorkoutExerciseLogDraft;
  exerciseIndex: number;
  isActive: boolean;
  isDone: boolean;
  weightUnit: "lb" | "kg";
  lastTime: QuickWorkoutLastTime | null;
  /** DOM id of the field a blocked Done/save needs the user to fix. */
  invalidFieldId?: string;
  nameInputRef?: MutableRefObject<HTMLInputElement | null>;
  onExerciseNameChange: (value: string) => void;
  onExerciseNotesChange: (value: string) => void;
  onSetEdit: (setLocalId: string, patch: Partial<WorkoutSetDraft>) => void;
  onSetupChange: (field: keyof WorkoutEquipmentSetup, value: string) => void;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onUseLast: (mode: "sets" | "setup" | "both") => void;
  onDone: () => void;
  onUndoDone: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

const SETUP_FIELDS = [
  { field: "seat", title: "Seat", aria: "seat setting" },
  { field: "arm", title: "Arm", aria: "arm setting" },
  { field: "back", title: "Back", aria: "back setting" },
  { field: "pad", title: "Pad", aria: "pad setting" },
] as const;

const selectInput = (input: HTMLInputElement) => window.requestAnimationFrame(() => input.select());

export function QuickWorkoutExerciseCard({
  exercise,
  exerciseIndex,
  isActive,
  isDone,
  weightUnit,
  lastTime,
  invalidFieldId,
  nameInputRef,
  onExerciseNameChange,
  onExerciseNotesChange,
  onSetEdit,
  onSetupChange,
  onAddSet,
  onRemoveSet,
  onUseLast,
  onDone,
  onUndoDone,
  onEdit,
  onDelete,
}: QuickWorkoutExerciseCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const deleteTriggerRef = useRef<HTMLButtonElement | null>(null);
  const label = exercise.exerciseName.trim() || `Exercise ${exerciseIndex + 1}`;
  const type = exercise.exerciseType;
  const showReps = type !== "duration" && type !== "distance";
  const showLoad = type === "weighted" || type === "assisted";

  useEffect(() => {
    if (confirmingDelete) cancelButtonRef.current?.focus();
  }, [confirmingDelete]);

  function cancelDelete() {
    setConfirmingDelete(false);
    deleteTriggerRef.current?.focus();
  }

  function handleConfirmKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    cancelDelete();
  }

  if (!isActive) {
    const doneRows = exercise.sets.filter((set) => set.completed && !set.deleted);
    const lastRow = doneRows[doneRows.length - 1];
    return (
      <article className="panel-section quick-workout-card quick-workout-card-collapsed" data-done={isDone ? "true" : "false"}>
        <div className="quick-workout-summary">
          <div>
            <span className="quick-workout-index">Exercise {exerciseIndex + 1}</span>
            <strong>{exercise.exerciseName.trim() || "Empty exercise"}</strong>
            <small>
              {isDone
                ? `${doneRows.length} set${doneRows.length === 1 ? "" : "s"} done${lastRow && showLoad ? ` · ${lastRow.weight} ${weightUnit} × ${lastRow.reps}` : ""}`
                : "Not done yet"}
            </small>
          </div>
          <div className="quick-workout-summary-actions">
            <button type="button" className="ghost-button compact-button" onClick={onEdit} aria-label={`Edit ${label}`}>
              Edit
            </button>
            {isDone ? (
              <button type="button" className="ghost-button compact-button" onClick={onUndoDone} aria-label={`Undo done for ${label}`}>
                Undo done
              </button>
            ) : null}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="panel-section quick-workout-card" data-done={isDone ? "true" : "false"}>
      <div className="quick-workout-header">
        <label className="field-stack quick-workout-name">
          <span className="quick-workout-index">Exercise {exerciseIndex + 1}</span>
          <input
            id={quickFieldId(exercise.localId, "name")}
            ref={nameInputRef}
            list="workout-log-exercise-options"
            autoComplete="off"
            aria-label={`Exercise ${exerciseIndex + 1} name`}
            value={exercise.exerciseName}
            onChange={(event) => onExerciseNameChange(event.target.value)}
            placeholder="Lat pulldown"
          />
        </label>
        {lastTime ? (
          <button
            type="button"
            className="ghost-button compact-button quick-workout-last"
            title={`Last completed on ${lastTime.performedOn}: ${lastTime.setsLabel}${lastTime.setupLabel ? ` · ${lastTime.setupLabel}` : ""}`}
            onClick={() => onUseLast(lastTime.setupLabel && !lastTime.currentHasSetup ? "both" : "sets")}
          >
            {lastTime.setupLabel && !lastTime.currentHasSetup ? "Use last sets & setup" : "Use last sets"}
          </button>
        ) : null}
        <button
          ref={deleteTriggerRef}
          type="button"
          className="quick-workout-icon-button"
          aria-label={`Delete exercise ${label}`}
          aria-expanded={confirmingDelete}
          onClick={() => setConfirmingDelete(true)}
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>

      {confirmingDelete ? (
        <div className="quick-workout-confirm" role="group" aria-label={`Confirm deleting ${label}`} onKeyDown={handleConfirmKeyDown}>
          <p>Delete {label} and its sets?</p>
          <div className="pill-row">
            <button ref={cancelButtonRef} type="button" className="ghost-button compact-button" onClick={cancelDelete}>
              Cancel
            </button>
            <button type="button" className="danger-button compact-button" onClick={onDelete}>
              Delete exercise
            </button>
          </div>
        </div>
      ) : null}

      <div className="quick-workout-set-head" aria-hidden="true">
        <span>#</span>
        <span>{showReps ? "Reps" : type === "duration" ? "Sec" : "Meters"}</span>
        <span>{showLoad ? (type === "assisted" ? `Assist ${weightUnit}` : weightUnit) : ""}</span>
        <span>Type</span>
        <span />
      </div>
      <div className="quick-workout-sets">
        {exercise.sets.map((set, setIndex) => (
          <div key={set.localId} className="quick-workout-set-row" role="group" aria-label={`${label} set ${setIndex + 1}`}>
            <span className="quick-workout-set-number">
              {setIndex + 1}
              {lastTime && showLoad && set.weight > lastTime.bestWeight ? <span className="workout-pr-chip">PR</span> : null}
            </span>
            {showReps ? (
              <input
                id={quickFieldId(set.localId, "reps")}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                enterKeyHint="next"
                autoComplete="off"
                aria-label={`${label} set ${setIndex + 1} reps`}
                aria-invalid={invalidFieldId === quickFieldId(set.localId, "reps") || undefined}
                value={set.reps || ""}
                placeholder="8"
                onFocus={(event) => selectInput(event.currentTarget)}
                onClick={(event) => selectInput(event.currentTarget)}
                onMouseUp={(event) => event.preventDefault()}
                onChange={(event) => onSetEdit(set.localId, { reps: toWholeNumberDraft(sanitizeWholeNumberInput(event.target.value)) })}
              />
            ) : type === "duration" ? (
              <input
                id={quickFieldId(set.localId, "duration")}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                aria-label={`${label} set ${setIndex + 1} duration in seconds`}
                aria-invalid={invalidFieldId === quickFieldId(set.localId, "duration") || undefined}
                value={set.durationSeconds || ""}
                placeholder="60"
                onFocus={(event) => selectInput(event.currentTarget)}
                onChange={(event) => onSetEdit(set.localId, { durationSeconds: toWholeNumberDraft(sanitizeWholeNumberInput(event.target.value)) })}
              />
            ) : (
              <input
                id={quickFieldId(set.localId, "distance")}
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.]?[0-9]*"
                autoComplete="off"
                aria-label={`${label} set ${setIndex + 1} distance in meters`}
                aria-invalid={invalidFieldId === quickFieldId(set.localId, "distance") || undefined}
                value={set.distanceMeters || ""}
                placeholder="400"
                onFocus={(event) => selectInput(event.currentTarget)}
                onChange={(event) => onSetEdit(set.localId, { distanceMeters: toDecimalDraft(sanitizeDecimalInput(event.target.value)) })}
              />
            )}
            {showLoad ? (
              <DecimalLoadInput
                id={quickFieldId(set.localId, "load")}
                enterKeyHint="next"
                autoComplete="off"
                aria-label={`${label} set ${setIndex + 1} ${type === "assisted" ? "assistance" : "load"} in ${weightUnit}`}
                aria-invalid={invalidFieldId === quickFieldId(set.localId, "load") || undefined}
                value={set.weight}
                placeholder="135"
                onFocus={(event) => selectInput(event.currentTarget)}
                onClick={(event) => selectInput(event.currentTarget)}
                onMouseUp={(event) => event.preventDefault()}
                onValueChange={(weight) => onSetEdit(set.localId, { weight })}
              />
            ) : (
              <span />
            )}
            <select
              value={set.setType}
              aria-label={`${label} set ${setIndex + 1} type`}
              onChange={(event) => onSetEdit(set.localId, { setType: event.target.value as WorkoutSetDraft["setType"] })}
            >
              <option value="warmup">Warm-up</option>
              <option value="standard">Working</option>
              <option value="drop">Drop</option>
              <option value="failure">Failure</option>
            </select>
            <button
              type="button"
              className="quick-workout-icon-button"
              onClick={() => onRemoveSet(setIndex)}
              aria-label={`Remove set ${setIndex + 1}`}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        ))}
      </div>

      <details className="quick-workout-more">
        <summary>More setup</summary>
        <div className="quick-workout-more-grid">
          <label className="field-stack quick-workout-wide">
            <span>Exercise notes</span>
            <input value={exercise.notes} onChange={(event) => onExerciseNotesChange(event.target.value)} placeholder="Vertical grip, slow eccentric, machine 4, etc." />
          </label>
          {SETUP_FIELDS.map(({ field, title, aria }) => (
            <label key={field} className="field-stack">
              <span>{title}</span>
              <input
                aria-label={`${label} ${aria}`}
                value={exercise.setup[field] || ""}
                maxLength={WORKOUT_SETUP_SHORT_MAX_LENGTH}
                onChange={(event) => onSetupChange(field, event.target.value)}
              />
            </label>
          ))}
          <label className="field-stack quick-workout-wide">
            <span>Other setup</span>
            <input
              aria-label={`${label} other setup`}
              value={exercise.setup.other || ""}
              maxLength={WORKOUT_SETUP_OTHER_MAX_LENGTH}
              onChange={(event) => onSetupChange("other", event.target.value)}
              placeholder="Left tower, neutral handles"
            />
          </label>
          {lastTime?.setupLabel && lastTime.currentHasSetup ? (
            <button type="button" className="button-secondary compact-button" onClick={() => onUseLast("setup")}>
              Use last setup
            </button>
          ) : null}
          {exercise.sets.map((set, setIndex) => (
            <label key={set.localId} className="field-stack quick-workout-wide">
              <span>Set {setIndex + 1} notes</span>
              <input value={set.notes} onChange={(event) => onSetEdit(set.localId, { notes: event.target.value })} placeholder="Pause, drop set, etc." />
            </label>
          ))}
        </div>
      </details>

      <div className="quick-workout-actions">
        <button type="button" className="button-secondary compact-button" onClick={onAddSet}>
          + Set
        </button>
        <button type="button" className="primary-button" onClick={onDone}>
          Done &amp; next exercise
        </button>
      </div>
    </article>
  );
}
