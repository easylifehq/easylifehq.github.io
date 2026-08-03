import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { defaultWorkoutExercises, useEasyWorkout } from "@/features/easyworkout/EasyWorkoutContext";
import { useAuth } from "@/features/auth/AuthContext";
import { useSettings } from "@/features/settings/SettingsContext";
import {
  WORKOUT_DRAFT_SCHEMA_VERSION,
  WorkoutSaveCoordinator,
  canClearMatchingWorkoutDraft,
  getWorkoutDraftStorageKey,
  hasWorkoutDraftWork,
  recoverWorkoutDraft,
  workoutDraftStatusCopy,
  type StoredWorkoutDraft,
  type WorkoutDraftLifecycleStatus,
  type WorkoutExerciseLogDraft,
  type WorkoutSetDraft,
} from "@/features/easyworkout/domain/workoutDraftLifecycle";
import { convertWeight, isValidLocalDateKey, isValidWorkingSet } from "@/features/easyworkout/domain/workoutStatistics";
type DeletedSetUndo = {
  exerciseLocalId: string;
  exerciseName: string;
  set: WorkoutSetDraft;
  setIndex: number;
};

const createLocalId = () => crypto.randomUUID();
const localDateKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};
const emptySet = (): WorkoutSetDraft => ({
  localId: createLocalId(), reps: 8, weight: 0, notes: "", setType: "standard", completed: true, deleted: false, rir: null,
});
const emptyExerciseLog = (setCount = 1): WorkoutExerciseLogDraft => ({
  localId: createLocalId(),
  exerciseId: null,
  exerciseName: "",
  muscleGroup: "",
  primaryMuscles: [],
  secondaryMuscles: [],
  exerciseType: "weighted",
  notes: "",
  sets: Array.from({ length: setCount }, () => emptySet()),
});
const startingWorkoutLogs = (count: number, setCount: number) =>
  Array.from({ length: count }, () => emptyExerciseLog(setCount));
const sanitizeWholeNumberInput = (value: string) => value.replace(/\D/g, "");
const sanitizeDecimalInput = (value: string) => {
  const cleaned = value.replace(/[^\d.]/g, "");
  const [whole = "", ...decimalParts] = cleaned.split(".");
  const decimals = decimalParts.join("");
  return decimalParts.length ? `${whole}.${decimals}` : whole;
};
const toWholeNumberDraft = (value: string) => {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
};
const toDecimalDraft = (value: string) => {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};
const hasSetWork = (set: WorkoutSetDraft) => set.weight > 0 || Boolean(set.notes.trim());
const hasExerciseWork = (exercise: WorkoutExerciseLogDraft) =>
  exercise.exerciseName.trim() ||
  exercise.muscleGroup.trim() ||
  exercise.notes.trim() ||
  (exercise.exerciseType !== "weighted" && exercise.sets.some((set) => set.reps > 0 || (set.durationSeconds || 0) > 0 || (set.distanceMeters || 0) > 0)) ||
  exercise.sets.some(hasSetWork);

function readStoredWorkoutDraft(storageKey: string, ownerId: string, defaultWeightUnit: "lb" | "kg") {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    return recoverWorkoutDraft(JSON.parse(raw), { today: localDateKey(), nowIso: new Date().toISOString(), ownerId, defaultWeightUnit, createId: createLocalId });
  } catch {
    return { draft: null, message: "The saved workout draft was unreadable. Start a new workout; no remote data was changed.", migrated: false };
  }
}

type ExerciseHistorySummary = {
  lastWeight: number;
  lastReps: number;
  performedOn: string;
  bestWeight: number;
  bestVolume: number;
  sessionCount: number;
};

type WorkoutExerciseSuggestion = {
  name: string;
  muscleGroup: string;
  reason: string;
  detail: string;
  target: string;
};

const exerciseSuggestionDetails: Record<string, string> = {
  "Lat Pulldown": "Good when you still need vertical pulling. Keep your ribs down, pull elbows toward your pockets, and stop before it turns into a shrug.",
  "Seated Row": "Good when your lats and mid-back need more work. Think chest tall, elbows back, and squeeze without yanking.",
  "Bicep Curl": "Good after back work when biceps are warm. Keep the upper arm still and pick a weight you can control.",
  "Hammer Curl": "Good for a more joint-friendly biceps/forearm finisher. Keep the wrists neutral and avoid swinging.",
  "Romanian Deadlift": "Good when your workout needs posterior-chain work. Hinge back, keep the bar close, and stop when hamstrings are loaded.",
  Squat: "Good when the day needs a main leg movement. Use a weight you can keep braced and repeatable.",
  "Leg Press": "Good when you want leg volume without as much setup. Control the bottom and keep reps smooth.",
  "Hip Thrust": "Good when glutes are under-hit. Pause at the top and keep the movement controlled.",
  "Bench Press": "Good when chest needs a main press. Keep shoulders set and use a weight you can own.",
  "Incline Dumbbell Press": "Good for upper chest and controlled pressing volume. Keep the range smooth and avoid rushing.",
  "Shoulder Press": "Good when shoulders need the main work. Brace first, then press without over-arching.",
  "Lateral Raise": "Good as a low-fatigue shoulder finisher. Lead with elbows and stop before momentum takes over.",
};

