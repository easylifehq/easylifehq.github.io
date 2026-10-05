# Independent Claude verification — EasyWorkout durable legacy import

Review only; do not edit files. Work inside this isolated candidate with synthetic data only. Do not use web, subagents, credentials, real workout records, or unrelated repositories.

Read the durable-import work-unit prompt and receipt, then inspect only its changed EasyWorkout/import, Settings export, Firestore rules, and focused test files. Review the actual diff against these requirements:

- deterministic owner-scoped batch/observation identities;
- preview classification as new/existing/conflict;
- explicit confirmation before writes;
- retry-safe create-only behavior with no overwrite;
- immutable confirmation receipt;
- unchanged-only soft rollback tombstone, idempotency and excluded readback;
- automatic persisted-history readback after reload;
- whole-account JSON export inclusion;
- canonical workout sessions, metrics, goals and guidance remain isolated;
- owner-only strict immutable rules;
- no deployment, real account writes or private data.

Independently scrutinize operational limits and rules validity, especially the validator's maximum document size/count, Firestore batch/transaction write and read limits, rule access-call limits, document-size limits, and every rules-language method used. The implementation includes a synthetic 600-observation emulator case that has never executed because the prior emulator process could not establish loopback; determine whether its design is actually viable rather than accepting its unexecuted assertion.

Run, without editing:

1. the two focused durable-import test files;
2. the full unit suite;
3. typecheck;
4. production build;
5. the synthetic workout browser journey;
6. the existing Firestore emulator suite once;
7. `git diff --check`.

Do not retry or work around an environment-level emulator failure. Report findings first, ordered Critical / Important / Minor, with exact file and line references. Distinguish verified results from blocked/unexecuted claims. Include the full Claude JSON receipt in terminal output for coordinator capture.
