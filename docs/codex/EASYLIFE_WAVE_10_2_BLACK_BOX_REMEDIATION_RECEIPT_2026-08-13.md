# EasyLife Wave 10.2 black-box remediation receipt — 2026-08-13

## Scope and immutable starting point

- Repository: `easylifehq/easylifehq.github.io`
- Branch: `codex/easylife-drinks-games-wave-10-20260808`
- Draft PR: #8
- Starting PR head: `bba6c939db9f60e80a322ba93aa48dc27e7639c3`
- Starting `main`: `20eb30c0bb245cd59b68a7ebe70cf696533c84b4`
- Work was performed in the isolated clean checkout `C:\Dev\easylife-wave10-2-final` because the named checkout contained pre-existing user changes and an older head. The named checkout was inspected and left untouched.
- No production data, production deployment, Firebase deployment, Firestore rule deployment, DNS, custom domain, account, or credential-entry action was used.

## Finding dispositions

| Finding | Disposition | Root cause and result |
| --- | --- | --- |
| A1 blank task dashboard | Reproduced; audit-only trigger, production-relevant error containment | Audit routes reached Firebase Auth-backed task drawers even though the audit host intentionally has no Firebase runtime. Audit task subscriptions and mutations now use the shared local adapter; unsupported project/schedule actions explain their read-only limitation. Dashboard browser verification passed. |
| A2 new-note creation | Reproduced; audit-only trigger | New notes did not enter the same coherent store as seeded notes. All visible note entry paths now create a versioned local note and navigate to its editor. New-note edit and refresh recovery passed. |
| A3 false capture confirmation | Reproduced; audit-only trigger | Capture, summary, Inbox, and search used different demo snapshots and confirmation was not tied to a recoverable write. The adapter persists before it publishes a revision or success; capture, Today, Dashboard, Calendar, and search share that state. Captured task verification and global search passed. |
| A4 audit/Firebase contract conflict | Reproduced; audit isolation contract | Audit code could dereference unavailable Firebase proxies. The strict centralized host classifier now selects synthetic behavior before Firebase service access. The production-configured bundle still contains same-origin production-adapter chunks, but approved audit hosts construct no Firebase app and browser capture recorded zero Firebase API traffic, zero external origins, and zero remote writes. Lookalikes remain rejected. |
| B1 navigation focus trap | Reproduced; production-relevant | The trap wrapped focus inside the dialog but did not remove ancestor siblings from the accessibility/focus tree. It now makes the surrounding shell inert/hidden while open and restores prior state and trigger focus. Forward and reverse wrap plus restoration passed. |
| B2 silent invalid due date | Partially reproduced; production-relevant | Native date parsing is browser-owned, but the application lacked useful naming and invalid feedback. Task/deadline fields now have contextual accessible names, `aria-invalid`, an alert message, focus recovery, and clearing guidance. No custom date parser was introduced. |
| B3 future Plan says Today | Reproduced; production-relevant | Static Today copy was reused for selected future days. Copy is now selected-day neutral (`Use this day's capacity`, `Selected day`), and future-day browser verification passed. |
| B4 overdue ages disagree | Reproduced; production-relevant | Today and People used different time/date calculations. Both now call one date-only, DST-safe calendar-day function. Boundary tests and browser comparison agree (Maya 102, Jordan 99 in the test clock). |
| B5 duplicate Trust heading | Reproduced; production-relevant | The generic Settings section heading duplicated the Trust page's own heading. Trust now presents one `Settings` page heading and one `Trust & Privacy` section heading. |
| B6 captured task absent from search | Reproduced; supported product intent | Tasks were already an intentional global-search document type, but capture wrote to a disconnected demo store. Shared state restores the existing contract; `Buy oat milk after class` was found as a task. |
| B7 legal/deletion completeness | Intentional release limitation | No legal copy or backend deletion was fabricated. Draft legal language and the absence of self-serve backend deletion remain explicit owner/legal/backend gates. Audit reset is local-preview cleanup only. |
| C1 recipe/preparation lost on refresh | Reproduced; audit-only trigger | Recipes and pantry were provider-memory-only while guided progress referenced them in local storage. Versioned host-namespaced recipes, pantry, preparations, and guided state now recover together. Create, duplicate, serving change, step/timer state, and refresh passed. Production ownership contracts were unchanged. |
| C2 library search filters pantry | Reproduced; production-relevant | One filtered collection was reused for both sections. Saved-recipe search now filters only the library; pantry ranking always uses the complete recipe collection. |
| C3 five seconds says one minute | Reproduced; production-relevant | Duration formatting rounded sub-minute values up to one minute. Authored seconds/minutes now remain truthful at 1, 5, 59, 60, 65, and 120 seconds. |
| C4 duplicate provenance | Contract-safe correction | The versioned recipe contract already included `sourceDrinkId`; no migration or rules expansion was needed. Duplicate drafts retain that ID and the library displays `Copied from …`. |
| C5 `1 steps` | Reproduced; production-relevant | Recipe counts now use singular/plural grammar for ingredients and steps. |

## Architecture and exact corrections

