import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { defaultWorkoutExercises, useEasyWorkout } from "@/features/easyworkout/EasyWorkoutContext";
import { useSettings } from "@/features/settings/SettingsContext";
import type { WorkoutExerciseLogRecord, WorkoutSetRecord } from "@/lib/firestore/workoutSessions";

const emptySet = (): WorkoutSetRecord => ({ reps: 8, weight: 0, notes: "" });
const emptyExerciseLog = (setCount = 1): WorkoutExerciseLogRecord => ({
  exerciseId: null,
  exerciseName: "",
  muscleGroup: "",
  notes: "",
  sets: Array.from({ length: setCount }, () => emptySet()),
});
const startingWorkoutLogs = (count: number, setCount: number) =>
  Array.from({ length: count }, () => emptyExerciseLog(setCount));

export function EasyWorkoutLogPage() {
  const firstExerciseInputRef = useRef<HTMLInputElement | null>(null);
  const [searchParams] = useSearchParams();
  const routineId = searchParams.get("routineId");
  const gymMode = searchParams.get("gymMode") === "1";
  const workoutMode = searchParams.get("workoutMode") === "1" || searchParams.get("start") === "1";
  const { isExperimentalFeatureEnabled, settings } = useSettings();
  const { routines, exercises, sessions, addSession, error } = useEasyWorkout();
  const [selectedRoutineId, setSelectedRoutineId] = useState(routineId || "");
  const [performedOn, setPerformedOn] = useState(new Date().toISOString().split("T")[0]);
  const [durationMinutes, setDurationMinutes] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [exerciseLogs, setExerciseLogs] = useState<WorkoutExerciseLogRecord[]>(
    workoutMode
      ? startingWorkoutLogs(settings.easyWorkout.focusedExerciseCount, settings.easyWorkout.defaultSetCount)
      : [emptyExerciseLog(settings.easyWorkout.defaultSetCount)]
  );
  const [workoutPaste, setWorkoutPaste] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const selectedRoutine = useMemo(
    () => routines.find((routine) => routine.id === selectedRoutineId) || null,
    [routines, selectedRoutineId]
  );

  useEffect(() => {
    if (!selectedRoutine) {
      setExerciseLogs(
        workoutMode
          ? startingWorkoutLogs(settings.easyWorkout.focusedExerciseCount, settings.easyWorkout.defaultSetCount)
          : [emptyExerciseLog(settings.easyWorkout.defaultSetCount)]
      );
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
        : workoutMode
          ? startingWorkoutLogs(settings.easyWorkout.focusedExerciseCount, settings.easyWorkout.defaultSetCount)
          : [emptyExerciseLog(settings.easyWorkout.defaultSetCount)]
    );
  }, [selectedRoutine, workoutMode, settings.easyWorkout.focusedExerciseCount, settings.easyWorkout.defaultSetCount]);

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

  const isGymModeActive = gymMode && isExperimentalFeatureEnabled("gymMode");
  const isFocusedWorkoutMode = workoutMode || isGymModeActive;

  useEffect(() => {
    if (!isFocusedWorkoutMode) return;
    window.setTimeout(() => firstExerciseInputRef.current?.focus(), 0);
  }, [isFocusedWorkoutMode]);

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

  function fillFromLastTime(exerciseIndex: number) {
    const exercise = exerciseLogs[exerciseIndex];
    const previous = previousByExercise[exercise.exerciseName];
    if (!previous) return;

    updateExerciseLog(exerciseIndex, {
      sets: exercise.sets.map((set, index) =>
        index === 0 ? { ...set, reps: previous.reps, weight: previous.weight } : set
      ),
    });
  }

  function addExerciseBoxes(count = 1) {
    setExerciseLogs((current) => [
      ...current,
      ...Array.from({ length: count }, () => emptyExerciseLog(settings.easyWorkout.defaultSetCount)),
    ]);
  }

  function removeBlankExerciseBoxes() {
    setExerciseLogs((current) => {
      const filled = current.filter(
        (exercise) =>
          exercise.exerciseName.trim() ||
          exercise.muscleGroup.trim() ||
          exercise.notes.trim() ||
          exercise.sets.some((set) => set.reps > 0 || set.weight > 0 || set.notes.trim())
      );

      return filled.length ? filled : [emptyExerciseLog(settings.easyWorkout.defaultSetCount)];
    });
  }

  function parseWorkoutPaste() {
    const parsed = workoutPaste
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const cleaned = line.replace(/^\s*(?:[-*+]|[0-9]+[.)])\s*/, "");
        const compactMatch = cleaned.match(/^(.+?)\s+(\d+)\s*(?:x|by|for|@)\s*(\d+(?:\.\d+)?)\s*(?:lb|lbs|pounds?)?$/i);
        const wordsMatch = cleaned.match(/^(.+?)\s+(\d+)\s*(?:reps?)?\s*(?:at|@|x|with)?\s*(\d+(?:\.\d+)?)\s*(?:lb|lbs|pounds?)?$/i);
        const match = compactMatch || wordsMatch;

        if (!match) {
          return {
            ...emptyExerciseLog(settings.easyWorkout.defaultSetCount),
            exerciseName: cleaned,
          };
        }

        const exerciseName = match[1].trim();
        const builtIn = defaultWorkoutExercises.find(
          (exercise) => exercise.name.toLowerCase() === exerciseName.toLowerCase()
        );
        const saved = exercises.find(
          (exercise) => exercise.name.toLowerCase() === exerciseName.toLowerCase()
        );

        return {
          exerciseId: saved?.id || null,
          exerciseName,
          muscleGroup: saved?.muscleGroup || builtIn?.muscleGroup || "",
          notes: "",
          sets: [
            {
              reps: Number(match[2]) || 0,
              weight: Number(match[3]) || 0,
              notes: "",
            },
          ],
        };
      });

    if (!parsed.length) {
      setSaveMessage("Paste at least one exercise line first.");
      return;
    }

    setExerciseLogs(parsed);
    setWorkoutPaste("");
    setSaveMessage("Workout notes turned into editable sets.");
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
      setExerciseLogs(
        isFocusedWorkoutMode
          ? startingWorkoutLogs(settings.easyWorkout.focusedExerciseCount, settings.easyWorkout.defaultSetCount)
          : [emptyExerciseLog(settings.easyWorkout.defaultSetCount)]
      );
    }
  }

  return (
    <PageSection
      eyebrow={isFocusedWorkoutMode ? "Workout mode" : "Logging mode"}
      title={isFocusedWorkoutMode ? "Start workout" : "Log workout"}
      description={
        isFocusedWorkoutMode
          ? "Date, notes, and compact exercise boxes. Everything else gets out of the way."
          : "Keep it moving, see the last weight you hit, and save the session without digging through old notes."
      }
    >
      {error ? <p className="error-copy">{error}</p> : null}
      <form className="task-composer" onSubmit={handleSaveSession}>
        {!isFocusedWorkoutMode ? (
        <div className="workout-quick-paste">
          <label className="field-stack">
            <span>Import old workout notes</span>
            <textarea
              rows={4}
              value={workoutPaste}
              onChange={(event) => setWorkoutPaste(event.target.value)}
              placeholder={"Bench press 8x135\nLat pulldown 10x110\nSquat 5x185"}
            />
          </label>
          <div className="task-composer-actions">
            <button type="button" className="button-secondary" onClick={parseWorkoutPaste} disabled={!workoutPaste.trim()}>
              Turn into sets
            </button>
            <span className="helper-copy">For old workouts only. Use one line per exercise, like 8x135 or 8 reps at 135.</span>
          </div>
        </div>
        ) : null}

        <div className={`task-composer-grid${isFocusedWorkoutMode ? " gym-mode-meta workout-mode-meta" : ""}`}>
          {!isFocusedWorkoutMode ? (
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
          ) : null}
          <label className="field-stack">
            <span>Date</span>
            <input type="date" value={performedOn} onChange={(event) => setPerformedOn(event.target.value)} />
          </label>
          {!isFocusedWorkoutMode ? (
          <label className="field-stack">
            <span>Duration (minutes)</span>
            <input type="number" min="0" value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} placeholder="75" />
          </label>
          ) : null}
          <label className="field-stack field-stack-wide">
            <span>Session notes</span>
            <input value={sessionNotes} onChange={(event) => setSessionNotes(event.target.value)} placeholder="Energy, pump, machine setup, etc." />
          </label>
        </div>

        {isFocusedWorkoutMode ? (
          <div className="workout-mode-quick-actions">
            <div>
              <strong>{exerciseLogs.length} exercise boxes ready</strong>
              <p className="helper-copy">Start typing, add a few more, or clear empty boxes when the workout tightens up.</p>
            </div>
            <div className="drawer-actions-right">
              <button type="button" className="button-secondary compact-button" onClick={() => addExerciseBoxes(3)}>
                Add 3 boxes
              </button>
              <button type="button" className="ghost-button compact-button" onClick={removeBlankExerciseBoxes}>
                Clear blank boxes
              </button>
            </div>
          </div>
        ) : null}

        <div className="task-list-vnext workout-exercise-list">
          {exerciseLogs.map((exercise, exerciseIndex) => {
            const previous = previousByExercise[exercise.exerciseName];
            return (
              <article key={`${exercise.exerciseName}-${exerciseIndex}`} className={`panel-section workout-exercise-card${isFocusedWorkoutMode ? " gym-exercise-card workout-mode-card" : ""}`}>
                <div className="panel-header workout-exercise-header">
                  <p className="eyebrow">Exercise {exerciseIndex + 1}</p>
                  <h2>{exercise.exerciseName || "Pick a lift"}</h2>
                  {!isFocusedWorkoutMode && settings.easyWorkout.showLastTimeHelper ? <p>
                    {previous
                      ? `Last time: ${previous.weight} lbs x ${previous.reps} on ${previous.performedOn}`
                      : "No logged history yet for this exercise."}
                  </p> : null}
                </div>
                {isFocusedWorkoutMode && settings.easyWorkout.showLastTimeHelper && previous ? (
                  <div className="calendar-info-card gym-suggestion">
                    <strong>Suggested working set: {previous.weight} lbs x {previous.reps}</strong>
                    <button type="button" className="primary-button compact-button" onClick={() => fillFromLastTime(exerciseIndex)}>
                      Fill first set
                    </button>
                  </div>
                ) : null}

                <div className="task-composer-grid">
                  <label className="field-stack">
                    <span>Exercise</span>
                    <input
                      ref={exerciseIndex === 0 ? firstExerciseInputRef : undefined}
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
                  <label className="field-stack field-stack-wide">
                    <span>Exercise notes</span>
                    <input value={exercise.notes} onChange={(event) => updateExerciseLog(exerciseIndex, { notes: event.target.value })} placeholder="Vertical grip, slow eccentric, machine 4, etc." />
                  </label>
                </div>

                <div className="task-list-vnext">
                  {exercise.sets.map((set, setIndex) => (
                    <div key={`${exercise.exerciseName}-${setIndex}`} className={`task-row-card${isFocusedWorkoutMode ? " gym-set-row workout-set-row" : ""}`}>
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
                  {isFocusedWorkoutMode && exercise.sets.length ? (
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => updateExerciseLog(exerciseIndex, { sets: [...exercise.sets, { ...exercise.sets[exercise.sets.length - 1] }] })}
                    >
                      Copy previous set
                    </button>
                  ) : null}
                  <button type="button" className="ghost-button" onClick={() => setExerciseLogs((current) => current.length === 1 ? [emptyExerciseLog(settings.easyWorkout.defaultSetCount)] : current.filter((_, index) => index !== exerciseIndex))}>
                    Remove exercise
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <div className="task-composer-actions">
          <button type="button" className="button-secondary" onClick={() => addExerciseBoxes()}>
            Add exercise
          </button>
          <button type="submit" className="primary-button">Save workout</button>
        </div>
        {saveMessage ? <div className="calendar-info-card">{saveMessage}</div> : null}
      </form>
    </PageSection>
  );
}
