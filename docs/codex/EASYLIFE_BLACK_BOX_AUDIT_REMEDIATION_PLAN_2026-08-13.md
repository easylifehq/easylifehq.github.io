# EasyLife Wave 10.2 black-box audit remediation plan

Date: 2026-08-13

Repository: `easylifehq/easylifehq.github.io`

Branch: `codex/easylife-drinks-games-wave-10-20260808`

Starting PR head: `bba6c939db9f60e80a322ba93aa48dc27e7639c3`

Base: `main` at `20eb30c0bb245cd59b68a7ebe70cf696533c84b4`

## Scope and evidence method

This plan records the required reproduction and source-trace pass before application code changes. Evidence came from clean HTTP/browser requests against `https://f02f9244.easylife-wave10-1-audit.pages.dev/`, Chrome DevTools network/runtime observation, and source inspection at the starting PR head. Cloud-browser availability, its fixed viewport, extension warnings, and the known nested-route HTTP 404 are environment/platform limitations rather than product findings.

The named checkout was not used because it contained pre-existing user changes and an older commit. It was preserved byte-for-byte. Work continues in the clean isolated checkout `C:\Dev\easylife-wave10-2-final` at the expected PR head.

## Starting-state verification

- PR #8 was open, draft, based on `main`, and its head/base matched the expected SHAs. Its four hosted checks were green.
- Complete app tests: 92/92 passed.
- Firestore Emulator tests: 9/9 passed.
- TypeScript, production build (244 modules), Functions lint, and both critical-advisory gates passed.
- Publication tests: 29 passed and one Windows-only symlink case was skipped as designed.
- Production bundle identity verification passed all six required checks and scanned 101 text files using approved repository variables held only in process memory.
- The guarded local publication check reports Windows CRLF worktree differences in generated root JavaScript. The committed blobs and hosted Linux integrity check are green; this is a local checkout normalization artifact, not source corruption. Publishing will use deterministic LF output.

## Finding disposition matrix

| ID | Disposition | Audit-only / production relevance | Independent evidence and source trace | Planned handling |
| --- | --- | --- | --- | --- |
| A1 | Reproduced | Audit boundary; shared crash behavior is production-relevant | Today -> Needs review opened `/app/easylist/dashboard`, then the whole shell went blank. Runtime repeatedly threw the unavailable Firebase Auth proxy from `TaskDrawer.tsx`, which reads `auth.currentUser` even in demo mode. `EasyListContext.tsx` deliberately supplies an empty list and no-op mutations in demo mode. | Move supported audit task work to the coherent local adapter; prevent TaskDrawer Firebase access in audit mode; add route/error regressions. |
| A2 | Reproduced | Audit boundary; production Firebase path must remain unchanged | Notes -> New note and Today -> Start in Notes returned to the list; no editor opened. `EasyNotesContext.tsx` returns `null` from `addNote` and `createNoteFromDraft` in demo mode. `UniversalCapture.tsx` directly uses Firebase Auth and Firestore note helpers. Existing seeded-note editing visibly retained its Saving/Saved feedback. | Implement durable local note create/update and route all visible audit entry points through the same provider; preserve authenticated behavior and existing edit feedback. |
| A3 | Reproduced | Audit boundary; truthful success feedback is generally relevant | Quick Capture reported success for `Wave 10.2 captured task`, yet Open Inbox showed 0 unresolved and Today stayed stale. The matching text existed only in hidden capture DOM. `EasyListContext.tsx` no-ops demo writes while `UniversalCapture.tsx`, Today/calendar fixtures, and search use different sources. | Make capture await a persisted local adapter mutation before success; reconcile Today, Inbox, Dashboard, and global search from one task collection. |
| A4 | Reproduced | Audit-only isolation contract; fail-closed behavior is security-relevant | Audit label claimed local-only data. DevTools showed no production Firebase or other external requests, but Firebase chunks loaded and direct proxy access caused application errors. `firebase/client.ts` constructs unavailable service proxies; several audit-reachable components still dereference them. | Centralize strict host classification; short-circuit every audit path before Firebase services; test zero initialization/requests and lookalike-host rejection. Unsupported local actions will explain their limit. |
| B1 | Partially reproduced; source-confirmed | General product | Menu initially focused Close, but the automation client could not reliably synthesize native Tab traversal. Two auditors observed background focus. `ProductsMenu.tsx` uses `useFocusTrap`; the hook depends on document bubbling and does not isolate the background with `inert`, leaving a browser-specific containment gap. | Harden containment, background inertness, focus restoration, and automated keyboard coverage without changing navigation structure. |
| B2 | Partially reproduced; source-confirmed | General product | The native date field has only the vague visible label `Due`; browser automation could not reproduce the auditor's exact malformed keyboard value. Submission has no application-level invalid-date recovery. Native date controls legitimately vary by browser/locale. | Give the control a useful accessible label, check validity on submit, focus it, and show actionable guidance; retain the native date input. |
| B3 | Reproduced | General product | Selecting Friday, August 14 changed the date while the page still said `Use today's capacity`, `Block 45 minutes today`, and `Today`. These literals are in `EasyCalendarDayPage.tsx`. | Use selected-day-relative or neutral copy and add future-date tests. |
| B4 | Reproduced | General product | Immediate comparison showed Maya/Jordan as 102/99 days on Today and 103/100 in People. HQ and People independently parse and round date-only values with local-time constructors, allowing UTC/local boundary drift. | Introduce one date-only calendar-day difference helper with injected `now`; use it in both surfaces and cover DST/time-zone boundaries. |
| B5 | Reproduced | General product | Trust navigation exposed consecutive `Trust & Privacy` headings. `SettingsPage.tsx` repeats page/section heading semantics around the Boundaries content. | Remove the redundant heading while preserving the truthful content. |
| B6 | Reproduced; accepted | Audit reconciliation plus existing product contract | Searching for the captured task found no task. `CoreLoopSearchContext.tsx` already maps `tasks` into the declared `Plan` search group, but in demo mode those tasks come from the separate calendar fixture source. | Once capture and calendar use the shared task collection, include the task in search. Do not broaden search beyond its existing contract. |
| B7 | Intentional limitation | Owner/legal/backend release gate | Trust copy accurately identifies draft legal documents and the lack of self-serve backend deletion. No narrow missing local action was found that could truthfully satisfy deletion. | Preserve truthful language. Add a deterministic audit-data reset, but do not represent it as production account deletion. |
| C1 | Reproduced | Audit persistence boundary; authenticated persistence must be regression-tested | Created `Wave 10.2 Citrus Timer`, entered guided preparation, and refreshed its nested route. The app rebooted and showed `Drink not found`. `EasyDrinksContext.tsx` seeds fixtures on every mount and keeps all demo writes only in React state. Guided progress in localStorage cannot recover when its referenced drink disappears. The nested HTTP 404 is separate: the committed 404 shell can bootstrap the SPA, but a bootstrap still loses memory-only data. | Store recipes, pantry, preparation records, and guided progress in the versioned/namespaced adapter; add conservative hydration/reset and reload tests. |
| C2 | Reproduced | General product | Entering `citrus` in the Saved recipes search also removed nonmatching cards from What can I make, with no pantry-query indicator. `EasyDrinksPage.tsx` derives pantry matching from the already filtered library. | Make Saved recipes search/filter affect only the library; pantry matching uses the complete recipe collection. |
| C3 | Reproduced | General product | A five-second authored timer was labeled `1 min timer`; active countdown correctly showed `0:05`. `GuidedDrinkPage.tsx` uses `Math.ceil(seconds / 60)` for every inactive duration. | Add a shared truthful seconds/minutes formatter with singular/plural and threshold tests. |
| C4 | Reproduced; contract-safe fix | General product polish | Duplicate UI showed no provenance. The existing versioned `DrinkRecord` already contains nullable `sourceDrinkId`, parser support, and `duplicateDrinkDraft` populates it. No schema or rule expansion is necessary. | Display a `Copied from ...` relationship when the source record is available; preserve nullable/legacy behavior. |
| C5 | Reproduced | General product | Recipe card visibly rendered `1 steps`; literal interpolation in `EasyDrinksPage.tsx` lacks pluralization. | Render `step`/`steps` correctly and add coverage. |
| D | Preserve | General product | The positive behaviors listed in the mission were present during the audit or protected by the existing suites. | Keep them as explicit regression constraints during browser and automated verification. |

