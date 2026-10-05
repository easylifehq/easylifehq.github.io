import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import {
  defaultWorkoutExercises,
  useEasyWorkout,
} from "@/features/easyworkout/EasyWorkoutContext";
import type { WorkoutDraftExerciseType } from "@/features/easyworkout/domain/workoutDraftLifecycle";
import {
  WORKOUT_EQUIPMENT_KINDS,
  WORKOUT_FOCUS_GROUPS,
  WORKOUT_MOVEMENT_PATTERNS,
  normalizeWorkoutExercisePlanningMetadata,
  type WorkoutEquipmentKind,
  type WorkoutFocusGroup,
  type WorkoutMovementPattern,
} from "@/features/easyworkout/domain/workoutPlanning";
import type { RoutineExerciseDraft } from "@/lib/firestore/workoutRoutines";

const emptyRoutineExercise = (): RoutineExerciseDraft => ({
  exerciseId: null,
  exerciseName: "",
  muscleGroup: "",
  targetSets: 3,
  targetReps: "8-12",
  targetWeight: null,
  restSeconds: 90,
  notes: "",
});

type ExercisePlanningFieldsProps = {
  exerciseType: WorkoutDraftExerciseType;
  focusGroups: WorkoutFocusGroup[];
  movementPattern: WorkoutMovementPattern | "";
  requiredEquipment: WorkoutEquipmentKind[];
  onExerciseTypeChange: (value: WorkoutDraftExerciseType) => void;
  onFocusGroupsChange: (value: WorkoutFocusGroup[]) => void;
  onMovementPatternChange: (value: WorkoutMovementPattern | "") => void;
  onRequiredEquipmentChange: (value: WorkoutEquipmentKind[]) => void;
};

