# EasyLife Workout Statistics Wave 5

Date: 2026-08-02  
Branch: `codex/easylife-workout-statistics-wave-5-20260802`  
Verified base: `cf7a6ae6a81f56c65ddd385e3359efbb53f6d860` (Wave 4 merge on `main`)  
Verified implementation SHA: `2508e6d745078740e15cdda22e195cc3cc02e049`  
Receipt/hosted-check commits follow the implementation SHA and contain no product-code changes.

## Delivered

- Workout Progress now offers 7-, 28-, and 84-day local-calendar comparisons against the immediately preceding equal window.
- A routine filter covers saved routines and routine names present only in history. The comparison table shows current/prior completed sessions, valid working sets, unit-normalized weighted workload, average duration, and PR-source sessions.
- Every comparison exposes sample counts and `easyworkout-routine-comparison-v1`. Missing durations are excluded; a missing or zero prior denominator produces no percentage. Warm-up, deleted, incomplete, and corrupt sets are excluded. Bodyweight, duration, distance, and assisted work can contribute valid working sets but never weighted workload.
- `easyworkout-goal-v1` supports only a Sunday-start weekly completed-workout target and an exercise Epley estimated-1RM target. Create is deterministic/idempotent per goal identity; edit, pause, resume, archive, and restore are explicit. Achievement is derived from saved workout evidence and is never stored as a hidden write.
- Goal documents store owner, source unit, target, timestamps, schema, and formula version under `users/{uid}/workoutGoals`. Firestore rules validate ownership, contract shape, immutable identity/formula/creation data, archive timestamps, and deny hard delete.
- Demo goals and lifecycle changes are in-memory synthetic fixtures. Browser network evidence observed 82 local requests, zero non-local requests, and zero production Firebase endpoints. Static isolation tests prove the demo branch returns before authenticated adapters.
- Whole-account export is now `easylife-account-export-v2`, additive and explicitly compatible with `easylife-account-export-v1`. Goals are included in JSON and per-domain CSV; account ownership IDs are stripped and exports remain local/download-only.
- My Week contains one compact goal line in its existing Workout section and one owning action to Workout Progress. No Today card, dashboard panel, or top-level navigation item was added.

During browser QA, the synthetic Pull workout was found to share the saved Upper routine ID, which blended comparison evidence and hid the Upper filter. The fixture now records Pull as an unassigned custom workout, and the corrected zero-current/one-prior Upper state is captured at phone width.

## Short official-product comparison

Only reusable evidence patterns were recorded; no interface was copied.

