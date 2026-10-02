import {
  WORKOUT_DRAFT_MAX_EXERCISES,
  WORKOUT_DRAFT_MAX_SERIALIZED_CHARS,
  WORKOUT_DRAFT_MAX_SETS_PER_EXERCISE,
  serializeWorkoutDraftForStorage,
  type StoredWorkoutDraft,
  type WorkoutDraftExerciseType,
  type WorkoutExerciseLogDraft,
  type WorkoutSetDraft,
} from "./workoutDraftLifecycle.ts";
import { convertWeight, isValidLocalDateKey, type WorkoutDisplayUnit } from "./workoutStatistics.ts";
import type { WorkoutExerciseOption } from "./workoutLogAssist.ts";
import {
  WORKOUT_SETUP_OTHER_MAX_LENGTH,
  WORKOUT_SETUP_SHORT_MAX_LENGTH,
  normalizeWorkoutEquipmentSetup,
  type WorkoutEquipmentSetup,
} from "../../../lib/workoutEquipmentSetup.ts";

type ImportMode = "append" | "replace";
type UnitContext = { unit: WorkoutDisplayUnit; source: "directive" | "draft" };

export type WorkoutImportPreviewSet = WorkoutSetDraft & {
  sourceWeight: number;
  sourceUnit: WorkoutDisplayUnit | null;
};

export type WorkoutImportPreviewRow = {
  lineNumber: number;
  source: string;
  exercise: Omit<WorkoutExerciseLogDraft, "localId" | "sets" | "notes" | "setup">;
  sets: WorkoutImportPreviewSet[];
  setup: WorkoutEquipmentSetup;
  destinationAction: string;
  warnings: string[];
  errors: string[];
};

export type WorkoutImportPreview = {
  operationId: string;
  sourceText: string;
  draftFingerprint: string;
  unitContext: UnitContext;
  metadata: { performedOn?: string; durationMinutes?: string };
  metadataChanges: Array<{ field: "performedOn" | "durationMinutes"; from: string; to: string }>;
  replacementSummary: { exerciseCount: number; setCount: number };
  rows: WorkoutImportPreviewRow[];
  errors: string[];
  warnings: string[];
  canConfirm: boolean;
};

type ParseInput = {
  sourceText: string;
  draft: StoredWorkoutDraft;
  exerciseOptions: WorkoutExerciseOption[];
  today: string;
  operationId: string;
};

const normalizeName = (value: string) => value.trim().toLocaleLowerCase();

function normalizeUnit(value: string): WorkoutDisplayUnit | null {
  const normalized = value.trim().toLocaleLowerCase();
  if (normalized === "lb" || normalized === "lbs") return "lb";
  if (normalized === "kg" || normalized === "kgs") return "kg";
  return null;
}

function semanticDraftValue(draft: StoredWorkoutDraft) {
  return {
    weightUnit: draft.weightUnit,
    selectedRoutineId: draft.selectedRoutineId,
    routineOriginId: draft.routineOriginId,
    performedOn: draft.performedOn,
    durationMinutes: draft.durationMinutes,
    sessionNotes: draft.sessionNotes,
    completionReviewRequired: draft.completionReviewRequired,
    activeExerciseId: draft.activeExerciseId,
    exerciseLogs: draft.exerciseLogs,
  };
}

export function workoutImportDraftFingerprint(draft: StoredWorkoutDraft) {
  return JSON.stringify(semanticDraftValue(draft));
}

function emptyPreview(input: ParseInput, errors: string[]): WorkoutImportPreview {
  return {
    operationId: input.operationId,
    sourceText: input.sourceText,
    draftFingerprint: workoutImportDraftFingerprint(input.draft),
    unitContext: { unit: input.draft.weightUnit, source: "draft" },
    metadata: {},
    metadataChanges: [],
    replacementSummary: {
      exerciseCount: input.draft.exerciseLogs.length,
      setCount: input.draft.exerciseLogs.reduce((sum, exercise) => sum + exercise.sets.length, 0),
    },
    rows: [],
    errors,
    warnings: [],
    canConfirm: false,
  };
}

