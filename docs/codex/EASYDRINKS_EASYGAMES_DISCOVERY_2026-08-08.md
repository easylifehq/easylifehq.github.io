# EasyDrinks and EasyGames historical discovery

Date: 2026-08-08
Wave: 10
Starting point: `d2ba9c42965808a0647286755ff1df96dcc0caf7` (`codex/easylife-ui-refinement-wave-9-20260808`)
Discovery mode: read-only source and object inspection; remote refs were refreshed, but no historical file, stash, deleted path, or generated artifact was restored.

## Result

No working EasyDrinks or EasyGames implementation, prototype, mockup, screenshot, rules schema, test, theme, navigation entry, settings identifier, Firestore collection, generated bundle, or deleted source path was found.

The recoverable historical product idea is a documentation-only `5.0.0` specification:

- EasyDrinks is a quick drink journal and recipe app with name, ingredients, notes, rating, tags, date, favorites, broad drink types, and neutral alcohol language.
- EasyGames is a deliberately small hub with one or two lightweight games and simple play statistics.
- Both were intentionally held until the mobile foundation stabilized and were to be integrated into navigation, settings, themes, roadmap, changelog, and versioning.

This specification was preserved. No obsolete implementation code was copied because none exists.

## Search scope and method

The search covered:

- tracked and untracked files at the Wave 9 SHA, including `old-site`, docs, tests, Firebase rules, settings, navigation, themes, screenshots, receipts, root assets, `app-vNext`, and generated JavaScript;
- all local heads, fetched `origin/*` and `private/*` remote-tracking refs, tags, commit subjects, commit diffs, added/modified/deleted path history, the stash, all reflogs, reachable objects, and 114 unreachable Git objects;
- all EasyLife-named directories directly under `C:\Dev`, without searching unrelated user directories;
- exact and normalized forms of EasyDrinks, EasyDrink, EasyGames, and EasyGame, plus bounded searches for drinks, recipes, cocktails, mocktails, coffee, tea, smoothies, protein shakes, games, scores, play statistics, and sessions played.

No credentials, repository variables, `.env` contents, browser storage, or production data were inspected or printed.

## Relevant tracked files

| File | Classification | Relevant content | Recovery decision |
| --- | --- | --- | --- |
| `docs/ROADMAP.md` | Product specification | The complete `5.0.0` scope, backlog entries, hold status, required drink fields/types, small game-hub limit, simple stats, integration targets, and neutral alcohol copy | Authoritative product provenance; implemented in the current architecture |
| `docs/VERSIONING.md` | Release specification | Names `5.0.0 EasyDrinks and EasyGames Suite Expansion` as the next feature target and release-plan item | Reused as version provenance |
| `docs/QA_CHECKLIST.md` | Release gate | Says to begin the two apps only after core flows are stable | Treated as the historical hold; Wave 10 starts from the separately verified Wave 9 final SHA |

There are no matching paths whose names contain drink, cocktail, mocktail, coffee, smoothie, or game.

### Broad-term matches rejected as unrelated

The following current files contain generic words such as `score`, `game`, `drink`, or `recipe`, but inspection found no EasyDrinks/EasyGames concept or recoverable artifact: `app-vNext/src/features/coreloop/domain/globalSearch.ts`, `app-vNext/src/features/easycalendar/lib/calendarUtils.ts`, `app-vNext/src/features/easystatistics/routes/EasyStatisticsPage.tsx`, `app-vNext/src/features/experiments/AiCommandCenter.tsx`, `app-vNext/src/features/hq/routes/CommandCenterPage.tsx`, `docs/codex/AI_ASSISTANT_STAGE_0_AUDIT.md`, `docs/codex/AI_PERSONAL_ASSISTANT_REBUILD_PLAN.md`, `docs/codex/archive/QUALITY_QUARANTINE_HISTORY_2026-05-07.md`, `docs/codex/EASYLIFE_NEXT_VARIATION_BRIEF.md`, `docs/codex/EASYLIFE_NEXT_VARIATION_ROADMAP.md`, `docs/codex/EASYLIFE_STAGE_25_PROVIDER_SELECTION_RUBRIC.md`, `docs/codex/MAGIC_SCORECARD.md`, `docs/codex/NIGHTLY_REPORT.md`, `docs/codex/PHASE_1_PRODUCT_SPINE_PLAN.md`, `docs/codex/QUALITY_QUARANTINE.md`, `docs/codex/QUARANTINED_TASKS.md`, `docs/codex/SHIP_ADMISSION.md`, `docs/codex/SHIP_SCORECARD.md`, and `docs/codex/TASK_QUEUE_ARCHIVE_2026-05-10.md`.

## Commit provenance

The specification first appears in the following two substantive commits:

- `88621d71f10f35ee96071835a3c3260dd4c3458b` (2026-04-17, `Release 3.12.0 workout polish`) introduced the roadmap EasyDrinks/EasyGames plan.
- `b43a5023633dddcd724272d2e055846f906b7e5d` (2026-04-17, `Release 3.14.2 version sync and bug hunt`) added the QA hold language.

The matching documentation lines were carried or edited by this complete later documentation lineage; none adds implementation code:

- `6c9a0f522c7ed2aae71eab7d087a7f980ef78d02`, `87958bc2bdd42ca86517236887d4e6499a45a018`, `afaf3c66204cfe23c124bb4d88bee41ccb8183e2`, `880db58b25b304e24d82273e296570d1692f39a1`, `60b7acf479b5e6cc875dfd7bb9a2b082e251a0cd`;
- `71ef3ae89f5cb68fbd71196d4c7b97a4b3f03634`, `953c60c9dc133018adde9d3f34bae305f98a0426`, `5ded5dc233b13636c0f6699ef7c74a6c6b651238`, `fb152ac86f15f59b77b004c5803330081f75dfcf`;
- `881e5c86a8c0145877bdfeea3e3d5b55ea469f95`, `13d1684683606394d3f37b5e03e7695cf1d72028`, `8607652920cc3e6d6a976c3119096011749f4877`, `9143f82c6937d50733b60c0780ecae891286a123`;
- `ac4d6d1dc8690dda5c6203bef550dfe6f92219af`, `2b789122b146764b768b0674dcd86be21061961a`, `883118aa1dc054671e8e89b924801b0a5f2a6748`, `173052cf98aea445bc65bcc1e0b4809e0ac16921`;
- `ec653f54c66d52b71d6cec606afa97b881172a0c`, `ecc2784c4d556e0d298fe953495ef336e6a54e1d`, `d40f6bd04f19df41bced83446d5272c73efa66fd`, `1a4339d1d43ee1eec524b04be72156882c35e530`, `b83d18436353792d237725b1be98127c7c89d1b7`, and `037fb0d3125d60a0adbd57ad9124de58df1672ac`.

No commit subject directly mentions EasyDrinks, EasyGames, cocktails, mocktails, smoothies, a drink recipe, or a game hub. No relevant added or deleted pathname exists in history.

## Refs containing the specification

Every matching ref contains only the same three documentation paths named above. The scan found 43 refs resolving to 26 unique commits after the Wave 10 branch was created:

### Local heads

`codex/easylife-core-loop-wave-3-20260802`, `codex/easylife-drinks-games-wave-10-20260808`, `codex/easylife-post-merge-wave-4-20260802`, `codex/easylife-product-upgrade-wave-2-20260802`, `codex/easylife-production-candidate-wave-8-20260803`, `codex/easylife-publication-automation-wave-7-20260803`, `codex/easylife-release-candidate-hardening-20260801`, `codex/easylife-release-candidate-wave-6-20260802`, `codex/easylife-ui-refinement-wave-9-20260808`, `codex/easylife-workout-statistics-wave-5-20260802`, `codex/easylist-mobile-header-audit`, `codex/mission-EasyLife-20260424-145031`, `codex/practice-20260424-045637`, `codex/practice-20260424-045943`, `codex/practice-20260424-054357`, `codex/practice-20260424-054834`, `codex/practice-20260424-060544`, `codex/practice-20260424-061131`, `codex/product-EasyLife-20260428-183059`, `codex/product-EasyLife-20260504-231503`, `codex/safety-july-checkpoint-20260801`, `codex/setup-loop-runbook`, `codex/weekend-upgrade-workout-intelligence-20260801`, and `main`.

### Origin remote-tracking refs

`origin/HEAD`, `origin/codex/easylife-core-loop-wave-3-20260802`, `origin/codex/easylife-post-merge-wave-4-20260802`, `origin/codex/easylife-product-upgrade-wave-2-20260802`, `origin/codex/easylife-production-candidate-wave-8-20260803`, `origin/codex/easylife-publication-automation-wave-7-20260803`, `origin/codex/easylife-release-candidate-hardening-20260801`, `origin/codex/easylife-release-candidate-wave-6-20260802`, `origin/codex/easylife-ui-refinement-wave-9-20260808`, `origin/codex/easylife-workout-statistics-wave-5-20260802`, `origin/codex/easylist-mobile-header-audit`, `origin/codex/mission-EasyLife-20260424-145031`, `origin/codex/product-EasyLife-20260428-183059`, `origin/codex/product-EasyLife-20260504-231503`, `origin/codex/setup-loop-runbook`, `origin/codex/weekend-upgrade-workout-intelligence-20260801`, and `origin/main`.

### Private remote-tracking refs

`private/HEAD`, `private/codex/product-EasyLife-20260504-231503`, and `private/main`.

There are no tags.

## Reflog, stash, and unreachable objects

