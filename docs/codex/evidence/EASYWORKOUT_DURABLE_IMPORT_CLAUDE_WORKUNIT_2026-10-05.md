# EasyWorkout durable legacy import — Claude work unit

Work only in this isolated EasyWorkout candidate. This is one cohesive planning, TDD implementation, test, and self-correction unit. Do not spawn subagents or use web/network tools.

Read only the files needed from this shortlist and their direct imports: the legacy import contract/receipt/plan, `legacyWorkoutObservation.ts`, `legacyWorkoutTrends.ts`, `WorkoutLegacyImportPreview.tsx`, `WorkoutLegacyProgressPanel.tsx`, `EasyStatisticsPage.tsx`, relevant Firestore adapters, `accountExport.ts`, `SettingsPage.tsx`, `firestore.rules`, `firebase.json`, and focused/emulator tests. Do not inspect other repositories, private files, real workout JSON, Codex/Claude state, credentials, or user profiles.

## Goal

Extend the existing validated local-preview slice into a bounded owner-scoped durable import so a signed-in owner can preview a selected v1 JSON document against stored records, explicitly confirm it, reload and see the persisted legacy progress, export it, and perform a safe unchanged-only soft rollback. Keep canonical workout sessions, statistics formulas, goals, PR/e1RM math, and guidance completely isolated.

## Required behavior

1. Use synthetic fixtures only. Never request, read, embed, log, or send real workout history.
2. Add a pure domain module with deterministic batch and observation document IDs, canonical persistence shapes, and a preview that classifies every proposed record as `new`, `existing`, or `conflict` by exact canonical content. IDs must be stable across retries and safe Firestore document IDs.
3. Confirmation must be explicit in the UI. The Firestore transaction must re-read the deterministic records, create only missing records, accept byte-equivalent/canonically equivalent existing records, and abort the whole import on any conflict. Never overwrite an existing batch, observation, or receipt. Retry must be idempotent.
4. Create an immutable deterministic confirmation receipt. Implement safe soft rollback as a separate immutable rollback receipt/tombstone: only create it after re-reading and proving the imported batch/observations/confirmation receipt are still canonically unchanged. Do not delete or mutate provenance records. Readback excludes rolled-back batches. Retrying rollback is idempotent; changed/missing/conflicting records fail closed.
5. Store everything below the authenticated owner path in narrowly named legacy-import collections. All persisted documents carry `ownerId` and a schema/version discriminator. Provenance from the validated contract remains verbatim and immutable.
6. Add readback/subscription support that reconstructs validated legacy documents for the existing legacy trend panel. Signed-in owners see persisted history after reload. Demo remains synthetic and never writes. Local selection still stays in memory until explicit confirmation.
7. Update the picker copy and states to show storage preview counts, conflicts, confirmation success/failure, and rollback availability honestly. Disable writes for signed-out/demo contexts. Do not imply that local bytes are uploaded before confirmation.
8. Add strict Firestore rules for owner-only reads and create-only immutable legacy batch, observation, confirmation receipt, and rollback receipt documents. Deny cross-owner access, updates, deletes, unknown fields, invalid schemas, and provenance identity mismatches.
9. Add the legacy collections to deterministic whole-account JSON export and Settings subscriptions/manifest. No CSV contract is required. Preserve secret filtering.
10. Add focused pure-domain, adapter/source/UI, export, and emulator rule tests. Use RED → GREEN. Extend the existing emulator test file rather than creating a second emulator harness. Run the focused tests, full unit suite, typecheck, production build, emulator suite, and `git diff --check`.
11. Update the implementation receipt with exact commands/results, collection paths, rollback semantics, remaining release gates, and explicit confirmation that nothing was deployed, committed, merged, or written to a real account.

## Boundaries

- No deployment, Firebase project access, account write, credential/auth change, package install, network fetch, public-site change, commit, merge, or Stable/Published modification.
- Do not alter `workoutSessions`, existing workout formulas, normal metrics inputs, goals, targets, or promotion behavior.
- Do not build a generic migration framework. Implement only the v1 legacy observation contract already present.
- Do not weaken existing Firestore rules. The local emulator is available through the repository's existing `npm --prefix app-vNext run test:emulator` command and cached Firebase CLI.
- If a genuine blocker prevents safe completion, stop and report it once. Otherwise finish the bounded slice, including correcting your own observed test/build failures inside this one work unit.

At the end, return a concise summary plus the full JSON receipt emitted by Claude Code. Do not close or clean up the terminal; the coordinator will capture it first.
