import type { LegacyEquipment, LegacyLoadConvention, LegacyObservation, LegacyObservationDocument, LegacyTemporalPrecision } from "./legacyWorkoutObservation.ts";

export type LegacyTrendPoint = {
  sourceOrdinal: number;
  sourceLocator: string;
  sourceHash: string;
  precision: LegacyTemporalPrecision;
  temporalLabel: string;
  topLoadLb: number | null;
  repsAtTopLoad: number;
  performedSetCount: number;
};

export type LegacyTrendSeries = {
  key: string;
  sourceKey: string;
  sourceName: string;
  seriesLabel: string;
  reviewedSeriesKey: string | null;
  equipment: LegacyEquipment;
  loadConvention: LegacyLoadConvention;
  comparability: "known" | "unknown-equipment-or-convention";
  recordedLoadLabel: "Recorded load" | "Recorded reps";
  caveat: string | null;
  ordering: "temporal" | "source-order";
  points: LegacyTrendPoint[];
};

export type LegacyWorkoutTrends = {
  series: LegacyTrendSeries[];
  excluded: { planned: number; ambiguous: number };
};

export const LEGACY_UNKNOWN_SERIES_CAVEAT = "Equipment or load convention is unknown for this series. Loads are recorded values from one source and are not comparable to other exercises.";

/** Start of the supplied bucket as a sortable string, or null when the source gives no usable bound. */
function bucketStart(observation: LegacyObservation): string | null {
  const { temporal } = observation;
  if (temporal.precision === "day") return temporal.date;
  if (temporal.precision === "week") return temporal.startDate ?? null;
  if (temporal.precision === "month") return `${temporal.month}-01`;
  return null;
}

export function deriveLegacyWorkoutTrends(document: LegacyObservationDocument): LegacyWorkoutTrends {
  const { sourceKey } = document.batch;
  const excluded = { planned: 0, ambiguous: 0 };
  const groups = new Map<string, { series: LegacyTrendSeries; starts: (string | null)[] }>();

  for (const observation of [...document.observations].sort((a, b) => a.sourceOrdinal - b.sourceOrdinal)) {
    const performed = observation.sets.filter((entry) => entry.evidence === "performed");
    for (const entry of observation.sets) {
      if (entry.evidence === "planned") excluded.planned += 1;
      else if (entry.evidence === "ambiguous") excluded.ambiguous += 1;
    }
    if (performed.length === 0) continue;

    const { sourceName, equipment, loadConvention, reviewedMapping } = observation.exercise;
    const seriesIdentity = reviewedMapping ? ["reviewed", reviewedMapping.seriesKey] : ["literal", sourceName];
    const isKnown = equipment !== "unknown" && loadConvention !== "unknown";
    const key = JSON.stringify(isKnown ? ["known", ...seriesIdentity, equipment, loadConvention] : ["unknown", sourceKey, ...seriesIdentity, equipment, loadConvention]);

    let group = groups.get(key);
    if (!group) {
      group = {
        series: {
          key,
          sourceKey,
          sourceName,
          seriesLabel: reviewedMapping?.seriesLabel ?? sourceName,
          reviewedSeriesKey: reviewedMapping?.seriesKey ?? null,
          equipment,
          loadConvention,
          comparability: isKnown ? "known" : "unknown-equipment-or-convention",
          recordedLoadLabel: equipment === "bodyweight" || loadConvention === "bodyweight" ? "Recorded reps" : "Recorded load",
          caveat: isKnown ? null : LEGACY_UNKNOWN_SERIES_CAVEAT,
          ordering: "source-order",
          points: [],
        },
        starts: [],
      };
      groups.set(key, group);
    }

    const performedWithLoad = performed.filter((entry): entry is typeof entry & { loadLb: number } => typeof entry.loadLb === "number");
    const topLoadLb = performedWithLoad.length > 0 ? Math.max(...performedWithLoad.map((entry) => entry.loadLb)) : null;
    const repsAtTopLoad = Math.max(...(topLoadLb === null ? performed : performedWithLoad.filter((entry) => entry.loadLb === topLoadLb)).map((entry) => entry.reps));
    group.series.points.push({
      sourceOrdinal: observation.sourceOrdinal,
      sourceLocator: observation.sourceLocator,
      sourceHash: observation.sourceHash,
      precision: observation.temporal.precision,
      temporalLabel: observation.temporal.label,
      topLoadLb,
      repsAtTopLoad,
      performedSetCount: performed.length,
    });
    group.starts.push(bucketStart(observation));
  }

  const series: LegacyTrendSeries[] = [];
  for (const { series: item, starts } of groups.values()) {
    // Points were appended in source order; reorder by bucket only when every point has one.
    const precisions = new Set(item.points.map((point) => point.precision));
    if (precisions.size === 1 && starts.every((start) => start !== null)) {
      const startByOrdinal = new Map(item.points.map((point, index) => [point.sourceOrdinal, starts[index] as string]));
      item.points.sort((a, b) => {
        const left = startByOrdinal.get(a.sourceOrdinal) as string;
        const right = startByOrdinal.get(b.sourceOrdinal) as string;
        return left < right ? -1 : left > right ? 1 : a.sourceOrdinal - b.sourceOrdinal;
      });
      item.ordering = "temporal";
    }
    series.push(item);
  }
  return { series, excluded };
}
