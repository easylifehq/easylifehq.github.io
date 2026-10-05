# Easy Workout legacy observations: bounded implementation plan

## Goal

Implement a synthetic-only, read-only first slice that validates the v1 import contract, derives honest recorded-load trends, and demonstrates the result in demo mode without touching canonical workout statistics or production storage.

## Boundaries

- No Firestore adapter, rules change, deployment, real account write, real history, migration, target overlay, or promotion flow.
- Never pass private workout records to a model. Tests and UI use generic synthetic fixtures only.
- Do not change the current workout insight math, goals, streaks, guidance, or canonical `workoutSessions` contract.

## TDD tasks

1. Add failing contract tests for supported temporal variants, evidence classification, strict invalid values/bounds, preview counts, and preservation of source provenance.
2. Implement `legacyWorkoutObservation.ts` as a dependency-free parser/validator returning typed validated data or structured errors. Do not silently coerce or invent dates.
3. Add failing trend tests proving performed-only inclusion, known equipment/convention separation, caveated same-source unknown series, source-order fallback, and absence of PR/e1RM/rate outputs.
4. Implement `legacyWorkoutTrends.ts` with deterministic grouping and display-ready points.
5. Add synthetic fixtures and failing source/UI tests for a read-only `WorkoutLegacyProgressPanel` shown only in Easy Statistics demo mode. Render precision, provenance, excluded counts, and unknown-series caveats. No controls that imply save/import/promotion.
6. Wire the panel alongside `WorkoutInsightsPanel`, add narrowly scoped styles, and verify mobile source structure.
7. Run focused tests, full unit tests, typecheck, and build. Record exact commands/results and diff scope in the receipt.

## Expected files

- `app-vNext/src/features/easyworkout/domain/legacyWorkoutObservation.ts`
- `app-vNext/src/features/easyworkout/domain/legacyWorkoutTrends.ts`
- `app-vNext/src/features/easyworkout/demo/workoutLegacyDemoFixtures.ts`
- `app-vNext/src/features/easyworkout/components/WorkoutLegacyProgressPanel.tsx`
- `app-vNext/src/features/easystatistics/routes/EasyStatisticsPage.tsx`
- a narrowly scoped stylesheet already loaded by the page
- focused `app-vNext/tests/*.test.mjs`
- `docs/codex/EASYWORKOUT_LEGACY_OBSERVATIONS_RECEIPT_2026-10-04.md`

## Acceptance

- Contract and trend tests demonstrate every comparison-policy boundary.
- The app exposes no persistence path for legacy observations.
- Demo UI says `Legacy progress` and `Recorded load`; uncertain equipment/convention is plainly caveated.
- Normal workout analytics receive only their existing props/data.
- Repository unit tests, typecheck, and build pass from the isolated worktree.