- All reflogs: no relevant subject or action.
- `stash@{0}` (`interrupted fleet EasyLife old queue partial`): only the same `docs/QA_CHECKLIST.md`, `docs/ROADMAP.md`, and `docs/VERSIONING.md` text; no implementation.
- Unreachable commits `cca9c5797ac334a9cd653d4068c86ecb7cbaf9c0` and `f4e430f517e1663c1a1d9f31e98c8d431af213fe`: only the same three documentation files; no implementation.
- The remaining unreachable blobs and trees: no specific EasyDrinks/EasyGames, cocktail, mocktail, smoothie, protein-shake, drink-recipe, game-hub, play-statistics, or sessions-played match.

Nothing was restored from the stash or unreachable object database.

## Existing `C:\Dev` artifacts

The scan covered `easylife-wave7-dry-run`, all six Wave 7 publication/rehearsal directories, all three Wave 8 candidate directories, both Wave 9 candidate/stage directories, `easylifehq.github.io`, and `EasyLife_external_audit_packet_20260529-224245`.

Only nine files match, representing six unique hashes:

- `easylife-wave7-dry-run/docs/{QA_CHECKLIST.md,ROADMAP.md,VERSIONING.md}` and `easylife-wave8-production-candidate/docs/{QA_CHECKLIST.md,ROADMAP.md,VERSIONING.md}` are byte-identical pairs (`B3BEE4E7A557…`, `1E2F85B098AA…`, `54DD2E1AD0F0…`).
- `easylifehq.github.io/docs/QA_CHECKLIST.md` (`DC641BFC00AF…`), `docs/ROADMAP.md` (`8025DCFCF94E…`), and `docs/VERSIONING.md` (`31F4C390E8DD…`) are older documentation variants.

No other candidate, rehearsal, stage, or audit-packet directory contains a relevant artifact.

## Generated, archived, visual, and persistence artifacts

- `old-site`: no relevant source, mockup, bundle string, or asset.
- Root `assets` and current/historical generated JavaScript: no specific feature string or implementation.
- Screenshots and receipts: no EasyDrinks/EasyGames visual or execution record.
- Firestore rules and tests: no pre-Wave-10 collection or validation contract.
- Settings, navigation, themes, global search, PWA manifest, and service worker: no pre-Wave-10 identifiers or routes.
- Deleted paths: none.

## Architecture conflicts and porting decision

There is no old implementation to conflict with React. A hypothetical archived implementation would have conflicted with the current owner-scoped `users/{uid}/{collection}` model, synthetic demo gates, lazy React Router routes, shared Wave 9 shell density, account export manifest, and PWA runtime cache. Wave 10 therefore implements the documented ideas directly in those current boundaries.

The two new visible-app identifiers are valid during normalization but are absent from `defaultShellSettings.visibleApps`, so old arrays remain unchanged and both apps stay optional under More. Demo/visual QA explicitly reveals both for testing without changing production preferences.

## Lightweight game research and selection

With no historical game concept to preserve, the implementation follows primary platform and accessibility guidance:

- [MDN PWA caching](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching) supports caching requested JavaScript/CSS resources through the existing service-worker fetch path, so games work offline after their lazy chunks have loaded once.
- [W3C keyboard compatibility](https://www.w3.org/WAI/perspective-videos/keyboard/) recommends native controls where possible and complete keyboard access. Pair Garden uses native buttons plus direct letter keys; Trail Scout uses native direction buttons plus arrows/WASD.
- [MDN `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion) supports removing nonessential card lift motion for users who request it.
- [MDN `localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) documents origin-scoped persistence across browser sessions. Active-game state is versioned, JSON-only, guarded on restore, and keyed by authenticated owner plus game ID; durable statistics remain in Firestore.

Selected MVP games:

- **Pair Garden**: six-pair memory matching; immediately understandable, short, touch/keyboard friendly, deterministic, and asset-free.
- **Trail Scout**: a five-by-five pathfinding puzzle with three goals, four obstacles, and a finite move budget; short, deterministic, touch/keyboard friendly, and original to this MVP.

Both have explicit stop states, restart, pause/resume, local recovery, best score and sessions, and no gambling, real money, ads, streak pressure, or copyrighted assets.

## Missing pieces before Wave 10 and recommended MVP

Before implementation, all runtime pieces were missing: domain types, CRUD, rules, emulator coverage, demos, routes, views, filters, editor/detail UI, game simulations, recovery, stats, exports, search, settings, themes, PWA cache version, docs, and receipts.

The recommended and implemented scope is exactly one polished drink library plus two small games. Deferred intentionally: nutrition calculations, alcohol-consumption advice, public sharing, third-party recipe import, images, leaderboards, multiplayer, achievements, social feeds, downloadable asset packs, and a general-purpose game platform.
