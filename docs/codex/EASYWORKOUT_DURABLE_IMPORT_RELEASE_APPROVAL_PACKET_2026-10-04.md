# EasyWorkout durable legacy import: release approval packet (2026-10-04)

Status: **HOLD until the owner approves section 8.** Prepared by Claude as a documentation-only task.

**Nothing has been deployed. Nothing has been written to any real account.** No Firebase rules, hosting/Pages publication, commit, merge or push has occurred for this candidate. This packet's author ran no tests, used no credentials or web, and read no real workout JSON.

## 1. Candidate identity, scope and gates

**Identity**
- Worktree branch `scolety1/easyworkout-legacy-trends-20261004`, base commit `60b1a9c378ae45504fca6bf9df0a6176e41e1d09`.
- The candidate is **uncommitted working-tree state**: 9 modified tracked files (+744/-3) and untracked new files. There is no candidate commit SHA yet. One must be created and recorded before approval is exercised.
- Modified: `coreLoopDemoFixtures.ts`, `accountExport.ts`, `EasyStatisticsPage.tsx`, `SettingsPage.tsx`, `globals.css`, `account-export.test.mjs`, `firebase-emulator.integration.mjs` (+385), `workout-stats-progress.browser.mjs` (+30), `firestore.rules` (+169, 0 deletions).
- New source: `WorkoutLegacyImportPreview.tsx`, `WorkoutLegacyProgressPanel.tsx`, `WorkoutLegacyStoredHistory.tsx`, `workoutLegacyDemoFixtures.ts`, `legacyWorkoutDurableImport.ts`, `legacyWorkoutObservation.ts`, `legacyWorkoutTrends.ts`, `legacyWorkoutImportTransactions.ts`, `legacyWorkoutImports.ts`.
- New tests: six `legacy-workout-*.test.mjs` files.
- New docs: the import contract, receipt, plan and Claude/Codex evidence files under `docs/codex/`. These are not product code, and the release commit should include only the files the owner approves.

**Scope.** An owner-scoped, create-only durable store for legacy workout observations. A local JSON preview feeds an explicit "Confirm import to my account" action, stored-history readback, a soft rollback tombstone, and whole-account export inclusion. At most 450 observations per batch. Canonical `workoutSessions`, goals, statistics formulas, PR/e1RM math and guidance are untouched (asserted by tests per the receipt).

**Gates and who produced the evidence**

| Gate | Result | Source |
| --- | --- | --- |
| Firestore emulator `npm --prefix app-vNext run test:emulator` (project `demo-easylife-wave2`) | **16 passed, 0 failed, 0 skipped, exit 0**; SIGINT was normal shutdown. Run 2026-10-05 01:09 UTC / 2026-10-04 19:09 America/Denver. | **Owner-executed**, interactive, owner message `Sentinel_e28997826648819182f610f27b8416f6`. Not reproduced by any agent. |
| Earlier agent emulator attempts | Failed before any test ran (Java loopback `Unable to establish loopback connection`), twice. | Agent-reported (receipt). Superseded by the owner run. |
| Unit suite `npm --prefix app-vNext test` | 279 pass, 0 fail | Agent-reported in the receipt. Not rerun here. |
| Typecheck, production build | Passed | Agent-reported in the receipt. Not rerun here. |
| Synthetic browser journey `test:workout-stats-progress` (390x844, 1280x800) | 7/7 steps | Agent-reported in the receipt. Not rerun here. Runs in demo mode only. |
| `git diff --check` | Clean (tracked files only; one pre-existing LF/CRLF warning) | Agent-reported in the receipt. |
| Hosted CI (`production-deployment-candidate.yml`, `publication-candidate.yml`) and `scripts/verify-release.ps1` on this candidate | **No record of a run** | Outstanding |
| Private real-file validation (hash, counts, validator result) | **Not done.** The Windows helper could not materialize the file. | Outstanding. The owner does this locally in the canary. |

**What the owner emulator run does and does not prove.** It proves the rules and client transaction logic against the local emulator with synthetic data. It does **not** prove hosting, the GitHub Pages artifact, production Firebase configuration, production auth, or behavior with the owner's real account or file. The run was against "the exact candidate" as the owner reported. This packet cannot verify that `firestore.rules` is byte-identical to what was tested, so **record the SHA-256 of `firestore.rules` and the candidate commit, and have the owner confirm they match the tested state**, before deploying.

## 2. Exact rules access delta (`firestore.rules`, +169 lines, additive only)

