# EasyLife Product Wave 2 Release Closure — 2026-08-02

## Outcome

The bounded closure pass is PR-ready. Authenticated Firestore Emulator coverage now exercises the product-wave data paths and authorization boundaries, local demo Firebase access fails closed to the loopback emulator, CI runs the emulator suite, and every local release gate and the 114-case browser matrix passed. No branch was created, no history was rewritten, no merge or deployment occurred, and no real user data was accessed.

Production deployment remains deliberately blocked on physical iPhone/Android field testing and explicit acceptance or planned major-version remediation of the inherited moderate dependency advisories described below.

## Repository identity and verified SHAs

- Repository: `C:\Dev\easylifehq.github.io`
- Existing branch: `codex/easylife-product-upgrade-wave-2-20260802`
- Verified local and remote starting HEAD: `e2d462c789a7ce1e6de3a970a1b839a183e9da74`
- Verified clean starting worktree: yes
- Closure implementation commit: `c29dfa4c594254a09f1e497c557edcfcdde08a1d` (`Close Firebase emulator release gaps`)
- Receipt commit: the commit containing this document; its exact post-commit SHA is verified in the final handoff because a commit cannot truthfully embed its own content-derived SHA.

The reported final Wave 2 HEAD was correctly `e2d462c789a7ce1e6de3a970a1b839a183e9da74`, not `42244e9a...` or `af478964...`. The sequence is legitimate:

1. `af47896412257eaac45df774004cd28da1709540` built the Wave 2 runtime, tests, fixtures, and evidence.
2. `42244e9a6bb05703923f7c3e0b8349eed5150efd` added the product-wave receipt.
3. `e2d462c789a7ce1e6de3a970a1b839a183e9da74` then appended the final npm advisory-gate results to that receipt.

The extra commit is a legitimate documentation-only audit completion, so history was preserved.

## Closure changes and emulator proof

- Added `@firebase/rules-unit-testing` 4.0.1 as an exact development dependency. It is compatible with the installed Firebase 11 line and has no known audit advisory.
- Added a Firestore emulator at loopback-only `127.0.0.1:8088`, with the Emulator UI disabled and single-project mode enabled.
- Added four authenticated emulator integration tests against the synthetic `demo-easylife-wave2` project:
  - owner records drive My Week sections and the Today entry while cross-owner reads fail;
  - owner routines/sessions drive Guided Next Workout, PR filters, and versioned JSON/CSV exports;
  - workout draft handoff remains local while owner writes succeed and cross-owner/anonymous reads and writes fail;
  - all Wave 2 collections (`tasks`, `calendarEvents`, `calendarTaskBlocks`, `projects`, `projectTaskLinks`, `applications`, `notes`, `workoutRoutines`, and `workoutSessions`) allow their owner and deny cross-owner access; top-level writes are denied.
- Added three runtime-safety unit tests. Loopback `demo=1` and `visualQa=1` routes select the emulator; an explicit automated-test target must be a valid loopback host and port; a production hostname with `demo=1` never enables demo Firebase behavior.
- Added the emulator suite to the pull-request release workflow.

### Why demo and automation cannot write production Firebase

The proof is layered rather than dependent on one convention:

1. The deterministic demo providers use fixture data and do not perform Firebase writes.
2. Any loopback browser route with `demo=1` or `visualQa=1` connects Firestore to `127.0.0.1:8088` before product code can use the database.
3. Automated Firebase integration refuses to start unless `FIRESTORE_EMULATOR_HOST` is exactly loopback port 8088, the project ID starts with `demo-`, and the project is not the production project `pipeline-2f422`.
4. Firebase CLI identifies the demo project and reports that attempts to reach non-emulated services fail.
5. The final 114-case browser matrix observed no request/response URL containing `firestore.googleapis.com` or `pipeline-2f422`.

Normal non-demo local development retains its existing configured-project behavior; the new fail-closed routing is intentionally scoped to deterministic demo/visual-QA and explicit automation.

## Dependency advisory disposition

All three package/lockfile pairs were reproduced independently. `npm audit fix` without `--force` was attempted in the active app and active functions packages; both reported up to date and changed no lockfile. No forced fix was used.

### Active web app (`app-vNext`)

Full audit: **4 nodes — 3 moderate, 1 high**. Production-only audit: **2 nodes — 2 moderate**. Critical-level production gate: **exit 0**.