function resolveExercise(
  rawLabel: string,
  exerciseOptions: WorkoutExerciseOption[]
): { exercise: WorkoutImportPreviewRow["exercise"]; warnings: string[]; errors: string[] } {
  const identityMatch = /^(.*?)\s*\[id=([^\]]+)\]\s*$/i.exec(rawLabel);
  const requestedName = (identityMatch?.[1] || rawLabel).trim();
  const requestedId = identityMatch?.[2]?.trim() || "";
  if (!requestedName) {
    return {
      exercise: { exerciseId: null, exerciseName: "", muscleGroup: "", primaryMuscles: [], secondaryMuscles: [], exerciseType: "weighted" },
      warnings: [],
      errors: ["Exercise name is required."],
    };
  }
  let match: WorkoutExerciseOption | undefined;
  if (requestedId) {
    match = exerciseOptions.find((option) => option.exerciseId === requestedId);
    if (!match || normalizeName(match.name) !== normalizeName(requestedName)) {
      return {
        exercise: { exerciseId: null, exerciseName: requestedName, muscleGroup: "", primaryMuscles: [], secondaryMuscles: [], exerciseType: "weighted" },
        warnings: [],
        errors: [`No exact saved exercise matches ${requestedName} [id=${requestedId}].`],
      };
    }
  } else {
    const nameMatches = exerciseOptions.filter((option) => normalizeName(option.name) === normalizeName(requestedName));
    if (nameMatches.length > 1) {
      return {
        exercise: { exerciseId: null, exerciseName: requestedName, muscleGroup: "", primaryMuscles: [], secondaryMuscles: [], exerciseType: "weighted" },
        warnings: [],
        errors: [`${requestedName} matches multiple saved exercises. Add a stable ID, such as [id=${nameMatches[0].exerciseId}].`],
      };
    }
    match = nameMatches[0];
  }
  if (!match) {
    return {
      exercise: { exerciseId: null, exerciseName: requestedName, muscleGroup: "", primaryMuscles: [], secondaryMuscles: [], exerciseType: "weighted" },
      warnings: [`${requestedName} is unknown. It will be added without saved machine or muscle metadata.`],
      errors: [],
    };
  }
  return {
    exercise: {
      exerciseId: match.exerciseId,
      exerciseName: match.name,
      muscleGroup: match.muscleGroup,
      primaryMuscles: [...match.primaryMuscles],
      secondaryMuscles: [...match.secondaryMuscles],
      exerciseType: match.exerciseType,
    },
    warnings: [],
    errors: [],
  };
}

function parseSetup(parts: string[]) {
  const errors: string[] = [];
  const raw: WorkoutEquipmentSetup = {};
  const knownKeys = new Set<keyof WorkoutEquipmentSetup>(["seat", "arm", "back", "pad", "other"]);
  for (const part of parts) {
    const match = /^([a-z]+)\s*=\s*(.+)$/i.exec(part.trim());
    if (!match) {
      errors.push(`Malformed setup value "${part.trim()}".`);
      continue;
    }
    const key = match[1].toLocaleLowerCase() as keyof WorkoutEquipmentSetup;
    const value = match[2].trim();
    if (!knownKeys.has(key)) {
      errors.push(`Unknown setup key "${match[1]}".`);
      continue;
    }
    if (raw[key] !== undefined) {
      errors.push(`Duplicate setup key "${key}".`);
      continue;
    }
    const maximum = key === "other" ? WORKOUT_SETUP_OTHER_MAX_LENGTH : WORKOUT_SETUP_SHORT_MAX_LENGTH;
    if (value.length > maximum) {
      errors.push(`Setup value "${key}" is too long.`);
      continue;
    }
    raw[key] = value;
  }
  return { setup: normalizeWorkoutEquipmentSetup(raw), errors };
}

function plannedSet(reps: number, weight: number, sourceWeight: number, sourceUnit: WorkoutDisplayUnit | null): WorkoutImportPreviewSet {
  return {
    localId: "preview",
    reps,
    weight,
    notes: "",
    setType: "standard",
    completed: false,
    deleted: false,
    rir: null,
    sourceWeight,
    sourceUnit,
  };
}