function ExercisePlanningFields(props: ExercisePlanningFieldsProps) {
  return (
    <details className="field-stack-wide workout-catalog-planning">
      <summary>Planning classification</summary>
      <p className="helper-copy">Optional. Suggestions use this only when focus, movement, and equipment are all classified.</p>
      <label className="field-stack">
        <span>Exercise type</span>
        <select value={props.exerciseType} onChange={(event) => props.onExerciseTypeChange(event.target.value as WorkoutDraftExerciseType)}>
          <option value="weighted">Weighted</option>
          <option value="bodyweight">Bodyweight</option>
          <option value="assisted">Assisted</option>
          <option value="duration">Duration (not suggested)</option>
          <option value="distance">Distance (not suggested)</option>
        </select>
      </label>
      <fieldset>
        <legend>Planning focus</legend>
        <div className="workout-planning-choices">
          {WORKOUT_FOCUS_GROUPS.map((focusGroup) => (
            <label key={focusGroup} className="workout-planning-choice">
              <input
                type="checkbox"
                checked={props.focusGroups.includes(focusGroup)}
                onChange={(event) => props.onFocusGroupsChange(event.target.checked
                  ? [...props.focusGroups, focusGroup].slice(0, 4)
                  : props.focusGroups.filter((entry) => entry !== focusGroup))}
              />
              <span>{focusGroup}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="field-stack">
        <span>Movement pattern</span>
        <select value={props.movementPattern} onChange={(event) => props.onMovementPatternChange(event.target.value as WorkoutMovementPattern | "")}>
          <option value="">Unclassified</option>
          {WORKOUT_MOVEMENT_PATTERNS.map((pattern) => (
            <option key={pattern} value={pattern}>{pattern.replace(/-/g, " ")}</option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend>Required equipment</legend>
        <div className="workout-planning-choices">
          {WORKOUT_EQUIPMENT_KINDS.map((equipment) => (
            <label key={equipment} className="workout-planning-choice">
              <input
                type="checkbox"
                checked={props.requiredEquipment.includes(equipment)}
                onChange={(event) => props.onRequiredEquipmentChange(event.target.checked
                  ? [...props.requiredEquipment, equipment]
                  : props.requiredEquipment.filter((entry) => entry !== equipment))}
              />
              <span>{equipment.replace(/-/g, " ")}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </details>
  );
}

export function EasyWorkoutRoutinesPage() {
  const {
    exercises,
    routines,
    addExercise,
    saveExercise,
    deleteExercise,
    addRoutine,
    saveRoutine,
    deleteRoutine,
    error,
  } = useEasyWorkout();
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseGroup, setExerciseGroup] = useState("");
  const [exerciseNotes, setExerciseNotes] = useState("");
  const [exerciseType, setExerciseType] = useState<WorkoutDraftExerciseType>("weighted");
  const [exerciseFocusGroups, setExerciseFocusGroups] = useState<WorkoutFocusGroup[]>([]);
  const [exerciseMovementPattern, setExerciseMovementPattern] = useState<WorkoutMovementPattern | "">("");
  const [exerciseRequiredEquipment, setExerciseRequiredEquipment] = useState<WorkoutEquipmentKind[]>([]);
  const [editingExerciseId, setEditingExerciseId] = useState("");
  const [editingExerciseName, setEditingExerciseName] = useState("");
  const [editingExerciseGroup, setEditingExerciseGroup] = useState("");
  const [editingExerciseNotes, setEditingExerciseNotes] = useState("");
  const [editingExerciseType, setEditingExerciseType] = useState<WorkoutDraftExerciseType>("weighted");
  const [editingExerciseFocusGroups, setEditingExerciseFocusGroups] = useState<WorkoutFocusGroup[]>([]);
  const [editingExerciseMovementPattern, setEditingExerciseMovementPattern] = useState<WorkoutMovementPattern | "">("");
  const [editingExerciseRequiredEquipment, setEditingExerciseRequiredEquipment] = useState<WorkoutEquipmentKind[]>([]);
  const [routineName, setRoutineName] = useState("");
  const [dayLabel, setDayLabel] = useState("");
  const [routineNotes, setRoutineNotes] = useState("");
  const [routineExercises, setRoutineExercises] = useState<RoutineExerciseDraft[]>([
    emptyRoutineExercise(),
  ]);
  const [editingRoutineId, setEditingRoutineId] = useState("");
  const [editingRoutineName, setEditingRoutineName] = useState("");
  const [editingRoutineDayLabel, setEditingRoutineDayLabel] = useState("");
  const [editingRoutineNotes, setEditingRoutineNotes] = useState("");
  const [editingRoutineExercises, setEditingRoutineExercises] = useState<RoutineExerciseDraft[]>([
    emptyRoutineExercise(),
  ]);

  const allExerciseOptions = useMemo(
    () =>
      [...defaultWorkoutExercises, ...exercises.map((exercise) => ({
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
      }))].filter(
        (exercise, index, array) =>
          array.findIndex((entry) => entry.name === exercise.name) === index
      ),
    [exercises]
  );

  function updateRoutineExercise(index: number, next: Partial<RoutineExerciseDraft>) {
    setRoutineExercises((current) =>
      current.map((exercise, exerciseIndex) =>
        exerciseIndex === index ? { ...exercise, ...next } : exercise
      )
    );
  }

  function updateEditingRoutineExercise(index: number, next: Partial<RoutineExerciseDraft>) {
    setEditingRoutineExercises((current) =>
      current.map((exercise, exerciseIndex) =>
        exerciseIndex === index ? { ...exercise, ...next } : exercise
      )
    );
  }

  async function handleAddExercise(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!exerciseName.trim()) return;
    await addExercise({
      name: exerciseName.trim(),
      muscleGroup: exerciseGroup.trim(),
      notes: exerciseNotes.trim(),
      exerciseType,
      planningMetadata: normalizeWorkoutExercisePlanningMetadata({
        focusGroups: exerciseFocusGroups,
        movementPattern: exerciseMovementPattern,
        requiredEquipment: exerciseRequiredEquipment,
      }),
    });
    setExerciseName("");
    setExerciseGroup("");
    setExerciseNotes("");
    setExerciseType("weighted");
    setExerciseFocusGroups([]);
    setExerciseMovementPattern("");
    setExerciseRequiredEquipment([]);
  }

  function startEditingExercise(exerciseId: string) {
    const exercise = exercises.find((entry) => entry.id === exerciseId);
    if (!exercise) return;
    setEditingExerciseId(exercise.id);
    setEditingExerciseName(exercise.name);
    setEditingExerciseGroup(exercise.muscleGroup);
    setEditingExerciseNotes(exercise.notes);
    setEditingExerciseType(exercise.exerciseType || "weighted");
    setEditingExerciseFocusGroups(exercise.planningMetadata?.focusGroups || []);
    setEditingExerciseMovementPattern(exercise.planningMetadata?.movementPattern || "");
    setEditingExerciseRequiredEquipment(exercise.planningMetadata?.requiredEquipment || []);
  }

  async function handleSaveExercise(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingExerciseId || !editingExerciseName.trim()) return;
    await saveExercise(editingExerciseId, {
      name: editingExerciseName.trim(),
      muscleGroup: editingExerciseGroup.trim(),
      notes: editingExerciseNotes.trim(),
      exerciseType: editingExerciseType,
      planningMetadata: normalizeWorkoutExercisePlanningMetadata({
        focusGroups: editingExerciseFocusGroups,
        movementPattern: editingExerciseMovementPattern,
        requiredEquipment: editingExerciseRequiredEquipment,
      }),
    });
    setEditingExerciseId("");
    setEditingExerciseName("");
    setEditingExerciseGroup("");
    setEditingExerciseNotes("");
    setEditingExerciseType("weighted");
    setEditingExerciseFocusGroups([]);
    setEditingExerciseMovementPattern("");
    setEditingExerciseRequiredEquipment([]);
  }

  async function handleAddRoutine(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!routineName.trim()) return;

    await addRoutine({
      name: routineName.trim(),
      dayLabel: dayLabel.trim(),
      notes: routineNotes.trim(),
      exercises: routineExercises.filter((exercise) => exercise.exerciseName.trim()),
    });

    setRoutineName("");
    setDayLabel("");
    setRoutineNotes("");
    setRoutineExercises([emptyRoutineExercise()]);
  }

  function startEditingRoutine(routineId: string) {
    const routine = routines.find((entry) => entry.id === routineId);
    if (!routine) return;
    setEditingRoutineId(routine.id);
    setEditingRoutineName(routine.name);
    setEditingRoutineDayLabel(routine.dayLabel);
    setEditingRoutineNotes(routine.notes);
    setEditingRoutineExercises(routine.exercises.length ? routine.exercises : [emptyRoutineExercise()]);
  }

  async function handleSaveRoutine(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingRoutineId || !editingRoutineName.trim()) return;
    await saveRoutine(editingRoutineId, {
      name: editingRoutineName.trim(),
      dayLabel: editingRoutineDayLabel.trim(),
      notes: editingRoutineNotes.trim(),
      exercises: editingRoutineExercises.filter((exercise) => exercise.exerciseName.trim()),
    });
    setEditingRoutineId("");
    setEditingRoutineName("");
    setEditingRoutineDayLabel("");
    setEditingRoutineNotes("");
    setEditingRoutineExercises([emptyRoutineExercise()]);
  }

  return (
    <>
      <div className="dashboard-grid">
        <PageSection
          eyebrow="Library"
          title="Custom exercises"
          description="Add anything you do not want to retype forever."
        >
          {error ? <p className="error-copy">{error}</p> : null}
          <form className="task-composer" onSubmit={handleAddExercise}>
            <div className="task-composer-grid">
              <label className="field-stack">
                <span>Exercise</span>
                <input value={exerciseName} onChange={(event) => setExerciseName(event.target.value)} placeholder="Incline dumbbell press" />
              </label>
              <label className="field-stack">
                <span>Muscle group</span>
                <input value={exerciseGroup} onChange={(event) => setExerciseGroup(event.target.value)} placeholder="Chest" />
              </label>
              <label className="field-stack field-stack-wide">
                <span>Notes</span>
                <input value={exerciseNotes} onChange={(event) => setExerciseNotes(event.target.value)} placeholder="Machine setup, cue, range" />
              </label>
              <ExercisePlanningFields
                exerciseType={exerciseType}
                focusGroups={exerciseFocusGroups}
                movementPattern={exerciseMovementPattern}
                requiredEquipment={exerciseRequiredEquipment}
                onExerciseTypeChange={setExerciseType}
                onFocusGroupsChange={setExerciseFocusGroups}
                onMovementPatternChange={setExerciseMovementPattern}
                onRequiredEquipmentChange={setExerciseRequiredEquipment}
              />
            </div>
            <button type="submit" className="primary-button">Save exercise</button>
          </form>
        </PageSection>

        <PageSection
          eyebrow="Template"
          title="Create a routine"
          description="Build a reusable workout day so logging later stays fast."
        >
          <form className="task-composer" onSubmit={handleAddRoutine}>
            <div className="task-composer-grid">
              <label className="field-stack">
                <span>Routine name</span>
                <input value={routineName} onChange={(event) => setRoutineName(event.target.value)} placeholder="Back + Bi" />
              </label>
              <label className="field-stack">
                <span>Day label</span>
                <input value={dayLabel} onChange={(event) => setDayLabel(event.target.value)} placeholder="Monday" />
              </label>
              <label className="field-stack field-stack-wide">
                <span>Notes</span>
                <input value={routineNotes} onChange={(event) => setRoutineNotes(event.target.value)} placeholder="Anything you want to remember before starting" />
              </label>
            </div>

            <div className="task-list-vnext">
              {routineExercises.map((exercise, index) => (
                <div key={`${exercise.exerciseName}-${index}`} className="task-row-card routine-exercise-card">
                  <div className="task-row-grid task-row-grid-routine">
                    <label className="field-stack task-row-field">
                      <span>Exercise</span>
                      <input
                        list="easyworkout-exercises"
                        value={exercise.exerciseName}
                        onChange={(event) => {
                          const match = exercises.find((entry) => entry.name === event.target.value);
                          const builtIn = defaultWorkoutExercises.find((entry) => entry.name === event.target.value);
                          updateRoutineExercise(index, {
                            exerciseName: event.target.value,
                            exerciseId: match?.id || null,
                            muscleGroup: match?.muscleGroup || builtIn?.muscleGroup || exercise.muscleGroup,
                          });
                        }}
                        placeholder="Lat pulldown"
                      />
                    </label>
                    <label className="field-stack task-row-field">
                      <span>Muscle group</span>
                      <input value={exercise.muscleGroup} onChange={(event) => updateRoutineExercise(index, { muscleGroup: event.target.value })} placeholder="Back" />
                    </label>
                    <label className="field-stack task-row-field">
                      <span>Sets</span>
                      <input type="number" min="1" value={exercise.targetSets} onChange={(event) => updateRoutineExercise(index, { targetSets: Number(event.target.value) || 1 })} />
                    </label>
                    <label className="field-stack task-row-field">
                      <span>Reps</span>
                      <input value={exercise.targetReps} onChange={(event) => updateRoutineExercise(index, { targetReps: event.target.value })} placeholder="8-12" />
                    </label>
                    <label className="field-stack task-row-field">
                      <span>Weight</span>
                      <input type="number" min="0" value={exercise.targetWeight ?? ""} onChange={(event) => updateRoutineExercise(index, { targetWeight: event.target.value ? Number(event.target.value) : null })} placeholder="110" />
                    </label>
                    <label className="field-stack task-row-field">
                      <span>Rest sec</span>
                      <input type="number" min="0" value={exercise.restSeconds ?? ""} onChange={(event) => updateRoutineExercise(index, { restSeconds: event.target.value ? Number(event.target.value) : null })} placeholder="90" />
                    </label>
                    <div className="task-row-actions">
                      <button type="button" className="ghost-button" onClick={() => setRoutineExercises((current) => current.length === 1 ? [emptyRoutineExercise()] : current.filter((_, rowIndex) => rowIndex !== index))}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <datalist id="easyworkout-exercises">
              {allExerciseOptions.map((exercise) => (
                <option key={exercise.name} value={exercise.name} />
              ))}
            </datalist>

            <div className="task-composer-actions">
              <button type="button" className="button-secondary" onClick={() => setRoutineExercises((current) => [...current, emptyRoutineExercise()])}>
                Add exercise
              </button>
              <button type="submit" className="primary-button">Save routine</button>
            </div>
          </form>
        </PageSection>
      </div>

      <PageSection
        eyebrow="Ready to use"
        title="Saved routines"
        description="Open one in logging mode so you can see last weights without digging through old tabs."
      >
        <div className="task-list-vnext">
          {routines.length === 0 ? (
            <div className="empty-card-vnext">
              <strong>No routines saved yet</strong>
              <p>Build one repeatable plan so common sessions stay ready to log.</p>
              <span>Fill out the routine form above, then use Save routine.</span>
            </div>
          ) : (
            routines.map((routine) => (
              <article key={routine.id} className="task-card-vnext">
                {editingRoutineId === routine.id ? (
                  <form className="task-card-copy" onSubmit={handleSaveRoutine}>
                    <div className="task-composer-grid">
                      <label className="field-stack">
                        <span>Routine name</span>
                        <input value={editingRoutineName} onChange={(event) => setEditingRoutineName(event.target.value)} />
                      </label>
                      <label className="field-stack">
                        <span>Day label</span>
                        <input value={editingRoutineDayLabel} onChange={(event) => setEditingRoutineDayLabel(event.target.value)} />
                      </label>
                      <label className="field-stack field-stack-wide">
                        <span>Notes</span>
                        <input value={editingRoutineNotes} onChange={(event) => setEditingRoutineNotes(event.target.value)} />
                      </label>
                    </div>
                    <div className="task-list-vnext">
                      {editingRoutineExercises.map((exercise, index) => (
                        <div key={`${routine.id}-edit-${index}`} className="task-row-card routine-exercise-card">
                          <div className="task-row-grid task-row-grid-routine">
                            <label className="field-stack task-row-field">
                              <span>Exercise</span>
                              <input
                                list="easyworkout-exercises"
                                value={exercise.exerciseName}
                                onChange={(event) => {
                                  const match = exercises.find((entry) => entry.name === event.target.value);
                                  const builtIn = defaultWorkoutExercises.find((entry) => entry.name === event.target.value);
                                  updateEditingRoutineExercise(index, {
                                    exerciseName: event.target.value,
                                    exerciseId: match?.id || null,
                                    muscleGroup: match?.muscleGroup || builtIn?.muscleGroup || exercise.muscleGroup,
                                  });
                                }}
                              />
                            </label>
                            <label className="field-stack task-row-field">
                              <span>Muscle group</span>
                              <input value={exercise.muscleGroup} onChange={(event) => updateEditingRoutineExercise(index, { muscleGroup: event.target.value })} />
                            </label>
                            <label className="field-stack task-row-field">
                              <span>Sets</span>
                              <input type="number" min="1" value={exercise.targetSets} onChange={(event) => updateEditingRoutineExercise(index, { targetSets: Number(event.target.value) || 1 })} />
                            </label>
                            <label className="field-stack task-row-field">
                              <span>Reps</span>
                              <input value={exercise.targetReps} onChange={(event) => updateEditingRoutineExercise(index, { targetReps: event.target.value })} />
                            </label>
                            <label className="field-stack task-row-field">
                              <span>Weight</span>
                              <input type="number" min="0" value={exercise.targetWeight ?? ""} onChange={(event) => updateEditingRoutineExercise(index, { targetWeight: event.target.value ? Number(event.target.value) : null })} />
                            </label>
                            <label className="field-stack task-row-field">
                              <span>Rest sec</span>
                              <input type="number" min="0" value={exercise.restSeconds ?? ""} onChange={(event) => updateEditingRoutineExercise(index, { restSeconds: event.target.value ? Number(event.target.value) : null })} />
                            </label>
                            <div className="task-row-actions">
                              <button type="button" className="ghost-button" onClick={() => setEditingRoutineExercises((current) => current.length === 1 ? [emptyRoutineExercise()] : current.filter((_, rowIndex) => rowIndex !== index))}>
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="task-composer-actions">
                      <button type="button" className="button-secondary" onClick={() => setEditingRoutineExercises((current) => [...current, emptyRoutineExercise()])}>
                        Add exercise
                      </button>
                      <button type="button" className="ghost-button" onClick={() => setEditingRoutineId("")}>
                        Cancel
                      </button>
                      <button type="submit" className="primary-button">Save changes</button>
                    </div>
                  </form>
                ) : (
                  <div className="task-card-copy">
                    <div className="task-card-title-row">
                      <h3>{routine.name}</h3>
                    </div>
                    <div className="task-meta-row" aria-label="Routine summary">
                      <span className="task-meta-chip">{routine.dayLabel ? `Day: ${routine.dayLabel}` : "Routine"}</span>
                      <span className="task-meta-chip">
                        Plan: {routine.exercises.length} exercise{routine.exercises.length === 1 ? "" : "s"}
                      </span>
                      {routine.exercises[0]?.exerciseName ? (
                        <span className="task-meta-chip">First: {routine.exercises[0]?.exerciseName}</span>
                      ) : null}
                    </div>
                    {routine.notes ? <small>Notes: {routine.notes}</small> : null}
                  </div>
                )}
                <div className="task-card-actions">
                  <Link to={`/app/easyworkout/log?routineId=${routine.id}`} className="primary-button compact-button">
                    Log
                  </Link>
                  {editingRoutineId === routine.id ? null : (
                    <button type="button" className="button-secondary compact-button" onClick={() => startEditingRoutine(routine.id)}>
                      Edit
                    </button>
                  )}
                  <button type="button" className="ghost-button" onClick={() => void deleteRoutine(routine.id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Custom library"
        title="Saved exercises"
        description="Only custom exercises are listed here. Built-in quick picks stay available automatically."
      >
        <div className="task-list-vnext">
          {exercises.length === 0 ? (
            <div className="empty-card-vnext">No custom exercises yet.</div>
          ) : (
            exercises.map((exercise) => (
              <article key={exercise.id} className="task-card-vnext">
                {editingExerciseId === exercise.id ? (
                  <form className="task-card-copy" onSubmit={handleSaveExercise}>
                    <div className="task-composer-grid">
                      <label className="field-stack">
                        <span>Exercise</span>
                        <input value={editingExerciseName} onChange={(event) => setEditingExerciseName(event.target.value)} />
                      </label>
                      <label className="field-stack">
                        <span>Muscle group</span>
                        <input value={editingExerciseGroup} onChange={(event) => setEditingExerciseGroup(event.target.value)} />
                      </label>
                      <label className="field-stack field-stack-wide">
                        <span>Notes</span>
                        <input value={editingExerciseNotes} onChange={(event) => setEditingExerciseNotes(event.target.value)} />
                      </label>
                      <ExercisePlanningFields
                        exerciseType={editingExerciseType}
                        focusGroups={editingExerciseFocusGroups}
                        movementPattern={editingExerciseMovementPattern}
                        requiredEquipment={editingExerciseRequiredEquipment}
                        onExerciseTypeChange={setEditingExerciseType}
                        onFocusGroupsChange={setEditingExerciseFocusGroups}
                        onMovementPatternChange={setEditingExerciseMovementPattern}
                        onRequiredEquipmentChange={setEditingExerciseRequiredEquipment}
                      />
                    </div>
                    <div className="task-composer-actions">
                      <button type="button" className="ghost-button" onClick={() => setEditingExerciseId("")}>
                        Cancel
                      </button>
                      <button type="submit" className="primary-button">Save changes</button>
                    </div>
                  </form>
                ) : (
                  <div className="task-card-copy">
                    <div className="task-card-title-row">
                      <h3>{exercise.name}</h3>
                      <span className="priority-pill-vnext">{exercise.muscleGroup || "Exercise"}</span>
                    </div>
                    {exercise.notes ? <small>{exercise.notes}</small> : null}
                  </div>
                )}
                <div className="task-card-actions">
                  {editingExerciseId === exercise.id ? null : (
                    <button type="button" className="button-secondary compact-button" onClick={() => startEditingExercise(exercise.id)}>
                      Edit
                    </button>
                  )}
                  <button type="button" className="ghost-button" onClick={() => void deleteExercise(exercise.id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </PageSection>
    </>
  );
}
