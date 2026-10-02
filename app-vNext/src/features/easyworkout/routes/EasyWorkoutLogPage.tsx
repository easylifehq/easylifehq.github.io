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
  recoverWorkoutDraftFromStorage,
  resolveWorkoutDurationMinutes,
  serializeWorkoutDraftForStorage,
  workoutDraftStatusCopy,
  type StoredWorkoutDraft,
  type WorkoutDraftLifecycleStatus,
  type WorkoutExerciseLogDraft,
  type WorkoutSetDraft,
} from "@/features/easyworkout/domain/workoutDraftLifecycle";
import {
  buildWorkoutExerciseOptions,
  deriveExerciseHistory,
  fillSetsFromLastPerformance,
  findExerciseHistory,
} from "@/features/easyworkout/domain/workoutLogAssist";
import { isValidLocalDateKey, isValidWorkingSet, isWorkoutSessionCredited } from "@/features/easyworkout/domain/workoutStatistics";
import {
  WORKOUT_SETUP_OTHER_MAX_LENGTH,
  WORKOUT_SETUP_SHORT_MAX_LENGTH,
  formatWorkoutEquipmentSetup,
  hasWorkoutEquipmentSetup,
  normalizeWorkoutEquipmentSetup,
  type WorkoutEquipmentSetup,
} from "@/lib/workoutEquipmentSetup";
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
  localId: createLocalId(), reps: 8, weight: 0, notes: "", setType: "standard", completed: false, deleted: false, rir: null,
});
const emptyExerciseLog = (setCount = 1): WorkoutExerciseLogDraft => ({
  localId: createLocalId(),
  exerciseId: null,
  exerciseName: "",
  muscleGroup: "",
  primaryMuscles: [],
  secondaryMuscles: [],
  exerciseType: "weighted",
  setup: {},
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
  hasWorkoutEquipmentSetup(exercise.setup) ||
  (exercise.exerciseType !== "weighted" && exercise.sets.some((set) => set.reps > 0 || (set.durationSeconds || 0) > 0 || (set.distanceMeters || 0) > 0)) ||
  exercise.sets.some(hasSetWork);

function readStoredWorkoutDraft(storageKey: string, ownerId: string, defaultWeightUnit: "lb" | "kg") {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    return recoverWorkoutDraftFromStorage(raw, { today: localDateKey(), nowIso: new Date().toISOString(), ownerId, defaultWeightUnit, createId: createLocalId });
  } catch {
    return { draft: null, message: "The saved workout draft was unreadable. Start a new workout; no remote data was changed.", migrated: false };
  }
}

type WorkoutExerciseSuggestion = {
  exerciseId: string | null;
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
  const latestDraftRef = useRef<StoredWorkoutDraft | null>(null);
  const elapsedTickRef = useRef(Date.now());
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
  const { routines, exercises, sessions, addSession, isLoading, error } = useEasyWorkout();
  const [draftId] = useState(restoredDraft?.draftId || createLocalId());
  const [startedAt] = useState(restoredDraft?.startedAt || new Date().toISOString());
  const [elapsedSeconds, setElapsedSeconds] = useState(restoredDraft?.elapsedSeconds || 0);
  const [selectedRoutineId, setSelectedRoutineId] = useState(restoredDraft?.selectedRoutineId ?? routineId ?? "");
  const [performedOn, setPerformedOn] = useState(restoredDraft?.performedOn ?? localDateKey());
  const [durationMinutes, setDurationMinutes] = useState(restoredDraft?.durationMinutes ?? "");
  const [draftWeightUnit] = useState<"lb" | "kg">(restoredDraft?.weightUnit ?? settings.easyWorkout.weightUnit);
  const [sessionNotes, setSessionNotes] = useState(restoredDraft?.sessionNotes ?? "");
  const [completionReviewRequired, setCompletionReviewRequired] = useState(restoredDraft?.completionReviewRequired ?? false);
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
  const [externalDraftConflict, setExternalDraftConflict] = useState(false);
  const [deletedSetUndo, setDeletedSetUndo] = useState<DeletedSetUndo | null>(null);
  const todayKey = localDateKey();
  const todayLoggedCount = sessions.filter((session) => session.performedOn === todayKey && isWorkoutSessionCredited(session)).length;

  latestDraftRef.current = {
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
    completionReviewRequired,
    activeExerciseId,
    exerciseLogs,
    updatedAt: new Date().toISOString(),
  };

  const selectedRoutine = useMemo(
    () => routines.find((routine) => routine.id === selectedRoutineId) || null,
    [routines, selectedRoutineId]
  );
  const previousByExercise = useMemo(
    () => deriveExerciseHistory(sessions, draftWeightUnit),
    [draftWeightUnit, sessions]
  );
  const exerciseOptions = useMemo(
    () => buildWorkoutExerciseOptions(exercises, sessions, defaultWorkoutExercises),
    [exercises, sessions]
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

    if (isLoading) return;

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
        ? selectedRoutine.exercises.map((exercise) => {
            const baseSets = Array.from({ length: Math.max(exercise.targetSets, 1) }, () => ({
              reps: Number(exercise.targetReps.split("-")[0]) || 8,
              weight: exercise.targetWeight || 0,
              localId: createLocalId(),
              notes: "",
              setType: "standard" as const,
              completed: false,
              deleted: false,
              rir: null,
            }));
            const previous = findExerciseHistory(previousByExercise, exercise.exerciseName, exercise.exerciseId);
            const sets = fillSetsFromLastPerformance(baseSets, previous).map((set) =>
              exercise.targetWeight == null ? set : { ...set, weight: exercise.targetWeight }
            );
            return {
              localId: createLocalId(),
              exerciseId: exercise.exerciseId,
              exerciseName: exercise.exerciseName,
              muscleGroup: exercise.muscleGroup,
              primaryMuscles: exercise.muscleGroup ? [exercise.muscleGroup] : [],
              secondaryMuscles: [],
              exerciseType: "weighted" as const,
              setup: {},
              notes: exercise.notes,
              sets,
            };
          })
        : workoutMode || gymMode
          ? startingWorkoutLogs(settings.easyWorkout.focusedExerciseCount, settings.easyWorkout.defaultSetCount)
          : [emptyExerciseLog(settings.easyWorkout.defaultSetCount)];

    setExerciseLogs(nextLogs);
    setActiveExerciseId(nextLogs[0]?.localId ?? "");
  }, [isLoading, previousByExercise, selectedRoutine, workoutMode, gymMode, settings.easyWorkout.focusedExerciseCount, settings.easyWorkout.defaultSetCount]);

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
    const options = [...exerciseOptions].filter(
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
        const previous = findExerciseHistory(previousByExercise, exercise.name, exercise.exerciseId);
        return {
          exerciseId: exercise.exerciseId,
          name: exercise.name,
          muscleGroup: exercise.muscleGroup,
          reason: targetGroups.includes(exercise.muscleGroup)
            ? `${exercise.muscleGroup} is still in today's lane.`
            : "Good general slot if you need one more lift.",
          detail: exerciseSuggestionDetails[exercise.name] || `Use this when ${exercise.muscleGroup || "this area"} still needs controlled volume.`,
          target: previous?.lastWeight
            ? `Last completed: ${previous.lastWeight.toFixed(1)} ${draftWeightUnit} x ${previous.lastReps || 8}.`
            : "Start with a clean warm-up weight and log what moved well.",
        };
      });
  }, [activeExerciseId, exerciseLogs, exerciseOptions, previousByExercise]);

  const isGymModeActive = gymMode;
  const isFocusedWorkoutMode = workoutMode || isGymModeActive;

  useEffect(() => {
    if (!isFocusedWorkoutMode) return;
    const focusTimer = window.setTimeout(() => firstExerciseInputRef.current?.focus(), 0);
    return () => window.clearTimeout(focusTimer);
  }, [isFocusedWorkoutMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleExternalDraftChange = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage || event.key !== draftStorageKey) return;
      skipDraftFlushRef.current = true;
      setExternalDraftConflict(true);
      setDraftStatus("sync-failed-draft-retained");
      setSaveMessage("This workout changed in another tab. Reload before editing or saving so one tab does not overwrite the other.");
    };
    window.addEventListener("storage", handleExternalDraftChange);
    return () => window.removeEventListener("storage", handleExternalDraftChange);
  }, [draftStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const persistLatestDraft = () => {
      if (skipDraftFlushRef.current || externalDraftConflict) return;
      const draft = latestDraftRef.current;
      if (!draft || !hasWorkoutDraftWork(draft)) return;
      try {
        const serialized = serializeWorkoutDraftForStorage({ ...draft, updatedAt: new Date().toISOString() });
        if (serialized) window.localStorage.setItem(draftStorageKey, serialized);
      } catch {
        // The mounted page already exposes a recovery warning when local storage is unavailable.
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") persistLatestDraft();
    };
    window.addEventListener("pagehide", persistLatestDraft);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", persistLatestDraft);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [draftStorageKey, externalDraftConflict]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateElapsed = () => {
      const now = Date.now();
      const previousTick = elapsedTickRef.current;
      elapsedTickRef.current = now;
      if (document.visibilityState !== "visible") return;
      const activeSeconds = Math.max(0, Math.min(30, Math.floor((now - previousTick) / 1000)));
      if (activeSeconds) setElapsedSeconds((current) => current + activeSeconds);
    };
    const timer = window.setInterval(updateElapsed, 1000);
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") updateElapsed();
      else elapsedTickRef.current = Date.now();
    };
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
    const draft = latestDraftRef.current;
    if (!draft) return;
    if (!hasWorkoutDraftWork(draft)) {
      window.localStorage.removeItem(draftStorageKey);
      return;
    }
    if (externalDraftConflict) return;
    const serialized = serializeWorkoutDraftForStorage(draft);
    if (!serialized) {
      setDraftStatus("sync-failed-draft-retained");
      setSaveMessage("This draft is too large to retain safely on this device. Remove extra sets or long notes before leaving.");
      return;
    }
    setDraftStatus("saving-local");
    const saveTimer = window.setTimeout(() => {
      if (skipDraftFlushRef.current) return;
      try {
        window.localStorage.setItem(draftStorageKey, serialized);
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
        const finalSerialized = serializeWorkoutDraftForStorage({ ...draft, updatedAt: new Date().toISOString() });
        if (finalSerialized) window.localStorage.setItem(draftStorageKey, finalSerialized);
      } catch {
        // The visible status from the mounted page already explains local storage failures.
      }
    };
  }, [activeExerciseId, completionReviewRequired, draftId, draftStorageKey, draftWeightUnit, durationMinutes, elapsedSeconds, exerciseLogs, externalDraftConflict, ownerId, performedOn, restoredDraft?.routineOriginId, selectedRoutineId, sessionNotes, startedAt]);

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

  function fillFromLastTime(exerciseIndex: number, mode: "sets" | "setup" | "both") {
    const exercise = exerciseLogs[exerciseIndex];
    const previous = findExerciseHistory(previousByExercise, exercise.exerciseName, exercise.exerciseId);
    if (!previous) return;

    const next: Partial<WorkoutExerciseLogDraft> = {};
    if (mode === "sets" || mode === "both") next.sets = fillSetsFromLastPerformance(exercise.sets, previous);
    if (mode === "setup" || mode === "both") next.setup = normalizeWorkoutEquipmentSetup(previous.lastSetup);
    updateExerciseLog(exerciseIndex, next);
    setSaveMessage(`${mode === "sets" ? "Last sets" : mode === "setup" ? "Last setup" : "Last sets and setup"} copied as editable draft values. No set was marked done.`);
  }

  function updateExerciseSetup(exerciseIndex: number, field: keyof WorkoutEquipmentSetup, value: string) {
    const exercise = exerciseLogs[exerciseIndex];
    const maximum = field === "other" ? WORKOUT_SETUP_OTHER_MAX_LENGTH : WORKOUT_SETUP_SHORT_MAX_LENGTH;
    updateExerciseLog(exerciseIndex, { setup: { ...exercise.setup, [field]: value.slice(0, maximum) } });
  }

  function addExerciseBoxes(count = 1) {
    const nextBoxes = Array.from({ length: count }, () => emptyExerciseLog(settings.easyWorkout.defaultSetCount));
    setExerciseLogs((current) => [...current, ...nextBoxes]);
    setActiveExerciseId(nextBoxes[0]?.localId ?? "");
  }

  function addSuggestedExercise(suggestion: WorkoutExerciseSuggestion) {
    const previous = findExerciseHistory(previousByExercise, suggestion.name, suggestion.exerciseId);
    const nextExercise: WorkoutExerciseLogDraft = {
      ...emptyExerciseLog(settings.easyWorkout.defaultSetCount),
      exerciseId: suggestion.exerciseId,
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
          setup: {},
          notes: "",
          sets: [
            {
              reps: Number(match[2]) || 0,
              weight: Number(match[3]) || 0,
              notes: "",
              localId: createLocalId(),
              setType: "standard" as const,
              completed: false,
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
    if (externalDraftConflict) {
      setDraftStatus("sync-failed-draft-retained");
      setSaveMessage("This workout changed in another tab. Reload before saving so one tab does not overwrite the other.");
      return;
    }
    if (completionReviewRequired) {
      setSaveMessage("Review which sets you performed, then choose Review complete before saving.");
      return;
    }
    const cleanedExercises = exerciseLogs
      .filter((exercise) => exercise.exerciseName.trim())
      .map((exercise) => ({
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        muscleGroup: exercise.muscleGroup,
        primaryMuscles: exercise.primaryMuscles,
        secondaryMuscles: exercise.secondaryMuscles,
        exerciseType: exercise.exerciseType,
        setup: normalizeWorkoutEquipmentSetup(exercise.setup),
        notes: exercise.notes,
        sets: exercise.sets
          .filter((set) => isValidWorkingSet(set, exercise.exerciseType))
          .map(({ localId: _localId, ...set }) => set),
      }))
      .filter((exercise) => exercise.sets.length);

    if (!cleanedExercises.length) {
      setSaveMessage("Mark at least one set done before saving. Weighted sets also need reps and a positive load.");
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

    const resolvedDurationMinutes = resolveWorkoutDurationMinutes(durationMinutes, elapsedSeconds);
    if (resolvedDurationMinutes == null) {
      setDraftStatus("sync-failed-draft-retained");
      setSaveMessage("This draft has been open too long to infer a truthful duration. Open Full log and enter the session duration before saving.");
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
        durationMinutes: resolvedDurationMinutes,
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

        <datalist id="workout-log-exercise-options">
          {exerciseOptions.map((option) => (
            <option key={`${option.exerciseId || "free"}-${option.name}`} value={option.name}>
              {option.muscleGroup || "Saved exercise"}
            </option>
          ))}
        </datalist>

        {completionReviewRequired ? (
          <div className="calendar-plan-undo-card workout-completion-review" role="status" aria-live="polite">
            <div>
              <strong>Review which sets you performed</strong>
              <p>This restored draft could not distinguish planned rows from performed sets. Its values are intact, but every set starts unconfirmed.</p>
            </div>
            <div className="pill-row">
              <button
                type="button"
                className="button-secondary compact-button"
                onClick={() => {
                  setExerciseLogs((current) => current.map((exercise) => ({
                    ...exercise,
                    sets: exercise.sets.map((set) => ({ ...set, completed: !set.deleted })),
                  })));
                  setCompletionReviewRequired(false);
                  setSaveMessage("All shown sets were marked done. You can still undo any set before saving.");
                }}
              >
                Mark all shown sets done
              </button>
              <button
                type="button"
                className="ghost-button compact-button"
                onClick={() => {
                  setCompletionReviewRequired(false);
                  setSaveMessage("Review complete. Only sets marked done will be saved.");
                }}
              >
                Review complete
              </button>
            </div>
          </div>
        ) : null}

        <div className="task-list-vnext workout-exercise-list">
          {exerciseLogs.map((exercise, exerciseIndex) => {
            const previous = findExerciseHistory(previousByExercise, exercise.exerciseName, exercise.exerciseId);
            const previousSetupLabel = formatWorkoutEquipmentSetup(previous?.lastSetup);
            const currentHasSetup = hasWorkoutEquipmentSetup(exercise.setup);
            const previousSetsLabel = previous?.lastSets.map((set) => {
              if (exercise.exerciseType === "bodyweight") return `${set.reps} reps`;
              if (exercise.exerciseType === "duration") return `${set.durationSeconds || 0} sec`;
              if (exercise.exerciseType === "distance") return `${set.distanceMeters || 0} m`;
              return `${set.reps} × ${set.weight.toFixed(1)} ${draftWeightUnit}`;
            }).join(" · ");
            const loggedSetCount = exercise.sets.filter((set) => isValidWorkingSet(set, exercise.exerciseType, { requiresExplicitCompletion: true })).length;
            const lastLoggedSet = [...exercise.sets].reverse().find((set) => isValidWorkingSet(set, exercise.exerciseType, { requiresExplicitCompletion: true }));
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
                    <span>Last completed on {previous.performedOn}</span>
                    <strong>{previousSetsLabel}</strong>
                    {previousSetupLabel ? <span>{previousSetupLabel}</span> : null}
                    <div className="task-composer-actions workout-last-time-actions">
                      <button
                        type="button"
                        className="primary-button compact-button"
                        onClick={() => fillFromLastTime(exerciseIndex, previousSetupLabel && !currentHasSetup ? "both" : "sets")}
                      >
                        {previousSetupLabel && !currentHasSetup ? "Use last sets & setup" : "Use last sets"}
                      </button>
                      {previousSetupLabel && currentHasSetup ? (
                        <button type="button" className="button-secondary compact-button" onClick={() => fillFromLastTime(exerciseIndex, "setup")}>
                          Use last setup
                        </button>
                      ) : null}
                    </div>
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
                      list="workout-log-exercise-options"
                      autoComplete="off"
                      value={exercise.exerciseName}
                      onChange={(event) => {
                        const match = exerciseOptions.find((entry) => entry.name.toLocaleLowerCase() === event.target.value.trim().toLocaleLowerCase());
                        updateExerciseLog(exerciseIndex, {
                          exerciseName: event.target.value,
                          exerciseId: match?.exerciseId || null,
                          muscleGroup: match?.muscleGroup || exercise.muscleGroup,
                          primaryMuscles: match?.primaryMuscles.length ? match.primaryMuscles : exercise.primaryMuscles,
                          secondaryMuscles: match?.secondaryMuscles.length ? match.secondaryMuscles : exercise.secondaryMuscles,
                          exerciseType: match?.exerciseType || exercise.exerciseType,
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

                <div className="workout-setup-fields">
                  <label className="field-stack">
                    <span>Seat</span>
                    <input
                      aria-label={`${exercise.exerciseName || `Exercise ${exerciseIndex + 1}`} seat setting`}
                      value={exercise.setup.seat || ""}
                      maxLength={WORKOUT_SETUP_SHORT_MAX_LENGTH}
                      onChange={(event) => updateExerciseSetup(exerciseIndex, "seat", event.target.value)}
                      placeholder="2"
                    />
                  </label>
                  <label className="field-stack">
                    <span>Arm</span>
                    <input
                      aria-label={`${exercise.exerciseName || `Exercise ${exerciseIndex + 1}`} arm setting`}
                      value={exercise.setup.arm || ""}
                      maxLength={WORKOUT_SETUP_SHORT_MAX_LENGTH}
                      onChange={(event) => updateExerciseSetup(exerciseIndex, "arm", event.target.value)}
                      placeholder="4"
                    />
                  </label>
                  <details className="workout-more-setup">
                    <summary>More setup</summary>
                    <div className="workout-more-setup-grid">
                      <label className="field-stack"><span>Back</span><input aria-label={`${exercise.exerciseName || `Exercise ${exerciseIndex + 1}`} back setting`} value={exercise.setup.back || ""} maxLength={WORKOUT_SETUP_SHORT_MAX_LENGTH} onChange={(event) => updateExerciseSetup(exerciseIndex, "back", event.target.value)} /></label>
                      <label className="field-stack"><span>Pad</span><input aria-label={`${exercise.exerciseName || `Exercise ${exerciseIndex + 1}`} pad setting`} value={exercise.setup.pad || ""} maxLength={WORKOUT_SETUP_SHORT_MAX_LENGTH} onChange={(event) => updateExerciseSetup(exerciseIndex, "pad", event.target.value)} /></label>
                      <label className="field-stack workout-setup-other"><span>Other setup</span><input aria-label={`${exercise.exerciseName || `Exercise ${exerciseIndex + 1}`} other setup`} value={exercise.setup.other || ""} maxLength={WORKOUT_SETUP_OTHER_MAX_LENGTH} onChange={(event) => updateExerciseSetup(exerciseIndex, "other", event.target.value)} placeholder="Left tower, neutral handles" /></label>
                    </div>
                  </details>
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
                            className={`${set.completed ? "button-secondary is-complete" : "primary-button"} compact-button workout-completion-button`}
                            aria-label={`${exercise.exerciseName || `Exercise ${exerciseIndex + 1}`} set ${setIndex + 1}: ${set.completed ? "Undo done" : "Mark done"}`}
                            aria-pressed={set.completed}
                            onClick={() => updateSet(exerciseIndex, setIndex, { completed: !set.completed })}
                          >
                            {set.completed ? "Undo done" : "Mark done"}
                          </button>
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
                          updateExerciseLog(exerciseIndex, { sets: [...exercise.sets, { ...previousSet, localId: createLocalId(), completed: false }] });
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
