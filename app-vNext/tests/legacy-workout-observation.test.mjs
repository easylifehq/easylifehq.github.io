import assert from "node:assert/strict";
import test from "node:test";
import { parseLegacyObservationJson, previewLegacyObservationDocument, validateLegacyObservationDocument } from "../src/features/easyworkout/domain/legacyWorkoutObservation.ts";

const HASH = `sha256:${"a".repeat(64)}`;

function set(overrides = {}) {
  return { reps: 8, loadLb: 35, evidence: "performed", evidenceBasis: "later-handwritten-policy", ...overrides };
}

function observation(ordinal, overrides = {}) {
  return {
    sourceOrdinal: ordinal,
    sourceLocator: `page-001-row-${String(ordinal).padStart(3, "0")}`,
    sourceHash: HASH,
    temporal: { precision: "day", label: "Jan 6 2020", date: "2020-01-06" },
    exercise: { sourceName: "Dumbbell row", equipment: "dumbbell", loadConvention: "per-hand" },
    sets: [set()],
    ...overrides,
  };
}

function doc(observations = [observation(1)], batch = {}) {
  return {
    schemaVersion: "easyworkout-legacy-observations-v1",
    batch: {
      sourceKey: "synthetic-notebook-a",
      sourceLabel: "Synthetic training notebook",
      sourceKind: "handwritten-transcription",
      unitPolicy: "lb-owner-confirmed",
      interpretationPolicyVersion: "legacy-evidence-v1",
      ...batch,
    },
    observations,
  };
}

const codes = (result) => result.errors.map((error) => error.path);

test("a valid document returns typed data with provenance preserved", () => {
  const input = doc([observation(1, { sourceText: "DB row 8x35" })]);
  const result = validateLegacyObservationDocument(input);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
  const parsed = result.document.observations[0];
  assert.equal(parsed.sourceLocator, "page-001-row-001");
  assert.equal(parsed.sourceHash, HASH);
  assert.equal(parsed.sourceText, "DB row 8x35");
  assert.equal(parsed.sourceOrdinal, 1);
  assert.equal(result.document.batch.sourceKey, "synthetic-notebook-a");
});

test("all four temporal variants are accepted exactly as supplied", () => {
  const temporals = [
    { precision: "day", label: "Jan 6 2020", date: "2020-01-06" },
    { precision: "week", label: "Week of Jan 6 2020", startDate: "2020-01-06", endDate: "2020-01-12" },
    { precision: "week", label: "Some week" },
    { precision: "month", label: "January 2020", month: "2020-01" },
    { precision: "unknown", label: "Undated page 7" },
  ];
  const result = validateLegacyObservationDocument(doc(temporals.map((temporal, i) => observation(i + 1, { temporal }))));
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assert.deepEqual(result.document.observations.map((o) => o.temporal), temporals);
});

test("temporal variants are strict and never invent or coerce values", () => {
  const bad = [
    { precision: "day", label: "x" },
    { precision: "day", label: "x", date: "2020-02-30" },
    { precision: "day", label: "x", date: "2020-1-6" },
    { precision: "day", label: "x", date: "2020-01-06", month: "2020-01" },
    { precision: "week", label: "x", startDate: "2020-01-12", endDate: "2020-01-06" },
    { precision: "week", label: "x", startDate: "2020-13-01" },
    { precision: "week", label: "x", date: "2020-01-06" },
    { precision: "month", label: "x", month: "2020-13" },
    { precision: "month", label: "x" },
    { precision: "unknown", label: "x", date: "2020-01-06" },
    { precision: "decade", label: "x" },
    { precision: "day", label: "  ", date: "2020-01-06" },
  ];
  for (const temporal of bad) {
    const result = validateLegacyObservationDocument(doc([observation(1, { temporal })]));
    assert.equal(result.valid, false, JSON.stringify(temporal));
    assert.ok(codes(result).some((p) => p.startsWith("observations[0].temporal")), JSON.stringify(temporal));
  }
});

