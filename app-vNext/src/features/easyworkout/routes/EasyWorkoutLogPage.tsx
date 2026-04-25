import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { defaultWorkoutExercises, useEasyWorkout } from "@/features/easyworkout/EasyWorkoutContext";
import { useSettings } from "@/features/settings/SettingsContext";
import type { WorkoutExerciseLogRecord, WorkoutSetRecord } from "@/lib/firestore/workoutSessions";

type WorkoutSetDraft = WorkoutSetRecord & { localId: string };
type WorkoutExerciseLogDraft = Omit<WorkoutExerciseLogRecord, "sets"> & {
  localId: string;
  sets: WorkoutSetDraft[];
};

const createLocalId = () => crypto.randomUUID();
const emptySet = (): WorkoutSetDraft => ({ localId: createLocalId(), reps: 8, weight: 0, notes: "" });
const emptyExerciseLog = (setCount = 1): WorkoutExerciseLogDraft => ({
  localId: createLocalId(),
  exerciseId: null,
  exerciseName: "",
  muscleGroup: "",
  notes: "",
  sets: Array.from({ length: setCount }, () => emptySet()),
});
const startingWorkoutLogs = (count: number, setCount: number) =>
  Array.from({ length: count }, () => emptyExerciseLog(setCount));

type ExerciseHistorySummary = {
  lastWeight: number;
  lastReps: number;
  performedOn: string;
  bestWeight: number;
  bestVolume: number;
  sessionCount: number;
};

