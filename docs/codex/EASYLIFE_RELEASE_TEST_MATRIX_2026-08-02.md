# EasyLife Release Test Matrix — Wave 6

Artifact: production build from verified implementation SHA `75526139798b8febd6de54abf6773491143fc26f`.

## Automated gates

| Area | Command | Result |
| --- | --- | --- |
| Complete app suite | `npm.cmd test` in `app-vNext` | 70/70 pass |
| Firestore authorization/integration | `npm.cmd run test:emulator` in `app-vNext` | 7/7 pass against demo project/emulator only |
| Static types | `npm.cmd run typecheck` in `app-vNext` | pass |
| Production build | `npm.cmd run build` in `app-vNext` | pass, 210 modules |
| Functions syntax | `npm.cmd run lint` in `functions` | pass |
| Web production critical gate | `npm.cmd audit --omit=dev --audit-level=critical` | pass |
| Functions production critical gate | `npm.cmd audit --omit=dev --audit-level=critical` | pass |
| Deterministic aggregate | `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-release.ps1` | pass |

## Browser route inventory

Every entry below was opened independently in the rebuilt artifact at 1440×900 and 390×844. Required result: visible shell/main content, no unexpected alert, no document horizontal overflow, navigation settles to a supported destination or explicit not-found/low-data state.

| Group | Routes/states | Desktop | Phone |
| --- | --- | --- | --- |
| Public/marketing/auth | `/`, `/easylist`, `/easynotes`, `/easycalendar`, `/easypipeline`, `/easyhq`, `/easyprojects`, `/easycontacts`, `/easyworkout`, `/easystatistics`, `/login` | 11/11 | 11/11 |
| Core/aliases | `/settings`, `/app`, `/app/hq`, `/app/today`, `/app/inbox`, `/app/notes`, `/app/plan`, `/app/people`, `/app/workout`, `/app/command` | 10/10 | 10/10 |
| EasyList | `/app/easylist`, `/app/easylist/dashboard`, `/app/easylist/add`, `/app/easylist/email`, `/app/easylist/inbox`, `/app/easylist/today`, `/app/easylist/upcoming`, `/app/easylist/archive`, `/app/easylist/deleted` | 9/9 | 9/9 |
| Calendar | `/app/easycalendar`, `/app/easycalendar/week`, `/app/easycalendar/day`, `/app/easycalendar/month` | 4/4 | 4/4 |
| Notes | `/app/easynotes`, `/app/easynotes/new`, `/app/easynotes/trash`, `/app/easynotes/visual-note-brief` | 4/4 | 4/4 |
| Pipeline | `/app/easypipeline`, `/app/easypipeline/dashboard`, `/app/easypipeline/stats`, `/app/easypipeline/email` | 4/4 | 4/4 |
| People/projects | `/app/easycontacts`, `/app/easyprojects`, `/app/easyprojects/visual-project`, `/app/easyprojects/visual-project/timeline` | 4/4 | 4/4 |
| Workout/progress | `/app/easyworkout`, `/app/easyworkout/dashboard`, `/app/easyworkout/routines`, `/app/easyworkout/log`, `/app/easyworkout/exercise/demo-bench`, `/app/easyworkout/session/demo-session-w8-upper`, `/app/easystatistics` | 7/7 | 7/7 |
| Settings/unknown | `/app/settings`, `/app/not-a-real-route` | 2/2 | 2/2 |
| Missing records | `/app/easynotes/missing-record`, `/app/easyprojects/missing-record`, `/app/easyprojects/missing-record/timeline`, `/app/easyworkout/exercise/missing-record`, `/app/easyworkout/session/missing-record` | 5/5 | 5/5 |
| Malformed parameters | `/app/easycontacts?contact=%E0%A4%A`, `/app/easypipeline/dashboard?application=%E0%A4%A`, `/app/easylist/dashboard?task=%E0%A4%A` | 3/3 | 3/3 |
| **Required total** | **63 routes/states × 2 viewports** | **63/63** | **63/63** |

Supplementary 320×568 matrix: 10/10 for Today, Capture, Review, My Week, Workout Progress, Workout Dashboard, Workout Log, workout review, Projects, and Settings.

Machine-readable per-route result: [ROUTE_MATRIX.json](evidence/release-candidate-wave-6-2026-08-02/ROUTE_MATRIX.json).

## Changed-flow and state matrix

| Flow/state | Evidence exercised | Result |
| --- | --- | --- |
| Global search | Ctrl/Cmd+K, grouped Cedar matches, ArrowDown/Enter opens source, Escape restores focus | pass |
| Capture | synthetic task saved to demo Inbox with explicit receipt | pass; no Firebase traffic |
| Review queue | first item processed and assigned to Today; deterministic owning action | pass; in-memory demo receipt |
| Workout interruption | edit, immediate navigation, reload, owner-scoped draft recovery | pass after repair |
| Cross-tab workout | storage event prevents silent overwrite and requests reload | pass by regression/source contract |
| Workout completion | full log, explicit 45 minutes, post-workout review with 1 set and 925 lb·reps | pass |
| Implausible duration | automatic overnight duration rejected; explicit valid duration accepted | pass |
| Progress | 7/28/84 matched periods, sample sizes, table alternative, zero-denominator/low-data states | pass |
| Goals | edit 3→4, pause, archive, restore; derived progress | pass; in memory only |
| History/export | Bench search, PR-only, source drill-down; workout JSON/CSV | pass; no upload |
| Account export | 74 fixture records; versioned JSON and Goals CSV | pass; secrets filtered/formulas neutralized |
| PWA update | existing v4 active, v6 waits; after tabs close only v6 cache remains | pass |
| Offline | primed Workout Progress deep route reload while offline | pass |
| Reduced motion | OS preference emulated; visible animations counted | pass, 0 |
| Accessibility | keyboard focus, semantic Capture/Plan h1, chart tables, narrow controls | pass locally |
| Network/console | full trace across matrix and demo | 425 events; 0 failed loads, HTTP errors, production Firebase/Functions calls, warnings, or errors |

## Screenshot inventory

Folder: `docs/codex/evidence/release-candidate-wave-6-2026-08-02/screenshots/`

1. `01-today-desktop.png`
2. `02-global-search-desktop.png`
3. `03-capture-saved-desktop.png`
4. `04-my-week-focused-review-desktop.png`
5. `05-workout-draft-recovered-desktop.png`
6. `06-post-workout-review-desktop.png`
7. `07-workout-progress-comparison-desktop.png`
8. `08-goal-lifecycle-restored-desktop.png`
9. `09-workout-history-filtered-desktop.png`
10. `10-whole-account-export-desktop.png`
11. `11-workout-progress-offline-desktop.png`
12. `12-today-phone.png`
13. `13-focused-review-phone.png`
14. `14-workout-progress-phone.png`
15. `15-workout-dashboard-phone.png`
16. `16-workout-log-narrow-phone.png`

Screenshots 01, 04, 07, and 14 received an additional pixel-level inspection after capture; the full matrix independently verified layout bounds for all routes.

## Remaining device-only checks

- iPhone Safari: install to Home Screen, update from an older active service worker, keyboard/focus, export share/download behavior, safe-area insets, rotate during an active workout, background/foreground duration.
- Android Chrome: install prompt, update waiting/activation, offline deep route, file downloads, back navigation during an active workout, background/foreground duration.
- Slow/unstable physical network: authenticated save retry/idempotency and post-update asset convergence.

No browser emulation result is represented as a physical-device result.