test("unsupported schema, policy and vocabulary values are rejected", () => {
  const cases = [
    [{ ...doc(), schemaVersion: "v2" }, "schemaVersion"],
    [doc([observation(1)], { unitPolicy: "kg" }), "batch.unitPolicy"],
    [doc([observation(1)], { sourceKind: "photo" }), "batch.sourceKind"],
    [doc([observation(1)], { interpretationPolicyVersion: "legacy-evidence-v2" }), "batch.interpretationPolicyVersion"],
    [doc([observation(1)], { sourceKey: " " }), "batch.sourceKey"],
    [doc([observation(1, { exercise: { sourceName: "Row", equipment: "kettlebell", loadConvention: "total" } })]), "observations[0].exercise.equipment"],
    [doc([observation(1, { exercise: { sourceName: "Row", equipment: "dumbbell", loadConvention: "each" } })]), "observations[0].exercise.loadConvention"],
    [doc([observation(1, { exercise: { sourceName: "", equipment: "dumbbell", loadConvention: "total" } })]), "observations[0].exercise.sourceName"],
    [doc([observation(1, { sets: [set({ evidence: "maybe" })] })]), "observations[0].sets[0].evidence"],
    [doc([observation(1, { sets: [set({ evidenceBasis: "vibes" })] })]), "observations[0].sets[0].evidenceBasis"],
  ];
  for (const [input, path] of cases) {
    const result = validateLegacyObservationDocument(input);
    assert.equal(result.valid, false, path);
    assert.ok(codes(result).includes(path), `${path} in ${codes(result)}`);
  }
  assert.equal(validateLegacyObservationDocument(null).valid, false);
  assert.equal(validateLegacyObservationDocument("{}").valid, false);
});

test("ordinals, hashes, reps and loads are validated strictly", () => {
  const cases = [
    [doc([observation(1), observation(1)]), "observations[1].sourceOrdinal"],
    [doc([observation(0)]), "observations[0].sourceOrdinal"],
    [doc([observation(1.5)]), "observations[0].sourceOrdinal"],
    [doc([observation(1, { sourceHash: "sha256:ABC" })]), "observations[0].sourceHash"],
    [doc([observation(1, { sourceHash: `sha256:${"A".repeat(64)}` })]), "observations[0].sourceHash"],
    [doc([observation(1, { sourceHash: "a".repeat(64) })]), "observations[0].sourceHash"],
    [doc([observation(1, { sets: [set({ reps: 0 })] })]), "observations[0].sets[0].reps"],
    [doc([observation(1, { sets: [set({ reps: 2.5 })] })]), "observations[0].sets[0].reps"],
    [doc([observation(1, { sets: [set({ reps: "8" })] })]), "observations[0].sets[0].reps"],
    [doc([observation(1, { sets: [set({ loadLb: -1 })] })]), "observations[0].sets[0].loadLb"],
    [doc([observation(1, { sets: [set({ loadLb: Number.NaN })] })]), "observations[0].sets[0].loadLb"],
    [doc([observation(1, { sets: [set({ loadLb: Number.POSITIVE_INFINITY })] })]), "observations[0].sets[0].loadLb"],
    [doc([observation(1, { sets: [set({ loadLb: "35" })] })]), "observations[0].sets[0].loadLb"],
  ];
  for (const [input, path] of cases) {
    const result = validateLegacyObservationDocument(input);
    assert.equal(result.valid, false, path);
    assert.ok(codes(result).includes(path), `${path} in ${codes(result)}`);
  }
  assert.equal(validateLegacyObservationDocument(doc([observation(1, { sets: [set({ loadLb: 0 })] })])).valid, true);
});

test("v1 limits are enforced at the boundary", () => {
  const long = (n) => "x".repeat(n);
  assert.equal(validateLegacyObservationDocument(doc([observation(1, { sourceLocator: long(160), sourceText: long(500) })])).valid, true);
  for (const [overrides, path] of [
    [{ sourceLocator: long(161) }, "observations[0].sourceLocator"],
    [{ sourceText: long(501) }, "observations[0].sourceText"],
    [{ temporal: { precision: "unknown", label: long(161) } }, "observations[0].temporal.label"],
    [{ exercise: { sourceName: long(161), equipment: "other", loadConvention: "total" } }, "observations[0].exercise.sourceName"],
  ]) {
    const result = validateLegacyObservationDocument(doc([observation(1, overrides)]));
    assert.equal(result.valid, false, path);
    assert.ok(codes(result).includes(path), path);
  }
  const fifty = Array.from({ length: 50 }, () => set());
  assert.equal(validateLegacyObservationDocument(doc([observation(1, { sets: fifty })])).valid, true);
  const tooManySets = validateLegacyObservationDocument(doc([observation(1, { sets: [...fifty, set()] })]));
  assert.equal(tooManySets.valid, false);
  assert.ok(codes(tooManySets).includes("observations[0].sets"));

  const many = (n) => Array.from({ length: n }, (_, i) => observation(i + 1));
  assert.equal(validateLegacyObservationDocument(doc(many(5000))).valid, true);
  const tooMany = validateLegacyObservationDocument(doc(many(5001)));
  assert.equal(tooMany.valid, false);
  assert.ok(codes(tooMany).includes("observations"));
});

