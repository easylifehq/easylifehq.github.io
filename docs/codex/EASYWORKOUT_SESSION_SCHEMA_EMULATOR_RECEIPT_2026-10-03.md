# EasyWorkout session-schema emulator receipt

- Evidence source: owner-supplied PowerShell transcript
- Run completed: 2026-10-03 00:22 UTC
- Runtime: normal host PowerShell, not the Codex sandbox runtime
- Command: `npm run test:emulator`
- Firebase project: `demo-easylife-wave2` (demo/emulator only)
- Result: 8 tests passed, 0 failed
- Production Firestore, credentials, deployment, and live user data: not used

## Tested-file verification

Codex inspected the worktree at 2026-10-03T00:24:27Z. All tested source and test files had modification times before the owner run, and the reviewed diff had no intervening tracked changes.

| File | Last modified UTC | SHA-256 |
|---|---|---|
| `firestore.rules` | 2026-10-02T23:13:33.2713156Z | `33A8E0A7D3D1DE6A99074CB300222D93B2790F5074DE30B4459F7EEE33A58348` |
| `app-vNext/src/features/easyworkout/domain/workoutSessionContract.ts` | 2026-10-02T23:13:29.3333575Z | `CC9D9D643492794AC9BF1A7F7F9103830EFFA2DCCD41E376C7012C336CDB8818` |
| `app-vNext/src/features/easyworkout/routes/EasyWorkoutLogPage.tsx` | 2026-10-02T23:13:30.7493161Z | `ED9E29B88F291976DC97BAAE1402D1B3D8963C6292040838AF9D849565B583DB` |
| `app-vNext/src/features/experiments/domain/quickWorkoutCapture.ts` | 2026-10-02T23:13:32.0569027Z | `8D86109D0B2B6992072FD294DA504A037272E0DCD137BEE9F1170C70721E2CFF` |
| `app-vNext/tests/firebase-emulator.integration.mjs` | 2026-10-02T23:13:34.6613081Z | `B16E7015902D62841A6588E73B07DD11079E1F8E378193EEEEFE25A5A7E9B4CC` |
| `app-vNext/tests/quick-workout-capture.test.mjs` | 2026-10-02T23:09:53.1829448Z | `B5D16810EA211C1A82C45C42D9635052B5DD24CABD97A5E5916433BE97FA29B5` |
| `app-vNext/tests/workout-draft.test.mjs` | 2026-10-02T23:09:54.4085470Z | `E18BBE593D583F993F70D324DD99F4EA4B12334B2D33FF3097FE7C7D62DAB581` |

## Full owner transcript

```text
PS C:\Users\codex-agent> cd C:\Users\codex-agent\Documents\Codex\2026-10-02\task-3\easylife-completion-integrity\app-vNext
PS C:\Users\codex-agent\Documents\Codex\2026-10-02\task-3\easylife-completion-integrity\app-vNext> npm run test:emulator

> easy-system-app-vnext@4.37.1 test:emulator
> npx --yes firebase-tools@15.25.1 emulators:exec --project demo-easylife-wave2 --config ../firebase.json --only firestore "node --experimental-strip-types --test tests/firebase-emulator.integration.mjs"

i  emulators: Starting emulators: firestore
i  emulators: Detected demo project ID "demo-easylife-wave2", emulated services will use a demo configuration and attempts to access non-emulated services for this project will fail.
i  firestore: Firestore Emulator logging to firestore-debug.log
+  firestore: Firestore Emulator was started in standard edition.
+  firestore: Firestore Emulator UI websocket is running on 9150.
i  Running script: node --experimental-strip-types --test tests/firebase-emulator.integration.mjs
✔ authenticated owner data drives My Week and the Today review entry without crossing accounts (1700.791ms)
✔ authenticated workout records drive guidance, PR filters, and versioned local exports (110.6812ms)
✔ draft handoff remains local while Firestore rules enforce owner-only session access (159.8015ms)
✔ workout session rules accept legacy shapes but reject corrupt, oversized, and mutable identities (110.8315ms)
✔ current workout client payloads honor the session schema contract, retry identity, and owner boundary (228.1692ms)
✔ authenticated owner records drive Wave 3 search, focused review, and safe whole-account export (70.6112ms)
✔ workout goals enforce versioned ownership, lifecycle validation, and recoverable archive behavior (165.0909ms)
✔ all product-wave collections deny cross-owner and top-level access (438.7986ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3202.3854
+  Script exited successfully (code 0)
i  emulators: Shutting down emulators.
i  firestore: Stopping Firestore Emulator
!  Firestore Emulator has exited upon receiving signal: SIGINT
i  hub: Stopping emulator hub
i  logging: Stopping Logging Emulator
```
