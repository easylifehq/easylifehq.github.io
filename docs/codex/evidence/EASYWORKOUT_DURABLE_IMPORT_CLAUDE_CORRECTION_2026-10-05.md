# Claude correction — EasyWorkout durable legacy import

Work only in the isolated EasyWorkout candidate, with synthetic data. Do not use web, subagents, credentials, real workout records, unrelated repositories, deployment, or live Firebase. This is one bounded correction after independent review; do not redesign a generic migration framework.

## Critical finding to correct

The current durable importer allows up to 5,000 observations and tries to confirm every observation plus its batch and receipt in one Firestore transaction. The installed Firestore SDK documents a maximum of 500 writes per transaction. The unexecuted 600-observation emulator test is therefore not viable, and rollback/retry can also generate verify mutations for read-only documents.

Use the smallest safe bounded correction: add an explicit durable-import maximum of **450 observations per v1 batch** while leaving the local read-only contract parser's 5,000-observation validation limit intact. Enforce the 450 limit consistently before any Firestore read/write, in persistence shapes, Firestore rules, UI copy/error handling, tests, and the receipt. This leaves headroom for the batch, confirmation/rollback records and transaction verification mutations. Do not implement chunking.

Replace the impossible 600-observation success assertion with synthetic tests proving:

- 451 observations are rejected locally before any transaction/write planning;
- a 450-observation batch produces a plan within the documented limit;
- where the emulator runs, a 450-observation confirm/retry/rollback path succeeds without touching canonical workout collections.

## Important review items

- Recheck strict rules and record validation for batch `sourceOrdinals`, observation set contents, deterministic IDs and receipt/batch identity. Fix any safely enforceable gaps without exceeding Firestore rules access-call limits.
- Document the unavoidable rules boundary: confirmation cannot make hundreds of per-observation `getAfter` calls, so the owner client transaction writes the complete deterministic set and readback validates/fails closed on count/content mismatches.
- Keep rolled-back source keys blocked in v1 and keep all provenance records immutable.
- Preserve canonical workout sessions, metrics, goals and guidance unchanged.

## Verification

Use RED → GREEN for the count-limit correction. Run exactly once after GREEN:

1. focused durable-import tests;
2. full unit suite;
3. typecheck;
4. production build;
5. synthetic workout browser journey;
6. existing Firestore emulator suite once;
7. `git diff --check`.

Do not retry or work around an environment-level emulator failure. If loopback still fails, record it precisely as a release blocker. Remove only generated debug logs. Update the implementation receipt with exact results and the 450-record rationale. Return a concise summary; the coordinator will capture the full JSON receipt before closing the terminal.
