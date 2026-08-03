# EasyLife deterministic deployment runbook

Status: `HOLD_UNTIL_EXPLICIT_DEPLOYMENT_APPROVAL`

This runbook describes a future controlled deployment. Wave 6 did not merge or deploy anything.

## Current blockers

1. The draft PR must be reviewed and hosted checks must be green.
2. One physical iPhone and one physical Android must complete the device-only checklist in the release test matrix.
3. A human must explicitly approve production Firebase and GitHub Pages changes. Source-edit authorization is not deployment authorization.
4. The root GitHub Pages files remain older than `app-vNext`. Wave 7 supplies a tested promotion tool, but no real-root `--apply`, generated-output commit, Pages deployment, or production configuration has been approved.
5. Before deploying the hardened provider Functions, production custom-claim provisioning must be confirmed. Ordinary accounts will intentionally receive 403; only `easylifeAiAccess`/`easylifeOperator` claim holders may use the relevant paid capabilities.
6. `old-site/` must remain an archive and must never be copied into the publication artifact or deployed as Functions.

## Release inputs

- Candidate branch: the reviewed release/promotion branch selected by humans
- Publication contract: `docs/codex/EASYLIFE_PUBLICATION_ARTIFACT_CONTRACT.md`
- Required runtime: project Node version plus Java 21 for the Firestore Emulator
- Release gate: `scripts/verify-release.ps1`
- Firebase project, billing, DNS, secrets, and production data are outside this runbook until explicitly approved.

## 1. Reproduce in a clean worktree

Run only after selecting the reviewed PR SHA:

```powershell
git fetch origin
git worktree add C:\Dev\easylife-wave6-release <APPROVED_PR_SHA>
Set-Location C:\Dev\easylife-wave6-release
git status --short
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-release.ps1
```

Stop if the worktree is dirty, any gate fails, Java is not 21-compatible, or the SHA differs from the approved PR.

## 2. Confirm production controls

Before any Firebase command:

- Confirm the exact Firebase project with `firebase use` and have a second reviewer compare it to the approval record.
- Confirm `OPENAI_API_KEY` remains server-side; do not print or rotate it as part of this release.
- Confirm an authorized operator test account has the intended server-issued claim and an ordinary synthetic account does not.
- Confirm the Functions list is limited to `assistantIntakeSuggestion`, `analyzeTaskBrainDump`, and `planProjectWithAi`.
- Confirm Firestore rules diff is exactly the reviewed allowlist/validation change.
- Confirm rollback access and the prior approved production SHA.

Read-only preflight:

```powershell
firebase use
firebase functions:list
git diff origin/main...HEAD -- firestore.rules functions/index.js firebase.json
```

## 3. Prepare and review the static publication candidate

The root is the GitHub Pages deploy target; `app-vNext` is source. Do this on a separate deployment branch only after approval:

```powershell
git switch -c codex/easylife-approved-publication <APPROVED_PR_SHA>
node .\scripts\prepare-pages-publication.mjs --check
# Exit 2 is expected while the generated root is older; any other failure stops the release.
node .\scripts\prepare-pages-publication.mjs --dry-run --plan C:\Dev\easylife-publication-plan.json
node .\scripts\prepare-pages-publication.mjs --stage C:\Dev\easylife-publication-candidate --plan C:\Dev\easylife-publication-plan.json
node .\scripts\prepare-pages-publication.mjs --verify-stage C:\Dev\easylife-publication-candidate
node .\scripts\serve-pages-candidate.mjs --root C:\Dev\easylife-publication-candidate --port 4187
```

Required review before commit:

- `CNAME` is unchanged.
- No source directory, Firebase file, documentation, or `old-site/` is staged as generated output.
- Manifest and inventory hashes verify; the exact create/update/delete plan is reviewed.
- `index.html` and byte-identical `404.html` reference only candidate hashed assets.
- `sw.js` is the reviewed `easylife-shell-v6` worker.
- The root app is served locally and the primary desktop/phone smoke matrix is repeated.
- No source maps, secrets, machine paths, Firebase configuration, or obsolete asset references appear.

Only after a second reviewer approves the candidate, plan, physical results, production configuration strategy, and deployment record, run this in the clean publication worktree:

```powershell
node .\scripts\prepare-pages-publication.mjs --apply --confirm-apply --plan C:\Dev\easylife-publication-apply-plan.json
git status --short
git diff -- index.html 404.html sw.js manifest.webmanifest pages-publication-manifest.json pages-publication-sha256.txt assets icons
```

Stage only the exact generated paths in the reviewed plan and create one auditable publication commit. Never use `git add .`, manually copy `dist`, or broadly delete root assets. The source/product PR must not contain generated-root changes.

## 4. Deploy Firebase changes

This is a separate explicit approval gate because it changes production authorization and cost-bearing endpoints:

```powershell
firebase deploy --only firestore:rules,functions:assistantIntakeSuggestion,functions:analyzeTaskBrainDump,functions:planProjectWithAi
```

Stop on project mismatch, unexpected Function selection, secret prompt, rules compilation error, or claim-provisioning uncertainty. Never deploy all archived Functions.

## 5. Publish GitHub Pages

Use the repository's approved PR/branch publication mechanism. No local `gh-pages` or Firebase Hosting command is configured. Before merging the generated-output deployment PR, verify repository Pages settings identify the expected root branch/folder and obtain the final production approval.

The merge itself may publish the site; treat it as the deployment action. Do not merge from this Wave 6 task.

## 6. Post-deployment verification

Use only synthetic records:

1. Open `/`, `/app/hq`, `/app/easylist/add`, `/app/command`, `/app/plan`, `/app/easyworkout/dashboard`, `/app/easyworkout/log`, `/app/easystatistics?tab=workout`, and `/app/settings` on desktop and phone.
2. Verify the active worker/cache is `easylife-shell-v6`; close all old tabs, reopen, then verify offline reload of a primed deep route.
3. Verify an ordinary authenticated synthetic account is denied by all three paid provider gates without a provider request.
4. Verify only an explicitly claimed synthetic operator can perform the separately approved provider smoke. Never use private text.
5. Verify cross-account Firestore reads/writes and unsupported/nested collections are denied using emulator results first; production probing must remain synthetic and minimal.
6. Start a workout, edit and navigate immediately, reload, resume, save once, retry once, and verify one session/document.
7. Download workout and whole-account exports; confirm goals, units, time zone, versions, escaping, and no secret-shaped fields.
8. Inspect console, failed network requests, auth/rules errors, and production monitoring. Stop on any unexplained write or provider call.

## 7. Rollback

Static rollback uses the same pipeline, not improvised copying:

1. Record the reviewed last-known-good source SHA; create a new clean worktree at that SHA.
2. Run the complete release gate, then `--dry-run`, `--stage`, and `--verify-stage` with the same tool.
3. Serve that candidate; repeat deep-route, desktop/phone, manifest, offline, and service-worker convergence checks.
4. Create a new rollback branch from current `main`. Run `--apply --confirm-apply` there and review the exact generated-output diff/plan.
5. Merge the reviewed rollback commit through the normal PR path. Never force-push or manually edit live files.
6. Close old tabs/reopen the installed PWA and verify the worker removes only stale `easylife-shell-*` caches while retaining unrelated origin caches.

If the original source cannot satisfy the current artifact/security contract, stop and select a separately reviewed compatible SHA; do not relax the contract to make rollback pass.

If rules or Functions are defective, check out the prior approved production SHA in a clean worktree and deploy only the prior `firestore:rules` and the same three named Functions. Do not restore the permissive owner wildcard or unauthenticated provider access as a shortcut; if safe rollback cannot preserve those boundaries, disable the provider features and stop.

Record deployed SHA, Firebase project, Function revisions, rules release, Pages commit, timestamps, approvers, smoke results, and rollback decision in a new deployment receipt.

## Approval record required

Deployment may proceed only when all fields are explicit:

- Approved PR SHA
- Production Firebase project ID
- GitHub Pages source branch/folder
- Static publication approver
- Firestore/Functions approver
- Physical iPhone result
- Physical Android result
- Rollback SHA
- Deployment window and operator

Until then: `HOLD_UNTIL_EXPLICIT_DEPLOYMENT_APPROVAL`.
