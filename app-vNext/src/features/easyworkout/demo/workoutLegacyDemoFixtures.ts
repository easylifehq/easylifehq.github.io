import type { LegacyObservation, LegacyObservationDocument, LegacySet } from "../domain/legacyWorkoutObservation.ts";

// Generic synthetic data only. Nothing here comes from a real notebook, account or history.
const hash = (digit: string) => `sha256:${digit.repeat(64)}`;
const performed = (reps: number, loadLb: number): LegacySet => ({ reps, loadLb, evidence: "performed", evidenceBasis: "later-handwritten-policy" });
const checked = (reps: number, loadLb: number): LegacySet => ({ reps, loadLb, evidence: "performed", evidenceBasis: "explicit-checked" });
const planned = (reps: number, loadLb: number): LegacySet => ({ reps, loadLb, evidence: "planned", evidenceBasis: "unchecked-prescription" });
const unclear = (reps: number, loadLb: number): LegacySet => ({ reps, loadLb, evidence: "ambiguous", evidenceBasis: "ambiguous" });

const dumbbellRow = { sourceName: "Dumbbell row", equipment: "dumbbell", loadConvention: "per-hand" } as const;
const unknownPress = { sourceName: "Overhead press", equipment: "unknown", loadConvention: "unknown" } as const;

const observations: LegacyObservation[] = [
  { sourceOrdinal: 1, sourceLocator: "demo-page-01-row-01", sourceHash: hash("a"), sourceText: "DB row 8x30", temporal: { precision: "day", label: "Jan 6 2020", date: "2020-01-06" }, exercise: dumbbellRow, sets: [performed(8, 30), performed(8, 30)] },
  { sourceOrdinal: 2, sourceLocator: "demo-page-02-row-01", sourceHash: hash("b"), temporal: { precision: "week", label: "Week of Jan 13 2020", startDate: "2020-01-13", endDate: "2020-01-19" }, exercise: dumbbellRow, sets: [performed(8, 35), checked(6, 35)] },
  { sourceOrdinal: 3, sourceLocator: "demo-page-03-row-01", sourceHash: hash("c"), temporal: { precision: "month", label: "February 2020", month: "2020-02" }, exercise: dumbbellRow, sets: [performed(10, 35), planned(8, 40)] },
  { sourceOrdinal: 4, sourceLocator: "demo-page-04-row-02", sourceHash: hash("d"), temporal: { precision: "day", label: "Mar 2 2020", date: "2020-03-02" }, exercise: { sourceName: "Dumbbell row", equipment: "machine", loadConvention: "machine-stack" }, sets: [performed(12, 90)] },
  { sourceOrdinal: 5, sourceLocator: "demo-page-05-row-01", sourceHash: hash("e"), temporal: { precision: "unknown", label: "Undated page 5" }, exercise: unknownPress, sets: [performed(5, 45), unclear(5, 50)] },
  { sourceOrdinal: 6, sourceLocator: "demo-page-06-row-01", sourceHash: hash("f"), temporal: { precision: "week", label: "Some week" }, exercise: unknownPress, sets: [performed(5, 50)] },
  { sourceOrdinal: 7, sourceLocator: "demo-page-07-row-03", sourceHash: hash("1"), temporal: { precision: "day", label: "Apr 6 2020", date: "2020-04-06" }, exercise: { sourceName: "Cable fly", equipment: "cable", loadConvention: "total" }, sets: [planned(12, 20)] },
];

export const workoutLegacyDemoDocument: LegacyObservationDocument = {
  schemaVersion: "easyworkout-legacy-observations-v1",
  batch: {
    sourceKey: "synthetic-notebook-demo",
    sourceLabel: "Synthetic demo notebook",
    sourceKind: "handwritten-transcription",
    unitPolicy: "lb-owner-confirmed",
    interpretationPolicyVersion: "legacy-evidence-v1",
  },
  observations,
};
