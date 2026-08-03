# EasyLife Release-Candidate Hardening Receipt — 2026-08-01

## Verdict

`YELLOW_EASYLIFE_RELEASE_CANDIDATE_WITH_LIMITATIONS`

The audited application code is suitable for merge after review. The newly added GitHub CI jobs passed on the pushed branch. Production deployment should still wait for the existing physical-phone checklist to be completed on at least one iPhone and one Android device. No real user data, production deployment, merge, or history rewrite was used during this audit.

## Independently verified Git boundary

- Upgrade branch requested: `codex/weekend-upgrade-workout-intelligence-20260801`
- Expected and verified upgrade SHA: `c62486a9db50e8482d832d46855db98d0ffd58c8`
- True pre-upgrade source base: `5fa6149112a6c24d1cbda815a0978dd03425ff61`
- Independently reconstructed source sequence: `5fa61491` (pre-upgrade) → `dc6ef87` (workout intelligence) → `b23947c` (weekend corrections) → `c62486a` (receipts)
- Hardening branch: `codex/easylife-release-candidate-hardening-20260801`
- Hardening branch was created directly from the exact requested SHA; its merge-base and initial HEAD were both `c62486a9db50e8482d832d46855db98d0ffd58c8`.
- Ending audited implementation SHA: `1fa66556857b9ceb3e1b7c21cb58432071ba620f`
- This receipt is committed after the audited implementation SHA and contains no runtime change; the final receipt commit is reported by `git rev-parse HEAD` in the handoff.

The repository-level `CODEX.md`, all weekend receipts, the statistics contract, the phone checklist, Firestore rules, the entire `5fa61491..c62486a` change set, and all three package lockfiles were read independently. The generated root app and archived `old-site/` were not edited.

## Findings by priority

### P0

None found.

### P1 — fixed

1. **Drafts crossed authentication boundaries on shared browsers.** The logger used one global local-storage key, so a second signed-in account could inherit the first account's unsynced draft. Draft schema v3 now includes an owner and uses an owner-scoped key; recovery rejects mismatched ownership. Privacy is favored over automatically importing legacy unscoped drafts.
2. **A confirmed save could be followed by a stale autosave during navigation.** The unmount flush guard was only armed when a matching stored draft happened to exist. The guard is now armed as soon as a confirmed session ID is returned, before clearing or navigating.
3. **Deterministic Firestore IDs were not create-once.** Retry writes used `setDoc` and could overwrite an existing session; sanitized IDs could also collide. IDs now pass a collision-safe validator and are persisted in a Firestore transaction that creates only when absent. The first confirmed write wins and `createdAt` remains stable.
4. **Workout record links could escape demo mode.** Several statistics record links omitted `demo=1`, allowing a synthetic-data walkthrough to leave demo isolation and query authenticated data. All statistics, review, dashboard, logger, exercise, and tab links now preserve demo state; a static regression test covers every statistics session-link variant.

### P2 — fixed

1. Blank default weighted boxes were treated as meaningful draft work, producing a false Resume action.
2. Incomplete weighted sets could be saved or counted. A weighted working set now requires positive reps and positive load; warm-ups, deleted sets, corrupt values, and incompatible exercise types remain excluded.
3. Local dates accepted rollover values and analytics weekly buckets were rolling blocks rather than true Sunday-start calendar weeks. Strict `YYYY-MM-DD` validation and calendar-week boundaries now cover partial edge weeks without UTC conversion.
4. Duplicate blocks for the same exercise in one session created duplicate trend observations and overstated confidence. Observations are now grouped once per session.
5. The weight-unit setting previously relabeled pounds as kilograms. Sessions and drafts now retain their stored unit (legacy sessions default to pounds), while records, workload, previous-set helpers, review, and statistics convert mixed histories into the selected display unit.
6. A muscle present in both primary and secondary mappings could be double-counted; mappings are now deduplicated with direct exposure taking precedence.
7. A hidden legacy statistics implementation still computed incompatible Brzycki, unitless-volume, and recovery values, and its visible overview surfaced the unitless volume. It was removed from the rendered implementation; the canonical Epley/unit-aware workout panel is the only workout-statistics surface.
8. The service worker served cached navigation shell content without refreshing `/`, so a successfully online visit could still leave an old offline shell indefinitely. Successful navigations now refresh the shell, failed responses are not cached, and cache updates are attached to the fetch lifetime.