function parseSetTokens(
  source: string,
  exerciseType: WorkoutDraftExerciseType,
  unitContext: UnitContext,
  destinationUnit: WorkoutDisplayUnit
) {
  const errors: string[] = [];
  const sets: WorkoutImportPreviewSet[] = [];
  const tokens = source.split(",").map((token) => token.trim()).filter(Boolean);
  if (!tokens.length) return { sets, errors: ["At least one set is required."] };
  for (const token of tokens) {
    if (/\d\s*-\s*\d/.test(token)) {
      errors.push(`Rep ranges are not supported in active workout drafts: "${token}".`);
      continue;
    }
    if (exerciseType === "bodyweight") {
      const repeated = /^(\d+)\s*x\s*(\d+)\s*reps?$/i.exec(token);
      const single = /^(\d+)\s*reps?$/i.exec(token);
      const count = repeated ? Number(repeated[1]) : 1;
      const reps = Number(repeated?.[2] || single?.[1]);
      if ((!repeated && !single) || !Number.isInteger(count) || count <= 0 || !Number.isInteger(reps) || reps <= 0) {
        errors.push(`Malformed bodyweight set "${token}". Use "8 reps" or "3x8 reps".`);
        continue;
      }
      if (count > WORKOUT_DRAFT_MAX_SETS_PER_EXERCISE || sets.length + count > WORKOUT_DRAFT_MAX_SETS_PER_EXERCISE) {
        errors.push(`An exercise may contain at most ${WORKOUT_DRAFT_MAX_SETS_PER_EXERCISE} sets.`);
        continue;
      }
      for (let index = 0; index < count; index += 1) sets.push(plannedSet(reps, 0, 0, null));
      continue;
    }
    const repeated = /^(\d+)\s*x\s*(\d+)\s*@\s*(\d+(?:\.\d+)?)\s*([a-z]+)?$/i.exec(token);
    const single = /^(\d+)\s*@\s*(\d+(?:\.\d+)?)\s*([a-z]+)?$/i.exec(token);
    const legacy = /^(\d+)\s*x\s*(\d+(?:\.\d+)?)\s*([a-z]+)?$/i.exec(token);
    const count = repeated ? Number(repeated[1]) : 1;
    const reps = Number(repeated?.[2] || single?.[1] || legacy?.[1]);
    const sourceWeight = Number(repeated?.[3] || single?.[2] || legacy?.[2]);
    const rawUnit = repeated?.[4] || single?.[3] || legacy?.[3] || "";
    if ((!repeated && !single && !legacy) || !Number.isInteger(count) || count <= 0 || !Number.isInteger(reps) || reps <= 0 || !Number.isFinite(sourceWeight) || sourceWeight <= 0) {
      errors.push(`Malformed weighted set "${token}". Use "8@100 lb", "3x8@100 lb", or legacy "8x100 lb".`);
      continue;
    }
    const sourceUnit = rawUnit ? normalizeUnit(rawUnit) : unitContext.unit;
    if (!sourceUnit) {
      errors.push(`Unknown unit in set "${token}". Use lb, lbs, kg, or kgs.`);
      continue;
    }
    if (count > WORKOUT_DRAFT_MAX_SETS_PER_EXERCISE || sets.length + count > WORKOUT_DRAFT_MAX_SETS_PER_EXERCISE) {
      errors.push(`An exercise may contain at most ${WORKOUT_DRAFT_MAX_SETS_PER_EXERCISE} sets.`);
      continue;
    }
    const normalizedWeight = convertWeight(sourceWeight, sourceUnit, destinationUnit);
    for (let index = 0; index < count; index += 1) {
      sets.push(plannedSet(reps, normalizedWeight, sourceWeight, sourceUnit));
    }
  }
  return { sets, errors };
}

