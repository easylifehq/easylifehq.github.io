# EasyWorkout Quick-Log Implementation Plan

Baseline `98c9f544`. Spec: `2026-10-03-easyworkout-quick-log-redesign-design.md` (canonical install). No persistence/remote schema change.

## Slices (TDD: tests first, observe failure, then implement)

1. **Pure transitions** `domain/workoutExerciseCompletion.ts` (+ `tests/workout-exercise-completion.test.mjs`):
   row classification (blank/valid/partial/warmup/deleted, per exercise type), atomic `completeExercise`,
   `completeExerciseAndAdvance` (idempotent, appends at most one blank), `undoExerciseCompletion`,
   completion revocation on performance/identity/type edits, `deleteExerciseFromLogs` (only exercise -> one blank),
   `findSaveBlock` (partial nonblank work blocks save; blank trailing exercise ignored), one-exercise fresh start.
2. **Focused UI** (+ `tests/quick-workout-focused-ui.test.mjs`, source/UI contracts):
   `QuickWorkoutSessionStrip`, `QuickWorkoutExerciseCard`, `QuickWorkoutNextExercise` components; remove focused hero/toolbar/
   Daily Plan/lift-count/Add 3/Clear; compact rows, `More setup` (exercise+set notes, machine setup), inline delete confirmation
   (Escape, focus placement), row removal `×` with undo shown in the stable message region, suggestions below the last exercise
   reusing top-level focus, Done & next / Edit / Undo done replacing per-row Mark done in focused mode.
   The full-log route keeps its existing row markup.
3. **Save protection** wired in `handleSaveSession` via `findSaveBlock`; 98c9 stable status/action/validation regions untouched.
4. **Verification**: focused tests per slice, `npm test`, `npm run typecheck`, `npm run build`, `test:workout-feedback-layout`,
   390x844 browser check where Chrome/Edge is available.

## Non-goals
Stats page, schema bump, Quick Capture/import parsing changes, root generated assets, push/merge/deploy.
