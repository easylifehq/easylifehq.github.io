# EasyLife Product Upgrade Wave 4 receipt

Date: 2026-08-02 (America/Denver)

## Identity and scope

- Repository: `easylifehq/easylifehq.github.io`
- Verified Wave 3 merge / base SHA: `cca48a4e640b8ad1cdec371ccd4f5a466ec4a44f`
- Branch: `codex/easylife-post-merge-wave-4-20260802`
- Draft PR: https://github.com/easylifehq/easylifehq.github.io/pull/2
- CI repair commit: `06ced9f8c1631ce488d51dc765c569e686bac3df`
- Product implementation commit: `96e12cf23f52536eb37be4d5963009f0899cab21`
- Final SHA: recorded after this receipt commit.

`main` was fetched, switched, and updated with `git pull --ff-only`. The requested Wave 3 merge was the exact resulting `main` HEAD and is an ancestor of this branch.

## Post-merge CI repair

The failed Release candidate checks run `30773642663` reached the Firestore Emulator command with a Java runtime older than the minimum required by the pinned Firebase CLI. Web unit tests had already passed; the emulator rejected the Java runtime, so the later web build and advisory gate were skipped. The Functions job passed.

`.github/workflows/release-candidate.yml` now installs Temurin Java 21 with `actions/setup-java@v4` before dependency installation and the unchanged Firestore Emulator test. No tests, assertions, or gates were removed or weakened. The repair is isolated in commit `06ced9f8c1631ce488d51dc765c569e686bac3df`.

## Product decision

The Wave 1-3 receipts, `NEXT_PRODUCT_UPGRADES_2026-08-02.md`, `NEXT_5_TASKS.md`, and `PHASE_STATE.md` showed that Wave 3 had created explicit Focused Review actions for scheduling and project connection, but the destination pages did not consume their `scheduleTask` and `connectTask` handoffs. Wave 4 therefore completed those two high-value paths instead of adding another dashboard or unrelated product area.

This keeps ownership calm and explicit:

- Review decides what needs processing.
- Plan owns the time placement.
- Projects owns the next-action relationship.
- Neither destination performs a hidden write.

## User-visible improvements

### Review to Plan

- `Schedule in Plan` opens the existing Quick Add Plan surface with the reviewed task selected.
- The suggested interval starts in the first available window, falls back to the configured wake hour, respects stored/default duration, enforces a 15-minute minimum, and does not run beyond a shorter open window.
- The user still chooses and confirms the time. Missing and already-completed tasks get truthful recovery messages.
- The one-use query parameter is removed with history replacement while preserving demo isolation.
- Demo confirmation explicitly reports that no Firebase write ran.

### Review to Projects

- `Connect to project` opens a focused handoff at the top of Projects.
- Active projects and sections are ordered deterministically; the first project with a usable section is selected without saving anything.
- The user explicitly chooses the owner and confirms the connection.
- Existing links are detected and surfaced as `Already connected`, with a direct source-project link instead of creating a duplicate.
- Loading, missing, completed, no-project, and no-section states remain usable and explain what to do next.
- Demo confirmation explicitly reports that no Firebase write ran.

The implementation reuses the authenticated per-user task, calendar-block, project, section, and project-link adapters. Existing Firestore records require no migration.

## Regression coverage

`app-vNext/tests/review-handoffs.test.mjs` adds focused rules for:

- loading, missing, completed, ready, and idle review-task resolution;
- deterministic open-window scheduling, duration bounds, and wake-hour fallback;
- active-project filtering, stable project/section ordering, and duplicate-link detection.

The demo Projects provider now includes the unresolved review task and the already-connected review task needed to prove both flows. Existing loopback/demo isolation tests continue to prove that deployed `?demo=1` cannot enable demo Firebase access and that automated Firebase access requires an explicit loopback emulator.

## Exact local verification

All commands were run from the checked-out branch without real-user data:

