# EasyLife Weekend Upgrade Report

STATUS: YELLOW_WEEKEND_UPGRADE_READY_WITH_LIMITATIONS

## Outcome

The governing weekend package was executed against `C:\Dev\easylifehq.github.io` on branch `codex/weekend-upgrade-workout-intelligence-20260801`. The empty Documents repository was not modified.

Implementation commits: `dc6ef87a` (`feat: harden workout logging and add transparent progress`) and `b23947c9` (`fix: keep confirmed workout drafts cleared`). Baseline/safety receipt commit: `ea669cc2`. Starting source SHA: `5fa6149112a6c24d1cbda815a0978dd03425ff61`.

## Shipped source changes

- Draft schema v2 with tolerant v1 migration, 250 ms local autosave, page-hide/visibility flush, explicit local/sync/failure states, exact-draft clearing, and retained failure recovery.
- Idempotent final-save coordinator plus deterministic Firestore document IDs from `clientDraftId`; duplicate rapid clicks/retries share one persistence result.
- Set/exercise semantics for warm-up, standard, drop, failure, completion/deletion, bodyweight, assisted, duration, distance, RIR, duration, and distance evidence.
- Pure versioned workout statistics covering matched 7/28/90-day windows, weighted workload, Epley estimated 1RM, records, weekly consistency, exercise trends/confidence, and transparent muscle exposure.
- Calm Workout dashboard, canonical Progress panel, exercise detail, post-workout review, low-data states, exact source links, and `lb`/`kg` setting.
- Deterministic 14-week synthetic fixture with missed week, deload/return, plateau and improvement, warm-up/drop/deleted/incomplete sets, bodyweight/duration work, RIR, and a DST-boundary case.
- Loopback-only production demo mode, no Firebase demo writes, and same-tab demo session reload persistence.
- Executable Node tests and production build/typecheck scripts.

## Defects found and repaired during browser demo

1. A routine could overwrite the logger after initial blank default reps made the draft appear user-edited. Default blank boxes no longer count as workout work, so async routine loading is safe.
2. Blank weighted inputs could become zero-load records. Weighted sets now require a positive load, with a regression test.
3. Progress used workout context outside its provider and crashed on direct navigation. The panel now receives explicit session data; demo statistics load the deterministic fixture.
4. A remembered app route containing `?demo=1` was passed as a pathname and blanked `/app`. Startup redirects now split pathname/search correctly.
5. Demo-created review sessions vanished on provider remount. They now persist only in tab-scoped session storage, still with no Firebase writes.
6. A successful save removed local storage, but the unmount cleanup immediately rewrote the confirmed draft. Successful confirmation now suppresses timer/unmount draft flushes; the browser retest proved the dashboard no longer offers a stale Resume action.

## Verification summary

- `npm.cmd test`: PASS, 19/19.
- `npm.cmd run build`: PASS, TypeScript and Vite production bundle, 189 modules.
- `npm.cmd run lint` in `functions`: PASS.
- `git diff --check`: PASS.
- Browser: 40 discovered public/authenticated routes at 1440 x 900 and 390 x 844; PASS after targeted repairs, with zero document-level horizontal overflow.
- Clean production-preview console: PASS, zero warnings/errors.
- Workout browser flow: PASS for local autosave, set type, remove/undo, copy previous, route restore, offline retention, reconnect/retry, post-workout review, progress, exercise detail, and low-data state.
- Dependency audit: HOLD, 10 advisories (1 low, 4 moderate, 3 high, 2 critical).
- Physical phone/PWA: PENDING.

## Demo

Run `npm.cmd run build` and `npm.cmd run preview -- --host 127.0.0.1 --port 4173` in `app-vNext`, then open:

- Workout dashboard: `http://127.0.0.1:4173/app/easyworkout/dashboard?demo=1`
- Active routine: `http://127.0.0.1:4173/app/easyworkout/log?routineId=demo-routine-upper&workoutMode=1&demo=1`
- Workout Progress: `http://127.0.0.1:4173/app/easystatistics?tab=workout&demo=1`
- Bench Press detail: `http://127.0.0.1:4173/app/easyworkout/exercise/demo-bench?demo=1`
- Post-workout fixture review: `http://127.0.0.1:4173/app/easyworkout/session/demo-session-w13-pull?demo=1`

The demo switch is accepted in production builds only on loopback hosts. It is deliberately unavailable on a public production hostname.

## Remaining blockers

- Source-egress approval for remote push.
- Intentional dependency remediation and retest.
- Physical phone/PWA evidence.
- Explicit deployment authorization and a credentialed live-data verification window.

No deployment was attempted.
