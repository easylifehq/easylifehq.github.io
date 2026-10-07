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
  workoutDraftStatusDetailCopy,
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
  resolveWorkoutExerciseOption,
} from "@/features/easyworkout/domain/workoutLogAssist";
import {
  createPlannedExerciseFromSuggestion,
  deriveNextExerciseSuggestions,
  workoutRecommendationSetBudget,
  type WorkoutNextExerciseSuggestion,
} from "@/features/easyworkout/domain/workoutNextExercise";
import { emptyWorkoutPlanningContext } from "@/features/easyworkout/domain/workoutPlanning";
import {
  applyExerciseIdentityEdit,
  applySetEdit,
  completeExerciseAndAdvance,
  deleteExerciseFromLogs,
  findSaveBlock,
  addBlankSetIfNeeded,
  focusedStartingExercises,
  isEmptySetRow,
  isExerciseDone,
  removeSetAt,
  undoExerciseCompletion,
} from "@/features/easyworkout/domain/workoutExerciseCompletion";
import {
  sanitizeWholeNumberInput,
  toWholeNumberDraft,
} from "@/features/easyworkout/domain/workoutNumericInput";
import { QuickWorkoutExerciseCard, quickFieldForSet, quickFieldId } from "@/features/easyworkout/components/QuickWorkoutExerciseCard";
import { QuickWorkoutNextExercise } from "@/features/easyworkout/components/QuickWorkoutNextExercise";
import { QuickWorkoutSessionStrip } from "@/features/easyworkout/components/QuickWorkoutSessionStrip";
import {
  applyWorkoutImportPreview,
  parseWorkoutImportPreview,
  workoutImportDraftFingerprint,
  type WorkoutImportPreview,
} from "@/features/easyworkout/domain/workoutImportPreview";
import { DecimalLoadInput } from "@/features/easyworkout/components/DecimalLoadInput";
import { isValidLocalDateKey, isValidWorkingSet, isWorkoutSessionCredited } from "@/features/easyworkout/domain/workoutStatistics";
import { WORKOUT_SESSION_SCHEMA_VERSION } from "@/features/easyworkout/domain/workoutSessionContract";
import {
  WORKOUT_SETUP_OTHER_MAX_LENGTH,
  WORKOUT_SETUP_SHORT_MAX_LENGTH,
  formatWorkoutEquipmentSetup,
  hasWorkoutEquipmentSetup,
  normalizeWorkoutEquipmentSetup,
  type WorkoutEquipmentSetup,
} from "@/lib/workoutEquipmentSetup";
import { WorkoutActiveClock } from "@/features/easyworkout/domain/workoutActiveClock";

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
const emptySet = (reps = 8): WorkoutSetDraft => ({
  localId: createLocalId(), reps, weight: 0, notes: "", setType: "standard", completed: false, deleted: false, rir: null,
});
const emptyExerciseLog = (setCount = 1, defaultReps = 8): WorkoutExerciseLogDraft => ({
  localId: createLocalId(),
  exerciseId: null,
  exerciseName: "",
  muscleGroup: "",
  primaryMuscles: [],
  secondaryMuscles: [],
  exerciseType: "weighted",
  setup: {},
  notes: "",
  sets: Array.from({ length: setCount }, () => emptySet(defaultReps)),
});
// Focused rows start blank (reps 0) so an untouched row is distinguishable from a partial one.
// Every new focused exercise starts with exactly one blank row; further rows grow as each row is completed.
const focusedBlankExercise = (_setCount?: number) => emptyExerciseLog(1, 0);
const blankFocusedSet = () => emptySet(0);
const freshWorkoutLogs = (focused: boolean, setCount: number) =>
  focused ? focusedStartingExercises(() => focusedBlankExercise(setCount)) : [emptyExerciseLog(setCount)];
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