All paths are under `users/{userId}/`. "Owner" means signed in with `request.auth.uid == userId` (`isOwner`, `firestore.rules:9`).

| Collection | Doc ID | Read | Create | Update / delete |
| --- | --- | --- | --- | --- |
| `legacyWorkoutImportBatches` | `lwb-<32 hex>` | owner | owner + `validLegacyBatch` | **denied** (`if false`) |
| `legacyWorkoutImportObservations` | `<batchId>-o<ordinal>` | owner | owner + `validLegacyObservation` | **denied** |
| `legacyWorkoutImportReceipts` | `<batchId>` | owner | owner + `validLegacyConfirmation` | **denied** |
| `legacyWorkoutImportRollbacks` | `<batchId>` | owner | owner + `validLegacyRollback` | **denied** |

Rule blocks are at `firestore.rules:224-246`. Other users and signed-out clients get no access.

**Schema and identity constraints**
- Every document: exact key set (`hasAll` and `hasOnly`), `ownerId == userId`, and a fixed `schemaVersion`: `easyworkout-legacy-import-{batch,observation,confirmation,rollback}-v1`.
- Batch:
  - ID matches `^lwb-[0-9a-f]{32}$` and equals `batchId`.
  - `documentSchemaVersion == easyworkout-legacy-observations-v1`.
  - `sourceKind` is one of 3 enum values.
  - `unitPolicy == lb-owner-confirmed`.
  - `interpretationPolicyVersion == legacy-evidence-v1`.
  - `contentHash` matches `sha256:<64 hex>`.
  - `observationCount` is an int in 0..450.
  - `sourceOrdinals` is a list whose length equals the count. Its first element is >= 1, and its last is a safe integer >= first + count - 1.
- Observation:
  - The ID regex and `split('-o')` bind the document ID to `batchId` and `sourceOrdinal`.
  - Temporal variants are strict per precision (`day`, `week`, `month`, `unknown`).
  - Enums for equipment and load convention. Strings are non-blank and bounded (160, or 500 for `sourceText`).
  - `sets` is a list of at most 50.
- Confirmation receipt: requires the batch in the same transaction (`existsAfter`, `getAfter`). `contentHash`, `observationCount` and `ownerId` must match, and the ordinals length must equal the count. The first and last observations must also exist in the same transaction.
- Rollback tombstone: `reason == 'owner-soft-rollback'`. It requires the existing confirmation receipt (`exists`, `get`) with matching `contentHash` and count.

**Known rules boundary (disclosed, not hidden).** Rules cannot iterate lists or compute SHA-256, and a transaction has a 20-access-call budget. Therefore:
- Per-set values, middle observations, ordinal uniqueness, `batchId` derivation from `sourceKey`, `contentHash` derivation, and the "unchanged-only" rollback condition are **enforced by the owner client, not by rules**.
- A buggy or malicious owner client could commit a batch with a gap or stray record. Readback and rollback **fail closed**: the batch is withheld from trends and reported, and never trusted. The emulator tests cover the middle-gap case.
- The impact is confined to the owner's own account.

**Unchanged (diff has no deleted lines).**
- `users/{userId}` document rule.
- `workoutGoals` and `workoutSessions` blocks, including `validWorkoutGoal` and `validWorkoutSession`.
- The generic user-collection wildcard (`firestore.rules:248`). `isSupportedUserCollection` (line 180) still lists the same 16 collection names, and **none of the four new names were added**.
- The `users/{userId}/{document=**}` deny and the top-level `/{document=**}` deny.

## 3. Production Firebase project and hosting target

