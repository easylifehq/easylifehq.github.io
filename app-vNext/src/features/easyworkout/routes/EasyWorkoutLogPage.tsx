import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { defaultWorkoutExercises, useEasyWorkout } from "@/features/easyworkout/EasyWorkoutContext";
import type { WorkoutExerciseLogRecord, WorkoutSetRecord } from "@/lib/firestore/workoutSessions";

const emptySet = (): WorkoutSetRecord => ({ reps: 8, weight: 0, notes: "" });
const emptyExerciseLog = (): WorkoutExerciseLogRecord => ({
  exerciseId: null,
  exerciseName: "",
  muscleGroup: "",
  notes: "",
  sets: [emptySet()],
});

export function EasyWorkoutLogPage() {
  const [searchParams] = useSearchParams();
  const routineId = searchParams.get("routineId");
  const { routines, exercises, sessions, addSession, error } = useEasyWorkout();
  const [selectedRoutineId, setSelectedRoutineId] = useState(routineId || "");
  const [performedOn, setPerformedOn] = useState(new Date().toISOString().split("T")[0]);
  const [durationMinutes, setDurationMinutes] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [exerciseLogs, setExerciseLogs] = useState<WorkoutExerciseLogRecord[]>([emptyExerciseLog()]);
  const [saveMessage, setSaveMessage] = useState("");

  const selectedRoutine = useMemo(
    () => routines.find((routine) => routine.id === selectedRoutineId) || null,
    [routines, selectedRoutineId]
  );

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

  useEffect(() => {
    if (!selectedRoutine) {
      setExerciseLogs([emptyExerciseLog()]);
      return;
    }

    setExerciseLogs(
      selectedRoutine.exercises.length
        ? selectedRoutine.exercises.map((exercise) => ({
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
            muscleGroup: exercise.muscleGroup,
            notes: exercise.notes,
            sets: Array.from({ length: Math.max(exercise.targetSets, 1) }, () => ({
              reps: Number(exercise.targetReps.split("-")[0]) || 8,
              weight: exercise.targetWeight || 0,
              notes: "",
            })),
          }))
        : [emptyExerciseLog()]
    );
  }, [selectedRoutine]);

  const previousByExercise = useMemo(
    () =>
      sessions.reduce<Record<string, { weight: number; reps: number; performedOn: string }>>(
        (accumulator, session) => {
          session.exercises.forEach((exercise) => {
            exercise.sets.forEach((set) => {
              const current = accumulator[exercise.exerciseName];
              if (!current && set.weight > 0) {
                accumulator[exercise.exerciseName] = {
                  weight: set.weight,
                  reps: set.reps,
                  performedOn: session.performedOn,
                };
              }
            });
          });
          return accumulator;
        },
        {}
      ),
    [sessions]
  );

  function updateExerciseLog(index: number, next: Partial<WorkoutExerciseLogRecord>) {
    setExerciseLogs((current) =>
      current.map((exercise, exerciseIndex) =>
        exerciseIndex === index ? { ...exercise, ...next } : exercise
      )
    );
  }

  function updateSet(exerciseIndex: number, setIndex: number, next: Partial<WorkoutSetRecord>) {
    setExerciseLogs((current) =>
      current.map((exercise, currentExerciseIndex) =>
        currentExerciseIndex === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.map((set, currentSetIndex) =>
                currentSetIndex === setIndex ? { ...set, ...next } : set
              ),
            }
          : exercise
      )
    );
  }

  async function handleSaveSession(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanedExercises = exerciseLogs
      .filter((exercise) => exercise.exerciseName.trim())
      .map((exercise) => ({
        ...exercise,
        sets: exercise.sets.filter((set) => set.reps > 0 || set.weight > 0),
      }))
      .filter((exercise) => exercise.sets.length);

    if (!cleanedExercises.length) {
      setSaveMessage("Add at least one exercise with one logged set first.");
      return;
    }

    await addSession({
      routineId: selectedRoutine?.id || null,
      routineName: selectedRoutine?.name || "Workout",
      performedOn,
      durationMinutes: durationMinutes ? Number(durationMinutes) : null,
      notes: sessionNotes.trim(),
      exercises: cleanedExercises,
    });

    setSaveMessage("Workout saved.");
    setSessionNotes("");
    setDurationMinutes("");
    if (!selectedRoutine) {
      setExerciseLogs([emptyExerciseLog()]);
    }
  }

  return (
    <PageSection
      eyebrow="Logging mode"
      title="Log workout"
      description="Keep it moving, see the last weight you hit, and save the session without digging through old notes."
    >
      {error ? <p className="error-copy">{error}</p> : null}
      <form className="task-composer" onSubmit={handleSaveSession}>
        <div className="task-composer-grid">
          <label className="field-stack">
            <span>Routine</span>
            <select
              value={selectedRoutineId}
              onChange={(event) => {
                setSelectedRoutineId(event.target.value);
                setSaveMessage("");
              }}
            >
              <option value="">Ad-hoc workout</option>
              {routines.map((routine) => (
                <option key={routine.id} value={routine.id}>
                  {routine.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field-stack">
            <span>Date</span>
            <input type="date" value={performedOn} onChange={(event) => setPerformedOn(event.target.value)} />
          </label>
          <label className="field-stack">
            <span>Duration (min)</span>
            <input type="number" min="0" value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} placeholder="75" />
          </label>
          <label className="field-stack field-stack-wide">
            <span>Session notes</span>
            <input value={sessionNotes} onChange={(event) => setSessionNotes(event.target.value)} placeholder="Energy, pump, machine setup, etc." />
          </label>
        </div>

        <div className="task-list-vnext">
          {exerciseLogs.map((exercise, exerciseIndex) => {
            const previous = previousByExercise[exercise.exerciseName];
            return (
              <article key={`${exercise.exerciseName}-${exerciseIndex}`} className="panel-section">
                <div className="panel-header">
                  <p className="eyebrow">Exercise {exerciseIndex + 1}</p>
                  <h2>{exercise.exerciseName || "Pick a lift"}</h2>
                  <p>
                    {previous
                      ? `Last time: ${previous.weight} lbs x ${previous.reps} on ${previous.performedOn}`
                      : "No logged history yet for this exercise."}
                  </p>
                </div>

                <div className="task-composer-grid">
                  <label className="field-stack">
                    <span>Exercise</span>
                    <input
                      list="easyworkout-log-exercises"
                      value={exercise.exerciseName}
                      onChange={(event) => {
                        const match = exercises.find((entry) => entry.name === event.target.value);
                        const builtIn = defaultWorkoutExercises.find((entry) => entry.name === event.target.value);
                        updateExerciseLog(exerciseIndex, {
                          exerciseName: event.target.value,
                          exerciseId: match?.id || null,
                          muscleGroup: match?.muscleGroup || builtIn?.muscleGroup || exercise.muscleGroup,
                        });
                      }}
                      placeholder="Lat pulldown"
                    />
                  </label>
                  <label className="field-stack">
                    <span>Muscle group</span>
                    <input value={exercise.muscleGroup} onChange={(event) => updateExerciseLog(exerciseIndex, { muscleGroup: event.target.value })} placeholder="Back" />
                  </label>
                </div>

                <div className="task-list-vnext">
                  {exercise.sets.map((set, setIndex) => (
                    <div key={`${exercise.exerciseName}-${setIndex}`} className="task-row-card">
                      <div className="task-row-grid task-row-grid-workout">
                        <label className="field-stack task-row-field">
                          <span>Set</span>
                          <input value={setIndex + 1} readOnly />
                        </label>
                        <label className="field-stack task-row-field">
                          <span>Reps</span>
                          <input type="number" min="0" value={set.reps} onChange={(event) => updateSet(exerciseIndex, setIndex, { reps: Number(event.target.value) || 0 })} />
                        </label>
                        <label className="field-stack task-row-field">
                          <span>Weight</span>
                          <input type="number" min="0" value={set.weight} onChange={(event) => updateSet(exerciseIndex, setIndex, { weight: Number(event.target.value) || 0 })} />
                        </label>
                        <label className="field-stack task-row-field">
                          <span>Notes</span>
                          <input value={set.notes} onChange={(event) => updateSet(exerciseIndex, setIndex, { notes: event.target.value })} placeholder="Pause, drop set, etc." />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="task-composer-actions">
                  <button type="button" className="button-secondary" onClick={() => updateExerciseLog(exerciseIndex, { sets: [...exercise.sets, emptySet()] })}>
                    Add set
                  </button>
                  <button type="button" className="ghost-button" onClick={() => setExerciseLogs((current) => current.length === 1 ? [emptyExerciseLog()] : current.filter((_, index) => index !== exerciseIndex))}>
                    Remove exercise
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <datalist id="easyworkout-log-exercises">
          {allExerciseOptions.map((exercise) => (
            <option key={exercise.name} value={exercise.name} />
          ))}
        </datalist>

        <div className="task-composer-actions">
          <button type="button" className="button-secondary" onClick={() => setExerciseLogs((current) => [...current, emptyExerciseLog()])}>
            Add exercise
          </button>
          <button type="submit" className="primary-button">Save workout</button>
        </div>
        {saveMessage ? <div className="calendar-info-card">{saveMessage}</div> : null}
      </form>
    </PageSection>
  );
}