| Advisory nodes | Scope / dependency | Reachability | Origin | Disposition |
| --- | --- | --- | --- | --- |
| `react-router-dom`, `react-router` | Production; `react-router-dom` direct, `react-router` transitive | Open-redirect paths are likely unreachable because the SPA uses fixed internal destinations/encoded IDs; SSR hydration constructor injection is unreachable in this client-only Vite build | Inherited | Fix requires the React Router 7 major line; breaking, defer to a tested migration |
| `vite`, `esbuild` | Development; Vite direct, esbuild transitive | Local development/build tooling only; not present in the production bundle. Dev servers are loopback-bound in verification | Inherited | Fix requires Vite 8; breaking, defer to a tested toolchain migration |
| `@firebase/rules-unit-testing` 4.0.1 | Development, direct | Test-only emulator client | Introduced | No advisory; retain exact pin |
| `firebase-tools` 15.25.1 | Ephemeral development command, direct only at execution time; transitive moderate CLI chains | Runs only in CI/local verification against a demo project; not persisted in either package or lockfile and not shipped | Introduced for closure | Exact `npx` pin retained; installing it in the lockfile added avoidable advisory nodes, so the safe configuration is ephemeral |

The React Router entries cover GHSA-wrjc-x8rr-h8h6 and GHSA-337j-9hxr-rhxg, plus the `react-router-dom` aggregate/open-redirect chain. The Vite/esbuild entries cover GHSA-4w7w-66w2-5vf9, GHSA-v6wh-96g9-6wx3, GHSA-fx2h-pf6j-xcff, and GHSA-67mh-4wv8-2f99.

### Active Firebase functions (`functions`)

Full and production-only audit: **8 nodes — 8 moderate**. Critical-level production gate: **exit 0**. There are no development dependencies in this package.

| Advisory nodes | Scope / dependency | Reachability | Origin | Disposition |
| --- | --- | --- | --- | --- |
| `firebase-admin` | Production, direct | Reachable for app initialization and `auth().verifyIdToken`; the reported issue is inherited through unused Firestore/Storage dependency paths | Inherited | Audit proposes a breaking major change; defer |
| `@google-cloud/firestore`, `@google-cloud/storage`, `gaxios`, `google-gax`, `retry-request`, `teeny-request`, `uuid` | Production, transitive | Likely unreachable in the active functions: source inspection found Firebase Admin use only for Auth token verification, with no Firestore, Storage, or direct UUID-buffer calls. The UUID issue requires caller-supplied buffers to v3/v5/v6 | Inherited | Audit offers only a breaking Firebase Admin upgrade; defer with reachability note |

`firebase-functions` remains a direct production dependency and is actively used, but it is not itself an advisory node in the reproduced current audit.

### Archived package (`old-site/easypipeline/functions`)

Full audit: **26 nodes — 2 low, 15 moderate, 7 high, 2 critical**. Production-only audit: **20 nodes — 1 low, 13 moderate, 4 high, 2 critical**. This package is quarantined under `old-site`, is excluded from the active release and CI, and was not edited.

| Advisory nodes | Scope / dependency | Reachability | Origin | Disposition |
| --- | --- | --- | --- | --- |
| `firebase-admin` | Production, direct | Unreachable from the vNext release; relevant if archive is reactivated | Inherited | Do not deploy archive; must remediate before any reactivation |
| `@google-cloud/firestore`, `@google-cloud/storage`, `@grpc/grpc-js`, `@protobufjs/utf8`, `@tootallnate/once`, `body-parser`, `express`, `fast-xml-builder`, `fast-xml-parser`, `form-data`, `gaxios`, `google-gax`, `path-to-regexp`, `protobufjs`, `qs`, `retry-request`, `teeny-request`, `uuid`, `websocket-driver` | Production, transitive | Unreachable from active application/functions; potentially reachable inside the archived server | Inherited | Includes both critical nodes (`protobufjs`, `websocket-driver`) and high nodes; archive remains a deployment blocker if reactivated |
| `firebase-functions-test` | Development, direct | Archived tests only | Inherited | Update only as part of deliberate archive rehabilitation |
| `@babel/core`, `brace-expansion`, `js-yaml`, `lodash`, `ts-deepmerge` | Development, transitive | Archived tooling/tests only | Inherited | Same; no active-release exposure |

`firebase-functions` and `openai` are direct archived production dependencies but were not advisory nodes in the reproduced audit. No archive fix was applied because repository instructions quarantine it, a partial lockfile mutation would not improve the active release, and reactivation requires a deliberate major migration plus regression testing.

## Exact verification results

| Command / check | Result |
| --- | --- |
| `npm.cmd test` in `app-vNext` | **42/42 passed**, 0 failed |
| `npm.cmd run typecheck` in `app-vNext` | Passed |
| `npm.cmd run build` in `app-vNext` | Passed; TypeScript plus Vite production build, **198 modules transformed** |
| `npm.cmd run lint` in `functions` | Passed (`node --check index.js`) |
| `npm.cmd run test:emulator` in `app-vNext` | **4/4 passed**, 0 failed; Firestore Emulator 1.22.0, Java 21, demo project only |
| `npm.cmd audit --omit=dev --audit-level=critical` in `app-vNext` | Exit 0; 2 residual moderate production nodes |
| `npm.cmd audit --omit=dev --audit-level=critical` in `functions` | Exit 0; 8 residual moderate production nodes |
| `git diff --check` | Passed; line-ending notices only, no whitespace error |
| Browser routes at 1440×900 | **57/57 passed** |
| Browser routes at 390×844 | **57/57 passed** |
| Total browser matrix | **114/114 passed**; visible main content, no alerts/error copy, no horizontal overflow, no HTTP ≥400, no failed/truncated requests |
| Browser console | **0 warnings, 0 errors** |
| Production Firebase network check | **0 production Firestore/project URLs observed** |