| Gate | Command | Result |
| --- | --- | --- |
| Application unit tests | `cd app-vNext && npm test` | PASS, 54/54 |
| Authenticated Firestore integration | `cd app-vNext && npm run test:emulator` | PASS, 5/5; demo project only; emulator shut down cleanly |
| TypeScript + production build | `cd app-vNext && npm run build` | PASS, 206 modules transformed |
| Functions syntax | `cd functions && npm run lint` | PASS |
| Web critical production advisory gate | `cd app-vNext && npm audit --omit=dev --audit-level=critical` | PASS, exit 0 |
| Functions critical production advisory gate | `cd functions && npm audit --omit=dev --audit-level=critical` | PASS, exit 0 |
| Primary browser matrix | 16 routes at 390x844 and 1440x900 | PASS, 32/32 |
| Browser console | warning/error inspection after final matrix | PASS, 0 entries |

The matrix covered Today, Capture, Notes, Plan, People, Projects, Pipeline, Workout dashboard/routines/log, My Week, Workout Progress, Settings data, Focused Review, Review-to-Plan, and Review-to-Projects. Three initially unsettled lazy-route snapshots were rerun with a bounded render wait; the final production-build matrix is the reported 32/32 result. Missing-task and already-connected states were also opened directly. The existing linked project target was opened successfully.

## Advisory disposition

No dependency versions changed in this wave.

- Web: two inherited moderate advisories in production navigation dependencies (`react-router-dom` direct, `react-router` transitive). Navigation is reachable, although the SSR hydration constructor advisory is likely unreachable in this client-only Vite application. `npm audit` reports a non-forced fix path; it was deferred because Wave 4 explicitly avoided unrelated dependency churn and the critical release gate passes. A dedicated router upgrade should run the full navigation/browser suite.
- Functions: eight inherited moderate production advisories in transitive `uuid` paths under Firebase Admin / Google Cloud clients. EasyLife does not call the affected UUID buffer APIs directly, so the vulnerable operation is likely unreachable. The complete audit remedy proposes `firebase-admin@14.2.0`, a breaking major upgrade; no forced or breaking fix was applied.
- Development-only dependencies are omitted by the existing release gates and were not changed.

## Demo URLs

Run `cd app-vNext && npm run build && npm run preview -- --host 127.0.0.1 --port 4173`, then open:

- Focused Review: http://127.0.0.1:4173/app/easystatistics?tab=week&reviewMode=focus&demo=1
- Review to Plan: http://127.0.0.1:4173/app/easycalendar/day?scheduleTask=preview-task-2&demo=1
- Review to Projects: http://127.0.0.1:4173/app/easyprojects?connectTask=preview-task-2&demo=1
- Duplicate protection: http://127.0.0.1:4173/app/easyprojects?connectTask=preview-task-3&demo=1
- Missing Plan handoff: http://127.0.0.1:4173/app/easycalendar/day?scheduleTask=missing-task&demo=1
- Missing Project handoff: http://127.0.0.1:4173/app/easyprojects?connectTask=missing-task&demo=1

## Screenshot evidence

- `docs/codex/evidence/product-upgrade-wave-4-2026-08-02/review-to-plan-phone.png`
- `docs/codex/evidence/product-upgrade-wave-4-2026-08-02/review-to-project-phone.png`
- `docs/codex/evidence/product-upgrade-wave-4-2026-08-02/review-to-plan-desktop.png`
- `docs/codex/evidence/product-upgrade-wave-4-2026-08-02/review-to-project-desktop.png`
- `docs/codex/evidence/product-upgrade-wave-4-2026-08-02/duplicate-project-handoff-desktop.png`

The final-build viewport captures were inspected independently after correcting an evidence-only full-page screenshot timing issue; the blank intermediate frames were not committed.

## Known limitations and readiness

- Browser verification used Chromium desktop emulation at 390x844 and 1440x900. No physical iOS/Android device, mobile Safari, installed-PWA lifecycle, screen reader, or intermittent real cellular network was available.
- Demo actions and automated tests use deterministic fixtures and the local demo Firestore project only. No real user data or production Firebase write was attempted.
- The repository's root `index.html` has a pre-existing checkout-normalization mismatch: its raw worktree hash equals the HEAD blob while Git's LF clean filter reports it modified. It is not staged, is absent from the branch/PR diff, and was not rewritten.
- The PR is intentionally draft. Merge requires green hosted checks and human review. Deployment additionally requires an explicit production authorization and credentials; this run neither merged nor deployed.

At receipt creation, local release gates are green and hosted Release candidate checks are running on draft PR #2.

