# EasyLife Release Candidate Wave 6

Status: `YELLOW_RELEASE_CANDIDATE_WITH_LIMITATIONS`

## Release verdict

The active Wave 6 source is green for pull-request review. No P0 or unresolved P1 defect remains in the audited source. All validated security findings were corrected, all deterministic gates pass, the complete browser matrix passes, and demo traffic remains isolated from production Firebase.

Deployment is not approved or attempted. A physical iPhone/Android installed-PWA pass is still outstanding, and this repository has no deterministic source-to-root artifact promotion script. The root GitHub Pages output is therefore intentionally unchanged and older than this source candidate. Those are release-process limitations, not hidden test failures.

## Repository identity

| Item | SHA/evidence |
| --- | --- |
| Expected and verified Wave 5 merge on `main` | `8eea33158b613058ea84e0ee7f7edd8f5bcb7083` |
| Wave 5 implementation source tree | `222df60f94fb18bbbd556b2ae03efe2978b38087` |
| Tree equivalence | merge tree `331bb3531863915975bbf57063021267dc288804` exactly equals the Wave 5 source tree |
| Wave 6 branch | `codex/easylife-release-candidate-wave-6-20260802` |
| Baseline checkpoint | `b71f25995b65ff4a2d80f6221a448aa923a60753` |
| Security/data-boundary fix | `3d61d304a9a13de7f4b00d733c5a1ae2cf619ba0` |
| Verified implementation end | `75526139798b8febd6de54abf6773491143fc26f` |

The root `index.html` working-tree line-ending mismatch was present at entry. Its raw content hash matched the tracked blob. It was never staged, overwritten, normalized, or committed.

## Independent findings and corrections

### P0

None.

### P1 — fixed

1. Any ordinary authenticated account could reach two cost-bearing provider Functions. Task analysis and project planning now require a server-issued `easylifeAiAccess` or `easylifeOperator` claim before secret access or provider execution. Static regressions prove the order and ordinary-account denial.
2. The Firestore owner wildcard allowed unsupported collections and arbitrary nested records. Rules now allow only supported one-document-deep per-user collections, bound workout-session shapes, preserve legacy compatible records, and freeze idempotency/creation identities. Authenticated Emulator tests prove ownership, isolation, validation, archive behavior, duplicate identities, unsupported collection denial, and nested denial.

### P2 — fixed

1. Demo project planning could cross into a production Function. Demo now returns before the request helper and reports that no Firebase write or production call ran.
2. Workout CSV fields allowed spreadsheet formula prefixes. Leading whitespace plus `=`, `+`, `-`, or `@` is neutralized and regression-tested.
3. Whole-account JSON could retain additional credential-shaped field names. Tokens, authorization, secrets, sessions, cookies, private keys, and service-account fields are denied recursively.
4. A workout edit followed by immediate navigation could lose the latest controlled draft before the debounce. The current draft is flushed on page hide/unload, cross-tab conflicts require an explicit reload, payloads are size/shape bounded, and owner-scoped recovery fails closed.
5. Wall-clock suspension could turn an overnight draft into a false all-day duration. Automatic time now counts visible active time; automatic durations above six hours require an explicit Full Log duration. Explicit valid durations remain supported.
6. The service worker could activate immediately, delete unrelated origin caches, and fail to fall back for cached assets. Updates now wait safely, delete only EasyLife-owned prior caches, and use cached asset fallback without storing failed responses.
7. Capture and Plan lacked a stable primary semantic heading on important states. Focused source regressions now preserve one page-level heading.

### P3 — open limitations

1. Physical iPhone, Android, and installed-PWA update testing needs real devices.
2. Active dependency advisories need planned major-stack migrations, not forced audit changes.
3. Provider capability claims are now safe by default; App Check and per-UID quotas would provide additional defense in depth before broad production enablement.
4. Root artifact promotion and obsolete hashed-asset cleanup are manual and therefore require a separately approved, reviewed deployment change.

The canonical full-repository security report is [SECURITY_SCAN_REPORT.md](evidence/release-candidate-wave-6-2026-08-02/security/SECURITY_SCAN_REPORT.md). It inventories all 746 tracked files and records seven high-confidence findings (three medium, four low); every one is fixed in this branch.

## Verification results

