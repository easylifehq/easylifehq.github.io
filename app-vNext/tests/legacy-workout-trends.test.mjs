import assert from "node:assert/strict";
import test from "node:test";
import { validateLegacyObservationDocument } from "../src/features/easyworkout/domain/legacyWorkoutObservation.ts";
import { deriveLegacyWorkoutTrends } from "../src/features/easyworkout/domain/legacyWorkoutTrends.ts";

const HASH = `sha256:${"b".repeat(64)}`;
const DAY = (date) => ({ precision: "day", label: date, date });
const performed = (reps, loadLb) => ({ reps, loadLb, evidence: "performed", evidenceBasis: "later-handwritten-policy" });
const planned = (reps, loadLb) => ({ reps, loadLb, evidence: "planned", evidenceBasis: "unchecked-prescription" });
const ambiguous = (reps, loadLb) => ({ reps, loadLb, evidence: "ambiguous", evidenceBasis: "ambiguous" });

function obs(ordinal, { name = "Dumbbell row", equipment = "dumbbell", loadConvention = "per-hand", reviewedMapping, temporal = DAY("2020-01-06"), sets = [performed(8, 35)] } = {}) {
  return {
    sourceOrdinal: ordinal,
    sourceLocator: `page-001-row-${ordinal}`,
    sourceHash: HASH,
    temporal,
    exercise: { sourceName: name, equipment, loadConvention, ...(reviewedMapping ? { reviewedMapping } : {}) },
    sets,
  };
}

function derive(observations, sourceKey = "synthetic-notebook-a") {
  const result = validateLegacyObservationDocument({
    schemaVersion: "easyworkout-legacy-observations-v1",
    batch: { sourceKey, sourceLabel: "Synthetic", sourceKind: "handwritten-transcription", unitPolicy: "lb-owner-confirmed", interpretationPolicyVersion: "legacy-evidence-v1" },
    observations,
  });
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  return deriveLegacyWorkoutTrends(result.document);
}

test("only performed sets form points; planned and ambiguous are counted as excluded", () => {
  const trends = derive([
    obs(1, { sets: [performed(8, 35), planned(8, 40), ambiguous(8, 45)] }),
    obs(2, { temporal: DAY("2020-01-13"), sets: [planned(8, 40)] }),
    obs(3, { temporal: DAY("2020-01-20"), sets: [performed(10, 40)] }),
  ]);
  assert.equal(trends.series.length, 1);
  assert.deepEqual(trends.series[0].points.map((p) => [p.sourceOrdinal, p.topLoadLb, p.repsAtTopLoad]), [[1, 35, 8], [3, 40, 10]]);
  assert.deepEqual(trends.excluded, { planned: 2, ambiguous: 1 });
});

test("a point shows the top performed load with the best reps at that load and keeps provenance", () => {
  const [series] = derive([obs(1, { sets: [performed(12, 30), performed(8, 35), performed(6, 35)] })]).series;
  const [point] = series.points;
  assert.equal(point.topLoadLb, 35);
  assert.equal(point.repsAtTopLoad, 8);
  assert.equal(point.performedSetCount, 3);
  assert.equal(point.sourceLocator, "page-001-row-1");
  assert.equal(point.sourceHash, HASH);
  assert.equal(point.precision, "day");
  assert.equal(point.temporalLabel, "2020-01-06");
});

test("raw names stay literal while reviewed aliases merge without crossing equipment or convention", () => {
  const mapping = { seriesKey: "family-dumbbell-row", seriesLabel: "Dumbbell row", mappingBasis: "owner-reviewed-alias-manifest" };
  const trends = derive([
    obs(1, { name: "DB Row", reviewedMapping: mapping }),
    obs(2, { name: "Dumbbell rows", reviewedMapping: mapping, temporal: DAY("2020-01-13") }),
    obs(3, { name: "Dumbbell row" }),
    obs(4, { name: "dumbbell row" }),
    obs(5, { name: "DB Row", reviewedMapping: mapping, equipment: "machine", loadConvention: "machine-stack" }),
    obs(6, { name: "DB Row", reviewedMapping: mapping, loadConvention: "total" }),
  ]);
  assert.equal(trends.series.length, 5);
  const merged = trends.series.find((s) => s.reviewedSeriesKey === "family-dumbbell-row");
  assert.deepEqual(merged.points.map((p) => p.sourceOrdinal), [1, 2]);
  assert.equal(merged.sourceName, "DB Row");
  assert.equal(merged.seriesLabel, "Dumbbell row");
  assert.equal(merged.caveat, null);
  assert.equal(merged.recordedLoadLabel, "Recorded load");
});

