import { useMemo } from "react";
import { PageSection } from "@/components/ui/PageSection";
import { previewLegacyObservationDocument, validateLegacyObservationDocument, type LegacyObservationDocument } from "../domain/legacyWorkoutObservation";
import { deriveLegacyWorkoutTrends } from "../domain/legacyWorkoutTrends";

const PRECISION_COPY = { day: "Day", week: "Week", month: "Month", unknown: "Undated" } as const;

export function WorkoutLegacyProgressPanel({ document, eyebrow = "Read-only preview" }: { document: LegacyObservationDocument; eyebrow?: string }) {
  const { preview, trends } = useMemo(() => {
    const result = validateLegacyObservationDocument(document);
    return { preview: previewLegacyObservationDocument(document), trends: result.valid ? deriveLegacyWorkoutTrends(result.document) : null };
  }, [document]);

  return (
    <PageSection
      headingLevel={2}
      eyebrow={eyebrow}
      title="Legacy progress"
      description={`Recorded load from ${document.batch.sourceLabel}, in pounds, as written. Dates are shown as supplied. These notes are not part of your saved workout history or statistics.`}
    >
      <div className="legacy-progress" data-testid="legacy-progress">
        {!preview.valid || !trends ? (
          <p className="error-copy" role="alert">This legacy file could not be read: {preview.errors[0]?.message ?? "invalid document"}.</p>
        ) : (
          <>
            <p className="legacy-progress-summary" role="status">
              {preview.observationCount} observations, {preview.evidenceCounts.performed} performed sets shown.
              {" "}Excluded from trends: {preview.excludedFromTrends.planned} planned and {preview.excludedFromTrends.ambiguous} ambiguous sets.
            </p>
            <p className="legacy-progress-precision helper-copy">
              Date precision: {(Object.keys(PRECISION_COPY) as Array<keyof typeof PRECISION_COPY>).map((key) => `${preview.precisionCounts[key]} ${PRECISION_COPY[key].toLowerCase()}`).join(", ")}.
            </p>
            {trends.series.map((series) => (
              <article key={series.key} className="legacy-progress-series" data-comparability={series.comparability} data-ordering={series.ordering}>
                <h3>{series.seriesLabel}</h3>
                <p className="legacy-progress-meta">
                  {series.recordedLoadLabel} · {series.equipment} · {series.loadConvention} load
                </p>
                {series.reviewedSeriesKey ? <p className="helper-copy">Source heading: {series.sourceName}. Reviewed series: {series.reviewedSeriesKey}.</p> : null}
                {series.caveat ? <p className="legacy-progress-caveat" role="note">{series.caveat}</p> : null}
                <p className="helper-copy">
                  {series.ordering === "temporal" ? "Ordered by the dates supplied." : "Dates are missing or partial, so rows follow source order. No elapsed time is implied."}
                </p>
                <div className="table-scroll" tabIndex={0} aria-label={`${series.seriesLabel} legacy rows`}>
                  <table className="workout-comparison-table">
                    <caption>{series.seriesLabel}: {series.points.length} recorded row{series.points.length === 1 ? "" : "s"} from {series.sourceKey}</caption>
                    <thead>
                      <tr>
                        <th scope="col">Written date</th>
                        <th scope="col">Precision</th>
                        <th scope="col">Recorded load (lb)</th>
                        <th scope="col">Reps at that load</th>
                        <th scope="col">Sets</th>
                        <th scope="col">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {series.points.map((point) => (
                        <tr key={point.sourceOrdinal}>
                          <th scope="row">{point.temporalLabel}</th>
                          <td>{PRECISION_COPY[point.precision]}</td>
                          <td>{point.topLoadLb === null ? "Not recorded" : point.topLoadLb}</td>
                          <td>{point.repsAtTopLoad}</td>
                          <td>{point.performedSetCount}</td>
                          <td>
                            <span className="legacy-progress-source">{point.sourceLocator}</span>
                            <span className="legacy-progress-hash" title={point.sourceHash}>{point.sourceHash.slice(0, 15)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            ))}
          </>
        )}
      </div>
    </PageSection>
  );
}