export function EasyWorkoutLogPage() {
  const firstExerciseInputRef = useRef<HTMLInputElement | null>(null);
  const saveCoordinatorRef = useRef(new WorkoutSaveCoordinator<string | null>());
  const skipDraftFlushRef = useRef(false);
  const latestDraftRef = useRef<StoredWorkoutDraft | null>(null);
  const isApplyingImportRef = useRef(false);
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
  const elapsedClockRef = useRef<WorkoutActiveClock | null>(null);
  if (!elapsedClockRef.current) {
    elapsedClockRef.current = new WorkoutActiveClock(restoredDraft?.elapsedSeconds || 0, Date.now(), typeof document !== "undefined" && document.visibilityState === "visible");
  }
  const snapshotElapsedSeconds = () => elapsedClockRef.current!.snapshot(Date.now());
  const [selectedRoutineId, setSelectedRoutineId] = useState(restoredDraft?.selectedRoutineId ?? routineId ?? "");
  const [performedOn, setPerformedOn] = useState(restoredDraft?.performedOn ?? localDateKey());
  const [durationMinutes, setDurationMinutes] = useState(restoredDraft?.durationMinutes ?? "");
  const [planningContext, setPlanningContext] = useState(
    restoredDraft?.planningContext ?? emptyWorkoutPlanningContext()
  );
  const [planningDurationInput, setPlanningDurationInput] = useState(
    restoredDraft?.planningContext.plannedDurationMinutes === null || restoredDraft?.planningContext.plannedDurationMinutes === undefined
      ? ""
      : String(restoredDraft.planningContext.plannedDurationMinutes)
  );
  const [draftWeightUnit] = useState<"lb" | "kg">(restoredDraft?.weightUnit ?? settings.easyWorkout.weightUnit);
  const [sessionNotes, setSessionNotes] = useState(restoredDraft?.sessionNotes ?? "");
  const [completionReviewRequired, setCompletionReviewRequired] = useState(restoredDraft?.completionReviewRequired ?? false);
  const [exerciseLogs, setExerciseLogs] = useState<WorkoutExerciseLogDraft[]>(
    restoredDraft?.exerciseLogs.length
      ? restoredDraft.exerciseLogs
      : freshWorkoutLogs(workoutMode || gymMode, settings.easyWorkout.defaultSetCount)
  );
  const [activeExerciseId, setActiveExerciseId] = useState(restoredDraft?.activeExerciseId || restoredDraft?.exerciseLogs[0]?.localId || "");
  const [workoutPaste, setWorkoutPaste] = useState("");
  const [workoutImportPreview, setWorkoutImportPreview] = useState<WorkoutImportPreview | null>(null);
  const [workoutImportMode, setWorkoutImportMode] = useState<"append" | "replace" | null>(null);
  const [applyWorkoutImportMetadata, setApplyWorkoutImportMetadata] = useState(false);
  const [isApplyingImport, setIsApplyingImport] = useState(false);
  const [workoutImportError, setWorkoutImportError] = useState("");
  const [appliedImportOperationIds, setAppliedImportOperationIds] = useState(restoredDraft?.appliedImportOperationIds || []);
  const [saveMessage, setSaveMessage] = useState(restoredDraftRecovery?.message || "");
  const [validationMessage, setValidationMessage] = useState("");
  const [invalidFieldId, setInvalidFieldId] = useState("");
  const [draftStatus, setDraftStatus] = useState<WorkoutDraftLifecycleStatus>("saved-local");
  const [isSaving, setIsSaving] = useState(false);
  const [externalDraftConflict, setExternalDraftConflict] = useState(false);
  const [deletedSetUndo, setDeletedSetUndo] = useState<DeletedSetUndo | null>(null);
  const [pendingFocus, setPendingFocus] = useState<{ id: string; scroll: boolean } | null>(null);
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
    planningContext,
    sessionNotes,
    completionReviewRequired,
    activeExerciseId,
    exerciseLogs,
    appliedImportOperationIds,
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
  const workoutImportPreviewIsStale = Boolean(
    workoutImportPreview && latestDraftRef.current &&
    workoutImportDraftFingerprint(latestDraftRef.current) !== workoutImportPreview.draftFingerprint
  );

  useEffect(() => {
    if (didUseRestoredDraftRef.current) {
      didUseRestoredDraftRef.current = false;
      return;
    }

    const hasActiveDraftWork =
      sessionNotes.trim() ||
      durationMinutes ||
      planningContext.focusGroups.length ||
      planningContext.availableEquipment.length ||
      planningContext.plannedDurationMinutes !== null ||
      exerciseLogs.some(hasExerciseWork);

    if (hasActiveDraftWork) {
      return;
    }

    if (isLoading) return;

    if (!selectedRoutine) {
      const nextLogs = freshWorkoutLogs(workoutMode || gymMode, settings.easyWorkout.defaultSetCount);
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
        : freshWorkoutLogs(workoutMode || gymMode, settings.easyWorkout.defaultSetCount);

    setExerciseLogs(nextLogs);
    setActiveExerciseId(nextLogs[0]?.localId ?? "");
  }, [isLoading, previousByExercise, selectedRoutine, workoutMode, gymMode, settings.easyWorkout.defaultSetCount]);

  const remainingMinutes = planningContext.plannedDurationMinutes === null ? null
    : Math.max(0, planningContext.plannedDurationMinutes - elapsedSeconds / 60);
  const recommendationBudget = remainingMinutes === null ? null
    : workoutRecommendationSetBudget(remainingMinutes, settings.easyWorkout.defaultSetCount);
  // Elapsed time affects suggestions only when the fitting set budget changes.
  const cachedNextExerciseResult = useMemo(() => deriveNextExerciseSuggestions({
    planningContext,
    elapsedSeconds,
    defaultSetCount: settings.easyWorkout.defaultSetCount,
    exerciseOptions,
    exerciseLogs,
    history: previousByExercise,
  }), [recommendationBudget, exerciseLogs, exerciseOptions, planningContext, previousByExercise, settings.easyWorkout.defaultSetCount]);
  const nextExerciseResult = { ...cachedNextExerciseResult,
    remainingMinutes: cachedNextExerciseResult.remainingMinutes === null ? null : remainingMinutes };
  const nextExerciseSuggestions = nextExerciseResult.suggestions;

  const isGymModeActive = gymMode;
  const isFocusedWorkoutMode = workoutMode || isGymModeActive;

  useEffect(() => {
    if (!isFocusedWorkoutMode) return;
    const focusTimer = window.setTimeout(() => firstExerciseInputRef.current?.focus(), 0);
    return () => window.clearTimeout(focusTimer);
  }, [isFocusedWorkoutMode]);

  useEffect(() => {
    if (!pendingFocus) return;
    document.getElementById(pendingFocus.id)?.focus({ preventScroll: !pendingFocus.scroll });
    setPendingFocus(null);
  }, [pendingFocus]);

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
      if (!draft || draft.ownerId !== ownerId || !hasWorkoutDraftWork(draft)) return;
      try {
        const serialized = serializeWorkoutDraftForStorage({ ...draft, elapsedSeconds: snapshotElapsedSeconds(), updatedAt: new Date().toISOString() });
        if (serialized) window.localStorage.setItem(draftStorageKey, serialized);
      } catch {
        // The mounted page already exposes a recovery warning when local storage is unavailable.
      }
    };
    const handleVisibilityChange = () => {
      elapsedClockRef.current!.setVisible(Date.now(), document.visibilityState === "visible");
      if (document.visibilityState === "hidden") persistLatestDraft();
    };
    const handlePageHide = () => {
      elapsedClockRef.current!.setVisible(Date.now(), false);
      persistLatestDraft();
    };
    const handlePageShow = () => {
      setElapsedSeconds(elapsedClockRef.current!.setVisible(Date.now(), document.visibilityState === "visible"));
    };
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      persistLatestDraft();
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [draftStorageKey, externalDraftConflict]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateElapsed = () => setElapsedSeconds(snapshotElapsedSeconds());
    const timer = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(timer);
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
    const serialized = serializeWorkoutDraftForStorage({ ...draft, elapsedSeconds: snapshotElapsedSeconds() });
    if (!serialized) {
      setDraftStatus("sync-failed-draft-retained");
      setSaveMessage("This draft is too large to retain safely on this device. Remove extra sets or long notes before leaving.");
      return;
    }
    setDraftStatus("saving-local");
    const saveTimer = window.setTimeout(() => {
      if (skipDraftFlushRef.current) return;
      try {
        const currentDraft = latestDraftRef.current;
        if (!currentDraft || currentDraft.ownerId !== ownerId) return;
        const currentSerialized = serializeWorkoutDraftForStorage({ ...currentDraft, elapsedSeconds: snapshotElapsedSeconds(), updatedAt: new Date().toISOString() });
        if (!currentSerialized) return;
        window.localStorage.setItem(draftStorageKey, currentSerialized);
        setDraftStatus("saved-local");
      } catch {
        setDraftStatus("sync-failed-draft-retained");
        setSaveMessage("Local storage is unavailable. Keep this page open and copy the workout before leaving.");
      }
    }, 250);
    return () => {
      window.clearTimeout(saveTimer);
    };
  }, [activeExerciseId, completionReviewRequired, draftId, draftStorageKey, draftWeightUnit, durationMinutes, exerciseLogs, externalDraftConflict, ownerId, performedOn, planningContext, restoredDraft?.routineOriginId, selectedRoutineId, sessionNotes, startedAt]);

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
        currentExerciseIndex !== exerciseIndex
          ? exercise
          : isFocusedWorkoutMode
            ? removeSetAt(exercise, setIndex, blankFocusedSet)
            : exercise.sets.length === 1
              ? { ...exercise, sets: [emptySet(8)] }
              : removeSetAt(exercise, setIndex)
      )
    );
  }

  function undoDeletedSet() {
    if (!deletedSetUndo) return;

    setExerciseLogs((current) =>
      current.map((exercise) => {
        if (exercise.localId !== deletedSetUndo.exerciseLocalId) return exercise;
        // Deleting a blank focused row already re-added one; restoring it must not stack a second blank.
        if (isFocusedWorkoutMode && isEmptySetRow(deletedSetUndo.set)) {
          return addBlankSetIfNeeded(exercise, () => deletedSetUndo.set);
        }

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

  function addSuggestedExercise(suggestion: WorkoutNextExerciseSuggestion) {
    const nextExercise = createPlannedExerciseFromSuggestion(suggestion, createLocalId);
    setExerciseLogs((current) => [...current, nextExercise]);
    setActiveExerciseId(nextExercise.localId);
    setSaveMessage(`${suggestion.name} added with ${suggestion.proposedSets} planned set${suggestion.proposedSets === 1 ? "" : "s"}, no load, and nothing marked done. Copy last sets or setup separately if you want them.`);
  }

  function editSet(exerciseLocalId: string, setLocalId: string, patch: Partial<WorkoutSetDraft>) {
    setDeletedSetUndo(null);
    setInvalidFieldId("");
    setExerciseLogs((current) =>
      current.map((exercise) => (exercise.localId === exerciseLocalId ? applySetEdit(exercise, setLocalId, patch, isFocusedWorkoutMode ? blankFocusedSet : undefined) : exercise))
    );
  }

  function editExerciseIdentity(exerciseLocalId: string, patch: Partial<WorkoutExerciseLogDraft>) {
    setExerciseLogs((current) =>
      current.map((exercise) => (exercise.localId === exerciseLocalId ? applyExerciseIdentityEdit(exercise, patch) : exercise))
    );
  }

  function changeExerciseName(exercise: WorkoutExerciseLogDraft, nextName: string) {
    const match = resolveWorkoutExerciseOption(exerciseOptions, nextName, exercise.exerciseId);
    const currentOption = exercise.exerciseId ? exerciseOptions.find((entry) => entry.exerciseId === exercise.exerciseId) : undefined;
    const normalizedNextName = nextName.trim().toLocaleLowerCase();
    const normalizedCurrentName = currentOption?.name.trim().toLocaleLowerCase() || "";
    const retainsCurrentIdentity = Boolean(normalizedNextName && currentOption && (
      normalizedCurrentName.startsWith(normalizedNextName) || normalizedNextName.startsWith(normalizedCurrentName)
    ));
    editExerciseIdentity(exercise.localId, {
      exerciseName: match?.name || nextName,
      exerciseId: match?.exerciseId || (retainsCurrentIdentity ? exercise.exerciseId : null),
      muscleGroup: match?.muscleGroup || exercise.muscleGroup,
      primaryMuscles: match?.primaryMuscles.length ? match.primaryMuscles : exercise.primaryMuscles,
      secondaryMuscles: match?.secondaryMuscles.length ? match.secondaryMuscles : exercise.secondaryMuscles,
      exerciseType: match?.exerciseType || exercise.exerciseType,
    });
  }

  function finishExerciseAndAdvance(exerciseLocalId: string) {
    const result = completeExerciseAndAdvance(exerciseLogs, exerciseLocalId, () => focusedBlankExercise(settings.easyWorkout.defaultSetCount));
    if (!result.ok) {
      setValidationMessage(result.message);
      const target = exerciseLogs.find((exercise) => exercise.localId === exerciseLocalId);
      const row = target?.sets.find((set) => set.localId === result.setLocalId);
      const fieldId = target && row
        ? (result.field ? quickFieldId(row.localId, result.field === "load" ? "load" : result.field) : quickFieldForSet(target, row))
        : quickFieldId(exerciseLocalId, "name");
      setInvalidFieldId(row ? fieldId : "");
      setPendingFocus({ id: fieldId, scroll: false });
      return;
    }
    setValidationMessage("");
    setInvalidFieldId("");
    setDeletedSetUndo(null);
    setExerciseLogs(result.logs);
    setActiveExerciseId(result.activeExerciseId);
    // No success card: only a retained-draft error message stays visible.
    if (draftStatus !== "sync-failed-draft-retained") setSaveMessage("");
    setPendingFocus({ id: quickFieldId(result.activeExerciseId, "name"), scroll: true });
  }

  function reopenExercise(exerciseLocalId: string) {
    setActiveExerciseId(exerciseLocalId);
    setPendingFocus({ id: quickFieldId(exerciseLocalId, "name"), scroll: true });
  }

  function undoExerciseDone(exerciseLocalId: string) {
    setExerciseLogs((current) =>
      current.map((exercise) => (exercise.localId === exerciseLocalId ? undoExerciseCompletion(exercise) : exercise))
    );
    setActiveExerciseId(exerciseLocalId);
    setSaveMessage("Done was undone. Its sets are unperformed until you choose Done & next exercise again.");
    setPendingFocus({ id: quickFieldId(exerciseLocalId, "name"), scroll: true });
  }

  function deleteExercise(exerciseLocalId: string) {
    const result = deleteExerciseFromLogs(exerciseLogs, exerciseLocalId, () => focusedBlankExercise(settings.easyWorkout.defaultSetCount));
    setDeletedSetUndo(null);
    setExerciseLogs(result.logs);
    setActiveExerciseId(result.focusExerciseId);
    setSaveMessage("Exercise deleted from this draft.");
    setPendingFocus({ id: quickFieldId(result.focusExerciseId, "name"), scroll: true });
  }

  function previewWorkoutImport() {
    const currentDraft = latestDraftRef.current;
    if (!currentDraft) return;
    const nextPreview = parseWorkoutImportPreview({
      sourceText: workoutPaste,
      draft: currentDraft,
      exerciseOptions,
      today: localDateKey(),
      operationId: createLocalId(),
    });
    setWorkoutImportPreview(nextPreview);
    setWorkoutImportMode(null);
    setApplyWorkoutImportMetadata(false);
    setWorkoutImportError("");
    setSaveMessage(nextPreview.canConfirm
      ? "Preview ready. Choose Append or Replace; imported sets remain planned until you mark them done."
      : "Import preview found errors. Your workout draft and source text are unchanged.");
  }

  function confirmWorkoutImport() {
    if (isApplyingImportRef.current || !workoutImportPreview || !workoutImportMode) return;
    const currentDraft = latestDraftRef.current;
    if (!currentDraft) return;
    if (externalDraftConflict) {
      setWorkoutImportError("This workout changed in another tab. Reload before importing so this tab cannot overwrite it.");
      return;
    }
    isApplyingImportRef.current = true;
    setIsApplyingImport(true);
    setWorkoutImportError("");
    try {
      const result = applyWorkoutImportPreview({
        draft: currentDraft,
        preview: workoutImportPreview,
        mode: workoutImportMode,
        applyMetadata: applyWorkoutImportMetadata,
        createId: createLocalId,
      });
      if (!result.ok) {
        setWorkoutImportError(result.error);
        return;
      }
      if (!result.applied) {
        setSaveMessage("This import was already applied; no sets were duplicated.");
        setWorkoutImportPreview(null);
        return;
      }
      setExerciseLogs(result.draft.exerciseLogs);
      setActiveExerciseId(result.draft.activeExerciseId || result.draft.exerciseLogs[0]?.localId || "");
      setAppliedImportOperationIds(result.draft.appliedImportOperationIds);
      if (applyWorkoutImportMetadata) {
        setPerformedOn(result.draft.performedOn);
        setDurationMinutes(result.draft.durationMinutes);
      }
      setWorkoutImportPreview(null);
      setWorkoutImportMode(null);
      setApplyWorkoutImportMetadata(false);
      setSaveMessage("Planned sets imported into this draft. Review them and mark only performed sets done.");
    } finally {
      isApplyingImportRef.current = false;
      setIsApplyingImport(false);
    }
  }

  async function handleSaveSession(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (externalDraftConflict) {
      setDraftStatus("sync-failed-draft-retained");
      setValidationMessage("This workout changed in another tab. Reload before saving so one tab does not overwrite the other.");
      return;
    }
    if (completionReviewRequired) {
      setValidationMessage("Review which sets you performed, then choose Review complete before saving.");
      return;
    }
    const saveBlock = isFocusedWorkoutMode ? findSaveBlock(exerciseLogs) : null;
    if (saveBlock) {
      setValidationMessage(saveBlock.message);
      setActiveExerciseId(saveBlock.exerciseLocalId);
      const blocked = exerciseLogs.find((exercise) => exercise.localId === saveBlock.exerciseLocalId);
      const blockedRow = blocked?.sets.find((set) => set.localId === saveBlock.setLocalId);
      setPendingFocus({ id: blocked && blockedRow ? quickFieldForSet(blocked, blockedRow) : quickFieldId(saveBlock.exerciseLocalId, "name"), scroll: false });
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
      setValidationMessage(isFocusedWorkoutMode ? "Finish an exercise with Done & next exercise before saving. Weighted sets also need reps and a positive load." : "Mark at least one set done before saving. Weighted sets also need reps and a positive load.");
      return;
    }

    if (!isValidLocalDateKey(performedOn)) {
      setValidationMessage("Choose a valid local workout date before saving.");
      return;
    }

    const resolvedDurationMinutes = resolveWorkoutDurationMinutes(durationMinutes, snapshotElapsedSeconds());
    if (resolvedDurationMinutes == null) {
      setDraftStatus("sync-failed-draft-retained");
      setValidationMessage("This draft has been open too long to infer a truthful duration. Open Full log and enter the session duration before saving.");
      return;
    }

    setValidationMessage("");
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setDraftStatus("sync-failed-draft-retained");
      setSaveMessage("Couldn't sync — draft retained. Reconnect, then retry Save workout.");
      return;
    }

    setIsSaving(true);
    setDraftStatus("syncing");
    setSaveMessage("Syncing workout. The local draft stays until confirmation.");
    try {
      const sessionId = await saveCoordinatorRef.current.save(draftId, () => addSession({
        clientDraftId: draftId,
        schemaVersion: WORKOUT_SESSION_SCHEMA_VERSION,
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
      setSaveMessage("Couldn't sync — draft retained. Retry when the connection is ready.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
      <PageSection
        headingLevel={1}
        eyebrow={isFocusedWorkoutMode ? undefined : "Full log"}
        title={isFocusedWorkoutMode ? "Workout" : "Log workout"}
      description={isFocusedWorkoutMode ? undefined : "Use the full log when you want routine, duration, and import tools."}
      >
        {!isFocusedWorkoutMode ? (
          <div className="toolbar-row toolbar-row-compact deep-module-toolbar">
            <div>
              <strong>Full log</strong>
              <p className="helper-copy">Log fast. Details stay tucked away.</p>
            </div>
            <div className="pill-row">
              <Link className="primary-button compact-button" to="/app/easyworkout/log?gymMode=1">
                Active workout
              </Link>
            </div>
          </div>
        ) : null}

        {error ? <p className="error-copy">{error}</p> : null}
        {!isFocusedWorkoutMode ? (
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
        ) : null}
      <form className="task-composer" onSubmit={handleSaveSession}>
        {!isFocusedWorkoutMode ? (
        <details className="advanced-disclosure workout-advanced-tools">
          <summary>Import planned workout sets</summary>
          <div className="workout-quick-paste">
            <label className="field-stack">
              <span>Workout text</span>
              <textarea
                rows={7}
                value={workoutPaste}
                onChange={(event) => {
                  setWorkoutPaste(event.target.value);
                  setWorkoutImportPreview(null);
                  setWorkoutImportMode(null);
                  setApplyWorkoutImportMetadata(false);
                  setWorkoutImportError("");
                }}
                placeholder={"unit: lb\nBench Press: 3x8@135 lb\nLat Pulldown [id=machine-id]: 10@110 lb | seat=2"}
              />
            </label>
            <div className="task-composer-actions">
              <button type="button" className="button-secondary" onClick={previewWorkoutImport} disabled={!workoutPaste.trim()}>
                Preview planned sets
              </button>
              <span className="helper-copy">Use Exercise: 8@135 lb, 3x8@135 lb, or legacy 8x135 lb. This never imports completed history.</span>
            </div>
            {workoutImportPreview ? (
              <section className="workout-import-preview" aria-live="polite" aria-label="Workout import preview">
                <div className="workout-section-heading">
                  <div>
                    <span>Review before changing the draft</span>
                    <strong>{workoutImportPreview.rows.length} exercise line{workoutImportPreview.rows.length === 1 ? "" : "s"}</strong>
                  </div>
                  <button
                    type="button"
                    className="button-link"
                    onClick={() => {
                      setWorkoutImportPreview(null);
                      setWorkoutImportMode(null);
                      setApplyWorkoutImportMetadata(false);
                      setWorkoutImportError("");
                    }}
                  >
                    Cancel preview
                  </button>
                </div>
                <p className="helper-copy">
                  Source units: {workoutImportPreview.unitContext.unit} ({workoutImportPreview.unitContext.source === "draft" ? "current draft unit" : "unit directive"}).
                  Every imported row starts unperformed.
                </p>
                {workoutImportPreview.errors.length ? (
                  <ul className="error-copy" role="alert">
                    {workoutImportPreview.errors.map((errorMessage) => <li key={errorMessage}>{errorMessage}</li>)}
                  </ul>
                ) : null}
                {workoutImportPreview.appendErrors.length ? (
                  <ul className="error-copy" role="alert">
                    {workoutImportPreview.appendErrors.map((errorMessage) => <li key={errorMessage}>{errorMessage}</li>)}
                  </ul>
                ) : null}
                <div className="workout-import-preview-list">
                  {workoutImportPreview.rows.map((row) => (
                    <article key={`${row.lineNumber}-${row.source}`} className="workout-import-preview-row">
                      <div className="workout-section-heading">
                        <div>
                          <span>Line {row.lineNumber}</span>
                          <strong>{row.exercise.exerciseName || "Unrecognized exercise"}</strong>
                        </div>
                        <span>{row.destinationAction}</span>
                      </div>
                      <p className="helper-copy">
                        {row.sets.length
                          ? row.sets.map((set) => set.sourceUnit
                            ? `${set.reps}@${set.sourceWeight} ${set.sourceUnit} → ${set.weight.toFixed(2)} ${draftWeightUnit}`
                            : `${set.reps} bodyweight reps`).join(" · ")
                          : "No valid planned sets"}
                      </p>
                      {hasWorkoutEquipmentSetup(row.setup) ? <p className="helper-copy">Setup: {formatWorkoutEquipmentSetup(row.setup)}</p> : null}
                      {row.warnings.map((warning) => <p key={warning} className="helper-copy">Warning: {warning}</p>)}
                      {row.errors.length ? (
                        <ul className="error-copy" role="alert">
                          {row.errors.map((errorMessage) => <li key={errorMessage}>{errorMessage}</li>)}
                        </ul>
                      ) : null}
                    </article>
                  ))}
                </div>
                {workoutImportPreview.metadataChanges.length ? (
                  <div className="workout-import-metadata">
                    <p className="helper-copy">Imported metadata is separate from set completion and stays unchanged unless selected:</p>
                    <ul>
                      {workoutImportPreview.metadataChanges.map((change) => (
                        <li key={change.field}>{change.field === "performedOn" ? "Date" : "Duration"}: {change.from || "blank"} → {change.to}</li>
                      ))}
                    </ul>
                    <label className="workout-check-row">
                      <input
                        type="checkbox"
                        checked={applyWorkoutImportMetadata}
                        onChange={(event) => setApplyWorkoutImportMetadata(event.target.checked)}
                      />
                      <span>Apply imported date and duration</span>
                    </label>
                  </div>
                ) : null}
                <fieldset className="workout-import-mode">
                  <legend>Choose how to change this active draft</legend>
                  <label className="workout-check-row">
                    <input
                      type="radio"
                      name="workout-import-mode"
                      value="append"
                      checked={workoutImportMode === "append"}
                      disabled={Boolean(workoutImportPreview.appendErrors.length)}
                      onChange={() => setWorkoutImportMode("append")}
                    />
                    <span>Append to matching stable exercise IDs; add all other exercises separately</span>
                  </label>
                  <label className="workout-check-row">
                    <input
                      type="radio"
                      name="workout-import-mode"
                      value="replace"
                      checked={workoutImportMode === "replace"}
                      onChange={() => setWorkoutImportMode("replace")}
                    />
                    <span>Replace {workoutImportPreview.replacementSummary.exerciseCount} exercise{workoutImportPreview.replacementSummary.exerciseCount === 1 ? "" : "s"} and {workoutImportPreview.replacementSummary.setCount} set{workoutImportPreview.replacementSummary.setCount === 1 ? "" : "s"}</span>
                  </label>
                </fieldset>
                {workoutImportPreviewIsStale ? <p className="error-copy" role="alert">The active draft changed. Preview again before importing.</p> : null}
                {workoutImportError ? <p className="error-copy" role="alert">{workoutImportError}</p> : null}
                <button
                  type="button"
                  className="button-primary"
                  onClick={confirmWorkoutImport}
                  disabled={!workoutImportPreview.canConfirm || !workoutImportMode ||
                    (workoutImportMode === "append" && Boolean(workoutImportPreview.appendErrors.length)) ||
                    workoutImportPreviewIsStale || externalDraftConflict || isApplyingImport}
                >
                  {isApplyingImport ? "Importing..." : "Import as planned sets"}
                </button>
              </section>
            ) : null}
          </div>
        </details>
        ) : null}

        {isFocusedWorkoutMode ? (
          <QuickWorkoutSessionStrip
            performedOn={performedOn}
            onPerformedOnChange={setPerformedOn}
            focusGroups={planningContext.focusGroups}
            onFocusGroupsChange={(focusGroups) => setPlanningContext((current) => ({ ...current, focusGroups }))}
            sessionNotes={sessionNotes}
            onSessionNotesChange={setSessionNotes}
          />
        ) : (
        <div className="task-composer-grid">
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
          <label className="field-stack field-stack-wide">
            <span>Session notes</span>
            <input value={sessionNotes} onChange={(event) => setSessionNotes(event.target.value)} placeholder="Energy, pump, machine setup, etc." />
          </label>
        </div>
        )}


        <datalist id="workout-log-exercise-options">
          {exerciseOptions.map((option) => (
            <option key={`${option.exerciseId || "free"}-${option.name}`} value={option.selectionLabel}>
              {option.muscleGroup || "Saved exercise"}
            </option>
          ))}
        </datalist>

        {completionReviewRequired ? (
          <div className="calendar-plan-undo-card workout-completion-review" role="status" aria-live="polite">
            <div>
              <strong>Review which sets you performed</strong>
              <p>This restored draft could not distinguish planned rows from performed sets. Its values are intact, but every set starts unconfirmed. {isFocusedWorkoutMode ? "Choose Done & next exercise on each exercise you performed, then Review complete." : ""}</p>
            </div>
            <div className="pill-row">
              {!isFocusedWorkoutMode ? (
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
              ) : null}
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
            if (isFocusedWorkoutMode) {
              return (
                <QuickWorkoutExerciseCard
                  key={exercise.localId}
                  exercise={exercise}
                  exerciseIndex={exerciseIndex}
                  isActive={!activeExerciseId || activeExerciseId === exercise.localId}
                  isDone={isExerciseDone(exercise)}
                  weightUnit={draftWeightUnit}
                  invalidFieldId={invalidFieldId}
                  lastTime={settings.easyWorkout.showLastTimeHelper && previous ? {
                    performedOn: previous.performedOn,
                    setsLabel: previousSetsLabel || "",
                    sets: previous.lastSets,
                    setupLabel: previousSetupLabel,
                    bestWeight: previous.bestWeight,
                    currentHasSetup,
                  } : null}
                  nameInputRef={exerciseIndex === 0 ? firstExerciseInputRef : undefined}
                  onExerciseNameChange={(value) => changeExerciseName(exercise, value)}
                  onExerciseNotesChange={(value) => updateExerciseLog(exerciseIndex, { notes: value })}
                  onSetEdit={(setLocalId, patch) => editSet(exercise.localId, setLocalId, patch)}
                  onSetupChange={(field, value) => updateExerciseSetup(exerciseIndex, field, value)}
                  onAddSet={() => setExerciseLogs((current) => current.map((entry) => (entry.localId === exercise.localId ? addBlankSetIfNeeded(entry, () => emptySet(0)) : entry)))}
                  onRemoveSet={(setIndex) => deleteSet(exerciseIndex, setIndex)}
                  onUseLast={(mode) => fillFromLastTime(exerciseIndex, mode)}
                  onDone={() => finishExerciseAndAdvance(exercise.localId)}
                  onUndoDone={() => undoExerciseDone(exercise.localId)}
                  onEdit={() => reopenExercise(exercise.localId)}
                  onDelete={() => deleteExercise(exercise.localId)}
                />
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
                        const nextName = event.target.value;
                        const match = resolveWorkoutExerciseOption(exerciseOptions, nextName, exercise.exerciseId);
                        const currentOption = exercise.exerciseId ? exerciseOptions.find((entry) => entry.exerciseId === exercise.exerciseId) : undefined;
                        const normalizedNextName = nextName.trim().toLocaleLowerCase();
                        const normalizedCurrentName = currentOption?.name.trim().toLocaleLowerCase() || "";
                        const retainsCurrentIdentity = Boolean(normalizedNextName && currentOption && (
                          normalizedCurrentName.startsWith(normalizedNextName) || normalizedNextName.startsWith(normalizedCurrentName)
                        ));
                        updateExerciseLog(exerciseIndex, {
                          exerciseName: match?.name || nextName,
                          exerciseId: match?.exerciseId || (retainsCurrentIdentity ? exercise.exerciseId : null),
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
                          <DecimalLoadInput
                            enterKeyHint="next"
                            autoComplete="off"
                            value={set.weight}
                            placeholder="135"
                            onFocus={(event) => selectNumericInput(event.currentTarget)}
                            onClick={(event) => selectNumericInput(event.currentTarget)}
                            onMouseUp={(event) => event.preventDefault()}
                            onValueChange={(weight) => updateSet(exerciseIndex, setIndex, { weight })}
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

        {isFocusedWorkoutMode ? (
          <QuickWorkoutNextExercise
            planningContext={planningContext}
            setPlanningContext={setPlanningContext}
            planningDurationInput={planningDurationInput}
            setPlanningDurationInput={setPlanningDurationInput}
            nextExerciseResult={nextExerciseResult}
            onAddSuggestion={addSuggestedExercise}
          />
        ) : null}

        <div className="task-composer-actions workout-log-actions">
          {!isFocusedWorkoutMode ? (
            <button type="button" className="button-secondary" onClick={() => addExerciseBoxes()}>
              Add exercise
            </button>
          ) : null}
          <button type="submit" className="primary-button" disabled={isSaving}>
            {isSaving ? "Syncing…" : "Save workout"}
          </button>
        </div>
        {draftStatus === "syncing" || draftStatus === "synced" || draftStatus === "sync-failed-draft-retained" ? (
        <div className={`workout-save-status status-${draftStatus}`} role="status" aria-live="polite" aria-atomic="true">
          <strong>{workoutDraftStatusCopy[draftStatus]}</strong>
          <span>{workoutDraftStatusDetailCopy[draftStatus]}</span>
        </div>
        ) : null}
        <div className="workout-action-message" role="status" aria-live="polite" aria-atomic="true">
          {saveMessage ? <div className="calendar-info-card workout-action-message-card">
            {saveMessage}
            {deletedSetUndo ? (
              <button type="button" className="ghost-button compact-button" onClick={undoDeletedSet}>
                Undo remove
              </button>
            ) : null}
          </div> : null}
        </div>
        <div className="workout-validation-message" role="status" aria-live="polite" aria-atomic="true">
          {validationMessage ? <span>{validationMessage}</span> : null}
        </div>
      </form>
    </PageSection>
  );
}
