# EasyWorkout Wave 1 discovery and dogfood record

Date: 2026-09-08  
Canonical commit inspected: `e48b7a570f8d15414f302ba76c6782e69ec55fef` (`HEAD` and `origin/main`)  
Runtime inspected: current `app-vNext` source and Vite demo route. The checked-in package and top `CHANGELOG.md` entry identify this tree as 4.37.1, although the continuation brief described 3.6.0.

## Method

This was a hands-on pass against the real React app, not the `UI_DOGFOOD_AGENT_V0` bridge. I started the current Vite app and used isolated Chrome 152 via the DevTools protocol, then set device metrics to 390 × 844 and navigated the real demo routes. I opened the Workout dashboard, started `Upper — steady progress`, inspected and used the active logger controls, clicked the prior-performance fill action, and opened a completed session review. I paired those observations with targeted source inspection of the logger, context, Firestore adapters, history tools, routines, statistics, and responsive CSS.

No production account, credential, deploy, or publish action was used. Demo data is explicitly synthetic and Firebase-write-free.

## Candidate-area findings

| Candidate | Finding | Evidence |
| --- | --- | --- |
| Core workout logging | Already solved; do not rebuild | The active logger exposes routine/date/notes, exercise and set rows, set types, numeric-input ergonomics, add/copy/remove actions, local undo, and Save workout. Existing draft/idempotency tests cover save coordination. |
| Fast entry | Mostly solved | The UI provides focused workout mode, first-field focus code, `Add 3 boxes`, `Clear blank boxes`, `Copy previous set`, next-exercise suggestions, and a full-log paste parser. |
| Previous-set values | Genuine, high-impact gap before Wave 1 | Starting the demo Upper routine showed Bench Press reps `5/5/5` but all three weight fields blank. Clicking the only `Fill first set` helper changed only set 1 to 185 lb; sets 2 and 3 remained blank even though the latest session had a complete working-set sequence. |
| Exercise search / reuse | Genuine, high-impact gap before Wave 1 | Every active logger Exercise input had `list=null`, and the page contained zero datalists. The user had to remember and type an exact name even though recent session names, saved exercises, and built-ins were already loaded. |
| Recent/favorite exercises | Partial | Local next-exercise suggestions exist, but there is no explicit favorites model. Recent names were available only indirectly through history/suggestions, not as lookup choices in the exercise field. This was not separately built because logger lookup absorbs the most common need. |
| Workout history browsing | Already solved | Dashboard dogfood showed 19 searchable/filterable sessions, routine/date/PR filters, JSON/CSV export, and per-session Review links. |
| Edit/delete completed session | Genuine gap, deferred | Completed-session review showed progress and dashboard links but no edit/delete controls. Context and Firestore adapters already expose `saveSession` and `deleteSession`, so this is UI workflow work rather than a persistence gap. It was deferred behind the two recurring in-workout frictions. |
| Routines/templates | Already solved | Dashboard offers Routines and guided next workout; routine create/edit/delete and exercise targets/rest values are implemented. |
| Mobile ergonomics/responsive design | Substantially solved | At an emulated 390 × 844 viewport the logger rendered its focused/collapsed-exercise workflow and document width did not exceed the viewport (`scrollWidth 375`, `innerWidth 390`). Responsive workout rules and large touch controls are present. Subjective redesign remains recommendation-only. |
| Rest timer | Genuine gap, deferred | Routines persist `restSeconds` (the demo uses 90), but the logger does not consume it or expose a rest countdown; its only interval tracks truthful session duration. Deferred behind entry/prefill because a timer is optional while blank recurring set entry affects every routine session. |
| Progress visibility | Already solved | Dashboard links to Workout progress; EasyStatistics renders the unit-aware `WorkoutInsightsPanel`, trends, PR evidence, goals, weekly rhythm, muscle exposure, and source-workout links. |
| Loading/empty/error states | Already solved | Workout context tracks three subscription-loading states and safe errors; dashboard/history/statistics render loading, empty, partial-error, and no-data states. |
| Firestore persistence | Already solved | Session create/update/delete adapters exist, session creation is idempotent by `clientDraftId`, subscriptions are owner-scoped, and save waits for a confirmed session id. |
| Offline/retry | Already solved for the logger's current contract | Unsaved work is serialized to owner-scoped local storage, restored on return, protected against two-tab overwrite, retained on offline/sync failure, and retried through the same save coordinator. |
| Dashboard/nav friction | Already solved | The first dashboard surface offers Start/Resume, Routines, Workout progress, guided routine start, history, and direct Today/full-log paths. |
| Accessibility | No Wave 1 blocker found | The inspected controls have visible labels; set-type and remove actions have contextual accessible labels; local save state uses polite live status; tables and filters have labels. A full independent accessibility audit was outside this focused dogfood pass. |

## Prioritization and implementation

Wave 1 intentionally implements only two related, high-frequency improvements:

1. Routine starts now wait for workout data and prefill every planned set from the newest completed, non-deleted, non-warm-up set sequence. If the prior session has fewer working sets, the final prior set repeats; an explicitly configured routine weight still wins. Unit conversion remains explicit and existing local draft work is never overwritten.
2. Exercise fields now use one free-form datalist assembled in recent-use order from session history, then enriched by saved exercises and completed with built-ins. Selecting a known name restores its stable id and muscle/type metadata; unmatched text remains allowed.

The existing helper was updated from `Fill first set` to `Fill all sets`, so a user can reapply the same deterministic prior sequence after manual changes.

## Verification after implementation

- Mobile browser, 390 × 844: a fresh Upper routine opened with Bench Press weights `185/185/185` and reps `5/5/4`, matching the newest three completed working sets rather than the warm-up. The other routine exercises also showed three populated sets in their collapsed summaries.
- Mobile browser: every Exercise input referenced `workout-log-exercise-options`; the datalist contained 16 deduplicated recent/saved/built-in names, led by recently performed lifts.
- `npm run typecheck`: passed.
- `npm test`: 75/75 passed, including new coverage for latest-set selection, invalid/warm-up exclusion, all-set prefill/repetition, stable local ids, recent-first ordering, metadata enrichment, and deduplication.
- `npm run build`: passed after the required sandbox permission allowed esbuild to resolve the local Vite config.

## Deferred recommendation

The next evidence-backed Wave 2 should choose one workflow, not bundle both: either add a routine-aware rest countdown using the already-persisted `restSeconds`, or expose a guarded completed-session edit/delete flow using the existing adapters. Session deletion should require a clear confirmation and successful persistence feedback. No major redesign is recommended from this pass.