### P3 — improved or documented

1. The repository had no GitHub Actions workflow. `.github/workflows/release-candidate.yml` now performs clean app tests/build on Node 24, Functions syntax validation on Node 20, and critical production-advisory gates.
2. The existing large-history deterministic invariant remains green; coverage was expanded for owner isolation, invalid dates, Sunday weeks, duplicate exercise blocks, mixed units, service-worker behavior, Firestore identity validation, and demo-link isolation.
3. Residual dependency advisories, physical-phone coverage, and authenticated Firestore-emulator behavior remain explicit limitations below.

## Fix and regression-test inventory

- Tests increased from 19 to 30.
- Added or expanded coverage for draft migration and owner isolation, blank drafts, rapid and failed saves, idempotent identity validation, complete working-set validity, Epley confidence, lb/kg round trips and mixed-unit workload, equal matched periods, Sunday weeks, invalid dates, zero prior denominators, deleted/warm-up invariants, stable exercise IDs, duplicate blocks, muscle deduplication, malformed and large histories, the 14-week demo fixture, demo route isolation, and service-worker cache policy.
- Firestore persistence now uses a transaction and validated deterministic ID; client-side save retries still share a single in-flight operation.
- Release CI was added and passed on GitHub: run `30714852981`, with both the Node 24 web job and Node 20 Functions job green.

## Dependency-advisory classification

All package/lockfile advisories are **pre-existing relative to the verified upgrade**, because none of the three lockfiles changed in `5fa61491..c62486a`. No forced audit fix was used.

| Lockfile | Initial | Ending | Prod/dev classification | Reachability and disposition |
| --- | --- | --- | --- | --- |
| `app-vNext/package-lock.json` | 10 total: 1 low, 4 moderate, 3 high, 2 critical; 6 production | 4 total: 3 moderate, 1 high; 2 production moderate | Production: `react-router`, `react-router-dom`. Development: `vite`, `esbuild`. | Non-force updates removed all critical advisories and the previous production critical/high chain. Router findings require React Router 7.18 and a major application migration; current links are internal/prefixed, demo-derived IDs are encoded, and this is a client-only SPA, so the reported external redirect and SSR hydration paths are likely unreachable. Vite/esbuild findings affect the development server/build tool, not shipped runtime; the complete fix requires breaking Vite 8.2. Deferred with CI critical gate. |
| `functions/package-lock.json` | 19 total: 1 low, 13 moderate, 3 high, 2 critical | 9 moderate metadata nodes; `--omit=dev` reports 8 production nodes | Production chain: `firebase-admin` → Firestore/Storage/gax/retry/teeny-request → `uuid`; full audit also reports the `firebase-functions` meta-node. | Non-force updates removed critical/high advisories. The remaining UUID issue requires caller-supplied buffers in v3/v5/v6. Active Functions code only verifies auth tokens and does not call Firestore, Storage, gax, or UUID generation, so this path is likely unreachable. npm proposes a breaking Firebase major/downgrade rather than a safe resolution. Deferred pending Node 20/emulator validation of a supported Firebase major upgrade. |
| `old-site/easypipeline/functions/package-lock.json` | 26 total: 2 low, 15 moderate, 7 high, 2 critical | Unchanged: 26 total; 20 production (1 low, 13 moderate, 4 high, 2 critical) | Production: Firebase/Google Cloud chains plus grpc, protobuf, Express/body-parser/qs/path-to-regexp, XML, form-data, UUID, and websocket-driver. Development-only: Babel, brace-expansion, `firebase-functions-test`, js-yaml, lodash, and ts-deepmerge. | Entire lockfile is in the repository-designated archived site, outside the deployed vNext and active Functions surfaces, so it is likely unreachable for this release. Many entries have non-force transitive fixes, while Firebase test/admin resolution also includes breaking changes. It was intentionally not touched because repository instructions prohibit editing the archive. If this code is ever reactivated, dependency remediation is a release blocker before deployment. |

