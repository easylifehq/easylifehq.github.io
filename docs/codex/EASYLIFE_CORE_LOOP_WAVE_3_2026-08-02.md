# EasyLife Core Loop Upgrade Wave 3 — 2026-08-02

## Outcome and repository identity

Wave 3 is complete on `codex/easylife-core-loop-wave-3-20260802`. It adds a keyboard-accessible global search and command palette, an optional persistent one-item review queue, and a versioned whole-account export without changing the calm ownership model: Capture stays raw, Today owns one next action, Review processes, Plan schedules, and Search finds and opens the source.

- Closure status used to authorize this wave: `YELLOW_EASYLIFE_WAVE_2_PR_READY_WITH_LIMITATIONS`; no unresolved P0 blocker.
- Verified closure/base SHA: `032e2ea799f670f0237fb9aee96f967afca3716e`.
- Wave 3 implementation commit: `79c3a527` (`Build EasyLife core loop wave 3`).
- Receipt/final SHA: the commit containing this file; the exact full SHA is recorded in the final handoff because a commit cannot truthfully embed its own content-derived SHA.
- No merge, deployment, history rewrite, production-data access, or edit to the empty Documents repository occurred.

## Implemented features

### Global search and commands

- `Ctrl/Cmd+K` opens an accessible modal search surface with focus containment, Escape close, arrow-key selection, Enter open, visible grouping, and highlighted matched text.
- Search covers Notes, People, Projects, Job Applications, Plan items, and Workouts using the existing adapters and tolerant field access.
- Results deep-link to the source record. The final browser demo proved a People result opening the Maya Chen editor directly.
- Safe commands cover Capture, new Note, Today, My Week, Plan, start/resume Workout, and Settings.
- Loading, partial-source-error, offline, and empty states are explicit. Offline retains locally available results and commands.
- The previous Quick Capture shortcut moved to `Ctrl/Cmd+Shift+K`, eliminating the browser-validated collision where both dialogs initially opened from `Ctrl/Cmd+K`.
- Search is deterministic and title-weighted. The 15,000-record synthetic performance test completed in 41.06 ms in the final run, below its 500 ms interaction budget.

### Focused Review Queue

- My Week retains its normal overview and offers an optional `reviewMode=focus` one-item flow.
- Queue order is deterministic and explained in the UI: unresolved Inbox captures, overdue/unscheduled priorities, active projects missing a next action, applications with due follow-up, then up to three recent completed workouts.
- Task actions are explicit: assign Today, hand off scheduling to Plan, hand off project connection to Projects, mark complete, defer one day, or open the source. Non-task records can be processed/deferred/opened.
- Queue progress and deferrals persist per authenticated owner (or isolated demo identity) across navigation and reload. Browser verification deferred an item, reloaded, and confirmed the remaining count and next item were preserved.
- Offline mode prevents saved-data actions while keeping source navigation and local deferral available. Demo actions remain fixture-only and never issue Firebase writes.
- Recent workout selection is newest-first and limited after sorting, with a regression test for unordered histories.

### Whole-account portability

- Settings now exports `easylife-account-export-v1` JSON with schema/formula version, export timestamp, app version, time zone, weight unit, deterministic domain ordering, record counts, and an included/unsupported manifest.
- Supported user-owned domains are tasks, notes/folders, Plan events/blocks/categories, Workout exercises/routines/sessions, Projects/sections/task links, Applications/email drafts, People, and safe user settings.
- Practical CSV downloads cover tasks, notes, events, task blocks, workout sessions, projects, applications, and contacts.
- Serialization is deterministic, correctly quoted, and protects spreadsheet consumers by prefix-neutralizing cells beginning with `=`, `+`, `-`, or `@`.
- Export removes credentials, Firebase configuration, account UID/email, draft idempotency IDs, and secret-like/internal transport fields while retaining user-meaningful relationship identifiers.
- Real-account export buttons remain disabled until all supported subscriptions settle. Any source error pauses export rather than producing a file that could be mistaken for complete.
- Demo export uses 72 deterministic synthetic records and visibly states that it performs no Firebase reads or writes.

## Safety and authenticated emulator proof

The existing fail-closed demo/automation protections remain in force: deterministic demo providers use fixtures; loopback demo/visual-QA routes select the loopback emulator; automation rejects non-loopback hosts, non-demo project IDs, and the production project ID.

The Firestore Emulator suite now has five authenticated scenarios. The new Wave 3 scenario seeds owner records for every searchable/reviewable/exported domain and proves that they drive search, the focused queue, and a secret-free account export. The authorization sweep covers all product-wave paths, including tasks, notes/folders, calendar events/blocks/categories, workout exercises/routines/sessions, projects/sections/task links, applications/generated drafts, contacts, and app preferences. Owner access succeeds; anonymous, cross-owner, and top-level access is denied.

The 136-case browser network matrix observed zero production Firestore or `pipeline-2f422` URLs. Demo interactions, including queue deferral and JSON/CSV download, remained local and synthetic.

## Exact final verification