## Root causes

1. Audit mode is a runtime label, not a complete data boundary. Feature providers independently seed static arrays, no-op mutations, or still invoke Firebase helpers.
2. Synthetic state is not a single source of truth. Capture, EasyList, calendar/Today, notes, search, and Drinks use incompatible stores.
3. EasyDrinks claims refresh recovery but stores created entities only in component memory; guided recovery therefore retains an ID whose entity disappears after bootstrap.
4. Several smaller defects are local presentation/calculation issues: native-date recovery, date-relative copy, duplicated heading semantics, independently implemented date arithmetic, filter scope, timer formatting, and pluralization.

## Remediation architecture

- Keep the existing centralized review-runtime classifier as the only authority and tighten its approved-host/lookalike tests.
- Add a versioned, host-namespaced synthetic-state adapter with deterministic seeded defaults, conservative parsing/migration, write-before-notify semantics, explicit reset, and cross-tab revision events.
- Consume the adapter from EasyList, EasyNotes, EasyCalendar/Today, EasyDrinks, and global search. EasyGames retains its versioned game-specific event/session storage but shares environment/reset entry points; it must never depend on Firebase in audit mode.
- Leave authenticated production Firestore paths, ownership rules, Firebase rules, and data contracts intact.
- Treat localStorage write failure as a failed operation, never as success. Exports/settings will describe the local audit scope honestly.
- Keep Cloudflare nested-route status separate. No failed `_redirects` or Pages Function experiment will be repeated.

## Verification and release gates

After implementation: run all app/emulator/publication/release suites and advisory gates; perform desktop and narrow browser QA; exercise Tasks, Notes, Plan, People, Trust, search, Drinks, and Games; verify clean-state reset, refresh recovery, service-worker convergence, no failed app assets, no application-origin errors, and zero Firebase traffic in audit mode. EasyGames receives an engineering regression pass only. A later independent role-based and physical-device audit remains mandatory.

Repository publication will follow the guarded source-then-generated commit contract. PR #8 must remain draft and unmerged. `main`, Firebase, production data, DNS, custom domains, and production deployments remain untouched.