test("unknown equipment or convention forms a caveated same-source series only", () => {
  const unknownSet = { equipment: "unknown", loadConvention: "unknown" };
  const trends = derive([
    obs(1, { ...unknownSet }),
    obs(2, { ...unknownSet, temporal: DAY("2020-01-13") }),
    obs(3, { equipment: "unknown", loadConvention: "per-hand" }),
    obs(4, { equipment: "barbell", loadConvention: "unknown" }),
    obs(5, { equipment: "dumbbell", loadConvention: "per-hand" }),
  ]);
  const unknownSeries = trends.series.filter((s) => s.comparability === "unknown-equipment-or-convention");
  assert.equal(unknownSeries.length, 3);
  const pair = unknownSeries.find((s) => s.points.length === 2);
  assert.deepEqual(pair.points.map((p) => p.sourceOrdinal), [1, 2]);
  assert.match(pair.caveat, /equipment/i);
  assert.match(pair.caveat, /load convention/i);
  assert.match(pair.caveat, /unknown/i);
  assert.equal(pair.recordedLoadLabel, "Recorded load");
  assert.equal(pair.sourceKey, "synthetic-notebook-a");
  const known = trends.series.filter((s) => s.comparability === "known");
  assert.equal(known.length, 1);
  assert.equal(known[0].points.length, 1);
});

test("unknown-series keys are scoped by batch source key", () => {
  const input = [obs(1, { equipment: "unknown", loadConvention: "unknown" })];
  const a = derive(input, "source-a").series[0];
  const b = derive(input, "source-b").series[0];
  assert.notEqual(a.key, b.key);
});

test("mixed temporal precision preserves source order even when every point has a sortable bucket", () => {
  const [series] = derive([
    obs(1, { temporal: { precision: "month", label: "March 2020", month: "2020-03" } }),
    obs(2, { temporal: DAY("2020-01-06") }),
    obs(3, { temporal: { precision: "week", label: "Week of Feb 3", startDate: "2020-02-03" } }),
  ]).series;
  assert.equal(series.ordering, "source-order");
  assert.deepEqual(series.points.map((p) => p.sourceOrdinal), [1, 2, 3]);
});

test("one homogeneous temporal precision sorts by its explicit bucket", () => {
  const [series] = derive([
    obs(1, { temporal: DAY("2020-03-01") }),
    obs(2, { temporal: DAY("2020-01-01") }),
    obs(3, { temporal: DAY("2020-02-01") }),
  ]).series;
  assert.equal(series.ordering, "temporal");
  assert.deepEqual(series.points.map((point) => point.sourceOrdinal), [2, 3, 1]);
});

test("bodyweight points preserve reps without fabricating a zero-pound load", () => {
  const result = validateLegacyObservationDocument({
    schemaVersion: "easyworkout-legacy-observations-v1",
    batch: { sourceKey: "synthetic-bodyweight", sourceLabel: "Synthetic", sourceKind: "other", unitPolicy: "lb-owner-confirmed", interpretationPolicyVersion: "legacy-evidence-v1" },
    observations: [{
      sourceOrdinal: 1,
      sourceLocator: "page-1",
      sourceHash: HASH,
      temporal: { precision: "week", label: "Week tab without dates" },
      exercise: { sourceName: "Pull-up", equipment: "bodyweight", loadConvention: "bodyweight" },
      sets: [{ reps: 9, loadLb: null, evidence: "performed", evidenceBasis: "later-handwritten-policy" }],
    }],
  });
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  const [point] = deriveLegacyWorkoutTrends(result.document).series[0].points;
  assert.equal(point.topLoadLb, null);
  assert.equal(point.repsAtTopLoad, 9);
  assert.equal(point.temporalLabel, "Week tab without dates");
});

test("source order is the fallback when any point lacks a sortable bucket and never fabricates time", () => {
  const [series] = derive([
    obs(3, { temporal: DAY("2020-01-06") }),
    obs(1, { temporal: { precision: "unknown", label: "Undated page 7" } }),
    obs(2, { temporal: { precision: "week", label: "Some week" } }),
  ]).series;
  assert.equal(series.ordering, "source-order");
  assert.deepEqual(series.points.map((p) => p.sourceOrdinal), [1, 2, 3]);
  assert.deepEqual(series.points.map((p) => p.temporalLabel), ["Undated page 7", "Some week", "2020-01-06"]);
  assert.equal(JSON.stringify(series).includes("elapsed"), false);
});

test("same-bucket ties fall back to source ordinal", () => {
  const [series] = derive([obs(2), obs(1)]).series;
  assert.deepEqual(series.points.map((p) => p.sourceOrdinal), [1, 2]);
});

test("output carries no PR, e1RM, rate, target or promotion fields", () => {
  const trends = derive([obs(1), obs(2, { temporal: DAY("2020-01-13"), sets: [performed(8, 40)] })]);
  const forbidden = /pr\b|personalrecord|e1rm|estimat|oneRep|rate|velocity|slope|target|promot|normaliz|strength/i;
  const keys = new Set();
  const walk = (value) => {
    if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) { keys.add(k); walk(v); }
  };
  walk(trends);
  for (const key of keys) assert.equal(forbidden.test(key), false, key);
});

test("derivation is deterministic and does not mutate the document", () => {
  const observations = [obs(2), obs(1, { temporal: DAY("2020-01-13") })];
  const first = derive(observations);
  const second = derive(observations);
  assert.deepEqual(first, second);
});
