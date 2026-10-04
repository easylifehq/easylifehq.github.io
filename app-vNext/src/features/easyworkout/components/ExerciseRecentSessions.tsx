import { Link } from "react-router-dom";
import { formatHistoryCell, historyColumns, historyStateCopy } from "@/features/easyworkout/domain/exerciseHistoryPresentation";
import type { ExerciseSummary, WorkoutDisplayUnit } from "@/features/easyworkout/domain/workoutStatistics";

type ExerciseRecentSessionsProps = { summary: ExerciseSummary; unit: WorkoutDisplayUnit; demoOnlySearch: string; headingLevel?: 2 | 3 };

export function ExerciseRecentSessions({ summary, unit, demoOnlySearch, headingLevel = 3 }: ExerciseRecentSessionsProps) {
  const { history } = summary;
  const columns = historyColumns(history.kind, unit);
  const { comparison } = history;
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="workout-recent-sessions" data-history-kind={history.kind} data-history-state={comparison.state}>
      <Heading>Recent saved sessions</Heading>
      {comparison.state === "comparable" && comparison.delta !== null && comparison.metricLabel ? (
        <p className="workout-recent-change" role="status">
          {comparison.metricLabel}: {comparison.delta > 0 ? "up" : comparison.delta < 0 ? "down" : "unchanged"}
          {comparison.delta === 0 ? "" : ` ${Math.abs(comparison.delta).toFixed(1)} ${comparison.unit}`} versus the previous saved session.
        </p>
      ) : (
        <p className="helper-copy" role="status">{historyStateCopy(comparison.state, history.kind)}</p>
      )}
      {columns.length && history.rows.length ? (
        <div className="table-scroll" tabIndex={0} aria-label={`${summary.exerciseName} recent sessions table`}>
          <table className="workout-comparison-table workout-recent-table">
            <caption>{summary.exerciseName}: latest {history.rows.length} of {history.totalSessions} saved session{history.totalSessions === 1 ? "" : "s"}, newest first</caption>
            <thead><tr>{columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}</tr></thead>
            <tbody>
              {history.rows.map((row) => (
                <tr key={row.sessionId}>
                  {columns.map((column) => column.key === "performedOn"
                    ? <th key={column.key} scope="row"><Link to={`/app/easyworkout/session/${encodeURIComponent(row.sessionId)}${demoOnlySearch}`}>{row.performedOn}</Link></th>
                    : <td key={column.key}>{formatHistoryCell(row, column.key)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