test("evidence must agree with its basis so plans never leak into performed", () => {
  const ok = [
    ["performed", "later-handwritten-policy"],
    ["performed", "explicit-checked"],
    ["performed", "explicit-completed"],
    ["planned", "unchecked-prescription"],
    ["ambiguous", "ambiguous"],
  ];
  for (const [evidence, evidenceBasis] of ok) {
    assert.equal(validateLegacyObservationDocument(doc([observation(1, { sets: [set({ evidence, evidenceBasis })] })])).valid, true, `${evidence}/${evidenceBasis}`);
  }
  const bad = [
    ["performed", "unchecked-prescription"],
    ["performed", "ambiguous"],
    ["planned", "explicit-checked"],
    ["planned", "later-handwritten-policy"],
    ["ambiguous", "explicit-completed"],
  ];
  for (const [evidence, evidenceBasis] of bad) {
    const result = validateLegacyObservationDocument(doc([observation(1, { sets: [set({ evidence, evidenceBasis })] })]));
    assert.equal(result.valid, false, `${evidence}/${evidenceBasis}`);
    assert.ok(codes(result).includes("observations[0].sets[0].evidenceBasis"));
  }
});

test("preview counts precision and evidence and reports trend exclusions without writing", () => {
  const input = doc([
    observation(1),
    observation(2, { temporal: { precision: "month", label: "January 2020", month: "2020-01" }, sets: [set({ evidence: "planned", evidenceBasis: "unchecked-prescription" }), set()] }),
    observation(3, { temporal: { precision: "unknown", label: "Undated" }, sets: [set({ evidence: "ambiguous", evidenceBasis: "ambiguous" })] }),
  ]);
  const snapshot = JSON.stringify(input);
  const preview = previewLegacyObservationDocument(input);
  assert.equal(preview.valid, true);
  assert.equal(preview.observationCount, 3);
  assert.equal(preview.setCount, 4);
  assert.deepEqual(preview.precisionCounts, { day: 1, week: 0, month: 1, unknown: 1 });
  assert.deepEqual(preview.evidenceCounts, { performed: 2, planned: 1, ambiguous: 1 });
  assert.deepEqual(preview.excludedFromTrends, { planned: 1, ambiguous: 1 });
  assert.ok(preview.warnings.some((warning) => /planned/i.test(warning)));
  assert.ok(preview.warnings.some((warning) => /ambiguous/i.test(warning)));
  assert.equal(JSON.stringify(input), snapshot);

  const invalid = previewLegacyObservationDocument({ schemaVersion: "nope" });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.length > 0);
  assert.equal(invalid.observationCount, 0);
});

test("validation does not mutate its input", () => {
  const input = doc([observation(1)]);
  const snapshot = JSON.stringify(input);
  validateLegacyObservationDocument(input);
  assert.equal(JSON.stringify(input), snapshot);
});

test("year 0099 is validated without JavaScript's 1900 offset", () => {
  const result = validateLegacyObservationDocument(doc([
    observation(1, { temporal: { precision: "day", label: "Year 99", date: "0099-01-01" } }),
  ]));
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assert.equal(result.document.observations[0].temporal.date, "0099-01-01");
});

test("label-only week precision is preserved without invented bounds", () => {
  const temporal = { precision: "week", label: "Week tab 12" };
  const result = validateLegacyObservationDocument(doc([observation(1, { temporal })]));
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assert.deepEqual(result.document.observations[0].temporal, temporal);
  assert.equal("startDate" in result.document.observations[0].temporal, false);
  assert.equal("endDate" in result.document.observations[0].temporal, false);
});

