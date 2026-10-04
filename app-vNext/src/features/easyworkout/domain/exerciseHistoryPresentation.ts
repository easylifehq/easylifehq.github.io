import type { ExerciseHistoryComparison, ExerciseHistoryKind, ExerciseHistoryRow, WorkoutDisplayUnit } from "./workoutStatistics";

export type HistoryColumnKey = keyof ExerciseHistoryRow;
export type HistoryColumn = { key: HistoryColumnKey; label: string };

const date: HistoryColumn = { key: "performedOn", label: "Date" };
const sets: HistoryColumn = { key: "setCount", label: "Sets" };
const best: HistoryColumn = { key: "holdsRecords", label: "Best" };

export function historyColumns(kind: ExerciseHistoryKind, unit: WorkoutDisplayUnit): HistoryColumn[] {
  switch (kind) {
    case "weighted":
      return [date, { key: "topWeight", label: `Top load (${unit})` }, { key: "repsAtTopWeight", label: "Reps at top load" }, { key: "estimatedOneRepMax", label: `Estimated 1RM (${unit})` }, { key: "workload", label: `Workload (${unit}·reps)` }, sets, best];
    case "bodyweight":
      return [date, { key: "bestReps", label: "Best set reps" }, { key: "totalReps", label: "Total reps" }, sets, best];
    case "assisted":
      return [date, { key: "bestReps", label: "Best set reps" }, { key: "assistance", label: `Assistance on that set (${unit})` }, sets];
    case "duration":
      return [date, { key: "bestDurationSeconds", label: "Longest set (s)" }, { key: "totalDurationSeconds", label: "Total time (s)" }, sets, best];
    case "distance":
      return [date, { key: "bestDistanceMeters", label: "Longest set (m)" }, { key: "totalDistanceMeters", label: "Total distance (m)" }, sets, best];
    default:
      return [];
  }
}

export function formatHistoryCell(row: ExerciseHistoryRow, key: HistoryColumnKey): string {
  const value = row[key];
  if (key === "holdsRecords") return row.holdsRecords.length ? row.holdsRecords.join(", ") : "—";
  if (key === "performedOn") return row.performedOn;
  if (typeof value !== "number" || !Number.isFinite(value)) return "n/a";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function historyStateCopy(state: ExerciseHistoryComparison["state"], kind: ExerciseHistoryKind): string {
  if (state === "empty") return "No completed, comparable sets are saved for this exercise yet.";
  if (state === "single-session") return "Only one saved session so far. Log this exercise again to compare sessions.";
  if (state === "mixed-types") return "This exercise has been logged as different types, so its sessions are not combined. Pick one exercise type to compare history.";
  if (state === "not-comparable") {
    return kind === "assisted"
      ? "Assisted sessions are shown as reps with the assistance used. Lower assistance and more reps are different measurements, so no personal best or change is claimed."
      : "The latest two sessions do not share a comparable measurement, so no change is shown.";
  }
  return "Compared with the previous saved session.";
}