The 57-route inventory is the original 40-route release matrix, 16 aliases/dynamic states independently discovered during hardening, and the My Week query state. The final interaction pass also verified all six My Week sections, Today → My Week, the Upper guided-workout 185 lb evidence/optional 190 lb suggestion/fallback, composed Upper + Bench + PR history filters, the truthful no-match state, and both JSON and CSV export confirmations.

## Demo links and screenshots

Start a local production preview, then use:

- `http://127.0.0.1:4173/app/hq?demo=1`
- `http://127.0.0.1:4173/app/easystatistics?tab=week&demo=1`
- `http://127.0.0.1:4173/app/easyworkout/dashboard?demo=1`

Re-inspected evidence:

- [Today weekly-review entry — desktop](./evidence/product-upgrade-wave-2-2026-08-02/01-today-weekly-review-entry-desktop.png)
- [My Week — desktop](./evidence/product-upgrade-wave-2-2026-08-02/02-my-week-desktop.png)
- [My Week — phone viewport](./evidence/product-upgrade-wave-2-2026-08-02/03-my-week-phone.png)
- [Guided Next Workout — desktop](./evidence/product-upgrade-wave-2-2026-08-02/04-guided-workout-desktop.png)
- [Workout filters — phone viewport](./evidence/product-upgrade-wave-2-2026-08-02/05-history-filters-phone.png)
- [Workout CSV confirmation — phone viewport](./evidence/product-upgrade-wave-2-2026-08-02/06-history-export-phone.png)

## Remaining limitations, CI/PR readiness, and deployment blockers

- No physical phone was available. iOS Safari and Android Chrome installation, safe-area layout, virtual keyboard behavior, background/foreground draft retention, airplane-mode relaunch, and service-worker update behavior still require `docs/codex/WORKOUT_PHONE_FIELD_TEST.md` on real devices.
- The browser’s synthetic phone viewport is useful responsive coverage but is not a substitute for device storage, OS lifecycle, and installed-PWA behavior.
- The inherited moderate React Router and active Firebase/UUID chains need explicit risk acceptance for the current release or planned, separately tested major-version migrations.
- The archived old-site package must never be deployed; its critical/high advisories block any future reactivation until remediated.
- The release workflow now runs unit tests, emulator integration, build, functions lint, and critical advisory gates on every pull request. This product branch is not included in the workflow’s direct `push` branch filter, so opening/updating a PR is the action that triggers GitHub-hosted CI.

**PR readiness:** green for opening or updating a PR after the pushed branch is confirmed.  
**Merge readiness:** conditional on green GitHub-hosted PR checks and reviewer acceptance of the documented moderate advisory reachability.  
**Deployment readiness:** yellow; physical iPhone/Android field testing and advisory acceptance/migration decisions remain exact blockers.  
**Rollback:** revert `c29dfa4c594254a09f1e497c557edcfcdde08a1d` to remove the closure runtime/CI/tests, and revert `af47896412257eaac45df774004cd28da1709540` to remove Wave 2 product behavior.

## Exact next commands

```powershell
Set-Location C:\Dev\easylifehq.github.io
git checkout codex/easylife-product-upgrade-wave-2-20260802
git pull --ff-only
git status --short --branch
git log -5 --format="%H %s"

Set-Location app-vNext
npm.cmd ci
npm.cmd test
npm.cmd run test:emulator
npm.cmd run build
npm.cmd audit --omit=dev --audit-level=critical

Set-Location ..\functions
npm.cmd ci
npm.cmd run lint
npm.cmd audit --omit=dev --audit-level=critical

Set-Location ..
gh pr create --base main --head codex/easylife-product-upgrade-wave-2-20260802 --title "EasyLife product upgrade wave 2" --body-file docs/codex/EASYLIFE_PRODUCT_WAVE_2_CLOSURE_2026-08-02.md
gh pr checks --watch
```

After green PR checks and review, complete `docs/codex/WORKOUT_PHONE_FIELD_TEST.md` on one iPhone and one Android device. Do not deploy until those results and the active moderate-advisory disposition are accepted.

`YELLOW_EASYLIFE_WAVE_2_PR_READY_WITH_LIMITATIONS`