test("empty observations remain valid evidence and produce an explicit warning", () => {
  const input = doc([observation(1, { sets: [] })]);
  const result = validateLegacyObservationDocument(input);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assert.equal(result.document.observations[0].sets.length, 0);
  assert.ok(result.warnings.some((warning) => warning.code === "empty-sets"));
  const preview = previewLegacyObservationDocument(input);
  assert.equal(preview.emptySetObservations, 1);
  assert.equal(preview.observationsWithoutPerformedSets, 1);
  assert.ok(preview.warnings.some((warning) => /no sets/i.test(warning)));
});

test("bodyweight load may be omitted or null but non-bodyweight load remains required", () => {
  const bodyweight = { sourceName: "Pull-up", equipment: "bodyweight", loadConvention: "bodyweight" };
  for (const entry of [
    { reps: 8, evidence: "performed", evidenceBasis: "later-handwritten-policy" },
    { reps: 8, loadLb: null, evidence: "performed", evidenceBasis: "later-handwritten-policy" },
  ]) {
    const result = validateLegacyObservationDocument(doc([observation(1, { exercise: bodyweight, sets: [entry] })]));
    assert.equal(result.valid, true, JSON.stringify(result.errors));
    assert.notEqual(result.document.observations[0].sets[0].loadLb, 0);
  }
  const weighted = validateLegacyObservationDocument(doc([observation(1, {
    sets: [{ reps: 8, evidence: "performed", evidenceBasis: "later-handwritten-policy" }],
  })]));
  assert.equal(weighted.valid, false);
  assert.ok(codes(weighted).includes("observations[0].sets[0].loadLb"));
});

test("reviewed mapping is optional, validated, and kept separate from verbatim sourceName", () => {
  const exercise = {
    sourceName: "DB Rows ",
    equipment: "dumbbell",
    loadConvention: "per-hand",
    reviewedMapping: {
      seriesKey: "family-row-dumbbell",
      seriesLabel: "Dumbbell row",
      mappingBasis: "owner-reviewed-alias-manifest",
    },
  };
  const result = validateLegacyObservationDocument(doc([observation(1, { exercise })]));
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assert.equal(result.document.observations[0].exercise.sourceName, "DB Rows ");
  assert.deepEqual(result.document.observations[0].exercise.reviewedMapping, exercise.reviewedMapping);

  const invalid = validateLegacyObservationDocument(doc([observation(1, {
    exercise: { ...exercise, reviewedMapping: { ...exercise.reviewedMapping, mappingBasis: "model-guessed" } },
  })]));
  assert.equal(invalid.valid, false);
  assert.ok(codes(invalid).includes("observations[0].exercise.reviewedMapping.mappingBasis"));
});

test("unknown extra fields are dropped with path-bearing warnings while temporal remains strict", () => {
  const input = doc([observation(1, {
    extraObservation: true,
    exercise: { sourceName: "Row", equipment: "dumbbell", loadConvention: "total", extraExercise: true },
    sets: [{ ...set(), extraSet: true }],
  })], { extraBatch: true });
  input.extraRoot = true;
  const result = validateLegacyObservationDocument(input);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assert.deepEqual(result.warnings.map((warning) => warning.path), ["extraRoot", "batch.extraBatch", "observations[0].extraObservation", "observations[0].exercise.extraExercise", "observations[0].sets[0].extraSet"]);
  assert.equal("extraRoot" in result.document, false);
  assert.equal("extraObservation" in result.document.observations[0], false);
});

test("duplicate hashes warn without collapsing distinct source ordinals", () => {
  const result = validateLegacyObservationDocument(doc([observation(1), observation(2)]));
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assert.ok(result.warnings.some((warning) => warning.code === "duplicate-source-hash"));
  assert.equal(result.document.observations.length, 2);
});

test("JSON parsing reports a bounded coded syntax error and validation caps error output", () => {
  const syntax = parseLegacyObservationJson("{");
  assert.equal(syntax.valid, false);
  assert.equal(syntax.errors[0].code, "json-syntax");
  const abusive = doc(Array.from({ length: 150 }, (_, index) => observation(index + 1, { sourceLocator: "" })));
  const result = validateLegacyObservationDocument(abusive);
  assert.equal(result.valid, false);
  assert.equal(result.errors.length, 100);
  assert.equal(result.truncated, true);
  assert.ok(result.errors.every((error) => typeof error.code === "string" && error.code.length > 0));
});
