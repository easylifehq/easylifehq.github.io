# EasyLife Wave 10.1 test matrix ? 2026-08-12

## Scope and isolation

- Candidate: C:\Dev\easylife-wave8-production-candidate
- Branch: codex/easylife-drinks-games-wave-10-20260808
- Browser fixture contract: loopback production preview with demo=1 and visualQa=1.
- All fixture data was synthetic. Browser network review found no non-loopback application traffic and no production Firebase traffic.
- No production data, deployment, rule publication, claim provisioning, or merge was performed.

## Deterministic release gates

| Gate | Command or method | Result |
| --- | --- | --- |
| Application tests | app-vNext npm test, also inside scripts/verify-release.ps1 | PASS ? 83 passed, 0 failed |
| Authenticated Firestore Emulator | app-vNext npm run test:emulator | PASS ? 9 passed, 0 failed |
| TypeScript | app-vNext npm run typecheck | PASS |
| Production build | app-vNext npm run build | PASS ? Vite 5.4.21, 243 modules |
| Web critical advisory gate | npm audit --omit=dev --audit-level=critical | PASS ? no critical findings; two existing moderate React Router advisories remain |
| Publication contract tests | repository publication test suite | PASS ? 29 passed, 0 failed, 1 Windows symlink privilege skip |
| Staged publication | guarded stage plus hash verification | PASS ? 107 payload files verified |
| Functions lint | functions npm run lint | PASS |
| Functions critical advisory gate | npm audit --omit=dev --audit-level=critical | PASS ? no critical findings; eight existing moderate transitive uuid findings remain |
| Complete release verification | scripts/verify-release.ps1 | PASS ? EasyLife deterministic release gates passed |

## Focused automated coverage

| Area | Evidence exercised |
| --- | --- |
| Pantry | normalization, conservative matching, optional ingredients, available/missing/unknown evidence, deterministic ranking |
| Shopping handoff | missing-only selection, normalized deduplication, stable fingerprint, provenance, no duplicate cross-module task |
| Scaling | explicit numeric and fraction parsing, serving ratios, readable output, unchanged incompatible units, truthful free text |
| Guided preparation | owner-scoped storage, corrupt-state rejection, clamped step recovery, explicit duration timers, logging and undo |
| Preparation analytics | recent history, most-made, category mix, prepared favorites, sample-labelled averages, sufficient-data rating trend |
| Daily games | UTC date seed contract, deterministic game/difficulty challenge identity, free-play separation |
| Pair Garden | 4x4/6x6/8x8 contracts, deterministic deck, strict state guard, transparent difficulty scoring |
| Trail Scout | 5x5/5x5/6x6 contracts, deterministic curated boards, finite solvability, strict state guard, transparent scoring |
| Session reliability | owner and slot isolation, corrupt-state fail-closed behavior, revisions, outbox durability, stable idempotency key |
| Game analytics | per-game and difficulty bests, completion rate sample size, UTC daily streaks, evidence-derived achievements |
| Security | owner-only reads/writes, strict v2 fields, cross-owner denial, immutable preparation/game session records |
| Account export | JSON/CSV v4 coverage, stable order, ownership removal, CSV escaping and formula neutralization |
| Demo isolation | lazy routes, review-safe fixtures, no production writes or production Firebase fallback |

## Browser route matrix

Thirty-six concrete reachable application routes were exercised at each required viewport: 1440x900, 390x844, and 320x568. This produced 108 route/viewport checks. Fixture-backed dynamic routes were used for Notes, Projects, Workout, and Drinks. Redirect-only aliases were checked at their resolved destination.