| Command or check | Result |
| --- | --- |
| `npm.cmd test` in `app-vNext` | **51/51 passed**, 0 failed |
| `npm.cmd run build` in `app-vNext` | Passed; TypeScript plus Vite production build, **205 modules transformed** |
| `npm.cmd run lint` in `functions` | Passed (`node --check index.js`) |
| `npm.cmd run test:emulator` in `app-vNext` | **5/5 passed**, 0 failed; local Firestore demo project only |
| `git diff --check` | Passed; line-ending notices only |
| Desktop browser matrix at 1440×900 | **68/68 passed** |
| Phone browser matrix at 390×844 | **68/68 passed** |
| Total browser matrix | **136/136 passed**; every discovered public/app/alias/dynamic/query route opened with main content, no visible alert/error copy, no horizontal overflow, no HTTP ≥400, and no non-aborted failed/truncated request |
| Final clean browser console | **0 warnings, 0 errors** |
| Final browser network safety | **0 production Firestore/project URLs observed** |

The expanded inventory includes the prior 57-route set plus search source deep links, Settings Data, all statistics tabs, the focused-review query state, workout comparison/filter variants, and known/unknown dynamic record routes. Both dimensions were tested independently.

### Browser defects found and repaired

1. `Ctrl/Cmd+K` initially opened both Search and Quick Capture. Capture now uses `Ctrl/Cmd+Shift+K`; unit and browser checks prove one owning dialog.
2. The combined demo fixtures initially produced two visually identical Cedar application search results. The fixture now retains one canonical Cedar application, and desktop/phone screenshots prove a single result.
3. Export was initially available while live subscriptions could still be incomplete. Export now exposes readiness, disables downloads during loading, and pauses on partial failure.
4. Workout review selection sliced before ordering. It now sorts newest-first before limiting to three, with a regression test.

One stack-overflow console trace appeared only in the stale pre-rebuild browser tab during a failed synthetic locator key dispatch. It did not recur when the search interaction was repeated, and a fresh production-build tab reproduced the complete search interaction with zero warnings/errors. It is classified as a non-reproducible browser-driver artifact, not an application defect.

## Demo links and evidence

Start the production preview and open:

- `http://127.0.0.1:4173/app/hq?demo=1` — press `Ctrl/Cmd+K` and search `Cedar` or `Maya`.
- `http://127.0.0.1:4173/app/easystatistics?tab=week&reviewMode=focus&demo=1` — process or defer one deterministic item.
- `http://127.0.0.1:4173/app/settings?section=data&demo=1` — download the 72-record manifested JSON and practical CSV files.

Inspected screenshots:

- [Global search — desktop](./evidence/core-loop-wave-3-2026-08-02/global-search-desktop.png)
- [Global search — phone](./evidence/core-loop-wave-3-2026-08-02/global-search-phone.png)
- [Focused review — desktop](./evidence/core-loop-wave-3-2026-08-02/focused-review-desktop.png)
- [Focused review — phone](./evidence/core-loop-wave-3-2026-08-02/focused-review-phone.png)
- [Whole-account export — desktop](./evidence/core-loop-wave-3-2026-08-02/account-export-desktop.png)

## Deferred work and readiness

- Destructive import/restore remains intentionally out of scope; adding it requires a separately designed schema-migration, conflict, authentication, and rollback contract.
- Search currently indexes supported loaded record fields, not attachment contents or archived legacy data. Per-result snippets are plain safe text, not rich HTML.
- Review progress stores record IDs and local decisions only. Cross-device queue-progress sync is deferred to avoid introducing a new write path without a product decision.
- The inherited moderate React Router and active Firebase/UUID advisory chains retain the Wave 2 closure disposition. The archived old-site package remains quarantined and must not be deployed.
- No physical phone was available. iOS Safari/Android Chrome installed-PWA behavior, virtual keyboard resizing, safe areas, background/foreground persistence, storage pressure, and airplane-mode relaunch still require real-device field testing.
- GitHub-hosted PR CI and reviewer acceptance have not run on this new branch.

**PR readiness:** ready to open after the pushed branch is confirmed.  
**Merge readiness:** conditional on green hosted CI, review, advisory acceptance, and real-device results appropriate to release policy.  
**Deployment readiness:** blocked pending explicit production authorization, physical iPhone/Android field testing, and the inherited advisory disposition; no deployment was attempted.

## Exact next commands

```powershell
Set-Location C:\Dev\easylifehq.github.io
git checkout codex/easylife-core-loop-wave-3-20260802
git pull --ff-only
git status --short --branch
git log -5 --format="%H %s"

Set-Location app-vNext
npm.cmd ci
npm.cmd test
npm.cmd run test:emulator
npm.cmd run build

Set-Location ..\functions
npm.cmd ci
npm.cmd run lint

Set-Location ..
gh pr create --base main --head codex/easylife-core-loop-wave-3-20260802 --title "EasyLife core loop upgrade wave 3" --body-file docs/codex/EASYLIFE_CORE_LOOP_WAVE_3_2026-08-02.md
gh pr checks --watch
```

After hosted checks and review, complete `docs/codex/WORKOUT_PHONE_FIELD_TEST.md` plus search-palette, review-queue refresh/offline, and export-download checks on one iPhone and one Android device. Do not deploy until those results and the active advisory disposition are accepted.

`YELLOW_EASYLIFE_CORE_LOOP_WAVE_3_READY_WITH_LIMITATIONS`
