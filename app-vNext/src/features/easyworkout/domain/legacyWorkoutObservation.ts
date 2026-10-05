export const LEGACY_OBSERVATION_SCHEMA_VERSION = "easyworkout-legacy-observations-v1";
export const LEGACY_OBSERVATION_LIMITS = { observations: 5000, setsPerObservation: 50, text: 160, sourceText: 500, errors: 100 } as const;

export type LegacySourceKind = "handwritten-transcription" | "generated-plan-export" | "other";
export type LegacyTemporalPrecision = "day" | "week" | "month" | "unknown";
export type LegacyEquipment = "barbell" | "dumbbell" | "machine" | "cable" | "bodyweight" | "assisted" | "other" | "unknown";
export type LegacyLoadConvention = "per-hand" | "total" | "machine-stack" | "assistance" | "bodyweight" | "unknown";
export type LegacyEvidence = "performed" | "planned" | "ambiguous";
export type LegacyEvidenceBasis = "later-handwritten-policy" | "explicit-checked" | "explicit-completed" | "unchecked-prescription" | "ambiguous";

export type LegacyTemporal =
  | { precision: "day"; label: string; date: string }
  | { precision: "week"; label: string; startDate?: string; endDate?: string }
  | { precision: "month"; label: string; month: string }
  | { precision: "unknown"; label: string };

export type LegacyReviewedMapping = { seriesKey: string; seriesLabel: string; mappingBasis: "owner-reviewed-alias-manifest" };
export type LegacySet = { reps: number; loadLb?: number | null; evidence: LegacyEvidence; evidenceBasis: LegacyEvidenceBasis };
export type LegacyExercise = { sourceName: string; equipment: LegacyEquipment; loadConvention: LegacyLoadConvention; reviewedMapping?: LegacyReviewedMapping };
export type LegacyObservation = {
  sourceOrdinal: number;
  sourceLocator: string;
  sourceHash: string;
  sourceText?: string;
  temporal: LegacyTemporal;
  exercise: LegacyExercise;
  sets: LegacySet[];
};
export type LegacyObservationBatch = {
  sourceKey: string;
  sourceLabel: string;
  sourceKind: LegacySourceKind;
  unitPolicy: "lb-owner-confirmed";
  interpretationPolicyVersion: "legacy-evidence-v1";
};
export type LegacyObservationDocument = {
  schemaVersion: typeof LEGACY_OBSERVATION_SCHEMA_VERSION;
  batch: LegacyObservationBatch;
  observations: LegacyObservation[];
};

export type LegacyValidationIssue = { path: string; code: string; message: string };
export type LegacyValidationError = LegacyValidationIssue;
export type LegacyValidationWarning = LegacyValidationIssue;
export type LegacyValidationResult =
  | { valid: true; document: LegacyObservationDocument; errors: []; warnings: LegacyValidationWarning[]; truncated: false }
  | { valid: false; document: null; errors: LegacyValidationError[]; warnings: LegacyValidationWarning[]; truncated: boolean };

const SOURCE_KINDS = ["handwritten-transcription", "generated-plan-export", "other"] as const;
const EQUIPMENT = ["barbell", "dumbbell", "machine", "cable", "bodyweight", "assisted", "other", "unknown"] as const;
const CONVENTIONS = ["per-hand", "total", "machine-stack", "assistance", "bodyweight", "unknown"] as const;
const EVIDENCE = ["performed", "planned", "ambiguous"] as const;
const EVIDENCE_BASES = ["later-handwritten-policy", "explicit-checked", "explicit-completed", "unchecked-prescription", "ambiguous"] as const;
const BASES_BY_EVIDENCE: Record<string, readonly string[]> = {
  performed: ["later-handwritten-policy", "explicit-checked", "explicit-completed"],
  planned: ["unchecked-prescription"],
  ambiguous: ["ambiguous"],
};
const HASH_PATTERN = /^sha256:[0-9a-f]{64}$/;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_PATTERN = /^(\d{4})-(\d{2})$/;
type Record_ = Record<string, unknown>;