Command: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-release.ps1`

| Gate | Result |
| --- | --- |
| Application tests | 70 passed, 0 failed, 319.845 ms reported test duration |
| Authenticated Firestore Emulator | 7 passed, 0 failed, 3.500 s reported test duration |
| TypeScript | passed |
| Production build | passed; Vite 5.4.21; 210 modules transformed; 1.48 s build |
| Functions syntax lint | passed |
| App production critical advisory gate | passed; 0 critical |
| Functions production critical advisory gate | passed; 0 critical |

The tests cover deterministic search and review ordering, exports, formula injection, demo isolation, provider claims, statistics and units, local-date periods, low-data/zero-denominator states, workout goals, draft bounds/recovery/idempotency, duration safety, service-worker update/cache behavior, accessibility headings, and large synthetic histories.

## Browser, demo, and performance evidence

- Production-like local artifact: `app-vNext/dist`, served at `http://127.0.0.1:4173`.
- Required matrix: 63/63 routes and states at 1440×900; 63/63 at 390×844.
- Supplementary critical matrix: 10/10 at 320×568.
- No document-level horizontal overflow or unexpected alert state.
- Full diagnostic trace: 425 events; 0 failed loads; 0 responses at or above 400; 0 production Firestore, Firebase Auth, or Cloud Functions requests; 0 console warnings/errors.
- Final primary-flow browser log: 0 entries.
- Reduced-motion inspection: 0 visible animations after preference emulation.
- Production-preview navigation: 19–30 ms DOM/load across HQ, My Week, Plan, Workout Log, Progress, and Command on localhost. Shell transfer was 2,398 bytes. These are local comparison numbers, not field Core Web Vitals.
- Large synthetic global search: 41.673 ms in the final automated run.
- Large workout history/statistics: deterministic; maximum observed bounded run 97 ms.

The synthetic demo exercised Ctrl/Cmd+K search and keyboard opening, Capture save feedback, focused Review assignment, interrupted workout recovery across navigation/refresh, a completed 45-minute workout, post-workout review, 7/28/84-day comparisons, accessible tables, goal edit/pause/archive/restore, history/PR filtering, workout/account JSON and CSV downloads, safe service-worker update, and offline reload of a primed Progress deep route. All demo mutations stayed in memory/local storage and produced zero Firebase writes.

Evidence:

- [route matrix](evidence/release-candidate-wave-6-2026-08-02/ROUTE_MATRIX.json)
- [verification summary](evidence/release-candidate-wave-6-2026-08-02/VERIFICATION_SUMMARY.md)
- [dependency classification](evidence/release-candidate-wave-6-2026-08-02/DEPENDENCY_ADVISORIES.md)
- [screenshots](evidence/release-candidate-wave-6-2026-08-02/screenshots)

Key demo URLs:

- Today: `http://127.0.0.1:4173/app/hq?demo=1&visual=1`
- Capture: `http://127.0.0.1:4173/app/easylist/add?demo=1&visual=1`
- My Week/Review: `http://127.0.0.1:4173/app/command?demo=1&visual=1`
- Workout: `http://127.0.0.1:4173/app/easyworkout/dashboard?demo=1&visual=1`
- Workout Log: `http://127.0.0.1:4173/app/easyworkout/log?demo=1&visual=1`
- Workout Progress: `http://127.0.0.1:4173/app/easystatistics?tab=workout&demo=1&visual=1`
- Settings/export: `http://127.0.0.1:4173/app/settings?demo=1&visual=1`

## Dependency disposition

No package or lockfile changed. No forced audit command was used. The active app has one high development advisory (direct Vite) and three moderate nodes (transitive esbuild plus the production React Router pair). The Functions package has nine moderate nodes in the inherited Firebase Admin/Functions → Google libraries → UUID chain. Available automated resolutions are major upgrades or downgrades and were rejected as breaking. Both production critical gates pass.

The archive has 26 advisories (2 critical, 7 high, 15 moderate, 2 low), but it is quarantined under `old-site/easypipeline/functions`, not imported by the source app, and must never enter the publication artifact. Exact direct/transitive, production/development, introduced/inherited, reachability, and fixability classifications are in the dependency evidence file.

## Commits and readiness

- `b71f2599` — checkpoint the verified Wave 6 baseline
- `3d61d304` — harden release authorization and data boundaries
- `75526139` — strengthen offline and workout recovery safety
- Documentation/evidence commit follows this implementation SHA.

CI/PR readiness: source gates are green locally. The branch is ready to push and open as a draft PR. Hosted status and PR URL are recorded in the final handoff after remote operations.

Deployment readiness: **not authorized and not yet mechanically safe**. The source candidate is ready for approved artifact-promotion work only after hosted checks, review, physical-phone testing, and explicit deployment permission. Do not deploy `old-site/`; do not redeploy provider Functions until custom claims and the intended production enablement are confirmed.

## Exact next commands

```powershell
git switch codex/easylife-release-candidate-wave-6-20260802
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-release.ps1
git status --short
git push -u origin codex/easylife-release-candidate-wave-6-20260802
gh pr create --draft --base main --head codex/easylife-release-candidate-wave-6-20260802 --title "EasyLife release candidate Wave 6" --body-file docs/codex/EASYLIFE_RELEASE_CANDIDATE_WAVE_6_2026-08-02.md
gh pr checks --watch
```

After review, follow [EASYLIFE_DEPLOYMENT_RUNBOOK_2026-08-02.md](EASYLIFE_DEPLOYMENT_RUNBOOK_2026-08-02.md). No merge or deployment command is intentionally included before its explicit approval gates.

`YELLOW_RELEASE_CANDIDATE_WITH_LIMITATIONS`