export function EasyWorkoutLogPage() {
  const firstExerciseInputRef = useRef<HTMLInputElement | null>(null);
  const [searchParams] = useSearchParams();
  const routineId = searchParams.get("routineId");
  const gymMode = searchParams.get("gymMode") === "1";
  const workoutMode = searchParams.get("workoutMode") === "1" || searchParams.get("start") === "1";
  const { settings } = useSettings();
  const { routines, exercises, sessions, addSession, error } = useEasyWorkout();
  const [selectedRoutineId, setSelectedRoutineId] = useState(routineId || "");
  const [performedOn, setPerformedOn] = useState(new Date().toISOString().split("T")[0]);
  const [durationMinutes, setDurationMinutes] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [exerciseLogs, setExerciseLogs] = useState<WorkoutExerciseLogDraft[]>(
    workoutMode || gymMode
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
        workoutMode || gymMode
          ? startingWorkoutLogs(settings.easyWorkout.focusedExerciseCount, settings.easyWorkout.defaultSetCount)
          : [emptyExerciseLog(settings.easyWorkout.defaultSetCount)]
      );
      return;
    }

    setExerciseLogs(
      selectedRoutine.exercises.length
        ? selectedRoutine.exercises.map((exercise) => ({
            localId: createLocalId(),
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
            muscleGroup: exercise.muscleGroup,
            notes: exercise.notes,
            sets: Array.from({ length: Math.max(exercise.targetSets, 1) }, () => ({
              reps: Number(exercise.targetReps.split("-")[0]) || 8,
              weight: exercise.targetWeight || 0,
                localId: createLocalId(),
                notes: "",
            })),
          }))
        : workoutMode || gymMode
          ? startingWorkoutLogs(settings.easyWorkout.focusedExerciseCount, settings.easyWorkout.defaultSetCount)
          : [emptyExerciseLog(settings.easyWorkout.defaultSetCount)]
    );
  }, [selectedRoutine, workoutMode, gymMode, settings.easyWorkout.focusedExerciseCount, settings.easyWorkout.defaultSetCount]);

  const previousByExercise = useMemo(() => {
    const accumulator: Record<string, ExerciseHistorySummary> = {};

    sessions.forEach((session) => {
      session.exercises.forEach((exercise) => {
        const key = exercise.exerciseName.trim();
        if (!key) return;

        const bestSetWeight = exercise.sets.reduce((best, set) => Math.max(best, set.weight), 0);
        const bestSet = exercise.sets.find((set) => set.weight === bestSetWeight) || exercise.sets[0];
        const exerciseVolume = exercise.sets.reduce((sum, set) => sum + set.reps * set.weight, 0);
        const current = accumulator[key];

        if (!current) {
          accumulator[key] = {
            lastWeight: bestSet?.weight || 0,
            lastReps: bestSet?.reps || 0,
            performedOn: session.performedOn,
            bestWeight: bestSetWeight,
            bestVolume: exerciseVolume,
            sessionCount: 1,
          };
          return;
        }

        accumulator[key] = {
          lastWeight: current.lastWeight,
          lastReps: current.lastReps,
          performedOn: current.performedOn,
          bestWeight: Math.max(current.bestWeight, bestSetWeight),
          bestVolume: Math.max(current.bestVolume, exerciseVolume),
          sessionCount: current.sessionCount + 1,
        };
      });
    });

    return accumulator;
  }, [sessions]);

  const isGymModeActive = gymMode;
  const isFocusedWorkoutMode = workoutMode || isGymModeActive;

  useEffect(() => {
    if (!isFocusedWorkoutMode) return;
    window.setTimeout(() => firstExerciseInputRef.current?.focus(), 0);
  }, [isFocusedWorkoutMode]);

  function updateExerciseLog(index: number, next: Partial<WorkoutExerciseLogDraft>) {
    setExerciseLogs((current) =>
      current.map((exercise, exerciseIndex) =>
        exerciseIndex === index ? { ...exercise, ...next } : exercise
      )
    );
  }

  function updateSet(exerciseIndex: number, setIndex: number, next: Partial<WorkoutSetDraft>) {
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
        index === 0 ? { ...set, reps: previous.lastReps, weight: previous.lastWeight } : set
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
          localId: createLocalId(),
          exerciseId: saved?.id || null,
          exerciseName,
          muscleGroup: saved?.muscleGroup || builtIn?.muscleGroup || "",
          notes: "",
          sets: [
            {
              reps: Number(match[2]) || 0,
              weight: Number(match[3]) || 0,
              notes: "",
              localId: createLocalId(),
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
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        muscleGroup: exercise.muscleGroup,
        notes: exercise.notes,
        sets: exercise.sets
          .filter((set) => set.reps > 0 || set.weight > 0)
          .map((set) => ({ reps: set.reps, weight: set.weight, notes: set.notes })),
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
        title={isFocusedWorkoutMode ? "Workout" : "Log workout"}
      description={
        isFocusedWorkoutMode
          ? "Just the lifts, sets, and quick notes."
          : "Keep it moving, see the last weight you hit, and save the session without digging through old notes."
      }
      >
        <div className={`toolbar-row toolbar-row-compact deep-module-toolbar${isFocusedWorkoutMode ? " workout-focus-toolbar" : ""}`}>
          <div>
            <strong>{isGymModeActive ? "Gym Mode" : isFocusedWorkoutMode ? "Workout Mode" : "Logger"}</strong>
            {!isFocusedWorkoutMode ? <p className="helper-copy">Log fast. Details stay tucked away.</p> : null}
          </div>
          <div className="pill-row">
            {isGymModeActive ? (
              <Link className="button-secondary compact-button" to="/app/easyworkout/log?workoutMode=1">
                Use Workout Mode
              </Link>
            ) : (
              <Link className="primary-button compact-button" to="/app/easyworkout/log?gymMode=1">
                Gym Mode
              </Link>
            )}
            {!isFocusedWorkoutMode ? (
              <Link className="ghost-button compact-button" to="/app/easyworkout/log">
                Regular Log
              </Link>
            ) : null}
          </div>
        </div>

        {error ? <p className="error-copy">{error}</p> : null}
      <form className="task-composer" onSubmit={handleSaveSession}>
        {!isFocusedWorkoutMode ? (
        <details className="advanced-disclosure workout-advanced-tools">
          <summary>Import old workout notes</summary>
          <div className="workout-quick-paste">
            <label className="field-stack">
              <span>Workout notes</span>
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
              <span className="helper-copy">One line per exercise, like 8x135 or 8 reps at 135.</span>
            </div>
          </div>
        </details>
        ) : null}

        <div className={`task-composer-grid${isFocusedWorkoutMode ? " gym-mode-meta workout-mode-meta workout-session-strip" : ""}`}>
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
          <label className={`field-stack${isFocusedWorkoutMode ? "" : " field-stack-wide"}`}>
            <span>Session notes</span>
            <input value={sessionNotes} onChange={(event) => setSessionNotes(event.target.value)} placeholder="Energy, pump, machine setup, etc." />
          </label>
        </div>

        {isFocusedWorkoutMode ? (
          <div className="workout-mode-quick-actions deep-module-compact-actions">
            <div>
              <strong>{exerciseLogs.length} lifts ready</strong>
              <p className="helper-copy">Type, log, move on.</p>
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
              <article key={exercise.localId} className={`panel-section workout-exercise-card${isFocusedWorkoutMode ? " gym-exercise-card workout-mode-card" : ""}`}>
                <div className="panel-header workout-exercise-header">
                  <p className="eyebrow">Exercise {exerciseIndex + 1}</p>
                  {!isFocusedWorkoutMode ? <h2>{exercise.exerciseName || "Lift"}</h2> : null}
                  {!isFocusedWorkoutMode && settings.easyWorkout.showLastTimeHelper ? <p>
                    {previous
                      ? `Last time: ${previous.lastWeight} lbs x ${previous.lastReps} on ${previous.performedOn}`
                      : "No logged history yet for this exercise."}
                  </p> : null}
                </div>
                {isFocusedWorkoutMode && settings.easyWorkout.showLastTimeHelper && previous ? (
                  <div className="calendar-info-card gym-suggestion">
                    <strong>{previous.lastWeight} lbs x {previous.lastReps} last time</strong>
                    <button type="button" className="primary-button compact-button" onClick={() => fillFromLastTime(exerciseIndex)}>
                      Fill first set
                    </button>
                  </div>
                ) : null}
                {previous ? (
                  <div className="workout-history-strip">
                    <span>{previous.sessionCount} session{previous.sessionCount === 1 ? "" : "s"}</span>
                    <span>{previous.bestWeight} lbs best</span>
                    <span>{previous.bestVolume.toLocaleString()} volume</span>
                  </div>
                ) : null}

                <div className={`task-composer-grid${isFocusedWorkoutMode ? " workout-exercise-fields" : ""}`}>
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
                  {!isFocusedWorkoutMode ? (
                  <label className="field-stack">
                    <span>Muscle group</span>
                    <input value={exercise.muscleGroup} onChange={(event) => updateExerciseLog(exerciseIndex, { muscleGroup: event.target.value })} placeholder="Back" />
                  </label>
                  ) : null}
                  <label className={`field-stack workout-exercise-notes${isFocusedWorkoutMode ? "" : " field-stack-wide"}`}>
                    <span>Exercise notes</span>
                    <input value={exercise.notes} onChange={(event) => updateExerciseLog(exerciseIndex, { notes: event.target.value })} placeholder="Vertical grip, slow eccentric, machine 4, etc." />
                  </label>
                </div>

                <div className="task-list-vnext">
                  {exercise.sets.map((set, setIndex) => (
                    <div key={set.localId} className={`task-row-card workout-set-row${isFocusedWorkoutMode ? " gym-set-row" : ""}`}>
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

                <div className="task-composer-actions workout-exercise-actions">
                  <button type="button" className="button-secondary" onClick={() => updateExerciseLog(exerciseIndex, { sets: [...exercise.sets, emptySet()] })}>
                    Add set
                  </button>
                  {isFocusedWorkoutMode && exercise.sets.length ? (
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => {
                        const previousSet = exercise.sets[exercise.sets.length - 1];
                        updateExerciseLog(exerciseIndex, { sets: [...exercise.sets, { ...previousSet, localId: createLocalId() }] });
                      }}
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

        <div className="task-composer-actions workout-log-actions">
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