const groupPairs: Record<string, string[]> = {
  Back: ["Back", "Biceps", "Hamstrings"],
  Biceps: ["Back", "Biceps"],
  Chest: ["Chest", "Shoulders"],
  Shoulders: ["Shoulders", "Chest"],
  Legs: ["Legs", "Hamstrings", "Glutes"],
  Hamstrings: ["Hamstrings", "Glutes", "Back"],
  Glutes: ["Glutes", "Hamstrings", "Legs"],
};

export function EasyWorkoutLogPage() {
  const firstExerciseInputRef = useRef<HTMLInputElement | null>(null);
  const saveCoordinatorRef = useRef(new WorkoutSaveCoordinator<string | null>());
  const skipDraftFlushRef = useRef(false);
  const { settings } = useSettings();
  const { user, isDemoMode } = useAuth();
  const ownerId = user?.uid || "unavailable";
  const draftStorageKey = useMemo(() => getWorkoutDraftStorageKey(ownerId), [ownerId]);
  const restoredDraftRecovery = useMemo(
    () => readStoredWorkoutDraft(draftStorageKey, ownerId, settings.easyWorkout.weightUnit),
    [draftStorageKey, ownerId, settings.easyWorkout.weightUnit]
  );
  const restoredDraft = restoredDraftRecovery?.draft || null;
  const didUseRestoredDraftRef = useRef(Boolean(restoredDraft));
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routineId = searchParams.get("routineId");
  const gymMode = searchParams.get("gymMode") === "1";
  const workoutMode = searchParams.get("workoutMode") === "1" || searchParams.get("start") === "1";
  const { routines, exercises, sessions, addSession, error } = useEasyWorkout();
  const [draftId] = useState(restoredDraft?.draftId || createLocalId());
  const [startedAt] = useState(restoredDraft?.startedAt || new Date().toISOString());
  const [elapsedSeconds, setElapsedSeconds] = useState(restoredDraft?.elapsedSeconds || 0);
  const [selectedRoutineId, setSelectedRoutineId] = useState(restoredDraft?.selectedRoutineId ?? routineId ?? "");
  const [performedOn, setPerformedOn] = useState(restoredDraft?.performedOn ?? localDateKey());
  const [durationMinutes, setDurationMinutes] = useState(restoredDraft?.durationMinutes ?? "");
  const [draftWeightUnit] = useState<"lb" | "kg">(restoredDraft?.weightUnit ?? settings.easyWorkout.weightUnit);
  const [sessionNotes, setSessionNotes] = useState(restoredDraft?.sessionNotes ?? "");
  const [exerciseLogs, setExerciseLogs] = useState<WorkoutExerciseLogDraft[]>(
    restoredDraft?.exerciseLogs.length
      ? restoredDraft.exerciseLogs
      : (workoutMode || gymMode)
        ? startingWorkoutLogs(settings.easyWorkout.focusedExerciseCount, settings.easyWorkout.defaultSetCount)
        : [emptyExerciseLog(settings.easyWorkout.defaultSetCount)]
  );
  const [activeExerciseId, setActiveExerciseId] = useState(restoredDraft?.activeExerciseId || restoredDraft?.exerciseLogs[0]?.localId || "");
  const [workoutPaste, setWorkoutPaste] = useState("");
  const [saveMessage, setSaveMessage] = useState(restoredDraftRecovery?.message || "");
  const [draftStatus, setDraftStatus] = useState<WorkoutDraftLifecycleStatus>("saved-local");
  const [isSaving, setIsSaving] = useState(false);
  const [deletedSetUndo, setDeletedSetUndo] = useState<DeletedSetUndo | null>(null);
  const todayKey = localDateKey();
  const todayLoggedCount = sessions.filter((session) => session.performedOn === todayKey).length;

  const selectedRoutine = useMemo(
    () => routines.find((routine) => routine.id === selectedRoutineId) || null,
    [routines, selectedRoutineId]
  );

  useEffect(() => {
    if (didUseRestoredDraftRef.current) {
      didUseRestoredDraftRef.current = false;
      return;
    }

    const hasActiveDraftWork =
      sessionNotes.trim() ||
      durationMinutes ||
      exerciseLogs.some(hasExerciseWork);

    if (hasActiveDraftWork) {
      return;
    }

    if (!selectedRoutine) {
      const nextLogs =
        workoutMode || gymMode
          ? startingWorkoutLogs(settings.easyWorkout.focusedExerciseCount, settings.easyWorkout.defaultSetCount)
          : [emptyExerciseLog(settings.easyWorkout.defaultSetCount)];
      setExerciseLogs(nextLogs);
      setActiveExerciseId(nextLogs[0]?.localId ?? "");
      return;
    }

    const nextLogs =
      selectedRoutine.exercises.length
        ? selectedRoutine.exercises.map((exercise) => ({
            localId: createLocalId(),
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
            muscleGroup: exercise.muscleGroup,
            primaryMuscles: exercise.muscleGroup ? [exercise.muscleGroup] : [],
            secondaryMuscles: [],
            exerciseType: "weighted" as const,
            notes: exercise.notes,
            sets: Array.from({ length: Math.max(exercise.targetSets, 1) }, () => ({
              reps: Number(exercise.targetReps.split("-")[0]) || 8,
              weight: exercise.targetWeight || 0,
              localId: createLocalId(),
              notes: "",
              setType: "standard" as const,
              completed: true,
              deleted: false,
              rir: null,
            })),
          }))
        : workoutMode || gymMode
          ? startingWorkoutLogs(settings.easyWorkout.focusedExerciseCount, settings.easyWorkout.defaultSetCount)
          : [emptyExerciseLog(settings.easyWorkout.defaultSetCount)];

    setExerciseLogs(nextLogs);
    setActiveExerciseId(nextLogs[0]?.localId ?? "");
  }, [selectedRoutine, workoutMode, gymMode, settings.easyWorkout.focusedExerciseCount, settings.easyWorkout.defaultSetCount]);

  const previousByExercise = useMemo(() => {
    const accumulator: Record<string, ExerciseHistorySummary> = {};

    sessions.forEach((session) => {
      session.exercises.forEach((exercise) => {
        const key = exercise.exerciseName.trim();
        if (!key) return;

        const kind = exercise.exerciseType || "weighted";
        const validSets = exercise.sets.filter((set) => isValidWorkingSet(set, kind));
        const sourceUnit = session.weightUnit || "lb";
        const bestSetSourceWeight = validSets.reduce((best, set) => Math.max(best, set.weight), 0);
        const bestSet = validSets.find((set) => set.weight === bestSetSourceWeight);
        const bestSetWeight = convertWeight(bestSetSourceWeight, sourceUnit, draftWeightUnit);
        const exerciseVolume = convertWeight(validSets.reduce((sum, set) => sum + set.reps * set.weight, 0), sourceUnit, draftWeightUnit);
        const current = accumulator[key];

        if (!current) {
          accumulator[key] = {
            lastWeight: convertWeight(bestSet?.weight || 0, sourceUnit, draftWeightUnit),
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
  }, [draftWeightUnit, sessions]);

  const nextExerciseSuggestions = useMemo<WorkoutExerciseSuggestion[]>(() => {
    const currentNames = new Set(
      exerciseLogs.map((exercise) => exercise.exerciseName.trim().toLowerCase()).filter(Boolean)
    );
    const loggedGroups = exerciseLogs
      .filter((exercise) => exercise.sets.some(hasSetWork))
      .map((exercise) => exercise.muscleGroup || defaultWorkoutExercises.find((entry) => entry.name === exercise.exerciseName)?.muscleGroup || "")
      .filter(Boolean);
    const activeGroup =
      exerciseLogs.find((exercise) => exercise.localId === activeExerciseId)?.muscleGroup ||
      loggedGroups[loggedGroups.length - 1] ||
      "";
    const targetGroups = Array.from(new Set([...(groupPairs[activeGroup] || []), activeGroup, ...loggedGroups])).filter(Boolean);
    const groupSetCounts = exerciseLogs.reduce<Record<string, number>>((accumulator, exercise) => {
      const group = exercise.muscleGroup || defaultWorkoutExercises.find((entry) => entry.name === exercise.exerciseName)?.muscleGroup || "";
      if (!group) return accumulator;
      const setCount = exercise.sets.filter(hasSetWork).length;
      accumulator[group] = (accumulator[group] || 0) + setCount;
      return accumulator;
    }, {});
    const savedOptions = exercises.map((exercise) => ({ name: exercise.name, muscleGroup: exercise.muscleGroup }));
    const options = [...defaultWorkoutExercises, ...savedOptions].filter(
      (exercise, index, list) =>
        exercise.name &&
        !currentNames.has(exercise.name.toLowerCase()) &&
        list.findIndex((candidate) => candidate.name.toLowerCase() === exercise.name.toLowerCase()) === index
    );
    const rankedGroups = targetGroups.length
      ? targetGroups.sort((first, second) => (groupSetCounts[first] || 0) - (groupSetCounts[second] || 0))
      : ["Back", "Chest", "Legs", "Shoulders", "Biceps"];

    return options
      .sort((first, second) => {
        const firstRank = rankedGroups.indexOf(first.muscleGroup);
        const secondRank = rankedGroups.indexOf(second.muscleGroup);
        return (firstRank === -1 ? 99 : firstRank) - (secondRank === -1 ? 99 : secondRank);
      })
      .slice(0, 3)
      .map((exercise) => {
        const previous = previousByExercise[exercise.name];
        return {
          name: exercise.name,
          muscleGroup: exercise.muscleGroup,
          reason: targetGroups.includes(exercise.muscleGroup)
            ? `${exercise.muscleGroup} is still in today's lane.`
            : "Good general slot if you need one more lift.",
          detail: exerciseSuggestionDetails[exercise.name] || `Use this when ${exercise.muscleGroup || "this area"} still needs controlled volume.`,
          target: previous?.lastWeight
            ? `Try ${previous.lastWeight.toFixed(1)} ${draftWeightUnit} x ${previous.lastReps || 8}, then adjust by feel.`
            : "Start with a clean warm-up weight and log what moved well.",
        };
      });
  }, [activeExerciseId, exerciseLogs, exercises, previousByExercise]);

  const isGymModeActive = gymMode;
  const isFocusedWorkoutMode = workoutMode || isGymModeActive;

  useEffect(() => {
    if (!isFocusedWorkoutMode) return;
    const focusTimer = window.setTimeout(() => firstExerciseInputRef.current?.focus(), 0);
    return () => window.clearTimeout(focusTimer);
  }, [isFocusedWorkoutMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateElapsed = () => {
      const started = new Date(startedAt).getTime();
      if (Number.isFinite(started)) setElapsedSeconds((current) => Math.max(current, Math.floor((Date.now() - started) / 1000)));
    };
    const timer = window.setInterval(updateElapsed, 30000);
    const handleVisibility = () => updateElapsed();
    window.addEventListener("pagehide", handleVisibility);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      updateElapsed();
      window.clearInterval(timer);
      window.removeEventListener("pagehide", handleVisibility);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [startedAt]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const draft: StoredWorkoutDraft = {
      schemaVersion: WORKOUT_DRAFT_SCHEMA_VERSION,
      ownerId,
      weightUnit: draftWeightUnit,
      draftId,
      selectedRoutineId,
      routineOriginId: restoredDraft?.routineOriginId || selectedRoutineId || null,
      performedOn,
      startedAt,
      elapsedSeconds,
      durationMinutes,
      sessionNotes,
      activeExerciseId,
      exerciseLogs,
      updatedAt: new Date().toISOString(),
    };
    if (!hasWorkoutDraftWork(draft)) {
      window.localStorage.removeItem(draftStorageKey);
      return;
    }
    setDraftStatus("saving-local");
    const saveTimer = window.setTimeout(() => {
      if (skipDraftFlushRef.current) return;
      try {
        window.localStorage.setItem(draftStorageKey, JSON.stringify(draft));
        setDraftStatus("saved-local");
      } catch {
        setDraftStatus("sync-failed-draft-retained");
        setSaveMessage("Local storage is unavailable. Keep this page open and copy the workout before leaving.");
      }
    }, 250);
    return () => {
      window.clearTimeout(saveTimer);
      if (skipDraftFlushRef.current) return;
      try {
        window.localStorage.setItem(draftStorageKey, JSON.stringify({ ...draft, updatedAt: new Date().toISOString() }));
      } catch {
        // The visible status from the mounted page already explains local storage failures.
      }
    };
  }, [activeExerciseId, draftId, draftStorageKey, draftWeightUnit, durationMinutes, elapsedSeconds, exerciseLogs, ownerId, performedOn, restoredDraft?.routineOriginId, selectedRoutineId, sessionNotes, startedAt]);

  function updateExerciseLog(index: number, next: Partial<WorkoutExerciseLogDraft>) {
    setExerciseLogs((current) =>
      current.map((exercise, exerciseIndex) =>
        exerciseIndex === index ? { ...exercise, ...next } : exercise
      )
    );
  }

  function updateSet(exerciseIndex: number, setIndex: number, next: Partial<WorkoutSetDraft>) {
    setDeletedSetUndo(null);
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

  function selectNumericInput(input: HTMLInputElement) {
    window.requestAnimationFrame(() => input.select());
  }

  function deleteSet(exerciseIndex: number, setIndex: number) {
    const exercise = exerciseLogs[exerciseIndex];
    const removedSet = exercise?.sets[setIndex];

    if (exercise && removedSet) {
      setDeletedSetUndo({
        exerciseLocalId: exercise.localId,
        exerciseName: exercise.exerciseName || `Exercise ${exerciseIndex + 1}`,
        set: removedSet,
        setIndex,
      });
      setSaveMessage("Set removed. Undo is available before you save.");
    }

    setExerciseLogs((current) =>
      current.map((exercise, currentExerciseIndex) =>
        currentExerciseIndex === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.length === 1
                ? [emptySet()]
                : exercise.sets.filter((_, currentSetIndex) => currentSetIndex !== setIndex),
            }
          : exercise
      )
    );
  }

  function undoDeletedSet() {
    if (!deletedSetUndo) return;

    setExerciseLogs((current) =>
      current.map((exercise) => {
        if (exercise.localId !== deletedSetUndo.exerciseLocalId) return exercise;

        const restoredSets = [...exercise.sets];
        const insertIndex = Math.min(deletedSetUndo.setIndex, restoredSets.length);

        if (restoredSets.length === 1 && !hasSetWork(restoredSets[0])) {
          restoredSets.splice(0, 1, deletedSetUndo.set);
        } else {
          restoredSets.splice(insertIndex, 0, deletedSetUndo.set);
        }

        return { ...exercise, sets: restoredSets };
      })
    );
    setActiveExerciseId(deletedSetUndo.exerciseLocalId);
    setSaveMessage("Set restored. Nothing is saved until you save the workout.");
    setDeletedSetUndo(null);
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
    const nextBoxes = Array.from({ length: count }, () => emptyExerciseLog(settings.easyWorkout.defaultSetCount));
    setExerciseLogs((current) => [...current, ...nextBoxes]);
    setActiveExerciseId(nextBoxes[0]?.localId ?? "");
  }

  function addSuggestedExercise(suggestion: WorkoutExerciseSuggestion) {
    const previous = previousByExercise[suggestion.name];
    const nextExercise: WorkoutExerciseLogDraft = {
      ...emptyExerciseLog(settings.easyWorkout.defaultSetCount),
      exerciseName: suggestion.name,
      muscleGroup: suggestion.muscleGroup,
      sets: [
        {
          ...emptySet(),
          reps: previous?.lastReps || 8,
          weight: previous?.lastWeight || 0,
        },
      ],
    };
    setExerciseLogs((current) => [...current, nextExercise]);
    setActiveExerciseId(nextExercise.localId);
    setSaveMessage(`${suggestion.name} added as the next exercise. Nothing saved yet.`);
  }

  function removeBlankExerciseBoxes() {
    setExerciseLogs((current) => {
      const filled = current.filter(
        (exercise) =>
          exercise.exerciseName.trim() ||
          exercise.muscleGroup.trim() ||
          exercise.notes.trim() ||
          exercise.sets.some(hasSetWork)
      );

      const nextLogs = filled.length ? filled : [emptyExerciseLog(settings.easyWorkout.defaultSetCount)];
      if (!nextLogs.some((exercise) => exercise.localId === activeExerciseId)) {
        setActiveExerciseId(nextLogs[0]?.localId ?? "");
      }
      return nextLogs;
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
          primaryMuscles: saved?.muscleGroup || builtIn?.muscleGroup ? [saved?.muscleGroup || builtIn?.muscleGroup || ""] : [],
          secondaryMuscles: [],
          exerciseType: "weighted" as const,
          notes: "",
          sets: [
            {
              reps: Number(match[2]) || 0,
              weight: Number(match[3]) || 0,
              notes: "",
              localId: createLocalId(),
              setType: "standard" as const,
              completed: true,
              deleted: false,
              rir: null,
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
        primaryMuscles: exercise.primaryMuscles,
        secondaryMuscles: exercise.secondaryMuscles,
        exerciseType: exercise.exerciseType,
        notes: exercise.notes,
        sets: exercise.sets
          .filter((set) => isValidWorkingSet(set, exercise.exerciseType))
          .map(({ localId: _localId, ...set }) => set),
      }))
      .filter((exercise) => exercise.sets.length);

    if (!cleanedExercises.length) {
      setSaveMessage("Add at least one exercise with a complete working set first. Weighted sets need reps and a positive load.");
      return;
    }

    if (!isValidLocalDateKey(performedOn)) {
      setSaveMessage("Choose a valid local workout date before saving.");
      return;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setDraftStatus("sync-failed-draft-retained");
      setSaveMessage("Couldn't sync—draft retained. Reconnect, then retry Save workout.");
      return;
    }

    setIsSaving(true);
    setDraftStatus("syncing");
    setSaveMessage("Syncing workout. The local draft stays until confirmation.");
    try {
      const sessionId = await saveCoordinatorRef.current.save(draftId, () => addSession({
        clientDraftId: draftId,
        schemaVersion: WORKOUT_DRAFT_SCHEMA_VERSION,
        routineId: selectedRoutine?.id || null,
        routineName: selectedRoutine?.name || "Workout",
        performedOn,
        weightUnit: draftWeightUnit,
        durationMinutes: durationMinutes ? Number(durationMinutes) : Math.max(1, Math.round(elapsedSeconds / 60)),
        notes: sessionNotes.trim(),
        exercises: cleanedExercises,
      }));
      if (!sessionId) throw new Error("Workout persistence did not confirm a session id.");

      skipDraftFlushRef.current = true;
      const rawStored = window.localStorage.getItem(draftStorageKey);
      let storedDraftId: string | null = null;
      try {
        storedDraftId = rawStored ? String((JSON.parse(rawStored) as { draftId?: string }).draftId || "") : null;
      } catch {
        storedDraftId = null;
      }
      if (canClearMatchingWorkoutDraft(storedDraftId, draftId)) {
        window.localStorage.removeItem(draftStorageKey);
      }
      setDraftStatus("synced");
      setSaveMessage("Workout saved.");
      navigate({ pathname: `/app/easyworkout/session/${encodeURIComponent(sessionId)}`, search: isDemoMode ? "?demo=1" : "" });
    } catch {
      setDraftStatus("sync-failed-draft-retained");
      setSaveMessage("Couldn't sync—draft retained. Retry when the connection is ready.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
      <PageSection
        headingLevel={1}
        eyebrow={isFocusedWorkoutMode ? "Active workout" : "Full log"}
        title={isFocusedWorkoutMode ? "Workout" : "Log workout"}
      description={
        isFocusedWorkoutMode
          ? "Lifts, sets, quick notes. Unsaved work is kept on this device while you train."
          : "Use the full log when you want routine, duration, and import tools."
      }
      >
        <div className={`toolbar-row toolbar-row-compact deep-module-toolbar${isFocusedWorkoutMode ? " workout-focus-toolbar" : ""}`}>
          <div>
            <strong>{isFocusedWorkoutMode ? "Active workout" : "Full log"}</strong>
            {!isFocusedWorkoutMode ? <p className="helper-copy">Log fast. Details stay tucked away.</p> : null}
          </div>
          <div className="pill-row">
            {!isFocusedWorkoutMode ? (
              <Link className="primary-button compact-button" to="/app/easyworkout/log?gymMode=1">
                Active workout
              </Link>
            ) : null}
            {isFocusedWorkoutMode ? (
              <Link className="ghost-button compact-button" to="/app/easyworkout/log">
                Full log
              </Link>
            ) : null}
          </div>
        </div>

        {error ? <p className="error-copy">{error}</p> : null}
        <div className="workout-plan-bridge workout-log-plan-bridge" aria-label="Daily plan connection">
          <div className="workout-plan-bridge-copy">
            <span>Daily plan</span>
            <strong>{todayLoggedCount ? `${todayLoggedCount} workout${todayLoggedCount === 1 ? "" : "s"} logged today` : "Save the session, then return to Today"}</strong>
            <p>
              {todayLoggedCount
                ? "Review progress before adding more work to the day."
                : "The log keeps training progress separate from the Today surface until you need it."}
            </p>
          </div>
          <Link className="ghost-button compact-button" to="/app/hq">
            Today
          </Link>
        </div>
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
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(sanitizeWholeNumberInput(event.target.value))}
              placeholder="75"
            />
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

        {isFocusedWorkoutMode && nextExerciseSuggestions.length ? (
          <section className="calendar-info-card workout-next-lift-card" aria-label="Next exercise suggestions">
            <div className="workout-next-lift-header">
              <div>
                <span className="priority-pill-vnext">Need next lift?</span>
                <strong>Pick one more exercise</strong>
              </div>
              <p>Local suggestions only. Nothing is saved until you save the workout.</p>
            </div>
            <div className="workout-next-lift-grid">
              {nextExerciseSuggestions.map((suggestion) => (
                <article key={suggestion.name} className="workout-next-lift-option">
                  <div>
                    <strong>{suggestion.name}</strong>
                    <span>{suggestion.muscleGroup}</span>
                    <p>{suggestion.reason}</p>
                    <details>
                      <summary>Read more</summary>
                      <p>{suggestion.detail}</p>
                      <p>{suggestion.target}</p>
                    </details>
                  </div>
                  <button type="button" className="button-secondary compact-button" onClick={() => addSuggestedExercise(suggestion)}>
                    Add
                  </button>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <div className="task-list-vnext workout-exercise-list">
          {exerciseLogs.map((exercise, exerciseIndex) => {
            const previous = previousByExercise[exercise.exerciseName];
            const loggedSetCount = exercise.sets.filter(hasSetWork).length;
            const lastLoggedSet = [...exercise.sets].reverse().find(hasSetWork);
            const isCollapsed = isFocusedWorkoutMode && activeExerciseId && activeExerciseId !== exercise.localId;

            if (isCollapsed) {
              return (
                <article key={exercise.localId} className="panel-section workout-exercise-card workout-mode-card workout-exercise-card-collapsed">
                  <button type="button" className="workout-collapsed-exercise" onClick={() => setActiveExerciseId(exercise.localId)}>
                    <span>Exercise {exerciseIndex + 1}</span>
                    <strong>{exercise.exerciseName || "Empty lift"}</strong>
                    <small>
                      {loggedSetCount ? `${loggedSetCount} set${loggedSetCount === 1 ? "" : "s"}` : "No sets yet"}
                      {lastLoggedSet ? ` - ${lastLoggedSet.weight || 0} ${draftWeightUnit} x ${lastLoggedSet.reps || 0}` : ""}
                    </small>
                  </button>
                </article>
              );
            }

            return (
              <article key={exercise.localId} className={`panel-section workout-exercise-card${isFocusedWorkoutMode ? " gym-exercise-card workout-mode-card" : ""}`}>
                <div className="panel-header workout-exercise-header">
                  <p className="eyebrow">Exercise {exerciseIndex + 1}</p>
                  {!isFocusedWorkoutMode ? <h2>{exercise.exerciseName || "Lift"}</h2> : null}
                  {!isFocusedWorkoutMode && settings.easyWorkout.showLastTimeHelper ? <p>
                    {previous
                      ? `Last time: ${previous.lastWeight.toFixed(1)} ${draftWeightUnit} x ${previous.lastReps} on ${previous.performedOn}`
                      : "No logged history yet for this exercise."}
                  </p> : null}
                </div>
                {isFocusedWorkoutMode && settings.easyWorkout.showLastTimeHelper && previous ? (
                  <div className="calendar-info-card gym-suggestion">
                    <strong>{previous.lastWeight.toFixed(1)} {draftWeightUnit} x {previous.lastReps} last time</strong>
                    <button type="button" className="primary-button compact-button" onClick={() => fillFromLastTime(exerciseIndex)}>
                      Fill first set
                    </button>
                  </div>
                ) : null}
                {previous ? (
                  <div className="workout-history-strip">
                    <span>{previous.sessionCount} session{previous.sessionCount === 1 ? "" : "s"}</span>
                    <span>{previous.bestWeight.toFixed(1)} {draftWeightUnit} best</span>
                    <span>{previous.bestVolume.toLocaleString()} {draftWeightUnit}·reps</span>
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

                <p className="helper-copy">
                  Tap a reps or weight field once, type the full number, then move on. Remove set has a local undo before
                  you save the workout.
                </p>

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
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            enterKeyHint="next"
                            autoComplete="off"
                            value={set.reps || ""}
                            placeholder="8"
                            onFocus={(event) => selectNumericInput(event.currentTarget)}
                            onClick={(event) => selectNumericInput(event.currentTarget)}
                            onMouseUp={(event) => event.preventDefault()}
                            onChange={(event) => {
                              const nextValue = sanitizeWholeNumberInput(event.target.value);
                              updateSet(exerciseIndex, setIndex, { reps: toWholeNumberDraft(nextValue) });
                            }}
                          />
                        </label>
                        <label className="field-stack task-row-field">
                          <span>Weight ({draftWeightUnit})</span>
                          <input
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*[.]?[0-9]*"
                            enterKeyHint="next"
                            autoComplete="off"
                            value={set.weight || ""}
                            placeholder="135"
                            onFocus={(event) => selectNumericInput(event.currentTarget)}
                            onClick={(event) => selectNumericInput(event.currentTarget)}
                            onMouseUp={(event) => event.preventDefault()}
                            onChange={(event) => {
                              const nextValue = sanitizeDecimalInput(event.target.value);
                              updateSet(exerciseIndex, setIndex, { weight: toDecimalDraft(nextValue) });
                            }}
                          />
                        </label>
                        <label className="field-stack task-row-field">
                          <span>Set type</span>
                          <select
                            value={set.setType}
                            aria-label={`${exercise.exerciseName || `Exercise ${exerciseIndex + 1}`} set ${setIndex + 1} type`}
                            onChange={(event) => updateSet(exerciseIndex, setIndex, { setType: event.target.value as WorkoutSetDraft["setType"] })}
                          >
                            <option value="warmup">Warm-up</option>
                            <option value="standard">Working</option>
                            <option value="drop">Drop</option>
                            <option value="failure">Failure</option>
                          </select>
                        </label>
                        <label className="field-stack task-row-field">
                          <span>Notes</span>
                          <input value={set.notes} onChange={(event) => updateSet(exerciseIndex, setIndex, { notes: event.target.value })} placeholder="Pause, drop set, etc." />
                        </label>
                        <div className="task-row-actions workout-set-actions">
                          {previous && set.weight > previous.bestWeight ? <span className="workout-pr-chip">PR</span> : null}
                          <button
                            type="button"
                            className="danger-button compact-button workout-delete-button"
                            onClick={() => deleteSet(exerciseIndex, setIndex)}
                            aria-label={`Remove set ${setIndex + 1}`}
                          >
                            Remove set
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="task-composer-actions workout-exercise-actions">
                  <div className="workout-exercise-main-actions">
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
                    {isFocusedWorkoutMode ? (
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => {
                          const nextExercise = exerciseLogs[exerciseIndex + 1];
                          if (nextExercise) {
                            setActiveExerciseId(nextExercise.localId);
                            return;
                          }

                          const newExercise = emptyExerciseLog(settings.easyWorkout.defaultSetCount);
                          setExerciseLogs((current) => [...current, newExercise]);
                          setActiveExerciseId(newExercise.localId);
                        }}
                      >
                        Done, next exercise
                      </button>
                    ) : null}
                  </div>
                  <div className="workout-exercise-delete-actions" aria-label="Exercise delete actions">
                    <button
                      type="button"
                      className="danger-button workout-delete-button"
                      onClick={() =>
                        setExerciseLogs((current) => {
                          const nextLogs = current.length === 1
                            ? [emptyExerciseLog(settings.easyWorkout.defaultSetCount)]
                            : current.filter((_, index) => index !== exerciseIndex);
                          setActiveExerciseId(nextLogs[Math.min(exerciseIndex, nextLogs.length - 1)]?.localId ?? "");
                          return nextLogs;
                        })
                      }
                    >
                      Delete exercise
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="task-composer-actions workout-log-actions">
          <button type="button" className="button-secondary" onClick={() => addExerciseBoxes()}>
            Add exercise
          </button>
          <button type="submit" className="primary-button" disabled={isSaving}>
            {isSaving ? "Syncing…" : "Save workout"}
          </button>
        </div>
        {deletedSetUndo ? (
          <div className="calendar-plan-undo-card">
            <div>
              <strong>Set removed.</strong>
              <p>{deletedSetUndo.exerciseName} set {deletedSetUndo.setIndex + 1} can be restored before saving.</p>
            </div>
            <button type="button" className="ghost-button compact-button" onClick={undoDeletedSet}>
              Undo remove
            </button>
          </div>
        ) : null}
        <div className={`workout-save-status status-${draftStatus}`} role="status" aria-live="polite" aria-atomic="true">
          <strong>{workoutDraftStatusCopy[draftStatus]}</strong>
          <span>{draftStatus === "saved-local" ? "Your latest edits can survive refresh, route changes, and a temporary interruption." : saveMessage}</span>
        </div>
        {saveMessage && draftStatus === "saved-local" ? <div className="calendar-info-card">{saveMessage}</div> : null}
      </form>
    </PageSection>
  );
}