- Added a single immutable, versioned, revisioned, deployment/host-namespaced synthetic state boundary for tasks, notes, drinks, pantry, and preparations.
- Local commits write storage before updating memory or returning success. Storage failure throws, so the UI cannot emit a false success.
- Added conservative state parsing/defaults, date revival, storage-event revision adoption, and deterministic seeded reset.
- Wired Today, Capture, Dashboard, Notes, Calendar, Drinks, global search, account export, and Settings to that state.
- Added a visible audit-host-only **Reset preview data** control. It clears the shared state plus guided-drink and active/outbox game recovery keys, then returns to Today. It is not a production account-deletion action.
- Preserved production authentication and Firestore ownership behavior; no rules or persistence contract was weakened.
- Added the verified focus, date, future-day, overdue-day, heading, search-scope, duration, provenance, and grammar corrections listed above.

## EasyGames engineering regression pass

This was an engineering smoke/regression pass, not an independent role-based audit. The independent EasyGames browser audit remains missing because that auditor's browser could not start.

- Hub loaded in synthetic mode without an Auth error.
- Pair Garden free play rendered 12 Standard cards; pointer and keyboard card actions, pause/resume, revisioned refresh recovery, and restart confirmation passed.
- Trail Scout rendered its finite Standard 5×5 board; keyboard movement, pause/resume, and refresh recovery passed.
- Automated coverage passed for UTC daily determinism, all difficulties, finite/solvable boards, scoring, immutable history, statistics/sample sizes, achievements, owner/slot isolation, completed-state clearing, outbox idempotency, and cross-tab revision precedence.
- The pass independently found and fixed one additional defect: changing game mode or difficulty could replace meaningful progress without confirmation. Both games now use the same explicit replacement guard as restart.
- Reduced-motion emulation matched and reported a `0s` Trail Scout animation duration.
- A later independent first-time/power-user browser audit and physical-device playtest remain required.

## Deterministic verification

| Gate | Result |
| --- | --- |
| Complete application suite | PASS — 99 passed, 0 failed |
| Authenticated Firestore Emulator | PASS — 9 passed, 0 failed |
| TypeScript | PASS |
| Production-configured Vite build | PASS — Vite 5.4.21, 247 modules; approved non-secret repository variables were held in process only |
| Functions syntax lint | PASS |
| Web critical-advisory gate | PASS — no critical; 2 inherited moderate React Router advisories remain |
| Functions critical-advisory gate | PASS — no critical; 8 inherited moderate transitive `uuid` paths remain; npm proposes a breaking Firebase Admin change |
| Publication contract suite | PASS — 29 passed, 0 failed, 1 Windows symlink privilege skip |
| Complete `scripts/verify-release.ps1` | PASS — all deterministic release gates passed |

No test was weakened to obtain a passing result.

## Browser QA

- Real-browser flow verification covered Today, Capture, Dashboard, Notes list/new/edit, future Plan, People, Trust, global search, EasyDrinks creation/duplication/pantry/guided recovery, Pair Garden, Trail Scout, and the signed-out production boundary.
- The complete concrete route inventory covered 36 routes at 1440×900, 390×844, and 320×568: 108 route/viewport checks. One initial Today sample observed the normal session-check screen at 450 ms; a 1.4-second settled retry rendered Today. No application error or blank settled route remained.
- No document-level horizontal overflow occurred at 390px or 320px. Focus and touch-style game controls remained operable.
- Navigation-menu Tab and Shift+Tab wrapped inside the dialog, and closing restored focus to the trigger.
- Clean local demo capture across Games, Dashboard, and Notes recorded 88 same-origin module/asset requests, zero external origins, zero Firebase API requests, zero failed requests, zero runtime exceptions, and zero unexpected console warnings/errors. Development-only React Router future-flag notices were classified separately.
- The no-query loopback production boundary redirected `/app/hq` to `/login`, displayed the truthful disabled-publication sign-in state, and never displayed the synthetic audit label.
- Service-worker contract tests passed. Remote service-worker convergence is rechecked on the final immutable deployment.

## Commits before deterministic publication

- `d84f1811` — audit reproduction and disposition plan
- `97ba1b5b` — shared audit data boundary and persistence
- `38f059ed` — general navigation/date corrections
- `b359a0d0` — EasyDrinks corrections
- `7a86c461` — EasyGames replacement guard
- `14b65505` — remediation regressions
- The commit containing this receipt is the source/evidence head used by the guarded publisher.
- Generated root output is committed separately after this receipt.

## Remaining gates and truthful limitations

- Direct nested Cloudflare requests remain a platform/publication limitation: root is the safe HTTP 200 audit entry; nested SPA routes may return the committed `404.html` shell with HTTP 404. No failed `_redirects` or Pages Function experiment is repeated.
- Legal/privacy text needs owner/legal approval.
- Self-serve backend account deletion does not exist.
- Authenticated production behavior still needs an authorized non-production-account acceptance pass; no credentials or production data were used here.
- Physical iOS/Safari and Android/Chrome checks remain required for real assistive technology, installed-PWA lifecycle, background throttling/Wake Lock, and coarse-pointer behavior.
- EasyGames still needs the missing independent user-role audit.
- The final immutable Cloudflare URL and deployment ID are recorded in `C:\Dev\easylife-audit-staging\EASYLIFE_BLACK_BOX_AUDIT_PREP_2026-08-12.md` after Direct Upload, because Cloudflare creates those identifiers only after the committed publication and hosted CI are green.
