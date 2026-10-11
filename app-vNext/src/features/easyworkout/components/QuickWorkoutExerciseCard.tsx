import { PEC_FLY_VARIANTS, workoutLoadLabel, type WorkoutLoadMode } from "@/features/easyworkout/domain/workoutLoadMode";
import { formatWorkoutExerciseName } from "@/features/easyworkout/domain/workoutEntryHelpers";
import { completedWorkoutRows } from "@/features/easyworkout/domain/workoutCompletedRows";
import { useEffect, useRef, useState, type KeyboardEvent, type MutableRefObject } from "react";
import { DecimalLoadInput } from "@/features/easyworkout/components/DecimalLoadInput";
import type { WorkoutExerciseLogDraft, WorkoutSetDraft } from "@/features/easyworkout/domain/workoutDraftLifecycle";
import { isEmptySetRow } from "@/features/easyworkout/domain/workoutExerciseCompletion";
import { isValidWorkingSet } from "@/features/easyworkout/domain/workoutStatistics";
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

/** Verified prior performed working sets, already in the draft's weight unit. Reference only. */
export type QuickWorkoutPreviousSet = {
  reps: number;
  weight: number;
  durationSeconds?: number;
  distanceMeters?: number;
};

export type QuickWorkoutLastTime = {
  performedOn: string;
  setsLabel: string;
  /** Prior working sets used only for the per-row reference hints. */
  sets?: QuickWorkoutPreviousSet[];
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
  quickNoteChoices?: string[];
  /** DOM id of the field a blocked Done/save needs the user to fix. */
  invalidFieldId?: string;
  nameInputRef?: MutableRefObject<HTMLInputElement | null>;
  onExerciseTypeChange: (type: WorkoutExerciseLogDraft["exerciseType"]) => void;
  onLoadModeChange: (mode: WorkoutLoadMode | undefined) => void;
  onExerciseNameChange: (value: string) => void;
  onExerciseNameBlur: (value: string) => void;
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

/**
 * Counts rows distinctly: valid working sets, valid warm-ups, and incomplete rows that still hold
 * a value. Blank (including trailing blank) and deleted rows are excluded. Nothing is discarded.
 */
export function countQuickWorkoutSets(exercise: WorkoutExerciseLogDraft) {
  let working = 0;
  let warmups = 0;
  let incomplete = 0;
  for (const set of exercise.sets) {
    if (set.deleted || isEmptySetRow(set)) continue;
    if (isValidWorkingSet({ ...set, setType: "standard", completed: true }, exercise.exerciseType)) {
      if (set.setType === "warmup") warmups += 1;
      else working += 1;
    } else {
      incomplete += 1;
    }
  }
  return { working, warmups, incomplete };
}

function previousSetHint(set: QuickWorkoutPreviousSet, type: WorkoutExerciseLogDraft["exerciseType"], weightUnit: "lb" | "kg") {
  if (type === "bodyweight") return `${set.reps} reps${set.weight > 0 ? ` + ${set.weight} ${weightUnit} added` : ""}`;
  if (type === "duration") return `${set.durationSeconds || 0} sec`;
  if (type === "distance") return `${set.distanceMeters || 0} m`;
  return `${set.reps} × ${set.weight.toFixed(1)} ${weightUnit}`;
}

const selectInput = (input: HTMLInputElement) => window.requestAnimationFrame(() => input.select());

export function QuickWorkoutExerciseCard({
  exercise,
  exerciseIndex,
  isActive,
  isDone,
  weightUnit,
  lastTime,
  quickNoteChoices = [],
  invalidFieldId,
  nameInputRef,
  onExerciseTypeChange,
  onLoadModeChange,
  onExerciseNameChange,
  onExerciseNameBlur,
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
  const confirmDialogRef = useRef<HTMLDialogElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const deleteTriggerRef = useRef<HTMLButtonElement | null>(null);
  const label = exercise.exerciseName.trim() || `Exercise ${exerciseIndex + 1}`;
  const type = exercise.exerciseType;
  const showReps = type !== "duration" && type !== "distance";
  const showLoad = type === "weighted" || type === "assisted" || type === "bodyweight";
  const counts = countQuickWorkoutSets(exercise);

  useEffect(() => {
    if (confirmingDelete) { confirmDialogRef.current?.showModal(); cancelButtonRef.current?.focus(); }
  }, [confirmingDelete]);

  function cancelDelete() {
    confirmDialogRef.current?.close();
    setConfirmingDelete(false);
    deleteTriggerRef.current?.focus();
  }

  function handleConfirmKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    cancelDelete();
  }

  if (!isActive) {
    const doneRows = completedWorkoutRows(exercise);
    const completedWarmups = doneRows.filter(set => set.setType === "warmup").length;
    const enteredWarmups = Math.max(0, counts.warmups - completedWarmups);
    const lastRow = doneRows[doneRows.length - 1];
    return (
      <article className="panel-section quick-workout-card quick-workout-card-collapsed" data-done={isDone ? "true" : "false"}>
        <div className="quick-workout-summary">
          <div>
            <span className="quick-workout-index">Exercise {exerciseIndex + 1}</span>
            <strong>{exercise.exerciseName.trim() || "Empty exercise"}</strong>
            <small>
              {isDone
                ? `${doneRows.length} set${doneRows.length === 1 ? "" : "s"} done${completedWarmups ? ` (including ${completedWarmups} completed warm-ups)` : ""}${enteredWarmups ? ` + ${enteredWarmups} warm-ups entered (not marked done)` : ""}${lastRow && showReps ? `; Last set: ${lastRow.reps} reps${showLoad ? ` x ${lastRow.weight} ${weightUnit}${type === "bodyweight" ? " added" : exercise.loadMode ? ` ${workoutLoadLabel(exercise.loadMode)}` : ""}` : ""}` : ""}`
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
        <span className="quick-workout-index">Exercise {exerciseIndex + 1}</span>
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

      </div>

      <div className="quick-workout-identity">
        <label className="field-stack quick-workout-name">
          <span>Exercise</span>
          <input
            id={quickFieldId(exercise.localId, "name")}
            ref={nameInputRef}
            list="workout-log-exercise-options"
            autoComplete="off"
            aria-label={`Exercise ${exerciseIndex + 1} name`}
            value={exercise.exerciseName}
            onChange={(event) => onExerciseNameChange(event.target.value)}
            onBlur={(event) => { const formatted = formatWorkoutExerciseName(event.currentTarget.value); if (formatted !== event.currentTarget.value) onExerciseNameBlur(formatted); }}
            placeholder="Lat pulldown"
          />
        </label>
        <label className="field-stack quick-workout-quick-note">
          <span>Quick note</span>
          <input
            list={"quick-workout-notes-" + exercise.localId}
            aria-label={`Exercise ${exerciseIndex + 1} quick note`}
            autoComplete="off"
            value={exercise.notes}
            onChange={(event) => onExerciseNotesChange(event.target.value)}
            placeholder="Grip, tempo, machine"
          />
        </label>
      </div>

      <datalist id={"quick-workout-notes-" + exercise.localId}>{quickNoteChoices.map(note => <option key={note} value={note} />)}</datalist>

      {confirmingDelete ? (
        <dialog ref={confirmDialogRef} className="quick-workout-confirm" aria-label={`Confirm deleting ${label}`} onCancel={event => { event.preventDefault(); cancelDelete(); }} onKeyDown={handleConfirmKeyDown}>
          <p>Delete {label} and its sets?</p>
          <div className="pill-row">
            <button ref={cancelButtonRef} type="button" className="ghost-button compact-button" onClick={cancelDelete}>
              Cancel
            </button>
            <button type="button" className="danger-button compact-button" onClick={onDelete}>
              Delete exercise
            </button>
          </div>
        </dialog>
      ) : null}

      {(type === "weighted" && /pull.?ups?|chin.?ups?|push.?ups?|dips?/i.test(exercise.exerciseName)) ? <button type="button" className="ghost-button compact-button quick-workout-bodyweight-choice" onClick={() => onExerciseTypeChange("bodyweight")}>Bodyweight (no load)</button> : null}
      {type === "bodyweight" ? <small className="quick-workout-bodyweight-label">Bodyweight · added load optional</small> : null}
      <div className="quick-workout-set-head" aria-hidden="true">
        <span>#</span>
        <span>{showReps ? "Reps" : type === "duration" ? "Sec" : "Meters"}</span>
        <span>{showLoad ? (type === "assisted" ? `Assist ${weightUnit}` : weightUnit + (exercise.loadMode ? " " + workoutLoadLabel(exercise.loadMode) : "")) : ""}</span>
        <span>Type</span>
        <span />
      </div>
      <div className="quick-workout-sets">
        {exercise.sets.map((set, setIndex) => {
          const workingOrdinal = exercise.sets.slice(0, setIndex).filter((entry) => !entry.deleted && entry.setType !== "warmup").length;
          const previousSet = set.setType === "warmup" ? undefined : lastTime?.sets?.[workingOrdinal];
          return (
          <div key={set.localId} className="quick-workout-set-row" role="group" aria-label={`${label} set ${setIndex + 1}`}>
            <span className="quick-workout-set-number">
              {setIndex + 1}
              {lastTime && showLoad && type !== "bodyweight" && set.weight > lastTime.bestWeight ? <span className="workout-pr-chip">PR</span> : null}
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
                aria-label={`${label} set ${setIndex + 1} ${type === "assisted" ? "assistance" : type === "bodyweight" ? "optional added load" : "load"} in ${weightUnit}`}
                aria-invalid={invalidFieldId === quickFieldId(set.localId, "load") || undefined}
                value={set.weight}
                placeholder={type === "bodyweight" ? "0 optional" : "135"}
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
            {previousSet ? (
              <span className="quick-workout-set-hint" data-reference-only="true">
                Previous: {previousSetHint(previousSet, type, weightUnit)}
              </span>
            ) : null}
          </div>
          );
        })}
      </div>

      <p
        className="quick-workout-counts"
        title="Only valid working sets count as working sets. Warm-ups are counted separately; incomplete rows keep their values but are not counted."
      >
        <span>Working sets: {counts.working}</span>
        <span>Warm-ups: {counts.warmups}</span>
        {counts.incomplete ? <span>Incomplete: {counts.incomplete}</span> : null}
      </p>

      <div className="quick-workout-detail-controls">
      {showLoad && type !== "bodyweight" ? <label className="quick-workout-each-hand" title={exercise.loadMode ? "Off: total weight. On: weight in each hand." : "Original load convention is unspecified. Choose a mode explicitly; stored numbers will not be converted."}>
        <input type="checkbox" aria-label={label + " each hand"} aria-checked={!exercise.loadMode ? "mixed" : exercise.loadMode === "per-hand"} checked={exercise.loadMode === "per-hand"} ref={input => { if (input) input.indeterminate = !exercise.loadMode; }} onChange={event => onLoadModeChange(event.target.checked ? "per-hand" : "total")} />
        <span>Each hand</span>
      </label> : null}
      <details className="quick-workout-more">
        <summary title="Machine setup, full exercise notes and individual set notes">Exercise details</summary>
        <div className="quick-workout-more-grid">
      <label className="field-stack"><span>Exercise type</span><select aria-label={label + " exercise type"} value={type} onChange={event => onExerciseTypeChange(event.target.value as WorkoutExerciseLogDraft["exerciseType"])}>
        <option value="weighted">Weight + reps</option><option value="bodyweight">Bodyweight (+ optional added weight)</option><option value="assisted">Assisted</option><option value="duration">Timed</option><option value="distance">Distance</option>
      </select></label>
      {/pec.*fl[yi]|pec deck/i.test(exercise.exerciseName) ? (
        <label className="field-stack">
          <span>Pec fly variant</span>
          <select aria-label={label + " variant"} value={PEC_FLY_VARIANTS.find((name) => name.toLowerCase() === exercise.exerciseName.trim().toLowerCase()) || ""} onChange={(event) => { if (event.target.value) onExerciseNameChange(event.target.value); }}>
            <option value="">Choose variant</option>
            {PEC_FLY_VARIANTS.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>
      ) : null}


          {!exercise.loadMode && showLoad && type !== "bodyweight" ? <small>Original load convention is unspecified. Changing Each hand selects an explicit mode without converting the stored numbers.</small> : null}

          <label className="field-stack quick-workout-wide">
            <span>Exercise notes</span>
            <textarea
              rows={2}
              value={exercise.notes}
              onChange={(event) => onExerciseNotesChange(event.target.value)}
              placeholder="Vertical grip, slow eccentric, machine 4, etc."
            />
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
      </div>

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
