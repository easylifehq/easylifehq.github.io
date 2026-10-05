# Claude documentation task — EasyWorkout durable import release approval packet

Work only in this isolated EasyWorkout candidate. Read and write documentation only; do not edit product source, tests, rules or configuration. Do not run tests, use web/subagents, deploy, access Firebase production, use credentials, or read real workout JSON.

The owner directly authorized relevant EasyWorkout source/tests to this connected Anthropic subscription. Real workout records, credentials and unrelated repositories remain excluded.

Create exactly one file: `docs/codex/EASYWORKOUT_DURABLE_IMPORT_RELEASE_APPROVAL_PACKET_2026-10-04.md`.

Use minimal evidence from:

- `git status --short`, `git diff --stat`, and the exact `firestore.rules` diff;
- `.firebaserc`, `firebase.json`, `CNAME`, deployment workflows/docs and package scripts needed to identify the production Firebase project and hosting target;
- the durable-import contract, receipt and Claude evidence files;
- current `WorkoutInsightsPanel.tsx`, `workout-stats-progress.browser.mjs`, `quick-workout-acceptance.browser.mjs`, and any `exerciseSelection.ts` / `workout-exercise-search.test.mjs` files.

The earlier separate stats-search candidate was based on `60b1a9c3` and was not merged. Its intended production change was a pure `exerciseSelection.ts` selector plus `WorkoutInsightsPanel.tsx` no-match state; its test-only repair replaced a stale hard-coded Bench Press source date with the saved session's `performedOn` and asserted the demo source link. Determine from the current files whether both are already present or require integration; do not assume.

Owner-executed emulator evidence source `Sentinel_e28997826648819182f610f27b8416f6`: the owner ran the exact candidate `test:emulator` command interactively at 2026-10-05 01:09 UTC / 2026-10-04 19:09 America/Denver. Result: 16 passed, 0 failed, 0 skipped, exit 0; SIGINT was normal shutdown. Label this owner-executed evidence, not agent-executed.

The packet must be concise and decision-ready:

1. Candidate identity, scope and verified gates, distinguishing owner-executed evidence from Claude/agent evidence.
2. Exact rules access delta: collection paths, who can read/create, what cannot update/delete, identity/schema constraints, and unchanged existing collections.
3. Exact production Firebase project and hosting/deployment target, supported by repository files. If any target is not determinable, mark it unresolved instead of guessing.
4. Stats-search/test-repair integration result with exact present/missing files or assertions.
5. Release sequence: integrate any required prior patch, rerun affected gates, approve exact rules diff, deploy rules before UI, deploy the exact app target, then owner canary.
6. Owner canary plan using the local real JSON without exposing it to Claude: local preview, expected counts supplied by the owner, conflict check, explicit confirmation, reload/readback, idempotent retry, account export verification, and stop criteria.
7. Rollback plan: app rollback to the prior release; keep strict rules unless separately reviewed; durable import uses the unchanged-only soft tombstone and never deletes/rewrites provenance; no automatic rollback or destructive cleanup.
8. One bundled approval statement with exact targets and consequences. It must explicitly seek authorization for any required integration, production rules deployment, hosting deployment, and one owner-account canary write. It must not include credentials, account IDs or raw workout records.

State clearly that no action has yet been deployed or written to a real account. Do not claim the owner emulator run proves hosting or production-account behavior.

At completion, summarize the packet path; the coordinator will capture the full Claude JSON receipt before closing the terminal.