- [Hevy Statistics Explained](https://help.hevyapp.com/hc/en-us/articles/35702030346903-Hevy-Statistics-Explained-Track-Your-Training-Progress-and-Muscle-Growth): period segmentation, workout/duration/volume/set summaries, and exercise-specific evidence support matched windows and transparent metric labels.
- [Strong Profile Widgets](https://help.strongapp.io/article/239-profile-widgets): an adjustable workouts-per-week target and exercise-specific chart widgets support keeping the first goal contract narrow.
- [FitNotes Progress Tracking](https://www.fitnotesapp.com/progress_tracking/): exercise-relevant statistics, dated drill-through, explicit e1RM limitations, and editable goals support source links and formula evidence.
- [Boostcamp Workout Tracker](https://www.boostcamp.app/workout-tracker): 7/30/90/year views, max/volume/e1RM evidence, and per-exercise unit handling support useful period choices without copying presentation.

## Automated verification

| Gate | Command | Result |
| --- | --- | --- |
| Application tests | `cd app-vNext && npm test` | PASS, 60/60 |
| Authenticated Firestore integration | `cd app-vNext && npm run test:emulator` | PASS, 6/6; demo project and loopback port guard; emulator shut down cleanly |
| TypeScript + production build | `cd app-vNext && npm run build` | PASS, 210 modules transformed |
| Functions syntax | `cd functions && npm run lint` | PASS |
| Web production critical advisory gate | `cd app-vNext && npm audit --omit=dev --audit-level=critical` | PASS, exit 0 |
| Functions production critical advisory gate | `cd functions && npm audit --omit=dev --audit-level=critical` | PASS, exit 0 |
| Browser primary-route matrix | 16 routes at 1440x900 and 390x844 | PASS, 32/32 after bounded lazy-route attachment checks; no document-level horizontal overflow |
| Changed-flow browser checks | Workout comparison, 7-day low data, goal form/progress, My Week action, Settings export | PASS |
| Browser console | final error-only inspection | PASS, 0 errors; inherited React Router future-flag development warnings only |
| Demo network | local demo navigation with CDP request capture | PASS, 82/82 local requests; 0 non-local; Firebase-named entries were local source modules only |

The browser matrix covered Today, Capture, Notes, Plan, People, Projects, Pipeline, Workout dashboard/routines/logger, My Week, Workout Progress, Settings data, Focused Review, Review-to-Plan, and Review-to-Projects.

Focused regression coverage includes matched date boundaries, mixed kg/lb normalization, zero denominators, missing durations, deleted/incomplete sets, deterministic IDs, weekly and e1RM derivation, export schema/ownership stripping, demo isolation, Firestore cross-account denial, contract validation, idempotent duplicate create, archive/restore, and hard-delete denial.

## Dependency disposition

No package or lockfile changed in Wave 5.

- Web: `react-router-dom@6.30.4` is a direct production dependency and `react-router@6.30.4` is its transitive production dependency. npm reports two inherited moderate advisories. Client-side navigation is reachable; the SSR hydration constructor path is likely unreachable in this Vite client application, while the backslash redirect class remains relevant to navigation input. The reported fix crosses the router upgrade boundary and was not taken as unrelated major-risk churn. Critical gate passes.
- Functions: `firebase-admin@13.10.0` is direct production; vulnerable `uuid@9.0.1` is transitive through Google Cloud Firestore/Storage, `google-gax`, `gaxios`, `retry-request`, and `teeny-request`. npm reports eight inherited moderate paths. EasyLife does not directly call the affected UUID buffer API, so that operation is likely unreachable. The complete audit remedy requires breaking `firebase-admin@14.2.0`; it was not forced. Critical gate passes.
- Development dependencies were omitted by the existing production gates. Wave 5 introduced no dependency, so no advisory was introduced by this branch.

## Browser demo and evidence

Run `cd app-vNext && npm run dev -- --host 127.0.0.1 --port 4175`, then open:

- Workout Progress: `http://127.0.0.1:4175/app/easystatistics?tab=workout&demo=1`
- My Week: `http://127.0.0.1:4175/app/easystatistics?tab=week&demo=1`
- Settings export: `http://127.0.0.1:4175/app/settings?section=data&demo=1`

Evidence folder: `docs/codex/evidence/wave-5/`

- `workout-routine-comparison-desktop.png`
- `workout-goals-progress-desktop.png`
- `workout-low-data-mobile.png`
- `my-week-workout-goal-mobile.png`
- `workout-progress-top-desktop.png`

## Limitations and readiness

- Chromium emulation covered 1440x900 and 390x844. No physical iOS/Android device, mobile Safari, installed-PWA lifecycle, screen reader session, or intermittent cellular network was available.
- Production Firestore was not contacted and no real-user data was accessed. Authenticated persistence was verified only against the guarded demo Firestore Emulator project.
- The root `index.html` checkout-normalization mismatch remains intentionally unstaged. Its raw worktree hash and HEAD blob both equal `12fbd813f57b04bf837180c6746cc699de9f9aa0`; it is absent from every commit.
- The PR is intentionally draft. Merge requires green hosted checks and human review. Deployment additionally requires separate production authorization and credentials; this branch neither merges nor deploys.

## Exact next commands

```powershell
git checkout codex/easylife-workout-statistics-wave-5-20260802
git status --short
cd app-vNext
npm ci
npm test
npm run test:emulator
npm run build
cd ..\functions
npm ci
npm run lint
cd ..
gh pr checks --watch
```

Hosted CI status: pending branch push and draft PR creation at receipt authoring time; the final task handoff records the monitored result and PR URL.
