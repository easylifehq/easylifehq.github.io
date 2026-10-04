# EasyWorkout Quick-Log Acceptance Closure Plan

Baseline `c9ca3049`. No schema, payload, unit, or owner-isolation change. Stats page is out of scope.

## Existing infrastructure (reused)
- Domain unit tests: `workout-exercise-completion`, `workout-draft`, `workout-statistics`, `quick-workout-focused-ui`.
- `workout-feedback-layout.browser.mjs`: headless Chrome/Edge over CDP (no extra packages).
- Demo mode (`?demo=1`, loopback/dev only): owner `local-preview`, synthetic fixtures, saved sessions kept in
  `sessionStorage`, idempotent by `clientDraftId`; no Firebase read/write. Draft key is owner-scoped in `localStorage`.
- Firebase emulator (`npm run test:emulator`) already covers the persistence payload; payload is unchanged, so it is not re-run
  (it needs `npx` to fetch firebase-tools, which would be a package install).

## New automation
`tests/quick-workout-acceptance.browser.mjs` (+ `npm run test:quick-workout-acceptance`): starts the local Vite dev server on
loopback, drives Chrome at 390x844 mobile emulation via CDP in demo mode, with a throwaway browser profile.
Journeys: start/edit/Done/Undo/next exercise; reload restore of owner-scoped draft + completion; offline save keeps draft
then online retry saves once; Last Sets/Setup stay unperformed; rapid Done / double Save no duplicates; delete
confirm/Escape/focus; partial row blocks save without scroll jump; suggestions below the last exercise; post-save
session detail/statistics count only explicitly completed valid sets.

## Rules
Each behavior is observed first; a production change is made only if a real defect is proven (test fails for the right reason).
Residuals that need a physical phone (soft keyboard, real OS offline toggle) are documented, not blocked on.

## Result
`npm run test:quick-workout-acceptance`: 13/13 journeys passed at 390x844 on first run; no product defect was proven, so
no production code changed. Covered: fresh one-exercise start/no overflow; edit + rapid double Done (one blank appended);
Undo/re-Done idempotent; suggestions below final exercise; owner-scoped (`local-preview`) draft; reload restore with
completion; Last Sets stay unperformed; delete confirm/Escape/focus restore; partial row blocks Save with no scroll jump
and focus on the field; offline Save retains draft; online double-submit saves one session reusing `clientDraftId`; saved
session contains only explicitly Done exercises; guided plan/history reflect them (never-Done copied row excluded; one
workout logged today); pre-v4 ambiguous draft restores into review with no mass-completion and Save blocked.

## Residuals
- Physical phone: soft keyboard/viewport resize and real OS offline toggle are emulated (touch + CDP offline) only.
- `/app/easystatistics` in demo mode reads fixed demo fixtures and ignores demo-added sessions (demo-only limitation, not a
  product path); post-save statistics are evidenced via session review (workload/sets), guided plan and history instead.
- Last Setup button label variant ("Use last sets & setup") depends on fixture setup history; demo fixtures carry no setup,
  so only the sets copy was exercised end to end (setup copy covered by existing `workout-setup` unit tests).
- Firebase emulator not re-run: payload unchanged and `test:emulator` needs `npx` to fetch firebase-tools.