export function parseWorkoutImportPreview(input: ParseInput): WorkoutImportPreview {
  if (input.sourceText.length > WORKOUT_DRAFT_MAX_SERIALIZED_CHARS) {
    return emptyPreview(input, ["Import text is too large to review safely."]);
  }
  if (!/^[a-zA-Z0-9_-]{8,256}$/.test(input.operationId)) {
    return emptyPreview(input, ["A valid import operation identity is required."]);
  }
  const globalErrors: string[] = [];
  const globalWarnings: string[] = [];
  const metadata: WorkoutImportPreview["metadata"] = {};
  let unitContext: UnitContext = { unit: input.draft.weightUnit, source: "draft" };
  const seenDirectives = new Set<string>();
  const exerciseLines: Array<{ lineNumber: number; source: string }> = [];
  input.sourceText.split(/\r?\n/).forEach((raw, index) => {
    const source = raw.trim();
    if (!source) return;
    const directive = /^(date|unit|duration)\s*:\s*(.*)$/i.exec(source);
    if (!directive) {
      exerciseLines.push({ lineNumber: index + 1, source });
      return;
    }
    const key = directive[1].toLocaleLowerCase();
    const value = directive[2].trim();
    if (seenDirectives.has(key)) {
      globalErrors.push(`Line ${index + 1}: duplicate ${key} directive.`);
      return;
    }
    seenDirectives.add(key);
    if (key === "unit") {
      const unit = normalizeUnit(value);
      if (!unit) globalErrors.push(`Line ${index + 1}: unknown unit "${value}". Use lb, lbs, kg, or kgs.`);
      else unitContext = { unit, source: "directive" };
    } else if (key === "date") {
      if (!isValidLocalDateKey(value) || value > input.today) globalErrors.push(`Line ${index + 1}: date must be a valid local date no later than ${input.today}.`);
      else metadata.performedOn = value;
    } else {
      const duration = Number(value);
      if (!Number.isInteger(duration) || duration <= 0 || duration > 1440) globalErrors.push(`Line ${index + 1}: duration must be a whole number from 1 to 1440 minutes.`);
      else metadata.durationMinutes = String(duration);
    }
  });
  if (exerciseLines.length > WORKOUT_DRAFT_MAX_EXERCISES) {
    globalErrors.push(`Import may contain at most ${WORKOUT_DRAFT_MAX_EXERCISES} exercise lines.`);
  }
  const rows = exerciseLines.slice(0, WORKOUT_DRAFT_MAX_EXERCISES).map(({ lineNumber, source }) => {
    const sections = source.split("|").map((section) => section.trim());
    const exerciseMatch = /^(.+?)\s*:\s*(.+)$/.exec(sections[0]);
    if (!exerciseMatch) {
      return {
        lineNumber,
        source,
        exercise: { exerciseId: null, exerciseName: source, muscleGroup: "", primaryMuscles: [], secondaryMuscles: [], exerciseType: "weighted" as const },
        sets: [],
        setup: {},
        destinationAction: "Blocked",
        warnings: [],
        errors: ["Exercise lines must use \"Exercise: sets\"."],
      };
    }
    const resolved = resolveExercise(exerciseMatch[1], input.exerciseOptions);
    const parsedSetup = parseSetup(sections.slice(1));
    const parsedSets = parseSetTokens(exerciseMatch[2].trim(), resolved.exercise.exerciseType, unitContext, input.draft.weightUnit);
    const destination = resolved.exercise.exerciseId
      ? input.draft.exerciseLogs.find((exercise) => exercise.exerciseId === resolved.exercise.exerciseId)
      : input.draft.exerciseLogs.find((exercise) => !exercise.exerciseId && normalizeName(exercise.exerciseName) === normalizeName(resolved.exercise.exerciseName) && exercise.exerciseType === resolved.exercise.exerciseType);
    const warnings = [...resolved.warnings];
    if (destination && Object.keys(parsedSetup.setup).some((key) => {
      const setupKey = key as keyof WorkoutEquipmentSetup;
      return Boolean(destination.setup[setupKey] && destination.setup[setupKey] !== parsedSetup.setup[setupKey]);
    })) warnings.push("Imported setup will replace a different setup value on the matched draft exercise.");
    return {
      lineNumber,
      source,
      exercise: resolved.exercise,
      sets: parsedSets.sets,
      setup: parsedSetup.setup,
      destinationAction: destination ? `Append to ${destination.exerciseName}` : `Add ${resolved.exercise.exerciseName}`,
      warnings,
      errors: [...resolved.errors, ...parsedSetup.errors, ...parsedSets.errors],
    };
  });
  if (!rows.length) globalErrors.push("Paste at least one supported exercise line.");
  const metadataChanges: WorkoutImportPreview["metadataChanges"] = [];
  if (metadata.performedOn && metadata.performedOn !== input.draft.performedOn) {
    metadataChanges.push({ field: "performedOn", from: input.draft.performedOn, to: metadata.performedOn });
  }
  if (metadata.durationMinutes && metadata.durationMinutes !== input.draft.durationMinutes) {
    metadataChanges.push({ field: "durationMinutes", from: input.draft.durationMinutes, to: metadata.durationMinutes });
  }
  const canConfirm = globalErrors.length === 0 && rows.length > 0 && rows.every((row) => row.errors.length === 0);
  return {
    operationId: input.operationId,
    sourceText: input.sourceText,
    draftFingerprint: workoutImportDraftFingerprint(input.draft),
    unitContext,
    metadata,
    metadataChanges,
    replacementSummary: {
      exerciseCount: input.draft.exerciseLogs.length,
      setCount: input.draft.exerciseLogs.reduce((sum, exercise) => sum + exercise.sets.length, 0),
    },
    rows,
    errors: globalErrors,
    warnings: globalWarnings,
    canConfirm,
  };
}

