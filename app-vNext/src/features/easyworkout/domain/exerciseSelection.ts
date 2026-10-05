export type ExerciseSelection<T> =
  | { status: "selected"; summary: T }
  | { status: "no-match"; query: string; summary?: undefined }
  | { status: "empty"; summary?: undefined };

// Blank queries keep the first exercise; a nonblank query that matches nothing must not fall back to another exercise.
export function selectExerciseSummary<T extends { exerciseName: string }>(summaries: T[], query: string): ExerciseSelection<T> {
  if (!summaries.length) return { status: "empty" };
  const trimmed = query.trim();
  if (!trimmed) return { status: "selected", summary: summaries[0] };
  const needle = trimmed.toLowerCase();
  const match = summaries.find((summary) => summary.exerciseName.toLowerCase().includes(needle));
  return match ? { status: "selected", summary: match } : { status: "no-match", query: trimmed };
}
