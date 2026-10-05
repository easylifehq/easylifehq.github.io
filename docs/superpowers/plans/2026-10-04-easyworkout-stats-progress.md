# EasyWorkout statistics progress plan

Status: approved bounded scope, implemented on `scolety1/easylife-quick-log-sonnet` (base `4dcfca38`).

## Outcome

A useful Workout Progress page showing training consistency and how each exercise progresses over time (weight, reps, personal bests where genuinely comparable). A user can open an exercise and compare recent saved sessions.

## Boundaries

- Reuse the account owner's already-subscribed saved sessions, `WorkoutInsightsPanel`, `WorkoutExerciseInsightPage`, and `workoutStatistics.ts`. No new data source, schema, persistence, auth, or package.
- Keep weekly consistency and the matched-period pulse unchanged.
- Demo stays synthetic and fail-closed (`?demo=1` links); no fabricated data.
- No all-exercise progress score, no averaging of incompatible dimensions, no recovery/readiness inference.
- lb/kg conversion happens per value with no intermediate rounding (`1 kg = 2.2046226218 lb`).

## Domain design (`ExerciseSummary.history`)

Per exercise key (stable ID, legacy name fallback), built only from valid working sets (existing `isValidWorkingSet`; schema v4+ requires explicit `completed: true`, legacy keeps established semantics). Duplicate exercise blocks in one session merge into one row.

| Type | Row metrics | Bests | Comparison |
|---|---|---|---|
| weighted | top load, reps at top load, est. 1RM (Epley, cautious), workload, sets | existing records + source links | est. 1RM latest vs previous |
| bodyweight | best reps, total reps, sets; never load/workload/e1RM | most reps in a set | best reps |
| assisted | best reps and the assistance on that set (display unit), sets | none: reps and assistance are not controlled-equivalent | not comparable (stated) |
| duration | best and total duration | longest duration | best duration |
| distance | best and total distance | longest distance | best distance |
| mixed types under one key | not combined | none | explicit mixed state |

Rows are newest first, capped at 5 recent, each with an exact source workout ID/date. States: `empty`, `single-session`, `comparable`, `not-comparable`, `mixed-types`. Deltas are null unless both values are finite and comparable; no NaN/infinity.

## UI

- Workout Progress panel: "Recent sessions" table for the selected exercise with type-specific columns, source links, "Holds best" labels only for real records, and empty/low-data/not-comparable copy.
- Full exercise detail: same recent-session comparison table plus type-appropriate records; weighted-only e1RM text hidden for other types.
- Source links reuse `demoOnlySearch` so demo isolation is preserved.

## Verification

Strict TDD (domain tests, markup/UI source tests, bounded synthetic 390x844 + desktop browser journey on the demo stats route using the existing CDP harness, no new packages), then full `npm test`, `test:quick-workout-acceptance`, `typecheck`, `build`, `test:workout-feedback-layout`.