| Route family | Concrete surfaces covered |
| --- | --- |
| Core | Today/HQ, Capture, Plan, command/search, Settings |
| EasyList | dashboard, add/inbox, email, archive, deleted |
| EasyCalendar | day and month |
| EasyNotes | library, new-note redirect behavior, editor fixture, trash |
| EasyPipeline | dashboard, statistics, email |
| EasyContacts | contacts dashboard |
| EasyProjects | home, project detail, project timeline |
| EasyWorkout | dashboard, routines, logger, exercise insight, session review |
| EasyStatistics | statistics dashboard |
| EasyDrinks | dashboard/library, new, detail, guided preparation |
| EasyGames | dashboard, Pair Garden, Trail Scout |

Final matrix result:

- No horizontal document overflow at 390px or 320px.
- No clipped EasyDrinks or EasyGames controls at any required viewport.
- A desktop EasyWorkout routine-editor clipping defect discovered by the full-site matrix was repaired with a page-scoped one-column composer; the rebuilt 1425px content viewport had zero off-right interactive controls and equal client/scroll widths.
- New EasyDrinks and EasyGames surfaces expose one main landmark and one page heading.
- Deep links and route refreshes resolved without an application error.
- Both game boards preserved 44px-or-larger touch controls where applicable.
- Browser console review found zero unexpected warnings or errors.
- Network review found zero failed assets or HTTP errors and zero production Firebase traffic.

## Focused browser flows

### EasyDrinks

- Pantry add, availability toggle, and removal were exercised.
- Make now, Almost there, and All recipe filters returned deterministic explanations.
- Three-serving scaling rendered 6 shots, 24 oz, 3 tsp, and 3/4 tsp without unit conversion.
- Guided preparation recovered step 2 and an absolute 2:00 timer after reload.
- Made-this logging and undo were exercised.
- Shopping handoff confirmation was exercised; demo isolation prevented production writes.
- The 320px statistics state showed category mix, one prepared favorite, n=2 average, and the honest needs-4-ratings trend state.

### Pair Garden

- Standard mode rendered 12 cards; Easy rendered 8.
- Mouse/touch-style reveal, keyboard mismatch, live status, pause, resume, and reload recovery were exercised.
- The 2026-08-12 UTC daily Easy deck reproduced the same first card after restart.
- A second tab adopted a newer revision and announced the recovered state.
- Restart required confirmation when progress existed.
- Focus outline measured as solid 3px with 3px offset.

### Trail Scout

- Standard mode rendered a 5x5 board and 48px directional controls.
- Touch-style and keyboard moves, reload recovery, pause, and resume were exercised.
- A finite computed route completed the board at score 1395.
- Completion disabled movement, queued the result locally before sync, and cleared active state on reload.

### PWA and accessibility

- Reduced-motion emulation produced 0s Pair Garden transition and animation durations.
- Offline network emulation followed by reload returned the EasyDrinks shell without an app error.
- The active service worker controlled the page; a waiting worker remained waiting, confirming safe update behavior without forced activation.
- Pair Garden exposed a polite live region and visible keyboard focus.
- Guided preparation exposed labelled step controls, progress, timers, and safe Wake Lock feature detection/release behavior.

## Screenshot index

| Surface | Evidence file |
| --- | --- |
| EasyDrinks desktop | screenshots/easydrinks-desktop-1440x900.png |
| EasyDrinks narrow statistics | screenshots/easydrinks-stats-320x568.png |
| EasyGames desktop | screenshots/easygames-desktop-1440x900.png |
| EasyGames narrow dashboard | screenshots/easygames-320x568.png |
| Guided preparation recovery | screenshots/guided-drink-recovered-390x844.png |
| Pair Garden | screenshots/pair-garden-390x844.png |
| Trail Scout paused state | screenshots/trail-scout-paused-390x844.png |

Earlier Wave 10 baseline screenshots remain in docs/codex/evidence/wave-10-2026-08-08.

## Physical-device follow-up

Desktop browser emulation cannot fully prove OS Wake Lock behavior, real assistive-technology announcements, installed-PWA lifecycle, coarse-pointer ergonomics, or mobile-browser background throttling. Those checks remain required on at least one current iOS/Safari device and one current Android/Chrome device before release.