function isRecord(value: unknown): value is Record_ {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isValidLegacyDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = DATE_PATTERN.exec(value);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const parsed = new Date(0);
  parsed.setUTCHours(0, 0, 0, 0);
  parsed.setUTCFullYear(year, month - 1, day);
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

export function isValidLegacyMonth(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = MONTH_PATTERN.exec(value);
  if (!match) return false;
  const month = Number(match[2]);
  return month >= 1 && month <= 12;
}

export function validateLegacyObservationDocument(input: unknown): LegacyValidationResult {
  const errors: LegacyValidationError[] = [];
  const warnings: LegacyValidationWarning[] = [];
  let errorCount = 0;
  let truncated = false;
  const fail = (path: string, message: string, code = "invalid-value") => {
    errorCount += 1;
    if (errors.length < LEGACY_OBSERVATION_LIMITS.errors) errors.push({ path, code, message });
    else truncated = true;
  };
  const warn = (path: string, message: string, code: string) => warnings.push({ path, code, message });
  const warnUnknown = (value: Record_, allowed: readonly string[], path: string) => {
    for (const key of Object.keys(value)) if (!allowed.includes(key)) {
      const issuePath = path ? `${path}.${key}` : key;
      warn(issuePath, `${issuePath} is not part of v1 and was dropped`, "unknown-field-dropped");
    }
  };
  const text = (value: unknown, path: string, max: number): string | null => {
    if (typeof value !== "string" || value.trim() === "") { fail(path, "must be a non-blank string", "required-text"); return null; }
    if (value.length > max) { fail(path, `must be at most ${max} characters`, "text-limit"); return null; }
    return value;
  };
  const oneOf = <T extends string>(value: unknown, allowed: readonly string[], path: string): T | null => {
    if (typeof value === "string" && allowed.includes(value)) return value as T;
    fail(path, `must be one of: ${allowed.join(", ")}`, "unsupported-value");
    return null;
  };
  const onlyTemporalKeys = (value: Record_, allowed: readonly string[], path: string) => {
    for (const key of Object.keys(value)) if (!allowed.includes(key)) fail(`${path}.${key}`, "is not allowed for this precision", "unexpected-temporal-field");
  };

  const parseTemporal = (value: unknown, path: string): LegacyTemporal | null => {
    if (!isRecord(value)) { fail(path, "must be an object", "required-object"); return null; }
    const before = errorCount;
    const label = text(value.label, `${path}.label`, LEGACY_OBSERVATION_LIMITS.text);
    const precision = value.precision;
    let result: LegacyTemporal | null = null;
    if (precision === "day") {
      onlyTemporalKeys(value, ["precision", "label", "date"], path);
      if (isValidLegacyDate(value.date)) result = { precision, label: label ?? "", date: value.date };
      else fail(`${path}.date`, "must be a real YYYY-MM-DD date", "invalid-date");
    } else if (precision === "week") {
      onlyTemporalKeys(value, ["precision", "label", "startDate", "endDate"], path);
      const week: Extract<LegacyTemporal, { precision: "week" }> = { precision, label: label ?? "" };
      for (const key of ["startDate", "endDate"] as const) {
        if (value[key] === undefined) continue;
        if (isValidLegacyDate(value[key])) week[key] = value[key] as string;
        else fail(`${path}.${key}`, "must be a real YYYY-MM-DD date", "invalid-date");
      }
      if (week.startDate && week.endDate && week.endDate < week.startDate) fail(`${path}.endDate`, "must not be before startDate", "invalid-date-range");
      result = week;
    } else if (precision === "month") {
      onlyTemporalKeys(value, ["precision", "label", "month"], path);
      if (isValidLegacyMonth(value.month)) result = { precision, label: label ?? "", month: value.month };
      else fail(`${path}.month`, "must be a real YYYY-MM month", "invalid-month");
    } else if (precision === "unknown") {
      onlyTemporalKeys(value, ["precision", "label"], path);
      result = { precision, label: label ?? "" };
    } else fail(`${path}.precision`, "must be one of: day, week, month, unknown", "unsupported-value");
    return errorCount === before ? result : null;
  };

  const parseMapping = (value: unknown, path: string): LegacyReviewedMapping | null => {
    if (!isRecord(value)) { fail(path, "must be an object", "required-object"); return null; }
    warnUnknown(value, ["seriesKey", "seriesLabel", "mappingBasis"], path);
    const before = errorCount;
    const seriesKey = text(value.seriesKey, `${path}.seriesKey`, LEGACY_OBSERVATION_LIMITS.text);
    const seriesLabel = text(value.seriesLabel, `${path}.seriesLabel`, LEGACY_OBSERVATION_LIMITS.text);
    if (value.mappingBasis !== "owner-reviewed-alias-manifest") fail(`${path}.mappingBasis`, "must be owner-reviewed-alias-manifest", "unsupported-value");
    return errorCount === before && seriesKey !== null && seriesLabel !== null
      ? { seriesKey, seriesLabel, mappingBasis: "owner-reviewed-alias-manifest" }
      : null;
  };

  const parseSet = (value: unknown, path: string, allowsMissingLoad: boolean): LegacySet | null => {
    if (!isRecord(value)) { fail(path, "must be an object", "required-object"); return null; }
    warnUnknown(value, ["reps", "loadLb", "evidence", "evidenceBasis"], path);
    const before = errorCount;
    const reps = value.reps;
    if (typeof reps !== "number" || !Number.isInteger(reps) || reps < 1) fail(`${path}.reps`, "must be a positive integer", "invalid-reps");
    const loadLb = value.loadLb;
    if (loadLb === undefined || loadLb === null) {
      if (!allowsMissingLoad) fail(`${path}.loadLb`, "is required for non-bodyweight sets", "required-load");
    } else if (typeof loadLb !== "number" || !Number.isFinite(loadLb) || loadLb < 0) fail(`${path}.loadLb`, "must be a finite number of at least 0", "invalid-load");
    const evidence = oneOf<LegacyEvidence>(value.evidence, EVIDENCE, `${path}.evidence`);
    const basis = oneOf<LegacyEvidenceBasis>(value.evidenceBasis, EVIDENCE_BASES, `${path}.evidenceBasis`);
    if (evidence && basis && !BASES_BY_EVIDENCE[evidence].includes(basis)) fail(`${path}.evidenceBasis`, `is not a valid basis for ${evidence} evidence`, "evidence-basis-mismatch");
    if (errorCount !== before) return null;
    const result: LegacySet = { reps: reps as number, evidence: evidence as LegacyEvidence, evidenceBasis: basis as LegacyEvidenceBasis };
    if (loadLb !== undefined) result.loadLb = loadLb as number | null;
    return result;
  };

  const seenOrdinals = new Set<number>();
  const seenHashes = new Set<string>();
  const parseObservation = (value: unknown, path: string): LegacyObservation | null => {
    if (!isRecord(value)) { fail(path, "must be an object", "required-object"); return null; }
    warnUnknown(value, ["sourceOrdinal", "sourceLocator", "sourceHash", "sourceText", "temporal", "exercise", "sets"], path);
    const before = errorCount;
    const ordinal = value.sourceOrdinal;
    if (typeof ordinal !== "number" || !Number.isSafeInteger(ordinal) || ordinal < 1) fail(`${path}.sourceOrdinal`, "must be a positive safe integer", "invalid-ordinal");
    else if (seenOrdinals.has(ordinal)) fail(`${path}.sourceOrdinal`, "must be unique within the document", "duplicate-ordinal");
    else seenOrdinals.add(ordinal);
    const sourceLocator = text(value.sourceLocator, `${path}.sourceLocator`, LEGACY_OBSERVATION_LIMITS.text);
    if (typeof value.sourceHash !== "string" || !HASH_PATTERN.test(value.sourceHash)) fail(`${path}.sourceHash`, "must match sha256:<64 lowercase hex>", "invalid-source-hash");
    else if (seenHashes.has(value.sourceHash)) warn(`${path}.sourceHash`, "duplicate source hash retained as a distinct ordinal", "duplicate-source-hash");
    else seenHashes.add(value.sourceHash);
    let sourceText: string | undefined;
    if (value.sourceText !== undefined) {
      if (typeof value.sourceText !== "string") fail(`${path}.sourceText`, "must be a string", "invalid-text");
      else if (value.sourceText.length > LEGACY_OBSERVATION_LIMITS.sourceText) fail(`${path}.sourceText`, `must be at most ${LEGACY_OBSERVATION_LIMITS.sourceText} characters`, "text-limit");
      else sourceText = value.sourceText;
    }
    const temporal = parseTemporal(value.temporal, `${path}.temporal`);
    let exercise: LegacyExercise | null = null;
    if (!isRecord(value.exercise)) fail(`${path}.exercise`, "must be an object", "required-object");
    else {
      warnUnknown(value.exercise, ["sourceName", "equipment", "loadConvention", "reviewedMapping"], `${path}.exercise`);
      const exerciseBefore = errorCount;
      const sourceName = text(value.exercise.sourceName, `${path}.exercise.sourceName`, LEGACY_OBSERVATION_LIMITS.text);
      const equipment = oneOf<LegacyEquipment>(value.exercise.equipment, EQUIPMENT, `${path}.exercise.equipment`);
      const loadConvention = oneOf<LegacyLoadConvention>(value.exercise.loadConvention, CONVENTIONS, `${path}.exercise.loadConvention`);
      const reviewedMapping = value.exercise.reviewedMapping === undefined ? undefined : parseMapping(value.exercise.reviewedMapping, `${path}.exercise.reviewedMapping`);
      if (errorCount === exerciseBefore && sourceName !== null && equipment && loadConvention && reviewedMapping !== null) {
        exercise = { sourceName, equipment, loadConvention };
        if (reviewedMapping) exercise.reviewedMapping = reviewedMapping;
      }
    }
    const sets: LegacySet[] = [];
    if (!Array.isArray(value.sets)) fail(`${path}.sets`, "must be an array", "required-array");
    else if (value.sets.length > LEGACY_OBSERVATION_LIMITS.setsPerObservation) fail(`${path}.sets`, `must have at most ${LEGACY_OBSERVATION_LIMITS.setsPerObservation} sets`, "set-limit");
    else if (value.sets.length === 0) warn(`${path}.sets`, "observation has no sets; retained as source evidence and excluded from trends", "empty-sets");
    else {
      const allowsMissingLoad = exercise?.equipment === "bodyweight" || exercise?.loadConvention === "bodyweight";
      value.sets.forEach((entry, index) => {
        const parsed = parseSet(entry, `${path}.sets[${index}]`, allowsMissingLoad);
        if (parsed) sets.push(parsed);
      });
    }
    if (errorCount !== before || !temporal || !exercise || sourceLocator === null) return null;
    const parsed: LegacyObservation = { sourceOrdinal: ordinal as number, sourceLocator, sourceHash: value.sourceHash as string, temporal, exercise, sets };
    if (sourceText !== undefined) parsed.sourceText = sourceText;
    return parsed;
  };

  if (!isRecord(input)) {
    fail("", "document must be an object", "required-object");
    return { valid: false, document: null, errors, warnings, truncated };
  }
  warnUnknown(input, ["schemaVersion", "batch", "observations"], "");
  if (input.schemaVersion !== LEGACY_OBSERVATION_SCHEMA_VERSION) fail("schemaVersion", `must be ${LEGACY_OBSERVATION_SCHEMA_VERSION}`, "unsupported-schema");
  let batch: LegacyObservationBatch | null = null;
  if (!isRecord(input.batch)) fail("batch", "must be an object", "required-object");
  else {
    warnUnknown(input.batch, ["sourceKey", "sourceLabel", "sourceKind", "unitPolicy", "interpretationPolicyVersion"], "batch");
    const before = errorCount;
    const sourceKey = text(input.batch.sourceKey, "batch.sourceKey", LEGACY_OBSERVATION_LIMITS.text);
    const sourceLabel = text(input.batch.sourceLabel, "batch.sourceLabel", LEGACY_OBSERVATION_LIMITS.text);
    const sourceKind = oneOf<LegacySourceKind>(input.batch.sourceKind, SOURCE_KINDS, "batch.sourceKind");
    if (input.batch.unitPolicy !== "lb-owner-confirmed") fail("batch.unitPolicy", "must be lb-owner-confirmed", "unsupported-unit-policy");
    if (input.batch.interpretationPolicyVersion !== "legacy-evidence-v1") fail("batch.interpretationPolicyVersion", "must be legacy-evidence-v1", "unsupported-policy");
    if (errorCount === before && sourceKey !== null && sourceLabel !== null && sourceKind) batch = { sourceKey, sourceLabel, sourceKind, unitPolicy: "lb-owner-confirmed", interpretationPolicyVersion: "legacy-evidence-v1" };
  }
  const observations: LegacyObservation[] = [];
  if (!Array.isArray(input.observations)) fail("observations", "must be an array", "required-array");
  else if (input.observations.length > LEGACY_OBSERVATION_LIMITS.observations) fail("observations", `must have at most ${LEGACY_OBSERVATION_LIMITS.observations} observations`, "observation-limit");
  else input.observations.forEach((entry, index) => { const parsed = parseObservation(entry, `observations[${index}]`); if (parsed) observations.push(parsed); });
  if (errorCount > 0 || !batch) return { valid: false, document: null, errors, warnings, truncated };
  observations.sort((left, right) => left.sourceOrdinal - right.sourceOrdinal);
  return { valid: true, document: { schemaVersion: LEGACY_OBSERVATION_SCHEMA_VERSION, batch, observations }, errors: [], warnings, truncated: false };
}

export function parseLegacyObservationJson(text: string): LegacyValidationResult {
  try { return validateLegacyObservationDocument(JSON.parse(text)); }
  catch { return { valid: false, document: null, errors: [{ path: "", code: "json-syntax", message: "document must be valid JSON" }], warnings: [], truncated: false }; }
}

export type LegacyObservationPreview = {
  valid: boolean;
  errors: LegacyValidationError[];
  warnings: string[];
  observationCount: number;
  setCount: number;
  precisionCounts: Record<LegacyTemporalPrecision, number>;
  evidenceCounts: Record<LegacyEvidence, number>;
  excludedFromTrends: { planned: number; ambiguous: number };
  emptySetObservations: number;
  observationsWithoutPerformedSets: number;
};

export function previewLegacyObservationDocument(input: unknown): LegacyObservationPreview {
  const result = validateLegacyObservationDocument(input);
  const precisionCounts: Record<LegacyTemporalPrecision, number> = { day: 0, week: 0, month: 0, unknown: 0 };
  const evidenceCounts: Record<LegacyEvidence, number> = { performed: 0, planned: 0, ambiguous: 0 };
  const warnings = result.warnings.map((warning) => `${warning.path || "document"}: ${warning.message}`);
  let setCount = 0;
  let emptySetObservations = 0;
  let observationsWithoutPerformedSets = 0;
  if (result.valid) {
    for (const observation of result.document.observations) {
      precisionCounts[observation.temporal.precision] += 1;
      if (observation.sets.length === 0) emptySetObservations += 1;
      if (!observation.sets.some((entry) => entry.evidence === "performed")) observationsWithoutPerformedSets += 1;
      for (const entry of observation.sets) { evidenceCounts[entry.evidence] += 1; setCount += 1; }
    }
    if (evidenceCounts.planned > 0) warnings.push(`${evidenceCounts.planned} planned set(s) are excluded from trends.`);
    if (evidenceCounts.ambiguous > 0) warnings.push(`${evidenceCounts.ambiguous} ambiguous set(s) are excluded from trends.`);
  }
  return {
    valid: result.valid,
    errors: result.errors,
    warnings,
    observationCount: result.valid ? result.document.observations.length : 0,
    setCount,
    precisionCounts,
    evidenceCounts,
    excludedFromTrends: { planned: evidenceCounts.planned, ambiguous: evidenceCounts.ambiguous },
    emptySetObservations,
    observationsWithoutPerformedSets,
  };
}