| Item | Value | Evidence | Status |
| --- | --- | --- | --- |
| Firebase project | **`pipeline-2f422`** | `.firebaserc` `projects.default`; `scripts/verify-production-publication.mjs:38` hard-pins it; `docs/FIREBASE_RULES_VERIFICATION.md:10,61`; `EASYLIFE_DEPLOYMENT_APPROVAL_PACKET_2026-08-03.md:21` | **Determined** |
| Rules deploy command | `firebase deploy --only firestore:rules --project pipeline-2f422` | `docs/FIREBASE_RULES_VERIFICATION.md:61` | Determined. `firebase.json` also defines `functions`, so `--only firestore:rules` is mandatory to avoid deploying Functions. |
| Emulator project (test only) | `demo-easylife-wave2`; the test asserts it is not `pipeline-2f422` | `package.json` `test:emulator`; `firebase-emulator.integration.mjs:40` | n/a |
| Hosting type | **GitHub Pages, not Firebase Hosting.** `firebase.json` has no `hosting` block. The runbook says "No local `gh-pages` or Firebase Hosting command is configured." | `firebase.json`; `EASYLIFE_DEPLOYMENT_RUNBOOK_2026-08-02.md:103` | **Determined** |
| Repository | `easylifehq/easylifehq.github.io` (remote `origin`) | `git remote -v` | Determined |
| Pages source | `main` at `/` | `EASYLIFE_DEPLOYMENT_APPROVAL_PACKET_2026-08-03.md:20`, recorded then from authenticated repository metadata | **Not re-verified.** Re-check in repository Pages settings before deploying. |
| Custom domain | `easylifehq.com` | `CNAME` (must stay unchanged) | Determined |
| Deploy mechanism | The repo root is a **generated** artifact built from `app-vNext` by `scripts/prepare-pages-publication.mjs`. Per the runbook (section 3), run `--stage`, `--verify-stage`, then `--apply --confirm-apply` on a separate branch. Make one generated-root publication commit and open a PR. **Merging it to `main` publishes the site.** | Runbook sections 3 and 5 | Determined |
| Production web config | `production-deployment-candidate.yml` builds with `VITE_FIREBASE_*` from **GitHub repository variables**. Values are not in the repo, so they were not inspected. `verify-production-publication.mjs` rejects any project other than `pipeline-2f422`. | workflow; script | Variable values **unresolved here**. Enforced by the CI gate. |
| Currently live release SHA / rollback SHA | **Unresolved.** The only recorded rollback SHA (`5fa26608ed74…`) is from 2026-08-03 and is stale. The committed root's manifest `source.sha` is `8c2a45fbbee9…`. The live site was not inspected. | `pages-publication-manifest.json:4` | **Unresolved.** The owner must supply the live release SHA, and it must be recorded before deploy. |

**The UI is not currently live.** The committed root assets contain no legacy-import code (no matches for `legacyWorkoutImport`, `Legacy progress` or `legacy-workout` under `assets/`). Shipping the feature therefore requires a Pages publication, not just a rules deploy.

## 4. Stats-search / test-repair integration result

**Result: neither part of the earlier candidate is present. Both require integration.**

| Intended change | Current file state | Verdict |
| --- | --- | --- |
| Pure `exerciseSelection.ts` selector | No `exerciseSelection.ts` anywhere under `app-vNext` (glob: no files). No `workout-exercise-search.test.mjs` either. The only hits for those names are the CSS class `.workout-exercise-search` (`globals.css:251`, the panel, browser tests, the built `assets/EasyStatisticsPage-*.js`) and a prompt copy under `docs/codex/evidence/`. | **MISSING** |
| `WorkoutInsightsPanel.tsx` no-match state | `WorkoutInsightsPanel.tsx:47-49` still uses an inline `find(...includes(query)) \|\| stats.exerciseSummaries[0]`, so a non-matching query **silently falls back to the first exercise**. The only empty state (line 145) is the "log another comparable session" message, shown when there is no data at all. The file is unmodified in this candidate. | **MISSING** |
| Test-only repair: replace the stale hard-coded Bench Press source date with the saved session's `performedOn` | `quick-workout-acceptance.browser.mjs:311` still asserts `/Bench Press 3 × 5 Previous: [^S]*Source 2026-10-03/`, a hard-coded date. The file has no `performedOn` reference. The saved session is already captured as `state.saved` (line 297), and the rules (`firestore.rules:186-189`) confirm `performedOn` is a string field on saved sessions. The assertion therefore depends on the run date (stale if the session's `performedOn` is not `2026-10-03`). The file is unmodified in this candidate. | **MISSING** |
| Test asserting the demo source link | No such assertion in `quick-workout-acceptance.browser.mjs`. `workout-stats-progress.browser.mjs:191` already asserts demo `?demo=1` links in the recent-sessions table, but that is an existing assertion and a different surface. It has no no-match assertion. | **MISSING** |

**Integration notes**
- The prior patch is not in this worktree. Its retained receipt identifies the source as branch `scolety1/easyworkout-stats-search-truth-20261004`, worktree `C:\Users\codex-agent\orca\workspaces\easylifehq.github.io\easyworkout-stats-search-truth-20261004`, based on `60b1a9c3`. It remained uncommitted, so integration requires a reviewed patch from that worktree rather than a blind cherry-pick.
- If that source worktree is no longer intact, the two changes must be re-implemented from the retained brief, test-first.
- Conflict risk is low. `WorkoutInsightsPanel.tsx` and `quick-workout-acceptance.browser.mjs` are untouched by the candidate. The only overlap is `workout-stats-progress.browser.mjs`, if the prior patch edited it.
- No `firestore.rules` change is involved, so integration alone should not require rerunning the emulator. Treat any rules change as requiring a fresh emulator run.

