# Claude read-only diagnosis — EasyWorkout Firestore emulator gate

Work only in this isolated EasyWorkout candidate. This is a read-only diagnosis and, only if justified by the diagnosis, one ordinary emulator test execution. Do not edit files, use web/subagents, install or update packages, alter firewall/security/sandbox settings, deploy, access Firebase production, or write real account data.

The owner directly authorized relevant EasyWorkout source/tests to this connected Anthropic subscription. Real workout records, credentials, unrelated files and repositories remain excluded.

## Existing failure evidence to inspect first

The preceding Claude correction ran `npm --prefix app-vNext run test:emulator` once. Firebase CLI 15.25.1 used Firestore emulator JAR v1.22.0, but the emulator exited before tests with:

- `Unable to establish loopback connection`
- `SocketException: Invalid argument: connect`

The generated `app-vNext/firestore-debug.log` was intentionally removed after its failure was recorded. Do not recreate or edit product files merely to investigate.

Before running the suite, read only:

- `app-vNext/package.json`
- `firebase.json`
- `app-vNext/tests/firebase-emulator.integration.mjs`
- `firestore.rules`
- the durable-import receipt and Claude correction/review evidence files

Then perform only non-mutating local checks needed to determine whether the failure was caused by an unavailable Java/runtime, occupied configured port, missing cached Firebase tool/JAR, invalid project/config path, or a loopback restriction. Do not read command lines, credentials or user profiles.

If those checks show a normal local path and no security change is needed, run the repository's existing emulator suite exactly once. Do not retry. Do not change ports, rules, tests, network settings, Java, cache contents or configuration. If it fails, preserve and report the exact stage/error; do not work around it.

Report:

1. root-cause evidence versus inference;
2. exact emulator command and exit result;
3. tests passed/failed if execution reached them;
4. whether the durable import rules gate is satisfied;
5. any unavoidable blocker and the smallest owner/admin action outside this session.

Emit the full Claude JSON receipt for coordinator capture.