function materializeRow(row: WorkoutImportPreviewRow, createId: () => string): WorkoutExerciseLogDraft {
  return {
    localId: createId(),
    ...row.exercise,
    setup: normalizeWorkoutEquipmentSetup(row.setup),
    notes: "",
    sets: row.sets.map((set) => ({
      localId: createId(),
      reps: set.reps,
      weight: set.weight,
      notes: "",
      setType: "standard",
      completed: false,
      deleted: false,
      rir: null,
    })),
  };
}

function appendRows(current: WorkoutExerciseLogDraft[], rows: WorkoutImportPreviewRow[], createId: () => string) {
  const next = current.map((exercise) => ({ ...exercise, setup: { ...exercise.setup }, sets: exercise.sets.map((set) => ({ ...set })) }));
  for (const row of rows) {
    const index = row.exercise.exerciseId
      ? next.findIndex((exercise) => exercise.exerciseId === row.exercise.exerciseId)
      : next.findIndex((exercise) => !exercise.exerciseId && normalizeName(exercise.exerciseName) === normalizeName(row.exercise.exerciseName) && exercise.exerciseType === row.exercise.exerciseType);
    const imported = materializeRow(row, createId);
    if (index < 0) {
      next.push(imported);
      continue;
    }
    next[index] = {
      ...next[index],
      setup: { ...next[index].setup, ...imported.setup },
      sets: [...next[index].sets, ...imported.sets],
    };
  }
  return next;
}

export function applyWorkoutImportPreview(input: {
  draft: StoredWorkoutDraft;
  preview: WorkoutImportPreview;
  mode: ImportMode;
  applyMetadata: boolean;
  createId: () => string;
}): { ok: true; applied: boolean; draft: StoredWorkoutDraft } | { ok: false; error: string } {
  const appliedIds = input.draft.appliedImportOperationIds || [];
  if (appliedIds.includes(input.preview.operationId)) return { ok: true, applied: false, draft: input.draft };
  if (!input.preview.canConfirm) return { ok: false, error: "Fix every import error before confirming." };
  if (input.mode !== "append" && input.mode !== "replace") return { ok: false, error: "Choose Append or Replace before confirming." };
  if (workoutImportDraftFingerprint(input.draft) !== input.preview.draftFingerprint) {
    return { ok: false, error: "The workout draft changed while this preview was open. Refresh the preview before confirming." };
  }
  const exerciseLogs = input.mode === "append"
    ? appendRows(input.draft.exerciseLogs, input.preview.rows, input.createId)
    : input.preview.rows.map((row) => materializeRow(row, input.createId));
  if (
    exerciseLogs.length > WORKOUT_DRAFT_MAX_EXERCISES ||
    exerciseLogs.some((exercise) => exercise.sets.length > WORKOUT_DRAFT_MAX_SETS_PER_EXERCISE)
  ) {
    return { ok: false, error: "The resulting draft exceeds the supported exercise or set limit." };
  }
  const next: StoredWorkoutDraft = {
    ...input.draft,
    performedOn: input.applyMetadata && input.preview.metadata.performedOn
      ? input.preview.metadata.performedOn
      : input.draft.performedOn,
    durationMinutes: input.applyMetadata && input.preview.metadata.durationMinutes
      ? input.preview.metadata.durationMinutes
      : input.draft.durationMinutes,
    activeExerciseId: input.mode === "replace" ? exerciseLogs[0]?.localId : input.draft.activeExerciseId,
    exerciseLogs,
    appliedImportOperationIds: [...appliedIds, input.preview.operationId].slice(-20),
  };
  if (!serializeWorkoutDraftForStorage(next)) {
    return { ok: false, error: "The resulting draft is too large to store safely." };
  }
  return { ok: true, applied: true, draft: next };
}