## 5. Release sequence (each step needs its own stop-on-failure check)

1. **Integrate** the stats-search patch (section 4) onto the candidate. Re-verify `WorkoutInsightsPanel.tsx` still matches the durable-import wiring (`EasyStatisticsPage` props line unchanged).
2. **Commit** the candidate. Record the commit SHA and the SHA-256 of `firestore.rules`. The owner confirms the rules match the emulator-tested state.
3. **Rerun affected gates** in a clean worktree at that SHA:
   - unit suite, typecheck, build;
   - `test:workout-stats-progress` and `test:quick-workout-acceptance` (390px and desktop);
   - `scripts/verify-release.ps1`;
   - hosted `production-deployment-candidate` CI.
   - Rerun `test:emulator` only if rules or `firebase-emulator.integration.mjs` changed after the owner run.
4. **Approve the exact rules diff** (section 2) and the target project. Run `firebase use` and confirm `pipeline-2f422` with a second look.
5. **Deploy rules first:** `firebase deploy --only firestore:rules --project pipeline-2f422`. No Functions and no other Firebase resources. Rules go before the UI because an owner on the new UI without them sees "Could not load stored legacy history" and import stays paused. Run a read-only smoke (section 6, step 0) before continuing.
6. **Deploy the exact app target.** Follow the runbook's publication flow to produce one generated-root commit for the approved SHA. Check that `CNAME` is unchanged, that `--verify-stage` passes, and that the diff touches only owned generated paths. Open the PR, then merge to `main`, which publishes to GitHub Pages / `easylifehq.com`. Close old tabs, reopen, and confirm the service worker converged and the new Workout statistics tab shows the local import section.
7. **Owner canary** (section 6): one write, owner-executed.

## 6. Owner canary plan (real JSON stays local; Claude never sees it)

Executed only by the owner, signed in on the production site. Do not paste the JSON, counts-bearing exports, account IDs or screenshots with workout content into any agent session.

0. **Pre-write smoke (read-only).** Open Workout statistics. Stored legacy history loads with an empty state and no permission or console errors. Nothing is written.
1. **Owner supplies expected values out-of-band** (a private note, not to Claude): observation count (must be at most 450), set count, bodyweight-set count, the file's SHA-256, and a fresh `sourceKey`. A file with 451 or more observations is rejected locally with `durable-observation-limit` and writes nothing. The owner must split it by source key, and **each further batch is a separate write needing separate approval.**
2. **Local preview (no writes).** Select the file with the in-browser picker. Compare the shown counts to the expected values and review warnings, exclusions and series labels (original names preserved verbatim). **Stop on any mismatch or unexpected validation error.**
3. **Conflict check (no writes).** The storage preview must show state `new`, with all records `new`. **Stop** on `existing`, `partial`, `conflict`, `rolled-back` or `too-large`.
4. **Explicit confirmation.** Click "Confirm import to my account" exactly once. This is the single approved write: one transaction that creates N observation documents, one batch document and one confirmation receipt, N+2 in all. The rollback slot is only read and verified.
5. **Reload and readback.** Reload the page. Stored history reconstructs. Counts and ordering match step 1. The batch is not "withheld", with no `missing-observation`, `changed`, `invalid` or `unexpected-records` message.
6. **Idempotent retry.** Reselect the same file. Expect `already-imported` and zero new records. Do not force a second write. **Stop** if the UI offers a write for the same source key or reports a conflict.
7. **Account export verification.** In Settings, export the whole account (JSON). Locally verify:
   - the four legacy groups are present (manifest 20 groups);
   - counts match;
   - `ownerId` is stripped and no secret-shaped fields appear;
   - existing groups are intact.
   - Keep the export file private.
8. **Canonical isolation check.** Existing workout history, goals and statistics look unchanged (no imported rows in canonical sessions).

**Stop criteria (halt the canary and do not retry or hand-edit).**
- Any permission-denied error.
- Any count, hash or label mismatch.
- A state other than `new` before the write.
- Anything other than `already-imported` on retry.
- A withheld batch.
- Unexpected console or network errors.
- Any sign of writes outside the four legacy collections.
- Doubt about which project or account is in use.