Notable safely patched active transitive packages include `protobufjs` 7.6.5, patched gRPC/websocket-driver/PostCSS/Babel packages in the web lock, and patched Firebase Admin/Functions transitive packages in the active Functions lock. `npm audit fix --force` was never run.

## Exact verification results

### Baseline reproduction

- Clean `app-vNext` install: pass after stopping a stale repository preview process that held esbuild.
- Baseline tests: **19/19 passed**.
- Baseline production build: **passed, 189 modules transformed**.
- Baseline active Functions clean install and `npm run lint`: **passed**; the audit host used Node 24 while the package declares Node 20.

### Final clean-room rerun

- Stopped the audit preview, ran `npm ci` independently in `app-vNext` and `functions`, then reran all checks from those lockfiles.
- `app-vNext npm test`: **30/30 passed, 0 failed**.
- `app-vNext npm run build`: **passed, 190 modules transformed**.
- `functions npm run lint`: **passed** (`node --check index.js`).
- `app-vNext npm audit --omit=dev --audit-level=critical`: **exit 0**; 2 known production moderate nodes remain.
- `functions npm audit --omit=dev --audit-level=critical`: **exit 0**; the known UUID chain remains moderate.
- `git diff --check`: **passed** before the implementation commit.
- Pushed GitHub Actions run [`30714852981`](https://github.com/easylifehq/easylifehq.github.io/actions/runs/30714852981): **passed**. Web clean install/tests/build/audit gate and Functions Node 20 clean install/lint/audit gate were both green. GitHub emitted only its platform annotation that the JavaScript runtime used internally by `actions/checkout@v4` and `actions/setup-node@v4` is being forced from Node 20 to Node 24; the configured Functions command runtime remained Node 20.

### Final browser route matrix

Production preview of the final clean build was inspected in the in-app Chromium browser.

- Claimed weekend matrix: **40/40 desktop at 1440×900** and **40/40 phone at 390×844**.
- Additional discovered aliases/dynamic states: **16/16 desktop** and **16/16 phone**.
- Total final viewport-route checks: **112/112 passed**.
- Criteria: visible `main` landmark, more than 20 characters of body content, no `.error-copy` or alert, and no document-width overflow.
- The lazy root landing route was initially sampled before its chunk rendered at 55 ms; its explicit 500 ms desktop and phone retry passed with one `main`, full content, no errors, and zero overflow.
- Final claimed-route network trace: **40 routes, 724 response/failure events, 0 loading failures, 0 HTTP status ≥400, 0 truncations**.
- Console: **0 warnings, 0 errors**.

Claimed routes: `/`, `/easylist`, `/easynotes`, `/easycalendar`, `/easypipeline`, `/easyhq`, `/easyprojects`, `/easycontacts`, `/easyworkout`, `/easystatistics`, `/login`, `/app`, `/app/hq`, `/app/plan`, `/app/people`, `/app/workout`, `/app/command`, EasyList dashboard/add/email/archive/deleted, Calendar day/month, Notes library/new/trash, Pipeline dashboard/stats/email, Contacts, Projects, Workout dashboard/routines/log, known and unknown exercise detail, Workout Progress, Settings, and not-found. Protected routes were run with `demo=1`.

Additional routes: root Settings alias, Today/Inbox/Notes aliases, EasyList index/inbox/today/upcoming, Calendar index/week, note detail, Pipeline index, project detail/timeline, Workout index, and missing session review; protected routes used `demo=1`.

## Complete synthetic workout demo

The demo ran only against `demo=1`; the banner explicitly reported no Firebase writes.

1. Started the Upper demo routine at phone size.
2. Added notes, changed the first Bench Press set to warm-up, entered 95/185/185 lb, removed and restored a set with Undo, and used Copy Previous to produce four rows.
3. Verified local autosave, left the logger, observed Resume, reloaded, and recovered the exact notes, warm-up flag, four rows, and `[95, 185, 185, 185]` weights.
4. Forced Chromium offline and attempted Save. The logger stayed in place, retained all inputs, kept Save retryable, and displayed `Couldn't sync—draft retained`.
5. Restored the network and retried. Demo save navigated to `demo-saved-45cb315d-9f31-41fb-babd-76dd849aa228?demo=1`.
6. Review showed 1 minute, 3 working sets (warm-up excluded), 3,330 lb·reps, Chest exposure, improving/high-confidence Bench Press trend, 222.0 lb Epley e1RM, and 185 lb for 6 reps.
7. Returned to the dashboard and reloaded: no stale Resume action remained and the synthetic session remained the first recent demo workout via session storage.
8. Verified every visible workout-statistics source URL retained `demo=1`, then checked the full exercise detail and the no-history low-data state.

## Browser evidence

- `docs/codex/evidence/release-candidate-hardening-2026-08-01/01-workout-dashboard-desktop.png`
- `docs/codex/evidence/release-candidate-hardening-2026-08-01/02-active-workout-phone.png`
- `docs/codex/evidence/release-candidate-hardening-2026-08-01/03-restored-workout-phone.png`
- `docs/codex/evidence/release-candidate-hardening-2026-08-01/04-offline-draft-retained-phone.png`
- `docs/codex/evidence/release-candidate-hardening-2026-08-01/05-post-workout-review-phone.png`
- `docs/codex/evidence/release-candidate-hardening-2026-08-01/06-workout-progress-desktop.png`
- `docs/codex/evidence/release-candidate-hardening-2026-08-01/07-exercise-detail-desktop.png`
- `docs/codex/evidence/release-candidate-hardening-2026-08-01/08-low-data-phone.png`

## Remaining limitations

- No physical phone was available. iOS Safari and Android Chrome installation, keyboard behavior, background/foreground draft recovery, airplane-mode relaunch, safe-area layout, and service-worker update behavior remain to be checked with `docs/codex/WORKOUT_PHONE_FIELD_TEST.md`.
- Functions syntax passed locally on Node 24 and passed the pushed CI job on its declared Node 20.
- Firestore rules and client ownership paths were read and the pure identity/auth boundaries were regression-tested, but no authenticated Firebase Emulator Suite end-to-end test was configured. No real user data was used, as required.
- The residual moderate production advisory chains and development-only Vite advisory remain documented above. They are likely unreachable in the audited release paths but should be re-triaged during the React Router 7/Vite 8/Firebase major-upgrade work.

## Merge and deployment readiness

- **Merge:** ready for review; GitHub CI is green. Reviewers should explicitly accept the documented residual-advisory reachability assessment.
- **Production deployment:** yellow, not fully green. Complete the physical-phone checklist before deploying.
- **Rollback boundary:** the hardening implementation is one commit on top of the exact supplied upgrade SHA, followed only by this receipt commit.

## Exact next commands

```powershell
Set-Location C:\Dev\easylifehq.github.io
git checkout codex/easylife-release-candidate-hardening-20260801
git status --short
git log --oneline --decorate -3

Set-Location app-vNext
npm.cmd ci
npm.cmd test
npm.cmd run build

Set-Location ..\functions
# Run this block with Node 20, matching package.json and CI.
npm.cmd ci
npm.cmd run lint

Set-Location ..
gh run view 30714852981
git status --short
```

The pushed CI checks passed. Next, run `docs/codex/WORKOUT_PHONE_FIELD_TEST.md` on iPhone and Android, attach the physical evidence, review the remaining advisory classification, and merge through the normal pull-request process. Do not deploy the archived `old-site/easypipeline/functions` package.

`YELLOW_EASYLIFE_RELEASE_CANDIDATE_WITH_LIMITATIONS`
