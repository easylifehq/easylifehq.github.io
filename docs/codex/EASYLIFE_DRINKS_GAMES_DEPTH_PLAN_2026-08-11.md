# EasyLife Drinks + Games depth plan — 2026-08-11

Status: frozen implementation plan for Wave 10.1 on draft PR #8
Branch: `codex/easylife-drinks-games-wave-10-20260808`
Starting branch SHA: `807706a9cd5b5a14fbb299e3f9e633b1536130ae`
Starting `main` SHA: `20eb30c0bb245cd59b68a7ebe70cf696533c84b4`
Wave 9 source SHA present in `main`: `d2ba9c4c49d3f1d49a4dd9a30ee1545cb5408455`

## Mission guardrails

- Work only in the isolated production-candidate checkout. The dirty canonical checkout is out of scope.
- Keep PR #8 draft, based on `main`, and do not merge or deploy.
- Preserve current EasyLife trust boundaries: private owner-scoped data, review-first cross-app writes, demo isolation, deterministic exports, and no hidden network or AI work.
- Deepen only EasyDrinks and the existing Pair Garden and Trail Scout games. A third game is explicitly rejected for this wave.
- Keep `5.0.0`: Wave 10.1 completes the still-draft Wave 10 release rather than publishing a second version.

## Baseline evidence

Before edits, `scripts/verify-release.ps1` passed:

- app tests: 82/82
- Firestore emulator tests: 9/9
- TypeScript and production build
- web critical dependency audit (two existing moderate React Router advisories remain visible)
- publication tooling: 29 pass, 0 fail, 1 expected Windows symlink skip
- staged publication hash verification
- Functions lint and critical dependency audit (nine moderate transitive `uuid` advisories remain visible)

## Research transferred, not copied

Patterns were reviewed from official or publisher-owned sources only:

- [Paprika help](https://www.paprikaapp.com/help/windows/) supports separate recipe, pantry, and grocery concepts, including excluding stocked pantry items from groceries.
- [My Bar](https://mybar.app/) supports the honest “make now” versus “missing one or two” split.
- [Mixel](https://www.mixelcocktails.com/) supports ranking recipe discovery by available ingredients without replacing ordinary search and filters.
- [NYT Games help](https://thenewyorktimeshelpcenter.helpjuice.com/360052273251-The-New-York-Times-Games-app) supports bounded daily puzzles and private statistics without a global leaderboard.
- [Simon Tatham’s Portable Puzzle Collection](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/common.html) supports serializable deterministic game identifiers while warning that seeds alone can change meaning after generator upgrades.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and its [target size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) set the keyboard, focus, and pointer-target floor.
- [MDN PWA caching guidance](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching) and [localStorage guidance](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) support a cached shell plus small, versioned, owner-scoped local recovery records.

No recipes, instructions, game content, answer lists, art, branded layouts, or proprietary classifications will be copied. EasyLife uses user-authored recipes and its existing original games.

## EasyDrinks frozen contracts

### Recipe schema

`easydrinks-v2` extends the existing document while remaining readable from v1:

```ts
type DrinkIngredient = {
  id: string;
  name: string;
  amount: string;
  unit: string;
  optional: boolean;
};

type DrinkPreparationStep = {
  id: string;
  text: string;
  durationSeconds: number | null;
};

type DrinkRecord = {
  // existing fields remain
  schemaVersion: "easydrinks-v2";
  baseServings: number;
  ingredients: DrinkIngredient[];
  steps: DrinkPreparationStep[];
  instructions: string; // retained for v1 compatibility and portable plain text
};
```

Reads normalize v1 documents to one untimed step from `instructions`, `baseServings: 1`, generated stable ingredient/step IDs, and `optional: false`. The first edit migrates that record to v2. Quantities remain user-authored strings; EasyLife does not infer nutrition, alcohol content, allergens, potency, or substitutions.

### Canonical ingredient identity and pantry

Canonicalization is intentionally conservative:

```text
canonical(name) = NFKC(name) -> trim -> lowercase -> collapse whitespace -> explicit alias map
```

There is no substring matching or general stemming. In particular, `orange` cannot satisfy `orange liqueur`. A small audited alias map may equate spelling/punctuation variants only.

Pantry documents live at `users/{uid}/drinkPantry/{id}`:

```ts
type DrinkPantryItem = {
  ownerId: string;
  schemaVersion: "easydrinks-pantry-v1";
  name: string;
  canonicalName: string;
  status: "available" | "unavailable";
  note: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

An absent canonical item is `unknown`; it is never silently treated as missing or available. Quantity sufficiency is not inferred in v1 because recipe and pantry units are flexible strings.

For each drink:

```text
required = unique canonical ingredients where optional == false
available = required with an explicit available pantry record
missing = required with an explicit unavailable pantry record
unknown = required with no pantry record
ready = required is nonempty AND missing is empty AND unknown is empty
almost = not ready AND (missing + unknown) is between 1 and 2
coverage = available / max(1, required)
```

Results sort by tier (`ready`, `almost`, `discovery`), unavailable count, unknown count, favorite, rating, then name. Each result exposes the exact available/missing/unknown evidence. Optional ingredients are shown separately and never block readiness.

### Scaling

- `targetServings / baseServings` is the only scale factor.
- Integers, decimals, simple fractions, and mixed fractions are parsed; common readable fractions are emitted when exact enough.
- Non-numeric or ambiguous amounts stay unchanged and are labeled “as written.”
- Units are never converted, ingredients are never substituted, and rounding never claims precision the source did not contain.

### Guided preparation and recovery

- The simulation state is a small owner-and-drink-scoped local record: schema version, drink ID, recipe update fingerprint, target servings, active step, timer end instant, completed steps, and updated time.
- A timer exists only when a user supplied a step duration. It is derived from an absolute end instant so backgrounding does not drift.
- Recovery is offered when the stored record validates and the source recipe still exists. A changed recipe is disclosed before resume.
- Wake Lock is an explicit user control, requested only after interaction, released on exit/hidden state, and fails with a neutral explanation.
- Starting over requires confirmation. Ordinary navigation remains available because owner-and-recipe-scoped recovery preserves the current step. Completion clears active recovery state only after the preparation log succeeds.

### Preparation history and statistics

Immutable preparation records live at `users/{uid}/drinkPreparations/{id}` with schema `easydrinks-preparation-v1`, recipe and name snapshot, servings, optional rating snapshot, prepared timestamp, and created timestamp. The latest accidental log can be undone by deleting that explicit record; no recipe is changed.

Derived formulas:

```text
preparations = count(records)
unique drinks made = count(unique drinkId)
favorite repeat = highest preparation count, name as stable tie-break
average saved rating = average(ratingSnapshot where ratingSnapshot > 0)
category mix = count records by drinkType, descending count then type
favorite recipes actually prepared = count(unique prepared drinkId intersect current favorite drink IDs)
rating trend exists only with >= 4 rated records:
  window = min(3, floor(ratedCount / 2))
  delta = average(newest window) - average(previous window)
recent = preparedAt descending, id descending
```

### Shopping handoff

- The review list is generated from required ingredients that are explicitly unavailable or unknown.
- Canonical identity deduplicates the list; the UI still shows original ingredient names.
- The UI presents the complete deduplicated missing list and requires explicit confirmation before one deterministic task is created. Per-item editing is deferred.
- The EasyList task uses existing strict fields and records human-readable provenance in notes: source app, drink ID/name, and generated canonical checklist. No unsupported task fields are introduced.
- Demo mode mutates local demo state only. A failed task write keeps the review list and reports the error.

## EasyGames frozen contracts

### Modes, dates, and generation

Both games expose `easy`, `standard`, and `hard`, plus `free` and `daily`. Difficulty changes board size or obstacle/goal pressure, not merely labels.

Daily policy is globally deterministic UTC:

```text
dateKey = now.toISOString().slice(0, 10)
challengeKey = gameId + ":" + difficulty + ":" + generatorVersion + ":" + dateKey
seed = stable 32-bit FNV-1a(challengeKey)
```

The serialized state stores `challengeKey`, generator version, seed, and full puzzle specification. Generator updates therefore do not rewrite a saved or historical board.

### Difficulty contracts

Pair Garden:

- easy: 4 pairs, 8 cards
- standard: 6 pairs, 12 cards
- hard: 8 pairs, 16 cards

Trail Scout uses readable 5×5 boards for Easy/Standard and 6×6 for Hard while difficulty changes deterministic puzzle pools:

- easy: fewer rocks and lights, generous move budget
- standard: current intended pressure
- hard: more blocking geometry/lights and a tighter but validated completable budget

Every shipped Trail Scout specification has a test-proven solution within budget. Neither game uses time in scoring.

### Active state, cross-tab behavior, and restart

`easygames-active-v2` records are keyed by owner, game, mode, difficulty, and daily date when applicable. They contain generator version, full board specification, simulation state, revision, updated time, and stable session ID.

- localStorage access is wrapped in `try/catch` and fails closed.
- Active v1 records lack the full versioned puzzle specification required by v2 and therefore fail closed; v2 starts in standard/free unless the user selects another slot. Corrupt or mismatched records are ignored.
- every meaningful action increments revision and persists.
- a `storage` event applies only a strictly newer valid revision for the same slot and announces that another tab advanced the game.
- `visibilitychange` pauses active play without counting time.
- restart/new-board controls require confirmation after meaningful progress.
- completion is first placed in a local owner-scoped outbox, then the active record is cleared. This avoids both lost results and completed-game resurrection.

### Immutable session history and offline sync

Session records live at `users/{uid}/gameSessions/{sessionId}` with `easygames-session-v1`. The ID is created once when a board starts, so retries are idempotent. Fields include owner, game, difficulty, mode, UTC daily date/challenge key, generator version, seed, serializable puzzle specification, completed outcome, score, moves, started/completed times, and created time.

The local outbox is written before network sync. Context mount and `online` events retry queued writes. Server creation is transactionally create-if-absent; rules reject mutation and deletion. Demo mode has an in-memory history/outbox only.

### Transparent scores and statistics

Pair Garden:

```text
pairCount = deck.length / 2
base = easy 700, standard 1000, hard 1300
penaltyPerExtraMove = easy 40, standard 55, hard 65
score = max(100, base - penaltyPerExtraMove * max(0, moves - pairCount))
```

Trail Scout:

```text
score = collected * 250
      + (completed ? 250 : 0)
      + (completed ? movesRemaining * 20 : 0)
      + difficultyBonus
difficultyBonus = easy 0, standard 75, hard 150 (completed sessions only)
```

Displayed evidence is derived from immutable sessions:

- sessions played: count records
- completions: count completed records
- completion rate: completions / sessions, zero when no sessions
- best score: maximum score
- efficient finish: minimum moves among completed sessions
- daily participation: unique non-null UTC date keys
- daily completion: unique completed UTC date keys
- active run: consecutive unique completion date keys ending at the latest completed date; it does not reset merely because the user did not play today
- longest run: maximum consecutive unique completion dates

Achievements are deterministic, local derivations with evidence and no reward currency: first finish, ten sessions, an efficient Pair Garden finish, a hard Trail Scout finish, and completing both dailies on one UTC date. There is no global leaderboard, punitive streak copy, gambling, purchases, or endless feed.

## Rules, export, and service-worker integration

- Firestore validates strict fields, types, bounds, owner IDs, immutable creation timestamps, and collection-specific update/delete policy for v2 drinks, pantry, preparation records, game sessions, and legacy game stats.
- Emulator tests cover unauthenticated and cross-owner denial, valid creation, malformed/oversized rejection, immutable history, migration, and permitted undo.
- Account export moves to v4 compatibility and includes pantry, preparation history, game session history, and legacy game statistics; CSV includes every user-meaningful field without owner IDs.
- The service worker continues precaching versioned app chunks and does not cache owner Firestore responses. Local active state/outboxes are explicitly documented as device-specific and excluded from account JSON until synced.

## UI and accessibility slice

- Preserve the gameplay field first: compact mode/difficulty controls, status strip, board, then secondary history.
- Native buttons and inputs remain the semantic interaction layer. Touch targets aim for at least 44 CSS px.
- Every board remains fully keyboard operable, with visible focus and no timing-dependent input.
- State is not color-only: text labels, symbols, borders, and live-region messages accompany visual treatments.
- At 320px, board controls remain visible without horizontal scrolling; supporting cards stack below.
- Reduced motion removes transforms/transitions without hiding state changes.
- Onboarding is concise and progressive: a first-play callout, a collapsible complete rule reference, and direct control labels.

## Implementation slices

1. Pure domain contracts and high-signal tests: pantry matching/scaling/preparation stats; daily seeds/difficulties/scoring/session stats/recovery.
2. Strict Firestore adapters, rules, emulator coverage, and export contracts.
3. EasyDrinks provider and UI: pantry, make-now results, editor v2, guided preparation, history, task handoff.
4. EasyGames provider and UI: selectors, original boards, cross-tab recovery, outbox sync, dashboard history/statistics/achievements.
5. Responsive styling, PWA/cache checks, demo fixtures, documentation, and receipt.
6. Full release verification, browser QA at 1440×900, 390×844, and 320×568, offline/reload/cross-tab checks, console/network review, screenshots, source commit, guarded publication commit if CI requires it, push, and draft PR update.

## Rejected scope

- third game
- scraped or generated recipe content

Deferred third-game concept: **Pocket Balance**. A finite arithmetic puzzle would ask the player to place a small set of numbered stones on two labelled trays so both sides meet a target relationship. It would be meaningfully different from memory matching and route finding, asset-light, offline-first, fully describable without color, and suitable for focus-move/place/undo keyboard and touch controls. Free play and UTC dailies could use deterministic seeds only after a generator proves every board has a solution and the intended difficulty. It is deferred until uniqueness/solvability tests and real mobile screen-reader interaction can be designed; shipping a weak curated set now would not justify a third game.

Other rejected scope:

- inferred substitutions, ABV, nutrition, allergies, or medical claims
- quantity sufficiency across flexible units
- timers inferred from free-form prose
- real-time multiplayer, social comparison, global leaderboards, paid rewards, streak penalties, or notification FOMO
- non-idempotent aggregate-only game history
- silent shopping-list writes
- service-worker caching of private Firestore payloads