On a stop, take no destructive cleanup. Record the state and go to section 7.

## 7. Rollback plan

- **No automatic rollback and no destructive cleanup**, in the app or in the Firebase console.
- **App rollback.** Republish the prior release through the same reviewed pipeline (runbook section 7): clean worktree at the recorded prior release SHA, full gate, `--stage` and `--verify-stage`, a new rollback branch and PR, merge, no force-push, no manual live edits. **The prior release SHA is currently unresolved (section 3) and must be recorded before deploy.** Older app code ignores the four new collections, so imported data stays intact and merely invisible, and an older export will not include it.
- **Rules.** Keep the strict rules in place. They are additive, create-only and owner-only. Do not revert them, and never restore a permissive wildcard, without a separate reviewed approval. Reverting would make the four collections default-deny, so stored records would be unreachable by clients but not deleted.
- **Data rollback of an import** uses only the in-app two-step soft rollback:
  - It re-reads the batch, receipt and every observation, rebuilds the canonical plan, and creates the immutable rollback tombstone only if every stored record is unchanged.
  - Missing, changed, unexpected or conflicting records make it throw and write nothing.
  - It never deletes or rewrites provenance.
  - The rolled-back source key cannot be re-imported in v1. A corrected file needs a new `sourceKey`.
  - Rolled-back batches are excluded from trends and listed.
- Clients cannot update or delete these documents (`if false`). Any removal would be a manual administrative act outside this plan and is **not requested**.

## 8. Bundled approval request

> I, the owner, authorize the following, and nothing else:
>
> 1. **Integration.** Apply the stats-search change (a pure `exerciseSelection.ts` selector, the `WorkoutInsightsPanel.tsx` no-match state, and the quick-workout-acceptance test repair using the saved session's `performedOn` plus a demo source-link assertion) onto the EasyWorkout durable-import candidate (base `60b1a9c3`). Source: uncommitted branch/worktree `scolety1/easyworkout-stats-search-truth-20261004` / `C:\Users\codex-agent\orca\workspaces\easylifehq.github.io\easyworkout-stats-search-truth-20261004`.
> 2. **Candidate commit.** Commit the candidate as one reviewed commit. SHA: `________`. `firestore.rules` SHA-256: `________`. I confirm this matches the rules I ran in the emulator on 2026-10-04 19:09 America/Denver.
> 3. **Production rules deployment.** Deploy `firestore.rules` (additive +169 lines; four owner-only, create-only legacy collections; existing rules unchanged) with `firebase deploy --only firestore:rules --project pipeline-2f422`. No Functions or other Firebase resources. **Consequence:** the new collections become writable by the signed-in owner in production, and documents created there cannot be updated or deleted by clients.
> 4. **Hosting deployment.** Publish the approved SHA to GitHub Pages for `easylifehq/easylifehq.github.io` (source `main` at `/`, domain `easylifehq.com`) via one generated-root publication PR and merge, with `CNAME` unchanged. **Consequence:** the new UI is live for all users, and rollback is a further reviewed publication. Prior release SHA for rollback: `________`.
> 5. **One owner-account canary write.** I will personally import one local file of at most 450 observations into my own signed-in production account using one new `sourceKey`: one confirmation transaction creating N+2 documents. **Consequence:** the records persist, are included in my account exports, cannot be edited or deleted by the app, and can be undone only by the in-app soft-rollback tombstone, which blocks re-import of that source key. Claude will not see the file, the account ID or the data.
>
> **Not authorized:** other writes or accounts, Functions or other Firebase config, credentials in any agent session, automatic rollback, destructive cleanup, further batches, rules changes after the emulator run, and any deployment before the section 5 gates pass.

**Unresolved items to complete before this approval can be exercised**
1. Candidate commit SHA and `firestore.rules` SHA-256.
2. Currently live release SHA and the rollback SHA (the 2026-08-03 record is stale).
3. Re-verification of the Pages source (`main` at `/`) and of the production `VITE_FIREBASE_*` repository variables. They were not inspected, and the CI gate pins only the project ID.
4. Results of hosted CI and `verify-release.ps1` on the final commit.

**Limits of this packet.** It is based on reading the files named above and the exact `firestore.rules` diff. The unit, build, typecheck and browser results are agent-reported in the receipt and were not rerun. The emulator result is owner-reported and not independently reproduced. Two commands were denied in this session (a git-history search and a hash computation), which is why the prior patch source and the rules hash are listed as unresolved.
